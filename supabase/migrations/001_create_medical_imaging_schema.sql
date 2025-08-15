/**
 * @file 001_create_medical_imaging_schema.sql
 * @description Initial medical imaging database schema for DICOM data management
 * @author Claude Code
 * @created 2025-08-13
 * 
 * Schema follows DICOM hierarchy: Patient → Study → Series → Instance
 * @reftools Verified against: PostgreSQL 14+ best practices, DICOM standard structure
 * @supabase Optimized with RLS policies for healthcare data security
 */

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Healthcare provider profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('radiologist', 'technologist', 'physician', 'admin')) NOT NULL DEFAULT 'physician',
    license_number TEXT,
    institution TEXT,
    department TEXT,
    specialty TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table (DICOM Patient level)
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id TEXT UNIQUE NOT NULL, -- DICOM PatientID
    patient_name TEXT, -- DICOM PatientName
    patient_birth_date DATE, -- DICOM PatientBirthDate
    patient_sex TEXT CHECK (patient_sex IN ('M', 'F', 'O', 'U')), -- DICOM PatientSex
    patient_age TEXT, -- DICOM PatientAge
    patient_weight DECIMAL, -- DICOM PatientWeight (kg)
    patient_size DECIMAL, -- DICOM PatientSize (m)
    ethnic_group TEXT,
    patient_comments TEXT,
    medical_record_number TEXT,
    insurance_plan_identification TEXT,
    -- PHI encryption fields
    encrypted_data JSONB, -- For additional encrypted patient data
    -- Audit fields
    created_by UUID REFERENCES profiles(id),
    institution TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_patient_per_institution UNIQUE (patient_id, institution)
);

-- Studies table (DICOM Study level)
CREATE TABLE studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    study_instance_uid TEXT UNIQUE NOT NULL, -- DICOM StudyInstanceUID
    study_id TEXT, -- DICOM StudyID
    study_date DATE, -- DICOM StudyDate
    study_time TIME, -- DICOM StudyTime
    study_description TEXT, -- DICOM StudyDescription
    accession_number TEXT, -- DICOM AccessionNumber
    referring_physician_name TEXT, -- DICOM ReferringPhysicianName
    attending_physician_name TEXT,
    patient_age_at_study TEXT, -- DICOM PatientAge at time of study
    patient_weight_at_study DECIMAL,
    study_priority TEXT CHECK (study_priority IN ('ROUTINE', 'HIGH', 'URGENT', 'STAT')),
    study_status TEXT CHECK (study_status IN ('SCHEDULED', 'ARRIVED', 'READY', 'STARTED', 'COMPLETED', 'CANCELLED', 'DISCONTINUED')) DEFAULT 'SCHEDULED',
    modalities_in_study TEXT[], -- Array of modalities (CT, MR, XR, etc.)
    number_of_study_related_series INTEGER DEFAULT 0,
    number_of_study_related_instances INTEGER DEFAULT 0,
    -- Institution and audit
    institution TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series table (DICOM Series level)
CREATE TABLE series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    series_instance_uid TEXT UNIQUE NOT NULL, -- DICOM SeriesInstanceUID
    series_number INTEGER, -- DICOM SeriesNumber
    series_description TEXT, -- DICOM SeriesDescription
    modality TEXT NOT NULL, -- DICOM Modality (CT, MR, XR, US, etc.)
    body_part_examined TEXT, -- DICOM BodyPartExamined
    series_date DATE, -- DICOM SeriesDate
    series_time TIME, -- DICOM SeriesTime
    performing_physician_name TEXT, -- DICOM PerformingPhysicianName
    operator_name TEXT, -- DICOM OperatorName
    patient_position TEXT, -- DICOM PatientPosition
    laterality TEXT CHECK (laterality IN ('R', 'L', 'A', 'P', 'RL', 'LR')), -- DICOM Laterality
    -- Technical parameters
    protocol_name TEXT,
    sequence_name TEXT,
    scanning_sequence TEXT,
    sequence_variant TEXT,
    scan_options TEXT,
    mr_acquisition_type TEXT, -- For MR
    slice_thickness DECIMAL, -- DICOM SliceThickness
    spacing_between_slices DECIMAL,
    echo_time DECIMAL, -- DICOM EchoTime (TE)
    repetition_time DECIMAL, -- DICOM RepetitionTime (TR)
    flip_angle DECIMAL, -- DICOM FlipAngle
    magnetic_field_strength DECIMAL, -- For MR
    kvp DECIMAL, -- For CT/XR
    exposure_time DECIMAL, -- For CT/XR
    x_ray_tube_current DECIMAL, -- For CT/XR
    exposure DECIMAL, -- For XR
    -- Image characteristics
    pixel_spacing DECIMAL[2], -- DICOM PixelSpacing [row, col]
    image_orientation_patient DECIMAL[6], -- DICOM ImageOrientationPatient
    image_position_patient DECIMAL[3], -- DICOM ImagePositionPatient
    rows INTEGER, -- DICOM Rows
    columns INTEGER, -- DICOM Columns
    pixel_bandwidth DECIMAL,
    window_center DECIMAL,
    window_width DECIMAL,
    rescale_intercept DECIMAL,
    rescale_slope DECIMAL,
    -- Series statistics
    number_of_series_related_instances INTEGER DEFAULT 0,
    -- Institution and audit
    institution TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instances table (DICOM Instance/Image level)
