import { businessConfig } from '../config/index.js';
import { NCAAIngestionResponseFormatter } from '../utils/response-formatter.js';
import logger from '../utils/logger.js';

/**
 * NCAA Ingestion Controller
 *
 * Handles HTTP requests for ingesting NCAA game records from the scoreboard platform.
 * This controller ensures proper request validation and response formatting.
 */
export class NCAAIngestionController {
  constructor (ncaaIngestionService) {
    this.ncaaIngestionService = ncaaIngestionService;
  }

  /**
   * POST /api/ncaa/ingest/game
   * Ingest a single NCAA game record
   */
  async ingestGame (req, res) {
    try {
      const ncaaGameData = req.body;

      if (!ncaaGameData) {
        const response = NCAAIngestionResponseFormatter.formatBadRequestError(
          'Request body is required'
        );
        return res.status(response.status).json(response.body);
      }

      // Ingest the game
      const result = await this.ncaaIngestionService.ingestGame(ncaaGameData);

      if (result.success) {
        const response = NCAAIngestionResponseFormatter.formatSingleIngestionSuccess(result);
        return res.status(response.status).json(response.body);
      } else {
        const response = NCAAIngestionResponseFormatter.formatError(
          result.message,
          'Ingestion Failed',
          result.error,
          400
        );
        return res.status(response.status).json(response.body);
      }

    } catch (error) {
      logger.error('Error in NCAA game ingestion', error, { controller: 'NCAAIngestionController', operation: 'ingestGame' });

      const response = NCAAIngestionResponseFormatter.formatError(
        error,
        'Internal Server Error',
        'Failed to process NCAA game ingestion',
        500
      );
      return res.status(response.status).json(response.body);
    }
  }

  /**
   * POST /api/ncaa/ingest/games
   * Ingest multiple NCAA game records
   */
  async ingestGames (req, res) {
    try {
      const ncaaGamesData = req.body;

      if (!ncaaGamesData || !Array.isArray(ncaaGamesData)) {
        const response = NCAAIngestionResponseFormatter.formatBadRequestError(
          'Request body must be an array of game data'
        );
        return res.status(response.status).json(response.body);
      }

      if (ncaaGamesData.length === 0) {
        const response = NCAAIngestionResponseFormatter.formatBadRequestError(
          'Games array cannot be empty'
        );
        return res.status(response.status).json(response.body);
      }

      // Limit batch size to prevent abuse
      const maxBatchSize = businessConfig.ncaaIngestion.maxBatchSize;
      if (ncaaGamesData.length > maxBatchSize) {
        const response = NCAAIngestionResponseFormatter.formatBatchSizeExceededError(
          maxBatchSize,
          ncaaGamesData.length
        );
        return res.status(response.status).json(response.body);
      }

      // Ingest the games
      const result = await this.ncaaIngestionService.ingestGames(ncaaGamesData);

      const response = NCAAIngestionResponseFormatter.formatBatchIngestionSuccess(result);
      return res.status(response.status).json(response.body);

    } catch (error) {
      logger.error('Error in NCAA games batch ingestion', error, { controller: 'NCAAIngestionController', operation: 'ingestGames' });

      const response = NCAAIngestionResponseFormatter.formatError(
        error,
        'Internal Server Error',
        error.message,
        500
      );
      return res.status(response.status).json(response.body);
    }
  }

  /**
   * GET /api/ncaa/ingest/health
   * Health check for NCAA ingestion service
   */
  async getHealth (req, res) {
    try {
      const response = NCAAIngestionResponseFormatter.formatHealthCheckResponse('ncaa-ingestion', '1.0.0');
      return res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Error in NCAA ingestion health check', error, { controller: 'NCAAIngestionController', operation: 'getHealth' });

      const response = NCAAIngestionResponseFormatter.formatError(
        error,
        'Internal Server Error',
        'NCAA Ingestion Service health check failed',
        500
      );
      return res.status(response.status).json(response.body);
    }
  }

  /**
   * POST /api/ncaa/ingest/validate
   * Validate NCAA game data without ingesting
   */
  async validateGameData (req, res) {
    try {
      const ncaaGameData = req.body;

      if (!ncaaGameData) {
        const response = NCAAIngestionResponseFormatter.formatBadRequestError(
          'Request body is required'
        );
        return res.status(response.status).json(response.body);
      }

      // Validate the data
      try {
        this.ncaaIngestionService.validateNCAAGameData(ncaaGameData);

        const gameId = this.ncaaIngestionService.generateGameId(ncaaGameData);
        const response = NCAAIngestionResponseFormatter.formatValidationSuccessResponse(gameId);
        return res.status(response.status).json(response.body);
      } catch (validationError) {
        const response = NCAAIngestionResponseFormatter.formatNCAAValidationError(validationError);
        return res.status(response.status).json(response.body);
      }

    } catch (error) {
      logger.error('Error in NCAA game data validation', error, { controller: 'NCAAIngestionController', operation: 'validateGameData' });

      const response = NCAAIngestionResponseFormatter.formatError(
        error,
        'Internal Server Error',
        'Failed to validate NCAA game data',
        500
      );
      return res.status(response.status).json(response.body);
    }
  }
}
