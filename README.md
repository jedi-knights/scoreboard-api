# Scoreboard API

A modern, scalable Express.js API for the Scoreboard application, built with SOLID principles and design patterns.

## 🏗️ Architecture

This API follows a clean, layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Repositories**: Abstract data access
- **Database Adapters**: Provide database-specific implementations
- **Routes**: Define API endpoints

### Design Patterns Used

- **Repository Pattern**: Abstracts data access logic
- **Strategy Pattern**: Allows easy switching between database backends
- **Factory Pattern**: Creates appropriate database adapters
- **Service Layer Pattern**: Separates business logic from controllers
- **MVC Pattern**: Organizes code into Model-View-Controller layers

### Entity Relationship Diagram

The API manages the following optimized entities and their relationships. This diagram shows the fully optimized 3NF database schema with advanced indexing, enhanced constraints, and performance optimizations:

**Note**: The Mermaid diagram below will render in GitHub and other Markdown viewers that support Mermaid syntax.

```mermaid
erDiagram
    COUNTRIES {
        uuid id PK
        string code
        string name
        timestamp created_at
    }

    STATES {
        uuid id PK
        uuid country_id FK
        string code
        string name
        timestamp created_at
    }

    CITIES {
        uuid id PK
        uuid state_id FK
        string name
        timestamp created_at
    }

    POSTAL_CODES {
        uuid id PK
        uuid city_id FK
        string code
        timestamp created_at
    }

    SPORTS {
        uuid id PK
        enum name
        text description
        boolean is_team_sport
        int max_players
        int min_players
        timestamp created_at
    }

    VENUES {
        uuid id PK
        string name
        uuid postal_code_id FK
        text address_line_1
        text address_line_2
        decimal latitude
        decimal longitude
        int capacity
        enum surface_type
        string website
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    VENUE_AMENITIES {
        uuid id PK
        uuid venue_id FK
        string amenity_name
        text amenity_value
        timestamp created_at
    }

    LEAGUE_LEVELS {
        uuid id PK
        string name
        text description
        int sort_order
        timestamp created_at
    }

    LEAGUES {
        uuid id PK
        string name
        uuid sport_id FK
        uuid level_id FK
        uuid parent_league_id FK
        text description
        string website
        string logo_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    REGIONS {
        uuid id PK
        enum name
        text description
        timestamp created_at
    }

    CONFERENCES {
        uuid id PK
        string name
        uuid sport_id FK
        uuid division_id FK
        uuid region_id FK
        string website
        string logo_url
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    SEASON_STATUSES {
        uuid id PK
        string name
        text description
        int sort_order
        timestamp created_at
    }

    SEASONS {
        uuid id PK
        string name
        uuid sport_id FK
        string year
        date start_date
        date end_date
        uuid status_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    SEASON_RULES {
        uuid id PK
        uuid season_id FK
        string rule_name
        text rule_value
        timestamp created_at
    }

    TEAM_GENDER {
        uuid id PK
        enum name
        text description
        int sort_order
        timestamp created_at
    }

    TEAM_LEVEL {
        uuid id PK
        enum name
        text description
        int sort_order
        timestamp created_at
    }

    TEAM_DIVISION {
        uuid id PK
        enum name
        text description
        int sort_order
        timestamp created_at
    }

    TEAMS {
        uuid id PK
        string external_id
        string name
        string short_name
        string mascot
        string logo_url
        string website
        uuid sport_id FK
        uuid gender_id FK
        uuid level_id FK
        uuid division_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TEAM_COLORS {
        uuid id PK
        uuid team_id FK
        string color_name
        string color_value
        timestamp created_at
    }

    TEAM_CONFERENCES {
        uuid id PK
        uuid team_id FK
        uuid conference_id FK
        date start_date
        date end_date
        enum status
        timestamp created_at
        timestamp updated_at
    }

    COLLECTION_STATUS {
        uuid id PK
        enum name
        text description
        int sort_order
        timestamp created_at
    }

    COLLECTIONS {
        uuid id PK
        string external_id
        string name
        text description
        uuid sport_id FK
        uuid gender_id FK
        uuid division_id FK
        uuid season_id FK
        string data_source
        uuid status_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TEAM_COLLECTIONS {
        uuid id PK
        uuid team_id FK
        uuid collection_id FK
        string role
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
    }

    GAME_STATUS {
        uuid id PK
        enum name
        text description
        int sort_order
        timestamp created_at
    }

    GAMES {
        uuid id PK
        string external_id
        string data_source
        uuid league_id FK
        uuid season_id FK
        date date
        time time
        uuid home_team_id FK
        uuid away_team_id FK
        uuid sport_id FK
        int home_score
        int away_score
        uuid status_id FK
        string current_period
        uuid venue_id FK
        text notes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    GAME_PERIOD_SCORES {
        uuid id PK
        uuid game_id FK
        string period_name
        int home_score
        int away_score
        timestamp created_at
    }

    GAME_BROADCASTS {
        uuid id PK
        uuid game_id FK
        string network
        string channel
        timestamp start_time
        timestamp end_time
        timestamp created_at
    }

    SCHEDULES {
        uuid id PK
        string external_id
        uuid team_id FK
        uuid season_id FK
        uuid sport_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    SCHEDULE_GAMES {
        uuid id PK
        uuid schedule_id FK
        uuid game_id FK
        int game_order
        timestamp created_at
    }

    STATISTIC_TYPES {
        uuid id PK
        string name
        string category
        string unit
        text description
        boolean is_numeric
        decimal min_value
        decimal max_value
        timestamp created_at
    }

    GAME_STATISTICS {
        uuid id PK
        uuid game_id FK
        uuid team_id FK
        uuid statistic_type_id FK
        decimal value
        string period
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_ACTIONS {
        uuid id PK
        string name
        text description
        timestamp created_at
    }

    AUDIT_LOG {
        uuid id PK
        string table_name
        uuid record_id
        uuid action_id FK
        json old_values
        json new_values
        string changed_by
        timestamp changed_at
        inet ip_address
        text user_agent
    }

    COUNTRIES ||--o{ STATES : "contains"
    STATES ||--o{ CITIES : "contains"
    CITIES ||--o{ POSTAL_CODES : "has"
    POSTAL_CODES ||--o{ VENUES : "locates"
    VENUES ||--o{ VENUE_AMENITIES : "provides"
    VENUES ||--o{ GAMES : "hosts"
    
    SPORTS ||--o{ LEAGUES : "organizes"
    SPORTS ||--o{ CONFERENCES : "organizes"
    SPORTS ||--o{ SEASONS : "defines"
    SPORTS ||--o{ TEAMS : "plays"
    SPORTS ||--o{ COLLECTIONS : "groups"
    SPORTS ||--o{ GAMES : "played_in"
    SPORTS ||--o{ SCHEDULES : "scheduled_for"
    
    LEAGUE_LEVELS ||--o{ LEAGUES : "categorizes"
    LEAGUE_LEVELS ||--o{ CONFERENCES : "categorizes"
    LEAGUE_LEVELS ||--o{ TEAMS : "categorizes"
    LEAGUE_LEVELS ||--o{ COLLECTIONS : "categorizes"
    
    LEAGUES ||--o{ LEAGUES : "parent_child"
    LEAGUES ||--o{ GAMES : "organizes"
    
    REGIONS ||--o{ CONFERENCES : "locates"
    
    CONFERENCES ||--o{ TEAM_CONFERENCES : "includes"
    TEAMS ||--o{ TEAM_CONFERENCES : "participates"
    
    SEASON_STATUSES ||--o{ SEASONS : "defines_status"
    SEASONS ||--o{ SEASON_RULES : "has_rules"
    SEASONS ||--o{ COLLECTIONS : "defines"
    SEASONS ||--o{ GAMES : "contains"
    SEASONS ||--o{ SCHEDULES : "schedules"
    
    TEAM_GENDER ||--o{ TEAMS : "categorizes"
    TEAM_LEVEL ||--o{ TEAMS : "categorizes"
    TEAM_DIVISION ||--o{ TEAMS : "categorizes"
    
    TEAMS ||--o{ TEAM_COLORS : "has_colors"
    TEAMS ||--o{ TEAM_COLLECTIONS : "participates"
    TEAMS ||--o{ GAMES : "home_team"
    TEAMS ||--o{ GAMES : "away_team"
    TEAMS ||--o{ GAME_STATISTICS : "generates"
    TEAMS ||--o{ SCHEDULES : "has_schedule"
    
    COLLECTION_STATUS ||--o{ COLLECTIONS : "defines_status"
    COLLECTIONS ||--o{ TEAM_COLLECTIONS : "includes"
    
    GAME_STATUS ||--o{ GAMES : "defines_status"
    GAMES ||--o{ GAME_PERIOD_SCORES : "has_scores"
    GAMES ||--o{ GAME_BROADCASTS : "broadcast_on"
    GAMES ||--o{ GAME_STATISTICS : "tracks_stats"
    GAMES ||--o{ SCHEDULE_GAMES : "scheduled_in"
    
    SCHEDULES ||--o{ SCHEDULE_GAMES : "contains"
    
    STATISTIC_TYPES ||--o{ GAME_STATISTICS : "defines_type"
    
    AUDIT_ACTIONS ||--o{ AUDIT_LOG : "defines_action"
```

