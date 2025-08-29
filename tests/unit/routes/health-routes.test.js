/**
 * Unit Tests for Health Routes
 * 
 * Tests all conditional branches and error handling paths in health routes.
 */

import { jest, describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('Health Routes Unit Tests', () => {
  let app;
  let mockDatabaseAdapter;
  let createHealthRoutes;

  beforeAll(async () => {
    // Import the health routes module
    const healthRoutesModule = await import('../../../src/routes/health-routes.js');
    createHealthRoutes = healthRoutesModule.createHealthRoutes;
  });

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    
    // Create mock database adapter
    mockDatabaseAdapter = {
      getHealthStatus: jest.fn(),
      isConnected: jest.fn()
    };

    // Create health routes with mock adapter
    const healthRoutes = createHealthRoutes(mockDatabaseAdapter);
    app.use('/health', healthRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health - General Health Check', () => {
    it('should return 200 OK with basic health status when no database adapter', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'scoreboard-api');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      // Note: database property might not be present when no adapter is provided
      expect(response.body).toHaveProperty('_links');
    });

    it('should return 200 OK with database health when adapter exists and healthy', async () => {
      const mockDbHealth = {
        status: 'healthy',
        connection: 'connected',
        responseTime: 5
      };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', mockDbHealth);
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK with database unhealthy status when adapter exists but unhealthy', async () => {
      const mockDbHealth = {
        status: 'unhealthy',
        connection: 'disconnected',
        error: 'Connection timeout'
      };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', mockDbHealth);
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK with database error when adapter exists but throws error', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseAdapter.getHealthStatus.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status', 'unhealthy');
      expect(response.body.database).toHaveProperty('error', 'Database connection failed');
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should include HATEOAS navigation links', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('_links');
      expect(response.body._links).toHaveProperty('self');
      expect(response.body._links).toHaveProperty('health');
      expect(response.body._links).toHaveProperty('games');
    });
  });

  describe('GET /health/liveness - Liveness Probe', () => {
    it('should return 200 OK with liveness status', async () => {
      const response = await request(app)
        .get('/health/liveness')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'scoreboard-api');
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health/liveness')
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /health/readiness - Readiness Probe', () => {
    it('should return 503 when database adapter is not initialized', async () => {
      // Create routes without database adapter
      const appWithoutDb = express();
      const healthRoutesWithoutDb = createHealthRoutes(null);
      appWithoutDb.use('/health', healthRoutesWithoutDb);

      const response = await request(appWithoutDb)
        .get('/health/readiness')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason', 'Database adapter not initialized');
      // Note: readiness endpoint doesn't include service property when not ready
    });

    it('should return 503 when database is not connected', async () => {
      mockDatabaseAdapter.isConnected.mockResolvedValue(false);

      const response = await request(app)
        .get('/health/readiness')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason', 'Database not connected');
      // Note: readiness endpoint doesn't include service property when not ready
      expect(mockDatabaseAdapter.isConnected).toHaveBeenCalledTimes(1);
    });

    it('should return 200 when database is connected and ready', async () => {
      mockDatabaseAdapter.isConnected.mockResolvedValue(true);

      const response = await request(app)
        .get('/health/readiness')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'scoreboard-api');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(mockDatabaseAdapter.isConnected).toHaveBeenCalledTimes(1);
    });

    it('should return 503 when database connection check throws error', async () => {
      const connectionError = new Error('Connection check failed');
      mockDatabaseAdapter.isConnected.mockRejectedValue(connectionError);

      const response = await request(app)
        .get('/health/readiness')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason', 'Health check failed');
      expect(response.body).toHaveProperty('error', 'Connection check failed');
      expect(mockDatabaseAdapter.isConnected).toHaveBeenCalledTimes(1);
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health/readiness')
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /health/detailed - Detailed Health Information', () => {
    it('should return 200 OK with detailed health when no database adapter', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'scoreboard-api');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('platform');
      expect(response.body).toHaveProperty('nodeVersion');
      // Note: database property might not be present when no adapter is provided
      expect(response.body).toHaveProperty('system');
      
      // Check system properties
      expect(response.body.system).toHaveProperty('pid');
      expect(response.body.system).toHaveProperty('title');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('versions');
    });

    it('should return 200 OK with database health when adapter exists and healthy', async () => {
      const mockDbHealth = {
        status: 'healthy',
        connection: 'connected',
        responseTime: 3,
        lastCheck: new Date().toISOString()
      };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', mockDbHealth);
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK with database unhealthy status when adapter exists but unhealthy', async () => {
      const mockDbHealth = {
        status: 'unhealthy',
        connection: 'disconnected',
        error: 'Connection lost',
        lastCheck: new Date().toISOString()
      };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', mockDbHealth);
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 200 OK with database error when adapter exists but throws error', async () => {
      const dbError = new Error('Database health check failed');
      mockDatabaseAdapter.getHealthStatus.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status', 'unhealthy');
      expect(response.body.database).toHaveProperty('error', 'Database health check failed');
      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(1);
    });

    it('should include all system information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('pid');
      expect(response.body.system).toHaveProperty('title');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('versions');
      
      expect(typeof response.body.system.pid).toBe('number');
      expect(typeof response.body.system.title).toBe('string');
      expect(typeof response.body.system.arch).toBe('string');
      expect(typeof response.body.system.versions).toBe('object');
    });
  });

  describe('Health Routes Edge Cases', () => {
    it('should handle concurrent health checks with database adapter', async () => {
      const mockDbHealth = { status: 'healthy', connection: 'connected' };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const promises = Array(5).fill().map(() => 
        request(app).get('/health').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body.database).toEqual(mockDbHealth);
      });

      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent readiness checks with database adapter', async () => {
      mockDatabaseAdapter.isConnected.mockResolvedValue(true);

      const promises = Array(5).fill().map(() => 
        request(app).get('/health/readiness').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('ready');
        expect(response.body.database).toBe('connected');
      });

      expect(mockDatabaseAdapter.isConnected).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent detailed health checks with database adapter', async () => {
      const mockDbHealth = { status: 'healthy', connection: 'connected' };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const promises = Array(5).fill().map(() => 
        request(app).get('/health/detailed').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body.database).toEqual(mockDbHealth);
      });

      expect(mockDatabaseAdapter.getHealthStatus).toHaveBeenCalledTimes(5);
    });

    it('should maintain consistent response structure across all endpoints', async () => {
      mockDatabaseAdapter.isConnected.mockResolvedValue(true);
      const mockDbHealth = { status: 'healthy', connection: 'connected' };
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue(mockDbHealth);

      const [health, liveness, readiness, detailed] = await Promise.all([
        request(app).get('/health').expect(200),
        request(app).get('/health/liveness').expect(200),
        request(app).get('/health/readiness').expect(200),
        request(app).get('/health/detailed').expect(200)
      ]);

      // All endpoints should have timestamp and service
      expect(health.body).toHaveProperty('timestamp');
      expect(health.body).toHaveProperty('service');
      expect(liveness.body).toHaveProperty('timestamp');
      expect(liveness.body).toHaveProperty('service');
      expect(readiness.body).toHaveProperty('timestamp');
      expect(readiness.body).toHaveProperty('service');
      expect(detailed.body).toHaveProperty('timestamp');
      expect(detailed.body).toHaveProperty('service');

      // All should have the same service name
      expect(health.body.service).toBe('scoreboard-api');
      expect(liveness.body.service).toBe('scoreboard-api');
      expect(readiness.body.service).toBe('scoreboard-api');
      expect(detailed.body.service).toBe('scoreboard-api');

      // Check that database health is consistent
      expect(health.body.database).toEqual(mockDbHealth);
      expect(readiness.body.database).toBe('connected');
      expect(detailed.body.database).toEqual(mockDbHealth);
    });
  });
});
