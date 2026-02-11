import { describe, it, expect, vi } from 'vitest';
import {
  patientToFHIR,
  encounterToFHIR,
  vitalsToFHIR,
  prescriptionToFHIR,
  allergyToFHIR,
  encounterBundleToFHIR,
  countBundleResources,
} from '@/lib/interop/fhir-adapter';
import type {
  CanonicalPatient,
  CanonicalEncounter,
  CanonicalVitals,
  CanonicalPrescription,
  CanonicalAllergy,
  FullEncounterData,
} from '@/lib/interop/canonical-model';

// Mock crypto.randomUUID for deterministic tests
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid',
});

const samplePatient: CanonicalPatient = {
  id: 'patient-1',
  nom: 'Dupont',
  prenom: 'Jean',
  date_naissance: '1985-03-15',
  sexe: 'M',
  ins_numero: '185031500012345',
  ipp: 'IPP-00000001',
  telephone: '0612345678',
  adresse: '12 rue de la Paix, Paris',
  medecin_traitant: 'Dr Martin',
};

const sampleEncounter: CanonicalEncounter = {
  id: 'enc-1',
  patient_id: 'patient-1',
  status: 'in-progress',
  arrival_time: '2025-06-15T10:00:00Z',
  when_event: '2025-06-15T10:00:00Z',
  motif_sfmu: 'Douleur thoracique',
  cimu: 2,
  location: 'Box 3',
};

const sampleVitals: CanonicalVitals = {
  id: 'v1',
  patient_id: 'patient-1',
  encounter_id: 'enc-1',
  recorded_at: '2025-06-15T10:15:00Z',
  fc: 88,
  pas: 130,
  pad: 80,
  spo2: 97,
  temperature: 37.2,
  fr: 18,
  gcs: 15,
  eva: 6,
};

describe('patientToFHIR', () => {
  it('produces a valid FHIR Patient resource', () => {
    const fhir = patientToFHIR(samplePatient);
    expect(fhir.resourceType).toBe('Patient');
    expect(fhir.id).toBe('patient-1');
  });

  it('includes INS identifier with correct OID', () => {
    const fhir = patientToFHIR(samplePatient);
    const identifiers = fhir.identifier as Array<{ system: string; value: string; use: string }>;
    const insId = identifiers.find(id => id.system === 'urn:oid:1.2.250.1.213.1.4.8');
    expect(insId).toBeDefined();
    expect(insId!.value).toBe('185031500012345');
    expect(insId!.use).toBe('official');
  });

  it('includes IPP identifier', () => {
    const fhir = patientToFHIR(samplePatient);
    const identifiers = fhir.identifier as Array<{ system: string; value: string; use: string }>;
    const ippId = identifiers.find(id => id.use === 'usual');
    expect(ippId).toBeDefined();
    expect(ippId!.value).toBe('IPP-00000001');
  });

  it('maps name correctly', () => {
    const fhir = patientToFHIR(samplePatient);
    const names = fhir.name as Array<{ family: string; given: string[]; use: string }>;
    expect(names[0].family).toBe('Dupont');
    expect(names[0].given).toEqual(['Jean']);
    expect(names[0].use).toBe('official');
  });

  it('maps gender from sexe field', () => {
    const fhir = patientToFHIR(samplePatient);
    expect(fhir.gender).toBe('male');

    const femalePatient = { ...samplePatient, sexe: 'F' as const };
    const fhirF = patientToFHIR(femalePatient);
    expect(fhirF.gender).toBe('female');
  });

  it('includes birthDate', () => {
    const fhir = patientToFHIR(samplePatient);
    expect(fhir.birthDate).toBe('1985-03-15');
  });
});

