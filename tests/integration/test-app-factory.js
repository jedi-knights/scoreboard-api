/**
 * Test App Factory
 * 
 * Creates Express applications with mock dependencies for integration testing.
 * Allows testing of the full application stack without external dependencies.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import compression from 'express-compression'; // Not available in this project
import rateLimit from 'express-rate-limit';
import { createMockDatabaseAdapter } from './mock-database-adapter.js';

/**
 * Create a test Express application with mock dependencies
 * @param {Object} options - App configuration options
 * @returns {Object} Express app and mock dependencies
 */
export function createTestApp(options = {}) {
  const {
    enableCors = true,
    enableSecurity = true,
    enableLogging = false,
    enableCompression = true,
    enableRateLimit = true,
    mockDatabase = true,
    databaseOptions = {}
  } = options;

  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security middleware
  if (enableSecurity) {
    app.use(helmet());
  }

  // CORS middleware
  if (enableCors) {
    app.use(cors());
  }

  // Logging middleware
  if (enableLogging) {
    app.use(morgan('combined'));
  }

  // Compression middleware
  if (enableCompression) {
    // app.use(compression()); // Not available in this project
    console.log('Note: Compression middleware not available in test environment');
  }

  // Rate limiting
  if (enableRateLimit) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    app.use(limiter);
  }

  // Mock database adapter
  let mockDatabaseAdapter = null;
  if (mockDatabase) {
    mockDatabaseAdapter = createMockDatabaseAdapter(databaseOptions);
  }

  // Health check routes (simplified for testing)
  app.get('/health', (req, res) => {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: mockDatabaseAdapter ? mockDatabaseAdapter.getHealthStatus() : { status: 'checking...' },
      _links: {
        self: { href: '/health' },
        health: { href: '/health' },
        games: { href: '/games' }
      }
    };

    res.status(200).json(healthData);
  });

  app.get('/health/liveness', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'scoreboard-api',
      _links: {
        self: { href: '/health/liveness' },
        health: { href: '/health' }
      }
    });
  });

  app.get('/health/readiness', (req, res) => {
    const readinessData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'scoreboard-api',
      database: mockDatabaseAdapter ? mockDatabaseAdapter.getHealthStatus() : { status: 'checking...' },
      _links: {
        self: { href: '/health/readiness' },
        health: { href: '/health' }
      }
    };

    res.status(200).json(readinessData);
  });

  app.get('/health/detailed', (req, res) => {
    const detailedData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'scoreboard-api',
      database: mockDatabaseAdapter ? mockDatabaseAdapter.getHealthStatus() : { status: 'checking...' },
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      _links: {
        self: { href: '/health/detailed' },
        health: { href: '/health' }
      }
    };

    res.status(200).json(detailedData);
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Scoreboard API',
      version: '1.0.0',
      description: 'An Express based API for the scoreboard application.',
      endpoints: {
        health: '/health',
        games: '/games',
        teams: '/teams',
        conferences: '/conferences'
      },
      _links: {
        self: { href: '/' },
        health: { href: '/health' },
        games: { href: '/games' }
      }
    });
  });

  // Mock games routes (simplified)
  app.get('/games', (req, res) => {
    const mockGames = [
      { id: 1, name: 'Test Game 1', sport: 'basketball', status: 'scheduled' },
      { id: 2, name: 'Test Game 2', sport: 'football', status: 'live' }
    ];

    res.status(200).json({
      data: mockGames,
      total: mockGames.length,
      _links: {
        self: { href: '/games' },
        health: { href: '/health' }
      }
    });
  });

  app.get('/games/:id', (req, res) => {
    const gameId = req.params.id;
    const mockGame = {
      id: parseInt(gameId),
      name: `Test Game ${gameId}`,
      sport: 'basketball',
      status: 'scheduled',
      home_team: 'Home Team',
      away_team: 'Away Team'
    };

    res.status(200).json({
      data: mockGame,
      _links: {
        self: { href: `/games/${gameId}` },
        games: { href: '/games' },
        health: { href: '/health' }
      }
    });
  });

  // Mock teams routes
  app.get('/teams', (req, res) => {
    const mockTeams = [
      { id: 1, name: 'Test Team 1', sport: 'basketball', division: 'd1' },
      { id: 2, name: 'Test Team 2', sport: 'football', division: 'd1' }
    ];

    res.status(200).json({
      data: mockTeams,
      total: mockTeams.length,
      _links: {
        self: { href: '/teams' },
        health: { href: '/health' }
      }
    });
  });

  // Mock conferences routes
  app.get('/conferences', (req, res) => {
    const mockConferences = [
      { id: 1, name: 'Test Conference 1', sport: 'basketball', division: 'd1' },
      { id: 2, name: 'Test Conference 2', sport: 'football', division: 'd1' }
    ];

    res.status(200).json({
      data: mockConferences,
      total: mockConferences.length,
      _links: {
        self: { href: '/conferences' },
        health: { href: '/health' }
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      _links: {
        health: { href: '/health' },
        root: { href: '/' }
      }
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Test app error:', err);
    
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      _links: {
        health: { href: '/health' },
        root: { href: '/' }
      }
    });
  });

  return {
    app,
    mockDatabaseAdapter,
    // Helper methods for testing
    resetDatabase: () => {
      if (mockDatabaseAdapter) {
        mockDatabaseAdapter.reset();
      }
    },
    setDatabaseHealth: (status) => {
      if (mockDatabaseAdapter) {
        mockDatabaseAdapter.isConnected = () => status === 'healthy';
      }
    },
    simulateDatabaseFailure: () => {
      if (mockDatabaseAdapter) {
        mockDatabaseAdapter.isConnected = () => false;
      }
    }
  };
}

/**
 * Create a minimal test app with only essential endpoints
 * @returns {Object} Express app and mock dependencies
 */
export function createMinimalTestApp() {
  return createTestApp({
    enableCors: false,
    enableSecurity: false,
    enableLogging: false,
    enableCompression: false,
    enableRateLimit: false,
    mockDatabase: true
  });
}

/**
 * Create a full-featured test app with all middleware
 * @returns {Object} Express app and mock dependencies
 */
export function createFullTestApp() {
  return createTestApp({
    enableCors: true,
    enableSecurity: true,
    enableLogging: true,
    enableCompression: true,
    enableRateLimit: true,
    mockDatabase: true
  });
}
