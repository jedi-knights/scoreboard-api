/**
 * Integration Test Setup
 * 
 * Improved setup for integration tests with better container management,
 * dependency injection, and test isolation.
 */

import { jest } from '@jest/globals';
import { testContainerFactory } from './test-container-factory.js';
import { businessConfig } from '../../src/config/index.js';

// Set longer timeout for integration tests
jest.setTimeout(businessConfig.testing.integrationTestTimeout || 30000);

/**
 * Integration Test Environment Manager
 */
class IntegrationTestEnvironment {
  constructor() {
    this.containers = new Map();
    this.clients = new Map();
    this.configs = new Map();
    this.appInstances = new Map();
    this.testData = new Map();
  }

  /**
   * Initialize the test environment
   * @param {Object} options - Environment options
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    const {
      databases = ['sqlite'],
      startContainers = true,
      createSchema = true
    } = options;

    console.log('🚀 Initializing integration test environment...');

    // Initialize requested databases
    for (const dbType of databases) {
      await this.initializeDatabase(dbType, { startContainers, createSchema });
    }

    console.log('✅ Integration test environment ready');
  }

  /**
   * Initialize a specific database
   * @param {string} dbType - Database type
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initializeDatabase(dbType, options = {}) {
    const { startContainers = true, createSchema = true } = options;

    try {
      switch (dbType) {
        case 'postgres':
          if (startContainers) {
            const { container, client, config } = await testContainerFactory.getPostgresContainer();
            this.containers.set('postgres', container);
            this.clients.set('postgres', client);
            this.configs.set('postgres', config);
          }
          break;

        case 'mysql':
          if (startContainers) {
            const { container, client, config } = await testContainerFactory.getMySQLContainer();
            this.containers.set('mysql', container);
            this.clients.set('mysql', client);
            this.configs.set('mysql', config);
          }
          break;

        case 'sqlite':
          const sqliteConfig = testContainerFactory.getSQLiteConfig();
          this.configs.set('sqlite', sqliteConfig);
          break;

        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${dbType} database:`, error);
      throw error;
    }
  }

  /**
   * Get database client for a specific type
   * @param {string} dbType - Database type
   * @returns {Object} Database client
   */
  getClient(dbType) {
    if (dbType === 'sqlite') {
      // Return SQLite configuration for now
      return this.configs.get('sqlite');
    }
    return this.clients.get(dbType);
  }

  /**
   * Get database configuration for a specific type
   * @param {string} dbType - Database type
   * @returns {Object} Database configuration
   */
  getConfig(dbType) {
    return this.configs.get(dbType);
  }

  /**
   * Create test data for a specific scenario
   * @param {string} scenario - Test scenario name
   * @param {Object} options - Test data options
   * @returns {Promise<Object>} Test data
   */
  async createTestData(scenario, options = {}) {
    const { dbType = 'postgres', count = 1 } = options;
    const client = this.getClient(dbType);

    if (!client) {
      throw new Error(`No client available for database type: ${dbType}`);
    }

    switch (scenario) {
      case 'conference':
        return await this.createConferenceData(client, count);
      case 'team':
        return await this.createTeamData(client, count);
      case 'game':
        return await this.createGameData(client, count);
      case 'complete_scenario':
        return await this.createCompleteScenario(client, count);
      default:
        throw new Error(`Unknown test scenario: ${scenario}`);
    }
  }

  /**
   * Create conference test data
   * @param {Object} client - Database client
   * @param {number} count - Number of conferences to create
   * @returns {Promise<Array>} Created conferences
   */
  async createConferenceData(client, count = 1) {
    const conferences = [];
    
    for (let i = 0; i < count; i++) {
      const conference = {
        name: `Test Conference ${i + 1}`,
        short_name: `TC${i + 1}`,
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        region: 'West',
        country: 'USA'
      };

      if (client.query) {
        const result = await client.query(`
          INSERT INTO conferences (name, short_name, sport, division, gender, region, country)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [conference.name, conference.short_name, conference.sport, conference.division, conference.gender, conference.region, conference.country]);
        
        conferences.push(result.rows[0]);
      } else {
        // Mock response for non-query clients
        conferences.push({ id: `conf-${i + 1}`, ...conference });
      }
    }

    return conferences;
  }

  /**
   * Create team test data
   * @param {Object} client - Database client
   * @param {number} count - Number of teams to create
   * @returns {Promise<Array>} Created teams
   */
  async createTeamData(client, count = 1) {
    const teams = [];
    
    for (let i = 0; i < count; i++) {
      const team = {
        name: `Test Team ${i + 1}`,
        short_name: `TT${i + 1}`,
        mascot: `Lions ${i + 1}`,
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        city: `Test City ${i + 1}`,
        state: 'CA',
        country: 'USA'
      };

      if (client.query) {
        const result = await client.query(`
          INSERT INTO teams (name, short_name, mascot, sport, division, gender, city, state, country)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [team.name, team.short_name, team.mascot, team.sport, team.division, team.gender, team.city, team.state, team.country]);
        
        teams.push(result.rows[0]);
      } else {
        // Mock response for non-query clients
        teams.push({ id: `team-${i + 1}`, ...team });
      }
    }

    return teams;
  }