#### Entity Descriptions

**LOCATION HIERARCHY** - Normalized location management
- **COUNTRIES**: ISO 3166-1 alpha-3 country codes and names
- **STATES**: State/province codes and names linked to countries
- **CITIES**: City names linked to states
- **POSTAL_CODES**: Postal codes linked to cities
- **Benefits**: Eliminates location duplication, enables geospatial queries

**SPORTS** - Enhanced sports classification
- **Primary Key**: `id` (UUID)
- **Features**: Team vs. individual sport classification, player count limits
- **Benefits**: Better sports organization and validation

**VENUES** - Physical locations where games are played
- **Primary Key**: `id` (UUID)
- **Features**: Geospatial coordinates, capacity, surface type, active status
- **Benefits**: Normalized location data, soft delete support, performance optimization

**VENUE_AMENITIES** - Venue-specific features and services
- **Purpose**: Store venue amenities as key-value pairs
- **Benefits**: Flexible amenity management without schema changes

**LEAGUE_LEVELS** - Hierarchical organization of sports competitions
- **Primary Key**: `id` (UUID)
- **Features**: Sort order for consistent UI display
- **Benefits**: Standardized league categorization across sports

**LEAGUES** - Sports league organization
- **Primary Key**: `id` (UUID)
- **Structure**: Proper foreign keys to sports and levels, parent-child relationships
- **Benefits**: Full 3NF compliance, optimized queries

