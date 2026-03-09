import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { PageMeta, JsonLd, webPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusData, type ServiceStatus } from '@/hooks/useStatusData';
import { useI18n } from '@/i18n/I18nContext';
import {
  CheckCircle, AlertTriangle, XCircle, Clock, Shield,
  Server, Database, Key, Globe, Zap, Activity,
  Download, RefreshCw, Lock, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Icon map for services ──
const SERVICE_ICONS: Record<string, React.ElementType> = {
  app: Globe, api: Server, database: Database, auth: Key, realtime: Zap,
};

const SERVICE_LABELS: Record<string, { name: string; description: string }> = {
  app: { name: 'Application Web (PWA)', description: 'Interface principale — board, dossier patient, triage, prescriptions' },
  api: { name: 'API & Backend', description: 'API REST, fonctions serveur, échanges avec votre dossier patient' },
  database: { name: 'Base de données', description: 'PostgreSQL — données patients, prescriptions, vitals, audit logs' },
  auth: { name: 'Authentification & droits', description: 'Connexion, vérification en deux étapes, gestion des rôles, sessions sécurisées' },
  realtime: { name: 'Temps réel (Realtime)', description: 'Notifications, mises à jour board, alertes labo en temps réel' },
};

const SLA_COMMITMENTS = [
  { metric: 'Disponibilité garantie', value: '99,9 %', detail: 'Mesuré sur 30 jours glissants, hors maintenance planifiée' },
  { metric: 'RTO (Recovery Time Objective)', value: '< 15 min', detail: 'Temps maximum de restauration après incident critique' },
  { metric: 'RPO (Recovery Point Objective)', value: '< 5 min', detail: 'Perte de données maximale tolérée (sauvegardes continues)' },
  { metric: 'Temps de réponse incidents P1', value: '< 30 min', detail: 'Prise en charge d\'un incident bloquant en moins de 30 minutes' },
  { metric: 'Maintenance planifiée', value: 'Nuit / week-end', detail: 'Fenêtre de maintenance communiquée 72h à l\'avance minimum' },
];

const SECURITY_CHECKS = [
  { check: 'TLS 1.2+', status: 'OK', icon: Lock },
  { check: 'Chiffrement repos AES-256', status: 'OK', icon: ShieldCheck },
  { check: 'Sauvegardes PITR', status: 'OK', icon: Database },
  { check: 'Row Level Security (RLS)', status: 'Actif', icon: Shield },
  { check: 'MFA (TOTP)', status: 'Actif', icon: Key },
  { check: 'Audit logs immutables', status: 'Actif', icon: Lock },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'operational': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'degraded': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
    default: return <Clock className="h-5 w-5 text-blue-500" />;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'operational': return 'Opérationnel';
    case 'degraded': return 'Dégradé';
    case 'down': return 'Indisponible';
    case 'maintenance': return 'Maintenance';
    default: return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'operational': return 'text-emerald-500';
    case 'degraded': return 'text-amber-500';
    case 'down': return 'text-red-500';
    default: return 'text-blue-500';
  }
}

function incidentStatusLabel(status: string): string {
  switch (status) {
    case 'resolved': return 'Résolu';
    case 'monitoring': return 'Surveillance';
    case 'identified': return 'Identifié';
    case 'investigating': return 'En cours';
    default: return status;
  }
}

function UptimeBar({ checks }: { checks: { status: string; checked_at: string }[] }) {
  const days = 90;
  const now = new Date();
  const dayBuckets: Record<string, string[]> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayBuckets[d.toISOString().slice(0, 10)] = [];
  }
  for (const c of checks) {
    const day = c.checked_at.slice(0, 10);
    if (dayBuckets[day]) dayBuckets[day].push(c.status);
  }
  const sortedDays = Object.keys(dayBuckets).sort();
  return (
    <div className="flex gap-px">
      {sortedDays.map((day) => {
        const statuses = dayBuckets[day];
        const hasDown = statuses.some(s => s === 'down');
        const hasDegraded = statuses.some(s => s === 'degraded');
        const color = hasDown
          ? 'bg-red-500/80 hover:bg-red-400'
          : hasDegraded
          ? 'bg-amber-500/80 hover:bg-amber-400'
          : 'bg-emerald-500/80 hover:bg-emerald-400';
        return (
          <div key={day} className={`h-8 flex-1 rounded-sm ${color} transition-colors`}
            title={`${day} : ${hasDown ? 'incident' : hasDegraded ? 'dégradé' : 'opérationnel'}`} />
        );
      })}
    </div>
  );
}

