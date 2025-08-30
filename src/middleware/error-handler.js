/**
 * Error Handling Middleware
 *
 * Provides consistent error handling across the application.
 * Integrates with custom error classes and logger.
 */

import logger from '../utils/logger.js';
import { ErrorResponseFormatter, AppError } from '../utils/errors.js';

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (error, req, res, _next) => {
  // Log the error with context
  logger.error('Global error handler triggered', error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const errorResponse = handleError(error);
  res.status(errorResponse.statusCode).json(errorResponse.response);
};

/**
 * Handle different types of errors and return appropriate response
 * @param {Error} error - The error to handle
 * @returns {Object} Status code and response object
 * @private
   */
function handleError (error) {
  // Handle custom application errors
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: ErrorResponseFormatter.format(error, process.env.NODE_ENV === 'development')
    };
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      response: ErrorResponseFormatter.formatValidation([error])
    };
  }

  // Handle authentication errors
  const authError = handleAuthenticationError(error);
  if (authError) return authError;

  // Handle database errors
  const dbError = handleDatabaseError(error);
  if (dbError) return dbError;

  // Default error response
  return handleDefaultError(error);
}

/**
 * Handle authentication-related errors
 * @param {Error} error - The error to handle
 * @returns {Object|null} Status code and response object, or null if not an auth error
 * @private
   */
function handleAuthenticationError (error) {
  if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      response: ErrorResponseFormatter.format({
        name: 'AuthenticationError',
        message: 'Invalid or missing authentication token',
        timestamp: new Date().toISOString()
      })
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      response: ErrorResponseFormatter.format({
        name: 'AuthenticationError',
        message: 'Authentication token expired',
        timestamp: new Date().toISOString()
      })
    };
  }

  return null;
}

/**
 * Handle database-related errors
 * @param {Error} error - The error to handle
 * @returns {Object|null} Status code and response object, or null if not a db error
 * @private
   */
function handleDatabaseError (error) {
  if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
    return {
      statusCode: 409,
      response: ErrorResponseFormatter.format({
        name: 'ConflictError',
        message: 'Resource already exists',
        timestamp: new Date().toISOString()
      })
    };
  }

  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || error.code === '23503') {
    return {
      statusCode: 400,
      response: ErrorResponseFormatter.format({
        name: 'BadRequestError',
        message: 'Referenced resource does not exist',
        timestamp: new Date().toISOString()
      })
    };
  }

  if (error.code === 'SQLITE_NOTFOUND' || error.code === '23505') {
    return {
      statusCode: 404,
      response: ErrorResponseFormatter.format({
        name: 'NotFoundError',
        message: 'Resource not found',
        timestamp: new Date().toISOString()
      })
    };
  }

  return null;
}

/**
 * Handle default error response
 * @param {Error} error - The error to handle
 * @returns {Object} Status code and response object
 * @private
   */
function handleDefaultError (error) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV !== 'development'
    ? 'Internal server error'
    : error.message;

  return {
    statusCode,
    response: ErrorResponseFormatter.format({
      name: error.name || 'InternalServerError',
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  };
}

/**
 * Async error wrapper for Express routes
 * Eliminates the need for try-catch blocks in route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json(
    ErrorResponseFormatter.format({
      name: 'NotFoundError',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    })
  );
};

/**
 * Request logging middleware with error tracking
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request start
  logger.debug('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;

    // Log response
    logger.http(req.method, req.originalUrl, res.statusCode, duration, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length')
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error boundary for unhandled promise rejections
 */
export const setupUnhandledErrorHandling = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', reason, {
      promise: promise.toString(),
      stack: reason?.stack
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error, {
      stack: error.stack
    });

    // Gracefully shutdown the process
    process.exit(1);
  });
};
