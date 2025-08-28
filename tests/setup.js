/**
 * Main Test Setup
 * 
 * Global test configuration and setup for all test types.
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Generate random test data
  generateTestGame: () => ({
    game_id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    data_source: 'test',
    league_name: 'Test League',
    date: '2024-09-15',
    home_team: 'Test Home Team',
    away_team: 'Test Away Team',
    sport: 'soccer',
    home_score: 2,
    away_score: 1,
    status: 'completed',
    venue: 'Test Stadium',
    city: 'Test City',
    state: 'TS'
  }),

  // Generate random team data
  generateTestTeam: () => ({
    team_id: `test_team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Team',
    short_name: 'TEST',
    sport: 'soccer',
    gender: 'women',
    level: 'college',
    conference: 'Test Conference',
    division: 'd1'
  }),

  // Wait for a specified time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => Math.random().toString(36).substr(2, length),

  // Generate random date
  randomDate: (start = new Date(2024, 0, 1), end = new Date(2024, 11, 31)) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
  }
};

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  if (process.env.NODE_ENV === 'test') {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});
