import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, CheckCircle, Database, Eye, FileText,
  Key, Lock, Mail, Monitor, Server, Shield, ShieldCheck,
  UserCheck, Wifi,
} from 'lucide-react';

const CERTIFICATIONS = [
  {
    icon: ShieldCheck,
    title: 'HDS — Hébergement de Données de Santé',
    status: 'Certifié',
    statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    description: 'Infrastructure d\'hébergement certifiée HDS conformément à l\'article L.1111-8 du Code de la santé publique. Obligation légale pour tout hébergeur de données de santé à caractère personnel en France.',
    details: [
      'Hébergement sur datacenter certifié en France métropolitaine',
      'Audit annuel par organisme certificateur accrédité COFRAC',
      'Procédures d\'exploitation et de sécurité documentées',
      'Plan de continuité et de reprise d\'activité (PCA/PRA)',
    ],
  },
  {
    icon: Lock,
    title: 'ISO 27001 — Sécurité de l\'information',
    status: 'En cours',
    statusColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    description: 'Système de management de la sécurité de l\'information (SMSI). Démarche de certification engagée, audit prévu 2026.',
    details: [
      'Politique de sécurité formalisée et approuvée par la direction',
      'Analyse de risques selon méthodologie EBIOS RM',
      'Plan de traitement des risques documenté',
      'Revue de direction et amélioration continue',
    ],
  },
  {
    icon: FileText,
    title: 'Conformité ANS & CI-SIS',
    status: 'Conforme',
    statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    description: 'Respect du Cadre d\'Interopérabilité des Systèmes d\'Information de Santé défini par l\'Agence du Numérique en Santé.',
    details: [
      'Identité INS (Identité Nationale de Santé) intégrée',
      'Interopérabilité FHIR R4, HL7v2, MSSanté',
      'RPU normalisé conforme FEDORU',
      'Vocabulaires standards : LOINC, ATC, SNOMED CT',
    ],
  },
];

const SECURITY_LAYERS = [
  {
    icon: Key,
    title: 'Authentification',
    items: [
      'Authentification forte multi-facteurs (MFA)',
      'Auto-déconnexion après 30 minutes d\'inactivité',
      'Compatibilité SSO/LDAP pour intégration établissement',
      'Gestion des sessions avec tokens JWT sécurisés',
    ],
  },
  {
    icon: UserCheck,
    title: 'Contrôle d\'accès',
    items: [
      'Row Level Security (RLS) PostgreSQL natif',
      '5 rôles métier avec permissions granulaires',
      'Chaque professionnel n\'accède qu\'aux données nécessaires',
      'Séparation stricte des environnements (dev, staging, prod)',
    ],
  },
  {
    icon: Database,
    title: 'Protection des données',
    items: [
      'Chiffrement au repos (AES-256)',
      'Chiffrement en transit (TLS 1.3)',
      'Sauvegardes quotidiennes chiffrées (rétention 90 jours)',
      'Isolation des données par établissement',
    ],
  },
  {
    icon: Eye,
    title: 'Audit & traçabilité',
    items: [
      'Audit trail complet : qui, quoi, quand pour chaque action',
      'Logs d\'accès aux données patients',
      'Dashboard d\'audit intégré pour les administrateurs',
      'Conservation des traces conformément aux obligations légales',
    ],
  },
  {
    icon: Wifi,
    title: 'Réseau & infrastructure',
    items: [
      'Hébergement en datacenter Tier III+ en France',
      'Redondance multi-zones pour haute disponibilité',
      'Monitoring 24/7 avec alerting automatique',
      'Tests d\'intrusion annuels par prestataire externe',
    ],
  },
  {
    icon: Monitor,
    title: 'Application',
    items: [
      'Analyse statique de code (SAST) en continu',
      'Revue de sécurité à chaque mise en production',
      'Protection OWASP Top 10 (XSS, injection, CSRF...)',
      'Content Security Policy (CSP) stricte',
    ],
  },
];

const RGPD_POINTS = [
  { title: 'Base légale', desc: 'Traitement fondé sur l\'intérêt légitime et l\'obligation légale (soins de santé)' },
  { title: 'Minimisation', desc: 'Seules les données strictement nécessaires à la prise en charge sont collectées' },
  { title: 'Durée de conservation', desc: 'Données patient : durée légale du dossier médical. Logs : 12 mois. Sauvegardes : 90 jours' },
  { title: 'Droit d\'accès', desc: 'Procédure documentée pour l\'exercice des droits des patients (accès, rectification, suppression)' },
  { title: 'Portabilité', desc: 'Export des données en format standard (FHIR) sur demande' },
  { title: 'DPO', desc: 'Délégué à la Protection des Données désigné et joignable par les établissements et les patients' },
  { title: 'Registre des traitements', desc: 'Registre conforme à l\'article 30 du RGPD, mis à jour et disponible sur demande' },
  { title: 'Sous-traitants', desc: 'Liste documentée des sous-traitants avec DPA (Data Processing Agreement) signés' },
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
            <Shield className="h-3 w-3" /> Sécurité & Conformité
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            La sécurité n'est pas une option
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            UrgenceOS est conçu secure-by-design. Chiffrement, contrôle d'accès par rôle,
            hébergement HDS et conformité réglementaire sont intégrés dès la fondation.
          </p>
        </div>

        {/* Certifications */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Certifications & conformité</h2>
          <div className="space-y-6">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.title} className="p-6 rounded-2xl border bg-card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <cert.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold">{cert.title}</h3>
                      <Badge className={cert.statusColor}>{cert.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cert.description}</p>
                  </div>
                </div>
                <div className="ml-16 grid sm:grid-cols-2 gap-2">
                  {cert.details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security layers */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Architecture de sécurité</h2>
          <p className="text-muted-foreground text-center mb-8">
            6 couches de protection pour garantir la confidentialité et l'intégrité des données
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

        {/* RGPD */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Conformité RGPD santé</h2>
          <p className="text-muted-foreground text-center mb-8">
            Protection des données personnelles de santé conforme au RGPD et à ses spécificités sectorielles
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {RGPD_POINTS.map((point) => (
              <div key={point.title} className="p-4 rounded-xl border bg-card">
                <h4 className="font-semibold text-sm mb-1">{point.title}</h4>
                <p className="text-xs text-muted-foreground">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mb-20 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent border">
          <h2 className="text-xl font-bold mb-6 text-center">Engagements de sécurité</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {[
              { value: '100%', label: 'Données hébergées en France' },
              { value: '99,9%', label: 'Disponibilité cible (SLA)' },
              { value: '< 4h', label: 'Temps de réponse support Pro' },
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
          <Server className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Questions sur la sécurité ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe sécurité est disponible pour répondre à vos questions et
            fournir toute documentation complémentaire (PAS, PSSI, DPA).
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.href = 'mailto:security@emotionscare.com'}>
              <Mail className="h-4 w-4 mr-2" /> security@emotionscare.com
            </Button>
            <Button variant="outline" onClick={() => navigate('/faq')}>
              Voir la FAQ
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
            Les informations de cette page sont fournies à titre indicatif et sont susceptibles d'évoluer.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
