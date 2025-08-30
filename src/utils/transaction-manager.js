/**
 * Transaction Manager Utility
 *
 * Provides a clean interface for managing database transactions with automatic
 * rollback on errors and support for nested transactions.
 */

import logger from './logger.js';

/**
 * Transaction Manager Class
 * Handles database transactions with automatic error handling and rollback
 */
export class TransactionManager {
  constructor (databaseAdapter) {
    this.db = databaseAdapter;
    this.activeTransactions = new Map();
    this.transactionCounter = 0;
  }

  /**
   * Execute a function within a transaction
   * @param {Function} operation - Function to execute within transaction
   * @param {Object} options - Transaction options
   * @returns {Promise<any>} Result of the operation
   */
  async executeInTransaction (operation, options = {}) {
    const transactionId = ++this.transactionCounter;
    let transaction = null;

    try {
      transaction = await this.beginTransaction(transactionId, operation, options);
      const result = await this.executeOperation(operation, transaction, transactionId);
      await this.commitTransaction(transaction, transactionId, operation);
      return result;

    } catch (error) {
      await this.handleTransactionError(error, transaction, transactionId, operation);
      throw error;
    }
  }

  /**
   * Begin a new transaction
   * @param {number} transactionId - Transaction ID
   * @param {Function} operation - Operation function
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction object
   * @private
   */
  async beginTransaction (transactionId, operation, options) {
    const transaction = await this.db.beginTransaction();
    this.activeTransactions.set(transactionId, transaction);

    logger.debug('Transaction started', {
      transactionId,
      operation: operation.name || 'anonymous',
      options
    });

    return transaction;
  }

  /**
   * Execute the operation within the transaction
   * @param {Function} operation - Operation function
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<any>} Operation result
   * @private
   */
  async executeOperation (operation, transaction, transactionId) {
    return await operation(transaction, transactionId);
  }

  /**
   * Commit the transaction
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {Function} operation - Operation function
   * @private
   */
  async commitTransaction (transaction, transactionId, operation) {
    await this.db.commitTransaction(transaction);
    this.activeTransactions.delete(transactionId);

    logger.debug('Transaction committed successfully', {
      transactionId,
      operation: operation.name || 'anonymous'
    });
  }

  /**
   * Handle transaction errors and rollback
   * @param {Error} error - Error that occurred
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {Function} operation - Operation function
   * @private
   */
  async handleTransactionError (error, transaction, transactionId, operation) {
    if (transaction) {
      try {
        await this.db.rollbackTransaction(transaction);
        this.activeTransactions.delete(transactionId);

        logger.warn('Transaction rolled back due to error', {
          transactionId,
          operation: operation.name || 'anonymous',
          error: error.message
        });
      } catch (rollbackError) {
        logger.error('Failed to rollback transaction', {
          transactionId,
          operation: operation.name || 'anonymous',
          originalError: error.message,
          rollbackError: rollbackError.message
        });
      }
    }
  }

  /**
   * Execute multiple operations in a single transaction
   * @param {Array<Function>} operations - Array of operations to execute
   * @param {Object} options - Transaction options
   * @returns {Promise<Array>} Results of all operations
   */
  async executeMultipleInTransaction (operations, options = {}) {
    return this.executeInTransaction(
      this.createMultipleOperationsExecutor(operations),
      options
    );
  }

