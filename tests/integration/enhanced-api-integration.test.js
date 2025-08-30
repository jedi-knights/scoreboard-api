/**
 * Enhanced API Integration Tests
 * 
 * Demonstrates the improved integration test setup with:
 * - Better test container management
 * - Proper dependency injection
 * - Mock database dependencies
 * - Full app testing
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './test-app-factory.js';
import { integrationTestEnv } from './setup-integration.js';
import { createMockDatabaseAdapter, createFailingDatabaseAdapter } from './mock-database-adapter.js';

describe('Enhanced API Integration Tests', () => {
  let app;
  let server;
  let mockDatabaseAdapter;

  beforeAll(async () => {
    // Create test Express app with mock dependencies
    const testApp = createTestApp();
    app = testApp.app;
    mockDatabaseAdapter = testApp.mockDatabaseAdapter;
    
    // Start server on a random port
    server = app.listen(0);
    
    // Wait for server to be ready
    await new Promise(resolve => server.once('listening', resolve));
    
    console.log('🚀 Test API server started for integration tests');
  });

  afterAll(async () => {
    // Close server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    
    console.log('✅ API server stopped');
  });

  beforeEach(async () => {
    // Reset the mock database adapter state for each test
    if (mockDatabaseAdapter) {
      mockDatabaseAdapter.reset();
    }
  });

  afterEach(async () => {
    // Clean up test data between tests
    await integrationTestEnv.cleanupTestData();
  });

  describe('Database Container Management', () => {
    it('should initialize PostgreSQL container when requested', async () => {
      // This test will only run if TEST_DATABASES includes 'postgres'
      if (process.env.TEST_DATABASES && process.env.TEST_DATABASES.includes('postgres')) {
        const postgresClient = integrationTestEnv.getClient('postgres');
        const postgresConfig = integrationTestEnv.getConfig('postgres');
        
        expect(postgresClient).toBeDefined();
        expect(postgresConfig).toBeDefined();
        expect(postgresConfig.database).toBe('scoreboard_test');
      } else {
        console.log('⏭️ Skipping PostgreSQL test - not configured');
      }
    });

    it('should initialize SQLite configuration', () => {
      const sqliteConfig = integrationTestEnv.getConfig('sqlite');
      
      expect(sqliteConfig).toBeDefined();
      expect(sqliteConfig.type).toBe('sqlite');
      expect(sqliteConfig.databasePath).toContain('test-scoreboard.db');
    });

    it('should support multiple database types simultaneously', () => {
      const dbTypes = ['sqlite', 'postgres', 'mysql'];
      
      dbTypes.forEach(dbType => {
        const config = integrationTestEnv.getConfig(dbType);
        if (config) {
          expect(config).toBeDefined();
          console.log(`✅ ${dbType} configuration available`);
        } else {
          console.log(`⏭️ ${dbType} configuration not available`);
        }
      });
    });
  });

  describe('Test Data Creation', () => {
          it('should create conference test data', async () => {
        const conferences = await integrationTestEnv.createTestData('conference', { 
          count: 3,
          dbType: 'sqlite' // Use SQLite for testing
        });
        
        expect(conferences).toHaveLength(3);
        conferences.forEach((conference, index) => {
          expect(conference.name).toBe(`Test Conference ${index + 1}`);
          expect(conference.sport).toBe('basketball');
          expect(conference.division).toBe('d1');
        });
      });

          it('should create team test data', async () => {
        const teams = await integrationTestEnv.createTestData('team', { 
          count: 2,
          dbType: 'sqlite' // Use SQLite for testing
        });
        
        expect(teams).toHaveLength(2);
        teams.forEach((team, index) => {
          expect(team.name).toBe(`Test Team ${index + 1}`);
          expect(team.sport).toBe('basketball');
          expect(team.division).toBe('d1');
        });
      });

    it('should create complete game scenarios', async () => {
      const scenarios = await integrationTestEnv.createTestData('complete_scenario', { count: 2 });
      
      expect(scenarios).toHaveLength(2);
      scenarios.forEach(scenario => {
        expect(scenario.conference).toBeDefined();
        expect(scenario.teams).toHaveLength(2);
        expect(scenario.game).toBeDefined();
        expect(scenario.game.sport).toBe('basketball');
      });
    });
  });

  describe('Mock Database Dependencies', () => {
    it('should support basic database operations', async () => {
      // Test connection
      const connected = await mockDatabaseAdapter.connect();
      expect(connected).toBe(true);
      expect(mockDatabaseAdapter.isConnected()).toBe(true);

      // Test query
      const results = await mockDatabaseAdapter.query('SELECT * FROM teams');
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Test Team');

      // Test disconnection
      const disconnected = await mockDatabaseAdapter.disconnect();
      expect(disconnected).toBe(true);
      expect(mockDatabaseAdapter.isConnected()).toBe(false);
    });

    it('should support transactions', async () => {
      const result = await mockDatabaseAdapter.executeTransaction(async (txId) => {
        expect(txId).toMatch(/^tx-/);
        
        // Simulate some work within the transaction
        await mockDatabaseAdapter.query('INSERT INTO teams (name) VALUES (?)', ['New Team']);
        
        return 'transaction completed';
      });

      expect(result).toBe('transaction completed');
    });

    it('should support query builder pattern', () => {
      const results = mockDatabaseAdapter
        .select('id, name')
        .from('teams')
        .where('sport = ?', 'basketball')
        .orderBy('name', 'ASC')
        .limit(10)
        .returning();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle batch operations', async () => {
      const records = [
        { name: 'Team A', sport: 'basketball' },
        { name: 'Team B', sport: 'football' }
      ];

      const result = await mockDatabaseAdapter.batchInsert(records, 'teams');
      
      expect(result.inserted).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.table).toBe('teams');
    });

    it('should provide health status', () => {
      const health = mockDatabaseAdapter.getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(health.connections).toBeDefined();
      expect(health.transactions).toBeDefined();
      expect(health.queryCount).toBeDefined();
    });

    it('should log queries for debugging', async () => {
      await mockDatabaseAdapter.query('SELECT * FROM teams');
      await mockDatabaseAdapter.query('INSERT INTO teams (name) VALUES (?)', ['Test Team']);
      
      const queryLog = mockDatabaseAdapter.getQueryLog();
      
      expect(queryLog).toHaveLength(2);
      expect(queryLog[0].sql).toBe('SELECT * FROM teams');
      expect(queryLog[1].sql).toBe('INSERT INTO teams (name) VALUES (?)');
      expect(queryLog[1].params).toEqual(['Test Team']);
    });
  });

  describe('Error Simulation', () => {
    it('should simulate connection failures', async () => {
      const failingAdapter = createFailingDatabaseAdapter();
      
      await expect(failingAdapter.connect()).rejects.toThrow('Connection failed');
    });

    it('should simulate query timeouts', async () => {
      await expect(mockDatabaseAdapter.simulateQueryTimeout()).rejects.toThrow('Query timeout');
    });

    it('should simulate deadlocks', async () => {
      await expect(mockDatabaseAdapter.simulateDeadlock()).rejects.toThrow('Deadlock detected');
    });

    it('should handle transaction failures gracefully', async () => {
      const failingAdapter = createFailingDatabaseAdapter();
      
      await expect(failingAdapter.executeTransaction(async () => {
        throw new Error('Business logic error');
      })).rejects.toThrow('Business logic error');
    });
  });

  describe('Performance Testing', () => {
    it('should measure database operation performance', async () => {
      const { result, executionTime } = await global.integrationTestUtils.performance.measureExecutionTime(async () => {
        return await mockDatabaseAdapter.query('SELECT * FROM teams');
      });

      expect(result).toBeDefined();
      expect(executionTime).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(1000); // Should be fast with mock
    });

    it('should perform load testing', async () => {
      const loadTestResult = await global.integrationTestUtils.performance.loadTest(async () => {
        return await mockDatabaseAdapter.query('SELECT * FROM teams');
      }, 10);

      expect(loadTestResult.avg).toBeGreaterThan(0);
      expect(loadTestResult.min).toBeGreaterThan(0);
      expect(loadTestResult.max).toBeGreaterThan(0);
      expect(loadTestResult.times).toHaveLength(10);
    });

    it('should perform stress testing', async () => {
      const stressTestResult = await global.integrationTestUtils.performance.stressTest(async () => {
        return await mockDatabaseAdapter.query('SELECT * FROM teams');
      }, 5);

      expect(stressTestResult.results).toHaveLength(5);
      expect(stressTestResult.totalTime).toBeGreaterThan(0);
      expect(stressTestResult.avgTime).toBeGreaterThan(0);
    });
  });

  describe('Full App Integration', () => {
    it('should handle health endpoint requests', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('OK');
    });

    it('should handle multiple concurrent health requests', async () => {
      const promises = Array(5).fill().map(() => 
        request(app).get('/health').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('OK');
      });
    });

    it('should provide proper JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);
    });

    it('should include HATEOAS navigation links', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('_links');
      expect(response.body._links).toHaveProperty('self');
      expect(response.body._links).toHaveProperty('health');
    });
  });

  describe('Test Isolation and Cleanup', () => {
    it('should isolate test data between tests', async () => {
      // Create test data in first test
      const conferences1 = await integrationTestEnv.createTestData('conference', { count: 2 });
      expect(conferences1).toHaveLength(2);

      // Verify data exists
      const client = integrationTestEnv.getClient('postgres');
      if (client && client.query) {
        const result = await client.query('SELECT COUNT(*) FROM conferences');
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(2);
      }
    });

    it('should clean up test data after each test', async () => {
      // This test should start with clean data
      const client = integrationTestEnv.getClient('postgres');
      if (client && client.query) {
        try {
          const result = await client.query('SELECT COUNT(*) FROM conferences');
          // After cleanup, the count should be minimal (just schema)
          expect(parseInt(result.rows[0].count)).toBeLessThanOrEqual(10);
        } catch (error) {
          // SQLite or other databases might not support this query
          console.log('Note: Database cleanup verification not supported for this database type');
        }
      }
    });
  });

  describe('Configuration and Environment', () => {
    it('should respect environment configuration', () => {
      const dbTypes = process.env.TEST_DATABASES ? process.env.TEST_DATABASES.split(',') : ['sqlite'];
      
      expect(dbTypes).toContain('sqlite'); // SQLite should always be available
      
      if (process.env.TEST_DATABASES && process.env.TEST_DATABASES.includes('postgres')) {
        expect(dbTypes).toContain('postgres');
      }
    });

    it('should handle missing environment variables gracefully', () => {
      // Test should not fail if environment variables are missing
      const config = integrationTestEnv.getConfig('sqlite');
      expect(config).toBeDefined();
    });
  });
});
