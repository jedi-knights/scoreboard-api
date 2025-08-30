/**
 * Game Builder
 * 
 * Test data builder for creating game objects used in testing the games service.
 * Provides valid and invalid game data for various test scenarios.
 */

/**
 * Game Data Builder
 */
export class GameBuilder {
  /**
   * Build a valid game with default values
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Valid game data
   */
  static buildValidGame(overrides = {}) {
    return {
      game_id: 'game-123',
      home_team: 'Test Home Team',
      away_team: 'Test Away Team',
      sport: 'basketball',
      division: 'd1',
      date: '2024-01-01',
      time: '19:00',
      venue: 'Test Arena',
      city: 'Test City',
      state: 'CA',
      country: 'USA',
      conference: 'Test Conference',
      season: '2023-24',
      gender: 'men',
      status: 'scheduled',
      home_score: null,
      away_score: null,
      period_scores: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  }

  /**
   * Build an invalid game with validation errors
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Invalid game data
   */
  static buildInvalidGame(overrides = {}) {
    return {
      game_id: '', // Invalid: empty string
      home_team: '', // Invalid: empty string
      away_team: 'Test Away Team',
      sport: 'invalid-sport', // Invalid sport
      division: 'invalid-division', // Invalid division
      date: 'invalid-date', // Invalid date format
      time: '25:00', // Invalid time
      venue: 'A'.repeat(101), // Too long venue name
      city: 'A'.repeat(51), // Too long city name
      state: 'INVALID', // Invalid state
      country: 'INVALID', // Invalid country
      conference: 'A'.repeat(101), // Too long conference name
      season: 'invalid-season', // Invalid season format
      gender: 'invalid-gender', // Invalid gender
      status: 'invalid-status', // Invalid status
      ...overrides
    };
  }

  /**
   * Build a game with scores
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with scores
   */
  static buildGameWithScores(overrides = {}) {
    return {
      ...this.buildValidGame(),
      status: 'final',
      home_score: 85,
      away_score: 78,
      period_scores: {
        home: [20, 25, 22, 18],
        away: [18, 20, 25, 15]
      },
      ...overrides
    };
  }

  /**
   * Build a live game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Live game data
   */
  static buildLiveGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      status: 'live',
      current_period: 2,
      time_remaining: '15:30',
      home_score: 45,
      away_score: 42,
      ...overrides
    };
  }

  /**
   * Build a scheduled game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Scheduled game data
   */
  static buildScheduledGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      status: 'scheduled',
      home_score: null,
      away_score: null,
      period_scores: null,
      ...overrides
    };
  }

  /**
   * Build a completed game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Completed game data
   */
  static buildCompletedGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      status: 'final',
      home_score: 85,
      away_score: 78,
      period_scores: {
        home: [20, 25, 22, 18],
        away: [18, 20, 25, 15]
      },
      ...overrides
    };
  }

  /**
   * Build a basketball game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Basketball game data
   */
  static buildBasketballGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a football game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Football game data
   */
  static buildFootballGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      sport: 'football',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a baseball game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Baseball game data
   */
  static buildBaseballGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      sport: 'baseball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a women's game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Women's game data
   */
  static buildWomensGame(overrides = {}) {
    return {
      ...this.buildValidGame(),
      gender: 'women',
      ...overrides
    };
  }

  /**
   * Build a D2 game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D2 game data
   */
  static buildD2Game(overrides = {}) {
    return {
      ...this.buildValidGame(),
      division: 'd2',
      ...overrides
    };
  }

  /**
   * Build a D3 game
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D3 game data
   */
  static buildD3Game(overrides = {}) {
    return {
      ...this.buildValidGame(),
      division: 'd3',
      ...overrides
    };
  }

  /**
   * Build a game with minimal required fields
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Minimal game data
   */
  static buildMinimalGame(overrides = {}) {
    return {
      game_id: 'game-123',
      home_team: 'Home Team',
      away_team: 'Away Team',
      sport: 'basketball',
      date: '2024-01-01',
      ...overrides
    };
  }

  /**
   * Build a game with extended metadata
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with extended metadata
   */
  static buildGameWithMetadata(overrides = {}) {
    return {
      ...this.buildValidGame(),
      broadcast_info: {
        network: 'ESPN',
        channel: 'ESPN2',
        stream_url: 'https://espn.com/watch'
      },
      weather: {
        temperature: 72,
        conditions: 'Clear',
        wind_speed: 5
      },
      attendance: 15000,
      capacity: 20000,
      notes: 'Special event game',
      ...overrides
    };
  }

  /**
   * Build a game for update operations
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data for updates
   */
  static buildGameForUpdate(overrides = {}) {
    return {
      home_score: 85,
      away_score: 78,
      status: 'final',
      period_scores: {
        home: [20, 25, 22, 18],
        away: [18, 20, 25, 15]
      },
      notes: 'Game completed',
      ...overrides
    };
  }

  /**
   * Build multiple games for batch testing
   * @param {number} count - Number of games to create
   * @param {Object} baseOverrides - Base overrides for all games
   * @param {Function} customizer - Function to customize each game
   * @returns {Array} Array of game data
   */
  static buildMultipleGames(count = 3, baseOverrides = {}, customizer = null) {
    const games = [];
    
    for (let i = 0; i < count; i++) {
      let game = this.buildValidGame({
        game_id: `game-${i + 1}`,
        home_team: `Home Team ${i + 1}`,
        away_team: `Away Team ${i + 1}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        ...baseOverrides
      });
      
      if (customizer && typeof customizer === 'function') {
        game = customizer(game, i);
      }
      
      games.push(game);
    }
    
    return games;
  }

  /**
   * Build a game with specific validation errors
   * @param {Array} errorTypes - Types of validation errors to include
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with specific validation errors
   */
  static buildGameWithValidationErrors(errorTypes = [], overrides = {}) {
    const game = this.buildValidGame();
    
    errorTypes.forEach(errorType => {
      switch (errorType) {
        case 'missing_game_id':
          game.game_id = '';
          break;
        case 'missing_home_team':
          game.home_team = '';
          break;
        case 'missing_away_team':
          game.away_team = '';
          break;
        case 'invalid_sport':
          game.sport = 'invalid-sport';
          break;
        case 'invalid_division':
          game.division = 'invalid-division';
          break;
        case 'invalid_date':
          game.date = 'invalid-date';
          break;
        case 'invalid_time':
          game.time = '25:00';
          break;
        case 'long_game_id':
          game.game_id = 'A'.repeat(101);
          break;
        case 'long_home_team':
          game.home_team = 'A'.repeat(101);
          break;
        case 'long_away_team':
          game.away_team = 'A'.repeat(101);
          break;
        case 'invalid_state':
          game.state = 'INVALID';
          break;
        case 'invalid_country':
          game.country = 'INVALID';
          break;
        case 'invalid_gender':
          game.gender = 'invalid-gender';
          break;
        case 'invalid_status':
          game.status = 'invalid-status';
          break;
      }
    });
    
    return { ...game, ...overrides };
  }

  /**
   * Build a game with team information
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with team information
   */
  static buildGameWithTeams(overrides = {}) {
    return {
      ...this.buildValidGame(),
      home_team_id: 'team-1',
      away_team_id: 'team-2',
      home_team: {
        id: 'team-1',
        name: 'Home Team',
        short_name: 'HOME',
        mascot: 'Lions',
        city: 'Home City',
        state: 'CA',
        conference: 'Test Conference'
      },
      away_team: {
        id: 'team-2',
        name: 'Away Team',
        short_name: 'AWAY',
        mascot: 'Tigers',
        city: 'Away City',
        state: 'NY',
        conference: 'Test Conference'
      },
      ...overrides
    };
  }

  /**
   * Build a game with conference information
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with conference information
   */
  static buildGameWithConference(overrides = {}) {
    return {
      ...this.buildValidGame(),
      conference_id: 'conf-1',
      conference: {
        id: 'conf-1',
        name: 'Test Conference',
        short_name: 'TEST',
        level: 'd1',
        region: 'West',
        country: 'USA'
      },
      ...overrides
    };
  }

  /**
   * Build a game with venue information
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Game data with venue information
   */
  static buildGameWithVenue(overrides = {}) {
    return {
      ...this.buildValidGame(),
      venue_id: 'venue-1',
      venue: {
        id: 'venue-1',
        name: 'Test Arena',
        city: 'Test City',
        state: 'CA',
        country: 'USA',
        capacity: 20000
      },
      ...overrides
    };
  }
}