**REGIONS** - Geographic region classification
- **Purpose**: Organize conferences by geographic regions
- **Benefits**: Better regional organization and reporting

**CONFERENCES** - Athletic conferences that organize teams
- **Primary Key**: `id` (UUID)
- **Attributes**: Proper foreign keys, active status, optimized relationships
- **Benefits**: Better performance, data integrity, soft delete support

**SEASON_STATUSES** - Season lifecycle management
- **Features**: Sort order for consistent display, comprehensive status tracking
- **Benefits**: Better season management and reporting

**SEASONS** - Time-bound periods for sports competitions
- **Primary Key**: `id` (UUID)
- **Features**: Proper foreign keys, active status, date validation
- **Benefits**: Better organization, performance optimization

**SEASON_RULES** - Season-specific rules and regulations
- **Purpose**: Store season rules as key-value pairs
- **Benefits**: Flexible rule management without schema changes

**TEAM CATEGORIZATION** - Enhanced team classification
- **TEAM_GENDER**: Gender classification with sort order
- **TEAM_LEVEL**: Competition level with sort order
- **TEAM_DIVISION**: Division classification with sort order
- **Benefits**: Consistent categorization, better UI ordering

**TEAMS** - Represents sports teams with enhanced categorization
- **Primary Key**: `id` (UUID)
- **Attributes**: Proper foreign keys, active status, optimized relationships
- **Benefits**: Better performance, data integrity, soft delete support

**TEAM_COLORS** - Team color management
- **Purpose**: Store team colors as structured data
- **Benefits**: Better color management, validation, and reporting

**TEAM_CONFERENCES** - Junction table for team-conference relationships
- **Purpose**: Many-to-many relationship with temporal tracking
- **Features**: Enhanced status enum, date validation, performance optimization

**COLLECTION_STATUS** - Collection lifecycle management
- **Features**: Sort order for consistent display, comprehensive status tracking
- **Benefits**: Better collection management and reporting

**COLLECTIONS** - Groupings of related data or events
- **Primary Key**: `id` (UUID)
- **Enhancements**: Proper foreign keys, active status, optimized relationships
- **Benefits**: Better performance, data integrity, soft delete support

**TEAM_COLLECTIONS** - Junction table for team-collection relationships
- **Purpose**: Many-to-many relationship with role-based participation
- **Features**: Date validation, performance optimization

**GAME_STATUS** - Game lifecycle management
- **Features**: Sort order for consistent display, comprehensive status tracking
- **Benefits**: Better game management and reporting

**GAMES** - Core entity representing individual sporting events
- **Primary Key**: `id` (UUID)
- **Enhancements**: Proper foreign keys, active status, optimized relationships
- **Constraints**: CHECK constraints for data validation
- **Benefits**: Better performance, data integrity, soft delete support

**GAME_PERIOD_SCORES** - Normalized period score management
- **Purpose**: Store period scores as structured data instead of JSONB
- **Benefits**: Better query performance, data validation, reporting

**GAME_BROADCASTS** - Broadcast information management
- **Purpose**: Store broadcast details as structured data
- **Benefits**: Better broadcast management, validation, and reporting

