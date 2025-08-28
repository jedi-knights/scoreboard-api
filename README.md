# Scoreboard API

A modern, scalable Express.js API for the Scoreboard application, built with SOLID principles and design patterns.

## 🏗️ Architecture

This API follows a clean, layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Repositories**: Abstract data access
- **Database Adapters**: Provide database-specific implementations
- **Routes**: Define API endpoints

### Design Patterns Used

- **Repository Pattern**: Abstracts data access logic
- **Strategy Pattern**: Allows easy switching between database backends
- **Factory Pattern**: Creates appropriate database adapters
- **Service Layer Pattern**: Separates business logic from controllers
- **MVC Pattern**: Organizes code into Model-View-Controller layers

## 🚀 Features

- **Multi-Database Support**: SQLite, PostgreSQL, and DynamoDB
- **RESTful API**: Follows REST conventions
- **Authentication Ready**: JWT-based authentication support
- **Rate Limiting**: Built-in request throttling
- **Health Checks**: Comprehensive health monitoring
- **CORS Support**: Configurable cross-origin requests
- **Security**: Helmet.js security headers
- **Logging**: Structured logging with Winston
- **Validation**: Input validation with Joi
- **Docker Support**: Containerized deployment
- **Testing**: Comprehensive testing with Jest and Testcontainers

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment and integration testing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scoreboard-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_TYPE` | Database backend (sqlite/postgres/dynamodb) | `sqlite` |
| `SQLITE_DATABASE_PATH` | SQLite database file path | `./data/scoreboard.db` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DATABASE` | PostgreSQL database name | `scoreboard` |
| `DYNAMODB_REGION` | DynamoDB region | `us-east-1` |

### Database Configuration

The API supports multiple database backends:

#### SQLite (Default)
- File-based database
- Perfect for development and testing
- No additional setup required

#### PostgreSQL
- Robust relational database
- Requires PostgreSQL server
- Uses connection pooling

#### DynamoDB
- AWS NoSQL database
- Supports local development with DynamoDB Local
- Scalable and managed

## 🧪 Testing

The API includes a comprehensive testing setup with both unit and integration tests using Jest and Testcontainers.

### Test Types

#### Unit Tests
- **Location**: `tests/unit/`
- **Purpose**: Test business logic without external dependencies
- **Speed**: Fast execution (< 5 seconds)
- **Dependencies**: Mocked database and external services
- **Coverage**: Business logic, validation, and utility functions

#### Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test API endpoints with real databases
- **Speed**: Slower execution (30-60 seconds)
- **Dependencies**: Real database instances via Testcontainers
- **Coverage**: End-to-end API functionality, database operations

### Test Setup

#### Jest Configuration
- **ES Modules Support**: Full ES6+ module support
- **Coverage Thresholds**: 80% minimum coverage required
- **Separate Configs**: Different timeouts and setups for unit vs integration tests
- **Mock Management**: Automatic cleanup between tests

#### Testcontainers Integration
- **PostgreSQL**: Spins up real PostgreSQL containers for testing
- **SQLite**: Uses local file-based database for fast testing
- **Automatic Cleanup**: Containers are automatically started/stopped
- **Isolated Testing**: Each test gets a clean database state

### Running Tests

```bash
# Run all tests
npm test

# Run only unit tests (fast)
npm run test:unit

# Run only integration tests (slower, requires Docker)
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run integration tests in watch mode
npm run test:integration:watch
```

### Test Environment Variables

```bash
# Set test database type
TEST_DATABASE=sqlite        # Use SQLite (default, fastest)
TEST_DATABASE=postgres      # Use PostgreSQL container (slower, more realistic)

# Set test environment
NODE_ENV=test              # Automatically set by test scripts
```

### Test Database Options

#### SQLite (Default)
- **Pros**: Fast, no Docker required, file-based
- **Cons**: Less realistic, different SQL dialect
- **Use Case**: Development, CI/CD, fast feedback

#### PostgreSQL (Testcontainers)
- **Pros**: Real database, production-like behavior, full SQL support
- **Cons**: Slower startup, requires Docker
- **Use Case**: Integration testing, production validation

### Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── setup-unit.js              # Unit test setup (mocks)
├── setup-integration.js       # Integration test setup (Testcontainers)
├── unit/                      # Unit tests
│   ├── services/             # Service layer tests
│   ├── controllers/          # Controller tests
│   └── utils/                # Utility function tests
└── integration/               # Integration tests
    ├── api/                  # API endpoint tests
    ├── database/             # Database operation tests
    └── end-to-end/           # Full workflow tests
```

### Writing Tests

#### Unit Test Example
```javascript
import { GamesService } from '../../../src/services/games-service.js';

