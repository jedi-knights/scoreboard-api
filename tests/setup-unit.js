/**
 * Unit Test Setup
 * 
 * Configuration for fast unit tests that don't require external dependencies.
 */

// Set shorter timeout for unit tests
import { businessConfig } from '../src/config/index.js';

// Note: jest.setTimeout is not available in ES module setup files
// Timeout will be handled by Jest configuration

// Mock database adapters for unit tests
globalThis.DatabaseFactory = {
  createAdapter: () => ({
    connect: () => {},
    disconnect: () => {},
    isConnected: () => true,
    query: () => {},
    get: () => {},
    run: () => {},
    beginTransaction: () => {},
    commitTransaction: () => {},
    rollbackTransaction: () => {},
    getHealthStatus: () => ({ status: 'healthy' }),
    createTables: () => {},
    dropTables: () => {}
  })
};

// Mock external services
globalThis.winston = {
  createLogger: () => ({
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {}
  }),
  format: {
    json: () => {},
    timestamp: () => {},
    errors: () => {}
  },
  transports: {
    Console: () => {},
    File: () => {}
  }
};

// Mock file system operations
globalThis.fs = {
  existsSync: () => true,
  mkdirSync: () => {},
  writeFileSync: () => {},
  readFileSync: () => {}
};

// Mock path operations
globalThis.path = {
  dirname: () => '/test/path',
  join: (...args) => args.join('/'),
  resolve: (...args) => args.join('/')
};

// Import test factories and utilities
import { MockFactory } from './mocks/mock-factory.js';
import { NCAAGameBuilder } from './builders/ncaa-game-builder.js';
import { GameBuilder } from './builders/game-builder.js';
import { TeamBuilder } from './builders/team-builder.js';
import { ConferenceBuilder } from './builders/conference-builder.js';
import { TestUtils, TestAssertions } from './utils/test-utils.js';

// Debug: Log that setup file is being loaded
console.log('🔧 Setup file is being loaded...');
console.log('📦 MockFactory:', typeof MockFactory);
console.log('📦 NCAAGameBuilder:', typeof NCAAGameBuilder);
console.log('📦 GameBuilder:', typeof GameBuilder);
console.log('📦 TeamBuilder:', typeof TeamBuilder);
console.log('📦 ConferenceBuilder:', typeof ConferenceBuilder);
console.log('📦 TestUtils:', typeof TestUtils);
console.log('📦 TestAssertions:', typeof TestAssertions);

// Global unit test utilities
globalThis.unitTestUtils = {
  // Mock Factory
  MockFactory,
  
  // Test Data Builders
  NCAAGameBuilder,
  GameBuilder,
  TeamBuilder,
  ConferenceBuilder,
  
  // Test Utilities
  TestUtils,
  TestAssertions,
  
  // Legacy utilities (kept for backward compatibility)
  createMockDatabaseAdapter: () => MockFactory.createMockDatabaseAdapter(),
  createMockRequest: (overrides = {}) => MockFactory.createMockRequest(overrides),
  createMockResponse: (overrides = {}) => MockFactory.createMockResponse(overrides),
  createMockNext: (overrides = {}) => MockFactory.createMockNext(overrides),
  
  // Enhanced mock creation
  createMockNCAAIngestionService: (overrides = {}) => MockFactory.createMockNCAAIngestionService(overrides),
  createMockGamesService: (overrides = {}) => MockFactory.createMockGamesService(overrides),
  createMockTeamsService: (overrides = {}) => MockFactory.createMockTeamsService(overrides),
  createMockConferencesService: (overrides = {}) => MockFactory.createMockConferencesService(overrides),
  createMockGamesRepository: (overrides = {}) => MockFactory.createMockGamesRepository(overrides),
  createMockTransactionManager: (overrides = {}) => MockFactory.createMockTransactionManager(overrides),
  createMockErrorFactory: (overrides = {}) => MockFactory.createMockErrorFactory(overrides),
  createMockResponseFormatter: (overrides = {}) => MockFactory.createMockResponseFormatter(overrides),
  createMockContainer: (overrides = {}) => MockFactory.createMockContainer(overrides),
  createMockHateoas: (overrides = {}) => MockFactory.createMockHateoas(overrides),
  createMockLogger: (overrides = {}) => MockFactory.createMockLogger(overrides)
};

// Debug: Log that globalThis assignment is complete
console.log('🌍 globalThis.unitTestUtils assigned:', typeof globalThis.unitTestUtils);
console.log('🔧 Available methods:', Object.keys(globalThis.unitTestUtils));
