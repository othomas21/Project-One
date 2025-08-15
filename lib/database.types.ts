/**
 * @file database.types.ts
 * @description TypeScript types for Supabase database schema
 * @module lib/database
 * @supabase Generated types will be updated once schema is created
 */

export interface Database {
  public: {
    Tables: {
      // Radiology search tables will be defined here
      radiology_cases: {
        Row: {
          id: string
          title: string
          description: string
          modality: string
          body_part: string
          findings: string
          diagnosis: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          tags: string[]
          image_urls: string[]
          dicom_urls: string[]
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          modality: string
          body_part: string
          findings: string
          diagnosis: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          tags?: string[]
          image_urls?: string[]
          dicom_urls?: string[]
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          modality?: string
          body_part?: string
          findings?: string
          diagnosis?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          tags?: string[]
          image_urls?: string[]
          dicom_urls?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'student' | 'radiologist' | 'admin'
          institution: string | null
          specialization: string | null
          experience_years: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'student' | 'radiologist' | 'admin'
          institution?: string | null
          specialization?: string | null
          experience_years?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'student' | 'radiologist' | 'admin'
          institution?: string | null
          specialization?: string | null
          experience_years?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          results_count: number
          filters: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          results_count: number
          filters?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          results_count?: number
          filters?: Record<string, any>
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'radiologist' | 'admin'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      modality_type: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'Mammography' | 'Nuclear Medicine' | 'PET' | 'Other'
    }
  }
}