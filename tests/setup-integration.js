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
import { businessConfig } from '../src/config/index.js';

jest.setTimeout(businessConfig.testing.integrationTestTimeout);

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
    },
    mysql: {
      type: 'mysql',
      config: {
        host: 'localhost',
        port: 3306,
        database: 'scoreboard_test',
        username: 'root',
        password: 'test_password'
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
        await new Promise(resolve => setTimeout(resolve, businessConfig.testing.testDelay));
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
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Enhanced test data management
  testData: {
    // Sample test data for different scenarios
    sampleGames: [
      {
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-01',
        status: 'scheduled'
      },
      {
        home_team: 'Celtics',
        away_team: 'Heat',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-02',
        status: 'scheduled'
      }
    ],
    sampleTeams: [
      {
        name: 'Lakers',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        city: 'Los Angeles',
        state: 'CA'
      },
      {
        name: 'Warriors',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        city: 'San Francisco',
        state: 'CA'
      }
    ],
    sampleConferences: [
      {
        name: 'Pacific Conference',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        region: 'West'
      },
      {
        name: 'Atlantic Conference',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        region: 'East'
      }
    ]
  },

  // Performance testing utilities
  performance: {
    // Measure execution time
    measureExecutionTime: async (operation) => {
      const start = performance.now();
      const result = await operation();
      const end = performance.now();
      return {
        result,
        executionTime: end - start
      };
    },

    // Load testing utilities
    loadTest: async (operation, iterations = 100) => {
      const times = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await operation();
        const end = performance.now();
        times.push(end - start);
      }
      
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      return { avg, min, max, times };
    },

    // Stress testing utilities
    stressTest: async (operation, maxConcurrency = 10) => {
      const promises = [];
      for (let i = 0; i < maxConcurrency; i++) {
        promises.push(operation());
      }
      
      const start = performance.now();
      const results = await Promise.all(promises);
      const end = performance.now();
      
      return {
        results,
        totalTime: end - start,
        avgTime: (end - start) / maxConcurrency
      };
    }
  },

  // Data validation utilities
  validation: {
    // Validate database schema
    validateSchema: async (client, expectedTables) => {
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const actualTables = tables.rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !actualTables.includes(table));
      
      return {
        valid: missingTables.length === 0,
        missingTables,
        actualTables
      };
    },

    // Validate data integrity
    validateDataIntegrity: async (client) => {
      const checks = [];
      
      // Check for orphaned records
      const orphanedGames = await client.query(`
        SELECT g.id FROM games g 
        LEFT JOIN teams ht ON g.home_team_id = ht.id 
        LEFT JOIN teams at ON g.away_team_id = at.id 
        WHERE ht.id IS NULL OR at.id IS NULL
      `);
      
      checks.push({
        name: 'Orphaned Games',
        valid: orphanedGames.rows.length === 0,
        count: orphanedGames.rows.length
      });
      
      return checks;
    }
  },

  // Test scenario builders
  scenarios: {
    // Create a complete game scenario with teams and conference
    createCompleteGameScenario: async (client) => {
      // Create conference
      const conferenceResult = await client.query(`
        INSERT INTO conferences (name, sport, division, gender, region)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['Test Conference', 'basketball', 'd1', 'men', 'West']);
      
      const conferenceId = conferenceResult.rows[0].id;
      
      // Create teams
      const homeTeamResult = await client.query(`
        INSERT INTO teams (name, sport, division, gender, city, state, conference_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, ['Home Team', 'basketball', 'd1', 'men', 'Home City', 'CA', conferenceId]);
      
      const awayTeamResult = await client.query(`
        INSERT INTO teams (name, sport, division, gender, city, state, conference_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, ['Away Team', 'basketball', 'd1', 'men', 'Away City', 'NY', conferenceId]);
      
      // Create game
      const gameResult = await client.query(`
        INSERT INTO games (home_team_id, away_team_id, sport, division, date, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [homeTeamResult.rows[0].id, awayTeamResult.rows[0].id, 'basketball', 'd1', '2024-01-01', 'scheduled']);
      
      return {
        conferenceId,
        homeTeamId: homeTeamResult.rows[0].id,
        awayTeamId: awayTeamResult.rows[0].id,
        gameId: gameResult.rows[0].id
      };
    },

    // Create a batch ingestion scenario
    createBatchIngestionScenario: async (client, count = 5) => {
      const scenarios = [];
      
      for (let i = 0; i < count; i++) {
        const scenario = await this.createCompleteGameScenario(client);
        scenarios.push(scenario);
      }
      
      return scenarios;
    }
  }
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
