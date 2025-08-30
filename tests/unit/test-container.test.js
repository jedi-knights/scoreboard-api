import { jest } from '@jest/globals';
import { TestContainer } from '../../src/test-container.js';

describe('TestContainer', () => {
  let container;

  beforeEach(() => {
    container = new TestContainer();
  });

  describe('mockService', () => {
    it('should mock a service with custom implementation', () => {
      const mockService = { testMethod: jest.fn() };
      container.mockService('testService', mockService);
      
      const resolved = container.resolve('testService');
      expect(resolved).toBe(mockService);
    });

    it('should override existing service registration', () => {
      const originalService = { original: true };
      const mockService = { mocked: true };
      
      container.register('testService', () => originalService);
      container.mockService('testService', mockService);
      
      const resolved = container.resolve('testService');
      expect(resolved).toBe(mockService);
      expect(resolved).not.toBe(originalService);
    });
  });

  describe('mockServices', () => {
    it('should mock multiple services at once', () => {
      const mocks = {
        service1: { id: 'service1' },
        service2: { id: 'service2' },
        service3: { id: 'service3' }
      };
      
      container.mockServices(mocks);
      
      expect(container.resolve('service1')).toBe(mocks.service1);
      expect(container.resolve('service2')).toBe(mocks.service2);
      expect(container.resolve('service3')).toBe(mocks.service3);
    });
  });

  describe('createMockService', () => {
    it('should create a mock service with jest.fn() methods', () => {
      const methods = {
        method1: () => 'result1',
        method2: () => 'result2'
      };
      
      const mockService = TestContainer.createMockService(methods);
      
      expect(mockService.method1).toBeDefined();
      expect(mockService.method2).toBeDefined();
      expect(typeof mockService.method1).toBe('function');
      expect(typeof mockService.method2).toBe('function');
    });

    it('should create empty mock service when no methods provided', () => {
      const mockService = TestContainer.createMockService();
      
      expect(mockService).toBeDefined();
      expect(typeof mockService).toBe('object');
      expect(Object.keys(mockService)).toHaveLength(0);
    });

    it('should create mock service with custom method implementations', () => {
      const customMethod = jest.fn(() => 'custom result');
      const methods = { customMethod };
      
      const mockService = TestContainer.createMockService(methods);
      
      expect(mockService.customMethod).toBe(customMethod);
    });
  });

  describe('createMockDatabaseAdapter', () => {
    it('should create a mock database adapter with all required methods', () => {
      const mockAdapter = TestContainer.createMockDatabaseAdapter();
      
      expect(mockAdapter.connect).toBeDefined();
      expect(mockAdapter.disconnect).toBeDefined();
      expect(mockAdapter.isConnected).toBeDefined();
      expect(mockAdapter.query).toBeDefined();
      expect(mockAdapter.get).toBeDefined();
      expect(mockAdapter.run).toBeDefined();
      expect(mockAdapter.beginTransaction).toBeDefined();
      expect(mockAdapter.commitTransaction).toBeDefined();
      expect(mockAdapter.rollbackTransaction).toBeDefined();
      expect(mockAdapter.getHealthStatus).toBeDefined();
      expect(mockAdapter.createTables).toBeDefined();
      expect(mockAdapter.dropTables).toBeDefined();
    });

    it('should have isConnected return true by default', () => {
      const mockAdapter = TestContainer.createMockDatabaseAdapter();
      
      expect(mockAdapter.isConnected()).toBe(true);
    });

    it('should have getHealthStatus return healthy status by default', () => {
      const mockAdapter = TestContainer.createMockDatabaseAdapter();
      
      expect(mockAdapter.getHealthStatus()).toEqual({ status: 'healthy' });
    });

    it('should have all methods as functions', () => {
      const mockAdapter = TestContainer.createMockDatabaseAdapter();
      
      // Verify all methods are functions
      expect(typeof mockAdapter.connect).toBe('function');
      expect(typeof mockAdapter.disconnect).toBe('function');
      expect(typeof mockAdapter.query).toBe('function');
      expect(typeof mockAdapter.get).toBe('function');
      expect(typeof mockAdapter.run).toBe('function');
      expect(typeof mockAdapter.beginTransaction).toBe('function');
      expect(typeof mockAdapter.commitTransaction).toBe('function');
      expect(typeof mockAdapter.rollbackTransaction).toBe('function');
      expect(typeof mockAdapter.getHealthStatus).toBe('function');
      expect(typeof mockAdapter.createTables).toBe('function');
      expect(typeof mockAdapter.dropTables).toBe('function');
    });
  });

  describe('inheritance from Container', () => {
    it('should inherit all Container methods', () => {
      expect(typeof container.register).toBe('function');
      expect(typeof container.resolve).toBe('function');
      expect(typeof container.has).toBe('function');
      expect(typeof container.clear).toBe('function');
    });

    it('should work as a regular container', () => {
      const factory = jest.fn(() => ({ id: 'test' }));
      container.register('testService', factory);
      
      expect(container.has('testService')).toBe(true);
      
      const service = container.resolve('testService');
      expect(service).toEqual({ id: 'test' });
    });
  });
});
