# Test Factories Guide

## Overview

This guide explains how to use the comprehensive test factories and utilities created to improve testing capabilities in the Scoreboard API project. These tools provide consistent mocking, test data generation, and testing utilities across all test suites.

## Table of Contents

1. [MockFactory](#mockfactory)
2. [Test Data Builders](#test-data-builders)
3. [TestUtils](#testutils)
4. [TestAssertions](#testassertions)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## MockFactory

The `MockFactory` provides centralized creation of mock objects for all major services, repositories, and utilities.

### Available Mock Methods

#### `createMockNCAAIngestionService(overrides = {})`
Creates a mock NCAA Ingestion Service with all required methods.

```javascript
import { MockFactory } from '../mocks/mock-factory.js';

const mockService = MockFactory.createMockNCAAIngestionService({
  ingestGame: jest.fn().mockResolvedValue({
    success: false,
    message: 'Custom error'
  })
});
```

**Default Mock Methods:**
- `ingestGame()` - Returns successful game creation
- `ingestGames()` - Returns batch ingestion results
- `validateNCAAGameData()` - No-op validation
- `generateGameId()` - Returns 'game-123'
- `getHealthStatus()` - Returns healthy status

#### `createMockGamesService(overrides = {})`
Creates a mock Games Service with comprehensive CRUD operations.

```javascript
const mockService = MockFactory.createMockGamesService({
  getGames: jest.fn().mockResolvedValue([])
});
```

**Default Mock Methods:**
- `getGames()` - Returns paginated games list
- `getGameById()` - Returns single game
- `createGame()` - Returns created game
- `updateGame()` - Returns updated game
- `deleteGame()` - Returns deletion result
- `getGameStatistics()` - Returns statistics
- `getLiveGames()` - Returns live games
- `getGamesByDateRange()` - Returns date-filtered games
- `getGamesByTeam()` - Returns team-filtered games

#### `createMockDatabaseAdapter(overrides = {})`
Creates a mock database adapter with transaction support.

```javascript
const mockAdapter = MockFactory.createMockDatabaseAdapter({
  query: jest.fn().mockResolvedValue([{ id: 1 }])
});
```

**Default Mock Methods:**
- `connect()` - Resolves to true
- `disconnect()` - Resolves to true
- `isConnected()` - Returns true
- `query()` - Returns empty array
- `get()` - Returns null
- `run()` - Returns { lastID: 1, changes: 1 }
- `beginTransaction()` - Returns 'tx-123'
- `commitTransaction()` - Resolves to true
- `rollbackTransaction()` - Resolves to true
- `getHealthStatus()` - Returns healthy status

#### `createMockResponseFormatter(overrides = {})`
Creates a mock response formatter for testing formatting logic.

```javascript
const mockFormatter = MockFactory.createMockResponseFormatter({
  formatSuccess: jest.fn().mockReturnValue({
    status: 201,
    body: { success: true, message: 'Created' }
  })
});
```

#### `createMockRequest(overrides = {})`
Creates a mock Express request object.

```javascript
const mockReq = MockFactory.createMockRequest({
  method: 'POST',
  body: { name: 'Test Game' },
  params: { id: '123' }
});
```

#### `createMockResponse(overrides = {})`
Creates a mock Express response object with chaining support.

```javascript
const mockRes = MockFactory.createMockResponse();

// Test response behavior
mockRes.status(201).json({ success: true });
expect(mockRes.statusCode).toBe(201);
expect(mockRes.body).toEqual({ success: true });
```

#### `createMockContainer(overrides = {})`
Creates a mock dependency injection container.

```javascript
const mockContainer = MockFactory.createMockContainer({
  resolve: jest.fn().mockReturnValue(mockService)
});
```

#### `createMockHateoas(overrides = {})`
Creates a mock HATEOAS utility for testing link generation.

```javascript
const mockHateoas = MockFactory.createMockHateoas({
  generateCollectionLinks: jest.fn().mockReturnValue({
    self: '/api/games',
    next: '/api/games?page=2'
  })
});
```

## Test Data Builders

Test data builders provide consistent, valid, and invalid test data for various scenarios.

### NCAAGameBuilder

Creates NCAA game data for testing the NCAA ingestion service.

#### `buildValidGame(overrides = {})`
Creates a valid NCAA game with all required fields.

```javascript
import { NCAAGameBuilder } from '../builders/index.js';

const validGame = NCAAGameBuilder.buildValidGame({
  home_team: 'Lakers',
  away_team: 'Warriors',
  sport: 'basketball'
});
```

#### `buildInvalidGame(overrides = {})`
Creates an invalid NCAA game with validation errors.

```javascript
const invalidGame = NCAAGameBuilder.buildInvalidGame();
// Contains: empty home_team, invalid sport, invalid date, etc.
```

#### `buildGameWithScores(overrides = {})`
Creates a game with scores and period data.

```javascript
const scoredGame = NCAAGameBuilder.buildGameWithScores({
  home_score: 100,
  away_score: 95
});
```

#### `buildLiveGame(overrides = {})`
Creates a live game with current period and time remaining.

```javascript
const liveGame = NCAAGameBuilder.buildLiveGame({
  current_period: 3,
  time_remaining: '10:30'
});
```

#### `buildMultipleGames(count, baseOverrides, customizer)`
Creates multiple games for batch testing.

```javascript
const games = NCAAGameBuilder.buildMultipleGames(3, {
  sport: 'football',
  division: 'd2'
}, (game, index) => {
  game.date = `2024-01-${String(index + 1).padStart(2, '0')}`;
  return game;
});
```

#### `buildGameWithValidationErrors(errorTypes, overrides)`
Creates a game with specific validation errors.

```javascript
const gameWithErrors = NCAAGameBuilder.buildGameWithValidationErrors([
  'missing_home_team',
  'invalid_sport',
  'invalid_date'
]);
```

**Available Error Types:**
- `missing_home_team` - Empty home team
- `missing_away_team` - Empty away team
- `invalid_sport` - Invalid sport value
- `invalid_division` - Invalid division value
- `invalid_date` - Invalid date format
- `invalid_time` - Invalid time format
- `long_home_team` - Home team name too long
- `long_away_team` - Away team name too long
- `invalid_state` - Invalid state value
- `invalid_country` - Invalid country value
- `invalid_gender` - Invalid gender value

### GameBuilder

Creates general game data for testing the games service.

#### `buildValidGame(overrides = {})`
Creates a valid game with all required fields.

```javascript
import { GameBuilder } from '../builders/index.js';

const validGame = GameBuilder.buildValidGame({
  game_id: 'custom-game-123',
  home_team: 'Lakers',
  away_team: 'Warriors'
});
```

#### `buildGameWithTeams(overrides = {})`
Creates a game with embedded team information.

```javascript
const gameWithTeams = GameBuilder.buildGameWithTeams();
// Includes home_team and away_team objects
```

#### `buildGameWithConference(overrides = {})`
Creates a game with embedded conference information.

```javascript
const gameWithConference = GameBuilder.buildGameWithConference();
// Includes conference object
```

#### `buildGameWithVenue(overrides = {})`
Creates a game with embedded venue information.

```javascript
const gameWithVenue = GameBuilder.buildGameWithVenue();
// Includes venue object
```

## TestUtils

The `TestUtils` class provides advanced mock creation and testing utilities.

### Mock Creation Utilities

#### `createAsyncMock(returnValue, shouldResolve)`
Creates a mock function that returns a promise.

```javascript
const successMock = TestUtils.createAsyncMock('success', true);
const errorMock = TestUtils.createAsyncMock('error', false);

expect(successMock()).resolves.toBe('success');
expect(errorMock()).rejects.toBe('error');
```

#### `createErrorMock(error)`
Creates a mock function that throws an error.

```javascript
const errorMock = TestUtils.createErrorMock('Test error');
expect(() => errorMock()).toThrow('Test error');
```

#### `createSequentialMock(returnValues)`
Creates a mock that returns different values on subsequent calls.

```javascript
const sequentialMock = TestUtils.createSequentialMock(['first', 'second', 'third']);
expect(sequentialMock()).toBe('first');
expect(sequentialMock()).toBe('second');
expect(sequentialMock()).toBe('third');
```

#### `createDelayedMock(delayMs, returnValue)`
Creates a mock that delays execution.

```javascript
const delayedMock = TestUtils.createDelayedMock(100, 'delayed result');
const result = await delayedMock(); // Takes 100ms
```

#### `createFailingMock(failAfterCalls, error, successValue)`
Creates a mock that fails after a certain number of calls.

```javascript
const failingMock = TestUtils.createFailingMock(2, 'Failed', 'success');
expect(failingMock()).toBe('success'); // First call
expect(failingMock()).toBe('success'); // Second call
expect(() => failingMock()).toThrow('Failed'); // Third call fails
```

#### `createAsyncFailingMock(failAfterCalls, error, successValue)`
Creates an async mock that fails after a certain number of calls.

```javascript
const asyncFailingMock = TestUtils.createAsyncFailingMock(1, 'Async failure', 'success');
expect(asyncFailingMock()).resolves.toBe('success'); // First call
expect(asyncFailingMock()).rejects.toThrow('Async failure'); // Second call fails
```

#### `createValidatingMock(validator, returnValue, error)`
Creates a mock that validates input parameters.

```javascript
const validator = (arg) => typeof arg === 'string' && arg.length > 0;
const validatingMock = TestUtils.createValidatingMock(validator, 'valid', 'invalid input');

expect(validatingMock('test')).toBe('valid');
expect(() => validatingMock('')).toThrow('invalid input');
```

#### `createTrackingMock(returnValue)`
Creates a mock that tracks call arguments and provides utility methods.

```javascript
const trackingMock = TestUtils.createTrackingMock('default');

trackingMock('first', 'call');
trackingMock('second', 'call');

expect(trackingMock.getCallCount()).toBe(2);
expect(trackingMock.getLastCallArgs()).toEqual(['second', 'call']);
expect(trackingMock.wasCalledWith('first', 'call')).toBe(true);
```

#### `createConfigurableMock(defaultReturnValue)`
Creates a mock that can be configured at runtime.

```javascript
const configurableMock = TestUtils.createConfigurableMock('default');

configurableMock.configure({
  returnValue: 'configured',
  implementation: (x) => `processed: ${x}`
});

expect(configurableMock('test')).toBe('processed: test');

configurableMock.configure({
  throwError: new Error('thrown error')
});

expect(() => configurableMock()).toThrow('thrown error');
```

### Testing Utilities

#### `wait(ms)`
Waits for a specified number of milliseconds.

```javascript
await TestUtils.wait(100); // Wait 100ms
```

#### `waitFor(condition, timeout, interval)`
Waits for a condition to be true.

```javascript
await TestUtils.waitFor(() => element.isVisible(), 5000, 100);
```

#### `createTestContext(overrides)`
Creates a test context object with metadata and cleanup tracking.

```javascript
const context = TestUtils.createTestContext({
  testName: 'Example Test'
});

context.setMetadata('customKey', 'customValue');
context.addCleanup(() => cleanupFunction());

// Later...
await TestUtils.executeCleanup(context.cleanup);
```

#### `createDataGenerator(generatorFn, options)`
Creates a test data generator function.

```javascript
const gameGenerator = TestUtils.createDataGenerator(
  (options) => ({ sport: options.sport || 'basketball' }),
  { sport: 'football' }
);

const game = gameGenerator({ home_team: 'Lakers' });
// Result: { sport: 'football', home_team: 'Lakers' }
```

#### `createScenarioBuilder(baseScenario)`
Creates a test scenario builder with fluent API.

```javascript
const scenario = TestUtils.createScenarioBuilder()
  .withInput({ test: 'data' })
  .withExpectedOutput({ result: 'success' })
  .withMock('service', { method: 'mock' })
  .withError('expected error')
  .withSetup(() => setupFunction())
  .withTeardown(() => teardownFunction())
  .build();
```

## TestAssertions

The `TestAssertions` object provides common testing assertions.

### Available Assertions

#### `assertThrows(fn, expectedError)`
Asserts that a function throws an error.

```javascript
await TestAssertions.assertThrows(
  () => { throw new Error('Test error'); },
  'Test error'
);

await TestAssertions.assertThrows(
  () => { throw new Error('Test error'); },
  /Test error/
);
```

#### `assertDoesNotThrow(fn)`
Asserts that a function does not throw an error.

```javascript
await TestAssertions.assertDoesNotThrow(
  () => { return 'success'; }
);
```

#### `assertHasProperties(obj, requiredProps)`
Asserts that an object has all required properties.

```javascript
TestAssertions.assertHasProperties(
  { name: 'Test', value: 42 },
  ['name', 'value']
);
```

#### `assertObjectStructure(obj, expectedStructure)`
Asserts that an object has the expected structure.

```javascript
TestAssertions.assertObjectStructure(
  { name: 'Test', value: 42, nested: { key: 'value' } },
  {
    name: 'string',
    value: 'number',
    nested: 'object'
  }
);
```

## Usage Examples

### Basic Controller Testing

```javascript
import { MockFactory, NCAAGameBuilder } from '../test-utils.js';

describe('NCAA Ingestion Controller', () => {
  let mockService;
  let mockReq;
  let mockRes;
  
  beforeEach(() => {
    mockService = MockFactory.createMockNCAAIngestionService();
    mockReq = MockFactory.createMockRequest({
      body: NCAAGameBuilder.buildValidGame()
    });
    mockRes = MockFactory.createMockResponse();
  });
  
  it('should ingest a valid game', async () => {
    const controller = new NCAAIngestionController(mockService);
    
    await controller.ingestGame(mockReq, mockRes);
    
    expect(mockService.ingestGame).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.statusCode).toBe(201);
  });
});
```

### Testing Error Scenarios

```javascript
it('should handle validation errors', async () => {
  const invalidGame = NCAAGameBuilder.buildGameWithValidationErrors([
    'missing_home_team',
    'invalid_sport'
  ]);
  
  mockReq.body = invalidGame;
  
  await controller.ingestGame(mockReq, mockRes);
  
  expect(mockRes.statusCode).toBe(400);
  expect(mockRes.body.error).toBe('Validation Failed');
});
```

### Testing Service Dependencies

```javascript
it('should handle service errors gracefully', async () => {
  const failingService = MockFactory.createMockNCAAIngestionService({
    ingestGame: TestUtils.createAsyncFailingMock(1, 'Service unavailable', { success: true })
  });
  
  const controller = new NCAAIngestionController(failingService);
  
  // First call succeeds
  await controller.ingestGame(mockReq, mockRes);
  expect(mockRes.statusCode).toBe(201);
  
  // Second call fails
  await controller.ingestGame(mockReq, mockRes);
  expect(mockRes.statusCode).toBe(500);
});
```

### Testing Batch Operations

```javascript
it('should handle batch ingestion', async () => {
  const games = NCAAGameBuilder.buildMultipleGames(5, {
    sport: 'basketball',
    division: 'd1'
  });
  
  mockReq.body = games;
  
  await controller.ingestGames(mockReq, mockRes);
  
  expect(mockService.ingestGames).toHaveBeenCalledWith(games);
  expect(mockRes.statusCode).toBe(200);
});
```

## Best Practices

### 1. Use MockFactory for Consistent Mocks
Always use `MockFactory` methods instead of manually creating mocks to ensure consistency across tests.

```javascript
// Good
const mockService = MockFactory.createMockNCAAIngestionService();

// Avoid
const mockService = {
  ingestGame: jest.fn(),
  // ... manually defined methods
};
```

### 2. Leverage Test Data Builders
Use test data builders to create consistent, valid, and invalid test data.

```javascript
// Good
const validGame = NCAAGameBuilder.buildValidGame({
  home_team: 'Lakers',
  away_team: 'Warriors'
});

// Avoid
const validGame = {
  home_team: 'Lakers',
  away_team: 'Warriors',
  sport: 'basketball',
  // ... manually defined properties
};
```

### 3. Use TestUtils for Complex Mock Scenarios
Use `TestUtils` methods for complex mocking scenarios like failing mocks, delayed mocks, etc.

```javascript
// Good
const failingMock = TestUtils.createAsyncFailingMock(2, 'Service error', { success: true });

// Avoid
let callCount = 0;
const failingMock = jest.fn().mockImplementation(() => {
  callCount++;
  if (callCount > 2) {
    return Promise.reject(new Error('Service error'));
  }
  return Promise.resolve({ success: true });
});
```

### 4. Leverage Test Contexts for Cleanup
Use test contexts to track and execute cleanup functions.

```javascript
const context = TestUtils.createTestContext();
context.addCleanup(() => mockService.ingestGame.mockClear());

// Test logic here...

await TestUtils.executeCleanup(context.cleanup);
```

### 5. Use Scenario Builders for Complex Tests
Use scenario builders for tests with multiple setup requirements.

```javascript
const scenario = TestUtils.createScenarioBuilder()
  .withInput(testData)
  .withExpectedOutput(expectedResult)
  .withMock('service', mockConfig)
  .build();

// Use scenario in test...
```

### 6. Test Both Success and Failure Paths
Always test both successful operations and error scenarios.

```javascript
describe('Game Creation', () => {
  it('should create a game successfully', async () => {
    // Test success path
  });
  
  it('should handle validation errors', async () => {
    // Test validation failure
  });
  
  it('should handle service errors', async () => {
    // Test service failure
  });
});
```

## Conclusion

The test factories and utilities provide a comprehensive foundation for writing maintainable, consistent, and thorough tests. By following the patterns and best practices outlined in this guide, you can create robust test suites that are easy to maintain and extend.

For more examples, see the `tests/examples/test-factories-example.test.js` file which demonstrates all the features in action.
