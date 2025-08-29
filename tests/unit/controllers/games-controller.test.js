import { jest } from '@jest/globals';

// Mock the dependencies
const mockGenerateCollectionLinks = jest.fn(() => ({ collection: 'links' }));
const mockGenerateResourceLinks = jest.fn(() => ({ resource: 'links' }));
const mockGenerateActionLinks = jest.fn(() => ({ action: 'links' }));
const mockEnhanceWithLinks = jest.fn((req, data, links) => ({ ...data, _links: links }));

// Mock the modules
jest.unstable_mockModule('../../../src/services/games-service.js', () => ({
  GamesService: jest.fn()
}));

jest.unstable_mockModule('../../../src/utils/hateoas.js', () => ({
  generateCollectionLinks: mockGenerateCollectionLinks,
  generateResourceLinks: mockGenerateResourceLinks,
  generateActionLinks: mockGenerateActionLinks,
  enhanceWithLinks: mockEnhanceWithLinks
}));

describe('GamesController', () => {
  let controller;
  let mockDatabaseAdapter;
  let mockGamesService;
  let mockReq;
  let mockRes;
  let GamesController;
  let GamesService;

  beforeAll(async () => {
    // Import the mocked modules
    const controllerModule = await import('../../../src/controllers/games-controller.js');
    const serviceModule = await import('../../../src/services/games-service.js');
    
    GamesController = controllerModule.GamesController;
    GamesService = serviceModule.GamesService;
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock database adapter
    mockDatabaseAdapter = {
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
    };

    // Create mock request and response
    mockReq = {
      method: 'GET',
      url: '/test',
      body: {},
      query: {},
      params: {},
      headers: {}
    };

    mockRes = {
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

    // Create mock GamesService instance
    mockGamesService = {
      getGames: jest.fn(),
      getGameById: jest.fn(),
      getLiveGames: jest.fn(),
      getGamesByDateRange: jest.fn(),
      getGamesByTeam: jest.fn(),
      createGame: jest.fn(),
      updateGame: jest.fn(),
      deleteGame: jest.fn(),
      getGameStatistics: jest.fn()
    };

    // Set up the mock implementation
    GamesService.mockImplementation(() => mockGamesService);

    // Create controller instance
    controller = new GamesController(mockDatabaseAdapter);
  });

  describe('Constructor', () => {
    it('should create a new GamesService instance', () => {
      expect(controller.gamesService).toBeDefined();
      expect(controller.gamesService).toBe(mockGamesService);
    });
  });

  describe('getGames', () => {
    it('should get games with default pagination and return enhanced result', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }, { id: 2, name: 'Game 2' }];
      const mockResult = { games: mockGames, total: 2 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {};

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith({}, {
        limit: 10,
        offset: 0,
        sortBy: undefined,
        sortOrder: undefined
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        games: mockGames,
        total: 2,
        _links: expect.any(Object)
      }));
    });

    it('should handle service errors and return 500', async () => {
      const error = new Error('Database connection failed');
      mockGamesService.getGames.mockRejectedValue(error);

      await controller.getGames(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('getGameById', () => {
    it('should get game by ID and return enhanced result', async () => {
      const mockGame = {
        id: 1,
        name: 'Game 1',
        homeTeamId: 10,
        awayTeamId: 20,
        conferenceId: 5,
        venueId: 15
      };
      
      mockGamesService.getGameById.mockResolvedValue(mockGame);
      mockReq.params = { id: '1' };

      await controller.getGameById(mockReq, mockRes);

      expect(mockGamesService.getGameById).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Game 1',
        _links: expect.any(Object)
      }));
    });

    it('should handle game not found error and return 404', async () => {
      const error = new Error('Game not found');
      mockGamesService.getGameById.mockRejectedValue(error);
      mockReq.params = { id: '999' };

      await controller.getGameById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: 'Game not found'
      });
    });

    it('should handle other errors and return 500', async () => {
      const otherError = new Error('Database connection failed');
      mockGamesService.getGameById.mockRejectedValue(otherError);
      mockReq.params = { id: '999' };

      await controller.getGameById(mockReq, mockRes);

      expect(mockGamesService.getGameById).toHaveBeenCalledWith('999');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('getLiveGames', () => {
    it('should get live games successfully', async () => {
      const mockLiveGames = [{ id: 1, status: 'in_progress' }];
      mockGamesService.getLiveGames.mockResolvedValue(mockLiveGames);
      mockReq.query = { sport: 'basketball' };

      await controller.getLiveGames(mockReq, mockRes);

      expect(mockGamesService.getLiveGames).toHaveBeenCalledWith({ sport: 'basketball' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockLiveGames);
    });

    it('should handle service errors and return 500', async () => {
      const serviceError = new Error('Database connection failed');
      mockGamesService.getLiveGames.mockRejectedValue(serviceError);
      mockReq.query = { sport: 'basketball' };

      await controller.getLiveGames(mockReq, mockRes);

      expect(mockGamesService.getLiveGames).toHaveBeenCalledWith({ sport: 'basketball' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('getGamesByDateRange', () => {
    it('should get games by date range successfully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }, { id: 2, name: 'Game 2' }];
      mockReq.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
      mockGamesService.getGamesByDateRange.mockResolvedValue(mockGames);

      await controller.getGamesByDateRange(mockReq, mockRes);

      expect(mockGamesService.getGamesByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31', { startDate: '2024-01-01', endDate: '2024-01-31' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockGames);
    });

    it('should return 400 when startDate is missing', async () => {
      mockReq.query = { endDate: '2024-01-31' };

      await controller.getGamesByDateRange(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Start date and end date are required'
      });
    });

    it('should return 400 when endDate is missing', async () => {
      mockReq.query = { startDate: '2024-01-01' };

      await controller.getGamesByDateRange(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Start date and end date are required'
      });
    });

    it('should return 400 when startDate is after endDate', async () => {
      mockReq.query = { startDate: '2024-01-31', endDate: '2024-01-01' };
      const dateError = new Error('Start date must be before end date');
      mockGamesService.getGamesByDateRange.mockRejectedValue(dateError);

      await controller.getGamesByDateRange(mockReq, mockRes);

      expect(mockGamesService.getGamesByDateRange).toHaveBeenCalledWith('2024-01-31', '2024-01-01', { startDate: '2024-01-31', endDate: '2024-01-01' });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Start date must be before end date'
      });
    });

    it('should return 500 for other errors in getGamesByDateRange', async () => {
      mockReq.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const otherError = new Error('Database connection failed');
      mockGamesService.getGamesByDateRange.mockRejectedValue(otherError);

      await controller.getGamesByDateRange(mockReq, mockRes);

      expect(mockGamesService.getGamesByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31', { startDate: '2024-01-01', endDate: '2024-01-31' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('getGamesByTeam', () => {
    it('should get games by team name successfully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }, { id: 2, name: 'Game 2' }];
      const mockResult = { games: mockGames, total: 2 };
      
      mockGamesService.getGamesByTeam.mockResolvedValue(mockResult);
      mockReq.params = { teamName: 'Lakers' };

      await controller.getGamesByTeam(mockReq, mockRes);

      expect(mockGamesService.getGamesByTeam).toHaveBeenCalledWith('Lakers', {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service errors with 500 status', async () => {
      mockReq.params = { teamName: 'Lakers' };
      const serviceError = new Error('Database connection failed');
      mockGamesService.getGamesByTeam.mockRejectedValue(serviceError);

      await controller.getGamesByTeam(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });

    it('should handle validation errors with 400 status', async () => {
      mockReq.params = {};
      const validationError = new Error('Team name is required');
      mockGamesService.getGamesByTeam.mockRejectedValue(validationError);

      await controller.getGamesByTeam(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Team name is required'
      });
    });
  });

  describe('createGame', () => {
    it('should create game successfully and return enhanced result', async () => {
      const mockGameData = {
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        date: '2024-01-01',
        sport: 'basketball'
      };
      const mockCreatedGame = { id: 1, ...mockGameData };
      
      mockGamesService.createGame.mockResolvedValue(mockCreatedGame);
      mockReq.body = mockGameData;

      await controller.createGame(mockReq, mockRes);

      expect(mockGamesService.createGame).toHaveBeenCalledWith(mockGameData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        _links: expect.any(Object)
      }));
    });
  });

  describe('updateGame', () => {
    it('should update game successfully', async () => {
      const mockUpdateData = { status: 'completed' };
      const mockUpdatedGame = { id: 1, status: 'completed' };
      
      mockGamesService.updateGame.mockResolvedValue(mockUpdatedGame);
      mockReq.params = { id: '1' };
      mockReq.body = mockUpdateData;

      await controller.updateGame(mockReq, mockRes);

      expect(mockGamesService.updateGame).toHaveBeenCalledWith('1', mockUpdateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedGame);
    });

    it('should handle missing game ID error and return 400', async () => {
      const error = new Error('Game ID is required');
      mockGamesService.updateGame.mockRejectedValue(error);
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Game' };

      await controller.updateGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Game ID is required'
      });
    });

    it('should handle game not found error and return 404', async () => {
      const error = new Error('Game not found');
      mockGamesService.updateGame.mockRejectedValue(error);
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Game' };

      await controller.updateGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: 'Game not found'
      });
    });

    it('should handle validation errors and return 400', async () => {
      const error = new Error('Invalid date format. Use YYYY-MM-DD');
      mockGamesService.updateGame.mockRejectedValue(error);
      mockReq.params = { id: '1' };
      mockReq.body = { date: 'invalid-date' };

      await controller.updateGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    });

    it('should handle other errors and return 500', async () => {
      const error = new Error('Database connection failed');
      mockGamesService.updateGame.mockRejectedValue(error);
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Game' };

      await controller.updateGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('deleteGame', () => {
    it('should delete game successfully', async () => {
      const mockDeleteResult = { success: true, message: 'Game deleted' };
      
      mockGamesService.deleteGame.mockResolvedValue(mockDeleteResult);
      mockReq.params = { id: '1' };

      await controller.deleteGame(mockReq, mockRes);

      expect(mockGamesService.deleteGame).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockDeleteResult);
    });

    it('should handle missing game ID with 400 status', async () => {
      const validationError = new Error('Game ID is required');
      
      mockReq.params = { id: '' };
      mockGamesService.deleteGame.mockRejectedValue(validationError);

      await controller.deleteGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        message: 'Game ID is required'
      });
    });

    it('should handle game not found with 404 status', async () => {
      const notFoundError = new Error('Game not found');
      
      mockReq.params = { id: '999' };
      mockGamesService.deleteGame.mockRejectedValue(notFoundError);

      await controller.deleteGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: 'Game not found'
      });
    });

    it('should handle other errors with 500 status', async () => {
      const serviceError = new Error('Database error');
      
      mockReq.params = { id: '1' };
      mockGamesService.deleteGame.mockRejectedValue(serviceError);

      await controller.deleteGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database error'
      });
    });
  });

  describe('getGameStatistics', () => {
    it('should get game statistics successfully', async () => {
      const mockStats = { totalGames: 100, completedGames: 80 };
      mockGamesService.getGameStatistics.mockResolvedValue(mockStats);
      mockReq.query = { season: '2024' };

      await controller.getGameStatistics(mockReq, mockRes);

      expect(mockGamesService.getGameStatistics).toHaveBeenCalledWith({ season: '2024' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockStats);
    });

    it('should handle service errors and return 500', async () => {
      const serviceError = new Error('Database connection failed');
      mockGamesService.getGameStatistics.mockRejectedValue(serviceError);
      mockReq.query = { season: '2024' };

      await controller.getGameStatistics(mockReq, mockRes);

      expect(mockGamesService.getGameStatistics).toHaveBeenCalledWith({ season: '2024' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed'
      });
    });
  });

  describe('Helper Methods', () => {
    describe('_enhanceGameWithLinks', () => {
      it('should enhance game with HATEOAS links', () => {
        const mockGame = {
          id: 1,
          homeTeamId: 10,
          awayTeamId: 20,
          conferenceId: 5,
          venueId: 15
        };

        const result = controller._enhanceGameWithLinks(mockReq, mockGame);

        expect(result).toHaveProperty('_links');
        expect(result.id).toBe(1);
      });
      it('should enhance game with all related resource IDs', () => {
        const mockGame = {
          id: 1,
          homeTeamId: 10,
          awayTeamId: 20,
          conferenceId: 5,
          venueId: 15
        };

        const result = controller._enhanceGameWithLinks(mockReq, mockGame);

        expect(result).toHaveProperty('_links');
        expect(result.id).toBe(1);
      });

      it('should enhance game with partial related resource IDs', () => {
        const mockGame = {
          id: 1,
          homeTeamId: 10,
          awayTeamId: 20
          // conferenceId and venueId are undefined
        };

        const result = controller._enhanceGameWithLinks(mockReq, mockGame);

        expect(result).toHaveProperty('_links');
        expect(result.id).toBe(1);
      });

      it('should enhance game with no related resource IDs', () => {
        const mockGame = {
          id: 1
          // No related resource IDs
        };

        const result = controller._enhanceGameWithLinks(mockReq, mockGame);

        expect(result).toHaveProperty('_links');
        expect(result.id).toBe(1);
      });
    });

    describe('_handleGameError', () => {
      it('should handle validation errors and return 400', () => {
        const error = new Error('Missing required field: homeTeam');
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis()
        };

        controller._handleGameError(error, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Bad request',
          message: 'Missing required field: homeTeam'
        });
      });

      it('should handle non-validation errors and return 500', () => {
        const error = new Error('Database connection failed');
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis()
        };

        controller._handleGameError(error, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Internal server error',
          message: 'Database connection failed'
        });
      });
    });
  });
});
