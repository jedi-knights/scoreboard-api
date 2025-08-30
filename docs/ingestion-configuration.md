# Ingestion Configuration Guide

This document describes the comprehensive configuration options available for the Scoreboard API ingestion services, with a focus on NCAA data ingestion.

## Overview

The ingestion configuration is organized into several logical groups:
- **NCAA Ingestion**: Specific settings for NCAA data processing
- **General Ingestion**: Global ingestion service settings
- **Data Sources**: Configuration for different data source types
- **Validation**: Data validation and error handling settings

## NCAA Ingestion Configuration

### Batch Processing Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_MAX_BATCH_SIZE` | 100 | Maximum number of games that can be processed in a single batch |
| `NCAA_MIN_BATCH_SIZE` | 1 | Minimum batch size for processing |

### Retry and Timeout Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_RETRY_ATTEMPTS` | 3 | Number of retry attempts for failed operations |
| `NCAA_RETRY_DELAY` | 1000 | Delay between retry attempts in milliseconds |
| `NCAA_DEFAULT_TIMEOUT` | 30000 | Default timeout for operations in milliseconds |
| `NCAA_MAX_TIMEOUT` | 120000 | Maximum allowed timeout in milliseconds |

### Validation Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_VALIDATION_ENABLED` | true | Enable/disable data validation |
| `NCAA_STRICT_VALIDATION` | false | Enable strict validation mode |

### Performance Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_CONCURRENT_PROCESSING` | 5 | Number of concurrent processing threads |
| `NCAA_RATE_LIMIT_PER_MINUTE` | 1000 | Rate limit for ingestion operations per minute |

### Data Processing Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_AUTO_CREATE_ENTITIES` | true | Automatically create missing teams/conferences |
| `NCAA_ENTITY_CREATION_TIMEOUT` | 10000 | Timeout for entity creation operations |

### Logging and Monitoring

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_ENABLE_DETAILED_LOGGING` | false | Enable detailed logging for debugging |
| `NCAA_LOG_INGESTION_METRICS` | true | Log ingestion performance metrics |

### Error Handling

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_CONTINUE_ON_PARTIAL_FAILURE` | true | Continue processing if some items fail |
| `NCAA_MAX_CONSECUTIVE_FAILURES` | 10 | Maximum consecutive failures before stopping |

### Data Source Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_ALLOWED_DATA_SOURCES` | `ncaa_official,ncaa_unofficial` | Comma-separated list of allowed data sources |
| `NCAA_DEFAULT_DATA_SOURCE` | `ncaa_official` | Default data source for new records |

### Idempotency Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_IDEMPOTENCY_ENABLED` | true | Enable idempotency checks |
| `NCAA_IDEMPOTENCY_WINDOW` | 86400000 | Idempotency window in milliseconds (24 hours) |

## General Ingestion Configuration

### Global Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_ENABLE_RATE_LIMITING` | true | Enable global rate limiting |
| `INGESTION_GLOBAL_RATE_LIMIT` | 5000 | Global rate limit for all ingestion operations |

### Health Check Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_HEALTH_CHECK_INTERVAL` | 30000 | Health check interval in milliseconds |
| `INGESTION_HEALTH_CHECK_TIMEOUT` | 5000 | Health check timeout in milliseconds |

### Monitoring Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_ENABLE_METRICS` | true | Enable metrics collection |
| `INGESTION_METRICS_RETENTION_DAYS` | 30 | Metrics retention period in days |

### Performance Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_MAX_CONCURRENT` | 10 | Maximum concurrent ingestion operations |
| `INGESTION_QUEUE_SIZE` | 1000 | Size of the ingestion queue |

### Error Handling

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_MAX_RETRY_ATTEMPTS` | 5 | Maximum retry attempts for failed operations |
| `INGESTION_RETRY_BACKOFF_MULTIPLIER` | 2.0 | Exponential backoff multiplier for retries |

### Data Validation

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_ENABLE_DATA_VALIDATION` | true | Enable data validation |
| `INGESTION_STRICT_DATA_VALIDATION` | false | Enable strict validation mode |

### Logging

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `INGESTION_LOG_LEVEL` | info | Log level for ingestion services |
| `INGESTION_ENABLE_STRUCTURED_LOGGING` | true | Enable structured logging format |

## Data Source Configuration

### NCAA Official Source

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_OFFICIAL_ENABLED` | true | Enable official NCAA data source |
| `NCAA_OFFICIAL_PRIORITY` | 1 | Priority for official source (lower = higher priority) |
| `NCAA_OFFICIAL_TIMEOUT` | 30000 | Timeout for official source requests |

### NCAA Unofficial Source

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NCAA_UNOFFICIAL_ENABLED` | true | Enable unofficial NCAA data source |
| `NCAA_UNOFFICIAL_PRIORITY` | 2 | Priority for unofficial source |
| `NCAA_UNOFFICIAL_TIMEOUT` | 15000 | Timeout for unofficial source requests |

