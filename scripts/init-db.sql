-- Optimized 3NF-Compliant PostgreSQL Database Schema for Scoreboard API
-- This schema includes performance optimizations, better constraints, and additional features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For trigram indexes on text fields
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes on UUID arrays

-- Create ENUMs for better data integrity
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled');
CREATE TYPE team_division AS ENUM ('D1', 'D2', 'D3', 'professional', 'amateur', 'club');
CREATE TYPE team_level AS ENUM ('college', 'professional', 'amateur', 'youth', 'club');
CREATE TYPE team_gender AS ENUM ('men', 'women', 'coed', 'mixed');
CREATE TYPE collection_status AS ENUM ('active', 'inactive', 'archived', 'draft');
CREATE TYPE sport_type AS ENUM ('football', 'basketball', 'soccer', 'baseball', 'softball', 'volleyball', 'tennis', 'golf', 'swimming', 'track', 'hockey', 'lacrosse', 'wrestling', 'gymnastics', 'cross_country', 'field_hockey', 'water_polo');
CREATE TYPE region_type AS ENUM ('northeast', 'southeast', 'midwest', 'west', 'southwest', 'northwest', 'central');
CREATE TYPE surface_type AS ENUM ('grass', 'turf', 'hardwood', 'clay', 'concrete', 'dirt', 'synthetic', 'ice', 'sand');
CREATE TYPE team_conference_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- ============================================================================
-- LOCATION ENTITIES (1NF - Atomic values) - OPTIMIZED
-- ============================================================================

-- Countries table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- States/Provinces table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- State/province code
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, code)
);

-- Cities table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

-- Postal codes table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS postal_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city_id, code)
);

-- ============================================================================
-- SPORTS ENTITIES (1NF - Atomic values) - OPTIMIZED
-- ============================================================================

-- Sports table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name sport_type NOT NULL UNIQUE,
    description TEXT,
    is_team_sport BOOLEAN NOT NULL DEFAULT true,
    max_players INTEGER,
    min_players INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VENUE ENTITIES (2NF - No partial dependencies) - OPTIMIZED
-- ============================================================================

-- Venues table (2NF - no partial dependencies on composite keys)
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    postal_code_id UUID NOT NULL REFERENCES postal_codes(id) ON DELETE CASCADE,
    address_line_1 TEXT,
    address_line_2 TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER CHECK (capacity > 0),
    surface_type surface_type,
    website VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, postal_code_id)
);

-- Venue amenities table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS venue_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    amenity_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(venue_id, amenity_name)
);

-- ============================================================================
-- LEAGUE ENTITIES (2NF - No partial dependencies) - OPTIMIZED
-- ============================================================================

-- League levels table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS league_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0, -- For consistent ordering
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leagues table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES league_levels(id) ON DELETE CASCADE,
    parent_league_id UUID REFERENCES leagues(id),
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONFERENCE ENTITIES (2NF - No partial dependencies) - OPTIMIZED
-- ============================================================================

-- Regions table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name region_type NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conferences table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES league_levels(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEASON ENTITIES (2NF - No partial dependencies) - OPTIMIZED
-- ============================================================================

-- Season statuses table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS season_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    year VARCHAR(4) NOT NULL CHECK (year ~ '^[0-9]{4}$'),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status_id UUID NOT NULL REFERENCES season_statuses(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sport_id, year),
    CHECK (start_date <= end_date)
);

-- Season rules table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS season_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_id, rule_name)
);

-- ============================================================================
-- TEAM ENTITIES (2NF - No partial dependencies) - OPTIMIZED
-- ============================================================================

