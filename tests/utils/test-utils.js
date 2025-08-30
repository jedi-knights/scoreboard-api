/**
 * Test Utilities
 * 
 * Common testing functions and utilities used across test suites.
 * Provides helper methods for common testing patterns.
 */

import { jest } from '@jest/globals';

/**
 * Test Utilities Helper
 */
export class TestUtils {
  /**
   * Create a mock function that returns a promise
   * @param {*} returnValue - Value to return when resolved
   * @param {boolean} shouldResolve - Whether to resolve or reject
   * @returns {Function} Mock function that returns a promise
   */
  static createAsyncMock(returnValue = null, shouldResolve = true) {
    if (shouldResolve) {
      return jest.fn().mockResolvedValue(returnValue);
    } else {
      return jest.fn().mockRejectedValue(returnValue);
    }
  }

  /**
   * Create a mock function that throws an error
   * @param {Error|string} error - Error to throw
   * @returns {Function} Mock function that throws an error
   */
  static createErrorMock(error = 'Test error') {
    const errorObj = error instanceof Error ? error : new Error(error);
    return jest.fn().mockImplementation(() => {
      throw errorObj;
    });
  }

  /**
   * Create a mock function that returns different values on subsequent calls
   * @param {Array} returnValues - Array of values to return on each call
   * @returns {Function} Mock function with multiple return values
   */
  static createSequentialMock(returnValues) {
    let callIndex = 0;
    return jest.fn().mockImplementation(() => {
      if (callIndex < returnValues.length) {
        return returnValues[callIndex++];
      }
      return returnValues[returnValues.length - 1]; // Return last value for subsequent calls
    });
  }

