/**
 * UrgenceOS — KPI Tracker
 * Real-time measurement and benchmarking of UrgenceOS performance KPIs:
 * - <2min tri IOA
 * - 1 tap administration (measure actual taps)
 * - <90s admission
 * - 0 changement de page IDE
 * - >4h mode offline
 */

export interface KPIMetric {
  name: string;
  target: string;
  current: number | null;
  unit: string;
  status: 'met' | 'not_met' | 'measuring';
  measured_at: string;
}

// ── Internal timers storage ──
const timers: Record<string, number> = {};
const tapCounts: Record<string, number> = {};
const measurements: Record<string, number[]> = {};

// ── IOA Triage timing ──
export function startTriageTimer(encounterId: string): void {
  timers[`triage_${encounterId}`] = Date.now();
}

export function stopTriageTimer(encounterId: string): number {
  const key = `triage_${encounterId}`;
  const start = timers[key];
  if (!start) return -1;
  const elapsed = Math.round((Date.now() - start) / 1000);
  delete timers[key];

  if (!measurements.triage) measurements.triage = [];
  measurements.triage.push(elapsed);

  return elapsed;
}

export function getAverageTriageTime(): number | null {
  const m = measurements.triage;
  if (!m || m.length === 0) return null;
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

// ── Administration tap count ──
export function trackAdministrationTap(prescriptionId: string): void {
  const key = `admin_${prescriptionId}`;
  tapCounts[key] = (tapCounts[key] || 0) + 1;
}

export function getAdministrationTapCount(prescriptionId: string): number {
  return tapCounts[`admin_${prescriptionId}`] || 0;
}

export function getAverageAdminTaps(): number | null {
  const values = Object.entries(tapCounts)
    .filter(([k]) => k.startsWith('admin_'))
    .map(([, v]) => v);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// ── Admission timing ──
export function startAdmissionTimer(encounterId: string): void {
  timers[`admission_${encounterId}`] = Date.now();
}

export function stopAdmissionTimer(encounterId: string): number {
  const key = `admission_${encounterId}`;
  const start = timers[key];
  if (!start) return -1;
  const elapsed = Math.round((Date.now() - start) / 1000);
  delete timers[key];

  if (!measurements.admission) measurements.admission = [];
  measurements.admission.push(elapsed);

  return elapsed;
}

export function getAverageAdmissionTime(): number | null {
  const m = measurements.admission;
  if (!m || m.length === 0) return null;
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

// ── IDE page change tracking ──
let idePageChanges = 0;

export function trackIDEPageChange(): void {
  idePageChanges++;
}

export function resetIDEPageChanges(): void {
  idePageChanges = 0;
}

export function getIDEPageChanges(): number {
  return idePageChanges;
}

// ── Offline duration ──
let offlineStart: number | null = null;
let maxOfflineDuration = 0;

export function startOfflineTracking(): void {
  if (!offlineStart) offlineStart = Date.now();
}

export function stopOfflineTracking(): number {
  if (!offlineStart) return 0;
  const duration = Math.round((Date.now() - offlineStart) / 1000);
  if (duration > maxOfflineDuration) maxOfflineDuration = duration;
  offlineStart = null;
  return duration;
}

export function getMaxOfflineDuration(): number {
  if (offlineStart) {
    const current = Math.round((Date.now() - offlineStart) / 1000);
    return Math.max(maxOfflineDuration, current);
  }
  return maxOfflineDuration;
}

// ── Get all KPIs ──
export function getAllKPIs(): KPIMetric[] {
  const now = new Date().toISOString();

  const avgTriage = getAverageTriageTime();
  const avgAdmin = getAverageAdminTaps();
  const avgAdmission = getAverageAdmissionTime();
  const pageChanges = getIDEPageChanges();
  const offlineSecs = getMaxOfflineDuration();

  return [
    {
      name: 'Tri IOA',
      target: '<120s (2 min)',
      current: avgTriage,
      unit: 'secondes',
      status: avgTriage === null ? 'measuring' : avgTriage <= 120 ? 'met' : 'not_met',
      measured_at: now,
    },
    {
      name: 'Taps administration',
      target: '1 tap',
      current: avgAdmin,
      unit: 'taps',
      status: avgAdmin === null ? 'measuring' : avgAdmin <= 2 ? 'met' : 'not_met',
      measured_at: now,
    },
    {
      name: 'Admission secretaire',
      target: '<90s',
      current: avgAdmission,
      unit: 'secondes',
      status: avgAdmission === null ? 'measuring' : avgAdmission <= 90 ? 'met' : 'not_met',
      measured_at: now,
    },
    {
      name: 'Changements page IDE',
      target: '0',
      current: pageChanges,
      unit: 'pages',
      status: pageChanges === 0 ? 'met' : 'not_met',
      measured_at: now,
    },
    {
      name: 'Mode offline',
      target: '>14400s (4h)',
      current: offlineSecs,
      unit: 'secondes',
      status: offlineSecs === 0 ? 'measuring' : offlineSecs >= 14400 ? 'met' : 'not_met',
      measured_at: now,
    },
  ];
}

// ── Reset all measurements ──
export function resetAllKPIs(): void {
  Object.keys(timers).forEach(k => delete timers[k]);
  Object.keys(tapCounts).forEach(k => delete tapCounts[k]);
  Object.keys(measurements).forEach(k => delete measurements[k]);
  idePageChanges = 0;
  offlineStart = null;
  maxOfflineDuration = 0;
}
