import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Building2, HelpCircle } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    target: 'SAU < 25 000 passages/an',
    price: '990',
    period: '/mois HT',
    description: 'Idéal pour les services d\'urgences de petits établissements.',
    features: [
      '5 profils métier (Médecin, IOA, IDE, AS, Secrétaire)',
      'Board panoramique temps réel',
      'Triage IOA CIMU < 2 min',
      'Pancarte IDE unifiée',
      'Mode offline 4h+',
      'Hébergement HDS certifié',
      'Support email J+1',
    ],
    cta: 'Demander une démo',
    popular: false,
  },
  {
    name: 'Pro',
    target: 'SAU 25 000 – 60 000 passages/an',
    price: '1 990',
    period: '/mois HT',
    description: 'Pour les centres hospitaliers à forte activité.',
    features: [
      'Tout Starter +',
      'Interopérabilité FHIR R4 & HL7v2',
      'Identité INS intégrée',
      'RPU normalisé automatique',
      'Timeline IA assistée',
      'Intégration SIH bidirectionnelle',
      'Support prioritaire < 4h',
      'Formation sur site (2 jours)',
    ],
    cta: 'Demander une démo',
    popular: true,
  },
  {
    name: 'Établissement',
    target: 'CHU / GHT / Multi-sites',
    price: 'Sur mesure',
    period: '',
    description: 'Déploiement multi-sites avec accompagnement dédié.',
    features: [
      'Tout Pro +',
      'Déploiement multi-services',
      'SSO / LDAP établissement',
      'API d\'intégration complète',
      'SLA 99,9% garanti',
      'Chef de projet dédié',
      'Comité de pilotage trimestriel',
      'Audit sécurité annuel inclus',
    ],
    cta: 'Contacter l\'équipe',
    popular: false,
  },
];

const FAQ_PRICING = [
  {
    q: 'Le prix inclut-il l\'hébergement HDS ?',
    a: 'Oui. Toutes les offres incluent l\'hébergement sur infrastructure certifiée HDS (Hébergement de Données de Santé), conformément à la réglementation française.',
  },
  {
    q: 'Y a-t-il des frais de mise en service ?',
    a: 'L\'offre Starter ne requiert aucun frais d\'installation. Les offres Pro et Établissement incluent un accompagnement au déploiement dont le coût est détaillé dans la proposition commerciale.',
  },
  {
    q: 'Quelle est la durée d\'engagement ?',
    a: 'Engagement annuel avec facturation mensuelle ou annuelle (remise de 15% en paiement annuel). Résiliation possible à échéance avec préavis de 3 mois.',
  },
  {
    q: 'Comment fonctionne le support ?',
    a: 'Support email pour Starter (J+1), support prioritaire pour Pro (< 4h en heures ouvrées), et support dédié 24/7 pour Établissement avec astreinte téléphonique.',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Tarification transparente</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Un prix adapté à votre établissement
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SaaS clé en main. Hébergement HDS inclus. Aucun coût caché.
            Facturation par service d'urgences.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'bg-card'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Le plus choisi
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.target}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period ? ` €${plan.period}` : ''}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => navigate('/demo')}
              >
                {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Included everywhere */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Inclus dans toutes les offres</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Hébergement HDS', desc: 'Infrastructure certifiée conforme aux exigences CNIL/ANS' },
              { title: 'Mises à jour', desc: 'Nouvelles fonctionnalités et correctifs déployés en continu' },
              { title: 'Chiffrement', desc: 'Données chiffrées au repos et en transit (TLS 1.3)' },
              { title: 'Sauvegardes', desc: 'Backups quotidiens avec rétention 90 jours' },
              { title: 'Mode offline', desc: 'PWA avec 4h+ d\'autonomie sans connexion réseau' },
              { title: '5 profils métier', desc: 'Interfaces adaptées : Médecin, IOA, IDE, AS, Secrétaire' },
              { title: 'Mode sombre', desc: 'Interface adaptée aux gardes de nuit par défaut' },
              { title: 'Conformité RGPD', desc: 'Droit à l\'oubli, portabilité, registre de traitements' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl border bg-card space-y-1">
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ pricing */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes sur les tarifs</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_PRICING.map((item) => (
              <div key={item.q} className="p-5 rounded-xl border bg-card">
                <h4 className="font-semibold flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  {item.q}
                </h4>
                <p className="text-sm text-muted-foreground mt-2 ml-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <Building2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Besoin d'un devis personnalisé ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe vous accompagne pour dimensionner l'offre adaptée à votre établissement.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/b2b')}>
              Nous contacter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')}>
              Tester gratuitement
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Prix indicatifs au 1er janvier 2026. TVA applicable en sus. Les tarifs peuvent varier selon les spécificités du déploiement.
            UrgenceOS ne constitue pas un dispositif médical certifié.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
