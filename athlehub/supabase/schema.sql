-- Create tables for Athlehub V2

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sports table with enhanced configuration
CREATE TABLE IF NOT EXISTS public.sports (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  max_players_per_team INTEGER DEFAULT 11,
  min_players_per_team INTEGER DEFAULT 1,
  supports_sets BOOLEAN DEFAULT false,
  default_match_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table for courts/fields
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  sport_id INTEGER REFERENCES public.sports(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Players table for individual player tracking
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  location_id UUID REFERENCES public.locations(id),
  total_matches INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  sport_id INTEGER REFERENCES public.sports(id) NOT NULL,
  location_id UUID REFERENCES public.locations(id),

  -- Match configuration
  match_type TEXT NOT NULL CHECK (match_type IN ('single', 'set_based', 'tournament')),
  match_mode TEXT NOT NULL CHECK (match_mode IN ('real_time', 'past_entry')),
  competitive_mode BOOLEAN DEFAULT false,

  -- Team information
  team_a_name TEXT NOT NULL,
  team_b_name TEXT NOT NULL,
  team_a_score INTEGER NOT NULL,
  team_b_score INTEGER NOT NULL,

  -- Match timing
  match_duration INTEGER, -- in minutes
  match_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Match status
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Set-based match support
  sets_data JSONB, -- Store set scores for set-based matches

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Match participants table (links players to matches)
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id),
  team TEXT NOT NULL CHECK (team IN ('team_a', 'team_b')),
  jersey_number INTEGER,
  is_substitute BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player statistics table
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id),

  -- Universal stats
  points INTEGER DEFAULT 0,

  -- Basketball specific
  assists INTEGER DEFAULT 0,
  rebounds INTEGER DEFAULT 0,
  steals INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  turnovers INTEGER DEFAULT 0,
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,

  -- Football specific
  goals INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,

  -- Racket sports specific (Badminton, Table Tennis)
  aces INTEGER DEFAULT 0,
  faults INTEGER DEFAULT 0,
  winners INTEGER DEFAULT 0,

  -- Volleyball specific
  spikes INTEGER DEFAULT 0,
  digs INTEGER DEFAULT 0,
  serve_aces INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport_id ON public.matches(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_location_id ON public.matches(location_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON public.matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_player_id ON public.match_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_match_id ON public.player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_players_created_by ON public.players(created_by);
CREATE INDEX IF NOT EXISTS idx_locations_sport_id ON public.locations(sport_id);

-- Insert enhanced sports data
INSERT INTO public.sports (name, icon, max_players_per_team, min_players_per_team, supports_sets, default_match_duration) VALUES
  ('Basketball', 'basketball', 5, 1, false, 48),
  ('Football', 'football', 11, 1, false, 90),
  ('Badminton', 'badminton', 2, 1, true, 60),
  ('Table Tennis', 'table-tennis', 2, 1, true, 45),
  ('Volleyball', 'volleyball', 6, 1, true, 90)
ON CONFLICT (name) DO UPDATE SET
  max_players_per_team = EXCLUDED.max_players_per_team,
  min_players_per_team = EXCLUDED.min_players_per_team,
  supports_sets = EXCLUDED.supports_sets,
  default_match_duration = EXCLUDED.default_match_duration;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies (optimized for performance)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Matches policies (optimized for performance)
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT USING (true);

CREATE POLICY "Users can insert their own matches"
  ON public.matches FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.matches FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Players policies
CREATE POLICY "Players are viewable by everyone"
  ON public.players FOR SELECT USING (true);

CREATE POLICY "Users can create players"
  ON public.players FOR INSERT WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their created players"
  ON public.players FOR UPDATE USING ((SELECT auth.uid()) = created_by);

-- Locations policies
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT USING (true);

CREATE POLICY "Users can create locations"
  ON public.locations FOR INSERT WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their created locations"
  ON public.locations FOR UPDATE USING ((SELECT auth.uid()) = created_by);

-- Match participants policies
CREATE POLICY "Match participants are viewable by everyone"
  ON public.match_participants FOR SELECT USING (true);

CREATE POLICY "Users can add participants to their matches"
  ON public.match_participants FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_participants.match_id
      AND matches.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update participants in their matches"
  ON public.match_participants FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_participants.match_id
      AND matches.user_id = (SELECT auth.uid())
    )
  );

-- Player stats policies
CREATE POLICY "Player stats are viewable by everyone"
  ON public.player_stats FOR SELECT USING (true);

CREATE POLICY "Users can add stats to their matches"
  ON public.player_stats FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = player_stats.match_id
      AND matches.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update stats in their matches"
  ON public.player_stats FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = player_stats.match_id
      AND matches.user_id = (SELECT auth.uid())
    )
  );

-- Create functions for handling timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update player total matches count
CREATE OR REPLACE FUNCTION public.update_player_match_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total matches for all players in the match
  UPDATE public.players
  SET total_matches = (
    SELECT COUNT(DISTINCT mp.match_id)
    FROM public.match_participants mp
    WHERE mp.player_id = players.id
  )
  WHERE id IN (
    SELECT player_id FROM public.match_participants
    WHERE match_id = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.player_stats
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create trigger to update player match counts when match is completed
CREATE TRIGGER update_player_match_count_trigger
AFTER UPDATE OF status ON public.matches
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE PROCEDURE public.update_player_match_count();

-- Analyze tables to update statistics for query planner
ANALYZE public.profiles;
ANALYZE public.matches;
ANALYZE public.sports;
ANALYZE public.players;
ANALYZE public.locations;
ANALYZE public.match_participants;
ANALYZE public.player_stats;
