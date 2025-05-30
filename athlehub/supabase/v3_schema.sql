-- Athlehub V3 Database Schema Extensions
-- Tournament System, Leaderboards, and Gamification

-- 1. Tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sport_id INTEGER REFERENCES public.sports(id) NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,

  -- Tournament configuration
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('knockout', 'round_robin', 'swiss')),
  max_teams INTEGER NOT NULL DEFAULT 8,
  team_size INTEGER NOT NULL DEFAULT 2,
  competitive_mode BOOLEAN DEFAULT true,

  -- Tournament status and timing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  tournament_start TIMESTAMP WITH TIME ZONE,
  tournament_end TIMESTAMP WITH TIME ZONE,

  -- Tournament rules
  match_duration INTEGER, -- in minutes
  scoring_system TEXT DEFAULT 'standard',
  tiebreaker_rules JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tournament teams table
CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  captain_user_id UUID REFERENCES auth.users(id),

  -- Team status
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'withdrawn')),
  seed_number INTEGER,

  -- Team stats (calculated)
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  points_for INTEGER DEFAULT 0,
  points_against INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(tournament_id, team_name)
);

-- 3. Tournament rounds table
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_name TEXT, -- e.g., "Quarter Finals", "Semi Finals", "Final"
  round_type TEXT DEFAULT 'elimination' CHECK (round_type IN ('group', 'elimination', 'playoff')),

  -- Round status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(tournament_id, round_number)
);

-- 4. Enhanced matches table for tournaments
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id),
ADD COLUMN IF NOT EXISTS tournament_round_id UUID REFERENCES public.tournament_rounds(id),
ADD COLUMN IF NOT EXISTS team_a_tournament_team_id UUID REFERENCES public.tournament_teams(id),
ADD COLUMN IF NOT EXISTS team_b_tournament_team_id UUID REFERENCES public.tournament_teams(id),
ADD COLUMN IF NOT EXISTS winner_team TEXT CHECK (winner_team IN ('team_a', 'team_b', 'draw')),
ADD COLUMN IF NOT EXISTS match_importance TEXT DEFAULT 'regular' CHECK (match_importance IN ('regular', 'playoff', 'final', 'championship'));

-- 5. Player badges and achievements
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('milestone', 'achievement', 'tournament', 'performance')),

  -- Badge criteria
  criteria JSONB, -- Flexible criteria definition
  sport_specific BOOLEAN DEFAULT false,
  sport_id INTEGER REFERENCES public.sports(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Player badge awards
CREATE TABLE IF NOT EXISTS public.player_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id),

  -- Award details
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  awarded_for_match_id UUID REFERENCES public.matches(id),
  awarded_for_tournament_id UUID REFERENCES public.tournaments(id),

  -- Award context
  award_context JSONB, -- Additional context about how badge was earned

  UNIQUE(player_id, badge_id)
);

-- 7. Leaderboards table (materialized view approach)
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Leaderboard scope
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('global', 'location', 'tournament', 'sport')),
  sport_id INTEGER REFERENCES public.sports(id),
  location_id UUID REFERENCES public.locations(id),
  tournament_id UUID REFERENCES public.tournaments(id),

  -- Time scope
  time_period TEXT NOT NULL CHECK (time_period IN ('all_time', 'season', 'month', 'week')),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,

  -- Leaderboard data
  stat_category TEXT NOT NULL, -- e.g., 'points', 'wins', 'assists'
  rankings JSONB NOT NULL, -- Array of player rankings with stats

  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_players INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Enhanced player stats for V3 intensity levels
ALTER TABLE public.player_stats
-- Basketball intermediate stats
ADD COLUMN IF NOT EXISTS offensive_rebounds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS defensive_rebounds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS personal_fouls INTEGER DEFAULT 0,

-- Football intermediate stats
ADD COLUMN IF NOT EXISTS shots_on_target INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shots_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passes_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passes_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tackles INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interceptions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dribbles_completed INTEGER DEFAULT 0,

-- Badminton intermediate stats
ADD COLUMN IF NOT EXISTS smashes_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS smash_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS drop_shots_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clears_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_play_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unforced_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forced_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_errors INTEGER DEFAULT 0,

