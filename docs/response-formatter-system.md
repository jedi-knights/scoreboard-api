# Response Formatter System

## Overview

The Response Formatter System provides consistent, standardized API response formatting across all endpoints in the Scoreboard API. It separates response formatting logic from business logic in controllers, making formatting independently testable and maintaining consistent API responses.

## Features

- **Consistent Response Structure**: All responses follow the same format across all endpoints
- **HATEOAS Link Integration**: Built-in support for hypermedia links
- **Standardized Error Handling**: Consistent error response formats
- **Pagination Support**: Standardized pagination response structure
- **Metadata Enrichment**: Automatic addition of timestamps and metadata
- **Service-Specific Formatters**: Dedicated formatters for different service types

## Response Structure

### Success Response Format

```json
{
  "status": 200,
  "body": {
    "success": true,
    "message": "Operation completed successfully",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "data": { /* actual response data */ },
    "metadata": { /* additional metadata */ },
    "links": { /* HATEOAS links */ }
  }
}
```

### Error Response Format

```json
{
  "status": 400,
  "body": {
    "success": false,
    "error": "Bad Request",
    "message": "Validation failed",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "details": { /* error details */ }
  }
}
```

## Formatter Classes

### BaseResponseFormatter

The base class that provides common formatting methods for all response formatters.

#### Key Methods

- `formatSuccess(data, message, metadata, statusCode)` - Format successful responses
- `formatError(error, errorType, details, statusCode)` - Format error responses
- `formatValidationError(error, validationDetails, statusCode)` - Format validation errors
- `formatNotFoundError(resource, identifier, statusCode)` - Format not found errors
- `formatBadRequestError(message, details, statusCode)` - Format bad request errors
- `formatConflictError(message, details, statusCode)` - Format conflict errors
- `formatPaginatedResponse(data, pagination, message, metadata)` - Format paginated responses
- `addHATEOASLinks(response, links)` - Add HATEOAS links to responses
- `addMetadata(response, metadata)` - Add metadata to responses

### NCAAIngestionResponseFormatter

Specialized formatter for NCAA ingestion service responses.

#### Key Methods

- `formatBatchIngestionSuccess(result)` - Format batch ingestion success
- `formatSingleIngestionSuccess(result)` - Format single game ingestion
- `formatBatchSizeExceededError(maxBatchSize, actualSize)` - Format batch size errors
- `formatNCAAValidationError(validationError)` - Format NCAA validation errors
- `formatHealthCheckResponse(serviceName, version)` - Format health check responses
- `formatValidationSuccessResponse(gameId)` - Format validation success

### GamesResponseFormatter

Specialized formatter for games service responses.

#### Key Methods

- `formatGamesListResponse(result, pagination, message)` - Format games list with pagination
- `formatGameResponse(game, message)` - Format single game response
- `formatGameCreationResponse(game, message)` - Format game creation
- `formatGameUpdateResponse(game, message)` - Format game update
- `formatGameDeletionResponse(result, message)` - Format game deletion
- `formatGameStatisticsResponse(statistics, filters, message)` - Format game statistics
- `formatDuplicateGameError(gameId)` - Format duplicate game errors
- `formatGameNotFoundError(identifier)` - Format game not found errors

### TeamsResponseFormatter

Specialized formatter for teams service responses.

#### Key Methods

- `formatTeamsListResponse(result, pagination, message)` - Format teams list with pagination
- `formatTeamResponse(team, message)` - Format single team response
- `formatTeamCreationResponse(team, message)` - Format team creation
- `formatTeamUpdateResponse(team, message)` - Format team update
- `formatTeamNotFoundError(identifier)` - Format team not found errors
- `formatTeamValidationError(validationError)` - Format team validation errors

### ConferencesResponseFormatter

Specialized formatter for conferences service responses.

#### Key Methods

- `formatConferencesListResponse(result, pagination, message)` - Format conferences list with pagination
- `formatConferenceResponse(conference, message)` - Format single conference response
- `formatConferenceCreationResponse(conference, message)` - Format conference creation
- `formatConferenceUpdateResponse(conference, message)` - Format conference update
- `formatConferenceNotFoundError(identifier)` - Format conference not found errors
- `formatConferenceValidationError(validationError)` - Format conference validation errors

