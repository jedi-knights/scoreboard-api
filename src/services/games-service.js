import { GamesRepository } from '../database/repositories/games-repository.js';

/**
 * Games Service
 *
 * Service layer for games business logic.
 * Implements the Service Layer pattern to separate business logic from data access.
 */
export class GamesService {
  constructor (databaseAdapter) {
    this.gamesRepository = new GamesRepository(databaseAdapter);
  }

  /**
   * Get all games with filters and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Games data with metadata
   */
  async getGames (filters = {}, options = {}) {
    try {
      // Validate and sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters);
      const sanitizedOptions = this.sanitizeOptions(options);

      // Get games and count
      const [games, totalCount] = await Promise.all([
        this.gamesRepository.findAll(sanitizedFilters, sanitizedOptions),
        this.gamesRepository.count(sanitizedFilters)
      ]);

      // Calculate pagination metadata
      const { limit = 50, offset = 0 } = sanitizedOptions;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      return {
        success: true,
        data: games,
        metadata: {
          total: totalCount,
          page: currentPage,
          limit,
          offset,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1
        }
      };
    } catch (error) {
      console.error('Error in getGames service:', error);
      throw new Error('Failed to retrieve games');
    }
  }

  /**
   * Get a specific game by ID
   * @param {string} gameId - Game identifier
   * @returns {Promise<Object>} Game data
   */
  async getGameById (gameId) {
    try {
      if (!gameId) {
        throw new Error('Game ID is required');
      }

      const game = await this.gamesRepository.findById(gameId);

      if (!game) {
        throw new Error('Game not found');
      }

      return {
        success: true,
        data: game
      };
    } catch (error) {
      console.error('Error in getGameById service:', error);
      throw error;
    }
  }

  /**
   * Get live games (in progress)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Live games data
   */
  async getLiveGames (filters = {}) {
    try {
      const sanitizedFilters = this.sanitizeFilters(filters);
      const games = await this.gamesRepository.findLiveGames(sanitizedFilters);

      return {
        success: true,
        data: games,
        metadata: {
          total: games.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in getLiveGames service:', error);
      throw new Error('Failed to retrieve live games');
    }
  }

  /**
   * Get games by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Games data
   */
  async getGamesByDateRange (startDate, endDate, filters = {}) {
    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Start date must be before or equal to end date');
      }

      const sanitizedFilters = this.sanitizeFilters(filters);
      const games = await this.gamesRepository.findByDateRange(startDate, endDate, sanitizedFilters);

      return {
        success: true,
        data: games,
        metadata: {
          total: games.length,
          startDate,
          endDate,
          dateRange: `${startDate} to ${endDate}`
        }
      };
    } catch (error) {
      console.error('Error in getGamesByDateRange service:', error);
      throw error;
    }
  }

  /**
   * Get games by team
   * @param {string} teamName - Team name
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Games data
   */
  async getGamesByTeam (teamName, filters = {}) {
    try {
      if (!teamName) {
        throw new Error('Team name is required');
      }

      const sanitizedFilters = this.sanitizeFilters(filters);
      const games = await this.gamesRepository.findByTeam(teamName, sanitizedFilters);

      return {
        success: true,
        data: games,
        metadata: {
          total: games.length,
          team: teamName
        }
      };
    } catch (error) {
      console.error('Error in getGamesByTeam service:', error);
      throw error;
    }
  }

  /**
   * Create a new game
   * @param {Object} gameData - Game data
   * @returns {Promise<Object>} Created game data
   */
  async createGame (gameData) {
    try {
      // Validate game data
      this.validateGameData(gameData);

      // Check if game already exists
      const existingGame = await this.gamesRepository.findById(gameData.game_id);
      if (existingGame) {
        throw new Error('Game with this ID already exists');
      }

      // Create the game
      const createdGame = await this.gamesRepository.create(gameData);

      return {
        success: true,
        data: createdGame,
        message: 'Game created successfully'
      };
    } catch (error) {
      console.error('Error in createGame service:', error);
      throw error;
    }
  }

  /**
   * Update an existing game
   * @param {string} gameId - Game identifier
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated game data
   */
  async updateGame (gameId, updateData) {
    try {
      if (!gameId) {
        throw new Error('Game ID is required');
      }

      // Validate update data
      this.validateGameUpdateData(updateData);

      // Update the game
      const updatedGame = await this.gamesRepository.update(gameId, updateData);

      if (!updatedGame) {
        throw new Error('Game not found');
      }

      return {
        success: true,
        data: updatedGame,
        message: 'Game updated successfully'
      };
    } catch (error) {
      console.error('Error in updateGame service:', error);
      throw error;
    }
  }

  /**
   * Delete a game
   * @param {string} gameId - Game identifier
   * @returns {Promise<Object>} Deletion result
   */
  async deleteGame (gameId) {
    try {
      if (!gameId) {
        throw new Error('Game ID is required');
      }

      // Check if game exists
      const existingGame = await this.gamesRepository.findById(gameId);
      if (!existingGame) {
        throw new Error('Game not found');
      }

      // Delete the game
      const deleted = await this.gamesRepository.delete(gameId);

      return {
        success: true,
        message: 'Game deleted successfully',
        metadata: {
          gameId,
          deleted
        }
      };
    } catch (error) {
      console.error('Error in deleteGame service:', error);
      throw error;
    }
  }

