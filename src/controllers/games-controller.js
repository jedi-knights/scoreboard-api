import { GamesService } from '../services/games-service.js';

/**
 * Games Controller
 * 
 * Handles HTTP requests for games endpoints.
 * Implements the MVC pattern by delegating business logic to the service layer.
 */
export class GamesController {
  constructor(databaseAdapter) {
    this.gamesService = new GamesService(databaseAdapter);
  }

  /**
   * Get all games with filters and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGames(req, res) {
    try {
      const filters = req.query;
      const options = {
        limit: req.query.limit,
        offset: req.query.offset,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await this.gamesService.getGames(filters, options);
      
      res.status(200).json(result);
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
  async getGameById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.gamesService.getGameById(id);
      
      res.status(200).json(result);
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
  async getLiveGames(req, res) {
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
  async getGamesByDateRange(req, res) {
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
  async getGamesByTeam(req, res) {
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
  async createGame(req, res) {
    try {
      const gameData = req.body;
      const result = await this.gamesService.createGame(gameData);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createGame controller:', error);
      
      if (error.message.includes('Missing required field') || 
          error.message.includes('Invalid date format') ||
          error.message.includes('Invalid status value') ||
          error.message.includes('Invalid sport') ||
          error.message.includes('already exists')) {
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
   * Update an existing game
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateGame(req, res) {
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
  async deleteGame(req, res) {
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
  async getGameStatistics(req, res) {
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