-- Teams table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    mascot VARCHAR(100),
    logo_url VARCHAR(255),
    website VARCHAR(255),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    gender_id UUID NOT NULL REFERENCES team_gender(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES team_level(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES team_division(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team colors table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS team_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    color_name VARCHAR(50) NOT NULL, -- primary, secondary, accent
    color_value VARCHAR(7) NOT NULL CHECK (color_value ~ '^#[0-9A-Fa-f]{6}$'), -- hex color code validation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, color_name)
);

-- ============================================================================
-- RELATIONSHIP ENTITIES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Team-conference relationships (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS team_conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status team_conference_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, conference_id, start_date),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Collections table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    gender_id UUID NOT NULL REFERENCES team_gender(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES team_division(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id),
    data_source VARCHAR(100) NOT NULL,
    status_id UUID NOT NULL REFERENCES collection_status(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team-collection relationships (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS team_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'participant',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, collection_id, start_date),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================================================
-- GAME ENTITIES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Games table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    data_source VARCHAR(100) NOT NULL,
    league_id UUID REFERENCES leagues(id),
    season_id UUID REFERENCES seasons(id),
    date DATE NOT NULL,
    time TIME,
    home_team_id UUID NOT NULL REFERENCES teams(id),
    away_team_id UUID NOT NULL REFERENCES teams(id),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    home_score INTEGER CHECK (home_score >= 0),
    away_score INTEGER CHECK (away_score >= 0),
    status_id UUID NOT NULL REFERENCES game_status(id) ON DELETE CASCADE,
    current_period VARCHAR(50),
    venue_id UUID REFERENCES venues(id),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (home_team_id != away_team_id),
    CHECK (date >= '1900-01-01' AND date <= '2100-12-31')
);

-- Game period scores table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS game_period_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    period_name VARCHAR(50) NOT NULL, -- 1st, 2nd, 3rd, 4th, OT, etc.
    home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
    away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, period_name)
);

-- Game broadcast information table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS game_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    network VARCHAR(100),
    channel VARCHAR(50),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time IS NULL OR end_time >= start_time)
);

-- ============================================================================
-- SCHEDULE ENTITIES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Schedules table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule games table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS schedule_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    game_order INTEGER NOT NULL CHECK (game_order > 0), -- Order of games in the schedule
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, game_id),
    UNIQUE(schedule_id, game_order)
);

-- ============================================================================
-- STATISTICS ENTITIES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Statistic types table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS statistic_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- offensive, defensive, team, individual
    unit VARCHAR(20), -- points, yards, percentage, etc.
    description TEXT,
    is_numeric BOOLEAN NOT NULL DEFAULT true,
    min_value DECIMAL(10, 3),
    max_value DECIMAL(10, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game statistics table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS game_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    statistic_type_id UUID NOT NULL REFERENCES statistic_types(id) ON DELETE CASCADE,
    value DECIMAL(10, 3) NOT NULL,
    period VARCHAR(50), -- NULL for game total
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id, statistic_type_id, period)
);

-- ============================================================================
-- AUDIT ENTITIES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Audit actions table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS audit_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL UNIQUE, -- INSERT, UPDATE, DELETE
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action_id UUID NOT NULL REFERENCES audit_actions(id) ON DELETE CASCADE,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- ENUM REFERENCE TABLES (3NF - No transitive dependencies) - OPTIMIZED
-- ============================================================================

