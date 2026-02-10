/**
 * M8 — Audit & System Traceability Service
 * Requirement M8-01: Exhaustive logging - who, when, which patient (IPP), which workstation, which module, which action
 * Immutable, 10-year retention
 */

import { supabase } from '@/integrations/supabase/client';
import type { AuditEntry } from './sih-types';

class AuditService {
  private queue: Omit<AuditEntry, 'id' | 'created_at'>[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  async log(entry: Omit<AuditEntry, 'id' | 'created_at' | 'ip_address' | 'workstation'>): Promise<void> {
    const fullEntry: Omit<AuditEntry, 'id' | 'created_at'> = {
      ...entry,
      ip_address: 'client',
      workstation: navigator.userAgent?.substring(0, 100) || 'unknown',
    };

    this.queue.push(fullEntry);

    // Immediate flush for critical actions
    const criticalActions = ['prescription_created', 'administration_confirmed', 'identity_verified', 'critical_alert_acknowledged'];
    if (criticalActions.includes(entry.action)) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase.from('audit_logs').insert(
        batch.map(entry => ({
          user_id: entry.user_id,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id || null,
          action: entry.action,
          details: {
            user_name: entry.user_name,
            patient_id: entry.patient_id,
            patient_ipp: entry.patient_ipp,
            module: entry.module,
            ip_address: entry.ip_address,
            workstation: entry.workstation,
            ...entry.details,
          },
        }))
      );

      if (error) {
        // Put back in queue on failure
        this.queue.unshift(...batch);
        console.error('[AuditService] flush error:', error);
      }
    } catch (err) {
      this.queue.unshift(...batch);
      console.error('[AuditService] flush exception:', err);
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const auditService = new AuditService();

// Convenience helpers for common audit actions
export const auditActions = {
  patientAccess: (userId: string, userName: string, patientId: string, patientIpp: string, module: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module,
      action: 'patient_accessed',
      resource_type: 'patient',
      resource_id: patientId,
      details: {},
    }),

  prescriptionCreated: (userId: string, userName: string, patientId: string, patientIpp: string, prescriptionId: string, origin: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module: 'M4-Prescription',
      action: 'prescription_created',
      resource_type: 'prescription',
      resource_id: prescriptionId,
      details: { origin },
    }),

  administrationConfirmed: (userId: string, userName: string, patientId: string, patientIpp: string, prescriptionId: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module: 'M5-Administration',
      action: 'administration_confirmed',
      resource_type: 'administration',
      resource_id: prescriptionId,
      details: {},
    }),

  identityVerified: (userId: string, userName: string, patientId: string, patientIpp: string, method: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module: 'M1-Identity',
      action: 'identity_verified',
      resource_type: 'patient',
      resource_id: patientId,
      details: { method },
    }),

  criticalAlertAcknowledged: (userId: string, userName: string, patientId: string, patientIpp: string, alertId: string, analyte: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module: 'M3-LabAlerts',
      action: 'critical_alert_acknowledged',
      resource_type: 'lab_alert',
      resource_id: alertId,
      details: { analyte },
    }),

  communicationCreated: (userId: string, userName: string, patientId: string, patientIpp: string, commType: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      patient_id: patientId,
      patient_ipp: patientIpp,
      module: 'M6-Communication',
      action: 'communication_created',
      resource_type: 'communication',
      details: { type: commType },
    }),

  homonymyDetected: (userId: string, userName: string, patientAId: string, patientBId: string) =>
    auditService.log({
      user_id: userId,
      user_name: userName,
      module: 'M1-Identity',
      action: 'homonymy_detected',
      resource_type: 'patient',
      details: { patient_a_id: patientAId, patient_b_id: patientBId },
    }),
};
