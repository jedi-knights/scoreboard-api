import { GameValidator } from '../validators/game-validator.js';
import logger from '../utils/logger.js';
import { ErrorFactory } from '../utils/errors.js';

/**
 * NCAA Game Ingestion Service
 *
 * Handles the ingestion of NCAA game records from the scoreboard platform.
 * This service ensures idempotency and automatically creates missing entities
 * (teams, conferences) as needed.
 *
 * Uses dependency injection to receive service dependencies, promoting loose coupling.
 */
export class NCAAIngestionService {
  /**
   * @param {GamesServiceInterface} gamesService - Service for games operations
   * @param {TeamsServiceInterface} teamsService - Service for teams operations
   * @param {ConferencesServiceInterface} conferencesService - Service for conferences operations
   */
  constructor (gamesService, teamsService, conferencesService) {
    this.gamesService = gamesService;
    this.teamsService = teamsService;
    this.conferencesService = conferencesService;
  }

  /**
   * Ingest a single NCAA game record
   * This method is idempotent - calling it multiple times with the same data
   * will not create duplicate records.
   *
   * @param {Object} ncaaGameData - NCAA game data from the platform
   * @returns {Promise<Object>} Result of the ingestion process
   */
  async ingestGame (ncaaGameData) {
    try {
      // Validate the incoming NCAA game data
      GameValidator.validateNCAAGameData(ncaaGameData);

      // Check if game already exists (idempotency check)
      const existingGame = await this.checkGameExists(ncaaGameData);
      if (existingGame) {
        return {
          success: true,
          game_id: existingGame.game_id,
          action: 'skipped',
          reason: 'Game already exists',
          message: 'Game was already ingested previously'
        };
      }

      // Process and create/update related entities
      const processedData = await this.processRelatedEntities(ncaaGameData);

      // Create the game record
      const createdGame = await this.gamesService.createGame(processedData.gameData);

      return {
        success: true,
        game_id: createdGame.game_id,
        action: 'created',
        entities_created: {
          teams: processedData.teamsCreated,
          conferences: processedData.conferencesCreated
        },
        message: 'Game successfully ingested'
      };

    } catch (error) {
      logger.error('Error ingesting NCAA game', error, { service: 'NCAAIngestionService', operation: 'ingestGame' });
      return {
        success: false,
        error: error.message,
        action: 'failed',
        message: 'Failed to ingest game'
      };
    }
  }

  /**
   * Ingest multiple NCAA game records
   * @param {Array} ncaaGamesData - Array of NCAA game data
   * @returns {Promise<Object>} Summary of ingestion results
   */
  async ingestGames (ncaaGamesData) {
    if (!Array.isArray(ncaaGamesData)) {
      throw ErrorFactory.badRequest('Input must be an array of game data');
    }

    const results = {
      total: ncaaGamesData.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (const gameData of ncaaGamesData) {
      try {
        const result = await this.ingestGame(gameData);
        results.details.push(result);

        if (result.success) {
          if (result.action === 'created') {
            results.successful++;
          } else if (result.action === 'skipped') {
            results.skipped++;
          }
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          success: false,
          error: error.message,
          action: 'failed',
          message: 'Exception during ingestion'
        });
      }
    }

    return results;
  }

