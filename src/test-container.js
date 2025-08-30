/* global jest */
import { Container } from './container.js';

/**
 * Test Container
 *
 * Extends the main Container class to provide easy mocking capabilities for testing.
 * This allows tests to easily replace real services with mock implementations.
 */
export class TestContainer extends Container {
  constructor () {
    super();
  }

  /**
   * Mock a service with a custom implementation
   * @param {string} name - Service name to mock
   * @param {Object} mockImplementation - Mock service implementation
   */
  mockService (name, mockImplementation) {
    this.register(name, () => mockImplementation, true);
  }

  /**
   * Mock multiple services at once
   * @param {Object} mocks - Object mapping service names to mock implementations
   */
  mockServices (mocks) {
    Object.entries(mocks).forEach(([name, mock]) => {
      this.mockService(name, mock);
    });
  }

  /**
   * Create a mock service with common methods
   * @param {Object} methods - Methods to include in the mock
   * @returns {Object} Mock service with jest.fn() for each method
   */
  static createMockService (methods = {}) {
    const mock = {};
    Object.keys(methods).forEach(key => {
      // Check if jest is available (for testing context)
      if (typeof jest !== 'undefined' && jest.fn) {
        mock[key] = jest.fn(methods[key]);
      } else {
        // Fallback for non-testing context
        mock[key] = methods[key];
      }
    });
    return mock;
  }

  /**
   * Create a mock database adapter
   * @returns {Object} Mock database adapter
   */
  static createMockDatabaseAdapter () {
    const createMockFn = (returnValue) => {
      if (typeof jest !== 'undefined' && jest.fn) {
        if (returnValue !== undefined) {
          return jest.fn(() => returnValue);
        } else {
          return jest.fn();
        }
      } else {
        // Fallback for non-testing context
        if (returnValue !== undefined) {
          return () => returnValue;
        } else {
          return () => {};
        }
      }
    };

    return {
      connect: createMockFn(),
      disconnect: createMockFn(),
      isConnected: createMockFn(true),
      query: createMockFn(),
      get: createMockFn(),
      run: createMockFn(),
      beginTransaction: createMockFn(),
      commitTransaction: createMockFn(),
      rollbackTransaction: createMockFn(),
      getHealthStatus: createMockFn({ status: 'healthy' }),
      createTables: createMockFn(),
      dropTables: createMockFn()
    };
  }

  /**
   * Create a mock service that implements a specific interface
   * @param {Function} InterfaceClass - The interface class to implement
   * @param {Object} methods - Methods to mock with their implementations
   * @returns {Object} Mock service that extends the interface
   */
  static createMockServiceWithInterface (InterfaceClass, methods = {}) {
    const mock = Object.create(InterfaceClass.prototype);
    Object.keys(methods).forEach(key => {
      if (typeof jest !== 'undefined' && jest.fn) {
        mock[key] = jest.fn(methods[key]);
      } else {
        mock[key] = methods[key];
      }
    });
    return mock;
  }
}
