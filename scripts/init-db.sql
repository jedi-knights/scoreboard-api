-- 3NF-Compliant PostgreSQL Database Schema for Scoreboard API
-- This schema eliminates all transitive dependencies and ensures proper normalization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs for better data integrity
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled');
CREATE TYPE team_division AS ENUM ('D1', 'D2', 'D3', 'professional', 'amateur', 'club');
CREATE TYPE team_level AS ENUM ('college', 'professional', 'amateur', 'youth', 'club');
CREATE TYPE team_gender AS ENUM ('men', 'women', 'coed', 'mixed');
CREATE TYPE collection_status AS ENUM ('active', 'inactive', 'archived', 'draft');
CREATE TYPE sport_type AS ENUM ('football', 'basketball', 'soccer', 'baseball', 'softball', 'volleyball', 'tennis', 'golf', 'swimming', 'track', 'hockey', 'lacrosse', 'wrestling', 'gymnastics', 'cross_country', 'field_hockey', 'water_polo');
CREATE TYPE region_type AS ENUM ('northeast', 'southeast', 'midwest', 'west', 'southwest', 'northwest', 'central');
CREATE TYPE surface_type AS ENUM ('grass', 'turf', 'hardwood', 'clay', 'concrete', 'dirt', 'synthetic', 'ice', 'sand');

-- ============================================================================
-- LOCATION ENTITIES (1NF - Atomic values)
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
-- SPORTS ENTITIES (1NF - Atomic values)
-- ============================================================================

-- Sports table (1NF - atomic values)
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name sport_type NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VENUE ENTITIES (2NF - No partial dependencies)
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
    capacity INTEGER,
    surface_type surface_type,
    website VARCHAR(255),
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
-- LEAGUE ENTITIES (2NF - No partial dependencies)
-- ============================================================================

-- League levels table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS league_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONFERENCE ENTITIES (2NF - No partial dependencies)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEASON ENTITIES (2NF - No partial dependencies)
-- ============================================================================

-- Season statuses table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS season_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    year VARCHAR(4) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status_id UUID NOT NULL REFERENCES season_statuses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sport_id, year)
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
-- TEAM ENTITIES (2NF - No partial dependencies)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team colors table (2NF - no partial dependencies)
CREATE TABLE IF NOT EXISTS team_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    color_name VARCHAR(50) NOT NULL, -- primary, secondary, accent
    color_value VARCHAR(7) NOT NULL, -- hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, color_name)
);

-- ============================================================================
-- RELATIONSHIP ENTITIES (3NF - No transitive dependencies)
-- ============================================================================

-- Team-conference relationships (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS team_conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, conference_id, start_date)
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
    UNIQUE(team_id, collection_id, start_date)
);

-- ============================================================================
-- GAME ENTITIES (3NF - No transitive dependencies)
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
    home_score INTEGER,
    away_score INTEGER,
    status_id UUID NOT NULL REFERENCES game_status(id) ON DELETE CASCADE,
    current_period VARCHAR(50),
    venue_id UUID REFERENCES venues(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (home_team_id != away_team_id)
);

-- Game period scores table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS game_period_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    period_name VARCHAR(50) NOT NULL, -- 1st, 2nd, 3rd, 4th, OT, etc.
    home_score INTEGER NOT NULL DEFAULT 0,
    away_score INTEGER NOT NULL DEFAULT 0,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SCHEDULE ENTITIES (3NF - No transitive dependencies)
-- ============================================================================

-- Schedules table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule games table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS schedule_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    game_order INTEGER NOT NULL, -- Order of games in the schedule
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, game_id),
    UNIQUE(schedule_id, game_order)
);

-- ============================================================================
-- STATISTICS ENTITIES (3NF - No transitive dependencies)
-- ============================================================================

-- Statistic types table (3NF - no transitive dependencies)
CREATE TABLE IF NOT EXISTS statistic_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- offensive, defensive, team, individual
    unit VARCHAR(20), -- points, yards, percentage, etc.
    description TEXT,
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
-- AUDIT ENTITIES (3NF - No transitive dependencies)
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
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ENUM REFERENCE TABLES (3NF - No transitive dependencies)
-- ============================================================================

