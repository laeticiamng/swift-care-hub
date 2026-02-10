/**
 * CDC SIH Urgences - Type definitions for 33 requirements across 8 modules
 * Based on Dr. Laeticia Motongane's functional specifications (CHI Montdidier-Roye)
 * ORION method analysis of potassium supplementation EIAS
 */

// ============ M1 — Patient Identity & Identitovigilance ============

export interface PatientIdentity {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  ipp: string; // Identifiant Permanent du Patient
  ins_numero?: string; // INS (Identité Nationale de Santé)
  service: string;
  numero_sejour: string;
  photo_url?: string;
  sexe: string;
  allergies?: string[];
}

export interface HomonymyAlert {
  id: string;
  patient_a_id: string;
  patient_b_id: string;
  patient_a: PatientIdentity;
  patient_b: PatientIdentity;
  detected_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface IdentityVerification {
  patient_id: string;
  verified_nom: boolean;
  verified_ddn: boolean;
  verified_ipp: boolean;
  verification_method: 'nom_ddn' | 'nom_ipp';
  verified_at: string;
  verified_by: string;
}

// ============ M2 — Unified Patient Timeline ============

export type TimelineEntryType =
  | 'arrivee'
  | 'triage'
  | 'consultation'
  | 'prescription_ecrite'
  | 'prescription_orale'
  | 'acte'
  | 'resultat_bio'
  | 'alerte_labo'
  | 'info_orale'
  | 'communication'
  | 'administration'
  | 'sortie';

export type TimelineValidationStatus = 'valide' | 'en_attente' | 'critique';

export interface TimelineEntry {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  entry_type: TimelineEntryType;
  content: string;
  details?: Record<string, unknown>;
  author_id: string;
  author_name: string;
  validation_status: TimelineValidationStatus;
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  // M2-02: Lab alert specific
  lab_result_value?: string;
  lab_interlocutor?: string;
  // M2-03: Oral prescription specific
  oral_prescription_id?: string;
  oral_validation_deadline?: string;
}

// ============ M3 — Lab Results & Critical Alerts ============

export interface LabAlertThreshold {
  id: string;
  analyte: string;
  unit: string;
  critical_low?: number;
  critical_high?: number;
  is_active: boolean;
}

export const DEFAULT_LAB_THRESHOLDS: Omit<LabAlertThreshold, 'id'>[] = [
  { analyte: 'Potassium (K+)', unit: 'mmol/L', critical_low: 3.0, critical_high: 5.5, is_active: true },
  { analyte: 'Sodium (Na+)', unit: 'mmol/L', critical_low: 125, critical_high: 155, is_active: true },
  { analyte: 'Calcium (Ca2+)', unit: 'mmol/L', critical_low: 1.8, critical_high: 2.65, is_active: true },
  { analyte: 'Glucose', unit: 'mmol/L', critical_low: 2.8, critical_high: 25, is_active: true },
  { analyte: 'Hemoglobine', unit: 'g/dL', critical_low: 7, critical_high: undefined, is_active: true },
  { analyte: 'Plaquettes', unit: 'G/L', critical_low: 50, critical_high: undefined, is_active: true },
  { analyte: 'Troponine', unit: 'ng/L', critical_high: 14, is_active: true },
  { analyte: 'Lactates', unit: 'mmol/L', critical_high: 4, is_active: true },
  { analyte: 'Creatinine', unit: 'µmol/L', critical_high: 500, is_active: true },
];

export type EscalationLevel = 1 | 2 | 3;

export interface LabAlert {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  result_id: string;
  analyte: string;
  value: number;
  unit: string;
  is_critical: boolean;
  threshold_exceeded: 'low' | 'high';
  // M3-03: Acknowledgment
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  acknowledgment_note?: string;
  // M3-03: Escalation
  escalation_level: EscalationLevel;
  escalation_history: EscalationEntry[];
  // M3-04: Cross-verification
  ipp_verified: boolean;
  // M3-05: Lab call traceability
  lab_caller?: string;
  lab_call_time?: string;
  lab_interlocutor?: string;
  created_at: string;
}

export interface EscalationEntry {
  level: EscalationLevel;
  notified_user_id: string;
  notified_user_name: string;
  notified_at: string;
  response?: 'acknowledged' | 'escalated' | 'timeout';
  response_at?: string;
}

// ============ M4 — Secure Prescription ============

export type PrescriptionOrigin = 'ecrite' | 'orale';

export interface SecurePrescription {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  medication_name: string;
  dosage: string;
  route: string;
  frequency?: string;
  prescriber_id: string;
  prescriber_name: string;
  origin: PrescriptionOrigin;
  // M4-02: Oral prescription
  oral_decision_basis?: string;
  oral_validated: boolean;
  oral_validated_at?: string;
  // M4-03: Link to lab result
  linked_result_id?: string;
  linked_result_analyte?: string;
  linked_result_value?: string;
  // M4-04: Mandatory recheck
  recheck_scheduled: boolean;
  recheck_type?: 'bio' | 'ecg' | 'bio_ecg';
  recheck_at?: string;
  // M4-05: Oral transmission tag
  base_transmission_orale: boolean;
  // M4-01: Identity lock
  ipp_verified_before_prescription: boolean;
  status: 'active' | 'completed' | 'cancelled' | 'oral_pending';
  created_at: string;
}

// ============ M5 — Secure IDE Administration ============

export interface AdministrationVerification {
  id: string;
  prescription_id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  // M5-01: Pre-administration reverification
  identity_confirmed: boolean;
  result_bio_confirmed: boolean;
  prescription_confirmed: boolean;
  concordance_confirmed: boolean;
  // M5-03: 5B concordance
  bon_patient: boolean;
  bon_medicament: boolean;
  bonne_dose: boolean;
  bonne_voie: boolean;
  bon_moment: boolean;
  bracelet_scanned?: boolean;
  // M5-02: Alert if result not found
  result_not_found_alert?: boolean;
  // M5-04: Electrolyte pre-admin alert
  electrolyte_alert?: boolean;
  electrolyte_type?: 'K' | 'Ca' | 'Na';
  administered_at: string;
  administered_by: string;
}

// ============ M6 — Communication Traceability ============

export type CommunicationType = 'appel_labo' | 'info_orale' | 'prescription_orale' | 'appel_service' | 'transmission_inter_service';

export type CommunicationStatus = 'saisi' | 'vu' | 'traite';

export interface Communication {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  type: CommunicationType;
  content: string;
  source: string;
  author_id: string;
  author_name: string;
  // M6-01: Lab call (4 fields max)
  lab_result_value?: string;
  lab_interlocutor?: string;
  // M6-04: Status tracking
  status: CommunicationStatus;
  seen_by?: string;
  seen_at?: string;
  treated_by?: string;
  treated_at?: string;
  // M6-03: Cross-service notification
  target_service?: string;
  created_at: string;
}

// ============ M7 — Multi-service Guard Mode ============

export interface GuardSchedule {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  services: string[];
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface HandoverSheet {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string;
  generated_at: string;
  generated_by: string;
  content: HandoverContent;
}

export interface HandoverContent {
  patient_summary: string;
  current_status: string;
  pending_actions: string[];
  critical_alerts: string[];
  pending_results: string[];
  medications: string[];
  communications: string[];
}

// ============ M8 — Audit & System Traceability ============

export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  patient_id?: string;
  patient_ipp?: string;
  module: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  workstation?: string;
  created_at: string;
}

export interface QualityIndicator {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  period: string;
  calculated_at: string;
}

// ============ CIMU Color Mapping ============

export const CIMU_COLORS: Record<number, { bg: string; text: string; label: string; border: string }> = {
  1: { bg: 'bg-red-600', text: 'text-white', label: 'CIMU 1 - Detresse vitale', border: 'border-red-600' },
  2: { bg: 'bg-orange-500', text: 'text-white', label: 'CIMU 2 - Atteinte fonctionnelle', border: 'border-orange-500' },
  3: { bg: 'bg-yellow-400', text: 'text-black', label: 'CIMU 3 - Fonctionnelle instable', border: 'border-yellow-400' },
  4: { bg: 'bg-green-500', text: 'text-white', label: 'CIMU 4 - Fonctionnelle stable', border: 'border-green-500' },
  5: { bg: 'bg-blue-500', text: 'text-white', label: 'CIMU 5 - Pas d\'atteinte', border: 'border-blue-500' },
};

// ============ Validation Status Colors ============

export const VALIDATION_COLORS: Record<TimelineValidationStatus, { bg: string; text: string; label: string }> = {
  valide: { bg: 'bg-green-100 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', label: 'Valide' },
  en_attente: { bg: 'bg-orange-100 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', label: 'En attente' },
  critique: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', label: 'Critique' },
};
