import { BaseRepository } from './base-repository.js';
import logger from '../../utils/logger.js';

/**
 * Teams Repository
 *
 * Handles database operations for teams including:
 * - Finding teams by various criteria
 * - Creating new teams
 * - Updating team information
 * - Managing team-conference relationships
 */
export class TeamsRepository extends BaseRepository {
  constructor (databaseAdapter) {
    super(databaseAdapter, 'teams');
  }

  /**
   * Find a team by name, sport, division, and gender
   * @param {string} name - Team name
   * @param {string} sport - Sport (e.g., 'soccer', 'basketball')
   * @param {string} division - Division (e.g., 'd1', 'd2', 'd3')
   * @param {string} gender - Gender (e.g., 'men', 'women', 'mixed')
   * @returns {Promise<Object|null>} Team object or null if not found
   */
  async findByName (name, sport, division, gender) {
    const query = `
      SELECT * FROM teams 
      WHERE name = ? AND sport = ? AND division = ? AND gender = ?
      LIMIT 1
    `;

    try {
      const team = await this.executeQuerySingle(query, [name, sport, division, gender]);
      return team;
    } catch (error) {
      logger.error('Error finding team by name', error, { repository: 'TeamsRepository', operation: 'findByName' });
      throw error;
    }
  }

  /**
   * Find teams by conference
   * @param {string} conference - Conference name
   * @param {string} sport - Sport (optional filter)
   * @param {string} division - Division (optional filter)
   * @returns {Promise<Array>} Array of teams
   */
  async findByConference (conference, sport = null, division = null) {
    let query = 'SELECT * FROM teams WHERE conference = ?';
    const params = [conference];

    if (sport) {
      query += ' AND sport = ?';
      params.push(sport);
    }

    if (division) {
      query += ' AND division = ?';
      params.push(division);
    }

    try {
      const teams = await this.executeQuery(query, params);
      return teams;
    } catch (error) {
      logger.error('Error finding teams by conference', error, { repository: 'TeamsRepository', operation: 'findByConference' });
      throw error;
    }
  }

  /**
   * Find or create a team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Team object (existing or newly created)
   */
  async findOrCreate (teamData) {
    try {
      // Try to find existing team
      const existingTeam = await this.findByName(
        teamData.name,
        teamData.sport,
        teamData.division,
        teamData.gender
      );

      if (existingTeam) {
        return existingTeam;
      }

      // Create new team if not found
      const newTeam = await this.create(teamData);
      return newTeam;
    } catch (error) {
      logger.error('Error in findOrCreate team', error, { repository: 'TeamsRepository', operation: 'findOrCreate' });
      throw error;
    }
  }

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Created team
   */
  async create (teamData) {
    this.validateRequiredTeamFields(teamData);

    if (!teamData.team_id) {
      teamData.team_id = this._generateTeamId(teamData);
    }

    const { query, params } = this.buildCreateQuery(teamData);

    try {
      const result = await this.executeQueryRun(query, params);
      return this.buildTeamResponse(result, teamData);
    } catch (error) {
      logger.error('Error creating team', error, { repository: 'TeamsRepository', operation: 'create' });
      throw error;
    }
  }