-- Team gender reference table
CREATE TABLE IF NOT EXISTS team_gender (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_gender NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team level reference table
CREATE TABLE IF NOT EXISTS team_level (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_level NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team division reference table
CREATE TABLE IF NOT EXISTS team_division (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name team_division NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection status reference table
CREATE TABLE IF NOT EXISTS collection_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name collection_status NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game status reference table
CREATE TABLE IF NOT EXISTS game_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name game_status NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_postal_codes_city ON postal_codes(city_id);
CREATE INDEX IF NOT EXISTS idx_venues_postal_code ON venues(postal_code_id);
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON venues(latitude, longitude);

-- Sports indexes
CREATE INDEX IF NOT EXISTS idx_leagues_sport_level ON leagues(sport_id, level_id);
CREATE INDEX IF NOT EXISTS idx_conferences_sport_division ON conferences(sport_id, division_id);
CREATE INDEX IF NOT EXISTS idx_seasons_sport_year ON seasons(sport_id, year);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_teams_sport_gender ON teams(sport_id, gender_id);
CREATE INDEX IF NOT EXISTS idx_teams_level_division ON teams(level_id, division_id);
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id);

-- Game indexes
CREATE INDEX IF NOT EXISTS idx_games_date_sport ON games(date, sport_id);
CREATE INDEX IF NOT EXISTS idx_games_teams_status ON games(home_team_id, away_team_id, status_id);
CREATE INDEX IF NOT EXISTS idx_games_data_source ON games(data_source);
CREATE INDEX IF NOT EXISTS idx_games_league_season ON games(league_id, season_id);
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_team_conferences_team ON team_conferences(team_id);
CREATE INDEX IF NOT EXISTS idx_team_conferences_conference ON team_conferences(conference_id);
CREATE INDEX IF NOT EXISTS idx_team_collections_team ON team_collections(team_id);
CREATE INDEX IF NOT EXISTS idx_team_collections_collection ON team_collections(collection_id);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_game_statistics_game ON game_statistics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_team ON game_statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_type ON game_statistics(statistic_type_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
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
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert reference data
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

INSERT INTO sports (name, description) VALUES
    ('soccer', 'Association Football'),
    ('football', 'American Football'),
    ('basketball', 'Basketball')
ON CONFLICT DO NOTHING;

INSERT INTO league_levels (name, description) VALUES
    ('D1', 'Division I'),
    ('D2', 'Division II'),
    ('D3', 'Division III'),
    ('professional', 'Professional Level'),
    ('amateur', 'Amateur Level')
ON CONFLICT DO NOTHING;

INSERT INTO regions (name, description) VALUES
    ('west', 'Western United States'),
    ('east', 'Eastern United States'),
    ('midwest', 'Midwestern United States'),
    ('south', 'Southern United States')
ON CONFLICT DO NOTHING;

INSERT INTO season_statuses (name, description) VALUES
    ('active', 'Currently active season'),
    ('inactive', 'Inactive season'),
    ('upcoming', 'Upcoming season'),
    ('completed', 'Completed season')
ON CONFLICT DO NOTHING;

INSERT INTO audit_actions (name, description) VALUES
    ('INSERT', 'Record creation'),
    ('UPDATE', 'Record modification'),
    ('DELETE', 'Record deletion')
ON CONFLICT DO NOTHING;

-- Insert enum reference data
INSERT INTO team_gender (name, description) VALUES
    ('men', 'Men''s teams'),
    ('women', 'Women''s teams'),
    ('coed', 'Co-ed teams'),
    ('mixed', 'Mixed gender teams')
ON CONFLICT DO NOTHING;

INSERT INTO team_level (name, description) VALUES
    ('college', 'College/university level'),
    ('professional', 'Professional level'),
    ('amateur', 'Amateur level'),
    ('youth', 'Youth level'),
    ('club', 'Club level')
ON CONFLICT DO NOTHING;

INSERT INTO team_division (name, description) VALUES
    ('D1', 'Division I'),
    ('D2', 'Division II'),
    ('D3', 'Division III'),
    ('professional', 'Professional'),
    ('amateur', 'Amateur'),
    ('club', 'Club')
ON CONFLICT DO NOTHING;

INSERT INTO collection_status (name, description) VALUES
    ('active', 'Active collection'),
    ('inactive', 'Inactive collection'),
    ('archived', 'Archived collection'),
    ('draft', 'Draft collection')
ON CONFLICT DO NOTHING;

INSERT INTO game_status (name, description) VALUES
    ('scheduled', 'Game is scheduled'),
    ('in_progress', 'Game is currently being played'),
    ('completed', 'Game has finished'),
    ('final', 'Game is final'),
    ('postponed', 'Game has been postponed'),
    ('cancelled', 'Game has been cancelled')
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

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO scoreboard_user;
