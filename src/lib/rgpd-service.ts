/**
 * UrgenceOS — RGPD Compliance Service
 * Implements GDPR/RGPD rights:
 *  - Art.15: Right of access (data export)
 *  - Art.17: Right to erasure (data deletion request)
 *  - Art.20: Right to data portability (JSON export)
 *  - Consent management
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
  // Use the data_deletion_requests table (created in audit_hardening migration)
  const { data, error } = await supabase
    .from('data_deletion_requests')
    .insert({
      patient_id: patientId,
      requested_by: requestedBy,
      reason,
      status: 'pending',
    } as unknown as Record<string, unknown>)
    .select('id')
    .single();

  if (error) {
    return { success: false, deletionId: null, error: error.message };
  }

  // Also log to audit trail for immutable record
  await supabase.from('audit_logs').insert({
    user_id: requestedBy,
    action: 'data_deletion_request',
    resource_type: 'patient',
    resource_id: patientId,
    details: { reason, deletion_request_id: (data as Record<string, unknown>)?.id },
  });

  return { success: true, deletionId: (data as Record<string, unknown>)?.id as string };
}

export async function getDeletionRequests(
  patientId?: string
): Promise<DeletionRequest[]> {
  let query = supabase
    .from('data_deletion_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data } = await query;
  return ((data || []) as Record<string, unknown>[]).map(row => ({
    id: row.id as string,
    patient_id: (row.patient_id || '') as string,
    requested_by: (row.requested_by || '') as string,
    reason: (row.reason || '') as string,
    status: (row.status || 'pending') as DeletionRequest['status'],
    created_at: row.created_at as string,
  }));
}

// ── Consent Management ──

export async function getConsentStatus(patientId: string): Promise<ConsentRecord[]> {
  const { data, error } = await supabase
    .from('patient_consents')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map(row => ({
    id: row.id as string,
    patient_id: row.patient_id as string,
    consent_type: row.consent_type as ConsentType,
    granted: row.granted as boolean,
    granted_at: (row.granted_at || null) as string | null,
    revoked_at: (row.revoked_at || null) as string | null,
    granted_by: (row.granted_by || null) as string | null,
  }));
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

  // Use the patient_consents table (created in audit_hardening migration)
  const { error } = await supabase
    .from('patient_consents')
    .insert(payload as unknown as Record<string, unknown>);

  if (error) {
    return { success: false, error: error.message };
  }

  // Also log to audit trail for immutable record
  await supabase.from('audit_logs').insert({
    user_id: consent.granted_by || null,
    action: 'consent_record',
    resource_type: 'patient',
    resource_id: patientId,
    details: payload as unknown as Json,
  });

  return { success: true };
}

export async function hasActiveConsent(
  patientId: string,
  consentType: ConsentType
): Promise<boolean> {
  const { data, error } = await supabase
    .from('patient_consents')
    .select('granted')
    .eq('patient_id', patientId)
    .eq('consent_type', consentType)
    .is('revoked_at', null)
    .eq('granted', true)
    .limit(1);

  if (error || !data || data.length === 0) return false;
  return true;
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