-- Team gender reference table
CREATE TABLE IF NOT EXISTS team_gender (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_gender NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team level reference table
CREATE TABLE IF NOT EXISTS team_level (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_level NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team division reference table
CREATE TABLE IF NOT EXISTS team_division (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_division NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection status reference table
CREATE TABLE IF NOT EXISTS collection_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name collection_status NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game status reference table
CREATE TABLE IF NOT EXISTS game_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name game_status NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Advanced indexing strategy
-- Location indexes with trigram support for text search
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_postal_codes_city ON postal_codes(city_id);
CREATE INDEX IF NOT EXISTS idx_venues_postal_code ON venues(postal_code_id);
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venues_name_trgm ON venues USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active) WHERE is_active = true;

-- Sports indexes with composite optimization
CREATE INDEX IF NOT EXISTS idx_leagues_sport_level ON leagues(sport_id, level_id);
CREATE INDEX IF NOT EXISTS idx_leagues_active ON leagues(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_conferences_sport_division ON conferences(sport_id, division_id);
CREATE INDEX IF NOT EXISTS idx_conferences_active ON conferences(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seasons_sport_year ON seasons(sport_id, year);
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON seasons(start_date, end_date);

-- Team indexes with performance optimization
CREATE INDEX IF NOT EXISTS idx_teams_sport_gender ON teams(sport_id, gender_id);
CREATE INDEX IF NOT EXISTS idx_teams_level_division ON teams(level_id, division_id);
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_teams_name_trgm ON teams USING gin(name gin_trgm_ops);

-- Game indexes with advanced optimization
CREATE INDEX IF NOT EXISTS idx_games_date_sport ON games(date, sport_id);
CREATE INDEX IF NOT EXISTS idx_games_teams_status ON games(home_team_id, away_team_id, status_id);
CREATE INDEX IF NOT EXISTS idx_games_data_source ON games(data_source);
CREATE INDEX IF NOT EXISTS idx_games_league_season ON games(league_id, season_id);
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_games_date_range ON games(date) WHERE date >= CURRENT_DATE - INTERVAL '1 year';

-- Relationship indexes with temporal optimization
CREATE INDEX IF NOT EXISTS idx_team_conferences_team ON team_conferences(team_id);
CREATE INDEX IF NOT EXISTS idx_team_conferences_conference ON team_conferences(conference_id);
CREATE INDEX IF NOT EXISTS idx_team_conferences_dates ON team_conferences(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_team_conferences_status ON team_conferences(status);
CREATE INDEX IF NOT EXISTS idx_team_collections_team ON team_collections(team_id);
CREATE INDEX IF NOT EXISTS idx_team_collections_collection ON team_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_team_collections_dates ON team_collections(start_date, end_date);

-- Statistics indexes with performance optimization
CREATE INDEX IF NOT EXISTS idx_game_statistics_game ON game_statistics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_team ON game_statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_type ON game_statistics(statistic_type_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_period ON game_statistics(period) WHERE period IS NOT NULL;

-- Audit log optimization
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_recent ON audit_log(changed_at) WHERE changed_at >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================================================
-- PARTITIONING FOR LARGE TABLES
-- ============================================================================

-- Partition games table by date for better performance on large datasets
-- Note: This requires PostgreSQL 10+ and should be implemented based on data volume

-- ============================================================================
-- TRIGGERS FOR AUTOMATION - OPTIMIZED
-- ============================================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on tables that have it
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conferences_updated_at BEFORE UPDATE ON conferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_conferences_updated_at BEFORE UPDATE ON team_conferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_collections_updated_at BEFORE UPDATE ON team_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_statistics_updated_at BEFORE UPDATE ON game_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA INSERTION - OPTIMIZED
-- ============================================================================

-- Insert reference data with better performance
INSERT INTO countries (code, name) VALUES 
    ('USA', 'United States'),
    ('CAN', 'Canada')
ON CONFLICT DO NOTHING;

INSERT INTO states (country_id, code, name) VALUES
    ((SELECT id FROM countries WHERE code = 'USA'), 'CA', 'California'),
    ((SELECT id FROM countries WHERE code = 'USA'), 'NC', 'North Carolina')
ON CONFLICT DO NOTHING;

INSERT INTO cities (state_id, name) VALUES
    ((SELECT s.id FROM states s JOIN countries c ON s.country_id = c.id WHERE s.code = 'CA' AND c.code = 'USA'), 'Stanford'),
    ((SELECT s.id FROM states s JOIN countries c ON s.country_id = c.id WHERE s.code = 'NC' AND c.code = 'USA'), 'Durham')
ON CONFLICT DO NOTHING;

INSERT INTO sports (name, description, is_team_sport, max_players, min_players) VALUES
    ('soccer', 'Association Football', true, 11, 7),
    ('football', 'American Football', true, 11, 11),
    ('basketball', 'Basketball', true, 5, 5)
ON CONFLICT DO NOTHING;

INSERT INTO league_levels (name, description, sort_order) VALUES
    ('D1', 'Division I', 1),
    ('D2', 'Division II', 2),
    ('D3', 'Division III', 3),
    ('professional', 'Professional Level', 4),
    ('amateur', 'Amateur Level', 5)
ON CONFLICT DO NOTHING;

INSERT INTO regions (name, description) VALUES
    ('west', 'Western United States'),
    ('east', 'Eastern United States'),
    ('midwest', 'Midwestern United States'),
    ('south', 'Southern United States')
ON CONFLICT DO NOTHING;

INSERT INTO season_statuses (name, description, sort_order) VALUES
    ('active', 'Currently active season', 1),
    ('upcoming', 'Upcoming season', 2),
    ('completed', 'Completed season', 3),
    ('inactive', 'Inactive season', 4)
ON CONFLICT DO NOTHING;

INSERT INTO audit_actions (name, description) VALUES
    ('INSERT', 'Record creation'),
    ('UPDATE', 'Record modification'),
    ('DELETE', 'Record deletion')
ON CONFLICT DO NOTHING;

-- Insert enum reference data with sort order
INSERT INTO team_gender (name, description, sort_order) VALUES
    ('men', 'Men''s teams', 1),
    ('women', 'Women''s teams', 2),
    ('coed', 'Co-ed teams', 3),
    ('mixed', 'Mixed gender teams', 4)
ON CONFLICT DO NOTHING;

INSERT INTO team_level (name, description, sort_order) VALUES
    ('college', 'College/university level', 1),
    ('professional', 'Professional level', 2),
    ('amateur', 'Amateur level', 3),
    ('youth', 'Youth level', 4),
    ('club', 'Club level', 5)
ON CONFLICT DO NOTHING;

INSERT INTO team_division (name, description, sort_order) VALUES
    ('D1', 'Division I', 1),
    ('D2', 'Division II', 2),
    ('D3', 'Division III', 3),
    ('professional', 'Professional', 4),
    ('amateur', 'Amateur', 5),
    ('club', 'Club', 6)
ON CONFLICT DO NOTHING;

INSERT INTO collection_status (name, description, sort_order) VALUES
    ('active', 'Active collection', 1),
    ('upcoming', 'Upcoming collection', 2),
    ('archived', 'Archived collection', 3),
    ('draft', 'Draft collection', 4),
    ('inactive', 'Inactive collection', 5)
ON CONFLICT DO NOTHING;

INSERT INTO game_status (name, description, sort_order) VALUES
    ('scheduled', 'Game is scheduled', 1),
    ('in_progress', 'Game is currently being played', 2),
    ('completed', 'Game has finished', 3),
    ('final', 'Game is final', 4),
    ('postponed', 'Game has been postponed', 5),
    ('cancelled', 'Game has been cancelled', 6)
ON CONFLICT DO NOTHING;

-- Insert surface types
INSERT INTO surface_type (name, description) VALUES
    ('grass', 'Natural grass surface'),
    ('turf', 'Artificial turf surface'),
    ('hardwood', 'Hardwood surface'),
    ('clay', 'Clay surface'),
    ('concrete', 'Concrete surface'),
    ('dirt', 'Dirt surface'),
    ('synthetic', 'Synthetic surface'),
    ('ice', 'Ice surface'),
    ('sand', 'Sand surface')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- Create view for database performance monitoring
CREATE OR REPLACE VIEW database_performance AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Create view for index usage statistics
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO scoreboard_user;
-- GRANT SELECT ON database_performance TO scoreboard_user;
-- GRANT SELECT ON index_usage_stats TO scoreboard_user;
