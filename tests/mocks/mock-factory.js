/**
 * Mock Factory
 * 
 * Centralized factory for creating mock objects used in testing.
 * Provides consistent mock implementations across all test suites.
 */

import { jest } from '@jest/globals';

/**
 * Mock Factory for creating test doubles
 */
export class MockFactory {
  /**
   * Create a Jest mock function
   * @returns {Function} Jest mock function
   */
  static createMockFunction() {
    return jest.fn();
  }

  /**
   * Create a mock NCAA Ingestion Service
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock NCAA Ingestion Service
   */
  static createMockNCAAIngestionService(overrides = {}) {
    const defaultMock = {
      ingestGame: jest.fn().mockResolvedValue({
        success: true,
        game_id: 'game-123',
        action: 'created',
        message: 'Game created successfully',
        entities_created: { teams: 2, conferences: 1 }
      }),
      ingestGames: jest.fn().mockResolvedValue({
        total: 10,
        successful: 8,
        failed: 1,
        skipped: 1,
        details: ['detail1', 'detail2']
      }),
      validateNCAAGameData: jest.fn().mockImplementation(() => {
        // Default implementation does nothing (validation passes)
      }),
      generateGameId: jest.fn().mockReturnValue('game-123'),
      getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Games Service
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Games Service
   */
  static createMockGamesService(overrides = {}) {
    const defaultMock = {
      getGames: jest.fn().mockResolvedValue({
        data: [{ id: 1, name: 'Test Game' }],
        total: 1,
        metadata: {
          filters: {},
          sortOptions: { field: 'date', order: 'DESC' }
        }
      }),
      getGameById: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test Game',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2'
      }),
      createGame: jest.fn().mockResolvedValue({
        game_id: 'game-123',
        name: 'New Game',
        success: true
      }),
      updateGame: jest.fn().mockResolvedValue({
        game_id: 'game-123',
        name: 'Updated Game',
        success: true
      }),
      deleteGame: jest.fn().mockResolvedValue({
        success: true,
        message: 'Game deleted successfully',
        metadata: {
          gameId: 'game-123',
          transactionId: 'tx-123',
          deleted: true
        }
      }),
      getGameStatistics: jest.fn().mockResolvedValue({
        total: 100,
        completed: 80,
        pending: 20
      }),
      getLiveGames: jest.fn().mockResolvedValue({
        data: [{ id: 1, status: 'live' }],
        total: 1
      }),
      getGamesByDateRange: jest.fn().mockResolvedValue({
        data: [{ id: 1, date: '2024-01-01' }],
        total: 1
      }),
      getGamesByTeam: jest.fn().mockResolvedValue({
        data: [{ id: 1, homeTeam: 'Lakers' }],
        total: 1
      }),
      // Response formatter methods
      formatPaginatedResponse: jest.fn().mockReturnValue({
        body: {
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
          }
        }
      }),
      formatCollectionResponse: jest.fn().mockReturnValue({
        body: {
          links: [
            { rel: 'self', href: '/api/games' },
            { rel: 'next', href: '/api/games?page=2' }
          ]
        }
      }),
      formatHealthCheckResponse: jest.fn().mockReturnValue({
        body: {
          service: 'test-service',
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Database Adapter
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Database Adapter
   */
  static createMockDatabaseAdapter(overrides = {}) {
    const defaultMock = {
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(true),
      isConnected: jest.fn().mockReturnValue(true),
      query: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue(null),
      run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
      beginTransaction: jest.fn().mockResolvedValue('tx-123'),
      commitTransaction: jest.fn().mockResolvedValue(true),
      rollbackTransaction: jest.fn().mockResolvedValue(true),
      getHealthStatus: jest.fn().mockReturnValue({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
      }),
      createTables: jest.fn().mockResolvedValue(true),
      dropTables: jest.fn().mockResolvedValue(true),
      executeQuery: jest.fn().mockResolvedValue([]),
      executeQuerySingle: jest.fn().mockResolvedValue(null),
      executeQueryRun: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
      // Enhanced mock methods for different scenarios
      executeQueryWithParams: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      executeTransaction: jest.fn().mockImplementation(async (callback) => {
        const transaction = 'tx-123';
        try {
          const result = await callback(transaction);
          return result;
        } catch (error) {
          throw error;
        }
      }),
      // Mock for connection pool scenarios
      getConnection: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue([]),
        release: jest.fn()
      }),
      // Mock for query builder scenarios
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      // Mock for batch operations
      batchInsert: jest.fn().mockResolvedValue({ inserted: 5, failed: 0 }),
      batchUpdate: jest.fn().mockResolvedValue({ updated: 3, failed: 0 }),
      batchDelete: jest.fn().mockResolvedValue({ deleted: 2, failed: 0 }),
      // Mock for performance testing
      explainQuery: jest.fn().mockResolvedValue({
        plan: 'INDEX SCAN',
        cost: 0.5,
        rows: 100
      }),
      // Mock for error scenarios
      simulateConnectionError: jest.fn().mockRejectedValue(new Error('Connection failed')),
      simulateQueryTimeout: jest.fn().mockRejectedValue(new Error('Query timeout')),
      simulateDeadlock: jest.fn().mockRejectedValue(new Error('Deadlock detected'))
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Logger
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Logger
   */
  static createMockLogger(overrides = {}) {
    const defaultMock = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      http: jest.fn(),
      database: jest.fn(),
      service: jest.fn(),
      controller: jest.fn()
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Games Repository
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Games Repository
   */
  static createMockGamesRepository(overrides = {}) {
    const defaultMock = {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' }
      ]),
      findById: jest.fn().mockResolvedValue({ id: 1, name: 'Game 1' }),
      findByDateRange: jest.fn().mockResolvedValue([
        { id: 1, date: '2024-01-01' }
      ]),
      findLiveGames: jest.fn().mockResolvedValue([
        { id: 1, status: 'live' }
      ]),
      findByTeam: jest.fn().mockResolvedValue([
        { id: 1, homeTeam: 'Lakers' }
      ]),
      create: jest.fn().mockResolvedValue({
        id: 1,
        game_id: 'game-123',
        name: 'New Game'
      }),
      update: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Updated Game'
      }),
      delete: jest.fn().mockResolvedValue(true),
      count: jest.fn().mockResolvedValue(10),
      exists: jest.fn().mockResolvedValue(true),
      getStatistics: jest.fn().mockResolvedValue({
        total: 100,
        completed: 80
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Teams Repository
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Teams Repository
   */
  static createMockTeamsRepository(overrides = {}) {
    const defaultMock = {
      findOrCreate: jest.fn().mockResolvedValue({
        id: 1,
        team_id: 'team-123',
        name: 'Test Team',
        sport: 'basketball'
      }),
      findByName: jest.fn().mockResolvedValue({
        id: 1,
        team_id: 'team-123',
        name: 'Test Team',
        sport: 'basketball'
      }),
      findByConference: jest.fn().mockResolvedValue([
        { id: 1, name: 'Team A', conference: 'Test Conference' },
        { id: 2, name: 'Team B', conference: 'Test Conference' }
      ]),
      findAll: jest.fn().mockResolvedValue({
        teams: [
          { id: 1, name: 'Team A', sport: 'basketball' },
          { id: 2, name: 'Team B', sport: 'football' }
        ],
        total: 2,
        page: 1
      }),
      findById: jest.fn().mockResolvedValue({
        id: 1,
        team_id: 'team-123',
        name: 'Test Team',
        sport: 'basketball'
      }),
      create: jest.fn().mockResolvedValue({
        id: 1,
        team_id: 'team-123',
        name: 'New Team',
        sport: 'basketball'
      }),
      update: jest.fn().mockResolvedValue({
        id: 1,
        team_id: 'team-123',
        name: 'Updated Team',
        sport: 'basketball'
      }),
      delete: jest.fn().mockResolvedValue({
        success: true,
        deletedCount: 1
      }),
      getStatistics: jest.fn().mockResolvedValue({
        totalTeams: 100,
        activeTeams: 95,
        inactiveTeams: 5
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Conferences Repository
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Conferences Repository
   */
  static createMockConferencesRepository(overrides = {}) {
    const defaultMock = {
      findOrCreate: jest.fn().mockResolvedValue({
        id: 1,
        conference_id: 'conf-123',
        name: 'Test Conference',
        sport: 'basketball'
      }),
      findByName: jest.fn().mockResolvedValue({
        id: 1,
        conference_id: 'conf-123',
        name: 'Test Conference',
        sport: 'basketball'
      }),
      findAll: jest.fn().mockResolvedValue({
        conferences: [
          { id: 1, name: 'ACC', sport: 'basketball' },
          { id: 2, name: 'Big Ten', sport: 'football' }
        ],
        total: 2,
        page: 1
      }),
      findById: jest.fn().mockResolvedValue({
        id: 1,
        conference_id: 'conf-123',
        name: 'Test Conference',
        sport: 'basketball'
      }),
      create: jest.fn().mockResolvedValue({
        id: 1,
        conference_id: 'conf-123',
        name: 'New Conference',
        sport: 'basketball'
      }),
      update: jest.fn().mockResolvedValue({
        id: 1,
        conference_id: 'conf-123',
        name: 'Updated Conference',
        sport: 'basketball'
      }),
      delete: jest.fn().mockResolvedValue({
        success: true,
        deletedCount: 1
      }),
      getStatistics: jest.fn().mockResolvedValue({
        totalConferences: 50,
        activeConferences: 48,
        inactiveConferences: 2
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Teams Service
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Teams Service
   */
  static createMockTeamsService(overrides = {}) {
    const defaultMock = {
      findOrCreateTeam: jest.fn().mockResolvedValue({
        team_id: 'team-123',
        name: 'Test Team',
        sport: 'basketball'
      }),
      getTeamByName: jest.fn().mockResolvedValue({
        team_id: 'team-123',
        name: 'Test Team'
      }),
      getTeamsByConference: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1' }],
        total: 1
      }),
      getTeams: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1' }],
        total: 1
      }),
      updateTeam: jest.fn().mockResolvedValue({
        team_id: 'team-123',
        name: 'Updated Team'
      }),
      deleteTeam: jest.fn().mockResolvedValue({
        success: true,
        message: 'Team deleted successfully'
      }),
      getTeamStatistics: jest.fn().mockResolvedValue({
        total: 50,
        active: 45,
        inactive: 5
      }),
      // Enhanced mock methods for different scenarios
      findTeamsBySport: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1', sport: 'basketball' }],
        total: 1
      }),
      findTeamsByDivision: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1', division: 'd1' }],
        total: 1
      }),
      findTeamsByGender: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1', gender: 'men' }],
        total: 1
      }),
      findTeamsByLocation: jest.fn().mockResolvedValue({
        teams: [{ team_id: 'team-1', state: 'CA' }],
        total: 1
      }),
      // Mock for batch operations
      batchCreateTeams: jest.fn().mockResolvedValue({
        created: 5,
        failed: 0,
        details: []
      }),
      batchUpdateTeams: jest.fn().mockResolvedValue({
        updated: 3,
        failed: 0,
        details: []
      }),
      // Mock for validation scenarios
      validateTeamData: jest.fn().mockImplementation(() => {
        // Default implementation does nothing (validation passes)
      }),
      // Mock for error scenarios
      simulateTeamNotFound: jest.fn().mockRejectedValue(new Error('Team not found')),
      simulateValidationError: jest.fn().mockRejectedValue(new Error('Validation failed')),
      simulateDatabaseError: jest.fn().mockRejectedValue(new Error('Database error'))
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Conferences Service
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Conferences Service
   */
  static createMockConferencesService(overrides = {}) {
    const defaultMock = {
      findOrCreateConference: jest.fn().mockResolvedValue({
        conference_id: 'conf-123',
        name: 'Test Conference',
        sport: 'basketball'
      }),
      getConferenceByName: jest.fn().mockResolvedValue({
        conference_id: 'conf-123',
        name: 'Test Conference'
      }),
      getConferences: jest.fn().mockResolvedValue({
        conferences: [{ conference_id: 'conf-1' }],
        total: 1
      }),
      updateConference: jest.fn().mockResolvedValue({
        conference_id: 'conf-123',
        name: 'Updated Conference'
      }),
      deleteConference: jest.fn().mockResolvedValue({
        success: true,
        message: 'Conference deleted successfully'
      }),
      getConferenceStatistics: jest.fn().mockResolvedValue({
        total: 25,
        active: 23,
        inactive: 2
      }),
      // Enhanced mock methods for different scenarios
      findConferencesBySport: jest.fn().mockResolvedValue({
        conferences: [{ conference_id: 'conf-1', sport: 'basketball' }],
        total: 1
      }),
      findConferencesByDivision: jest.fn().mockResolvedValue({
        conferences: [{ conference_id: 'conf-1', division: 'd1' }],
        total: 1
      }),
      findConferencesByRegion: jest.fn().mockResolvedValue({
        conferences: [{ conference_id: 'conf-1', region: 'West' }],
        total: 1
      }),
      // Mock for batch operations
      batchCreateConferences: jest.fn().mockResolvedValue({
        created: 3,
        failed: 0,
        details: []
      }),
      batchUpdateConferences: jest.fn().mockResolvedValue({
        updated: 2,
        failed: 0,
        details: []
      }),
      // Mock for validation scenarios
      validateConferenceData: jest.fn().mockImplementation(() => {
        // Default implementation does nothing (validation passes)
      }),
      // Mock for error scenarios
      simulateConferenceNotFound: jest.fn().mockRejectedValue(new Error('Conference not found')),
      simulateValidationError: jest.fn().mockRejectedValue(new Error('Validation failed')),
      simulateDatabaseError: jest.fn().mockRejectedValue(new Error('Database error'))
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Transaction Manager
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Transaction Manager
   */
  static createMockTransactionManager(overrides = {}) {
    const defaultMock = {
      begin: jest.fn().mockResolvedValue('tx-123'),
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      execute: jest.fn().mockImplementation(async (operation) => {
        return await operation();
      }),
      executeInTransaction: jest.fn().mockImplementation(async (operation) => {
        return await operation();
      }),
      withTransaction: jest.fn().mockImplementation(async (operation) => {
        return await operation();
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Error Factory
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Error Factory
   */
  static createMockErrorFactory(overrides = {}) {
    const defaultMock = {
      createValidationError: jest.fn().mockReturnValue(new Error('Validation Error')),
      createNotFoundError: jest.fn().mockReturnValue(new Error('Not Found')),
      createConflictError: jest.fn().mockReturnValue(new Error('Conflict')),
      createDatabaseError: jest.fn().mockReturnValue(new Error('Database Error')),
      createServiceError: jest.fn().mockReturnValue(new Error('Service Error'))
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Response Formatter
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Response Formatter
   */
  static createMockResponseFormatter(overrides = {}) {
    const defaultMock = {
      formatSuccess: jest.fn().mockReturnValue({
        status: 200,
        body: { success: true, message: 'Success' }
      }),
      formatError: jest.fn().mockReturnValue({
        status: 500,
        body: { success: false, error: 'Internal Server Error' }
      }),
      formatValidationError: jest.fn().mockReturnValue({
        status: 400,
        body: { success: false, error: 'Validation Failed' }
      }),
      formatNotFoundError: jest.fn().mockReturnValue({
        status: 404,
        body: { success: false, error: 'Not Found' }
      }),
      formatBadRequestError: jest.fn().mockReturnValue({
        status: 400,
        body: { success: false, error: 'Bad Request' }
      }),
      formatConflictError: jest.fn().mockReturnValue({
        status: 409,
        body: { success: false, error: 'Conflict' }
      }),
      // Enhanced formatter methods
      formatPaginatedResponse: jest.fn().mockReturnValue({
        status: 200,
        body: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0 }
        }
      }),
      formatCollectionResponse: jest.fn().mockReturnValue({
        status: 200,
        body: {
          success: true,
          data: [],
          links: {}
        }
      }),
      formatHealthCheckResponse: jest.fn().mockReturnValue({
        status: 200,
        body: {
          success: true,
          service: 'test-service',
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      })
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Request object
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Request object
   */
  static createMockRequest(overrides = {}) {
    const defaultMock = {
      method: 'GET',
      url: '/test',
      body: {},
      query: {},
      params: {},
      headers: {},
      ip: '127.0.0.1',
      originalUrl: '/test',
      path: '/test',
      protocol: 'http',
      hostname: 'localhost',
      get: jest.fn((header) => defaultMock.headers[header])
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Response object
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Response object
   */
  static createMockResponse(overrides = {}) {
    const res = {
      statusCode: 200,
      body: null,
      headers: {},
      status: jest.fn(function(code) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn(function(data) {
        this.body = data;
        return this;
      }),
      send: jest.fn(function(data) {
        this.body = data;
        return this;
      }),
      set: jest.fn(function(key, value) {
        this.headers[key] = value;
        return this;
      }),
      end: jest.fn(),
      redirect: jest.fn(),
      download: jest.fn(),
      attachment: jest.fn()
    };

    return { ...res, ...overrides };
  }

  /**
   * Create a mock Next function
   * @param {Object} overrides - Custom mock implementations
   * @returns {Function} Mock Next function
   */
  static createMockNext(overrides = {}) {
    const defaultMock = jest.fn();
    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock Container for dependency injection
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock Container
   */
  static createMockContainer(overrides = {}) {
    const defaultMock = {
      register: jest.fn(),
      resolve: jest.fn(),
      has: jest.fn().mockReturnValue(true),
      get: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      clear: jest.fn(),
      mockService: jest.fn(),
      mockServices: jest.fn(),
      createMockService: jest.fn()
    };

    return { ...defaultMock, ...overrides };
  }

  /**
   * Create a mock HATEOAS utility
   * @param {Object} overrides - Custom mock implementations
   * @returns {Object} Mock HATEOAS utility
   */
  static createMockHateoas(overrides = {}) {
    const defaultMock = {
      generateCollectionLinks: jest.fn().mockReturnValue({
        self: '/api/games',
        next: '/api/games?page=2'
      }),
      generateResourceLinks: jest.fn().mockReturnValue({
        self: '/api/games/1',
        related: '/api/games/1/teams'
      }),
      generateActionLinks: jest.fn().mockReturnValue({
        create: '/api/games',
        update: '/api/games/1',
        delete: '/api/games/1'
      }),
      enhanceWithLinks: jest.fn().mockImplementation((data, links) => ({
        ...data,
        links
      }))
    };

    return { ...defaultMock, ...overrides };
  }
}
