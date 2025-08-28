-- Enhanced PostgreSQL Database Initialization Script for Scoreboard API
-- This script creates an improved schema with better normalization, UUIDs, and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs for better data integrity
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'final', 'postponed', 'cancelled');
CREATE TYPE team_division AS ENUM ('D1', 'D2', 'D3', 'professional', 'amateur', 'club');
CREATE TYPE team_level AS ENUM ('college', 'professional', 'amateur', 'youth', 'club');
CREATE TYPE team_gender AS ENUM ('men', 'women', 'coed', 'mixed');
CREATE TYPE collection_status AS ENUM ('active', 'inactive', 'archived', 'draft');

-- Create venues table (new entity for location normalization)
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    surface_type VARCHAR(100),
    amenities JSONB,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leagues table (new entity for league hierarchy)
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    sport VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    parent_league_id UUID REFERENCES leagues(id),
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conferences table (enhanced)
CREATE TABLE IF NOT EXISTS conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    sport VARCHAR(50) NOT NULL,
    division VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create seasons table (new entity for better season management)
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    rules JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sport, year)
);

-- Create teams table (enhanced with UUIDs and proper relationships)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE, -- Keep for backward compatibility
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    mascot VARCHAR(100),
    colors JSONB,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    sport VARCHAR(50) NOT NULL,
    gender team_gender NOT NULL,
    level team_level NOT NULL,
    division team_division,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_conferences junction table (many-to-many relationship)
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

-- Create collections table (enhanced)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE, -- Keep for backward compatibility
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport VARCHAR(50) NOT NULL,
    gender team_gender NOT NULL,
    division team_division NOT NULL,
    season_id UUID REFERENCES seasons(id),
    data_source VARCHAR(100) NOT NULL,
    status collection_status NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_collections junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'participant',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, collection_id, start_date)
);

-- Create games table (enhanced with proper foreign keys and normalization)
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE, -- Keep for backward compatibility
    data_source VARCHAR(100) NOT NULL,
    league_id UUID REFERENCES leagues(id),
    season_id UUID REFERENCES seasons(id),
    date DATE NOT NULL,
    time TIME,
    home_team_id UUID NOT NULL REFERENCES teams(id),
    away_team_id UUID NOT NULL REFERENCES teams(id),
    sport VARCHAR(50) NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status game_status NOT NULL,
    current_period VARCHAR(50),
    period_scores JSONB,
    venue_id UUID REFERENCES venues(id),
    broadcast_info JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (home_team_id != away_team_id)
);

-- Create schedules table (enhanced)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE, -- Keep for backward compatibility
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    games JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_statistics table (new entity for detailed game stats)
CREATE TABLE IF NOT EXISTS game_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    statistic_type VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    period VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id, statistic_type, period)
);

-- Create audit_log table (new entity for tracking changes)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_date_sport ON games(date, sport);
CREATE INDEX IF NOT EXISTS idx_games_teams_status ON games(home_team_id, away_team_id, status);
CREATE INDEX IF NOT EXISTS idx_games_data_source ON games(data_source);
CREATE INDEX IF NOT EXISTS idx_games_league_season ON games(league_id, season_id);
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);

CREATE INDEX IF NOT EXISTS idx_teams_sport_gender ON teams(sport, gender);
CREATE INDEX IF NOT EXISTS idx_teams_level_division ON teams(level, division);
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id);

CREATE INDEX IF NOT EXISTS idx_conferences_sport_division ON conferences(sport, division);
CREATE INDEX IF NOT EXISTS idx_conferences_region ON conferences(region);

