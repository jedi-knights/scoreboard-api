/**
 * Response Formatter Classes
 *
 * Separates response formatting logic from business logic in controllers.
 * Makes formatting independently testable and maintains consistent API responses.
 *
 * Features:
 * - Consistent response structure across all endpoints
 * - HATEOAS link integration
 * - Standardized error handling
 * - Pagination support
 * - Metadata enrichment
 */

/**
 * Base response formatter with common formatting methods
 */
export class BaseResponseFormatter {
  /**
   * Format a successful response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Formatted response object
   */
  static formatSuccess (data = null, message = 'Success', metadata = {}, statusCode = 200) {
    const body = this.buildSuccessBody(data, message, metadata);
    return { status: statusCode, body };
  }

  /**
   * Build the success response body
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Response body
   * @private
   */
  static buildSuccessBody (data, message, metadata) {
    const body = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data) {
      body.data = data;
    }

    if (metadata && Object.keys(metadata).length > 0) {
      body.metadata = metadata;
    }

    return body;
  }

  /**
   * Format an error response
   * @param {Error|string} error - Error object or message
   * @param {string} errorType - Type of error (default: 'Internal Server Error')
   * @param {Object} details - Additional error details
   * @param {number} statusCode - HTTP status code (default: 500)
   * @returns {Object} Formatted error response object
   */
  static formatError (error, errorType = 'Internal Server Error', details = null, statusCode = 500) {
    const errorMessage = error instanceof Error ? error.message : error;

    return {
      status: statusCode,
      body: {
        success: false,
        error: errorType,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        ...(details && { details })
      }
    };
  }

  /**
   * Format a validation error response
   * @param {Error|string} error - Validation error
   * @param {Object} validationDetails - Validation failure details
   * @param {number} statusCode - HTTP status code (default: 400)
   * @returns {Object} Formatted validation error response
   */
  static formatValidationError (error, validationDetails = null, statusCode = 400) {
    return BaseResponseFormatter.formatError(error, 'Validation Failed', validationDetails, statusCode);
  }

  /**
   * Format a not found error response
   * @param {string} resource - Resource that was not found
   * @param {string} identifier - Identifier that was searched for
   * @param {number} statusCode - HTTP status code (default: 404)
   * @returns {Object} Formatted not found error response
   */
  static formatNotFoundError (resource = 'Resource', identifier = null, statusCode = 404) {
    const message = identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;

    return BaseResponseFormatter.formatError(message, 'Not Found', null, statusCode);
  }

  /**
   * Format a bad request error response
   * @param {string} message - Bad request message
   * @param {Object} details - Request validation details
   * @param {number} statusCode - HTTP status code (default: 400)
   * @returns {Object} Formatted bad request error response
   */
  static formatBadRequestError (message = 'Bad Request', details = null, statusCode = 400) {
    return BaseResponseFormatter.formatError(message, 'Bad Request', details, statusCode);
  }

  /**
   * Format a conflict error response
   * @param {string} message - Conflict message
   * @param {Object} details - Conflict details
   * @param {number} statusCode - HTTP status code (default: 409)
   * @returns {Object} Formatted conflict error response
   */
  static formatConflictError (message = 'Conflict', details = null, statusCode = 409) {
    return BaseResponseFormatter.formatError(message, 'Conflict', details, statusCode);
  }

  /**
   * Format a paginated response
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted paginated response
   */
  static formatPaginatedResponse (data, pagination, message = 'Data retrieved successfully', metadata = {}) {
    return this.formatSuccess(data, message, {
      pagination,
      ...metadata
    });
  }

  /**
   * Format a response with HATEOAS links
   * @param {Object} response - Base response object
   * @param {Object} links - HATEOAS links
   * @returns {Object} Response with links added
   */
  static addHATEOASLinks (response, links = {}) {
    if (Object.keys(links).length > 0) {
      if (!response.body) {
        response.body = {};
      }
      response.body.links = links;
    }
    return response;
  }

  /**
   * Format a response with metadata
   * @param {Object} response - Base response object
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Response with metadata added
   */
  static addMetadata (response, metadata = {}) {
    if (Object.keys(metadata).length > 0) {
      if (!response.body) {
        response.body = {};
      }
      if (!response.body.metadata) {
        response.body.metadata = {};
      }
      response.body.metadata = { ...response.body.metadata, ...metadata };
    }
    return response;
  }
}

