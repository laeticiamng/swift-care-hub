import { describe, it, expect } from 'vitest';
import {
  PRESCRIPTION_TYPES,
  PRESCRIPTION_TYPE_LABELS,
  PRESCRIPTION_TYPE_GROUPS,
  parsePrescriptionMeta,
  encodePrescriptionMeta,
  getPancarteSection,
  hasAdminAction,
  PANCARTE_SECTION_ORDER,
  PANCARTE_SECTION_LABELS,
  EXAM_BIO_CATEGORIES,
  EXAM_IMAGERIE_CATEGORIES,
  AVIS_SPECIALTIES,
  O2_DEVICES,
  type PrescriptionMetadata,
} from '@/lib/prescription-types';

describe('PRESCRIPTION_TYPES constants', () => {
  it('has all expected prescription types', () => {
    expect(PRESCRIPTION_TYPES).toContain('medicament');
    expect(PRESCRIPTION_TYPES).toContain('perfusion');
    expect(PRESCRIPTION_TYPES).toContain('titration');
    expect(PRESCRIPTION_TYPES).toContain('conditionnel');
    expect(PRESCRIPTION_TYPES).toContain('oxygene');
    expect(PRESCRIPTION_TYPES).toContain('exam_bio');
    expect(PRESCRIPTION_TYPES).toContain('exam_imagerie');
    expect(PRESCRIPTION_TYPES).toContain('surveillance');
    expect(PRESCRIPTION_TYPES).toContain('avis_specialise');
    expect(PRESCRIPTION_TYPES).toContain('sortie');
  });

  it('has a label for every prescription type', () => {
    for (const type of PRESCRIPTION_TYPES) {
      expect(PRESCRIPTION_TYPE_LABELS[type]).toBeDefined();
      expect(typeof PRESCRIPTION_TYPE_LABELS[type]).toBe('string');
    }
  });

  it('groups cover all prescription types', () => {
    const allGroupedTypes = PRESCRIPTION_TYPE_GROUPS.flatMap(g => g.types);
    for (const type of PRESCRIPTION_TYPES) {
      expect(allGroupedTypes).toContain(type);
    }
  });
});

describe('parsePrescriptionMeta', () => {
  it('parses valid JSON metadata from notes', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Morphine',
      notes: JSON.stringify({ type: 'titration', titration_dose_init: 2, titration_dose_max: 10 }),
    });
    expect(meta.type).toBe('titration');
    expect(meta.titration_dose_init).toBe(2);
    expect(meta.titration_dose_max).toBe(10);
  });

  it('detects exam_bio from medication name heuristic (NFS)', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'NFS + Iono',
      notes: null,
    });
    expect(meta.type).toBe('exam_bio');
  });

  it('detects exam_imagerie from medication name heuristic (Scanner)', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Scanner abdo-pelvien',
      notes: null,
    });
    expect(meta.type).toBe('exam_imagerie');
  });

  it('detects ECG from medication name', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'ECG 12 derivations',
      notes: null,
    });
    expect(meta.type).toBe('exam_ecg');
  });

  it('detects perfusion from NaCl name', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'NaCl 0.9% 1000mL',
      notes: null,
    });
    expect(meta.type).toBe('perfusion');
  });

  it('detects oxygene from medication name', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Oxygenotherapie',
      notes: null,
    });
    expect(meta.type).toBe('oxygene');
  });

  it('detects surveillance from medication name', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Scope continu',
      notes: null,
    });
    expect(meta.type).toBe('surveillance');
  });

  it('detects conditionnel from frequency containing "si "', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Paracetamol',
      notes: null,
      frequency: 'si EVA > 4',
    });
    expect(meta.type).toBe('conditionnel');
  });

  it('defaults to medicament for unrecognized medication', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'SomeUnknownDrug',
      notes: null,
    });
    expect(meta.type).toBe('medicament');
  });

  it('handles legacy [type:soins] format', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Surveillance',
      notes: '[type:soins]',
    });
    expect(meta.type).toBe('surveillance');
  });

  it('handles legacy [TYPE:examens_bio] format', () => {
    const meta = parsePrescriptionMeta({
      medication_name: 'Bio',
      notes: '[TYPE:examens_bio]',
    });
    expect(meta.type).toBe('exam_bio');
  });
});

