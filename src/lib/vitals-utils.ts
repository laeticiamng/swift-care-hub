export interface VitalThresholds {
  min?: number;
  max?: number;
}

export const VITAL_THRESHOLDS: Record<string, VitalThresholds> = {
  fc: { min: 50, max: 120 },
  pa_systolique: { min: 90, max: 180 },
  pa_diastolique: { min: 50, max: 110 },
  spo2: { min: 94 },
  temperature: { min: 35, max: 38.5 },
  frequence_respiratoire: { min: 10, max: 25 },
  gcs: { min: 15, max: 15 },
};

export function isVitalAbnormal(key: string, value: number | null | undefined): boolean {
  if (value == null) return false;
  const t = VITAL_THRESHOLDS[key];
  if (!t) return false;
  if (t.min !== undefined && value < t.min) return true;
  if (t.max !== undefined && value > t.max) return true;
  return false;
}

export function calculateAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getWaitTimeMinutes(arrivalTime: string): number {
  return Math.floor((Date.now() - new Date(arrivalTime).getTime()) / 60000);
}

export function formatWaitTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
}