/**
 * NCAA Ingestion specific response formatter
 */
export class NCAAIngestionResponseFormatter extends BaseResponseFormatter {
  /**
   * Format successful batch ingestion response
   * @param {Object} result - Ingestion result from service
   * @returns {Object} Formatted response object
   */
  static formatBatchIngestionSuccess (result) {
    const data = {
      summary: {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        skipped: result.skipped
      },
      details: result.details
    };

    return this.formatSuccess(data, 'Batch ingestion completed', {}, 200);
  }

  /**
   * Format successful single game ingestion response
   * @param {Object} result - Ingestion result from service
   * @returns {Object} Formatted response object
   */
  static formatSingleIngestionSuccess (result) {
    if (result.action === 'created') {
      return this.formatSuccess(
        {
          game_id: result.game_id,
          action: result.action,
          entities_created: result.entities_created
        },
        result.message,
        {},
        201
      );
    } else {
      // Game was skipped (already exists)
      return this.formatSuccess(
        {
          game_id: result.game_id,
          action: result.action,
          reason: result.reason
        },
        result.message,
        {},
        200
      );
    }
  }

  /**
   * Format batch size exceeded error response
   * @param {number} maxBatchSize - Maximum allowed batch size
   * @param {number} actualSize - Actual batch size provided
   * @returns {Object} Formatted error response object
   */
  static formatBatchSizeExceededError (maxBatchSize, actualSize) {
    return this.formatBadRequestError(
      `Batch size cannot exceed ${maxBatchSize} games`,
      {
        maxBatchSize,
        actualSize,
        suggestion: `Split your request into batches of ${maxBatchSize} or fewer games`
      }
    );
  }

  /**
   * Format validation error response for NCAA data
   * @param {Error} validationError - Validation error from service
   * @returns {Object} Formatted validation error response
   */
  static formatNCAAValidationError (validationError) {
    return this.formatValidationError(
      'NCAA game data validation failed',
      {
        error: validationError.message,
        suggestion: 'Check the data format and required fields'
      }
    );
  }

  /**
   * Format health check response
   * @param {string} serviceName - Name of the service
   * @param {string} version - Service version
   * @returns {Object} Formatted health check response
   */
  static formatHealthCheckResponse (serviceName = 'ncaa-ingestion', version = '1.0.0') {
    return this.formatSuccess(
      {
        service: serviceName,
        status: 'healthy',
        version
      },
      `${serviceName} service is healthy`
    );
  }

  /**
   * Format validation success response
   * @param {string} gameId - Generated game ID
   * @returns {Object} Formatted validation success response
   */
  static formatValidationSuccessResponse (gameId) {
    return this.formatSuccess(
      {
        valid: true,
        game_id: gameId
      },
      'NCAA game data is valid'
    );
  }
}

/**
 * Games service specific response formatter
 */
export class GamesResponseFormatter extends BaseResponseFormatter {
  /**
   * Format games list response with pagination
   * @param {Object} result - Games service result
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGamesListResponse (result, pagination, message = 'Games retrieved successfully') {
    const data = this.extractGamesData(result);
    const metadata = this.buildGamesMetadata(result);

    return this.formatPaginatedResponse(data, pagination, message, metadata);
  }

  /**
   * Extract games data from result object
   * @param {Object} result - Games service result
   * @returns {Array} Games data array
   * @private
   */
  static extractGamesData (result) {
    return result.games || result.data || result;
  }

  /**
   * Build metadata for games response
   * @param {Object} result - Games service result
   * @returns {Object} Metadata object
   * @private
   */
  static buildGamesMetadata (result) {
    return {
      filters: result.metadata?.filters || {},
      sortOptions: result.metadata?.sortOptions || {}
    };
  }

