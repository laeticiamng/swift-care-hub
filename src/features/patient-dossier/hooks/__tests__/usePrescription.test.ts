import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock supabase
const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => Promise.resolve({ error: null })),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
    })),
  },
}));

// Mock auth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-doctor-id' } }),
}));

// Mock demo context
const mockIsDemoMode = vi.fn(() => false);
vi.mock('@/contexts/DemoContext', () => ({
  useDemo: () => ({ isDemoMode: mockIsDemoMode() }),
}));

// Mock server guard
vi.mock('@/lib/server-role-guard', () => ({
  guardPrescription: vi.fn(() => Promise.resolve({ authorized: true })),
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 19, resetIn: 60000 })),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

import { usePrescription } from '../usePrescription';
import { guardPrescription } from '@/lib/server-role-guard';
import { toast } from 'sonner';

const mockEncounter = { id: 'enc-1', patient_id: 'pat-1' };
const mockPatient = { id: 'pat-1', allergies: ['Pénicilline'], traitements_actuels: [] };
const mockFetchAll = vi.fn();

describe('usePrescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDemoMode.mockReturnValue(false);
  });

  it('initializes with default form state', () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    expect(result.current.prescribeOpen).toBe(false);
    expect(result.current.allergyWarning).toEqual([]);
    expect(result.current.drugInteractions).toEqual([]);
    expect(result.current.newRx.medication_name).toBe('');
    expect(result.current.rxType).toBe('medicament');
  });

  it('detects allergy conflict on medication name change', () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Amoxicilline');
    });

    // Amoxicilline crosses with Pénicilline allergy
    expect(result.current.allergyWarning.length).toBeGreaterThan(0);
  });

  it('does not flag allergy for unrelated medication', () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Paracétamol');
    });

    expect(result.current.allergyWarning).toEqual([]);
  });

  it('blocks prescription when allergy detected', async () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Amoxicilline');
    });

    await act(async () => {
      await result.current.handlePrescribe();
    });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('ALLERGIE'));
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('calls guardPrescription before prescribing in real mode', async () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Paracétamol');
      result.current.setNewRx({
        ...result.current.newRx,
        medication_name: 'Paracétamol',
        dosage: '1g',
        route: 'PO',
        frequency: '3x/j',
        priority: 'routine',
        rx_type: 'traitements',
      });
    });

    await act(async () => {
      await result.current.handlePrescribe();
    });

    expect(guardPrescription).toHaveBeenCalled();
  });

  it('blocks prescription when guard returns unauthorized', async () => {
    vi.mocked(guardPrescription).mockResolvedValueOnce({ authorized: false, error: 'Non autorisé' });

    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Paracétamol');
    });

    await act(async () => {
      await result.current.handlePrescribe();
    });

    expect(toast.error).toHaveBeenCalledWith('Non autorisé');
  });

  it('tracks form state changes correctly', () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    act(() => {
      result.current.handleMedNameChange('Amoxicilline');
      result.current.setPrescribeOpen(true);
      result.current.setRxType('exam_bio');
    });

    expect(result.current.allergyWarning.length).toBeGreaterThan(0);
    expect(result.current.prescribeOpen).toBe(true);
    expect(result.current.rxType).toBe('exam_bio');

    // Changing to a safe medication clears allergy warning
    act(() => {
      result.current.handleMedNameChange('Paracétamol');
    });

    expect(result.current.allergyWarning).toEqual([]);
  });

  it('exposes cancel and suspend handlers', () => {
    const { result } = renderHook(() =>
      usePrescription(mockEncounter, mockPatient, [], mockFetchAll)
    );

    expect(typeof result.current.handleCancelPrescription).toBe('function');
    expect(typeof result.current.handleSuspendPrescription).toBe('function');
    expect(typeof result.current.handleReactivatePrescription).toBe('function');
  });
});
