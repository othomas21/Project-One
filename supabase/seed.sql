-- Sample data for medical imaging platform development
-- IMPORTANT: This is for development only - do not use in production

-- Sample patients (using fictional data for HIPAA compliance)
INSERT INTO patients (patient_id, patient_name, patient_birth_date, patient_sex, patient_age, institution) VALUES
('P001001', 'DEMO^PATIENT^ONE', '1980-05-15', 'F', '43Y', 'General Hospital'),
('P001002', 'DEMO^PATIENT^TWO', '1975-12-03', 'M', '48Y', 'General Hospital'),
('P001003', 'DEMO^PATIENT^THREE', '1990-08-22', 'F', '33Y', 'General Hospital');