import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock auth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-doctor-id' } }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useInterop } from '../useInterop';

const mockPatient = {
  id: 'pat-1', nom: 'MARTIN', prenom: 'Pierre', date_naissance: '1955-03-14',
  sexe: 'M', allergies: ['Pénicilline'], antecedents: ['HTA', 'Diabète type 2'],
  medecin_traitant: 'Dr. Leroy', poids: 75, telephone: '0600000000',
  adresse: '1 rue Test', ins_numero: null, traitements_actuels: [],
};

const mockEncounter = {
  id: 'enc-1', patient_id: 'pat-1', status: 'in-progress',
  arrival_time: '2026-03-03T08:00:00Z', triage_time: '2026-03-03T08:05:00Z',
  discharge_time: null, motif_sfmu: 'Douleur thoracique', ccmu: 3, cimu: 2,
  gemsa: null, zone: 'sau', box_number: 1, medecin_id: 'doc-1', orientation: null,
};

const mockVitals = [
  {
    id: 'v-1', patient_id: 'pat-1', encounter_id: 'enc-1',
    recorded_at: '2026-03-03T08:10:00Z', fc: 91, pa_systolique: 167,
    pa_diastolique: 89, spo2: 97, temperature: 37.2,
    frequence_respiratoire: 18, gcs: 15, eva_douleur: 8, recorded_by: null,
  },
];

const mockPrescriptions = [
  {
    id: 'rx-1', encounter_id: 'enc-1', patient_id: 'pat-1', prescriber_id: 'doc-1',
    medication_name: 'Paracétamol', dosage: '1g', route: 'PO',
    frequency: '3x/j', status: 'active', priority: 'routine',
    created_at: '2026-03-03T09:00:00Z', notes: null,
  },
];

const mockResults = [
  {
    id: 'res-1', encounter_id: 'enc-1', patient_id: 'pat-1',
    title: 'Troponine', category: 'bio', is_critical: false, is_read: false,
    content: { value: '0.02', unit: 'ng/mL' }, received_at: '2026-03-03T10:00:00Z',
  },
];

const mockTimeline = [
  { id: 'tl-1', patient_id: 'pat-1', item_type: 'antecedent', content: 'HTA', source_date: '2025-12-15' },
];

describe('useInterop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with closed drawers and no data', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    expect(result.current.fhirDrawerOpen).toBe(false);
    expect(result.current.fhirBundle).toBeNull();
    expect(result.current.crhDrawerOpen).toBe(false);
    expect(result.current.crhHTML).toBe('');
    expect(result.current.ordonnanceDrawerOpen).toBe(false);
    expect(result.current.ordonnanceHTML).toBe('');
  });

  it('generates valid FHIR bundle on export', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleExportFHIR();
    });

    expect(result.current.fhirDrawerOpen).toBe(true);
    expect(result.current.fhirBundle).not.toBeNull();
    expect(result.current.fhirBundle?.resourceType).toBe('Bundle');
    expect(result.current.fhirBundle?.type).toBe('collection');
    expect(result.current.fhirBundle?.entry.length).toBeGreaterThan(0);
  });

  it('FHIR bundle contains Patient and Encounter resources', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleExportFHIR();
    });

    const resourceTypes = result.current.fhirBundle!.entry.map((e: any) => e.resource.resourceType);
    expect(resourceTypes).toContain('Patient');
    expect(resourceTypes).toContain('Encounter');
  });

  it('FHIR bundle contains Observation resources for vitals', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleExportFHIR();
    });

    const observations = result.current.fhirBundle!.entry.filter((e: any) => e.resource.resourceType === 'Observation');
    expect(observations.length).toBeGreaterThan(0);
  });

  it('FHIR bundle contains MedicationRequest for prescriptions', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleExportFHIR();
    });

    const medRequests = result.current.fhirBundle!.entry.filter((e: any) => e.resource.resourceType === 'MedicationRequest');
    expect(medRequests.length).toBeGreaterThanOrEqual(1);
  });

  it('generates non-empty CRH HTML', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleGenerateCRH();
    });

    expect(result.current.crhDrawerOpen).toBe(true);
    expect(result.current.crhHTML.length).toBeGreaterThan(0);
    expect(result.current.crhHTML).toContain('MARTIN');
    expect(result.current.crhStatus).toBe('draft');
  });

  it('signs CRH and updates status', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleGenerateCRH();
    });

    act(() => {
      result.current.handleSignCRH();
    });

    expect(result.current.crhStatus).toBe('signed');
  });

  it('sends via MSSanté and updates status', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleGenerateCRH();
    });

    act(() => {
      result.current.handleSendMSSante();
    });

    expect(result.current.crhStatus).toBe('sent');
  });

  it('generates non-empty ordonnance HTML', () => {
    const { result } = renderHook(() =>
      useInterop(mockEncounter, mockPatient, mockVitals, mockPrescriptions, mockResults, mockTimeline, 'Dr. Dupont')
    );

    act(() => {
      result.current.handleGenerateOrdonnance();
    });

    expect(result.current.ordonnanceDrawerOpen).toBe(true);
    expect(result.current.ordonnanceHTML.length).toBeGreaterThan(0);
    expect(result.current.ordonnanceHTML).toContain('MARTIN');
  });
});
