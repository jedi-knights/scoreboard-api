import { jest } from '@jest/globals';
import { Container, createContainer } from '../../src/container.js';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('should register a service factory', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory);
      
      expect(container.has('testService')).toBe(true);
    });

    it('should register a service as singleton by default', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory);
      
      const service1 = container.resolve('testService');
      const service2 = container.resolve('testService');
      
      expect(service1).toBe(service2);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should register a service as non-singleton when specified', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory, false);
      
      const service1 = container.resolve('testService');
      const service2 = container.resolve('testService');
      
      expect(service1).not.toBe(service2);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('resolve', () => {
    it('should resolve a registered service', () => {
      const mockService = { id: 'test' };
      const factory = jest.fn(() => mockService);
      container.register('testService', factory);
      
      const result = container.resolve('testService');
      
      expect(result).toBe(mockService);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.resolve('unregisteredService');
      }).toThrow('Service \'unregisteredService\' not registered');
    });

    it('should return same instance for singleton services', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory);
      
      const instance1 = container.resolve('testService');
      const instance2 = container.resolve('testService');
      
      expect(instance1).toBe(instance2);
    });

    it('should return new instance for non-singleton services', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory, false);
      
      const instance1 = container.resolve('testService');
      const instance2 = container.resolve('testService');
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('has', () => {
    it('should return true for registered service', () => {
      container.register('testService', jest.fn());
      expect(container.has('testService')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(container.has('unregisteredService')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered services and singletons', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory);
      
      // Resolve to create singleton
      container.resolve('testService');
      
      container.clear();
      
      expect(container.has('testService')).toBe(false);
      expect(() => container.resolve('testService')).toThrow();
    });
  });
});

describe('createContainer', () => {
  let mockDatabaseAdapter;

  beforeEach(() => {
    mockDatabaseAdapter = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(() => true),
      query: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      getHealthStatus: jest.fn(() => ({ status: 'healthy' })),
      createTables: jest.fn(),
      dropTables: jest.fn()
    };
  });

  it('should create a container with all required services', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    expect(container.has('gamesService')).toBe(true);
    expect(container.has('ncaaIngestionService')).toBe(true);
    expect(container.has('conferencesService')).toBe(true);
    expect(container.has('teamsService')).toBe(true);
  });

  it('should resolve games service', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    const gamesService = container.resolve('gamesService');
    expect(gamesService).toBeDefined();
    expect(typeof gamesService.getGames).toBe('function');
  });

  it('should resolve NCAA ingestion service', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    const ncaaIngestionService = container.resolve('ncaaIngestionService');
    expect(ncaaIngestionService).toBeDefined();
    expect(typeof ncaaIngestionService.ingestGame).toBe('function');
  });

  it('should resolve conferences service', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    const conferencesService = container.resolve('conferencesService');
    expect(conferencesService).toBeDefined();
  });

  it('should resolve teams service', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    const teamsService = container.resolve('teamsService');
    expect(teamsService).toBeDefined();
  });

  it('should create services as singletons', () => {
    const container = createContainer(mockDatabaseAdapter);
    
    const service1 = container.resolve('gamesService');
    const service2 = container.resolve('gamesService');
    
    expect(service1).toBe(service2);
  });
});
