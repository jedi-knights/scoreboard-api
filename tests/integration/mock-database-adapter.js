/**
 * Mock Database Adapter for Integration Tests
 * 
 * Provides a consistent database interface for integration tests
 * that can work with both real and mock databases.
 */

import { jest } from '@jest/globals';

/**
 * Mock Database Adapter for testing
 */
export class MockDatabaseAdapter {
  constructor(options = {}) {
    this.options = {
      delay: options.delay || 0,
      failRate: options.failRate || 0,
      data: options.data || {},
      ...options
    };
    
    this.connections = new Map();
    this.transactions = new Map();
    this.queryLog = [];
    this.isConnected = true;
  }

  /**
   * Connect to the database
   * @returns {Promise<boolean>}
   */
  async connect() {
    if (this.shouldFail()) {
      throw new Error('Connection failed');
    }
    
    await this.simulateDelay();
    this.isConnected = true;
    return true;
  }

  /**
   * Disconnect from the database
   * @returns {Promise<boolean>}
   */
  async disconnect() {
    await this.simulateDelay();
    this.isConnected = false;
    return true;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.isConnected;
  }

  /**
   * Execute a query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  async query(sql, params = []) {
    if (this.shouldFail()) {
      throw new Error('Query failed');
    }

    await this.simulateDelay();
    
    // Log the query
    this.queryLog.push({ sql, params, timestamp: new Date() });
    
    // Parse and execute the query
    return this.executeQuery(sql, params);
  }

  /**
   * Execute a query and return single result
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>}
   */
  async querySingle(sql, params = []) {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute a query and return affected rows count
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>}
   */
  async run(sql, params = []) {
    if (this.shouldFail()) {
      throw new Error('Query execution failed');
    }

    await this.simulateDelay();
    
    // Log the query
    this.queryLog.push({ sql, params, timestamp: new Date() });
    
    // Parse and execute the query
    const result = this.executeQuery(sql, params);
    
    return {
      lastID: result.insertId || 1,
      changes: result.affectedRows || 1,
      ...result
    };
  }

  /**
   * Begin a transaction
   * @returns {Promise<string>}
   */
  async beginTransaction() {
    if (this.shouldFail()) {
      throw new Error('Transaction failed to begin');
    }

    await this.simulateDelay();
    
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.transactions.set(transactionId, { status: 'active', queries: [] });
    
    return transactionId;
  }

  /**
   * Commit a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<boolean>}
   */
  async commitTransaction(transactionId) {
    if (this.shouldFail()) {
      throw new Error('Transaction failed to commit');
    }

    await this.simulateDelay();
    
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    transaction.status = 'committed';
    return true;
  }

  /**
   * Rollback a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<boolean>}
   */
  async rollbackTransaction(transactionId) {
    if (this.shouldFail()) {
      throw new Error('Transaction failed to rollback');
    }

    await this.simulateDelay();
    
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    transaction.status = 'rolled_back';
    return true;
  }