describe('encounterToFHIR', () => {
  it('produces a valid FHIR Encounter with EMER class', () => {
    const fhir = encounterToFHIR(sampleEncounter);
    expect(fhir.resourceType).toBe('Encounter');
    const classInfo = fhir.class as { code: string; display: string };
    expect(classInfo.code).toBe('EMER');
    expect(classInfo.display).toBe('emergency');
  });

  it('references the correct patient', () => {
    const fhir = encounterToFHIR(sampleEncounter);
    const subject = fhir.subject as { reference: string };
    expect(subject.reference).toBe('Patient/patient-1');
  });

  it('maps status correctly', () => {
    const fhir = encounterToFHIR(sampleEncounter);
    expect(fhir.status).toBe('in-progress');
  });

  it('includes period.start from when_event', () => {
    const fhir = encounterToFHIR(sampleEncounter);
    const period = fhir.period as { start: string };
    expect(period.start).toBe('2025-06-15T10:00:00Z');
  });

  it('includes reason code from motif_sfmu', () => {
    const fhir = encounterToFHIR(sampleEncounter);
    const reason = fhir.reasonCode as Array<{ text: string }>;
    expect(reason[0].text).toBe('Douleur thoracique');
  });
});

describe('vitalsToFHIR', () => {
  it('produces an Observation array with LOINC codes', () => {
    const observations = vitalsToFHIR(sampleVitals);
    expect(observations.length).toBe(8); // fc, pas, pad, spo2, temp, fr, gcs, eva
    for (const obs of observations) {
      expect(obs.resourceType).toBe('Observation');
      const code = obs.code as { coding: Array<{ system: string; code: string }> };
      expect(code.coding[0].system).toBe('http://loinc.org');
      expect(code.coding[0].code).toBeDefined();
    }
  });

  it('includes heart rate observation with correct LOINC code', () => {
    const observations = vitalsToFHIR(sampleVitals);
    const hrObs = observations.find(o => {
      const code = o.code as { coding: Array<{ code: string }> };
      return code.coding[0].code === '8867-4';
    });
    expect(hrObs).toBeDefined();
    const val = hrObs!.valueQuantity as { value: number; unit: string };
    expect(val.value).toBe(88);
    expect(val.unit).toBe('/min');
  });

  it('omits observations for null vital values', () => {
    const sparseVitals: CanonicalVitals = {
      id: 'v2',
      patient_id: 'p1',
      encounter_id: 'e1',
      recorded_at: '2025-06-15T10:15:00Z',
      fc: 80,
      spo2: 95,
      // no other vitals
    };
    const observations = vitalsToFHIR(sparseVitals);
    expect(observations.length).toBe(2);
  });

  it('references the correct patient and encounter', () => {
    const observations = vitalsToFHIR(sampleVitals);
    for (const obs of observations) {
      const subject = obs.subject as { reference: string };
      const encounter = obs.encounter as { reference: string };
      expect(subject.reference).toBe('Patient/patient-1');
      expect(encounter.reference).toBe('Encounter/enc-1');
    }
  });
});

describe('prescriptionToFHIR', () => {
  it('produces MedicationRequest for medication type prescriptions', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-1',
      encounter_id: 'enc-1',
      patient_id: 'patient-1',
      prescription_type: 'medicament',
      medication_name: 'Paracetamol',
      dosage: '1g',
      route: 'IV',
      frequency: 'q6h',
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('MedicationRequest');
    expect(fhir.status).toBe('active');
  });

  it('produces ServiceRequest for exam type prescriptions', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-2',
      encounter_id: 'enc-1',
      patient_id: 'patient-1',
      prescription_type: 'exam_bio',
      medication_name: 'Bio urgente',
      exam_list: ['NFS', 'CRP', 'Troponine'],
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('ServiceRequest');
  });

  it('includes ATC code when available', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-3',
      encounter_id: 'enc-1',
      patient_id: 'patient-1',
      prescription_type: 'medicament',
      medication_name: 'Morphine',
      medication_atc_code: 'N02AA01',
      dosage: '5mg',
      route: 'SC',
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    const medConcept = fhir.medicationCodeableConcept as { coding: Array<{ system: string; code: string }> };
    expect(medConcept.coding[0].system).toBe('http://www.whocc.no/atc');
    expect(medConcept.coding[0].code).toBe('N02AA01');
  });

  it('maps perfusion type to MedicationRequest', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-4',
      encounter_id: 'enc-1',
      patient_id: 'patient-1',
      prescription_type: 'perfusion',
      medication_name: 'NaCl 0.9%',
      dosage: '1000mL',
      route: 'IV',
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('MedicationRequest');
  });

  it('maps surveillance type to ServiceRequest', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-5',
      encounter_id: 'enc-1',
      patient_id: 'patient-1',
      prescription_type: 'surveillance',
      medication_name: 'Scope continu',
      surveillance_type: 'scope + SpO2',
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('ServiceRequest');
  });
});

