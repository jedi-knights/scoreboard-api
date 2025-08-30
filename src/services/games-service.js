import { GamesServiceInterface } from '../interfaces/games-service-interface.js';
import { createTransactionManager } from '../utils/transaction-manager.js';
import logger from '../utils/logger.js';
import { ErrorFactory } from '../utils/errors.js';
import { businessConfig } from '../config/index.js';
import { GameValidator } from '../validators/game-validator.js';

/**
 * Games Service
 *
 * Handles business logic for games operations.
 * Implements transaction management for data consistency.
 */
export class GamesService extends GamesServiceInterface {
  constructor (gamesRepository, databaseAdapter) {
    super();

    if (!gamesRepository) {
      throw ErrorFactory.service('GamesService', 'constructor', 'GamesRepository is required');
    }

    if (!databaseAdapter) {
      throw ErrorFactory.service('GamesService', 'constructor', 'DatabaseAdapter is required');
    }

    this.gamesRepository = gamesRepository;
    this.databaseAdapter = databaseAdapter;
    this.transactionManager = createTransactionManager(databaseAdapter);
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
      const { limit = businessConfig.games.pagination.defaultLimit, offset = businessConfig.games.pagination.defaultOffset } = sanitizedOptions;
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
      logger.error('Error in getGames service', error, {
        service: 'GamesService',
        operation: 'getGames',
        filters,
        options
      });
      throw ErrorFactory.service('GamesService', 'getGames', error.message);
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
        throw ErrorFactory.notFound('Game', gameId);
      }

