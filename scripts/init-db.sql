-- PostgreSQL Database Initialization Script for Scoreboard API
-- This script creates the necessary tables and indexes

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(255) UNIQUE NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    league_name VARCHAR(255),
    date DATE NOT NULL,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50) NOT NULL,
    current_period VARCHAR(50),
    period_scores JSONB,
    venue VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50),
    broadcast_info TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    mascot VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    conference VARCHAR(255),
    division VARCHAR(50),
    sport VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    colors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    collection_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    division VARCHAR(50) NOT NULL,
    season VARCHAR(20) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(255) UNIQUE NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    season VARCHAR(20) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    games JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team);
CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team);
CREATE INDEX IF NOT EXISTS idx_games_data_source ON games(data_source);
CREATE INDEX IF NOT EXISTS idx_games_league_name ON games(league_name);

CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);
CREATE INDEX IF NOT EXISTS idx_teams_conference ON teams(conference);
CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
CREATE INDEX IF NOT EXISTS idx_teams_gender ON teams(gender);
CREATE INDEX IF NOT EXISTS idx_teams_level ON teams(level);

CREATE INDEX IF NOT EXISTS idx_collections_sport ON collections(sport);
CREATE INDEX IF NOT EXISTS idx_collections_season ON collections(season);
CREATE INDEX IF NOT EXISTS idx_collections_data_source ON collections(data_source);

CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_season ON schedules(season);
CREATE INDEX IF NOT EXISTS idx_schedules_sport ON schedules(sport);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO teams (team_id, name, short_name, sport, gender, level, conference, division) VALUES
    ('stanford-womens-soccer', 'Stanford University', 'Stanford', 'soccer', 'women', 'college', 'Pac-12', 'd1'),
    ('duke-womens-soccer', 'Duke University', 'Duke', 'soccer', 'women', 'college', 'ACC', 'd1'),
    ('berkeley-womens-soccer', 'UC Berkeley', 'Cal', 'soccer', 'women', 'college', 'Pac-12', 'd1'),
    ('unc-womens-soccer', 'University of North Carolina', 'UNC', 'soccer', 'women', 'college', 'ACC', 'd1')
ON CONFLICT (team_id) DO NOTHING;

-- Insert sample games
INSERT INTO games (game_id, data_source, league_name, date, home_team, away_team, sport, home_score, away_score, status, venue, city, state) VALUES
    ('ncaa_5397685', 'ncaa', 'NCAA Division I Women''s Soccer', '2024-09-15', 'Stanford University', 'UC Berkeley', 'soccer', 2, 1, 'completed', 'Stanford Stadium', 'Stanford', 'CA'),
    ('ncaa_5397686', 'ncaa', 'NCAA Division I Women''s Soccer', '2024-09-15', 'Duke University', 'University of North Carolina', 'soccer', 1, 1, 'completed', 'Koskinen Stadium', 'Durham', 'NC')
ON CONFLICT (game_id) DO NOTHING;

-- Create collections
INSERT INTO collections (collection_id, name, description, sport, gender, division, season, data_source, status) VALUES
    ('ncaa-womens-soccer-d1-2024', 'NCAA Division I Women''s Soccer 2024', 'NCAA Division I Women''s Soccer season 2024', 'soccer', 'women', 'd1', '2024', 'ncaa', 'active')
ON CONFLICT (collection_id) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scoreboard_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scoreboard_user;
