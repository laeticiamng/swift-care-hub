import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { cn } from '@/lib/utils';
import {
  Activity, ArrowLeft, ArrowRight, ChevronRight, ClipboardList,
  Heart, Layout, LogIn, Play, Shield, Stethoscope, Timer,
  UserPlus, Users, Wifi, WifiOff, Zap,
} from 'lucide-react';

interface DemoStep {
  role: string;
  roleLabel: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  screenContent: React.ReactNode;
}

function MockBoardScreen() {
  const patients = [
    { name: 'DUPONT Jean', age: 72, motif: 'Douleur thoracique', ccmu: 2, zone: 'SAU', box: 3, status: 'in-progress' },
    { name: 'MARTIN Sophie', age: 45, motif: 'Chute', ccmu: 4, zone: 'SAU', box: 7, status: 'triaged' },
    { name: 'BERNARD Luc', age: 88, motif: 'Dyspnee', ccmu: 2, zone: 'UHCD', box: 1, status: 'in-progress' },
  ];
  const cimuColors = ['', 'bg-red-600', 'bg-red-400', 'bg-orange-400', 'bg-green-500', 'bg-green-600'];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
        <Layout className="h-3.5 w-3.5" /> Board panoramique - 3 patients en cours
      </div>
      {patients.map(p => (
        <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card text-sm">
          <div className={cn('w-2 h-8 rounded-full', cimuColors[p.ccmu])} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs">{p.name} <span className="font-normal text-muted-foreground">{p.age}a</span></p>
            <p className="text-xs text-muted-foreground truncate">{p.motif}</p>
          </div>
          <Badge variant="outline" className="text-[10px]">{p.zone} Box {p.box}</Badge>
        </div>
      ))}
    </div>
  );
}

function MockTriageScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ClipboardList className="h-3.5 w-3.5" /> Triage IOA - 5 etapes
      </div>
      <Progress value={60} className="h-2" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {['Identite', 'Motif', 'Constantes', 'CIMU', 'Orientation'].map((s, i) => (
          <span key={s} className={cn(i < 3 ? 'text-primary font-medium' : '')}>{s}</span>
        ))}
      </div>
      <div className="p-3 rounded-lg border bg-card space-y-2">
        <p className="text-xs font-medium">Constantes recueillies :</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'FC', value: '92', unit: 'bpm' },
            { label: 'PA', value: '135/82', unit: 'mmHg' },
            { label: 'SpO2', value: '97', unit: '%' },
            { label: 'T', value: '37.2', unit: 'C' },
          ].map(v => (
            <div key={v.label} className="text-center p-1.5 rounded border">
              <p className="text-[10px] text-muted-foreground">{v.label}</p>
              <p className="text-sm font-bold">{v.value}</p>
              <p className="text-[9px] text-muted-foreground">{v.unit}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs">Suggestion IA : <span className="font-bold">CIMU 3</span> - Fonctionnel</p>
      </div>
    </div>
  );
}

function MockPancarteScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Heart className="h-3.5 w-3.5" /> Pancarte IDE - DUPONT Jean, 72a
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'FC', value: '88', abnormal: false },
          { label: 'PA', value: '128/76', abnormal: false },
          { label: 'SpO2', value: '91', abnormal: true },
          { label: 'EVA', value: '7', abnormal: true },
        ].map(v => (
          <div key={v.label} className={cn('text-center p-1.5 rounded border', v.abnormal && 'border-red-400 bg-red-50 dark:bg-red-950/20')}>
            <p className="text-[10px] text-muted-foreground">{v.label}</p>
            <p className={cn('text-sm font-bold', v.abnormal && 'text-red-600')}>{v.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Prescriptions actives</p>
        {[
          { name: 'Paracetamol 1g IV', status: 'done' },
          { name: 'Morphine 3mg SC', status: 'pending' },
          { name: 'NFS, Iono, Tropo', status: 'preleve' },
        ].map(rx => (
          <div key={rx.name} className={cn('flex items-center justify-between p-2 rounded-lg border text-xs',
            rx.status === 'done' ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-card')}>
            <span>{rx.name}</span>
            {rx.status === 'done' ? (
              <Badge className="bg-green-600 text-white text-[9px]">Fait</Badge>
            ) : rx.status === 'pending' ? (
              <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700 text-white px-2">Administrer</Button>
            ) : (
              <Badge variant="outline" className="text-[9px]">Preleve</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockASScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Activity className="h-3.5 w-3.5" /> Interface aide-soignant
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Constantes', icon: Activity, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Surveillance', icon: Shield, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: 'Brancardage', icon: ArrowRight, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Confort', icon: Heart, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
        ].map(item => (
          <div key={item.label} className={cn('flex flex-col items-center justify-center p-4 rounded-xl border', item.color)}>
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Gros boutons tactiles — concu pour les urgences (gants, ecrans mouilles)</p>
    </div>
  );
}

function MockSecretaireScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <UserPlus className="h-3.5 w-3.5" /> Admission rapide - objectif &lt; 90s
      </div>
      <div className="p-3 rounded-lg border bg-card space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Nom</p>
            <div className="h-7 rounded border bg-muted/30 px-2 flex items-center text-xs font-medium">LEFEVRE</div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Prenom</p>
            <div className="h-7 rounded border bg-muted/30 px-2 flex items-center text-xs font-medium">Marie</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Naissance</p>
            <div className="h-7 rounded border bg-muted/30 px-2 flex items-center text-xs">12/03/1958</div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Sexe</p>
            <div className="h-7 rounded border bg-muted/30 px-2 flex items-center text-xs">F</div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Motif</p>
            <div className="h-7 rounded border bg-muted/30 px-2 flex items-center text-xs">Chute</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg bg-medical-success/10 border border-medical-success/20">
        <span className="text-xs text-medical-success font-medium">Patient existant detecte</span>
        <Badge variant="secondary" className="text-[9px]">Auto-complete</Badge>
      </div>
    </div>
  );
}

const DEMO_STEPS: DemoStep[] = [
  {
    role: 'medecin',
    roleLabel: 'Medecin',
    title: 'Board panoramique',
    description: 'Vue d\'ensemble de tous les patients par zone (SAU, UHCD, Dechocage). Filtrage par medecin, alertes temps reel sur les resultats critiques, timer de prise en charge.',
    features: ['Board Kanban par zone', 'Carte patient avec constantes', 'Alerte resultats critiques', 'Timer > 4h de prise en charge'],
    icon: <Stethoscope className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    screenContent: <MockBoardScreen />,
  },
  {
    role: 'ioa',
    roleLabel: 'IOA',
    title: 'Triage en 5 etapes',
    description: 'Workflow optimise pour trier un patient en moins de 2 minutes. Suggestion automatique de la classification CIMU basee sur les constantes. Detection des homonymes.',
    features: ['Workflow 5 etapes', 'Timer < 2 min', 'Classification CIMU assistee', 'Recherche patient existant'],
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    screenContent: <MockTriageScreen />,
  },
  {
    role: 'ide',
    roleLabel: 'IDE',
    title: 'Pancarte unifiee',
    description: 'Tout le dossier patient sur un seul ecran. Administration medicaments en 1 tap, transmissions DAR auto-remplies, graphiques constantes en temps reel.',
    features: ['Fiche patient 0 changement de page', 'Admin medicaments en 1 tap', 'Transmissions DAR integrees', 'Constantes avec mini-graphiques'],
    icon: <Heart className="h-5 w-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    screenContent: <MockPancarteScreen />,
  },
  {
    role: 'as',
    roleLabel: 'Aide-soignant',
    title: '4 gros boutons',
    description: 'Interface minimaliste avec gros boutons tactiles. Saisie des constantes avec validation automatique et alerte si hors norme. Concue pour les gants et ecrans mouilles.',
    features: ['4 boutons principaux', 'Saisie numerique validee', 'Alerte valeurs anormales', 'Interface tactile optimisee'],
    icon: <Activity className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    screenContent: <MockASScreen />,
  },
  {
    role: 'secretaire',
    roleLabel: 'Secretaire',
    title: 'Admission rapide',
    description: 'Formulaire d\'admission optimise pour enregistrer un patient en moins de 90 secondes. Recherche automatique des patients existants, detection des homonymes.',
    features: ['Admission < 90 secondes', 'Recherche patient existant', 'Detection homonymes', 'Attribution box/brancard'],
    icon: <UserPlus className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    screenContent: <MockSecretaireScreen />,
  },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const step = DEMO_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-bold">
            <ArrowLeft className="h-4 w-4" /> Urgence<span className="text-primary">OS</span>
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo interactive</Badge>
            <ThemeToggle />
            <Button size="sm" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4 mr-1" /> Essayer
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            Decouvrez UrgenceOS en 5 ecrans
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chaque role soignant dispose d'une interface adaptee a ses besoins.
            Parcourez les 5 profils pour comprendre comment UrgenceOS optimise le workflow des urgences.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.role}
              onClick={() => setCurrentStep(i)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                i === currentStep
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border hover:bg-accent',
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.roleLabel}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left - Description */}
          <div className="space-y-6">
            <div>
              <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3', step.bgColor, step.color)}>
                {step.icon} {step.roleLabel}
              </div>
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Points cles :</p>
              {step.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Precedent
              </Button>
              {currentStep < DEMO_STEPS.length - 1 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Suivant <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => navigate('/demo/live')} className="bg-medical-success hover:bg-medical-success/90">
                  <Play className="h-4 w-4 mr-1" /> Essayer en live
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/demo/live')} className="text-xs text-primary">
                Demo interactive
              </Button>
            </div>
          </div>

          {/* Right - Mock screen */}
          <Card className="overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-muted-foreground">urgenceos.fr/{step.role === 'medecin' ? 'board' : step.role === 'ioa' ? 'triage' : step.role === 'ide' ? 'pancarte' : step.role === 'as' ? 'as' : 'accueil'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Wifi className="h-3 w-3 text-green-500" /> En ligne
              </div>
            </div>
            <CardContent className="p-4">
              {step.screenContent}
            </CardContent>
          </Card>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {DEMO_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === currentStep ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30',
              )}
            />
          ))}
        </div>

        {/* Bottom features */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Secure-by-design', desc: 'RLS strict par role, encryption, audit trail complet. RGPD sante natif.' },
            { icon: WifiOff, title: 'Offline-first', desc: 'PWA avec >4h d\'autonomie hors connexion. Sync automatique au retour reseau.' },
            { icon: Timer, title: 'Performance', desc: 'Chaque ecran charge en <1 seconde. Zero friction, zero formation.' },
          ].map(item => (
            <div key={item.title} className="p-5 rounded-xl border bg-card text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide a la gestion des urgences hospitalieres.
            Il ne constitue pas un dispositif medical certifie.
            Les donnees presentees dans cette demo sont fictives.
          </p>
        </div>
      </div>
    </div>
  );
}