### HealthResponseFormatter

Specialized formatter for health check endpoints.

#### Key Methods

- `formatGeneralHealthResponse(healthData, links)` - Format general health check
- `formatLivenessResponse()` - Format liveness probe
- `formatReadinessResponse(isReady, details)` - Format readiness probe
- `formatDetailedHealthResponse(healthData, links)` - Format detailed health information
- `formatHealthCheckError(error)` - Format health check errors

### GenericResponseFormatter

Generic formatter for common API patterns.

#### Key Methods

- `formatCollectionResponse(data, links, pagination, message)` - Format collection with HATEOAS
- `formatResourceResponse(data, links, message)` - Format resource with HATEOAS
- `formatEmptyResponse(message)` - Format empty responses (204 No Content)
- `formatBulkOperationResponse(result, message)` - Format bulk operation results

## ResponseFormatterFactory

Factory class for creating appropriate response formatters based on controller type.

### Key Methods

- `getFormatter(controllerType)` - Get the appropriate formatter class
- `createFormatter(controllerType)` - Create a formatter instance
- `getAvailableFormatters()` - Get all available formatter types
- `isSupported(controllerType)` - Check if a formatter type is supported

### Supported Controller Types

- `ncaa-ingestion` → NCAAIngestionResponseFormatter
- `games` → GamesResponseFormatter
- `teams` → TeamsResponseFormatter
- `conferences` → ConferencesResponseFormatter
- `health` → HealthResponseFormatter
- `generic` → GenericResponseFormatter (default)

## Usage Examples

### Basic Success Response

```javascript
import { BaseResponseFormatter } from '../utils/response-formatter.js';

const response = BaseResponseFormatter.formatSuccess(
  { id: 1, name: 'Example' },
  'Resource created successfully',
  { count: 1 },
  201
);

// Response:
// {
//   "status": 201,
//   "body": {
//     "success": true,
//     "message": "Resource created successfully",
//     "timestamp": "2024-01-01T00:00:00.000Z",
//     "data": { "id": 1, "name": "Example" },
//     "metadata": { "count": 1 }
//   }
// }
```

### Error Response

```javascript
const errorResponse = BaseResponseFormatter.formatError(
  'Invalid input data',
  'Validation Failed',
  { field: 'email', reason: 'required' },
  400
);

// Response:
// {
//   "status": 400,
//   "body": {
//     "success": false,
//     "error": "Validation Failed",
//     "message": "Invalid input data",
//     "timestamp": "2024-01-01T00:00:00.000Z",
//     "details": { "field": "email", "reason": "required" }
//   }
// }
```

### Service-Specific Formatter

```javascript
import { GamesResponseFormatter } from '../utils/response-formatter.js';

const gameResponse = GamesResponseFormatter.formatGameCreationResponse(
  { game_id: 'game-123', name: 'New Game' }
);

// Response:
// {
//   "status": 201,
//   "body": {
//     "success": true,
//     "message": "Game created successfully",
//     "timestamp": "2024-01-01T00:00:00.000Z",
//     "data": {
//       "game_id": "game-123",
//       "action": "created",
//       "game": { "game_id": "game-123", "name": "New Game" }
//     }
//   }
// }
```

### Using the Factory

```javascript
import { ResponseFormatterFactory } from '../utils/response-formatter.js';

// Get the appropriate formatter
const formatter = ResponseFormatterFactory.getFormatter('games');

// Use the formatter
const response = formatter.formatGameResponse(gameData);

// Or create an instance
const formatterInstance = ResponseFormatterFactory.createFormatter('teams');
```

### HATEOAS Integration

