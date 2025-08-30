import { BaseRepository } from './base-repository.js';
import logger from '../../utils/logger.js';

/**
 * Conferences Repository
 *
 * Handles database operations for conferences including:
 * - Finding conferences by various criteria
 * - Creating new conferences
 * - Updating conference information
 */
export class ConferencesRepository extends BaseRepository {
  constructor (databaseAdapter) {
    super(databaseAdapter, 'conferences');
  }

  /**
   * Find a conference by name, sport, division, and gender
   * @param {string} name - Conference name
   * @param {string} sport - Sport (e.g., 'soccer', 'basketball')
   * @param {string} division - Division (e.g., 'd1', 'd2', 'd3')
   * @param {string} gender - Gender (e.g., 'men', 'women', 'mixed')
   * @returns {Promise<Object|null>} Conference object or null if not found
   */
  async findByName (name, sport, division, gender) {
    const query = `
      SELECT * FROM conferences 
      WHERE name = ? AND sport = ? AND division = ? AND gender = ?
      LIMIT 1
    `;

    try {
      const conference = await this.executeQuerySingle(query, [name, sport, division, gender]);
      return conference;
    } catch (error) {
      logger.error('Error finding conference by name', error, { repository: 'ConferencesRepository', operation: 'findByName' });
      throw error;
    }
  }

  /**
   * Find or create a conference
   * @param {Object} conferenceData - Conference data
   * @returns {Promise<Object>} Conference object (existing or newly created)
   */
  async findOrCreate (conferenceData) {
    try {
      // Try to find existing conference
      const existingConference = await this.findByName(
        conferenceData.name,
        conferenceData.sport,
        conferenceData.division,
        conferenceData.gender
      );

      if (existingConference) {
        return existingConference;
      }

      // Create new conference if not found
      const newConference = await this.create(conferenceData);
      return newConference;
    } catch (error) {
      logger.error('Error in findOrCreate conference', error, { repository: 'ConferencesRepository', operation: 'findOrCreate' });
      throw error;
    }
  }

  /**
   * Create a new conference
   * @param {Object} conferenceData - Conference data
   * @returns {Promise<Object>} Created conference
   */
  async create (conferenceData) {
    this.validateRequiredConferenceFields(conferenceData);

    if (!conferenceData.conference_id) {
      conferenceData.conference_id = this._generateConferenceId(conferenceData);
    }

    const { query, params } = this.buildCreateQuery(conferenceData);

    try {
      const result = await this.executeQueryRun(query, params);
      return this.buildConferenceResponse(result, conferenceData);
    } catch (error) {
      logger.error('Error creating conference', error, { repository: 'ConferencesRepository', operation: 'create' });
      throw error;
    }
  }

