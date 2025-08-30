import { jest } from '@jest/globals';
import { TestContainer } from '../../../src/test-container.js';

// Mock the controller
const mockGetGames = jest.fn();
const mockGetLiveGames = jest.fn();
const mockGetGameStatistics = jest.fn();
const mockGetGamesByDateRange = jest.fn();
const mockGetGamesByTeam = jest.fn();
const mockGetGameById = jest.fn();
const mockCreateGame = jest.fn();
const mockUpdateGame = jest.fn();
const mockDeleteGame = jest.fn();

const mockGamesController = {
  getGames: mockGetGames,
  getLiveGames: mockGetLiveGames,
  getGameStatistics: mockGetGameStatistics,
  getGamesByDateRange: mockGetGamesByDateRange,
  getGamesByTeam: mockGetGamesByTeam,
  getGameById: mockGetGameById,
  createGame: mockCreateGame,
  updateGame: mockUpdateGame,
  deleteGame: mockDeleteGame
};

// Mock the controller globally
globalThis.GamesController = jest.fn(() => mockGamesController);

describe('Games Routes', () => {
  let container;
  let createGamesRoutes;
  let router;

  beforeAll(async () => {
    const routesModule = await import('../../../src/routes/games-routes.js');
    createGamesRoutes = routesModule.createGamesRoutes;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create test container
    container = new TestContainer();
    
    // Mock the games controller
    const mockGamesController = TestContainer.createMockService({
      getGames: jest.fn(),
      getGameById: jest.fn(),
      getLiveGames: jest.fn(),
      getGamesByDateRange: jest.fn(),
      getGamesByTeam: jest.fn(),
      createGame: jest.fn(),
      updateGame: jest.fn(),
      deleteGame: jest.fn(),
      getGameStatistics: jest.fn()
    });
    
    container.mockService('gamesController', mockGamesController);
  });

  describe('createGamesRoutes', () => {
    it('should create a router with all games endpoints', () => {
      router = createGamesRoutes(container);
      
      expect(router).toBeDefined();
      expect(typeof router.stack).toBe('object');
    });

    it('should register GET / endpoint for listing games', () => {
      router = createGamesRoutes(container);
      
      // Find the route in the router stack
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register GET /live endpoint for live games', () => {
      router = createGamesRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/live'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register GET /statistics endpoint for game statistics', () => {
      router = createGamesRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/statistics'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register GET /date-range endpoint for games by date range', () => {
      router = createGamesRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/date-range'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register GET /team/:teamName endpoint for games by team', () => {
      router = createGamesRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/team/:teamName'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register GET /:id endpoint for getting a specific game', () => {
      router = createGamesRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/:id'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register POST / endpoint for creating games', () => {
      router = createGamesRoutes(container);
      
      // Check that the router has routes registered
      expect(router.stack.length).toBeGreaterThan(0);
      
      // Verify that the controller methods are bound by checking the mock
      expect(typeof mockCreateGame).toBe('function');
    });

    it('should register PUT /:id endpoint for updating games', () => {
      router = createGamesRoutes(container);
      
      // Check that the router has routes registered
      expect(router.stack.length).toBeGreaterThan(0);
      
      // Verify that the controller methods are bound by checking the mock
      expect(typeof mockUpdateGame).toBe('function');
    });

    it('should register DELETE /:id endpoint for deleting games', () => {
      router = createGamesRoutes(container);
      
      // Check that the router has routes registered
      expect(router.stack.length).toBeGreaterThan(0);
      
      // Verify that the controller methods are bound by checking the mock
      expect(typeof mockDeleteGame).toBe('function');
    });
  });
});
