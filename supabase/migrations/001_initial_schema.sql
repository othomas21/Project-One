-- Initial database schema for Curie Radiology Search Engine
-- @supabase Migration for radiology case management and search functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings (if using pgvector)

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('student', 'radiologist', 'admin');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE modality_type AS ENUM ('CT', 'MRI', 'X-Ray', 'Ultrasound', 'Mammography', 'Nuclear Medicine', 'PET', 'Other');
CREATE TYPE case_status AS ENUM ('draft', 'published', 'archived', 'under_review');

-- User profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  institution TEXT,
  specialization TEXT,
  experience_years INTEGER CHECK (experience_years >= 0),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_institution ON profiles(institution);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Radiology cases table
CREATE TABLE radiology_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  case_history TEXT, -- Patient history (anonymized)
  clinical_presentation TEXT, -- Symptoms and signs
  modality modality_type NOT NULL,
  body_part TEXT NOT NULL,
  findings TEXT NOT NULL, -- Imaging findings
  diagnosis TEXT NOT NULL, -- Final diagnosis
  differential_diagnosis TEXT[], -- List of differential diagnoses
  teaching_points TEXT[], -- Key learning points
  difficulty_level difficulty_level DEFAULT 'intermediate',
  status case_status DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}', -- Searchable tags
  keywords TEXT[], -- Additional keywords for search
  image_urls TEXT[] DEFAULT '{}', -- URLs to case images
  dicom_urls TEXT[] DEFAULT '{}', -- URLs to DICOM files
  thumbnail_url TEXT, -- Main thumbnail image
  age_range TEXT, -- e.g., "40-50", "pediatric", "elderly"
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'not_specified')),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  search_vector tsvector, -- Full-text search vector
  embedding vector(1536), -- AI embedding for semantic search (OpenAI dimension)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  reviewed_by UUID REFERENCES profiles(id), -- Who reviewed/approved the case
  reviewed_at TIMESTAMPTZ
);

-- Add indexes for radiology_cases
CREATE INDEX idx_radiology_cases_modality ON radiology_cases(modality);
CREATE INDEX idx_radiology_cases_body_part ON radiology_cases(body_part);
CREATE INDEX idx_radiology_cases_difficulty ON radiology_cases(difficulty_level);
CREATE INDEX idx_radiology_cases_status ON radiology_cases(status);
CREATE INDEX idx_radiology_cases_created_by ON radiology_cases(created_by);
CREATE INDEX idx_radiology_cases_tags ON radiology_cases USING GIN(tags);
CREATE INDEX idx_radiology_cases_keywords ON radiology_cases USING GIN(keywords);
CREATE INDEX idx_radiology_cases_created_at ON radiology_cases(created_at DESC);
CREATE INDEX idx_radiology_cases_view_count ON radiology_cases(view_count DESC);
CREATE INDEX idx_radiology_cases_featured ON radiology_cases(is_featured) WHERE is_featured = TRUE;

-- Full-text search index
CREATE INDEX idx_radiology_cases_search ON radiology_cases USING GIN(search_vector);

-- Vector similarity index (for semantic search)
CREATE INDEX ON radiology_cases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Search history table
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT DEFAULT 'keyword', -- 'keyword', 'semantic', 'filters'
  results_count INTEGER DEFAULT 0,
  filters JSONB DEFAULT '{}', -- Store filter criteria
  execution_time_ms INTEGER, -- Query performance tracking
  clicked_results UUID[], -- Track which results were clicked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for search_history
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX idx_search_history_query ON search_history USING GIN(to_tsvector('english', query));

-- Case favorites table (user bookmarks)
CREATE TABLE case_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES radiology_cases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_id)
);

-- Add indexes for case_favorites
CREATE INDEX idx_case_favorites_user_id ON case_favorites(user_id);
CREATE INDEX idx_case_favorites_case_id ON case_favorites(case_id);

-- Case ratings table
CREATE TABLE case_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES radiology_cases(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  difficulty_rating difficulty_level,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_id)
);

-- Add indexes for case_ratings
CREATE INDEX idx_case_ratings_case_id ON case_ratings(case_id);
CREATE INDEX idx_case_ratings_rating ON case_ratings(rating);

-- Case comments table (for educational discussions)
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES radiology_cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES case_comments(id), -- For threaded comments
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE, -- Moderation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for case_comments
CREATE INDEX idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX idx_case_comments_user_id ON case_comments(user_id);
CREATE INDEX idx_case_comments_parent_id ON case_comments(parent_id);
CREATE INDEX idx_case_comments_created_at ON case_comments(created_at DESC);

-- Activity log table (for analytics and user tracking)
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'view_case', 'search', 'favorite', 'comment', 'rate'
  entity_type TEXT, -- 'case', 'search', 'comment'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_activities
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radiology_cases_updated_at BEFORE UPDATE ON radiology_cases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_ratings_updated_at BEFORE UPDATE ON case_ratings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_comments_updated_at BEFORE UPDATE ON case_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vector when case content changes
CREATE OR REPLACE FUNCTION update_radiology_case_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.findings, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.diagnosis, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.keywords, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_part, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER update_radiology_case_search_trigger
  BEFORE INSERT OR UPDATE ON radiology_cases
  FOR EACH ROW EXECUTE FUNCTION update_radiology_case_search_vector();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_case_view_count(case_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE radiology_cases 
  SET view_count = view_count + 1 
  WHERE id = case_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get case statistics
CREATE OR REPLACE FUNCTION get_case_stats(case_uuid UUID)
RETURNS TABLE(
  avg_rating DECIMAL,
  total_ratings BIGINT,
  total_favorites BIGINT,
  total_comments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(cr.rating), 0)::DECIMAL as avg_rating,
    COUNT(cr.rating) as total_ratings,
    (SELECT COUNT(*) FROM case_favorites cf WHERE cf.case_id = case_uuid) as total_favorites,
    (SELECT COUNT(*) FROM case_comments cc WHERE cc.case_id = case_uuid) as total_comments
  FROM case_ratings cr 
  WHERE cr.case_id = case_uuid;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (for development/testing)
-- Insert sample profile (will be replaced with real auth users)
-- INSERT INTO profiles (id, email, full_name, role, institution) 
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000'::UUID, 'admin@example.com', 'System Admin', 'admin', 'Demo Institution');

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE radiology_cases IS 'Radiology cases for educational search and review';
COMMENT ON TABLE search_history IS 'User search activity tracking';
COMMENT ON TABLE case_favorites IS 'User bookmarked cases';
COMMENT ON TABLE case_ratings IS 'User ratings and reviews for cases';
COMMENT ON TABLE case_comments IS 'Educational discussions on cases';
COMMENT ON TABLE user_activities IS 'User activity tracking for analytics';