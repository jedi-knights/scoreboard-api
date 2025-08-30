import { GameValidator } from '../../../src/validators/game-validator.js';

describe('GameValidator', () => {
  describe('validateGameData', () => {
    const validGameData = {
      home_team: 'Home Team',
      away_team: 'Away Team',
      sport: 'basketball',
      division: 'd1',
      date: '2024-01-15',
      home_score: 85,
      away_score: 78,
      status: 'final',
      data_source: 'ncaa'
    };

    it('should pass for valid game data', () => {
      expect(() => GameValidator.validateGameData(validGameData)).not.toThrow();
    });

    it('should pass for minimal valid game data', () => {
      const minimalData = {
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-15'
      };
      expect(() => GameValidator.validateGameData(minimalData)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const missingHomeTeam = { ...validGameData };
      delete missingHomeTeam.home_team;
      expect(() => GameValidator.validateGameData(missingHomeTeam))
        .toThrow('home_team is required');

      const missingAwayTeam = { ...validGameData };
      delete missingAwayTeam.away_team;
      expect(() => GameValidator.validateGameData(missingAwayTeam))
        .toThrow('away_team is required');

      const missingSport = { ...validGameData };
      delete missingSport.sport;
      expect(() => GameValidator.validateGameData(missingSport))
        .toThrow('sport is required');

      const missingDivision = { ...validGameData };
      delete missingDivision.division;
      expect(() => GameValidator.validateGameData(missingDivision))
        .toThrow('division is required');

      const missingDate = { ...validGameData };
      delete missingDate.date;
      expect(() => GameValidator.validateGameData(missingDate))
        .toThrow('date is required');
    });

    it('should throw for invalid sport', () => {
      const invalidSport = { ...validGameData, sport: 'invalid-sport' };
      expect(() => GameValidator.validateGameData(invalidSport))
        .toThrow('sport must be one of:');
    });

    it('should throw for invalid division', () => {
      const invalidDivision = { ...validGameData, division: 'd4' };
      expect(() => GameValidator.validateGameData(invalidDivision))
        .toThrow('division must be one of:');
    });

    it('should throw for invalid date format', () => {
      const invalidDate = { ...validGameData, date: 'invalid-date' };
      expect(() => GameValidator.validateGameData(invalidDate))
        .toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should throw for invalid scores', () => {
      const invalidHomeScore = { ...validGameData, home_score: -5 };
      expect(() => GameValidator.validateGameData(invalidHomeScore))
        .toThrow('home_score must be a non-negative number');

      const invalidAwayScore = { ...validGameData, away_score: 'invalid' };
      expect(() => GameValidator.validateGameData(invalidAwayScore))
        .toThrow('away_score must be a number');
    });

    it('should throw for invalid status', () => {
      const invalidStatus = { ...validGameData, status: 'invalid-status' };
      expect(() => GameValidator.validateGameData(invalidStatus))
        .toThrow('status must be one of:');
    });

    it('should throw for invalid data source', () => {
      const invalidDataSource = { ...validGameData, data_source: 'invalid-source' };
      expect(() => GameValidator.validateGameData(invalidDataSource))
        .toThrow('data_source must be one of:');
    });

    it('should throw for invalid team names', () => {
      const sameTeamNames = { ...validGameData, home_team: 'Same Team', away_team: 'Same Team' };
      expect(() => GameValidator.validateGameData(sameTeamNames))
        .toThrow('home_team and away_team must be different');
    });

    it('should throw for non-object input', () => {
      expect(() => GameValidator.validateGameData(null))
        .toThrow('Game data is required');
      expect(() => GameValidator.validateGameData(undefined))
        .toThrow('Game data is required');
      expect(() => GameValidator.validateGameData('not-an-object'))
        .toThrow('Game data must be an object');
      expect(() => GameValidator.validateGameData(123))
        .toThrow('Game data must be an object');
    });
  });

  describe('validateGameUpdateData', () => {
    const validUpdateData = {
      home_score: 90,
      away_score: 85,
      status: 'final'
    };

    it('should pass for valid update data', () => {
      expect(() => GameValidator.validateGameUpdateData(validUpdateData)).not.toThrow();
    });

    it('should pass for empty update data', () => {
      expect(() => GameValidator.validateGameUpdateData({})).not.toThrow();
    });

    it('should throw for invalid scores in update data', () => {
      const invalidHomeScore = { ...validUpdateData, home_score: -5 };
      expect(() => GameValidator.validateGameUpdateData(invalidHomeScore))
        .toThrow('home_score must be a non-negative number');

      const invalidAwayScore = { ...validUpdateData, away_score: 'invalid' };
      expect(() => GameValidator.validateGameUpdateData(invalidAwayScore))
        .toThrow('away_score must be a number');
    });

    it('should throw for invalid status in update data', () => {
      const invalidStatus = { ...validUpdateData, status: 'invalid-status' };
      expect(() => GameValidator.validateGameUpdateData(invalidStatus))
        .toThrow('Status must be one of:');
    });

    it('should throw for non-object input', () => {
      expect(() => GameValidator.validateGameUpdateData(null))
        .toThrow('Update data is required');
      expect(() => GameValidator.validateGameUpdateData(undefined))
        .toThrow('Update data is required');
      expect(() => GameValidator.validateGameUpdateData('not-an-object'))
        .toThrow('Update data must be an object');
      expect(() => GameValidator.validateGameUpdateData(123))
        .toThrow('Update data must be an object');
    });
  });

  describe('validateNCAAGameData', () => {
    const validNCAAGameData = {
      home_team: 'Home Team',
      away_team: 'Away Team',
      sport: 'basketball',
      division: 'd1',
      date: '2024-01-15',
      home_score: 85,
      away_score: 78,
      status: 'final'
    };

    it('should pass for valid NCAA game data', () => {
      expect(() => GameValidator.validateNCAAGameData(validNCAAGameData)).not.toThrow();
    });

    it('should pass for minimal valid NCAA game data', () => {
      const minimalData = {
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-15'
      };
      expect(() => GameValidator.validateNCAAGameData(minimalData)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const missingHomeTeam = { ...validNCAAGameData };
      delete missingHomeTeam.home_team;
      expect(() => GameValidator.validateNCAAGameData(missingHomeTeam))
        .toThrow('home_team is required');

      const missingAwayTeam = { ...validNCAAGameData };
      delete missingAwayTeam.away_team;
      expect(() => GameValidator.validateNCAAGameData(missingAwayTeam))
        .toThrow('away_team is required');

      const missingSport = { ...validNCAAGameData };
      delete missingSport.sport;
      expect(() => GameValidator.validateNCAAGameData(missingSport))
        .toThrow('sport is required');

      const missingDivision = { ...validNCAAGameData };
      delete missingDivision.division;
      expect(() => GameValidator.validateNCAAGameData(missingDivision))
        .toThrow('division is required');

      const missingDate = { ...validNCAAGameData };
      delete missingDate.date;
      expect(() => GameValidator.validateNCAAGameData(missingDate))
        .toThrow('date is required');
    });

    it('should throw for invalid sport', () => {
      const invalidSport = { ...validNCAAGameData, sport: 'invalid-sport' };
      expect(() => GameValidator.validateNCAAGameData(invalidSport))
        .toThrow('sport must be one of:');
    });

    it('should throw for invalid division', () => {
      const invalidDivision = { ...validNCAAGameData, division: 'd4' };
      expect(() => GameValidator.validateNCAAGameData(invalidDivision))
        .toThrow('division must be one of:');
    });

    it('should throw for invalid date format', () => {
      const invalidDate = { ...validNCAAGameData, date: 'invalid-date' };
      expect(() => GameValidator.validateNCAAGameData(invalidDate))
        .toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should throw for invalid scores', () => {
      const invalidHomeScore = { ...validNCAAGameData, home_score: -5 };
      expect(() => GameValidator.validateNCAAGameData(invalidHomeScore))
        .toThrow('home_score must be a non-negative number');

      const invalidAwayScore = { ...validNCAAGameData, away_score: 'invalid' };
      expect(() => GameValidator.validateNCAAGameData(invalidAwayScore))
        .toThrow('away_score must be a number');
    });

    it('should throw for invalid status', () => {
      const invalidStatus = { ...validNCAAGameData, status: 'invalid-status' };
      expect(() => GameValidator.validateNCAAGameData(invalidStatus))
        .toThrow('status must be one of:');
    });

    it('should throw for invalid team names', () => {
      const sameTeamNames = { ...validNCAAGameData, home_team: 'Same Team', away_team: 'Same Team' };
      expect(() => GameValidator.validateNCAAGameData(sameTeamNames))
        .toThrow('home_team and away_team must be different');
    });

    it('should throw for non-object input', () => {
      expect(() => GameValidator.validateNCAAGameData(null))
        .toThrow('NCAA game data is required');
      expect(() => GameValidator.validateNCAAGameData(undefined))
        .toThrow('NCAA game data is required');
      expect(() => GameValidator.validateNCAAGameData('not-an-object'))
        .toThrow('NCAA game data must be an object');
      expect(() => GameValidator.validateNCAAGameData(123))
        .toThrow('NCAA game data must be an object');
    });
  });

  describe('validateGameId', () => {
    it('should pass for valid game IDs', () => {
      expect(() => GameValidator.validateGameId('game-123')).not.toThrow();
      expect(() => GameValidator.validateGameId('ncaa-game-456')).not.toThrow();
      expect(() => GameValidator.validateGameId('game_789')).not.toThrow();
    });

    it('should throw for invalid game IDs', () => {
      expect(() => GameValidator.validateGameId('')).toThrow('Game ID is required');
      expect(() => GameValidator.validateGameId(null)).toThrow('Game ID is required');
      expect(() => GameValidator.validateGameId(undefined)).toThrow('Game ID is required');
      expect(() => GameValidator.validateGameId(123)).toThrow('Game ID must be a string');
    });

    it('should use default field name', () => {
      expect(() => GameValidator.validateGameId('')).toThrow('Game ID is required');
    });
  });

  describe('validateTeamNames', () => {
    it('should pass for different team names', () => {
      expect(() => GameValidator.validateTeamNames('Home Team', 'Away Team')).not.toThrow();
      expect(() => GameValidator.validateTeamNames('Team A', 'Team B')).not.toThrow();
      expect(() => GameValidator.validateTeamNames('Long Team Name', 'Short Name')).not.toThrow();
    });

    it('should throw for same team names', () => {
      expect(() => GameValidator.validateTeamNames('Same Team', 'Same Team'))
        .toThrow('home_team and away_team must be different');
      expect(() => GameValidator.validateTeamNames('TEAM', 'team'))
        .toThrow('home_team and away_team must be different');
      expect(() => GameValidator.validateTeamNames('  Team  ', 'Team'))
        .toThrow('home_team and away_team must be different');
    });

    it('should throw for missing team names', () => {
      expect(() => GameValidator.validateTeamNames('', 'Away Team'))
        .toThrow('home_team is required');
      expect(() => GameValidator.validateTeamNames('Home Team', ''))
        .toThrow('away_team is required');
      expect(() => GameValidator.validateTeamNames(null, 'Away Team'))
        .toThrow('home_team is required');
      expect(() => GameValidator.validateTeamNames('Home Team', undefined))
        .toThrow('away_team is required');
    });

    it('should use default field names', () => {
      expect(() => GameValidator.validateTeamNames('Same Team', 'Same Team'))
        .toThrow('home_team and away_team must be different');
    });
  });

  describe('validateStatus', () => {
    it('should pass for valid statuses', () => {
      expect(() => GameValidator.validateStatus('scheduled', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('live', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('final', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('postponed', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('cancelled', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('suspended', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('delayed', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('halftime', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('quarter', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('period', 'status')).not.toThrow();
    });

    it('should pass for valid statuses with different casing', () => {
      expect(() => GameValidator.validateStatus('SCHEDULED', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('Live', 'status')).not.toThrow();
      expect(() => GameValidator.validateStatus('FINAL', 'status')).not.toThrow();
    });

    it('should throw for invalid statuses', () => {
      expect(() => GameValidator.validateStatus('invalid-status', 'status'))
        .toThrow('status must be one of: scheduled, live, final, postponed, cancelled, suspended, delayed, halftime, quarter, period');
      expect(() => GameValidator.validateStatus('', 'status'))
        .toThrow('status must be one of: scheduled, live, final, postponed, cancelled, suspended, delayed, halftime, quarter, period');
    });

    it('should throw for non-string values', () => {
      expect(() => GameValidator.validateStatus(123, 'status'))
        .toThrow('status must be a string');
      expect(() => GameValidator.validateStatus(null, 'status'))
        .toThrow('status must be a string');
      expect(() => GameValidator.validateStatus(undefined, 'status'))
        .toThrow('status must be a string');
    });

    it('should use default field name', () => {
      expect(() => GameValidator.validateStatus('invalid-status'))
        .toThrow('Status must be one of: scheduled, live, final, postponed, cancelled, suspended, delayed, halftime, quarter, period');
    });
  });

  describe('validateDataSource', () => {
    it('should pass for valid data sources', () => {
      expect(() => GameValidator.validateDataSource('ncaa', 'data_source')).not.toThrow();
      expect(() => GameValidator.validateDataSource('manual', 'data_source')).not.toThrow();
      expect(() => GameValidator.validateDataSource('api', 'data_source')).not.toThrow();
      expect(() => GameValidator.validateDataSource('import', 'data_source')).not.toThrow();
    });

    it('should pass for valid data sources with different casing', () => {
      expect(() => GameValidator.validateDataSource('NCAA', 'data_source')).not.toThrow();
      expect(() => GameValidator.validateDataSource('Manual', 'data_source')).not.toThrow();
      expect(() => GameValidator.validateDataSource('API', 'data_source')).not.toThrow();
    });

    it('should throw for invalid data sources', () => {
      expect(() => GameValidator.validateDataSource('invalid-source', 'data_source'))
        .toThrow('data_source must be one of: ncaa, manual, api, import');
      expect(() => GameValidator.validateDataSource('', 'data_source'))
        .toThrow('data_source must be one of: ncaa, manual, api, import');
    });

    it('should throw for non-string values', () => {
      expect(() => GameValidator.validateDataSource(123, 'data_source'))
        .toThrow('data_source must be a string');
      expect(() => GameValidator.validateDataSource(null, 'data_source'))
        .toThrow('data_source must be a string');
      expect(() => GameValidator.validateDataSource(undefined, 'data_source'))
        .toThrow('data_source must be a string');
    });

    it('should use default field name', () => {
      expect(() => GameValidator.validateDataSource('invalid-source'))
        .toThrow('Data source must be one of: ncaa, manual, api, import');
    });
  });

  describe('validateScore', () => {
    it('should pass for valid scores', () => {
      expect(() => GameValidator.validateScore(0, 'score')).not.toThrow();
      expect(() => GameValidator.validateScore(100, 'score')).not.toThrow();
      expect(() => GameValidator.validateScore(999, 'score')).not.toThrow();
    });

    it('should throw for invalid scores', () => {
      expect(() => GameValidator.validateScore(-1, 'score'))
        .toThrow('score must be a non-negative number');
      expect(() => GameValidator.validateScore(-100, 'score'))
        .toThrow('score must be a non-negative number');
    });

    it('should throw for non-number values', () => {
      expect(() => GameValidator.validateScore('100', 'score'))
        .toThrow('score must be a number');
      expect(() => GameValidator.validateScore(null, 'score'))
        .toThrow('score must be a number');
      expect(() => GameValidator.validateScore(undefined, 'score'))
        .toThrow('score must be a number');
      expect(() => GameValidator.validateScore(NaN, 'score'))
        .toThrow('score must be a number');
    });

    it('should use default field name', () => {
      expect(() => GameValidator.validateScore(-1)).toThrow('Score must be a non-negative number');
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid statuses', () => {
      expect(GameValidator.isValidStatus('scheduled')).toBe(true);
      expect(GameValidator.isValidStatus('live')).toBe(true);
      expect(GameValidator.isValidStatus('final')).toBe(true);
      expect(GameValidator.isValidStatus('postponed')).toBe(true);
      expect(GameValidator.isValidStatus('cancelled')).toBe(true);
      expect(GameValidator.isValidStatus('suspended')).toBe(true);
      expect(GameValidator.isValidStatus('delayed')).toBe(true);
      expect(GameValidator.isValidStatus('halftime')).toBe(true);
      expect(GameValidator.isValidStatus('quarter')).toBe(true);
      expect(GameValidator.isValidStatus('period')).toBe(true);
    });

    it('should return true for valid statuses with different casing', () => {
      expect(GameValidator.isValidStatus('SCHEDULED')).toBe(true);
      expect(GameValidator.isValidStatus('Live')).toBe(true);
      expect(GameValidator.isValidStatus('FINAL')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(GameValidator.isValidStatus('invalid-status')).toBe(false);
      expect(GameValidator.isValidStatus('')).toBe(false);
      expect(GameValidator.isValidStatus(null)).toBe(false);
      expect(GameValidator.isValidStatus(undefined)).toBe(false);
      expect(GameValidator.isValidStatus(123)).toBe(false);
    });
  });

  describe('isValidScore', () => {
    it('should return true for valid scores', () => {
      expect(GameValidator.isValidScore(0)).toBe(true);
      expect(GameValidator.isValidScore(100)).toBe(true);
      expect(GameValidator.isValidScore(999)).toBe(true);
    });

    it('should return false for invalid scores', () => {
      expect(GameValidator.isValidScore(-1)).toBe(false);
      expect(GameValidator.isValidScore(-100)).toBe(false);
      expect(GameValidator.isValidScore('100')).toBe(false);
      expect(GameValidator.isValidScore(null)).toBe(false);
      expect(GameValidator.isValidScore(undefined)).toBe(false);
      expect(GameValidator.isValidScore(NaN)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return valid statuses list', () => {
      const validStatuses = GameValidator.getValidStatuses();
      expect(Array.isArray(validStatuses)).toBe(true);
      expect(validStatuses).toContain('scheduled');
      expect(validStatuses).toContain('live');
      expect(validStatuses).toContain('final');
      expect(validStatuses).toContain('postponed');
      expect(validStatuses).toContain('cancelled');
      expect(validStatuses).toContain('suspended');
      expect(validStatuses).toContain('delayed');
      expect(validStatuses).toContain('halftime');
      expect(validStatuses).toContain('quarter');
      expect(validStatuses).toContain('period');
      expect(validStatuses).toHaveLength(10);
    });

    it('should return valid data sources list', () => {
      const validDataSources = GameValidator.getValidDataSources();
      expect(Array.isArray(validDataSources)).toBe(true);
      expect(validDataSources).toContain('ncaa');
      expect(validDataSources).toContain('manual');
      expect(validDataSources).toContain('api');
      expect(validDataSources).toContain('import');
      expect(validDataSources).toHaveLength(4);
    });
  });
});