**SCHEDULES** - Team schedules for specific seasons
- **Primary Key**: `id` (UUID)
- **Improvements**: Proper foreign keys, active status, optimized relationships
- **Benefits**: Better performance, data integrity, soft delete support

**SCHEDULE_GAMES** - Schedule-game relationship management
- **Purpose**: Many-to-many relationship with ordering support
- **Features**: Game order for consistent display
- **Benefits**: Better schedule management and reporting

**STATISTIC_TYPES** - Enhanced statistics classification
- **Features**: Category classification, unit specification, numeric validation
- **Benefits**: Better statistics organization, validation, and reporting

**GAME_STATISTICS** - Detailed statistics for games
- **Purpose**: Store comprehensive game statistics with proper typing
- **Structure**: Proper foreign keys, decimal values, period tracking
- **Benefits**: Better performance, data validation, reporting

**AUDIT_ACTIONS** - Audit action classification
- **Purpose**: Standardize audit action types
- **Benefits**: Better audit management and reporting

**AUDIT_LOG** - Comprehensive change tracking
- **Purpose**: Track all INSERT, UPDATE, DELETE operations
- **Features**: Enhanced tracking with IP addresses and user agents
- **Benefits**: Better security monitoring, compliance, fraud detection

#### Key Relationships

**Location Hierarchy**
- **COUNTRIES → STATES → CITIES → POSTAL_CODES → VENUES**: Normalized location chain
- **VENUES → VENUE_AMENITIES**: One-to-many relationship for flexible amenity management

**Sports Organization**
- **SPORTS → LEAGUES**: Sports organize leagues with proper categorization
- **SPORTS → CONFERENCES**: Sports organize conferences by region and division
- **SPORTS → SEASONS**: Sports define seasons with specific rules and statuses
- **SPORTS → TEAMS**: Sports categorize teams by gender, level, and division
- **SPORTS → COLLECTIONS**: Sports group related data and events
- **SPORTS → GAMES**: Sports are played in specific games
- **SPORTS → SCHEDULES**: Sports are scheduled for teams

**League Hierarchy**
- **LEAGUE_LEVELS → LEAGUES**: Standardized level categorization
- **LEAGUES → LEAGUES**: Parent-child relationships for hierarchical organization
- **LEAGUES → GAMES**: Leagues organize and host games

**Geographic Organization**
- **REGIONS → CONFERENCES**: Geographic regions organize conferences
- **CONFERENCES → TEAM_CONFERENCES**: Conferences include teams with temporal tracking
- **TEAMS → TEAM_CONFERENCES**: Teams participate in conferences

**Season Management**
- **SEASON_STATUSES → SEASONS**: Status management for season lifecycle
- **SEASONS → SEASON_RULES**: Seasons have specific rules and regulations
- **SEASONS → COLLECTIONS**: Seasons define data collection periods
- **SEASONS → GAMES**: Seasons contain scheduled games
- **SEASONS → SCHEDULES**: Seasons organize team schedules

**Team Categorization**
- **TEAM_GENDER → TEAMS**: Gender classification for teams
- **TEAM_LEVEL → TEAMS**: Competition level classification
- **TEAM_DIVISION → TEAMS**: Division classification
- **TEAMS → TEAM_COLORS**: Teams have specific color schemes
- **TEAMS → TEAM_COLLECTIONS**: Teams participate in collections
- **TEAMS → GAMES**: Teams play as home or away teams
- **TEAMS → GAME_STATISTICS**: Teams generate game statistics
- **TEAMS → SCHEDULES**: Teams have season schedules

**Collection Management**
- **COLLECTION_STATUS → COLLECTIONS**: Status management for collections
- **COLLECTIONS → TEAM_COLLECTIONS**: Collections include teams with role assignment

**Game Management**
- **GAME_STATUS → GAMES**: Status management for game lifecycle
- **GAMES → GAME_PERIOD_SCORES**: Games have detailed period scoring
- **GAMES → GAME_BROADCASTS**: Games are broadcast on specific networks
- **GAMES → GAME_STATISTICS**: Games track comprehensive statistics
- **GAMES → SCHEDULE_GAMES**: Games are scheduled in team schedules

**Schedule Organization**
- **SCHEDULES → SCHEDULE_GAMES**: Schedules contain ordered games

**Statistics Management**
- **STATISTIC_TYPES → GAME_STATISTICS**: Standardized statistics classification

**Audit and Security**
- **AUDIT_ACTIONS → AUDIT_LOG**: Standardized audit action tracking

**Data Integrity Features**
- **Foreign Key Constraints**: All relationships are properly enforced
- **ENUM Constraints**: Status fields use predefined values for consistency
- **CHECK Constraints**: Business rules are enforced at the database level
- **Soft Deletes**: `is_active` flags instead of hard deletes for data preservation

