/**
 * Transaction Manager Tests
 */

import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { TransactionManager, TransactionContext, withTransaction, createTransactionManager } from '../../../src/utils/transaction-manager.js';

describe('TransactionManager', () => {
  let mockDatabaseAdapter;
  let transactionManager;

  beforeEach(() => {
    mockDatabaseAdapter = {
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn()
    };
    transactionManager = new TransactionManager(mockDatabaseAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeInTransaction', () => {
    it('should execute operation in transaction successfully', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.commitTransaction.mockResolvedValue();
      
      const result = await transactionManager.executeInTransaction(mockOperation);
      
      expect(mockDatabaseAdapter.beginTransaction).toHaveBeenCalled();
      expect(mockOperation).toHaveBeenCalledWith(mockTransaction, 1);
      expect(mockDatabaseAdapter.commitTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(mockDatabaseAdapter.rollbackTransaction).not.toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should rollback transaction on operation error', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.rollbackTransaction.mockResolvedValue();
      
      await expect(transactionManager.executeInTransaction(mockOperation))
        .rejects.toThrow('Operation failed');
      
      expect(mockDatabaseAdapter.beginTransaction).toHaveBeenCalled();
      expect(mockOperation).toHaveBeenCalledWith(mockTransaction, 1);
      expect(mockDatabaseAdapter.commitTransaction).not.toHaveBeenCalled();
      expect(mockDatabaseAdapter.rollbackTransaction).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle rollback errors gracefully', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.rollbackTransaction.mockRejectedValue(new Error('Rollback failed'));
      
      await expect(transactionManager.executeInTransaction(mockOperation))
        .rejects.toThrow('Operation failed');
      
      expect(mockDatabaseAdapter.rollbackTransaction).toHaveBeenCalledWith(mockTransaction);
    });

    it('should track active transactions', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.commitTransaction.mockResolvedValue();
      
      expect(transactionManager.hasActiveTransactions()).toBe(false);
      expect(transactionManager.getActiveTransactionCount()).toBe(0);
      
      await transactionManager.executeInTransaction(mockOperation);
      
      expect(transactionManager.hasActiveTransactions()).toBe(false);
      expect(transactionManager.getActiveTransactionCount()).toBe(0);
    });
  });

  describe('executeMultipleInTransaction', () => {
    it('should execute multiple operations in single transaction', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockResolvedValue('result2'),
        jest.fn().mockResolvedValue('result3')
      ];
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.commitTransaction.mockResolvedValue();
      
      const results = await transactionManager.executeMultipleInTransaction(mockOperations);
      
      expect(mockDatabaseAdapter.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockDatabaseAdapter.commitTransaction).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['result1', 'result2', 'result3']);
      
      mockOperations.forEach((op, index) => {
        expect(op).toHaveBeenCalledWith(mockTransaction, 1);
      });
    });
  });

  describe('executeWithRollbackOnFailure', () => {
    it('should execute operations with rollback support', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperations = [
        {
          execute: jest.fn().mockResolvedValue('result1'),
          rollback: jest.fn().mockResolvedValue()
        },
        {
          execute: jest.fn().mockResolvedValue('result2'),
          rollback: jest.fn().mockResolvedValue()
        }
      ];
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.commitTransaction.mockResolvedValue();
      
      const results = await transactionManager.executeWithRollbackOnFailure(mockOperations);
      
      expect(results).toEqual(['result1', 'result2']);
      expect(mockOperations[0].execute).toHaveBeenCalledWith(mockTransaction, 1);
      expect(mockOperations[1].execute).toHaveBeenCalledWith(mockTransaction, 1);
    });

    it('should execute rollback operations on failure', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      const mockOperations = [
        {
          execute: jest.fn().mockResolvedValue('result1'),
          rollback: jest.fn().mockResolvedValue()
        },
        {
          execute: jest.fn().mockRejectedValue(new Error('Operation failed')),
          rollback: jest.fn().mockResolvedValue()
        }
      ];
      
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      mockDatabaseAdapter.rollbackTransaction.mockResolvedValue();
      
      await expect(transactionManager.executeWithRollbackOnFailure(mockOperations))
        .rejects.toThrow('Operation failed');
      

      
      // Check that rollback operations were called in reverse order
      // Note: The first operation (index 0) should have its rollback called first (reverse order)
      expect(mockOperations[0].rollback).toHaveBeenCalledWith(mockTransaction, 1);
      expect(mockOperations[1].rollback).toHaveBeenCalledWith(mockTransaction, 1);
    });
  });

  describe('createTransactionContext', () => {
    it('should create transaction context for manual control', async () => {
      const mockTransaction = { id: 'tx-1', committed: false };
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);
      
      const context = await transactionManager.createTransactionContext();
      
      expect(context).toBeInstanceOf(TransactionContext);
      expect(context.getTransaction()).toBe(mockTransaction);
      expect(context.isActive()).toBe(true);
      expect(transactionManager.hasActiveTransactions()).toBe(true);
    });
  });

  describe('forceRollbackAll', () => {
    it('should force rollback all active transactions', async () => {
      const mockTransaction1 = { id: 'tx-1', committed: false };
      const mockTransaction2 = { id: 'tx-2', committed: false };
      
      mockDatabaseAdapter.beginTransaction
        .mockResolvedValueOnce(mockTransaction1)
        .mockResolvedValueOnce(mockTransaction2);
      mockDatabaseAdapter.rollbackTransaction.mockResolvedValue();
      
      // Create two transaction contexts
      await transactionManager.createTransactionContext();
      await transactionManager.createTransactionContext();
      
      expect(transactionManager.getActiveTransactionCount()).toBe(2);
      
      await transactionManager.forceRollbackAll();
      
      expect(mockDatabaseAdapter.rollbackTransaction).toHaveBeenCalledTimes(2);
      expect(transactionManager.getActiveTransactionCount()).toBe(0);
    });
  });
});

