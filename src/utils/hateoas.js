/**
 * HATEOAS Utility Module
 *
 * Provides utilities for generating hypermedia links and enhancing API responses
 * with discoverable navigation options.
 */

import { apiConfig } from '../config/index.js';
import { URLSearchParams } from 'url';

/**
 * Generate base URL for the API
 * @param {Object} req - Express request object
 * @returns {string} Base URL
 */
export function getBaseUrl (req) {
  const protocol = req.get('X-Forwarded-Proto') || req.protocol;
  const host = req.get('X-Forwarded-Host') || req.get('host');
  return `${protocol}://${host}`;
}

/**
 * Generate API versioned base URL
 * @param {Object} req - Express request object
 * @returns {string} Versioned API base URL
 */
export function getApiBaseUrl (req) {
  return `${getBaseUrl(req)}/api/${apiConfig.version}`;
}

/**
 * Generate a hypermedia link object
 * @param {string} href - The link URL
 * @param {string} rel - The relationship type
 * @param {string} method - HTTP method (default: GET)
 * @param {string} title - Human-readable description
 * @param {Object} additionalProps - Additional properties
 * @returns {Object} Link object
 */
export function createLink (href, rel, method = 'GET', title = null, additionalProps = {}) {
  const link = {
    href,
    rel,
    method: method.toUpperCase()
  };

  if (title) {
    link.title = title;
  }

  return { ...link, ...additionalProps };
}

/**
 * Generate collection links for paginated resources
 * @param {Object} req - Express request object
 * @param {string} resourcePath - Resource path (e.g., 'games', 'teams')
 * @param {Object} pagination - Pagination object with page, limit, total
 * @param {Object} filters - Applied filters
 * @returns {Object} Collection links
 */
export function generateCollectionLinks (req, resourcePath, pagination, filters = {}) {
  const baseUrl = getApiBaseUrl(req);
  const { page = 1, limit = 10, total = 0 } = pagination;
  const totalPages = Math.ceil(total / limit);

  const links = createBaseCollectionLinks(baseUrl, resourcePath, page, limit, totalPages);
  addNavigationLinks(links, baseUrl, resourcePath, page, limit, totalPages);
  addFilterLinks(links, baseUrl, resourcePath, filters);

  return links;
}

/**
 * Create base collection links (self, first, last)
 * @param {string} baseUrl - Base API URL
 * @param {string} resourcePath - Resource path
 * @param {number} page - Current page
 * @param {number} limit - Page limit
 * @param {number} totalPages - Total pages
 * @returns {Object} Base collection links
 * @private
 */
function createBaseCollectionLinks (baseUrl, resourcePath, page, limit, totalPages) {
  return {
    self: createLink(
      `${baseUrl}/${resourcePath}?page=${page}&limit=${limit}`,
      'self',
      'GET',
      'Current page of results'
    ),
    first: createLink(
      `${baseUrl}/${resourcePath}?page=1&limit=${limit}`,
      'first',
      'GET',
      'First page of results'
    ),
    last: createLink(
      `${baseUrl}/${resourcePath}?page=${totalPages}&limit=${limit}`,
      'last',
      'GET',
      'Last page of results'
    )
  };
}

/**
 * Add navigation links (prev, next)
 * @param {Object} links - Links object to modify
 * @param {string} baseUrl - Base API URL
 * @param {string} resourcePath - Resource path
 * @param {number} page - Current page
 * @param {number} limit - Page limit
 * @param {number} totalPages - Total pages
 * @private
 */
function addNavigationLinks (links, baseUrl, resourcePath, page, limit, totalPages) {
  if (page > 1) {
    links.prev = createLink(
      `${baseUrl}/${resourcePath}?page=${page - 1}&limit=${limit}`,
      'prev',
      'GET',
      'Previous page of results'
    );
  }

  if (page < totalPages) {
    links.next = createLink(
      `${baseUrl}/${resourcePath}?page=${page + 1}&limit=${limit}`,
      'next',
      'GET',
      'Next page of results'
    );
  }
}

/**
 * Add filter links if filters are applied
 * @param {Object} links - Links object to modify
 * @param {string} baseUrl - Base API URL
 * @param {string} resourcePath - Resource path
 * @param {Object} filters - Applied filters
 * @private
 */
