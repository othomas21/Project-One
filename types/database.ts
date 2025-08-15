/**
 * @file database.ts  
 * @description TypeScript database types for Supabase medical imaging schema
 * @module types
 * 
 * Auto-generated types for medical imaging database schema
 * These types ensure type safety across the application
 * 
 * @reftools Verified against: PostgreSQL 14+ data types, DICOM standard
 * @supabase Generated types for Supabase database schema
 * @author Claude Code
 * @created 2025-08-13
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'radiologist' | 'technologist' | 'physician' | 'admin'
          license_number: string | null
          institution: string | null
          department: string | null
          specialty: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'radiologist' | 'technologist' | 'physician' | 'admin'
          license_number?: string | null
          institution?: string | null
          department?: string | null
          specialty?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'radiologist' | 'technologist' | 'physician' | 'admin'
          license_number?: string | null
          institution?: string | null
          department?: string | null
          specialty?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          patient_name: string | null
          patient_birth_date: string | null
          patient_sex: 'M' | 'F' | 'O' | 'U' | null
          patient_age: string | null
          patient_weight: number | null
          patient_size: number | null
          ethnic_group: string | null
          patient_comments: string | null
          medical_record_number: string | null
          insurance_plan_identification: string | null
          encrypted_data: Json | null
          created_by: string | null
          institution: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          patient_name?: string | null
          patient_birth_date?: string | null
          patient_sex?: 'M' | 'F' | 'O' | 'U' | null
          patient_age?: string | null
          patient_weight?: number | null
          patient_size?: number | null
          ethnic_group?: string | null
          patient_comments?: string | null
          medical_record_number?: string | null
          insurance_plan_identification?: string | null
          encrypted_data?: Json | null
          created_by?: string | null
          institution: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          patient_name?: string | null
          patient_birth_date?: string | null
          patient_sex?: 'M' | 'F' | 'O' | 'U' | null
          patient_age?: string | null
          patient_weight?: number | null
          patient_size?: number | null
          ethnic_group?: string | null
          patient_comments?: string | null
          medical_record_number?: string | null
          insurance_plan_identification?: string | null
          encrypted_data?: Json | null
          created_by?: string | null
          institution?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'patients_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      studies: {
        Row: {
          id: string
          patient_id: string
          study_instance_uid: string
          study_id: string | null
          study_date: string | null
          study_time: string | null
          study_description: string | null
          accession_number: string | null
          referring_physician_name: string | null
          attending_physician_name: string | null
          patient_age_at_study: string | null
          patient_weight_at_study: number | null
          study_priority: 'ROUTINE' | 'HIGH' | 'URGENT' | 'STAT' | null
          study_status: 'SCHEDULED' | 'ARRIVED' | 'READY' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED'
          modalities_in_study: string[] | null
          number_of_study_related_series: number
          number_of_study_related_instances: number
          institution: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          study_instance_uid: string
          study_id?: string | null
          study_date?: string | null
          study_time?: string | null
          study_description?: string | null
          accession_number?: string | null
          referring_physician_name?: string | null
          attending_physician_name?: string | null
          patient_age_at_study?: string | null
          patient_weight_at_study?: number | null
          study_priority?: 'ROUTINE' | 'HIGH' | 'URGENT' | 'STAT' | null
          study_status?: 'SCHEDULED' | 'ARRIVED' | 'READY' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED'
          modalities_in_study?: string[] | null
          number_of_study_related_series?: number
          number_of_study_related_instances?: number
          institution: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          study_instance_uid?: string
          study_id?: string | null
          study_date?: string | null
          study_time?: string | null
          study_description?: string | null
          accession_number?: string | null
          referring_physician_name?: string | null
          attending_physician_name?: string | null
          patient_age_at_study?: string | null
          patient_weight_at_study?: number | null
          study_priority?: 'ROUTINE' | 'HIGH' | 'URGENT' | 'STAT' | null
          study_status?: 'SCHEDULED' | 'ARRIVED' | 'READY' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED'
          modalities_in_study?: string[] | null
          number_of_study_related_series?: number
          number_of_study_related_instances?: number
          institution?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'studies_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'studies_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      series: {
        Row: {
          id: string
          study_id: string
          series_instance_uid: string
          series_number: number | null
          series_description: string | null
          modality: string
          body_part_examined: string | null
          series_date: string | null
          series_time: string | null
          performing_physician_name: string | null
          operator_name: string | null
          patient_position: string | null
          laterality: 'R' | 'L' | 'A' | 'P' | 'RL' | 'LR' | null
          protocol_name: string | null
          sequence_name: string | null
          scanning_sequence: string | null
          sequence_variant: string | null
          scan_options: string | null
          mr_acquisition_type: string | null
          slice_thickness: number | null
          spacing_between_slices: number | null
          echo_time: number | null
          repetition_time: number | null
          flip_angle: number | null
          magnetic_field_strength: number | null
          kvp: number | null
          exposure_time: number | null
          x_ray_tube_current: number | null
          exposure: number | null
          pixel_spacing: number[] | null
          image_orientation_patient: number[] | null
          image_position_patient: number[] | null
          rows: number | null
          columns: number | null
          pixel_bandwidth: number | null
          window_center: number | null
          window_width: number | null
          rescale_intercept: number | null
          rescale_slope: number | null
          number_of_series_related_instances: number
          institution: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id: string
          series_instance_uid: string
          series_number?: number | null
          series_description?: string | null
          modality: string
          body_part_examined?: string | null
          series_date?: string | null
          series_time?: string | null
          performing_physician_name?: string | null
          operator_name?: string | null
          patient_position?: string | null
          laterality?: 'R' | 'L' | 'A' | 'P' | 'RL' | 'LR' | null
          protocol_name?: string | null
          sequence_name?: string | null
          scanning_sequence?: string | null
          sequence_variant?: string | null
          scan_options?: string | null
          mr_acquisition_type?: string | null
          slice_thickness?: number | null
          spacing_between_slices?: number | null
          echo_time?: number | null
          repetition_time?: number | null
          flip_angle?: number | null
          magnetic_field_strength?: number | null
          kvp?: number | null
          exposure_time?: number | null
          x_ray_tube_current?: number | null
          exposure?: number | null
          pixel_spacing?: number[] | null
          image_orientation_patient?: number[] | null
          image_position_patient?: number[] | null
          rows?: number | null
          columns?: number | null
          pixel_bandwidth?: number | null
          window_center?: number | null
          window_width?: number | null
          rescale_intercept?: number | null
          rescale_slope?: number | null
          number_of_series_related_instances?: number
          institution: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          study_id?: string
          series_instance_uid?: string
          series_number?: number | null
          series_description?: string | null
          modality?: string
          body_part_examined?: string | null
          series_date?: string | null
          series_time?: string | null
          performing_physician_name?: string | null
          operator_name?: string | null
          patient_position?: string | null
          laterality?: 'R' | 'L' | 'A' | 'P' | 'RL' | 'LR' | null
          protocol_name?: string | null
          sequence_name?: string | null
          scanning_sequence?: string | null
          sequence_variant?: string | null
          scan_options?: string | null
          mr_acquisition_type?: string | null
          slice_thickness?: number | null
          spacing_between_slices?: number | null
          echo_time?: number | null
          repetition_time?: number | null
          flip_angle?: number | null
          magnetic_field_strength?: number | null
          kvp?: number | null
          exposure_time?: number | null
          x_ray_tube_current?: number | null
          exposure?: number | null
          pixel_spacing?: number[] | null
          image_orientation_patient?: number[] | null
          image_position_patient?: number[] | null
          rows?: number | null
          columns?: number | null
          pixel_bandwidth?: number | null
          window_center?: number | null
          window_width?: number | null
          rescale_intercept?: number | null
          rescale_slope?: number | null
          number_of_series_related_instances?: number
          institution?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'series_study_id_fkey'
            columns: ['study_id']
            isOneToOne: false
            referencedRelation: 'studies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'series_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      instances: {
        Row: {
          id: string
          series_id: string
          sop_instance_uid: string
          instance_number: number | null
          image_type: string[] | null
          acquisition_date: string | null
          acquisition_time: string | null
          content_date: string | null
          content_time: string | null
          image_position_patient: number[] | null
          image_orientation_patient: number[] | null
          slice_location: number | null
          slice_thickness: number | null
          echo_number: number | null
          temporal_position_identifier: number | null
          number_of_averages: number | null
          imaging_frequency: number | null
          imaged_nucleus: string | null
          echo_train_length: number | null
          percent_sampling: number | null
          percent_phase_field_of_view: number | null
          trigger_time: number | null
          nominal_interval: number | null
          beat_rejection_flag: string | null
          low_r_r_value: number | null
          high_r_r_value: number | null
          intervals_acquired: number | null
          intervals_rejected: number | null
          file_path: string | null
          file_size: number | null
          file_hash: string | null
          thumbnail_path: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis_results: Json | null
          institution: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          series_id: string
          sop_instance_uid: string
          instance_number?: number | null
          image_type?: string[] | null
          acquisition_date?: string | null
          acquisition_time?: string | null
          content_date?: string | null
          content_time?: string | null
          image_position_patient?: number[] | null
          image_orientation_patient?: number[] | null
          slice_location?: number | null
          slice_thickness?: number | null
          echo_number?: number | null
          temporal_position_identifier?: number | null
          number_of_averages?: number | null
          imaging_frequency?: number | null
          imaged_nucleus?: string | null
          echo_train_length?: number | null
          percent_sampling?: number | null
          percent_phase_field_of_view?: number | null
          trigger_time?: number | null
          nominal_interval?: number | null
          beat_rejection_flag?: string | null
          low_r_r_value?: number | null
          high_r_r_value?: number | null
          intervals_acquired?: number | null
          intervals_rejected?: number | null
          file_path?: string | null
          file_size?: number | null
          file_hash?: string | null
          thumbnail_path?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis_results?: Json | null
          institution: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          series_id?: string
          sop_instance_uid?: string
          instance_number?: number | null
          image_type?: string[] | null
          acquisition_date?: string | null
          acquisition_time?: string | null
          content_date?: string | null
          content_time?: string | null
          image_position_patient?: number[] | null
          image_orientation_patient?: number[] | null
          slice_location?: number | null
          slice_thickness?: number | null
          echo_number?: number | null
          temporal_position_identifier?: number | null
          number_of_averages?: number | null
          imaging_frequency?: number | null
          imaged_nucleus?: string | null
          echo_train_length?: number | null
          percent_sampling?: number | null
          percent_phase_field_of_view?: number | null
          trigger_time?: number | null
          nominal_interval?: number | null
          beat_rejection_flag?: string | null
          low_r_r_value?: number | null
          high_r_r_value?: number | null
          intervals_acquired?: number | null
          intervals_rejected?: number | null
          file_path?: string | null
          file_size?: number | null
          file_hash?: string | null
          thumbnail_path?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis_results?: Json | null
          institution?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'instances_series_id_fkey'
            columns: ['series_id']
            isOneToOne: false
            referencedRelation: 'series'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'instances_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      study_reports: {
        Row: {
          id: string
          study_id: string
          report_type: 'preliminary' | 'final' | 'addendum' | 'correction'
          report_status: 'draft' | 'pending' | 'verified' | 'final'
          report_title: string | null
          report_content: string | null
          findings: string | null
          impression: string | null
          recommendations: string | null
          report_date: string
          report_time: string
          dictated_by: string | null
          transcribed_by: string | null
          verified_by: string | null
          cosigned_by: string | null
          verified_at: string | null
          structured_data: Json | null
          institution: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id: string
          report_type?: 'preliminary' | 'final' | 'addendum' | 'correction'
          report_status?: 'draft' | 'pending' | 'verified' | 'final'
          report_title?: string | null
          report_content?: string | null
          findings?: string | null
          impression?: string | null
          recommendations?: string | null
          report_date?: string
          report_time?: string
          dictated_by?: string | null
          transcribed_by?: string | null
          verified_by?: string | null
          cosigned_by?: string | null
          verified_at?: string | null
          structured_data?: Json | null
          institution: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          study_id?: string
          report_type?: 'preliminary' | 'final' | 'addendum' | 'correction'
          report_status?: 'draft' | 'pending' | 'verified' | 'final'
          report_title?: string | null
          report_content?: string | null
          findings?: string | null
          impression?: string | null
          recommendations?: string | null
          report_date?: string
          report_time?: string
          dictated_by?: string | null
          transcribed_by?: string | null
          verified_by?: string | null
          cosigned_by?: string | null
          verified_at?: string | null
          structured_data?: Json | null
          institution?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_reports_study_id_fkey'
            columns: ['study_id']
            isOneToOne: false
            referencedRelation: 'studies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'study_reports_dictated_by_fkey'
            columns: ['dictated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      image_annotations: {
        Row: {
          id: string
          instance_id: string
          annotation_type: 'measurement' | 'roi' | 'text' | 'arrow' | 'circle' | 'rectangle' | 'freehand'
          annotation_data: Json
          description: string | null
          measurement_value: number | null
          measurement_unit: string | null
          created_by: string
          institution: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instance_id: string
          annotation_type: 'measurement' | 'roi' | 'text' | 'arrow' | 'circle' | 'rectangle' | 'freehand'
          annotation_data: Json
          description?: string | null
          measurement_value?: number | null
          measurement_unit?: string | null
          created_by: string
          institution: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instance_id?: string
          annotation_type?: 'measurement' | 'roi' | 'text' | 'arrow' | 'circle' | 'rectangle' | 'freehand'
          annotation_data?: Json
          description?: string | null
          measurement_value?: number | null
          measurement_unit?: string | null
          created_by?: string
          institution?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'image_annotations_instance_id_fkey'
            columns: ['instance_id']
            isOneToOne: false
            referencedRelation: 'instances'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'image_annotations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_values: Json | null
          new_values: Json | null
          user_id: string
          user_role: string | null
          user_institution: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_values?: Json | null
          new_values?: Json | null
          user_id: string
          user_role?: string | null
          user_institution?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_values?: Json | null
          new_values?: Json | null
          user_id?: string
          user_role?: string | null
          user_institution?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      get_user_institution: {
        Args: {}
        Returns: string
      }
      get_user_role: {
        Args: {}
        Returns: string
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}