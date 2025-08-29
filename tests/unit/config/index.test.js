/**
 * Unit Tests for Configuration Module
 */

import { describe, it, expect } from '@jest/globals';
import {
  databaseConfig,
  apiConfig,
  securityConfig,
  loggingConfig,
  healthConfig
} from '../../../src/config/index.js';

describe('Configuration Module', () => {
  describe('Database Configuration', () => {
    it('should have correct SQLite configuration structure', () => {
      expect(databaseConfig).toHaveProperty('type');
      expect(databaseConfig).toHaveProperty('sqlite');
      expect(databaseConfig.sqlite).toHaveProperty('databasePath');
      expect(databaseConfig.sqlite).toHaveProperty('verbose');
    });

    it('should have correct PostgreSQL configuration structure', () => {
      expect(databaseConfig).toHaveProperty('postgres');
      expect(databaseConfig.postgres).toHaveProperty('host');
      expect(databaseConfig.postgres).toHaveProperty('port');
      expect(databaseConfig.postgres).toHaveProperty('database');
      expect(databaseConfig.postgres).toHaveProperty('username');
      expect(databaseConfig.postgres).toHaveProperty('password');
      expect(databaseConfig.postgres).toHaveProperty('ssl');
      expect(databaseConfig.postgres).toHaveProperty('pool');
    });

    it('should have correct DynamoDB configuration structure', () => {
      expect(databaseConfig).toHaveProperty('dynamodb');
      expect(databaseConfig.dynamodb).toHaveProperty('region');
      expect(databaseConfig.dynamodb).toHaveProperty('endpointUrl');
      expect(databaseConfig.dynamodb).toHaveProperty('tables');
      expect(databaseConfig.dynamodb.tables).toHaveProperty('games');
      expect(databaseConfig.dynamodb.tables).toHaveProperty('teams');
    });

    it('should have correct default values', () => {
      expect(databaseConfig.type).toBe('sqlite');
      expect(databaseConfig.sqlite.databasePath).toBe('./data/scoreboard.db');
      expect(databaseConfig.postgres.host).toBe('localhost');
      expect(databaseConfig.postgres.port).toBe(5432);
      expect(databaseConfig.postgres.database).toBe('scoreboard');
      expect(databaseConfig.postgres.username).toBe('postgres');
      expect(databaseConfig.postgres.password).toBe('password');
      expect(databaseConfig.postgres.ssl).toBe(false);
      expect(databaseConfig.dynamodb.region).toBe('us-east-1');
    });

    it('should have correct PostgreSQL pool configuration', () => {
      const pool = databaseConfig.postgres.pool;
      expect(pool.min).toBe(2);
      expect(pool.max).toBe(10);
      expect(pool.acquireTimeoutMillis).toBe(30000);
      expect(pool.createTimeoutMillis).toBe(30000);
      expect(pool.destroyTimeoutMillis).toBe(5000);
      expect(pool.idleTimeoutMillis).toBe(30000);
      expect(pool.reapIntervalMillis).toBe(1000);
      expect(pool.createRetryIntervalMillis).toBe(100);
    });
  });

  describe('API Configuration', () => {
    it('should have correct API configuration structure', () => {
      expect(apiConfig).toHaveProperty('port');
      expect(apiConfig).toHaveProperty('version');
      expect(apiConfig).toHaveProperty('environment');
      expect(apiConfig).toHaveProperty('cors');
      expect(apiConfig).toHaveProperty('rateLimit');
    });

    it('should have correct CORS configuration structure', () => {
      expect(apiConfig.cors).toHaveProperty('origin');
      expect(apiConfig.cors).toHaveProperty('credentials');
    });

    it('should have correct rate limit configuration structure', () => {
      expect(apiConfig.rateLimit).toHaveProperty('windowMs');
      expect(apiConfig.rateLimit).toHaveProperty('max');
    });

    it('should have correct default values', () => {
      expect(apiConfig.port).toBe(3000);
      expect(apiConfig.version).toBe('v1');
      expect(apiConfig.environment).toBe('test');
      expect(apiConfig.cors.origin).toBe('http://localhost:3000');
      // .env file is loaded, so CORS_CREDENTIALS=true
      expect(apiConfig.cors.credentials).toBe(true);
      expect(apiConfig.rateLimit.windowMs).toBe(900000);
      expect(apiConfig.rateLimit.max).toBe(100);
    });
  });

  describe('Security Configuration', () => {
    it('should have correct security configuration structure', () => {
      expect(securityConfig).toHaveProperty('jwt');
      expect(securityConfig).toHaveProperty('bcrypt');
    });

    it('should have correct JWT configuration structure', () => {
      expect(securityConfig.jwt).toHaveProperty('secret');
      expect(securityConfig.jwt).toHaveProperty('expiresIn');
    });

    it('should have correct bcrypt configuration structure', () => {
      expect(securityConfig.bcrypt).toHaveProperty('rounds');
    });

    it('should have correct default values', () => {
      expect(securityConfig.jwt.secret).toBe('your-super-secret-jwt-key-here');
      expect(securityConfig.jwt.expiresIn).toBe('24h');
      expect(securityConfig.bcrypt.rounds).toBe(12);
    });
  });

  describe('Logging Configuration', () => {
    it('should have correct logging configuration structure', () => {
      expect(loggingConfig).toHaveProperty('level');
      expect(loggingConfig).toHaveProperty('format');
      expect(loggingConfig).toHaveProperty('transports');
    });

    it('should have correct transports configuration structure', () => {
      expect(loggingConfig.transports).toHaveProperty('console');
      expect(loggingConfig.transports).toHaveProperty('file');
    });

    it('should have correct console transport configuration', () => {
      expect(loggingConfig.transports.console).toHaveProperty('level');
    });

    it('should have correct file transport configuration', () => {
      expect(loggingConfig.transports.file).toHaveProperty('filename');
      expect(loggingConfig.transports.file).toHaveProperty('maxsize');
      expect(loggingConfig.transports.file).toHaveProperty('maxFiles');
    });

    it('should have correct default values', () => {
      expect(loggingConfig.level).toBe('info');
      expect(loggingConfig.format).toBe('json');
      expect(loggingConfig.transports.console.level).toBe('info');
      expect(loggingConfig.transports.file.filename).toBe('./logs/app.log');
      expect(loggingConfig.transports.file.maxsize).toBe(5242880);
      expect(loggingConfig.transports.file.maxFiles).toBe(5);
    });
  });

  describe('Health Configuration', () => {
    it('should have correct health configuration structure', () => {
      expect(healthConfig).toHaveProperty('timeout');
      expect(healthConfig).toHaveProperty('checks');
    });

    it('should have correct default values', () => {
      expect(healthConfig.timeout).toBe(5000);
      expect(healthConfig.checks).toEqual(['database', 'memory', 'disk']);
    });

    it('should have correct checks array', () => {
      expect(Array.isArray(healthConfig.checks)).toBe(true);
      expect(healthConfig.checks).toContain('database');
      expect(healthConfig.checks).toContain('memory');
      expect(healthConfig.checks).toContain('disk');
    });
  });

  describe('Configuration Integration', () => {
    it('should have consistent environment settings', () => {
      expect(apiConfig.environment).toBe('test');
      expect(loggingConfig.transports.console.level).toBe('info');
      expect(databaseConfig.sqlite.verbose).toBe(false);
    });

    it('should have valid port numbers', () => {
      expect(apiConfig.port).toBeGreaterThan(0);
      expect(apiConfig.port).toBeLessThan(65536);
    });

    it('should have valid rate limit values', () => {
      expect(apiConfig.rateLimit.windowMs).toBeGreaterThan(0);
      expect(apiConfig.rateLimit.max).toBeGreaterThan(0);
    });

    it('should have valid bcrypt rounds', () => {
      expect(securityConfig.bcrypt.rounds).toBeGreaterThanOrEqual(1);
      expect(securityConfig.bcrypt.rounds).toBeLessThanOrEqual(31);
    });

    it('should have valid health check timeout', () => {
      expect(healthConfig.timeout).toBeGreaterThan(0);
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      expect(apiConfig.port).toBe(3000);
      expect(apiConfig.environment).toBe('test');
      expect(databaseConfig.type).toBe('sqlite');
    });

    it('should have fallback values for all configurations', () => {
      expect(apiConfig.port).toBe(3000);
      expect(apiConfig.version).toBe('v1');
      expect(apiConfig.environment).toBe('test');
      expect(apiConfig.cors.origin).toBe('http://localhost:3000');
      expect(apiConfig.rateLimit.windowMs).toBe(900000);
      expect(apiConfig.rateLimit.max).toBe(100);
    });

    it('should handle conditional logic for different environments', () => {
      expect(apiConfig.environment).toBe('test');
      // .env file is loaded, so CORS_CREDENTIALS=true
      expect(apiConfig.cors.credentials).toBe(true);
      expect(apiConfig.cors.origin).toBe('http://localhost:3000');
    });

    it('should validate configuration structure integrity', () => {
      expect(databaseConfig).toHaveProperty('type');
      expect(databaseConfig).toHaveProperty('sqlite');
      expect(databaseConfig).toHaveProperty('postgres');
      expect(databaseConfig).toHaveProperty('dynamodb');
      
      expect(apiConfig).toHaveProperty('port');
      expect(apiConfig).toHaveProperty('version');
      expect(apiConfig).toHaveProperty('environment');
      expect(apiConfig).toHaveProperty('cors');
      expect(apiConfig).toHaveProperty('rateLimit');
      
      expect(securityConfig).toHaveProperty('jwt');
      expect(securityConfig).toHaveProperty('bcrypt');
      
      expect(loggingConfig).toHaveProperty('level');
      expect(loggingConfig).toHaveProperty('transports');
      
      expect(healthConfig).toHaveProperty('timeout');
      expect(healthConfig).toHaveProperty('checks');
    });
  });
});