  /**
   * Format single game response
   * @param {Object} game - Game data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGameResponse (game, message = 'Game retrieved successfully') {
    return this.formatSuccess(game, message);
  }

  /**
   * Format game creation response
   * @param {Object} game - Created game data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGameCreationResponse (game, message = 'Game created successfully') {
    return this.formatSuccess(
      {
        game_id: game.game_id || game.id,
        action: 'created',
        game: game
      },
      message,
      {},
      201
    );
  }

  /**
   * Format game update response
   * @param {Object} game - Updated game data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGameUpdateResponse (game, message = 'Game updated successfully') {
    return this.formatSuccess(
      {
        game_id: game.game_id || game.id,
        action: 'updated',
        game: game
      },
      message
    );
  }

  /**
   * Format game deletion response
   * @param {Object} result - Deletion result
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGameDeletionResponse (result, message = 'Game deleted successfully') {
    const gameId = result.game_id || result.id || result;
    return this.formatSuccess(
      {
        game_id: gameId,
        action: 'deleted'
      },
      message
    );
  }

  /**
   * Format game statistics response
   * @param {Object} statistics - Game statistics data
   * @param {Object} filters - Applied filters
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatGameStatisticsResponse (statistics, filters = {}, message = 'Game statistics retrieved successfully') {
    return this.formatSuccess(
      statistics,
      message,
      {
        filters,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Format duplicate game error response
   * @param {string} gameId - Duplicate game ID
   * @returns {Object} Formatted error response object
   */
  static formatDuplicateGameError (gameId) {
    return this.formatConflictError(
      'Game with this ID already exists',
      {
        game_id: gameId,
        suggestion: 'Use a different game ID or update the existing game'
      }
    );
  }

  /**
   * Format game not found error response
   * @param {string} identifier - Game ID or identifier that was not found
   * @returns {Object} Formatted error response object
   */
  static formatGameNotFoundError (identifier) {
    return this.formatNotFoundError('Game', identifier);
  }

  /**
   * Format bad request error response
   * @param {string} message - Bad request message
   * @param {Object} details - Request validation details
   * @returns {Object} Formatted error response object
   */
  static formatBadRequestError (message, details = null) {
    return BaseResponseFormatter.formatBadRequestError(message, details);
  }

  /**
   * Format error response
   * @param {Error|string} error - Error object or message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @returns {Object} Formatted error response object
   */
  static formatError (error, statusCode = 500) {
    return BaseResponseFormatter.formatError(error, 'Internal Server Error', null, statusCode);
  }
}

/**
 * Teams service specific response formatter
 */
export class TeamsResponseFormatter extends BaseResponseFormatter {
  /**
   * Format teams list response with pagination
   * @param {Object} result - Teams service result
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatTeamsListResponse (result, pagination, message = 'Teams retrieved successfully') {
    const data = this.extractTeamsData(result);
    const metadata = this.buildTeamsMetadata(result);

    return this.formatPaginatedResponse(data, pagination, message, metadata);
  }

  /**
   * Extract teams data from result object
   * @param {Object} result - Teams service result
   * @returns {Array} Teams data array
   * @private
   */
  static extractTeamsData (result) {
    return result.teams || result.data || result;
  }

  /**
   * Build metadata for teams response
   * @param {Object} result - Teams service result
   * @returns {Object} Metadata object
   * @private
   */
  static buildTeamsMetadata (result) {
    return {
      filters: result.metadata?.filters || {},
      sport: result.metadata?.sport,
      division: result.metadata?.division,
      gender: result.metadata?.gender
    };
  }

  /**
   * Format single team response
   * @param {Object} team - Team data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatTeamResponse (team, message = 'Team retrieved successfully') {
    return this.formatSuccess(team, message);
  }

  /**
   * Format team creation response
   * @param {Object} team - Created team data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatTeamCreationResponse (team, message = 'Team created successfully') {
    return this.formatSuccess(
      {
        team_id: team.team_id || team.id,
        action: 'created',
        team: team
      },
      message,
      {},
      201
    );
  }

  /**
   * Format team update response
   * @param {Object} team - Updated team data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatTeamUpdateResponse (team, message = 'Team updated successfully') {
    return this.formatSuccess(
      {
        team_id: team.team_id || team.id,
        action: 'updated',
        team: team
      },
      message
    );
  }

  /**
   * Format team not found error response
   * @param {string} identifier - Team identifier that was not found
   * @returns {Object} Formatted error response object
   */
  static formatTeamNotFoundError (identifier) {
    return this.formatNotFoundError('Team', identifier);
  }