**Performance Optimization**
- **Advanced Indexing**: Trigram indexes, conditional indexes, composite indexes
- **Normalized Structure**: Full 3NF compliance for optimal query performance
- **Temporal Optimization**: Date-based partitioning and indexing for time-series queries

#### Alternative Text Representation

If the Mermaid diagram doesn't render, here's a text-based representation of the optimized schema:

```
LOCATION HIERARCHY
COUNTRIES → STATES → CITIES → POSTAL_CODES → VENUES
VENUES → VENUE_AMENITIES (key-value pairs)

SPORTS ORGANIZATION
SPORTS → LEAGUES (with levels and parent-child relationships)
SPORTS → CONFERENCES (by region and division)
SPORTS → SEASONS (with statuses and rules)
SPORTS → TEAMS (by gender, level, division)
SPORTS → COLLECTIONS (grouped data and events)
SPORTS → GAMES (scheduled events)
SPORTS → SCHEDULES (team schedules)

LEAGUE HIERARCHY
LEAGUE_LEVELS → LEAGUES (standardized categorization)
LEAGUES → LEAGUES (parent-child relationships)
LEAGUES → GAMES (organized events)

GEOGRAPHIC ORGANIZATION
REGIONS → CONFERENCES (geographic grouping)
CONFERENCES → TEAM_CONFERENCES (temporal team membership)
TEAMS → TEAM_CONFERENCES (conference participation)

SEASON MANAGEMENT
SEASON_STATUSES → SEASONS (lifecycle management)
SEASONS → SEASON_RULES (key-value pairs)
SEASONS → COLLECTIONS (data periods)
SEASONS → GAMES (scheduled events)
SEASONS → SCHEDULES (team schedules)

TEAM CATEGORIZATION
TEAM_GENDER → TEAMS (gender classification)
TEAM_LEVEL → TEAMS (competition level)
TEAM_DIVISION → TEAMS (division classification)
TEAMS → TEAM_COLORS (color schemes)
TEAMS → TEAM_COLLECTIONS (collection participation)
TEAMS → GAMES (home/away teams)
TEAMS → GAME_STATISTICS (performance data)
TEAMS → SCHEDULES (season schedules)

COLLECTION MANAGEMENT
COLLECTION_STATUS → COLLECTIONS (lifecycle management)
COLLECTIONS → TEAM_COLLECTIONS (role-based participation)

GAME MANAGEMENT
GAME_STATUS → GAMES (lifecycle management)
GAMES → GAME_PERIOD_SCORES (detailed scoring)
GAMES → GAME_BROADCASTS (broadcast information)
GAMES → GAME_STATISTICS (performance metrics)
GAMES → SCHEDULE_GAMES (schedule integration)

SCHEDULE ORGANIZATION
SCHEDULES → SCHEDULE_GAMES (ordered game lists)

STATISTICS MANAGEMENT
STATISTIC_TYPES → GAME_STATISTICS (standardized metrics)

AUDIT AND SECURITY
AUDIT_ACTIONS → AUDIT_LOG (change tracking with IP/user agent)

KEY FEATURES
- Full 3NF normalization
- Soft deletes (is_active flags)
- Advanced indexing (trigram, conditional, composite)
- Performance optimization
- Data integrity constraints
- Comprehensive audit logging
```

*PK = Primary Key, FK = Foreign Key

### Code Quality Standards

The project maintains high code quality through automated tools and best practices:

#### Cyclomatic Complexity

- **Maximum Threshold**: 10 (enforced by ESLint)
- **Purpose**: Ensures methods remain maintainable and testable
- **Benefits**: 
  - Easier to understand and debug
  - Simpler to unit test
  - Reduced cognitive load for developers
  - Better code maintainability

#### Code Quality Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (via ESLint rules)
- **Jest**: Testing framework with coverage reporting
- **Testcontainers**: Integration testing with real databases

#### Quality Gates

- ✅ **Linting**: All ESLint rules must pass
- ✅ **Complexity**: Methods under 10 cyclomatic complexity
- ✅ **Coverage**: Minimum 80% test coverage
- ✅ **Tests**: All tests must pass
- ✅ **Security**: No known vulnerabilities

#### Recent Quality Improvements

The project recently underwent a comprehensive refactoring to improve code quality and maintainability:

##### Cyclomatic Complexity Refactoring

**Methods Refactored:**
- **`validateConfig`** (was 14, now < 10): Split into focused validation methods
- **`sanitizeFilters`** (was 16, now < 10): Extracted string and status validation helpers
- **`sanitizeOptions`** (was 11, now < 10): Separated into limit, offset, sort, and order methods
- **`findAll`** (was 14, now < 10): Broke down into filter-specific builder methods
- **`create`** (was 15, now < 10): Split parameter building into focused functions
- **`_buildGameParams`** (was 13, now < 10): Composed from smaller, focused helpers

