import { describe, it, expect } from 'vitest';

describe('Project setup and basic imports', () => {
  it('can import from @/lib/vitals-utils using the path alias', async () => {
    const mod = await import('@/lib/vitals-utils');
    expect(mod.isVitalAbnormal).toBeDefined();
    expect(typeof mod.isVitalAbnormal).toBe('function');
  });

  it('can import from @/lib/allergy-check using the path alias', async () => {
    const mod = await import('@/lib/allergy-check');
    expect(mod.checkAllergyConflict).toBeDefined();
    expect(mod.checkDrugInteractions).toBeDefined();
  });

  it('can import from @/lib/interop using the barrel export', async () => {
    const mod = await import('@/lib/interop');
    expect(mod.patientToFHIR).toBeDefined();
    expect(mod.LOINC_VITALS).toBeDefined();
    expect(mod.encounterToADT_A01).toBeDefined();
  });

  it('has jsdom environment configured (window is defined)', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('has localStorage available in jsdom environment', () => {
    localStorage.setItem('__test__', 'value');
    expect(localStorage.getItem('__test__')).toBe('value');
    localStorage.removeItem('__test__');
  });

  it('has matchMedia polyfill from test setup', () => {
    expect(typeof window.matchMedia).toBe('function');
    const result = window.matchMedia('(min-width: 768px)');
    expect(result.matches).toBe(false);
    expect(result.media).toBe('(min-width: 768px)');
  });
});
