import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Siren, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SAMUAlert {
  id: string;
  patientAge: number;
  patientSex: string;
  condition: string;
  severity: 'critical' | 'severe' | 'moderate';
  etaMinutes: number;
  etaStart: number;
  details: string;
  prepared: boolean;
}

const DEMO_ALERTS: SAMUAlert[] = [
  {
    id: 'samu-1',
    patientAge: 67,
    patientSex: 'M',
    condition: 'Infarctus du myocarde — STEMI antérieur',
    severity: 'critical',
    etaMinutes: 8,
    etaStart: Date.now(),
    details: 'Douleur thoracique depuis 45 min, sus-décalage V1-V4, Aspirine 250mg + Héparine administrés.',
    prepared: false,
  },
  {
    id: 'samu-2',
    patientAge: 34,
    patientSex: 'F',
    condition: 'Polytraumatisme — AVP moto',
    severity: 'severe',
    etaMinutes: 14,
    etaStart: Date.now(),
    details: 'Fracture ouverte tibia droit, suspicion trauma crânien, GCS 13, TA 95/60.',
    prepared: false,
  },
  {
    id: 'samu-3',
    patientAge: 82,
    patientSex: 'F',
    condition: 'AVC ischémique — déficit hémicorporel gauche',
    severity: 'critical',
    etaMinutes: 22,
    etaStart: Date.now(),
    details: 'Début symptômes 14h30, NIHSS estimé 12, dans la fenêtre thrombolyse.',
    prepared: false,
  },
];

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-500', badge: 'bg-red-600 text-white' },
  severe: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-500', badge: 'bg-orange-500 text-white' },
  moderate: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-500', badge: 'bg-yellow-500 text-black' },
};

export function SAMUPanel() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<SAMUAlert[]>(DEMO_ALERTS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePrepare = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, prepared: true } : a))
    );
    toast.success(t.samuPanel.roomPrepared);
  };

  const getEtaCountdown = (alert: SAMUAlert) => {
    const elapsed = (now - alert.etaStart) / 1000 / 60;
    const remaining = Math.max(0, alert.etaMinutes - elapsed);
    const mins = Math.floor(remaining);
    const secs = Math.floor((remaining - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Siren className="h-5 w-5 text-red-500" />
            {t.samuPanel.title}
          </h2>
          <p className="text-xs text-muted-foreground">{t.samuPanel.subtitle}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-red-500" />
          </span>
          {alerts.filter((a) => !a.prepared).length} {t.samuPanel.incoming}
        </Badge>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t.samuPanel.noAlerts}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const styles = SEVERITY_STYLES[alert.severity];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`border-l-4 ${styles.border} ${styles.bg}`}>
                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={styles.badge}>{alert.severity.toUpperCase()}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {t.samuPanel.age}: {alert.patientAge} — {alert.patientSex}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">{alert.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t.samuPanel.eta}</p>
                        <p className="text-2xl font-black tabular-nums text-orange-600 dark:text-orange-400">
                          {getEtaCountdown(alert)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{alert.details}</p>

                    <div className="flex justify-end">
                      {alert.prepared ? (
                        <Button variant="outline" disabled className="gap-1.5">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {t.samuPanel.roomPrepared}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="gap-1.5 bg-orange-600 hover:bg-orange-700"
                          onClick={() => handlePrepare(alert.id)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          {t.samuPanel.prepareRoom}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