-- Table Tennis intermediate stats
ADD COLUMN IF NOT EXISTS backhand_winners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forehand_winners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS topspin_winners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blocks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS smash_attempts INTEGER DEFAULT 0,

-- Volleyball intermediate stats
ADD COLUMN IF NOT EXISTS kill_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS serve_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS block_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hitting_errors INTEGER DEFAULT 0;

-- 9. Create indexes for V3 features
CREATE INDEX IF NOT EXISTS idx_tournaments_sport_id ON public.tournaments(sport_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_location_id ON public.tournaments(location_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON public.tournaments(created_by);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON public.tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rounds_tournament_id ON public.tournament_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_player_badges_player_id ON public.player_badges(player_id);
CREATE INDEX IF NOT EXISTS idx_player_badges_badge_id ON public.player_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_sport ON public.leaderboards(leaderboard_type, sport_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_location ON public.leaderboards(location_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_time_period ON public.leaderboards(time_period);

-- 10. Enable RLS on V3 tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for V3 tables

-- Tournaments policies
CREATE POLICY "Tournaments are viewable by everyone"
  ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Users can create tournaments"
  ON public.tournaments FOR INSERT WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their tournaments"
  ON public.tournaments FOR UPDATE USING ((SELECT auth.uid()) = created_by);

-- Tournament teams policies
CREATE POLICY "Tournament teams are viewable by everyone"
  ON public.tournament_teams FOR SELECT USING (true);

CREATE POLICY "Users can register teams for tournaments"
  ON public.tournament_teams FOR INSERT WITH CHECK ((SELECT auth.uid()) = captain_user_id);

CREATE POLICY "Team captains can update their teams"
  ON public.tournament_teams FOR UPDATE USING ((SELECT auth.uid()) = captain_user_id);

-- Tournament rounds policies
CREATE POLICY "Tournament rounds are viewable by everyone"
  ON public.tournament_rounds FOR SELECT USING (true);

CREATE POLICY "Tournament creators can manage rounds"
  ON public.tournament_rounds FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE tournaments.id = tournament_rounds.tournament_id
      AND tournaments.created_by = (SELECT auth.uid())
    )
  );

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT USING (true);

-- Player badges policies
CREATE POLICY "Player badges are viewable by everyone"
  ON public.player_badges FOR SELECT USING (true);

CREATE POLICY "System can award badges"
  ON public.player_badges FOR INSERT WITH CHECK (true);

-- Leaderboards policies
CREATE POLICY "Leaderboards are viewable by everyone"
  ON public.leaderboards FOR SELECT USING (true);

CREATE POLICY "System can update leaderboards"
  ON public.leaderboards FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update leaderboards"
  ON public.leaderboards FOR UPDATE USING (true);

-- 12. Create triggers for V3 tables
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.tournament_teams
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 13. Insert default badges
INSERT INTO public.badges (name, description, icon, badge_type, criteria) VALUES
('First Match', 'Played your first match', 'play-circle', 'milestone', '{"matches_played": 1}'),
('10 Matches', 'Played 10 matches', 'trophy', 'milestone', '{"matches_played": 10}'),
('50 Matches', 'Played 50 matches', 'medal', 'milestone', '{"matches_played": 50}'),
('100 Matches', 'Played 100 matches', 'star', 'milestone', '{"matches_played": 100}'),
('First Win', 'Won your first match', 'checkmark-circle', 'achievement', '{"matches_won": 1}'),
('Winning Streak', 'Won 5 matches in a row', 'flame', 'achievement', '{"winning_streak": 5}'),
('Tournament Winner', 'Won a tournament', 'trophy-outline', 'tournament', '{"tournaments_won": 1}'),
('High Scorer', 'Scored 50+ points in a basketball match', 'basketball', 'performance', '{"sport": "basketball", "points_in_match": 50}'),
('Hat Trick', 'Scored 3+ goals in a football match', 'football', 'performance', '{"sport": "football", "goals_in_match": 3}')
ON CONFLICT (name) DO NOTHING;

-- 14. Analyze tables for query optimization
ANALYZE public.tournaments;
ANALYZE public.tournament_teams;
ANALYZE public.tournament_rounds;
ANALYZE public.badges;
ANALYZE public.player_badges;
ANALYZE public.leaderboards;