### External Data Sources

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `EXTERNAL_DATA_SOURCES_ENABLED` | false | Enable external data sources |
| `EXTERNAL_MAX_CONCURRENT_REQUESTS` | 5 | Maximum concurrent external requests |
| `EXTERNAL_REQUEST_TIMEOUT` | 10000 | Timeout for external data source requests |

## Validation Configuration

### General Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `VALIDATION_ENABLED` | true | Enable data validation |
| `VALIDATION_STRICT` | false | Enable strict validation mode |

### Custom Validation

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ENABLE_CUSTOM_VALIDATION` | false | Enable custom validation rules |
| `CUSTOM_VALIDATION_TIMEOUT` | 5000 | Timeout for custom validation operations |

### Error Handling

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `VALIDATION_FAIL_FAST` | false | Stop validation on first error |
| `VALIDATION_COLLECT_ALL_ERRORS` | true | Collect all validation errors before reporting |

## Configuration Examples

### Development Environment

```bash
# NCAA Ingestion - Development settings
NCAA_MAX_BATCH_SIZE=50
NCAA_RETRY_ATTEMPTS=2
NCAA_ENABLE_DETAILED_LOGGING=true
NCAA_STRICT_VALIDATION=false

# General Ingestion - Development settings
INGESTION_LOG_LEVEL=debug
INGESTION_ENABLE_METRICS=true
INGESTION_MAX_CONCURRENT=3
```

### Production Environment

```bash
# NCAA Ingestion - Production settings
NCAA_MAX_BATCH_SIZE=200
NCAA_RETRY_ATTEMPTS=5
NCAA_ENABLE_DETAILED_LOGGING=false
NCAA_STRICT_VALIDATION=true

# General Ingestion - Production settings
INGESTION_LOG_LEVEL=warn
INGESTION_ENABLE_METRICS=true
INGESTION_MAX_CONCURRENT=20
```

### High-Performance Environment

```bash
# NCAA Ingestion - High-performance settings
NCAA_MAX_BATCH_SIZE=500
NCAA_CONCURRENT_PROCESSING=20
NCAA_RATE_LIMIT_PER_MINUTE=5000

# General Ingestion - High-performance settings
INGESTION_MAX_CONCURRENT=50
INGESTION_QUEUE_SIZE=5000
INGESTION_GLOBAL_RATE_LIMIT=10000
```

## Usage in Code

### Accessing Configuration

```javascript
import { businessConfig } from '../config/index.js';

// Access NCAA ingestion settings
const maxBatchSize = businessConfig.ncaaIngestion.maxBatchSize;
const retryAttempts = businessConfig.ncaaIngestion.retryAttempts;

// Access general ingestion settings
const globalRateLimit = businessConfig.ingestion.globalRateLimit;
const enableMetrics = businessConfig.ingestion.enableMetrics;
```

### Direct Import from Ingestion Config

```javascript
import { ncaaIngestionConfig, generalIngestionConfig } from '../config/ingestion-config.js';

// Access specific configurations
const batchSize = ncaaIngestionConfig.maxBatchSize;
const rateLimit = generalIngestionConfig.globalRateLimit;
```

## Best Practices

1. **Environment-Specific Configuration**: Use different values for development, staging, and production
2. **Performance Tuning**: Adjust concurrent processing and rate limits based on your infrastructure
3. **Monitoring**: Enable metrics and detailed logging in development, reduce in production
4. **Validation**: Use strict validation in production, relaxed in development
5. **Error Handling**: Configure retry attempts and backoff strategies appropriately

## Troubleshooting

### Common Issues

1. **Batch Size Too Large**: Reduce `NCAA_MAX_BATCH_SIZE` if experiencing memory issues
2. **Timeout Errors**: Increase `NCAA_DEFAULT_TIMEOUT` for slower data sources
3. **Rate Limiting**: Adjust `NCAA_RATE_LIMIT_PER_MINUTE` based on source limitations
4. **Validation Failures**: Check `NCAA_STRICT_VALIDATION` setting and data quality

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
NCAA_ENABLE_DETAILED_LOGGING=true
INGESTION_LOG_LEVEL=debug
INGESTION_ENABLE_STRUCTURED_LOGGING=true
```

## Migration from Previous Versions

If upgrading from a previous version:

1. **Backup Configuration**: Save your current environment variables
2. **Review New Settings**: Check for new configuration options
3. **Test Gradually**: Start with default values and adjust as needed
4. **Monitor Performance**: Watch for any performance impacts from new settings

---

*Last Updated: [Current Date]*
*Version: 1.0.0*