function addFilterLinks (links, baseUrl, resourcePath, filters) {
  if (Object.keys(filters).length > 0) {
    const filterParams = new URLSearchParams(filters);
    links.filtered = createLink(
      `${baseUrl}/${resourcePath}?${filterParams.toString()}`,
      'filtered',
      'GET',
      'Filtered results'
    );
  }
}

/**
 * Generate resource links for a single resource
 * @param {Object} req - Express request object
 * @param {string} resourcePath - Resource path (e.g., 'games', 'teams')
 * @param {string} resourceId - Resource identifier
 * @param {Object} relatedResources - Related resource types and their IDs
 * @returns {Object} Resource links
 */
export function generateResourceLinks (req, resourcePath, resourceId, relatedResources = {}) {
  const baseUrl = getApiBaseUrl(req);
  const resourceUrl = `${baseUrl}/${resourcePath}/${resourceId}`;

  const links = {
    self: createLink(
      resourceUrl,
      'self',
      'GET',
      'Current resource'
    ),
    update: createLink(
      resourceUrl,
      'update',
      'PUT',
      'Update this resource'
    ),
    delete: createLink(
      resourceUrl,
      'delete',
      'DELETE',
      'Delete this resource'
    ),
    collection: createLink(
      `${baseUrl}/${resourcePath}`,
      'collection',
      'GET',
      'All resources of this type'
    )
  };

  // Add related resource links
  Object.entries(relatedResources).forEach(([resourceType, id]) => {
    if (id) {
      links[resourceType] = createLink(
        `${baseUrl}/${resourceType}/${id}`,
        resourceType,
        'GET',
        `Related ${resourceType}`
      );
    }
  });

  return links;
}

/**
 * Generate navigation links for the API root
 * @param {Object} req - Express request object
 * @returns {Object} Navigation links
 */
export function generateNavigationLinks (req) {
  const baseUrl = getApiBaseUrl(req);
  const healthUrl = getBaseUrl(req);

  return {
    self: createLink(
      getBaseUrl(req),
      'self',
      'GET',
      'API root'
    ),
    health: createLink(
      `${healthUrl}/health`,
      'health',
      'GET',
      'API health status'
    ),
    games: createLink(
      `${baseUrl}/games`,
      'games',
      'GET',
      'All games'
    ),
    teams: createLink(
      `${baseUrl}/teams`,
      'teams',
      'GET',
      'All teams'
    ),
    conferences: createLink(
      `${baseUrl}/conferences`,
      'conferences',
      'GET',
      'All conferences'
    ),
    collections: createLink(
      `${baseUrl}/collections`,
      'collections',
      'GET',
      'All data collections'
    ),
    documentation: createLink(
      `${getBaseUrl(req)}/docs`,
      'documentation',
      'GET',
      'API documentation'
    ),
    schema: createLink(
      `${getBaseUrl(req)}/schema`,
      'schema',
      'GET',
      'API schema definition'
    )
  };
}

/**
 * Generate action links for resource operations
 * @param {Object} req - Express request object
 * @param {string} resourcePath - Resource path
 * @param {string} resourceId - Resource identifier (optional for collection actions)
 * @returns {Object} Action links
 */
export function generateActionLinks (req, resourcePath, resourceId = null) {
  const baseUrl = getApiBaseUrl(req);
  const resourceUrl = resourceId ? `${baseUrl}/${resourcePath}/${resourceId}` : `${baseUrl}/${resourcePath}`;

  const actions = {
    create: createLink(
      resourceUrl,
      'create',
      'POST',
      'Create new resource',
      { schema: `${getBaseUrl(req)}/schema/${resourcePath}` }
    )
  };

  if (resourceId) {
    actions.partialUpdate = createLink(
      resourceUrl,
      'partial-update',
      'PATCH',
      'Partially update this resource'
    );
  }

  return actions;
}

/**
 * Enhance a response object with HATEOAS links
 * @param {Object} req - Express request object
 * @param {Object} data - Response data
 * @param {Object} links - Generated links
 * @returns {Object} Enhanced response with links
 */
export function enhanceWithLinks (req, data, links) {
  return {
    ...data,
    _links: links,
    _meta: {
      generatedAt: new Date().toISOString(),
      apiVersion: apiConfig.version,
      baseUrl: getBaseUrl(req)
    }
  };
}
