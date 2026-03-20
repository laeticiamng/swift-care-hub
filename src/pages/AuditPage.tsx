import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, BarChart3, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditDashboard } from '@/components/urgence/AuditDashboard';
import { getAllKPIs, type KPIMetric } from '@/lib/kpi-tracker';
import type { ConsentType } from '@/lib/rgpd-service';
import { supabase } from '@/integrations/supabase/client';
import { buildQualityIndicators, mapLabAlert, type LabAlertRow } from '@/lib/sih-live';
import type { QualityIndicator } from '@/lib/sih-types';

export default function AuditPage() {
  const navigate = useNavigate();
  const [kpis] = useState<KPIMetric[]>(() => getAllKPIs());
  const [indicators, setIndicators] = useState<QualityIndicator[]>([]);
  const [auditCount, setAuditCount] = useState(0);
  const [criticalAlertCount, setCriticalAlertCount] = useState(0);
  const [pendingPrescriptions, setPendingPrescriptions] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'maintenance'>('operational');

  const consentTypes: { type: ConsentType; label: string }[] = [
    { type: 'data_processing', label: 'Traitement des données' },
    { type: 'data_sharing', label: 'Partage des données' },
    { type: 'research', label: 'Recherche' },
    { type: 'mssante_send', label: 'Envoi MSSanté' },
    { type: 'dmp_send', label: 'Envoi DMP' },
  ];

  useEffect(() => {
    const fetchAuditOverview = async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startIso = startDate.toISOString();

      const [encRes, timelineRes, alertRes, auditRes, prescriptionRes] = await Promise.all([
        supabase
          .from('encounters')
          .select('id, ccmu, orientation, arrival_time, triage_time')
          .gte('arrival_time', startIso),
        supabase
          .from('timeline_items')
          .select('id, item_type, created_at')
          .gte('created_at', startIso),
        supabase.from('lab_alerts' as never).select('*').gte('created_at', startIso),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      const encounters = encRes.data || [];
      const diagnostics = (timelineRes.data || []).filter((item) => item.item_type === 'diagnostic').length;
      const triaged = encounters.filter((encounter) => encounter.triage_time);
      const triageUnder10 = triaged.filter((encounter) => {
        const diffMinutes = (new Date(encounter.triage_time!).getTime() - new Date(encounter.arrival_time).getTime()) / 60000;
        return diffMinutes <= 10;
      }).length;
      const alerts = ((alertRes.data || []) as unknown as LabAlertRow[]).map(mapLabAlert);
      const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged);
      const averageAckSeconds = acknowledgedAlerts.length > 0
        ? Math.round(acknowledgedAlerts.reduce((total, alert) => total + ((new Date(alert.acknowledged_at || alert.created_at).getTime() - new Date(alert.created_at).getTime()) / 1000), 0) / acknowledgedAlerts.length)
        : 0;

      setIndicators(buildQualityIndicators({
        totalPassages: encounters.length,
        withCcmu: encounters.filter((encounter) => encounter.ccmu != null).length,
        withOrientation: encounters.filter((encounter) => encounter.orientation).length,
        triagedTotal: triaged.length,
        triageUnder10,
        acknowledgedLabAlerts: acknowledgedAlerts.length,
        totalLabAlerts: alerts.length,
        documentedDiagnostics: diagnostics,
      }));
      setAuditCount(auditRes.count ?? 0);
      setCriticalAlertCount(alerts.filter((alert) => !alert.acknowledged).length);
      setPendingPrescriptions(prescriptionRes.count ?? 0);
      setAverageResponseTime(averageAckSeconds);
      setSystemStatus(alerts.some((alert) => !alert.acknowledged) ? 'degraded' : 'operational');
    };

    fetchAuditOverview();
  }, []);

  const rgpdFeatures = useMemo(() => [
    { label: 'Art. 15 — Droit d’accès', desc: 'Export complet des données patient en JSON', icon: <Download className="h-4 w-4" /> },
    { label: 'Art. 17 — Droit à l’effacement', desc: 'Demande de suppression des données', icon: <Trash2 className="h-4 w-4" /> },
    { label: 'Art. 20 — Portabilité', desc: 'Export FHIR R4 / JSON standard', icon: <Download className="h-4 w-4" /> },
    { label: 'Gestion des consentements', desc: 'Traitement, partage, recherche, MSSanté, DMP', icon: <Shield className="h-4 w-4" /> },
    { label: 'Anonymisation des exports', desc: 'Champs sensibles automatiquement masqués', icon: <Shield className="h-4 w-4" /> },
    { label: 'Audit trail immuable', desc: 'Logs d’accès stockés dans `audit_logs` côté backend', icon: <CheckCircle2 className="h-4 w-4" /> },
  ], []);

  return (
    <div className="min-h-screen bg-background has-bottom-nav">
      <div className="sticky top-0 z-30 border-b px-4 py-3 shadow-sm bg-card/80 backdrop-blur-xl flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <span className="text-sm font-semibold">Urgence<span className="text-primary">OS</span></span>
        <span className="text-muted-foreground text-sm">— Module M8 Audit & Traçabilité</span>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="audit" className="space-y-3">
          <TabsList>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="kpis" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> KPIs</TabsTrigger>
            <TabsTrigger value="rgpd" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> RGPD</TabsTrigger>
          </TabsList>

          <TabsContent value="audit">
            <AuditDashboard
              indicators={indicators}
              auditCount={auditCount}
              criticalAlertCount={criticalAlertCount}
              pendingPrescriptions={pendingPrescriptions}
              averageResponseTime={averageResponseTime}
              systemStatus={systemStatus}
            />
          </TabsContent>

          <TabsContent value="kpis">
            <Card className="premium-surface">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> KPIs UrgenceOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {kpis.map((kpi) => (
                    <div key={kpi.name} className="p-4 rounded-lg border premium-surface-subtle space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <Badge variant={kpi.status === 'met' ? 'default' : kpi.status === 'measuring' ? 'secondary' : 'destructive'}
                          className={kpi.status === 'met' ? 'bg-emerald-500 text-white' : ''}>
                          {kpi.status === 'met' ? 'Atteint' : kpi.status === 'measuring' ? 'En cours' : 'Non atteint'}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{kpi.current ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Objectif : {kpi.target}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rgpd">
            <div className="space-y-4">
              <Card className="premium-surface">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Conformité RGPD
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rgpdFeatures.map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border premium-surface-subtle">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-surface">
                <CardHeader>
                  <CardTitle className="text-base">Types de consentement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {consentTypes.map((consentType) => (
                      <div key={consentType.type} className="flex items-center justify-between p-3 rounded-lg border premium-surface-subtle">
                        <span className="text-sm font-medium">{consentType.label}</span>
                        <Badge variant="outline" className="text-xs font-mono">{consentType.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
