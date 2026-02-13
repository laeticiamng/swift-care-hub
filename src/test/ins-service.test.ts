/**
 * Tests unitaires — Module INS (Identité Nationale de Santé)
 * Vérifie le calcul de clé NIR, la validation de format et la qualification
 */
import { describe, it, expect } from 'vitest';
import {
  calculateNIRKey,
  validateINSFormat,
  qualifyINS,
  crossCheckIdentity,
} from '@/lib/ins-service';

describe('calculateNIRKey', () => {
  it('calcule la clé pour un NIR standard', () => {
    // NIR: 1 85 03 75 123 456 → clé = 97 - (1850375123456 mod 97)
    const key = calculateNIRKey('1850375123456');
    expect(key).toBeGreaterThanOrEqual(0);
    expect(key).toBeLessThanOrEqual(97);
  });

  it('lève une erreur si le NIR n\'a pas 13 caractères', () => {
    expect(() => calculateNIRKey('12345')).toThrow('13');
  });

  it('lève une erreur pour des caractères invalides', () => {
    expect(() => calculateNIRKey('ABCDEFGHIJKLM')).toThrow();
  });

  it('gère les départements corses (2A)', () => {
    const key = calculateNIRKey('185032A123456');
    expect(key).toBeGreaterThanOrEqual(0);
    expect(key).toBeLessThanOrEqual(97);
  });

  it('gère les départements corses (2B)', () => {
    const key = calculateNIRKey('185032B123456');
    expect(key).toBeGreaterThanOrEqual(0);
    expect(key).toBeLessThanOrEqual(97);
  });

  it('retourne un résultat déterministe', () => {
    const a = calculateNIRKey('1850375123456');
    const b = calculateNIRKey('1850375123456');
    expect(a).toBe(b);
  });
});

describe('validateINSFormat', () => {
  it('rejette un INS trop court', () => {
    const result = validateINSFormat('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Longueur');
  });

  it('rejette un premier caractère invalide (ni 1 ni 2)', () => {
    const result = validateINSFormat('385037512345678');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Premier');
  });

  it('rejette un mois invalide (00)', () => {
    const result = validateINSFormat('185007512345678');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Mois');
  });

  it('rejette un mois invalide (13)', () => {
    const result = validateINSFormat('185137512345678');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Mois');
  });

  it('accepte les mois spéciaux (20-42, 99)', () => {
    // These should pass the month check but may fail on key
    const result = validateINSFormat('185207512345678');
    // May fail on key but should not fail on month
    if (!result.valid) {
      expect(result.error).not.toContain('Mois');
    }
  });

  it('tolère les espaces et tirets', () => {
    // Should strip spaces before processing
    const clean = validateINSFormat('1 85 03 75 123 456 78');
    // The stripped version has the right length
    expect(clean.error || '').not.toContain('Longueur');
  });

  it('valide un NIR avec clé correcte', () => {
    // Build a valid INS: body + correct key
    const body = '1850375123456';
    const key = calculateNIRKey(body);
    const ins = body + String(key).padStart(2, '0');
    const result = validateINSFormat(ins);
    expect(result.valid).toBe(true);
  });

  it('rejette un NIR avec clé incorrecte', () => {
    const body = '1850375123456';
    const key = calculateNIRKey(body);
    const wrongKey = (key + 1) % 98;
    const ins = body + String(wrongKey).padStart(2, '0');
    const result = validateINSFormat(ins);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Cle');
  });
});

describe('qualifyINS', () => {
  it('qualifie un patient avec traits complets sans INS → provisoire', async () => {
    const result = await qualifyINS({
      nom: 'DUPONT',
      prenom: 'Jean',
      date_naissance: '1985-03-15',
      sexe: 'M',
    });
    expect(result.status).toBe('provisoire');
    expect(result.ins_numero).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(70);
  });

  it('qualifie un patient avec INS valide → qualifie', async () => {
    const body = '1850375123456';
    const key = calculateNIRKey(body);
    const validINS = body + String(key).padStart(2, '0');

    const result = await qualifyINS({
      nom: 'DUPONT',
      prenom: 'Jean',
      date_naissance: '1985-03-15',
      sexe: 'M',
      ins_numero: validINS,
    });
    expect(result.status).toBe('qualifie');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
  });

  it('marque invalide un patient avec INS au format incorrect', async () => {
    const result = await qualifyINS({
      nom: 'DUPONT',
      prenom: 'Jean',
      date_naissance: '1985-03-15',
      sexe: 'M',
      ins_numero: '12345',
    });
    expect(result.status).toBe('invalide');
    expect(result.confidence).toBe(0);
  });

  it('retourne les traits normalisés', async () => {
    const result = await qualifyINS({
      nom: '  dupont  ',
      prenom: 'jean-pierre',
      date_naissance: '1985-03-15',
      sexe: 'M',
    });
    expect(result.nom_naissance).toBe('DUPONT');
    expect(result.prenoms).toBe('JEAN-PIERRE');
  });
});

describe('crossCheckIdentity', () => {
  const makeResult = (overrides = {}): ReturnType<typeof qualifyINS> extends Promise<infer T> ? T : never => ({
    status: 'qualifie' as const,
    ins_numero: '185037512345645',
    nom_naissance: 'DUPONT',
    prenoms: 'JEAN',
    date_naissance: '1985-03-15',
    sexe: 'M' as const,
    confidence: 90,
    validated_at: new Date().toISOString(),
    ...overrides,
  });

  it('retourne score 100 si identité parfaitement concordante', () => {
    const result = crossCheckIdentity(
      { nom: 'DUPONT', prenom: 'JEAN', date_naissance: '1985-03-15', sexe: 'M' },
      makeResult(),
    );
    expect(result.score).toBe(100);
    expect(result.discrepancies).toEqual([]);
  });

  it('retourne un score réduit si le nom diverge', () => {
    const result = crossCheckIdentity(
      { nom: 'DURAND', prenom: 'JEAN', date_naissance: '1985-03-15', sexe: 'M' },
      makeResult(),
    );
    expect(result.score).toBeLessThan(100);
    expect(result.discrepancies.length).toBeGreaterThan(0);
  });

  it('retourne un score réduit si la DDN diverge', () => {
    const result = crossCheckIdentity(
      { nom: 'DUPONT', prenom: 'JEAN', date_naissance: '1990-01-01', sexe: 'M' },
      makeResult(),
    );
    expect(result.score).toBeLessThan(100);
    expect(result.discrepancies.some(d => d.includes('Date'))).toBe(true);
  });

  it('retourne un score réduit si le sexe diverge', () => {
    const result = crossCheckIdentity(
      { nom: 'DUPONT', prenom: 'JEAN', date_naissance: '1985-03-15', sexe: 'F' },
      makeResult(),
    );
    expect(result.score).toBeLessThan(100);
    expect(result.discrepancies.some(d => d.includes('Sexe'))).toBe(true);
  });
});
