/**
 * Response Formatter Tests
 * 
 * Tests for all response formatter classes to ensure consistent
 * response formatting across the API.
 */

import { jest } from '@jest/globals';
import {
  BaseResponseFormatter,
  NCAAIngestionResponseFormatter,
  GamesResponseFormatter,
  TeamsResponseFormatter,
  ConferencesResponseFormatter,
  HealthResponseFormatter,
  GenericResponseFormatter,
  ResponseFormatterFactory
} from '../../../src/utils/response-formatter.js';

describe('Response Formatters', () => {
  describe('BaseResponseFormatter', () => {
    describe('formatSuccess', () => {
      it('should format basic success response', () => {
        const response = BaseResponseFormatter.formatSuccess();
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Success');
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.data).toBeUndefined();
        expect(response.body.metadata).toBeUndefined();
      });

      it('should format success response with data', () => {
        const data = { id: 1, name: 'Test' };
        const response = BaseResponseFormatter.formatSuccess(data);
        
        expect(response.body.data).toEqual(data);
      });

      it('should format success response with metadata', () => {
        const metadata = { count: 10, page: 1 };
        const response = BaseResponseFormatter.formatSuccess(null, 'Success', metadata);
        
        expect(response.body.metadata).toEqual(metadata);
      });

      it('should format success response with custom status code', () => {
        const response = BaseResponseFormatter.formatSuccess(null, 'Created', {}, 201);
        
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Created');
      });
    });

    describe('formatError', () => {
      it('should format basic error response', () => {
        const response = BaseResponseFormatter.formatError('Test error');
        
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Test error');
        expect(response.body.timestamp).toBeDefined();
      });

      it('should format error response with custom error type', () => {
        const response = BaseResponseFormatter.formatError('Test error', 'Bad Request', null, 400);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should format error response with details', () => {
        const details = { field: 'name', reason: 'required' };
        const response = BaseResponseFormatter.formatError('Test error', 'Validation Failed', details, 400);
        
        expect(response.body.details).toEqual(details);
      });

      it('should handle Error objects', () => {
        const error = new Error('Test error message');
        const response = BaseResponseFormatter.formatError(error);
        
        expect(response.body.message).toBe('Test error message');
      });
    });

    describe('formatValidationError', () => {
      it('should format validation error response', () => {
        const response = BaseResponseFormatter.formatValidationError('Invalid data');
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Failed');
        expect(response.body.message).toBe('Invalid data');
      });
    });

    describe('formatNotFoundError', () => {
      it('should format not found error response', () => {
        const response = BaseResponseFormatter.formatNotFoundError('User', '123');
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('User not found: 123');
      });

      it('should format not found error response without identifier', () => {
        const response = BaseResponseFormatter.formatNotFoundError('User');
        
        expect(response.body.message).toBe('User not found');
      });
    });

    describe('formatBadRequestError', () => {
      it('should format bad request error response', () => {
        const response = BaseResponseFormatter.formatBadRequestError('Invalid input');
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toBe('Invalid input');
      });
    });

    describe('formatConflictError', () => {
      it('should format conflict error response', () => {
        const response = BaseResponseFormatter.formatConflictError('Resource already exists');
        
        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Conflict');
        expect(response.body.message).toBe('Resource already exists');
      });
    });

    describe('formatPaginatedResponse', () => {
      it('should format paginated response', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const pagination = { page: 1, limit: 10, total: 2 };
        const response = BaseResponseFormatter.formatPaginatedResponse(data, pagination);
        
        expect(response.body.data).toEqual(data);
        expect(response.body.metadata.pagination).toEqual(pagination);
      });
    });

    describe('addHATEOASLinks', () => {
      it('should add HATEOAS links to response', () => {
        const response = { body: { success: true } };
        const links = { self: '/api/test', next: '/api/test?page=2' };
        
        const result = BaseResponseFormatter.addHATEOASLinks(response, links);
        
        expect(result.body.links).toEqual(links);
      });

      it('should handle response without body', () => {
        const response = {};
        const links = { self: '/api/test' };
        
        const result = BaseResponseFormatter.addHATEOASLinks(response, links);
        
        expect(result.body.links).toEqual(links);
      });
    });

    describe('addMetadata', () => {
      it('should add metadata to response', () => {
        const response = { body: { success: true } };
        const metadata = { count: 10, page: 1 };
        
        const result = BaseResponseFormatter.addMetadata(response, metadata);
        
        expect(result.body.metadata).toEqual(metadata);
      });

      it('should merge with existing metadata', () => {
        const response = { body: { success: true, metadata: { existing: 'value' } } };
        const metadata = { count: 10 };
        
        const result = BaseResponseFormatter.addMetadata(response, metadata);
        
        expect(result.body.metadata).toEqual({ existing: 'value', count: 10 });
      });
    });
  });

  describe('NCAAIngestionResponseFormatter', () => {
    describe('formatBatchIngestionSuccess', () => {
      it('should format batch ingestion success response', () => {
        const result = {
          total: 10,
          successful: 8,
          failed: 1,
          skipped: 1,
          details: []
        };
        
        const response = NCAAIngestionResponseFormatter.formatBatchIngestionSuccess(result);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.summary).toEqual({
          total: 10,
          successful: 8,
          failed: 1,
          skipped: 1
        });
      });
    });

    describe('formatSingleIngestionSuccess', () => {
      it('should format created game response', () => {
        const result = {
          action: 'created',
          game_id: 'game-123',
          entities_created: { teams: 2, conferences: 1 },
          message: 'Game created successfully'
        };
        
        const response = NCAAIngestionResponseFormatter.formatSingleIngestionSuccess(result);
        
        expect(response.status).toBe(201);
        expect(response.body.data.action).toBe('created');
        expect(response.body.data.game_id).toBe('game-123');
      });

      it('should format skipped game response', () => {
        const result = {
          action: 'skipped',
          game_id: 'game-123',
          reason: 'Game already exists',
          message: 'Game was already ingested'
        };
        
        const response = NCAAIngestionResponseFormatter.formatSingleIngestionSuccess(result);
        
        expect(response.status).toBe(200);
        expect(response.body.data.action).toBe('skipped');
        expect(response.body.data.reason).toBe('Game already exists');
      });
    });

    describe('formatBatchSizeExceededError', () => {
      it('should format batch size exceeded error', () => {
        const response = NCAAIngestionResponseFormatter.formatBatchSizeExceededError(100, 150);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.details.maxBatchSize).toBe(100);
        expect(response.body.details.actualSize).toBe(150);
      });
    });

    describe('formatNCAAValidationError', () => {
      it('should format NCAA validation error', () => {
        const error = new Error('Invalid sport value');
        const response = NCAAIngestionResponseFormatter.formatNCAAValidationError(error);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Failed');
        expect(response.body.details.error).toBe('Invalid sport value');
      });
    });

    describe('formatHealthCheckResponse', () => {
      it('should format health check response', () => {
        const response = NCAAIngestionResponseFormatter.formatHealthCheckResponse('test-service', '2.0.0');
        
        expect(response.status).toBe(200);
        expect(response.body.data.service).toBe('test-service');
        expect(response.body.data.version).toBe('2.0.0');
        expect(response.body.data.status).toBe('healthy');
      });
    });

    describe('formatValidationSuccessResponse', () => {
      it('should format validation success response', () => {
        const response = NCAAIngestionResponseFormatter.formatValidationSuccessResponse('game-123');
        
        expect(response.status).toBe(200);
        expect(response.body.data.valid).toBe(true);
        expect(response.body.data.game_id).toBe('game-123');
      });
    });
  });

  describe('GamesResponseFormatter', () => {
    describe('formatGamesListResponse', () => {
      it('should format games list response', () => {
        const result = {
          games: [{ id: 1, name: 'Game 1' }],
          metadata: { filters: { sport: 'basketball' } }
        };
        const pagination = { page: 1, limit: 10 };
        
        const response = GamesResponseFormatter.formatGamesListResponse(result, pagination);
        
        expect(response.body.data).toEqual([{ id: 1, name: 'Game 1' }]);
        expect(response.body.metadata.pagination).toEqual(pagination);
        expect(response.body.metadata.filters).toEqual({ sport: 'basketball' });
      });
    });

    describe('formatGameResponse', () => {
      it('should format single game response', () => {
        const game = { id: 1, name: 'Game 1' };
        const response = GamesResponseFormatter.formatGameResponse(game);
        
        expect(response.body.data).toEqual(game);
        expect(response.body.message).toBe('Game retrieved successfully');
      });
    });

    describe('formatGameCreationResponse', () => {
      it('should format game creation response', () => {
        const game = { game_id: 'game-123', name: 'New Game' };
        const response = GamesResponseFormatter.formatGameCreationResponse(game);
        
        expect(response.status).toBe(201);
        expect(response.body.data.action).toBe('created');
        expect(response.body.data.game_id).toBe('game-123');
      });
    });

    describe('formatGameUpdateResponse', () => {
      it('should format game update response', () => {
        const game = { game_id: 'game-123', name: 'Updated Game' };
        const response = GamesResponseFormatter.formatGameUpdateResponse(game);
        
        expect(response.body.data.action).toBe('updated');
        expect(response.body.data.game_id).toBe('game-123');
      });
    });

    describe('formatGameDeletionResponse', () => {
      it('should format game deletion response', () => {
        const result = { game_id: 'game-123' };
        const response = GamesResponseFormatter.formatGameDeletionResponse(result);
        
        expect(response.body.data.action).toBe('deleted');
        expect(response.body.data.game_id).toBe('game-123');
      });
    });

    describe('formatGameStatisticsResponse', () => {
      it('should format game statistics response', () => {
        const statistics = { total: 100, average: 85.5 };
        const filters = { sport: 'basketball' };
        
        const response = GamesResponseFormatter.formatGameStatisticsResponse(statistics, filters);
        
        expect(response.body.data).toEqual(statistics);
        expect(response.body.metadata.filters).toEqual(filters);
        expect(response.body.metadata.timestamp).toBeDefined();
      });
    });

    describe('formatDuplicateGameError', () => {
      it('should format duplicate game error', () => {
        const response = GamesResponseFormatter.formatDuplicateGameError('game-123');
        
        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Conflict');
        expect(response.body.details.game_id).toBe('game-123');
      });
    });

    describe('formatGameNotFoundError', () => {
      it('should format game not found error', () => {
        const response = GamesResponseFormatter.formatGameNotFoundError('game-123');
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Game not found: game-123');
      });
    });
  });

  describe('TeamsResponseFormatter', () => {
    describe('formatTeamsListResponse', () => {
      it('should format teams list response', () => {
        const result = {
          teams: [{ id: 1, name: 'Team 1' }],
          metadata: { sport: 'basketball', division: 'd1' }
        };
        const pagination = { page: 1, limit: 10 };
        
        const response = TeamsResponseFormatter.formatTeamsListResponse(result, pagination);
        
        expect(response.body.data).toEqual([{ id: 1, name: 'Team 1' }]);
        expect(response.body.metadata.pagination).toEqual(pagination);
        expect(response.body.metadata.sport).toBe('basketball');
        expect(response.body.metadata.division).toBe('d1');
      });
    });

    describe('formatTeamResponse', () => {
      it('should format single team response', () => {
        const team = { id: 1, name: 'Team 1' };
        const response = TeamsResponseFormatter.formatTeamResponse(team);
        
        expect(response.body.data).toEqual(team);
        expect(response.body.message).toBe('Team retrieved successfully');
      });
    });

    describe('formatTeamCreationResponse', () => {
      it('should format team creation response', () => {
        const team = { team_id: 'team-123', name: 'New Team' };
        const response = TeamsResponseFormatter.formatTeamCreationResponse(team);
        
        expect(response.status).toBe(201);
        expect(response.body.data.action).toBe('created');
        expect(response.body.data.team_id).toBe('team-123');
      });
    });

    describe('formatTeamUpdateResponse', () => {
      it('should format team update response', () => {
        const team = { team_id: 'team-123', name: 'Updated Team' };
        const response = TeamsResponseFormatter.formatTeamUpdateResponse(team);
        
        expect(response.body.data.action).toBe('updated');
        expect(response.body.data.team_id).toBe('team-123');
      });
    });

    describe('formatTeamNotFoundError', () => {
      it('should format team not found error', () => {
        const response = TeamsResponseFormatter.formatTeamNotFoundError('team-123');
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Team not found: team-123');
      });
    });

    describe('formatTeamValidationError', () => {
      it('should format team validation error', () => {
        const error = new Error('Invalid team data');
        const response = TeamsResponseFormatter.formatTeamValidationError(error);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Failed');
        expect(response.body.details.error).toBe('Invalid team data');
      });
    });
  });

  describe('ConferencesResponseFormatter', () => {
    describe('formatConferencesListResponse', () => {
      it('should format conferences list response', () => {
        const result = {
          conferences: [{ id: 1, name: 'Conference 1' }],
          metadata: { sport: 'basketball', division: 'd1' }
        };
        const pagination = { page: 1, limit: 10 };
        
        const response = ConferencesResponseFormatter.formatConferencesListResponse(result, pagination);
        
        expect(response.body.data).toEqual([{ id: 1, name: 'Conference 1' }]);
        expect(response.body.metadata.pagination).toEqual(pagination);
        expect(response.body.metadata.sport).toBe('basketball');
        expect(response.body.metadata.division).toBe('d1');
      });
    });

    describe('formatConferenceResponse', () => {
      it('should format single conference response', () => {
        const conference = { id: 1, name: 'Conference 1' };
        const response = ConferencesResponseFormatter.formatConferenceResponse(conference);
        
        expect(response.body.data).toEqual(conference);
        expect(response.body.message).toBe('Conference retrieved successfully');
      });
    });

    describe('formatConferenceCreationResponse', () => {
      it('should format conference creation response', () => {
        const conference = { conference_id: 'conf-123', name: 'New Conference' };
        const response = ConferencesResponseFormatter.formatConferenceCreationResponse(conference);
        
        expect(response.status).toBe(201);
        expect(response.body.data.action).toBe('created');
        expect(response.body.data.conference_id).toBe('conf-123');
      });
    });

    describe('formatConferenceUpdateResponse', () => {
      it('should format conference update response', () => {
        const conference = { conference_id: 'conf-123', name: 'Updated Conference' };
        const response = ConferencesResponseFormatter.formatConferenceUpdateResponse(conference);
        
        expect(response.body.data.action).toBe('updated');
        expect(response.body.data.conference_id).toBe('conf-123');
      });
    });

    describe('formatConferenceNotFoundError', () => {
      it('should format conference not found error', () => {
        const response = ConferencesResponseFormatter.formatConferenceNotFoundError('conf-123');
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Conference not found: conf-123');
      });
    });

    describe('formatConferenceValidationError', () => {
      it('should format conference validation error', () => {
        const error = new Error('Invalid conference data');
        const response = ConferencesResponseFormatter.formatConferenceValidationError(error);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation Failed');
        expect(response.body.details.error).toBe('Invalid conference data');
      });
    });
  });

  describe('HealthResponseFormatter', () => {
    describe('formatGeneralHealthResponse', () => {
      it('should format general health response', () => {
        const healthData = { status: 'OK', service: 'test' };
        const links = { self: '/health' };
        
        const response = HealthResponseFormatter.formatGeneralHealthResponse(healthData, links);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(healthData);
        expect(response.body.links).toEqual(links);
      });
    });

    describe('formatLivenessResponse', () => {
      it('should format liveness response', () => {
        const response = HealthResponseFormatter.formatLivenessResponse();
        
        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe('alive');
        expect(response.body.data.service).toBe('scoreboard-api');
      });
    });

    describe('formatReadinessResponse', () => {
      it('should format ready response', () => {
        const response = HealthResponseFormatter.formatReadinessResponse(true);
        
        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe('ready');
        expect(response.body.data.database).toBe('connected');
      });

      it('should format not ready response', () => {
        const details = { reason: 'Database disconnected' };
        const response = HealthResponseFormatter.formatReadinessResponse(false, details);
        
        expect(response.status).toBe(503);
        expect(response.body.success).toBe(false);
        expect(response.body.details).toEqual(details);
      });
    });

    describe('formatDetailedHealthResponse', () => {
      it('should format detailed health response', () => {
        const healthData = { status: 'OK', uptime: 1000 };
        const links = { self: '/health/detailed' };
        
        const response = HealthResponseFormatter.formatDetailedHealthResponse(healthData, links);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(healthData);
        expect(response.body.links).toEqual(links);
      });
    });

    describe('formatHealthCheckError', () => {
      it('should format health check error', () => {
        const error = new Error('Health check failed');
        const response = HealthResponseFormatter.formatHealthCheckError(error);
        
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Health Check Failed');
        expect(response.body.details.suggestion).toBeDefined();
      });
    });
  });

  describe('GenericResponseFormatter', () => {
    describe('formatCollectionResponse', () => {
      it('should format collection response with links and pagination', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const links = { self: '/api/items', next: '/api/items?page=2' };
        const pagination = { page: 1, limit: 10 };
        
        const response = GenericResponseFormatter.formatCollectionResponse(data, links, pagination);
        
        expect(response.body.data).toEqual(data);
        expect(response.body.links).toEqual(links);
        expect(response.body.metadata.pagination).toEqual(pagination);
      });
    });

    describe('formatResourceResponse', () => {
      it('should format resource response with links', () => {
        const data = { id: 1, name: 'Item 1' };
        const links = { self: '/api/items/1', edit: '/api/items/1/edit' };
        
        const response = GenericResponseFormatter.formatResourceResponse(data, links);
        
        expect(response.body.data).toEqual(data);
        expect(response.body.links).toEqual(links);
      });
    });

    describe('formatEmptyResponse', () => {
      it('should format empty response', () => {
        const response = GenericResponseFormatter.formatEmptyResponse('Operation completed');
        
        expect(response.status).toBe(204);
        expect(response.body).toBeNull();
      });
    });

    describe('formatBulkOperationResponse', () => {
      it('should format bulk operation response', () => {
        const result = {
          total: 100,
          successful: 95,
          failed: 3,
          skipped: 2,
          details: []
        };
        
        const response = GenericResponseFormatter.formatBulkOperationResponse(result);
        
        expect(response.body.data.total).toBe(100);
        expect(response.body.data.successful).toBe(95);
        expect(response.body.data.failed).toBe(3);
        expect(response.body.data.skipped).toBe(2);
      });
    });
  });

  describe('ResponseFormatterFactory', () => {
    describe('getFormatter', () => {
      it('should return NCAA formatter for ncaa type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('ncaa');
        expect(formatter).toBe(NCAAIngestionResponseFormatter);
      });

      it('should return NCAA formatter for ncaa-ingestion type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('ncaa-ingestion');
        expect(formatter).toBe(NCAAIngestionResponseFormatter);
      });

      it('should return Games formatter for games type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('games');
        expect(formatter).toBe(GamesResponseFormatter);
      });

      it('should return Teams formatter for teams type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('teams');
        expect(formatter).toBe(TeamsResponseFormatter);
      });

      it('should return Conferences formatter for conferences type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('conferences');
        expect(formatter).toBe(ConferencesResponseFormatter);
      });

      it('should return Health formatter for health type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('health');
        expect(formatter).toBe(HealthResponseFormatter);
      });

      it('should return Generic formatter for unknown type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('unknown');
        expect(formatter).toBe(GenericResponseFormatter);
      });

      it('should return Generic formatter for generic type', () => {
        const formatter = ResponseFormatterFactory.getFormatter('generic');
        expect(formatter).toBe(GenericResponseFormatter);
      });
    });

    describe('createFormatter', () => {
      it('should create formatter instance', () => {
        const formatter = ResponseFormatterFactory.createFormatter('games');
        expect(formatter).toBeInstanceOf(GamesResponseFormatter);
      });
    });

    describe('getAvailableFormatters', () => {
      it('should return all available formatter types', () => {
        const formatters = ResponseFormatterFactory.getAvailableFormatters();
        
        expect(formatters).toContain('ncaa-ingestion');
        expect(formatters).toContain('games');
        expect(formatters).toContain('teams');
        expect(formatters).toContain('conferences');
        expect(formatters).toContain('health');
        expect(formatters).toContain('generic');
      });
    });

    describe('isSupported', () => {
      it('should return true for supported formatter types', () => {
        expect(ResponseFormatterFactory.isSupported('games')).toBe(true);
        expect(ResponseFormatterFactory.isSupported('teams')).toBe(true);
        expect(ResponseFormatterFactory.isSupported('health')).toBe(true);
      });

      it('should return false for unsupported formatter types', () => {
        expect(ResponseFormatterFactory.isSupported('unknown')).toBe(false);
        expect(ResponseFormatterFactory.isSupported('invalid')).toBe(false);
      });
    });
  });
});
