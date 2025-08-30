import dotenv from 'dotenv';
// import path from 'path'; // Unused for now
// import { fileURLToPath } from 'url'; // Unused for now

// Load environment variables
dotenv.config();

// const __filename = fileURLToPath(import.meta.url); // Unused for now
// const _dirname = path.dirname(__filename); // Unused for now

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
    credentials: process.env.CORS_CREDENTIALS === 'false' ? false : true
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

// Import ingestion configuration
import { ingestionConfig } from './ingestion-config.js';

// Business logic configuration
const businessConfig = {
  // NCAA Ingestion settings (imported from dedicated config)
  ncaaIngestion: ingestionConfig.ncaa,

  // General ingestion settings (imported from dedicated config)
  ingestion: ingestionConfig.general,

  // Games service settings
  games: {
    pagination: {
      defaultLimit: parseInt(process.env.GAMES_DEFAULT_LIMIT) || 50,
      maxLimit: parseInt(process.env.GAMES_MAX_LIMIT) || 100,
      defaultOffset: parseInt(process.env.GAMES_DEFAULT_OFFSET) || 0,
      maxOffset: parseInt(process.env.GAMES_MAX_OFFSET) || 10000
    },
    validation: {
      gameId: {
        minLength: parseInt(process.env.GAME_ID_MIN_LENGTH) || 1,
        maxLength: parseInt(process.env.GAME_ID_MAX_LENGTH) || 100
      },
      sport: {
        minLength: parseInt(process.env.SPORT_MIN_LENGTH) || 1,
        maxLength: parseInt(process.env.SPORT_MAX_LENGTH) || 50
      },
      teamName: {
        minLength: parseInt(process.env.TEAM_NAME_MIN_LENGTH) || 1,
        maxLength: parseInt(process.env.TEAM_NAME_MAX_LENGTH) || 100
      },
      conference: {
        minLength: parseInt(process.env.CONFERENCE_MIN_LENGTH) || 1,
        maxLength: parseInt(process.env.CONFERENCE_MAX_LENGTH) || 100
      },
      colors: {
        minLength: parseInt(process.env.COLORS_MIN_LENGTH) || 1,
        maxLength: parseInt(process.env.COLORS_MAX_LENGTH) || 100
      }
    },
    sortOptions: {
      validFields: ['date', 'home_team', 'away_team', 'sport', 'status', 'created_at'],
      defaultField: 'date',
      defaultOrder: 'DESC'
    }
  },

  // Test configuration
  testing: {
    unitTestTimeout: parseInt(process.env.UNIT_TEST_TIMEOUT) || 5000,
    integrationTestTimeout: parseInt(process.env.INTEGRATION_TEST_TIMEOUT) || 60000,
    testDelay: parseInt(process.env.TEST_DELAY) || 1000
  }
};

export {
  databaseConfig,
  apiConfig,
  securityConfig,
  loggingConfig,
  healthConfig,
  businessConfig
};
