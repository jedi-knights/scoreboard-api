/**
 * Logger Utility Tests
 */

import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import logger from '../../../src/utils/logger.js';

describe('Logger', () => {
  let originalConsole;
  let mockConsole;

  beforeEach(() => {
    // Store original console methods
    originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Create mock console methods
    mockConsole = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };

    // Replace console methods with mocks
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.info = mockConsole.info;
    console.debug = mockConsole.debug;
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  });

  describe('error', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error, { context: 'test' });

      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"level":"ERROR"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"message":"Test error message"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"context":"test"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"error":{"name":"Error","message":"Test error"'));
    });

    it('should handle non-Error objects', () => {
      logger.error('Test error message', { custom: 'error' }, { context: 'test' });

      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"level":"ERROR"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"message":"Test error message"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"context":"test"'));
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('"error":{"custom":"error"'));
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message', { context: 'test' });

      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"level":"WARN"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"message":"Test warning message"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"context":"test"'));
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { context: 'test' });

      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"level":"INFO"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"message":"Test info message"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"context":"test"'));
    });
  });

  describe('debug', () => {
    it('should not log debug messages in test environment', () => {
      logger.debug('Test debug message', { context: 'test' });

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('specialized methods', () => {
    it('should not log database operations in test environment', () => {
      logger.db('query', 'SELECT * FROM games', { table: 'games' });

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should log HTTP requests', () => {
      logger.http('GET', '/api/games', 200, 150, { userId: '123' });

      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"level":"INFO"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"message":"GET /api/games 200 150ms"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"method":"GET"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"url":"/api/games"'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"statusCode":200'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"duration":150'));
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('"userId":"123"'));
    });

    it('should log HTTP errors as warnings', () => {
      logger.http('POST', '/api/games', 500, 2000, { userId: '123' });

      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"level":"WARN"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"message":"POST /api/games 500 2000ms"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"method":"POST"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"url":"/api/games"'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"statusCode":500'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"duration":2000'));
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('"userId":"123"'));
    });

    it('should not log service operations in test environment', () => {
      logger.service('GamesService', 'getGames', { filters: {} });

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should not log controller operations in test environment', () => {
      logger.controller('GamesController', 'getGames', { userId: '123' });

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });
});