CREATE INDEX IF NOT EXISTS idx_seasons_sport_year ON seasons(sport, year);
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON seasons(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(city, state, country);
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON venues(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_team_conferences_team ON team_conferences(team_id);
CREATE INDEX IF NOT EXISTS idx_team_conferences_conference ON team_conferences(conference_id);
CREATE INDEX IF NOT EXISTS idx_team_conferences_dates ON team_conferences(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_team_collections_team ON team_collections(team_id);
CREATE INDEX IF NOT EXISTS idx_team_collections_collection ON team_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_schedules_team_season ON schedules(team_id, season_id);
CREATE INDEX IF NOT EXISTS idx_schedules_sport ON schedules(sport);

CREATE INDEX IF NOT EXISTS idx_game_statistics_game ON game_statistics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_team ON game_statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_type ON game_statistics(statistic_type);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all tables
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

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_user);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers for critical tables
CREATE TRIGGER audit_games_trigger AFTER INSERT OR UPDATE OR DELETE ON games
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_teams_trigger AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_conferences_trigger AFTER INSERT OR UPDATE OR DELETE ON conferences
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert sample data for testing
INSERT INTO venues (name, city, state, country, capacity, surface_type) VALUES
    ('Stanford Stadium', 'Stanford', 'CA', 'USA', 50000, 'grass'),
    ('Koskinen Stadium', 'Durham', 'NC', 'USA', 7000, 'turf'),
    ('Memorial Stadium', 'Berkeley', 'CA', 'USA', 63000, 'grass'),
    ('Kenan Memorial Stadium', 'Chapel Hill', 'NC', 'USA', 50900, 'grass')
ON CONFLICT DO NOTHING;

INSERT INTO leagues (name, sport, level, description) VALUES
    ('NCAA Division I', 'soccer', 'college', 'National Collegiate Athletic Association Division I'),
    ('NCAA Division II', 'soccer', 'college', 'National Collegiate Athletic Association Division II'),
    ('NCAA Division III', 'soccer', 'college', 'National Collegiate Athletic Association Division III'),
    ('MLS', 'soccer', 'professional', 'Major League Soccer')
ON CONFLICT DO NOTHING;

INSERT INTO conferences (name, sport, division, region, description) VALUES
    ('Pac-12', 'soccer', 'D1', 'West', 'Pacific-12 Conference'),
    ('ACC', 'soccer', 'D1', 'East', 'Atlantic Coast Conference'),
    ('Big Ten', 'soccer', 'D1', 'Midwest', 'Big Ten Conference'),
    ('SEC', 'soccer', 'D1', 'South', 'Southeastern Conference')
ON CONFLICT DO NOTHING;

INSERT INTO seasons (name, sport, year, start_date, end_date, status) VALUES
    ('2024 NCAA Women''s Soccer', 'soccer', '2024', '2024-08-15', '2024-12-15', 'active'),
    ('2025 NCAA Women''s Soccer', 'soccer', '2025', '2025-08-15', '2025-12-15', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO teams (external_id, name, short_name, sport, gender, level, division, mascot, colors) VALUES
    ('stanford-womens-soccer', 'Stanford University', 'Stanford', 'soccer', 'women', 'college', 'D1', 'Cardinal', '{"primary": "#8C1515", "secondary": "#FFFFFF"}'),
    ('duke-womens-soccer', 'Duke University', 'Duke', 'soccer', 'women', 'college', 'D1', 'Blue Devils', '{"primary": "#003087", "secondary": "#FFFFFF"}'),
    ('berkeley-womens-soccer', 'UC Berkeley', 'Cal', 'soccer', 'women', 'college', 'D1', 'Golden Bears', '{"primary": "#FDB515", "secondary": "#003262"}'),
    ('unc-womens-soccer', 'University of North Carolina', 'UNC', 'soccer', 'women', 'college', 'D1', 'Tar Heels', '{"primary": "#7BAFD4", "secondary": "#FFFFFF"}')
ON CONFLICT (external_id) DO NOTHING;

-- Link teams to conferences
INSERT INTO team_conferences (team_id, conference_id, start_date, status)
SELECT t.id, c.id, '2024-01-01', 'active'
FROM teams t, conferences c
WHERE t.external_id IN ('stanford-womens-soccer', 'berkeley-womens-soccer') AND c.name = 'Pac-12'
ON CONFLICT DO NOTHING;

INSERT INTO team_conferences (team_id, conference_id, start_date, status)
SELECT t.id, c.id, '2024-01-01', 'active'
FROM teams t, conferences c
WHERE t.external_id IN ('duke-womens-soccer', 'unc-womens-soccer') AND c.name = 'ACC'
ON CONFLICT DO NOTHING;

-- Insert sample games with proper foreign keys
INSERT INTO games (external_id, data_source, date, home_team_id, away_team_id, sport, home_score, away_score, status, venue_id)
SELECT 
    'ncaa_5397685',
    'ncaa',
    '2024-09-15',
    home.id,
    away.id,
    'soccer',
    2,
    1,
    'completed',
    v.id
FROM teams home, teams away, venues v
WHERE home.external_id = 'stanford-womens-soccer' 
  AND away.external_id = 'berkeley-womens-soccer'
  AND v.name = 'Stanford Stadium'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO games (external_id, data_source, date, home_team_id, away_team_id, sport, home_score, away_score, status, venue_id)
SELECT 
    'ncaa_5397686',
    'ncaa',
    '2024-09-15',
    home.id,
    away.id,
    'soccer',
    1,
    1,
    'completed',
    v.id
FROM teams home, teams away, venues v
WHERE home.external_id = 'duke-womens-soccer' 
  AND away.external_id = 'unc-womens-soccer'
  AND v.name = 'Koskinen Stadium'
ON CONFLICT (external_id) DO NOTHING;

-- Create collections
INSERT INTO collections (external_id, name, description, sport, gender, division, season_id, data_source, status)
SELECT 
    'ncaa-womens-soccer-d1-2024',
    'NCAA Division I Women''s Soccer 2024',
    'NCAA Division I Women''s Soccer season 2024',
    'soccer',
    'women',
    'D1',
    s.id,
    'ncaa',
    'active'
FROM seasons s
WHERE s.name = '2024 NCAA Women''s Soccer'
ON CONFLICT (external_id) DO NOTHING;

-- Link teams to collections
INSERT INTO team_collections (team_id, collection_id, role, start_date)
SELECT t.id, c.id, 'participant', '2024-01-01'
FROM teams t, collections c
WHERE c.external_id = 'ncaa-womens-soccer-d1-2024'
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO scoreboard_user;
