/**
 * Integration Tests for API Health Endpoint
 * 
 * Tests the API health endpoint with a real Express server.
 */

import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
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
  });

  describe('API Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    it('should return 200 for root path with API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.message).toBe('Scoreboard API');
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
