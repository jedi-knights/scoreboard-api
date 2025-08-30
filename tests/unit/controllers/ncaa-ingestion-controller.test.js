/**
 * NCAA Ingestion Controller Tests
 * 
 * Tests for the NCAAIngestionController class covering all endpoints,
 * error handling, and edge cases.
 */

import { jest } from '@jest/globals';
import { NCAAIngestionController } from '../../../src/controllers/ncaa-ingestion-controller.js';
import { MockFactory } from '../../mocks/mock-factory.js';
import { NCAAGameBuilder } from '../../builders/ncaa-game-builder.js';

describe('NCAAIngestionController', () => {
  let controller;
  let mockNCAAIngestionService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Create mock service
    mockNCAAIngestionService = MockFactory.createMockNCAAIngestionService();
    
    // Create controller instance
    controller = new NCAAIngestionController(mockNCAAIngestionService);
    
    // Create mock request/response objects
    mockRequest = MockFactory.createMockRequest();
    mockResponse = MockFactory.createMockResponse();
    mockNext = MockFactory.createMockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create controller with injected service', () => {
      expect(controller).toBeInstanceOf(NCAAIngestionController);
      expect(controller.ncaaIngestionService).toBe(mockNCAAIngestionService);
    });

    it('should create controller with undefined service (handles gracefully)', () => {
      const controllerWithoutService = new NCAAIngestionController(undefined);
      expect(controllerWithoutService).toBeInstanceOf(NCAAIngestionController);
      expect(controllerWithoutService.ncaaIngestionService).toBeUndefined();
    });
  });

  describe('ingestGame', () => {
    const validGameData = NCAAGameBuilder.buildValidGame();

    it('should successfully ingest a valid game', async () => {
      // Arrange
      const mockResult = {
        success: true,
        game_id: 'game-123',
        action: 'created',
        entities_created: { teams: 2, conferences: 1 },
        message: 'Game successfully ingested'
      };
      
      mockNCAAIngestionService.ingestGame.mockResolvedValue(mockResult);
      mockRequest.body = validGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).toHaveBeenCalledWith(validGameData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Game successfully ingested'
      }));
    });

    it('should handle existing game (idempotency)', async () => {
      // Arrange
      const mockResult = {
        success: true,
        game_id: 'game-123',
        action: 'skipped',
        reason: 'Game already exists',
        message: 'Game was already ingested previously'
      };
      
      mockNCAAIngestionService.ingestGame.mockResolvedValue(mockResult);
      mockRequest.body = validGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          action: 'skipped',
          reason: 'Game already exists'
        })
      }));
    });

    it('should handle ingestion failure', async () => {
      // Arrange
      const mockResult = {
        success: false,
        error: 'Validation failed',
        action: 'failed',
        message: 'Failed to ingest game'
      };
      
      mockNCAAIngestionService.ingestGame.mockResolvedValue(mockResult);
      mockRequest.body = validGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Ingestion Failed'
      }));
    });

    it('should handle missing request body', async () => {
      // Arrange
      mockRequest.body = null;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle undefined request body', async () => {
      // Arrange
      mockRequest.body = undefined;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockNCAAIngestionService.ingestGame.mockRejectedValue(serviceError);
      mockRequest.body = validGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));
    });

    it('should handle validation errors from service', async () => {
      // Arrange
      const validationError = new Error('Invalid sport value');
      mockNCAAIngestionService.ingestGame.mockRejectedValue(validationError);
      mockRequest.body = validGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));
    });
  });

  describe('ingestGames', () => {
    const validGamesData = [
      NCAAGameBuilder.buildValidGame(),
      NCAAGameBuilder.buildValidGame({ home_team: 'Team B', away_team: 'Team C' })
    ];

    it('should successfully ingest multiple games', async () => {
      // Arrange
      const mockResult = {
        total: 2,
        successful: 2,
        failed: 0,
        skipped: 0,
        details: ['Game 1 ingested', 'Game 2 ingested']
      };
      
      mockNCAAIngestionService.ingestGames.mockResolvedValue(mockResult);
      mockRequest.body = validGamesData;

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGames).toHaveBeenCalledWith(validGamesData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('Batch ingestion completed')
      }));
    });

    it('should handle missing request body', async () => {
      // Arrange
      mockRequest.body = null;

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGames).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle non-array request body', async () => {
      // Arrange
      mockRequest.body = 'not-an-array';

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGames).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle empty array', async () => {
      // Arrange
      mockRequest.body = [];

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGames).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle batch size exceeded', async () => {
      // Arrange
      const largeBatch = Array(150).fill().map((_, i) => 
        NCAAGameBuilder.buildValidGame({ home_team: `Team ${i}` })
      );
      mockRequest.body = largeBatch;

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGames).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockNCAAIngestionService.ingestGames.mockRejectedValue(serviceError);
      mockRequest.body = validGamesData;

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Arrange
      const mockResult = {
        total: 3,
        successful: 2,
        failed: 1,
        skipped: 0,
        details: ['Game 1 ingested', 'Game 2 failed', 'Game 3 ingested']
      };
      
      mockNCAAIngestionService.ingestGames.mockResolvedValue(mockResult);
      mockRequest.body = validGamesData;

      // Act
      await controller.ingestGames(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          summary: expect.objectContaining({
            total: 3,
            successful: 2,
            failed: 1
          })
        })
      }));
    });
  });

  describe('getHealth', () => {
    it('should return health check response', async () => {
      // Act
      await controller.getHealth(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          service: 'ncaa-ingestion',
          version: '1.0.0'
        })
      }));
    });

    it('should handle health check errors gracefully', async () => {
      // Arrange
      const healthError = new Error('Health check failed');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock the response formatter to throw an error by temporarily replacing the import
      const originalImport = await import('../../../src/utils/response-formatter.js');
      const mockFormatter = {
        formatHealthCheckResponse: jest.fn().mockImplementation(() => {
          throw healthError;
        })
      };

      // Replace the formatter in the controller's scope
      const originalFormatHealthCheckResponse = originalImport.NCAAIngestionResponseFormatter.formatHealthCheckResponse;
      originalImport.NCAAIngestionResponseFormatter.formatHealthCheckResponse = mockFormatter.formatHealthCheckResponse;

      // Act
      await controller.getHealth(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal Server Error'
      }));

      // Restore original implementation
      originalImport.NCAAIngestionResponseFormatter.formatHealthCheckResponse = originalFormatHealthCheckResponse;
    });
  });

  describe('validateGameData', () => {
    const validGameData = NCAAGameBuilder.buildValidGame();

    it('should successfully validate valid game data', async () => {
      // Arrange
      const mockGameId = 'game-123';
      mockNCAAIngestionService.validateNCAAGameData.mockImplementation(() => {});
      mockNCAAIngestionService.generateGameId.mockReturnValue(mockGameId);
      mockRequest.body = validGameData;

      // Act
      await controller.validateGameData(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.validateNCAAGameData).toHaveBeenCalledWith(validGameData);
      expect(mockNCAAIngestionService.generateGameId).toHaveBeenCalledWith(validGameData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'NCAA game data is valid'
      }));
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationError = new Error('Invalid sport value');
      mockNCAAIngestionService.validateNCAAGameData.mockImplementation(() => {
        throw validationError;
      });
      mockRequest.body = validGameData;

      // Act
      await controller.validateGameData(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Validation Failed'
      }));
    });

    it('should handle missing request body', async () => {
      // Arrange
      mockRequest.body = null;

      // Act
      await controller.validateGameData(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.validateNCAAGameData).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle undefined request body', async () => {
      // Arrange
      mockRequest.body = undefined;

      // Act
      await controller.validateGameData(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.validateNCAAGameData).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const serviceError = new Error('Service unavailable');
      mockNCAAIngestionService.validateNCAAGameData.mockImplementation(() => {});
      mockNCAAIngestionService.generateGameId.mockImplementation(() => {
        throw serviceError;
      });
      mockRequest.body = validGameData;

      // Act
      await controller.validateGameData(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Validation Failed'
      }));
    });

    it('should handle various validation error types', async () => {
      // Arrange
      const validationErrors = [
        new Error('sport must be one of: basketball, football, soccer'),
        new Error('date must match the format: YYYY-MM-DD'),
        new Error('home_team is required'),
        new Error('away_team is required')
      ];

      for (const validationError of validationErrors) {
        mockNCAAIngestionService.validateNCAAGameData.mockImplementation(() => {
          throw validationError;
        });
        mockRequest.body = validGameData;

        // Act
        await controller.validateGameData(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
          success: false,
          error: 'Validation Failed'
        }));
      }
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle very large game data objects', async () => {
      // Arrange
      const largeGameData = {
        ...NCAAGameBuilder.buildValidGame(),
        metadata: {
          description: 'A'.repeat(10000), // Very long description
          tags: Array(1000).fill().map((_, i) => `tag-${i}`),
          customFields: Object.fromEntries(
            Array(100).fill().map((_, i) => [`field${i}`, `value${i}`])
          )
        }
      };

      const mockResult = {
        success: true,
        game_id: 'game-123',
        action: 'created',
        message: 'Game successfully ingested'
      };
      
      mockNCAAIngestionService.ingestGame.mockResolvedValue(mockResult);
      mockRequest.body = largeGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).toHaveBeenCalledWith(largeGameData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle special characters in game data', async () => {
      // Arrange
      const specialCharGameData = {
        ...NCAAGameBuilder.buildValidGame(),
        home_team: 'Team & Sons, Inc.',
        away_team: 'O\'Connor University',
        venue: 'St. Mary\'s Arena (Main)',
        city: 'San José',
        state: 'CA'
      };

      const mockResult = {
        success: true,
        game_id: 'game-123',
        action: 'created',
        message: 'Game successfully ingested'
      };
      
      mockNCAAIngestionService.ingestGame.mockResolvedValue(mockResult);
      mockRequest.body = specialCharGameData;

      // Act
      await controller.ingestGame(mockRequest, mockResponse);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).toHaveBeenCalledWith(specialCharGameData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle concurrent requests', async () => {
      // Arrange
      const gameData1 = NCAAGameBuilder.buildValidGame({ home_team: 'Team A' });
      const gameData2 = NCAAGameBuilder.buildValidGame({ home_team: 'Team B' });
      
      const mockResult1 = {
        success: true,
        game_id: 'game-1',
        action: 'created',
        message: 'Game successfully ingested'
      };
      
      const mockResult2 = {
        success: true,
        game_id: 'game-2',
        action: 'created',
        message: 'Game successfully ingested'
      };

      mockNCAAIngestionService.ingestGame
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      // Act - Simulate concurrent requests
      const request1 = { ...mockRequest, body: gameData1 };
      const request2 = { ...mockRequest, body: gameData2 };
      const response1 = MockFactory.createMockResponse();
      const response2 = MockFactory.createMockResponse();

      const promises = [
        controller.ingestGame(request1, response1),
        controller.ingestGame(request2, response2)
      ];

      await Promise.all(promises);

      // Assert
      expect(mockNCAAIngestionService.ingestGame).toHaveBeenCalledTimes(2);
      expect(response1.status).toHaveBeenCalledWith(201);
      expect(response2.status).toHaveBeenCalledWith(201);
    });
  });
});