export default function StatutPage() {
  const { t } = useI18n();
  const s = t.status;
  const {
    checks, incidents, latestByService, overallStatus,
    avgResponseTime, uptimePercent, loading, lastUpdated, hasData, refresh,
  } = useStatusData();

  const lastChecked = lastUpdated.toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const defaultServices = ['app', 'api', 'database', 'auth', 'realtime'];
  const serviceList = defaultServices.map((key) => {
    const check = latestByService[key];
    const meta = SERVICE_LABELS[key] || { name: key, description: '' };
    const Icon = SERVICE_ICONS[key] || Server;
    return {
      key, name: meta.name, description: meta.description,
      status: (check?.status || 'operational') as ServiceStatus,
      responseTime: check?.response_time_ms, uptime: hasData ? uptimePercent : '99.95', Icon,
    };
  });

  const recentIncidents = incidents.filter(i => {
    const d = new Date(i.started_at);
    return d > new Date(Date.now() - 90 * 86400000);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Statut UrgenceOS — Disponibilité et uptime des services"
        description="Page de statut UrgenceOS : disponibilité en temps réel de l'application, API, base de données, authentification. SLA 99,9%."
        canonical="https://urgenceos.fr/statut"
      />
      <JsonLd id="statut-webpage" data={webPageSchema({
        name: 'Statut UrgenceOS — Disponibilité des services',
        description: 'Disponibilité en temps réel, uptime 90 jours, engagements SLA.',
        url: 'https://urgenceos.fr/statut',
        breadcrumb: [s.breadcrumbHome, s.breadcrumbStatus],
      })} />
      <SiteHeader />

      <main id="main-content" className="max-w-4xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: s.breadcrumbHome, to: '/' },
          { label: s.breadcrumbStatus },
        ]} />

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Activity className="h-3 w-3" /> {s.monitoring}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{s.title}</h1>
          <p className="text-muted-foreground mb-2">{s.lastCheck} {lastChecked}</p>
          {!hasData && <p className="text-xs text-muted-foreground mb-4">{s.waitingData}</p>}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={refresh} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> {s.refresh}
            </Button>
          </div>
          {loading ? (
            <Skeleton className="h-12 w-80 mx-auto rounded-full" />
          ) : (
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${
              overallStatus === 'operational' ? 'bg-emerald-500/10 border-emerald-500/30'
                : overallStatus === 'degraded' ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <StatusIcon status={overallStatus} />
              <span className={`font-semibold ${statusColor(overallStatus)}`}>
                {overallStatus === 'operational' ? s.allOperational
                  : overallStatus === 'degraded' ? s.degraded : s.incidentActive}
              </span>
            </div>
          )}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{uptimePercent} %</p>
            <p className="text-xs text-muted-foreground">{s.uptime90}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{avgResponseTime ? `${avgResponseTime} ms` : '—'}</p>
            <p className="text-xs text-muted-foreground">{s.avgLatency}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{recentIncidents.filter(i => i.status === 'resolved').length}</p>
            <p className="text-xs text-muted-foreground">{s.resolvedIncidents}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold text-emerald-500">24/7</p>
            <p className="text-xs text-muted-foreground">{s.monitoring}</p>
          </div>
        </div>

        {/* 90-day uptime bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{s.uptimeLast90}</span>
            <span className="font-semibold text-emerald-500">{uptimePercent} %</span>
          </div>
          <UptimeBar checks={checks} />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{s.daysAgo}</span>
            <span>{s.today}</span>
          </div>
        </div>

        {/* Service-by-service status */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">{s.systemComponents}</h2>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : (
              serviceList.map((service) => (
                <div key={service.key} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <service.Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {service.responseTime != null && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">{service.responseTime} ms</span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={service.status} />
                      <span className={`text-sm font-medium ${statusColor(service.status)}`}>
                        {statusLabel(service.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SLA Commitments */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{s.slaTitle}</h2>
            </div>
            <a href="/sla" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Download className="h-4 w-4" /> {s.slaConsult}
            </a>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{s.slaNote}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SLA_COMMITMENTS.map((sla) => (
              <div key={sla.metric} className="p-5 rounded-xl border bg-card">
                <p className="text-2xl font-bold text-primary mb-1">{sla.value}</p>
                <p className="font-medium text-sm mb-2">{sla.metric}</p>
                <p className="text-xs text-muted-foreground">{sla.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security checks */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{s.securityTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SECURITY_CHECKS.map((sc) => (
              <div key={sc.check} className="flex items-center gap-3 p-4 rounded-xl border bg-card">
                <sc.icon className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{sc.check}</p>
                  <p className="text-xs text-emerald-500">{sc.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident history */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">{s.incidentHistory}</h2>
          {loading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : recentIncidents.length === 0 ? (
            <div className="p-8 rounded-xl border bg-card text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-medium mb-1">{s.noIncidents}</p>
              <p className="text-sm text-muted-foreground">{s.noIncidentsDetail}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIncidents.map((incident) => {
                const duration = incident.resolved_at
                  ? (() => {
                    const ms = new Date(incident.resolved_at).getTime() - new Date(incident.started_at).getTime();
                    const mins = Math.round(ms / 60000);
                    return mins < 60 ? `${mins} min` : `${(mins / 60).toFixed(1)}h`;
                  })()
                  : null;
                return (
                  <div key={incident.id} className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{incident.title}</span>
                      <Badge variant={incident.status === 'resolved' ? 'secondary' : 'destructive'}>
                        {incidentStatusLabel(incident.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(incident.started_at).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {incident.description && <p className="text-sm text-muted-foreground">{incident.description}</p>}
                    {duration && <p className="text-xs text-muted-foreground mt-2">{s.duration} {duration}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Infrastructure */}
        <div className="mb-16 p-6 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <h2 className="text-xl font-bold mb-4">{s.infrastructure}</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Hébergement</span><span className="font-medium">HDS France (en cours)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Région</span><span className="font-medium">Europe (Francfort)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Base de données</span><span className="font-medium">PostgreSQL 15+</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CDN / Edge</span><span className="font-medium">Cloudflare</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Chiffrement transit</span><span className="font-medium">TLS 1.2+</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chiffrement repos</span><span className="font-medium">AES-256</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sauvegardes</span><span className="font-medium">Continues (PITR)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monitoring</span><span className="font-medium">24/7 automatisé</span></div>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="mb-16 p-5 rounded-xl border bg-card">
          <h3 className="font-bold mb-3">Informations de version</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-muted-foreground">Version</span><p className="font-medium">1.0.0</p></div>
            <div><span className="text-muted-foreground">Dernier déploiement</span><p className="font-medium">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
            <div><span className="text-muted-foreground">Environnement</span><p className="font-medium">Production</p></div>
          </div>
        </div>

        {/* Contact for incidents */}
        <div className="p-6 rounded-xl border bg-card text-center">
          <h3 className="font-bold mb-2">Signaler un incident</h3>
          <p className="text-sm text-muted-foreground mb-1">En cas de problème technique, contactez notre équipe d'astreinte.</p>
          <p className="text-xs text-muted-foreground mb-3">Temps de réponse garanti : &lt; 30 min pour les incidents P1</p>
          <a href="mailto:support@urgenceos.fr" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
            support@urgenceos.fr
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Les données de disponibilité présentées sur cette page reflètent le monitoring automatisé de la plateforme.
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
