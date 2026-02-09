// ================================================================
// UrgenceOS — Canonical Data Model (TypeScript types)
// Source of truth: who + when_event + when_recorded + what + value + status + provenance
// ================================================================

export type Provenance = 'saisie_humaine' | 'import_hl7' | 'import_fhir' | 'device' | 'ia_suggestion' | 'pack_protocole';

export type PrescriptionType =
  | 'medicament' | 'perfusion' | 'titration' | 'conditionnel' | 'oxygene'
  | 'exam_bio' | 'exam_imagerie' | 'exam_ecg' | 'exam_autre'
  | 'surveillance' | 'regime' | 'mobilisation' | 'dispositif'
  | 'avis_specialise' | 'sortie';

export type MedRoute =
  | 'IV' | 'IVL' | 'IVSE' | 'IM' | 'SC' | 'PO' | 'SL' | 'IR'
  | 'INH' | 'NASAL' | 'TOPIQUE' | 'IO' | 'INTRATH';

export type EncounterStatus = 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'finished';
export type PrescriptionStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended';
export type ValidationStatus = 'prescrit' | 'valide_senior' | 'valide_pharma' | 'en_cours' | 'realise' | 'annule';
export type Priority = 'stat' | 'urgent' | 'routine';
export type DocumentType = 'crh' | 'ordonnance' | 'rpu' | 'courrier' | 'certificat' | 'arret_travail';
export type DocumentStatus = 'draft' | 'signed' | 'sent' | 'archived';

// ── Patient ──
export interface CanonicalPatient {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  ins_numero?: string;
  ins_status?: 'provisoire' | 'qualifie' | 'invalide';
  ipp?: string;
  poids?: number;
  weight_kg?: number;
  height_cm?: number;
  dfg?: number;
  telephone?: string;
  adresse?: string;
  medecin_traitant?: string;
  medecin_traitant_mssante?: string;
  allergies?: string[];
  antecedents?: string[];
  traitements?: string;
  traitements_actuels?: unknown;
  provenance?: Provenance;
}

// ── Encounter ──
export interface CanonicalEncounter {
  id: string;
  patient_id: string;
  status: EncounterStatus;
  when_event?: string;
  when_recorded?: string;
  arrival_time: string;
  triage_time?: string;
  discharge_time?: string;
  discharge_at?: string;
  discharge_destination?: string;
  motif?: string;
  motif_sfmu?: string;
  ccmu?: number;
  cimu?: number;
  gemsa?: number;
  zone?: string;
  box_number?: number;
  location?: string;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
  assigned_nurse_id?: string;
  medecin_id?: string;
  ide_id?: string;
  orientation?: string;
  provenance?: Provenance;
}

// ── Vitals ──
export interface CanonicalVitals {
  id: string;
  patient_id: string;
  encounter_id: string;
  when_event?: string;
  when_recorded?: string;
  recorded_at: string;
  recorded_by?: string;
  fc?: number;
  pas?: number;
  pa_systolique?: number;
  pad?: number;
  pa_diastolique?: number;
  spo2?: number;
  temperature?: number;
  fr?: number;
  frequence_respiratoire?: number;
  gcs?: number;
  eva?: number;
  eva_douleur?: number;
  location?: string;
  provenance?: Provenance;
}

// ── Prescription ──
export interface CanonicalPrescription {
  id: string;
  encounter_id: string;
  patient_id: string;
  prescriber_id?: string;
  when_event?: string;
  when_recorded?: string;
  prescription_type: PrescriptionType;

  // Medication fields
  medication_name?: string;
  medication_class?: string;
  medication_atc_code?: string;
  dose_value?: number;
  dose_unit?: string;
  route?: MedRoute | string;
  frequency?: string;
  duration?: string;
  dilution?: string;
  debit?: string;
  dosage?: string;

  // Conditionnel
  condition_trigger?: string;
  condition_max_doses?: number;
  condition_interval?: string;

  // Titration
  titration_dose_init?: number;
  titration_dose_max?: number;
  titration_step?: number;
  titration_interval?: string;
  titration_target?: string;

  // Oxygene
  o2_device?: string;
  o2_debit?: string;
  o2_target?: string;

  // Examens
  exam_list?: string[];
  exam_urgency?: 'urgent' | 'normal';
  exam_indication?: string;
  exam_site?: string;

  // Surveillance
  surveillance_type?: string;
  surveillance_frequency?: string;

  // Avis
  avis_speciality?: string;
  avis_motif?: string;
  avis_urgency?: 'urgent' | 'rapide' | 'programme';