  /**
   * Execute a function within a transaction
   * @param {Function} callback - Function to execute
   * @returns {Promise<any>}
   */
  async executeTransaction(callback) {
    const transactionId = await this.beginTransaction();
    
    try {
      const result = await callback(transactionId);
      await this.commitTransaction(transactionId);
      return result;
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  /**
   * Batch insert multiple records
   * @param {Array} records - Records to insert
   * @param {string} table - Table name
   * @returns {Promise<Object>}
   */
  async batchInsert(records, table = 'games') {
    if (this.shouldFail()) {
      throw new Error('Batch insert failed');
    }

    await this.simulateDelay();
    
    const inserted = records.length;
    const failed = 0;
    
    // Log the batch operation
    this.queryLog.push({ 
      sql: `BATCH INSERT INTO ${table}`, 
      params: records, 
      timestamp: new Date() 
    });
    
    return { inserted, failed, table };
  }

  /**
   * Get health status
   * @returns {Object}
   */
  getHealthStatus() {
    return {
      status: this.isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      connections: this.connections.size,
      transactions: this.transactions.size,
      queryCount: this.queryLog.length
    };
  }

  /**
   * Create tables
   * @returns {Promise<boolean>}
   */
  async createTables() {
    if (this.shouldFail()) {
      throw new Error('Table creation failed');
    }

    await this.simulateDelay();
    
    // Mock table creation
    this.queryLog.push({ 
      sql: 'CREATE TABLES', 
      params: [], 
      timestamp: new Date() 
    });
    
    return true;
  }

  /**
   * Drop tables
   * @returns {Promise<boolean>}
   */
  async dropTables() {
    if (this.shouldFail()) {
      throw new Error('Table deletion failed');
    }

    await this.simulateDelay();
    
    // Mock table deletion
    this.queryLog.push({ 
      sql: 'DROP TABLES', 
      params: [], 
      timestamp: new Date() 
    });
    
    return true;
  }

  /**
   * Explain a query
   * @param {string} sql - SQL query to explain
   * @returns {Promise<Object>}
   */
  async explainQuery(sql) {
    await this.simulateDelay();
    
    return {
      plan: 'INDEX SCAN',
      cost: 0.5,
      rows: 100,
      width: 64,
      actual: {
        rows: 100,
        loops: 1,
        cost: 0.5
      }
    };
  }

  /**
   * Simulate connection error
   * @returns {Promise<void>}
   */
  async simulateConnectionError() {
    throw new Error('Connection failed');
  }

  /**
   * Simulate query timeout
   * @returns {Promise<void>}
   */
  async simulateQueryTimeout() {
    await new Promise(resolve => setTimeout(resolve, 10000));
    throw new Error('Query timeout');
  }

  /**
   * Simulate deadlock
   * @returns {Promise<void>}
   */
  async simulateDeadlock() {
    throw new Error('Deadlock detected');
  }

  /**
   * Query builder pattern support
   */
  select(fields = '*') {
    this.currentQuery = { type: 'select', fields, from: null, where: [], orderBy: [], limit: null, offset: null };
    return this;
  }

  from(table) {
    this.currentQuery.from = table;
    return this;
  }

  where(condition, ...params) {
    this.currentQuery.where.push({ condition, params });
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.currentQuery.orderBy.push({ field, direction });
    return this;
  }

  limit(count) {
    this.currentQuery.limit = count;
    return this;
  }

  offset(count) {
    this.currentQuery.offset = count;
    return this;
  }

  returning() {
    // Execute the built query
    const sql = this.buildQuery();
    return this.query(sql, this.currentQuery.params || []);
  }

  /**
   * Build SQL query from query builder
   * @returns {string}
   */
  buildQuery() {
    const query = this.currentQuery;
    let sql = `SELECT ${query.fields} FROM ${query.from}`;
    
    if (query.where.length > 0) {
      const whereClause = query.where.map(w => w.condition).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    
    if (query.orderBy.length > 0) {
      const orderClause = query.orderBy.map(o => `${o.field} ${o.direction}`).join(', ');
      sql += ` ORDER BY ${orderClause}`;
    }
    
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }
    
    return sql;
  }

  /**
   * Execute a parsed query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Array}
   */
  executeQuery(sql, params) {
    const upperSql = sql.toUpperCase();
    
    // Handle different query types
    if (upperSql.includes('SELECT')) {
      return this.handleSelect(sql, params);
    } else if (upperSql.includes('INSERT')) {
      return this.handleInsert(sql, params);
    } else if (upperSql.includes('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (upperSql.includes('DELETE')) {
      return this.handleDelete(sql, params);
    } else if (upperSql.includes('CREATE')) {
      return this.handleCreate(sql, params);
    } else if (upperSql.includes('DROP')) {
      return this.handleDrop(sql, params);
    }
    
    // Default response
    return [];
  }

  /**
   * Handle SELECT queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Array}
   */
  handleSelect(sql, params) {
    // Mock data based on the table being queried
    if (sql.includes('conferences')) {
      return [
        { id: 1, name: 'Test Conference', sport: 'basketball', division: 'd1' },
        { id: 2, name: 'Another Conference', sport: 'football', division: 'd2' }
      ];
    } else if (sql.includes('teams')) {
      return [
        { id: 1, name: 'Test Team', sport: 'basketball', division: 'd1' },
        { id: 2, name: 'Another Team', sport: 'football', division: 'd2' }
      ];
    } else if (sql.includes('games')) {
      return [
        { id: 1, game_id: 'game-1', sport: 'basketball', status: 'scheduled' },
        { id: 2, game_id: 'game-2', sport: 'football', status: 'live' }
      ];
    }
    
    return [];
  }

  /**
   * Handle INSERT queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object}
   */
  handleInsert(sql, params) {
    return {
      insertId: Date.now(),
      affectedRows: 1,
      rows: [{ id: Date.now() }]
    };
  }

  /**
   * Handle UPDATE queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object}
   */
  handleUpdate(sql, params) {
    return {
      affectedRows: 1,
      rows: []
    };
  }

  /**
   * Handle DELETE queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object}
   */
  handleDelete(sql, params) {
    return {
      affectedRows: 1,
      rows: []
    };
  }

  /**
   * Handle CREATE queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object}
   */
  handleCreate(sql, params) {
    return {
      affectedRows: 0,
      rows: []
    };
  }

  /**
   * Handle DROP queries
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object}
   */
  handleDrop(sql, params) {
    return {
      affectedRows: 0,
      rows: []
    };
  }

  /**
   * Check if operation should fail
   * @returns {boolean}
   */
  shouldFail() {
    return Math.random() < this.options.failRate;
  }

  /**
   * Simulate network delay
   * @returns {Promise<void>}
   */
  async simulateDelay() {
    if (this.options.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.options.delay));
    }
  }

  /**
   * Get query log
   * @returns {Array}
   */
  getQueryLog() {
    return [...this.queryLog];
  }

  /**
   * Clear query log
   */
  clearQueryLog() {
    this.queryLog = [];
  }

  /**
   * Reset the adapter state
   */
  reset() {
    this.connections.clear();
    this.transactions.clear();
    this.queryLog = [];
    this.isConnected = true;
    this.currentQuery = null;
  }
}

/**
 * Create a mock database adapter with specific options
 * @param {Object} options - Adapter options
 * @returns {MockDatabaseAdapter}
 */
export function createMockDatabaseAdapter(options = {}) {
  return new MockDatabaseAdapter(options);
}

/**
 * Create a mock database adapter that always fails
 * @returns {MockDatabaseAdapter}
 */
export function createFailingDatabaseAdapter() {
  return new MockDatabaseAdapter({ failRate: 1.0 });
}

/**
 * Create a mock database adapter with delays
 * @param {number} delay - Delay in milliseconds
 * @returns {MockDatabaseAdapter}
 */
export function createSlowDatabaseAdapter(delay = 100) {
  return new MockDatabaseAdapter({ delay });
}
