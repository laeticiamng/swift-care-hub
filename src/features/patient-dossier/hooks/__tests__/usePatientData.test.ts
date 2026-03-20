import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  const timeout = options?.timeout ?? 1000;
  const start = Date.now();
  while (true) {
    try {
      callback();
      return;
    } catch (error) {
      if (Date.now() - start > timeout) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
};

const encounter = {
  id: 'enc-1',
  patient_id: 'pat-1',
  status: 'in-progress',
  zone: 'sau',
  box_number: 2,
  ccmu: 3,
  cimu: 2,
  motif_sfmu: 'Dyspnée',
  medecin_id: 'med-1',
  arrival_time: '2026-03-19T08:00:00.000Z',
  triage_time: '2026-03-19T08:07:00.000Z',
  discharge_time: null,
  orientation: null,
  gemsa: null,
  ide_id: null,
  created_at: '2026-03-19T08:00:00.000Z',
};

const patient = {
  id: 'pat-1',
  nom: 'DUPONT',
  prenom: 'Marie',
  date_naissance: '1980-03-15',
  sexe: 'F',
  allergies: ['Pénicilline'],
  antecedents: ['Asthme'],
  medecin_traitant: 'Dr Test',
  poids: 68,
  telephone: '0600000000',
  adresse: null,
  ins_numero: null,
  traitements_actuels: null,
  ipp: 'IPP-001',
  photo_url: null,
  created_at: '2026-03-19T08:00:00.000Z',
};

const vitals = [{
  id: 'vital-1',
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  fc: 110,
  pa_systolique: 140,
  pa_diastolique: 80,
  spo2: 93,
  temperature: 37.5,
  frequence_respiratoire: 24,
  gcs: 15,
  eva_douleur: 3,
  recorded_at: '2026-03-19T08:10:00.000Z',
  recorded_by: 'as-1',
}];

const prescriptions = [{
  id: 'rx-1',
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  medication_name: 'Salbutamol',
  dosage: '5 mg',
  route: 'neb' as const,
  prescriber_id: 'med-1',
  priority: 'high' as const,
  status: 'active' as const,
  created_at: '2026-03-19T08:12:00.000Z',
  frequency: null,
  notes: null,
}];

const results = [{
  id: 'res-1',
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  title: 'Gaz du sang',
  category: 'bio' as const,
  content: { ph: 7.31 },
  is_critical: true,
  is_read: false,
  received_at: '2026-03-19T08:15:00.000Z',
}];

const timelineItems = [{
  id: 'tl-1',
  patient_id: 'pat-1',
  item_type: 'diagnostic' as const,
  content: 'Crise d’asthme aiguë',
  source_author: 'Dr House',
  source_date: '2026-03-19',
  source_document: null,
  created_at: '2026-03-19T08:18:00.000Z',
}];

const labAlerts = [{
  id: 'alert-1',
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  patient_ipp: 'IPP-001',
  result_id: 'res-1',
  analyte: 'Gaz du sang',
  value: 7.31,
  unit: 'pH',
  is_critical: true,
  threshold_exceeded: 'low' as const,
  acknowledged: false,
  acknowledged_by: null,
  acknowledged_at: null,
  acknowledgment_note: null,
  escalation_level: 1 as const,
  escalation_history: [],
  ipp_verified: true,
  lab_caller: 'Labo',
  lab_call_time: '2026-03-19T08:16:00.000Z',
  lab_interlocutor: 'Dr House',
  created_at: '2026-03-19T08:15:30.000Z',
}];

const communications = [{
  id: 'comm-1',
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  patient_ipp: 'IPP-001',
  type: 'appel_labo' as const,
  content: 'Gaz du sang transmis au médecin.',
  source: 'Laboratoire',
  author_id: 'lab-1',
  author_name: 'Labo',
  status: 'vu' as const,
  seen_by: 'med-1',
  seen_at: '2026-03-19T08:17:00.000Z',
  treated_by: null,
  treated_at: null,
  lab_result_value: 'pH 7.31',
  lab_interlocutor: 'Dr House',
  target_service: null,
  created_at: '2026-03-19T08:16:30.000Z',
}];

function buildQuery(table: string) {
  const responseForTable = () => {
    switch (table) {
      case 'encounters':
        return { data: encounter, error: null };
      case 'patients':
        return { data: patient, error: null };
      case 'vitals':
        return { data: vitals, error: null };
      case 'prescriptions':
        return { data: prescriptions, error: null };
      case 'results':
        return { data: results, error: null };
      case 'timeline_items':
        return { data: timelineItems, error: null };
      case 'lab_alerts':
        return { data: labAlerts, error: null };
      case 'communications':
        return { data: communications, error: null };
      case 'profiles':
        return { data: { full_name: 'Dr House' }, error: null };
      default:
        return { data: [], error: null };
    }
  };

  const terminalSingle = vi.fn(async () => responseForTable());
  const terminalOrder = vi.fn(async () => responseForTable());
  const terminalLimit = vi.fn(async () => ({ data: [patient], error: null }));
  const terminalIn = vi.fn(async () => ({ data: [{ id: 'enc-1', patient_id: 'pat-1', zone: 'sau', arrival_time: encounter.arrival_time }], error: null }));

  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: terminalSingle,
        order: terminalOrder,
        limit: terminalLimit,
      })),
      in: vi.fn(() => ({
        order: terminalOrder,
      })),
      order: terminalOrder,
      limit: terminalLimit,
      single: terminalSingle,
      eq: vi.fn(() => ({
        single: terminalSingle,
        order: terminalOrder,
        limit: terminalLimit,
      })),
    })),
    eq: vi.fn(() => ({
      single: terminalSingle,
      order: terminalOrder,
      limit: terminalLimit,
    })),
    in: vi.fn(() => ({
      order: terminalOrder,
    })),
    order: terminalOrder,
    limit: terminalLimit,
    single: terminalSingle,
  };
}