  /**
   * Create game test data
   * @param {Object} client - Database client
   * @param {number} count - Number of games to create
   * @returns {Promise<Array>} Created games
   */
  async createGameData(client, count = 1) {
    const games = [];
    
    for (let i = 0; i < count; i++) {
      const game = {
        game_id: `game-${i + 1}`,
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        date: '2024-01-01',
        status: 'scheduled'
      };

      if (client.query) {
        const result = await client.query(`
          INSERT INTO games (game_id, sport, division, gender, date, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [game.game_id, game.sport, game.division, game.gender, game.date, game.status]);
        
        games.push(result.rows[0]);
      } else {
        // Mock response for non-query clients
        games.push({ id: `game-${i + 1}`, ...game });
      }
    }

    return games;
  }

  /**
   * Create a complete test scenario with conference, teams, and game
   * @param {Object} client - Database client
   * @param {number} count - Number of scenarios to create
   * @returns {Promise<Array>} Created scenarios
   */
  async createCompleteScenario(client, count = 1) {
    const scenarios = [];
    
    for (let i = 0; i < count; i++) {
      // Create conference first
      const conferences = await this.createConferenceData(client, 1);
      const conference = conferences[0];

      // Create teams with conference reference
      const teams = await this.createTeamData(client, 2);
      
      // Create game with team references
      const game = {
        game_id: `game-${i + 1}`,
        home_team_id: teams[0].id,
        away_team_id: teams[1].id,
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        date: '2024-01-01',
        status: 'scheduled'
      };

      if (client.query) {
        const result = await client.query(`
          INSERT INTO games (game_id, home_team_id, away_team_id, sport, division, gender, date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [game.game_id, game.home_team_id, game.away_team_id, game.sport, game.division, game.gender, game.date, game.status]);
        
        scenarios.push({
          conference,
          teams,
          game: result.rows[0]
        });
      } else {
        // Mock response for non-query clients
        scenarios.push({
          conference,
          teams,
          game: { id: `game-${i + 1}`, ...game }
        });
      }
    }

    return scenarios;
  }

  /**
   * Clean up test data between tests
   * @param {string} dbType - Database type to clean
   * @returns {Promise<void>}
   */
  async cleanupTestData(dbType = 'postgres') {
    await testContainerFactory.cleanupTestData(dbType);
  }

  /**
   * Clean up the entire test environment
   * @returns {Promise<void>}
   */
  async cleanup() {
    console.log('🧹 Cleaning up integration test environment...');
    
    // Clean up test containers
    await testContainerFactory.cleanup();
    
    // Clear local references
    this.containers.clear();
    this.clients.clear();
    this.configs.clear();
    this.appInstances.clear();
    this.testData.clear();

    console.log('✅ Integration test environment cleaned up');
  }
}

// Create global instance
const integrationTestEnv = new IntegrationTestEnvironment();

// Export for use in tests
export { integrationTestEnv };

// Global setup for integration tests
beforeAll(async () => {
  const dbTypes = process.env.TEST_DATABASES ? process.env.TEST_DATABASES.split(',') : ['sqlite'];
  
  await integrationTestEnv.initialize({
    databases: dbTypes,
    startContainers: process.env.TEST_DATABASE !== 'sqlite',
    createSchema: true
  });
});

// Global cleanup for integration tests
afterAll(async () => {
  await integrationTestEnv.cleanup();
});

// Test data cleanup between tests
afterEach(async () => {
  const dbTypes = process.env.TEST_DATABASES ? process.env.TEST_DATABASES.split(',') : ['sqlite'];
  
  for (const dbType of dbTypes) {
    await integrationTestEnv.cleanupTestData(dbType);
  }
});

// Export utilities for backward compatibility
global.integrationTestUtils = {
  // Database access
  getClient: (dbType) => integrationTestEnv.getClient(dbType),
  getConfig: (dbType) => integrationTestEnv.getConfig(dbType),
  
  // Test data creation
  createTestData: (scenario, options) => integrationTestEnv.createTestData(scenario, options),
  
  // Cleanup
  cleanupTestData: (dbType) => integrationTestEnv.cleanupTestData(dbType),
  
  // Legacy methods for backward compatibility
  databases: {
    sqlite: integrationTestEnv.getConfig('sqlite'),
    postgres: integrationTestEnv.getConfig('postgres'),
    mysql: integrationTestEnv.getConfig('mysql')
  },
  
  // Test data builders
  testData: {
    sampleGames: [
      { home_team: 'Lakers', away_team: 'Warriors', sport: 'basketball' },
      { home_team: 'Celtics', away_team: 'Heat', sport: 'basketball' }
    ],
    sampleTeams: [
      { name: 'Lakers', sport: 'basketball', division: 'd1' },
      { name: 'Warriors', sport: 'basketball', division: 'd1' }
    ],
    sampleConferences: [
      { name: 'Pacific Conference', sport: 'basketball', division: 'd1' },
      { name: 'Atlantic Conference', sport: 'basketball', division: 'd1' }
    ]
  },
  
  // Performance testing utilities
  performance: {
    measureExecutionTime: async (operation) => {
      const start = performance.now();
      const result = await operation();
      const end = performance.now();
      return { result, executionTime: end - start };
    },
    
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
  
  // Test scenario builders
  scenarios: {
    createCompleteGameScenario: async (client) => {
      return await integrationTestEnv.createTestData('complete_scenario', { count: 1 });
    },
    
    createBatchIngestionScenario: async (client, count = 5) => {
      return await integrationTestEnv.createTestData('complete_scenario', { count });
    }
  }
};
