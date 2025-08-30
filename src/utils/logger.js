/**
 * Centralized Logger Interface
 *
 * Provides consistent logging across the application with different log levels
 * and structured output. Separates logging concerns from business logic.
 */

class Logger {
  constructor () {
    this.environment = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.environment === 'development';
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or additional context
   * @param {Object} context - Additional context information
   */
  error (message, error = null, context = {}) {
    const logData = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };

    if (error) {
      if (error instanceof Error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined
        };
      } else {
        logData.error = error;
      }
    }

    // In development, log to console with full details
    if (this.isDevelopment) {
      console.error('🚨 ERROR:', logData);
    } else {
      // In production, log structured data (could be sent to external logging service)
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context information
   */
  warn (message, context = {}) {
    const logData = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };

    if (this.isDevelopment) {
      console.warn('⚠️  WARNING:', logData);
    } else {
      console.warn(JSON.stringify(logData));
    }
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} context - Additional context information
   */
  info (message, context = {}) {
    const logData = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };

    if (this.isDevelopment) {
      console.info('ℹ️  INFO:', logData);
    } else {
      console.info(JSON.stringify(logData));
    }
  }

  /**
   * Log a debug message (only in development)
   * @param {string} message - Debug message
   * @param {Object} context - Additional context information
   */
  debug (message, context = {}) {
    if (!this.isDevelopment) return;

    const logData = {
      level: 'DEBUG',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };

    console.debug('🐛 DEBUG:', logData);
  }

  /**
   * Log database operations
   * @param {string} operation - Database operation (e.g., 'query', 'transaction')
   * @param {string} details - Operation details
   * @param {Object} context - Additional context
   */
  db (operation, details, context = {}) {
    this.debug(`DB ${operation}: ${details}`, { operation, details, ...context });
  }

  /**
   * Log HTTP requests
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} statusCode - Response status code
   * @param {number} duration - Request duration in milliseconds
   * @param {Object} context - Additional context
   */
  http (method, url, statusCode, duration, context = {}) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this[level](`${method} ${url} ${statusCode} ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }

  /**
   * Log service operations
   * @param {string} service - Service name
   * @param {string} operation - Operation name
   * @param {Object} context - Additional context
   */
  service (service, operation, context = {}) {
    this.debug(`${service} service: ${operation}`, { service, operation, ...context });
  }

  /**
   * Log controller operations
   * @param {string} controller - Controller name
   * @param {string} operation - Operation name
   * @param {Object} context - Additional context
   */
  controller (controller, operation, context = {}) {
    this.debug(`${controller} controller: ${operation}`, { controller, operation, ...context });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