**Refactoring Benefits:**
- **Maintainability**: Each method has a single responsibility
- **Readability**: Logic is easier to understand and follow
- **Testability**: Smaller methods are easier to unit test
- **Reusability**: Helper methods can be reused elsewhere
- **Performance**: Reduced nested conditionals and early returns

**Design Patterns Applied:**
- **Extract Method**: Breaking complex methods into smaller ones
- **Template Method**: Common patterns in filter building
- **Strategy**: Different validation strategies for different data types
- **Composition**: Building complex objects from simpler parts

## 🚀 Features

- **Multi-Database Support**: SQLite, PostgreSQL, and DynamoDB
- **RESTful API**: Follows REST conventions
- **Authentication Ready**: JWT-based authentication support
- **Rate Limiting**: Built-in request throttling
- **Health Checks**: Comprehensive health monitoring
- **CORS Support**: Configurable cross-origin requests
- **Security**: Helmet.js security headers
- **Logging**: Structured logging with Winston
- **Validation**: Input validation with Joi
- **Docker Support**: Containerized deployment
- **Testing**: Comprehensive testing with Jest and Testcontainers
- **CI/CD**: Automated workflows with GitHub Actions

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment and integration testing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scoreboard-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Quick Start

### View API Documentation
Once your server is running, you can access the interactive API documentation:

1. **Open your browser** to: `http://localhost:3000/api-docs`
2. **Explore endpoints** organized by tags (Health, Games, Teams, etc.)
3. **Test endpoints** directly from the Swagger UI
4. **View schemas** for request/response data structures

### Test the API
```bash
# Test Swagger documentation endpoints
npm run test:swagger

# Test API functionality
npm run test:integration
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_TYPE` | Database backend (sqlite/postgres/dynamodb) | `sqlite` |
| `SQLITE_DATABASE_PATH` | SQLite database file path | `./data/scoreboard.db` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DATABASE` | PostgreSQL database name | `scoreboard` |
| `DYNAMODB_REGION` | DynamoDB region | `us-east-1` |

### Database Configuration

The API supports multiple database backends:

#### SQLite (Default)
- File-based database
- Perfect for development and testing
- No additional setup required

#### PostgreSQL
- Robust relational database
- Requires PostgreSQL server
- Uses connection pooling

#### DynamoDB
- AWS NoSQL database
- Supports local development with DynamoDB Local
- Scalable and managed

## 🧪 Testing

The API includes a comprehensive testing setup with both unit and integration tests using Jest and Testcontainers.

### Test Types

#### Unit Tests
- **Location**: `tests/unit/`
- **Purpose**: Test business logic without external dependencies
- **Speed**: Fast execution (< 5 seconds)
- **Dependencies**: Mocked database and external services
- **Coverage**: Business logic, validation, and utility functions

#### Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test API endpoints with real databases
- **Speed**: Slower execution (30-60 seconds)
- **Dependencies**: Real database instances via Testcontainers
- **Coverage**: End-to-end API functionality, database operations

### Test Setup

#### Jest Configuration
- **ES Modules Support**: Full ES6+ module support
- **Coverage Thresholds**: 80% minimum coverage required
- **Separate Configs**: Different timeouts and setups for unit vs integration tests
- **Mock Management**: Automatic cleanup between tests

#### Testcontainers Integration
- **PostgreSQL**: Spins up real PostgreSQL containers for testing
- **SQLite**: Uses local file-based database for fast testing
- **Automatic Cleanup**: Containers are automatically started/stopped
- **Isolated Testing**: Each test gets a clean database state

### Running Tests

```bash
# Run all tests
npm test

# Run only unit tests (fast)
npm run test:unit

# Run only integration tests (slower, requires Docker)
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run integration tests in watch mode
npm run test:integration:watch
```

### Test Environment Variables

```bash
# Set test database type
TEST_DATABASE=sqlite        # Use SQLite (default, fastest)
TEST_DATABASE=postgres      # Use PostgreSQL container (slower, more realistic)

