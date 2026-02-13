/**
 * Tests unitaires — Module allergy-check
 * Vérifie la détection des conflits allergiques et interactions médicamenteuses
 */
import { describe, it, expect } from 'vitest';
import { checkAllergyConflict, checkDrugInteractions } from '@/lib/allergy-check';

describe('checkAllergyConflict', () => {
  it('détecte un conflit direct amoxicilline / pénicilline', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', ['pénicilline']);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts).toContain('pénicilline');
  });

  it('détecte un conflit augmentin / beta-lactamine', () => {
    const conflicts = checkAllergyConflict('Augmentin', ['beta-lactamine']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('détecte un conflit ceftriaxone / céphalosporine', () => {
    const conflicts = checkAllergyConflict('Ceftriaxone', ['céphalosporine']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('détecte un conflit ibuprofène / AINS', () => {
    const conflicts = checkAllergyConflict('Ibuprofène', ['ains']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('détecte un conflit morphine / opioïde', () => {
    const conflicts = checkAllergyConflict('Morphine', ['opioïde']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('détecte un conflit iode / produit de contraste', () => {
    const conflicts = checkAllergyConflict('Iode', ['produit de contraste']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('ne retourne aucun conflit si aucune allergie', () => {
    const conflicts = checkAllergyConflict('Paracétamol', []);
    expect(conflicts).toEqual([]);
  });

  it('ne retourne aucun conflit si médicament non-matching', () => {
    const conflicts = checkAllergyConflict('Paracétamol', ['pénicilline', 'ains']);
    expect(conflicts).toEqual([]);
  });

  it('gère les variations d\'accents', () => {
    const conflicts = checkAllergyConflict('ibuprofene', ['ibuprofène']);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it('déduplique les conflits', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', ['pénicilline', 'penicilline']);
    // Each allergy is reported once
    const uniqueConflicts = [...new Set(conflicts)];
    expect(conflicts.length).toBe(uniqueConflicts.length);
  });

  it('ne retourne aucun conflit si patientAllergies est null-like', () => {
    const conflicts = checkAllergyConflict('Morphine', null as unknown as string[]);
    expect(conflicts).toEqual([]);
  });
});

describe('checkDrugInteractions', () => {
  it('détecte AINS + anticoagulant → warning', () => {
    const interactions = checkDrugInteractions('ibuprofene', ['heparine']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('warning');
    expect(interactions[0].message).toContain('hémorragique');
  });

  it('détecte AINS + IEC → warning (risque rénal)', () => {
    const interactions = checkDrugInteractions('Ibuprofène', ['Ramipril']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('warning');
    expect(interactions[0].message).toContain('rénale');
  });

  it('détecte opioïde + benzodiazépine → warning (dépression respi)', () => {
    const interactions = checkDrugInteractions('Morphine', ['Midazolam']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('warning');
    expect(interactions[0].message).toContain('respiratoire');
  });

  it('détecte metformine + PCI → info', () => {
    const interactions = checkDrugInteractions('Metformine', ['Iode']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('info');
  });

  it('détecte potassium + IEC → info (kaliémie)', () => {
    const interactions = checkDrugInteractions('Potassium', ['Ramipril']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('info');
    expect(interactions[0].message).toContain('kaliémie');
  });

  it('vérifie l\'interaction dans les deux sens', () => {
    const interactions = checkDrugInteractions('heparine', ['ibuprofene']);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].level).toBe('warning');
  });

  it('ne retourne aucune interaction si pas de traitements en cours', () => {
    const interactions = checkDrugInteractions('Paracétamol', []);
    expect(interactions).toEqual([]);
  });

  it('déduplique les messages d\'interaction', () => {
    const interactions = checkDrugInteractions('Ibuprofène', ['Héparine', 'Enoxaparine']);
    const messages = interactions.map(i => i.message);
    expect(messages.length).toBe(new Set(messages).size);
  });
});
