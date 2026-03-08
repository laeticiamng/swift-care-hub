import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustMarquee } from '@/components/landing/TrustMarquee';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { AntiFeatureSection } from '@/components/landing/AntiFeatureSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { AnnouncementBanner } from '@/components/landing/AnnouncementBanner';
import { JsonLd, PageMeta, howToSchema, webPageSchema } from '@/components/seo/JsonLd';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="UrgenceOS — Le logiciel des urgences que votre hôpital contrôle"
        description="UrgenceOS remplace les outils dispersés de votre service d'urgences par une plateforme intégrée, compatible avec votre dossier patient existant. Essai gratuit 10 semaines."
        canonical="https://urgenceos.fr/"
      />
      <JsonLd id="landing-howto" data={howToSchema()} />
      <JsonLd id="landing-webpage" data={webPageSchema({
        name: 'UrgenceOS — Le logiciel des urgences que votre hôpital contrôle',
        description: 'Plateforme intégrée pour les urgences hospitalières. Un écran par rôle, compatible avec votre DPI, hébergement en France.',
        url: 'https://urgenceos.fr',
        breadcrumb: ['Accueil'],
      })} />
      <AnnouncementBanner />
      <SiteHeader />

      <main>
        <HeroSection />
        <TrustMarquee />
        <SocialProofSection />
        <ProblemSection />
        <SolutionSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
        <AntiFeatureSection />
      </main>

      <FooterSection />
    </div>
  );
}
