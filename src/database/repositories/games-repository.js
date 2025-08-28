import { BaseRepository } from './base-repository.js';

/**
 * Games Repository
 * 
 * Implements the BaseRepository interface for games data access.
 * Provides games-specific query methods and business logic.
 */
export class GamesRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super(databaseAdapter);
  }

  /**
   * Find all games with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of games
   */
  async findAll(filters = {}, options = {}) {
    const { limit = 50, offset = 0, sortBy = 'date', sortOrder = 'DESC' } = options;
    
    let query = 'SELECT * FROM games WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (filters.date) {
      query += ` AND date = $${paramIndex++}`;
      params.push(filters.date);
    }

    if (filters.sport) {
      query += ` AND sport = $${paramIndex++}`;
      params.push(filters.sport);
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.conference) {
      query += ` AND (home_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}) OR away_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}))`;
      params.push(filters.conference);
      paramIndex++;
    }

    if (filters.homeTeam) {
      query += ` AND home_team = $${paramIndex++}`;
      params.push(filters.homeTeam);
    }

    if (filters.awayTeam) {
      query += ` AND away_team = $${paramIndex++}`;
      params.push(filters.awayTeam);
    }

    if (filters.dataSource) {
      query += ` AND data_source = $${paramIndex++}`;
      params.push(filters.dataSource);
    }

    // Apply sorting
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Apply pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    return this.executeQuery(query, params);
  }

  /**
   * Find a game by ID
   * @param {string} gameId - Game identifier
   * @returns {Promise<Object|null>} Game or null if not found
   */
  async findById(gameId) {
    const query = 'SELECT * FROM games WHERE game_id = ?';
    return this.executeQuerySingle(query, [gameId]);
  }

  /**
   * Find games by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of games
   */
  async findByDateRange(startDate, endDate, filters = {}) {
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

    return this.executeQuery(query, params);
  }

  /**
   * Find live games (in progress)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of live games
   */
  async findLiveGames(filters = {}) {
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

    return this.executeQuery(query, params);
  }

  /**
   * Find games by team
   * @param {string} teamName - Team name
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of games
   */
  async findByTeam(teamName, filters = {}) {
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

    return this.executeQuery(query, params);
  }

  /**
   * Create a new game
   * @param {Object} gameData - Game data
   * @returns {Promise<Object>} Created game
   */
  async create(gameData) {
    const requiredFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];
    
    // Validate required fields
    for (const field of requiredFields) {
      if (!gameData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const query = `
      INSERT INTO games (
        game_id, data_source, league_name, date, home_team, away_team, 
        sport, home_score, away_score, status, current_period, period_scores,
        venue, city, state, country, timezone, broadcast_info, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      gameData.game_id,
      gameData.data_source,
      gameData.league_name || null,
      gameData.date,
      gameData.home_team,
      gameData.away_team,
      gameData.sport,
      gameData.home_score || null,
      gameData.away_score || null,
      gameData.status,
      gameData.current_period || null,
      gameData.period_scores ? JSON.stringify(gameData.period_scores) : null,
      gameData.venue || null,
      gameData.city || null,
      gameData.state || null,
      gameData.country || null,
      gameData.timezone || null,
      gameData.broadcast_info || null,
      gameData.notes || null
    ];

    const result = await this.executeQueryRun(query, params);
    
    // Return the created game
    return this.findById(gameData.game_id);
  }

  /**
   * Update an existing game
   * @param {string} gameId - Game identifier
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated game or null if not found
   */
  async update(gameId, updateData) {
    // Check if game exists
    const existingGame = await this.findById(gameId);
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
    
    await this.executeQueryRun(query, params);
    
    // Return the updated game
    return this.findById(gameId);
  }

  /**
   * Delete a game
   * @param {string} gameId - Game identifier
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(gameId) {
    const query = 'DELETE FROM games WHERE game_id = ?';
    const result = await this.executeQueryRun(query, [gameId]);
    return result.changes > 0;
  }

  /**
   * Count games matching criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Count of matching games
   */
  async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM games WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters (same logic as findAll)
    if (filters.date) {
      query += ` AND date = $${paramIndex++}`;
      params.push(filters.date);
    }

    if (filters.sport) {
      query += ` AND sport = $${paramIndex++}`;
      params.push(filters.sport);
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.conference) {
      query += ` AND (home_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}) OR away_team IN (SELECT name FROM teams WHERE conference = $${paramIndex}))`;
      params.push(filters.conference);
      paramIndex++;
    }

    const result = await this.executeQuerySingle(query, params);
    return result ? result.count : 0;
  }

  /**
   * Check if a game exists
   * @param {Object} criteria - Search criteria
   * @returns {Promise<boolean>} True if game exists
   */
  async exists(criteria) {
    if (criteria.game_id) {
      const game = await this.findById(criteria.game_id);
      return !!game;
    }

    let query = 'SELECT COUNT(*) as count FROM games WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    Object.keys(criteria).forEach(key => {
      query += ` AND ${key} = $${paramIndex++}`;
      params.push(criteria[key]);
    });

    const result = await this.executeQuerySingle(query, params);
    return result ? result.count > 0 : false;
  }

  /**
   * Get game statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Game statistics
   */
  async getStatistics(filters = {}) {
    let query = 'SELECT ';
    const params = [];
    let paramIndex = 1;

    // Build statistics query
    query += `
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

    // Apply filters
    if (filters.date) {
      query += ` AND date = $${paramIndex++}`;
      params.push(filters.date);
    }

    if (filters.sport) {
      query += ` AND sport = $${paramIndex++}`;
      params.push(filters.sport);
    }

    if (filters.dataSource) {
      query += ` AND data_source = $${paramIndex++}`;
      params.push(filters.dataSource);
    }

    const result = await this.executeQuerySingle(query, params);
    return result || {};
  }
}