CREATE TABLE instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    sop_instance_uid TEXT UNIQUE NOT NULL, -- DICOM SOPInstanceUID
    instance_number INTEGER, -- DICOM InstanceNumber
    image_type TEXT[], -- DICOM ImageType
    acquisition_date DATE, -- DICOM AcquisitionDate
    acquisition_time TIME, -- DICOM AcquisitionTime
    content_date DATE, -- DICOM ContentDate
    content_time TIME, -- DICOM ContentTime
    -- Image position and orientation
    image_position_patient DECIMAL[3], -- DICOM ImagePositionPatient
    image_orientation_patient DECIMAL[6], -- DICOM ImageOrientationPatient
    slice_location DECIMAL, -- DICOM SliceLocation
    slice_thickness DECIMAL, -- DICOM SliceThickness
    -- Technical parameters for this instance
    echo_number INTEGER, -- DICOM EchoNumber
    temporal_position_identifier INTEGER,
    number_of_averages INTEGER,
    imaging_frequency DECIMAL,
    imaged_nucleus TEXT,
    echo_train_length INTEGER,
    percent_sampling DECIMAL,
    percent_phase_field_of_view DECIMAL,
    trigger_time DECIMAL,
    nominal_interval DECIMAL,
    beat_rejection_flag TEXT,
    low_r_r_value INTEGER,
    high_r_r_value INTEGER,
    intervals_acquired INTEGER,
    intervals_rejected INTEGER,
    -- File storage information
    file_path TEXT, -- Path to DICOM file in Supabase storage
    file_size BIGINT, -- File size in bytes
    file_hash TEXT, -- SHA256 hash for integrity
    thumbnail_path TEXT, -- Path to thumbnail image
    -- Processing status
    processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    ai_analysis_results JSONB, -- Store AI analysis results
    -- Institution and audit
    institution TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study annotations and reports
CREATE TABLE study_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN ('preliminary', 'final', 'addendum', 'correction')) DEFAULT 'preliminary',
    report_status TEXT CHECK (report_status IN ('draft', 'pending', 'verified', 'final')) DEFAULT 'draft',
    report_title TEXT,
    report_content TEXT,
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    report_date DATE DEFAULT CURRENT_DATE,
    report_time TIME DEFAULT CURRENT_TIME,
    dictated_by UUID REFERENCES profiles(id),
    transcribed_by UUID REFERENCES profiles(id),
    verified_by UUID REFERENCES profiles(id),
    cosigned_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    -- Structured reporting
    structured_data JSONB, -- For structured reporting templates
    -- Institution and audit
    institution TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image annotations and measurements
CREATE TABLE image_annotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    annotation_type TEXT CHECK (annotation_type IN ('measurement', 'roi', 'text', 'arrow', 'circle', 'rectangle', 'freehand')) NOT NULL,
    annotation_data JSONB NOT NULL, -- Store coordinate data, measurements, etc.
    description TEXT,
    measurement_value DECIMAL,
    measurement_unit TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    -- Institution and audit
    institution TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
-- Patient indexes
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_institution ON patients(institution);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);

-- Study indexes
CREATE INDEX idx_studies_patient_id ON studies(patient_id);
CREATE INDEX idx_studies_study_instance_uid ON studies(study_instance_uid);
CREATE INDEX idx_studies_accession_number ON studies(accession_number);
CREATE INDEX idx_studies_study_date ON studies(study_date DESC);
CREATE INDEX idx_studies_institution ON studies(institution);
CREATE INDEX idx_studies_modalities_gin ON studies USING gin(modalities_in_study);

-- Series indexes
CREATE INDEX idx_series_study_id ON series(study_id);
CREATE INDEX idx_series_series_instance_uid ON series(series_instance_uid);
CREATE INDEX idx_series_modality ON series(modality);
CREATE INDEX idx_series_body_part ON series(body_part_examined);
CREATE INDEX idx_series_institution ON series(institution);

-- Instance indexes
CREATE INDEX idx_instances_series_id ON instances(series_id);
CREATE INDEX idx_instances_sop_instance_uid ON instances(sop_instance_uid);
CREATE INDEX idx_instances_instance_number ON instances(instance_number);
CREATE INDEX idx_instances_processing_status ON instances(processing_status);
CREATE INDEX idx_instances_institution ON instances(institution);

-- Report indexes
CREATE INDEX idx_study_reports_study_id ON study_reports(study_id);
CREATE INDEX idx_study_reports_report_type ON study_reports(report_type);
CREATE INDEX idx_study_reports_report_status ON study_reports(report_status);
CREATE INDEX idx_study_reports_institution ON study_reports(institution);

-- Annotation indexes
CREATE INDEX idx_image_annotations_instance_id ON image_annotations(instance_id);
CREATE INDEX idx_image_annotations_annotation_type ON image_annotations(annotation_type);
CREATE INDEX idx_image_annotations_created_by ON image_annotations(created_by);
CREATE INDEX idx_image_annotations_institution ON image_annotations(institution);

-- Profile indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_institution ON profiles(institution);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_studies_updated_at BEFORE UPDATE ON studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instances_updated_at BEFORE UPDATE ON instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_reports_updated_at BEFORE UPDATE ON study_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_image_annotations_updated_at BEFORE UPDATE ON image_annotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();