import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Heart, Shield, Zap, Users, Target, Award,
  Building2, Stethoscope, GraduationCap, Mail,
} from 'lucide-react';

const VALUES = [
  {
    icon: Heart,
    title: 'Le soin d\'abord',
    desc: 'Chaque décision produit est guidée par une question : est-ce que cela libère du temps pour le patient ?',
  },
  {
    icon: Zap,
    title: 'Simplicité radicale',
    desc: 'Moins de clics. Plus de soin. Nous refusons la complexité inutile.',
  },
  {
    icon: Shield,
    title: 'Confiance par défaut',
    desc: 'Sécurité et conformité ne sont pas des options. Elles sont dans l\'ADN du produit.',
  },
  {
    icon: Users,
    title: 'Conçu avec le terrain',
    desc: 'Chaque fonctionnalité est validée par des soignants en exercice avant d\'être déployée.',
  },
];

const MILESTONES = [
  { year: '2024', event: 'Création d\'EmotionsCare SASU' },
  { year: '2024', event: 'Premiers prototypes co-conçus avec des urgentistes' },
  { year: '2025', event: 'MVP fonctionnel : 5 profils, board temps réel, triage IOA' },
  { year: '2025', event: 'Intégration FHIR R4, HL7v2, MSSanté' },
  { year: '2026', event: 'Lancement pilote en établissement' },
  { year: '2026', event: 'Certification HDS infrastructure' },
];

const PARTNERS = [
  { icon: Building2, title: 'Établissements pilotes', desc: 'Partenariats avec des services d\'urgences pour la co-conception et la validation terrain.' },
  { icon: Stethoscope, title: 'Médecins urgentistes', desc: 'Comité médical consultatif pour garantir la pertinence clinique des fonctionnalités.' },
  { icon: GraduationCap, title: 'Recherche', desc: 'Collaboration avec des laboratoires de recherche en informatique médicale et ergonomie.' },
  { icon: Award, title: 'ANS & cadre CI-SIS', desc: 'Conformité aux référentiels de l\'Agence du Numérique en Santé.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">À propos</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            La technologie au service de l'urgence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            EmotionsCare SASU conçoit UrgenceOS, le système d'exploitation des urgences hospitalières.
            Notre mission : redonner du temps au soin.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20 py-12 px-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Target className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">Notre mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les urgences hospitalières souffrent d'outils informatiques inadaptés : trop de clics,
                trop de pages, trop de temps perdu. Pendant que les soignants se battent avec leur logiciel,
                les patients attendent. UrgenceOS est né de ce constat simple : <strong className="text-foreground">les outils numériques
                doivent accélérer le soin, pas le freiner</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Nous construisons un logiciel qui s'efface devant le soignant. Zero formation requise,
                autonomie en moins de 30 minutes, et une interface qui minimise chaque interaction pour
                maximiser le temps passé auprès du patient.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Nos valeurs</h2>
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

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Notre parcours</h2>
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

        {/* Partners */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Écosystème & partenaires</h2>
          <p className="text-muted-foreground text-center mb-8">UrgenceOS se construit avec les acteurs de la santé</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {PARTNERS.map((p) => (
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

        {/* Company info */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <h2 className="text-xl font-bold mb-4">EmotionsCare SASU</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Forme juridique :</span> SASU</p>
              <p><span className="text-muted-foreground">Siège social :</span> France</p>
              <p><span className="text-muted-foreground">Activité :</span> Édition de logiciels de santé</p>
            </div>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Produit :</span> UrgenceOS</p>
              <p><span className="text-muted-foreground">Marché :</span> Établissements de santé (SAU)</p>
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
          <h2 className="text-2xl font-bold mb-3">Envie de transformer les urgences avec nous ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Que vous soyez soignant, DSI ou directeur d'établissement, parlons de votre projet.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/b2b')}>
              Nous contacter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')}>
              Découvrir la démo
            </Button>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
