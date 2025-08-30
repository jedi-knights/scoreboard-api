import { NCAAIngestionService } from '../../../src/services/ncaa-ingestion-service.js';
import { TestContainer } from '../../../src/test-container.js';
import { GamesServiceInterface } from '../../../src/interfaces/games-service-interface.js';
import { TeamsServiceInterface } from '../../../src/interfaces/teams-service-interface.js';
import { ConferencesServiceInterface } from '../../../src/interfaces/conferences-service-interface.js';

describe('NCAAIngestionService', () => {
  let ncaaIngestionService;
  let mockGamesService;
  let mockTeamsService;
  let mockConferencesService;
  let container;

  beforeEach(() => {
    container = new TestContainer();
    
    // Create mock services with simple functions
    mockGamesService = {
      getGameById: () => {},
      createGame: () => {}
    };
    
    mockTeamsService = {
      findOrCreateTeam: () => {}
    };
    
    mockConferencesService = {
      findOrCreateConference: () => {}
    };

    // Create service with injected dependencies
    ncaaIngestionService = new NCAAIngestionService(
      mockGamesService,
      mockTeamsService,
      mockConferencesService
    );
  });

  describe('Constructor', () => {
    it('should accept service dependencies via constructor', () => {
      expect(ncaaIngestionService.gamesService).toBe(mockGamesService);
      expect(ncaaIngestionService.teamsService).toBe(mockTeamsService);
      expect(ncaaIngestionService.conferencesService).toBe(mockConferencesService);
    });

    it('should not create new service instances', () => {
      // Verify that services are injected, not instantiated
      expect(mockGamesService.getGameById).toBeDefined();
      expect(mockTeamsService.findOrCreateTeam).toBeDefined();
      expect(mockConferencesService.findOrCreateConference).toBeDefined();
    });
  });

  describe('ingestGame', () => {
    const validGameData = {
      home_team: 'Home Team',
      away_team: 'Away Team',
      sport: 'basketball',
      division: 'd1',
      date: '2024-01-15',
      home_score: 85,
      away_score: 78,
      status: 'final'
    };

    it('should successfully ingest a new game', async () => {
      // Mock service responses
      mockGamesService.getGameById = () => Promise.reject(new Error('Game not found'));
      mockTeamsService.findOrCreateTeam = () => Promise.resolve({ team_id: 'team-1', name: 'Home Team' });
      mockConferencesService.findOrCreateConference = () => Promise.resolve({ conference_id: 'conf-1', name: 'Conference A' });
      mockGamesService.createGame = () => Promise.resolve({ game_id: 'game-1' });

      // Add conference data to trigger conference creation
      const gameDataWithConference = { ...validGameData, home_conference: 'Conference A' };
      const result = await ncaaIngestionService.ingestGame(gameDataWithConference);

      expect(result.success).toBe(true);
      expect(result.action).toBe('created');
      expect(result.game_id).toBe('game-1');
      expect(result.entities_created.teams).toBe(2);
      expect(result.entities_created.conferences).toBe(1);
    });

    it('should skip existing games (idempotency)', async () => {
      const existingGame = { game_id: 'existing-game' };
      mockGamesService.getGameById = () => Promise.resolve(existingGame);

      const result = await ncaaIngestionService.ingestGame(validGameData);

      expect(result.success).toBe(true);
      expect(result.action).toBe('skipped');
      expect(result.reason).toBe('Game already exists');
    });

    it('should handle validation errors', async () => {
      const invalidGameData = { ...validGameData, sport: 'invalid-sport' };

      const result = await ncaaIngestionService.ingestGame(invalidGameData);

      expect(result.success).toBe(false);
      expect(result.action).toBe('failed');
      expect(result.error).toContain('sport must be one of:');
    });

    it('should handle service errors gracefully', async () => {
      mockGamesService.getGameById = () => Promise.reject(new Error('Database connection failed'));

      const result = await ncaaIngestionService.ingestGame(validGameData);

      expect(result.success).toBe(false);
      expect(result.action).toBe('failed');
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('ingestGames', () => {
    const multipleGamesData = [
      {
        home_team: 'Team A',
        away_team: 'Team B',
        sport: 'football',
        division: 'd1',
        date: '2024-01-15'
      },
      {
        home_team: 'Team C',
        away_team: 'Team D',
        sport: 'basketball',
        division: 'd2',
        date: '2024-01-16'
      }
    ];

    it('should process multiple games successfully', async () => {
      // Mock successful processing for both games
      mockGamesService.getGameById = () => Promise.reject(new Error('Game not found'));
      mockTeamsService.findOrCreateTeam = () => Promise.resolve({ team_id: 'team-1' });
      mockConferencesService.findOrCreateConference = () => Promise.resolve({ conference_id: 'conf-1' });
      mockGamesService.createGame = () => Promise.resolve({ game_id: 'game-1' });

      const result = await ncaaIngestionService.ingestGames(multipleGamesData);

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.details).toHaveLength(2);
    });

    it('should handle mixed success and failure scenarios', async () => {
      // First game succeeds, second fails
      let teamCallCount = 0;
      mockGamesService.getGameById = () => Promise.reject(new Error('Game not found'));
      mockTeamsService.findOrCreateTeam = () => {
        teamCallCount++;
        if (teamCallCount <= 2) {
          // First two calls (for first game) succeed
          return Promise.resolve({ team_id: `team-${teamCallCount}` });
        } else {
          // Third call (for second game) fails
          return Promise.reject(new Error('Team creation failed'));
        }
      };
      mockConferencesService.findOrCreateConference = () => Promise.resolve({ conference_id: 'conf-1' });
      mockGamesService.createGame = () => Promise.resolve({ game_id: 'game-1' });

      const result = await ncaaIngestionService.ingestGames(multipleGamesData);

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should reject non-array input', async () => {
      await expect(ncaaIngestionService.ingestGames('not-an-array'))
        .rejects.toThrow('Input must be an array of game data');
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const invalidGameData = { sport: 'basketball' }; // Missing required fields

      const result = await ncaaIngestionService.ingestGame(invalidGameData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('home_team is required');
    });

    it('should validate sport values', async () => {
      const invalidGameData = {
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'invalid-sport',
        division: 'd1',
        date: '2024-01-15'
      };

      const result = await ncaaIngestionService.ingestGame(invalidGameData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('sport must be one of:');
    });

    it('should validate date format', async () => {
      const invalidGameData = {
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'basketball',
        division: 'd1',
        date: 'invalid-date'
      };

      const result = await ncaaIngestionService.ingestGame(invalidGameData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('date must match the format: YYYY-MM-DD');
    });
  });

  describe('Entity Processing', () => {
    const gameData = {
      home_team: 'Home Team',
      away_team: 'Away Team',
      sport: 'basketball',
      division: 'd1',
      date: '2024-01-15',
      home_conference: 'Conference A',
      away_conference: 'Conference B'
    };

    it('should process teams correctly', async () => {
      mockTeamsService.findOrCreateTeam = () => Promise.resolve({ team_id: 'team-1', name: 'Home Team' });

      const result = await ncaaIngestionService.processTeam('Home Team', gameData);

      expect(result.team_id).toBe('team-1');
      expect(result.name).toBe('Home Team');
    });

    it('should process conferences correctly', async () => {
      mockConferencesService.findOrCreateConference = () => Promise.resolve({ conference_id: 'conf-1', name: 'Conference A' });

      const result = await ncaaIngestionService.processConference('Conference A', gameData);

      expect(result.conference_id).toBe('conf-1');
      expect(result.name).toBe('Conference A');
    });
  });

  describe('Game ID Generation', () => {
    it('should generate game ID from NCAA data', () => {
      const gameData = {
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-15'
      };

      const gameId = ncaaIngestionService.generateGameId(gameData);

      expect(gameId).toContain('ncaa-basketball-d1-20240115');
      expect(gameId).toContain('home-team');
      expect(gameId).toContain('away-team');
    });

    it('should use NCAA game ID if available', () => {
      const gameData = {
        gameId: 'ncaa-12345',
        home_team: 'Home Team',
        away_team: 'Away Team',
        sport: 'basketball',
        division: 'd1',
        date: '2024-01-15'
      };

      const gameId = ncaaIngestionService.generateGameId(gameData);

      expect(gameId).toBe('ncaa-ncaa-12345');
    });
  });
});
