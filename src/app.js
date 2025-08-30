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
import { createNCAAIngestionRoutes } from './routes/ncaa-ingestion-routes.js';
import { generateNavigationLinks, enhanceWithLinks } from './utils/hateoas.js';
import { createContainer } from './container.js';
import {
  globalErrorHandler,
  notFoundHandler,
  requestLogger,
  setupUnhandledErrorHandling
} from './middleware/error-handler.js';
import { initializeSwagger, getSwaggerSpec } from './middleware/swagger.js';

/**
 * Express Application
 *
 * Main application setup with middleware, routes, and error handling.
 * Follows Express.js best practices and security guidelines.
 */
export function createApp (databaseAdapter) {
  const app = express();

  // Create dependency injection container
  const container = createContainer(databaseAdapter);

  // Initialize Swagger documentation
  const swagger = initializeSwagger();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:']
      }
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
  app.use(requestLogger);

  // Health check routes (no authentication required)
  app.use('/health', createHealthRoutes(databaseAdapter));

  // Swagger API documentation routes
  app.use('/api-docs', swagger.serveSwaggerUi);
  app.get('/api-docs', swagger.swaggerUiMiddleware);
  app.get('/api-docs.json', getSwaggerSpec(swagger.specs));

  // API routes
  app.use(`/api/${apiConfig.version}/games`, createGamesRoutes(container));
  app.use(`/api/${apiConfig.version}/ncaa/ingest`, createNCAAIngestionRoutes(container));

  /**
   * @swagger
   * /:
   *   get:
   *     summary: API Root
   *     description: Get API information, version, and available endpoints
   *     tags: [API Info]
   *     responses:
   *       200:
   *         description: API information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Scoreboard API
   *                 version:
   *                   type: string
   *                   example: 1.0.0
   *                 environment:
   *                   type: string
   *                   example: development
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 description:
   *                   type: string
   *                   example: A comprehensive sports scoreboard API with HATEOAS support
   *                 features:
   *                   type: array
   *                   items:
   *                     type: string
   *                   example:
   *                     - Real-time game data
   *                     - Team and conference management
   *                     - Advanced filtering and search
   *                     - Hypermedia-driven navigation
   *                     - Multiple database backends
   *                     - Interactive API documentation
   *                 documentation:
   *                   type: object
   *                   properties:
   *                     swagger:
   *                       type: string
   *                       example: /api-docs
   *                     openapi:
   *                       type: string
   *                       example: /api-docs.json
   *                 _links:
   *                   type: object
   *                   description: HATEOAS navigation links
   */
  app.get('/', (req, res) => {
    const rootData = {
      message: 'Scoreboard API',
      version: apiConfig.version,
      environment: apiConfig.environment,
      timestamp: new Date().toISOString(),
      description: 'A comprehensive sports scoreboard API with HATEOAS support',
      features: [
        'Real-time game data',
        'Team and conference management',
        'Advanced filtering and search',
        'Hypermedia-driven navigation',
        'Multiple database backends',
        'Interactive API documentation'
      ],
      documentation: {
        swagger: '/api-docs',
        openapi: '/api-docs.json'
      }
    };

    // Add HATEOAS navigation links
    const navigationLinks = generateNavigationLinks(req);
    const enhancedResponse = enhanceWithLinks(req, rootData, navigationLinks);

    res.json(enhancedResponse);
  });

  // 404 handler
  app.use('*', notFoundHandler);

  // Global error handler
  app.use(globalErrorHandler);

  // Setup unhandled error handling
  setupUnhandledErrorHandling();

  return app;
}

