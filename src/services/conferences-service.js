import { ConferencesServiceInterface } from '../interfaces/conferences-service-interface.js';
import { createTransactionManager } from '../utils/transaction-manager.js';
import logger from '../utils/logger.js';
import { ErrorFactory } from '../utils/errors.js';

/**
 * Conferences Service
 *
 * Handles business logic for conferences including:
 * - Conference validation
 * - Conference creation and updates
 * - Conference search operations
 * Implements ConferencesServiceInterface for dependency injection.
 * Implements transaction management for data consistency.
 */
export class ConferencesService extends ConferencesServiceInterface {
  constructor (conferencesRepository, databaseAdapter) {
    super();

    if (!conferencesRepository) {
      throw ErrorFactory.service('ConferencesService', 'constructor', 'ConferencesRepository is required');
    }

    if (!databaseAdapter) {
      throw ErrorFactory.service('ConferencesService', 'constructor', 'DatabaseAdapter is required');
    }

    this.conferencesRepository = conferencesRepository;
    this.databaseAdapter = databaseAdapter;
    this.transactionManager = createTransactionManager(databaseAdapter);
  }

  /**
   * Find or create a conference
   * @param {Object} conferenceData - Conference data
   * @returns {Promise<Object>} Conference object (existing or newly created)
   */
  async findOrCreateConference (conferenceData) {
    try {
      // Validate conference data
      this.validateConferenceData(conferenceData);

      // Find or create the conference
      const conference = await this.conferencesRepository.findOrCreate(conferenceData);

      return conference;
    } catch (error) {
      logger.error('Error in findOrCreateConference', error, { service: 'ConferencesService', operation: 'findOrCreateConference' });
      throw error;
    }
  }

  /**
   * Get conference by name and criteria
   * @param {string} name - Conference name
   * @param {string} sport - Sport
   * @param {string} division - Division
   * @param {string} gender - Gender
   * @returns {Promise<Object|null>} Conference object or null
   */
  async getConferenceByName (name, sport, division, gender) {
    try {
      const conference = await this.conferencesRepository.findByName(name, sport, division, gender);
      return conference;
    } catch (error) {
      logger.error('Error getting conference by name', error, { service: 'ConferencesService', operation: 'getConferenceByName' });
      throw error;
    }
  }

  /**
   * Get all conferences with filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Conferences with pagination
   */
  async getConferences (filters = {}, options = {}) {
    try {
      const result = await this.conferencesRepository.findAll(filters, options);
      return result;
    } catch (error) {
      logger.error('Error getting conferences', error, { service: 'ConferencesService', operation: 'getConferences' });
      throw error;
    }
  }

  /**
   * Update conference information
   * @param {string} conferenceId - Conference ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated conference or null
   */
  async updateConference (conferenceId, updateData) {
    try {
      this.validateUpdateData(updateData);
      const updatedConference = await this.conferencesRepository.update(conferenceId, updateData);
      return updatedConference;
    } catch (error) {
      logger.error('Error updating conference', error, { service: 'ConferencesService', operation: 'updateConference' });
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
        throw new Error(`Invalid ${field}: ${updateData[field]}`);
      }
    });
  }

  /**
   * Validate conference data
   * @param {Object} conferenceData - Conference data to validate
   * @throws {Error} If validation fails
   */
  validateConferenceData (conferenceData) {
    this.validateRequiredConferenceFields(conferenceData);
    this.validateOptionalConferenceFields(conferenceData);
  }

  /**
   * Validate required conference fields
   * @param {Object} conferenceData - Conference data to validate
   * @private
   */
  validateRequiredConferenceFields (conferenceData) {
    this.validateRequiredField(conferenceData, 'name', this.isValidName.bind(this));
    this.validateRequiredField(conferenceData, 'sport', this.isValidSport.bind(this));
    this.validateRequiredField(conferenceData, 'division', this.isValidDivision.bind(this));
    this.validateRequiredField(conferenceData, 'gender', this.isValidGender.bind(this));
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
   * Validate optional conference fields
   * @param {Object} conferenceData - Conference data to validate
   * @private
   */
  validateOptionalConferenceFields (conferenceData) {
    const optionalFields = ['short_name', 'level', 'website', 'logo_url', 'colors', 'region', 'country'];

    optionalFields.forEach(field => {
      if (conferenceData[field] && typeof conferenceData[field] !== 'string') {
        throw ErrorFactory.validation(`${field} must be a string`, field, conferenceData[field]);
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
