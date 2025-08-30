/**
 * Swagger Configuration
 *
 * Configures automatic Swagger documentation generation from JSDoc comments.
 * Documentation is generated automatically when the app starts.
 */

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scoreboard API',
      version: process.env.API_VERSION || '1.0.0',
      description: 'A comprehensive sports scoreboard API with HATEOAS support, real-time game data, team and conference management, and advanced filtering capabilities.',
      contact: {
        name: 'API Support',
        email: 'support@scoreboard-api.com'
      },
      license: {
        name: 'ISC',
        url: 'https://github.com/jedi-knights/scoreboard-api/blob/main/LICENSE'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://api.scoreboard.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        // Future: Add authentication schemes here
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            timestamp: { type: 'string', format: 'date-time' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation Failed' },
            message: { type: 'string', example: 'Request validation failed' },
            timestamp: { type: 'string', format: 'date-time' },
            details: { type: 'object' }
          }
        },
        // NCAA Game schemas
        NCAAGameData: {
          type: 'object',
          required: ['home_team', 'away_team', 'sport', 'division', 'date'],
          properties: {
            home_team: { type: 'string', example: 'Duke Blue Devils' },
            away_team: { type: 'string', example: 'North Carolina Tar Heels' },
            sport: { type: 'string', enum: ['basketball', 'football', 'soccer'], example: 'basketball' },
            division: { type: 'string', enum: ['d1', 'd2', 'd3'], example: 'd1' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            time: { type: 'string', format: 'time', example: '19:00' },
            venue: { type: 'string', example: 'Cameron Indoor Stadium' },
            city: { type: 'string', example: 'Durham' },
            state: { type: 'string', example: 'NC' },
            country: { type: 'string', example: 'USA' },
            conference: { type: 'string', example: 'ACC' },
            season: { type: 'string', example: '2023-24' },
            gender: { type: 'string', enum: ['men', 'women'], example: 'men' },
            home_score: { type: 'integer', minimum: 0, example: 85 },
            away_score: { type: 'integer', minimum: 0, example: 78 },
            status: { type: 'string', enum: ['scheduled', 'live', 'final'], example: 'final' }
          }
        },
        // Team schemas
        Team: {
          type: 'object',
          required: ['name', 'sport', 'division', 'gender'],
          properties: {
            team_id: { type: 'string', example: 'duke-basketball-d1-men' },
            name: { type: 'string', example: 'Duke Blue Devils' },
            short_name: { type: 'string', example: 'Duke' },
            sport: { type: 'string', example: 'basketball' },
            division: { type: 'string', example: 'd1' },
            gender: { type: 'string', example: 'men' },
            conference: { type: 'string', example: 'ACC' },
            city: { type: 'string', example: 'Durham' },
            state: { type: 'string', example: 'NC' },
            country: { type: 'string', example: 'USA' }
          }
        },
        // Conference schemas
        Conference: {
          type: 'object',
          required: ['name', 'sport', 'division', 'gender'],
          properties: {
            conference_id: { type: 'string', example: 'acc-basketball-d1-men' },
            name: { type: 'string', example: 'Atlantic Coast Conference' },
            short_name: { type: 'string', example: 'ACC' },
            sport: { type: 'string', example: 'basketball' },
            division: { type: 'string', example: 'd1' },
            gender: { type: 'string', example: 'men' },
            level: { type: 'string', example: 'college' },
            region: { type: 'string', example: 'Atlantic Coast' }
          }
        },
        // Game schemas
        Game: {
          type: 'object',
          required: ['game_id', 'home_team', 'away_team', 'sport', 'division', 'date'],
          properties: {
            game_id: { type: 'string', example: 'duke-unc-basketball-2024-01-15' },
            home_team: { type: 'string', example: 'Duke Blue Devils' },
            away_team: { type: 'string', example: 'North Carolina Tar Heels' },
            sport: { type: 'string', example: 'basketball' },
            division: { type: 'string', example: 'd1' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            status: { type: 'string', example: 'final' },
            home_score: { type: 'integer', example: 85 },
            away_score: { type: 'integer', example: 78 }
          }
        }
      }
    },
    tags: [
      {
        name: 'API Info',
        description: 'API information and root endpoint'
      },
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints'
      },
      {
        name: 'Games',
        description: 'Game management and retrieval operations'
      },
      {
        name: 'Teams',
        description: 'Team management and operations'
      },
      {
        name: 'Conferences',
        description: 'Conference management and operations'
      },
      {
        name: 'NCAA Ingestion',
        description: 'NCAA game data ingestion and validation'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/app.js'
  ]
};
