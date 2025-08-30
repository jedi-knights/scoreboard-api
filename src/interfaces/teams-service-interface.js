/**
 * Teams Service Interface
 *
 * Defines the contract for teams-related operations.
 * This interface allows services to depend on teams functionality
 * without being tightly coupled to the concrete implementation.
 */
export class TeamsServiceInterface {
  /**
   * Find or create a team
   * @param {Object} _teamData - Team data
   * @returns {Promise<Object>} Team object (existing or newly created)
   */
  async findOrCreateTeam (_teamData) {
    throw new Error('Method findOrCreateTeam must be implemented');
  }

  /**
   * Get team by name and criteria
   * @param {string} _name - Team name
   * @param {string} _sport - Sport
   * @param {string} _division - Division
   * @param {string} _gender - Gender
   * @returns {Promise<Object|null>} Team object or null
   */
  async getTeamByName (_name, _sport, _division, _gender) {
    throw new Error('Method getTeamByName must be implemented');
  }

  /**
   * Get teams by conference
   * @param {string} conference - Conference name
   * @param {Object} _filters - Additional filters
   * @param {Object} _options - Query options
   * @returns {Promise<Object>} Teams with pagination
   */
  async getTeamsByConference (conference, _filters = {}, _options = {}) {
    throw new Error('Method getTeamsByConference must be implemented');
  }

  /**
   * Get all teams with filters
   * @param {Object} _filters - Filter options
   * @param {Object} _options - Query options
   * @returns {Promise<Object>} Teams with pagination
   */
  async getTeams (_filters = {}, _options = {}) {
    throw new Error('Method getTeams must be implemented');
  }

  /**
   * Update team information
   * @param {string} _teamId - Team ID
   * @param {Object} _updateData - Update data
   * @returns {Promise<Object|null>} Updated team or null
   */
  async updateTeam (_teamId, _updateData) {
    throw new Error('Method updateTeam must be implemented');
  }

  /**
   * Delete a team
   * @param {string} _teamId - Team ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTeam (_teamId) {
    throw new Error('Method deleteTeam must be implemented');
  }
}
