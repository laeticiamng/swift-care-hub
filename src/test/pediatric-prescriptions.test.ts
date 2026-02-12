/**
 * Tests unitaires — Module Prescription Pédiatrique
 * Vérifie le calcul de posologie adapté au poids
 */
import { describe, it, expect } from 'vitest';
import {
  calculatePediatricDose,
  estimateWeightByAge,
  calculateAgeMonths,
  isPediatricPatient,
  getAgeGroup,
  getDrugsForAge,
  PEDIATRIC_DRUGS,
  PEDIATRIC_AGE_GROUPS,
} from '@/lib/pediatric-prescriptions';

describe('calculatePediatricDose', () => {
  const paracetamol = PEDIATRIC_DRUGS.find(d => d.name === 'Paracétamol')!;
  const ibuprofene = PEDIATRIC_DRUGS.find(d => d.name === 'Ibuprofène')!;
  const adrenaline = PEDIATRIC_DRUGS.find(d => d.name.includes('Adrénaline'))!;

  it('calcule la bonne dose de paracétamol (15mg/kg)', () => {
    const result = calculatePediatricDose(paracetamol, 10);
    expect(result.calculated_dose).toBe(150); // 15 * 10
    expect(result.capped).toBe(false);
    expect(result.contraindicated).toBe(false);
  });

  it('plafonne la dose au maximum (paracétamol > 66kg)', () => {
    const result = calculatePediatricDose(paracetamol, 70);
    expect(result.calculated_dose).toBe(1000); // max 1000mg
    expect(result.capped).toBe(true);
    expect(result.warnings.some(w => w.includes('plafonnée'))).toBe(true);
  });

  it('signale une contre-indication ibuprofène < 3 mois', () => {
    const result = calculatePediatricDose(ibuprofene, 5, 2);
    expect(result.contraindicated).toBe(true);
    expect(result.contraindication_reason).toContain('3 mois');
  });

  it('autorise ibuprofène ≥ 3 mois', () => {
    const result = calculatePediatricDose(ibuprofene, 8, 6);
    expect(result.contraindicated).toBe(false);
    expect(result.calculated_dose).toBe(80); // 10 * 8
  });

  it('détecte une allergie comme contre-indication', () => {
    const amox = PEDIATRIC_DRUGS.find(d => d.name === 'Amoxicilline')!;
    const result = calculatePediatricDose(amox, 15, 36, ['allergie pénicilline']);
    expect(result.contraindicated).toBe(true);
    expect(result.contraindication_reason).toContain('pénicilline');
  });

  it('calcule l\'adrénaline IM correctement (0.01mg/kg)', () => {
    const result = calculatePediatricDose(adrenaline, 25);
    expect(result.calculated_dose).toBe(0.25); // 0.01 * 25
    expect(result.capped).toBe(false);
  });

  it('plafonne l\'adrénaline à 0.5mg', () => {
    const result = calculatePediatricDose(adrenaline, 60);
    expect(result.calculated_dose).toBe(0.5);
    expect(result.capped).toBe(true);
  });

  it('signale un poids anormalement bas', () => {
    const result = calculatePediatricDose(paracetamol, 0.5);
    expect(result.warnings.some(w => w.includes('< 1 kg'))).toBe(true);
  });

  it('signale un poids > 40 kg avec dose max', () => {
    const result = calculatePediatricDose(paracetamol, 80);
    expect(result.warnings.some(w => w.includes('40 kg'))).toBe(true);
  });
});

describe('estimateWeightByAge', () => {
  it('retourne ~3.5 kg pour un nouveau-né', () => {
    expect(estimateWeightByAge(0)).toBeCloseTo(3.5, 0);
  });

  it('retourne ~8-10 kg pour un nourrisson de 12 mois', () => {
    const weight = estimateWeightByAge(12);
    expect(weight).toBeGreaterThanOrEqual(8);
    expect(weight).toBeLessThanOrEqual(12);
  });

  it('retourne ~18-22 kg pour un enfant de 5 ans (60 mois)', () => {
    const weight = estimateWeightByAge(60);
    expect(weight).toBeGreaterThanOrEqual(17);
    expect(weight).toBeLessThanOrEqual(25);
  });

  it('est monotone croissante', () => {
    let prev = 0;
    for (let m = 0; m <= 216; m += 12) {
      const w = estimateWeightByAge(m);
      expect(w).toBeGreaterThanOrEqual(prev);
      prev = w;
    }
  });
});

describe('calculateAgeMonths', () => {
  it('calcule les mois depuis la naissance', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const months = calculateAgeMonths(oneYearAgo.toISOString().slice(0, 10));
    expect(months).toBe(12);
  });
});

describe('isPediatricPatient', () => {
  it('retourne true pour un enfant', () => {
    const child = new Date();
    child.setFullYear(child.getFullYear() - 5);
    expect(isPediatricPatient(child.toISOString().slice(0, 10))).toBe(true);
  });

  it('retourne false pour un adulte', () => {
    const adult = new Date();
    adult.setFullYear(adult.getFullYear() - 30);
    expect(isPediatricPatient(adult.toISOString().slice(0, 10))).toBe(false);
  });
});

describe('getAgeGroup', () => {
  it('retourne Nouveau-né pour 0 mois', () => {
    const group = getAgeGroup(0);
    expect(group?.label).toContain('Nouveau-né');
  });

  it('retourne Nourrisson pour 6 mois', () => {
    const group = getAgeGroup(6);
    expect(group?.label).toContain('Nourrisson');
  });

  it('retourne Adolescent pour 180 mois (15 ans)', () => {
    const group = getAgeGroup(180);
    expect(group?.label).toContain('Adolescent');
  });
});

describe('getDrugsForAge', () => {
  it('exclut ibuprofène pour 2 mois', () => {
    const drugs = getDrugsForAge(2);
    expect(drugs.find(d => d.name === 'Ibuprofène')).toBeUndefined();
  });

  it('inclut ibuprofène pour 6 mois', () => {
    const drugs = getDrugsForAge(6);
    expect(drugs.find(d => d.name === 'Ibuprofène')).toBeDefined();
  });

  it('inclut paracétamol pour tous les âges', () => {
    for (const age of [0, 6, 36, 120, 180]) {
      const drugs = getDrugsForAge(age);
      expect(drugs.find(d => d.name === 'Paracétamol')).toBeDefined();
    }
  });
});

describe('PEDIATRIC_DRUGS — cohérence', () => {
  it('chaque médicament a les champs requis', () => {
    for (const drug of PEDIATRIC_DRUGS) {
      expect(drug.name).toBeTruthy();
      expect(drug.dose_per_kg).toBeGreaterThan(0);
      expect(drug.max_dose).toBeGreaterThan(0);
      expect(drug.route).toBeTruthy();
    }
  });

  it('la dose max est toujours ≥ dose/kg pour 1 kg', () => {
    for (const drug of PEDIATRIC_DRUGS) {
      expect(drug.max_dose).toBeGreaterThanOrEqual(drug.dose_per_kg);
    }
  });
});

describe('PEDIATRIC_AGE_GROUPS — cohérence', () => {
  it('les tranches sont contiguës et couvrent 0-216 mois', () => {
    const sorted = [...PEDIATRIC_AGE_GROUPS].sort((a, b) => a.min_months - b.min_months);
    expect(sorted[0].min_months).toBe(0);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min_months).toBe(sorted[i - 1].max_months);
    }
    expect(sorted[sorted.length - 1].max_months).toBe(216);
  });
});
