-- Row-Level Security (RLS) Policies for Curie Radiology Search Engine
-- @supabase Security policies to protect user data and ensure proper access control

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES TABLE POLICIES
-- =============================================================================

-- Users can view all public profile information
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =============================================================================
-- RADIOLOGY CASES TABLE POLICIES
-- =============================================================================

-- Everyone can view published cases
CREATE POLICY "Published cases are viewable by everyone" ON radiology_cases
  FOR SELECT USING (status = 'published');

-- Users can view their own cases (any status)
CREATE POLICY "Users can view own cases" ON radiology_cases
  FOR SELECT USING ((SELECT auth.uid()) = created_by);

-- Admins and radiologists can view all cases
CREATE POLICY "Admins and radiologists can view all cases" ON radiology_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'radiologist')
    )
  );

-- Authenticated users can create cases
CREATE POLICY "Authenticated users can create cases" ON radiology_cases
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL AND
    (SELECT auth.uid()) = created_by
  );

-- Users can update their own cases
CREATE POLICY "Users can update own cases" ON radiology_cases
  FOR UPDATE USING ((SELECT auth.uid()) = created_by);

-- Admins can update any case
CREATE POLICY "Admins can update any case" ON radiology_cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Radiologists can review cases (update reviewed_by and reviewed_at)
CREATE POLICY "Radiologists can review cases" ON radiology_cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('radiologist', 'admin')
    )
  );

-- Users can delete their own draft cases
CREATE POLICY "Users can delete own draft cases" ON radiology_cases
  FOR DELETE USING (
    (SELECT auth.uid()) = created_by AND status = 'draft'
  );

-- Admins can delete any case
CREATE POLICY "Admins can delete any case" ON radiology_cases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =============================================================================
-- SEARCH HISTORY TABLE POLICIES
-- =============================================================================

-- Users can only see their own search history
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own search history
CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all search history (for analytics)
CREATE POLICY "Admins can view all search history" ON search_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Users can delete their own search history
CREATE POLICY "Users can delete own search history" ON search_history
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- CASE FAVORITES TABLE POLICIES
-- =============================================================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON case_favorites
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Users can add to their own favorites
CREATE POLICY "Users can add own favorites" ON case_favorites
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can remove from their own favorites
CREATE POLICY "Users can remove own favorites" ON case_favorites
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Admins can view all favorites (for analytics)
CREATE POLICY "Admins can view all favorites" ON case_favorites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =============================================================================
-- CASE RATINGS TABLE POLICIES
-- =============================================================================

-- Everyone can view all ratings (aggregated data)
CREATE POLICY "All ratings are viewable" ON case_ratings
  FOR SELECT USING (true);

-- Users can add their own ratings
CREATE POLICY "Users can add own ratings" ON case_ratings
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON case_ratings
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON case_ratings
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- CASE COMMENTS TABLE POLICIES
-- =============================================================================

-- Everyone can view approved comments
CREATE POLICY "Approved comments are viewable by everyone" ON case_comments
  FOR SELECT USING (is_approved = true);

-- Users can view their own comments (regardless of approval status)
CREATE POLICY "Users can view own comments" ON case_comments
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Admins and radiologists can view all comments
CREATE POLICY "Admins and radiologists can view all comments" ON case_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'radiologist')
    )
  );

-- Authenticated users can add comments
CREATE POLICY "Authenticated users can add comments" ON case_comments
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL AND
    (SELECT auth.uid()) = user_id
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON case_comments
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Admins and radiologists can approve comments
CREATE POLICY "Admins and radiologists can approve comments" ON case_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'radiologist')
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON case_comments
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" ON case_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =============================================================================
-- USER ACTIVITIES TABLE POLICIES
-- =============================================================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all activities (for analytics)
CREATE POLICY "Admins can view all activities" ON user_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =============================================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is radiologist or admin
CREATE OR REPLACE FUNCTION is_radiologist_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role IN ('radiologist', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can moderate content
CREATE OR REPLACE FUNCTION can_moderate()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role IN ('radiologist', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PERFORMANCE OPTIMIZATIONS FOR RLS
-- =============================================================================

-- Create optimized indexes for RLS queries
-- These indexes improve performance of RLS policy checks

-- Index for auth.uid() lookups in profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_auth_uid 
ON profiles(id) WHERE id = (SELECT auth.uid());

-- Index for created_by lookups in radiology_cases
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_radiology_cases_created_by_auth 
ON radiology_cases(created_by) WHERE created_by = (SELECT auth.uid());

-- Index for user_id lookups in search_history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_user_auth 
ON search_history(user_id) WHERE user_id = (SELECT auth.uid());

-- Index for user_id lookups in case_favorites
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_case_favorites_user_auth 
ON case_favorites(user_id) WHERE user_id = (SELECT auth.uid());

-- Index for user_id lookups in case_ratings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_case_ratings_user_auth 
ON case_ratings(user_id) WHERE user_id = (SELECT auth.uid());

-- Index for user_id lookups in case_comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_case_comments_user_auth 
ON case_comments(user_id) WHERE user_id = (SELECT auth.uid());

-- Index for user_id lookups in user_activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_user_auth 
ON user_activities(user_id) WHERE user_id = (SELECT auth.uid());

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON POLICY "Public profiles are viewable by everyone" ON profiles IS 
'Allows all users to see basic profile information for educational collaboration';

COMMENT ON POLICY "Published cases are viewable by everyone" ON radiology_cases IS 
'Published educational cases are accessible to all users for learning purposes';

COMMENT ON POLICY "Authenticated users can create cases" ON radiology_cases IS 
'Allows authenticated users to contribute educational content';

COMMENT ON FUNCTION is_admin() IS 
'Helper function to check if current user has admin privileges';

COMMENT ON FUNCTION can_moderate() IS 
'Helper function to check if current user can moderate content (radiologist or admin)';

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;