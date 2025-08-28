/**
 * Unit Test Setup
 * 
 * Configuration for fast unit tests that don't require external dependencies.
 */

// Set shorter timeout for unit tests
jest.setTimeout(5000);

// Mock database adapters for unit tests
jest.mock('../src/database/database-factory.js', () => ({
  DatabaseFactory: {
    createAdapter: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(() => true),
      query: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      getHealthStatus: jest.fn(() => ({ status: 'healthy' })),
      createTables: jest.fn(),
      dropTables: jest.fn()
    }))
  }
}));

// Mock external services
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    json: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}));

// Mock path operations
jest.mock('path', () => ({
  dirname: jest.fn(() => '/test/path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/'))
}));

// Global unit test utilities
global.unitTestUtils = {
  // Create mock database adapter
  createMockDatabaseAdapter: () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(() => true),
    query: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    getHealthStatus: jest.fn(() => ({ status: 'healthy' })),
    createTables: jest.fn(),
    dropTables: jest.fn()
  }),

  // Create mock request object
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/test',
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides
  }),

  // Create mock response object
  createMockResponse: () => {
    const res = {
      statusCode: 200,
      body: null,
      headers: {},
      status: jest.fn(function(code) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn(function(data) {
        this.body = data;
        return this;
      }),
      send: jest.fn(function(data) {
        this.body = data;
        return this;
      }),
      set: jest.fn(function(key, value) {
        this.headers[key] = value;
        return this;
      })
    };
    return res;
  },

  // Create mock next function
  createMockNext: () => jest.fn()
};
