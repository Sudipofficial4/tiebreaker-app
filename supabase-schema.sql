-- Supabase Database Schema for Tie-Sheet Generator
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_name TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_complete BOOLEAN DEFAULT FALSE,
    winner TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bye_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds Table
CREATE TABLE IF NOT EXISTS rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, round_number)
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    match_id TEXT NOT NULL, -- e.g., "r1-m1"
    player1 TEXT NOT NULL,
    player2 TEXT, -- NULL for bye
    winner TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'finished')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_admin ON tournaments(admin_id);
CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Tournaments: Admin can do everything, others can read
CREATE POLICY "Admins can manage their tournaments"
    ON tournaments
    FOR ALL
    TO authenticated
    USING (admin_id = auth.uid());

CREATE POLICY "Anyone can view tournaments"
    ON tournaments
    FOR SELECT
    TO authenticated
    USING (true);

-- Players: Admin can manage, others can read
CREATE POLICY "Admins can manage players"
    ON players
    FOR ALL
    TO authenticated
    USING (
        tournament_id IN (
            SELECT id FROM tournaments WHERE admin_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view players"
    ON players
    FOR SELECT
    TO authenticated
    USING (true);

-- Rounds: Admin can manage, others can read
CREATE POLICY "Admins can manage rounds"
    ON rounds
    FOR ALL
    TO authenticated
    USING (
        tournament_id IN (
            SELECT id FROM tournaments WHERE admin_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view rounds"
    ON rounds
    FOR SELECT
    TO authenticated
    USING (true);

-- Matches: Admin can manage, others can read
CREATE POLICY "Admins can manage matches"
    ON matches
    FOR ALL
    TO authenticated
    USING (
        round_id IN (
            SELECT r.id FROM rounds r
            JOIN tournaments t ON r.tournament_id = t.id
            WHERE t.admin_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view matches"
    ON matches
    FOR SELECT
    TO authenticated
    USING (true);

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Real-time: Enable real-time for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Grant permissions (optional, if needed)
GRANT ALL ON tournaments TO authenticated;
GRANT ALL ON players TO authenticated;
GRANT ALL ON rounds TO authenticated;
GRANT ALL ON matches TO authenticated;
