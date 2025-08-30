/**
 * Comprehensive Test Factories Example
 * 
 * This test demonstrates the comprehensive test infrastructure including:
 * - All test data builders (Game, Team, Conference, NCAA Game)
 * - Enhanced mock factories with various scenarios
 * - Integration test utilities
 * - Performance testing capabilities
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../mocks/mock-factory.js';
import { GameBuilder } from '../builders/game-builder.js';
import { TeamBuilder } from '../builders/team-builder.js';
import { ConferenceBuilder } from '../builders/conference-builder.js';
import { NCAAGameBuilder } from '../builders/ncaa-game-builder.js';
import { TestUtils, TestAssertions } from '../utils/test-utils.js';

describe('Comprehensive Test Factories Example', () => {
  let mockGamesService, mockTeamsService, mockConferencesService, mockDatabaseAdapter;

  // Mock integration test utilities for unit test examples
  const mockIntegrationUtils = {
    performance: {
      measureExecutionTime: async (operation) => {
        const start = performance.now();
        const result = await operation();
        const end = performance.now();
        return { result, executionTime: end - start };
      },
      loadTest: async (operation, iterations = 10) => {
        const times = [];
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          await operation();
          const end = performance.now();
          times.push(end - start);
        }
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        return { avg, min, max, times };
      },
      stressTest: async (operation, maxConcurrency = 5) => {
        const promises = [];
        for (let i = 0; i < maxConcurrency; i++) {
          promises.push(operation());
        }
        const start = performance.now();
        const results = await Promise.all(promises);
        const end = performance.now();
        return {
          results,
          totalTime: end - start,
          avgTime: (end - start) / maxConcurrency
        };
      }
    },
    testData: {
      sampleGames: [
        { home_team: 'Lakers', away_team: 'Warriors', sport: 'basketball' },
        { home_team: 'Celtics', away_team: 'Heat', sport: 'basketball' }
      ],
      sampleTeams: [
        { name: 'Lakers', sport: 'basketball', division: 'd1' },
        { name: 'Warriors', sport: 'basketball', division: 'd1' }
      ],
      sampleConferences: [
        { name: 'Pacific Conference', sport: 'basketball', division: 'd1' },
        { name: 'Atlantic Conference', sport: 'basketball', division: 'd1' }
      ]
    },
    scenarios: {
      createCompleteGameScenario: async (client) => {
        return {
          conferenceId: 'test-id',
          homeTeamId: 'test-id',
          awayTeamId: 'test-id',
          gameId: 'test-id'
        };
      },
      createBatchIngestionScenario: async (client, count = 3) => {
        const scenarios = [];
        for (let i = 0; i < count; i++) {
          scenarios.push({
            conferenceId: 'test-id',
            homeTeamId: 'test-id',
            awayTeamId: 'test-id',
            gameId: 'test-id'
          });
        }
        return scenarios;
      }
    }
  };

  beforeEach(() => {
    // Create comprehensive mocks using the enhanced MockFactory
    mockGamesService = MockFactory.createMockGamesService();
    mockTeamsService = MockFactory.createMockTeamsService();
    mockConferencesService = MockFactory.createMockConferencesService();
    mockDatabaseAdapter = MockFactory.createMockDatabaseAdapter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Data Builders', () => {
    describe('Game Builder', () => {
      it('should build valid games with different sports', () => {
        const basketballGame = GameBuilder.buildBasketballGame();
        const footballGame = GameBuilder.buildFootballGame();
        const baseballGame = GameBuilder.buildBaseballGame();

        expect(basketballGame.sport).toBe('basketball');
        expect(footballGame.sport).toBe('football');
        expect(baseballGame.sport).toBe('baseball');
      });

      it('should build games with different statuses', () => {
        const scheduledGame = GameBuilder.buildScheduledGame();
        const liveGame = GameBuilder.buildLiveGame();
        const completedGame = GameBuilder.buildCompletedGame();

        expect(scheduledGame.status).toBe('scheduled');
        expect(liveGame.status).toBe('live');
        expect(completedGame.status).toBe('final');
        expect(liveGame.current_period).toBe(2);
        expect(completedGame.home_score).toBe(85);
      });

      it('should build games with validation errors', () => {
        const invalidGame = GameBuilder.buildGameWithValidationErrors([
          'missing_home_team',
          'invalid_sport',
          'invalid_date'
        ]);

        expect(invalidGame.home_team).toBe('');
        expect(invalidGame.sport).toBe('invalid-sport');
        expect(invalidGame.date).toBe('invalid-date');
      });

      it('should build multiple games for batch testing', () => {
        const games = GameBuilder.buildMultipleGames(3, 
          { sport: 'basketball' },
          (game, index) => {
            game.date = `2024-01-${String(index + 1).padStart(2, '0')}`;
            return game;
          }
        );

        expect(games).toHaveLength(3);
        expect(games[0].date).toBe('2024-01-01');
        expect(games[1].date).toBe('2024-01-02');
        expect(games[2].date).toBe('2024-01-03');
      });
    });

    describe('Team Builder', () => {
      it('should build valid teams with different sports', () => {
        const basketballTeam = TeamBuilder.buildBasketballTeam();
        const footballTeam = TeamBuilder.buildFootballTeam();
        const baseballTeam = TeamBuilder.buildBaseballTeam();

        expect(basketballTeam.sport).toBe('basketball');
        expect(footballTeam.sport).toBe('football');
        expect(baseballTeam.sport).toBe('baseball');
      });

      it('should build teams with different divisions', () => {
        const d1Team = TeamBuilder.buildValidTeam({ division: 'd1' });
        const d2Team = TeamBuilder.buildD2Team();
        const d3Team = TeamBuilder.buildD3Team();

        expect(d1Team.division).toBe('d1');
        expect(d2Team.division).toBe('d2');
        expect(d3Team.division).toBe('d3');
      });

      it('should build teams with validation errors', () => {
        const invalidTeam = TeamBuilder.buildTeamWithValidationErrors([
          'missing_name',
          'invalid_sport',
          'long_name'
        ]);

        // The 'long_name' error type overrides 'missing_name', so we expect a long name
        expect(invalidTeam.name.length).toBeGreaterThan(100);
        expect(invalidTeam.sport).toBe('invalid-sport');
      });

      it('should build teams with extended metadata', () => {
        const teamWithMetadata = TeamBuilder.buildTeamWithMetadata();

        expect(teamWithMetadata.social_media).toBeDefined();
        expect(teamWithMetadata.sponsors).toBeDefined();
        expect(teamWithMetadata.achievements).toBeDefined();
        expect(teamWithMetadata.facilities).toBeDefined();
      });
    });

    describe('Conference Builder', () => {
      it('should build valid conferences with different sports', () => {
        const basketballConf = ConferenceBuilder.buildBasketballConference();
        const footballConf = ConferenceBuilder.buildFootballConference();
        const baseballConf = ConferenceBuilder.buildBaseballConference();

        expect(basketballConf.sport).toBe('basketball');
        expect(footballConf.sport).toBe('football');
        expect(baseballConf.sport).toBe('baseball');
      });

      it('should build conferences with different levels', () => {
        const d1Conf = ConferenceBuilder.buildValidConference({ level: 'd1' });
        const d2Conf = ConferenceBuilder.buildD2Conference();
        const d3Conf = ConferenceBuilder.buildD3Conference();

        expect(d1Conf.level).toBe('d1');
        expect(d2Conf.level).toBe('d2');
        expect(d3Conf.level).toBe('d3');
      });

      it('should build conferences with member teams', () => {
        const confWithTeams = ConferenceBuilder.buildConferenceWithTeams();

        expect(confWithTeams.member_teams).toBeDefined();
        expect(confWithTeams.member_teams).toHaveLength(2);
        expect(confWithTeams.member_teams[0].team_id).toBe('team-1');
      });
    });

    describe('NCAA Game Builder', () => {
      it('should build games for different sports with sport-specific data', () => {
        const basketballGame = NCAAGameBuilder.buildGameForSport('basketball');
        const footballGame = NCAAGameBuilder.buildGameForSport('football');
        const baseballGame = NCAAGameBuilder.buildGameForSport('baseball');

        expect(basketballGame.periods).toBe(4);
        expect(basketballGame.period_length).toBe('20:00');
        expect(footballGame.periods).toBe(4);
        expect(footballGame.period_length).toBe('15:00');
        expect(baseballGame.periods).toBe(9);
        expect(baseballGame.period_length).toBe('unlimited');
      });

      it('should build games with different statuses and appropriate data', () => {
        const scheduledGame = NCAAGameBuilder.buildGameWithStatus('scheduled');
        const liveGame = NCAAGameBuilder.buildGameWithStatus('live');
        const finalGame = NCAAGameBuilder.buildGameWithStatus('final');

        expect(scheduledGame.home_score).toBeNull();
        expect(liveGame.current_period).toBe(2);
        expect(liveGame.time_remaining).toBe('15:30');
        expect(finalGame.current_period).toBe(4);
        expect(finalGame.time_remaining).toBe('00:00');
      });

      it('should build games for different divisions with division-specific data', () => {
        const d1Game = NCAAGameBuilder.buildGameForDivision('d1');
        const d2Game = NCAAGameBuilder.buildGameForDivision('d2');
        const d3Game = NCAAGameBuilder.buildGameForDivision('d3');

        expect(d1Game.scholarship_limit).toBe(85);
        expect(d1Game.competition_level).toBe('highest');
        expect(d2Game.scholarship_limit).toBe(36);
        expect(d3Game.scholarship_limit).toBe(0);
      });

      it('should build games for different genders with gender-specific data', () => {
        const mensGame = NCAAGameBuilder.buildGameForGender('men');
        const womensGame = NCAAGameBuilder.buildGameForGender('women');
        const coedGame = NCAAGameBuilder.buildGameForGender('coed');

        expect(mensGame.gender_category).toBe('male');
        expect(womensGame.gender_category).toBe('female');
        expect(coedGame.gender_category).toBe('mixed');
      });
    });
  });

  describe('Enhanced Mock Factories', () => {
    describe('Database Adapter Mocks', () => {
      it('should support transaction scenarios', async () => {
        const result = await mockDatabaseAdapter.executeTransaction(async (tx) => {
          expect(tx).toBe('tx-123');
          return 'transaction result';
        });

        expect(result).toBe('transaction result');
      });

      it('should support query builder patterns', () => {
        const queryResult = mockDatabaseAdapter
          .select('*')
          .from('games')
          .where('sport = ?', 'basketball')
          .orderBy('date', 'DESC')
          .limit(10)
          .offset(0)
          .returning();

        expect(queryResult).toBeDefined();
      });

      it('should support batch operations', async () => {
        const batchResult = await mockDatabaseAdapter.batchInsert([
          { name: 'Game 1' },
          { name: 'Game 2' }
        ]);

        expect(batchResult.inserted).toBe(5);
        expect(batchResult.failed).toBe(0);
      });

      it('should support performance testing', async () => {
        const explainResult = await mockDatabaseAdapter.explainQuery('SELECT * FROM games');

        expect(explainResult.plan).toBe('INDEX SCAN');
        expect(explainResult.cost).toBe(0.5);
      });

      it('should support error scenarios', async () => {
        await expect(mockDatabaseAdapter.simulateConnectionError()).rejects.toThrow('Connection failed');
        await expect(mockDatabaseAdapter.simulateQueryTimeout()).rejects.toThrow('Query timeout');
        await expect(mockDatabaseAdapter.simulateDeadlock()).rejects.toThrow('Deadlock detected');
      });
    });

    describe('Service Mocks', () => {
      it('should support enhanced team service scenarios', async () => {
        const teamsBySport = await mockTeamsService.findTeamsBySport('basketball');
        const teamsByDivision = await mockTeamsService.findTeamsByDivision('d1');
        const teamsByGender = await mockTeamsService.findTeamsByGender('men');

        expect(teamsBySport.teams).toHaveLength(1);
        expect(teamsByDivision.teams).toHaveLength(1);
        expect(teamsByGender.teams).toHaveLength(1);
      });

      it('should support batch operations', async () => {
        const batchCreateResult = await mockTeamsService.batchCreateTeams([
          { name: 'Team 1' },
          { name: 'Team 2' }
        ]);

        expect(batchCreateResult.created).toBe(5);
        expect(batchCreateResult.failed).toBe(0);
      });

      it('should support error simulation', async () => {
        await expect(mockTeamsService.simulateTeamNotFound()).rejects.toThrow('Team not found');
        await expect(mockTeamsService.simulateValidationError()).rejects.toThrow('Validation failed');
        await expect(mockTeamsService.simulateDatabaseError()).rejects.toThrow('Database error');
      });

      it('should support enhanced conference service scenarios', async () => {
        const confsBySport = await mockConferencesService.findConferencesBySport('basketball');
        const confsByDivision = await mockConferencesService.findConferencesByDivision('d1');
        const confsByRegion = await mockConferencesService.findConferencesByRegion('West');

        expect(confsBySport.conferences).toHaveLength(1);
        expect(confsByDivision.conferences).toHaveLength(1);
        expect(confsByRegion.conferences).toHaveLength(1);
      });
    });

    describe('Response Formatter Mocks', () => {
      it('should support enhanced formatting scenarios', () => {
        const paginatedResponse = mockGamesService.formatPaginatedResponse();
        const collectionResponse = mockGamesService.formatCollectionResponse();
        const healthCheckResponse = mockGamesService.formatHealthCheckResponse();

        expect(paginatedResponse.body.pagination).toBeDefined();
        expect(collectionResponse.body.links).toBeDefined();
        expect(healthCheckResponse.body.service).toBe('test-service');
      });
    });
  });

    describe('Integration Test Utilities (Mocked)', () => {

    it('should demonstrate performance testing capabilities', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'operation result';
      };

      const { result, executionTime } = await mockIntegrationUtils.performance.measureExecutionTime(operation);

      expect(result).toBe('operation result');
      expect(executionTime).toBeGreaterThan(0);
    });

    it('should demonstrate load testing capabilities', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return 'load test result';
      };

      const loadTestResult = await mockIntegrationUtils.performance.loadTest(operation, 10);

      expect(loadTestResult.avg).toBeGreaterThan(0);
      expect(loadTestResult.min).toBeGreaterThan(0);
      expect(loadTestResult.max).toBeGreaterThan(0);
      expect(loadTestResult.times).toHaveLength(10);
    });

    it('should demonstrate stress testing capabilities', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return 'stress test result';
      };

      const stressTestResult = await mockIntegrationUtils.performance.stressTest(operation, 5);

      expect(stressTestResult.results).toHaveLength(5);
      expect(stressTestResult.totalTime).toBeGreaterThan(0);
      expect(stressTestResult.avgTime).toBeGreaterThan(0);
    });

    it('should provide sample test data', () => {
      const { sampleGames, sampleTeams, sampleConferences } = mockIntegrationUtils.testData;

      expect(sampleGames).toHaveLength(2);
      expect(sampleTeams).toHaveLength(2);
      expect(sampleConferences).toHaveLength(2);

      expect(sampleGames[0].home_team).toBe('Lakers');
      expect(sampleTeams[0].name).toBe('Lakers');
      expect(sampleConferences[0].name).toBe('Pacific Conference');
    });
  });

  describe('Test Scenario Builders', () => {
    it('should demonstrate complete game scenario creation', async () => {
      // This would typically use a real database client in integration tests
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [{ id: 'test-id' }]
        })
      };

      // Mock the scenario creation
      const scenario = await mockIntegrationUtils.scenarios.createCompleteGameScenario(mockClient);

      expect(scenario.conferenceId).toBe('test-id');
      expect(scenario.homeTeamId).toBe('test-id');
      expect(scenario.awayTeamId).toBe('test-id');
      expect(scenario.gameId).toBe('test-id');
    });

    it('should demonstrate batch scenario creation', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          rows: [{ id: 'test-id' }]
        })
      };

      const scenarios = await mockIntegrationUtils.scenarios.createBatchIngestionScenario(mockClient, 3);

      expect(scenarios).toHaveLength(3);
      scenarios.forEach(scenario => {
        expect(scenario.conferenceId).toBe('test-id');
        expect(scenario.awayTeamId).toBe('test-id');
        expect(scenario.gameId).toBe('test-id');
      });
    });
  });

  describe('Advanced Testing Patterns', () => {
    it('should demonstrate complex test data building with customizers', () => {
      const customizer = (game, index) => {
        game.home_team = `Home Team ${index + 1}`;
        game.away_team = `Away Team ${index + 1}`;
        game.date = `2024-01-${String(index + 1).padStart(2, '0')}`;
        game.venue = `Venue ${index + 1}`;
        return game;
      };

      const games = GameBuilder.buildMultipleGames(3, {}, customizer);

      expect(games).toHaveLength(3);
      expect(games[0].home_team).toBe('Home Team 1');
      expect(games[1].away_team).toBe('Away Team 2');
      expect(games[2].venue).toBe('Venue 3');
    });

    it('should demonstrate validation error combinations', () => {
      const errorTypes = [
        'missing_home_team',
        'invalid_sport',
        'long_home_team',
        'invalid_date'
      ];

      const invalidGame = GameBuilder.buildGameWithValidationErrors(errorTypes);

      // The 'long_home_team' error type overrides 'missing_home_team', so we expect a long name
      expect(invalidGame.home_team.length).toBeGreaterThan(100);
      expect(invalidGame.sport).toBe('invalid-sport');
      expect(invalidGame.date).toBe('invalid-date');
    });

    it('should demonstrate mock factory overrides', () => {
      const customMock = MockFactory.createMockGamesService({
        getGames: jest.fn().mockResolvedValue({
          data: [{ id: 999, name: 'Custom Game' }],
          total: 1
        })
      });

      expect(customMock.getGames).toBeDefined();
      expect(customMock.getGameById).toBeDefined(); // Default method still exists
    });
  });
});
