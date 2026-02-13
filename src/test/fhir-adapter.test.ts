/**
 * Tests unitaires — Module FHIR R4 Adapter
 * Vérifie la transformation canonical → FHIR et la validation des bundles
 */
import { describe, it, expect } from 'vitest';
import {
  patientToFHIR,
  encounterToFHIR,
  vitalsToFHIR,
  prescriptionToFHIR,
  allergyToFHIR,
  conditionToFHIR,
  encounterBundleToFHIR,
  countBundleResources,
} from '@/lib/interop/fhir-adapter';
import type {
  CanonicalPatient,
  CanonicalEncounter,
  CanonicalVitals,
  CanonicalPrescription,
  CanonicalAllergy,
  CanonicalCondition,
  FullEncounterData,
} from '@/lib/interop/canonical-model';

const mockPatient: CanonicalPatient = {
  id: 'pat-1',
  nom: 'DUPONT',
  prenom: 'Jean',
  date_naissance: '1985-03-15',
  sexe: 'M',
  ins_numero: '185037512345645',
  ipp: 'IPP-00000001',
  telephone: '0612345678',
  adresse: '12 rue de Paris, 75001 Paris',
  medecin_traitant: 'Dr. Martin',
};

const mockEncounter: CanonicalEncounter = {
  id: 'enc-1',
  patient_id: 'pat-1',
  status: 'in-progress',
  arrival_time: '2024-01-15T10:30:00Z',
  motif_sfmu: 'Douleur thoracique',
  cimu: 2,
  zone: 'dechoc',
  location: 'Box 1',
};

const mockVitals: CanonicalVitals = {
  id: 'vit-1',
  patient_id: 'pat-1',
  encounter_id: 'enc-1',
  recorded_at: '2024-01-15T10:35:00Z',
  fc: 85,
  pas: 135,
  pad: 82,
  spo2: 97,
  temperature: 37.2,
  fr: 18,
  gcs: 15,
  eva: 6,
};

describe('patientToFHIR', () => {
  it('génère un Patient FHIR valide', () => {
    const fhir = patientToFHIR(mockPatient);
    expect(fhir.resourceType).toBe('Patient');
    expect(fhir.id).toBe('pat-1');
    expect((fhir.name as any)[0].family).toBe('DUPONT');
    expect((fhir.name as any)[0].given).toEqual(['Jean']);
    expect(fhir.birthDate).toBe('1985-03-15');
    expect(fhir.gender).toBe('male');
  });

  it('inclut l\'identifiant INS avec le bon OID', () => {
    const fhir = patientToFHIR(mockPatient);
    const identifiers = fhir.identifier as any[];
    const ins = identifiers.find(i => i.system === 'urn:oid:1.2.250.1.213.1.4.8');
    expect(ins).toBeDefined();
    expect(ins.value).toBe('185037512345645');
    expect(ins.use).toBe('official');
  });

  it('inclut l\'IPP avec l\'OID de l\'établissement', () => {
    const fhir = patientToFHIR(mockPatient);
    const identifiers = fhir.identifier as any[];
    const ipp = identifiers.find(i => i.use === 'usual');
    expect(ipp).toBeDefined();
    expect(ipp.value).toBe('IPP-00000001');
  });

  it('mappe sexe F → female', () => {
    const fhir = patientToFHIR({ ...mockPatient, sexe: 'F' });
    expect(fhir.gender).toBe('female');
  });
});

describe('encounterToFHIR', () => {
  it('génère un Encounter FHIR valide', () => {
    const fhir = encounterToFHIR(mockEncounter);
    expect(fhir.resourceType).toBe('Encounter');
    expect(fhir.id).toBe('enc-1');
    expect((fhir.class as any).code).toBe('EMER');
  });

  it('inclut la référence au patient', () => {
    const fhir = encounterToFHIR(mockEncounter);
    expect((fhir.subject as any).reference).toBe('Patient/pat-1');
  });

  it('inclut la période de séjour', () => {
    const fhir = encounterToFHIR(mockEncounter);
    expect((fhir.period as any).start).toBe('2024-01-15T10:30:00Z');
  });

  it('inclut le niveau CIMU dans priority', () => {
    const fhir = encounterToFHIR(mockEncounter);
    expect((fhir.priority as any).coding[0].code).toBe('2');
  });
});

