-- Performance Optimizations for Athlehub Database
-- Run this script to apply performance improvements to existing database

-- 1. Add indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport_id ON public.matches(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON public.matches(match_date DESC);

-- 2. Drop existing RLS policies that have performance issues
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.matches;

-- 3. Create optimized RLS policies that use (SELECT auth.uid()) instead of auth.uid()
-- This prevents re-evaluation of auth functions for each row

-- Profiles policies (optimized)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Matches policies (optimized)
CREATE POLICY "Users can insert their own matches" 
  ON public.matches FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own matches" 
  ON public.matches FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own matches" 
  ON public.matches FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- 4. Analyze tables to update statistics for query planner
ANALYZE public.profiles;
ANALYZE public.matches;
ANALYZE public.sports;
