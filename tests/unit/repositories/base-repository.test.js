import { jest } from '@jest/globals';
import { BaseRepository } from '../../../src/database/repositories/base-repository.js';

// Create a concrete implementation for testing
class TestRepository extends BaseRepository {
  async findAll(filters = {}, options = {}) {
    return this.db.query('SELECT * FROM test', []);
  }

  async findById(id) {
    return this.db.get('SELECT * FROM test WHERE id = ?', [id]);
  }

  async findOne(criteria) {
    return this.db.get('SELECT * FROM test WHERE name = ?', [criteria.name]);
  }

  async create(data) {
    return this.db.run('INSERT INTO test (name) VALUES (?)', [data.name]);
  }

  async update(id, data) {
    return this.db.run('UPDATE test SET name = ? WHERE id = ?', [data.name, id]);
  }

  async delete(id) {
    return this.db.run('DELETE FROM test WHERE id = ?', [id]);
  }

  async count(filters = {}) {
    return this.db.get('SELECT COUNT(*) as count FROM test', []);
  }

  async exists(criteria) {
    return this.db.get('SELECT COUNT(*) as count FROM test WHERE name = ?', [criteria.name]);
  }
}

describe('BaseRepository', () => {
  let repository;
  let mockDatabaseAdapter;

  beforeEach(() => {
    // Create mock database adapter
    mockDatabaseAdapter = {
      query: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn()
    };

    // Create repository instance
    repository = new TestRepository(mockDatabaseAdapter);
  });

  describe('Constructor', () => {
    it('should create a repository instance with database adapter', () => {
      expect(repository).toBeInstanceOf(TestRepository);
      expect(repository).toBeInstanceOf(BaseRepository);
      expect(repository.db).toBe(mockDatabaseAdapter);
    });

    it('should throw error when trying to instantiate BaseRepository directly', () => {
      expect(() => new BaseRepository(mockDatabaseAdapter)).toThrow(
        'BaseRepository is an abstract class and cannot be instantiated directly'
      );
    });
  });

  describe('executeQuery', () => {
    it('should execute a query and return results', async () => {
      const mockResults = [{ id: 1, name: 'Test 1' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockResults);

      const result = await repository.executeQuery('SELECT * FROM test', ['param1']);

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith('SELECT * FROM test', ['param1']);
      expect(result).toEqual(mockResults);
    });

    it('should execute a query with no parameters', async () => {
      const mockResults = [{ id: 1, name: 'Test 1' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockResults);

      const result = await repository.executeQuery('SELECT * FROM test');

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(result).toEqual(mockResults);
    });
  });

  describe('executeQuerySingle', () => {
    it('should execute a query for single result', async () => {
      const mockResult = { id: 1, name: 'Test 1' };
      mockDatabaseAdapter.get.mockResolvedValue(mockResult);

      const result = await repository.executeQuerySingle('SELECT * FROM test WHERE id = ?', [1]);

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should return null when no result found', async () => {
      mockDatabaseAdapter.get.mockResolvedValue(null);

      const result = await repository.executeQuerySingle('SELECT * FROM test WHERE id = ?', [999]);

      expect(result).toBeNull();
    });
  });

  describe('executeQueryRun', () => {
    it('should execute a query that does not return results', async () => {
      const mockResult = { changes: 1, lastID: 5 };
      mockDatabaseAdapter.run.mockResolvedValue(mockResult);

      const result = await repository.executeQueryRun('INSERT INTO test (name) VALUES (?)', ['Test']);

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith('INSERT INTO test (name) VALUES (?)', ['Test']);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Transaction Methods', () => {
    it('should begin a transaction', async () => {
      const mockTransaction = { id: 'tx-123' };
      mockDatabaseAdapter.beginTransaction.mockResolvedValue(mockTransaction);

      const result = await repository.beginTransaction();

      expect(mockDatabaseAdapter.beginTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('should commit a transaction', async () => {
      const mockTransaction = { id: 'tx-123' };
      mockDatabaseAdapter.commitTransaction.mockResolvedValue(undefined);

      await repository.commitTransaction(mockTransaction);

      expect(mockDatabaseAdapter.commitTransaction).toHaveBeenCalledWith(mockTransaction);
    });

    it('should rollback a transaction', async () => {
      const mockTransaction = { id: 'tx-123' };
      mockDatabaseAdapter.rollbackTransaction.mockResolvedValue(undefined);

      await repository.rollbackTransaction(mockTransaction);

      expect(mockDatabaseAdapter.rollbackTransaction).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('Concrete Implementation Methods', () => {
    it('should implement findAll method', async () => {
      const mockResults = [{ id: 1, name: 'Test 1' }];
      mockDatabaseAdapter.query.mockResolvedValue(mockResults);

      const result = await repository.findAll({ status: 'active' }, { limit: 10 });

      expect(mockDatabaseAdapter.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(result).toEqual(mockResults);
    });

    it('should implement findById method', async () => {
      const mockResult = { id: 1, name: 'Test 1' };
      mockDatabaseAdapter.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should implement findOne method', async () => {
      const mockResult = { id: 1, name: 'Test 1' };
      mockDatabaseAdapter.get.mockResolvedValue(mockResult);

      const result = await repository.findOne({ name: 'Test 1' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith('SELECT * FROM test WHERE name = ?', ['Test 1']);
      expect(result).toEqual(mockResult);
    });

    it('should implement create method', async () => {
      const mockResult = { changes: 1, lastID: 5 };
      mockDatabaseAdapter.run.mockResolvedValue(mockResult);

      const result = await repository.create({ name: 'Test 1' });

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith('INSERT INTO test (name) VALUES (?)', ['Test 1']);
      expect(result).toEqual(mockResult);
    });

    it('should implement update method', async () => {
      const mockResult = { changes: 1 };
      mockDatabaseAdapter.run.mockResolvedValue(mockResult);

      const result = await repository.update(1, { name: 'Updated Test' });

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith('UPDATE test SET name = ? WHERE id = ?', ['Updated Test', 1]);
      expect(result).toEqual(mockResult);
    });

    it('should implement delete method', async () => {
      const mockResult = { changes: 1 };
      mockDatabaseAdapter.run.mockResolvedValue(mockResult);

      const result = await repository.delete(1);

      expect(mockDatabaseAdapter.run).toHaveBeenCalledWith('DELETE FROM test WHERE id = ?', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should implement count method', async () => {
      const mockResult = { count: 5 };
      mockDatabaseAdapter.get.mockResolvedValue(mockResult);

      const result = await repository.count({ status: 'active' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM test', []);
      expect(result).toEqual(mockResult);
    });

    it('should implement exists method', async () => {
      const mockResult = { count: 1 };
      mockDatabaseAdapter.get.mockResolvedValue(mockResult);

      const result = await repository.exists({ name: 'Test 1' });

      expect(mockDatabaseAdapter.get).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM test WHERE name = ?', ['Test 1']);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Error Handling', () => {
    it('should handle database query errors', async () => {
      const error = new Error('Database connection failed');
      mockDatabaseAdapter.query.mockRejectedValue(error);

      await expect(repository.executeQuery('SELECT * FROM test')).rejects.toThrow('Database connection failed');
    });

    it('should handle database get errors', async () => {
      const error = new Error('Database connection failed');
      mockDatabaseAdapter.get.mockRejectedValue(error);

      await expect(repository.executeQuerySingle('SELECT * FROM test WHERE id = ?', [1])).rejects.toThrow('Database connection failed');
    });

    it('should handle database run errors', async () => {
      const error = new Error('Database connection failed');
      mockDatabaseAdapter.run.mockRejectedValue(error);

      await expect(repository.executeQueryRun('INSERT INTO test (name) VALUES (?)', ['Test'])).rejects.toThrow('Database connection failed');
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction failed');
      mockDatabaseAdapter.beginTransaction.mockRejectedValue(error);

      await expect(repository.beginTransaction()).rejects.toThrow('Transaction failed');
    });
  });

  describe('Method Signatures', () => {
    it('should have all required abstract methods', () => {
      expect(typeof repository.findAll).toBe('function');
      expect(typeof repository.findById).toBe('function');
      expect(typeof repository.findOne).toBe('function');
      expect(typeof repository.create).toBe('function');
      expect(typeof repository.update).toBe('function');
      expect(typeof repository.delete).toBe('function');
      expect(typeof repository.count).toBe('function');
      expect(typeof repository.exists).toBe('function');
    });

    it('should have all utility methods', () => {
      expect(typeof repository.executeQuery).toBe('function');
      expect(typeof repository.executeQuerySingle).toBe('function');
      expect(typeof repository.executeQueryRun).toBe('function');
      expect(typeof repository.beginTransaction).toBe('function');
      expect(typeof repository.commitTransaction).toBe('function');
      expect(typeof repository.rollbackTransaction).toBe('function');
    });
  });
});
