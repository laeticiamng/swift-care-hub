import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import {
  Stethoscope, Shield, ClipboardList, Heart, UserCheck,
  MonitorDot, Zap, Clock, ShieldAlert, ArrowRight,
  Activity, Users, MousePointerClick, LogIn, LayoutDashboard,
  Timer, AppWindow, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/* ── Fade-in on scroll ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('opacity-100', 'translate-y-0'); el.classList.remove('opacity-0', 'translate-y-6'); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <section ref={ref} className={cn('opacity-0 translate-y-6 transition-all duration-700 ease-out', className)}>
      {children}
    </section>
  );
}

/* ── Data ── */
const stats = [
  { value: '40-60 %', label: 'Burnout urgentistes', icon: Activity },
  { value: '15+', label: 'Logiciels par SAU', icon: MonitorDot },
  { value: '6-8 clics', label: 'Pour 1 administration', icon: MousePointerClick },
];

const roles = [
  { icon: Stethoscope, title: 'Médecin', desc: 'Board panoramique + dossier contextuel + prescriptions' },
  { icon: Shield, title: 'IOA', desc: 'Tri structuré en 5 étapes, moins de 2 minutes' },
  { icon: ClipboardList, title: 'IDE', desc: 'Pancarte unifiée — administration 1 tap' },
  { icon: Heart, title: 'Aide-soignant(e)', desc: '4 gros boutons, zéro donnée médicale' },
  { icon: UserCheck, title: 'Secrétaire', desc: 'Admission en moins de 90 secondes' },
];

const features = [
  { icon: MonitorDot, title: 'Board temps réel', desc: 'Vue panoramique 3 colonnes SAU · UHCD · Déchocage avec drag & drop.' },
  { icon: Zap, title: '1 tap administration', desc: 'L\'IDE trace une administration en un seul geste. De 6-8 clics à 1.' },
  { icon: Clock, title: 'Tri IOA < 2 min', desc: 'Workflow guidé en 5 étapes avec suggestion CIMU automatique.' },
  { icon: ShieldAlert, title: 'Sécurité clinique', desc: 'Détection allergies croisées et constantes anormales en temps réel.' },
];

const steps = [
  { icon: LogIn, step: '01', title: 'Connexion', desc: 'Identifiez-vous avec votre profil hospitalier' },
  { icon: LayoutDashboard, step: '02', title: 'Interface adaptée', desc: 'Votre rôle détermine votre vue — uniquement l\'essentiel' },
  { icon: MousePointerClick, step: '03', title: 'Action en 1 tap', desc: 'Chaque geste clinique se fait en un minimum de clics' },
];

const impacts = [
  { value: '1 tap', label: 'au lieu de 6-8 clics pour administrer', icon: Zap },
  { value: '< 2 min', label: 'pour un tri IOA complet', icon: Timer },
  { value: '< 90 sec', label: 'pour une admission patient', icon: Clock },
  { value: '0', label: 'logiciel supplémentaire à ouvrir', icon: AppWindow },
];

/* ── Page ── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-lg font-bold tracking-tight cursor-pointer">Urgence<span className="text-primary">OS</span></button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => navigate('/login')}>Connexion</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-6 pt-24 pb-20 relative">
          <Badge variant="secondary" className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Projet de recherche 2026
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Urgence<span className="text-primary">OS</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Le système d'exploitation des urgences hospitalières.<br className="hidden sm:block" />
            De <strong className="text-foreground">6-8 clics à 1 seul tap</strong> pour chaque administration.
          </p>
          <p className="mt-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Un point d'entrée unique, cinq profils, zéro perte de temps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Accéder à UrgenceOS <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}>
              Découvrir
            </Button>
          </div>
        </div>
      </header>

      {/* Problem */}
      <Section className="bg-secondary/30 py-20 px-6">
        <div id="problem" className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Le problème</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Les urgences croulent sous les outils fragmentés. L'information est éparpillée, le soignant perd du temps.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map(s => (
              <div key={s.label} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col items-center gap-3">
                <s.icon className="h-8 w-8 text-primary" />
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Comment ça marche — 3 étapes */}
      <Section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Comment ça marche</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">Trois étapes pour passer de la connexion à l'action clinique.</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center gap-4">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-muted-foreground/20" />
                )}
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                  <s.icon className="h-9 w-9 text-primary" />
                  <span className="absolute -top-2 -right-2 text-xs font-bold bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">{s.step}</span>
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Roles */}
      <Section className="bg-secondary/30 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">5 profils, 1 système</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Même patient, même donnée, cinq interfaces radicalement différentes — chacune montre uniquement l'essentiel.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map(r => (
              <div key={r.title} className="bg-card rounded-xl border p-5 shadow-sm text-left hover:shadow-md transition-shadow">
                <r.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Fonctionnalités clés</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Conçu pour le geste clinique, pas pour l'informatique.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-card rounded-xl border p-6 shadow-sm text-left hover:shadow-md transition-shadow">
                <f.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Résultats attendus — Impact metrics */}
      <Section className="bg-secondary/30 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Résultats attendus</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Des gains mesurables dès la première utilisation.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map(m => (
              <div key={m.label} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-primary">{m.value}</p>
                <p className="text-sm text-muted-foreground leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-primary/5 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Prêt à transformer les urgences ?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">5 profils préconfigurés pour tester immédiatement. Aucune installation requise.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              Accéder à UrgenceOS <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}>
              Découvrir la démo
            </Button>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-medium">Urgence<span className="text-primary">OS</span> — Projet de recherche en systèmes d'information de santé — 2026</p>
          <div className="flex items-center gap-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-primary hover:underline">Haut de page</button>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-xs">React · TypeScript · Temps réel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
