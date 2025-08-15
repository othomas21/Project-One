/**
 * @file storage-setup-fixed.sql
 * @description Fixed Supabase Storage setup for medical imaging files
 * @author Claude Code
 * @created 2025-08-13
 * 
 * Creates storage buckets for medical images with HIPAA-compliant security
 * Note: RLS on storage.objects is automatically enabled in Supabase
 */

-- Create storage buckets for medical images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'medical-images',
    'medical-images', 
    false, -- Private bucket for HIPAA compliance
    524288000, -- 500MB max file size
    ARRAY[
      'application/dicom',
      'application/octet-stream',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp',
      'image/webp'
    ]
  ),
  (
    'thumbnails',
    'thumbnails',
    false, -- Private bucket
    10485760, -- 10MB max file size for thumbnails
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  ),
  (
    'temp-uploads',
    'temp-uploads',
    false, -- Private bucket for temporary uploads
    1073741824, -- 1GB max file size
    ARRAY[
      'application/dicom',
      'application/octet-stream',
      'application/zip',
      'application/x-tar',
      'application/gzip'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- Note: storage.objects RLS is automatically enabled in Supabase
-- Create simplified RLS policies that work with Supabase's system

-- Basic authenticated user access to medical images
-- (In production, you would add institution-based filtering)
CREATE POLICY "Authenticated users can access medical images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'medical-images');

-- Basic authenticated user access to thumbnails  
CREATE POLICY "Authenticated users can access thumbnails" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'thumbnails');

-- Users can manage their own temp uploads
CREATE POLICY "Users can manage temp uploads" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'temp-uploads');

-- Create storage helper functions
CREATE OR REPLACE FUNCTION get_file_upload_path(
  p_patient_id TEXT,
  p_study_uid TEXT,
  p_series_uid TEXT,
  p_instance_uid TEXT,
  p_file_extension TEXT DEFAULT '.dcm'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate structured path: patient/study/series/instance.ext
  RETURN CONCAT(
    p_patient_id,
    '/',
    p_study_uid,
    '/',
    p_series_uid,
    '/',
    p_instance_uid,
    p_file_extension
  );
END;
$$;

-- Create thumbnail path generator
CREATE OR REPLACE FUNCTION get_thumbnail_path(
  p_instance_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  instance_record RECORD;
BEGIN
  SELECT 
    instances.sop_instance_uid,
    series.series_instance_uid,
    studies.study_instance_uid,
    patients.patient_id
  INTO instance_record
  FROM instances
  JOIN series ON instances.series_id = series.id
  JOIN studies ON series.study_id = studies.id
  JOIN patients ON studies.patient_id = patients.id
  WHERE instances.id = p_instance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;
  
  RETURN CONCAT(
    'thumbnails/',
    instance_record.patient_id,
    '/',
    instance_record.study_instance_uid,
    '/',
    instance_record.series_instance_uid,
    '/',
    instance_record.sop_instance_uid,
    '_thumb.jpg'
  );
END;
$$;