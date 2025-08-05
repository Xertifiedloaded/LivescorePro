-- Fix existing database by adding missing columns
-- Run this if you have an existing database that needs updating

-- Add missing columns to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS code VARCHAR(10);
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS emblem VARCHAR(255);
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS plan VARCHAR(20);
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchday INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage VARCHAR(50);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name VARCHAR(50);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue VARCHAR(100);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee VARCHAR(100);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS attendance INTEGER;

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    external_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    flag VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    external_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    tla VARCHAR(10),
    crest VARCHAR(255),
    address TEXT,
    website VARCHAR(255),
    founded INTEGER,
    club_colors TEXT,
    venue VARCHAR(100),
    area_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add team references to matches (after teams table exists)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id INTEGER;

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'matches_home_team_id_fkey'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT matches_home_team_id_fkey 
        FOREIGN KEY (home_team_id) REFERENCES teams(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'matches_away_team_id_fkey'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT matches_away_team_id_fkey 
        FOREIGN KEY (away_team_id) REFERENCES teams(id);
    END IF;
END $$;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_areas_code ON areas(code);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_tla ON teams(tla);
CREATE INDEX IF NOT EXISTS idx_leagues_code ON leagues(code);
CREATE INDEX IF NOT EXISTS idx_matches_matchday ON matches(matchday);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_venue ON matches(venue);

-- Insert sample areas
INSERT INTO areas (external_id, name, code) VALUES
(2072, 'England', 'ENG'),
(2088, 'Germany', 'GER'),
(2081, 'Spain', 'ESP'),
(2114, 'Italy', 'ITA'),
(2080, 'France', 'FRA'),
(2077, 'Netherlands', 'NED'),
(2187, 'Portugal', 'POR')
ON CONFLICT (external_id) DO NOTHING;

\echo 'Database schema fixed successfully!';
