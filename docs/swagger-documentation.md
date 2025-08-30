# Swagger API Documentation

## Overview

The Scoreboard API now includes comprehensive, automatically generated Swagger documentation that provides interactive API exploration and testing capabilities. The documentation is generated automatically from JSDoc comments in your route files and updates whenever the application starts.

## Features

- ✅ **Automatic Generation**: Documentation is generated from JSDoc comments when the app starts
- ✅ **Interactive UI**: Swagger UI provides a user-friendly interface for testing endpoints
- ✅ **Always in Sync**: Documentation automatically reflects your current code
- ✅ **Comprehensive Schemas**: Pre-defined data models for all API entities
- ✅ **Environment Aware**: Automatically detects development vs production URLs
- ✅ **HATEOAS Integration**: Shows hypermedia links and navigation

## Accessing the Documentation

### Swagger UI (Interactive)
```
http://localhost:3000/api-docs
```

### OpenAPI JSON (Machine Readable)
```
http://localhost:3000/api-docs.json
```

## How It Works

### 1. Automatic Generation
When your application starts, the Swagger middleware:
- Scans all route files for JSDoc comments
- Generates OpenAPI 3.0 specification
- Creates interactive Swagger UI
- Serves both the UI and JSON specification

### 2. JSDoc Integration
The documentation is generated from JSDoc comments in your route files. Here's an example:

```javascript
/**
 * @swagger
 * /api/v1/ncaa/ingest/game:
 *   post:
 *     summary: Ingest Single NCAA Game
 *     description: Ingest a single NCAA game record into the system
 *     tags: [NCAA Ingestion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NCAAGameData'
 *     responses:
 *       201:
 *         description: Game successfully ingested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/game', controller.ingestGame.bind(controller));
```

### 3. Schema References
The documentation uses pre-defined schemas for consistent data models:

- `NCAAGameData` - NCAA game information
- `Team` - Team data structure
- `Conference` - Conference data structure
- `Game` - Game data structure
- `SuccessResponse` - Standard success response
- `ErrorResponse` - Standard error response

## Adding Documentation to New Endpoints

### Step 1: Add JSDoc Comments
Add comprehensive JSDoc comments above your route definitions:

```javascript
/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Get All Teams
 *     description: Retrieve a list of all teams with optional filtering
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', teamsController.getTeams.bind(teamsController));
```

### Step 2: Use Schema References
Reference existing schemas or create new ones:

```javascript
// In swagger-config.js
components: {
  schemas: {
    NewTeam: {
      type: 'object',
      required: ['name', 'sport', 'division', 'gender'],
      properties: {
        name: { type: 'string', example: 'Duke Blue Devils' },
        sport: { type: 'string', example: 'basketball' },
        division: { type: 'string', example: 'd1' },
        gender: { type: 'string', example: 'men' }
      }
    }
  }
}
```

### Step 3: Add Tags
Organize endpoints with tags:

```javascript
tags: [Teams]  // This groups the endpoint under the Teams section
```

## Testing the Documentation

### Run the Test Script
```bash
npm run test:swagger
```

This will test all documentation endpoints and verify they're working correctly.

### Manual Testing
1. Start your API server: `npm run dev`
2. Open your browser to: `http://localhost:3000/api-docs`
3. Explore the interactive documentation
4. Test endpoints directly from the UI

## Configuration

### Environment Variables
The Swagger configuration automatically adapts to your environment:

- `API_VERSION` - Sets the API version in documentation
- `API_BASE_URL` - Development server URL
- `PRODUCTION_API_URL` - Production server URL

### Customization
You can customize the Swagger UI appearance in `src/middleware/swagger.js`:

```javascript
const swaggerUiMiddleware = swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Scoreboard API Documentation',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true
  }
});
```

## Best Practices

### 1. Comprehensive Documentation
- Include summary and description for each endpoint
- Document all request parameters and body schemas
- Provide detailed response schemas
- Include examples where helpful

### 2. Consistent Tagging
- Use consistent tag names across related endpoints
- Group endpoints logically (e.g., [Teams], [Games], [Health])

### 3. Schema Reuse
- Reference existing schemas when possible
- Create new schemas for complex data structures
- Keep schemas consistent with your actual API responses

### 4. Error Handling
- Document all possible error responses
- Use consistent error response schemas
- Include appropriate HTTP status codes

## Troubleshooting

### Documentation Not Generating
- Check that JSDoc comments are properly formatted
- Verify that route files are included in `swaggerConfig.apis`
- Check the console for Swagger initialization errors

### Missing Endpoints
- Ensure JSDoc comments are above the route definitions
- Check that the route paths match the `@swagger` path definitions
- Verify that the route files are being scanned

### Schema Errors
- Check that referenced schemas exist in `swagger-config.js`
- Verify schema property definitions are correct
- Ensure required fields are properly marked

## Benefits

1. **Developer Experience**: Interactive documentation makes API exploration easy
2. **Always Current**: Documentation automatically stays in sync with code
3. **Testing**: Developers can test endpoints directly from the documentation
4. **Onboarding**: New team members can quickly understand the API
5. **Integration**: Other teams can easily integrate with your API
6. **Standards**: Follows OpenAPI 3.0 standards for maximum compatibility

## Future Enhancements

- Authentication scheme documentation
- Rate limiting information
- Webhook documentation
- SDK generation
- API versioning support
- Custom themes and branding

---

The Swagger documentation is now fully integrated into your API and will automatically generate comprehensive, interactive documentation every time your application starts. No manual regeneration is required - just add JSDoc comments to your routes and the documentation will update automatically!
