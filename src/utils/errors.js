/**
 * Custom Error Classes
 *
 * Provides structured error handling with proper error codes and context.
 * Separates error handling concerns from business logic.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor (message, statusCode = 500, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  constructor (message, field = null, value = null, context = {}) {
    super(message, 400, { field, value, ...context });
    this.name = 'ValidationError';
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor (resource, identifier = null, context = {}) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, { resource, identifier, ...context });
    this.name = 'NotFoundError';
  }
}

/**
 * Database error for database operation failures
 */
export class DatabaseError extends AppError {
  constructor (operation, details = null, context = {}) {
    const message = `Database operation failed: ${operation}`;
    super(message, 500, { operation, details, ...context });
    this.name = 'DatabaseError';
  }
}

/**
 * Service error for business logic failures
 */
export class ServiceError extends AppError {
  constructor (service, operation, details = null, context = {}) {
    const message = `${service} service error in ${operation}`;
    super(message, 500, { service, operation, details, ...context });
    this.name = 'ServiceError';
  }
}

/**
 * Controller error for HTTP request handling failures
 */
export class ControllerError extends AppError {
  constructor (controller, operation, details = null, context = {}) {
    const message = `${controller} controller error in ${operation}`;
    super(message, 500, { controller, operation, details, ...context });
    this.name = 'ControllerError';
  }
}

/**
 * External service error for third-party API failures
 */
export class ExternalServiceError extends AppError {
  constructor (service, operation, details = null, context = {}) {
    const message = `External service error: ${service} - ${operation}`;
    super(message, 502, { service, operation, details, ...context });
    this.name = 'ExternalServiceError';
  }
}

/**
 * Authentication error for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor (message = 'Authentication failed', context = {}) {
    super(message, 401, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends AppError {
  constructor (message = 'Insufficient permissions', context = {}) {
    super(message, 403, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Rate limiting error for too many requests
 */
export class RateLimitError extends AppError {
  constructor (message = 'Rate limit exceeded', retryAfter = null, context = {}) {
    super(message, 429, { retryAfter, ...context });
    this.name = 'RateLimitError';
  }
}

/**
 * Conflict error for resource conflicts
 */
export class ConflictError extends AppError {
  constructor (message = 'Resource conflict', resource = null, context = {}) {
    super(message, 409, { resource, ...context });
    this.name = 'ConflictError';
  }
}

/**
 * Bad request error for malformed requests
 */
export class BadRequestError extends AppError {
  constructor (message = 'Bad request', field = null, context = {}) {
    super(message, 400, { field, ...context });
    this.name = 'BadRequestError';
  }
}

/**
 * Internal server error for unexpected failures
 */
export class InternalServerError extends AppError {
  constructor (message = 'Internal server error', context = {}) {
    super(message, 500, context);
    this.name = 'InternalServerError';
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  /**
   * Create a validation error
   */
  static validation (message, field = null, value = null, context = {}) {
    return new ValidationError(message, field, value, context);
  }

  /**
   * Create a not found error
   */
  static notFound (resource, identifier = null, context = {}) {
    return new NotFoundError(resource, identifier, context);
  }

  /**
   * Create a database error
   */
  static database (operation, details = null, context = {}) {
    return new DatabaseError(operation, details, context);
  }

  /**
   * Create a service error
   */
  static service (service, operation, details = null, context = {}) {
    return new ServiceError(service, operation, details, context);
  }

  /**
   * Create a controller error
   */
  static controller (controller, operation, details = null, context = {}) {
    return new ControllerError(controller, operation, details, context);
  }

  /**
   * Create an external service error
   */
  static externalService (service, operation, details = null, context = {}) {
    return new ExternalServiceError(service, operation, details, context);
  }

  /**
   * Create a conflict error
   */
  static conflict (message, resource = null, context = {}) {
    return new ConflictError(message, resource, context);
  }

  /**
   * Create a bad request error
   */
  static badRequest (message, field = null, context = {}) {
    return new BadRequestError(message, field, context);
  }

  /**
   * Create an internal server error
   */
  static internal (message = 'Internal server error', context = {}) {
    return new InternalServerError(message, context);
  }
}

/**
 * Error response formatter for consistent error responses
 */
export class ErrorResponseFormatter {
  /**
   * Format error for HTTP response
   */
  static format (error, includeStack = false) {
    const response = {
      success: false,
      error: error.name || 'Error',
      message: error.message,
      timestamp: error.timestamp || new Date().toISOString(),
      ...(error.context && { context: error.context })
    };

    if (includeStack && error.stack) {
      response.stack = error.stack;
    }

    return response;
  }

  /**
   * Format validation errors for HTTP response
   */
  static formatValidation (errors) {
    return {
      success: false,
      error: 'ValidationError',
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
      details: errors.map(error => ({
        field: error.field,
        message: error.message,
        value: error.value
      }))
    };
  }
}
