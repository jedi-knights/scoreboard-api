import { createApp } from './app.js';
import { DatabaseFactory } from './database/database-factory.js';
import { apiConfig, databaseConfig } from './config/index.js';
import logger from './utils/logger.js';

/**
 * Main Application Entry Point
 *
 * Initializes the database connection, creates the Express application,
 * and starts the HTTP server.
 */
async function startServer () {
  try {
    logger.info('🚀 Starting Scoreboard API...');
    logger.info(`Environment: ${apiConfig.environment}`);
    logger.info(`Database Type: ${databaseConfig.type}`);

    // Initialize database
    logger.info('📊 Initializing database...');
    const databaseAdapter = DatabaseFactory.createAdapter();
    await databaseAdapter.connect();
    logger.info('✅ Database connected successfully');

    // Create Express application
    logger.info('🌐 Creating Express application...');
    const app = createApp(databaseAdapter);
    logger.info('✅ Express application created');

    // Start server
    const server = app.listen(apiConfig.port, () => {
      logger.info(`🎯 Server running on port ${apiConfig.port}`);
      logger.info(`📖 API Documentation: http://localhost:${apiConfig.port}/`);
      logger.info(`🏥 Health Check: http://localhost:${apiConfig.port}/health`);
      logger.info(`🎮 Games API: http://localhost:${apiConfig.port}/api/${apiConfig.version}/games`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      // Close server
      server.close(() => {
        logger.info('🌐 HTTP server closed');
      });

      // Close database connection
      try {
        await databaseAdapter.disconnect();
        logger.info('📊 Database connection closed');
      } catch (error) {
        logger.error('❌ Error closing database connection:', error);
      }

      // Exit process
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

