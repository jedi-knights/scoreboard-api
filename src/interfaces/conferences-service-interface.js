/**
 * Conferences Service Interface
 *
 * Defines the contract for conferences-related operations.
 * This interface allows services to depend on conferences functionality
 * without being tightly coupled to the concrete implementation.
 */
export class ConferencesServiceInterface {
  /**
   * Find or create a conference
   * @param {Object} _conferenceData - Conference data
   * @returns {Promise<Object>} Conference object (existing or newly created)
   */
  async findOrCreateConference (_conferenceData) {
    throw new Error('Method findOrCreateConference must be implemented');
  }

  /**
   * Get conference by name and criteria
   * @param {string} _name - Conference name
   * @param {string} _sport - Sport
   * @param {string} _division - Division
   * @param {string} _gender - Gender
   * @returns {Promise<Object|null>} Conference object or null
   */
  async getConferenceByName (_name, _sport, _division, _gender) {
    throw new Error('Method getConferenceByName must be implemented');
  }

  /**
   * Get all conferences with filters
   * @param {Object} _filters - Filter options
   * @param {Object} _options - Query options
   * @returns {Promise<Object>} Conferences with pagination
   */
  async getConferences (_filters = {}, _options = {}) {
    throw new Error('Method getConferences must be implemented');
  }

  /**
   * Update conference information
   * @param {string} _conferenceId - Conference ID
   * @param {Object} _updateData - Update data
   * @returns {Promise<Object|null>} Updated conference or null
   */
  async updateConference (_conferenceId, _updateData) {
    throw new Error('Method updateConference must be implemented');
  }

  /**
   * Delete a conference
   * @param {string} _conferenceId - Conference ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteConference (_conferenceId) {
    throw new Error('Method deleteConference must be implemented');
  }
}
