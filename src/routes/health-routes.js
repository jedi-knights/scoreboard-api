import express from 'express';
import { generateNavigationLinks } from '../utils/hateoas.js';
import { HealthResponseFormatter } from '../utils/response-formatter.js';
import logger from '../utils/logger.js';

/**
 * Health Check Routes
 *
 * Provides health check endpoints for monitoring and load balancers.
 * These endpoints should be lightweight and fast.
 */
export function createHealthRoutes (databaseAdapter) {
  const router = express.Router();

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: General Health Check
   *     description: Comprehensive health check including database connectivity and system status
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: System is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: System is healthy
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: OK
   *                     service:
   *                       type: string
   *                       example: scoreboard-api
   *                     version:
   *                       type: string
   *                       example: 1.0.0
   *                     environment:
   *                       type: string
   *                       example: development
   *                     uptime:
   *                       type: number
   *                       example: 123.45
   *                     database:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           example: healthy
   *       500:
   *         description: System health check failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/', async (req, res) => {
    try {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'scoreboard-api',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
          status: 'checking...'
        }
      };

      // Check database health if adapter is available
      if (databaseAdapter) {
        try {
          const dbHealth = await databaseAdapter.getHealthStatus();
          healthData.database = dbHealth;
        } catch (error) {
          healthData.database = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }

      // Add HATEOAS navigation links
      const navigationLinks = generateNavigationLinks(req);
      const response = HealthResponseFormatter.formatGeneralHealthResponse(healthData, navigationLinks);

      res.status(response.status).json(response.body);
    } catch (error) {
      logger.error('Health check error', error, { route: 'health', operation: 'general' });
      const response = HealthResponseFormatter.formatHealthCheckError(error);
      res.status(response.status).json(response.body);
    }
  });

  /**
   * @swagger
   * /health/liveness:
   *   get:
   *     summary: Liveness Probe
   *     description: Basic application health check for Kubernetes liveness probes
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Application is alive
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Application is alive
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: alive
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   */
  router.get('/liveness', (req, res) => {
    const response = HealthResponseFormatter.formatLivenessResponse();
    res.status(response.status).json(response.body);
  });

  /**
   * @swagger
   * /health/readiness:
   *   get:
   *     summary: Readiness Probe
   *     description: Check if the application is ready to serve traffic (includes database connectivity)
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Application is ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Application is ready
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: ready
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       503:
   *         description: Application is not ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: Application is not ready
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: not_ready
   *                     reason:
   *                       type: string
   *                       example: Database not connected
   */
  router.get('/readiness', async (req, res) => {
    try {
      if (!databaseAdapter) {
        const response = HealthResponseFormatter.formatReadinessResponse(false, {
          reason: 'Database adapter not initialized'
        });
        return res.status(response.status).json(response.body);
      }

      const isConnected = await databaseAdapter.isConnected();

      if (!isConnected) {
        const response = HealthResponseFormatter.formatReadinessResponse(false, {
          reason: 'Database not connected'
        });
        return res.status(response.status).json(response.body);
      }

      const response = HealthResponseFormatter.formatReadinessResponse(true);
      res.status(response.status).json(response.body);
    } catch (error) {
      console.error('Readiness check error:', error);
      const response = HealthResponseFormatter.formatReadinessResponse(false, {
        reason: 'Health check failed',
        error: error.message
      });
      res.status(response.status).json(response.body);
    }
  });

  /**
   * @swagger
   * /health/detailed:
   *   get:
   *     summary: Detailed Health Information
   *     description: Comprehensive health information including system metrics, memory usage, and detailed status
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Detailed health information retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Detailed health information retrieved
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: OK
   *                     service:
   *                       type: string
   *                       example: scoreboard-api
   *                     version:
   *                       type: string
   *                       example: 1.0.0
   *                     environment:
   *                       type: string
   *                       example: development
   *                     uptime:
   *                       type: number
   *                       example: 123.45
   *                     memory:
   *                       type: object
   *                       properties:
   *                         rss:
   *                           type: number
   *                           example: 52428800
   *                         heapTotal:
   *                           type: number
   *                           example: 20971520
   *                         heapUsed:
   *                           type: number
   *                           example: 10485760
   *                     database:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           example: healthy
   *                         responseTime:
   *                           type: number
   *                           example: 5
   *       500:
   *         description: Failed to retrieve detailed health information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/detailed', async (req, res) => {
    try {
      const detailedHealth = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'scoreboard-api',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        database: null,
        system: {
          pid: process.pid,
          title: process.title,
          arch: process.arch,
          versions: process.versions
        }
      };

      // Get database health if available
      if (databaseAdapter) {
        try {
          detailedHealth.database = await databaseAdapter.getHealthStatus();
        } catch (error) {
          detailedHealth.database = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }

      // Add HATEOAS navigation links
      const navigationLinks = generateNavigationLinks(req);
      const response = HealthResponseFormatter.formatDetailedHealthResponse(detailedHealth, navigationLinks);

      res.status(response.status).json(response.body);
    } catch (error) {
      console.error('Detailed health check error:', error);
      const response = HealthResponseFormatter.formatHealthCheckError(error);
      res.status(response.status).json(response.body);
    }
  });

  return router;
}