const { from } = vi.hoisted(() => ({ from: vi.fn() }));

from.mockImplementation((table: string) => {
  const query = buildQuery(table);

  if (table === 'patients') {
    query.select = vi.fn(() => {
      const patientSearchChain = {
        eq: vi.fn(() => patientSearchChain),
        single: vi.fn(async () => ({ data: patient, error: null })),
        limit: vi.fn(async () => ({ data: [patient], error: null })),
      };
      return patientSearchChain;
    });
  }

  if (table === 'encounters') {
    query.select = vi.fn(() => ({
      eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: encounter, error: null })) })),
      in: vi.fn(() => ({ order: vi.fn(async () => ({ data: [{ id: 'enc-1', patient_id: 'pat-1', zone: 'sau', arrival_time: encounter.arrival_time }], error: null })) })),
      order: vi.fn(async () => ({ data: [{ id: 'enc-1', patient_id: 'pat-1', zone: 'sau', arrival_time: encounter.arrival_time }], error: null })),
    }));
  }

  return query;
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from,
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

vi.mock('@/contexts/DemoContext', () => ({
  useDemo: () => ({ isDemoMode: false }),
}));

import { usePatientData } from '../usePatientData';

describe('usePatientData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null state when no encounterId provided', () => {
    const { result } = renderHook(() => usePatientData(undefined));
    expect(result.current.encounter).toBeNull();
    expect(result.current.patient).toBeNull();
    expect(result.current.vitals).toEqual([]);
    expect(result.current.prescriptions).toEqual([]);
  });

  it('loads live encounter and patient data correctly', async () => {
    const { result } = renderHook(() => usePatientData('enc-1'));

    await waitFor(() => {
      expect(result.current.encounter?.id).toBe('enc-1');
      expect(result.current.patient?.id).toBe('pat-1');
    });

    expect(result.current.patient?.nom).toBe('DUPONT');
    expect(result.current.medecinName).toBe('Dr House');
  });

  it('hydrates live vitals, prescriptions and results', async () => {
    const { result } = renderHook(() => usePatientData('enc-1'));

    await waitFor(() => {
      expect(result.current.vitals).toHaveLength(1);
      expect(result.current.prescriptions).toHaveLength(1);
      expect(result.current.results).toHaveLength(1);
    });
  });

  it('builds SIH timeline, communications and lab alerts from backend data', async () => {
    const { result } = renderHook(() => usePatientData('enc-1'));

    await waitFor(() => {
      expect(result.current.sihTimelineEntries.length).toBeGreaterThan(0);
      expect(result.current.sihLabAlerts).toHaveLength(1);
      expect(result.current.sihCommunications).toHaveLength(1);
    });

    expect(result.current.sihTimelineEntries.some((entry) => entry.entry_type === 'alerte_labo')).toBe(true);
  });

  it('exposes fetchAll and SIH state setters', () => {
    const { result } = renderHook(() => usePatientData('enc-1'));

    expect(typeof result.current.fetchAll).toBe('function');
    expect(typeof result.current.setSihTimelineEntries).toBe('function');
    expect(typeof result.current.setSihLabAlerts).toBe('function');
  });
});
