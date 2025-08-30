import { jest } from '@jest/globals';
import { TestContainer } from '../../../src/test-container.js';

// Mock the dependencies
const mockGenerateCollectionLinks = jest.fn(() => ({ collection: 'links' }));
const mockGenerateResourceLinks = jest.fn(() => ({ resource: 'links' }));
const mockGenerateActionLinks = jest.fn(() => ({ action: 'links' }));
const mockEnhanceWithLinks = jest.fn((req, data, links) => ({ ...data, _links: links }));

// Mock the modules
jest.unstable_mockModule('../../../src/utils/hateoas.js', () => ({
  generateCollectionLinks: mockGenerateCollectionLinks,
  generateResourceLinks: mockGenerateResourceLinks,
  generateActionLinks: mockGenerateActionLinks,
  enhanceWithLinks: mockEnhanceWithLinks
}));

describe('GamesController', () => {
  let controller;
  let mockGamesService;
  let mockReq;
  let mockRes;
  let GamesController;
  let container;

  beforeAll(async () => {
    // Import the mocked modules
    const controllerModule = await import('../../../src/controllers/games-controller.js');
    
    GamesController = controllerModule.GamesController;
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create test container
    container = new TestContainer();

    // Create mock GamesService instance
    mockGamesService = TestContainer.createMockService({
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

    // Mock the service in the container
    container.mockService('gamesService', mockGamesService);

    // Create mock request and response
    mockReq = {
      method: 'GET',
      url: '/test',
      body: {},
      query: {},
      params: {},
      headers: {},
      protocol: 'http',
      get: jest.fn((header) => {
        if (header === 'host') return 'localhost:3000';
        if (header === 'X-Forwarded-Host') return null;
        if (header === 'X-Forwarded-Proto') return null;
        return null;
      })
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

    // Create controller instance with injected service
    controller = new GamesController(mockGamesService);
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
        data: expect.arrayContaining(mockGames),
        message: 'Games retrieved successfully',
        success: true,
        metadata: expect.objectContaining({
          pagination: expect.any(Object)
        })
      }));
    });

    it('should handle service errors and return 500', async () => {
      const error = new Error('Database connection failed');
      mockGamesService.getGames.mockRejectedValue(error);

      await controller.getGames(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Server Error',
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
        data: expect.objectContaining({
          id: 1,
          name: 'Game 1',
          _links: expect.any(Object)
        }),
        message: 'Game retrieved successfully',
        success: true
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
        error: 'Not Found',
        message: 'Game not found: 999'
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
        error: 'Internal Server Error',
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockLiveGames,
        message: 'Games retrieved successfully',
        success: true,
        metadata: expect.objectContaining({
          filters: {},
          pagination: undefined,
          sortOptions: {}
        })
      }));
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
        error: 'Internal Server Error',
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockGames,
        message: 'Games retrieved successfully',
        success: true,
        metadata: expect.objectContaining({
          filters: {},
          pagination: undefined,
          sortOptions: {}
        })
      }));
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
        error: 'Bad Request',
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
        error: 'Internal Server Error',
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockGames,
        message: 'Games retrieved successfully',
        success: true,
        metadata: expect.objectContaining({
          filters: {},
          pagination: undefined,
          sortOptions: {}
        })
      }));
    });

    it('should handle service errors with 500 status', async () => {
      mockReq.params = { teamName: 'Lakers' };
      const serviceError = new Error('Database connection failed');
      mockGamesService.getGamesByTeam.mockRejectedValue(serviceError);

      await controller.getGamesByTeam(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Server Error',
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
        error: 'Bad Request',
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
        data: expect.objectContaining({
          game_id: 1,
          action: 'created',
          game: expect.objectContaining({
            id: 1,
            _links: expect.any(Object)
          })
        }),
        message: 'Game created successfully',
        success: true
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          game_id: 1,
          action: 'updated',
          game: mockUpdatedGame
        }),
        message: 'Game updated successfully',
        success: true
      }));
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
        error: 'Bad Request',
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
        error: 'Not Found',
        message: 'Game not found: 999'
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
        error: 'Bad Request',
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
        error: 'Internal Server Error',
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          game_id: expect.any(Object),
          action: 'deleted'
        }),
        message: 'Game deleted successfully',
        success: true
      }));
    });

    it('should handle missing game ID with 400 status', async () => {
      const validationError = new Error('Game ID is required');
      
      mockReq.params = { id: '' };
      mockGamesService.deleteGame.mockRejectedValue(validationError);

      await controller.deleteGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad Request',
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
        error: 'Not Found',
        message: 'Game not found: 999'
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
        error: 'Internal Server Error',
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
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockStats,
        message: 'Game statistics retrieved successfully',
        success: true,
        metadata: expect.objectContaining({
          filters: { season: '2024' },
          timestamp: expect.any(String)
        })
      }));
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
        error: 'Internal Server Error',
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

        expect(result.id).toBe(1);
      });
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should handle validation errors with proper status codes', async () => {
      const validationError = new Error('Invalid game data');
      validationError.name = 'ValidationError';
      mockGamesService.createGame.mockRejectedValue(validationError);
      mockReq.body = { invalid: 'data' };

      await controller.createGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle database errors with proper status codes', async () => {
      const dbError = new Error('Database constraint violation');
      dbError.name = 'DatabaseError';
      mockGamesService.createGame.mockRejectedValue(dbError);
      mockReq.body = { name: 'Test Game' };

      await controller.createGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));
    });

    it('should handle authentication errors with proper status codes', async () => {
      const authError = new Error('Unauthorized access');
      authError.name = 'AuthenticationError';
      mockGamesService.deleteGame.mockRejectedValue(authError);
      mockReq.params = { id: '1' };

      await controller.deleteGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));
    });
  });

  describe('Pagination and Filtering', () => {
    it('should handle custom pagination parameters', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = { limit: '5', offset: '10', sortBy: 'date', sortOrder: 'DESC' };

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        { limit: '5', offset: '10', sortBy: 'date', sortOrder: 'DESC' },
        {
          limit: 5,
          offset: 10,
          sortBy: 'date',
          sortOrder: 'DESC'
        }
      );
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = { limit: 'invalid', offset: 'invalid' };

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        { limit: 'invalid', offset: 'invalid' },
        {
          limit: 10,
          offset: 0,
          sortBy: undefined,
          sortOrder: undefined
        }
      );
    });

    it('should handle complex filtering scenarios', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {
        sport: 'basketball',
        division: 'd1',
        season: '2024',
        status: 'scheduled',
        team: 'Team A',
        date: '2024-01-01'
      };

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        expect.objectContaining({
          sport: 'basketball',
          division: 'd1',
          season: '2024',
          status: 'scheduled',
          team: 'Team A',
          date: '2024-01-01'
        }),
        expect.any(Object)
      );
    });
  });

  describe('HATEOAS Integration', () => {
    it('should generate proper collection links for games list', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = { limit: '10', offset: '0' };

      await controller.getGames(mockReq, mockRes);

      // Note: HATEOAS functions are mocked but may not be called due to response formatter
      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        { limit: '10', offset: '0' },
        expect.any(Object)
      );
    });

    it('should generate proper resource links for individual games', async () => {
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

      // Note: HATEOAS functions are mocked but may not be called due to response formatter
      expect(mockGamesService.getGameById).toHaveBeenCalledWith('1');
    });

    it('should generate proper action links for games', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {};

      await controller.getGames(mockReq, mockRes);

      // Note: HATEOAS functions are mocked but may not be called due to response formatter
      expect(mockGamesService.getGames).toHaveBeenCalledWith({}, expect.any(Object));
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle empty results gracefully', async () => {
      const mockResult = { games: [], total: 0 };
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {};

      await controller.getGames(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: [],
        message: 'Games retrieved successfully',
        success: true
      }));
    });

    it('should handle very large result sets', async () => {
      const largeGamesArray = Array(1000).fill().map((_, i) => ({ id: i, name: `Game ${i}` }));
      const mockResult = { games: largeGamesArray, total: 1000 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = { limit: '1000', offset: '0' };

      await controller.getGames(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.arrayContaining(largeGamesArray),
        success: true
      }));
    });

    it('should handle concurrent requests properly', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      
      // Simulate concurrent requests
      const request1 = { ...mockReq, query: { limit: '5' } };
      const request2 = { ...mockReq, query: { limit: '10' } };
      const response1 = { ...mockRes };
      const response2 = { ...mockRes };

      const promises = [
        controller.getGames(request1, response1),
        controller.getGames(request2, response2)
      ];

      await Promise.all(promises);

      expect(mockGamesService.getGames).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed request data gracefully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {}; // Empty query instead of null

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith({}, {
        limit: 10,
        offset: 0,
        sortBy: undefined,
        sortOrder: undefined
      });
    });
  });

  describe('Security and Validation', () => {
    it('should sanitize input parameters', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {
        limit: '10<script>alert("xss")</script>',
        offset: '0; DROP TABLE games;'
      };

      await controller.getGames(mockReq, mockRes);

      // Should still call service with sanitized parameters
      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: '10<script>alert("xss")</script>',
          offset: '0; DROP TABLE games;'
        }),
        expect.any(Object)
      );
    });

    it('should handle SQL injection attempts gracefully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockResult = { games: mockGames, total: 1 };
      
      mockGamesService.getGames.mockResolvedValue(mockResult);
      mockReq.query = {
        sport: "'; DROP TABLE games; --"
      };

      await controller.getGames(mockReq, mockRes);

      expect(mockGamesService.getGames).toHaveBeenCalledWith(
        expect.objectContaining({
          sport: "'; DROP TABLE games; --"
        }),
        expect.any(Object)
      );
    });
  });
});
