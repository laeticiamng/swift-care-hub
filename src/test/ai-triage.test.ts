/**
 * Tests unitaires — Module AI Triage
 * Vérifie le moteur de suggestion de triage
 */
import { describe, it, expect } from 'vitest';
import { calculateTriageSuggestion, type TriageInput } from '@/lib/ai-triage';

const baseInput: TriageInput = {
  age_years: 50,
  sexe: 'M',
  motif_principal: '',
  symptomes: [],
};

describe('calculateTriageSuggestion — CIMU 1 (urgence vitale)', () => {
  it('GCS < 9 → CIMU 1', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Malaise',
      constantes: { gcs: 7 },
    });
    expect(result.cimu_suggere).toBe(1);
    expect(result.zone_suggeree).toBe('dechoc');
  });

  it('PAS < 70 → CIMU 1', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Malaise',
      constantes: { pas: 60 },
    });
    expect(result.cimu_suggere).toBe(1);
  });

  it('SpO2 < 85% → CIMU 1', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Dyspnée',
      constantes: { spo2: 80 },
    });
    expect(result.cimu_suggere).toBe(1);
  });

  it('Arrivée SMUR → CIMU 1', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Polytraumatisé',
      mode_arrivee: 'smur',
    });
    expect(result.cimu_suggere).toBe(1);
  });
});

describe('calculateTriageSuggestion — CIMU 2 (urgence vraie)', () => {
  it('Douleur thoracique > 35 ans → CIMU 2', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      age_years: 55,
      motif_principal: 'Douleur thoracique',
    });
    expect(result.cimu_suggere).toBe(2);
    expect(result.examens_suggeres).toContain('ECG 12 dérivations');
    expect(result.examens_suggeres).toContain('Troponine');
  });

  it('Déficit neurologique → CIMU 2 + zone déchocage', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Hémiplégie droite brutale',
      symptomes: ['deficit neurologique', 'aphasie'],
    });
    expect(result.cimu_suggere).toBe(2);
    expect(result.zone_suggeree).toBe('dechoc');
  });

  it('EVA ≥ 8 → CIMU 2', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Colique néphrétique',
      constantes: { eva: 9 },
    });
    expect(result.cimu_suggere).toBe(2);
  });
});

describe('calculateTriageSuggestion — CIMU 3 (urgence relative)', () => {
  it('Douleur abdominale → CIMU 3 + bilan', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Douleur abdominale',
    });
    expect(result.cimu_suggere).toBe(3);
    expect(result.examens_suggeres.length).toBeGreaterThan(0);
  });

  it('Femme en âge de procréer + douleur abdo → Beta-HCG suggéré', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      age_years: 28,
      sexe: 'F',
      motif_principal: 'Douleur abdominale',
    });
    expect(result.examens_suggeres).toContain('Beta-HCG');
  });

  it('Fracture → CIMU 3 + zone trauma', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Fracture poignet après chute',
    });
    expect(result.cimu_suggere).toBe(3);
    expect(result.zone_suggeree).toBe('trauma');
  });
});

describe('calculateTriageSuggestion — CIMU 4-5', () => {
  it('Plaie simple → CIMU 4', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Plaie doigt',
    });
    expect(result.cimu_suggere).toBe(4);
    expect(result.zone_suggeree).toBe('consultation');
  });

  it('Renouvellement ordonnance → CIMU 5', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Renouvellement ordonnance',
    });
    expect(result.cimu_suggere).toBe(5);
  });
});

describe('calculateTriageSuggestion — Scores cliniques', () => {
  it('calcule le score NEWS', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Malaise',
      constantes: { fc: 110, pas: 95, spo2: 93, temperature: 38.5, fr: 24, gcs: 15 },
    });
    const news = result.scores_calcules.find(s => s.nom === 'NEWS');
    expect(news).toBeDefined();
    expect(typeof news!.valeur).toBe('number');
    expect(news!.valeur).toBeGreaterThan(0);
  });

  it('calcule le qSOFA', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Fièvre',
      constantes: { fc: 120, pas: 85, fr: 24, gcs: 14, temperature: 39.5 },
    });
    const qsofa = result.scores_calcules.find(s => s.nom === 'qSOFA');
    expect(qsofa).toBeDefined();
    expect(qsofa!.valeur).toBeGreaterThanOrEqual(2); // PAS≤100 + FR≥22 + GCS<15
  });

  it('NEWS élevé ajuste le CIMU', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Malaise général',
      constantes: { fc: 135, pas: 85, spo2: 88, temperature: 35, fr: 28, gcs: 13 },
    });
    expect(result.cimu_suggere).toBeLessThanOrEqual(2);
  });
});

describe('calculateTriageSuggestion — Alertes spécifiques', () => {
  it('Hypoglycémie sévère → alerte', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Malaise',
      constantes: { glycemie: 0.4 },
    });
    expect(result.alertes.some(a => a.includes('Hypoglycémie'))).toBe(true);
  });

  it('Nourrisson fébrile → alerte + bilans', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      age_years: 1,
      motif_principal: 'Fièvre',
      constantes: { temperature: 39 },
    });
    expect(result.alertes.some(a => a.includes('Nourrisson'))).toBe(true);
    expect(result.examens_suggeres).toContain('Hémocultures');
  });

  it('Patient > 75 ans → alerte fragilité', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      age_years: 82,
      motif_principal: 'Chute',
    });
    expect(result.alertes.some(a => a.includes('75 ans'))).toBe(true);
  });
});

describe('calculateTriageSuggestion — Structure de la réponse', () => {
  it('retourne toujours une structure complète', () => {
    const result = calculateTriageSuggestion({
      ...baseInput,
      motif_principal: 'Test',
    });
    expect(result.cimu_suggere).toBeGreaterThanOrEqual(1);
    expect(result.cimu_suggere).toBeLessThanOrEqual(5);
    expect(result.cimu_justification).toBeTruthy();
    expect(result.zone_suggeree).toBeTruthy();
    expect(Array.isArray(result.diagnostics_differentiels)).toBe(true);
    expect(Array.isArray(result.examens_suggeres)).toBe(true);
    expect(Array.isArray(result.alertes)).toBe(true);
    expect(Array.isArray(result.scores_calcules)).toBe(true);
    expect(Array.isArray(result.orientations_possibles)).toBe(true);
    expect(result.gravite_score).toBeGreaterThanOrEqual(0);
    expect(result.gravite_score).toBeLessThanOrEqual(100);
  });
});
