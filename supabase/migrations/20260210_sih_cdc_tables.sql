-- CDC SIH Urgences — 8 Modules / 33 Requirements
-- Migration: Add SIH-specific tables for patient safety and traceability
-- Author: Based on Dr. Laeticia Motongane's CDC (CHI Montdidier-Roye)

-- ============ M1: Add IPP and photo_url to patients ============
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ipp TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ============ M6: Communications table ============
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_ipp TEXT,
  type TEXT NOT NULL CHECK (type IN ('appel_labo', 'info_orale', 'prescription_orale', 'appel_service', 'transmission_inter_service')),
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saisi' CHECK (status IN ('saisi', 'vu', 'traite')),
  seen_by TEXT,
  seen_at TIMESTAMPTZ,
  treated_by TEXT,
  treated_at TIMESTAMPTZ,
  lab_result_value TEXT,
  lab_interlocutor TEXT,
  target_service TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ M3: Lab alerts table ============
CREATE TABLE IF NOT EXISTS lab_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  patient_ipp TEXT,
  result_id TEXT,
  analyte TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  is_critical BOOLEAN NOT NULL DEFAULT true,
  threshold_exceeded TEXT NOT NULL CHECK (threshold_exceeded IN ('low', 'high')),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledgment_note TEXT,
  escalation_level INTEGER NOT NULL DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 3),
  escalation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  ipp_verified BOOLEAN NOT NULL DEFAULT false,
  lab_caller TEXT,
  lab_call_time TIMESTAMPTZ,
  lab_interlocutor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ M7: Guard schedule table ============
CREATE TABLE IF NOT EXISTS guard_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Indexes for performance ============
CREATE INDEX IF NOT EXISTS idx_communications_encounter ON communications(encounter_id);
CREATE INDEX IF NOT EXISTS idx_communications_patient ON communications(patient_id);
CREATE INDEX IF NOT EXISTS idx_communications_created ON communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_encounter ON lab_alerts(encounter_id);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_patient ON lab_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_alerts_unacknowledged ON lab_alerts(acknowledged) WHERE acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_guard_schedule_active ON guard_schedule(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_patients_ipp ON patients(ipp);
CREATE INDEX IF NOT EXISTS idx_patients_nom_prenom ON patients(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============ RLS Policies ============
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guard_schedule ENABLE ROW LEVEL SECURITY;

-- Communications: all authenticated users can read and insert
CREATE POLICY "communications_read" ON communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "communications_insert" ON communications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "communications_update" ON communications FOR UPDATE TO authenticated USING (true);

-- Lab alerts: all authenticated users can read, medecins can acknowledge
CREATE POLICY "lab_alerts_read" ON lab_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab_alerts_insert" ON lab_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lab_alerts_update" ON lab_alerts FOR UPDATE TO authenticated USING (true);

-- Guard schedule: all authenticated users can read
CREATE POLICY "guard_schedule_read" ON guard_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "guard_schedule_insert" ON guard_schedule FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "guard_schedule_update" ON guard_schedule FOR UPDATE TO authenticated USING (true);
