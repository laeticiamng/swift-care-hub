// ================================================================
// UrgenceOS — Coding Systems & Reference Data
// LOINC, ATC, CIMU, CCMU, SFMU, Prescription Packs
// ================================================================

// ── Codes LOINC pour constantes vitales ──
export const LOINC_VITALS = {
  fc: { code: '8867-4', display: 'Heart rate', unit: '/min' },
  pas: { code: '8480-6', display: 'Systolic blood pressure', unit: 'mmHg' },
  pad: { code: '8462-4', display: 'Diastolic blood pressure', unit: 'mmHg' },
  spo2: { code: '2708-6', display: 'Oxygen saturation', unit: '%' },
  temperature: { code: '8310-5', display: 'Body temperature', unit: 'Cel' },
  fr: { code: '9279-1', display: 'Respiratory rate', unit: '/min' },
  gcs: { code: '9269-2', display: 'Glasgow coma score', unit: '{score}' },
  eva: { code: '38208-5', display: 'Pain severity VAS', unit: '{score}' },
} as const;

export type LoincVitalKey = keyof typeof LOINC_VITALS;

// ── Codes ATC courants urgences ──
export const ATC_URGENCES = {
  paracetamol: { code: 'N02BE01', display: 'Paracetamol' },
  morphine: { code: 'N02AA01', display: 'Morphine' },
  ketoprofene: { code: 'M01AE03', display: 'Ketoprofene' },
  salbutamol: { code: 'R03AC02', display: 'Salbutamol' },
  ipratropium: { code: 'R03BB01', display: 'Ipratropium' },
  methylprednisolone: { code: 'H02AB04', display: 'Methylprednisolone' },
  metoclopramide: { code: 'A03FA01', display: 'Metoclopramide' },
  phloroglucinol: { code: 'A03AX12', display: 'Phloroglucinol' },
  nac: { code: 'V03AB23', display: 'N-Acetylcysteine' },
  nacl: { code: 'B05BB01', display: 'Chlorure de sodium' },
  glucose5: { code: 'B05BA03', display: 'Glucose 5%' },
  ringer: { code: 'B05BB01', display: 'Ringer Lactate' },
  amoxicilline: { code: 'J01CA04', display: 'Amoxicilline' },
  ceftriaxone: { code: 'J01DD04', display: 'Ceftriaxone' },
  enoxaparine: { code: 'B01AB05', display: 'Enoxaparine' },
  heparine: { code: 'B01AB01', display: 'Heparine' },
} as const;

/** Reverse lookup: medication name (lowercase) -> ATC code */
export function findATCCode(medicationName: string): { code: string; display: string } | undefined {
  const normalized = medicationName.toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a');
  for (const entry of Object.values(ATC_URGENCES)) {
    if (normalized.includes(entry.display.toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a'))) {
      return entry;
    }
  }
  return undefined;
}

// ── Thesaurus CIMU ──
export const CIMU_CODES: Record<number, { display: string; color: string }> = {
  1: { display: 'Detresse vitale immediate', color: '#E74C3C' },
  2: { display: 'Urgence vraie', color: '#E67E22' },
  3: { display: 'Urgence ressentie', color: '#F39C12' },
  4: { display: 'Consultation non urgente', color: '#27AE60' },
  5: { display: 'Consultation simple', color: '#27AE60' },
};

// ── Thesaurus CCMU ──
export const CCMU_CODES: Record<string, { display: string; color: string }> = {
  '1': { display: 'Etat lesionnel ou pronostic vital juge stable', color: '#27AE60' },
  '2': { display: 'Etat lesionnel stable, decision actes complementaires', color: '#27AE60' },
  '3': { display: 'Etat lesionnel susceptible de s\'aggraver', color: '#F39C12' },
  '4': { display: 'Pronostic vital engage', color: '#E74C3C' },
  '5': { display: 'Pronostic vital engage, ACR', color: '#E74C3C' },
  'P': { display: 'Probleme psychiatrique predominant', color: '#8E44AD' },
  'D': { display: 'Decede a l\'arrivee', color: '#2C3E50' },
};

// ── Thesaurus motifs SFMU ──
export const MOTIFS_SFMU = [
  'Douleur thoracique', 'Dyspnee', 'Douleur abdominale', 'Cephalee',
  'Malaise / Syncope', 'Traumatisme cranien', 'Traumatisme membre superieur',
  'Traumatisme membre inferieur', 'Traumatisme rachis', 'Plaie',
  'Brulure', 'Intoxication medicamenteuse', 'Intoxication ethylique',
  'Alteration etat general', 'Fievre', 'Trouble conscience',
  'Deficit neurologique', 'Convulsions', 'Agitation / Trouble comportement',
  'Allergie / Anaphylaxie', 'Hemorragie digestive', 'Douleur lombaire',
  'Retention aigue urine', 'Vertige', 'Eruption cutanee',
  'Douleur oculaire', 'Epistaxis', 'Corps etranger',
  'Pathologie obstetricale', 'Arret cardio-respiratoire',
] as const;

// ── FHIR Encounter status mapping ──
export function mapEncounterStatusToFHIR(status: string): string {
  const mapping: Record<string, string> = {
    'planned': 'planned',
    'arrived': 'arrived',
    'triaged': 'triaged',
    'in-progress': 'in-progress',
    'finished': 'finished',
  };
  return mapping[status] || 'unknown';
}

// ── FHIR Prescription status mapping ──
export function mapPrescriptionStatusToFHIR(status: string): string {
  const mapping: Record<string, string> = {
    'draft': 'draft',
    'active': 'active',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'suspended': 'on-hold',
  };
  return mapping[status] || 'unknown';
}

// ── FHIR Service Request status mapping ──
export function mapServiceStatusToFHIR(status: string): string {
  const mapping: Record<string, string> = {
    'draft': 'draft',
    'active': 'active',
    'completed': 'completed',
    'cancelled': 'revoked',
  };
  return mapping[status] || 'unknown';
}

// ── Exam category mapping for FHIR ──
export function mapExamCategoryToFHIR(prescriptionType: string): string {
  const mapping: Record<string, string> = {
    'exam_bio': 'laboratory',
    'exam_imagerie': 'imaging',
    'exam_ecg': 'cardiology',
    'exam_autre': 'other',
  };
  return mapping[prescriptionType] || 'other';
}

// ── GEMSA codes ──
export const GEMSA_CODES: Record<number, string> = {
  1: 'Patient non attendu, non programme',
  2: 'Patient attendu non programme',
  3: 'Patient programme',
  4: 'Patient deja hospitalise',
  5: 'Patient venant d\'un autre service d\'urgence',
  6: 'Patient non classable',
};

// ── Discharge destinations ──
export const DISCHARGE_DESTINATIONS = [
  'domicile',
  'hospitalisation_mco',
  'hospitalisation_ssr',
  'hospitalisation_psy',
  'uhcd',
  'transfert',
  'deces',
  'fugue',
  'sortie_insu',
  'hap',
] as const;

// ── Establishment config (for interop headers) ──
export const ESTABLISHMENT = {
  name: 'CHU UrgenceOS Demo',
  oid: '1.2.250.1.71.4.2.2.99999',
  finess: '999999999',
  site_code: 'URGOS01',
  mssante_domain: 'urgenceos-demo.mssante.fr',
  service: 'Service des urgences',
} as const;
