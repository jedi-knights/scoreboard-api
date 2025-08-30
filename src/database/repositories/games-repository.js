import { BaseRepository } from './base-repository.js';

/**
 * Games Repository
 *
 * Implements the BaseRepository interface for games data access.
 * Provides games-specific query methods and business logic.
 */
export class GamesRepository extends BaseRepository {
  constructor (databaseAdapter) {
    super(databaseAdapter);
  }

  /**
   * Build WHERE clause for date filter
   * @param {string} date - Date filter
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildDateFilter (date, paramIndex) {
    if (!date) return { fragment: '', paramIndex };
    return {
      fragment: ` AND date = $${paramIndex}`,
      paramIndex: paramIndex + 1
    };
  }

  /**
   * Build WHERE clause for sport filter
   * @param {string} sport - Sport filter
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildSportFilter (sport, paramIndex) {
    if (!sport) return { fragment: '', paramIndex };
    return {
      fragment: ` AND sport = $${paramIndex}`,
      paramIndex: paramIndex + 1
    };
  }

  /**
   * Build WHERE clause for status filter
   * @param {string} status - Status filter
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildStatusFilter (status, paramIndex) {
    if (!status) return { fragment: '', paramIndex };
    return {
      fragment: ` AND status = $${paramIndex}`,
      paramIndex: paramIndex + 1
    };
  }

  /**
   * Build WHERE clause for conference filter
   * @param {string} conference - Conference filter
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildConferenceFilter (conference, paramIndex) {
    if (!conference) return { fragment: '', paramIndex };
    return {
      fragment: ` AND (home_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}) OR away_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}))`,
      paramIndex: paramIndex + 1
    };
  }

  /**
   * Build WHERE clause for team filters
   * @param {Object} filters - Team filters
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildTeamFilters (filters, paramIndex) {
    let fragment = '';
    let newParamIndex = paramIndex;

    if (filters.homeTeam) {
      fragment += ` AND home_team = $${newParamIndex++}`;
    }

    if (filters.awayTeam) {
      fragment += ` AND away_team = $${newParamIndex++}`;
    }

    return { fragment, paramIndex: newParamIndex };
  }

  /**
   * Build WHERE clause for data source filter
   * @param {string} dataSource - Data source filter
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Query fragment and new param index
   */
  _buildDataSourceFilter (dataSource, paramIndex) {
    if (!dataSource) return { fragment: '', paramIndex };
    return {
      fragment: ` AND data_source = $${paramIndex}`,
      paramIndex: paramIndex + 1
    };
  }

  /**
   * Apply a single filter to the query
   * @param {Object} filter - Filter result from builder method
   * @param {string} value - Filter value
   * @param {string} query - Current query
   * @param {Array} params - Parameters array
   * @param {number} _paramIndex - Current parameter index
   * @returns {number} New parameter index
   */
  _applyFilter (filter, value, query, params, _paramIndex) {
    query += filter.fragment;
    if (filter.fragment) params.push(value);
    return filter.paramIndex;
  }

  /**
   * Find all games with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of games
   */
  async findAll (filters = {}, options = {}, transaction = null) {
    const { query, params } = this.buildFindAllQuery(filters, options);

    if (transaction) {
      return this.executeQuery(query, params, transaction);
    } else {
      return this.executeQuery(query, params);
    }
  }

  /**
   * Build the findAll query with filters and options
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Object} Query and parameters
   * @private
   */
  buildFindAllQuery (filters, options) {
    let query = 'SELECT * FROM games WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    const filterResult = this.applyAllFilters(filters, query, params, paramIndex);
    paramIndex = filterResult.paramIndex;
    query = filterResult.query;
    query = this.applySortingAndPagination(query, options, paramIndex, params);

    return { query, params };
  }

