import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  const timeout = options?.timeout ?? 1000;
  const start = Date.now();
  while (true) {
    try { callback(); return; } catch (e) {
      if (Date.now() - start > timeout) throw e;
      await new Promise(r => setTimeout(r, 50));
    }
  }
};
import { DEMO_ENCOUNTERS, DEMO_PATIENTS, DEMO_VITALS } from '@/lib/demo-data';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

// Mock demo context
const mockIsDemoMode = vi.fn(() => true);
vi.mock('@/contexts/DemoContext', () => ({
  useDemo: () => ({ isDemoMode: mockIsDemoMode() }),
}));

import { usePatientData } from '../usePatientData';

describe('usePatientData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDemoMode.mockReturnValue(true);
  });

  it('returns null state when no encounterId provided', () => {
    const { result } = renderHook(() => usePatientData(undefined));
    expect(result.current.encounter).toBeNull();
    expect(result.current.patient).toBeNull();
    expect(result.current.vitals).toEqual([]);
    expect(result.current.prescriptions).toEqual([]);
  });

  it('loads demo encounter data correctly', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const { result } = renderHook(() => usePatientData(demoEnc.id));

    await waitFor(() => {
      expect(result.current.encounter).not.toBeNull();
    });

    expect(result.current.encounter?.id).toBe(demoEnc.id);
    expect(result.current.encounter?.status).toBe(demoEnc.status);
  });

  it('loads demo patient data for encounter', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const demoPat = DEMO_PATIENTS.find(p => p.id === demoEnc.patient_id);

    const { result } = renderHook(() => usePatientData(demoEnc.id));

    await waitFor(() => {
      expect(result.current.patient).not.toBeNull();
    });

    expect(result.current.patient?.nom).toBe(demoPat?.nom);
    expect(result.current.patient?.prenom).toBe(demoPat?.prenom);
    expect(result.current.patient?.sexe).toBe(demoPat?.sexe);
  });

  it('loads demo vitals filtered by encounter', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const expectedVitals = DEMO_VITALS.filter(v => v.encounter_id === demoEnc.id);

    const { result } = renderHook(() => usePatientData(demoEnc.id));

    await waitFor(() => {
      expect(result.current.vitals.length).toBe(expectedVitals.length);
    });
  });

  it('sets medecinName in demo mode when medecin_id exists', async () => {
    const encWithMedecin = DEMO_ENCOUNTERS.find(e => e.medecin_id);
    if (!encWithMedecin) return;

    const { result } = renderHook(() => usePatientData(encWithMedecin.id));

    await waitFor(() => {
      expect(result.current.medecinName).toBe('Dr. Martin Dupont');
    });
  });

  it('returns empty prescriptions/results/timeline in demo mode', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const { result } = renderHook(() => usePatientData(demoEnc.id));

    await waitFor(() => {
      expect(result.current.encounter).not.toBeNull();
    });

    expect(result.current.prescriptions).toEqual([]);
    expect(result.current.results).toEqual([]);
    expect(result.current.timeline).toEqual([]);
  });

  it('exposes fetchAll function for manual refresh', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const { result } = renderHook(() => usePatientData(demoEnc.id));

    expect(typeof result.current.fetchAll).toBe('function');
  });

  it('exposes SIH state setters', async () => {
    const demoEnc = DEMO_ENCOUNTERS[0];
    const { result } = renderHook(() => usePatientData(demoEnc.id));

    expect(typeof result.current.setSihTimelineEntries).toBe('function');
    expect(typeof result.current.setSihLabAlerts).toBe('function');
    expect(Array.isArray(result.current.sihCommunications)).toBe(true);
  });
});
