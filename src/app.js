import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { apiConfig } from './config/index.js';
import { createGamesRoutes } from './routes/games-routes.js';
import { createHealthRoutes } from './routes/health-routes.js';

/**
 * Express Application
 * 
 * Main application setup with middleware, routes, and error handling.
 * Follows Express.js best practices and security guidelines.
 */
export function createApp(databaseAdapter) {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: apiConfig.cors.origin,
    credentials: apiConfig.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: apiConfig.rateLimit.windowMs,
    max: apiConfig.rateLimit.max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(apiConfig.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (apiConfig.environment === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  // Health check routes (no authentication required)
  app.use('/health', createHealthRoutes(databaseAdapter));

  // API routes
  app.use(`/api/${apiConfig.version}/games`, createGamesRoutes(databaseAdapter));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Scoreboard API',
      version: apiConfig.version,
      environment: apiConfig.environment,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        games: `/api/${apiConfig.version}/games`
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing authentication',
        timestamp: new Date().toISOString()
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: apiConfig.environment === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
      ...(apiConfig.environment === 'development' && { stack: error.stack })
    });
  });

  return app;
}

