import { jest } from '@jest/globals';
import { GamesRepository } from '../../../src/database/repositories/games-repository.js';

describe('GamesRepository', () => {
  let repository;
  let mockDatabaseAdapter;

  beforeEach(() => {
    // Create mock database adapter
    mockDatabaseAdapter = {
      query: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn()
    };

    // Create repository instance
    repository = new GamesRepository(mockDatabaseAdapter);
  });

  describe('Constructor', () => {
    it('should create a repository instance with database adapter', () => {
      expect(repository).toBeInstanceOf(GamesRepository);
      expect(repository.db).toBe(mockDatabaseAdapter);
    });
  });

  describe('Filter Builder Methods', () => {
    describe('_buildDateFilter', () => {
      it('should return empty fragment when no date provided', () => {
        const result = repository._buildDateFilter(null, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return date filter fragment when date provided', () => {
        const result = repository._buildDateFilter('2024-01-01', 1);
        expect(result.fragment).toBe(' AND date = $1');
        expect(result.paramIndex).toBe(2);
      });
    });

    describe('_buildSportFilter', () => {
      it('should return empty fragment when no sport provided', () => {
        const result = repository._buildSportFilter(null, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return sport filter fragment when sport provided', () => {
        const result = repository._buildSportFilter('basketball', 1);
        expect(result.fragment).toBe(' AND sport = $1');
        expect(result.paramIndex).toBe(2);
      });
    });

    describe('_buildStatusFilter', () => {
      it('should return empty fragment when no status provided', () => {
        const result = repository._buildStatusFilter(null, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return status filter fragment when status provided', () => {
        const result = repository._buildStatusFilter('completed', 1);
        expect(result.fragment).toBe(' AND status = $1');
        expect(result.paramIndex).toBe(2);
      });
    });

    describe('_buildConferenceFilter', () => {
      it('should return empty fragment when no conference provided', () => {
        const result = repository._buildConferenceFilter(null, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return conference filter fragment when conference provided', () => {
        const result = repository._buildConferenceFilter('SEC', 1);
        expect(result.fragment).toBe(' AND (home_team IN (SELECT name FROM teams WHERE conference = $1) OR away_team IN (SELECT name FROM teams WHERE conference = $1))');
        expect(result.paramIndex).toBe(2);
      });
    });

    describe('_buildTeamFilters', () => {
      it('should return empty fragment when no team filters provided', () => {
        const result = repository._buildTeamFilters({}, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return home team filter fragment when homeTeam provided', () => {
        const result = repository._buildTeamFilters({ homeTeam: 'Lakers' }, 1);
        expect(result.fragment).toBe(' AND home_team = $1');
        expect(result.paramIndex).toBe(2);
      });

      it('should return away team filter fragment when awayTeam provided', () => {
        const result = repository._buildTeamFilters({ awayTeam: 'Warriors' }, 1);
        expect(result.fragment).toBe(' AND away_team = $1');
        expect(result.paramIndex).toBe(2);
      });

      it('should return both team filter fragments when both provided', () => {
        const result = repository._buildTeamFilters({ homeTeam: 'Lakers', awayTeam: 'Warriors' }, 1);
        expect(result.fragment).toBe(' AND home_team = $1 AND away_team = $2');
        expect(result.paramIndex).toBe(3);
      });
    });

    describe('_buildDataSourceFilter', () => {
      it('should return empty fragment when no data source provided', () => {
        const result = repository._buildDataSourceFilter(null, 1);
        expect(result.fragment).toBe('');
        expect(result.paramIndex).toBe(1);
      });

      it('should return data source filter fragment when data source provided', () => {
        const result = repository._buildDataSourceFilter('espn', 1);
        expect(result.fragment).toBe(' AND data_source = $1');
        expect(result.paramIndex).toBe(2);
      });
    });
  });

  describe('_applyFilter', () => {
    it('should apply filter and return new parameter index', () => {
      const filter = { fragment: ' AND status = $1', paramIndex: 2 };
      const value = 'completed';
      let query = 'SELECT * FROM games WHERE 1=1';
      const params = [];
      const paramIndex = 1;

      const result = repository._applyFilter(filter, value, query, params, paramIndex);

      expect(result).toBe(2);
      expect(params).toContain('completed');
    });

    it('should not add parameter when filter fragment is empty', () => {
      const filter = { fragment: '', paramIndex: 1 };
      const value = 'completed';
      let query = 'SELECT * FROM games WHERE 1=1';
      const params = [];
      const paramIndex = 1;

      const result = repository._applyFilter(filter, value, query, params, paramIndex);

      expect(result).toBe(1);
      expect(params).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('should find all games with default options', async () => {
      const mockGames = [{ id: 1, name: 'Game 1' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const result = await repository.findAll();

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM games WHERE 1=1'),
        expect.arrayContaining([50, 0])
      );
      expect(result).toEqual(mockGames);
    });

    it('should apply filters correctly', async () => {
      const mockGames = [{ id: 1, sport: 'basketball' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const filters = { sport: 'basketball', status: 'scheduled' };
      const options = { limit: 10, offset: 0, sortBy: 'date', sortOrder: 'ASC' };

      await repository.findAll(filters, options);

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date ASC'),
        expect.arrayContaining(['basketball', 'scheduled', 10, 0])
      );
    });

    it('should handle team filters correctly', async () => {
      const mockGames = [{ id: 1, homeTeam: 'Lakers' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const filters = { homeTeam: 'Lakers', awayTeam: 'Warriors' };

      await repository.findAll(filters);

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND home_team = $'),
        expect.arrayContaining(['Lakers', 'Warriors'])
      );
    });
  });

  describe('findById', () => {
    it('should find game by ID', async () => {
      const mockGame = { id: 1, name: 'Game 1' };
      mockDatabaseAdapter.get.mockResolvedValue(mockGame);

      const result = await repository.findById('game-123');

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE game_id = ?',
        ['game-123']
      );
      expect(result).toEqual(mockGame);
    });

    it('should return null when game not found', async () => {
      mockDatabaseAdapter.get.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByDateRange', () => {
    it('should find games by date range', async () => {
      const mockGames = [{ id: 1, date: '2024-01-01' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31');

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE date BETWEEN ? AND ? ORDER BY date ASC, home_team ASC',
        ['2024-01-01', '2024-01-31']
      );
      expect(result).toEqual(mockGames);
    });

    it('should apply additional filters', async () => {
      const mockGames = [{ id: 1, sport: 'basketball' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const filters = { sport: 'basketball', status: 'scheduled' };

      await repository.findByDateRange('2024-01-01', '2024-01-31', filters);

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND sport = ?'),
        expect.arrayContaining(['2024-01-01', '2024-01-31', 'basketball', 'scheduled'])
      );
    });
  });

  describe('findLiveGames', () => {
    it('should find live games', async () => {
      const mockGames = [{ id: 1, status: 'in_progress' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const result = await repository.findLiveGames();

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE status = "in_progress" ORDER BY date ASC, home_team ASC',
        []
      );
      expect(result).toEqual(mockGames);
    });

    it('should apply sport filter', async () => {
      const mockGames = [{ id: 1, sport: 'basketball' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      await repository.findLiveGames({ sport: 'basketball' });

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND sport = ?'),
        ['basketball']
      );
    });

    it('should apply conference filter', async () => {
      const mockGames = [{ id: 1, conference: 'SEC' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      await repository.findLiveGames({ conference: 'SEC' });

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND (home_team IN (SELECT name FROM teams WHERE conference = ?)'),
        ['SEC', 'SEC']
      );
    });
  });

  describe('findByTeam', () => {
    it('should find games by team', async () => {
      const mockGames = [{ id: 1, homeTeam: 'Lakers' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const result = await repository.findByTeam('Lakers');

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        'SELECT * FROM games WHERE (home_team = ? OR away_team = ?) ORDER BY date DESC',
        ['Lakers', 'Lakers']
      );
      expect(result).toEqual(mockGames);
    });

    it('should apply season filter', async () => {
      const mockGames = [{ id: 1, season: '2024' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      await repository.findByTeam('Lakers', { season: '2024' });

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND date LIKE ?'),
        expect.arrayContaining(['Lakers', 'Lakers', '2024%'])
      );
    });

    it('should apply multiple filters', async () => {
      const mockGames = [{ id: 1, sport: 'basketball' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockGames);

      const filters = { season: '2024', sport: 'basketball', status: 'completed' };

      await repository.findByTeam('Lakers', filters);

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('AND sport = ?'),
        expect.arrayContaining(['Lakers', 'Lakers', '2024%', 'basketball', 'completed'])
      );
    });
  });

  describe('_validateRequiredFields', () => {
    it('should not throw error when all required fields are present', () => {
      const gameData = {
        game_id: 'game-123',
        date: '2024-01-01',
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball',
        status: 'scheduled',
        data_source: 'espn'
      };

      expect(() => repository._validateRequiredFields(gameData)).not.toThrow();
    });

    it('should throw error when required field is missing', () => {
      const gameData = {
        game_id: 'game-123',
        date: '2024-01-01',
        // missing home_team
        away_team: 'Warriors',
        sport: 'basketball',
        status: 'scheduled',
        data_source: 'espn'
      };

      expect(() => repository._validateRequiredFields(gameData)).toThrow('Missing required field: home_team');
    });
  });

  describe('_buildCoreGameParams', () => {
    it('should build core game parameters correctly', () => {
      const gameData = {
        game_id: 'game-123',
        data_source: 'espn',
        league_name: 'NBA',
        date: '2024-01-01',
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball'
      };

      const result = repository._buildCoreGameParams(gameData);

      expect(result).toEqual([
        'game-123',
        'espn',
        'NBA',
        '2024-01-01',
        'Lakers',
        'Warriors',
        'basketball'
      ]);
    });

    it('should handle missing league_name', () => {
      const gameData = {
        game_id: 'game-123',
        data_source: 'espn',
        date: '2024-01-01',
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball'
      };

      const result = repository._buildCoreGameParams(gameData);

      expect(result[2]).toBe(null);
    });
  });

  describe('_buildScoreParams', () => {
    it('should build score parameters correctly', () => {
      const gameData = {
        home_score: 100,
        away_score: 95,
        status: 'completed',
        current_period: 4,
        period_scores: { '1': '25-20', '2': '50-45' }
      };

      const result = repository._buildScoreParams(gameData);

      expect(result).toEqual([
        100,
        95,
        'completed',
        4,
        '{"1":"25-20","2":"50-45"}'
      ]);
    });

    it('should handle missing score values', () => {
      const gameData = {
        status: 'scheduled'
      };

      const result = repository._buildScoreParams(gameData);

      expect(result).toEqual([
        null,
        null,
        'scheduled',
        null,
        null
      ]);
    });
  });

  describe('_buildLocationParams', () => {
    it('should build location parameters correctly', () => {
      const gameData = {
        venue: 'Staples Center',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        timezone: 'PST'
      };

      const result = repository._buildLocationParams(gameData);

      expect(result).toEqual([
        'Staples Center',
        'Los Angeles',
        'CA',
        'USA',
        'PST'
      ]);
    });
  });

  describe('_buildAdditionalParams', () => {
    it('should build additional parameters correctly', () => {
      const gameData = {
        broadcast_info: 'ESPN',
        notes: 'National TV game'
      };

      const result = repository._buildAdditionalParams(gameData);

      expect(result).toEqual([
        'ESPN',
        'National TV game'
      ]);
    });
  });

  describe('_buildGameParams', () => {
    it('should combine all parameter arrays correctly', () => {
      const gameData = {
        game_id: 'game-123',
        data_source: 'espn',
        date: '2024-01-01',
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball',
        status: 'scheduled',
        home_score: 100,
        away_score: 95,
        venue: 'Staples Center',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        timezone: 'PST',
        broadcast_info: 'ESPN',
        notes: 'National TV game'
      };

      const result = repository._buildGameParams(gameData);

      expect(result).toHaveLength(19); // Total number of parameters
      expect(result[0]).toBe('game-123'); // First core param
      expect(result[6]).toBe('basketball'); // Last core param
      expect(result[7]).toBe(100); // First score param
      expect(result[12]).toBe('Staples Center'); // First location param
    });
  });

  describe('create', () => {
    it('should create a new game successfully', async () => {
      const gameData = {
        game_id: 'game-123',
        data_source: 'espn',
        date: '2024-01-01',
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball',
        status: 'scheduled'
      };

      const createdGame = { ...gameData, id: 1 };
      mockDatabaseAdapter.run.mockResolvedValue({ lastID: 1 });
      mockDatabaseAdapter.get.mockResolvedValue(createdGame);

      const result = await repository.create(gameData);

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO games'),
        expect.arrayContaining(['game-123', 'espn', '2024-01-01', 'Lakers', 'Warriors', 'basketball', 'scheduled'])
      );
      expect(result).toEqual(createdGame);
    });

    it('should throw error when required fields are missing', async () => {
      const gameData = {
        game_id: 'game-123'
        // missing required fields
      };

      await expect(repository.create(gameData)).rejects.toThrow('Missing required field: date');
    });
  });

  describe('update', () => {
    it('should update an existing game successfully', async () => {
      const existingGame = { game_id: 'game-123', name: 'Game 1' };
      const updateData = { status: 'completed', home_score: 100 };

      mockDatabaseAdapter.get.mockResolvedValueOnce(existingGame); // findById
      mockDatabaseAdapter.run.mockResolvedValue({ changes: 1 });
      mockDatabaseAdapter.get.mockResolvedValueOnce({ ...existingGame, ...updateData }); // findById after update

      const result = await repository.update('game-123', updateData);

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE games SET'),
        expect.arrayContaining(['completed', 100, 'game-123'])
      );
      expect(result).toEqual({ ...existingGame, ...updateData });
    });

    it('should return null when game not found', async () => {
      mockDatabaseAdapter.get.mockResolvedValue(null);

      const result = await repository.update('nonexistent', { status: 'completed' });

      expect(result).toBeNull();
      expect(mockDatabaseAdapter.run).not.toHaveBeenCalled();
    });

    it('should handle period_scores JSON serialization', async () => {
      const existingGame = { game_id: 'game-123', name: 'Game 1' };
      const updateData = { period_scores: { '1': '25-20' } };

      mockDatabaseAdapter.get.mockResolvedValueOnce(existingGame);
      mockDatabaseAdapter.run.mockResolvedValue({ changes: 1 });
      mockDatabaseAdapter.get.mockResolvedValueOnce({ ...existingGame, ...updateData });

      await repository.update('game-123', updateData);

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE games SET'),
        expect.arrayContaining(['{"1":"25-20"}'])
      );
    });
  });

  describe('delete', () => {
    it('should delete a game successfully', async () => {
      mockDatabaseAdapter.run.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('game-123');

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith(
        'DELETE FROM games WHERE game_id = ?',
        ['game-123']
      );
      expect(result).toBe(true);
    });

    it('should return false when game not found', async () => {
      mockDatabaseAdapter.run.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count games with filters', async () => {
      mockDatabaseAdapter.get.mockResolvedValue({ count: 5 });

      const result = await repository.count({ sport: 'basketball', status: 'completed' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM games WHERE 1=1'),
        expect.arrayContaining(['basketball', 'completed'])
      );
      expect(result).toBe(5);
    });

    it('should return 0 when no results', async () => {
      mockDatabaseAdapter.get.mockResolvedValue(null);

      const result = await repository.count({ sport: 'nonexistent' });

      expect(result).toBe(0);
    });
  });

  describe('exists', () => {
    it('should check existence by game_id', async () => {
      mockDatabaseAdapter.get.mockResolvedValue({ game_id: 'game-123' });

      const result = await repository.exists({ game_id: 'game-123' });

      expect(result).toBe(true);
    });

    it('should check existence by other criteria', async () => {
      mockDatabaseAdapter.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists({ sport: 'basketball', status: 'completed' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM games WHERE 1=1'),
        expect.arrayContaining(['basketball', 'completed'])
      );
      expect(result).toBe(true);
    });

    it('should return false when no matches found', async () => {
      mockDatabaseAdapter.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists({ sport: 'nonexistent' });

      expect(result).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should get game statistics with filters', async () => {
      const mockStats = {
        total_games: 100,
        completed_games: 80,
        live_games: 5,
        scheduled_games: 15
      };

      mockDatabaseAdapter.get.mockResolvedValue(mockStats);

      const result = await repository.getStatistics({ sport: 'basketball' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_games'),
        expect.arrayContaining(['basketball'])
      );
      expect(result).toEqual(mockStats);
    });

    it('should return empty object when no results', async () => {
      mockDatabaseAdapter.get.mockResolvedValue(null);

      const result = await repository.getStatistics({ sport: 'nonexistent' });

      expect(result).toEqual({});
    });
  });

  describe('Inherited Methods', () => {
    it('should have executeQuery method from base repository', () => {
      expect(typeof repository.executeQuery).toBe('function');
    });

    it('should have executeQuerySingle method from base repository', () => {
      expect(typeof repository.executeQuerySingle).toBe('function');
    });

    it('should have executeQueryRun method from base repository', () => {
      expect(typeof repository.executeQueryRun).toBe('function');
    });

    it('should have transaction methods from base repository', () => {
      expect(typeof repository.beginTransaction).toBe('function');
      expect(typeof repository.commitTransaction).toBe('function');
      expect(typeof repository.rollbackTransaction).toBe('function');
    });
  });
});