  /**
   * Get game statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Statistics data
   */
  async getGameStatistics (filters = {}) {
    try {
      const sanitizedFilters = this.sanitizeFilters(filters);
      const statistics = await this.gamesRepository.getStatistics(sanitizedFilters);

      return {
        success: true,
        data: statistics,
        metadata: {
          timestamp: new Date().toISOString(),
          filters: sanitizedFilters
        }
      };
    } catch (error) {
      console.error('Error in getGameStatistics service:', error);
      throw new Error('Failed to retrieve game statistics');
    }
  }

  /**
   * Validate and sanitize a string filter
   * @param {string} value - Raw value
   * @param {boolean} toLowerCase - Whether to convert to lowercase
   * @returns {string|null} Sanitized value or null if invalid
   */
  _sanitizeStringFilter (value, toLowerCase = false) {
    if (value && typeof value === 'string') {
      const sanitized = value.trim();
      return toLowerCase ? sanitized.toLowerCase() : sanitized;
    }
    return null;
  }

  /**
   * Validate status filter
   * @param {string} status - Raw status
   * @returns {string|null} Valid status or null
   */
  _validateStatus (status) {
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled'];
    return validStatuses.includes(status) ? status : null;
  }

  /**
   * Sanitize and validate filters
   * @param {Object} filters - Raw filters
   * @returns {Object} Sanitized filters
   */
  sanitizeFilters (filters) {
    const sanitized = {};

    // Process each filter type
    const dateFilter = this._sanitizeStringFilter(filters.date);
    if (dateFilter) sanitized.date = dateFilter;

    const sportFilter = this._sanitizeStringFilter(filters.sport, true);
    if (sportFilter) sanitized.sport = sportFilter;

    const statusFilter = this._validateStatus(filters.status);
    if (statusFilter) sanitized.status = statusFilter;

    const conferenceFilter = this._sanitizeStringFilter(filters.conference);
    if (conferenceFilter) sanitized.conference = conferenceFilter;

    const homeTeamFilter = this._sanitizeStringFilter(filters.homeTeam);
    if (homeTeamFilter) sanitized.homeTeam = homeTeamFilter;

    const awayTeamFilter = this._sanitizeStringFilter(filters.awayTeam);
    if (awayTeamFilter) sanitized.awayTeam = awayTeamFilter;

    const dataSourceFilter = this._sanitizeStringFilter(filters.dataSource, true);
    if (dataSourceFilter) sanitized.dataSource = dataSourceFilter;

    return sanitized;
  }

  /**
   * Validate and sanitize limit option
   * @param {any} limit - Raw limit value
   * @returns {number} Sanitized limit
   */
  _sanitizeLimit (limit) {
    if (limit && !isNaN(limit)) {
      return Math.min(Math.max(parseInt(limit), 1), 100);
    }
    return 50;
  }

  /**
   * Validate and sanitize offset option
   * @param {any} offset - Raw offset value
   * @returns {number} Sanitized offset
   */
  _sanitizeOffset (offset) {
    if (offset && !isNaN(offset)) {
      return Math.max(parseInt(offset), 0);
    }
    return 0;
  }

  /**
   * Validate and sanitize sort by option
   * @param {string} sortBy - Raw sort by value
   * @returns {string} Valid sort field
   */
  _sanitizeSortBy (sortBy) {
    const validSortFields = ['date', 'home_team', 'away_team', 'sport', 'status', 'created_at'];
    if (sortBy && typeof sortBy === 'string' && validSortFields.includes(sortBy)) {
      return sortBy;
    }
    return 'date';
  }

  /**
   * Validate and sanitize sort order option
   * @param {string} sortOrder - Raw sort order value
   * @returns {string} Valid sort order
   */
  _sanitizeSortOrder (sortOrder) {
    if (sortOrder && typeof sortOrder === 'string') {
      return sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }
    return 'DESC';
  }

  /**
   * Sanitize and validate options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  sanitizeOptions (options) {
    return {
      limit: this._sanitizeLimit(options.limit),
      offset: this._sanitizeOffset(options.offset),
      sortBy: this._sanitizeSortBy(options.sortBy),
      sortOrder: this._sanitizeSortOrder(options.sortOrder)
    };
  }

  /**
   * Validate game data for creation
   * @param {Object} gameData - Game data to validate
   */
  validateGameData (gameData) {
    const requiredFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];

    for (const field of requiredFields) {
      if (!gameData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(gameData.date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Validate status
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled'];
    if (!validStatuses.includes(gameData.status)) {
      throw new Error('Invalid status value');
    }

    // Validate sport
    if (gameData.sport.length < 1 || gameData.sport.length > 50) {
      throw new Error('Sport name must be between 1 and 50 characters');
    }
  }

  /**
   * Validate game update data
   * @param {Object} updateData - Update data to validate
   */
  validateGameUpdateData (updateData) {
    if (updateData.date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (updateData.status) {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Invalid status value');
      }
    }

    if (updateData.sport && (updateData.sport.length < 1 || updateData.sport.length > 50)) {
      throw new Error('Sport name must be between 1 and 50 characters');
    }
  }
}
