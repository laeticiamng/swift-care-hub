import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { JsonLd, PageMeta, faqPageSchema, webPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_CATEGORIES: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Comprendre UrgenceOS',
    items: [
      {
        question: 'Qu\'est-ce qu\'UrgenceOS ?',
        answer: 'UrgenceOS est un logiciel pour les services d\'urgences hospitalières. Il regroupe sur un seul écran tout ce dont chaque soignant a besoin : vue des patients, prescriptions, résultats, coordination. Au lieu d\'utiliser 15 logiciels différents mal connectés, votre équipe utilise une seule plateforme intégrée. Et surtout : c\'est votre hôpital qui possède et contrôle le logiciel, pas un éditeur externe.',
      },
      {
        question: 'Pourquoi "que votre hôpital contrôle" ?',
        answer: 'Aujourd\'hui, la plupart des hôpitaux louent leurs logiciels à des éditeurs qui fixent seuls les prix, le calendrier et les conditions. Avec UrgenceOS, votre hôpital possède la plateforme. Vous décidez des évolutions, vous maîtrisez les coûts, et vous n\'êtes plus dépendant d\'un fournisseur unique.',
      },
      {
        question: 'Est-ce que ça remplace notre dossier patient actuel ?',
        answer: 'Non. Votre dossier patient informatisé reste en place. UrgenceOS se connecte dessus pour récupérer et afficher les informations utiles. Il remplace les petits outils annexes (tableaux Excel, fiches papier, logiciels satellites) par des modules intégrés — pas votre système principal.',
      },
      {
        question: 'UrgenceOS est-il un dispositif médical ?',
        answer: 'Non. C\'est un outil d\'aide à la gestion et à l\'organisation des urgences. Les décisions cliniques restent de la responsabilité exclusive des professionnels de santé.',
      },
    ],
  },
  {
    title: 'Comment ça marche',
    items: [
      {
        question: 'Comment ça s\'intègre avec notre informatique existante ?',
        answer: 'UrgenceOS se connecte à votre dossier patient en lecture via des standards ouverts utilisés dans tous les hôpitaux. Il reçoit aussi les résultats de laboratoire automatiquement. Aucune modification de votre infrastructure existante n\'est nécessaire.',
      },
      {
        question: 'Quels rôles sont concernés ?',
        answer: 'Chaque professionnel a un écran adapté : médecin urgentiste, infirmier d\'accueil et d\'orientation (IOA), infirmier (IDE), aide-soignant, secrétaire. Chacun voit uniquement ce dont il a besoin.',
      },
      {
        question: 'Les résumés de passage aux urgences (RPU) sont-ils générés automatiquement ?',
        answer: 'Oui. Le résumé est créé automatiquement à partir des informations saisies pendant la prise en charge, dans le format réglementaire.',
      },
      {
        question: 'Peut-on l\'utiliser sur plusieurs établissements ?',
        answer: 'Oui. La plateforme est conçue pour être partagée entre plusieurs hôpitaux d\'un même groupement : même outil, données séparées par établissement, coûts divisés.',
      },
    ],
  },
  {
    title: 'Sécurité et données',
    items: [
      {
        question: 'Où sont hébergées les données ?',
        answer: 'Toutes les données sont hébergées en France, sur une infrastructure certifiée pour l\'hébergement de données de santé (HDS). Surveillance 24h/24, disponibilité cible de 99,9%.',
      },
      {
        question: 'Comment la sécurité est-elle assurée ?',
        answer: 'Chaque utilisateur n\'accède qu\'aux données dont il a besoin. Toutes les actions sont tracées et horodatées. Les données sont chiffrées en permanence. Un audit de sécurité est réalisé avant chaque mise en service.',
      },
      {
        question: 'Est-ce conforme au RGPD ?',
        answer: 'Oui. Le logiciel est conçu dès le départ pour respecter la réglementation : collecte minimale de données, durée de conservation définie, possibilité de suppression sur demande.',
      },
    ],
  },
  {
    title: 'Essai et déploiement',
    items: [
      {
        question: 'Comment fonctionne l\'essai ?',
        answer: 'L\'essai dure 10 semaines sur un service d\'urgences. Il inclut 2 modules, la connexion à votre dossier patient, la formation de vos équipes (2h par profil), et un rapport de résultats pour votre direction. Les critères de succès sont définis ensemble avant le lancement.',
      },
      {
        question: 'Combien ça coûte ?',
        answer: 'L\'essai démarre à partir de 15 000 €, selon la complexité de connexion avec votre informatique existante. Ce forfait inclut le déploiement, la formation et le rapport de mesure. Pas d\'engagement pluriannuel.',
      },
      {
        question: 'Que se passe-t-il après l\'essai ?',
        answer: 'Si les résultats sont positifs, vous décidez de continuer : extension à d\'autres services, modules supplémentaires, connexion bidirectionnelle. Si les résultats ne sont pas là, vous arrêtez. Pas d\'engagement automatique.',
      },
      {
        question: 'Combien de temps prend la formation ?',
        answer: '2 heures par profil (médecin, infirmier, aide-soignant, secrétaire). L\'interface est conçue pour être intuitive : un seul écran par rôle, pas de ressaisie.',
      },
      {
        question: 'Peut-on tester avant de s\'engager ?',
        answer: 'Oui. Une démo interactive est accessible librement sur ce site. Pour aller plus loin, l\'essai de 10 semaines permet de mesurer les gains concrets avant tout engagement.',
      },
    ],
  },
  {
    title: 'Tarifs',
    items: [
      {
        question: 'Comment le modèle économique fonctionne-t-il ?',
        answer: 'Votre hôpital possède le logiciel. Pas de licence qui augmente chaque année. Les coûts portent sur le déploiement, la formation et la maintenance. Ils sont prévisibles et décroissants — pas de hausse unilatérale.',
      },
      {
        question: 'Comment estimer les économies pour mon établissement ?',
        answer: 'Nous proposons une réunion de 60 minutes avec votre direction financière. On remplit ensemble un modèle de calcul avec vos propres chiffres (coûts actuels des logiciels, temps perdu, incidents). Les résultats sont les vôtres, pas les nôtres.',
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

  // Flatten all FAQ items for JSON-LD
  const allFaqs = FAQ_CATEGORIES.flatMap((cat) => cat.items);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="FAQ UrgenceOS — Questions fréquentes sur le logiciel urgences hospitalières"
        description="Réponses aux questions fréquentes sur UrgenceOS : fonctionnement, intégration avec votre dossier patient, sécurité des données, essai 10 semaines, tarifs et déploiement."
        canonical="https://urgenceos.fr/faq"
      />
      <JsonLd id="faq-page" data={faqPageSchema(allFaqs)} />
      <JsonLd id="faq-webpage" data={webPageSchema({
        name: 'FAQ UrgenceOS',
        description: 'Questions fréquentes sur le logiciel urgences hospitalières UrgenceOS — architecture, sécurité, intégration DPI, déploiement pilote.',
        url: 'https://urgenceos.fr/faq',
        breadcrumb: ['Accueil', 'FAQ'],
      })} />
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: 'Accueil', to: '/' },
          { label: 'FAQ' },
        ]} />
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Centre d'aide</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Questions fréquentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que les DSI, DAF, directions d'établissements et équipes soignantes
            doivent savoir sur UrgenceOS et le modèle Hospital-Owned Software.
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
            Notre équipe répond à toutes les questions : architecture, sécurité, intégration DPI, business case.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/contact')}>
              Nous contacter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/b2b')}>
              Demander un pilote
            </Button>
            <Button variant="ghost" onClick={() => navigate('/demo')}>
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
      </main>

      <FooterSection />
    </div>
  );
}
