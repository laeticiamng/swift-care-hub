import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ImpactSection } from '@/components/landing/ImpactSection';

import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

const navLinks = [
  { label: 'Problème', target: 'problem' },
  { label: 'Rôles', target: 'roles' },
  { label: 'Impact', target: 'impact' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-lg font-bold tracking-tight cursor-pointer"
          >
            Urgence<span className="text-primary">OS</span>
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => navigate('/login')}>
              Connexion
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <RolesSection />
      <FeaturesSection />
      <ImpactSection />

      {/* Métriques clés spec */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">Métriques vérifiables</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Chaque interaction optimisée</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { metric: '< 2 min', label: 'Tri IOA complet' },
              { metric: '1 tap', label: 'Administration médicament' },
              { metric: '< 90s', label: 'Admission patient' },
              { metric: '0', label: 'Changement de page IDE' },
              { metric: '3 clics', label: 'Prescription complète' },
            ].map(m => (
              <div key={m.label} className="text-center p-4 rounded-xl border bg-card">
                <p className="text-2xl font-extrabold text-primary">{m.metric}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
}