  /**
   * Create a function to execute multiple operations
   * @param {Array<Function>} operations - Array of operations to execute
   * @returns {Function} Function that executes multiple operations
   * @private
   */
  createMultipleOperationsExecutor (operations) {
    return async (transaction, transactionId) => {
      const results = [];

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const result = await this.executeSingleOperation(operation, transaction, transactionId, i);
        results.push(result);
      }

      return results;
    };
  }

  /**
   * Execute a single operation within a transaction
   * @param {Function} operation - Operation to execute
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {number} operationIndex - Index of the operation
   * @returns {Promise<any>} Operation result
   * @private
   */
  async executeSingleOperation (operation, transaction, transactionId, operationIndex) {
    logger.debug('Executing operation in transaction', {
      transactionId,
      operationIndex,
      operationName: operation.name || 'anonymous'
    });

    return await operation(transaction, transactionId);
  }

  /**
   * Execute operations with rollback on any failure
   * @param {Array<Function>} operations - Array of operations to execute
   * @param {Object} options - Transaction options
   * @returns {Promise<Array>} Results of all operations
   */
  async executeWithRollbackOnFailure (operations, options = {}) {
    return this.executeInTransaction(
      this.createRollbackOperationsExecutor(operations),
      options
    );
  }

  /**
   * Create a function to execute operations with rollback support
   * @param {Array<Function>} operations - Array of operations to execute
   * @returns {Function} Function that executes operations with rollback
   * @private
   */
  createRollbackOperationsExecutor (operations) {
    return async (transaction, transactionId) => {
      const results = [];
      const rollbackOperations = [];

      try {
        await this.executeOperationsWithRollback(operations, transaction, transactionId, results, rollbackOperations);
        return results;
      } catch (error) {
        await this.handleRollbackFailure(operations, transaction, transactionId, error, rollbackOperations);
        throw error;
      }
    };
  }

  /**
   * Execute operations and collect rollback operations
   * @param {Array<Function>} operations - Array of operations to execute
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {Array} results - Array to store results
   * @param {Array} rollbackOperations - Array to store rollback operations
   * @private
   */
  async executeOperationsWithRollback (operations, transaction, transactionId, results, rollbackOperations) {
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const rollbackOperation = operation.rollback;

      logger.debug('Executing operation with rollback support', {
        transactionId,
        operationIndex: i,
        operationName: operation.name || 'anonymous'
      });

      const result = await operation.execute(transaction, transactionId);
      results.push(result);

      if (rollbackOperation) {
        rollbackOperations.unshift(rollbackOperation);
      }
    }
  }

  /**
   * Handle rollback failure by collecting and executing rollback operations
   * @param {Array<Function>} operations - Array of operations
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {Error} error - Error that occurred
   * @param {Array} rollbackOperations - Array of rollback operations
   * @private
   */
  async handleRollbackFailure (operations, transaction, transactionId, error, rollbackOperations) {
    this.collectAllRollbackOperations(operations, rollbackOperations);
    await this.executeRollbackOperations(transaction, transactionId, error, rollbackOperations);
  }

  /**
   * Collect rollback operations for all operations
   * @param {Array<Function>} operations - Array of operations
   * @param {Array} rollbackOperations - Array to store rollback operations
   * @private
   */
  collectAllRollbackOperations (operations, rollbackOperations) {
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const rollbackOperation = operation.rollback;
      if (rollbackOperation) {
        rollbackOperations.unshift(rollbackOperation);
      }
    }
  }

  /**
   * Execute rollback operations in reverse order
   * @param {Object} transaction - Transaction object
   * @param {number} transactionId - Transaction ID
   * @param {Error} error - Error that occurred
   * @param {Array} rollbackOperations - Array of rollback operations
   * @private
   */
  async executeRollbackOperations (transaction, transactionId, error, rollbackOperations) {
    logger.warn('Executing rollback operations due to failure', {
      transactionId,
      error: error.message,
      rollbackOperationsCount: rollbackOperations.length
    });

    for (const rollbackOp of rollbackOperations) {
      try {
        await rollbackOp(transaction, transactionId);
      } catch (rollbackError) {
        logger.error('Rollback operation failed', {
          transactionId,
          rollbackOperation: rollbackOp.name || 'anonymous',
          error: rollbackError.message
        });
      }
    }
  }

  /**
   * Check if there are any active transactions
   * @returns {boolean} True if there are active transactions
   */
  hasActiveTransactions () {
    return this.activeTransactions.size > 0;
  }

  /**
   * Get count of active transactions
   * @returns {number} Number of active transactions
   */
  getActiveTransactionCount () {
    return this.activeTransactions.size;
  }

  /**
   * Force rollback of all active transactions (for cleanup)
   * @returns {Promise<void>}
   */
  async forceRollbackAll () {
    if (this.activeTransactions.size === 0) {
      return;
    }

    logger.warn('Force rolling back all active transactions', {
      activeTransactionsCount: this.activeTransactions.size
    });

    const rollbackPromises = Array.from(this.activeTransactions.entries()).map(
      async ([transactionId, transaction]) => {
        try {
          await this.db.rollbackTransaction(transaction);
          this.activeTransactions.delete(transactionId);

          logger.debug('Transaction force rolled back', { transactionId });
        } catch (error) {
          logger.error('Failed to force rollback transaction', {
            transactionId,
            error: error.message
          });
        }
      }
    );

    await Promise.allSettled(rollbackPromises);
  }

  /**
   * Create a transaction context for manual transaction management
   * @returns {Promise<TransactionContext>} Transaction context object
   */
  async createTransactionContext () {
    const transaction = await this.db.beginTransaction();
    const transactionId = ++this.transactionCounter;

    this.activeTransactions.set(transactionId, transaction);

    return new TransactionContext(
      transaction,
      transactionId,
      this.db,
      () => this.activeTransactions.delete(transactionId)
    );
  }
}

