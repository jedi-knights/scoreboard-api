import { GamesService } from '../services/games-service.js';
import {
  generateCollectionLinks,
  generateResourceLinks,
  generateActionLinks,
  enhanceWithLinks
} from '../utils/hateoas.js';

/**
 * Games Controller
 *
 * Handles HTTP requests for games endpoints.
 * Implements the MVC pattern by delegating business logic to the service layer.
 */
export class GamesController {
  constructor (databaseAdapter) {
    this.gamesService = new GamesService(databaseAdapter);
  }

  /**
   * Get all games with filters and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGames (req, res) {
    try {
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await this.gamesService.getGames(filters, options);

      // Add HATEOAS collection links
      const pagination = {
        page: Math.floor(options.offset / options.limit) + 1,
        limit: options.limit,
        total: result.total || result.games?.length || 0
      };

      const collectionLinks = generateCollectionLinks(req, 'games', pagination, filters);
      const actionLinks = generateActionLinks(req, 'games');

      const enhancedResult = enhanceWithLinks(req, result, {
        ...collectionLinks,
        ...actionLinks
      });

      res.status(200).json(enhancedResult);
    } catch (error) {
      console.error('Error in getGames controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Get a specific game by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGameById (req, res) {
    try {
      const { id } = req.params;
      const result = await this.gamesService.getGameById(id);

      // Add HATEOAS resource links
      const relatedResources = {};
      if (result.homeTeamId) relatedResources.team = result.homeTeamId;
      if (result.awayTeamId) relatedResources.team = result.awayTeamId;
      if (result.conferenceId) relatedResources.conference = result.conferenceId;
      if (result.venueId) relatedResources.venue = result.venueId;

      const resourceLinks = generateResourceLinks(req, 'games', id, relatedResources);
      const actionLinks = generateActionLinks(req, 'games', id);

      const enhancedResult = enhanceWithLinks(req, result, {
        ...resourceLinks,
        ...actionLinks
      });

      res.status(200).json(enhancedResult);
    } catch (error) {
      console.error('Error in getGameById controller:', error);

      if (error.message === 'Game not found') {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Game not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      }
    }
  }

  /**
   * Get live games (in progress)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLiveGames (req, res) {
    try {
      const filters = req.query;
      const result = await this.gamesService.getLiveGames(filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLiveGames controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Get games by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGamesByDateRange (req, res) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Start date and end date are required'
        });
      }

      const result = await this.gamesService.getGamesByDateRange(startDate, endDate, filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getGamesByDateRange controller:', error);

      if (error.message.includes('Start date must be before')) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      }
    }
  }

  /**
   * Get games by team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGamesByTeam (req, res) {
    try {
      const { teamName } = req.params;
      const filters = req.query;
      const result = await this.gamesService.getGamesByTeam(teamName, filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getGamesByTeam controller:', error);

      if (error.message === 'Team name is required') {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      }
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

      res.status(201).json(enhancedResult);
    } catch (error) {
      console.error('Error in createGame controller:', error);
      this._handleGameError(error, res);
    }
  }

  /**
   * Helper method to enhance game response with HATEOAS links
   * @param {Object} req - Express request object
   * @param {Object} game - Game data
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
   * Helper method to handle game-related errors
   * @param {Error} error - Error object
   * @param {Object} res - Express response object
   */
  _handleGameError (error, res) {
    const isValidationError = error.message.includes('Missing required field') ||
                             error.message.includes('Invalid date format') ||
                             error.message.includes('Invalid status value') ||
                             error.message.includes('Invalid sport') ||
                             error.message.includes('already exists');

    if (isValidationError) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Update an existing game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateGame (req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await this.gamesService.updateGame(id, updateData);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateGame controller:', error);

      if (error.message === 'Game ID is required') {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: error.message
        });
      } else if (error.message === 'Game not found') {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: error.message
        });
      } else if (error.message.includes('Invalid date format') ||
                 error.message.includes('Invalid status value') ||
                 error.message.includes('Invalid sport')) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      }
    }
  }

  /**
   * Delete a game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteGame (req, res) {
    try {
      const { id } = req.params;
      const result = await this.gamesService.deleteGame(id);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteGame controller:', error);

      if (error.message === 'Game ID is required') {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: error.message
        });
      } else if (error.message === 'Game not found') {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      }
    }
  }

  /**
   * Get game statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGameStatistics (req, res) {
    try {
      const filters = req.query;
      const result = await this.gamesService.getGameStatistics(filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getGameStatistics controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}