```javascript
import { GenericResponseFormatter } from '../utils/response-formatter.js';

const links = {
  self: '/api/games/123',
  edit: '/api/games/123/edit',
  delete: '/api/games/123'
};

const response = GenericResponseFormatter.formatResourceResponse(
  gameData,
  links,
  'Game retrieved successfully'
);

// Response includes HATEOAS links:
// {
//   "status": 200,
//   "body": {
//     "success": true,
//     "message": "Game retrieved successfully",
//     "timestamp": "2024-01-01T00:00:00.000Z",
//     "data": { /* game data */ },
//     "links": {
//       "self": "/api/games/123",
//       "edit": "/api/games/123/edit",
//       "delete": "/api/games/123"
//     }
//   }
// }
```

## Controller Integration

### Basic Controller Usage

```javascript
import { GamesResponseFormatter } from '../utils/response-formatter.js';

export class GamesController {
  async getGame(req, res) {
    try {
      const game = await this.gamesService.getGameById(req.params.id);
      
      if (!game) {
        const response = GamesResponseFormatter.formatGameNotFoundError(req.params.id);
        return res.status(response.status).json(response.body);
      }
      
      const response = GamesResponseFormatter.formatGameResponse(game);
      return res.status(response.status).json(response.body);
      
    } catch (error) {
      const response = GamesResponseFormatter.formatError(error, 500);
      return res.status(response.status).json(response.body);
    }
  }
}
```

### Health Routes Integration

```javascript
import { HealthResponseFormatter } from '../utils/response-formatter.js';

router.get('/health', async (req, res) => {
  try {
    const healthData = { /* health information */ };
    const navigationLinks = generateNavigationLinks(req);
    
    const response = HealthResponseFormatter.formatGeneralHealthResponse(
      healthData, 
      navigationLinks
    );
    
    res.status(response.status).json(response.body);
  } catch (error) {
    const response = HealthResponseFormatter.formatHealthCheckError(error);
    res.status(response.status).json(response.body);
  }
});
```

## Testing

### Unit Testing Formatters

```javascript
import { BaseResponseFormatter } from '../utils/response-formatter.js';

describe('BaseResponseFormatter', () => {
  describe('formatSuccess', () => {
    it('should format basic success response', () => {
      const response = BaseResponseFormatter.formatSuccess();
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
```

### Testing Service-Specific Formatters

```javascript
import { GamesResponseFormatter } from '../utils/response-formatter.js';

describe('GamesResponseFormatter', () => {
  describe('formatGameCreationResponse', () => {
    it('should format game creation response', () => {
      const game = { game_id: 'game-123', name: 'New Game' };
      const response = GamesResponseFormatter.formatGameCreationResponse(game);
      
      expect(response.status).toBe(201);
      expect(response.body.data.action).toBe('created');
      expect(response.body.data.game_id).toBe('game-123');
    });
  });
});
```

## Best Practices

### 1. Use Service-Specific Formatters

Always use the appropriate formatter for your service type rather than the generic one:

```javascript
// ✅ Good - Use service-specific formatter
const response = GamesResponseFormatter.formatGameResponse(game);

// ❌ Avoid - Using generic formatter when specific one exists
const response = GenericResponseFormatter.formatResourceResponse(game);
```

### 2. Consistent Error Handling

Use the appropriate error formatter methods for different error types:

```javascript
// ✅ Good - Use specific error formatters
if (!game) {
  return GamesResponseFormatter.formatGameNotFoundError(id);
}

if (validationError) {
  return GamesResponseFormatter.formatValidationError(validationError);
}
```

### 3. HATEOAS Integration

Always include relevant HATEOAS links in your responses:

```javascript
const links = {
  self: `/api/games/${game.id}`,
  edit: `/api/games/${game.id}/edit`,
  delete: `/api/games/${game.id}`
};

const response = GenericResponseFormatter.formatResourceResponse(game, links);
```

### 4. Metadata Enrichment

Use the metadata parameter to include additional information:

```javascript
const metadata = {
  filters: appliedFilters,
  sortOptions: sortOptions,
  pagination: paginationInfo
};

const response = BaseResponseFormatter.formatSuccess(data, message, metadata);
```

### 5. Status Code Consistency

Use appropriate HTTP status codes with your responses:

```javascript
// ✅ Good - Use appropriate status codes
const response = BaseResponseFormatter.formatSuccess(data, 'Created', {}, 201);
const response = BaseResponseFormatter.formatError('Not found', 'Not Found', null, 404);

// ❌ Avoid - Always using default status codes
const response = BaseResponseFormatter.formatSuccess(data); // Always 200
```

