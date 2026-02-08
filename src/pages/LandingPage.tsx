import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import {
  Stethoscope, Shield, ClipboardList, Heart, UserCheck,
  MonitorDot, Zap, Clock, ShieldAlert, ArrowRight,
  Activity, Users, MousePointerClick
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const semanticColors = [
  { color: 'bg-medical-critical', label: 'Critique', css: 'text-medical-critical' },
  { color: 'bg-medical-warning', label: 'Attention', css: 'text-medical-warning' },
  { color: 'bg-medical-success', label: 'Normal', css: 'text-medical-success' },
  { color: 'bg-medical-info', label: 'Informatif', css: 'text-medical-info' },
  { color: 'bg-medical-inactive', label: 'Historique', css: 'text-medical-inactive' },
];

/* ── Page ── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-lg font-bold tracking-tight">Urgence<span className="text-primary">OS</span></span>
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
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Urgence<span className="text-primary">OS</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La révolution des urgences hospitalières.<br className="hidden sm:block" />
            Un système, cinq profils, zéro friction.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              Accès au système <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}>
              Découvrir
            </Button>
          </div>
        </div>
      </header>

      {/* Problem */}
      <Section className="bg-secondary/30 py-20 px-6" >
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

      {/* Roles */}
      <Section className="py-20 px-6">
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
      <Section className="bg-secondary/30 py-20 px-6">
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

      {/* Semantic colors */}
      <Section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Code couleur sémantique</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Chaque couleur a un sens clinique précis — partout dans l'application.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {semanticColors.map(c => (
              <div key={c.label} className="flex flex-col items-center gap-2">
                <div className={cn('h-14 w-14 rounded-full shadow-md', c.color)} />
                <span className={cn('text-sm font-medium', c.css)}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-primary/5 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à transformer les urgences ?</h2>
          <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
            Accès au système <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <p>UrgenceOS — Réflexion académique — Février 2026</p>
        <button onClick={() => navigate('/login')} className="text-primary hover:underline mt-1 text-sm">
          Connexion
        </button>
      </footer>
    </div>
  );
}
