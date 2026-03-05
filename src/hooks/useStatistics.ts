import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { DEMO_ENCOUNTERS } from '@/lib/demo-data';

export type StatPeriod = 'today' | 'week' | 'month' | 'quarter';

export interface StatsData {
  loading: boolean;
  totalPassages: number;
  patientsEnCours: number;
  avgPassageMinutes: number;
  hospitalisationRate: number;
  sortiesSignees: number;
  bioEnAttente: number;
  hourlyArrivals: { hour: string; arrivals: number; discharges: number }[];
  ccmuDistribution: { level: number; label: string; count: number; pct: number }[];
  zoneOccupancy: { zone: string; label: string; current: number; capacity: number }[];
  topMotifs: { motif: string; count: number; pct: number }[];
  qualityIndicators: { label: string; value: number; target: number }[];
}

const ZONE_CAPACITIES: Record<string, { label: string; capacity: number }> = {
  sau: { label: 'SAU', capacity: 16 },
  uhcd: { label: 'UHCD', capacity: 16 },
  dechocage: { label: 'Déchocage', capacity: 3 },
};

const CCMU_LABELS: Record<number, string> = {
  1: 'CCMU 1 — Vital immédiat',
  2: 'CCMU 2 — Urgence vraie',
  3: 'CCMU 3 — Urgence relative',
  4: 'CCMU 4 — Semi-urgent',
  5: 'CCMU 5 — Non urgent',
};

function periodStart(period: StatPeriod): Date {
  const now = new Date();
  switch (period) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    case 'quarter': { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
  }
}

// Generate demo statistics when in demo mode
function generateDemoStats(): StatsData {
  const encounters = DEMO_ENCOUNTERS;
  const now = new Date();

  const hourlyArrivals = Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0') + ':00';
    const base = i >= 10 && i <= 14 ? 8 : i >= 18 && i <= 22 ? 10 : i >= 2 && i <= 6 ? 1 : 4;
    const arrivals = base + Math.floor(Math.random() * 3);
    return { hour: h, arrivals, discharges: Math.max(0, arrivals - 1 + Math.floor(Math.random() * 3)) };
  });

  const ccmuDistribution = [1, 2, 3, 4, 5].map(level => {
    const count = encounters.filter(e => e.ccmu === level).length || (level === 3 ? 12 : level === 2 ? 5 : level === 4 ? 8 : 2);
    return { level, label: CCMU_LABELS[level], count, pct: 0 };
  });
  const totalCcmu = ccmuDistribution.reduce((s, c) => s + c.count, 0) || 1;
  ccmuDistribution.forEach(c => c.pct = Math.round((c.count / totalCcmu) * 1000) / 10);

  const zoneOccupancy = Object.entries(ZONE_CAPACITIES).map(([zone, cfg]) => ({
    zone, label: cfg.label,
    current: encounters.filter(e => e.zone === zone && e.status !== 'finished').length,
    capacity: cfg.capacity,
  }));

  const motifMap: Record<string, number> = {};
  encounters.forEach(e => {
    if (e.motif_sfmu) motifMap[e.motif_sfmu] = (motifMap[e.motif_sfmu] || 0) + 1;
  });
  const totalMotifs = encounters.length || 1;
  const topMotifs = Object.entries(motifMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([motif, count]) => ({ motif, count, pct: Math.round((count / totalMotifs) * 1000) / 10 }));

  const finished = encounters.filter(e => e.status === 'finished');
  const avgMs = finished.length > 0
    ? 4.2 * 3600000 // Demo: ~4h12 average
    : 4.2 * 3600000;

  return {
    loading: false,
    totalPassages: encounters.length || 127,
    patientsEnCours: encounters.filter(e => e.status !== 'finished').length,
    avgPassageMinutes: Math.round(avgMs / 60000),
    hospitalisationRate: 28,
    sortiesSignees: finished.length || 89,
    bioEnAttente: 8,
    hourlyArrivals,
    ccmuDistribution,
    zoneOccupancy,
    topMotifs,
    qualityIndicators: [
      { label: 'Taux RPU complets', value: 94.2, target: 95 },
      { label: 'Diagnostic renseigné', value: 97.8, target: 95 },
      { label: 'CCMU renseigné', value: 99.1, target: 95 },
      { label: 'Mode sortie renseigné', value: 96.5, target: 95 },
      { label: 'Délai IOA < 10 min', value: 82.3, target: 90 },
      { label: 'Délai médecin < 60 min', value: 71.5, target: 80 },
      { label: 'CRH envoyé au MT', value: 67.2, target: 80 },
      { label: 'INS qualifié', value: 88.1, target: 85 },
    ],
  };
}

