import { BaseValidator } from './base-validator.js';
import { SportsValidator } from './sports-validator.js';
import { DateValidator } from './date-validator.js';
import { ErrorFactory } from '../utils/errors.js';
import { businessConfig } from '../config/index.js';

/**
 * Game Validator Class
 *
 * Handles validation for game-related data including game creation, updates, and NCAA ingestion.
 */
export class GameValidator {
  // Valid game statuses
  static VALID_STATUSES = [
    'scheduled', 'live', 'final', 'postponed', 'cancelled',
    'suspended', 'delayed', 'halftime', 'quarter', 'period'
  ];

  // Valid data sources
  static VALID_DATA_SOURCES = ['ncaa', 'manual', 'api', 'import'];

  /**
   * Validate game data for creation
   * @param {Object} gameData - Game data to validate
   * @returns {boolean} True if valid
   */
  static validateGameData (gameData) {
    if (!gameData) {
      throw ErrorFactory.validation('Game data is required');
    }
    if (typeof gameData !== 'object') {
      throw ErrorFactory.validation('Game data must be an object');
    }

    this.validateRequiredGameFields(gameData);
    this.validateOptionalGameFields(gameData);

    return true;
  }

  /**
   * Validate required game fields
   * @param {Object} gameData - Game data to validate
   * @private
   */
  static validateRequiredGameFields (gameData) {
    const requiredFields = ['home_team', 'away_team', 'sport', 'division', 'date'];
    requiredFields.forEach(field => {
      if (!gameData[field]) {
        throw ErrorFactory.validation(`${field} is required`, field, gameData[field]);
      }
    });

    this.validateTeamNames(gameData.home_team, gameData.away_team);
    SportsValidator.validateSport(gameData.sport, 'sport');
    SportsValidator.validateDivision(gameData.division, 'division');
    DateValidator.validateDateFormat(gameData.date, 'date');
  }

  /**
   * Validate optional game fields
   * @param {Object} gameData - Game data to validate
   * @private
   */
  static validateOptionalGameFields (gameData) {
    const optionalValidators = [
      { field: 'status', validator: this.validateStatus.bind(this) },
      { field: 'data_source', validator: this.validateDataSource.bind(this) },
      { field: 'home_score', validator: this.validateScore.bind(this) },
      { field: 'away_score', validator: this.validateScore.bind(this) }
    ];

    optionalValidators.forEach(({ field, validator }) => {
      if (gameData[field] !== undefined) {
        validator(gameData[field], field);
      }
    });
  }

  /**
   * Validate game update fields
   * @param {Object} updateData - Update data to validate
   * @private
   */
  static validateGameUpdateFields (updateData) {
    const updateValidators = [
      { field: 'date', validator: DateValidator.validateDateFormat.bind(DateValidator) },
      { field: 'status', validator: this.validateStatus.bind(this) },
      { field: 'sport', validator: SportsValidator.validateSport.bind(SportsValidator) },
      { field: 'home_team', validator: BaseValidator.isNonEmptyString.bind(BaseValidator) },
      { field: 'away_team', validator: BaseValidator.isNonEmptyString.bind(BaseValidator) },
      { field: 'home_score', validator: this.validateScore.bind(this) },
      { field: 'away_score', validator: this.validateScore.bind(this) }
    ];

    updateValidators.forEach(({ field, validator }) => {
      if (updateData[field] !== undefined) {
        if (field === 'home_team' || field === 'away_team') {
          validator(updateData[field], field);
        } else if (field === 'sport') {
          validator(updateData[field], 'sport');
        } else if (field === 'date') {
          validator(updateData[field], 'date');
        } else if (field === 'status') {
          validator(updateData[field], 'Status');
        } else {
          validator(updateData[field], field);
        }
      }
    });
  }

  /**
   * Validate game update data
   * @param {Object} updateData - Update data to validate
   * @returns {boolean} True if valid
   */
  static validateGameUpdateData (updateData) {
    if (!updateData) {
      throw new Error('Update data is required');
    }
    if (typeof updateData !== 'object') {
      throw new Error('Update data must be an object');
    }

    this.validateGameUpdateFields(updateData);

    return true;
  }

  /**
   * Validate required NCAA game fields
   * @param {Object} ncaaGameData - NCAA game data to validate
   * @private
   */
  static validateRequiredNCAAGameFields (ncaaGameData) {
    const requiredFields = ['home_team', 'away_team', 'sport', 'division', 'date'];
    requiredFields.forEach(field => {
      if (!ncaaGameData[field]) {
        throw new Error(`${field} is required`);
      }
    });

    this.validateTeamNames(ncaaGameData.home_team, ncaaGameData.away_team);
    SportsValidator.validateSport(ncaaGameData.sport, 'sport');
    SportsValidator.validateDivision(ncaaGameData.division, 'division');
    DateValidator.validateDateFormat(ncaaGameData.date, 'date');
  }

