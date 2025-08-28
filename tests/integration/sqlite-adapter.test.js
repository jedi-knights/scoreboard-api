/**
 * Integration Tests for SQLite Adapter
 * 
 * Tests database operations with a real SQLite database.
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { SQLiteAdapter } from '../../src/database/adapters/sqlite-adapter.js';
import path from 'path';
import fs from 'fs';

describe('SQLite Adapter Integration Tests', () => {
  let sqliteAdapter;
  let testDbPath;

  beforeAll(() => {
    // Create a temporary test database
    testDbPath = path.join(process.cwd(), 'test-integration.db');
  });

  afterAll(async () => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  beforeEach(async () => {
    // Create a fresh adapter instance for each test
    sqliteAdapter = new SQLiteAdapter({
      databasePath: testDbPath,
      verbose: false
    });
  });

  describe('Database Connection', () => {
    it('should connect to SQLite database', async () => {
      await expect(sqliteAdapter.connect()).resolves.not.toThrow();
      expect(await sqliteAdapter.isConnected()).toBe(true);
    });

    it('should disconnect from SQLite database', async () => {
      await sqliteAdapter.connect();
      await expect(sqliteAdapter.disconnect()).resolves.not.toThrow();
      expect(await sqliteAdapter.isConnected()).toBe(false);
    });

    it('should check connection status', async () => {
      expect(await sqliteAdapter.isConnected()).toBe(false);
      await sqliteAdapter.connect();
      expect(await sqliteAdapter.isConnected()).toBe(true);
      await sqliteAdapter.disconnect();
      expect(await sqliteAdapter.isConnected()).toBe(false);
    });
  });

  describe('Database Operations', () => {
    beforeEach(async () => {
      await sqliteAdapter.connect();
    });

    afterEach(async () => {
      await sqliteAdapter.disconnect();
    });

    it('should create and drop tables', async () => {
      // Create a simple test table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER
        )
      `;

      await expect(sqliteAdapter.query(createTableSQL)).resolves.not.toThrow();

      // Verify table exists by inserting data
      const insertSQL = 'INSERT INTO test_table (name, value) VALUES (?, ?)';
      const result = await sqliteAdapter.run(insertSQL, ['test', 42]);
      expect(result.lastID).toBeDefined();

      // Query the data
      const selectSQL = 'SELECT * FROM test_table WHERE name = ?';
      const rows = await sqliteAdapter.query(selectSQL, ['test']);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('test');
      expect(rows[0].value).toBe(42);

      // Drop the table
      await expect(sqliteAdapter.query('DROP TABLE test_table')).resolves.not.toThrow();
    });

    it('should handle transactions', async () => {
      // Create test table
      await sqliteAdapter.query(`
        CREATE TABLE IF NOT EXISTS test_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `);

      // Start transaction
      const transaction = await sqliteAdapter.beginTransaction();

      try {
        // Insert data in transaction
        await sqliteAdapter.query(
          'INSERT INTO test_transactions (name) VALUES (?)',
          ['transaction_test'],
          transaction
        );

        // Commit transaction
        await sqliteAdapter.commitTransaction(transaction);

        // Verify data was committed
        const rows = await sqliteAdapter.query('SELECT * FROM test_transactions WHERE name = ?', ['transaction_test']);
        expect(rows).toHaveLength(1);
      } catch (error) {
        // Rollback on error
        await sqliteAdapter.rollbackTransaction(transaction);
        throw error;
      } finally {
        // Clean up
        await sqliteAdapter.query('DROP TABLE test_transactions');
      }
    });

    it('should handle query errors gracefully', async () => {
      // Try to query a non-existent table
      await expect(sqliteAdapter.query('SELECT * FROM non_existent_table')).rejects.toThrow();
    });
  });

  describe('Health Status', () => {
    it('should return healthy status when connected', async () => {
      await sqliteAdapter.connect();
      const health = await sqliteAdapter.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.database).toBe('sqlite');
      expect(health.connected).toBe(true);
      await sqliteAdapter.disconnect();
    });

    it('should return unhealthy status when disconnected', async () => {
      const health = await sqliteAdapter.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.database).toBe('sqlite');
      expect(health.connected).toBe(false);
    });
  });
});
