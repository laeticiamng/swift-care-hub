import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustMarquee } from '@/components/landing/TrustMarquee';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { WhyNowSection } from '@/components/landing/WhyNowSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { CTASection } from '@/components/landing/CTASection';
import { VisionSection } from '@/components/landing/VisionSection';
import { AntiFeatureSection } from '@/components/landing/AntiFeatureSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { AnnouncementBanner } from '@/components/landing/AnnouncementBanner';
import { JsonLd, PageMeta, howToSchema, webPageSchema } from '@/components/seo/JsonLd';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="UrgenceOS — Logiciel urgences hospitalières Hospital-Owned Software"
        description="Socle logiciel Hospital-Owned pour urgences hospitalières. Interface par rôle (médecin, IOA, IDE, AS, secrétaire). Interopérabilité FHIR R4/HL7v2. Pilote 10 semaines. HDS France."
        canonical="https://urgenceos.fr/"
      />
      <JsonLd id="landing-howto" data={howToSchema()} />
      <JsonLd id="landing-webpage" data={webPageSchema({
        name: 'UrgenceOS — Le système d\'exploitation des urgences hospitalières',
        description: 'Socle Hospital-Owned Software avec interface par rôle, interopérabilité FHIR R4/HL7v2, audit immuable et hébergement HDS France.',
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
        <WhyNowSection />
        <BenefitsSection />
        <SecuritySection />
        <CTASection />
        <VisionSection />
        <AntiFeatureSection />

      </main>

      <FooterSection />
    </div>
  );
}
