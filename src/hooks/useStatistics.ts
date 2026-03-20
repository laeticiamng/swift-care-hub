import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useStatistics(period: StatPeriod) {
  const [data, setData] = useState<StatsData>({
    loading: true, totalPassages: 0, patientsEnCours: 0, avgPassageMinutes: 0,
    hospitalisationRate: 0, sortiesSignees: 0, bioEnAttente: 0,
    hourlyArrivals: [], ccmuDistribution: [], zoneOccupancy: [], topMotifs: [], qualityIndicators: [],
  });

  useEffect(() => {
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
  }, [period]);

  return data;
}
