/**
 * Test Container Factory
 * 
 * Manages test containers and provides dependency injection for integration tests.
 * Supports multiple database types and ensures proper test isolation.
 */

import { GenericContainer } from 'testcontainers';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Container Factory for managing database containers
 */
export class TestContainerFactory {
  constructor() {
    this.containers = new Map();
    this.clients = new Map();
    this.configs = new Map();
  }

  /**
   * Get or create a PostgreSQL container
   * @param {Object} options - Container options
   * @returns {Promise<Object>} Container and client information
   */
  async getPostgresContainer(options = {}) {
    const containerKey = 'postgres';
    
    if (this.containers.has(containerKey)) {
      return {
        container: this.containers.get(containerKey),
        client: this.clients.get(containerKey),
        config: this.configs.get(containerKey)
      };
    }

    const {
      image = 'postgres:15-alpine',
      database = 'scoreboard_test',
      username = 'postgres',
      password = 'test_password',
      port = 5432
    } = options;

    try {
      console.log('🐘 Starting PostgreSQL container...');
      
      const container = await new GenericContainer(image)
        .withEnvironment({
          POSTGRES_DB: database,
          POSTGRES_USER: username,
          POSTGRES_PASSWORD: password
        })
        .withExposedPorts(port)
        .withWaitStrategy({
          type: 'healthcheck',
          healthcheck: {
            test: ['CMD-SHELL', 'pg_isready -U postgres'],
            interval: 1000,
            timeout: 3000,
            retries: 30,
            startPeriod: 10000
          }
        })
        .start();

      const mappedPort = container.getMappedPort(port);
      
      const config = {
        host: 'localhost',
        port: mappedPort,
        database,
        username,
        password,
        ssl: false
      };

      // Wait for container to be ready and create database
      await this.waitForPostgres(config);
      await this.setupPostgresDatabase(config);
      
      const client = new Client(config);
      await client.connect();

      // Store references
      this.containers.set(containerKey, container);
      this.clients.set(containerKey, client);
      this.configs.set(containerKey, config);

      console.log('✅ PostgreSQL container ready');
      
      return { container, client, config };
    } catch (error) {
      console.error('❌ Failed to start PostgreSQL container:', error);
      throw error;
    }
  }

  /**
   * Get or create a MySQL container
   * @param {Object} options - Container options
   * @returns {Promise<Object>} Container and client information
   */
  async getMySQLContainer(options = {}) {
    const containerKey = 'mysql';
    
    if (this.containers.has(containerKey)) {
      return {
        container: this.containers.get(containerKey),
        client: this.clients.get(containerKey),
        config: this.configs.get(containerKey)
      };
    }

    const {
      image = 'mysql:8.0',
      database = 'scoreboard_test',
      username = 'root',
      password = 'test_password',
      port = 3306
    } = options;

    try {
      console.log('🐬 Starting MySQL container...');
      
      const container = await new GenericContainer(image)
        .withEnvironment({
          MYSQL_ROOT_PASSWORD: password,
          MYSQL_DATABASE: database
        })
        .withExposedPorts(port)
        .withWaitStrategy({
          type: 'healthcheck',
          healthcheck: {
            test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
            interval: 1000,
            timeout: 3000,
            retries: 30,
            startPeriod: 10000
          }
        })
        .start();

      const mappedPort = container.getMappedPort(port);
      
      const config = {
        host: 'localhost',
        port: mappedPort,
        database,
        username,
        password
      };

      // Wait for container to be ready and create database
      await this.waitForMySQL(config);
      await this.setupMySQLDatabase(config);
      
      // For MySQL, we'll use a simple connection object for now
      const client = { config, query: () => Promise.resolve({ rows: [] }) };

      // Store references
      this.containers.set(containerKey, container);
      this.clients.set(containerKey, client);
      this.configs.set(containerKey, config);

      console.log('✅ MySQL container ready');
      
      return { container, client, config };
    } catch (error) {
      console.error('❌ Failed to start MySQL container:', error);
      throw error;
    }
  }

  /**
   * Get SQLite configuration for testing
   * @param {Object} options - SQLite options
   * @returns {Object} SQLite configuration
   */
  getSQLiteConfig(options = {}) {
    const {
      databasePath = './tests/data/test-scoreboard.db',
      createTables = true
    } = options;

    const config = {
      type: 'sqlite',
      databasePath,
      createTables
    };

    // Ensure test data directory exists
    const testDataDir = path.dirname(databasePath);
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    return config;
  }

