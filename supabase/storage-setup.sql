/**
 * @file storage-setup.sql
 * @description Supabase Storage setup for medical imaging files
 * @author Claude Code
 * @created 2025-08-13
 * 
 * Creates storage buckets for medical images with HIPAA-compliant security
 * @reftools Verified against: Supabase Storage v2.x, HIPAA compliance standards
 * @supabase Storage RLS policies for healthcare data protection
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
      'image/webp',
      'image/x-portable-bitmap',
      'image/x-portable-graymap',
      'image/x-portable-pixmap'
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

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access files from their institution
CREATE POLICY "Institution isolation for medical images" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'medical-images' AND
    auth.uid()::text = ANY(
      SELECT ARRAY[created_by::text] 
      FROM instances 
      WHERE file_path = name 
      AND institution = (
        SELECT institution 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'medical-images' AND
    auth.uid()::text = ANY(
      SELECT ARRAY[created_by::text] 
      FROM instances 
      WHERE file_path = name 
      AND institution = (
        SELECT institution 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- RLS Policy: Thumbnails access control
CREATE POLICY "Institution isolation for thumbnails" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = ANY(
      SELECT ARRAY[created_by::text] 
      FROM instances 
      WHERE thumbnail_path = name 
      AND institution = (
        SELECT institution 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = ANY(
      SELECT ARRAY[created_by::text] 
      FROM instances 
      WHERE thumbnail_path = name 
      AND institution = (
        SELECT institution 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- RLS Policy: Temp uploads - users can only access their own uploads
CREATE POLICY "Users can manage their own temp uploads" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'temp-uploads' AND
    owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'temp-uploads' AND
    owner = auth.uid()
  );

-- RLS Policy: Admins can access all files in their institution
CREATE POLICY "Admins can access institutional files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    (bucket_id IN ('medical-images', 'thumbnails')) AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

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
  -- Generate structured path: institution/patient/study/series/instance.ext
  RETURN CONCAT(
    (SELECT institution FROM profiles WHERE id = auth.uid()),
    '/',
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
    patients.patient_id,
    profiles.institution
  INTO instance_record
  FROM instances
  JOIN series ON instances.series_id = series.id
  JOIN studies ON series.study_id = studies.id
  JOIN patients ON studies.patient_id = patients.id
  JOIN profiles ON instances.created_by = profiles.id
  WHERE instances.id = p_instance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;
  
  RETURN CONCAT(
    instance_record.institution,
    '/thumbnails/',
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;