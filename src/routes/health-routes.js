import express from 'express';

/**
 * Health Check Routes
 * 
 * Provides health check endpoints for monitoring and load balancers.
 * These endpoints should be lightweight and fast.
 */
export function createHealthRoutes(databaseAdapter) {
  const router = express.Router();

  // GET /health - General health check
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

      res.status(200).json(healthData);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // GET /health/liveness - Basic application health (liveness probe)
  router.get('/liveness', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      service: 'scoreboard-api'
    });
  });

  // GET /health/readiness - Ready to serve traffic (readiness probe)
  router.get('/readiness', async (req, res) => {
    try {
      if (!databaseAdapter) {
        return res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Database adapter not initialized'
        });
      }

      const isConnected = await databaseAdapter.isConnected();
      
      if (!isConnected) {
        return res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Database not connected'
        });
      }

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        service: 'scoreboard-api',
        database: 'connected'
      });
    } catch (error) {
      console.error('Readiness check error:', error);
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Health check failed',
        error: error.message
      });
    }
  });

  // GET /health/detailed - Detailed health information
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

      res.status(200).json(detailedHealth);
    } catch (error) {
      console.error('Detailed health check error:', error);
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  return router;
}