describe('encodePrescriptionMeta', () => {
  it('serializes metadata to JSON string', () => {
    const meta: PrescriptionMetadata = { type: 'medicament' };
    const encoded = encodePrescriptionMeta(meta);
    expect(JSON.parse(encoded)).toEqual({ type: 'medicament' });
  });

  it('preserves all metadata fields', () => {
    const meta: PrescriptionMetadata = {
      type: 'conditionnel',
      condition_trigger: 'si EVA > 6',
      condition_max_doses: 3,
    };
    const decoded = JSON.parse(encodePrescriptionMeta(meta));
    expect(decoded.condition_trigger).toBe('si EVA > 6');
    expect(decoded.condition_max_doses).toBe(3);
  });
});

describe('getPancarteSection', () => {
  it('maps oxygene to oxygene_surveillance', () => {
    expect(getPancarteSection({ type: 'oxygene' })).toBe('oxygene_surveillance');
  });

  it('maps surveillance to oxygene_surveillance', () => {
    expect(getPancarteSection({ type: 'surveillance' })).toBe('oxygene_surveillance');
  });

  it('maps perfusion to perfusions', () => {
    expect(getPancarteSection({ type: 'perfusion' })).toBe('perfusions');
  });

  it('maps exam_bio to examens', () => {
    expect(getPancarteSection({ type: 'exam_bio' })).toBe('examens');
  });

  it('maps medicament to medicaments', () => {
    expect(getPancarteSection({ type: 'medicament' })).toBe('medicaments');
  });

  it('maps avis_specialise to avis', () => {
    expect(getPancarteSection({ type: 'avis_specialise' })).toBe('avis');
  });

  it('maps regime to consignes', () => {
    expect(getPancarteSection({ type: 'regime' })).toBe('consignes');
  });
});

describe('hasAdminAction', () => {
  it('returns true for medicament', () => {
    expect(hasAdminAction('medicament')).toBe(true);
  });

  it('returns true for perfusion', () => {
    expect(hasAdminAction('perfusion')).toBe(true);
  });

  it('returns false for regime', () => {
    expect(hasAdminAction('regime')).toBe(false);
  });

  it('returns false for mobilisation', () => {
    expect(hasAdminAction('mobilisation')).toBe(false);
  });

  it('returns false for sortie', () => {
    expect(hasAdminAction('sortie')).toBe(false);
  });
});

describe('Reference data arrays', () => {
  it('PANCARTE_SECTION_ORDER has all expected sections', () => {
    expect(PANCARTE_SECTION_ORDER).toContain('medicaments');
    expect(PANCARTE_SECTION_ORDER).toContain('examens');
    expect(PANCARTE_SECTION_ORDER).toContain('perfusions');
    expect(PANCARTE_SECTION_ORDER.length).toBe(8);
  });

  it('PANCARTE_SECTION_LABELS has a label for each section', () => {
    for (const section of PANCARTE_SECTION_ORDER) {
      expect(PANCARTE_SECTION_LABELS[section]).toBeDefined();
    }
  });

  it('EXAM_BIO_CATEGORIES contains Hematologie and Biochimie', () => {
    const labels = EXAM_BIO_CATEGORIES.map(c => c.label);
    expect(labels).toContain('Hematologie');
    expect(labels).toContain('Biochimie');
  });

  it('EXAM_IMAGERIE_CATEGORIES contains Scanner and Echographie', () => {
    const labels = EXAM_IMAGERIE_CATEGORIES.map(c => c.label);
    expect(labels).toContain('Scanner');
    expect(labels).toContain('Echographie');
  });

  it('AVIS_SPECIALTIES includes Cardiologie and Reanimation', () => {
    expect(AVIS_SPECIALTIES).toContain('Cardiologie');
    expect(AVIS_SPECIALTIES).toContain('Reanimation');
  });

  it('O2_DEVICES includes common devices', () => {
    expect(O2_DEVICES).toContain('Lunettes nasales');
    expect(O2_DEVICES).toContain('Masque HC');
  });
});
