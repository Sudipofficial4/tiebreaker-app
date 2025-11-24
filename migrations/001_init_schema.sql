-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_complete BOOLEAN DEFAULT FALSE,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bye_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, round_number)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player1_name TEXT NOT NULL,
  player2_name TEXT,
  winner TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS tournaments_admin_id_idx ON tournaments(admin_id);
CREATE INDEX IF NOT EXISTS players_tournament_id_idx ON players(tournament_id);
CREATE INDEX IF NOT EXISTS rounds_tournament_id_idx ON rounds(tournament_id);
CREATE INDEX IF NOT EXISTS matches_round_id_idx ON matches(round_id);
CREATE INDEX IF NOT EXISTS matches_tournament_id_idx ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS matches_status_idx ON matches(status);

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admin can access their own tournaments
CREATE POLICY "Admins can view their own tournaments"
  ON tournaments FOR SELECT
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can insert tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own tournaments"
  ON tournaments FOR UPDATE
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

-- RLS for players (tied to admin's tournaments)
CREATE POLICY "Admins can view players in their tournaments"
  ON players FOR SELECT
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage players in their tournaments"
  ON players FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update players in their tournaments"
  ON players FOR UPDATE
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  )
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

-- RLS for rounds and matches (tied to admin's tournaments)
CREATE POLICY "Admins can view rounds in their tournaments"
  ON rounds FOR SELECT
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage rounds"
  ON rounds FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view matches in their tournaments"
  ON matches FOR SELECT
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage matches"
  ON matches FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update matches in their tournaments"
  ON matches FOR UPDATE
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  )
  WITH CHECK (
    tournament_id IN (
      SELECT id FROM tournaments WHERE admin_id = auth.uid()
    )
  );
