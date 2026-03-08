import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, Activity, Bed } from 'lucide-react';
import { motion } from 'framer-motion';

interface Zone {
  id: string;
  name: string;
  status: 'normal' | 'busy' | 'critical';
  patients: number;
  capacity: number;
  avgWait: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BottleneckAlert {
  id: string;
  zone: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
}

const DEMO_ZONES: Zone[] = [
  { id: 'triage', name: 'Triage / IOA', status: 'busy', patients: 8, capacity: 6, avgWait: 35, x: 10, y: 10, width: 25, height: 35 },
  { id: 'sau', name: 'SAU', status: 'normal', patients: 12, capacity: 20, avgWait: 15, x: 40, y: 10, width: 50, height: 35 },
  { id: 'dechocage', name: 'Déchocage', status: 'critical', patients: 3, capacity: 3, avgWait: 0, x: 10, y: 52, width: 25, height: 38 },
  { id: 'uhcd', name: 'UHCD', status: 'busy', patients: 9, capacity: 10, avgWait: 120, x: 40, y: 52, width: 30, height: 38 },
  { id: 'imagerie', name: 'Imagerie', status: 'normal', patients: 4, capacity: 8, avgWait: 25, x: 75, y: 52, width: 15, height: 38 },
];

const DEMO_ALERTS: BottleneckAlert[] = [
  { id: '1', zone: 'Triage', message: 'File d\'attente > 30 min — 8 patients en attente de triage', severity: 'warning', timestamp: new Date() },
  { id: '2', zone: 'Déchocage', message: 'Capacité maximale atteinte — 3/3 boxes occupés', severity: 'critical', timestamp: new Date(Date.now() - 300_000) },
];

const STATUS_COLORS = {
  normal: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-700 dark:text-green-400', fill: '#22c55e' },
  busy: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-400', fill: '#f97316' },
  critical: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-700 dark:text-red-400', fill: '#ef4444' },
};

export function FlowDashboard() {
  const { t } = useI18n();
  const [zones] = useState<Zone[]>(DEMO_ZONES);
  const [alerts] = useState<BottleneckAlert[]>(DEMO_ALERTS);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const totals = {
    waiting: zones.reduce((s, z) => s + Math.max(0, z.patients - z.capacity), 0) + 5,
    inTreatment: zones.reduce((s, z) => s + Math.min(z.patients, z.capacity), 0),
    awaitingResults: 7,
    awaitingBed: 4,
  };

  return (
    <div className="space-y-6">
      {/* Status counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: t.flow.waiting, value: totals.waiting, color: 'text-orange-500' },
          { icon: Activity, label: t.flow.inTreatment, value: totals.inTreatment, color: 'text-green-500' },
          { icon: Users, label: t.flow.awaitingResults, value: totals.awaitingResults, color: 'text-blue-500' },
          { icon: Bed, label: t.flow.awaitingBed, value: totals.awaitingBed, color: 'text-red-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floor map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t.flow.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{t.flow.subtitle} — {now.toLocaleTimeString()}</p>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[16/9] bg-muted/30 rounded-xl border overflow-hidden">
            {zones.map((zone, i) => {
              const colors = STATUS_COLORS[zone.status];
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`absolute rounded-lg border-2 ${colors.border} ${colors.bg} p-2 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                >
                  <div>
                    <p className="text-xs font-bold truncate">{zone.name}</p>
                    <Badge variant="outline" className={`text-[10px] mt-0.5 ${colors.text} border-current`}>
                      {zone.status === 'normal' ? t.flow.zoneNormal : zone.status === 'busy' ? t.flow.zoneBusy : t.flow.zoneCritical}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end text-[10px]">
                    <span className="font-semibold">{zone.patients}/{zone.capacity} {t.flow.patients}</span>
                    <span className="text-muted-foreground">{t.flow.avgWait}: {zone.avgWait}{t.flow.minutes}</span>
                  </div>
                  {/* Pulsing dot for critical */}
                  {zone.status === 'critical' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t.flow.bottleneckAlerts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t.flow.noAlerts}</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{alert.zone}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round((now.getTime() - alert.timestamp.getTime()) / 60_000)} min
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{alert.message}</p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
