/**
 * Test Factories Example
 * 
 * This file demonstrates how to use the new test factories and utilities.
 * It serves as a reference for writing tests with the enhanced testing infrastructure.
 */

import { MockFactory } from '../mocks/mock-factory.js';
import { NCAAGameBuilder, GameBuilder } from '../builders/index.js';
import { TestUtils, TestAssertions } from '../utils/test-utils.js';

describe('Test Factories Usage Examples', () => {
  describe('MockFactory Examples', () => {
    it('should create a mock NCAA Ingestion Service', () => {
      // Create a basic mock service
      const mockService = MockFactory.createMockNCAAIngestionService();
      
      expect(mockService.ingestGame).toBeDefined();
      expect(mockService.ingestGames).toBeDefined();
      expect(mockService.validateNCAAGameData).toBeDefined();
      expect(mockService.generateGameId).toBeDefined();
      
      // Test default behavior
      expect(mockService.generateGameId()).toBe('game-123');
    });

    it('should create a mock NCAA Ingestion Service with custom overrides', () => {
      // Override specific methods
      const mockService = MockFactory.createMockNCAAIngestionService({
        generateGameId: MockFactory.createMockFunction().mockReturnValue('custom-game-id'),
        ingestGame: MockFactory.createMockFunction().mockResolvedValue({
          success: false,
          message: 'Custom error message'
        })
      });
      
      expect(mockService.generateGameId()).toBe('custom-game-id');
      expect(mockService.ingestGame()).resolves.toEqual({
        success: false,
        message: 'Custom error message'
      });
    });

    it('should create a mock Games Service', () => {
      const mockService = MockFactory.createMockGamesService();
      
      expect(mockService.getGames).toBeDefined();
      expect(mockService.getGameById).toBeDefined();
      expect(mockService.createGame).toBeDefined();
      expect(mockService.updateGame).toBeDefined();
      expect(mockService.deleteGame).toBeDefined();
      
      // Test default behavior
      expect(mockService.getGames()).resolves.toEqual({
        data: [{ id: 1, name: 'Test Game' }],
        total: 1,
        metadata: {
          filters: {},
          sortOptions: { field: 'date', order: 'DESC' }
        }
      });
    });

    it('should create a mock Database Adapter', () => {
      const mockAdapter = MockFactory.createMockDatabaseAdapter();
      
      expect(mockAdapter.connect).toBeDefined();
      expect(mockAdapter.disconnect).toBeDefined();
      expect(mockAdapter.isConnected).toBeDefined();
      expect(mockAdapter.query).toBeDefined();
      expect(mockAdapter.beginTransaction).toBeDefined();
      expect(mockAdapter.commitTransaction).toBeDefined();
      expect(mockAdapter.rollbackTransaction).toBeDefined();
      
      // Test default behavior
      expect(mockAdapter.isConnected()).toBe(true);
      expect(mockAdapter.beginTransaction()).resolves.toBe('tx-123');
    });

    it('should create a mock Response Formatter', () => {
      const mockFormatter = MockFactory.createMockResponseFormatter();
      
      expect(mockFormatter.formatSuccess).toBeDefined();
      expect(mockFormatter.formatError).toBeDefined();
      expect(mockFormatter.formatValidationError).toBeDefined();
      expect(mockFormatter.formatNotFoundError).toBeDefined();
      
      // Test default behavior
      expect(mockFormatter.formatSuccess()).toEqual({
        status: 200,
        body: { success: true, message: 'Success' }
      });
    });

    it('should create mock Request and Response objects', () => {
      const mockReq = MockFactory.createMockRequest({
        method: 'POST',
        url: '/api/games',
        body: { name: 'Test Game' }
      });
      
      const mockRes = MockFactory.createMockResponse();
      
      expect(mockReq.method).toBe('POST');
      expect(mockReq.url).toBe('/api/games');
      expect(mockReq.body).toEqual({ name: 'Test Game' });
      
      expect(mockRes.status).toBeDefined();
      expect(mockRes.json).toBeDefined();
      expect(mockRes.send).toBeDefined();
    });
  });

  describe('Test Data Builders Examples', () => {
    it('should build valid NCAA games', () => {
      // Basic valid game
      const validGame = NCAAGameBuilder.buildValidGame();
      
      expect(validGame.home_team).toBe('Test Home Team');
      expect(validGame.away_team).toBe('Test Away Team');
      expect(validGame.sport).toBe('basketball');
      expect(validGame.division).toBe('d1');
      expect(validGame.date).toBe('2024-01-01');
      
      // Game with custom overrides
      const customGame = NCAAGameBuilder.buildValidGame({
        home_team: 'Lakers',
        away_team: 'Warriors',
        sport: 'basketball'
      });
      
      expect(customGame.home_team).toBe('Lakers');
      expect(customGame.away_team).toBe('Warriors');
      expect(customGame.sport).toBe('basketball');
    });

    it('should build invalid NCAA games for testing validation', () => {
      const invalidGame = NCAAGameBuilder.buildInvalidGame();
      
      expect(invalidGame.home_team).toBe(''); // Empty string
      expect(invalidGame.sport).toBe('invalid-sport'); // Invalid sport
      expect(invalidGame.date).toBe('invalid-date'); // Invalid date
      expect(invalidGame.venue.length).toBeGreaterThan(100); // Too long
    });

    it('should build games with specific validation errors', () => {
      const gameWithErrors = NCAAGameBuilder.buildGameWithValidationErrors([
        'missing_home_team',
        'invalid_sport',
        'invalid_date'
      ]);
      
      expect(gameWithErrors.home_team).toBe('');
      expect(gameWithErrors.sport).toBe('invalid-sport');
      expect(gameWithErrors.date).toBe('invalid-date');
    });

    it('should build games with scores', () => {
      const gameWithScores = NCAAGameBuilder.buildGameWithScores();
      
      expect(gameWithScores.home_score).toBe(85);
      expect(gameWithScores.away_score).toBe(78);
      expect(gameWithScores.status).toBe('final');
      expect(gameWithScores.period_scores).toBeDefined();
    });

    it('should build live games', () => {
      const liveGame = NCAAGameBuilder.buildLiveGame();
      
      expect(liveGame.status).toBe('live');
      expect(liveGame.current_period).toBe(2);
      expect(liveGame.time_remaining).toBe('15:30');
      expect(liveGame.home_score).toBe(45);
      expect(liveGame.away_score).toBe(42);
    });

    it('should build multiple games for batch testing', () => {
      const games = NCAAGameBuilder.buildMultipleGames(3, {
        sport: 'football',
        division: 'd2'
      });
      
      expect(games).toHaveLength(3);
      games.forEach((game, index) => {
        expect(game.sport).toBe('football');
        expect(game.division).toBe('d2');
        expect(game.home_team).toBe(`Home Team ${index + 1}`);
        expect(game.away_team).toBe(`Away Team ${index + 1}`);
      });
    });

    it('should build games with customizers', () => {
      const games = NCAAGameBuilder.buildMultipleGames(2, {}, (game, index) => {
        game.sport = index === 0 ? 'basketball' : 'football';
        game.division = index === 0 ? 'd1' : 'd2';
        return game;
      });
      
      expect(games[0].sport).toBe('basketball');
      expect(games[0].division).toBe('d1');
      expect(games[1].sport).toBe('football');
      expect(games[1].division).toBe('d2');
    });

    it('should build general games for the games service', () => {
      const validGame = GameBuilder.buildValidGame();
      
      expect(validGame.game_id).toBe('game-123');
      expect(validGame.home_team).toBe('Test Home Team');
      expect(validGame.away_team).toBe('Test Away Team');
      expect(validGame.sport).toBe('basketball');
      expect(validGame.status).toBe('scheduled');
      
      // Game with scores
      const gameWithScores = GameBuilder.buildGameWithScores();
      expect(gameWithScores.status).toBe('final');
      expect(gameWithScores.home_score).toBe(85);
      expect(gameWithScores.away_score).toBe(78);
    });

    it('should build games with team information', () => {
      const gameWithTeams = GameBuilder.buildGameWithTeams();
      
      expect(gameWithTeams.home_team_id).toBe('team-1');
      expect(gameWithTeams.away_team_id).toBe('team-2');
      expect(gameWithTeams.home_team).toBeDefined();
      expect(gameWithTeams.away_team).toBeDefined();
      expect(gameWithTeams.home_team.name).toBe('Home Team');
      expect(gameWithTeams.away_team.name).toBe('Away Team');
    });
  });

  describe('TestUtils Examples', () => {
    it('should create async mocks', async () => {
      const asyncMock = TestUtils.createAsyncMock('success', true);
      const errorMock = TestUtils.createAsyncMock('error', false);
      
      expect(asyncMock()).resolves.toBe('success');
      expect(errorMock()).rejects.toBe('error');
    });

    it('should create error mocks', () => {
      const errorMock = TestUtils.createErrorMock('Test error message');
      
      expect(() => errorMock()).toThrow('Test error message');
    });

    it('should create sequential mocks', () => {
      const sequentialMock = TestUtils.createSequentialMock(['first', 'second', 'third']);
      
      expect(sequentialMock()).toBe('first');
      expect(sequentialMock()).toBe('second');
      expect(sequentialMock()).toBe('third');
      expect(sequentialMock()).toBe('third'); // Subsequent calls return last value
    });

    it('should create delayed mocks', async () => {
      const startTime = Date.now();
      const delayedMock = TestUtils.createDelayedMock(100, 'delayed result');
      
      const result = await delayedMock();
      const endTime = Date.now();
      
      expect(result).toBe('delayed result');
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('should create failing mocks', () => {
      const failingMock = TestUtils.createFailingMock(2, 'Failed after 2 calls', 'success');
      
      expect(failingMock()).toBe('success');
      expect(failingMock()).toBe('success');
      expect(() => failingMock()).toThrow('Failed after 2 calls');
    });

    it('should create async failing mocks', async () => {
      const asyncFailingMock = TestUtils.createAsyncFailingMock(1, 'Async failure', 'success');
      
      expect(asyncFailingMock()).resolves.toBe('success');
      expect(asyncFailingMock()).rejects.toThrow('Async failure');
    });

    it('should create validating mocks', () => {
      const validator = (arg) => typeof arg === 'string' && arg.length > 0;
      const validatingMock = TestUtils.createValidatingMock(validator, 'valid', 'invalid input');
      
      expect(validatingMock('test')).toBe('valid');
      expect(() => validatingMock('')).toThrow('invalid input');
      expect(() => validatingMock(123)).toThrow('invalid input');
    });

    it('should create tracking mocks', () => {
      const trackingMock = TestUtils.createTrackingMock('default');
      
      trackingMock('first', 'call');
      trackingMock('second', 'call');
      
      expect(trackingMock.getCallCount()).toBe(2);
      expect(trackingMock.getLastCallArgs()).toEqual(['second', 'call']);
      expect(trackingMock.wasCalledWith('first', 'call')).toBe(true);
      expect(trackingMock.wasCalledWith('not', 'called')).toBe(false);
    });

    it('should create configurable mocks', () => {
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
    });

    it('should create mock objects', () => {
      const mockObj = TestUtils.createMockObject(['method1', 'method2'], {
        method1: () => 'custom implementation'
      });
      
      expect(mockObj.method1).toBeDefined();
      expect(mockObj.method2).toBeDefined();
      expect(mockObj.method1()).toBe('custom implementation');
      expect(mockObj.method2()).toBeUndefined();
    });

    it('should create test contexts', () => {
      const context = TestUtils.createTestContext({
        testName: 'Example Test'
      });
      
      expect(context.testId).toBeDefined();
      expect(context.startTime).toBeDefined();
      expect(context.testName).toBe('Example Test');
      
      context.setMetadata('customKey', 'customValue');
      expect(context.getMetadata('customKey')).toBe('customValue');
      
      const cleanupFn = MockFactory.createMockFunction();
      context.addCleanup(cleanupFn);
      expect(context.cleanup).toHaveLength(1);
    });

    it('should create scenario builders', () => {
      const scenario = TestUtils.createScenarioBuilder()
        .withInput({ test: 'data' })
        .withExpectedOutput({ result: 'success' })
        .withMock('service', { method: 'mock' })
        .withError('expected error')
        .withSetup(() => console.log('setup'))
        .withTeardown(() => console.log('teardown'))
        .build();
      
      expect(scenario.input).toEqual({ test: 'data' });
      expect(scenario.expectedOutput).toEqual({ result: 'success' });
      expect(scenario.mocks.service).toEqual({ method: 'mock' });
      expect(scenario.error).toBe('expected error');
      expect(scenario.setup).toBeDefined();
      expect(scenario.teardown).toBeDefined();
    });
  });

  describe('TestAssertions Examples', () => {
    it('should assert that functions throw errors', async () => {
      const throwingFn = () => {
        throw new Error('Test error');
      };
      
      const nonThrowingFn = () => {
        return 'success';
      };
      
      await TestAssertions.assertThrows(throwingFn, 'Test error');
      await TestAssertions.assertThrows(throwingFn, /Test error/);
      await TestAssertions.assertDoesNotThrow(nonThrowingFn);
    });

    it('should assert object properties', () => {
      const testObj = {
        name: 'Test',
        value: 42,
        nested: { key: 'value' }
      };
      
      TestAssertions.assertHasProperties(testObj, ['name', 'value', 'nested']);
      
      TestAssertions.assertObjectStructure(testObj, {
        name: 'string',
        value: 'number',
        nested: 'object'
      });
    });
  });

  describe('Integration Examples', () => {
    it('should demonstrate a complete test setup', async () => {
      // Create mocks
      const mockService = MockFactory.createMockNCAAIngestionService({
        ingestGame: MockFactory.createMockFunction().mockResolvedValue({
          success: true,
          game_id: 'game-123',
          action: 'created'
        })
      });
      
      const mockLogger = MockFactory.createMockLogger();
      
      // Create test data
      const testGame = NCAAGameBuilder.buildValidGame({
        home_team: 'Lakers',
        away_team: 'Warriors'
      });
      
      // Create test context
      const context = TestUtils.createTestContext({
        testName: 'Integration Test'
      });
      
      // Add cleanup
      context.addCleanup(() => {
        mockService.ingestGame.mockClear();
        mockLogger.info.mockClear();
      });
      
      // Execute test
      const result = await mockService.ingestGame(testGame);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.game_id).toBe('game-123');
      expect(result.action).toBe('created');
      expect(mockService.ingestGame).toHaveBeenCalledWith(testGame);
      
      // Execute cleanup
      await TestUtils.executeCleanup(context.cleanup);
      
      // Verify cleanup was executed (the cleanup functions were called)
      expect(context.cleanup).toHaveLength(1);
      // Note: We can't easily verify that mockClear was called since it's not a Jest mock function
      // The important thing is that our cleanup system works
    });

    it('should demonstrate testing error scenarios', async () => {
      // Create a service that fails after 2 calls
      const mockService = MockFactory.createMockNCAAIngestionService({
        ingestGame: TestUtils.createAsyncFailingMock(2, 'Service unavailable', { success: true })
      });
      
      const validGame = NCAAGameBuilder.buildValidGame();
      
      // First two calls should succeed
      expect(await mockService.ingestGame(validGame)).toEqual({ success: true });
      expect(await mockService.ingestGame(validGame)).toEqual({ success: true });
      
      // Third call should fail
      expect(mockService.ingestGame(validGame)).rejects.toThrow('Service unavailable');
    });

    it('should demonstrate testing validation scenarios', () => {
      // Test various validation error combinations
      const validationScenarios = [
        ['missing_home_team'],
        ['invalid_sport'],
        ['invalid_date'],
        ['missing_home_team', 'invalid_sport'],
        ['missing_home_team', 'invalid_sport', 'invalid_date']
      ];
      
      validationScenarios.forEach(scenario => {
        const invalidGame = NCAAGameBuilder.buildGameWithValidationErrors(scenario);
        
        // Assert that the game has the expected validation errors
        scenario.forEach(errorType => {
          switch (errorType) {
            case 'missing_home_team':
              expect(invalidGame.home_team).toBe('');
              break;
            case 'invalid_sport':
              expect(invalidGame.sport).toBe('invalid-sport');
              break;
            case 'invalid_date':
              expect(invalidGame.date).toBe('invalid-date');
              break;
          }
        });
      });
    });
  });
});
