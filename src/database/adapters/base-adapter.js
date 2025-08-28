/**
 * Base Database Adapter Interface
 * 
 * This abstract class defines the contract that all database adapters must implement.
 * It follows the Strategy pattern to allow easy switching between different database backends.
 */
export class BaseDatabaseAdapter {
  constructor(config) {
    if (this.constructor === BaseDatabaseAdapter) {
      throw new Error('BaseDatabaseAdapter is an abstract class and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('connect() method must be implemented by subclass');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('disconnect() method must be implemented by subclass');
  }

  /**
   * Check if the database is connected
   * @returns {Promise<boolean>}
   */
  async isConnected() {
    throw new Error('isConnected() method must be implemented by subclass');
  }

  /**
   * Execute a raw query
   * @param {string} query - The query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async query(query, params = []) {
    throw new Error('query() method must be implemented by subclass');
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Transaction object
   */
  async beginTransaction() {
    throw new Error('beginTransaction() method must be implemented by subclass');
  }

  /**
   * Commit a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction(transaction) {
    throw new Error('commitTransaction() method must be implemented by subclass');
  }

  /**
   * Rollback a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction(transaction) {
    throw new Error('rollbackTransaction() method must be implemented by subclass');
  }

  /**
   * Get database health status
   * @returns {Promise<Object>} Health status object
   */
  async getHealthStatus() {
    throw new Error('getHealthStatus() method must be implemented by subclass');
  }

  /**
   * Create database tables if they don't exist
   * @returns {Promise<void>}
   */
  async createTables() {
    throw new Error('createTables() method must be implemented by subclass');
  }

  /**
   * Drop all database tables
   * @returns {Promise<void>}
   */
  async dropTables() {
    throw new Error('dropTables() method must be implemented by subclass');
  }
}