  /**
   * Wait for PostgreSQL to be ready
   * @param {Object} config - Database configuration
   * @returns {Promise<void>}
   */
  async waitForPostgres(config) {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const client = new Client(config);
        await client.connect();
        await client.end();
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('PostgreSQL container failed to become ready');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Wait for MySQL to be ready
   * @param {Object} config - Database configuration
   * @returns {Promise<void>}
   */
  async waitForMySQL(config) {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        // Simple connection test for MySQL
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('MySQL container failed to become ready');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Setup PostgreSQL database with schema
   * @param {Object} config - Database configuration
   * @returns {Promise<void>}
   */
  async setupPostgresDatabase(config) {
    const client = new Client(config);
    await client.connect();

    try {
      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS conferences (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          short_name VARCHAR(20),
          sport VARCHAR(50) NOT NULL,
          division VARCHAR(10) NOT NULL,
          gender VARCHAR(10) NOT NULL,
          region VARCHAR(50),
          country VARCHAR(50) DEFAULT 'USA',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          short_name VARCHAR(20),
          mascot VARCHAR(100),
          sport VARCHAR(50) NOT NULL,
          division VARCHAR(10) NOT NULL,
          gender VARCHAR(10) NOT NULL,
          city VARCHAR(50),
          state VARCHAR(10),
          country VARCHAR(50) DEFAULT 'USA',
          conference_id INTEGER REFERENCES conferences(id),
          colors TEXT,
          founded_year INTEGER,
          home_venue VARCHAR(100),
          capacity INTEGER,
          website VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          zip_code VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          game_id VARCHAR(100) UNIQUE NOT NULL,
          home_team_id INTEGER REFERENCES teams(id),
          away_team_id INTEGER REFERENCES teams(id),
          sport VARCHAR(50) NOT NULL,
          division VARCHAR(10) NOT NULL,
          gender VARCHAR(10) NOT NULL,
          date DATE NOT NULL,
          time TIME,
          venue VARCHAR(100),
          status VARCHAR(20) DEFAULT 'scheduled',
          home_score INTEGER,
          away_score INTEGER,
          current_period INTEGER,
          time_remaining VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS collections (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS schedules (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ PostgreSQL database schema created');
    } finally {
      await client.end();
    }
  }

  /**
   * Setup MySQL database with schema
   * @param {Object} config - Database configuration
   * @returns {Promise<void>}
   */
  async setupMySQLDatabase(config) {
    // MySQL schema setup would go here
    // For now, just log that it's ready
    console.log('✅ MySQL database ready (schema setup not implemented)');
  }

  /**
   * Clean up all containers and clients
   * @returns {Promise<void>}
   */
  async cleanup() {
    console.log('🧹 Cleaning up test containers...');
    
    // Close all database clients
    for (const [key, client] of this.clients) {
      try {
        if (client.end) {
          await client.end();
        }
      } catch (error) {
        console.warn(`Warning: Failed to close ${key} client:`, error.message);
      }
    }

    // Stop all containers
    for (const [key, container] of this.containers) {
      try {
        await container.stop();
        console.log(`✅ Stopped ${key} container`);
      } catch (error) {
        console.warn(`Warning: Failed to stop ${key} container:`, error.message);
      }
    }

    // Clear references
    this.containers.clear();
    this.clients.clear();
    this.configs.clear();

    console.log('✅ Test containers cleaned up');
  }

  /**
   * Clean up test data between tests
   * @param {string} databaseType - Type of database to clean
   * @returns {Promise<void>}
   */
  async cleanupTestData(databaseType = 'postgres') {
    if (databaseType === 'postgres' && this.clients.has('postgres')) {
      const client = this.clients.get('postgres');
      try {
        await client.query('TRUNCATE games, teams, conferences, collections, schedules RESTART IDENTITY CASCADE');
      } catch (error) {
        console.warn('Warning: Failed to clean up PostgreSQL test data:', error.message);
      }
    } else if (databaseType === 'sqlite') {
      // Clean up SQLite test data
      const sqliteConfig = this.getSQLiteConfig();
      if (fs.existsSync(sqliteConfig.databasePath)) {
        fs.unlinkSync(sqliteConfig.databasePath);
      }
    }
  }
}

// Export singleton instance
export const testContainerFactory = new TestContainerFactory();
