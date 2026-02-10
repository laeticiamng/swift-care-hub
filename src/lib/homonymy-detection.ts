/**
 * M1-02 — Homonymy Detection Service
 * Automatic detection when 2+ patients share the same nom/prenom
 * Triggers red blinking banner + mandatory confirmation popup
 */

import type { PatientIdentity, HomonymyAlert } from './sih-types';

export function detectHomonymy(
  currentPatient: PatientIdentity,
  allPatients: PatientIdentity[]
): HomonymyAlert[] {
  const alerts: HomonymyAlert[] = [];
  const normalizedCurrent = normalizeIdentity(currentPatient);

  for (const patient of allPatients) {
    if (patient.id === currentPatient.id) continue;

    const normalized = normalizeIdentity(patient);
    if (normalizedCurrent.nom === normalized.nom && normalizedCurrent.prenom === normalized.prenom) {
      alerts.push({
        id: `homonymy-${currentPatient.id}-${patient.id}`,
        patient_a_id: currentPatient.id,
        patient_b_id: patient.id,
        patient_a: currentPatient,
        patient_b: patient,
        detected_at: new Date().toISOString(),
        acknowledged: false,
      });
    }
  }

  return alerts;
}

function normalizeIdentity(patient: PatientIdentity): { nom: string; prenom: string } {
  return {
    nom: patient.nom.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    prenom: patient.prenom.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  };
}

/**
 * M1-03 — Identity Verification Lock
 * Every critical action requires Nom+DDN or Nom+IPP, non-bypassable
 */
export function verifyIdentity(
  patient: PatientIdentity,
  inputNom: string,
  inputSecond: string,
  method: 'nom_ddn' | 'nom_ipp'
): boolean {
  const normalizedInputNom = inputNom.trim().toUpperCase();
  const normalizedPatientNom = patient.nom.trim().toUpperCase();

  if (normalizedInputNom !== normalizedPatientNom) return false;

  if (method === 'nom_ddn') {
    return inputSecond.trim() === patient.date_naissance;
  }

  if (method === 'nom_ipp') {
    return inputSecond.trim() === patient.ipp;
  }

  return false;
}

/**
 * Generate IPP from patient data (deterministic for demo)
 */
export function generateIPP(patientId: string): string {
  const hash = patientId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
  return `IPP-${hash.padStart(8, '0')}`;
}

/**
 * Generate numero sejour from encounter data
 */
export function generateNumeroSejour(encounterId: string): string {
  const hash = encounterId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  return `SEJ-${new Date().getFullYear()}-${hash.padStart(6, '0')}`;
}
