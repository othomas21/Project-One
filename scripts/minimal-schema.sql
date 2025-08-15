-- Minimal schema for testing the search integration
-- This creates basic tables to test our search functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Healthcare provider profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS patients (
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
    encrypted_data JSONB, -- Encrypted PHI
    created_by UUID REFERENCES profiles(id),
    institution TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studies table (DICOM Study level)
CREATE TABLE IF NOT EXISTS studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    study_instance_uid TEXT UNIQUE NOT NULL, -- DICOM StudyInstanceUID
    study_id TEXT, -- DICOM StudyID
    study_date DATE, -- DICOM StudyDate
    study_time TIME, -- DICOM StudyTime
    study_description TEXT, -- DICOM StudyDescription
    accession_number TEXT, -- DICOM AccessionNumber
    referring_physician_name TEXT,
    attending_physician_name TEXT,
    patient_age_at_study TEXT,
    patient_weight_at_study DECIMAL,
    study_priority TEXT CHECK (study_priority IN ('ROUTINE', 'HIGH', 'URGENT', 'STAT')),
    study_status TEXT CHECK (study_status IN ('SCHEDULED', 'ARRIVED', 'READY', 'STARTED', 'COMPLETED', 'CANCELLED', 'DISCONTINUED')) DEFAULT 'COMPLETED',
    modalities_in_study TEXT[], -- Array of modalities (CT, MRI, etc.)
    number_of_study_related_series INTEGER DEFAULT 0,
    number_of_study_related_instances INTEGER DEFAULT 0,
    institution TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series table (DICOM Series level)
CREATE TABLE IF NOT EXISTS series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
    series_instance_uid TEXT UNIQUE NOT NULL,
    series_number INTEGER,
    series_description TEXT,
    modality TEXT NOT NULL, -- CT, MRI, XR, US, etc.
    body_part_examined TEXT,
    series_date DATE,
    series_time TIME,
    performing_physician_name TEXT,
    operator_name TEXT,
    patient_position TEXT,
    laterality TEXT CHECK (laterality IN ('R', 'L', 'A', 'P', 'RL', 'LR')),
    protocol_name TEXT,
    sequence_name TEXT,
    number_of_series_related_instances INTEGER DEFAULT 0,
    institution TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample data for testing
INSERT INTO patients (patient_id, patient_name, patient_birth_date, patient_sex, patient_age, institution) VALUES
('P001001', 'DEMO^PATIENT^ONE', '1980-05-15', 'F', '43Y', 'General Hospital'),
('P001002', 'DEMO^PATIENT^TWO', '1975-12-03', 'M', '48Y', 'General Hospital'),
('P001003', 'DEMO^PATIENT^THREE', '1990-08-22', 'F', '33Y', 'General Hospital')
ON CONFLICT (patient_id) DO NOTHING;

-- Insert sample studies
INSERT INTO studies (
    patient_id, 
    study_instance_uid, 
    study_date, 
    study_description, 
    study_status,
    modalities_in_study,
    number_of_study_related_instances,
    institution
) VALUES
(
    (SELECT id FROM patients WHERE patient_id = 'P001001'),
    '1.2.3.4.5.6.7.8.9.10.1',
    '2025-08-12',
    'CT Chest with IV contrast',
    'COMPLETED',
    ARRAY['CT'],
    128,
    'General Hospital'
),
(
    (SELECT id FROM patients WHERE patient_id = 'P001002'),
    '1.2.3.4.5.6.7.8.9.10.2',
    '2025-08-11',
    'MRI Brain without contrast',
    'COMPLETED',
    ARRAY['MRI'],
    256,
    'General Hospital'
),
(
    (SELECT id FROM patients WHERE patient_id = 'P001003'),
    '1.2.3.4.5.6.7.8.9.10.3',
    '2025-08-10',
    'Chest X-Ray PA and Lateral',
    'COMPLETED',
    ARRAY['CR'],
    2,
    'General Hospital'
)
ON CONFLICT (study_instance_uid) DO NOTHING;

-- Insert sample series
INSERT INTO series (
    study_id,
    series_instance_uid,
    series_number,
    series_description,
    modality,
    body_part_examined,
    number_of_series_related_instances,
    institution
) VALUES
(
    (SELECT id FROM studies WHERE study_instance_uid = '1.2.3.4.5.6.7.8.9.10.1'),
    '1.2.3.4.5.6.7.8.9.10.1.1',
    1,
    'Chest CT Axial',
    'CT',
    'CHEST',
    128,
    'General Hospital'
),
(
    (SELECT id FROM studies WHERE study_instance_uid = '1.2.3.4.5.6.7.8.9.10.2'),
    '1.2.3.4.5.6.7.8.9.10.2.1',
    1,
    'Brain MRI T1',
    'MRI',
    'BRAIN',
    256,
    'General Hospital'
),
(
    (SELECT id FROM studies WHERE study_instance_uid = '1.2.3.4.5.6.7.8.9.10.3'),
    '1.2.3.4.5.6.7.8.9.10.3.1',
    1,
    'Chest X-Ray PA',
    'CR',
    'CHEST',
    1,
    'General Hospital'
),
(
    (SELECT id FROM studies WHERE study_instance_uid = '1.2.3.4.5.6.7.8.9.10.3'),
    '1.2.3.4.5.6.7.8.9.10.3.2',
    2,
    'Chest X-Ray Lateral',
    'CR',
    'CHEST',
    1,
    'General Hospital'
)
ON CONFLICT (series_instance_uid) DO NOTHING;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_studies_search ON studies (study_description, study_date DESC, study_status);
CREATE INDEX IF NOT EXISTS idx_studies_patient ON studies (patient_id, study_date DESC);
CREATE INDEX IF NOT EXISTS idx_studies_modalities ON studies USING GIN (modalities_in_study);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients (patient_id, patient_name);
CREATE INDEX IF NOT EXISTS idx_series_modality ON series (modality, body_part_examined);