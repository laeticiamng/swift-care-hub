import { describe, it, expect } from 'vitest';
import {
  findATCCode,
  LOINC_VITALS,
  ATC_URGENCES,
  mapEncounterStatusToFHIR,
  mapPrescriptionStatusToFHIR,
  mapServiceStatusToFHIR,
  mapExamCategoryToFHIR,
  CIMU_CODES,
  CCMU_CODES,
  ESTABLISHMENT,
} from '@/lib/interop/coding-systems';

describe('findATCCode', () => {
  it('finds the ATC code for Paracetamol', () => {
    const result = findATCCode('Paracetamol');
    expect(result).toBeDefined();
    expect(result!.code).toBe('N02BE01');
    expect(result!.display).toBe('Paracetamol');
  });

  it('finds the ATC code for Morphine', () => {
    const result = findATCCode('Morphine');
    expect(result).toBeDefined();
    expect(result!.code).toBe('N02AA01');
  });

  it('finds the ATC code for Amoxicilline', () => {
    const result = findATCCode('Amoxicilline');
    expect(result).toBeDefined();
    expect(result!.code).toBe('J01CA04');
  });

  it('finds the ATC code case-insensitively', () => {
    const result = findATCCode('paracetamol');
    expect(result).toBeDefined();
    expect(result!.code).toBe('N02BE01');
  });

  it('finds the ATC code for medication with accent variation', () => {
    const result = findATCCode('Ketoprofene');
    expect(result).toBeDefined();
    expect(result!.code).toBe('M01AE03');
  });

  it('returns undefined for an unknown medication', () => {
    const result = findATCCode('Unicornium');
    expect(result).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    const result = findATCCode('');
    expect(result).toBeUndefined();
  });
});

describe('LOINC_VITALS', () => {
  it('has all expected vital sign keys', () => {
    const expectedKeys = ['fc', 'pas', 'pad', 'spo2', 'temperature', 'fr', 'gcs', 'eva'];
    for (const key of expectedKeys) {
      expect(LOINC_VITALS).toHaveProperty(key);
    }
  });

  it('has correct LOINC code for heart rate (fc)', () => {
    expect(LOINC_VITALS.fc.code).toBe('8867-4');
    expect(LOINC_VITALS.fc.unit).toBe('/min');
  });

  it('has correct LOINC code for SpO2', () => {
    expect(LOINC_VITALS.spo2.code).toBe('2708-6');
    expect(LOINC_VITALS.spo2.unit).toBe('%');
  });

  it('has correct LOINC code for temperature', () => {
    expect(LOINC_VITALS.temperature.code).toBe('8310-5');
    expect(LOINC_VITALS.temperature.unit).toBe('Cel');
  });

  it('has correct LOINC code for GCS', () => {
    expect(LOINC_VITALS.gcs.code).toBe('9269-2');
  });
});

describe('mapEncounterStatusToFHIR', () => {
  it('maps planned to planned', () => {
    expect(mapEncounterStatusToFHIR('planned')).toBe('planned');
  });

  it('maps arrived to arrived', () => {
    expect(mapEncounterStatusToFHIR('arrived')).toBe('arrived');
  });

  it('maps in-progress to in-progress', () => {
    expect(mapEncounterStatusToFHIR('in-progress')).toBe('in-progress');
  });

  it('maps finished to finished', () => {
    expect(mapEncounterStatusToFHIR('finished')).toBe('finished');
  });

  it('maps unknown status to "unknown"', () => {
    expect(mapEncounterStatusToFHIR('nonexistent')).toBe('unknown');
  });
});

describe('mapPrescriptionStatusToFHIR', () => {
  it('maps active to active', () => {
    expect(mapPrescriptionStatusToFHIR('active')).toBe('active');
  });

  it('maps completed to completed', () => {
    expect(mapPrescriptionStatusToFHIR('completed')).toBe('completed');
  });

  it('maps cancelled to cancelled', () => {
    expect(mapPrescriptionStatusToFHIR('cancelled')).toBe('cancelled');
  });

  it('maps suspended to on-hold', () => {
    expect(mapPrescriptionStatusToFHIR('suspended')).toBe('on-hold');
  });

  it('maps unknown status to "unknown"', () => {
    expect(mapPrescriptionStatusToFHIR('xyz')).toBe('unknown');
  });
});

describe('mapServiceStatusToFHIR', () => {
  it('maps cancelled to revoked', () => {
    expect(mapServiceStatusToFHIR('cancelled')).toBe('revoked');
  });

  it('maps active to active', () => {
    expect(mapServiceStatusToFHIR('active')).toBe('active');
  });
});

describe('mapExamCategoryToFHIR', () => {
  it('maps exam_bio to laboratory', () => {
    expect(mapExamCategoryToFHIR('exam_bio')).toBe('laboratory');
  });

  it('maps exam_imagerie to imaging', () => {
    expect(mapExamCategoryToFHIR('exam_imagerie')).toBe('imaging');
  });

  it('maps exam_ecg to cardiology', () => {
    expect(mapExamCategoryToFHIR('exam_ecg')).toBe('cardiology');
  });

  it('maps unknown type to other', () => {
    expect(mapExamCategoryToFHIR('unknown')).toBe('other');
  });
});

describe('Reference data constants', () => {
  it('CIMU_CODES has entries for levels 1 through 5', () => {
    expect(Object.keys(CIMU_CODES)).toHaveLength(5);
    for (let i = 1; i <= 5; i++) {
      expect(CIMU_CODES[i]).toBeDefined();
      expect(CIMU_CODES[i].display).toBeDefined();
      expect(CIMU_CODES[i].color).toBeDefined();
    }
  });

  it('CCMU_CODES has expected entries', () => {
    expect(CCMU_CODES['1']).toBeDefined();
    expect(CCMU_CODES['5']).toBeDefined();
    expect(CCMU_CODES['P']).toBeDefined();
    expect(CCMU_CODES['D']).toBeDefined();
  });

  it('ESTABLISHMENT has required fields', () => {
    expect(ESTABLISHMENT.name).toBeDefined();
    expect(ESTABLISHMENT.finess).toBeDefined();
    expect(ESTABLISHMENT.site_code).toBeDefined();
    expect(ESTABLISHMENT.oid).toBeDefined();
  });

  it('ATC_URGENCES has common emergency medications', () => {
    expect(ATC_URGENCES.paracetamol).toBeDefined();
    expect(ATC_URGENCES.morphine).toBeDefined();
    expect(ATC_URGENCES.salbutamol).toBeDefined();
    expect(ATC_URGENCES.nacl).toBeDefined();
  });
});
