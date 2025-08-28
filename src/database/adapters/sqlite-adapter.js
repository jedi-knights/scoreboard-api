import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { BaseDatabaseAdapter } from './base-adapter.js';
import path from 'path';
import fs from 'fs';

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

      console.log(`SQLite database connected: ${this.connectionPath}`);
    } catch (error) {
      console.error('Failed to connect to SQLite database:', error);
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
      console.log('SQLite database disconnected');
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
   * Execute a raw query
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async query (query, params = []) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.db.all(query, params);
      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a single row query
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>}
   */
  async get (query, params = []) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.db.get(query, params);
      return result || null;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a query that doesn't return results
   * @param {string} query - The SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>}
   */
  async run (query, params = []) {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.db.run(query, params);
      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
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
      console.error('Failed to begin transaction:', error);
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
      console.error('Failed to commit transaction:', error);
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
      console.error('Failed to rollback transaction:', error);
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
        division TEXT,
        sport TEXT NOT NULL,
        gender TEXT NOT NULL,
        level TEXT NOT NULL,
        website TEXT,
        logo_url TEXT,
        colors TEXT,
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
    `;

    try {
      await this.db.exec(createTablesSQL);
      console.log('SQLite tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
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
    `;

    try {
      await this.db.exec(dropTablesSQL);
      console.log('SQLite tables dropped successfully');
    } catch (error) {
      console.error('Failed to drop tables:', error);
      throw error;
    }
  }
}
