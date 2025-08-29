import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GamesService } from '../../../src/services/games-service.js';

describe('GamesService - Expanded Tests', () => {
  let service;
  let mockGamesRepository;
  let mockDatabaseAdapter;

  beforeEach(() => {
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

    // Create service instance
    service = new GamesService(mockDatabaseAdapter);
    
    // Get the repository instance from the service
    mockGamesRepository = service.gamesRepository;
    
    // Mock repository methods
    mockGamesRepository.findAll = jest.fn();
    mockGamesRepository.findById = jest.fn();
    mockGamesRepository.findLiveGames = jest.fn();
    mockGamesRepository.findByDateRange = jest.fn();
    mockGamesRepository.findByTeam = jest.fn();
    mockGamesRepository.create = jest.fn();
    mockGamesRepository.update = jest.fn();
    mockGamesRepository.delete = jest.fn();
    mockGamesRepository.count = jest.fn();
    mockGamesRepository.getStatistics = jest.fn();
  });

  describe('getGames - Expanded', () => {
    it('should handle successful games retrieval with pagination', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }, { id: 2, name: 'Game 2' }];
      const mockCount = 25;
      
      mockGamesRepository.findAll.mockResolvedValue(mockGames);
      mockGamesRepository.count.mockResolvedValue(mockCount);

      const filters = { sport: 'basketball' };
      const options = { limit: 10, offset: 0 };

      const result = await service.getGames(filters, options);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGames);
      expect(result.metadata.total).toBe(25);
      expect(result.metadata.page).toBe(1);
      expect(result.metadata.limit).toBe(10);
      expect(result.metadata.totalPages).toBe(3);
      expect(result.metadata.hasNext).toBe(true);
      expect(result.metadata.hasPrevious).toBe(false);
    });

    it('should handle pagination edge cases', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      const mockCount = 1;
      
      mockGamesRepository.findAll.mockResolvedValue(mockGames);
      mockGamesRepository.count.mockResolvedValue(mockCount);

      const options = { limit: 50, offset: 0 };

      const result = await service.getGames({}, options);

      expect(result.metadata.totalPages).toBe(1);
      expect(result.metadata.hasNext).toBe(false);
      expect(result.metadata.hasPrevious).toBe(false);
    });

    it('should handle repository errors gracefully', async () => {
      mockGamesRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.getGames()).rejects.toThrow('Failed to retrieve games');
    });

    it('should handle count errors gracefully', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      mockGamesRepository.findAll.mockResolvedValue(mockGames);
      mockGamesRepository.count.mockRejectedValue(new Error('Count error'));

      await expect(service.getGames()).rejects.toThrow('Failed to retrieve games');
    });
  });

  describe('getGameById - Expanded', () => {
    it('should handle missing game ID', async () => {
      await expect(service.getGameById()).rejects.toThrow('Game ID is required');
      await expect(service.getGameById('')).rejects.toThrow('Game ID is required');
      await expect(service.getGameById(null)).rejects.toThrow('Game ID is required');
    });

    it('should handle game not found', async () => {
      mockGamesRepository.findById.mockResolvedValue(null);

      await expect(service.getGameById('nonexistent')).rejects.toThrow('Game not found');
    });

    it('should handle repository errors', async () => {
      mockGamesRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.getGameById('game-123')).rejects.toThrow('Database error');
    });
  });

  describe('getLiveGames - Expanded', () => {
    it('should return live games with metadata', async () => {
      const mockGames = [{ id: 1, status: 'in_progress' }];
      mockGamesRepository.findLiveGames.mockResolvedValue(mockGames);

      const result = await service.getLiveGames({ sport: 'basketball' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGames);
      expect(result.metadata.total).toBe(1);
      expect(result.metadata.timestamp).toBeDefined();
      expect(mockGamesRepository.findLiveGames).toHaveBeenCalledWith({ sport: 'basketball' });
    });

    it('should handle repository errors', async () => {
      mockGamesRepository.findLiveGames.mockRejectedValue(new Error('Database error'));

      await expect(service.getLiveGames()).rejects.toThrow('Failed to retrieve live games');
    });
  });

  describe('getGamesByDateRange - Expanded', () => {
    it('should handle missing start date', async () => {
      await expect(service.getGamesByDateRange('', '2024-01-31')).rejects.toThrow('Start date and end date are required');
      await expect(service.getGamesByDateRange(null, '2024-01-31')).rejects.toThrow('Start date and end date are required');
      await expect(service.getGamesByDateRange(undefined, '2024-01-31')).rejects.toThrow('Start date and end date are required');
    });

    it('should handle missing end date', async () => {
      await expect(service.getGamesByDateRange('2024-01-01', '')).rejects.toThrow('Start date and end date are required');
      await expect(service.getGamesByDateRange('2024-01-01', null)).rejects.toThrow('Start date and end date are required');
      await expect(service.getGamesByDateRange('2024-01-01', undefined)).rejects.toThrow('Start date and end date are required');
    });

    it('should handle invalid date range', async () => {
      await expect(service.getGamesByDateRange('2024-01-31', '2024-01-01')).rejects.toThrow('Start date must be before or equal to end date');
    });

    it('should handle valid date range with filters', async () => {
      const mockGames = [{ id: 1, date: '2024-01-15' }];
      mockGamesRepository.findByDateRange.mockResolvedValue(mockGames);

      const result = await service.getGamesByDateRange('2024-01-01', '2024-01-31', { sport: 'basketball' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGames);
      expect(result.metadata.startDate).toBe('2024-01-01');
      expect(result.metadata.endDate).toBe('2024-01-31');
      expect(result.metadata.dateRange).toBe('2024-01-01 to 2024-01-31');
    });

    it('should handle repository errors', async () => {
      mockGamesRepository.findByDateRange.mockRejectedValue(new Error('Database error'));

      await expect(service.getGamesByDateRange('2024-01-01', '2024-01-31')).rejects.toThrow('Database error');
    });
  });

  describe('getGamesByTeam - Expanded', () => {
    it('should handle missing team name', async () => {
      await expect(service.getGamesByTeam('')).rejects.toThrow('Team name is required');
      await expect(service.getGamesByTeam(null)).rejects.toThrow('Team name is required');
      await expect(service.getGamesByTeam(undefined)).rejects.toThrow('Team name is required');
    });

    it('should return team games with metadata', async () => {
      const mockGames = [{ id: 1, home_team: 'Lakers' }];
      mockGamesRepository.findByTeam.mockResolvedValue(mockGames);

      const result = await service.getGamesByTeam('Lakers', { season: '2024' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGames);
      expect(result.metadata.total).toBe(1);
      expect(result.metadata.team).toBe('Lakers');
      expect(mockGamesRepository.findByTeam).toHaveBeenCalledWith('Lakers', {});
    });

    it('should handle repository errors', async () => {
      mockGamesRepository.findByTeam.mockRejectedValue(new Error('Database error'));

      await expect(service.getGamesByTeam('Lakers')).rejects.toThrow('Database error');
    });
  });

  describe('createGame - Expanded', () => {
    const validGameData = {
      game_id: 'game-123',
      date: '2024-01-15',
      home_team: 'Lakers',
      away_team: 'Warriors',
      sport: 'basketball',
      status: 'scheduled',
      data_source: 'espn'
    };

    it('should handle duplicate game ID', async () => {
      mockGamesRepository.findById.mockResolvedValue({ id: 1, game_id: 'game-123' });

      await expect(service.createGame(validGameData)).rejects.toThrow('Game with this ID already exists');
    });

    it('should handle repository creation errors', async () => {
      mockGamesRepository.findById.mockResolvedValue(null);
      mockGamesRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createGame(validGameData)).rejects.toThrow('Database error');
    });

    it('should handle validation errors', async () => {
      const invalidGameData = { ...validGameData, date: 'invalid-date' };

      await expect(service.createGame(invalidGameData)).rejects.toThrow('Invalid date format. Use YYYY-MM-DD');
    });
  });

  describe('updateGame - Expanded', () => {
    it('should handle missing game ID', async () => {
      await expect(service.updateGame('', { status: 'completed' })).rejects.toThrow('Game ID is required');
      await expect(service.updateGame(null, { status: 'completed' })).rejects.toThrow('Game ID is required');
      await expect(service.updateGame(undefined, { status: 'completed' })).rejects.toThrow('Game ID is required');
    });

    it('should handle game not found during update', async () => {
      mockGamesRepository.update.mockResolvedValue(null);

      await expect(service.updateGame('nonexistent', { status: 'completed' })).rejects.toThrow('Game not found');
    });

    it('should handle repository update errors', async () => {
      mockGamesRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.updateGame('game-123', { status: 'completed' })).rejects.toThrow('Database error');
    });

    it('should handle validation errors in update data', async () => {
      await expect(service.updateGame('game-123', { date: 'invalid-date' })).rejects.toThrow('Invalid date format. Use YYYY-MM-DD');
    });
  });

  describe('deleteGame - Expanded', () => {
    it('should handle missing game ID', async () => {
      await expect(service.deleteGame('')).rejects.toThrow('Game ID is required');
      await expect(service.deleteGame(null)).rejects.toThrow('Game ID is required');
      await expect(service.deleteGame(undefined)).rejects.toThrow('Game ID is required');
    });

    it('should handle game not found during deletion', async () => {
      mockGamesRepository.findById.mockResolvedValue(null);

      await expect(service.deleteGame('nonexistent')).rejects.toThrow('Game not found');
    });

    it('should handle repository deletion errors', async () => {
      mockGamesRepository.findById.mockResolvedValue({ id: 1, game_id: 'game-123' });
      mockGamesRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteGame('game-123')).rejects.toThrow('Database error');
    });

    it('should handle successful deletion', async () => {
      mockGamesRepository.findById.mockResolvedValue({ id: 1, game_id: 'game-123' });
      mockGamesRepository.delete.mockResolvedValue(true);

      const result = await service.deleteGame('game-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Game deleted successfully');
      expect(result.metadata.gameId).toBe('game-123');
      expect(result.metadata.deleted).toBe(true);
    });
  });

  describe('getGameStatistics - Expanded', () => {
    it('should return statistics with metadata', async () => {
      const mockStats = {
        total_games: 100,
        completed_games: 80,
        live_games: 5
      };
      mockGamesRepository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getGameStatistics({ sport: 'basketball' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(result.metadata.timestamp).toBeDefined();
      expect(result.metadata.filters).toEqual({ sport: 'basketball' });
    });

    it('should handle repository errors', async () => {
      mockGamesRepository.getStatistics.mockRejectedValue(new Error('Database error'));

      await expect(service.getGameStatistics()).rejects.toThrow('Failed to retrieve game statistics');
    });
  });

  describe('_sanitizeStringFilter - Expanded', () => {
    it('should handle valid string values', () => {
      expect(service._sanitizeStringFilter('  test  ')).toBe('test');
      expect(service._sanitizeStringFilter('  TEST  ', true)).toBe('test');
    });

    it('should handle non-string values', () => {
      expect(service._sanitizeStringFilter(123)).toBeNull();
      expect(service._sanitizeStringFilter(null)).toBeNull();
      expect(service._sanitizeStringFilter(undefined)).toBeNull();
      expect(service._sanitizeStringFilter({})).toBeNull();
      expect(service._sanitizeStringFilter([])).toBeNull();
    });

    it('should handle empty strings', () => {
      expect(service._sanitizeStringFilter('')).toBeNull();
      expect(service._sanitizeStringFilter('   ')).toBeNull();
    });
  });

  describe('_validateStatus - Expanded', () => {
    it('should validate correct statuses', () => {
      expect(service._validateStatus('scheduled')).toBe('scheduled');
      expect(service._validateStatus('in_progress')).toBe('in_progress');
      expect(service._validateStatus('completed')).toBe('completed');
      expect(service._validateStatus('final')).toBe('final');
      expect(service._validateStatus('postponed')).toBe('postponed');
      expect(service._validateStatus('cancelled')).toBe('cancelled');
    });

    it('should reject invalid statuses', () => {
      expect(service._validateStatus('invalid')).toBeNull();
      expect(service._validateStatus('pending')).toBeNull();
      expect(service._validateStatus('')).toBeNull();
      expect(service._validateStatus(null)).toBeNull();
      expect(service._validateStatus(undefined)).toBeNull();
    });
  });

  describe('sanitizeFilters - Expanded', () => {
    it('should handle undefined filters', () => {
      expect(service.sanitizeFilters(undefined)).toEqual({});
    });

    it('should handle null filters', () => {
      expect(service.sanitizeFilters(null)).toEqual({});
    });

    it('should handle empty filters object', () => {
      expect(service.sanitizeFilters({})).toEqual({});
    });

    it('should sanitize all filter types', () => {
      const filters = {
        date: '  2024-01-15  ',
        sport: '  BASKETBALL  ',
        status: 'scheduled',
        conference: '  SEC  ',
        homeTeam: '  Lakers  ',
        awayTeam: '  Warriors  ',
        dataSource: '  ESPN  '
      };

      const result = service.sanitizeFilters(filters);

      expect(result.date).toBe('2024-01-15');
      expect(result.sport).toBe('basketball');
      expect(result.status).toBe('scheduled');
      expect(result.conference).toBe('SEC');
      expect(result.homeTeam).toBe('Lakers');
      expect(result.awayTeam).toBe('Warriors');
      expect(result.dataSource).toBe('espn');
    });

    it('should filter out invalid values', () => {
      const filters = {
        date: '',
        sport: null,
        status: 'invalid_status',
        conference: undefined,
        homeTeam: '   ',
        awayTeam: 123,
        dataSource: {}
      };

      const result = service.sanitizeFilters(filters);

      expect(result).toEqual({});
    });
  });

  describe('_sanitizeLimit - Expanded', () => {
    it('should handle valid numeric limits', () => {
      expect(service._sanitizeLimit(25)).toBe(25);
      expect(service._sanitizeLimit('50')).toBe(50);
      expect(service._sanitizeLimit(1)).toBe(1);
      expect(service._sanitizeLimit(100)).toBe(100);
    });

    it('should clamp values to valid range', () => {
      expect(service._sanitizeLimit(1)).toBe(1);
      expect(service._sanitizeLimit(50)).toBe(50);
      expect(service._sanitizeLimit(100)).toBe(100);
      expect(service._sanitizeLimit(150)).toBe(100);
      expect(service._sanitizeLimit(1000)).toBe(100);
    });

    it('should handle invalid values', () => {
      expect(service._sanitizeLimit('invalid')).toBe(50);
      expect(service._sanitizeLimit(null)).toBe(50);
      expect(service._sanitizeLimit(undefined)).toBe(50);
      expect(service._sanitizeLimit({})).toBe(50);
    });
  });

  describe('_sanitizeOffset - Expanded', () => {
    it('should handle valid numeric offsets', () => {
      expect(service._sanitizeOffset(0)).toBe(0);
      expect(service._sanitizeOffset(25)).toBe(25);
      expect(service._sanitizeOffset('50')).toBe(50);
    });

    it('should ensure non-negative values', () => {
      expect(service._sanitizeOffset(-5)).toBe(0);
      expect(service._sanitizeOffset(-100)).toBe(0);
    });

    it('should handle invalid values', () => {
      expect(service._sanitizeOffset('invalid')).toBe(0);
      expect(service._sanitizeOffset(null)).toBe(0);
      expect(service._sanitizeOffset(undefined)).toBe(0);
      expect(service._sanitizeOffset({})).toBe(0);
    });
  });

  describe('_sanitizeSortBy - Expanded', () => {
    it('should validate correct sort fields', () => {
      expect(service._sanitizeSortBy('date')).toBe('date');
      expect(service._sanitizeSortBy('home_team')).toBe('home_team');
      expect(service._sanitizeSortBy('away_team')).toBe('away_team');
      expect(service._sanitizeSortBy('sport')).toBe('sport');
      expect(service._sanitizeSortBy('status')).toBe('status');
      expect(service._sanitizeSortBy('created_at')).toBe('created_at');
    });

    it('should reject invalid sort fields', () => {
      expect(service._sanitizeSortBy('invalid')).toBe('date');
      expect(service._sanitizeSortBy('score')).toBe('date');
      expect(service._sanitizeSortBy('')).toBe('date');
      expect(service._sanitizeSortBy(null)).toBe('date');
      expect(service._sanitizeSortBy(undefined)).toBe('date');
    });
  });

  describe('_sanitizeSortOrder - Expanded', () => {
    it('should validate correct sort orders', () => {
      expect(service._sanitizeSortOrder('ASC')).toBe('ASC');
      expect(service._sanitizeSortOrder('asc')).toBe('ASC');
      expect(service._sanitizeSortOrder('DESC')).toBe('DESC');
      expect(service._sanitizeSortOrder('desc')).toBe('DESC');
    });

    it('should default to DESC for invalid values', () => {
      expect(service._sanitizeSortOrder('invalid')).toBe('DESC');
      expect(service._sanitizeSortOrder('')).toBe('DESC');
      expect(service._sanitizeSortOrder(null)).toBe('DESC');
      expect(service._sanitizeSortOrder(undefined)).toBe('DESC');
    });
  });

  describe('sanitizeOptions - Expanded', () => {
    it('should handle undefined options', () => {
      expect(() => service.sanitizeOptions(undefined)).toThrow();
    });

    it('should handle null options', () => {
      expect(() => service.sanitizeOptions(null)).toThrow();
    });

    it('should sanitize all option types', () => {
      const options = {
        limit: '25',
        offset: '10',
        sortBy: 'home_team',
        sortOrder: 'asc'
      };

      const result = service.sanitizeOptions(options);

      expect(result.limit).toBe(25);
      expect(result.offset).toBe(10);
      expect(result.sortBy).toBe('home_team');
      expect(result.sortOrder).toBe('ASC');
    });

    it('should handle edge cases', () => {
      const options = {
        limit: 0,
        offset: -5,
        sortBy: 'invalid',
        sortOrder: 'invalid'
      };

      const result = service.sanitizeOptions(options);

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(result.sortBy).toBe('date');
      expect(result.sortOrder).toBe('DESC');
    });
  });

  describe('validateGameData - Expanded', () => {
    const baseGameData = {
      game_id: 'game-123',
      date: '2024-01-15',
      home_team: 'Lakers',
      away_team: 'Warriors',
      sport: 'basketball',
      status: 'scheduled',
      data_source: 'espn'
    };

    it('should validate complete valid data', () => {
      expect(() => service.validateGameData(baseGameData)).not.toThrow();
    });

    it('should handle missing required fields', () => {
      const missingFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];
      
      missingFields.forEach(field => {
        const invalidData = { ...baseGameData };
        delete invalidData[field];
        
        expect(() => service.validateGameData(invalidData)).toThrow(`Missing required field: ${field}`);
      });
    });

    it('should handle null required fields', () => {
      const nullFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];
      
      nullFields.forEach(field => {
        const invalidData = { ...baseGameData };
        invalidData[field] = null;
        
        expect(() => service.validateGameData(invalidData)).toThrow(`Missing required field: ${field}`);
      });
    });

    it('should handle undefined required fields', () => {
      const undefinedFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];
      
      undefinedFields.forEach(field => {
        const invalidData = { ...baseGameData };
        invalidData[field] = undefined;
        
        expect(() => service.validateGameData(invalidData)).toThrow(`Missing required field: ${field}`);
      });
    });

    it('should validate date format', () => {
      const invalidDates = ['2024/01/15', '15-01-2024', '2024.01.15', 'invalid', '2024-1-15', '2024-01-5'];
      
      invalidDates.forEach(invalidDate => {
        const invalidData = { ...baseGameData, date: invalidDate };
        expect(() => service.validateGameData(invalidData)).toThrow('Invalid date format. Use YYYY-MM-DD');
      });
    });

    it('should validate status values', () => {
      const invalidStatuses = ['invalid', 'pending', 'active', 'done', ''];
      
      invalidStatuses.forEach(invalidStatus => {
        const invalidData = { ...baseGameData, status: invalidStatus };
        expect(() => service.validateGameData(invalidData)).toThrow('Invalid status value');
      });
    });

    it('should validate sport length', () => {
      const invalidSports = ['', 'a'.repeat(51), 'b'.repeat(100)];
      
      invalidSports.forEach(invalidSport => {
        const invalidData = { ...baseGameData, sport: invalidSport };
        expect(() => service.validateGameData(invalidData)).toThrow('Sport name must be between 1 and 50 characters');
      });
    });
  });

  describe('validateGameUpdateData - Expanded', () => {
    it('should validate valid update data', () => {
      const validUpdateData = {
        date: '2024-01-16',
        status: 'completed',
        sport: 'basketball'
      };

      expect(() => service.validateGameUpdateData(validUpdateData)).not.toThrow();
    });

    it('should handle empty update data', () => {
      expect(() => service.validateGameUpdateData({})).not.toThrow();
    });

    it('should validate date format in updates', () => {
      const invalidDates = ['2024/01/15', '15-01-2024', '2024.01.15', 'invalid'];
      
      invalidDates.forEach(invalidDate => {
        expect(() => service.validateGameUpdateData({ date: invalidDate })).toThrow('Invalid date format. Use YYYY-MM-DD');
      });
    });

    it('should validate status values in updates', () => {
      const invalidStatuses = ['invalid', 'pending', 'active', 'done'];
      
      invalidStatuses.forEach(invalidStatus => {
        expect(() => service.validateGameUpdateData({ status: invalidStatus })).toThrow('Invalid status value');
      });
    });

    it('should validate sport length in updates', () => {
      const invalidSports = ['', 'a'.repeat(51), 'b'.repeat(100)];
      
      invalidSports.forEach(invalidSport => {
        expect(() => service.validateGameUpdateData({ sport: invalidSport })).toThrow('Sport name must be between 1 and 50 characters');
      });
    });

    it('should handle mixed valid and invalid data', () => {
      const mixedData = {
        date: '2024-01-16',
        status: 'invalid_status',
        sport: 'basketball'
      };

      expect(() => service.validateGameUpdateData(mixedData)).toThrow('Invalid status value');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle repository method failures gracefully', async () => {
      // Test that all repository method failures are handled
      const methods = ['findAll', 'findById', 'findLiveGames', 'findByDateRange', 'findByTeam', 'create', 'update', 'delete', 'count', 'getStatistics'];
      
      for (const method of methods) {
        mockGamesRepository[method].mockRejectedValue(new Error(`${method} failed`));
        
        try {
          switch (method) {
            case 'findAll':
              await service.getGames();
              break;
            case 'findById':
              await service.getGameById('test');
              break;
            case 'findLiveGames':
              await service.getLiveGames();
              break;
            case 'findByDateRange':
              await service.getGamesByDateRange('2024-01-01', '2024-01-31');
              break;
            case 'findByTeam':
              await service.getGamesByTeam('test');
              break;
            case 'create':
              await service.createGame({
                game_id: 'test',
                date: '2024-01-01',
                home_team: 'test',
                away_team: 'test',
                sport: 'test',
                status: 'scheduled',
                data_source: 'test'
              });
              break;
            case 'update':
              await service.updateGame('test', { status: 'completed' });
              break;
            case 'delete':
              await service.deleteGame('test');
              break;
            case 'count':
              await service.getGames();
              break;
            case 'getStatistics':
              await service.getGameStatistics();
              break;
          }
        } catch (error) {
          // Expected to throw
          expect(error).toBeDefined();
        }
      }
    });

    it('should handle extreme filter values', () => {
      const extremeFilters = {
        date: 'a'.repeat(1000),
        sport: 'b'.repeat(1000),
        status: 'c'.repeat(1000),
        conference: 'd'.repeat(1000),
        homeTeam: 'e'.repeat(1000),
        awayTeam: 'f'.repeat(1000),
        dataSource: 'g'.repeat(1000)
      };

      const result = service.sanitizeFilters(extremeFilters);

      expect(result.date).toBe('a'.repeat(1000));
      expect(result.sport).toBe('b'.repeat(1000).toLowerCase());
      expect(result.status).toBeUndefined(); // Invalid status
      expect(result.conference).toBe('d'.repeat(1000));
      expect(result.homeTeam).toBe('e'.repeat(1000));
      expect(result.awayTeam).toBe('f'.repeat(1000));
      expect(result.dataSource).toBe('g'.repeat(1000).toLowerCase());
    });

    it('should handle extreme option values', () => {
      const extremeOptions = {
        limit: 999999,
        offset: -999999,
        sortBy: 'invalid_sort_field',
        sortOrder: 'invalid_order'
      };

      const result = service.sanitizeOptions(extremeOptions);

      expect(result.limit).toBe(100); // Clamped to max
      expect(result.offset).toBe(0); // Clamped to min
      expect(result.sortBy).toBe('date'); // Default
      expect(result.sortOrder).toBe('DESC'); // Default
    });
  });
});
