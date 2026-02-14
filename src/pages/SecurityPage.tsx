import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, CheckCircle, Database, Eye,
  Key, Lock, Mail, Monitor, Server, Shield, ShieldCheck,
  UserCheck, AlertTriangle,
} from 'lucide-react';

const SECURITY_LAYERS = [
  {
    icon: Key,
    title: 'Minimisation des accès',
    items: [
      'Principe du moindre privilège : accès limité aux données strictement nécessaires',
      'Pas de comptes génériques : chaque accès est nominatif et traçable',
      'Élévations de privilèges temporaires, motivées et journalisées',
      'Revue périodique des droits (recommandation : trimestrielle)',
    ],
  },
  {
    icon: UserCheck,
    title: 'Droits par rôle (RBAC)',
    items: [
      '7 rôles de base extensibles (médecin, IOA, IDE, AS, secrétaire, admin, auditeur)',
      'Vérification systématique côté serveur (pas de contrôle client seul)',
      'Séparation rôles opérationnels et rôles d\'administration',
      'Matrice de droits documentée, versionnée, auditable',
    ],
  },
  {
    icon: Eye,
    title: 'Traçabilité complète',
    items: [
      'Chaque action journalisée : consultation, création, modification, suppression, export',
      'Logs immuables (append-only) — aucune suppression possible',
      'Horodatage, identifiant utilisateur, rôle, action, ressource, IP, résultat',
      'Rétention minimum 5 ans, configurable selon l\'établissement',
    ],
  },
  {
    icon: Server,
    title: 'Séparation des environnements',
    items: [
      'Trois environnements minimum : développement, pré-production, production',
      'Données de production jamais utilisées en développement (anonymisation obligatoire)',
      'Accès distincts par environnement — pas de compte partagé',
      'Déploiement production = passage obligatoire par pré-production',
    ],
  },
  {
    icon: Database,
    title: 'Chiffrement & privacy-by-design',
    items: [
      'Chiffrement en transit : TLS 1.2 minimum sur toutes les communications',
      'Chiffrement au repos : AES-256 pour les données sensibles',
      'Rotation périodique des clés, stockage sécurisé séparé',
      'Collecte minimale, durée de conservation définie, anonymisation non-clinique',
    ],
  },
  {
    icon: Monitor,
    title: 'Journalisation & alerting',
    items: [
      'Logs centralisés et corrélés (socle + modules + infrastructure)',
      'Alertes : tentatives d\'accès échouées, élévation de privilèges, export massif',
      'Dashboard sécurité accessible au DSI et au RSSI',
      'Intégration possible avec un SIEM existant',
    ],
  },
];

const THREAT_MODEL = [
  {
    actor: 'Attaquant externe',
    risk: 'Ransomware, vol de données, déni de service',
    parade: 'Sauvegardes chiffrées déconnectées, segmentation réseau, monitoring d\'activité anormale',
  },
  {
    actor: 'Utilisateur interne malveillant',
    risk: 'Accès non autorisé, export massif, modification de données',
    parade: 'RBAC strict, audit log immuable, alerting sur comportements suspects',
  },
  {
    actor: 'Utilisateur négligent',
    risk: 'Partage mot de passe, session non verrouillée, phishing',
    parade: 'Authentification forte, expiration session, formation, alerting connexions simultanées',
  },
  {
    actor: 'Fournisseur compromis',
    risk: 'Supply chain, accès de maintenance détourné',
    parade: 'Audit dépendances, verrouillage versions, scan CVE automatisé, revue mises à jour',
  },
];

const CHECKLIST = [
  'Authentification forte activée pour tous les comptes',
  'Matrice RBAC documentée et validée par le DSI',
  'Vérification RBAC côté serveur testée sur chaque endpoint',
  'Audit logs activés, immuables, et vérifiés',
  'Politique de rétention des logs configurée',
  'Chiffrement TLS activé sur toutes les communications',
  'Chiffrement au repos activé pour les données sensibles',
  'Comptes génériques supprimés ou désactivés',
  'Politique de mots de passe conforme',
  'Sessions avec expiration et révocation configurées',
  'Environnements séparés (dev / préprod / prod)',
  'Données prod absentes des environnements non-production',
  'Sauvegardes chiffrées, testées, plan de restauration documenté',
  'Procédure réponse incidents documentée et communiquée',
  'Test d\'intrusion réalisé ou planifié avant go-live',
  'Scan vulnérabilités réalisé (infra + application)',
  'Dépendances auditées (zéro CVE critique non corrigée)',
  'API rate-limitée et protégée contre les abus',
  'Validation entrées sur tous les endpoints (anti-injection)',
  'Headers sécurité HTTP configurés (CSP, HSTS, X-Frame)',
  'Hébergement HDS confirmé avec contrat signé',
  'DPO informé, registre traitements mis à jour',
  'Formation sécurité dispensée aux utilisateurs pilotes',
  'Plan de continuité documenté et testé',
  'Alerting sécurité configuré et testé',
];

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Shield className="h-3 w-3" /> Security-first
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            La sécurité n'est pas une option. C'est l'architecture.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Dans un contexte où les cyberattaques contre les hôpitaux se multiplient, un SI sécurisé par conception
            est un avantage structurel. UrgenceOS intègre la sécurité dès l'architecture, pas en option.
          </p>
        </div>

        {/* Security layers */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">6 principes de sécurité</h2>
          <p className="text-muted-foreground text-center mb-8">
            Chaque couche réduit la surface d'attaque et renforce la traçabilité
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY_LAYERS.map((layer) => (
              <div key={layer.title} className="p-6 rounded-xl border bg-card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <layer.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold">{layer.title}</h3>
                </div>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Threat model */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Threat model haut niveau</h2>
          <p className="text-muted-foreground text-center mb-8">Acteurs de menace identifiés, risques évalués, parades déployées</p>
          <div className="space-y-4">
            {THREAT_MODEL.map((t) => (
              <div key={t.actor} className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-medical-warning" />
                  <h4 className="font-semibold text-sm">{t.actor}</h4>
                </div>
                <p className="text-xs text-medical-critical mb-1">Risques : {t.risk}</p>
                <p className="text-xs text-muted-foreground">Parades : {t.parade}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist go-live */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Checklist go-live sécurité</h2>
          <p className="text-muted-foreground text-center mb-8">25 points vérifiés avant tout déploiement pilote</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {CHECKLIST.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagements */}
        <div className="mb-20 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent border">
          <h2 className="text-xl font-bold mb-6 text-center">Engagements de sécurité</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {[
              { value: '100%', label: 'Données hébergées en France (HDS)' },
              { value: '99,9%', label: 'Disponibilité cible (SLA)' },
              { value: '< 1h', label: 'Réponse incident critique' },
              { value: '24/7', label: 'Monitoring infrastructure' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-extrabold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact security */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Questions sécurité ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe fournit toute documentation complémentaire : PAS, PSSI, DPA, rapport de pentest.
            Transparence totale.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.href = 'mailto:security@emotionscare.com'}>
              <Mail className="h-4 w-4 mr-2" /> security@emotionscare.com
            </Button>
            <Button variant="outline" onClick={() => navigate('/b2b')}>
              Demander un pilote <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
