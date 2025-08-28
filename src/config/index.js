import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const databaseConfig = {
  type: process.env.DATABASE_TYPE || 'sqlite',
  sqlite: {
    databasePath: process.env.SQLITE_DATABASE_PATH || './data/scoreboard.db',
    verbose: process.env.NODE_ENV === 'development'
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DATABASE || 'scoreboard',
    username: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.POSTGRES_SSL === 'true',
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  },
  dynamodb: {
    region: process.env.DYNAMODB_REGION || 'us-east-1',
    endpointUrl: process.env.DYNAMODB_ENDPOINT_URL || undefined,
    tables: {
      games: process.env.DYNAMODB_TABLES_GAMES || 'scoreboard-games',
      teams: process.env.DYNAMODB_TABLES_TEAMS || 'scoreboard-teams',
      collections: process.env.DYNAMODB_TABLES_COLLECTIONS || 'scoreboard-collections',
      schedules: process.env.DYNAMODB_TABLES_SCHEDULES || 'scoreboard-schedules'
    }
  }
};

// API configuration
const apiConfig = {
  port: parseInt(process.env.PORT) || 3000,
  version: process.env.API_VERSION || 'v1',
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

// Security configuration
const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json',
  transports: {
    console: {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    },
    file: {
      filename: './logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  }
};

// Health check configuration
const healthConfig = {
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
  checks: ['database', 'memory', 'disk']
};

export {
  databaseConfig,
  apiConfig,
  securityConfig,
  loggingConfig,
  healthConfig
};