# Set test environment
NODE_ENV=test              # Automatically set by test scripts
```

### Test Database Options

#### SQLite (Default)
- **Pros**: Fast, no Docker required, file-based
- **Cons**: Less realistic, different SQL dialect
- **Use Case**: Development, CI/CD, fast feedback

#### PostgreSQL (Testcontainers)
- **Pros**: Real database, production-like behavior, full SQL support
- **Cons**: Slower startup, requires Docker
- **Use Case**: Integration testing, production validation

### Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── setup-unit.js              # Unit test setup (mocks)
├── setup-integration.js       # Integration test setup (Testcontainers)
├── unit/                      # Unit tests
│   ├── services/             # Service layer tests
│   ├── controllers/          # Controller tests
│   └── utils/                # Utility function tests
└── integration/               # Integration tests
    ├── api/                  # API endpoint tests
    ├── database/             # Database operation tests
    └── end-to-end/           # Full workflow tests
```

### Writing Tests

#### Unit Test Example
```javascript
import { GamesService } from '../../../src/services/games-service.js';

describe('GamesService', () => {
  let gamesService;
  let mockDatabaseAdapter;

  beforeEach(() => {
    mockDatabaseAdapter = global.unitTestUtils.createMockDatabaseAdapter();
    gamesService = new GamesService(mockDatabaseAdapter);
  });

  it('should sanitize valid filters', () => {
    const filters = { sport: ' SOCCER ' };
    const result = gamesService.sanitizeFilters(filters);
    expect(result.sport).toBe('soccer');
  });
});
```

#### Integration Test Example
```javascript
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import { DatabaseFactory } from '../../../src/database/database-factory.js';

describe('Games API Integration', () => {
  let app;
  let databaseAdapter;

  beforeAll(async () => {
    // Get test database config
    const testConfig = global.integrationTestUtils.getTestDatabaseConfig('sqlite');
    
    // Create real database adapter
    databaseAdapter = DatabaseFactory.createAdapter(testConfig.config);
    await databaseAdapter.connect();
    
    // Create Express app
    app = createApp(databaseAdapter);
  });

  it('should create and retrieve a game', async () => {
    const gameData = global.testUtils.generateTestGame();
    
    // Create game
    const createResponse = await request(app)
      .post('/api/v1/games')
      .send(gameData);
    
    expect(createResponse.status).toBe(201);
    
    // Retrieve game
    const getResponse = await request(app)
      .get(`/api/v1/games/${gameData.game_id}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.game_id).toBe(gameData.game_id);
  });
});
```

### Test Utilities

#### Global Test Utils
- `testUtils.generateTestGame()`: Generate random game data
- `testUtils.generateTestTeam()`: Generate random team data
- `testUtils.randomString()`: Generate random strings
- `testUtils.randomDate()`: Generate random dates

#### Unit Test Utils
- `unitTestUtils.createMockDatabaseAdapter()`: Create mock database
- `unitTestUtils.createMockRequest()`: Create mock HTTP request
- `unitTestUtils.createMockResponse()`: Create mock HTTP response

#### Integration Test Utils
- `integrationTestUtils.setupPostgresContainer()`: Start PostgreSQL container
- `integrationTestUtils.getTestDatabaseConfig()`: Get database configuration
- `integrationTestUtils.cleanupPostgresContainer()`: Stop PostgreSQL container

### Test Coverage

The testing setup enforces 80% minimum coverage across:
- **Branches**: All code paths are tested
- **Functions**: All functions have tests
- **Lines**: All lines of code are executed
- **Statements**: All statements are covered

### Continuous Integration

The test setup is designed for CI/CD pipelines:
- **Fast Unit Tests**: Quick feedback on code changes
- **Comprehensive Integration Tests**: Validate production behavior
- **Coverage Reports**: Track test quality over time
- **Docker Support**: Consistent testing environment

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔧 Development

### Project Structure
```
src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── database/         # Database abstraction layer
│   ├── adapters/    # Database implementations
│   └── repositories/ # Data access layer
├── middleware/       # Express middleware
├── models/          # Data models
├── routes/          # API endpoint definitions
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation
├── app.js           # Express application setup
└── index.js         # Application entry point
```

### Adding New Features

1. **Create Repository**: Extend `BaseRepository`
2. **Create Service**: Implement business logic
3. **Create Controller**: Handle HTTP requests
4. **Create Routes**: Define API endpoints
5. **Add Validation**: Create validation schemas
6. **Write Tests**: Ensure code coverage

### Database Migration

When adding new database backends:

1. Create adapter extending `BaseDatabaseAdapter`
2. Update `DatabaseFactory`
3. Add configuration options
4. Update Docker Compose configuration

## 🚀 CI/CD & Deployment

### GitHub Actions Workflows

The project includes comprehensive CI/CD workflows that automatically validate code quality and run tests:

#### Main CI Workflow (`ci.yml`)
- **Triggers**: Push to main/develop, PRs, manual dispatch
- **Validation**: Linting, unit tests, integration tests, security audit
- **Matrix Testing**: Node.js 18/20, multiple OS, multiple databases
- **Quality Gates**: 80% coverage, complexity < 10, no security issues
- **Docker**: Build and test container images
- **Performance**: API response time validation

#### Quick PR Check (`pr-check.yml`)
- **Purpose**: Fast validation for pull requests
- **Timeout**: 10 minutes maximum
- **Focus**: Essential checks only (linting, unit tests, coverage)
- **Benefits**: Quick feedback, prevents obvious issues

#### Security Workflow (`security.yml`)
- **Schedule**: Daily at 2 AM UTC
- **Features**: Dependency updates, security scanning, CodeQL analysis
- **Container Security**: Trivy vulnerability scanner
- **Automation**: Issue creation for security updates

#### Workflow Benefits

- **Fast Feedback Loop**: Quick PR validation → comprehensive testing
- **Progressive Validation**: Basic → integration → security → performance
- **Fail-Fast Approach**: Stop on first failure to save resources
- **Matrix Testing**: Multiple environments and configurations
- **Automated Reporting**: PR comments and coverage reports

### Quality Gates

Your code must pass all of these to be considered valid:
- ✅ **All tests pass** (unit + integration)
- ✅ **80% test coverage** minimum
- ✅ **No security vulnerabilities**
- ✅ **Linting passes** without errors
- ✅ **Docker builds** successfully
- ✅ **API endpoints** respond correctly
- ✅ **Performance** within acceptable limits
- ✅ **Complexity** under 10 threshold

## 🚀 Deployment

### Production Considerations

- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set secure JWT secrets
- Enable rate limiting
- Configure logging
- Set up monitoring and health checks

### Environment-Specific Configs

- **Development**: SQLite, verbose logging, CORS enabled
- **Staging**: PostgreSQL, moderate logging, CORS restricted
- **Production**: PostgreSQL/DynamoDB, minimal logging, strict CORS

## 📊 Monitoring

### Health Checks
- `/health/liveness` - Kubernetes liveness probe
- `/health/readiness` - Kubernetes readiness probe
- `/health/detailed` - Comprehensive system status

### Metrics
- Request duration logging
- Database connection status
- Memory usage monitoring
- Error rate tracking

## 📖 **Documentation**

### API Documentation
- **[Swagger API Documentation](docs/swagger-documentation.md)** - Interactive API documentation with automatic generation
- **[Docker Swagger Integration](docs/docker-swagger-integration.md)** - How Swagger works in Docker containers
- **Live Swagger UI**: `http://localhost:3000/api-docs` (when running locally)
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

