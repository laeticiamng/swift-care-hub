/**
 * Tests unitaires — Module RPU Export
 * Vérifie l'export RPU conforme ATIH
 */
import { describe, it, expect } from 'vitest';
import {
  validateRPU,
  encounterToRPU,
  rpuToXML,
  rpuToCSV,
  rpuBatchToXML,
  type RPURecord,
} from '@/lib/rpu-export';
import type { FullEncounterData } from '@/lib/interop/canonical-model';

const makeFullEncounterData = (): FullEncounterData => ({
  patient: {
    id: 'pat-1',
    nom: 'DUPONT',
    prenom: 'Jean',
    date_naissance: '1985-03-15',
    sexe: 'M',
    adresse: '12 rue de Paris, 75001 Paris',
  },
  encounter: {
    id: 'enc-1',
    patient_id: 'pat-1',
    status: 'finished',
    arrival_time: '2024-01-15T10:30:00Z',
    discharge_time: '2024-01-15T18:00:00Z',
    motif_sfmu: 'Douleur thoracique',
    cimu: 2,
    ccmu: 3,
    gemsa: 4,
    discharge_destination: 'domicile',
  },
  vitals: [],
  prescriptions: [],
  administrations: [],
  procedures: [{ id: 'proc-1', encounter_id: 'enc-1', patient_id: 'pat-1', procedure_type: 'ECG', code: 'DEQP003' }],
  results: [],
  allergies: [],
  conditions: [
    { patient_id: 'pat-1', encounter_id: 'enc-1', code_cim10: 'I21.0', code_display: 'IDM', category: 'diagnostic_actuel', verification_status: 'confirmed' },
  ],
  transmissions: [],
  documents: [],
});

describe('encounterToRPU', () => {
  it('convertit un encounter en RPU Record', () => {
    const rpu = encounterToRPU(makeFullEncounterData());

    expect(rpu.motif_recours).toBe('Douleur thoracique');
    expect(rpu.gravite).toBe('3'); // ccmu
    expect(rpu.sexe).toBe('M');
    expect(rpu.date_naissance).toBe('1985-03-15');
    expect(rpu.dp).toBe('I21.0');
    expect(rpu.cimu).toBe(2);
    expect(rpu.gemsa).toBe(4);
  });

  it('extrait le code postal de l\'adresse', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    expect(rpu.cp).toBe('75001');
  });

  it('calcule l\'âge du patient', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    expect(rpu.age).toBeGreaterThan(30);
    expect(rpu.age).toBeLessThan(50);
  });

  it('extrait les actes CCAM', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    expect(rpu.actes_ccam).toContain('DEQP003');
  });
});

describe('validateRPU', () => {
  const makeValidRPU = (): RPURecord => ({
    finess: '750000001',
    date_entree: '2024-01-15T10:30:00Z',
    mode_entree: '6',
    provenance: '5',
    motif_recours: 'Douleur thoracique',
    gravite: '3',
    date_naissance: '1985-03-15',
    sexe: 'M',
    age: 39,
    numero_passage: 'enc-1',
    cp: '75001',
  });

  it('valide un RPU complet et correct', () => {
    const result = validateRPU(makeValidRPU());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('signale un FINESS manquant', () => {
    const rpu = { ...makeValidRPU(), finess: '' };
    const result = validateRPU(rpu);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('FINESS'))).toBe(true);
  });

  it('signale un sexe invalide', () => {
    const rpu = { ...makeValidRPU(), sexe: 'X' as any };
    const result = validateRPU(rpu);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('SEXE'))).toBe(true);
  });

  it('signale un CIMU invalide', () => {
    const rpu = { ...makeValidRPU(), cimu: 9 };
    const result = validateRPU(rpu);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('CIMU'))).toBe(true);
  });

  it('signale une gravité manquante', () => {
    const rpu = { ...makeValidRPU(), gravite: '' };
    const result = validateRPU(rpu);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('GRAVITE'))).toBe(true);
  });

  it('signale une date de sortie antérieure à l\'entrée', () => {
    const rpu = { ...makeValidRPU(), date_sortie: '2024-01-14T08:00:00Z' };
    const result = validateRPU(rpu);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('anterieure'))).toBe(true);
  });

  it('avertit si durée > 72h', () => {
    const rpu = { ...makeValidRPU(), date_sortie: '2024-01-20T10:30:00Z' };
    const result = validateRPU(rpu);
    expect(result.warnings.some(w => w.includes('72h'))).toBe(true);
  });
});

describe('rpuToXML', () => {
  it('génère du XML avec l\'en-tête', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    const xml = rpuToXML(rpu);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<RPU');
    expect(xml).toContain('<FINESS>');
    expect(xml).toContain('</RPU>');
  });

  it('inclut les champs obligatoires', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    const xml = rpuToXML(rpu);
    expect(xml).toContain('<SEXE>M</SEXE>');
    expect(xml).toContain('<MOTIF_RECOURS>');
    expect(xml).toContain('<GRAVITE>');
  });
});

describe('rpuBatchToXML', () => {
  it('génère du XML batch avec racine PASSAGES', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    const xml = rpuBatchToXML([rpu]);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<PASSAGES');
    expect(xml).toContain('<PASSAGE');
  });
});

describe('rpuToCSV', () => {
  it('génère du CSV avec un header', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    const csv = rpuToCSV([rpu]);
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(2); // header + 1 data row
    expect(lines[0]).toContain('FINESS');
    expect(lines[0]).toContain('SEXE');
  });

  it('sépare les colonnes par point-virgule', () => {
    const rpu = encounterToRPU(makeFullEncounterData());
    const csv = rpuToCSV([rpu]);
    const lines = csv.trim().split('\n');
    expect(lines[0].split(';').length).toBeGreaterThan(10);
  });
});