  /**
   * Validate optional NCAA game fields
   * @param {Object} ncaaGameData - NCAA game data to validate
   * @private
   */
  static validateOptionalNCAAGameFields (ncaaGameData) {
    const optionalValidators = [
      { field: 'gender', validator: SportsValidator.validateGender.bind(SportsValidator) },
      { field: 'home_score', validator: this.validateScore.bind(this) },
      { field: 'away_score', validator: this.validateScore.bind(this) },
      { field: 'status', validator: this.validateStatus.bind(this) }
    ];

    optionalValidators.forEach(({ field, validator }) => {
      if (ncaaGameData[field] !== undefined) {
        if (field === 'gender') {
          validator(ncaaGameData[field], 'gender');
        } else {
          validator(ncaaGameData[field], field);
        }
      }
    });
  }

  /**
   * Validate NCAA game data
   * @param {Object} ncaaGameData - NCAA game data to validate
   * @returns {boolean} True if valid
   */
  static validateNCAAGameData (ncaaGameData) {
    if (!ncaaGameData) {
      throw new Error('NCAA game data is required');
    }
    if (typeof ncaaGameData !== 'object') {
      throw new Error('NCAA game data must be an object');
    }

    this.validateRequiredNCAAGameFields(ncaaGameData);
    this.validateOptionalNCAAGameFields(ncaaGameData);

    return true;
  }

  /**
   * Validate game ID
   * @param {string} gameId - Game ID to validate
   * @returns {boolean} True if valid
   */
  static validateGameId (gameId) {
    if (!gameId) {
      throw new Error('Game ID is required');
    }

    if (typeof gameId !== 'string') {
      throw new Error('Game ID must be a string');
    }

    if (gameId.length < businessConfig.games.validation.gameId.minLength ||
        gameId.length > businessConfig.games.validation.gameId.maxLength) {
      throw new Error(`Game ID must be between ${businessConfig.games.validation.gameId.minLength} and ${businessConfig.games.validation.gameId.maxLength} characters`);
    }

    return true;
  }

  /**
   * Validate team names
   * @param {string} homeTeam - Home team name
   * @param {string} awayTeam - Away team name
   * @returns {boolean} True if valid
   */
  static validateTeamNames (homeTeam, awayTeam) {
    if (!homeTeam || homeTeam.trim().length === 0) {
      throw new Error('home_team is required');
    }

    if (!awayTeam || awayTeam.trim().length === 0) {
      throw new Error('away_team is required');
    }

    // Check if team names are the same after trimming
    if (homeTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase()) {
      throw new Error('home_team and away_team must be different');
    }

    return true;
  }