  /**
   * Validate required team fields
   * @param {Object} teamData - Team data to validate
   * @private
   */
  validateRequiredTeamFields (teamData) {
    const requiredFields = ['name', 'sport', 'division', 'gender'];
    requiredFields.forEach(field => {
      if (!teamData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
  }

  /**
   * Build the create query and parameters
   * @param {Object} teamData - Team data
   * @returns {Object} Query and parameters
   * @private
   */
  buildCreateQuery (teamData) {
    const query = `
      INSERT INTO teams (
        team_id, name, short_name, mascot, city, state, country,
        conference, division, sport, gender, level, website, logo_url, colors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = this.buildCreateParams(teamData);
    return { query, params };
  }

  /**
   * Build the create query parameters
   * @param {Object} teamData - Team data
   * @returns {Array} Query parameters
   * @private
   */
  buildCreateParams (teamData) {
    const requiredFields = this.extractRequiredTeamFields(teamData);
    const optionalFields = this.extractOptionalTeamFields(teamData);
    return [...requiredFields, ...optionalFields];
  }

  /**
   * Extract required team fields
   * @param {Object} teamData - Team data
   * @returns {Array} Required fields array
   * @private
   */
  extractRequiredTeamFields (teamData) {
    return [
      teamData.team_id,
      teamData.name,
      teamData.division,
      teamData.sport,
      teamData.gender
    ];
  }

  /**
   * Extract optional team fields with defaults
   * @param {Object} teamData - Team data
   * @returns {Array} Optional fields array
   * @private
   */
  extractOptionalTeamFields (teamData) {
    const fieldMappings = [
      { field: 'short_name', defaultValue: null },
      { field: 'mascot', defaultValue: null },
      { field: 'city', defaultValue: null },
      { field: 'state', defaultValue: null },
      { field: 'country', defaultValue: null },
      { field: 'conference', defaultValue: null },
      { field: 'level', defaultValue: 'college' },
      { field: 'website', defaultValue: null },
      { field: 'logo_url', defaultValue: null },
      { field: 'colors', defaultValue: null }
    ];

    return fieldMappings.map(mapping =>
      teamData[mapping.field] || mapping.defaultValue
    );
  }

  /**
   * Build the team response object
   * @param {Object} result - Database result
   * @param {Object} teamData - Original team data
   * @returns {Object} Formatted team response
   * @private
   */
  buildTeamResponse (result, teamData) {
    return {
      id: result.lastID,
      team_id: teamData.team_id,
      name: teamData.name,
      sport: teamData.sport,
      division: teamData.division,
      gender: teamData.gender,
      conference: teamData.conference,
      level: teamData.level || 'college',
      ...teamData
    };
  }

  /**
   * Update team information
   * @param {string} teamId - Team ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated team or null if not found
   */
  async update (teamId, updateData) {
    const allowedFields = [
      'name', 'short_name', 'mascot', 'city', 'state', 'country',
      'conference', 'division', 'sport', 'gender', 'level',
      'website', 'logo_url', 'colors'
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
    params.push(teamId);

    const query = `
      UPDATE teams 
      SET ${updates.join(', ')}
      WHERE team_id = ?
    `;

    try {
      const result = await this.executeQueryRun(query, params);

      if (result.changes === 0) {
        return null; // Team not found
      }

      // Return updated team
      return await this.findById(teamId);
    } catch (error) {
      logger.error('Error updating team', error, { repository: 'TeamsRepository', operation: 'update' });
      throw error;
    }
  }

  /**
   * Generate a unique team ID
   * @param {Object} teamData - Team data
   * @returns {string} Generated team ID
   */
  _generateTeamId (teamData) {
    const normalizedName = teamData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${teamData.sport}-${teamData.division}-${teamData.gender}-${normalizedName}`;
  }

  /**
   * Get all teams with optional filters
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options (limit, offset, sortBy, sortOrder)
   * @returns {Promise<Object>} Teams with pagination info
   */
  async findAll (filters = {}, options = {}) {
    const { query, params } = this.buildFindAllQuery(filters, options);

    try {
      const teams = await this.executeQuery(query, params);
      const total = await this.getFilteredCount(filters);

      return this.buildPaginationResponse(teams, total, options);
    } catch (error) {
      logger.error('Error finding teams', error, { repository: 'TeamsRepository', operation: 'findAll' });
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
    let query = 'SELECT * FROM teams WHERE 1=1';
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
    const filterFields = ['sport', 'division', 'gender', 'conference'];

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
    let countQuery = 'SELECT COUNT(*) as total FROM teams WHERE 1=1';
    const countParams = [];

    this.applyFilters(countQuery, countParams, filters);

    const countResult = await this.executeQuerySingle(countQuery, countParams);
    return countResult.total;
  }

  /**
   * Build pagination response
   * @param {Array} teams - Team list
   * @param {number} total - Total count
   * @param {Object} options - Query options
   * @returns {Object} Response with pagination info
   * @private
   */
  buildPaginationResponse (teams, total, options) {
    return {
      teams,
      pagination: {
        total,
        limit: options.limit || total,
        offset: options.offset || 0,
        hasMore: options.limit ? (options.offset || 0) + options.limit < total : false
      }
    };
  }
}
