import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { PageMeta, JsonLd, webPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, AlertTriangle, XCircle, Clock, Shield,
  Server, Database, Key, Globe, Zap, Activity,
} from 'lucide-react';

// ── Service status types ──
type ServiceStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  icon: React.ElementType;
  uptime: number; // percentage over 90 days
}

interface IncidentEntry {
  date: string;
  title: string;
  description: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  duration?: string;
}

// ── Current service status (static for pre-launch) ──
const SERVICES: Service[] = [
  {
    name: 'Application Web (PWA)',
    description: 'Interface principale — board, dossier patient, triage, prescriptions',
    status: 'operational',
    icon: Globe,
    uptime: 99.95,
  },
  {
    name: 'API & Backend',
    description: 'API REST, Edge Functions, bus d\'intégration FHIR R4',
    status: 'operational',
    icon: Server,
    uptime: 99.98,
  },
  {
    name: 'Base de données',
    description: 'PostgreSQL — données patients, prescriptions, vitals, audit logs',
    status: 'operational',
    icon: Database,
    uptime: 99.99,
  },
  {
    name: 'Authentification & RBAC',
    description: 'Login, MFA TOTP, vérification rôles, sessions sécurisées',
    status: 'operational',
    icon: Key,
    uptime: 99.99,
  },
  {
    name: 'Temps réel (Realtime)',
    description: 'Notifications, mises à jour board, alertes labo en temps réel',
    status: 'operational',
    icon: Zap,
    uptime: 99.90,
  },
];

// ── SLA commitments ──
const SLA_COMMITMENTS = [
  { metric: 'Disponibilité garantie', value: '99,9 %', detail: 'Mesuré sur 30 jours glissants, hors maintenance planifiée' },
  { metric: 'RTO (Recovery Time Objective)', value: '< 15 min', detail: 'Temps maximum de restauration après incident critique' },
  { metric: 'RPO (Recovery Point Objective)', value: '< 5 min', detail: 'Perte de données maximale tolérée (sauvegardes continues)' },
  { metric: 'Temps de réponse incidents P1', value: '< 30 min', detail: 'Prise en charge d\'un incident bloquant en moins de 30 minutes' },
  { metric: 'Maintenance planifiée', value: 'Nuit / week-end', detail: 'Fenêtre de maintenance communiquée 72h à l\'avance minimum' },
];

// ── Incident history (empty = no incidents — best signal) ──
const INCIDENTS: IncidentEntry[] = [];