  /**
   * Apply all filters to the query
   * @param {Object} filters - Filter criteria
   * @param {string} query - Current query
   * @param {Array} params - Parameters array
   * @param {number} paramIndex - Current parameter index
   * @returns {Object} Object with new parameter index and modified query
   * @private
   */
  applyAllFilters (filters, query, params, paramIndex) {
    const filterConfigs = [
      { key: 'date', builder: this._buildDateFilter.bind(this) },
      { key: 'sport', builder: this._buildSportFilter.bind(this) },
      { key: 'status', builder: this._buildStatusFilter.bind(this) },
      { key: 'conference', builder: this._buildConferenceFilter.bind(this) },
      { key: 'dataSource', builder: this._buildDataSourceFilter.bind(this) }
    ];

    // Apply standard filters
    filterConfigs.forEach(config => {
      paramIndex = this._applyFilter(
        config.builder(filters[config.key], paramIndex),
        filters[config.key], query, params, paramIndex
      );
    });

    // Handle team filters separately due to multiple parameters
    const teamFilters = this._buildTeamFilters(filters, paramIndex);
    query += teamFilters.fragment;
    if (filters.homeTeam) params.push(filters.homeTeam);
    if (filters.awayTeam) params.push(filters.awayTeam);
    paramIndex = teamFilters.paramIndex;

    return { paramIndex, query };
  }

  /**
   * Apply sorting and pagination to the query
   * @param {string} query - Current query
   * @param {Object} options - Query options
   * @param {number} paramIndex - Current parameter index
   * @param {Array} params - Parameters array
   * @returns {string} Modified query string
   * @private
   */
  applySortingAndPagination (query, options, paramIndex, params) {
    const { limit = 50, offset = 0, sortBy = 'date', sortOrder = 'DESC' } = options;

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    return query;
  }

  /**
   * Find a game by ID
   * @param {string} gameId - Game identifier
   * @returns {Promise<Object|null>} Game or null if not found
   */
  async findById (gameId, transaction = null) {
    const query = 'SELECT * FROM games WHERE game_id = ?';

    if (transaction) {
      return this.executeQuerySingle(query, [gameId], transaction);
    } else {
      return this.executeQuerySingle(query, [gameId]);
    }
  }

