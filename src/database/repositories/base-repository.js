/**
 * Base Repository Interface
 *
 * This abstract class defines the contract that all repositories must implement.
 * It follows the Repository pattern to abstract data access logic.
 */
export class BaseRepository {
  constructor (databaseAdapter) {
    if (this.constructor === BaseRepository) {
      throw new Error('BaseRepository is an abstract class and cannot be instantiated directly');
    }
    this.db = databaseAdapter;
  }

  /**
   * Find all entities with optional filters
   * @param {Object} _filters - Filter criteria
   * @param {Object} _options - Query options (limit, offset, sort, etc.)
   * @returns {Promise<Array>} Array of entities
   */
  async findAll (_filters = {}, _options = {}) {
    throw new Error('findAll() method must be implemented by subclass');
  }

  /**
   * Find a single entity by ID
   * @param {string|number} _id - Entity identifier
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findById (_id) {
    throw new Error('findById() method must be implemented by subclass');
  }

  /**
   * Find a single entity by criteria
   * @param {Object} _criteria - Search criteria
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findOne (_criteria) {
    throw new Error('findOne() method must be implemented by subclass');
  }

  /**
   * Create a new entity
   * @param {Object} _data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create (_data) {
    throw new Error('create() method must be implemented by subclass');
  }

  /**
   * Update an existing entity
   * @param {string|number} _id - Entity identifier
   * @param {Object} _data - Update data
   * @returns {Promise<Object|null>} Updated entity or null if not found
   */
  async update (_id, _data) {
    throw new Error('update() method must be implemented by subclass');
  }

  /**
   * Delete an entity
   * @param {string|number} _id - Entity identifier
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete (_id) {
    throw new Error('delete() method must be implemented by subclass');
  }

  /**
   * Count entities matching criteria
   * @param {Object} _filters - Filter criteria
   * @returns {Promise<number>} Count of matching entities
   */
  async count (_filters = {}) {
    throw new Error('count() method must be implemented by subclass');
  }

  /**
   * Check if an entity exists
   * @param {Object} _criteria - Search criteria
   * @returns {Promise<boolean>} True if entity exists
   */
  async exists (_criteria) {
    throw new Error('exists() method must be implemented by subclass');
  }

  /**
   * Execute a custom query
   * @param {string} query - Custom query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async executeQuery (query, params = []) {
    return this.db.query(query, params);
  }

  /**
   * Execute a custom query for a single result
   * @param {string} query - Custom query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} Query result or null
   */
  async executeQuerySingle (query, params = []) {
    return this.db.get(query, params);
  }

  /**
   * Execute a custom query that doesn't return results
   * @param {string} query - Custom query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async executeQueryRun (query, params = []) {
    return this.db.run(query, params);
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Transaction object
   */
  async beginTransaction () {
    return this.db.beginTransaction();
  }

  /**
   * Commit a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction (transaction) {
    return this.db.commitTransaction(transaction);
  }

  /**
   * Rollback a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction (transaction) {
    return this.db.rollbackTransaction(transaction);
  }
}
