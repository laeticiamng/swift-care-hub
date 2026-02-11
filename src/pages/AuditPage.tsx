/**
 * Audit Dashboard Page — M8 Quality & Traceability + RGPD + KPIs
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, BarChart3, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditDashboard } from '@/components/urgence/AuditDashboard';
import { SIH_QUALITY_INDICATORS, SIH_LAB_ALERTS } from '@/lib/sih-demo-data';
import { getAllKPIs, type KPIMetric } from '@/lib/kpi-tracker';
import type { ConsentType } from '@/lib/rgpd-service';

export default function AuditPage() {
  const navigate = useNavigate();
  const [kpis] = useState<KPIMetric[]>(() => getAllKPIs());

  const consentTypes: { type: ConsentType; label: string }[] = [
    { type: 'data_processing', label: 'Traitement des donnees' },
    { type: 'data_sharing', label: 'Partage des donnees' },
    { type: 'research', label: 'Recherche' },
    { type: 'mssante_send', label: 'Envoi MSSante' },
    { type: 'dmp_send', label: 'Envoi DMP' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b px-4 py-3 shadow-sm bg-card/80 backdrop-blur-xl flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <span className="text-sm font-semibold">Urgence<span className="text-primary">OS</span></span>
        <span className="text-muted-foreground text-sm">— Module M8 Audit & Tracabilite</span>
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
              indicators={SIH_QUALITY_INDICATORS}
              auditCount={1247}
              criticalAlertCount={SIH_LAB_ALERTS.filter(a => !a.acknowledged).length}
              pendingPrescriptions={3}
              averageResponseTime={187}
              systemStatus="operational"
            />
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> KPIs UrgenceOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {kpis.map(kpi => (
                    <div key={kpi.name} className="p-4 rounded-lg border space-y-2">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Conformite RGPD
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Art. 15 — Droit d\'acces', desc: 'Export complet des donnees patient en JSON', icon: <Download className="h-4 w-4" />, active: true },
                      { label: 'Art. 17 — Droit a l\'effacement', desc: 'Demande de suppression des donnees', icon: <Trash2 className="h-4 w-4" />, active: true },
                      { label: 'Art. 20 — Portabilite', desc: 'Export FHIR R4 / JSON standard', icon: <Download className="h-4 w-4" />, active: true },
                      { label: 'Gestion des consentements', desc: 'Traitement, partage, recherche, MSSante, DMP', icon: <Shield className="h-4 w-4" />, active: true },
                      { label: 'Anonymisation exports', desc: 'Champs sensibles automatiquement masques', icon: <Shield className="h-4 w-4" />, active: true },
                      { label: 'Audit trail immutable', desc: 'Logs d\'acces non modifiables (trigger SQL)', icon: <CheckCircle2 className="h-4 w-4" />, active: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Types de consentement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {consentTypes.map(ct => (
                      <div key={ct.type} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm font-medium">{ct.label}</span>
                        <Badge variant="outline" className="text-xs font-mono">{ct.type}</Badge>
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
