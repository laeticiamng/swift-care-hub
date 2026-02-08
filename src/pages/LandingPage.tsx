import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Building2, Zap, Scale } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ImpactSection } from '@/components/landing/ImpactSection';

import { InnovationsSection } from '@/components/landing/InnovationsSection';
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

      {/* Slogan separator */}
      <div className="py-8 px-6 text-center">
        <p className="text-xl sm:text-2xl font-bold text-primary italic">"Un logiciel pensé PAR des soignants, POUR des soignants."</p>
      </div>

      <HowItWorksSection />
      <RolesSection />

      {/* Slogan separator */}
      <div className="py-8 px-6 text-center">
        <p className="text-xl sm:text-2xl font-bold text-primary italic">"L'urgence n'attend pas. Votre logiciel non plus."</p>
      </div>

      <FeaturesSection />
      <ImpactSection />
      
      <InnovationsSection />

      {/* Manifesto */}
      <section className="py-16 px-6 bg-card border-y">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Manifesto</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Nous croyons que la technologie doit servir le soin.</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-left sm:text-center">
            <p>Chaque clic inutile est un regard détourné du patient. Chaque écran mal conçu est une source de fatigue cognitive qui s'accumule au fil d'une garde de 12 heures.</p>
            <p>UrgenceOS est né d'un constat simple : <span className="text-foreground font-medium">les soignants méritent des outils à la hauteur de leur engagement</span>. Pas des logiciels pensés par des informaticiens dans des bureaux, mais une solution forgée dans le bruit des urgences, entre deux patients.</p>
            <p>Notre promesse : <span className="text-foreground font-semibold">zéro formation, zéro friction, zéro perte de données</span>. Un logiciel qui s'adapte au soignant — jamais l'inverse.</p>
          </div>
        </div>
      </section>

      {/* Pourquoi maintenant ? */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">Timing</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Pourquoi maintenant ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Tension hospitalière maximale', desc: "Les urgences françaises font face à une crise sans précédent. Le statu quo logiciel n'est plus tenable : chaque minute perdue en clics est une minute volée au patient." },
              { icon: Zap, title: 'Technologie mature', desc: "Temps réel, PWA offline, RLS natif, déploiement cloud en un clic. Les briques techniques pour un logiciel médical moderne existent enfin — sans compromis sur la sécurité." },
              { icon: Scale, title: 'Cadre réglementaire stabilisé', desc: "RPU normalisé, identité INS, FHIR R4 : les standards sont posés. UrgenceOS s'y conforme nativement, sans couche d'adaptation coûteuse." },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-xl border bg-card text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slogan separator */}
      <div className="py-8 px-6 text-center">
        <p className="text-xl sm:text-2xl font-bold text-primary italic">"8 clics hier. 1 tap aujourd'hui."</p>
      </div>

      {/* Métriques clés spec — 10 métriques complètes */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">Métriques vérifiables</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Moins de clics. Plus de soin.</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">Chaque interaction a été optimisée pour redonner du temps au soignant.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { metric: '< 2 min', label: 'Tri IOA complet' },
              { metric: '1 tap', label: 'Administration médicament' },
              { metric: '< 90s', label: 'Admission patient' },
              { metric: '0', label: 'Changement de page IDE' },
              { metric: '3 clics', label: 'Prescription complète' },
              { metric: '< 30 min', label: 'Autonomie formation' },
              { metric: '< 1 min', label: 'Transmission DAR' },
              { metric: '0 sec', label: 'Accès CRH auto' },
              { metric: '> 80', label: 'Score SUS cible' },
              { metric: '> 4h', label: 'Mode offline' },
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
