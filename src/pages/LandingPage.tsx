import { Building2, Zap, Scale } from 'lucide-react';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ImpactArchitectureSection } from '@/components/landing/ImpactArchitectureSection';
import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

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
            Chaque clic inutile est un regard détourné du patient. Les soignants méritent des outils à la hauteur de leur engagement.
            Notre promesse : <span className="text-foreground font-semibold">zéro formation, zéro friction, zéro perte de données</span>.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: 'Tension hospitalière maximale', desc: "Chaque minute perdue en clics est une minute volée au patient. Le statu quo logiciel n'est plus tenable." },
              { icon: Zap, title: 'Technologie mature', desc: "Temps réel, PWA offline, RLS natif. Les briques pour un logiciel médical moderne existent enfin." },
              { icon: Scale, title: 'Standards posés', desc: "RPU normalisé, identité INS, FHIR R4 : UrgenceOS s'y conforme nativement, sans surcoût." },
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
