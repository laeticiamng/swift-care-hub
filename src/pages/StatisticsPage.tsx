import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { useStatistics, type StatPeriod } from '@/hooks/useStatistics';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Download, Clock, Users, Activity, TrendingUp,
  AlertTriangle, CheckCircle, BarChart3, Timer, Bed, Stethoscope, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const PERIODS: { label: string; value: StatPeriod }[] = [
  { label: "Aujourd'hui", value: 'today' },
  { label: 'Semaine', value: 'week' },
  { label: 'Mois', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
];

const CCMU_COLORS = ['hsl(0 72% 51%)', 'hsl(25 95% 53%)', 'hsl(45 93% 47%)', 'hsl(217 91% 60%)', 'hsl(142 76% 36%)'];
const ZONE_COLORS: Record<string, string> = { sau: 'hsl(217 91% 60%)', uhcd: 'hsl(271 91% 65%)', dechocage: 'hsl(0 72% 51%)' };

function formatMinutes(m: number): string {
  if (m <= 0) return '—';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h${String(min).padStart(2, '0')}` : `${min} min`;
}

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<StatPeriod>('today');
  const stats = useStatistics(period);

  const handleExportCSV = () => {
    const rows = [
      ['Indicateur', 'Valeur'],
      ['Total passages', String(stats.totalPassages)],
      ['Patients en cours', String(stats.patientsEnCours)],
      ['Durée moy. passage', formatMinutes(stats.avgPassageMinutes)],
      ['Taux hospitalisation', `${stats.hospitalisationRate}%`],
      ['Sorties signées', String(stats.sortiesSignees)],
      ['Bio en attente', String(stats.bioEnAttente)],
      [],
      ['Heure', 'Arrivées', 'Sorties'],
      ...stats.hourlyArrivals.map(h => [h.hour, String(h.arrivals), String(h.discharges)]),
      [],
      ['CCMU', 'Nombre', '%'],
      ...stats.ccmuDistribution.map(c => [c.label, String(c.count), `${c.pct}%`]),
      [],
      ['Zone', 'Occupés', 'Capacité'],
      ...stats.zoneOccupancy.map(z => [z.label, String(z.current), String(z.capacity)]),
      [],
      ['Motif', 'Nombre', '%'],
      ...stats.topMotifs.map(m => [m.motif, String(m.count), `${m.pct}%`]),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `urgenceos-stats-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportRPU = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RPU_EXPORT>
  <PERIODE>${period}</PERIODE>
  <DATE_EXPORT>${new Date().toISOString()}</DATE_EXPORT>
  <NB_PASSAGES>${stats.totalPassages}</NB_PASSAGES>
  <DUREE_MOYENNE_PASSAGE>${formatMinutes(stats.avgPassageMinutes)}</DUREE_MOYENNE_PASSAGE>
  <TAUX_HOSPITALISATION>${stats.hospitalisationRate}</TAUX_HOSPITALISATION>
  <PATIENTS_EN_COURS>${stats.patientsEnCours}</PATIENTS_EN_COURS>
  <SORTIES_SIGNEES>${stats.sortiesSignees}</SORTIES_SIGNEES>
</RPU_EXPORT>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `urgenceos-rpu-${period}-${new Date().toISOString().slice(0, 10)}.xml`;
    a.click(); URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: 'Passages', value: stats.totalPassages, icon: Users, color: 'text-primary' },
    { label: 'En cours', value: stats.patientsEnCours, icon: Activity, color: 'text-destructive' },
    { label: 'Durée moy.', value: formatMinutes(stats.avgPassageMinutes), icon: Clock, color: 'text-amber-500' },
    { label: 'Hospitalisation', value: `${stats.hospitalisationRate}%`, icon: Bed, color: 'text-purple-500' },
    { label: 'Sorties signées', value: stats.sortiesSignees, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Bio en attente', value: stats.bioEnAttente, icon: Stethoscope, color: 'text-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b shadow-sm px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/board')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> <span className="hidden sm:inline">Statistiques</span><span className="sm:hidden">Stats</span>
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex">Temps réel</Badge>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide flex-nowrap">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border transition-all whitespace-nowrap shrink-0',
                  period === p.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border'
                )}
              >
                {p.label}
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="shrink-0 h-8 px-2 sm:px-3">
              <Download className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportRPU} className="shrink-0 h-8 px-2 sm:px-3">
              <Download className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">RPU</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {stats.loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-card border rounded-xl p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className={cn('h-4 w-4', kpi.color)} />
                </div>
                <span className="text-2xl font-bold">{kpi.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flux horaire — AreaChart */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Flux horaire des passages
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.hourlyArrivals} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="arrivals" name="Arrivées" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="discharges" name="Sorties" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent) / 0.3)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution CCMU — PieChart */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Distribution CCMU
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.ccmuDistribution.filter(c => c.count > 0)}
                    dataKey="count"
                    nameKey="label"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ label, pct }) => `${pct}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {stats.ccmuDistribution.filter(c => c.count > 0).map((_, i) => (
                      <Cell key={i} fill={CCMU_COLORS[i % CCMU_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} patients`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Occupation par zone — BarChart */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bed className="h-4 w-4" /> Occupation par zone
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.zoneOccupancy} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={70} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string, props: any) => {
                      const item = props.payload;
                      return [`${value} / ${item.capacity}`, 'Occupation'];
                    }}
                  />
                  <Bar dataKey="current" name="Occupés" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {stats.zoneOccupancy.map((z) => (
                      <Cell key={z.zone} fill={ZONE_COLORS[z.zone] || 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                  <Bar dataKey="capacity" name="Capacité" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top motifs — BarChart horizontal */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Top motifs de consultation
              </h3>
              {stats.topMotifs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">Aucun motif enregistré</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, stats.topMotifs.length * 32)}>
                  <BarChart data={stats.topMotifs} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis dataKey="motif" type="category" tick={{ fontSize: 10 }} width={100} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.pct}%)`, 'Patients']}
                    />
                    <Bar dataKey="count" name="Patients" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Indicateurs qualité */}
          {stats.qualityIndicators.length > 0 && (
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Indicateurs qualité (conformité ATIH)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.qualityIndicators.map(ind => {
                  const ok = ind.value >= ind.target;
                  return (
                    <div
                      key={ind.label}
                      className={cn(
                        'border rounded-lg p-3',
                        ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
                      )}
                    >
                      <div className="text-xs text-muted-foreground mb-1">{ind.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">{ind.value}%</span>
                        <span className="text-xs text-muted-foreground">/ {ind.target}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div
                          className={cn('h-1.5 rounded-full transition-all', ok ? 'bg-emerald-500' : 'bg-amber-500')}
                          style={{ width: `${Math.min(100, (ind.value / ind.target) * 100)}%` }}
                        />
                      </div>
                      <div className={cn('text-xs mt-1', ok ? 'text-emerald-500' : 'text-amber-500')}>
                        {ok ? '✓ Conforme' : '⚠ En dessous'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
