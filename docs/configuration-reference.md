# Configuration Reference

This document provides a comprehensive reference for all configuration options available in the Scoreboard API.

## Environment Variables

### Database Configuration
- `DATABASE_TYPE` - Database type (sqlite, postgres, dynamodb)
- `SQLITE_DATABASE_PATH` - Path to SQLite database file
- `POSTGRES_HOST` - PostgreSQL host address
- `POSTGRES_PORT` - PostgreSQL port number
- `POSTGRES_DATABASE` - PostgreSQL database name
- `POSTGRES_USERNAME` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_SSL` - Enable SSL for PostgreSQL
- `DYNAMODB_REGION` - AWS DynamoDB region
- `DYNAMODB_ENDPOINT_URL` - DynamoDB endpoint URL (for local development)
- `DYNAMODB_TABLES_*` - DynamoDB table names

### API Configuration
- `PORT` - API server port
- `API_VERSION` - API version string
- `NODE_ENV` - Environment (development, production, test)
- `CORS_ORIGIN` - CORS allowed origin
- `CORS_CREDENTIALS` - Enable CORS credentials
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

### Security Configuration
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds

### Logging Configuration
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `LOG_FORMAT` - Log format (json, simple)

### Health Check Configuration
- `HEALTH_CHECK_TIMEOUT` - Health check timeout in milliseconds

## Business Logic Configuration

### NCAA Ingestion Settings
- `NCAA_MAX_BATCH_SIZE` - Maximum number of games that can be ingested in a single batch (default: 100)
- `NCAA_RETRY_ATTEMPTS` - Number of retry attempts for failed ingestion (default: 3)
- `NCAA_VALIDATION_ENABLED` - Enable/disable validation during ingestion (default: true)
- `NCAA_DEFAULT_TIMEOUT` - Default timeout for ingestion operations in milliseconds (default: 30000)

### Games Service Settings

#### Pagination
- `GAMES_DEFAULT_LIMIT` - Default number of games per page (default: 50)
- `GAMES_MAX_LIMIT` - Maximum number of games per page (default: 100)
- `GAMES_DEFAULT_OFFSET` - Default pagination offset (default: 0)
- `GAMES_MAX_OFFSET` - Maximum pagination offset (default: 10000)

#### Validation
- `GAME_ID_MIN_LENGTH` - Minimum length for game IDs (default: 1)
- `GAME_ID_MAX_LENGTH` - Maximum length for game IDs (default: 100)
- `SPORT_MIN_LENGTH` - Minimum length for sport names (default: 1)
- `SPORT_MAX_LENGTH` - Maximum length for sport names (default: 50)
- `TEAM_NAME_MIN_LENGTH` - Minimum length for team names (default: 1)
- `TEAM_NAME_MAX_LENGTH` - Maximum length for team names (default: 100)
- `CONFERENCE_MIN_LENGTH` - Minimum length for conference names (default: 1)
- `CONFERENCE_MAX_LENGTH` - Maximum length for conference names (default: 100)
- `COLORS_MIN_LENGTH` - Minimum length for color strings (default: 1)
- `COLORS_MAX_LENGTH` - Maximum length for color strings (default: 100)

#### Sort Options
- Valid sort fields: `date`, `home_team`, `away_team`, `sport`, `status`, `created_at`
- Default sort field: `date`
- Default sort order: `DESC`

### Testing Configuration
- `UNIT_TEST_TIMEOUT` - Timeout for unit tests in milliseconds (default: 5000)
- `INTEGRATION_TEST_TIMEOUT` - Timeout for integration tests in milliseconds (default: 60000)
- `TEST_DELAY` - Delay between test operations in milliseconds (default: 1000)

## Configuration Usage

### In Services
```javascript
import { businessConfig } from '../config/index.js';

// Use configuration values
const maxLimit = businessConfig.games.pagination.maxLimit;
const maxBatchSize = businessConfig.ncaaIngestion.maxBatchSize;
```

### In Validators
```javascript
import { businessConfig } from '../config/index.js';

// Use validation limits
if (value.length > businessConfig.games.validation.teamName.maxLength) {
  throw new Error('Value too long');
}
```

### In Controllers
```javascript
import { businessConfig } from '../config/index.js';

// Use business logic limits
const maxBatchSize = businessConfig.ncaaIngestion.maxBatchSize;
if (data.length > maxBatchSize) {
  return res.status(400).json({ error: 'Batch too large' });
}
```

## Default Values

All configuration options have sensible defaults that work for most development and production environments. You only need to set environment variables if you want to override these defaults.

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
NCAA_MAX_BATCH_SIZE=50
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=warn
NCAA_MAX_BATCH_SIZE=200
GAMES_MAX_LIMIT=200
```

### Testing
```bash
NODE_ENV=test
UNIT_TEST_TIMEOUT=1000
INTEGRATION_TEST_TIMEOUT=30000
```

## Configuration Validation

The configuration system validates all values at startup and will throw errors for invalid configurations. This helps catch configuration errors early in the application lifecycle.

## Best Practices

1. **Use Environment Variables**: Always use environment variables for configuration that varies between environments
2. **Provide Sensible Defaults**: All configuration options should have sensible defaults
3. **Validate Configuration**: Validate configuration values at startup
4. **Document Changes**: Update this document when adding new configuration options
5. **Test Configuration**: Include configuration tests in your test suite
