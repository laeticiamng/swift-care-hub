-- ================================================================
-- URGENCEOS — Canonical Model Schema Migration
-- Source of truth: who + when_event + when_recorded + what + value + status + provenance
-- ================================================================

-- ────────────────────────────────────────
-- PATIENTS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ins_status TEXT DEFAULT 'provisoire'
  CHECK (ins_status IN ('provisoire', 'qualifie', 'invalide'));
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ipp TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dfg NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';

-- ────────────────────────────────────────
-- ENCOUNTERS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES profiles(id);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS assigned_nurse_id UUID REFERENCES profiles(id);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS discharge_at TIMESTAMPTZ;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS discharge_destination TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';

-- ────────────────────────────────────────
-- VITALS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ;
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';
ALTER TABLE vitals ADD COLUMN IF NOT EXISTS location TEXT;

-- ────────────────────────────────────────
-- PRESCRIPTIONS (table enrichie — canonique)
-- ────────────────────────────────────────
-- Note: The existing prescriptions table has basic fields.
-- We add columns for the canonical model. The app uses JSON in notes for metadata.
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_type TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ DEFAULT now();
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_class TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_atc_code TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dose_value NUMERIC;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dose_unit TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dilution TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS debit TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS condition_trigger TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS condition_max_doses INTEGER;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS condition_interval TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS titration_dose_init NUMERIC;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS titration_dose_max NUMERIC;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS titration_step NUMERIC;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS titration_interval TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS titration_target TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS o2_device TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS o2_debit TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS o2_target TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS exam_list TEXT[];
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS exam_urgency TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS exam_indication TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS exam_site TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS surveillance_type TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS surveillance_frequency TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS avis_speciality TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS avis_motif TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS avis_urgency TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS device_name TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS device_details TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS regime_details TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS mobilisation_details TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sortie_medications JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sortie_arret_travail INTEGER;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sortie_consignes TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'prescrit';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ────────────────────────────────────────
-- ADMINISTRATIONS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ DEFAULT now();
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS performer_id UUID REFERENCES profiles(id);
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS lot_number TEXT;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS eva_before NUMERIC;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS eva_after NUMERIC;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS cumulative_dose NUMERIC;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS debit_actual TEXT;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS volume_administered NUMERIC;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS condition_met_value TEXT;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS dose_number INTEGER;
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE administrations ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';

-- ────────────────────────────────────────
-- PROCEDURES (enrichir)
-- ────────────────────────────────────────
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS performed_by_id UUID REFERENCES profiles(id);
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS body_site TEXT;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- ────────────────────────────────────────
-- RESULTS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE results ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ;
ALTER TABLE results ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE results ADD COLUMN IF NOT EXISTS result_type TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS value_numeric NUMERIC;
ALTER TABLE results ADD COLUMN IF NOT EXISTS value_unit TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS value_text TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS reference_range TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS abnormal_flag TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';
ALTER TABLE results ADD COLUMN IF NOT EXISTS source_system TEXT;

-- ────────────────────────────────────────
-- TRANSMISSIONS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE transmissions ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ;
ALTER TABLE transmissions ADD COLUMN IF NOT EXISTS when_recorded TIMESTAMPTZ DEFAULT now();
ALTER TABLE transmissions ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'saisie_humaine';

-- ────────────────────────────────────────
-- ALLERGIES
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  substance TEXT NOT NULL,
  substance_code TEXT,
  reaction TEXT,
  severity TEXT CHECK (severity IN ('legere','moderee','severe','inconnue')),
  criticality TEXT CHECK (criticality IN ('low','high','unable-to-assess')),
  status TEXT DEFAULT 'active',
  when_recorded TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES profiles(id),
  provenance TEXT DEFAULT 'saisie_humaine',
  source_document TEXT
);

-- ────────────────────────────────────────
-- CONDITIONS / DIAGNOSTICS
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  encounter_id UUID REFERENCES encounters(id),
  code_cim10 TEXT,
  code_display TEXT,
  category TEXT CHECK (category IN ('antecedent','diagnostic_actuel','hypothese','complication')),
  verification_status TEXT DEFAULT 'provisional' CHECK (verification_status IN (
    'provisional', 'differential', 'confirmed', 'refuted', 'entered-in-error'
  )),
  clinical_status TEXT DEFAULT 'active' CHECK (clinical_status IN (
    'active','recurrence','relapse','inactive','remission','resolved'
  )),
  onset_date DATE,
  severity TEXT,
  when_recorded TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES profiles(id),
  provenance TEXT DEFAULT 'saisie_humaine',
  notes TEXT
);

-- ────────────────────────────────────────
-- CARE PLANS
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('surveillance','sortie','transfert','orientation')),
  description TEXT,
  activities JSONB,
  when_recorded TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active',
  provenance TEXT DEFAULT 'saisie_humaine'
);

-- ────────────────────────────────────────
-- GENERATED DOCUMENTS
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'crh', 'ordonnance', 'rpu', 'courrier', 'certificat', 'arret_travail'
  )),
  content_html TEXT,
  content_structured JSONB,
  generated_by TEXT DEFAULT 'template',
  signed_by UUID REFERENCES profiles(id),
  signed_at TIMESTAMPTZ,
  sent_mssante BOOLEAN DEFAULT false,
  sent_mssante_at TIMESTAMPTZ,
  sent_dmp BOOLEAN DEFAULT false,
  sent_dmp_at TIMESTAMPTZ,
  when_recorded TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','signed','sent','archived'))
);

-- ────────────────────────────────────────
-- AUDIT LOGS (enrichir)
-- ────────────────────────────────────────
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS who_user_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS who_role TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS what_action TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS what_resource_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS what_resource_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS when_event TIMESTAMPTZ DEFAULT now();
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS where_ip TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS where_device TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'success';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details_extended JSONB;
