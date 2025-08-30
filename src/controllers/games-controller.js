import {
  generateCollectionLinks,
  generateResourceLinks,
  generateActionLinks,
  enhanceWithLinks
} from '../utils/hateoas.js';
import logger from '../utils/logger.js';
import { GamesResponseFormatter } from '../utils/response-formatter.js';

/**
 * Games Controller
 *
 * Handles HTTP requests for games endpoints.
 * Implements the MVC pattern by delegating business logic to the service layer.
 */
export class GamesController {
  constructor (gamesService) {
    this.gamesService = gamesService;
  }

  /**
   * Get all games with filters and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGames (req, res) {
    const filters = req.query;
    const options = this.buildPaginationOptions(req.query);

    try {
      const result = await this.gamesService.getGames(filters, options);
      const pagination = this.buildPagination(result, options);
      const enhancedResult = this.enhanceGamesResult(req, result, pagination, filters);

      const response = GamesResponseFormatter.formatGamesListResponse(enhancedResult, pagination);
      res.status(response.status).json(response.body);
    } catch (error) {
      this.handleGamesError(error, res, 'getGames', req.query, options);
    }
  }

  /**
   * Build pagination options from request query
   * @param {Object} query - Request query object
   * @returns {Object} Pagination options
   * @private
   */
  buildPaginationOptions (query) {
    return {
      limit: parseInt(query.limit) || 10,
      offset: parseInt(query.offset) || 0,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    };
  }

  /**
   * Build pagination object from result and options
   * @param {Object} result - Service result
   * @param {Object} options - Pagination options
   * @returns {Object} Pagination object
   * @private
   */
  buildPagination (result, options) {
    return {
      page: Math.floor(options.offset / options.limit) + 1,
      limit: options.limit,
      total: result.total || result.games?.length || 0
    };
  }

  /**
   * Enhance games result with HATEOAS links
   * @param {Object} req - Request object
   * @param {Object} result - Service result
   * @param {Object} pagination - Pagination object
   * @param {Object} filters - Applied filters
   * @returns {Object} Enhanced result with links
   * @private
   */
  enhanceGamesResult (req, result, pagination, filters) {
    const collectionLinks = generateCollectionLinks(req, 'games', pagination, filters);
    const actionLinks = generateActionLinks(req, 'games');

    return enhanceWithLinks(req, result, {
      ...collectionLinks,
      ...actionLinks
    });
  }

  /**
   * Handle errors in games controller methods
   * @param {Error} error - Error object
   * @param {Object} res - Response object
   * @param {string} operation - Operation name
   * @param {Object} filters - Applied filters
   * @param {Object} options - Pagination options
   * @private
   */
  handleGamesError (error, res, operation, filters, options) {
    logger.error(`Error in ${operation} controller`, error, {
      controller: 'GamesController',
      operation,
      filters,
      options
    });

    if (error.message.includes('not found') || error.message.includes('Not found')) {
      const response = GamesResponseFormatter.formatGameNotFoundError('games');
      return res.status(response.status).json(response.body);
    }

    const response = GamesResponseFormatter.formatError(error, 500);
    res.status(response.status).json(response.body);
  }

  /**
   * Get a specific game by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGameById (req, res) {
    const { id } = req.params;
    try {
      const result = await this.gamesService.getGameById(id);
      const relatedResources = this.buildRelatedResources(result);
      const enhancedResult = this.enhanceGameResult(req, result, id, relatedResources);

      const response = GamesResponseFormatter.formatGameResponse(enhancedResult);
      res.status(response.status).json(response.body);
    } catch (error) {
      this.handleGamesError(error, res, 'getGameById', { gameId: id });
    }
  }

  /**
   * Build related resources object for HATEOAS links
   * @param {Object} result - Game result
   * @returns {Object} Related resources object
   * @private
   */
  buildRelatedResources (result) {
    const relatedResources = {};
    if (result.homeTeamId) relatedResources.team = result.homeTeamId;
    if (result.awayTeamId) relatedResources.team = result.awayTeamId;
    if (result.conferenceId) relatedResources.conference = result.conferenceId;
    if (result.venueId) relatedResources.venue = result.venueId;
    return relatedResources;
  }

  /**
   * Enhance game result with HATEOAS links
   * @param {Object} req - Request object
   * @param {Object} result - Game result
   * @param {string} id - Game ID
   * @param {Object} relatedResources - Related resources
   * @returns {Object} Enhanced result with links
   * @private
   */
  enhanceGameResult (req, result, id, relatedResources) {
    const resourceLinks = generateResourceLinks(req, 'games', id, relatedResources);
    const actionLinks = generateActionLinks(req, 'games', id);

    return enhanceWithLinks(req, result, {
      ...resourceLinks,
      ...actionLinks
    });
  }

