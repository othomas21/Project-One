# Curie Radiology AI Search Engine - System Architecture

## 🏗️ MVP Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui for modern, accessible interface
- **Backend-as-a-Service**: Supabase for authentication, database, storage, edge functions
- **AI/ML Integration**: Med-Gemma (open-source), MONAI for image analysis
- **Search Engine**: Vector embeddings with Supabase pgvector extension
- **File Storage**: Supabase Storage for anonymized images and case files

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Curie Frontend (Next.js 14+)            │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search Interface   │  📚 Case Library   │  🎓 Education  │
│  - Semantic Search     │  - Personal Cases  │  - Explanations │
│  - Multimodal Search   │  - Collections     │  - Quizzes      │
│  - Image Upload        │  - Annotations     │  - References   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  🗄️  PostgreSQL Database    │  🔧 Edge Functions           │
│  - Cases metadata           │  - Semantic search           │
│  - User profiles            │  - Image processing          │
│  - Collections              │  - AI model integration      │
│  - Educational content      │  - Vector similarity         │
│                              │                              │
│  🗄️  Vector Store (pgvector) │  📁 Storage Buckets          │
│  - Case embeddings          │  - Anonymized images         │
│  - Image embeddings         │  - Case files                │
│  - Text embeddings          │  - Educational content       │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                External Integrations                        │
├─────────────────────────────────────────────────────────────┤
│  📖 Public Archives         │  🧠 AI/ML Services            │
│  - Radiopaedia API         │  - Med-Gemma (open-source)    │
│  - RSNA Case Collections   │  - MONAI image analysis       │
│  - Open-access journals    │  - Embedding generation       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 MVP Feature Implementation

### 1. Semantic Search Engine
```typescript
interface SemanticSearchEngine {
  // Search through case archives with natural language understanding
  searchCases(query: string, filters?: SearchFilters): Promise<SearchResults>;
  
  // Generate embeddings for text queries
  generateTextEmbedding(text: string): Promise<number[]>;
  
  // Find similar cases using vector similarity
  findSimilarCases(embedding: number[], limit: number): Promise<Case[]>;
}
```

### 2. Multimodal Search System
```typescript
interface MultimodalSearch {
  // Text-to-Image: Find images matching text description
  textToImageSearch(description: string): Promise<ImageResult[]>;
  
  // Image-to-Image: Find visually similar images
  imageToImageSearch(imageFile: File): Promise<ImageResult[]>;
  
  // Hybrid: Combine image and text for refined search
  hybridSearch(image: File, description: string): Promise<HybridResult[]>;
}
```

### 3. Educational Integration
```typescript
interface EducationalSystem {
  // Real-time explanations of imaging concepts
  explainConcept(concept: string): Promise<Explanation>;
  
  // Interactive quizzes based on search topics
  generateQuiz(topic: string): Promise<Quiz>;
  
  // Reference materials and protocols
  getReferences(topic: string): Promise<Reference[]>;
}
```

### 4. Case Library Builder
```typescript
interface CaseLibrary {
  // Upload anonymized cases
  uploadCase(caseData: CaseUpload): Promise<Case>;
  
  // Create private collections
  createCollection(name: string, cases: string[]): Promise<Collection>;
  
  // Add notes and annotations
  addAnnotation(caseId: string, annotation: Annotation): Promise<void>;
}
```

## 📊 Database Schema

### Core Tables
```sql
-- Users table (Supabase Auth integration)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radiology cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  modality TEXT NOT NULL, -- CT, MRI, X-Ray, etc.
  body_part TEXT,
  pathology TEXT,
  source TEXT NOT NULL, -- 'public', 'user_upload'
  source_url TEXT,
  anonymized BOOLEAN DEFAULT true,
  metadata JSONB,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case images
CREATE TABLE case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'dicom', 'jpg', 'png'
  sequence_number INTEGER DEFAULT 1,
  embedding vector(1536), -- Image embedding
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection cases (many-to-many)
CREATE TABLE collection_cases (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (collection_id, case_id)
);

-- Educational content
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'explanation', 'quiz', 'reference'
  topic TEXT NOT NULL,
  content JSONB NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User annotations
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL, -- 'note', 'measurement', 'finding'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance
```sql
-- Vector similarity indexes
CREATE INDEX idx_cases_embedding ON cases USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_case_images_embedding ON case_images USING ivfflat (embedding vector_cosine_ops);

