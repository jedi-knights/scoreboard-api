-- Migration Script: Transition from Old Schema to Enhanced Schema
-- This script helps migrate existing data to the new normalized structure

-- Step 1: Create new tables alongside existing ones
-- (This allows for a gradual migration)

-- Create venues table and migrate location data
CREATE TABLE IF NOT EXISTS venues_new (
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

-- Migrate unique venues from games table
INSERT INTO venues_new (name, city, state, country)
SELECT DISTINCT venue, city, state, country
FROM games 
WHERE venue IS NOT NULL 
  AND city IS NOT NULL 
  AND state IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 2: Create enhanced teams table
CREATE TABLE IF NOT EXISTS teams_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    mascot VARCHAR(100),
    colors JSONB,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    sport VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    division VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate teams data
INSERT INTO teams_new (external_id, name, short_name, sport, gender, level, division, mascot, colors, logo_url, website)
SELECT 
    team_id,
    name,
    short_name,
    sport,
    gender,
    level,
    division,
    mascot,
    colors,
    logo_url,
    website
FROM teams
ON CONFLICT (external_id) DO NOTHING;

-- Step 3: Create enhanced conferences table
CREATE TABLE IF NOT EXISTS conferences_new (
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

-- Migrate conferences data
INSERT INTO conferences_new (name, sport, division, region)
SELECT DISTINCT 
    conference,
    sport,
    COALESCE(division, 'D1'),
    CASE 
        WHEN conference IN ('Pac-12', 'Big West') THEN 'West'
        WHEN conference IN ('ACC', 'Big East') THEN 'East'
        WHEN conference IN ('Big Ten', 'Mid-American') THEN 'Midwest'
        WHEN conference IN ('SEC', 'Sun Belt') THEN 'South'
        ELSE 'Other'
    END
FROM teams 
WHERE conference IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Step 4: Create team_conferences junction table
CREATE TABLE IF NOT EXISTS team_conferences_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL,
    conference_id UUID NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link teams to conferences
INSERT INTO team_conferences_new (team_id, conference_id, start_date, status)
SELECT 
    t.id,
    c.id,
    '2024-01-01',
    'active'
FROM teams_new t
JOIN conferences_new c ON t.division = c.division AND t.sport = c.sport
ON CONFLICT DO NOTHING;

-- Step 5: Create enhanced games table
CREATE TABLE IF NOT EXISTS games_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    data_source VARCHAR(100) NOT NULL,
    league_id UUID,
    season_id UUID,
    date DATE NOT NULL,
    time TIME,
    home_team_id UUID NOT NULL,
    away_team_id UUID NOT NULL,
    sport VARCHAR(50) NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50) NOT NULL,
    current_period VARCHAR(50),
    period_scores JSONB,
    venue_id UUID,
    broadcast_info JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate games data with proper foreign keys
INSERT INTO games_new (
    external_id, data_source, date, home_team_id, away_team_id, 
    sport, home_score, away_score, status, current_period, 
    period_scores, venue_id, broadcast_info, notes
)
SELECT 
    g.game_id,
    g.data_source,
    g.date,
    home.id,
    away.id,
    g.sport,
    g.home_score,
    g.away_score,
    g.status,
    g.current_period,
    g.period_scores,
    v.id,
    CASE 
        WHEN g.broadcast_info IS NOT NULL THEN jsonb_build_object('info', g.broadcast_info)
        ELSE NULL
    END,
    g.notes
FROM games g
JOIN teams_new home ON home.external_id = g.home_team
JOIN teams_new away ON away.external_id = g.away_team
LEFT JOIN venues_new v ON v.name = g.venue AND v.city = g.city
ON CONFLICT (external_id) DO NOTHING;

-- Step 6: Create enhanced collections table
CREATE TABLE IF NOT EXISTS collections_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    division VARCHAR(50) NOT NULL,
    season_id UUID,
    data_source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate collections data
INSERT INTO collections_new (external_id, name, description, sport, gender, division, data_source, status)
SELECT 
    collection_id,
    name,
    description,
    sport,
    gender,
    division,
    data_source,
    status
FROM collections
ON CONFLICT (external_id) DO NOTHING;

-- Step 7: Create team_collections junction table
CREATE TABLE IF NOT EXISTS team_collections_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    role VARCHAR(100) DEFAULT 'participant',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link teams to collections based on existing data
INSERT INTO team_collections_new (team_id, collection_id, role, start_date)
SELECT DISTINCT
    t.id,
    c.id,
    'participant',
    '2024-01-01'
FROM teams_new t
JOIN collections_new c ON t.sport = c.sport AND t.gender = c.gender AND t.division = c.division
ON CONFLICT DO NOTHING;

-- Step 8: Create enhanced schedules table
CREATE TABLE IF NOT EXISTS schedules_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    team_id UUID NOT NULL,
    season_id UUID,
    sport VARCHAR(50) NOT NULL,
    games JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate schedules data
INSERT INTO schedules_new (external_id, team_id, sport, games)
SELECT 
    s.schedule_id,
    t.id,
    s.sport,
    s.games
FROM schedules s
JOIN teams_new t ON t.external_id = s.team_id
ON CONFLICT (external_id) DO NOTHING;

-- Step 9: Create indexes on new tables
CREATE INDEX IF NOT EXISTS idx_games_new_date_sport ON games_new(date, sport);
CREATE INDEX IF NOT EXISTS idx_games_new_teams_status ON games_new(home_team_id, away_team_id, status);
CREATE INDEX IF NOT EXISTS idx_games_new_data_source ON games_new(data_source);
CREATE INDEX IF NOT EXISTS idx_games_new_venue ON games_new(venue_id);

CREATE INDEX IF NOT EXISTS idx_teams_new_sport_gender ON teams_new(sport, gender);
CREATE INDEX IF NOT EXISTS idx_teams_new_level_division ON teams_new(level, division);
CREATE INDEX IF NOT EXISTS idx_teams_new_external_id ON teams_new(external_id);

CREATE INDEX IF NOT EXISTS idx_venues_new_location ON venues_new(city, state, country);

-- Step 10: Verification queries
-- Run these to verify the migration was successful

-- Check data counts
SELECT 'games' as table_name, COUNT(*) as count FROM games_new
UNION ALL
SELECT 'teams' as table_name, COUNT(*) as count FROM teams_new
UNION ALL
SELECT 'conferences' as table_name, COUNT(*) as count FROM conferences_new
UNION ALL
SELECT 'venues' as table_name, COUNT(*) as count FROM venues_new
UNION ALL
SELECT 'collections' as table_name, COUNT(*) as count FROM collections_new
UNION ALL
SELECT 'schedules' as table_name, COUNT(*) as count FROM schedules_new;

-- Check foreign key relationships
SELECT 
    'games with valid home teams' as check_type,
    COUNT(*) as count
FROM games_new g
JOIN teams_new t ON g.home_team_id = t.id;

SELECT 
    'games with valid away teams' as check_type,
    COUNT(*) as count
FROM games_new g
JOIN teams_new t ON g.away_team_id = t.id;

SELECT 
    'games with valid venues' as check_type,
    COUNT(*) as count
FROM games_new g
JOIN venues_new v ON g.venue_id = v.id;

-- Step 11: When ready to switch over, run these commands:
-- (Uncomment when ready to complete the migration)

/*
-- Rename old tables to backup
ALTER TABLE games RENAME TO games_old;
ALTER TABLE teams RENAME TO teams_old;
ALTER TABLE conferences RENAME TO conferences_old;
ALTER TABLE collections RENAME TO collections_old;
ALTER TABLE schedules RENAME TO schedules_old;

-- Rename new tables to production names
ALTER TABLE games_new RENAME TO games;
ALTER TABLE teams_new RENAME TO teams;
ALTER TABLE conferences RENAME TO conferences;
ALTER TABLE collections RENAME TO collections;
ALTER TABLE schedules RENAME TO schedules;
ALTER TABLE venues_new RENAME TO venues;
ALTER TABLE team_conferences_new RENAME TO team_conferences;
ALTER TABLE team_collections_new RENAME TO team_collections;

-- Update sequence names if needed
-- ALTER SEQUENCE games_id_seq RENAME TO games_id_seq_old;
-- ALTER SEQUENCE teams_id_seq RENAME TO teams_id_seq_old;
-- etc.

-- Drop old tables (after verifying everything works)
-- DROP TABLE games_old CASCADE;
-- DROP TABLE teams_old CASCADE;
-- DROP TABLE conferences_old CASCADE;
-- DROP TABLE collections_old CASCADE;
-- DROP TABLE schedules_old CASCADE;
*/
