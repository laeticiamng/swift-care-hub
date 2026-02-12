/**
 * Tests unitaires — Module FHIR Import
 * Vérifie l'import de bundles FHIR R4 vers le modèle canonique
 */
import { describe, it, expect } from 'vitest';
import { importFHIRBundle, importFHIRFromJSON, type FHIRImportResult } from '@/lib/interop/fhir-import';
import type { FHIRBundle } from '@/lib/interop/fhir-adapter';

const makeBundle = (entries: any[]): FHIRBundle => ({
  resourceType: 'Bundle',
  type: 'collection',
  entry: entries.map(resource => ({
    fullUrl: `urn:uuid:${resource.resourceType}/${resource.id || 'test'}`,
    resource,
  })),
});

const FHIR_PATIENT = {
  resourceType: 'Patient',
  id: 'pat-1',
  identifier: [
    { system: 'urn:oid:1.2.250.1.213.1.4.8', value: '185037512345645', use: 'official' },
    { system: 'urn:oid:1.2.250.1.71.4.2.2', value: 'IPP-001', use: 'usual' },
  ],
  name: [{ family: 'DUPONT', given: ['Jean'], use: 'official' }],
  birthDate: '1985-03-15',
  gender: 'male',
  telecom: [{ system: 'phone', value: '0612345678', use: 'mobile' }],
};

const FHIR_ENCOUNTER = {
  resourceType: 'Encounter',
  id: 'enc-1',
  status: 'in-progress',
  class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER' },
  subject: { reference: 'Patient/pat-1' },
  period: { start: '2024-01-15T10:30:00Z' },
  reasonCode: [{ text: 'Douleur thoracique' }],
  priority: { coding: [{ system: 'urn:oid:local:cimu', code: '2' }] },
};

const FHIR_OBSERVATION_VITAL = {
  resourceType: 'Observation',
  id: 'obs-1',
  status: 'final',
  category: [{ coding: [{ code: 'vital-signs' }] }],
  code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
  subject: { reference: 'Patient/pat-1' },
  effectiveDateTime: '2024-01-15T10:35:00Z',
  valueQuantity: { value: 85, unit: 'bpm' },
};

const FHIR_ALLERGY = {
  resourceType: 'AllergyIntolerance',
  id: 'al-1',
  clinicalStatus: { coding: [{ code: 'active' }] },
  criticality: 'high',
  code: { text: 'Pénicilline', coding: [{ code: 'penG' }] },
  patient: { reference: 'Patient/pat-1' },
  reaction: [{ manifestation: [{ text: 'Urticaire' }], severity: 'moderate' }],
};

const FHIR_CONDITION = {
  resourceType: 'Condition',
  id: 'cond-1',
  clinicalStatus: { coding: [{ code: 'active' }] },
  verificationStatus: { coding: [{ code: 'confirmed' }] },
  category: [{ coding: [{ code: 'encounter-diagnosis' }] }],
  code: {
    coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'I21.0', display: 'IDM antérieur' }],
    text: 'Infarctus du myocarde antérieur aigu',
  },
  subject: { reference: 'Patient/pat-1' },
};

const FHIR_MED_REQUEST = {
  resourceType: 'MedicationRequest',
  id: 'rx-1',
  status: 'active',
  intent: 'order',
  medicationCodeableConcept: {
    text: 'Paracétamol 1g',
    coding: [{ system: 'http://www.whocc.no/atc', code: 'N02BE01', display: 'Paracétamol' }],
  },
  subject: { reference: 'Patient/pat-1' },
  encounter: { reference: 'Encounter/enc-1' },
  dosageInstruction: [{ doseAndRate: [{ doseQuantity: { value: 1, unit: 'g' } }], route: { text: 'PO' } }],
};

