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

export default function LandingPage() {
  const navigate = useNavigate();

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
      <CTASection />
      <FooterSection />
    </div>
  );
}
