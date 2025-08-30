# NCAA Game Ingestion API

The NCAA Game Ingestion API allows the scoreboard platform to post game records from the NCAA scoreboard application. This endpoint automatically creates missing entities (teams, conferences) and ensures idempotency.

## Base URL

```
POST /api/v1/ncaa/ingest
```

## Endpoints

### 1. Ingest Single Game

**POST** `/api/v1/ncaa/ingest/game`

Ingest a single NCAA game record.

#### Request Body

```json
{
  "home_team": "Duke Blue Devils",
  "away_team": "North Carolina Tar Heels",
  "sport": "basketball",
  "division": "d1",
  "date": "2024-01-15",
  "gender": "men",
  "home_conference": "ACC",
  "away_conference": "ACC",
  "home_score": "85",
  "away_score": "78",
  "status": "final",
  "start_time": "2024-01-15T20:00:00Z"
}
```

#### Required Fields

- `home_team`: Home team name
- `away_team`: Away team name  
- `sport`: Sport (e.g., "soccer", "basketball", "football")
- `division`: Division (e.g., "d1", "d2", "d3")
- `date`: Game date in YYYY-MM-DD format

#### Optional Fields

- `gender`: Gender (e.g., "men", "women", "mixed") - defaults to "mixed"
- `home_conference`: Home team conference name
- `away_conference`: Away team conference name
- `home_score`: Home team score
- `away_score`: Away team score
- `status`: Game status (e.g., "scheduled", "live", "final")
- `start_time`: Game start time (ISO 8601 format)
- `gameId`: NCAA game ID (if available)

#### Response

**Success (201 Created)**
```json
{
  "success": true,
  "message": "Game successfully ingested",
  "data": {
    "game_id": "ncaa-basketball-d1-20240115-duke-blue-devils-vs-north-carolina-tar-heels",
    "action": "created",
    "entities_created": {
      "teams": 2,
      "conferences": 1
    }
  }
}
```

**Already Exists (200 OK)**
```json
{
  "success": true,
  "message": "Game was already ingested previously",
  "data": {
    "game_id": "ncaa-basketball-d1-20240115-duke-blue-devils-vs-north-carolina-tar-heels",
    "action": "skipped",
    "reason": "Game already exists"
  }
}
```

**Validation Error (400 Bad Request)**
```json
{
  "success": false,
  "error": "Ingestion Failed",
  "message": "Failed to ingest game",
  "details": "Missing required field: away_team"
}
```

### 2. Ingest Multiple Games

**POST** `/api/v1/ncaa/ingest/games`

Ingest multiple NCAA game records in a single request.

#### Request Body

```json
[
  {
    "home_team": "Duke Blue Devils",
    "away_team": "North Carolina Tar Heels",
    "sport": "basketball",
    "division": "d1",
    "date": "2024-01-15",
    "gender": "men"
  },
  {
    "home_team": "Kentucky Wildcats",
    "away_team": "Tennessee Volunteers",
    "sport": "basketball",
    "division": "d1",
    "date": "2024-01-15",
    "gender": "men"
  }
]
```

#### Response

```json
{
  "success": true,
  "message": "Batch ingestion completed",
  "data": {
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0,
      "skipped": 0
    },
    "details": [
      {
        "success": true,
        "game_id": "ncaa-basketball-d1-20240115-duke-blue-devils-vs-north-carolina-tar-heels",
        "action": "created",
        "entities_created": {
          "teams": 2,
          "conferences": 0
        }
      },
      {
        "success": true,
        "game_id": "ncaa-basketball-d1-20240115-kentucky-wildcats-vs-tennessee-volunteers",
        "action": "created",
        "entities_created": {
          "teams": 2,
          "conferences": 0
        }
      }
    ]
  }
}
```

### 3. Validate Game Data

**POST** `/api/v1/ncaa/ingest/validate`

Validate NCAA game data without ingesting it.

#### Request Body

Same as single game ingestion.

#### Response

```json
{
  "success": true,
  "message": "NCAA game data is valid",
  "data": {
    "valid": true,
    "game_id": "ncaa-basketball-d1-20240115-duke-blue-devils-vs-north-carolina-tar-heels"
  }
}
```

### 4. Health Check

**GET** `/api/v1/ncaa/ingest/health`

Check the health status of the NCAA ingestion service.

#### Response

```json
{
  "success": true,
  "message": "NCAA Ingestion Service is healthy",
  "data": {
    "service": "ncaa-ingestion",
    "status": "healthy",
    "timestamp": "2024-01-15T20:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Features

### Automatic Entity Creation

The API automatically creates missing teams and conferences when they are encountered:

- **Teams**: Created with sport, division, gender, and conference information
- **Conferences**: Created with sport, division, and gender information
- **Game IDs**: Generated using NCAA game ID or constructed from game data

### Idempotency

The endpoint is idempotent - calling it multiple times with the same data will not create duplicate records:

- Uses NCAA game ID or generated game ID to check for existing games
- Returns appropriate status codes (201 for new, 200 for existing)
- No duplicate teams or conferences are created

### Data Validation

Comprehensive validation ensures data quality:

- Required field validation
- Sport, division, and gender validation
- Date format validation (YYYY-MM-DD)
- Score and status validation

### Batch Processing

Support for ingesting multiple games efficiently:

- Maximum batch size: 100 games
- Individual game processing with detailed results
- Summary statistics for the entire batch

## Supported Sports

- soccer
- football
- basketball
- baseball
- softball
- volleyball
- tennis
- golf
- swimming
- track
- cross-country
- lacrosse
- field-hockey
- ice-hockey
- wrestling
- gymnastics
- rowing
- sailing

## Supported Divisions

- d1 (Division I)
- d2 (Division II)
- d3 (Division III)
- naia (NAIA)
- njcaa (NJCAA)

## Supported Genders

- men
- women
- mixed

## Error Handling

The API provides detailed error information:

- **400 Bad Request**: Validation errors, missing fields, invalid data
- **500 Internal Server Error**: Server-side processing errors
- **Detailed error messages** with specific field information

## Rate Limiting

Standard API rate limiting applies:
- 100 requests per 15 minutes (configurable)
- Batch requests count as single requests

## Example Usage

### cURL - Single Game

```bash
curl -X POST http://localhost:3000/api/v1/ncaa/ingest/game \
  -H "Content-Type: application/json" \
  -d '{
    "home_team": "Duke Blue Devils",
    "away_team": "North Carolina Tar Heels",
    "sport": "basketball",
    "division": "d1",
    "date": "2024-01-15",
    "gender": "men",
    "home_conference": "ACC",
    "away_conference": "ACC"
  }'
```

### cURL - Batch Games

```bash
curl -X POST http://localhost:3000/api/v1/ncaa/ingest/games \
  -H "Content-Type: application/json" \
  -d '[
    {
      "home_team": "Duke Blue Devils",
      "away_team": "North Carolina Tar Heels",
      "sport": "basketball",
      "division": "d1",
      "date": "2024-01-15"
    }
  ]'
```

## Integration with Scoreboard Platform

This endpoint is designed to work with the NCAA scoreboard platform:

- **Data Source**: `ncaa_official`
- **Game ID Format**: `ncaa-{sport}-{division}-{date}-{home-team}-vs-{away-team}`
- **Automatic Entity Management**: Teams and conferences are created as needed
- **Idempotent Operations**: Safe to call multiple times

## Database Schema

The API automatically manages these database tables:

- **games**: Game records with team and conference relationships
- **teams**: Team information with conference associations
- **conferences**: Conference information by sport, division, and gender

All entities include audit fields (created_at, updated_at) and proper indexing for performance.
