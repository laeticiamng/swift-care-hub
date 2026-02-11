import { describe, it, expect } from 'vitest';
import { checkAllergyConflict, checkDrugInteractions } from '@/lib/allergy-check';

describe('checkAllergyConflict', () => {
  it('detects penicillin allergy when prescribing amoxicilline', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', ['Pénicilline']);
    expect(conflicts).toContain('Pénicilline');
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });

  it('detects AINS allergy when prescribing ibuprofene', () => {
    const conflicts = checkAllergyConflict('Ibuprofene', ['AINS']);
    expect(conflicts).toContain('AINS');
  });

  it('detects beta-lactamine cross-family allergy for amoxicilline', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', ['Beta-lactamine']);
    expect(conflicts).toContain('Beta-lactamine');
  });

  it('detects beta-lactamine cross-family allergy for ceftriaxone', () => {
    const conflicts = checkAllergyConflict('Ceftriaxone', ['Bêta-lactamine']);
    expect(conflicts).toContain('Bêta-lactamine');
  });

  it('returns no conflict when patient has unrelated allergies', () => {
    const conflicts = checkAllergyConflict('Paracetamol', ['Pénicilline', 'Iode']);
    expect(conflicts).toEqual([]);
  });

  it('returns empty array when patient has no allergies', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', []);
    expect(conflicts).toEqual([]);
  });

  it('returns empty array when allergies is null-like', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', null as unknown as string[]);
    expect(conflicts).toEqual([]);
  });

  it('detects direct name match for morphine allergy', () => {
    const conflicts = checkAllergyConflict('Morphine', ['Morphine']);
    expect(conflicts).toContain('Morphine');
  });

  it('detects opioide family allergy for tramadol', () => {
    const conflicts = checkAllergyConflict('Tramadol', ['Opioïde']);
    expect(conflicts).toContain('Opioïde');
  });

  it('does not produce duplicate entries', () => {
    const conflicts = checkAllergyConflict('Amoxicilline', ['Pénicilline', 'penicilline']);
    const unique = new Set(conflicts);
    expect(conflicts.length).toBe(unique.size);
  });
});

describe('checkDrugInteractions', () => {
  it('warns about AINS + anticoagulant combination', () => {
    const interactions = checkDrugInteractions('Ibuprofene', ['Heparine']);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions[0].level).toBe('warning');
    expect(interactions[0].message).toContain('risque hémorragique');
  });

  it('warns about morphine + benzodiazepine combination', () => {
    const interactions = checkDrugInteractions('Morphine', ['Midazolam']);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions[0].level).toBe('warning');
    expect(interactions[0].message).toContain('dépression respiratoire');
  });

  it('detects interaction in reverse direction (anticoagulant prescribed, AINS in current meds)', () => {
    const interactions = checkDrugInteractions('Enoxaparine', ['Ibuprofene']);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions[0].message).toContain('hémorragique');
  });

  it('returns info level for metformine + iode interaction', () => {
    const interactions = checkDrugInteractions('Metformine', ['Iode']);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    const metInteraction = interactions.find(i => i.message.includes('Metformine'));
    expect(metInteraction).toBeDefined();
    expect(metInteraction!.level).toBe('info');
  });

  it('returns empty array when no current medications', () => {
    const interactions = checkDrugInteractions('Morphine', []);
    expect(interactions).toEqual([]);
  });

  it('returns empty array when currentMedications is null-like', () => {
    const interactions = checkDrugInteractions('Morphine', null as unknown as string[]);
    expect(interactions).toEqual([]);
  });

  it('returns empty array when there are no known interactions', () => {
    const interactions = checkDrugInteractions('Paracetamol', ['Omeprazole']);
    expect(interactions).toEqual([]);
  });

  it('does not duplicate interactions', () => {
    const interactions = checkDrugInteractions('Ibuprofene', ['Heparine', 'Enoxaparine']);
    const messages = interactions.map(i => i.message);
    const unique = new Set(messages);
    expect(messages.length).toBe(unique.size);
  });
});