      return {
        success: true,
        data: game
      };
    } catch (error) {
      logger.error('Error in getGameById service', error, {
        service: 'GamesService',
        operation: 'getGameById',
        gameId
      });
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
      logger.error('Error in getLiveGames service', error, {
        service: 'GamesService',
        operation: 'getLiveGames',
        filters
      });
      throw ErrorFactory.service('GamesService', 'getLiveGames', error.message);
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
        throw ErrorFactory.badRequest('Start date and end date are required');
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw ErrorFactory.badRequest('Start date must be before or equal to end date');
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
      logger.error('Error in getGamesByDateRange service', error, {
        service: 'GamesService',
        operation: 'getGamesByDateRange',
        startDate,
        endDate,
        filters
      });
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
        throw ErrorFactory.badRequest('Team name is required');
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
      logger.error('Error in getGamesByTeam service', error, {
        service: 'GamesService',
        operation: 'getGamesByTeam',
        teamName,
        filters
      });
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
      GameValidator.validateGameData(gameData);

      // Execute in transaction to ensure data consistency
      return await this.transactionManager.executeInTransaction(async (transaction, transactionId) => {
        logger.debug('Creating game in transaction', {
          transactionId,
          gameId: gameData.game_id
        });

        // Check if game already exists
        const existingGame = await this.gamesRepository.findById(gameData.game_id, transaction);
        if (existingGame) {
          throw ErrorFactory.conflict('Game with this ID already exists', 'game', { gameId: gameData.game_id });
        }

        // Create the game
        const createdGame = await this.gamesRepository.create(gameData, transaction);

        logger.debug('Game created successfully in transaction', {
          transactionId,
          gameId: createdGame.game_id
        });

        return {
          success: true,
          data: createdGame,
          message: 'Game created successfully',
          metadata: {
            transactionId
          }
        };
      });

    } catch (error) {
      logger.error('Error in createGame service', error, {
        service: 'GamesService',
        operation: 'createGame',
        gameData
      });
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
      GameValidator.validateGameUpdateData(updateData);

      // Execute in transaction to ensure data consistency
      return await this.transactionManager.executeInTransaction(async (transaction, transactionId) => {
        logger.debug('Updating game in transaction', {
          transactionId,
          gameId
        });

        // Check if game exists and get current data
        const existingGame = await this.gamesRepository.findById(gameId, transaction);
        if (!existingGame) {
          throw new Error('Game not found');
        }

        // Update the game
        const updatedGame = await this.gamesRepository.update(gameId, updateData, transaction);

        logger.debug('Game updated successfully in transaction', {
          transactionId,
          gameId
        });

        return {
          success: true,
          data: updatedGame,
          message: 'Game updated successfully',
          metadata: {
            transactionId,
            previousData: existingGame
          }
        };
      });

    } catch (error) {
      logger.error('Error in updateGame service', error, {
        service: 'GamesService',
        operation: 'updateGame',
        gameId,
        updateData
      });
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

      // Execute in transaction to ensure data consistency
      return await this.transactionManager.executeInTransaction(async (transaction, transactionId) => {
        logger.debug('Deleting game in transaction', {
          transactionId,
          gameId
        });

        // Check if game exists and get current data for potential rollback
        const existingGame = await this.gamesRepository.findById(gameId, transaction);
        if (!existingGame) {
          throw new Error('Game not found');
        }

        // Delete the game
        const deleted = await this.gamesRepository.delete(gameId, transaction);

        logger.debug('Game deleted successfully in transaction', {
          transactionId,
          gameId
        });

        return {
          success: true,
          message: 'Game deleted successfully',
          metadata: {
            gameId,
            transactionId,
            deleted,
            deletedGameData: existingGame
          }
        };
      });

    } catch (error) {
      logger.error('Error in deleteGame service', error, {
        service: 'GamesService',
        operation: 'deleteGame',
        gameId
      });
      throw error;
    }
  }

  /**
   * Bulk create games with transaction support
   * @param {Array<Object>} gamesData - Array of game data
   * @returns {Promise<Object>} Bulk creation result
   */
  async bulkCreateGames (gamesData) {
    try {
      // Validate all game data
      for (const gameData of gamesData) {
        GameValidator.validateGameData(gameData);
      }

      // Execute in transaction to ensure all-or-nothing behavior
      return await this.transactionManager.executeInTransaction(async (transaction, transactionId) => {
        logger.debug('Bulk creating games in transaction', {
          transactionId,
          gamesCount: gamesData.length
        });

        const createdGames = [];
        const errors = [];

        // Process each game
        for (let i = 0; i < gamesData.length; i++) {
          const gameData = gamesData[i];

          try {
            // Check if game already exists
            const existingGame = await this.gamesRepository.findById(gameData.game_id, transaction);
            if (existingGame) {
              errors.push({
                index: i,
                gameId: gameData.game_id,
                error: 'Game with this ID already exists'
              });
              continue;
            }

            // Create the game
            const createdGame = await this.gamesRepository.create(gameData, transaction);
            createdGames.push(createdGame);

          } catch (error) {
            errors.push({
              index: i,
              gameId: gameData.game_id,
              error: error.message
            });
          }
        }

        // If any errors occurred, the transaction will be rolled back
        if (errors.length > 0) {
          throw new Error(`Failed to create ${errors.length} games: ${JSON.stringify(errors)}`);
        }

        logger.debug('Bulk games creation completed successfully in transaction', {
          transactionId,
          createdGamesCount: createdGames.length
        });

        return {
          success: true,
          data: createdGames,
          message: `Successfully created ${createdGames.length} games`,
          metadata: {
            transactionId,
            totalProcessed: gamesData.length,
            successfulCreations: createdGames.length
          }
        };
      });

    } catch (error) {
      logger.error('Error in bulkCreateGames service', error, {
        service: 'GamesService',
        operation: 'bulkCreateGames',
        gamesCount: gamesData.length
      });
      throw error;
    }
  }

  /**
   * Update multiple games with transaction support
   * @param {Array<Object>} updates - Array of update objects with gameId and updateData
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateGames (updates) {
    try {
      // Validate all update data
      for (const update of updates) {
        if (!update.gameId) {
          throw new Error('Game ID is required for all updates');
        }
        GameValidator.validateGameUpdateData(update.updateData);
      }

      // Execute in transaction to ensure all-or-nothing behavior
      return await this.transactionManager.executeInTransaction(async (transaction, transactionId) => {
        logger.debug('Bulk updating games in transaction', {
          transactionId,
          updatesCount: updates.length
        });

        const updatedGames = [];
        const errors = [];

        // Process each update
        for (let i = 0; i < updates.length; i++) {
          const { gameId, updateData } = updates[i];

          try {
            // Check if game exists
            const existingGame = await this.gamesRepository.findById(gameId, transaction);
            if (!existingGame) {
              errors.push({
                index: i,
                gameId,
                error: 'Game not found'
              });
              continue;
            }

            // Update the game
            const updatedGame = await this.gamesRepository.update(gameId, updateData, transaction);
            updatedGames.push(updatedGame);

          } catch (error) {
            errors.push({
              index: i,
              gameId,
              error: error.message
            });
          }
        }

        // If any errors occurred, the transaction will be rolled back
        if (errors.length > 0) {
          throw new Error(`Failed to update ${errors.length} games: ${JSON.stringify(errors)}`);
        }

        logger.debug('Bulk games update completed successfully in transaction', {
          transactionId,
          updatedGamesCount: updatedGames.length
        });

        return {
          success: true,
          data: updatedGames,
          message: `Successfully updated ${updatedGames.length} games`,
          metadata: {
            transactionId,
            totalProcessed: updates.length,
            successfulUpdates: updatedGames.length
          }
        };
      });

    } catch (error) {
      logger.error('Error in bulkUpdateGames service', error, {
        service: 'GamesService',
        operation: 'bulkUpdateGames',
        updatesCount: updates.length
      });
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
      logger.error('Error in getGameStatistics service', error, {
        service: 'GamesService',
        operation: 'getGameStatistics',
        filters
      });
      throw ErrorFactory.service('GamesService', 'getGameStatistics', error.message);
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
      // Return null for empty strings after trimming
      if (sanitized === '') {
        return null;
      }
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
    if (!filters) {
      return {};
    }

    const filterConfigs = [
      { key: 'date', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: false },
      { key: 'sport', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: true },
      { key: 'status', sanitizer: this._validateStatus.bind(this), toLowerCase: false },
      { key: 'conference', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: false },
      { key: 'homeTeam', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: false },
      { key: 'awayTeam', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: false },
      { key: 'dataSource', sanitizer: this._sanitizeStringFilter.bind(this), toLowerCase: true }
    ];

    return this.processFilters(filters, filterConfigs);
  }

  /**
   * Process filters using configuration
   * @param {Object} filters - Raw filters
   * @param {Array} filterConfigs - Filter configurations
   * @returns {Object} Sanitized filters
   * @private
   */
  processFilters (filters, filterConfigs) {
    const sanitized = {};

    filterConfigs.forEach(config => {
      const value = filters[config.key];
      if (value !== undefined) {
        const sanitizedValue = config.sanitizer(value, config.toLowerCase);
        if (sanitizedValue) {
          sanitized[config.key] = sanitizedValue;
        }
      }
    });

    return sanitized;
  }


  _sanitizeSortOrder (sortOrder) {
    if (sortOrder && typeof sortOrder === 'string') {
      return sortOrder.toUpperCase() === 'ASC' ? 'ASC' : businessConfig.games.sortOptions.defaultOrder;
    }
    return businessConfig.games.sortOptions.defaultOrder;
  }

  /**
   * Sanitize and validate options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  sanitizeOptions (options) {
    return GameValidator.sanitizePaginationOptions(options);
  }
}
