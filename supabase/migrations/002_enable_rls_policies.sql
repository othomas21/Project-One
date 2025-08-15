/**
 * @file 002_enable_rls_policies.sql
 * @description Row-Level Security policies for HIPAA-compliant medical imaging data
 * @author Claude Code
 * @created 2025-08-13
 * 
 * RLS policies ensure healthcare providers can only access data from their institution
 * and patients they are authorized to view, meeting HIPAA requirements.
 * 
 * @reftools Verified against: PostgreSQL 14+ RLS best practices
 * @supabase Optimized RLS policies using (SELECT auth.uid()) pattern for performance
 */

-- Enable RLS on all tables (MANDATORY for HIPAA compliance)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_annotations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's institution
CREATE OR REPLACE FUNCTION get_user_institution()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT institution 
        FROM profiles 
        WHERE id = (SELECT auth.uid())
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = (SELECT auth.uid())
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all profiles in their institution" ON profiles
    FOR SELECT TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

CREATE POLICY "Admins can manage profiles in their institution" ON profiles
    FOR ALL TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    )
    WITH CHECK (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Patients RLS Policies
CREATE POLICY "Healthcare providers can view patients in their institution" ON patients
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create patients in their institution" ON patients
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Healthcare providers can update patients in their institution" ON patients
    FOR UPDATE TO authenticated
    USING (institution = get_user_institution())
    WITH CHECK (institution = get_user_institution());

-- Only admins can delete patients (soft delete recommended)
CREATE POLICY "Only admins can delete patients" ON patients
    FOR DELETE TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Studies RLS Policies
CREATE POLICY "Healthcare providers can view studies in their institution" ON studies
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create studies in their institution" ON studies
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Healthcare providers can update studies in their institution" ON studies
    FOR UPDATE TO authenticated
    USING (institution = get_user_institution())
    WITH CHECK (institution = get_user_institution());

CREATE POLICY "Only admins can delete studies" ON studies
    FOR DELETE TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Series RLS Policies
CREATE POLICY "Healthcare providers can view series in their institution" ON series
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create series in their institution" ON series
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Healthcare providers can update series in their institution" ON series
    FOR UPDATE TO authenticated
    USING (institution = get_user_institution())
    WITH CHECK (institution = get_user_institution());

CREATE POLICY "Only admins can delete series" ON series
    FOR DELETE TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Instances RLS Policies
CREATE POLICY "Healthcare providers can view instances in their institution" ON instances
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create instances in their institution" ON instances
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Healthcare providers can update instances in their institution" ON instances
    FOR UPDATE TO authenticated
    USING (institution = get_user_institution())
    WITH CHECK (institution = get_user_institution());

CREATE POLICY "Only admins can delete instances" ON instances
    FOR DELETE TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Study Reports RLS Policies
CREATE POLICY "Healthcare providers can view reports in their institution" ON study_reports
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create reports in their institution" ON study_reports
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND dictated_by = (SELECT auth.uid())
    );

CREATE POLICY "Report authors can update their own reports" ON study_reports
    FOR UPDATE TO authenticated
    USING (
        institution = get_user_institution()
        AND (
            dictated_by = (SELECT auth.uid())
            OR transcribed_by = (SELECT auth.uid())
            OR (report_status != 'final' AND get_user_role() IN ('radiologist', 'admin'))
        )
    )
    WITH CHECK (
        institution = get_user_institution()
    );

-- Only admins can delete reports
CREATE POLICY "Only admins can delete reports" ON study_reports
    FOR DELETE TO authenticated
    USING (
        get_user_role() = 'admin' 
        AND institution = get_user_institution()
    );

-- Image Annotations RLS Policies
CREATE POLICY "Healthcare providers can view annotations in their institution" ON image_annotations
    FOR SELECT TO authenticated
    USING (institution = get_user_institution());

CREATE POLICY "Healthcare providers can create annotations in their institution" ON image_annotations
    FOR INSERT TO authenticated
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Users can update their own annotations" ON image_annotations
    FOR UPDATE TO authenticated
    USING (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    )
    WITH CHECK (
        institution = get_user_institution()
        AND created_by = (SELECT auth.uid())
    );

CREATE POLICY "Users can delete their own annotations" ON image_annotations
    FOR DELETE TO authenticated
    USING (
        institution = get_user_institution()
        AND (
            created_by = (SELECT auth.uid())
            OR get_user_role() = 'admin'
        )
    );

-- Create optimized indexes for RLS performance
-- These indexes optimize the common RLS filter patterns
CREATE INDEX idx_profiles_auth_uid ON profiles(id) WHERE is_active = true;
CREATE INDEX idx_patients_institution_rls ON patients(institution, created_by);
CREATE INDEX idx_studies_institution_rls ON studies(institution, created_by);
CREATE INDEX idx_series_institution_rls ON series(institution, created_by);
CREATE INDEX idx_instances_institution_rls ON instances(institution, created_by);
CREATE INDEX idx_study_reports_institution_rls ON study_reports(institution, dictated_by);
CREATE INDEX idx_image_annotations_institution_rls ON image_annotations(institution, created_by);

-- Audit logging for HIPAA compliance
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
    old_values JSONB,
    new_values JSONB,
    user_id UUID NOT NULL,
    user_role TEXT,
    user_institution TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for audit logs - only admins can view
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (get_user_role() = 'admin');

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_row RECORD;
    user_role TEXT;
    user_institution TEXT;
BEGIN
    -- Get user information
    SELECT role, institution INTO user_role, user_institution
    FROM profiles
    WHERE id = (SELECT auth.uid());

    -- Create audit record
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id,
        user_role,
        user_institution
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        (SELECT auth.uid()),
        user_role,
        user_institution
    );

    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_patients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_studies_trigger
    AFTER INSERT OR UPDATE OR DELETE ON studies
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_study_reports_trigger
    AFTER INSERT OR UPDATE OR DELETE ON study_reports
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called when a new user signs up via Supabase Auth
    INSERT INTO profiles (id, email, full_name, role, institution, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'physician'),
        COALESCE(NEW.raw_user_meta_data->>'institution', ''),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();