  /**
   * Validate game status
   * @param {string} status - Status to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   */
  static validateStatus (status, fieldName = 'Status') {
    // Check for null/undefined first
    if (status === null || status === undefined) {
      throw new Error('status must be a string');
    }

    // Check for non-string values
    if (typeof status !== 'string') {
      throw new Error('status must be a string');
    }

    // Check for empty string and invalid values
    if (!status || !this.VALID_STATUSES.includes(status.toLowerCase())) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_STATUSES.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate data source
   * @param {string} dataSource - Data source to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   */
  static validateDataSource (dataSource, fieldName = 'Data source') {
    // Check for null/undefined first
    if (dataSource === null || dataSource === undefined) {
      throw new Error('data_source must be a string');
    }

    // Check for non-string values
    if (typeof dataSource !== 'string') {
      throw new Error('data_source must be a string');
    }

    // Check for empty string and invalid values
    if (!dataSource || !this.VALID_DATA_SOURCES.includes(dataSource.toLowerCase())) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_DATA_SOURCES.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate score
   * @param {*} score - Score to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateScore (score, fieldName = 'Score') {
    // Check for null/undefined first
    if (score === null || score === undefined) {
      throw new Error(`${fieldName} must be a number`);
    }

    // Check for non-number values and NaN
    if (typeof score !== 'number' || isNaN(score)) {
      throw new Error(`${fieldName} must be a number`);
    }

    if (score < 0) {
      throw new Error(`${fieldName} must be a non-negative number`);
    }

    return true;
  }

  /**
   * Check if a status is valid (returns boolean instead of throwing)
   * @param {string} status - Status to check
   * @returns {boolean} True if valid
   */
  static isValidStatus (status) {
    if (!status || typeof status !== 'string') {
      return false;
    }
    return this.VALID_STATUSES.includes(status.toLowerCase());
  }

  /**
   * Check if a score is valid (returns boolean instead of throwing)
   * @param {*} score - Score to check
   * @returns {boolean} True if valid
   */
  static isValidScore (score) {
    if (score === undefined || score === null) {
      return false; // Tests expect false for null/undefined
    }
    if (typeof score !== 'number') {
      return false;
    }
    return !isNaN(score) && score >= 0;
  }

  /**
   * Get all valid statuses
   * @returns {Array<string>} Array of valid statuses
   */
  static getValidStatuses () {
    return [...this.VALID_STATUSES];
  }

  /**
   * Get all valid data sources
   * @returns {Array<string>} Array of valid data sources
   */
  static getValidDataSources () {
    return [...this.VALID_DATA_SOURCES];
  }

  /**
   * Validate game data for creation (comprehensive validation)
   * @param {Object} gameData - Game data to validate
   * @returns {boolean} True if valid
   */
  static validateGameDataComprehensive (gameData) {
    if (!gameData) {
      throw new Error('Game data is required');
    }
    if (typeof gameData !== 'object') {
      throw new Error('Game data must be an object');
    }

    // Required fields for comprehensive validation
    const requiredFields = ['game_id', 'date', 'home_team', 'away_team', 'sport', 'status', 'data_source'];
    for (const field of requiredFields) {
      if (gameData[field] === undefined || gameData[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate specific fields
    this.validateGameId(gameData.game_id);
    this.validateTeamNames(gameData.home_team, gameData.away_team);
    SportsValidator.validateSport(gameData.sport, 'sport');
    DateValidator.validateDateFormat(gameData.date, 'date');
    this.validateStatus(gameData.status, 'status');
    this.validateDataSource(gameData.data_source, 'data_source');

    return true;
  }

  /**
   * Validate game update data (comprehensive validation)
   * @param {Object} updateData - Update data to validate
   * @returns {boolean} True if valid
   */
  static validateGameUpdateDataComprehensive (updateData) {
    this.validateUpdateDataStructure(updateData);
    this.validateOptionalGameUpdateFields(updateData);
    return true;
  }

  /**
   * Validate update data structure
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateUpdateDataStructure (updateData) {
    if (!updateData) {
      throw new Error('Update data is required');
    }
    if (typeof updateData !== 'object') {
      throw new Error('Update data must be an object');
    }
  }

  /**
   * Validate optional game update fields
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateOptionalGameUpdateFields (updateData) {
    this.validateOptionalDate(updateData);
    this.validateOptionalStatus(updateData);
    this.validateOptionalSport(updateData);
    this.validateOptionalTeamNames(updateData);
  }

  /**
   * Validate optional date field
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateOptionalDate (updateData) {
    if (updateData.date !== undefined) {
      DateValidator.validateDateFormat(updateData.date, 'date');
    }
  }

  /**
   * Validate optional status field
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateOptionalStatus (updateData) {
    if (updateData.status !== undefined) {
      this.validateStatus(updateData.status, 'Status');
    }
  }

  /**
   * Validate optional sport field
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateOptionalSport (updateData) {
    if (updateData.sport !== undefined && updateData.sport !== null) {
      if (updateData.sport.length < 1 || updateData.sport.length > 50) {
        throw new Error('Sport name must be between 1 and 50 characters');
      }
    }
  }

  /**
   * Validate optional team name fields
   * @param {Object} updateData - Data to validate
   * @private
   */
  static validateOptionalTeamNames (updateData) {
    if (updateData.home_team !== undefined) {
      BaseValidator.isNonEmptyString(updateData.home_team, 'home_team');
    }
    if (updateData.away_team !== undefined) {
      BaseValidator.isNonEmptyString(updateData.away_team, 'away_team');
    }
  }

  /**
   * Validate and sanitize pagination options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  static sanitizePaginationOptions (options) {
    // Handle null/undefined options
    if (!options) {
      options = {};
    }

    return {
      limit: this._sanitizeLimit(options.limit),
      offset: this._sanitizeOffset(options.offset),
      sortBy: this._sanitizeSortBy(options.sortBy),
      sortOrder: this._sanitizeSortOrder(options.sortOrder)
    };
  }

  /**
   * Validate and sanitize limit
   * @param {*} limit - Raw limit value
   * @returns {number} Valid limit
   */
  static _sanitizeLimit (limit) {
    if (limit && !isNaN(limit)) {
      return Math.min(parseInt(limit), businessConfig.games.pagination.maxLimit);
    }
    return businessConfig.games.pagination.defaultLimit;
  }

  /**
   * Validate and sanitize offset
   * @param {*} offset - Raw offset value
   * @returns {number} Valid offset
   */
  static _sanitizeOffset (offset) {
    if (offset && !isNaN(offset)) {
      return Math.max(parseInt(offset), businessConfig.games.pagination.defaultOffset);
    }
    return businessConfig.games.pagination.defaultOffset;
  }

  /**
   * Validate and sanitize sort by option
   * @param {string} sortBy - Raw sort by value
   * @returns {string} Valid sort field
   */
  static _sanitizeSortBy (sortBy) {
    const validSortFields = businessConfig.games.sortOptions.validFields;
    if (sortBy && typeof sortBy === 'string' && validSortFields.includes(sortBy)) {
      return sortBy;
    }
    return businessConfig.games.sortOptions.defaultField;
  }

  /**
   * Validate and sanitize sort order option
   * @param {string} sortOrder - Raw sort order value
   * @returns {string} Valid sort order
   */
  static _sanitizeSortOrder (sortOrder) {
    if (sortOrder && typeof sortOrder === 'string') {
      return sortOrder.toUpperCase() === 'ASC' ? 'ASC' : businessConfig.games.sortOptions.defaultOrder;
    }
    return businessConfig.games.sortOptions.defaultOrder;
  }
}
