/**
 * SIH CDC Demo Data
 * Extended demo data with all SIH fields for 8 modules
 * Includes homonymy scenario (TV-01), lab alerts (TV-02), cross-prescription blocking (TV-03)
 */

import type {
  PatientIdentity, TimelineEntry, LabAlert, Communication,
  SecurePrescription, GuardSchedule, QualityIndicator,
} from './sih-types';
import { generateIPP, generateNumeroSejour } from './homonymy-detection';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();
const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

// ============ Patient Identities with IPP (includes homonymy pair TV-01) ============

export const SIH_PATIENTS: PatientIdentity[] = [
  { id: 'demo-p1', nom: 'DUPONT', prenom: 'Marie', date_naissance: '1958-03-15', ipp: generateIPP('demo-p1'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e1'), sexe: 'F', allergies: ['Penicilline'] },
  { id: 'demo-p2', nom: 'MARTIN', prenom: 'Lucas', date_naissance: '1994-06-22', ipp: generateIPP('demo-p2'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e2'), sexe: 'M', allergies: ['Aspirine'] },
  { id: 'demo-p3', nom: 'BERNARD', prenom: 'Sophie', date_naissance: '1981-11-08', ipp: generateIPP('demo-p3'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e3'), sexe: 'F', allergies: [] },
  { id: 'demo-p4', nom: 'PETIT', prenom: 'Jean', date_naissance: '1948-01-30', ipp: generateIPP('demo-p4'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e4'), sexe: 'M', allergies: ['Iode'] },
  { id: 'demo-p5', nom: 'LEROY', prenom: 'Emma', date_naissance: '2001-05-12', ipp: generateIPP('demo-p5'), service: 'UHCD', numero_sejour: generateNumeroSejour('demo-e5'), sexe: 'F', allergies: [] },
  { id: 'demo-p6', nom: 'MOREAU', prenom: 'Camille', date_naissance: '1975-09-18', ipp: generateIPP('demo-p6'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e6'), sexe: 'F', allergies: [] },
  { id: 'demo-p7', nom: 'SIMON', prenom: 'Thomas', date_naissance: '1998-12-25', ipp: generateIPP('demo-p7'), service: 'Dechocage', numero_sejour: generateNumeroSejour('demo-e7'), sexe: 'M', allergies: [] },
  { id: 'demo-p8', nom: 'LAURENT', prenom: 'Emilie', date_naissance: '1965-06-03', ipp: generateIPP('demo-p8'), service: 'UHCD', numero_sejour: generateNumeroSejour('demo-e8'), sexe: 'F', allergies: ['Penicilline', 'Sulfamides'] },
  { id: 'demo-p9', nom: 'ROBERT', prenom: 'Antoine', date_naissance: '1937-02-14', ipp: generateIPP('demo-p9'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e9'), sexe: 'M', allergies: [] },
  { id: 'demo-p10', nom: 'ROUX', prenom: 'Chloe', date_naissance: '2003-08-07', ipp: generateIPP('demo-p10'), service: 'SAU', numero_sejour: generateNumeroSejour('demo-e10'), sexe: 'F', allergies: [] },
  // TV-01: Homonymy pair — DUPONT Marie (different DOB & IPP)
  { id: 'demo-p11', nom: 'DUPONT', prenom: 'Marie', date_naissance: '1992-07-20', ipp: generateIPP('demo-p11'), service: 'UHCD', numero_sejour: generateNumeroSejour('demo-e11'), sexe: 'F', allergies: [] },
];

// ============ Unified Timeline Entries (M2) ============

export const SIH_TIMELINE_ENTRIES: TimelineEntry[] = [
  // Patient demo-p1 (DUPONT Marie) timeline
  { id: 'tl-1', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'arrivee', content: 'Arrivee aux urgences — Douleur thoracique atypique', details: {}, author_id: 'demo-secretaire', author_name: 'Nathalie Moreau', validation_status: 'valide', created_at: hoursAgo(4) },
  { id: 'tl-2', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'triage', content: 'Triage IOA — CIMU 2 — FC 110, PA 155/90, SpO2 96%, EVA 8/10', details: {}, author_id: 'demo-ioa', author_name: 'Sophie Lefevre', validation_status: 'valide', created_at: hoursAgo(3.75) },
  { id: 'tl-3', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'consultation', content: 'Examen clinique — Douleur precordiale, irradiation MSE, ECG: sus-decalage V1-V3', details: {}, author_id: 'demo-medecin', author_name: 'Dr. Martin Dupont', validation_status: 'valide', created_at: hoursAgo(3.5) },
  { id: 'tl-4', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'prescription_ecrite', content: 'Aspirine 250mg PO + Heparine 5000UI IV + Morphine 3mg IV titration', details: {}, author_id: 'demo-medecin', author_name: 'Dr. Martin Dupont', validation_status: 'valide', created_at: hoursAgo(3.25) },
  { id: 'tl-5', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'resultat_bio', content: 'Troponine: 245 ng/L (N < 14) — CRITIQUE', details: { analyte: 'Troponine', value: 245, unit: 'ng/L' }, author_id: 'system', author_name: 'Automate labo', validation_status: 'critique', created_at: hoursAgo(2.5) },
  { id: 'tl-6', encounter_id: 'demo-e1', patient_id: 'demo-p1', patient_ipp: generateIPP('demo-p1'), entry_type: 'alerte_labo', content: 'Appel labo — Troponine critique 245 ng/L — Bio: Dr. Leclerc', details: {}, author_id: 'demo-labo', author_name: 'Dr. Leclerc (Labo)', validation_status: 'critique', created_at: hoursAgo(2.42), lab_result_value: 'Troponine: 245 ng/L', lab_interlocutor: 'Dr. Leclerc' },

  // Patient demo-p4 (PETIT Jean) — TV-02: Lab call traced for K=2.9
  { id: 'tl-10', encounter_id: 'demo-e4', patient_id: 'demo-p4', patient_ipp: generateIPP('demo-p4'), entry_type: 'arrivee', content: 'Arrivee aux urgences — Douleur abdominale aigue', details: {}, author_id: 'demo-secretaire', author_name: 'Nathalie Moreau', validation_status: 'valide', created_at: hoursAgo(1.75) },
  { id: 'tl-11', encounter_id: 'demo-e4', patient_id: 'demo-p4', patient_ipp: generateIPP('demo-p4'), entry_type: 'triage', content: 'Triage IOA — CIMU 3 — FC 100, PA 160/95, SpO2 97%', details: {}, author_id: 'demo-ioa', author_name: 'Sophie Lefevre', validation_status: 'valide', created_at: hoursAgo(1.5) },
  { id: 'tl-12', encounter_id: 'demo-e4', patient_id: 'demo-p4', patient_ipp: generateIPP('demo-p4'), entry_type: 'resultat_bio', content: 'Kaliemie: 2.9 mmol/L (N: 3.5-5.0) — CRITIQUE BAS', details: { analyte: 'Potassium', value: 2.9, unit: 'mmol/L' }, author_id: 'system', author_name: 'Automate labo', validation_status: 'critique', created_at: minsAgo(45) },
  { id: 'tl-13', encounter_id: 'demo-e4', patient_id: 'demo-p4', patient_ipp: generateIPP('demo-p4'), entry_type: 'alerte_labo', content: 'Appel labo — K+ 2.9 mmol/L critique — Bio: Mme Renaud', details: {}, author_id: 'demo-labo', author_name: 'Mme Renaud (Labo)', validation_status: 'critique', created_at: minsAgo(44), lab_result_value: 'K+ = 2.9 mmol/L', lab_interlocutor: 'Mme Renaud' },
  // TV-05: Oral prescription traced
  { id: 'tl-14', encounter_id: 'demo-e4', patient_id: 'demo-p4', patient_ipp: generateIPP('demo-p4'), entry_type: 'prescription_orale', content: 'KCl 1g IV sur 1h — Base: kaliemie a 2.9 mmol/L (appel labo)', details: { oral_prescription_id: 'rx-oral-1' }, author_id: 'demo-medecin', author_name: 'Dr. Martin Dupont', validation_status: 'en_attente', created_at: minsAgo(42), oral_prescription_id: 'rx-oral-1', oral_validation_deadline: minsAgo(-18) },

  // Patient demo-p3 (BERNARD Sophie) timeline
  { id: 'tl-20', encounter_id: 'demo-e3', patient_id: 'demo-p3', patient_ipp: generateIPP('demo-p3'), entry_type: 'arrivee', content: 'Arrivee aux urgences — Dyspnee aigue', details: {}, author_id: 'demo-secretaire', author_name: 'Nathalie Moreau', validation_status: 'valide', created_at: hoursAgo(3) },
  { id: 'tl-21', encounter_id: 'demo-e3', patient_id: 'demo-p3', patient_ipp: generateIPP('demo-p3'), entry_type: 'triage', content: 'Triage IOA — CIMU 2 — FC 105, SpO2 89% AA, FR 32', details: {}, author_id: 'demo-ioa', author_name: 'Sophie Lefevre', validation_status: 'valide', created_at: hoursAgo(2.83) },
  { id: 'tl-22', encounter_id: 'demo-e3', patient_id: 'demo-p3', patient_ipp: generateIPP('demo-p3'), entry_type: 'acte', content: 'Mise sous O2 3L/min — Nebulisation salbutamol 5mg', details: {}, author_id: 'demo-ide', author_name: 'Julie Bernard', validation_status: 'valide', created_at: hoursAgo(2.75) },
  { id: 'tl-23', encounter_id: 'demo-e3', patient_id: 'demo-p3', patient_ipp: generateIPP('demo-p3'), entry_type: 'communication', content: 'Info orale IDE vers medecin: SpO2 remontee a 96% sous O2', details: {}, author_id: 'demo-ide', author_name: 'Julie Bernard', validation_status: 'valide', created_at: hoursAgo(2.25) },

  // Patient demo-p7 (SIMON Thomas) — Dechocage critical
  { id: 'tl-30', encounter_id: 'demo-e7', patient_id: 'demo-p7', patient_ipp: generateIPP('demo-p7'), entry_type: 'arrivee', content: 'Arrivee dechocage — Malaise avec perte de connaissance', details: {}, author_id: 'demo-secretaire', author_name: 'Nathalie Moreau', validation_status: 'valide', created_at: minsAgo(30) },
  { id: 'tl-31', encounter_id: 'demo-e7', patient_id: 'demo-p7', patient_ipp: generateIPP('demo-p7'), entry_type: 'triage', content: 'CIMU 1 — FC 45, PA 80/50, SpO2 88%, GCS 10', details: {}, author_id: 'demo-ioa', author_name: 'Sophie Lefevre', validation_status: 'critique', created_at: minsAgo(25) },
  { id: 'tl-32', encounter_id: 'demo-e7', patient_id: 'demo-p7', patient_ipp: generateIPP('demo-p7'), entry_type: 'info_orale', content: 'Temoin rapporte ingestion de betabloquants — a confirmer', details: {}, author_id: 'demo-ioa', author_name: 'Sophie Lefevre', validation_status: 'en_attente', created_at: minsAgo(23) },
];

// ============ Lab Alerts (M3) ============

export const SIH_LAB_ALERTS: LabAlert[] = [
  // TV-02: K=2.9 for PETIT Jean
  {
    id: 'la-1',
    encounter_id: 'demo-e4',
    patient_id: 'demo-p4',
    patient_ipp: generateIPP('demo-p4'),
    result_id: 'tl-12',
    analyte: 'Potassium (K+)',
    value: 2.9,
    unit: 'mmol/L',
    is_critical: true,
    threshold_exceeded: 'low',
    acknowledged: false,
    escalation_level: 1,
    escalation_history: [
      { level: 1, notified_user_id: 'demo-medecin', notified_user_name: 'Dr. Martin Dupont', notified_at: minsAgo(44) },
    ],
    ipp_verified: true,
    lab_caller: 'Mme Renaud',
    lab_call_time: minsAgo(44),
    lab_interlocutor: 'Dr. Martin Dupont',
    created_at: minsAgo(45),
  },
  // Troponine for DUPONT Marie
  {
    id: 'la-2',
    encounter_id: 'demo-e1',
    patient_id: 'demo-p1',
    patient_ipp: generateIPP('demo-p1'),
    result_id: 'tl-5',
    analyte: 'Troponine',
    value: 245,
    unit: 'ng/L',
    is_critical: true,
    threshold_exceeded: 'high',
    acknowledged: true,
    acknowledged_by: 'demo-medecin',
    acknowledged_at: hoursAgo(2.33),
    acknowledgment_note: 'Vu et pris en compte. SCA ST+ confirme. Cardio alerte, salle coro prevenue.',
    escalation_level: 1,
    escalation_history: [
      { level: 1, notified_user_id: 'demo-medecin', notified_user_name: 'Dr. Martin Dupont', notified_at: hoursAgo(2.42), response: 'acknowledged', response_at: hoursAgo(2.33) },
    ],
    ipp_verified: true,
    lab_caller: 'Dr. Leclerc',
    lab_call_time: hoursAgo(2.42),
    lab_interlocutor: 'Dr. Martin Dupont',
    created_at: hoursAgo(2.5),
  },
];

// ============ Communications (M6) ============

export const SIH_COMMUNICATIONS: Communication[] = [
  {
    id: 'comm-1',
    encounter_id: 'demo-e4',
    patient_id: 'demo-p4',
    patient_ipp: generateIPP('demo-p4'),
    type: 'appel_labo',
    content: 'Kaliemie critique a 2.9 mmol/L. Supplementation recommandee en urgence.',
    source: 'Laboratoire biochimie',
    author_id: 'demo-labo',
    author_name: 'Mme Renaud (Labo)',
    status: 'vu',
    seen_by: 'demo-medecin',
    seen_at: minsAgo(43),
    lab_result_value: 'K+ = 2.9 mmol/L',
    lab_interlocutor: 'Dr. Martin Dupont',
    created_at: minsAgo(44),
  },
  {
    id: 'comm-2',
    encounter_id: 'demo-e1',
    patient_id: 'demo-p1',
    patient_ipp: generateIPP('demo-p1'),
    type: 'appel_labo',
    content: 'Troponine tres elevee a 245 ng/L. Suspicion SCA. Controle a H+3 programme.',
    source: 'Laboratoire biochimie',
    author_id: 'demo-labo',
    author_name: 'Dr. Leclerc (Labo)',
    status: 'traite',
    seen_by: 'demo-medecin',
    seen_at: hoursAgo(2.33),
    treated_by: 'demo-medecin',
    treated_at: hoursAgo(2.25),
    lab_result_value: 'Troponine = 245 ng/L',
    lab_interlocutor: 'Dr. Martin Dupont',
    created_at: hoursAgo(2.42),
  },
  {
    id: 'comm-3',
    encounter_id: 'demo-e3',
    patient_id: 'demo-p3',
    patient_ipp: generateIPP('demo-p3'),
    type: 'info_orale',
    content: 'SpO2 remontee a 96% sous O2 3L. Amelioration clinique nette.',
    source: 'IDE Julie Bernard',
    author_id: 'demo-ide',
    author_name: 'Julie Bernard',
    status: 'vu',
    seen_by: 'demo-medecin',
    seen_at: hoursAgo(2.17),
    created_at: hoursAgo(2.25),
  },
  {
    id: 'comm-4',
    encounter_id: 'demo-e4',
    patient_id: 'demo-p4',
    patient_ipp: generateIPP('demo-p4'),
    type: 'prescription_orale',
    content: 'KCl 1g IV sur 1h — prescription orale Dr. Dupont suite appel labo K+ 2.9',
    source: 'Dr. Martin Dupont',
    author_id: 'demo-medecin',
    author_name: 'Dr. Martin Dupont',
    status: 'saisi',
    created_at: minsAgo(42),
  },
];

// ============ Secure Prescriptions (M4) ============

export const SIH_PRESCRIPTIONS: SecurePrescription[] = [
  // TV-05: Oral prescription for K+ supplementation
  {
    id: 'rx-oral-1',
    encounter_id: 'demo-e4',
    patient_id: 'demo-p4',
    patient_ipp: generateIPP('demo-p4'),
    medication_name: 'Chlorure de potassium (KCl)',
    dosage: '1g',
    route: 'IV',
    frequency: 'Sur 1h, en perfusion lente',
    prescriber_id: 'demo-medecin',
    prescriber_name: 'Dr. Martin Dupont',
    origin: 'orale',
    oral_decision_basis: 'Kaliemie critique a 2.9 mmol/L — Appel labo Mme Renaud',
    oral_validated: false,
    linked_result_id: 'tl-12',
    linked_result_analyte: 'K+',
    linked_result_value: '2.9 mmol/L',
    recheck_scheduled: true,
    recheck_type: 'bio_ecg',
    base_transmission_orale: true,
    ipp_verified_before_prescription: true,
    status: 'oral_pending',
    created_at: minsAgo(42),
  },
  {
    id: 'rx-2',
    encounter_id: 'demo-e1',
    patient_id: 'demo-p1',
    patient_ipp: generateIPP('demo-p1'),
    medication_name: 'Aspirine',
    dosage: '250mg',
    route: 'PO',
    prescriber_id: 'demo-medecin',
    prescriber_name: 'Dr. Martin Dupont',
    origin: 'ecrite',
    oral_validated: true,
    recheck_scheduled: false,
    base_transmission_orale: false,
    ipp_verified_before_prescription: true,
    status: 'active',
    created_at: hoursAgo(3.25),
  },
];

// ============ Guard Schedule (M7) ============

export const SIH_GUARD_SCHEDULE: GuardSchedule[] = [
  {
    id: 'gs-1',
    user_id: 'demo-medecin',
    user_name: 'Dr. Martin Dupont',
    role: 'Medecin urgentiste',
    services: ['SAU', 'UHCD', 'Dechocage'],
    start_time: hoursAgo(8),
    end_time: new Date(now + 4 * 3600000).toISOString(),
    is_active: true,
  },
  {
    id: 'gs-2',
    user_id: 'demo-ioa',
    user_name: 'Sophie Lefevre',
    role: 'IOA',
    services: ['SAU'],
    start_time: hoursAgo(8),
    end_time: new Date(now + 4 * 3600000).toISOString(),
    is_active: true,
  },
  {
    id: 'gs-3',
    user_id: 'demo-ide',
    user_name: 'Julie Bernard',
    role: 'IDE',
    services: ['SAU', 'UHCD'],
    start_time: hoursAgo(8),
    end_time: new Date(now + 4 * 3600000).toISOString(),
    is_active: true,
  },
];

// ============ Quality Indicators (M8) ============

export const SIH_QUALITY_INDICATORS: QualityIndicator[] = [
  { id: 'qi-1', name: 'Identite verifiee avant prescription', description: 'M1-03 — % de prescriptions avec identite verifiee', value: 97, target: 100, unit: '%', period: '24h', calculated_at: new Date().toISOString() },
  { id: 'qi-2', name: 'Alertes labo acquittees < 5 min', description: 'M3-03 — % acquittement dans les 5 minutes', value: 85, target: 95, unit: '%', period: '24h', calculated_at: new Date().toISOString() },
  { id: 'qi-3', name: 'Prescriptions orales validees < 30 min', description: 'M2-03 — % validation prescription orale', value: 78, target: 90, unit: '%', period: '24h', calculated_at: new Date().toISOString() },
  { id: 'qi-4', name: 'Communications tracees', description: 'M6 — % appels labo documentes', value: 92, target: 100, unit: '%', period: '24h', calculated_at: new Date().toISOString() },
  { id: 'qi-5', name: 'Concordance 5B IDE', description: 'M5-03 — % verifications 5B completes', value: 95, target: 100, unit: '%', period: '24h', calculated_at: new Date().toISOString() },
  { id: 'qi-6', name: 'Temps moyen triage', description: 'Temps entre arrivee et triage IOA', value: 12, target: 15, unit: 'min', period: '24h', calculated_at: new Date().toISOString() },
];