describe('allergyToFHIR', () => {
  it('produces a valid AllergyIntolerance resource', () => {
    const allergy: CanonicalAllergy = {
      id: 'a1',
      patient_id: 'patient-1',
      substance: 'Penicilline',
      reaction: 'Urticaire',
      severity: 'moderee',
      criticality: 'high',
      status: 'active',
    };
    const fhir = allergyToFHIR(allergy);
    expect(fhir.resourceType).toBe('AllergyIntolerance');
    expect(fhir.criticality).toBe('high');
  });

  it('references the correct patient', () => {
    const allergy: CanonicalAllergy = {
      patient_id: 'patient-1',
      substance: 'Iode',
    };
    const fhir = allergyToFHIR(allergy);
    const patient = fhir.patient as { reference: string };
    expect(patient.reference).toBe('Patient/patient-1');
  });

  it('includes substance text in code', () => {
    const allergy: CanonicalAllergy = {
      patient_id: 'patient-1',
      substance: 'Latex',
      substance_code: 'L001',
    };
    const fhir = allergyToFHIR(allergy);
    const code = fhir.code as { text: string; coding: Array<{ code: string }> };
    expect(code.text).toBe('Latex');
    expect(code.coding[0].code).toBe('L001');
  });

  it('maps reaction severity correctly', () => {
    const allergy: CanonicalAllergy = {
      patient_id: 'p1',
      substance: 'AINS',
      reaction: 'Choc anaphylactique',
      severity: 'severe',
    };
    const fhir = allergyToFHIR(allergy);
    const reactions = fhir.reaction as Array<{ severity: string }>;
    expect(reactions[0].severity).toBe('severe');
  });
});

describe('encounterBundleToFHIR', () => {
  const fullData: FullEncounterData = {
    patient: samplePatient,
    encounter: sampleEncounter,
    vitals: [sampleVitals],
    prescriptions: [],
    administrations: [],
    procedures: [],
    results: [],
    allergies: [{ patient_id: 'patient-1', substance: 'Penicilline' }],
    conditions: [],
    transmissions: [],
    documents: [],
  };

  it('produces a complete FHIR Bundle of type collection', () => {
    const bundle = encounterBundleToFHIR(fullData);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
  });

  it('contains Patient and Encounter entries', () => {
    const bundle = encounterBundleToFHIR(fullData);
    const types = bundle.entry.map(e => e.resource.resourceType);
    expect(types).toContain('Patient');
    expect(types).toContain('Encounter');
  });

  it('contains Observation entries from vitals', () => {
    const bundle = encounterBundleToFHIR(fullData);
    const obsCount = bundle.entry.filter(e => e.resource.resourceType === 'Observation').length;
    expect(obsCount).toBe(8); // 8 vital observations
  });

  it('contains AllergyIntolerance entries', () => {
    const bundle = encounterBundleToFHIR(fullData);
    const allergyEntries = bundle.entry.filter(e => e.resource.resourceType === 'AllergyIntolerance');
    expect(allergyEntries).toHaveLength(1);
  });

  it('includes timestamp', () => {
    const bundle = encounterBundleToFHIR(fullData);
    expect(bundle.timestamp).toBeDefined();
  });
});

describe('countBundleResources', () => {
  it('counts resources by type correctly', () => {
    const fullData: FullEncounterData = {
      patient: samplePatient,
      encounter: sampleEncounter,
      vitals: [sampleVitals],
      prescriptions: [],
      administrations: [],
      procedures: [],
      results: [],
      allergies: [],
      conditions: [],
      transmissions: [],
      documents: [],
    };
    const bundle = encounterBundleToFHIR(fullData);
    const counts = countBundleResources(bundle);
    expect(counts['Patient']).toBe(1);
    expect(counts['Encounter']).toBe(1);
    expect(counts['Observation']).toBe(8);
  });
});
