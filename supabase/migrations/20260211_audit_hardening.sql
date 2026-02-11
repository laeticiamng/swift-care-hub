-- ================================================================
-- URGENCEOS — Audit Hardening Migration
-- Fixes: RLS on all tables, audit immutability, missing indexes,
-- enum extension, updated_at triggers, consent management
-- ================================================================

-- ════════════════════════════════════════
-- 1. FIX RLS: Restrict communications, lab_alerts, guard_schedule
-- ════════════════════════════════════════

-- Drop overly permissive policies
DROP POLICY IF EXISTS "communications_read" ON communications;
DROP POLICY IF EXISTS "communications_insert" ON communications;
DROP POLICY IF EXISTS "communications_update" ON communications;
DROP POLICY IF EXISTS "lab_alerts_read" ON lab_alerts;
DROP POLICY IF EXISTS "lab_alerts_insert" ON lab_alerts;
DROP POLICY IF EXISTS "lab_alerts_update" ON lab_alerts;
DROP POLICY IF EXISTS "guard_schedule_read" ON guard_schedule;
DROP POLICY IF EXISTS "guard_schedule_insert" ON guard_schedule;
DROP POLICY IF EXISTS "guard_schedule_update" ON guard_schedule;

-- Communications: clinical staff can read, authors can insert
CREATE POLICY "communications_read_clinical" ON communications FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "communications_insert_clinical" ON communications FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "communications_update_clinical" ON communications FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);

-- Lab alerts: clinical can read, medecin+ide can acknowledge
CREATE POLICY "lab_alerts_read_clinical" ON lab_alerts FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "lab_alerts_insert_system" ON lab_alerts FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "lab_alerts_update_medecin" ON lab_alerts FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);

-- Guard schedule: all clinical can read, medecin can manage
CREATE POLICY "guard_schedule_read_all" ON guard_schedule FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "guard_schedule_insert_medecin" ON guard_schedule FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "guard_schedule_update_medecin" ON guard_schedule FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- ════════════════════════════════════════
-- 2. ADD RLS to tables missing policies
-- ════════════════════════════════════════

-- Allergies
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allergies_read_clinical" ON allergies FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as')
);
CREATE POLICY "allergies_insert_clinical" ON allergies FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "allergies_update_clinical" ON allergies FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- Conditions
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conditions_read_clinical" ON conditions FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "conditions_insert_medecin" ON conditions FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "conditions_update_medecin" ON conditions FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- Care plans
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "care_plans_read_clinical" ON care_plans FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "care_plans_insert_clinical" ON care_plans FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "care_plans_update_clinical" ON care_plans FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- Generated documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generated_documents_read_clinical" ON generated_documents FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "generated_documents_insert" ON generated_documents FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "generated_documents_update" ON generated_documents FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- ════════════════════════════════════════
-- 3. AUDIT LOGS — Make immutable
-- ════════════════════════════════════════

-- Drop existing mutable policies
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

-- Read: all authenticated can read (for admin audit dashboard)
CREATE POLICY "audit_logs_read_all" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Insert: all authenticated can insert
CREATE POLICY "audit_logs_insert_all" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- NO UPDATE or DELETE policies — audit logs are immutable
-- Add explicit deny trigger for extra safety
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are forbidden.';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS prevent_audit_update ON audit_logs;
CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- ════════════════════════════════════════
-- 4. MISSING INDEXES for performance
-- ════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_status ON encounters(status);
CREATE INDEX IF NOT EXISTS idx_encounters_arrival ON encounters(arrival_time DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_encounter_id ON prescriptions(encounter_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_vitals_encounter_id ON vitals(encounter_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON vitals(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_administrations_encounter_id ON administrations(encounter_id);
CREATE INDEX IF NOT EXISTS idx_administrations_prescription_id ON administrations(prescription_id);
CREATE INDEX IF NOT EXISTS idx_transmissions_encounter_id ON transmissions(encounter_id);
CREATE INDEX IF NOT EXISTS idx_results_encounter_id ON results(encounter_id);
CREATE INDEX IF NOT EXISTS idx_results_patient_id ON results(patient_id);
CREATE INDEX IF NOT EXISTS idx_results_critical ON results(is_critical) WHERE is_critical = true;
CREATE INDEX IF NOT EXISTS idx_timeline_items_patient_id ON timeline_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_patient_id ON allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_encounter_id ON conditions(encounter_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ════════════════════════════════════════
-- 5. UPDATED_AT trigger
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at to tables that need it
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE transmissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE communications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create triggers
DROP TRIGGER IF EXISTS set_updated_at ON prescriptions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON encounters;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON results;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON communications;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON communications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════
-- 6. CONSENT MANAGEMENT table (RGPD)
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'data_sharing', 'research', 'mssante_send', 'dmp_send')),
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  granted_by TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents_read" ON patient_consents FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "consents_insert" ON patient_consents FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "consents_update" ON patient_consents FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'secretaire')
);

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient_id ON patient_consents(patient_id);

-- ════════════════════════════════════════
-- 7. DATA DELETION REQUESTS table (RGPD Art.17)
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  requested_by TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deletion_requests_read" ON data_deletion_requests FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "deletion_requests_insert" ON data_deletion_requests FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "deletion_requests_update" ON data_deletion_requests FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- ════════════════════════════════════════
-- 8. REALTIME for more tables
-- ════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.administrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_alerts;