describe('importFHIRBundle — Cas complet', () => {
  it('importe un bundle complet avec succès', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_OBSERVATION_VITAL, FHIR_ALLERGY, FHIR_CONDITION, FHIR_MED_REQUEST]);
    const result = importFHIRBundle(bundle);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toBeDefined();
  });

  it('convertit le patient correctement', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER]);
    const result = importFHIRBundle(bundle);

    const patient = result.data!.patient;
    expect(patient.nom).toBe('DUPONT');
    expect(patient.prenom).toBe('Jean');
    expect(patient.date_naissance).toBe('1985-03-15');
    expect(patient.sexe).toBe('M');
    expect(patient.ins_numero).toBe('185037512345645');
    expect(patient.ipp).toBe('IPP-001');
    expect(patient.telephone).toBe('0612345678');
    expect(patient.provenance).toBe('import_fhir');
  });

  it('convertit l\'encounter correctement', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER]);
    const result = importFHIRBundle(bundle);

    const encounter = result.data!.encounter;
    expect(encounter.status).toBe('in-progress');
    expect(encounter.arrival_time).toBe('2024-01-15T10:30:00Z');
    expect(encounter.motif_sfmu).toBe('Douleur thoracique');
    expect(encounter.cimu).toBe(2);
  });

  it('convertit les constantes vitales', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_OBSERVATION_VITAL]);
    const result = importFHIRBundle(bundle);

    expect(result.data!.vitals.length).toBe(1);
    expect(result.data!.vitals[0].fc).toBe(85);
  });

  it('convertit les allergies', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_ALLERGY]);
    const result = importFHIRBundle(bundle);

    expect(result.data!.allergies.length).toBe(1);
    expect(result.data!.allergies[0].substance).toBe('Pénicilline');
    expect(result.data!.allergies[0].criticality).toBe('high');
    expect(result.data!.allergies[0].reaction).toBe('Urticaire');
    expect(result.data!.allergies[0].severity).toBe('moderee');
  });

  it('convertit les conditions/diagnostics', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_CONDITION]);
    const result = importFHIRBundle(bundle);

    expect(result.data!.conditions.length).toBe(1);
    expect(result.data!.conditions[0].code_cim10).toBe('I21.0');
    expect(result.data!.conditions[0].category).toBe('diagnostic_actuel');
  });

  it('convertit les prescriptions médicamenteuses', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_MED_REQUEST]);
    const result = importFHIRBundle(bundle);

    expect(result.data!.prescriptions.length).toBe(1);
    expect(result.data!.prescriptions[0].medication_name).toBe('Paracétamol 1g');
    expect(result.data!.prescriptions[0].dose_value).toBe(1);
    expect(result.data!.prescriptions[0].dose_unit).toBe('g');
  });

  it('compte les ressources par type', () => {
    const bundle = makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER, FHIR_OBSERVATION_VITAL, FHIR_ALLERGY]);
    const result = importFHIRBundle(bundle);

    expect(result.resourceCounts['Patient']).toBe(1);
    expect(result.resourceCounts['Encounter']).toBe(1);
    expect(result.resourceCounts['Observation']).toBe(1);
    expect(result.resourceCounts['AllergyIntolerance']).toBe(1);
  });
});

describe('importFHIRBundle — Cas d\'erreur', () => {
  it('rejette un objet qui n\'est pas un Bundle', () => {
    const result = importFHIRBundle({ resourceType: 'Patient' } as any);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Bundle');
  });

  it('rejette un Bundle vide', () => {
    const result = importFHIRBundle({ resourceType: 'Bundle', type: 'collection', entry: [] });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('aucune');
  });

  it('rejette un Bundle sans Patient', () => {
    const result = importFHIRBundle(makeBundle([FHIR_ENCOUNTER]));
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Patient');
  });

  it('avertit si plusieurs patients', () => {
    const bundle = makeBundle([FHIR_PATIENT, { ...FHIR_PATIENT, id: 'pat-2' }, FHIR_ENCOUNTER]);
    const result = importFHIRBundle(bundle);
    expect(result.success).toBe(true);
    expect(result.warnings.some(w => w.includes('patients'))).toBe(true);
  });

  it('crée un encounter par défaut si absent', () => {
    const bundle = makeBundle([FHIR_PATIENT]);
    const result = importFHIRBundle(bundle);
    expect(result.success).toBe(true);
    expect(result.data!.encounter).toBeDefined();
    expect(result.warnings.some(w => w.includes('Encounter'))).toBe(true);
  });
});

describe('importFHIRFromJSON', () => {
  it('parse et importe du JSON valide', () => {
    const json = JSON.stringify(makeBundle([FHIR_PATIENT, FHIR_ENCOUNTER]));
    const result = importFHIRFromJSON(json);
    expect(result.success).toBe(true);
  });

  it('gère du JSON invalide', () => {
    const result = importFHIRFromJSON('not json {{{');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('JSON');
  });
});