  /**
   * Format team validation error response
   * @param {Error} validationError - Validation error
   * @returns {Object} Formatted validation error response
   */
  static formatTeamValidationError (validationError) {
    return this.formatValidationError(
      'Team data validation failed',
      {
        error: validationError.message,
        suggestion: 'Check required fields and data format'
      }
    );
  }
}

/**
 * Conferences service specific response formatter
 */
export class ConferencesResponseFormatter extends BaseResponseFormatter {
  /**
   * Format conferences list response with pagination
   * @param {Object} result - Conferences service result
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatConferencesListResponse (result, pagination, message = 'Conferences retrieved successfully') {
    const data = this.extractConferencesData(result);
    const metadata = this.buildConferencesMetadata(result);

    return this.formatPaginatedResponse(data, pagination, message, metadata);
  }

  /**
   * Extract conferences data from result object
   * @param {Object} result - Conferences service result
   * @returns {Array} Conferences data array
   * @private
   */
  static extractConferencesData (result) {
    return result.conferences || result.data || result;
  }

  /**
   * Build metadata for conferences response
   * @param {Object} result - Conferences service result
   * @returns {Object} Metadata object
   * @private
   */
  static buildConferencesMetadata (result) {
    return {
      filters: result.metadata?.filters || {},
      sport: result.metadata?.sport,
      division: result.metadata?.division,
      gender: result.metadata?.gender
    };
  }

  /**
   * Format single conference response
   * @param {Object} conference - Conference data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatConferenceResponse (conference, message = 'Conference retrieved successfully') {
    return this.formatSuccess(conference, message);
  }

  /**
   * Format conference creation response
   * @param {Object} conference - Created conference data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatConferenceCreationResponse (conference, message = 'Conference created successfully') {
    return this.formatSuccess(
      {
        conference_id: conference.conference_id || conference.id,
        action: 'created',
        conference: conference
      },
      message,
      {},
      201
    );
  }

  /**
   * Format conference update response
   * @param {Object} conference - Updated conference data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatConferenceUpdateResponse (conference, message = 'Conference updated successfully') {
    return this.formatSuccess(
      {
        conference_id: conference.conference_id || conference.id,
        action: 'updated',
        conference: conference
      },
      message
    );
  }

  /**
   * Format conference not found error response
   * @param {string} identifier - Conference identifier that was not found
   * @returns {Object} Formatted error response object
   */
  static formatConferenceNotFoundError (identifier) {
    return this.formatNotFoundError('Conference', identifier);
  }

  /**
   * Format conference validation error response
   * @param {Error} validationError - Validation error
   * @returns {Object} Formatted validation error response
   */
  static formatConferenceValidationError (validationError) {
    return this.formatValidationError(
      'Conference data validation failed',
      {
        error: validationError.message,
        suggestion: 'Check required fields and data format'
      }
    );
  }
}

/**
 * Health service specific response formatter
 */
export class HealthResponseFormatter extends BaseResponseFormatter {
  /**
   * Format general health check response
   * @param {Object} healthData - Health check data
   * @param {Object} links - HATEOAS navigation links
   * @returns {Object} Formatted health check response
   */
  static formatGeneralHealthResponse (healthData, links = {}) {
    const response = this.formatSuccess(
      healthData,
      'Service health check completed'
    );

    return this.addHATEOASLinks(response, links);
  }

  /**
   * Format liveness probe response
   * @returns {Object} Formatted liveness response
   */
  static formatLivenessResponse () {
    return this.formatSuccess(
      {
        status: 'alive',
        service: 'scoreboard-api'
      },
      'Service is alive and responding'
    );
  }

  /**
   * Format readiness probe response
   * @param {boolean} isReady - Whether the service is ready
   * @param {Object} details - Readiness details
   * @returns {Object} Formatted readiness response
   */
  static formatReadinessResponse (isReady, details = {}) {
    if (isReady) {
      return this.formatSuccess(
        {
          status: 'ready',
          service: 'scoreboard-api',
          database: 'connected',
          ...details
        },
        'Service is ready to serve traffic'
      );
    } else {
      return this.formatError(
        'Service not ready',
        'Service Unavailable',
        details,
        503
      );
    }
  }

