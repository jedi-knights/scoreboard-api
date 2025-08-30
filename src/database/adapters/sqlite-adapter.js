import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { BaseDatabaseAdapter } from './base-adapter.js';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger.js';

/**
 * SQLite Database Adapter
 *
 * Implements the BaseDatabaseAdapter interface for SQLite database operations.
 * Uses the sqlite3 package for database connectivity.
 */
export class SQLiteAdapter extends BaseDatabaseAdapter {
  constructor (config) {
    super(config);
    this.db = null;
    this.connectionPath = config.databasePath;

    // Ensure data directory exists
    const dataDir = path.dirname(this.connectionPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Initialize the SQLite database connection
   * @returns {Promise<void>}
   */
  async connect () {
    try {
      this.db = await open({
        filename: this.connectionPath,
        driver: sqlite3.Database,
        verbose: this.config.verbose || false
      });

      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON');

      // Create tables if they don't exist
      await this.createTables();

      logger.info(`SQLite database connected: ${this.connectionPath}`, { adapter: 'SQLiteAdapter', operation: 'connect' });
    } catch (error) {
      logger.error('Failed to connect to SQLite database', error, { adapter: 'SQLiteAdapter', operation: 'connect' });
      throw error;
    }
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async disconnect () {
    if (this.db) {
      await this.db.close();
      this.db = null;
      logger.info('SQLite database disconnected', { adapter: 'SQLiteAdapter', operation: 'disconnect' });
    }
  }

  /**
   * Check if the database is connected
   * @returns {Promise<boolean>}
   */
  async isConnected () {
    try {
      if (!this.db) return false;
      await this.db.get('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a query
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<any>}
   */
  async query (query, params = [], transaction = null) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      if (transaction) {
        const result = await transaction.db.all(query, params);
        return result;
      } else {
        const result = await this.db.all(query, params);
        return result;
      }
    } catch (error) {
      logger.error('Query execution failed', error, { adapter: 'SQLiteAdapter', operation: 'query' });
      throw error;
    }
  }

  /**
   * Execute a single row query
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<Object|null>}
   */
  async get (query, params = [], transaction = null) {
    this.validateDatabaseConnection();

    try {
      const result = await this.executeGetQuery(query, params, transaction);
      return result || null;
    } catch (error) {
      logger.error('Query execution failed', error, { adapter: 'SQLiteAdapter', operation: 'get' });
      throw error;
    }
  }

  /**
   * Validate database connection
   * @private
   */
  validateDatabaseConnection () {
    if (!this.db) {
      throw new Error('Database not connected');
    }
  }

  /**
   * Execute get query with or without transaction
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<Object>}
   * @private
   */
  async executeGetQuery (query, params, transaction) {
    if (transaction) {
      return await transaction.db.get(query, params);
    } else {
      return await this.db.get(query, params);
    }
  }

  /**
   * Execute a query that doesn't return results
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} transaction - Optional transaction object
   * @returns {Promise<Object>}
   */
  async run (query, params = [], transaction = null) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      if (transaction) {
        const result = await transaction.db.run(query, params);
        return result;
      } else {
        const result = await this.db.run(query, params);
        return result;
      }
    } catch (error) {
      logger.error('Query execution failed', error, { adapter: 'SQLiteAdapter', operation: 'run' });
      throw error;
    }
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Transaction object
   */
  async beginTransaction () {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      await this.db.exec('BEGIN TRANSACTION');
      return { db: this.db, committed: false };
    } catch (error) {
      logger.error('Failed to begin transaction', error, { adapter: 'SQLiteAdapter', operation: 'beginTransaction' });
      throw error;
    }
  }

  /**
   * Commit a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction (transaction) {
    if (!transaction || transaction.committed) {
      throw new Error('Invalid transaction state');
    }

    try {
      await transaction.db.exec('COMMIT');
      transaction.committed = true;
    } catch (error) {
      logger.error('Failed to commit transaction', error, { adapter: 'SQLiteAdapter', operation: 'commitTransaction' });
      throw error;
    }
  }

  /**
   * Rollback a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction (transaction) {
    if (!transaction || transaction.committed) {
      return; // Already committed, nothing to rollback
    }

    try {
      await transaction.db.exec('ROLLBACK');
    } catch (error) {
      logger.error('Failed to rollback transaction', error, { adapter: 'SQLiteAdapter', operation: 'rollbackTransaction' });
      // Don't throw here as rollback failures are not critical
    }
  }

  /**
   * Get database health status
   * @returns {Promise<Object>} Health status object
   */
  async getHealthStatus () {
    try {
      const startTime = Date.now();
      await this.db.get('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        database: 'sqlite',
        responseTime,
        timestamp: new Date().toISOString(),
        connected: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'sqlite',
        error: error.message,
        timestamp: new Date().toISOString(),
        connected: false
      };
    }
  }

  /**
   * Create database tables if they don't exist
   * @returns {Promise<void>}
   */
  async createTables () {
    const createTablesSQL = `
      -- Games table
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT UNIQUE NOT NULL,
        data_source TEXT NOT NULL,
        league_name TEXT,
        date TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        sport TEXT NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        status TEXT NOT NULL,
        current_period TEXT,
        period_scores TEXT,
        venue TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        timezone TEXT,
        broadcast_info TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Teams table
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT,
        mascot TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        conference TEXT,
        division TEXT NOT NULL,
        sport TEXT NOT NULL,
        gender TEXT NOT NULL,
        level TEXT NOT NULL,
        website TEXT,
        logo_url TEXT,
        colors TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Conferences table
      CREATE TABLE IF NOT EXISTS conferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conference_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT,
        sport TEXT NOT NULL,
        division TEXT NOT NULL,
        gender TEXT NOT NULL,
        level TEXT NOT NULL,
        website TEXT,
        logo_url TEXT,
        colors TEXT,
        region TEXT,
        country TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Collections table
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sport TEXT NOT NULL,
        gender TEXT NOT NULL,
        division TEXT NOT NULL,
        season TEXT NOT NULL,
        data_source TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Schedules table
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_id TEXT UNIQUE NOT NULL,
        team_id TEXT NOT NULL,
        season TEXT NOT NULL,
        sport TEXT NOT NULL,
        games TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (team_id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
      CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
      CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
      CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team);
      CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team);
      CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);
      CREATE INDEX IF NOT EXISTS idx_teams_conference ON teams(conference);
      CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
      CREATE INDEX IF NOT EXISTS idx_conferences_sport ON conferences(sport);
      CREATE INDEX IF NOT EXISTS idx_conferences_division ON conferences(division);
      CREATE INDEX IF NOT EXISTS idx_conferences_gender ON conferences(gender);
    `;

    try {
      await this.db.exec(createTablesSQL);
      logger.info('SQLite tables created successfully', { adapter: 'SQLiteAdapter', operation: 'createTables' });
    } catch (error) {
      logger.error('Failed to create tables', error, { adapter: 'SQLiteAdapter', operation: 'createTables' });
      throw error;
    }
  }

  /**
   * Drop all database tables
   * @returns {Promise<void>}
   */
  async dropTables () {
    const dropTablesSQL = `
      DROP TABLE IF EXISTS schedules;
      DROP TABLE IF EXISTS collections;
      DROP TABLE IF EXISTS games;
      DROP TABLE IF EXISTS teams;
      DROP TABLE IF EXISTS conferences;
    `;

    try {
      await this.db.exec(dropTablesSQL);
      logger.info('SQLite tables dropped successfully', { adapter: 'SQLiteAdapter', operation: 'dropTables' });
    } catch (error) {
      logger.error('Failed to drop tables', error, { adapter: 'SQLiteAdapter', operation: 'dropTables' });
      throw error;
    }
  }
}
