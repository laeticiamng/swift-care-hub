/**
 * Tests unitaires — Module lab-alerts
 * Vérifie la détection des seuils critiques biologiques et escalation
 */
import { describe, it, expect } from 'vitest';
import {
  checkCriticalThreshold,
  getNextEscalationLevel,
  getEscalationTimeout,
  getEscalationLabel,
  verifyLabResultIPP,
  isElectrolyteMedication,
  formatLabValue,
  getLabValueColor,
} from '@/lib/lab-alerts';

describe('checkCriticalThreshold', () => {
  it('détecte une kaliémie critique haute (> 6.0)', () => {
    const result = checkCriticalThreshold('potassium', 6.5);
    expect(result.isCritical).toBe(true);
    expect(result.exceeded).toBe('high');
  });

  it('détecte une kaliémie critique basse (< 2.5)', () => {
    const result = checkCriticalThreshold('potassium', 2.0);
    expect(result.isCritical).toBe(true);
    expect(result.exceeded).toBe('low');
  });

  it('ne déclenche pas d\'alerte pour une kaliémie normale (4.0)', () => {
    const result = checkCriticalThreshold('potassium', 4.0);
    expect(result.isCritical).toBe(false);
  });

  it('détecte une troponine critique haute', () => {
    const result = checkCriticalThreshold('troponine', 100);
    expect(result.isCritical).toBe(true);
    expect(result.exceeded).toBe('high');
  });

  it('retourne false pour un analyte inconnu', () => {
    const result = checkCriticalThreshold('analyte_inexistant', 999);
    expect(result.isCritical).toBe(false);
  });

  it('retourne false si la valeur est dans les normes', () => {
    const result = checkCriticalThreshold('sodium', 140);
    expect(result.isCritical).toBe(false);
  });
});

describe('getNextEscalationLevel', () => {
  it('retourne niveau 2 après niveau 1', () => {
    expect(getNextEscalationLevel(1)).toBe(2);
  });

  it('retourne niveau 3 après niveau 2', () => {
    expect(getNextEscalationLevel(2)).toBe(3);
  });

  it('retourne null après niveau 3 (maximum atteint)', () => {
    expect(getNextEscalationLevel(3)).toBe(null);
  });
});

describe('getEscalationTimeout', () => {
  it('retourne 5 min (300000ms) pour niveau 1', () => {
    expect(getEscalationTimeout(1)).toBe(300_000);
  });

  it('retourne 10 min (600000ms) pour niveau 2', () => {
    expect(getEscalationTimeout(2)).toBe(600_000);
  });

  it('retourne 15 min (900000ms) pour niveau 3', () => {
    expect(getEscalationTimeout(3)).toBe(900_000);
  });
});

describe('getEscalationLabel', () => {
  it('retourne "Rappel prescripteur" pour niveau 1', () => {
    expect(getEscalationLabel(1)).toBe('Rappel prescripteur');
  });

  it('retourne "Notification senior" pour niveau 2', () => {
    expect(getEscalationLabel(2)).toBe('Notification senior');
  });

  it('retourne "Alerte chef de garde" pour niveau 3', () => {
    expect(getEscalationLabel(3)).toBe('Alerte chef de garde');
  });
});

describe('verifyLabResultIPP', () => {
  it('valide des IPP identiques', () => {
    expect(verifyLabResultIPP('IPP-001', 'IPP-001')).toBe(true);
  });

  it('valide avec espaces en trop', () => {
    expect(verifyLabResultIPP('  IPP-001 ', 'IPP-001')).toBe(true);
  });

  it('rejette des IPP différents', () => {
    expect(verifyLabResultIPP('IPP-001', 'IPP-002')).toBe(false);
  });
});

describe('isElectrolyteMedication', () => {
  it('détecte le potassium (K+)', () => {
    const result = isElectrolyteMedication('Potassium KCl 10%');
    expect(result.isElectrolyte).toBe(true);
    expect(result.type).toBe('K');
  });

  it('détecte le calcium (Ca2+)', () => {
    const result = isElectrolyteMedication('Gluconate de calcium');
    expect(result.isElectrolyte).toBe(true);
    expect(result.type).toBe('Ca');
  });

  it('détecte le sodium (Na+)', () => {
    const result = isElectrolyteMedication('NaCl 0.9%');
    expect(result.isElectrolyte).toBe(true);
    expect(result.type).toBe('Na');
  });

  it('ne détecte pas le paracétamol comme électrolyte', () => {
    const result = isElectrolyteMedication('Paracétamol 1g');
    expect(result.isElectrolyte).toBe(false);
    expect(result.type).toBeUndefined();
  });

  it('détecte Diffu-K comme potassium', () => {
    const result = isElectrolyteMedication('Diffu-K 600mg');
    expect(result.isElectrolyte).toBe(true);
    expect(result.type).toBe('K');
  });
});

describe('formatLabValue', () => {
  it('formate correctement une valeur biologique', () => {
    expect(formatLabValue(4.2, 'mmol/L', 'Potassium')).toBe('Potassium: 4.2 mmol/L');
  });
});

describe('getLabValueColor', () => {
  it('retourne rouge pour une valeur critique', () => {
    const color = getLabValueColor('potassium', 7.0);
    expect(color).toContain('red');
  });

  it('retourne couleur normale pour une valeur dans les normes', () => {
    const color = getLabValueColor('sodium', 140);
    expect(color).toBe('text-foreground');
  });
});