-- Search indexes
CREATE INDEX idx_cases_modality ON cases(modality);
CREATE INDEX idx_cases_body_part ON cases(body_part);
CREATE INDEX idx_cases_pathology ON cases(pathology);
CREATE INDEX idx_cases_source ON cases(source);

-- Full-text search
CREATE INDEX idx_cases_text_search ON cases USING gin(to_tsvector('english', title || ' ' || description));
```

### Row-Level Security (RLS) Policies
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Cases are public or user-owned
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cases are viewable by everyone" ON cases
  FOR SELECT TO authenticated
  USING (source = 'public' OR created_by = (SELECT auth.uid()));

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Collections are private to users
CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Annotations are private to users
CREATE POLICY "Users can manage own annotations" ON annotations
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

## 🔧 Technical Implementation Details

### AI/ML Integration Points

1. **Med-Gemma Integration** (Open-source medical AI)
   - Case description generation
   - Medical concept explanation
   - Differential diagnosis suggestions

2. **MONAI Integration** (Medical imaging AI)
   - DICOM image processing
   - Image feature extraction
   - Anatomical structure detection

3. **Vector Embeddings**
   - Text embeddings using medical-specific models
   - Image embeddings using MONAI
   - Hybrid embeddings for multimodal search

### Data Sources (Public/Anonymized Only)

1. **Radiopaedia API Integration**
   - Public teaching cases
   - Structured case data
   - High-quality images

2. **RSNA Case Collections**
   - Competition datasets
   - Educational cases
   - Peer-reviewed content

3. **User-Uploaded Content**
   - Anonymized DICOM files
   - Teaching cases
   - Personal collections

## 🚀 Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
services:
  curie-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - MONAI_API_ENDPOINT=${MONAI_API_ENDPOINT}
    volumes:
      - ./src:/app/src
      - ./public:/app/public
```

### Production Deployment
- **Frontend**: Vercel with Next.js 14+ App Router
- **Backend**: Supabase Cloud (PostgreSQL + Storage + Edge Functions)
- **CDN**: Vercel Edge Network for global image delivery
- **Monitoring**: Supabase Analytics + Custom metrics

## 🔐 Security & Compliance

### Data Privacy
- All medical images must be anonymized
- No PHI (Protected Health Information) stored
- GDPR-compliant user data handling
- Secure file upload with virus scanning

### Authentication & Authorization
- Supabase Auth with email/password and OAuth
- Role-based access control (RBAC)
- API rate limiting
- Secure session management

### Medical Data Handling
- DICOM anonymization on upload
- Metadata stripping from images
- Secure storage with encryption
- Audit logging for data access

## 📋 Development Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [x] System architecture design
- [ ] Next.js 14+ project setup
- [ ] Supabase configuration
- [ ] shadcn/ui component library
- [ ] Authentication system

### Phase 2: Search Engine (Week 3-4)
- [ ] Semantic search implementation
- [ ] Vector database setup
- [ ] Public data integration
- [ ] Search UI components

### Phase 3: Multimodal Features (Week 5-6)
- [ ] Image upload and processing
- [ ] MONAI integration
- [ ] Multimodal search algorithms
- [ ] Image similarity engine

### Phase 4: Educational Content (Week 7-8)
- [ ] Med-Gemma integration
- [ ] Educational content system
- [ ] Interactive quizzes
- [ ] Reference materials

### Phase 5: Case Library (Week 9-10)
- [ ] Personal case management
- [ ] Collections and tagging
- [ ] Annotation system
- [ ] Export functionality

This architecture provides a solid foundation for the Curie MVP while maintaining scalability for future features and hospital integration.