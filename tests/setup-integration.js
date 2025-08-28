/**
 * Integration Test Setup
 * 
 * Configuration for integration tests using Testcontainers with real databases.
 */

import { GenericContainer, StartedGenericContainer } from 'testcontainers';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Set longer timeout for integration tests
jest.setTimeout(60000);

// Global integration test utilities
global.integrationTestUtils = {
  // Test database configurations
  databases: {
    sqlite: {
      type: 'sqlite',
      config: {
        databasePath: './tests/data/test-scoreboard.db'
      }
    },
    postgres: {
      type: 'postgres',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'scoreboard_test',
        username: 'postgres',
        password: 'test_password',
        ssl: false
      }
    }
  },

  // PostgreSQL container instance
  postgresContainer: null,

  // Database clients
  postgresClient: null,

  // Setup PostgreSQL container
  async setupPostgresContainer() {
    try {
      console.log('🐘 Starting PostgreSQL container...');
      
      this.postgresContainer = await new GenericContainer('postgres:15-alpine')
        .withEnvironment({
          POSTGRES_DB: 'scoreboard_test',
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: 'test_password'
        })
        .withExposedPorts(5432)
        .start();

      // Get the mapped port
      const mappedPort = this.postgresContainer.getMappedPort(5432);
      
      // Update config with mapped port
      this.databases.postgres.config.port = mappedPort;
      
      // Wait for container to be ready
      await this.waitForPostgres(mappedPort);
      
      // Create test database and tables
      await this.setupPostgresDatabase(mappedPort);
      
      console.log('✅ PostgreSQL container ready');
      
      return this.postgresContainer;
    } catch (error) {
      console.error('❌ Failed to start PostgreSQL container:', error);
      throw error;
    }
  },

  // Wait for PostgreSQL to be ready
  async waitForPostgres(port) {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const client = new Client({
          host: 'localhost',
          port: port,
          database: 'scoreboard_test',
          user: 'postgres',
          password: 'test_password'
        });
        
        await client.connect();
        await client.end();
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('PostgreSQL container failed to become ready');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  // Setup PostgreSQL database schema
  async setupPostgresDatabase(port) {
    try {
      const client = new Client({
        host: 'localhost',
        port: port,
        database: 'scoreboard_test',
        user: 'postgres',
        password: 'test_password'
      });
      
      await client.connect();
      
      // Read and execute initialization script
      const initScript = fs.readFileSync(
        path.join(process.cwd(), 'scripts', 'init-db.sql'),
        'utf8'
      );
      
      await client.query(initScript);
      await client.end();
      
      console.log('✅ PostgreSQL database schema created');
    } catch (error) {
      console.error('❌ Failed to setup PostgreSQL database:', error);
      throw error;
    }
  },

  // Cleanup PostgreSQL container
  async cleanupPostgresContainer() {
    if (this.postgresContainer) {
      try {
        await this.postgresContainer.stop();
        console.log('✅ PostgreSQL container stopped');
      } catch (error) {
        console.error('❌ Failed to stop PostgreSQL container:', error);
      }
    }
  },

  // Create test data directory for SQLite
  setupSqliteTestData() {
    const testDataDir = './tests/data';
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  },

  // Cleanup SQLite test data
  cleanupSqliteTestData() {
    const testDataDir = './tests/data';
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  },

  // Get database configuration for testing
  getTestDatabaseConfig(type = 'sqlite') {
    return this.databases[type];
  },

  // Wait utility
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Global setup for integration tests
beforeAll(async () => {
  console.log('🚀 Setting up integration test environment...');
  
  // Setup SQLite test data directory
  global.integrationTestUtils.setupSqliteTestData();
  
  // Setup PostgreSQL container if needed
  if (process.env.TEST_DATABASE === 'postgres') {
    await global.integrationTestUtils.setupPostgresContainer();
  }
  
  console.log('✅ Integration test environment ready');
});

// Global cleanup for integration tests
afterAll(async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Cleanup PostgreSQL container
  if (process.env.TEST_DATABASE === 'postgres') {
    await global.integrationTestUtils.cleanupPostgresContainer();
  }
  
  // Cleanup SQLite test data
  global.integrationTestUtils.cleanupSqliteTestData();
  
  console.log('✅ Integration test environment cleaned up');
});

// Test database cleanup between tests
afterEach(async () => {
  // Clean up test data between tests
  if (process.env.TEST_DATABASE === 'postgres' && global.integrationTestUtils.postgresClient) {
    try {
      await global.integrationTestUtils.postgresClient.query('TRUNCATE games, teams, collections, schedules RESTART IDENTITY CASCADE');
    } catch (error) {
      // Ignore cleanup errors
    }
  }
});