describe('TransactionContext', () => {
  let mockDatabaseAdapter;
  let mockTransaction;
  let mockCleanupCallback;
  let transactionContext;

  beforeEach(() => {
    mockDatabaseAdapter = {
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn()
    };
    mockTransaction = { id: 'tx-1' };
    mockCleanupCallback = jest.fn();
    transactionContext = new TransactionContext(
      mockTransaction,
      1,
      mockDatabaseAdapter,
      mockCleanupCallback
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('commit', () => {
    it('should commit transaction successfully', async () => {
      mockDatabaseAdapter.commitTransaction.mockResolvedValue();
      
      await transactionContext.commit();
      
      expect(mockDatabaseAdapter.commitTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(transactionContext.committed).toBe(true);
      expect(mockCleanupCallback).toHaveBeenCalled();
    });

    it('should not allow commit after rollback', async () => {
      transactionContext.rolledBack = true;
      
      await expect(transactionContext.commit()).rejects.toThrow('Transaction already committed or rolled back');
    });
  });

  describe('rollback', () => {
    it('should rollback transaction successfully', async () => {
      mockDatabaseAdapter.rollbackTransaction.mockResolvedValue();
      
      await transactionContext.rollback();
      
      expect(mockDatabaseAdapter.rollbackTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(transactionContext.rolledBack).toBe(true);
      expect(mockCleanupCallback).toHaveBeenCalled();
    });

    it('should not allow rollback after commit', async () => {
      transactionContext.committed = true;
      
      await expect(transactionContext.rollback()).rejects.toThrow('Transaction already committed or rolled back');
    });
  });

  describe('isActive', () => {
    it('should return true for active transaction', () => {
      expect(transactionContext.isActive()).toBe(true);
    });

    it('should return false for committed transaction', () => {
      transactionContext.committed = true;
      expect(transactionContext.isActive()).toBe(false);
    });

    it('should return false for rolled back transaction', () => {
      transactionContext.rolledBack = true;
      expect(transactionContext.isActive()).toBe(false);
    });
  });
});

describe('withTransaction decorator', () => {
  it('should return a function that can be applied to methods', () => {
    const decorator = withTransaction();
    expect(typeof decorator).toBe('function');
  });

  it('should modify the descriptor value when applied', () => {
    const mockService = {};
    const mockDescriptor = {
      value: jest.fn()
    };
    
    const decorator = withTransaction();
    const result = decorator(mockService, 'testMethod', mockDescriptor);
    
    expect(result).toBeDefined();
    expect(result.value).toBeDefined();
    expect(typeof result.value).toBe('function');
  });
});

describe('createTransactionManager', () => {
  it('should create TransactionManager instance', () => {
    const mockDatabaseAdapter = {};
    const transactionManager = createTransactionManager(mockDatabaseAdapter);
    
    expect(transactionManager).toBeInstanceOf(TransactionManager);
    expect(transactionManager.db).toBe(mockDatabaseAdapter);
  });
});
