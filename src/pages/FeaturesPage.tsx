import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { cn } from '@/lib/utils';
import {
  Activity, ArrowLeft, ArrowRight, CheckCircle, ClipboardList,
  Clock, Database, FileText, Heart, LayoutGrid, Lock, LogIn,
  Monitor, RefreshCcw, Server, Shield, Smartphone, Stethoscope,
  Timer, UserPlus, Users, Wifi, WifiOff, Zap,
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  status: 'done' | 'beta' | 'planned';
}

const PILLARS: Feature[] = [
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: 'Pancarte unifiee',
    description: 'Fiche patient unique pour les infirmiers. Tout le dossier sur un seul ecran — zero changement de page.',
    details: [
      'Prescriptions groupees par section (medicaments, perfusions, titrations, examens, avis)',
      'Constantes avec mini-graphiques Recharts en temps reel',
      'Transmissions DAR auto-remplies avec les dernieres constantes et actes',
      'Resultats biologiques avec normes et alertes critiques',
      'Recap patient synthetise en un drawer',
    ],
    status: 'done',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Transmissions DAR',
    description: 'Format Donnees-Actions-Resultats. Les D et A sont pre-remplis automatiquement.',
    details: [
      'D — Constantes du patient remplies automatiquement',
      'A — Derniers actes et administrations injectes',
      'R — Libre pour l\'evaluation clinique IDE',
      'Cible : Douleur, Respiratoire, Hemodynamique, Neurologique...',
      'Historique complet avec horodatage',
    ],
    status: 'done',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Interface adaptative',
    description: 'Meme donnees, 5 UIs differentes. Chaque role voit exactement ce dont il a besoin.',
    details: [
      'Medecin : board panoramique avec zones, prescriptions, resultats',
      'IOA : workflow triage 5 etapes avec timer < 2 min',
      'IDE : pancarte unifiee avec admin medicaments en 1 tap',
      'Aide-soignant : 4 gros boutons tactiles, constantes uniquement',
      'Secretaire : admission rapide < 90 secondes',
    ],
    status: 'done',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Admin 1 tap',
    description: 'Reduire de 6-8 clics a 1 seul tap pour administrer un medicament.',
    details: [
      'Bouton "Administre" visible directement sur chaque ligne',
      'Dose et lot modifiables inline',
      'Titrations avec dose cumulee et seuil max',
      'Conditionnels avec intervalle et compteur de doses',
      'Audit trail automatique de chaque administration',
    ],
    status: 'done',
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'Timeline IA',
    description: 'Chronologie patient assistee par IA. Antecedents, allergies, traitements et historique structures.',
    details: [
      'Frise chronologique du sejour aux urgences',
      'Import automatique depuis FHIR et HL7v2',
      'Synthese assistee pour le compte-rendu hospitalier',
      'Diagnostic, antecedents, allergies horodates',
    ],
    status: 'beta',
  },
  {
    icon: <WifiOff className="h-6 w-6" />,
    title: 'Offline-first',
    description: 'PWA avec plus de 4h d\'autonomie hors connexion. Les urgences ne s\'arretent pas quand le reseau tombe.',
    details: [
      'Service Worker avec cache des donnees patients du service',
      'File d\'attente des actions hors connexion (IndexedDB)',
      'Sync automatique au retour du reseau',
      'Indicateur de statut connexion permanent',
      'Objectif : >4h d\'autonomie complete',
    ],
    status: 'planned',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure-by-design',
    description: 'RLS, encryption, audit trails natifs. La securite n\'est pas un add-on, c\'est le fondement.',
    details: [
      'Row Level Security (RLS) strict par role Supabase',
      'Chaque role ne voit que ce qu\'il doit voir',
      'Audit trail : qui, quoi, quand pour chaque action',
      'Auto-deconnexion apres 30 min d\'inactivite',
      'RGPD sante : retention 3 ans max, droit a l\'oubli',
    ],
    status: 'done',
  },
];