  /**
   * Format detailed health response
   * @param {Object} healthData - Detailed health information
   * @param {Object} links - HATEOAS navigation links
   * @returns {Object} Formatted detailed health response
   */
  static formatDetailedHealthResponse (healthData, links = {}) {
    const response = this.formatSuccess(
      healthData,
      'Detailed health information retrieved'
    );

    return this.addHATEOASLinks(response, links);
  }

  /**
   * Format health check error response
   * @param {Error} error - Health check error
   * @returns {Object} Formatted error response
   */
  static formatHealthCheckError (error) {
    return this.formatError(
      error,
      'Health Check Failed',
      {
        suggestion: 'Check service logs and database connectivity'
      },
      500
    );
  }
}

/**
 * Generic API response formatter for common patterns
 */
export class GenericResponseFormatter extends BaseResponseFormatter {
  /**
   * Format a collection response with HATEOAS links
   * @param {Array} data - Collection data
   * @param {Object} links - HATEOAS links
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatCollectionResponse (data, links = {}, pagination = null, message = 'Collection retrieved successfully') {
    const response = this.formatSuccess(data, message);

    if (Object.keys(links).length > 0) {
      response.body.links = links;
    }

    if (pagination) {
      if (!response.body.metadata) {
        response.body.metadata = {};
      }
      response.body.metadata.pagination = pagination;
    }

    return response;
  }

  /**
   * Format a resource response with HATEOAS links
   * @param {Object} data - Resource data
   * @param {Object} links - HATEOAS links
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatResourceResponse (data, links = {}, message = 'Resource retrieved successfully') {
    const response = this.formatSuccess(data, message);

    if (Object.keys(links).length > 0) {
      response.body.links = links;
    }

    return response;
  }

  /**
   * Format an empty response (no content)
   * @param {string} _message - Success message
   * @returns {Object} Formatted response object
   */
  static formatEmptyResponse (_message = 'Operation completed successfully') {
    return {
      status: 204,
      body: null
    };
  }

  /**
   * Format a bulk operation response
   * @param {Object} result - Bulk operation result
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  static formatBulkOperationResponse (result, message = 'Bulk operation completed') {
    return this.formatSuccess(
      {
        total: result.total || 0,
        successful: result.successful || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        details: result.details || []
      },
      message
    );
  }
}

/**
 * Response formatter factory for creating appropriate formatters
 */
export class ResponseFormatterFactory {
  /**
   * Get the appropriate response formatter for a controller
   * @param {string} controllerType - Type of controller (e.g., 'ncaa', 'games', 'teams', 'conferences', 'health', 'generic')
   * @returns {Class} Response formatter class
   */
  static getFormatter (controllerType) {
    const formatterMap = this.getFormatterMap();
    const normalizedType = controllerType.toLowerCase();

    return formatterMap.get(normalizedType) || GenericResponseFormatter;
  }

  /**
   * Get the formatter mapping
   * @returns {Map} Map of controller types to formatter classes
   * @private
   */
  static getFormatterMap () {
    const formatterMap = new Map();
    formatterMap.set('ncaa', NCAAIngestionResponseFormatter);
    formatterMap.set('ncaa-ingestion', NCAAIngestionResponseFormatter);
    formatterMap.set('games', GamesResponseFormatter);
    formatterMap.set('teams', TeamsResponseFormatter);
    formatterMap.set('conferences', ConferencesResponseFormatter);
    formatterMap.set('health', HealthResponseFormatter);
    formatterMap.set('generic', GenericResponseFormatter);

    return formatterMap;
  }

  /**
   * Create a response formatter instance
   * @param {string} controllerType - Type of controller
   * @returns {Object} Response formatter instance
   */
  static createFormatter (controllerType) {
    const FormatterClass = this.getFormatter(controllerType);
    return new FormatterClass();
  }

  /**
   * Get all available formatter types
   * @returns {Array} Array of available formatter types
   */
  static getAvailableFormatters () {
    return [
      'ncaa-ingestion',
      'games',
      'teams',
      'conferences',
      'health',
      'generic'
    ];
  }

  /**
   * Check if a formatter type is supported
   * @param {string} controllerType - Type of controller to check
   * @returns {boolean} Whether the formatter type is supported
   */
  static isSupported (controllerType) {
    return this.getAvailableFormatters().includes(controllerType.toLowerCase());
  }
}