/**
 * Transaction Context Class
 * Provides manual transaction control for complex scenarios
 */
export class TransactionContext {
  constructor (transaction, transactionId, databaseAdapter, cleanupCallback) {
    this.transaction = transaction;
    this.transactionId = transactionId;
    this.db = databaseAdapter;
    this.cleanupCallback = cleanupCallback;
    this.committed = false;
    this.rolledBack = false;
  }

  /**
   * Commit the transaction
   * @returns {Promise<void>}
   */
  async commit () {
    if (this.committed || this.rolledBack) {
      throw new Error('Transaction already committed or rolled back');
    }

    await this.db.commitTransaction(this.transaction);
    this.committed = true;
    this.cleanupCallback();

    logger.debug('Transaction context committed', { transactionId: this.transactionId });
  }

  /**
   * Rollback the transaction
   * @returns {Promise<void>}
   */
  async rollback () {
    if (this.committed || this.rolledBack) {
      throw new Error('Transaction already committed or rolled back');
    }

    await this.db.rollbackTransaction(this.transaction);
    this.rolledBack = true;
    this.cleanupCallback();

    logger.debug('Transaction context rolled back', { transactionId: this.transactionId });
  }

  /**
   * Get the transaction object for database operations
   * @returns {Object} Transaction object
   */
  getTransaction () {
    return this.transaction;
  }

  /**
   * Check if transaction is still active
   * @returns {boolean} True if transaction is active
   */
  isActive () {
    return !this.committed && !this.rolledBack;
  }
}

/**
 * Transaction decorator for service methods
 * Automatically wraps method execution in a transaction
 * @param {Object} options - Transaction options
 * @returns {Function} Decorator function
 */
export function withTransaction (options = {}) {
  return function (target, propertyName, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      // Check if this service has a transaction manager
      if (!this.transactionManager) {
        throw new Error(`Service ${this.constructor.name} must have a transactionManager property`);
      }

      return this.transactionManager.executeInTransaction(
        async (transaction, transactionId) => {
          // Add transaction to the method context
          const methodContext = {
            ...this,
            currentTransaction: transaction,
            currentTransactionId: transactionId
          };

          // Bind the method to the context and execute
          return originalMethod.apply(methodContext, args);
        },
        options
      );
    };

    return descriptor;
  };
}

/**
 * Create a transaction manager instance
 * @param {Object} databaseAdapter - Database adapter instance
 * @returns {TransactionManager} Transaction manager instance
 */
export function createTransactionManager (databaseAdapter) {
  return new TransactionManager(databaseAdapter);
}