const TECH_FEATURES = [
  { icon: <Monitor className="h-5 w-5" />, title: 'React + TypeScript', desc: 'SPA avec Vite, SWC, et HMR ultra-rapide' },
  { icon: <Server className="h-5 w-5" />, title: 'Supabase', desc: 'PostgreSQL, Auth, Realtime, Edge Functions, Storage' },
  { icon: <LayoutGrid className="h-5 w-5" />, title: 'Shadcn/UI + Tailwind', desc: '48 composants UI, design tokens medicaux, dark mode' },
  { icon: <Database className="h-5 w-5" />, title: '12 tables', desc: 'patients, encounters, vitals, prescriptions, administrations...' },
  { icon: <RefreshCcw className="h-5 w-5" />, title: 'Realtime', desc: 'Supabase Realtime sur patients, constantes, resultats' },
  { icon: <Lock className="h-5 w-5" />, title: 'RLS natif', desc: 'Row Level Security par role dans PostgreSQL' },
  { icon: <Smartphone className="h-5 w-5" />, title: 'Responsive', desc: 'Mobile-first, gros boutons tactiles, gants-friendly' },
  { icon: <Wifi className="h-5 w-5" />, title: 'PWA', desc: 'Installable, manifest, service worker, offline cache' },
];

const INTEROP = [
  { label: 'FHIR R4', desc: 'Patient, Encounter, Observation, MedicationRequest, DiagnosticReport' },
  { label: 'HL7v2', desc: 'ADT (Admission/Transfert), ORM (Orders), ORU (Resultats)' },
  { label: 'MS-Sante', desc: 'Echanges professionnels de sante securises' },
  { label: 'INS', desc: 'Identite Nationale de Sante integree' },
  { label: 'LOINC', desc: 'Codage des constantes et examens biologiques' },
  { label: 'ATC', desc: 'Classification des medicaments' },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  const statusBadge = (status: Feature['status']) => {
    const map = {
      done: { label: 'Disponible', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      beta: { label: 'Beta', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      planned: { label: 'Prevu', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    };
    const s = map[status];
    return <Badge className={cn('text-[10px]', s.className)}>{s.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-bold">
            <ArrowLeft className="h-4 w-4" /> Urgence<span className="text-primary">OS</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="outline" onClick={() => navigate('/demo')}>Demo</Button>
            <Button size="sm" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4 mr-1" /> Connexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Fonctionnalites detaillees</Badge>
          <h1 className="text-4xl font-bold mb-4">
            7 piliers pour transformer les urgences
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            UrgenceOS repense chaque interaction entre le soignant et son outil informatique.
            Moins de clics, plus de soins.
          </p>
        </div>

        {/* 7 Pillars */}
        <div className="space-y-8 mb-20">
          {PILLARS.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                'flex flex-col lg:flex-row gap-6 p-6 rounded-2xl border bg-card',
                index % 2 !== 0 && 'lg:flex-row-reverse',
              )}
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      {statusBadge(feature.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {feature.details.map(detail => (
                    <li key={detail} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Stack technique</h2>
          <p className="text-muted-foreground text-center mb-8">Architecture moderne, zero dependance lourde inutile</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_FEATURES.map(item => (
              <div key={item.title} className="p-4 rounded-xl border bg-card space-y-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interop */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Interoperabilite</h2>
          <p className="text-muted-foreground text-center mb-8">Standards de sante integres nativement</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEROP.map(item => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <Badge variant="secondary" className="shrink-0 mt-0.5">{item.label}</Badge>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roles summary */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">5 interfaces, 1 systeme</h2>
          <p className="text-muted-foreground text-center mb-8">Chaque role a son interface optimisee</p>
          <div className="grid sm:grid-cols-5 gap-4">
            {[
              { role: 'Medecin', route: '/board', icon: <Stethoscope className="h-5 w-5" />, metric: 'Board 3 zones' },
              { role: 'IOA', route: '/triage', icon: <ClipboardList className="h-5 w-5" />, metric: 'Tri < 2 min' },
              { role: 'IDE', route: '/pancarte', icon: <Heart className="h-5 w-5" />, metric: 'Admin 1 tap' },
              { role: 'AS', route: '/as', icon: <Activity className="h-5 w-5" />, metric: '4 boutons' },
              { role: 'Secretaire', route: '/accueil', icon: <UserPlus className="h-5 w-5" />, metric: '< 90 sec' },
            ].map(item => (
              <div key={item.role} className="p-4 rounded-xl border bg-card text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-sm">{item.role}</h4>
                <p className="text-xs text-muted-foreground">{item.metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">Pret a tester UrgenceOS ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            5 comptes demo preconfigures, 15 patients fictifs. Testez chaque role en quelques clics.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/demo')} variant="outline">
              Voir la demo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4 mr-1" /> Se connecter
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide a la gestion des urgences hospitalieres.
            Il ne constitue pas un dispositif medical certifie au sens de la reglementation en vigueur.
          </p>
        </div>
      </div>
    </div>
  );
}