export function useStatistics(period: StatPeriod) {
  const { isDemoMode } = useDemo();
  const [data, setData] = useState<StatsData>({
    loading: true, totalPassages: 0, patientsEnCours: 0, avgPassageMinutes: 0,
    hospitalisationRate: 0, sortiesSignees: 0, bioEnAttente: 0,
    hourlyArrivals: [], ccmuDistribution: [], zoneOccupancy: [], topMotifs: [], qualityIndicators: [],
  });

  useEffect(() => {
    if (isDemoMode) {
      setData(generateDemoStats());
      return;
    }

    let cancelled = false;
    async function fetchStats() {
      setData(prev => ({ ...prev, loading: true }));
      const start = periodStart(period).toISOString();

      // Fetch encounters in period
      const { data: encounters } = await supabase
        .from('encounters')
        .select('id, status, zone, ccmu, motif_sfmu, arrival_time, discharge_time, triage_time, orientation')
        .gte('arrival_time', start)
        .order('arrival_time', { ascending: true });

      // Fetch unread bio results
      const { count: bioCount } = await supabase
        .from('results')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('category', 'bio');

      if (cancelled) return;
      const enc = encounters || [];
      const now = new Date();

      // Total passages
      const totalPassages = enc.length;

      // Patients en cours
      const patientsEnCours = enc.filter(e => e.status !== 'finished').length;

      // Average passage time
      const finished = enc.filter(e => e.status === 'finished' && e.discharge_time);
      const avgMs = finished.length > 0
        ? finished.reduce((s, e) => s + (new Date(e.discharge_time!).getTime() - new Date(e.arrival_time).getTime()), 0) / finished.length
        : 0;

      // Hospitalisation rate
      const hospitalized = finished.filter(e => e.orientation && ['hospitalisation', 'uhcd', 'réa', 'chirurgie'].some(k => e.orientation!.toLowerCase().includes(k)));
      const hospitalisationRate = finished.length > 0 ? Math.round((hospitalized.length / finished.length) * 100) : 0;

      // Hourly arrivals
      const hourMap: Record<string, { arrivals: number; discharges: number }> = {};
      for (let i = 0; i < 24; i++) hourMap[String(i).padStart(2, '0') + ':00'] = { arrivals: 0, discharges: 0 };
      enc.forEach(e => {
        const h = String(new Date(e.arrival_time).getHours()).padStart(2, '0') + ':00';
        if (hourMap[h]) hourMap[h].arrivals++;
        if (e.discharge_time) {
          const dh = String(new Date(e.discharge_time).getHours()).padStart(2, '0') + ':00';
          if (hourMap[dh]) hourMap[dh].discharges++;
        }
      });
      const hourlyArrivals = Object.entries(hourMap).map(([hour, v]) => ({ hour, ...v }));

      // CCMU distribution
      const ccmuMap: Record<number, number> = {};
      enc.forEach(e => { if (e.ccmu) ccmuMap[e.ccmu] = (ccmuMap[e.ccmu] || 0) + 1; });
      const totalCcmu = Object.values(ccmuMap).reduce((s, v) => s + v, 0) || 1;
      const ccmuDistribution = [1, 2, 3, 4, 5].map(level => ({
        level,
        label: CCMU_LABELS[level],
        count: ccmuMap[level] || 0,
        pct: Math.round(((ccmuMap[level] || 0) / totalCcmu) * 1000) / 10,
      }));

      // Zone occupancy (current)
      const { data: currentEnc } = await supabase
        .from('encounters')
        .select('zone')
        .in('status', ['arrived', 'triaged', 'in-progress']);
      if (cancelled) return;

      const zoneCounts: Record<string, number> = {};
      (currentEnc || []).forEach(e => { if (e.zone) zoneCounts[e.zone] = (zoneCounts[e.zone] || 0) + 1; });
      const zoneOccupancy = Object.entries(ZONE_CAPACITIES).map(([zone, cfg]) => ({
        zone, label: cfg.label,
        current: zoneCounts[zone] || 0,
        capacity: cfg.capacity,
      }));

      // Top motifs
      const motifMap: Record<string, number> = {};
      enc.forEach(e => { if (e.motif_sfmu) motifMap[e.motif_sfmu] = (motifMap[e.motif_sfmu] || 0) + 1; });
      const topMotifs = Object.entries(motifMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([motif, count]) => ({ motif, count, pct: Math.round((count / totalPassages) * 1000) / 10 }));

      // Quality indicators
      const withCcmu = enc.filter(e => e.ccmu != null).length;
      const withDiag = enc.filter(e => e.orientation != null).length;
      const withTriage = enc.filter(e => e.triage_time != null);
      const triageUnder10 = withTriage.filter(e => {
        const diff = (new Date(e.triage_time!).getTime() - new Date(e.arrival_time).getTime()) / 60000;
        return diff <= 10;
      });

      const qualityIndicators = [
        { label: 'CCMU renseigné', value: totalPassages > 0 ? Math.round((withCcmu / totalPassages) * 1000) / 10 : 0, target: 95 },
        { label: 'Orientation renseignée', value: finished.length > 0 ? Math.round((withDiag / totalPassages) * 1000) / 10 : 0, target: 95 },
        { label: 'Délai IOA < 10 min', value: withTriage.length > 0 ? Math.round((triageUnder10.length / withTriage.length) * 1000) / 10 : 0, target: 90 },
      ];

      setData({
        loading: false,
        totalPassages,
        patientsEnCours,
        avgPassageMinutes: Math.round(avgMs / 60000),
        hospitalisationRate,
        sortiesSignees: finished.length,
        bioEnAttente: bioCount || 0,
        hourlyArrivals,
        ccmuDistribution,
        zoneOccupancy,
        topMotifs,
        qualityIndicators,
      });
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [period, isDemoMode]);

  return data;
}
