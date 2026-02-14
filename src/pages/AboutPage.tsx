import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Users, Target, Building2,
  Mail, Layers, BarChart3, Handshake, GitBranch,
} from 'lucide-react';

const VALUES = [
  {
    icon: Building2,
    title: 'Autonomie hospitalière',
    desc: 'L\'hôpital possède son socle logiciel. Pas de licence récurrente, pas de dépendance fournisseur. Les priorités d\'évolution sont décidées en interne.',
  },
  {
    icon: Shield,
    title: 'Sécurité structurelle',
    desc: 'La sécurité n\'est pas une couche ajoutée. Elle est dans l\'architecture : RBAC, audit immuable, chiffrement, séparation des environnements.',
  },
  {
    icon: BarChart3,
    title: 'Preuve par les chiffres',
    desc: 'Chaque déploiement commence par une mesure. ROI mesuré, critères go/no-go définis à l\'avance. Pas de promesse sans preuve.',
  },
  {
    icon: Users,
    title: 'Co-construction terrain',
    desc: 'Chaque module est conçu avec des soignants en exercice. L\'ergonomie est validée par ceux qui l\'utilisent, pas par ceux qui la vendent.',
  },
];

const MILESTONES = [
  { year: '2024', event: 'Création d\'EmotionsCare SASU — naissance du concept Hospital-Owned Software' },
  { year: '2024', event: 'Premiers prototypes co-conçus avec des urgentistes et DSI hospitaliers' },
  { year: '2025', event: 'Architecture socle validée : identité, RBAC, audit, bus d\'intégration FHIR R4' },
  { year: '2025', event: 'Modules ROI #1 (récap parcours) et #2 (traçabilité temps réel) fonctionnels' },
  { year: '2026', event: 'Lancement du premier pilote 10 semaines en établissement' },
  { year: '2026', event: 'Ouverture du modèle consortium GHT — mutualisation multi-établissements' },
];

const ECOSYSTEM = [
  { icon: Building2, title: 'Établissements pilotes', desc: 'Partenariats avec des services d\'urgences pour valider le ROI sur données réelles et mesurer la réduction de dette opérationnelle.' },
  { icon: Handshake, title: 'DSI hospitalières', desc: 'Co-construction de l\'architecture socle avec les DSI pour garantir l\'intégration DPI et la gouvernance interne.' },
  { icon: Layers, title: 'GHT & ARS', desc: 'Modèle de mutualisation conçu pour les groupements hospitaliers de territoire. Socle partagé, données isolées, coûts divisés.' },
  { icon: GitBranch, title: 'Standards ouverts', desc: 'Conformité CI-SIS, FHIR R4, HL7v2, INS, MSSanté. Interopérabilité native, pas propriétaire.' },
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
            L'hôpital public mérite un SI qu'il contrôle.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            EmotionsCare conçoit UrgenceOS : un socle logiciel que l'hôpital possède,
            des modules urgences à ROI mesurable, et une architecture qui réduit la dette opérationnelle
            au lieu de l'aggraver.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20 py-12 px-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Target className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">Notre conviction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les hôpitaux accumulent une dette opérationnelle invisible : licences récurrentes en hausse,
                interfaces fragiles entre 15 à 40 applications, temps clinique perdu en friction logicielle,
                surface d'attaque qui croît avec chaque outil supplémentaire.
                <strong className="text-foreground"> Le problème n'est pas un manque de logiciels. C'est un excès d'outils non maîtrisés.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Hospital-Owned Software est notre réponse : un socle interne que l'hôpital possède et gouverne,
                sur lequel se branchent des modules métier interopérables. Le DPI reste en place. Les outils
                satellites disparaissent un par un. La dette diminue au lieu de s'accumuler.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Nos principes</h2>
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
          <h2 className="text-2xl font-bold text-center mb-3">Vision : du pilote au territoire</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Un hôpital valide. Un GHT mutualise. Un territoire standardise.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: 'Phase 1', title: 'Pilote', desc: 'Un établissement prouve le ROI sur le périmètre urgences. 10 semaines, critères go/no-go définis.' },
              { step: 'Phase 2', title: 'Mutualisation', desc: 'Trois établissements partagent le socle et les modules. Données isolées, coûts divisés.' },
              { step: 'Phase 3', title: 'Standardisation', desc: 'Le GHT standardise ses flux, ses connecteurs et ses indicateurs. ARS-ready.' },
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

        {/* Ecosystem */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Écosystème</h2>
          <p className="text-muted-foreground text-center mb-8">UrgenceOS se construit avec les acteurs du terrain</p>
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

        {/* Company info */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <h2 className="text-xl font-bold mb-4">EmotionsCare SASU</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Forme juridique :</span> SASU</p>
              <p><span className="text-muted-foreground">Siège social :</span> France</p>
              <p><span className="text-muted-foreground">Activité :</span> Édition de logiciels de santé — Hospital-Owned Software</p>
            </div>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Produit :</span> UrgenceOS (socle + modules urgences)</p>
              <p><span className="text-muted-foreground">Marché :</span> SAU, GHT, établissements de santé publics</p>
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
          <h2 className="text-2xl font-bold mb-3">Prêt à reprendre le contrôle de votre SI ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            10 semaines pour mesurer le ROI avec vos chiffres. Zéro engagement pluriannuel.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/b2b')}>
              Demander un pilote <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')}>
              Voir la démo
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
