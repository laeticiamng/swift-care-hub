import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { JsonLd, PageMeta, webPageSchema, organizationSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import {
  ArrowRight, Shield, Users, Target, Building2,
  Mail, Layers, BarChart3, Handshake, GitBranch,
} from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const a = t.about;

  const VALUES = [
    { icon: Building2, title: 'Autonomie hospitalière', desc: a.missionP1.slice(0, 120) + '…' },
    { icon: Shield, title: 'Sécurité structurelle', desc: 'La sécurité n\'est pas une couche ajoutée. Elle est dans l\'architecture : RBAC, audit immuable, chiffrement.' },
    { icon: BarChart3, title: 'Preuve par les chiffres', desc: 'Chaque déploiement commence par une mesure. ROI mesuré, critères go/no-go définis à l\'avance.' },
    { icon: Users, title: 'Co-construction terrain', desc: 'Chaque module est conçu avec des soignants en exercice.' },
  ];

  const MILESTONES = [
    { year: '2024', event: 'Création d\'EmotionsCare SASU — naissance du concept Hospital-Owned Software' },
    { year: '2024', event: 'Premiers prototypes co-conçus avec des urgentistes et DSI hospitaliers' },
    { year: '2025', event: 'Architecture socle validée : identité, droits d\'accès, audit, connecteurs dossier patient' },
    { year: '2025', event: 'Modules ROI #1 (récap parcours) et #2 (traçabilité temps réel) fonctionnels' },
    { year: '2026', event: 'Lancement du premier essai 10 semaines en établissement' },
    { year: '2026', event: 'Ouverture du modèle consortium GHT — mutualisation multi-établissements' },
  ];

  const ECOSYSTEM = [
    { icon: Building2, title: 'Établissements partenaires', desc: 'Partenariats avec des services d\'urgences pour valider le ROI.' },
    { icon: Handshake, title: 'DSI hospitalières', desc: 'Co-construction avec les DSI pour garantir l\'intégration DPI.' },
    { icon: Layers, title: 'GHT & ARS', desc: 'Modèle de mutualisation conçu pour les GHT. Socle partagé, données isolées.' },
    { icon: GitBranch, title: 'Standards ouverts', desc: 'Compatible avec les référentiels nationaux de santé.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="À propos d'UrgenceOS — EmotionsCare, Hospital-Owned Software"
        description="EmotionsCare conçoit UrgenceOS : socle Hospital-Owned pour urgences hospitalières."
        canonical="https://urgenceos.fr/about"
      />
      <JsonLd id="about-webpage" data={webPageSchema({
        name: 'À propos d\'UrgenceOS — EmotionsCare SASU',
        description: 'EmotionsCare conçoit UrgenceOS : socle Hospital-Owned Software.',
        url: 'https://urgenceos.fr/about',
        breadcrumb: [a.breadcrumbHome, a.breadcrumbAbout],
      })} />
      <JsonLd id="about-org" data={organizationSchema()} />
      <SiteHeader />

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: a.breadcrumbHome, to: '/' },
          { label: a.breadcrumbAbout },
        ]} />

        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">{a.badge}</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{a.heroTitle}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{a.heroSubtitle}</p>
        </div>

        {/* Mission */}
        <div className="mb-20 py-12 px-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Target className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">{a.missionTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">{a.missionP1}</p>
              <p className="text-muted-foreground leading-relaxed mt-3">{a.missionP2}</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">{a.principlesTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex items-start gap-4 p-6 rounded-xl border bg-card">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision GHT */}
        <div className="mb-20 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <h2 className="text-2xl font-bold text-center mb-3">{a.visionTitle}</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">{a.visionSubtitle}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: a.phase1, title: a.phase1Title, desc: a.phase1Desc },
              { step: a.phase2, title: a.phase2Title, desc: a.phase2Desc },
              { step: a.phase3, title: a.phase3Title, desc: a.phase3Desc },
            ].map((item) => (
              <div key={item.step} className="p-5 rounded-xl border bg-card space-y-2 text-center">
                <span className="text-xs font-semibold text-primary">{item.step}</span>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">{a.timelineTitle}</h2>
          <div className="max-w-2xl mx-auto">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary shrink-0 mt-1.5" />
                  {i < MILESTONES.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-6">
                  <span className="text-xs font-semibold text-primary">{m.year}</span>
                  <p className="text-sm">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">{a.ecosystemTitle}</h2>
          <p className="text-muted-foreground text-center mb-8">{a.ecosystemSubtitle}</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {ECOSYSTEM.map((p) => (
              <div key={p.title} className="flex items-start gap-4 p-6 rounded-xl border bg-card">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fondatrice */}
        <div className="mb-20 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-3xl font-bold text-primary">
              LM
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Laeticia Motongane</h2>
              <p className="text-primary font-medium mb-3">{a.founderRole}</p>
              <p className="text-muted-foreground leading-relaxed mb-4">{a.founderBio}</p>
              <a
                href="https://www.linkedin.com/company/emotionscare/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                LinkedIn →
              </a>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <h2 className="text-xl font-bold mb-4">{a.companyTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Forme juridique :</span> SASU</p>
              <p><span className="text-muted-foreground">SIREN :</span> 944 505 445</p>
              <p><span className="text-muted-foreground">Capital social :</span> 1 000 €</p>
              <p><span className="text-muted-foreground">Siège social :</span> Amiens (80000), France</p>
              <p><span className="text-muted-foreground">Présidente :</span> Laeticia Motongane</p>
            </div>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Activité :</span> Édition de logiciels de santé</p>
              <p><span className="text-muted-foreground">Produit :</span> UrgenceOS (socle + modules urgences)</p>
              <p><span className="text-muted-foreground">Marché :</span> Services d'urgences, GHT, hôpitaux publics</p>
              <p className="flex items-center gap-1">
                <span className="text-muted-foreground">Contact :</span>
                <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> contact@emotionscare.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">{a.ctaTitle}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{a.ctaSubtitle}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/b2b')}>
              {a.ctaButton} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')}>
              {a.ctaDemo}
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">{a.disclaimer}</p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
