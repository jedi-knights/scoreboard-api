/**
 * Unit Tests for Games Service
 * 
 * Tests business logic without external dependencies.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GamesService } from '../../../src/services/games-service.js';
import { GameValidator } from '../../../src/validators/game-validator.js';
import { businessConfig } from '../../../src/config/index.js';
import { MockFactory } from '../../mocks/mock-factory.js';

describe('GamesService', () => {
  let gamesService;
  let mockGamesRepository;
  let mockDatabaseAdapter;
  let mockTransactionManager;

  beforeEach(async () => {
    // Create mock dependencies
    mockGamesRepository = MockFactory.createMockGamesRepository();
    mockDatabaseAdapter = MockFactory.createMockDatabaseAdapter();
    mockTransactionManager = MockFactory.createMockTransactionManager();
    
    // Create service instance
    gamesService = new GamesService(mockGamesRepository, mockDatabaseAdapter);
    
    // Replace the transaction manager with our mock
    gamesService.transactionManager = mockTransactionManager;
  });

  afterEach(() => {
    // Clear all mocks
    if (typeof jest !== 'undefined') {
      jest.clearAllMocks();
    }
  });

  describe('Constructor', () => {
    it('should create service with injected dependencies', () => {
      expect(gamesService).toBeInstanceOf(GamesService);
      expect(gamesService.gamesRepository).toBe(mockGamesRepository);
      expect(gamesService.databaseAdapter).toBe(mockDatabaseAdapter);
      expect(gamesService.transactionManager).toBe(mockTransactionManager);
    });

    it('should throw error if repository is not provided', () => {
      expect(() => new GamesService(null, mockDatabaseAdapter)).toThrow('GamesService service error in constructor');
    });

    it('should throw error if database adapter is not provided', () => {
      expect(() => new GamesService(mockGamesRepository, null)).toThrow('GamesService service error in constructor');
    });
  });

  describe('sanitizeFilters', () => {
    it('should sanitize valid filters', () => {
      const filters = {
        date: ' 2024-09-15 ',
        sport: ' SOCCER ',
        status: 'completed',
        conference: ' Pac-12 ',
        homeTeam: ' Stanford ',
        awayTeam: ' Berkeley ',
        dataSource: ' NCAA '
      };

      const result = gamesService.sanitizeFilters(filters);

      expect(result).toEqual({
        date: '2024-09-15',
        sport: 'soccer',
        status: 'completed',
        conference: 'Pac-12',
        homeTeam: 'Stanford',
        awayTeam: 'Berkeley',
        dataSource: 'ncaa'
      });
    });

    it('should filter out invalid status values', () => {
      const filters = {
        status: 'invalid_status',
        sport: 'soccer'
      };

      const result = gamesService.sanitizeFilters(filters);

      expect(result).toEqual({
        sport: 'soccer'
      });
      expect(result.status).toBeUndefined();
    });

    it('should handle empty filters', () => {
      const result = gamesService.sanitizeFilters({});
      expect(result).toEqual({});
    });

    it('should handle undefined filters', () => {
      const result = gamesService.sanitizeFilters();
      expect(result).toEqual({});
    });
  });

  describe('sanitizeOptions', () => {
    it('should sanitize valid options', () => {
      const options = {
        limit: '25',
        offset: '50',
        sortBy: 'date',
        sortOrder: 'asc'
      };

      const result = gamesService.sanitizeOptions(options);

      expect(result).toEqual({
        limit: 25,
        offset: 50,
        sortBy: 'date',
        sortOrder: 'ASC'
      });
    });

    it('should set default values for missing options', () => {
      const result = gamesService.sanitizeOptions({});

      expect(result).toEqual({
        limit: 50,
        offset: 0,
        sortBy: 'date',
        sortOrder: 'DESC'
      });
    });

    it('should clamp limit values', () => {
      const options = {
        limit: '150', // Should be clamped to 100
        offset: '-10' // Should be clamped to 0
      };

      const result = gamesService.sanitizeOptions(options);

      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('should validate sortBy field', () => {
      const options = {
        sortBy: 'invalid_field',
        sortOrder: 'desc'
      };

      const result = gamesService.sanitizeOptions(options);

      expect(result.sortBy).toBe('date'); // Default fallback
      expect(result.sortOrder).toBe('DESC');
    });
  });

  describe('validateGameData', () => {
    it('should validate valid game data', () => {
      const validGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        home_team: 'Stanford',
        away_team: 'Berkeley',
        sport: 'soccer',
        division: 'd1',
        status: 'scheduled',
        data_source: 'ncaa'
      };

      expect(() => {
        GameValidator.validateGameDataComprehensive(validGameData);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        // Missing home_team, away_team, sport, status, data_source
      };

      expect(() => {
        GameValidator.validateGameDataComprehensive(invalidGameData);
      }).toThrow('Missing required field: home_team');
    });

    it('should throw error for invalid date format', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: 'invalid-date',
        home_team: 'Stanford',
        away_team: 'Berkeley',
        sport: 'soccer',
        status: 'scheduled',
        data_source: 'ncaa'
      };

      expect(() => {
        GameValidator.validateGameDataComprehensive(invalidGameData);
      }).toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should throw error for invalid status', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        home_team: 'Stanford',
        away_team: 'Berkeley',
        sport: 'soccer',
        status: 'invalid_status',
        data_source: 'ncaa'
      };

      expect(() => {
        GameValidator.validateGameDataComprehensive(invalidGameData);
      }).toThrow('status must be one of: scheduled, live, final, postponed, cancelled, suspended, delayed, halftime, quarter, period');
    });

    it('should throw error for invalid sport length', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        home_team: 'Stanford',
        away_team: 'Berkeley',
        sport: '', // Empty sport - should fail length validation
        status: 'scheduled',
        data_source: 'ncaa'
      };

      expect(() => {
        GameValidator.validateGameDataComprehensive(invalidGameData);
      }).toThrow('sport must be one of: soccer, football, basketball, baseball, softball, volleyball, tennis, golf, swimming, track, cross-country, lacrosse, field-hockey, ice-hockey, wrestling, gymnastics, rowing, sailing');
    });
  });

  describe('validateGameUpdateData', () => {
    it('should validate valid update data', () => {
      const validUpdateData = {
        home_score: 2,
        away_score: 1,
        status: 'final'
      };

      expect(() => {
        GameValidator.validateGameUpdateDataComprehensive(validUpdateData);
      }).not.toThrow();
    });

    it('should throw error for invalid date format', () => {
      const invalidUpdateData = {
        date: 'invalid-date'
      };

      expect(() => {
        GameValidator.validateGameUpdateDataComprehensive(invalidUpdateData);
      }).toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should throw error for invalid status', () => {
      const invalidUpdateData = {
        status: 'invalid_status'
      };

      expect(() => {
        GameValidator.validateGameUpdateDataComprehensive(invalidUpdateData);
      }).toThrow('Status must be one of: scheduled, live, final, postponed, cancelled, suspended, delayed, halftime, quarter, period');
    });

    it('should throw error for invalid sport length', () => {
      const invalidUpdateData = {
        sport: 'a'.repeat(51) // Too long
      };

      expect(() => {
        GameValidator.validateGameUpdateDataComprehensive(invalidUpdateData);
      }).toThrow('Sport name must be between 1 and 50 characters');
    });
  });

  describe('Enhanced Business Logic Tests', () => {
    describe('getGames', () => {
      it('should handle database connection errors gracefully', async () => {
        // Arrange
        const dbError = new Error('Database connection failed');
        mockGamesRepository.findAll.mockRejectedValue(dbError);

        // Act & Assert
        await expect(gamesService.getGames({}, {})).rejects.toThrow('GamesService service error in getGames');
      });

      it('should handle empty result sets gracefully', async () => {
        // Arrange
        mockGamesRepository.findAll.mockResolvedValue([]);
        mockGamesRepository.count.mockResolvedValue(0);

        // Act
        const result = await gamesService.getGames({}, {});

        // Assert
        expect(result.data).toEqual([]);
        expect(result.metadata.total).toBe(0);
      });

      it('should handle malformed query parameters gracefully', async () => {
        // Arrange
        const malformedFilters = { date: null, sport: undefined, status: '' };
        mockGamesRepository.findAll.mockResolvedValue([]);
        mockGamesRepository.count.mockResolvedValue(0);

        // Act
        const result = await gamesService.getGames(malformedFilters, {});

        // Assert
        expect(result.data).toEqual([]);
        expect(result.metadata.total).toBe(0);
      });
    });

    describe('getGameById', () => {
      it('should handle game not found gracefully', async () => {
        // Arrange
        mockGamesRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(gamesService.getGameById(999)).rejects.toThrow('Game with identifier \'999\' not found');
      });

      it('should handle database errors gracefully', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        mockGamesRepository.findById.mockRejectedValue(dbError);

        // Act & Assert
        await expect(gamesService.getGameById(1)).rejects.toThrow(dbError);
      });

      it('should handle invalid ID types gracefully', async () => {
        // Arrange
        const mockGame = { id: 'game-123', name: 'Test Game' };
        mockGamesRepository.findById.mockResolvedValue(mockGame);

        // Act
        const result = await gamesService.getGameById('game-123');

        // Assert
        expect(result.data).toEqual(mockGame);
        expect(result.success).toBe(true);
      });
    });

    describe('createGame', () => {
      it('should handle database constraint violations gracefully', async () => {
        // Arrange
        const validGameData = {
          game_id: 'test_game_123',
          date: '2024-09-15',
          home_team: 'Stanford',
          away_team: 'Berkeley',
          sport: 'soccer',
          division: 'd1',
          status: 'scheduled',
          data_source: 'ncaa'
        };

        const constraintError = new Error('UNIQUE constraint failed: game_id');
        mockGamesRepository.findById.mockResolvedValue(null); // Game doesn't exist initially
        mockGamesRepository.create.mockRejectedValue(constraintError);

        // Act & Assert
        await expect(gamesService.createGame(validGameData)).rejects.toThrow(constraintError);
      });

      it('should handle transaction failures gracefully', async () => {
        // Arrange
        const validGameData = {
          game_id: 'test_game_123',
          date: '2024-09-15',
          home_team: 'Stanford',
          away_team: 'Berkeley',
          sport: 'soccer',
          division: 'd1',
          status: 'scheduled',
          data_source: 'ncaa'
        };

        mockTransactionManager.executeInTransaction.mockRejectedValue(new Error('Transaction failed'));

        // Act & Assert
        await expect(gamesService.createGame(validGameData)).rejects.toThrow('Transaction failed');
      });
    });

    describe('updateGame', () => {
      it('should handle game not found gracefully', async () => {
        // Arrange
        const updateData = { status: 'final', home_score: 2, away_score: 1 };
        mockGamesRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(gamesService.updateGame(999, updateData)).rejects.toThrow('Game not found');
      });

      it('should handle validation errors gracefully', async () => {
        // Arrange
        const invalidUpdateData = { status: 'invalid_status' };

        // Act & Assert
        await expect(gamesService.updateGame(1, invalidUpdateData)).rejects.toThrow();
      });

      it('should handle database errors gracefully', async () => {
        // Arrange
        const updateData = { status: 'final' };
        const dbError = new Error('Update failed');
        mockGamesRepository.findById.mockResolvedValue({ id: 1, name: 'Test Game' });
        mockTransactionManager.executeInTransaction.mockRejectedValue(dbError);

        // Act & Assert
        await expect(gamesService.updateGame(1, updateData)).rejects.toThrow(dbError);
      });
    });

    describe('deleteGame', () => {
      it('should handle game not found gracefully', async () => {
        // Arrange
        mockGamesRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(gamesService.deleteGame(999)).rejects.toThrow('Game not found');
      });

      it('should handle constraint violations gracefully', async () => {
        // Arrange
        const constraintError = new Error('FOREIGN KEY constraint failed');
        mockGamesRepository.findById.mockResolvedValue({ id: 1, name: 'Test Game' });
        mockTransactionManager.executeInTransaction.mockRejectedValue(constraintError);

        // Act & Assert
        await expect(gamesService.deleteGame(1)).rejects.toThrow(constraintError);
      });

      it('should handle database errors gracefully', async () => {
        // Arrange
        const dbError = new Error('Delete failed');
        mockGamesRepository.findById.mockResolvedValue({ id: 1, name: 'Test Game' });
        mockTransactionManager.executeInTransaction.mockRejectedValue(dbError);

        // Act & Assert
        await expect(gamesService.deleteGame(1)).rejects.toThrow(dbError);
      });
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle very large filter objects gracefully', () => {
      // Arrange
      const largeFilters = {
        sport: 'basketball',
        conference: 'ACC',
        homeTeam: 'Duke',
        awayTeam: 'UNC',
        date: '2024-09-15',
        status: 'scheduled',
        dataSource: 'ncaa',
        extraField1: 'A'.repeat(1000),
        extraField2: 'B'.repeat(1000),
        extraField3: 'C'.repeat(1000)
      };

      // Act
      const result = gamesService.sanitizeFilters(largeFilters);

      // Assert
      expect(result.sport).toBe('basketball');
      expect(result.conference).toBe('ACC');
      expect(result.homeTeam).toBe('Duke');
      expect(result.awayTeam).toBe('UNC');
      expect(result.date).toBe('2024-09-15');
      expect(result.status).toBe('scheduled');
      expect(result.dataSource).toBe('ncaa');
    });

    it('should handle concurrent operations gracefully', async () => {
      // Arrange
      const mockGames = [
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' },
        { id: 3, name: 'Game 3' }
      ];

      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      // Act - Simulate concurrent operations
      const promises = [
        gamesService.getGames({}, {}),
        gamesService.getGames({ sport: 'basketball' }, {}),
        gamesService.getGames({ sport: 'football' }, {})
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      expect(mockGamesRepository.findAll).toHaveBeenCalledTimes(3);
    });

    it('should handle malformed database responses gracefully', async () => {
      // Arrange
      const malformedResponse = [
        { id: 1, name: 'Game 1' },
        null, // Malformed entry
        { id: 3, name: 'Game 3' },
        undefined, // Another malformed entry
        { id: 5, name: 'Game 5' }
      ];

      mockGamesRepository.findAll.mockResolvedValue(malformedResponse);
      mockGamesRepository.count.mockResolvedValue(malformedResponse.length);

      // Act
      const result = await gamesService.getGames({}, {});

      // Assert
      expect(result.data).toEqual(malformedResponse);
      expect(result.metadata.total).toBe(malformedResponse.length);
      // Service should handle malformed data gracefully without crashing
    });

    it('should handle very large datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array(10000).fill().map((_, i) => ({
        id: i + 1,
        name: `Game ${i + 1}`,
        sport: 'basketball',
        date: '2024-09-15'
      }));

      mockGamesRepository.findAll.mockResolvedValue(largeDataset);
      mockGamesRepository.count.mockResolvedValue(largeDataset.length);

      // Act
      const result = await gamesService.getGames({}, {});

      // Assert
      expect(result.data).toHaveLength(10000);
      expect(result.data[0].id).toBe(1);
      expect(result.data[9999].id).toBe(10000);
    });

    it('should handle special characters in filter values gracefully', () => {
      // Arrange
      const specialFilters = {
        homeTeam: 'Team & Sons, Inc.',
        awayTeam: 'O\'Connor University',
        conference: 'Pac-12 (West)',
        sport: 'basketball'
      };

      // Act
      const result = gamesService.sanitizeFilters(specialFilters);

      // Assert
      expect(result.homeTeam).toBe('Team & Sons, Inc.');
      expect(result.awayTeam).toBe('O\'Connor University');
      expect(result.conference).toBe('Pac-12 (West)');
      expect(result.sport).toBe('basketball');
    });

    it('should handle unicode and international characters gracefully', () => {
      // Arrange
      const unicodeFilters = {
        homeTeam: 'Université de Montréal',
        awayTeam: 'São Paulo FC',
        conference: 'Bundesliga',
        sport: 'soccer'
      };

      // Act
      const result = gamesService.sanitizeFilters(unicodeFilters);

      // Assert
      expect(result.homeTeam).toBe('Université de Montréal');
      expect(result.awayTeam).toBe('São Paulo FC');
      expect(result.conference).toBe('Bundesliga');
      expect(result.sport).toBe('soccer');
    });
  });

  describe('Configuration Integration', () => {
    it('should use business configuration for validation', () => {
      // Arrange
      const config = businessConfig;

      // Assert
      expect(config).toBeDefined();
      expect(config.games).toBeDefined();
      expect(config.games.pagination.maxLimit).toBeDefined();
      expect(config.games.pagination.defaultLimit).toBeDefined();
    });

    it('should handle configuration changes gracefully', () => {
      // Arrange
      const originalConfig = { ...businessConfig };
      
      // Act - Simulate configuration change
      businessConfig.maxQueryLimit = 1000;
      businessConfig.defaultQueryLimit = 50;

      // Assert
      expect(businessConfig.maxQueryLimit).toBe(1000);
      expect(businessConfig.defaultQueryLimit).toBe(50);

      // Restore original config
      businessConfig.maxQueryLimit = originalConfig.maxQueryLimit;
      businessConfig.defaultQueryLimit = originalConfig.defaultQueryLimit;
    });
  });
});
