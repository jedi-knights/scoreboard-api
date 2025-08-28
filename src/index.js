import { createApp } from './app.js';
import { DatabaseFactory } from './database/database-factory.js';
import { apiConfig, databaseConfig } from './config/index.js';

/**
 * Main Application Entry Point
 * 
 * Initializes the database connection, creates the Express application,
 * and starts the HTTP server.
 */
async function startServer() {
  try {
    console.log('🚀 Starting Scoreboard API...');
    console.log(`Environment: ${apiConfig.environment}`);
    console.log(`Database Type: ${databaseConfig.type}`);

    // Initialize database
    console.log('📊 Initializing database...');
    const databaseAdapter = DatabaseFactory.createAdapter();
    await databaseAdapter.connect();
    console.log('✅ Database connected successfully');

    // Create Express application
    console.log('🌐 Creating Express application...');
    const app = createApp(databaseAdapter);
    console.log('✅ Express application created');

    // Start server
    const server = app.listen(apiConfig.port, () => {
      console.log(`🎯 Server running on port ${apiConfig.port}`);
      console.log(`📖 API Documentation: http://localhost:${apiConfig.port}/`);
      console.log(`🏥 Health Check: http://localhost:${apiConfig.port}/health`);
      console.log(`🎮 Games API: http://localhost:${apiConfig.port}/api/${apiConfig.version}/games`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      // Close server
      server.close(() => {
        console.log('🌐 HTTP server closed');
      });

      // Close database connection
      try {
        await databaseAdapter.disconnect();
        console.log('📊 Database connection closed');
      } catch (error) {
        console.error('❌ Error closing database connection:', error);
      }

      // Exit process
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

