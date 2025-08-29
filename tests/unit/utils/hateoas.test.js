/**
 * Unit Tests for HATEOAS Utility Functions
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  createLink,
  getApiBaseUrl,
  getBaseUrl,
  generateNavigationLinks,
  generateCollectionLinks,
  generateResourceLinks,
  generateActionLinks,
  enhanceWithLinks
} from '../../../src/utils/hateoas.js';

describe('HATEOAS Utility Functions', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      protocol: 'http',
      get: jest.fn((header) => {
        if (header === 'host') return 'localhost:3000';
        return null;
      }),
      originalUrl: '/api/v1/games',
      url: '/api/v1/games',
      method: 'GET',
      headers: {}
    };
  });

  describe('createLink', () => {
    it('should create a link object with all properties', () => {
      const link = createLink('/api/v1/games', 'self', 'GET', 'Current resource');

      expect(link).toEqual({
        href: '/api/v1/games',
        rel: 'self',
        method: 'GET',
        title: 'Current resource'
      });
    });

    it('should create a link object with minimal properties', () => {
      const link = createLink('/api/v1/games', 'self');

      expect(link).toEqual({
        href: '/api/v1/games',
        rel: 'self',
        method: 'GET'
      });
    });
  });

  describe('getBaseUrl', () => {
    it('should construct base URL from request', () => {
      const baseUrl = getBaseUrl(mockReq);
      expect(baseUrl).toBe('http://localhost:3000');
    });

    it('should handle HTTPS protocol', () => {
      mockReq.protocol = 'https';
      const baseUrl = getBaseUrl(mockReq);
      expect(baseUrl).toBe('https://localhost:3000');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should construct base URL from request', () => {
      const baseUrl = getApiBaseUrl(mockReq);
      expect(baseUrl).toBe('http://localhost:3000/api/v1');
    });

    it('should handle HTTPS protocol', () => {
      mockReq.protocol = 'https';
      const baseUrl = getApiBaseUrl(mockReq);
      expect(baseUrl).toBe('https://localhost:3000/api/v1');
    });
  });

  describe('generateNavigationLinks', () => {
    it('should generate navigation links for main endpoints', () => {
      const links = generateNavigationLinks(mockReq);

      expect(links).toHaveProperty('self');
      expect(links).toHaveProperty('health');
      expect(links).toHaveProperty('games');
      expect(links).toHaveProperty('teams');
      expect(links).toHaveProperty('conferences');

      expect(links.self.href).toBe('http://localhost:3000');
      expect(links.health.href).toBe('http://localhost:3000/health');
      expect(links.games.href).toBe('http://localhost:3000/api/v1/games');
    });
  });

  describe('generateCollectionLinks', () => {
    it('should generate collection links with pagination', () => {
      const pagination = { page: 2, limit: 10, total: 100 };
      const filters = { sport: 'basketball' };
      const links = generateCollectionLinks(mockReq, 'games', pagination, filters);

      expect(links).toHaveProperty('self');
      expect(links).toHaveProperty('first');
      expect(links).toHaveProperty('last');
      expect(links).toHaveProperty('prev');
      expect(links).toHaveProperty('next');
      expect(links).toHaveProperty('filtered');

      expect(links.self.href).toBe('http://localhost:3000/api/v1/games?page=2&limit=10');
      expect(links.first.href).toBe('http://localhost:3000/api/v1/games?page=1&limit=10');
    });

    it('should handle first page without prev link', () => {
      const pagination = { page: 1, limit: 10, total: 100 };
      const links = generateCollectionLinks(mockReq, 'games', pagination);

      expect(links).not.toHaveProperty('prev');
      expect(links.next.href).toBe('http://localhost:3000/api/v1/games?page=2&limit=10');
    });

    it('should handle single page results', () => {
      const pagination = { page: 1, limit: 100, total: 50 };
      const links = generateCollectionLinks(mockReq, 'games', pagination);

      expect(links).not.toHaveProperty('prev');
      expect(links).not.toHaveProperty('next');
    });
  });

  describe('generateResourceLinks', () => {
    it('should generate resource links for a single resource', () => {
      const relatedResources = { teams: 'lakers', conferences: 'nba' };
      const links = generateResourceLinks(mockReq, 'games', '123', relatedResources);

      expect(links).toHaveProperty('self');
      expect(links).toHaveProperty('update');
      expect(links).toHaveProperty('delete');
      expect(links).toHaveProperty('collection');
      expect(links).toHaveProperty('teams');
      expect(links).toHaveProperty('conferences');

      expect(links.self.href).toBe('http://localhost:3000/api/v1/games/123');
      expect(links.collection.href).toBe('http://localhost:3000/api/v1/games');
    });
  });

  describe('generateActionLinks', () => {
    it('should generate action links for available actions', () => {
      const links = generateActionLinks(mockReq, 'games', '123');

      expect(links).toHaveProperty('create');
      expect(links).toHaveProperty('partialUpdate');

      expect(links.create.href).toBe('http://localhost:3000/api/v1/games/123');
      expect(links.partialUpdate.href).toBe('http://localhost:3000/api/v1/games/123');
    });

    it('should handle collection actions without resource ID', () => {
      const links = generateActionLinks(mockReq, 'games');

      expect(links).toHaveProperty('create');
      expect(links).not.toHaveProperty('partialUpdate');

      expect(links.create.href).toBe('http://localhost:3000/api/v1/games');
    });
  });

  describe('enhanceWithLinks', () => {
    it('should enhance data with HATEOAS links', () => {
      const data = { id: 1, name: 'Game 1' };
      const links = { self: { href: '/games/1', rel: 'self' } };
      const enhanced = enhanceWithLinks(mockReq, data, links);

      expect(enhanced).toHaveProperty('_links');
      expect(enhanced).toHaveProperty('_meta');
      expect(enhanced._links).toEqual(links);
      expect(enhanced.id).toBe(1);
      expect(enhanced.name).toBe('Game 1');
      expect(enhanced._meta).toHaveProperty('generatedAt');
      expect(enhanced._meta).toHaveProperty('apiVersion');
      expect(enhanced._meta).toHaveProperty('baseUrl');
    });
  });
});
