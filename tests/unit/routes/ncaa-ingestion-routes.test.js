import { jest } from '@jest/globals';
import { TestContainer } from '../../../src/test-container.js';

// Mock the controller
const mockGetHealth = jest.fn();
const mockValidateGameData = jest.fn();
const mockIngestGame = jest.fn();
const mockIngestGames = jest.fn();

const mockNCAAIngestionController = {
  getHealth: mockGetHealth,
  validateGameData: mockValidateGameData,
  ingestGame: mockIngestGame,
  ingestGames: mockIngestGames
};

jest.unstable_mockModule('../../../src/controllers/ncaa-ingestion-controller.js', () => ({
  NCAAIngestionController: jest.fn(() => mockNCAAIngestionController)
}));

describe('NCAA Ingestion Routes', () => {
  let container;
  let createNCAAIngestionRoutes;
  let router;

  beforeAll(async () => {
    const routesModule = await import('../../../src/routes/ncaa-ingestion-routes.js');
    createNCAAIngestionRoutes = routesModule.createNCAAIngestionRoutes;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create test container
    container = new TestContainer();
    
    // Mock the NCAA ingestion controller
    const mockNCAAIngestionController = TestContainer.createMockService({
      getHealth: jest.fn(),
      validateGameData: jest.fn(),
      ingestGame: jest.fn(),
      ingestGames: jest.fn()
    });
    
    container.mockService('ncaaIngestionController', mockNCAAIngestionController);
  });

  describe('createNCAAIngestionRoutes', () => {
    it('should create a router with all NCAA ingestion endpoints', () => {
      router = createNCAAIngestionRoutes(container);
      
      expect(router).toBeDefined();
      expect(typeof router.stack).toBe('object');
    });

    it('should register GET /health endpoint for health check', () => {
      router = createNCAAIngestionRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/health'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.get).toBe(true);
    });

    it('should register POST /validate endpoint for validating game data', () => {
      router = createNCAAIngestionRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/validate'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.post).toBe(true);
    });

    it('should register POST /game endpoint for ingesting a single game', () => {
      router = createNCAAIngestionRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/game'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.post).toBe(true);
    });

    it('should register POST /games endpoint for ingesting multiple games', () => {
      router = createNCAAIngestionRoutes(container);
      
      const route = router.stack.find(layer => 
        layer.route && layer.route.path === '/games'
      );
      
      expect(route).toBeDefined();
      expect(route.route.methods.post).toBe(true);
    });
  });
});
