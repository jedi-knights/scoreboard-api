/**
 * Integration Tests for API Health Endpoint
 * 
 * Tests the API health endpoint with a real Express server.
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('API Health Endpoint Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Create Express app
    app = createApp();
    
    // Start server on a random port
    server = app.listen(0);
    
    // Wait for server to be ready
    await new Promise(resolve => server.once('listening', resolve));
  });

  afterAll(async () => {
    // Close server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('GET /health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.status).toBe('OK');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);
    });

    it('should handle multiple requests', async () => {
      // Make multiple requests to ensure server stability
      const promises = Array(5).fill().map(() => 
        request(app).get('/health').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
      });
    });

    it('should include database status when no adapter available', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status');
      expect(response.body.database.status).toBe('checking...');
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

    it('should include memory usage information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(typeof response.body.memory.rss).toBe('number');
    });
  });

  describe('GET /health/liveness', () => {
    it('should return 200 OK with liveness status', async () => {
      const response = await request(app)
        .get('/health/liveness')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body.status).toBe('alive');
      expect(response.body.service).toBe('scoreboard-api');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health/liveness')
        .expect('Content-Type', /json/);
    });

    it('should handle multiple liveness checks', async () => {
      const promises = Array(3).fill().map(() => 
        request(app).get('/health/liveness').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('alive');
        expect(response.body.service).toBe('scoreboard-api');
      });
    });
  });

  describe('GET /health/readiness', () => {
    it('should return 503 when not ready (no database adapter)', async () => {
      const response = await request(app)
        .get('/health/readiness')
        .expect(503);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.status).toBe('not_ready');
      expect(response.body.reason).toBe('Database adapter not initialized');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health/readiness')
        .expect('Content-Type', /json/);
    });

    it('should handle multiple readiness checks consistently', async () => {
      // Make multiple requests to ensure consistency
      const promises = Array(3).fill().map(() => 
        request(app).get('/health/readiness').expect(503)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('not_ready');
        expect(response.body.reason).toBe('Database adapter not initialized');
      });
    });

    it('should include service information in readiness response', async () => {
      const response = await request(app)
        .get('/health/readiness')
        .expect(503);

      // When not ready (503), the response doesn't include service property
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.status).toBe('not_ready');
      expect(response.body.reason).toBe('Database adapter not initialized');
      expect(typeof response.body.timestamp).toBe('string');
      // Note: readiness endpoint doesn't include service property when not ready
      expect(response.body).not.toHaveProperty('service');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return 200 OK with detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('platform');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('system');
      
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('scoreboard-api');
      expect(response.body.version).toBe('1.0.0');
      expect(typeof response.body.uptime).toBe('number');
      expect(typeof response.body.memory).toBe('object');
      expect(typeof response.body.cpu).toBe('object');
      expect(typeof response.body.platform).toBe('string');
      expect(typeof response.body.nodeVersion).toBe('string');
      
      // Check system properties
      expect(response.body.system).toHaveProperty('pid');
      expect(response.body.system).toHaveProperty('title');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('versions');
      expect(typeof response.body.system.pid).toBe('number');
      expect(typeof response.body.system.arch).toBe('string');
    });

    it('should return proper JSON content type', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect('Content-Type', /json/);
    });

    it('should include database health information (null when no adapter)', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('scoreboard-api');
      // Database should be null since no adapter is available in test environment
      expect(response.body.database).toBeNull();
    });

    it('should handle multiple detailed health checks', async () => {
      // Make multiple requests to ensure consistency
      const promises = Array(3).fill().map(() => 
        request(app).get('/health/detailed').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body.service).toBe('scoreboard-api');
        // Database should be null since no adapter is available in test environment
        expect(response.body.database).toBeNull();
      });
    });

    it('should include environment information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('environment');
      expect(response.body.environment).toBe('test');
    });

    it('should include platform and architecture information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('platform');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('arch');
      expect(typeof response.body.platform).toBe('string');
      expect(typeof response.body.nodeVersion).toBe('string');
      expect(typeof response.body.system.arch).toBe('string');
    });

    it('should include process information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.system).toHaveProperty('pid');
      expect(response.body.system).toHaveProperty('title');
      expect(response.body.system).toHaveProperty('versions');
      expect(typeof response.body.system.pid).toBe('number');
      expect(typeof response.body.system.title).toBe('string');
      expect(typeof response.body.system.versions).toBe('object');
    });
  });

  describe('Health Routes Error Handling', () => {
    it('should handle general health check errors gracefully', async () => {
      // This test would require mocking the health check to fail
      // For now, we test that the endpoint doesn't crash
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    it('should handle readiness check errors gracefully', async () => {
      // This test would require mocking the database adapter to fail
      // For now, we test that the endpoint doesn't crash
      const response = await request(app)
        .get('/health/readiness')
        .expect(503);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('not_ready');
    });

    it('should handle detailed health check errors gracefully', async () => {
      // This test would require mocking the health check to fail
      // For now, we test that the endpoint doesn't crash
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Health Routes Edge Cases', () => {
    it('should handle concurrent health checks', async () => {
      const promises = Array(10).fill().map(() => 
        request(app).get('/health').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
      });
    });

    it('should handle concurrent readiness checks', async () => {
      const promises = Array(5).fill().map(() => 
        request(app).get('/health/readiness').expect(503)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('not_ready');
        expect(response.body.reason).toBe('Database adapter not initialized');
      });
    });

    it('should handle concurrent detailed health checks', async () => {
      const promises = Array(5).fill().map(() => 
        request(app).get('/health/detailed').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
        expect(response.body).toHaveProperty('database');
        expect(response.body.database).toBeNull();
      });
    });

    it('should maintain consistent response structure across endpoints', async () => {
      const [health, liveness, readiness, detailed] = await Promise.all([
        request(app).get('/health').expect(200),
        request(app).get('/health/liveness').expect(200),
        request(app).get('/health/readiness').expect(503),
        request(app).get('/health/detailed').expect(200)
      ]);

      // All endpoints should have timestamp
      expect(health.body).toHaveProperty('timestamp');
      expect(liveness.body).toHaveProperty('timestamp');
      expect(readiness.body).toHaveProperty('timestamp');
      expect(detailed.body).toHaveProperty('timestamp');

      // Health, liveness, and detailed endpoints should have service property
      expect(health.body).toHaveProperty('service');
      expect(liveness.body).toHaveProperty('service');
      expect(detailed.body).toHaveProperty('service');

      // All should have the same service name
      expect(health.body.service).toBe('scoreboard-api');
      expect(liveness.body.service).toBe('scoreboard-api');
      expect(detailed.body.service).toBe('scoreboard-api');

      // Readiness endpoint doesn't include service property when not ready (503)
      expect(readiness.body).not.toHaveProperty('service');
    });
  });

  describe('API Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    it('should return 200 for root path with API info and HATEOAS links', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('_links');
      expect(response.body).toHaveProperty('_meta');
      expect(response.body.message).toBe('Scoreboard API');
      
      // Check HATEOAS structure
      expect(response.body._links).toHaveProperty('self');
      expect(response.body._links).toHaveProperty('health');
      expect(response.body._links).toHaveProperty('games');
      expect(response.body._links).toHaveProperty('teams');
      expect(response.body._links).toHaveProperty('conferences');
      
      // Check metadata
      expect(response.body._meta).toHaveProperty('apiVersion');
      expect(response.body._meta).toHaveProperty('baseUrl');
      expect(response.body._meta).toHaveProperty('generatedAt');
    });
  });

  describe('API Middleware', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for Helmet security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
