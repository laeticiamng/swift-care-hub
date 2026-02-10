/**
 * M3 — Lab Alert Thresholds & Critical Result Detection
 * Configurable thresholds for critical lab values
 * Push notification to prescriber + on-call physician
 */

import type { LabAlert, LabAlertThreshold, EscalationLevel } from './sih-types';
import { DEFAULT_LAB_THRESHOLDS } from './sih-types';

export function checkCriticalThreshold(
  analyte: string,
  value: number,
  thresholds: LabAlertThreshold[] = DEFAULT_LAB_THRESHOLDS as LabAlertThreshold[]
): { isCritical: boolean; exceeded?: 'low' | 'high'; threshold?: LabAlertThreshold } {
  const threshold = thresholds.find(
    t => t.analyte.toLowerCase().includes(analyte.toLowerCase()) && t.is_active
  );

  if (!threshold) return { isCritical: false };

  if (threshold.critical_low !== undefined && value < threshold.critical_low) {
    return { isCritical: true, exceeded: 'low', threshold };
  }

  if (threshold.critical_high !== undefined && value > threshold.critical_high) {
    return { isCritical: true, exceeded: 'high', threshold };
  }

  return { isCritical: false };
}

/**
 * M3-03 — Escalation levels
 * Level 1: Reminder after 5 min
 * Level 2: Senior notification after 10 min
 * Level 3: Chief on-call after 15 min
 */
export function getNextEscalationLevel(current: EscalationLevel): EscalationLevel | null {
  if (current >= 3) return null;
  return (current + 1) as EscalationLevel;
}

export function getEscalationTimeout(level: EscalationLevel): number {
  switch (level) {
    case 1: return 5 * 60 * 1000;  // 5 minutes
    case 2: return 10 * 60 * 1000; // 10 minutes
    case 3: return 15 * 60 * 1000; // 15 minutes
  }
}

export function getEscalationLabel(level: EscalationLevel): string {
  switch (level) {
    case 1: return 'Rappel prescripteur';
    case 2: return 'Notification senior';
    case 3: return 'Alerte chef de garde';
  }
}

/**
 * M3-04 — Cross-verification IPP
 * Check that the lab result IPP matches the active patient IPP
 */
export function verifyLabResultIPP(resultIPP: string, activePatientIPP: string): boolean {
  return resultIPP.trim() === activePatientIPP.trim();
}

/**
 * M5-04 — Pre-administration electrolyte alert
 * Alert before administering K, Ca, Na preparations
 */
export function isElectrolyteMedication(medicationName: string): { isElectrolyte: boolean; type?: 'K' | 'Ca' | 'Na' } {
  const normalized = medicationName.toLowerCase();

  if (normalized.includes('potassium') || normalized.includes('kcl') || normalized.includes('k+') || normalized.includes('diffu-k')) {
    return { isElectrolyte: true, type: 'K' };
  }
  if (normalized.includes('calcium') || normalized.includes('cacl') || normalized.includes('ca2+') || normalized.includes('gluconate de calcium')) {
    return { isElectrolyte: true, type: 'Ca' };
  }
  if (normalized.includes('sodium') || normalized.includes('nacl') || normalized.includes('na+') || normalized.includes('serum sale')) {
    return { isElectrolyte: true, type: 'Na' };
  }

  return { isElectrolyte: false };
}

/**
 * Format lab value with unit for display
 */
export function formatLabValue(value: number, unit: string, analyte: string): string {
  return `${analyte}: ${value} ${unit}`;
}

/**
 * Get severity color based on threshold
 */
export function getLabValueColor(analyte: string, value: number): string {
  const result = checkCriticalThreshold(analyte, value);
  if (result.isCritical) return 'text-red-600 dark:text-red-400 font-bold';
  return 'text-foreground';
}
