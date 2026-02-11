import { describe, it, expect } from 'vitest';
import { detectHomonymy, verifyIdentity, generateIPP, generateNumeroSejour } from '@/lib/homonymy-detection';
import type { PatientIdentity } from '@/lib/sih-types';

function makePatient(overrides: Partial<PatientIdentity> & { id: string; nom: string; prenom: string }): PatientIdentity {
  return {
    date_naissance: '1990-01-01',
    ipp: 'IPP-00000001',
    service: 'Urgences',
    numero_sejour: 'SEJ-2025-000001',
    sexe: 'M',
    ...overrides,
  };
}

describe('detectHomonymy', () => {
  it('detects homonymy when two patients share the same nom and prenom', () => {
    const current = makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' });
    const others = [
      makePatient({ id: 'p2', nom: 'Dupont', prenom: 'Jean' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].patient_a_id).toBe('p1');
    expect(alerts[0].patient_b_id).toBe('p2');
  });

  it('does not flag different patients', () => {
    const current = makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' });
    const others = [
      makePatient({ id: 'p2', nom: 'Martin', prenom: 'Pierre' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(0);
  });

  it('performs case-insensitive detection', () => {
    const current = makePatient({ id: 'p1', nom: 'DUPONT', prenom: 'JEAN' });
    const others = [
      makePatient({ id: 'p2', nom: 'dupont', prenom: 'jean' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(1);
  });

  it('performs accent-insensitive detection', () => {
    const current = makePatient({ id: 'p1', nom: 'Lefevre', prenom: 'Helene' });
    const others = [
      makePatient({ id: 'p2', nom: 'Lefèvre', prenom: 'Hélène' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(1);
  });

  it('skips the current patient from the list (same id)', () => {
    const current = makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' });
    const others = [
      makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(0);
  });

  it('detects multiple homonyms', () => {
    const current = makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' });
    const others = [
      makePatient({ id: 'p2', nom: 'Dupont', prenom: 'Jean' }),
      makePatient({ id: 'p3', nom: 'Dupont', prenom: 'Jean' }),
      makePatient({ id: 'p4', nom: 'Martin', prenom: 'Pierre' }),
    ];
    const alerts = detectHomonymy(current, others);
    expect(alerts).toHaveLength(2);
  });

  it('sets acknowledged to false on new alert', () => {
    const current = makePatient({ id: 'p1', nom: 'Dupont', prenom: 'Jean' });
    const others = [makePatient({ id: 'p2', nom: 'Dupont', prenom: 'Jean' })];
    const alerts = detectHomonymy(current, others);
    expect(alerts[0].acknowledged).toBe(false);
  });
});

describe('verifyIdentity', () => {
  const patient = makePatient({
    id: 'p1',
    nom: 'Dupont',
    prenom: 'Jean',
    date_naissance: '1985-03-15',
    ipp: 'IPP-12345678',
  });

  it('succeeds with nom_ddn method when nom and date_naissance match', () => {
    expect(verifyIdentity(patient, 'Dupont', '1985-03-15', 'nom_ddn')).toBe(true);
  });

  it('succeeds with nom_ddn method (case insensitive nom)', () => {
    expect(verifyIdentity(patient, 'DUPONT', '1985-03-15', 'nom_ddn')).toBe(true);
  });

  it('fails with nom_ddn method when date does not match', () => {
    expect(verifyIdentity(patient, 'Dupont', '1990-01-01', 'nom_ddn')).toBe(false);
  });

  it('succeeds with nom_ipp method when nom and ipp match', () => {
    expect(verifyIdentity(patient, 'Dupont', 'IPP-12345678', 'nom_ipp')).toBe(true);
  });

  it('fails with nom_ipp method when ipp does not match', () => {
    expect(verifyIdentity(patient, 'Dupont', 'IPP-99999999', 'nom_ipp')).toBe(false);
  });

  it('fails when nom does not match regardless of method', () => {
    expect(verifyIdentity(patient, 'Martin', '1985-03-15', 'nom_ddn')).toBe(false);
    expect(verifyIdentity(patient, 'Martin', 'IPP-12345678', 'nom_ipp')).toBe(false);
  });
});

describe('generateIPP', () => {
  it('generates a string starting with IPP-', () => {
    const ipp = generateIPP('abc-def-123');
    expect(ipp).toMatch(/^IPP-/);
  });

  it('is deterministic for the same input', () => {
    expect(generateIPP('patient-1')).toBe(generateIPP('patient-1'));
  });
});

describe('generateNumeroSejour', () => {
  it('generates a string starting with SEJ-', () => {
    const sej = generateNumeroSejour('enc-123');
    expect(sej).toMatch(/^SEJ-/);
  });

  it('includes the current year', () => {
    const sej = generateNumeroSejour('enc-123');
    const year = new Date().getFullYear().toString();
    expect(sej).toContain(year);
  });
});
