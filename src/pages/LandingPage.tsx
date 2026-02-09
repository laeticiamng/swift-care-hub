import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Building2, Zap, Scale } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ImpactArchitectureSection } from '@/components/landing/ImpactArchitectureSection';
import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

const navLinks = [
  { label: 'Probleme', target: 'problem' },
  { label: 'Roles', target: 'roles' },
  { label: 'Impact', target: 'impact' },
  { label: 'Fonctionnalites', target: '/features', isRoute: true },
  { label: 'Demo', target: '/demo', isRoute: true },
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
                onClick={() => 'isRoute' in link && link.isRoute ? navigate(link.target) : scrollTo(link.target)}
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
      <ImpactArchitectureSection />

      {/* Pourquoi UrgenceOS — condensed manifesto + timing */}
      <section className="py-16 px-6 bg-card border-y">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 text-center">Pourquoi UrgenceOS</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">La technologie doit servir le soin — pas l'inverse.</h2>
          <p className="text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto mb-10">
            Chaque clic inutile est un regard detourne du patient. Les soignants meritent des outils a la hauteur de leur engagement.
            Notre promesse : <span className="text-foreground font-semibold">zero formation, zero friction, zero perte de donnees</span>.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: 'Tension hospitaliere maximale', desc: "Chaque minute perdue en clics est une minute volee au patient. Le statu quo logiciel n'est plus tenable." },
              { icon: Zap, title: 'Technologie mature', desc: "Temps reel, PWA offline, RLS natif. Les briques pour un logiciel medical moderne existent enfin." },
              { icon: Scale, title: 'Standards poses', desc: "RPU normalise, identite INS, FHIR R4 : UrgenceOS s'y conforme nativement, sans surcout." },
            ].map(item => (
              <div key={item.title} className="p-5 rounded-xl border bg-background text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
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