  /**
   * Find games by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of games
   */
  async findByDateRange (startDate, endDate, filters = {}, transaction = null) {
    let query = 'SELECT * FROM games WHERE date BETWEEN ? AND ?';
    const params = [startDate, endDate];

    if (filters.sport) {
      query += ' AND sport = ?';
      params.push(filters.sport);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY date ASC, home_team ASC';

    if (transaction) {
      return this.executeQuery(query, params, transaction);
    } else {
      return this.executeQuery(query, params);
    }
  }

  /**
   * Find live games (in progress)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of live games
   */
  async findLiveGames (filters = {}, transaction = null) {
    let query = 'SELECT * FROM games WHERE status = "in_progress"';
    const params = [];

    if (filters.sport) {
      query += ' AND sport = ?';
      params.push(filters.sport);
    }

    if (filters.conference) {
      query += ' AND (home_team IN (SELECT name FROM teams WHERE conference = ?) OR away_team IN (SELECT name FROM teams WHERE conference = ?))';
      params.push(filters.conference, filters.conference);
    }

    query += ' ORDER BY date ASC, home_team ASC';

    if (transaction) {
      return this.executeQuery(query, params, transaction);
    } else {
      return this.executeQuery(query, params);
    }
  }

  /**
   * Find games by team
   * @param {string} teamName - Team name
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of games
   */
  async findByTeam (teamName, filters = {}, transaction = null) {
    let query = 'SELECT * FROM games WHERE (home_team = ? OR away_team = ?)';
    const params = [teamName, teamName];

    if (filters.season) {
      query += ' AND date LIKE ?';
      params.push(`${filters.season}%`);
    }

    if (filters.sport) {
      query += ' AND sport = ?';
      params.push(filters.sport);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY date DESC';

    if (transaction) {
      return this.executeQuery(query, params, transaction);
    } else {
      return this.executeQuery(query, params);
    }
  }

  /**
   * Validate required fields for game creation
   * @param {Object} gameData - Game data to validate
   * @throws {Error} If required fields are missing
   */
  _validateRequiredFields (gameData) {
    const requiredFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];

    for (const field of requiredFields) {
      if (!gameData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Build core game parameters
   * @param {Object} gameData - Game data
   * @returns {Array} Core parameters array
   */
  _buildCoreGameParams (gameData) {
    return [
      gameData.game_id,
      gameData.data_source,
      gameData.league_name || null,
      gameData.date,
      gameData.home_team,
      gameData.away_team,
      gameData.sport
    ];
  }

  /**
   * Build score-related parameters
   * @param {Object} gameData - Game data
   * @returns {Array} Score parameters array
   */
  _buildScoreParams (gameData) {
    return [
      gameData.home_score || null,
      gameData.away_score || null,
      gameData.status,
      gameData.current_period || null,
      gameData.period_scores ? JSON.stringify(gameData.period_scores) : null
    ];
  }

  /**
   * Build location-related parameters
   * @param {Object} gameData - Game data
   * @returns {Array} Location parameters array
   */
  _buildLocationParams (gameData) {
    return [
      gameData.venue || null,
      gameData.city || null,
      gameData.state || null,
      gameData.country || null,
      gameData.timezone || null
    ];
  }

  /**
   * Build additional game parameters
   * @param {Object} gameData - Game data
   * @returns {Array} Additional parameters array
   */
  _buildAdditionalParams (gameData) {
    return [
      gameData.broadcast_info || null,
      gameData.notes || null
    ];
  }

  /**
   * Build parameters array for game insertion
   * @param {Object} gameData - Game data
   * @returns {Array} Parameters array for SQL query
   */
  _buildGameParams (gameData) {
    return [
      ...this._buildCoreGameParams(gameData),
      ...this._buildScoreParams(gameData),
      ...this._buildLocationParams(gameData),
      ...this._buildAdditionalParams(gameData)
    ];
  }

  /**
   * Create a new game
   * @param {Object} gameData - Game data
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<Object>} Created game
   */
  async create (gameData, transaction = null) {
    this._validateRequiredFields(gameData);

    const query = `
      INSERT INTO games (
        game_id, data_source, league_name, date, home_team, away_team, 
        sport, home_score, away_score, status, current_period, period_scores,
        venue, city, state, country, timezone, broadcast_info, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = this._buildGameParams(gameData);

    if (transaction) {
      await this.executeQueryRun(query, params, transaction);
      return this.findById(gameData.game_id, transaction);
    } else {
      await this.executeQueryRun(query, params);
      return this.findById(gameData.game_id);
    }
  }

  /**
   * Update an existing game
   * @param {string} gameId - Game identifier
   * @param {Object} updateData - Update data
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<Object|null>} Updated game or null if not found
   */
  async update (gameId, updateData, transaction = null) {
    // Check if game exists
    const existingGame = await this.findById(gameId, transaction);
    if (!existingGame) {
      return null;
    }

    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'game_id' && key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramIndex++}`);

        // Handle special fields
        if (key === 'period_scores' && updateData[key]) {
          params.push(JSON.stringify(updateData[key]));
        } else {
          params.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return existingGame;
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // Add game_id to params for WHERE clause
    params.push(gameId);

    const query = `UPDATE games SET ${updateFields.join(', ')} WHERE game_id = $${paramIndex}`;

    if (transaction) {
      await this.executeQueryRun(query, params, transaction);
      return this.findById(gameId, transaction);
    } else {
      await this.executeQueryRun(query, params);
      return this.findById(gameId);
    }
  }

  /**
   * Delete a game
   * @param {string} gameId - Game identifier
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete (gameId, transaction = null) {
    const query = 'DELETE FROM games WHERE game_id = ?';

    if (transaction) {
      const result = await this.executeQueryRun(query, [gameId], transaction);
      return result.changes > 0;
    } else {
      const result = await this.executeQueryRun(query, [gameId]);
      return result.changes > 0;
    }
  }

  /**
   * Count games matching criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Count of matching games
   */
  async count (filters = {}, transaction = null) {
    const { query, params } = this.buildCountQuery(filters);

    if (transaction) {
      const result = await this.executeQuerySingle(query, params, transaction);
      return result ? result.count : 0;
    } else {
      const result = await this.executeQuerySingle(query, params);
      return result ? result.count : 0;
    }
  }

  /**
   * Build the count query with filters
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query and parameters
   * @private
   */
  buildCountQuery (filters) {
    let query = 'SELECT COUNT(*) as count FROM games WHERE 1=1';
    const params = [];

    this.applyCountFilters(filters, query, params, 1);

    return { query, params };
  }

  /**
   * Apply filters to the count query
   * @param {Object} filters - Filter criteria
   * @param {string} query - Current query
   * @param {Array} params - Parameters array
   * @param {number} paramIndex - Current parameter index
   * @returns {number} New parameter index
   * @private
   */
  applyCountFilters (filters, query, params, paramIndex) {
    let currentIndex = paramIndex;

    if (filters.date) {
      query += ` AND date = $${currentIndex++}`;
      params.push(filters.date);
    }

    if (filters.sport) {
      query += ` AND sport = $${currentIndex++}`;
      params.push(filters.sport);
    }

    if (filters.status) {
      query += ` AND status = $${currentIndex++}`;
      params.push(filters.status);
    }

    if (filters.conference) {
      query += ` AND (home_team IN (SELECT name FROM teams WHERE conference = $${currentIndex}) OR away_team IN (SELECT name FROM teams WHERE conference = $${currentIndex}))`;
      params.push(filters.conference);
      currentIndex++;
    }

    return currentIndex;
  }

  /**
   * Check if a game exists
   * @param {Object} criteria - Search criteria
   * @returns {Promise<boolean>} True if game exists
   */
  async exists (criteria, transaction = null) {
    if (criteria.game_id) {
      const game = await this.findById(criteria.game_id, transaction);
      return !!game;
    }

    let query = 'SELECT COUNT(*) as count FROM games WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    Object.keys(criteria).forEach(key => {
      query += ` AND ${key} = $${paramIndex++}`;
      params.push(criteria[key]);
    });

    if (transaction) {
      const result = await this.executeQuerySingle(query, params, transaction);
      return result ? result.count > 0 : false;
    } else {
      const result = await this.executeQuerySingle(query, params);
      return result ? result.count > 0 : false;
    }
  }

  /**
   * Get game statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Game statistics
   */
  async getStatistics (filters = {}, transaction = null) {
    const { query, params } = this.buildStatisticsQuery(filters);

    if (transaction) {
      const result = await this.executeQuerySingle(query, params, transaction);
      return result || {};
    } else {
      const result = await this.executeQuerySingle(query, params);
      return result || {};
    }
  }

  /**
   * Build the statistics query with filters
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query and parameters
   * @private
   */
  buildStatisticsQuery (filters) {
    let query = 'SELECT ';
    const params = [];

    query += this.buildStatisticsSelectClause();
    this.applyStatisticsFilters(filters, query, params, 1);

    return { query, params };
  }

  /**
   * Build the statistics SELECT clause
   * @returns {string} SELECT clause
   * @private
   */
  buildStatisticsSelectClause () {
    return `
      COUNT(*) as total_games,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as live_games,
      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_games,
      COUNT(CASE WHEN status = 'postponed' THEN 1 END) as postponed_games,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_games,
      COUNT(DISTINCT sport) as unique_sports,
      COUNT(DISTINCT data_source) as unique_sources
    FROM games WHERE 1=1
    `;
  }

  /**
   * Apply filters to the statistics query
   * @param {Object} filters - Filter criteria
   * @param {string} query - Current query
   * @param {Array} params - Parameters array
   * @param {number} paramIndex - Current parameter index
   * @returns {number} New parameter index
   * @private
   */
  applyStatisticsFilters (filters, query, params, paramIndex) {
    let currentIndex = paramIndex;

    if (filters.date) {
      query += ` AND date = $${currentIndex++}`;
      params.push(filters.date);
    }

    if (filters.sport) {
      query += ` AND sport = $${currentIndex++}`;
      params.push(filters.sport);
    }

    if (filters.dataSource) {
      query += ` AND data_source = $${currentIndex++}`;
      params.push(filters.dataSource);
    }

    return currentIndex;
  }
}
