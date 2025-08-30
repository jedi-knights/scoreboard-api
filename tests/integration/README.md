# Integration Tests

This directory contains integration tests that test the full application stack, including database interactions, API endpoints, and external service integrations.

## Overview

The integration tests are designed to provide comprehensive testing of the application's behavior in an environment that closely resembles production. They use:

- **Test Containers**: Real database instances (PostgreSQL, MySQL) running in Docker containers
- **Mock Dependencies**: Controlled simulation of external services and database failures
- **Full App Testing**: Complete Express application with real HTTP requests
- **Test Data Management**: Automated creation and cleanup of test data

## Architecture

### Test Container Factory (`test-container-factory.js`)

Manages database containers and provides a unified interface for different database types:

- **PostgreSQL**: Full-featured database with health checks and schema setup
- **MySQL**: Database support (schema setup not yet implemented)
- **SQLite**: File-based database for fast testing

### Integration Test Environment (`setup-integration.js`)

Provides the main testing infrastructure:

- **Environment Management**: Initializes and manages test databases
- **Test Data Creation**: Builds realistic test scenarios
- **Cleanup**: Ensures test isolation between runs
- **Backward Compatibility**: Maintains existing `global.integrationTestUtils` interface

### Mock Database Adapter (`mock-database-adapter.js`)

Provides a consistent database interface for testing:

- **Query Simulation**: Mock responses for different query types
- **Transaction Support**: Full transaction lifecycle management
- **Error Simulation**: Controlled failure scenarios
- **Performance Testing**: Configurable delays and failure rates

## Usage

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with specific database types
TEST_DATABASES=postgres,sqlite npm run test:integration

# Run with PostgreSQL only
TEST_DATABASES=postgres npm run test:integration

# Run with SQLite only (default)
npm run test:integration
```

### Environment Variables

- `TEST_DATABASES`: Comma-separated list of database types to test
- `TEST_DATABASE`: Legacy variable for backward compatibility
- `TEST_TIMEOUT`: Test timeout in milliseconds (default: 30000)

### Test Structure

```javascript
import { integrationTestEnv } from './setup-integration.js';
import { createMockDatabaseAdapter } from './mock-database-adapter.js';

describe('My Integration Test', () => {
  let mockDb;

  beforeEach(async () => {
    // Create fresh mock database for each test
    mockDb = createMockDatabaseAdapter();
    
    // Create test data
    const conferences = await integrationTestEnv.createTestData('conference', { count: 3 });
  });

  afterEach(async () => {
    // Clean up test data
    await integrationTestEnv.cleanupTestData();
  });

  it('should test something', async () => {
    // Your test logic here
  });
});
```

## Test Data Scenarios

### Available Scenarios

- **`conference`**: Creates conference records
- **`team`**: Creates team records
- **`game`**: Creates game records
- **`complete_scenario`**: Creates full game scenarios with conferences, teams, and games

### Customizing Test Data

```javascript
// Create multiple records
const teams = await integrationTestEnv.createTestData('team', { 
  count: 5,
  dbType: 'postgres' // Specify database type
});

// Access database clients directly
const postgresClient = integrationTestEnv.getClient('postgres');
const sqliteConfig = integrationTestEnv.getConfig('sqlite');
```

## Mock Database Features

### Basic Operations

```javascript
const mockDb = createMockDatabaseAdapter();

// Connection management
await mockDb.connect();
await mockDb.disconnect();

// Query execution
const results = await mockDb.query('SELECT * FROM teams');
const single = await mockDb.querySingle('SELECT * FROM teams LIMIT 1');
const affected = await mockDb.run('INSERT INTO teams (name) VALUES (?)', ['New Team']);
```

### Transaction Support

```javascript
const result = await mockDb.executeTransaction(async (txId) => {
  // All operations within this callback are part of the transaction
  await mockDb.query('INSERT INTO teams (name) VALUES (?)', ['Team A']);
  await mockDb.query('INSERT INTO teams (name) VALUES (?)', ['Team B']);
  return 'success';
});
```

### Query Builder

```javascript
const results = mockDb
  .select('id, name')
  .from('teams')
  .where('sport = ?', 'basketball')
  .orderBy('name', 'ASC')
  .limit(10)
  .returning();
```

### Error Simulation

```javascript
// Create adapter that always fails
const failingDb = createFailingDatabaseAdapter();

// Create adapter with delays
const slowDb = createSlowDatabaseAdapter(100);

// Simulate specific errors
await mockDb.simulateConnectionError();
await mockDb.simulateQueryTimeout();
await mockDb.simulateDeadlock();
```

## Performance Testing

### Built-in Performance Utilities

```javascript
// Measure execution time
const { result, executionTime } = await global.integrationTestUtils.performance.measureExecutionTime(async () => {
  return await mockDb.query('SELECT * FROM teams');
});

// Load testing
const loadResult = await global.integrationTestUtils.performance.loadTest(async () => {
  return await mockDb.query('SELECT * FROM teams');
}, 100);

// Stress testing
const stressResult = await global.integrationTestUtils.performance.stressTest(async () => {
  return await mockDb.query('SELECT * FROM teams');
}, 10);
```

## Best Practices

### Test Isolation

- Always clean up test data between tests
- Use fresh mock objects for each test
- Avoid sharing state between test cases

### Database Selection

- Use SQLite for fast unit-style integration tests
- Use PostgreSQL for full database feature testing
- Use MySQL when testing MySQL-specific functionality

### Error Testing

- Test both success and failure scenarios
- Use mock adapters to simulate failures
- Verify error handling and recovery

### Performance Considerations

- Keep test data minimal but realistic
- Use appropriate timeouts for different database types
- Monitor resource usage during testing

## Troubleshooting

### Common Issues

1. **Container Startup Failures**: Ensure Docker is running and ports are available
2. **Timeout Errors**: Increase test timeout for slow database operations
3. **Connection Issues**: Check database configuration and network settings
4. **Schema Errors**: Verify database schema setup in container factory

### Debug Mode

Enable verbose logging by setting environment variables:

```bash
DEBUG=testcontainers npm run test:integration
```

### Manual Container Management

```bash
# Start PostgreSQL container manually
docker run -d --name test-postgres \
  -e POSTGRES_DB=scoreboard_test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test_password \
  -p 5432:5432 \
  postgres:15-alpine

# Run tests against manual container
TEST_DATABASES=postgres npm run test:integration

# Clean up
docker stop test-postgres
docker rm test-postgres
```

## Future Enhancements

- [ ] MySQL schema setup and testing
- [ ] Redis container support
- [ ] Message queue testing
- [ ] Load balancer testing
- [ ] Multi-region testing scenarios
- [ ] Chaos engineering tests
- [ ] Performance benchmarking suite
