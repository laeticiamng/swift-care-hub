import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_CATEGORIES: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Général',
    items: [
      {
        question: 'Qu\'est-ce qu\'UrgenceOS ?',
        answer: 'UrgenceOS est un système d\'exploitation des urgences hospitalières. C\'est une application web temps réel (PWA) qui digitalise l\'intégralité du parcours patient aux urgences : de l\'admission par le secrétariat au tri IOA, en passant par la prise en charge médicale, la pancarte IDE et la sortie du patient.',
      },
      {
        question: 'Qui développe UrgenceOS ?',
        answer: 'UrgenceOS est développé par EmotionsCare SASU, une startup française spécialisée dans les solutions numériques pour les services d\'urgences hospitalières.',
      },
      {
        question: 'UrgenceOS est-il un dispositif médical ?',
        answer: 'Non. UrgenceOS est un outil d\'aide à la gestion et à l\'organisation des urgences hospitalières. Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur (MDR 2017/745). Les décisions cliniques restent de la responsabilité exclusive des professionnels de santé.',
      },
      {
        question: 'Quels types d\'établissements peuvent utiliser UrgenceOS ?',
        answer: 'UrgenceOS s\'adresse à tous les établissements disposant d\'un service d\'accueil des urgences (SAU) : centres hospitaliers, CHU, cliniques privées, hôpitaux de proximité, et groupements hospitaliers de territoire (GHT).',
      },
    ],
  },
  {
    title: 'Technique & DSI',
    items: [
      {
        question: 'Comment UrgenceOS s\'intègre-t-il au SIH existant ?',
        answer: 'UrgenceOS supporte nativement les standards d\'interopérabilité FHIR R4, HL7v2 (ADT, ORM, ORU) et MSSanté. L\'intégration bidirectionnelle avec votre SIH est réalisée via des connecteurs configurables, sans modification de votre infrastructure existante.',
      },
      {
        question: 'Quel est le prérequis technique pour les postes utilisateurs ?',
        answer: 'UrgenceOS est une PWA (Progressive Web App). Aucune installation n\'est requise. Un navigateur web moderne (Chrome, Edge, Firefox, Safari) suffit. L\'application est optimisée pour fonctionner sur tablettes, postes fixes et smartphones.',
      },
      {
        question: 'Comment fonctionne le mode offline ?',
        answer: 'UrgenceOS utilise un Service Worker et IndexedDB pour maintenir une copie locale des données du service. En cas de perte réseau, l\'application continue de fonctionner normalement pendant plus de 4 heures. Les actions réalisées hors connexion sont synchronisées automatiquement au retour du réseau.',
      },
      {
        question: 'L\'identité INS est-elle supportée ?',
        answer: 'Oui. UrgenceOS intègre nativement l\'Identité Nationale de Santé (INS) conformément aux exigences de l\'ANS. La vérification d\'identité est intégrée au workflow d\'admission.',
      },
      {
        question: 'Les RPU sont-ils générés automatiquement ?',
        answer: 'Oui. Le Résumé de Passage aux Urgences (RPU) est généré automatiquement à partir des données saisies durant le parcours patient, conformément au format normalisé de la FEDORU.',
      },
    ],
  },
  {
    title: 'Sécurité & Conformité',
    items: [
      {
        question: 'Où sont hébergées les données ?',
        answer: 'Toutes les données sont hébergées en France sur une infrastructure certifiée HDS (Hébergement de Données de Santé), conformément à l\'article L.1111-8 du Code de la santé publique.',
      },
      {
        question: 'Comment les données sont-elles protégées ?',
        answer: 'Les données sont chiffrées au repos et en transit (TLS 1.3). Le contrôle d\'accès utilise le Row Level Security (RLS) de PostgreSQL, garantissant que chaque professionnel n\'accède qu\'aux données nécessaires à son rôle. Un audit trail complet trace chaque action.',
      },
      {
        question: 'UrgenceOS est-il conforme au RGPD ?',
        answer: 'Oui. UrgenceOS respecte le RGPD et les spécificités du RGPD santé : minimisation des données, limitation de conservation (3 ans max), droit à l\'oubli, portabilité, registre des traitements, et DPO désigné.',
      },
      {
        question: 'Quelles certifications possédez-vous ?',
        answer: 'Notre infrastructure est certifiée HDS (Hébergement de Données de Santé) et vise la conformité ISO 27001. Nous suivons les recommandations de l\'ANS (Agence du Numérique en Santé) et du référentiel de sécurité du CI-SIS.',
      },
    ],
  },
  {
    title: 'Déploiement & Support',
    items: [
      {
        question: 'Combien de temps prend le déploiement ?',
        answer: 'Le déploiement standard prend 2 à 4 semaines incluant : configuration, paramétrage des zones et boxes, intégration SIH, formation des référents et phase pilote. La formation des utilisateurs finaux est conçue pour une autonomie en moins de 30 minutes.',
      },
      {
        question: 'Quel accompagnement proposez-vous ?',
        answer: 'Selon l\'offre choisie : support email (Starter), support prioritaire < 4h (Pro), ou chef de projet dédié avec comité de pilotage (Établissement). Toutes les offres incluent l\'accès à la documentation en ligne et aux mises à jour.',
      },
      {
        question: 'Peut-on tester UrgenceOS avant de s\'engager ?',
        answer: 'Absolument. Une démo interactive avec 5 profils préconfigurés et 15 patients fictifs est accessible librement. Nous proposons également un pilote de 3 mois sur un périmètre restreint pour valider l\'adéquation avec vos besoins.',
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{item.question}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Centre d'aide</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Questions fréquentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que les DSI, les équipes soignantes et les directions d'établissements
            doivent savoir sur UrgenceOS.
          </p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-12 mb-20">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <FAQAccordion key={item.question} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe est disponible pour répondre à vos questions techniques et fonctionnelles.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.href = 'mailto:contact@emotionscare.com'}>
              Nous écrire <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')}>
              Tester la démo
            </Button>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
