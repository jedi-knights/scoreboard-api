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
  static createAdapter(config = databaseConfig) {
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
  static getDefaultAdapter() {
    return this.createAdapter();
  }

  /**
   * Validate database configuration
   * @param {Object} config - Database configuration to validate
   * @returns {boolean} True if configuration is valid
   */
  static validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    if (!config.type || typeof config.type !== 'string') {
      return false;
    }

    const supportedTypes = ['sqlite', 'postgres', 'dynamodb'];
    if (!supportedTypes.includes(config.type.toLowerCase())) {
      return false;
    }

    // Validate type-specific configuration
    switch (config.type.toLowerCase()) {
      case 'sqlite':
        return config.sqlite && config.sqlite.databasePath;
      
      case 'postgres':
        return config.postgres && 
               config.postgres.host && 
               config.postgres.database && 
               config.postgres.username;
      
      case 'dynamodb':
        return config.dynamodb && config.dynamodb.region;
      
      default:
        return false;
    }
  }
}