## Migration Guide

### From Manual Response Formatting

#### Before (Manual Formatting)

```javascript
// Old way - manual formatting
res.status(200).json({
  success: true,
  data: gameData,
  message: 'Game retrieved successfully',
  timestamp: new Date().toISOString()
});
```

#### After (Using Formatters)

```javascript
// New way - using formatters
const response = GamesResponseFormatter.formatGameResponse(gameData);
res.status(response.status).json(response.body);
```

### From Inconsistent Error Handling

#### Before (Inconsistent Errors)

```javascript
// Old way - inconsistent error formats
res.status(400).json({
  error: 'Bad Request',
  message: error.message
});

res.status(404).json({
  status: 'not_found',
  reason: 'Game not found'
});
```

#### After (Consistent Error Formatting)

```javascript
// New way - consistent error formats
const response = GamesResponseFormatter.formatGameNotFoundError(gameId);
res.status(response.status).json(response.body);

const response = GamesResponseFormatter.formatValidationError(validationError);
res.status(response.status).json(response.body);
```

## Configuration

The response formatter system is designed to be lightweight and doesn't require external configuration. However, you can customize behavior by:

### Environment Variables

```bash
# Enable detailed logging for debugging
NODE_ENV=development

# Customize timestamp format (if needed)
TIMESTAMP_FORMAT=ISO
```

### Custom Formatters

You can extend the system by creating custom formatters:

```javascript
export class CustomResponseFormatter extends BaseResponseFormatter {
  static formatCustomResponse(data, customField) {
    return this.formatSuccess(data, 'Custom response', {
      customField,
      customTimestamp: new Date().toISOString()
    });
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Response Structure Mismatch

**Problem**: Tests expecting old response format
**Solution**: Update tests to expect new format with `data` wrapper

```javascript
// Old test expectation
expect(response.body.status).toBe('OK');

// New test expectation
expect(response.body.data.status).toBe('OK');
```

#### 2. Missing Formatter

**Problem**: `TypeError: Formatter is not a function`
**Solution**: Ensure you're importing the correct formatter class

```javascript
// ✅ Correct import
import { GamesResponseFormatter } from '../utils/response-formatter.js';

// ❌ Incorrect import
import { GamesResponseFormatter } from '../utils/response-formatter.js';
```

#### 3. HATEOAS Links Not Appearing

**Problem**: Links not showing in response
**Solution**: Ensure you're using the `addHATEOASLinks` method or formatters that support links

```javascript
// ✅ Correct usage
const response = GenericResponseFormatter.formatResourceResponse(data, links);

// ❌ Incorrect usage
const response = BaseResponseFormatter.formatSuccess(data);
```

### Debug Mode

Enable detailed logging to debug formatter issues:

```javascript
// Add console.log to see what's being formatted
const response = GamesResponseFormatter.formatGameResponse(game);
console.log('Formatted response:', JSON.stringify(response, null, 2));
```

## Performance Considerations

### Memory Usage

- Formatters are stateless and don't retain data between calls
- Response objects are lightweight and optimized for JSON serialization
- Timestamps are generated on-demand, not cached

### Processing Time

- Formatter methods are synchronous and fast
- No external dependencies or I/O operations
- Minimal overhead compared to business logic

### Scalability

- Formatters can be used in high-concurrency scenarios
- No shared state or locking mechanisms
- Stateless design allows for easy horizontal scaling

## Future Enhancements

### Planned Features

1. **Response Caching**: Cache frequently used response formats
2. **Custom Serializers**: Support for different output formats (XML, YAML)
3. **Response Compression**: Automatic response compression for large payloads
4. **Metrics Collection**: Built-in response formatting metrics
5. **Template System**: Configurable response templates

### Extension Points

The system is designed to be easily extensible:

- Add new formatter classes for new services
- Extend base formatter with new methods
- Customize response structure per environment
- Add middleware for automatic formatting

---

*Last Updated: [Current Date]*
*Version: 1.0.0*