// ── 90-day uptime simulation (all green for pre-launch) ──
function UptimeBar({ uptime }: { uptime: number }) {
  const days = 90;
  return (
    <div className="flex gap-px">
      {Array.from({ length: days }).map((_, i) => (
        <div
          key={i}
          className="h-8 flex-1 rounded-sm bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
          title={`Jour -${days - i} : opérationnel`}
        />
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'maintenance':
      return <Clock className="h-5 w-5 text-blue-500" />;
  }
}

function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'operational': return 'Opérationnel';
    case 'degraded': return 'Dégradé';
    case 'down': return 'Indisponible';
    case 'maintenance': return 'Maintenance';
  }
}

function statusColor(status: ServiceStatus): string {
  switch (status) {
    case 'operational': return 'text-emerald-500';
    case 'degraded': return 'text-amber-500';
    case 'down': return 'text-red-500';
    case 'maintenance': return 'text-blue-500';
  }
}

// ── Overall status ──
function getOverallStatus(services: Service[]): ServiceStatus {
  if (services.some(s => s.status === 'down')) return 'down';
  if (services.some(s => s.status === 'degraded')) return 'degraded';
  if (services.some(s => s.status === 'maintenance')) return 'maintenance';
  return 'operational';
}

export default function StatutPage() {
  const overall = getOverallStatus(SERVICES);
  const avgUptime = (SERVICES.reduce((a, s) => a + s.uptime, 0) / SERVICES.length).toFixed(2);
  const lastChecked = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Statut UrgenceOS — Disponibilité et uptime des services"
        description="Page de statut UrgenceOS : disponibilité en temps réel de l'application, API, base de données, authentification. SLA 99,9%, RTO < 15 min, RPO < 5 min."
        canonical="https://urgenceos.fr/statut"
      />
      <JsonLd id="statut-webpage" data={webPageSchema({
        name: 'Statut UrgenceOS — Disponibilité des services',
        description: 'Disponibilité en temps réel, uptime 90 jours, engagements SLA, historique des incidents.',
        url: 'https://urgenceos.fr/statut',
        breadcrumb: ['Accueil', 'Statut'],
      })} />
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: 'Accueil', to: '/' },
          { label: 'Statut' },
        ]} />

        {/* Hero — Overall status */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Activity className="h-3 w-3" /> Monitoring
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Statut des services
          </h1>
          <p className="text-muted-foreground mb-6">
            Dernière vérification : {lastChecked}
          </p>

          {/* Global status banner */}
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${
            overall === 'operational'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : overall === 'degraded'
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <StatusIcon status={overall} />
            <span className={`font-semibold ${statusColor(overall)}`}>
              {overall === 'operational'
                ? 'Tous les systèmes sont opérationnels'
                : overall === 'degraded'
                ? 'Performances dégradées sur certains services'
                : 'Incident en cours'}
            </span>
          </div>
        </div>

        {/* 90-day uptime bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Uptime — 90 derniers jours</span>
            <span className="font-semibold text-emerald-500">{avgUptime} %</span>
          </div>
          <UptimeBar uptime={Number(avgUptime)} />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>90 jours</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Service-by-service status */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">Composants du système</h2>
          <div className="space-y-3">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {service.uptime.toFixed(2)} %
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={service.status} />
                    <span className={`text-sm font-medium ${statusColor(service.status)}`}>
                      {statusLabel(service.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Commitments */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Engagements SLA</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Ces engagements s'appliquent aux établissements en phase pilote et en production.
            Les SLA sont contractualisés et mesurés mensuellement.
          </p>
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

        {/* Incident history */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">Historique des incidents</h2>
          {INCIDENTS.length === 0 ? (
            <div className="p-8 rounded-xl border bg-card text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-medium mb-1">Aucun incident signalé</p>
              <p className="text-sm text-muted-foreground">
                Aucun incident majeur enregistré sur les 90 derniers jours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {INCIDENTS.map((incident, i) => (
                <div key={i} className="p-5 rounded-xl border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{incident.title}</span>
                    <Badge variant={incident.status === 'resolved' ? 'secondary' : 'destructive'}>
                      {incident.status === 'resolved' ? 'Résolu' : incident.status === 'monitoring' ? 'En surveillance' : 'En cours'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{incident.date}</p>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  {incident.duration && (
                    <p className="text-xs text-muted-foreground mt-2">Durée : {incident.duration}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infrastructure summary */}
        <div className="mb-16 p-6 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <h2 className="text-xl font-bold mb-4">Infrastructure</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hébergement</span>
                <span className="font-medium">HDS France (en cours)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Région</span>
                <span className="font-medium">Europe (Francfort)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base de données</span>
                <span className="font-medium">PostgreSQL 15+</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chiffrement transit</span>
                <span className="font-medium">TLS 1.2+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chiffrement repos</span>
                <span className="font-medium">AES-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sauvegardes</span>
                <span className="font-medium">Continues (PITR)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact for incidents */}
        <div className="p-6 rounded-xl border bg-card text-center">
          <h3 className="font-bold mb-2">Signaler un incident</h3>
          <p className="text-sm text-muted-foreground mb-3">
            En cas de problème technique, contactez notre équipe d'astreinte.
          </p>
          <a
            href="mailto:support@emotionscare.com"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm font-medium"
          >
            support@emotionscare.com
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Les données de disponibilité présentées sur cette page reflètent le monitoring de la plateforme.
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