### Database Design
- **[Entity Design Improvements](docs/entity-improvements.md)** - Comprehensive overview of entity design enhancements
- **[3NF Database Schema](docs/3nf-improvements.md)** - Detailed explanation of Third Normal Form compliance

### Development & Deployment
- **[Ignore Files Guide](docs/ignore-files-guide.md)** - What to ignore in Git and Docker

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new features (maintain 80% coverage)
3. Maintain code quality standards
4. Update documentation
5. Follow commit message conventions

### Conventional Commits

This project follows the [Angular Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This ensures consistent commit history and enables automated tools for versioning and changelog generation.

#### Commit Message Format

```
type(scope): description

[optional body]

[optional footer(s)]
```

#### Commit Types

- **`feat:`** - New features
- **`fix:`** - Bug fixes
- **`docs:`** - Documentation changes
- **`style:`** - Code style changes (formatting, etc.)
- **`refactor:`** - Code refactoring
- **`test:`** - Adding or updating tests
- **`chore:`** - Maintenance tasks
- **`perf:`** - Performance improvements
- **`ci:`** - CI/CD changes
- **`build:`** - Build system changes

#### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT authentication middleware"

# Bug fix
git commit -m "fix(database): resolve connection timeout issues"

# Refactoring
git commit -m "refactor(services): reduce method complexity"

# Documentation
git commit -m "docs(api): update endpoint documentation"

# Breaking change
git commit -m "feat(api): change response format

BREAKING CHANGE: API responses now return data in 'result' field"
```

#### Benefits

- **Automated Versioning**: Semantic versioning based on commit types
- **Changelog Generation**: Automatic creation of detailed release notes
- **CI/CD Integration**: Trigger appropriate workflows based on commit type
- **Team Communication**: Clear understanding of what type of change was made
- **Release Management**: Easy identification of breaking changes

### Testing Guidelines

1. **Unit Tests**: Write for all business logic
2. **Integration Tests**: Write for all API endpoints
3. **Coverage**: Maintain 80% minimum coverage
4. **Test Data**: Use test utilities for consistent data
5. **Cleanup**: Ensure tests clean up after themselves

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues or questions:
- Check the documentation
- Review the code examples
- Open an issue in the repository
- Contact the development team
