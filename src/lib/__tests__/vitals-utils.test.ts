import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isVitalAbnormal, calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';

describe('isVitalAbnormal', () => {
  it('returns false for a normal heart rate (fc=80)', () => {
    expect(isVitalAbnormal('fc', 80)).toBe(false);
  });

  it('returns true when fc is too high (>120)', () => {
    expect(isVitalAbnormal('fc', 150)).toBe(true);
  });

  it('returns true when fc is too low (<50)', () => {
    expect(isVitalAbnormal('fc', 40)).toBe(true);
  });

  it('returns false for fc at exact boundary (fc=50)', () => {
    expect(isVitalAbnormal('fc', 50)).toBe(false);
  });

  it('returns false for fc at upper boundary (fc=120)', () => {
    expect(isVitalAbnormal('fc', 120)).toBe(false);
  });

  it('returns true when SpO2 is critically low (<94)', () => {
    expect(isVitalAbnormal('spo2', 88)).toBe(true);
  });

  it('returns false when SpO2 is normal (>=94)', () => {
    expect(isVitalAbnormal('spo2', 97)).toBe(false);
  });

  it('returns true when temperature is too high (>38.5)', () => {
    expect(isVitalAbnormal('temperature', 39.2)).toBe(true);
  });

  it('returns true when temperature is too low (<35)', () => {
    expect(isVitalAbnormal('temperature', 34.0)).toBe(true);
  });

  it('returns false for normal temperature (36.7)', () => {
    expect(isVitalAbnormal('temperature', 36.7)).toBe(false);
  });

  it('returns false when value is null', () => {
    expect(isVitalAbnormal('fc', null)).toBe(false);
  });

  it('returns false when value is undefined', () => {
    expect(isVitalAbnormal('fc', undefined)).toBe(false);
  });

  it('returns false for unknown vital key', () => {
    expect(isVitalAbnormal('unknown_vital', 100)).toBe(false);
  });

  it('returns true for abnormal systolic blood pressure (>180)', () => {
    expect(isVitalAbnormal('pa_systolique', 200)).toBe(true);
  });

  it('returns true for abnormal GCS (<15)', () => {
    expect(isVitalAbnormal('gcs', 10)).toBe(true);
  });
});

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates age correctly for a standard date of birth', () => {
    vi.setSystemTime(new Date('2025-06-15'));
    expect(calculateAge('1990-01-01')).toBe(35);
  });

  it('calculates age correctly when birthday has not yet occurred this year', () => {
    vi.setSystemTime(new Date('2025-06-15'));
    expect(calculateAge('1990-09-20')).toBe(34);
  });

  it('calculates age correctly on the exact birthday', () => {
    vi.setSystemTime(new Date('2025-06-15'));
    expect(calculateAge('1990-06-15')).toBe(35);
  });

  it('calculates age correctly for a one-day-before-birthday scenario', () => {
    vi.setSystemTime(new Date('2025-06-14'));
    expect(calculateAge('1990-06-15')).toBe(34);
  });

  it('calculates age correctly for a newborn (born this year)', () => {
    vi.setSystemTime(new Date('2025-06-15'));
    expect(calculateAge('2025-01-01')).toBe(0);
  });
});

describe('getWaitTimeMinutes', () => {
  it('returns the number of minutes since arrival', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString();
    const minutes = getWaitTimeMinutes(thirtyMinutesAgo);
    expect(minutes).toBeGreaterThanOrEqual(29);
    expect(minutes).toBeLessThanOrEqual(31);
  });

  it('returns approximately 0 for a patient who just arrived', () => {
    const now = new Date().toISOString();
    const minutes = getWaitTimeMinutes(now);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(1);
  });
});

describe('formatWaitTime', () => {
  it('formats minutes only when less than 60', () => {
    expect(formatWaitTime(45)).toBe('45min');
  });

  it('formats hours and minutes for 60+ minutes', () => {
    expect(formatWaitTime(90)).toBe('1h30');
  });

  it('formats exactly 60 minutes as 1h00', () => {
    expect(formatWaitTime(60)).toBe('1h00');
  });

  it('formats 0 minutes', () => {
    expect(formatWaitTime(0)).toBe('0min');
  });

  it('pads minutes with zero in hour format (e.g. 2h05)', () => {
    expect(formatWaitTime(125)).toBe('2h05');
  });

  it('formats large wait time correctly (5h30)', () => {
    expect(formatWaitTime(330)).toBe('5h30');
  });
});
