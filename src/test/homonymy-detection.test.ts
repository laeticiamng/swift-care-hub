/**
 * Tests unitaires — Module homonymy-detection
 * Vérifie la détection d'homonymes et vérification d'identité
 */
import { describe, it, expect } from 'vitest';
import {
  detectHomonymy,
  verifyIdentity,
  generateIPP,
  generateNumeroSejour,
} from '@/lib/homonymy-detection';

const makePatient = (id: string, nom: string, prenom: string, ddn = '1985-03-15', ipp = 'IPP-TEST') => ({
  id,
  nom,
  prenom,
  date_naissance: ddn,
  sexe: 'M' as const,
  ipp,
});

describe('detectHomonymy', () => {
  it('détecte deux patients homonymes (même nom/prénom)', () => {
    const current = makePatient('1', 'DUPONT', 'Jean');
    const all = [
      current,
      makePatient('2', 'DUPONT', 'Jean', '1990-01-01'),
    ];
    const alerts = detectHomonymy(current, all);
    expect(alerts.length).toBe(1);
    expect(alerts[0].patient_a_id).toBe('1');
    expect(alerts[0].patient_b_id).toBe('2');
  });

  it('détecte homonymes malgré la casse différente', () => {
    const current = makePatient('1', 'dupont', 'jean');
    const all = [
      current,
      makePatient('2', 'DUPONT', 'JEAN'),
    ];
    const alerts = detectHomonymy(current, all);
    expect(alerts.length).toBe(1);
  });

  it('détecte homonymes malgré les accents', () => {
    const current = makePatient('1', 'Héloïse', 'Léa');
    const all = [
      current,
      makePatient('2', 'Heloise', 'Lea'),
    ];
    const alerts = detectHomonymy(current, all);
    expect(alerts.length).toBe(1);
  });

  it('ne détecte pas de faux positif (noms différents)', () => {
    const current = makePatient('1', 'DUPONT', 'Jean');
    const all = [
      current,
      makePatient('2', 'DURAND', 'Jean'),
      makePatient('3', 'DUPONT', 'Marie'),
    ];
    const alerts = detectHomonymy(current, all);
    expect(alerts.length).toBe(0);
  });

  it('ne s\'auto-détecte pas (exclut le patient courant)', () => {
    const current = makePatient('1', 'DUPONT', 'Jean');
    const alerts = detectHomonymy(current, [current]);
    expect(alerts.length).toBe(0);
  });

  it('détecte plusieurs homonymes', () => {
    const current = makePatient('1', 'MARTIN', 'Pierre');
    const all = [
      current,
      makePatient('2', 'MARTIN', 'Pierre'),
      makePatient('3', 'MARTIN', 'Pierre'),
    ];
    const alerts = detectHomonymy(current, all);
    expect(alerts.length).toBe(2);
  });
});

describe('verifyIdentity', () => {
  const patient = makePatient('1', 'DUPONT', 'Jean', '1985-03-15', 'IPP-12345678');

  it('valide par nom + date de naissance (methode nom_ddn)', () => {
    expect(verifyIdentity(patient, 'DUPONT', '1985-03-15', 'nom_ddn')).toBe(true);
  });

  it('valide par nom + IPP (methode nom_ipp)', () => {
    expect(verifyIdentity(patient, 'DUPONT', 'IPP-12345678', 'nom_ipp')).toBe(true);
  });

  it('rejette si nom incorrect', () => {
    expect(verifyIdentity(patient, 'DURAND', '1985-03-15', 'nom_ddn')).toBe(false);
  });

  it('rejette si DDN incorrecte', () => {
    expect(verifyIdentity(patient, 'DUPONT', '1990-01-01', 'nom_ddn')).toBe(false);
  });

  it('rejette si IPP incorrect', () => {
    expect(verifyIdentity(patient, 'DUPONT', 'IPP-99999999', 'nom_ipp')).toBe(false);
  });

  it('est case-insensitive sur le nom', () => {
    expect(verifyIdentity(patient, 'dupont', '1985-03-15', 'nom_ddn')).toBe(true);
  });

  it('gère les espaces en trop', () => {
    expect(verifyIdentity(patient, '  DUPONT  ', '1985-03-15', 'nom_ddn')).toBe(true);
  });
});

describe('generateIPP', () => {
  it('retourne un IPP formaté', () => {
    const ipp = generateIPP('abc-123-def');
    expect(ipp).toMatch(/^IPP-/);
    expect(ipp.length).toBeGreaterThan(4);
  });

  it('est déterministe pour le même input', () => {
    expect(generateIPP('abc-123')).toBe(generateIPP('abc-123'));
  });
});

describe('generateNumeroSejour', () => {
  it('retourne un numéro de séjour avec l\'année courante', () => {
    const num = generateNumeroSejour('encounter-123');
    expect(num).toMatch(/^SEJ-\d{4}-/);
    expect(num).toContain(new Date().getFullYear().toString());
  });

  it('est déterministe pour le même input', () => {
    const a = generateNumeroSejour('enc-1');
    const b = generateNumeroSejour('enc-1');
    expect(a).toBe(b);
  });
});