  /**
   * Validate required conference fields
   * @param {Object} conferenceData - Conference data to validate
   * @private
   */
  validateRequiredConferenceFields (conferenceData) {
    const requiredFields = ['name', 'sport', 'division', 'gender'];
    requiredFields.forEach(field => {
      if (!conferenceData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
  }

  /**
   * Build the create query and parameters
   * @param {Object} conferenceData - Conference data
   * @returns {Object} Query and parameters
   * @private
   */
  buildCreateQuery (conferenceData) {
    const query = `
      INSERT INTO conferences (
        conference_id, name, short_name, sport, division, gender,
        level, website, logo_url, colors, region, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = this.buildCreateParams(conferenceData);
    return { query, params };
  }

  /**
   * Build the create query parameters
   * @param {Object} conferenceData - Conference data
   * @returns {Array} Query parameters
   * @private
   */
  buildCreateParams (conferenceData) {
    const requiredFields = this.extractRequiredConferenceFields(conferenceData);
    const optionalFields = this.extractOptionalConferenceFields(conferenceData);
    return [...requiredFields, ...optionalFields];
  }

  /**
   * Extract required conference fields
   * @param {Object} conferenceData - Conference data
   * @returns {Array} Required fields array
   * @private
   */
  extractRequiredConferenceFields (conferenceData) {
    return [
      conferenceData.conference_id,
      conferenceData.name,
      conferenceData.sport,
      conferenceData.division,
      conferenceData.gender
    ];
  }

  /**
   * Extract optional conference fields with defaults
   * @param {Object} conferenceData - Conference data
   * @returns {Array} Optional fields array
   * @private
   */
  extractOptionalConferenceFields (conferenceData) {
    const fieldMappings = [
      { field: 'short_name', defaultValue: null },
      { field: 'level', defaultValue: 'college' },
      { field: 'website', defaultValue: null },
      { field: 'logo_url', defaultValue: null },
      { field: 'colors', defaultValue: null },
      { field: 'region', defaultValue: null },
      { field: 'country', defaultValue: null }
    ];

    return fieldMappings.map(mapping =>
      conferenceData[mapping.field] || mapping.defaultValue
    );
  }

  /**
   * Build the conference response object
   * @param {Object} result - Database result
   * @param {Object} conferenceData - Original conference data
   * @returns {Object} Formatted conference response
   * @private
   */
  buildConferenceResponse (result, conferenceData) {
    return {
      id: result.lastID,
      conference_id: conferenceData.conference_id,
      name: conferenceData.name,
      sport: conferenceData.sport,
      division: conferenceData.division,
      gender: conferenceData.gender,
      level: conferenceData.level || 'college',
      ...conferenceData
    };
  }

  /**
   * Update conference information
   * @param {string} conferenceId - Conference ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated conference or null if not found
   */
  async update (conferenceId, updateData) {
    const allowedFields = [
      'name', 'short_name', 'sport', 'division', 'gender', 'level',
      'website', 'logo_url', 'colors', 'region', 'country'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(conferenceId);

    const query = `
      UPDATE conferences 
      SET ${updates.join(', ')}
      WHERE conference_id = ?
    `;

    try {
      const result = await this.executeQueryRun(query, params);

      if (result.changes === 0) {
        return null; // Conference not found
      }

      // Return updated conference
      return await this.findById(conferenceId);
    } catch (error) {
      logger.error('Error updating conference', error, { repository: 'ConferencesRepository', operation: 'update' });
      throw error;
    }
  }

  /**
   * Generate a unique conference ID
   * @param {Object} conferenceData - Conference data
   * @returns {string} Generated conference ID
   */
  _generateConferenceId (conferenceData) {
    const normalizedName = conferenceData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${conferenceData.sport}-${conferenceData.division}-${conferenceData.gender}-${normalizedName}`;
  }

  /**
   * Get all conferences with optional filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options (limit, offset, sortBy, sortOrder)
   * @returns {Promise<Object>} Conferences with pagination info
   */
  async findAll (filters = {}, options = {}) {
    const { query, params } = this.buildFindAllQuery(filters, options);

    try {
      const conferences = await this.executeQuery(query, params);
      const total = await this.getFilteredCount(filters);

      return this.buildPaginationResponse(conferences, total, options);
    } catch (error) {
      logger.error('Error finding conferences', error, { repository: 'ConferencesRepository', operation: 'findAll' });
      throw error;
    }
  }

  /**
   * Build the findAll query with filters and options
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Object} Query and parameters
   * @private
   */
  buildFindAllQuery (filters, options) {
    let query = 'SELECT * FROM conferences WHERE 1=1';
    const params = [];

    this.applyFilters(query, params, filters);
    this.applySorting(query, options);
    this.applyPagination(query, params, options);

    return { query, params };
  }

  /**
   * Apply filters to the query
   * @param {string} query - Base query
   * @param {Array} params - Query parameters
   * @param {Object} filters - Filter options
   * @private
   */
  applyFilters (query, params, filters) {
    const filterFields = ['sport', 'division', 'gender', 'level'];

    filterFields.forEach(field => {
      if (filters[field]) {
        query += ` AND ${field} = ?`;
        params.push(filters[field]);
      }
    });
  }

  /**
   * Apply sorting to the query
   * @param {string} query - Base query
   * @param {Object} options - Query options
   * @private
   */
  applySorting (query, options) {
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'ASC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  /**
   * Apply pagination to the query
   * @param {string} query - Base query
   * @param {Array} params - Query parameters
   * @param {Object} options - Query options
   * @private
   */
  applyPagination (query, params, options) {
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }
  }

  /**
   * Get filtered count for pagination
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   * @private
   */
  async getFilteredCount (filters) {
    let countQuery = 'SELECT COUNT(*) as total FROM conferences WHERE 1=1';
    const countParams = [];

    this.applyFilters(countQuery, countParams, filters);

    const countResult = await this.executeQuerySingle(countQuery, countParams);
    return countResult.total;
  }

  /**
   * Build pagination response
   * @param {Array} conferences - Conference list
   * @param {number} total - Total count
   * @param {Object} options - Query options
   * @returns {Object} Response with pagination info
   * @private
   */
  buildPaginationResponse (conferences, total, options) {
    return {
      conferences,
      pagination: {
        total,
        limit: options.limit || total,
        offset: options.offset || 0,
        hasMore: options.limit ? (options.offset || 0) + options.limit < total : false
      }
    };
  }
}
