/**
 * Swagger Middleware Setup
 *
 * Automatically generates and serves Swagger API documentation
 * from JSDoc comments in route and controller files.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerConfig } from '../config/swagger-config.js';
import logger from '../utils/logger.js';

/**
 * Initialize Swagger documentation
 * @returns {Object} Swagger specification and UI middleware
 */
export function initializeSwagger () {
  try {
    // Generate Swagger specification from JSDoc comments
    const specs = swaggerJsdoc(swaggerConfig);

    logger.info('Swagger documentation generated successfully', {
      middleware: 'Swagger',
      operation: 'initialize',
      endpoints: specs.paths ? Object.keys(specs.paths).length : 0
    });

    // Create Swagger UI middleware
    const swaggerUiMiddleware = swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Scoreboard API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showExtensions: true,
        showCommonExtensions: true
      }
    });

    // Serve Swagger UI
    const serveSwaggerUi = swaggerUi.serve;

    return {
      specs,
      serveSwaggerUi,
      swaggerUiMiddleware
    };
  } catch (error) {
    logger.error('Failed to initialize Swagger documentation', error, {
      middleware: 'Swagger',
      operation: 'initialize'
    });

    // Return fallback middleware that serves a basic error message
    return {
      specs: {},
      serveSwaggerUi: (req, res, next) => next(),
      swaggerUiMiddleware: (req, res) => {
        res.status(500).json({
          success: false,
          error: 'Swagger Documentation Error',
          message: 'Failed to generate API documentation',
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

/**
 * Get Swagger specification as JSON
 * @param {Object} specs - Swagger specifications
 * @returns {Function} Express middleware function
 */
export function getSwaggerSpec (specs) {
  return (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(specs);
  };
}