  /**
   * Create a mock function that delays execution
   * @param {number} delayMs - Delay in milliseconds
   * @param {*} returnValue - Value to return
   * @returns {Function} Mock function with delay
   */
  static createDelayedMock(delayMs = 100, returnValue = null) {
    return jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(returnValue), delayMs);
      });
    });
  }

  /**
   * Create a mock function that fails after a certain number of calls
   * @param {number} failAfterCalls - Number of calls before failure
   * @param {Error|string} error - Error to throw on failure
   * @param {*} successValue - Value to return on successful calls
   * @returns {Function} Mock function that fails after N calls
   */
  static createFailingMock(failAfterCalls = 1, error = 'Test error', successValue = null) {
    let callCount = 0;
    const errorObj = error instanceof Error ? error : new Error(error);
    
    return jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount > failAfterCalls) {
        throw errorObj;
      }
      return successValue;
    });
  }

  /**
   * Create a mock function that fails after a certain number of async calls
   * @param {number} failAfterCalls - Number of calls before failure
   * @param {Error|string} error - Error to reject with
   * @param {*} successValue - Value to resolve with on successful calls
   * @returns {Function} Mock function that fails after N async calls
   */
  static createAsyncFailingMock(failAfterCalls = 1, error = 'Test error', successValue = null) {
    let callCount = 0;
    const errorObj = error instanceof Error ? error : new Error(error);
    
    return jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount > failAfterCalls) {
        return Promise.reject(errorObj);
      }
      return Promise.resolve(successValue);
    });
  }

  /**
   * Create a mock function that validates input parameters
   * @param {Function} validator - Function to validate parameters
   * @param {*} returnValue - Value to return if validation passes
   * @param {Error|string} error - Error to throw if validation fails
   * @returns {Function} Mock function with parameter validation
   */
  static createValidatingMock(validator, returnValue = null, error = 'Validation failed') {
    return jest.fn().mockImplementation((...args) => {
      if (validator(...args)) {
        return returnValue;
      } else {
        const errorObj = error instanceof Error ? error : new Error(error);
        throw errorObj;
      }
    });
  }

  /**
   * Create a mock function that tracks call arguments
   * @param {*} returnValue - Value to return
   * @returns {Object} Mock function with call tracking
   */
  static createTrackingMock(returnValue = null) {
    const mockFn = jest.fn().mockReturnValue(returnValue);
    mockFn.getCallArgs = () => mockFn.mock.calls;
    mockFn.getLastCallArgs = () => mockFn.mock.calls[mockFn.mock.calls.length - 1];
    mockFn.getCallCount = () => mockFn.mock.calls.length;
    mockFn.wasCalledWith = (...args) => {
      return mockFn.mock.calls.some(call => 
        call.length === args.length && 
        call.every((arg, index) => arg === args[index])
      );
    };
    return mockFn;
  }

  /**
   * Create a mock function that can be configured at runtime
   * @param {*} defaultReturnValue - Default value to return
   * @returns {Object} Configurable mock function
   */
  static createConfigurableMock(defaultReturnValue = null) {
    const mockFn = jest.fn().mockReturnValue(defaultReturnValue);
    
    mockFn.configure = (config) => {
      if (config.returnValue !== undefined) {
        mockFn.mockReturnValue(config.returnValue);
      }
      if (config.returnValues !== undefined) {
        mockFn.mockReturnValueOnce(config.returnValues[0]);
        for (let i = 1; i < config.returnValues.length; i++) {
          mockFn.mockReturnValueOnce(config.returnValues[i]);
        }
      }
      if (config.implementation !== undefined) {
        mockFn.mockImplementation(config.implementation);
      }
      if (config.throwError !== undefined) {
        mockFn.mockImplementation(() => {
          throw config.throwError;
        });
      }
      if (config.rejectWith !== undefined) {
        mockFn.mockRejectedValue(config.rejectWith);
      }
      return mockFn;
    };
    
    return mockFn;
  }

  /**
   * Create a mock object with all methods as jest mocks
   * @param {Array} methodNames - Array of method names to mock
   * @param {Object} defaultImplementations - Default implementations for methods
   * @returns {Object} Object with all methods mocked
   */
  static createMockObject(methodNames = [], defaultImplementations = {}) {
    const mockObj = {};
    
    methodNames.forEach(methodName => {
      if (defaultImplementations[methodName]) {
        mockObj[methodName] = jest.fn().mockImplementation(defaultImplementations[methodName]);
      } else {
        mockObj[methodName] = jest.fn();
      }
    });
    
    return mockObj;
  }

  /**
   * Create a mock class with all methods as jest mocks
   * @param {Array} methodNames - Array of method names to mock
   * @param {Object} defaultImplementations - Default implementations for methods
   * @returns {Function} Mock class constructor
   */
  static createMockClass(methodNames = [], defaultImplementations = {}) {
    return jest.fn().mockImplementation(() => {
      const mockInstance = {};
      
      methodNames.forEach(methodName => {
        if (defaultImplementations[methodName]) {
          mockInstance[methodName] = jest.fn().mockImplementation(defaultImplementations[methodName]);
        } else {
          mockInstance[methodName] = jest.fn();
        }
      });
      
      return mockInstance;
    });
  }

  /**
   * Wait for a specified number of milliseconds
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after the delay
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for a condition to be true
   * @param {Function} condition - Function that returns a boolean
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @param {number} interval - Check interval in milliseconds
   * @returns {Promise} Promise that resolves when condition is true
   */
  static async waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return;
      }
      await this.wait(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Create a test context object
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Test context object
   */
  static createTestContext(overrides = {}) {
    const defaultContext = {
      testId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      metadata: {},
      cleanup: []
    };
    
    const context = { ...defaultContext, ...overrides };
    
    // Add cleanup method
    context.addCleanup = (cleanupFn) => {
      context.cleanup.push(cleanupFn);
    };
    
    // Add metadata
    context.setMetadata = (key, value) => {
      context.metadata[key] = value;
    };
    
    // Get metadata
    context.getMetadata = (key) => {
      return context.metadata[key];
    };
    
    return context;
  }

  /**
   * Execute cleanup functions
   * @param {Array} cleanupFns - Array of cleanup functions
   */
  static async executeCleanup(cleanupFns = []) {
    for (const cleanupFn of cleanupFns) {
      try {
        if (typeof cleanupFn === 'function') {
          await cleanupFn();
        }
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    }
  }

  /**
   * Create a test data generator
   * @param {Function} generatorFn - Function to generate test data
   * @param {Object} options - Options for the generator
   * @returns {Function} Test data generator function
   */
  static createDataGenerator(generatorFn, options = {}) {
    return (overrides = {}) => {
      const baseData = generatorFn(options);
      return { ...baseData, ...overrides };
    };
  }

  /**
   * Create a test scenario builder
   * @param {Object} baseScenario - Base scenario configuration
   * @returns {Object} Test scenario builder
   */
  static createScenarioBuilder(baseScenario = {}) {
    const builder = {
      scenario: { ...baseScenario },
      
      withInput(input) {
        this.scenario.input = input;
        return this;
      },
      
      withExpectedOutput(output) {
        this.scenario.expectedOutput = output;
        return this;
      },
      
      withMock(mockName, mockConfig) {
        if (!this.scenario.mocks) {
          this.scenario.mocks = {};
        }
        this.scenario.mocks[mockName] = mockConfig;
        return this;
      },
      
      withError(error) {
        this.scenario.error = error;
        return this;
      },
      
      withSetup(setupFn) {
        this.scenario.setup = setupFn;
        return this;
      },
      
      withTeardown(teardownFn) {
        this.scenario.teardown = teardownFn;
        return this;
      },
      
      build() {
        return { ...this.scenario };
      }
    };
    
    return builder;
  }
}

/**
 * Common test assertions and matchers
 */
export const TestAssertions = {
  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function to test
   * @param {string|RegExp} expectedError - Expected error message or pattern
   */
  async assertThrows(fn, expectedError = null) {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        if (expectedError instanceof RegExp) {
          expect(error.message).toMatch(expectedError);
        } else {
          expect(error.message).toBe(expectedError);
        }
      }
    }
  },

  /**
   * Assert that a function does not throw an error
   * @param {Function} fn - Function to test
   */
  async assertDoesNotThrow(fn) {
    try {
      await fn();
    } catch (error) {
      throw new Error(`Expected function not to throw, but it threw: ${error.message}`);
    }
  },

  /**
   * Assert that an object has all required properties
   * @param {Object} obj - Object to test
   * @param {Array} requiredProps - Array of required property names
   */
  assertHasProperties(obj, requiredProps) {
    requiredProps.forEach(prop => {
      expect(obj).toHaveProperty(prop);
    });
  },

  /**
   * Assert that an object has the expected structure
   * @param {Object} obj - Object to test
   * @param {Object} expectedStructure - Expected object structure
   */
  assertObjectStructure(obj, expectedStructure) {
    Object.keys(expectedStructure).forEach(key => {
      expect(obj).toHaveProperty(key);
      if (expectedStructure[key] !== null) {
        // Handle string type names for convenience
        const expectedType = expectedStructure[key];
        const actualType = typeof obj[key];
        
        if (expectedType === 'string') {
          expect(actualType).toBe('string');
        } else if (expectedType === 'number') {
          expect(actualType).toBe('number');
        } else if (expectedType === 'boolean') {
          expect(actualType).toBe('boolean');
        } else if (expectedType === 'object') {
          expect(actualType).toBe('object');
        } else if (expectedType === 'function') {
          expect(actualType).toBe('function');
        } else if (expectedType === 'undefined') {
          expect(actualType).toBe('undefined');
        } else {
          // If it's not a string type name, compare directly
          expect(actualType).toBe(expectedType);
        }
      }
    });
  }
};