  /**
   * Check if a game already exists based on NCAA game ID
   * @param {Object} ncaaGameData - NCAA game data
   * @returns {Promise<Object|null>} Existing game or null
   */
  async checkGameExists (ncaaGameData) {
    try {
      // Use the NCAA game ID as the primary identifier
      const gameId = this.generateGameId(ncaaGameData);

      // Check if game exists by ID
      const existingGame = await this.gamesService.getGameById(gameId);
      return existingGame;
    } catch (error) {
      // If game not found, return null
      if (error.message === 'Game not found') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Process and create/update related entities (teams, conferences)
   * @param {Object} ncaaGameData - NCAA game data
   * @returns {Promise<Object>} Processed data with entity creation info
   */
  async processRelatedEntities (ncaaGameData) {
    const result = this.initializeResult(ncaaGameData);

    await this.processTeams(result, ncaaGameData);
    await this.processConferences(result, ncaaGameData);

    this.finalizeGameData(result, ncaaGameData);

    return result;
  }

  /**
   * Initialize the result object
   * @param {Object} ncaaGameData - NCAA game data
   * @returns {Object} Initialized result object
   * @private
   */
  initializeResult (ncaaGameData) {
    return {
      gameData: { ...ncaaGameData },
      teamsCreated: 0,
      conferencesCreated: 0
    };
  }

  /**
   * Process teams (home and away)
   * @param {Object} result - Result object to update
   * @param {Object} ncaaGameData - NCAA game data
   * @private
   */
  async processTeams (result, ncaaGameData) {
    const homeTeamResult = await this.processTeam(ncaaGameData.home_team, ncaaGameData);
    result.gameData.home_team_id = homeTeamResult.team_id;
    if (homeTeamResult.created) result.teamsCreated++;

    const awayTeamResult = await this.processTeam(ncaaGameData.away_team, ncaaGameData);
    result.gameData.away_team_id = awayTeamResult.team_id;
    if (awayTeamResult.created) result.teamsCreated++;
  }

  /**
   * Process conferences if present
   * @param {Object} result - Result object to update
   * @param {Object} ncaaGameData - NCAA game data
   * @private
   */
  async processConferences (result, ncaaGameData) {
    if (ncaaGameData.home_conference) {
      const homeConferenceResult = await this.processConference(ncaaGameData.home_conference, ncaaGameData);
      if (homeConferenceResult.created) result.conferencesCreated++;
    }

    if (ncaaGameData.away_conference && ncaaGameData.away_conference !== ncaaGameData.home_conference) {
      const awayConferenceResult = await this.processConference(ncaaGameData.away_conference, ncaaGameData);
      if (awayConferenceResult.created) result.conferencesCreated++;
    }
  }

  /**
   * Finalize game data with generated ID and data source
   * @param {Object} result - Result object to update
   * @param {Object} ncaaGameData - NCAA game data
   * @private
   */
  finalizeGameData (result, ncaaGameData) {
    result.gameData.game_id = this.generateGameId(ncaaGameData);
    result.gameData.data_source = 'ncaa_official';
  }

  /**
   * Process a team - find existing or create new
   * @param {string} teamName - Team name
   * @param {Object} gameData - Game data for context
   * @returns {Promise<Object>} Team data with creation flag
   */
  async processTeam (teamName, gameData) {
    const teamData = {
      name: teamName,
      sport: gameData.sport,
      division: gameData.division,
      gender: gameData.gender || 'mixed',
      level: 'college'
    };

    // Add conference if available
    if (gameData.home_conference && teamName === gameData.home_team) {
      teamData.conference = gameData.home_conference;
    } else if (gameData.away_conference && teamName === gameData.away_team) {
      teamData.conference = gameData.away_conference;
    }

    const team = await this.teamsService.findOrCreateTeam(teamData);

    return {
      ...team,
      created: !team.id || team.id === team.team_id // Simple check for newly created
    };
  }

  /**
   * Process a conference - find existing or create new
   * @param {string} conferenceName - Conference name
   * @param {Object} gameData - Game data for context
   * @returns {Promise<Object>} Conference data with creation flag
   */
  async processConference (conferenceName, gameData) {
    const conferenceData = {
      name: conferenceName,
      sport: gameData.sport,
      division: gameData.division,
      gender: gameData.gender || 'mixed',
      level: 'college'
    };

    const conference = await this.conferencesService.findOrCreateConference(conferenceData);

    return {
      ...conference,
      created: !conference.id || conference.id === conference.conference_id // Simple check for newly created
    };
  }

  /**
   * Generate a unique game ID from NCAA data
   * @param {Object} ncaaGameData - NCAA game data
   * @returns {string} Generated game ID
   */
  generateGameId (ncaaGameData) {
    // Use NCAA game ID if available, otherwise generate one
    if (ncaaGameData.gameId) {
      return `ncaa-${ncaaGameData.gameId}`;
    }

    // Generate ID from game data
    const normalizedHomeTeam = ncaaGameData.home_team
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const normalizedAwayTeam = ncaaGameData.away_team
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const date = ncaaGameData.date.replace(/-/g, '');

    return `ncaa-${ncaaGameData.sport}-${ncaaGameData.division}-${date}-${normalizedHomeTeam}-vs-${normalizedAwayTeam}`;
  }


}
