import { SQLiteAdapter } from './adapters/sqlite-adapter.js';
import { databaseConfig } from '../config/index.js';

/**
 * Database Factory
 *
 * Factory class that creates the appropriate database adapter based on configuration.
 * Follows the Factory pattern to abstract database creation logic.
 */
export class DatabaseFactory {
  /**
   * Create a database adapter instance based on configuration
   * @param {Object} config - Database configuration
   * @returns {BaseDatabaseAdapter} Database adapter instance
   */
  static createAdapter (config = databaseConfig) {
    const { type } = config;

    switch (type.toLowerCase()) {
    case 'sqlite':
      return new SQLiteAdapter(config.sqlite);

    case 'postgres':
      // TODO: Implement PostgreSQL adapter
      throw new Error('PostgreSQL adapter not yet implemented');

    case 'dynamodb':
      // TODO: Implement DynamoDB adapter
      throw new Error('DynamoDB adapter not yet implemented');

    default:
      throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Get the default database adapter
   * @returns {BaseDatabaseAdapter} Default database adapter instance
   */
  static getDefaultAdapter () {
    return this.createAdapter();
  }

  /**
   * Validate basic configuration structure
   * @param {Object} config - Configuration to validate
   * @returns {boolean} True if basic structure is valid
   */
  static _validateBasicConfig (config) {
    return config &&
           typeof config === 'object' &&
           config.type &&
           typeof config.type === 'string';
  }

  /**
   * Validate SQLite configuration
   * @param {Object} config - SQLite configuration
   * @returns {boolean} True if SQLite config is valid
   */
  static _validateSQLiteConfig (config) {
    return config.sqlite && config.sqlite.databasePath;
  }

  /**
   * Validate PostgreSQL configuration
   * @param {Object} config - PostgreSQL configuration
   * @returns {boolean} True if PostgreSQL config is valid
   */
  static _validatePostgresConfig (config) {
    return config.postgres &&
           config.postgres.host &&
           config.postgres.database &&
           config.postgres.username;
  }

  /**
   * Validate DynamoDB configuration
   * @param {Object} config - DynamoDB configuration
   * @returns {boolean} True if DynamoDB config is valid
   */
  static _validateDynamoDBConfig (config) {
    return config.dynamodb && config.dynamodb.region;
  }

  /**
   * Validate database configuration
   * @param {Object} config - Database configuration to validate
   * @returns {boolean} True if configuration is valid
   */
  static validateConfig (config) {
    if (!this._validateBasicConfig(config)) {
      return false;
    }

    const supportedTypes = ['sqlite', 'postgres', 'dynamodb'];
    if (!supportedTypes.includes(config.type.toLowerCase())) {
      return false;
    }

    // Validate type-specific configuration
    const type = config.type.toLowerCase();
    switch (type) {
    case 'sqlite':
      return this._validateSQLiteConfig(config);
    case 'postgres':
      return this._validatePostgresConfig(config);
    case 'dynamodb':
      return this._validateDynamoDBConfig(config);
    default:
      return false;
    }
  }
}
