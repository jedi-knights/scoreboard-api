/**
 * Unit Tests for Games Service
 * 
 * Tests business logic without external dependencies.
 */

import { GamesService } from '../../../src/services/games-service.js';

describe('GamesService', () => {
  let gamesService;
  let mockDatabaseAdapter;

  beforeEach(() => {
    // Create mock database adapter
    mockDatabaseAdapter = global.unitTestUtils.createMockDatabaseAdapter();
    
    // Create games service instance
    gamesService = new GamesService(mockDatabaseAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        status: 'scheduled',
        data_source: 'ncaa'
      };

      expect(() => {
        gamesService.validateGameData(validGameData);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        // Missing home_team, away_team, sport, status, data_source
      };

      expect(() => {
        gamesService.validateGameData(invalidGameData);
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
        gamesService.validateGameData(invalidGameData);
      }).toThrow('Invalid date format. Use YYYY-MM-DD');
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
        gamesService.validateGameData(invalidGameData);
      }).toThrow('Invalid status value');
    });

    it('should throw error for invalid sport length', () => {
      const invalidGameData = {
        game_id: 'test_game_123',
        date: '2024-09-15',
        home_team: 'Stanford',
        away_team: 'Berkeley',
        sport: '', // Empty sport
        status: 'scheduled',
        data_source: 'ncaa'
      };

      expect(() => {
        gamesService.validateGameData(invalidGameData);
      }).toThrow('Sport name must be between 1 and 50 characters');
    });
  });

  describe('validateGameUpdateData', () => {
    it('should validate valid update data', () => {
      const validUpdateData = {
        home_score: 2,
        away_score: 1,
        status: 'completed'
      };

      expect(() => {
        gamesService.validateGameUpdateData(validUpdateData);
      }).not.toThrow();
    });

    it('should throw error for invalid date format', () => {
      const invalidUpdateData = {
        date: 'invalid-date'
      };

      expect(() => {
        gamesService.validateGameUpdateData(invalidUpdateData);
      }).toThrow('Invalid date format. Use YYYY-MM-DD');
    });

    it('should throw error for invalid status', () => {
      const invalidUpdateData = {
        status: 'invalid_status'
      };

      expect(() => {
        gamesService.validateGameUpdateData(invalidUpdateData);
      }).toThrow('Invalid status value');
    });

    it('should throw error for invalid sport length', () => {
      const invalidUpdateData = {
        sport: 'a'.repeat(51) // Too long
      };

      expect(() => {
        gamesService.validateGameUpdateData(invalidUpdateData);
      }).toThrow('Sport name must be between 1 and 50 characters');
    });
  });
});