  // Dispositif
  device_name?: string;
  device_details?: string;

  // Regime / Mobilisation
  regime_details?: string;
  mobilisation_details?: string;

  // Sortie
  sortie_medications?: Array<{ name: string; dose: string; route: string; frequency: string; duration: string }>;
  sortie_arret_travail?: number;
  sortie_consignes?: string;

  // Status
  status: PrescriptionStatus | string;
  validation_status?: ValidationStatus;
  priority?: Priority | string;
  provenance?: Provenance;
  notes?: string;
  created_at?: string;
}

// ── Administration ──
export interface CanonicalAdministration {
  id: string;
  prescription_id: string;
  encounter_id: string;
  patient_id?: string;
  performer_id?: string;
  when_event?: string;
  when_recorded?: string;
  dose_given?: number;
  dose_unit?: string;
  route?: string;
  lot_number?: string;
  eva_before?: number;
  eva_after?: number;
  cumulative_dose?: number;
  debit_actual?: string;
  volume_administered?: number;
  condition_met_value?: string;
  dose_number?: number;
  status?: 'completed' | 'error' | 'cancelled';
  provenance?: Provenance;
  notes?: string;
}

// ── Procedure ──
export interface CanonicalProcedure {
  id: string;
  encounter_id: string;
  patient_id: string;
  when_event?: string;
  when_recorded?: string;
  performed_by?: string;
  procedure_type: string;
  code?: string;
  body_site?: string;
  status?: string;
  notes?: string;
  provenance?: Provenance;
}

// ── Result ──
export interface CanonicalResult {
  id?: string;
  encounter_id: string;
  patient_id: string;
  when_event?: string;
  when_recorded?: string;
  title?: string;
  name?: string;
  category?: string;
  result_type?: 'bio' | 'imagerie' | 'ecg' | 'autre';
  code?: string;
  value_numeric?: number;
  value_unit?: string;
  value_text?: string;
  reference_range?: string;
  is_critical?: boolean;
  abnormal_flag?: 'N' | 'L' | 'H' | 'LL' | 'HH' | 'A';
  is_read?: boolean;
  content?: unknown;
  provenance?: Provenance;
  source_system?: string;
}

// ── Allergy ──
export interface CanonicalAllergy {
  id?: string;
  patient_id: string;
  substance: string;
  substance_code?: string;
  reaction?: string;
  severity?: 'legere' | 'moderee' | 'severe' | 'inconnue';
  criticality?: 'low' | 'high' | 'unable-to-assess';
  status?: string;
  when_recorded?: string;
  recorded_by?: string;
  provenance?: Provenance;
}

// ── Condition / Diagnostic ──
export interface CanonicalCondition {
  id?: string;
  patient_id: string;
  encounter_id?: string;
  code_cim10?: string;
  code_display?: string;
  category?: 'antecedent' | 'diagnostic_actuel' | 'hypothese' | 'complication';
  verification_status?: 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
  clinical_status?: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
  onset_date?: string;
  severity?: string;
  when_recorded?: string;
  recorded_by?: string;
  provenance?: Provenance;
  notes?: string;
}

// ── Transmission DAR ──
export interface CanonicalTransmission {
  id: string;
  encounter_id: string;
  patient_id: string;
  author_id: string;
  when_event?: string;
  when_recorded?: string;
  donnees?: string;
  actions?: string;
  resultats?: string;
  cible?: string;
  provenance?: Provenance;
}

// ── Generated Document ──
export interface CanonicalDocument {
  id?: string;
  encounter_id: string;
  patient_id: string;
  document_type: DocumentType;
  content_html?: string;
  content_structured?: Record<string, unknown>;
  generated_by?: 'template' | 'ia_assisted' | 'manual';
  signed_by?: string;
  signed_at?: string;
  sent_mssante?: boolean;
  sent_mssante_at?: string;
  sent_dmp?: boolean;
  sent_dmp_at?: string;
  when_recorded?: string;
  status: DocumentStatus;
}

// ── Full Encounter Data (for bundle export) ──
export interface FullEncounterData {
  patient: CanonicalPatient;
  encounter: CanonicalEncounter;
  vitals: CanonicalVitals[];
  prescriptions: CanonicalPrescription[];
  administrations: CanonicalAdministration[];
  procedures: CanonicalProcedure[];
  results: CanonicalResult[];
  allergies: CanonicalAllergy[];
  conditions: CanonicalCondition[];
  transmissions: CanonicalTransmission[];
  documents: CanonicalDocument[];
}
