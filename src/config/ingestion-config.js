/**
 * Ingestion Configuration
 *
 * Centralized configuration for all ingestion services including NCAA,
 * general ingestion settings, and related configurations.
 */

// NCAA Ingestion Configuration
export const ncaaIngestionConfig = {
  // Batch processing settings
  maxBatchSize: parseInt(process.env.NCAA_MAX_BATCH_SIZE) || 100,
  minBatchSize: parseInt(process.env.NCAA_MIN_BATCH_SIZE) || 1,

  // Retry and timeout settings
  retryAttempts: parseInt(process.env.NCAA_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.NCAA_RETRY_DELAY) || 1000,
  defaultTimeout: parseInt(process.env.NCAA_DEFAULT_TIMEOUT) || 30000,
  maxTimeout: parseInt(process.env.NCAA_MAX_TIMEOUT) || 120000,

  // Validation settings
  validationEnabled: process.env.NCAA_VALIDATION_ENABLED !== 'false',
  strictValidation: process.env.NCAA_STRICT_VALIDATION === 'true',

  // Performance settings
  concurrentProcessing: parseInt(process.env.NCAA_CONCURRENT_PROCESSING) || 5,
  rateLimitPerMinute: parseInt(process.env.NCAA_RATE_LIMIT_PER_MINUTE) || 1000,

  // Data processing settings
  autoCreateEntities: process.env.NCAA_AUTO_CREATE_ENTITIES !== 'false',
  entityCreationTimeout: parseInt(process.env.NCAA_ENTITY_CREATION_TIMEOUT) || 10000,

  // Logging and monitoring
  enableDetailedLogging: process.env.NCAA_ENABLE_DETAILED_LOGGING === 'true',
  logIngestionMetrics: process.env.NCAA_LOG_INGESTION_METRICS !== 'false',

  // Error handling
  continueOnPartialFailure: process.env.NCAA_CONTINUE_ON_PARTIAL_FAILURE !== 'false',
  maxConsecutiveFailures: parseInt(process.env.NCAA_MAX_CONSECUTIVE_FAILURES) || 10,

  // Data source settings
  allowedDataSources: (process.env.NCAA_ALLOWED_DATA_SOURCES || 'ncaa_official,ncaa_unofficial').split(','),
  defaultDataSource: process.env.NCAA_DEFAULT_DATA_SOURCE || 'ncaa_official',

  // Idempotency settings
  idempotencyEnabled: process.env.NCAA_IDEMPOTENCY_ENABLED !== 'false',
  idempotencyWindow: parseInt(process.env.NCAA_IDEMPOTENCY_WINDOW) || 86400000 // 24 hours in ms
};

// General Ingestion Configuration
export const generalIngestionConfig = {
  // Global ingestion settings
  enableRateLimiting: process.env.INGESTION_ENABLE_RATE_LIMITING !== 'false',
  globalRateLimit: parseInt(process.env.INGESTION_GLOBAL_RATE_LIMIT) || 5000,

  // Health check settings
  healthCheckInterval: parseInt(process.env.INGESTION_HEALTH_CHECK_INTERVAL) || 30000,
  healthCheckTimeout: parseInt(process.env.INGESTION_HEALTH_CHECK_TIMEOUT) || 5000,

  // Monitoring settings
  enableMetrics: process.env.INGESTION_ENABLE_METRICS !== 'false',
  metricsRetentionDays: parseInt(process.env.INGESTION_METRICS_RETENTION_DAYS) || 30,

  // Performance settings
  maxConcurrentIngestions: parseInt(process.env.INGESTION_MAX_CONCURRENT) || 10,
  ingestionQueueSize: parseInt(process.env.INGESTION_QUEUE_SIZE) || 1000,

  // Error handling
  maxRetryAttempts: parseInt(process.env.INGESTION_MAX_RETRY_ATTEMPTS) || 5,
  retryBackoffMultiplier: parseFloat(process.env.INGESTION_RETRY_BACKOFF_MULTIPLIER) || 2.0,

  // Data validation
  enableDataValidation: process.env.INGESTION_ENABLE_DATA_VALIDATION !== 'false',
  strictDataValidation: process.env.INGESTION_STRICT_DATA_VALIDATION === 'true',

  // Logging
  logLevel: process.env.INGESTION_LOG_LEVEL || 'info',
  enableStructuredLogging: process.env.INGESTION_ENABLE_STRUCTURED_LOGGING !== 'false'
};

// Data Source Configuration
export const dataSourceConfig = {
  // NCAA specific
  ncaa: {
    official: {
      enabled: process.env.NCAA_OFFICIAL_ENABLED !== 'false',
      priority: parseInt(process.env.NCAA_OFFICIAL_PRIORITY) || 1,
      timeout: parseInt(process.env.NCAA_OFFICIAL_TIMEOUT) || 30000
    },
    unofficial: {
      enabled: process.env.NCAA_UNOFFICIAL_ENABLED !== 'false',
      priority: parseInt(process.env.NCAA_UNOFFICIAL_PRIORITY) || 2,
      timeout: parseInt(process.env.NCAA_UNOFFICIAL_TIMEOUT) || 15000
    }
  },

  // Other potential data sources
  external: {
    enabled: process.env.EXTERNAL_DATA_SOURCES_ENABLED !== 'false',
    maxConcurrentRequests: parseInt(process.env.EXTERNAL_MAX_CONCURRENT_REQUESTS) || 5,
    requestTimeout: parseInt(process.env.EXTERNAL_REQUEST_TIMEOUT) || 10000
  }
};

// Validation Configuration
export const validationConfig = {
  // General validation settings
  enabled: process.env.VALIDATION_ENABLED !== 'false',
  strict: process.env.VALIDATION_STRICT === 'true',

  // Field validation
  requiredFields: {
    game: ['home_team', 'away_team', 'sport', 'date'],
    team: ['name', 'sport'],
    conference: ['name', 'sport']
  },

  // Custom validation rules
  customRules: {
    enableCustomValidation: process.env.ENABLE_CUSTOM_VALIDATION === 'true',
    customValidationTimeout: parseInt(process.env.CUSTOM_VALIDATION_TIMEOUT) || 5000
  },

  // Error handling
  failFast: process.env.VALIDATION_FAIL_FAST === 'true',
  collectAllErrors: process.env.VALIDATION_COLLECT_ALL_ERRORS !== 'false'
};

// Export all configurations
export const ingestionConfig = {
  ncaa: ncaaIngestionConfig,
  general: generalIngestionConfig,
  dataSources: dataSourceConfig,
  validation: validationConfig
};

// Default export for backward compatibility
export default ingestionConfig;
