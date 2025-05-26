-- Athlehub V2 Migration Script
-- Run this script to upgrade existing V1 database to V2

-- 1. Update sports table with new columns
ALTER TABLE public.sports
ADD COLUMN IF NOT EXISTS max_players_per_team INTEGER DEFAULT 11,
ADD COLUMN IF NOT EXISTS min_players_per_team INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS supports_sets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_match_duration INTEGER;

-- 2. Update existing sports data
UPDATE public.sports SET
  max_players_per_team = 5, min_players_per_team = 1, supports_sets = false, default_match_duration = 48
WHERE name = 'Basketball';

UPDATE public.sports SET
  max_players_per_team = 11, min_players_per_team = 1, supports_sets = false, default_match_duration = 90
WHERE name = 'Football';

UPDATE public.sports SET
  max_players_per_team = 2, min_players_per_team = 1, supports_sets = true, default_match_duration = 60
WHERE name = 'Badminton';

UPDATE public.sports SET
  max_players_per_team = 2, min_players_per_team = 1, supports_sets = true, default_match_duration = 45
WHERE name = 'Table Tennis';

UPDATE public.sports SET
  max_players_per_team = 6, min_players_per_team = 1, supports_sets = true, default_match_duration = 90
WHERE name = 'Volleyball';

-- 3. Add new columns to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS match_type TEXT DEFAULT 'single' CHECK (match_type IN ('single', 'set_based', 'tournament')),
ADD COLUMN IF NOT EXISTS match_mode TEXT DEFAULT 'past_entry' CHECK (match_mode IN ('real_time', 'past_entry')),
ADD COLUMN IF NOT EXISTS competitive_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS match_duration INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS sets_data JSONB;

-- 4. Create new tables
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

CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  location_id UUID REFERENCES public.locations(id),
  total_matches INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id),
  team TEXT NOT NULL CHECK (team IN ('team_a', 'team_b')),
  jersey_number INTEGER,
  is_substitute BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- 5. Create new indexes
CREATE INDEX IF NOT EXISTS idx_matches_location_id ON public.matches(location_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_player_id ON public.match_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_match_id ON public.player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_players_created_by ON public.players(created_by);
CREATE INDEX IF NOT EXISTS idx_locations_sport_id ON public.locations(sport_id);

-- 6. Enable RLS on new tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for new tables
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

-- 8. Create new functions and triggers
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

-- Create triggers for updated_at on new tables
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

-- 9. Analyze tables to update statistics for query planner
ANALYZE public.players;
ANALYZE public.locations;
ANALYZE public.match_participants;
ANALYZE public.player_stats;
