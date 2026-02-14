import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Building2, HelpCircle, Calculator } from 'lucide-react';

const PLANS = [
  {
    name: 'Pilote',
    target: 'Un service d\'urgences',
    price: 'Forfait cadré',
    period: '',
    description: '10 semaines. 2 modules. ROI mesuré. Intégration DPI lecture seule.',
    features: [
      'Socle interne (identité, RBAC, audit, API)',
      'Module récap parcours patient par rôle',
      'Module traçabilité temps réel',
      'Connecteur DPI lecture (FHIR R4 / HL7v2)',
      'Connecteur LIS (réception résultats)',
      'Formation par rôle (2h par profil)',
      'Mesure avant/après + rapport DG/DAF/DSI',
      'Critères go/no-go documentés',
    ],
    cta: 'Demander un pilote',
    popular: true,
  },
  {
    name: 'Extension',
    target: 'Multi-services',
    price: 'Sur mesure',
    period: '',
    description: 'Après validation pilote. Extension à d\'autres services + modules supplémentaires.',
    features: [
      'Tout le pilote +',
      'Modules supplémentaires (triage, prescriptions, sortie)',
      'Intégration bidirectionnelle DPI',
      'SSO / LDAP institutionnel',
      'Observabilité complète',
      'Comité de pilotage trimestriel',
      'Audit sécurité annuel inclus',
      'Coûts récurrents décroissants',
    ],
    cta: 'Contacter l\'équipe',
    popular: false,
  },
  {
    name: 'Consortium GHT',
    target: 'Multi-établissements',
    price: 'Mutualisé',
    period: '',
    description: 'Socle partagé. Modules communs. Coûts divisés. Gouvernance GHT.',
    features: [
      'Socle mutualisé multi-tenant',
      'Bibliothèque de modules partagés',
      'Connecteurs réutilisables entre établissements',
      'Équipe plateforme mutualisée',
      'Gouvernance d\'interopérabilité commune',
      'Indicateurs consolidés ARS-ready',
      'Division des coûts par établissement',
      'Standardisation des flux GHT',
    ],
    cta: 'Contacter l\'équipe',
    popular: false,
  },
];

const FAQ_PRICING = [
  {
    q: 'Pourquoi commencer par un pilote plutôt qu\'un déploiement complet ?',
    a: 'Le pilote mesure le ROI sur vos données réelles avant tout engagement. 10 semaines, périmètre urgences, critères go/no-go définis à l\'avance. Si les résultats sont là, vous décidez de la suite. Si non, vous arrêtez. Pas d\'engagement pluriannuel en première intention.',
  },
  {
    q: 'Comment le modèle économique diffère-t-il d\'un éditeur classique ?',
    a: 'Le socle est possédé par l\'hôpital. Pas de licence récurrente sur le socle. Les coûts portent sur le déploiement, la formation, le MCO, et les évolutions. Ils sont prévisibles et décroissants — pas de hausse unilatérale.',
  },
  {
    q: 'Comment construire le business case pour mon établissement ?',
    a: 'Nous fournissons un modèle de business case vierge (TCO 5 ans, formules ROI/payback) que nous remplissons ensemble lors d\'une réunion de 60 minutes avec le DAF. Les chiffres sont les vôtres, pas les nôtres.',
  },
  {
    q: 'Quel est le coût d\'un pilote ?',
    a: 'Le forfait pilote est calibré sur le périmètre (un service d\'urgences, 2 modules, 10 semaines). Il inclut le cadrage, le déploiement, la formation, et le rapport de mesure. Le montant exact dépend de la complexité d\'intégration avec votre DPI. Demandez un devis.',
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
          <Badge variant="secondary" className="mb-4">Modèle économique</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pilote cadré, ROI mesuré, extension par la preuve.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Pas d'engagement pluriannuel en première intention.
            Un pilote de 10 semaines pour mesurer le ROI avec vos chiffres.
            Si les résultats sont là, vous scalez. Si non, vous arrêtez.
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
                  Recommandé
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.target}</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-extrabold">{plan.price}</span>
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
                onClick={() => navigate('/b2b')}
              >
                {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Business case */}
        <div className="mb-20 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Calculator className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Business case : vos chiffres, pas les nôtres.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous fournissons un modèle de business case TCO 5 ans à remplir avec les données de votre établissement.
                Aucun chiffre inventé. Les formules ROI/payback sont transparentes.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm mb-2 text-medical-critical">Coûts actuels (à mesurer)</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Licences outils satellites urgences</li>
                <li>Maintenance et support éditeurs</li>
                <li>Coûts d'interfaces et connecteurs</li>
                <li>Incidents d'intégration (heures DSI)</li>
                <li>Temps clinique perdu (min/poste x postes x 365j)</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm mb-2 text-primary">Coûts cible (avec UrgenceOS)</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Investissement initial (socle + modules + formation)</li>
                <li>Équipe plateforme interne (part ETP DSI)</li>
                <li>Hébergement HDS</li>
                <li>MCO et audit sécurité annuel</li>
                <li>ROI = (coûts actuels - coûts cible) / investissement</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">Formules ROI / Payback</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><strong className="text-foreground">Économie annuelle nette</strong> = coûts actuels (A) - coûts cible (B)</li>
              <li><strong className="text-foreground">ROI année 1</strong> = (A - B - investissement initial) / investissement × 100</li>
              <li><strong className="text-foreground">Payback</strong> = investissement initial / (A - B) en mois</li>
              <li><strong className="text-foreground">ROI cumulé 5 ans</strong> = ((A - B) × 5 - investissement) / investissement × 100</li>
            </ul>
          </div>
          <div className="mt-4 p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">Méthode : réunion DAF 60 minutes</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>0-10 min — Contexte : combien d'outils, combien de licences, combien d'interfaces</li>
              <li>10-30 min — Remplissage collaboratif : vos chiffres dans notre modèle TCO</li>
              <li>30-45 min — Calcul ROI en direct : coûts actuels vs coûts cible, payback estimé</li>
              <li>45-55 min — Dimension "temps clinique perdu" : valorisation des minutes récupérées</li>
              <li>55-60 min — Prochaines étapes : go/no-go pilote, calendrier, périmètre</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Les chiffres sont les vôtres, pas les nôtres. Aucun ROI spéculatif. Aucune promesse non vérifiable.
          </p>
        </div>

        {/* FAQ pricing */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
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
          <h2 className="text-2xl font-bold mb-3">Prêt à mesurer votre dette opérationnelle ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            60 minutes pour remplir le business case avec vos chiffres. Zéro engagement.
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
            Les tarifs dépendent du périmètre de déploiement et de la complexité d'intégration.
            UrgenceOS ne constitue pas un dispositif médical certifié.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