  /**
   * Get live games (in progress)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLiveGames (req, res) {
    const filters = req.query;
    try {
      const liveGames = await this.gamesService.getLiveGames(filters);
      const response = GamesResponseFormatter.formatGamesListResponse(liveGames);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in getLiveGames controller', error, {
        controller: 'GamesController',
        operation: 'getLiveGames',
        filters: req.query
      });

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Get games by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGamesByDateRange (req, res) {
    const { startDate, endDate } = req.query;
    const filters = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Start date and end date are required'
      });
    }

    try {
      const result = await this.gamesService.getGamesByDateRange(startDate, endDate, filters);

      const response = GamesResponseFormatter.formatGamesListResponse(result);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in getGamesByDateRange controller', error, {
        controller: 'GamesController',
        operation: 'getGamesByDateRange',
        startDate,
        endDate,
        filters: req.query
      });

      // Handle specific error types
      if (error.message.includes('Start date must be before end date')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Get games by team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGamesByTeam (req, res) {
    const { teamName } = req.params;
    const filters = req.query;

    try {
      const result = await this.gamesService.getGamesByTeam(teamName, filters);

      const response = GamesResponseFormatter.formatGamesListResponse(result);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in getGamesByTeam controller', error, {
        controller: 'GamesController',
        operation: 'getGamesByTeam',
        teamName,
        filters: req.query
      });

      // Handle specific error types
      if (error.message.includes('Team name is required')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Create a new game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createGame (req, res) {
    try {
      const gameData = req.body;
      const result = await this.gamesService.createGame(gameData);

      // Add HATEOAS resource links for the created game
      const enhancedResult = this._enhanceGameWithLinks(req, result);

      const response = GamesResponseFormatter.formatGameCreationResponse(enhancedResult);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in createGame controller', error, {
        controller: 'GamesController',
        operation: 'createGame',
        gameData: req.body
      });

      // Handle specific error types
      if (error.message.includes('validation') || error.message.includes('Validation') ||
          error.message.includes('Missing required field') || error.message.includes('Invalid')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Enhance a game with HATEOAS links
   * @param {Object} req - Express request object
   * @param {Object} game - Game object to enhance
   * @returns {Object} Enhanced game with links
   */
  _enhanceGameWithLinks (req, game) {
    const relatedResources = {};
    if (game.homeTeamId) relatedResources.team = game.homeTeamId;
    if (game.awayTeamId) relatedResources.team = game.awayTeamId;
    if (game.conferenceId) relatedResources.conference = game.conferenceId;
    if (game.venueId) relatedResources.venue = game.venueId;

    const resourceLinks = generateResourceLinks(req, 'games', game.id, relatedResources);
    const actionLinks = generateActionLinks(req, 'games', game.id);

    return enhanceWithLinks(req, game, {
      ...resourceLinks,
      ...actionLinks
    });
  }


  /**
   * Update an existing game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateGame (req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const result = await this.gamesService.updateGame(id, updateData);

      const response = GamesResponseFormatter.formatGameUpdateResponse(result);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in updateGame controller', error, {
        controller: 'GamesController',
        operation: 'updateGame',
        gameId: id,
        updateData
      });

      // Handle specific error types
      if (error.message.includes('Game ID is required')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      if (error.message.includes('not found') || error.message.includes('Not found')) {
        const response = GamesResponseFormatter.formatGameNotFoundError(id);
        return res.status(response.status).json(response.body);
      }

      if (error.message.includes('Invalid date format') || error.message.includes('Invalid')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Delete a game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteGame (req, res) {
    const { id } = req.params;

    try {
      const result = await this.gamesService.deleteGame(id);
      const response = GamesResponseFormatter.formatGameDeletionResponse(result);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in deleteGame controller', error, {
        controller: 'GamesController',
        operation: 'deleteGame',
        gameId: id
      });

      // Handle specific error types
      if (error.message.includes('Game ID is required')) {
        const response = GamesResponseFormatter.formatBadRequestError(error.message);
        return res.status(response.status).json(response.body);
      }

      if (error.message.includes('not found') || error.message.includes('Not found')) {
        const response = GamesResponseFormatter.formatGameNotFoundError(id);
        return res.status(response.status).json(response.body);
      }

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }

  /**
   * Get game statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGameStatistics (req, res) {
    const filters = req.query;
    try {
      const statistics = await this.gamesService.getGameStatistics(filters);
      const response = GamesResponseFormatter.formatGameStatisticsResponse(statistics, req.query);
      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in getGameStatistics controller', error, {
        controller: 'GamesController',
        operation: 'getGameStatistics',
        filters: req.query
      });

      const response = GamesResponseFormatter.formatError(error, 500);
      res.status(response.status).json(response.body);
    }
  }
}