describe('vitalsToFHIR', () => {
  it('génère une Observation par constante', () => {
    const observations = vitalsToFHIR(mockVitals);
    // fc, pas, pad, spo2, temperature, fr, gcs, eva = 8
    expect(observations.length).toBe(8);
  });

  it('chaque observation est de type Observation', () => {
    const observations = vitalsToFHIR(mockVitals);
    for (const obs of observations) {
      expect(obs.resourceType).toBe('Observation');
      expect(obs.status).toBe('final');
    }
  });

  it('inclut les codes LOINC', () => {
    const observations = vitalsToFHIR(mockVitals);
    for (const obs of observations) {
      const code = obs.code as any;
      expect(code.coding[0].system).toBe('http://loinc.org');
      expect(code.coding[0].code).toBeTruthy();
    }
  });

  it('ignore les constantes nulles/undefined', () => {
    const sparse: CanonicalVitals = {
      id: 'v-2',
      patient_id: 'p-1',
      encounter_id: 'e-1',
      recorded_at: '2024-01-15T10:00:00Z',
      fc: 80,
      // everything else undefined
    };
    const observations = vitalsToFHIR(sparse);
    expect(observations.length).toBe(1);
    expect((observations[0].valueQuantity as any).value).toBe(80);
  });
});

describe('prescriptionToFHIR', () => {
  it('génère un MedicationRequest pour un médicament', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-1',
      encounter_id: 'enc-1',
      patient_id: 'pat-1',
      prescription_type: 'medicament',
      medication_name: 'Paracétamol 1g',
      dose_value: 1,
      dose_unit: 'g',
      route: 'PO',
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('MedicationRequest');
    expect(fhir.status).toBeTruthy();
  });

  it('génère un ServiceRequest pour un examen', () => {
    const rx: CanonicalPrescription = {
      id: 'rx-2',
      encounter_id: 'enc-1',
      patient_id: 'pat-1',
      prescription_type: 'exam_bio',
      exam_list: ['NFS', 'CRP', 'Ionogramme'],
      status: 'active',
    };
    const fhir = prescriptionToFHIR(rx);
    expect(fhir.resourceType).toBe('ServiceRequest');
  });
});

describe('allergyToFHIR', () => {
  it('génère un AllergyIntolerance FHIR valide', () => {
    const allergy: CanonicalAllergy = {
      id: 'al-1',
      patient_id: 'pat-1',
      substance: 'Pénicilline',
      reaction: 'Urticaire',
      severity: 'moderee',
      criticality: 'high',
    };
    const fhir = allergyToFHIR(allergy);
    expect(fhir.resourceType).toBe('AllergyIntolerance');
    expect((fhir.code as any).text).toBe('Pénicilline');
    expect((fhir.criticality as any)).toBe('high');
  });
});

describe('conditionToFHIR', () => {
  it('génère une Condition FHIR avec code CIM-10', () => {
    const cond: CanonicalCondition = {
      patient_id: 'pat-1',
      code_cim10: 'I21.0',
      code_display: 'Infarctus du myocarde antérieur aigu',
      category: 'diagnostic_actuel',
    };
    const fhir = conditionToFHIR(cond);
    expect(fhir.resourceType).toBe('Condition');
    const coding = (fhir.code as any).coding[0];
    expect(coding.system).toBe('http://hl7.org/fhir/sid/icd-10');
    expect(coding.code).toBe('I21.0');
  });
});

describe('encounterBundleToFHIR', () => {
  it('génère un Bundle FHIR complet', () => {
    const data: FullEncounterData = {
      patient: mockPatient,
      encounter: mockEncounter,
      vitals: [mockVitals],
      prescriptions: [],
      administrations: [],
      procedures: [],
      results: [],
      allergies: [{ patient_id: 'pat-1', substance: 'Pénicilline' }],
      conditions: [],
      transmissions: [],
      documents: [],
    };
    const bundle = encounterBundleToFHIR(data);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBeGreaterThan(0);
  });

  it('compte correctement les ressources par type', () => {
    const data: FullEncounterData = {
      patient: mockPatient,
      encounter: mockEncounter,
      vitals: [mockVitals],
      prescriptions: [],
      administrations: [],
      procedures: [],
      results: [],
      allergies: [],
      conditions: [],
      transmissions: [],
      documents: [],
    };
    const bundle = encounterBundleToFHIR(data);
    const counts = countBundleResources(bundle);
    expect(counts['Patient']).toBe(1);
    expect(counts['Encounter']).toBe(1);
    expect(counts['Observation']).toBe(8); // 8 vital signs
  });
});