describe('GamesService', () => {
  let gamesService;
  let mockDatabaseAdapter;

  beforeEach(() => {
    mockDatabaseAdapter = global.unitTestUtils.createMockDatabaseAdapter();
    gamesService = new GamesService(mockDatabaseAdapter);
  });

  it('should sanitize valid filters', () => {
    const filters = { sport: ' SOCCER ' };
    const result = gamesService.sanitizeFilters(filters);
    expect(result.sport).toBe('soccer');
  });
});
```

#### Integration Test Example
```javascript
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import { DatabaseFactory } from '../../../src/database/database-factory.js';

describe('Games API Integration', () => {
  let app;
  let databaseAdapter;

  beforeAll(async () => {
    // Get test database config
    const testConfig = global.integrationTestUtils.getTestDatabaseConfig('sqlite');
    
    // Create real database adapter
    databaseAdapter = DatabaseFactory.createAdapter(testConfig.config);
    await databaseAdapter.connect();
    
    // Create Express app
    app = createApp(databaseAdapter);
  });

  it('should create and retrieve a game', async () => {
    const gameData = global.testUtils.generateTestGame();
    
    // Create game
    const createResponse = await request(app)
      .post('/api/v1/games')
      .send(gameData);
    
    expect(createResponse.status).toBe(201);
    
    // Retrieve game
    const getResponse = await request(app)
      .get(`/api/v1/games/${gameData.game_id}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.game_id).toBe(gameData.game_id);
  });
});
```

### Test Utilities

#### Global Test Utils
- `testUtils.generateTestGame()`: Generate random game data
- `testUtils.generateTestTeam()`: Generate random team data
- `testUtils.randomString()`: Generate random strings
- `testUtils.randomDate()`: Generate random dates

#### Unit Test Utils
- `unitTestUtils.createMockDatabaseAdapter()`: Create mock database
- `unitTestUtils.createMockRequest()`: Create mock HTTP request
- `unitTestUtils.createMockResponse()`: Create mock HTTP response

#### Integration Test Utils
- `integrationTestUtils.setupPostgresContainer()`: Start PostgreSQL container
- `integrationTestUtils.getTestDatabaseConfig()`: Get database configuration
- `integrationTestUtils.cleanupPostgresContainer()`: Stop PostgreSQL container

### Test Coverage

The testing setup enforces 80% minimum coverage across:
- **Branches**: All code paths are tested
- **Functions**: All functions have tests
- **Lines**: All lines of code are executed
- **Statements**: All statements are covered

### Continuous Integration

The test setup is designed for CI/CD pipelines:
- **Fast Unit Tests**: Quick feedback on code changes
- **Comprehensive Integration Tests**: Validate production behavior
- **Coverage Reports**: Track test quality over time
- **Docker Support**: Consistent testing environment

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔧 Development

### Project Structure
```
src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── database/         # Database abstraction layer
│   ├── adapters/    # Database implementations
│   └── repositories/ # Data access layer
├── middleware/       # Express middleware
├── models/          # Data models
├── routes/          # API endpoint definitions
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation
├── app.js           # Express application setup
└── index.js         # Application entry point
```

### Adding New Features

1. **Create Repository**: Extend `BaseRepository`
2. **Create Service**: Implement business logic
3. **Create Controller**: Handle HTTP requests
4. **Create Routes**: Define API endpoints
5. **Add Validation**: Create validation schemas
6. **Write Tests**: Ensure code coverage

### Database Migration

When adding new database backends:

1. Create adapter extending `BaseDatabaseAdapter`
2. Update `DatabaseFactory`
3. Add configuration options
4. Update Docker Compose configuration

## 🚀 Deployment

### Production Considerations

- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set secure JWT secrets
- Enable rate limiting
- Configure logging
- Set up monitoring and health checks

### Environment-Specific Configs

- **Development**: SQLite, verbose logging, CORS enabled
- **Staging**: PostgreSQL, moderate logging, CORS restricted
- **Production**: PostgreSQL/DynamoDB, minimal logging, strict CORS

## 📊 Monitoring

### Health Checks
- `/health/liveness` - Kubernetes liveness probe
- `/health/readiness` - Kubernetes readiness probe
- `/health/detailed` - Comprehensive system status

### Metrics
- Request duration logging
- Database connection status
- Memory usage monitoring
- Error rate tracking

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new features (maintain 80% coverage)
3. Maintain code quality standards
4. Update documentation
5. Follow commit message conventions

### Testing Guidelines

1. **Unit Tests**: Write for all business logic
2. **Integration Tests**: Write for all API endpoints
3. **Coverage**: Maintain 80% minimum coverage
4. **Test Data**: Use test utilities for consistent data
5. **Cleanup**: Ensure tests clean up after themselves

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues or questions:
- Check the documentation
- Review the code examples
- Open an issue in the repository
- Contact the development team
