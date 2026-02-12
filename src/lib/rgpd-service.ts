/**
 * UrgenceOS — RGPD Compliance Service
 * Implements GDPR/RGPD rights:
 *  - Art.15: Right of access (data export)
 *  - Art.17: Right to erasure (data deletion request)
 *  - Art.20: Right to data portability (JSON export)
 *  - Consent management
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export interface DataExportPackage {
  patient: Record<string, unknown>;
  encounters: Record<string, unknown>[];
  prescriptions: Record<string, unknown>[];
  vitals: Record<string, unknown>[];
  results: Record<string, unknown>[];
  allergies: Record<string, unknown>[];
  conditions: Record<string, unknown>[];
  audit_logs: Record<string, unknown>[];
  exported_at: string;
  format_version: string;
  export_reason: string;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  granted_by: string | null;
}

export type ConsentType = 'data_processing' | 'data_sharing' | 'research' | 'mssante_send' | 'dmp_send';

export interface ConsentInput {
  consent_type: ConsentType;
  granted: boolean;
  granted_by: string;
}

export interface DeletionRequest {
  id: string;
  patient_id: string;
  requested_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  created_at: string;
}

// ── Art.15 + Art.20: Data Export ──

export async function exportPatientData(
  patientId: string,
  reason: string = 'patient_request'
): Promise<DataExportPackage> {
  const [
    patientRes,
    encountersRes,
    prescriptionsRes,
    vitalsRes,
    resultsRes,
    allergiesRes,
    conditionsRes,
    auditRes,
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('encounters').select('*').eq('patient_id', patientId),
    supabase.from('prescriptions').select('*').eq('patient_id', patientId),
    supabase.from('vitals').select('*').eq('patient_id', patientId),
    supabase.from('results').select('*').eq('patient_id', patientId),
    supabase.from('timeline_items').select('*').eq('patient_id', patientId).eq('item_type', 'allergie'),
    supabase.from('timeline_items').select('*').eq('patient_id', patientId).eq('item_type', 'antecedent'),
    supabase.from('audit_logs').select('*').eq('user_id', patientId).order('created_at', { ascending: false }),
  ]);

  return {
    patient: (patientRes.data as Record<string, unknown>) || {},
    encounters: (encountersRes.data as Record<string, unknown>[]) || [],
    prescriptions: (prescriptionsRes.data as Record<string, unknown>[]) || [],
    vitals: (vitalsRes.data as Record<string, unknown>[]) || [],
    results: (resultsRes.data as Record<string, unknown>[]) || [],
    allergies: (allergiesRes.data as Record<string, unknown>[]) || [],
    conditions: (conditionsRes.data as Record<string, unknown>[]) || [],
    audit_logs: (auditRes.data as Record<string, unknown>[]) || [],
    exported_at: new Date().toISOString(),
    format_version: '1.0.0',
    export_reason: reason,
  };
}

export function downloadExportAsJSON(data: DataExportPackage, patientName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `urgenceos-export-${patientName.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Art.17: Right to Erasure ──

export async function requestDataDeletion(
  patientId: string,
  requestedBy: string,
  reason: string = ''
): Promise<{ success: boolean; deletionId: string | null; error?: string }> {
  // data_deletion_requests table doesn't exist yet — log to audit_logs instead
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: requestedBy,
      action: 'data_deletion_request',
      resource_type: 'patient',
      resource_id: patientId,
      details: { reason, status: 'pending' },
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, deletionId: null, error: error.message };
  }

  return { success: true, deletionId: (data as Record<string, unknown>)?.id as string };
}

export async function getDeletionRequests(
  patientId?: string
): Promise<DeletionRequest[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'data_deletion_request')
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('resource_id', patientId);
  }

  const { data } = await query;
  // Map audit_logs rows to DeletionRequest shape
  return ((data || []) as Record<string, unknown>[]).map(row => ({
    id: row.id as string,
    patient_id: (row.resource_id || '') as string,
    requested_by: (row.user_id || '') as string,
    reason: ((row.details as Record<string, unknown>)?.reason || '') as string,
    status: ((row.details as Record<string, unknown>)?.status || 'pending') as DeletionRequest['status'],
    created_at: row.created_at as string,
  }));
}

// ── Consent Management ──

export async function getConsentStatus(_patientId: string): Promise<ConsentRecord[]> {
  // patient_consents table doesn't exist yet — return empty
  return [];
}

export async function recordConsent(
  patientId: string,
  consent: ConsentInput
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    patient_id: patientId,
    consent_type: consent.consent_type,
    granted: consent.granted,
    granted_at: consent.granted ? new Date().toISOString() : null,
    revoked_at: !consent.granted ? new Date().toISOString() : null,
    granted_by: consent.granted_by,
  };

  // patient_consents table doesn't exist yet — store in audit_logs
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: payload.granted_by || null,
      action: 'consent_record',
      resource_type: 'patient',
      resource_id: patientId,
      details: payload as unknown as Record<string, unknown>,
    } as any);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function hasActiveConsent(
  _patientId: string,
  _consentType: ConsentType
): Promise<boolean> {
  // patient_consents table doesn't exist yet — default to false
  return false;
}

// ── Privacy-safe audit log ──

export function anonymizeForExport(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'access_token', 'refresh_token'];
  const result = { ...data };

  for (const field of sensitiveFields) {
    if (field in result) {
      result[field] = '[REDACTED]';
    }
  }

  return result;
}
