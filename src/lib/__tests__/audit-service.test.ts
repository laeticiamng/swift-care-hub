import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the supabase client before importing audit-service
const mockInsert = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      insert: mockInsert,
    }),
  },
}));

// Import after mocking
const { auditService, auditActions } = await import('@/lib/audit-service');

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queues a non-critical log entry without immediate flush', async () => {
    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      patient_id: 'p1',
      patient_ipp: 'IPP-001',
      module: 'M1-Identity',
      action: 'patient_accessed',
      resource_type: 'patient',
      resource_id: 'p1',
      details: {},
    });

    // Non-critical action should NOT trigger immediate flush
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('flushes immediately for critical actions (prescription_created)', async () => {
    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      patient_id: 'p1',
      patient_ipp: 'IPP-001',
      module: 'M4-Prescription',
      action: 'prescription_created',
      resource_type: 'prescription',
      resource_id: 'rx1',
      details: {},
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('flushes immediately for critical actions (administration_confirmed)', async () => {
    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      patient_id: 'p1',
      patient_ipp: 'IPP-001',
      module: 'M5-Administration',
      action: 'administration_confirmed',
      resource_type: 'administration',
      resource_id: 'admin1',
      details: {},
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('flushes immediately for identity_verified action', async () => {
    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      patient_id: 'p1',
      patient_ipp: 'IPP-001',
      module: 'M1-Identity',
      action: 'identity_verified',
      resource_type: 'patient',
      resource_id: 'p1',
      details: { method: 'nom_ddn' },
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('re-queues entries on flush error', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Network error' } });

    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      module: 'M4-Prescription',
      action: 'prescription_created',
      resource_type: 'prescription',
      details: {},
    });

    // The first call should have been attempted but failed
    expect(mockInsert).toHaveBeenCalledTimes(1);

    // Now a successful flush should include the re-queued entry
    mockInsert.mockResolvedValueOnce({ error: null });

    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      module: 'M4-Prescription',
      action: 'critical_alert_acknowledged',
      resource_type: 'lab_alert',
      details: {},
    });

    // Second call should include the re-queued + new entry
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('includes workstation and ip_address in the logged entry', async () => {
    await auditService.log({
      user_id: 'user-1',
      user_name: 'Dr Dupont',
      module: 'M4-Prescription',
      action: 'prescription_created',
      resource_type: 'prescription',
      details: {},
    });

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg).toBeInstanceOf(Array);
    expect(insertArg[0].details).toHaveProperty('ip_address');
    expect(insertArg[0].details).toHaveProperty('workstation');
  });
});

describe('auditActions convenience helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it('patientAccess logs with correct resource_type', async () => {
    await auditActions.patientAccess('u1', 'Dr X', 'p1', 'IPP-001', 'M1-Identity');
    // patient_accessed is not a critical action, so no immediate flush
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('prescriptionCreated triggers immediate flush (critical)', async () => {
    await auditActions.prescriptionCreated('u1', 'Dr X', 'p1', 'IPP-001', 'rx1', 'ecrite');
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('identityVerified triggers immediate flush (critical)', async () => {
    await auditActions.identityVerified('u1', 'Dr X', 'p1', 'IPP-001', 'nom_ddn');
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });
});
