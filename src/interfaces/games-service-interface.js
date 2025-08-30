/**
 * Games Service Interface
 *
 * Defines the contract for games-related operations.
 * This interface allows services to depend on games functionality
 * without being tightly coupled to the concrete implementation.
 */
export class GamesServiceInterface {
  /**
   * Get all games with filters and pagination
   * @param {Object} _filters - Filter criteria
   * @param {Object} _options - Query options
   * @returns {Promise<Object>} Games data with metadata
   */
  async getGames (_filters = {}, _options = {}) {
    throw new Error('Method getGames must be implemented');
  }

  /**
   * Get a specific game by ID
   * @param {string} _gameId - Game identifier
   * @returns {Promise<Object>} Game data
   */
  async getGameById (_gameId) {
    throw new Error('Method getGameById must be implemented');
  }

  /**
   * Get live games (in progress)
   * @param {Object} _filters - Additional filters
   * @returns {Promise<Object>} Live games data
   */
  async getLiveGames (_filters = {}) {
    throw new Error('Method getLiveGames must be implemented');
  }

  /**
   * Get games by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} _filters - Additional filters
   * @returns {Promise<Object>} Games in date range
   */
  async getGamesByDateRange (startDate, endDate, _filters = {}) {
    throw new Error('Method getGamesByDateRange must be implemented');
  }

  /**
   * Get games by team name
   * @param {string} teamName - Team name to search for
   * @param {Object} _filters - Additional filters
   * @returns {Promise<Object>} Games for the specified team
   */
  async getGamesByTeam (teamName, _filters = {}) {
    throw new Error('Method getGamesByTeam must be implemented');
  }

  /**
   * Create a new game
   * @param {Object} _gameData - Game data to create
   * @returns {Promise<Object>} Created game
   */
  async createGame (_gameData) {
    throw new Error('Method createGame must be implemented');
  }

  /**
   * Update an existing game
   * @param {string} _gameId - Game ID to update
   * @param {Object} _updateData - Data to update
   * @returns {Promise<Object>} Updated game
   */
  async updateGame (_gameId, _updateData) {
    throw new Error('Method updateGame must be implemented');
  }

  /**
   * Delete a game
   * @param {string} _gameId - Game ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteGame (_gameId) {
    throw new Error('Method deleteGame must be implemented');
  }

  /**
   * Get game statistics
   * @param {Object} _filters - Filter criteria
   * @returns {Promise<Object>} Game statistics
   */
  async getGameStatistics (_filters = {}) {
    throw new Error('Method getGameStatistics must be implemented');
  }
}
