import { TeamsServiceInterface } from '../interfaces/teams-service-interface.js';
import { createTransactionManager } from '../utils/transaction-manager.js';
import logger from '../utils/logger.js';
import { ErrorFactory } from '../utils/errors.js';

/**
 * Teams Service
 *
 * Handles business logic for teams including:
 * - Team validation
 * - Team creation and updates
 * - Team search operations
 * Implements TeamsServiceInterface for dependency injection.
 * Implements transaction management for data consistency.
 */
export class TeamsService extends TeamsServiceInterface {
  constructor (teamsRepository, databaseAdapter) {
    super();

    if (!teamsRepository) {
      throw ErrorFactory.service('TeamsService', 'constructor', 'TeamsRepository is required');
    }

    if (!databaseAdapter) {
      throw ErrorFactory.service('TeamsService', 'constructor', 'DatabaseAdapter is required');
    }

    this.teamsRepository = teamsRepository;
    this.databaseAdapter = databaseAdapter;
    this.transactionManager = createTransactionManager(databaseAdapter);
  }

  /**
   * Find or create a team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Team object (existing or newly created)
   */
  async findOrCreateTeam (teamData) {
    try {
      // Validate team data
      this.validateTeamData(teamData);

      // Find or create the team
      const team = await this.teamsRepository.findOrCreate(teamData);

      return team;
    } catch (error) {
      logger.error('Error in findOrCreateTeam', error, { service: 'TeamsService', operation: 'findOrCreateTeam' });
      throw error;
    }
  }

  /**
   * Get team by name and criteria
   * @param {string} name - Team name
   * @param {string} sport - Sport
   * @param {string} division - Division
   * @param {string} gender - Gender
   * @returns {Promise<Object|null>} Team object or null
   */
  async getTeamByName (name, sport, division, gender) {
    try {
      const team = await this.teamsRepository.findByName(name, sport, division, gender);
      return team;
    } catch (error) {
      logger.error('Error getting team by name', error, { service: 'TeamsService', operation: 'getTeamByName' });
      throw error;
    }
  }

  /**
   * Get teams by conference
   * @param {string} conference - Conference name
   * @param {Object} filters - Additional filters
   * @param {Object} _options - Query options
   * @returns {Promise<Object>} Teams with pagination
   */
  async getTeamsByConference (conference, filters = {}, _options = {}) {
    try {
      const result = await this.teamsRepository.findByConference(
        conference,
        filters.sport,
        filters.division
      );

      return {
        teams: result,
        conference,
        total: result.length
      };
    } catch (error) {
      logger.error('Error getting teams by conference', error, { service: 'TeamsService', operation: 'getTeamsByConference' });
      throw error;
    }
  }

  /**
   * Get all teams with filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Teams with pagination
   */
  async getTeams (filters = {}, options = {}) {
    try {
      const result = await this.teamsRepository.findAll(filters, options);
      return result;
    } catch (error) {
      logger.error('Error getting teams', error, { service: 'TeamsService', operation: 'getTeams' });
      throw error;
    }
  }

  /**
   * Update team information
   * @param {string} teamId - Team ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated team or null
   */
  async updateTeam (teamId, updateData) {
    try {
      this.validateUpdateData(updateData);
      const updatedTeam = await this.teamsRepository.update(teamId, updateData);
      return updatedTeam;
    } catch (error) {
      logger.error('Error updating team', error, { service: 'TeamsService', operation: 'updateTeam' });
      throw error;
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Update data to validate
   * @private
   */
  validateUpdateData (updateData) {
    const validations = [
      { field: 'sport', validator: this.isValidSport.bind(this) },
      { field: 'division', validator: this.isValidDivision.bind(this) },
      { field: 'gender', validator: this.isValidGender.bind(this) }
    ];

    validations.forEach(({ field, validator }) => {
      if (updateData[field] && !validator(updateData[field])) {
        throw ErrorFactory.validation(`Invalid ${field}: ${updateData[field]}`, field, updateData[field]);
      }
    });
  }

  /**
   * Validate team data
   * @param {Object} teamData - Team data to validate
   * @throws {Error} If validation fails
   */
  validateTeamData (teamData) {
    this.validateRequiredTeamFields(teamData);
    this.validateOptionalTeamFields(teamData);
  }

  /**
   * Validate required team fields
   * @param {Object} teamData - Team data to validate
   * @private
   */
  validateRequiredTeamFields (teamData) {
    this.validateRequiredField(teamData, 'name', this.isValidName.bind(this));
    this.validateRequiredField(teamData, 'sport', this.isValidSport.bind(this));
    this.validateRequiredField(teamData, 'division', this.isValidDivision.bind(this));
    this.validateRequiredField(teamData, 'gender', this.isValidGender.bind(this));
  }

  /**
   * Validate a required field
   * @param {Object} data - Data object
   * @param {string} fieldName - Field name to validate
   * @param {Function} validator - Validation function
   * @private
   */
  validateRequiredField (data, fieldName, validator) {
    if (!data[fieldName] || !validator(data[fieldName])) {
      const message = fieldName === 'name'
        ? `${fieldName} is required and must be a non-empty string`
        : `Valid ${fieldName} is required. Got: ${data[fieldName]}`;
      throw ErrorFactory.validation(message, fieldName, data[fieldName]);
    }
  }

  /**
   * Validate name field
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid
   * @private
   */
  isValidName (name) {
    return typeof name === 'string' && name.trim().length > 0;
  }

  /**
   * Validate optional team fields
   * @param {Object} teamData - Team data to validate
   * @private
   */
  validateOptionalTeamFields (teamData) {
    const optionalFields = ['short_name', 'mascot', 'city', 'state', 'country', 'conference', 'website', 'logo_url', 'colors'];

    optionalFields.forEach(field => {
      if (teamData[field] && typeof teamData[field] !== 'string') {
        throw ErrorFactory.validation(`${field} must be a string`, field, teamData[field]);
      }
    });
  }

  /**
   * Validate sport
   * @param {string} sport - Sport to validate
   * @returns {boolean} True if valid
   */
  isValidSport (sport) {
    if (!sport || typeof sport !== 'string') {
      return false;
    }

    const validSports = [
      'soccer', 'football', 'basketball', 'baseball', 'softball',
      'volleyball', 'tennis', 'golf', 'swimming', 'track',
      'cross-country', 'lacrosse', 'field-hockey', 'ice-hockey',
      'wrestling', 'gymnastics', 'rowing', 'sailing'
    ];

    return validSports.includes(sport.toLowerCase());
  }

  /**
   * Validate division
   * @param {string} division - Division to validate
   * @returns {boolean} True if valid
   */
  isValidDivision (division) {
    if (!division || typeof division !== 'string') {
      return false;
    }

    const validDivisions = ['d1', 'd2', 'd3', 'naia', 'njcaa'];
    return validDivisions.includes(division.toLowerCase());
  }

  /**
   * Validate gender
   * @param {string} gender - Gender to validate
   * @returns {boolean} True if valid
   */
  isValidGender (gender) {
    if (!gender || typeof gender !== 'string') {
      return false;
    }

    const validGenders = ['men', 'women', 'mixed'];
    return validGenders.includes(gender.toLowerCase());
  }
}
