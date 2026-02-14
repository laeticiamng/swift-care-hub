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
        answer: 'UrgenceOS est un socle logiciel que l\'hôpital possède et gouverne (Hospital-Owned Software), sur lequel se branchent des modules métier interopérables dédiés aux urgences. Ce n\'est pas un outil de plus à empiler : c\'est une architecture qui remplace progressivement les outils satellites par des modules intégrés, réduisant la dette opérationnelle au lieu de l\'aggraver.',
      },
      {
        question: 'Qu\'est-ce que le Hospital-Owned Software ?',
        answer: 'C\'est un modèle dans lequel l\'hôpital possède son socle logiciel interne — identité, droits, audit, bus d\'intégration — au lieu de le louer à un éditeur. Les modules métier se branchent sur ce socle via des standards ouverts (FHIR R4, HL7v2). L\'hôpital décide des priorités d\'évolution, maîtrise les coûts sur 5 ans, et n\'est plus dépendant d\'un fournisseur unique.',
      },
      {
        question: 'Qu\'est-ce que la dette opérationnelle ?',
        answer: 'La dette opérationnelle est le coût cumulé de quatre facteurs : la dépendance fournisseur (licences croissantes sans corrélation avec la valeur), la fragmentation du SI (15 à 40 applications mal intégrées), le temps clinique perdu (45 à 90 minutes par poste par jour en friction logicielle), et la surface d\'attaque croissante (chaque outil supplémentaire est un vecteur de compromission). UrgenceOS est conçu pour réduire cette dette, pas pour l\'aggraver.',
      },
      {
        question: 'UrgenceOS remplace-t-il le DPI ?',
        answer: 'Non. Le DPI cœur reste en place. UrgenceOS l\'encadre via des connecteurs standards (FHIR R4, HL7v2) et remplace progressivement les outils satellites — pas le DPI lui-même. L\'objectif est de structurer et compléter, pas de refondre.',
      },
      {
        question: 'UrgenceOS est-il un dispositif médical ?',
        answer: 'Non. UrgenceOS est un outil d\'aide à la gestion et à l\'organisation des urgences hospitalières. Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur (MDR 2017/745). Les décisions cliniques restent de la responsabilité exclusive des professionnels de santé.',
      },
    ],
  },
  {
    title: 'Architecture & Technique',
    items: [
      {
        question: 'Quelle est l\'architecture d\'UrgenceOS ?',
        answer: 'UrgenceOS repose sur un socle interne (identité/SSO, RBAC, audit immuable, API gateway, bus d\'intégration FHIR, observabilité) sur lequel se branchent des modules métier. Les deux premiers modules sont le récap parcours patient par rôle et la traçabilité temps réel. L\'architecture est conçue pour être extensible sans refonte.',
      },
      {
        question: 'Comment fonctionne l\'intégration avec le SIH existant ?',
        answer: 'UrgenceOS se connecte au DPI en lecture seule via des connecteurs FHIR R4 et HL7v2 (ADT, ORM, ORU). Le bus d\'intégration gère les flux avec le LIS (réception résultats), la GAP, et MSSanté. L\'intégration bidirectionnelle est disponible en phase Extension. Aucune modification de votre infrastructure existante n\'est requise.',
      },
      {
        question: 'Quels standards d\'interopérabilité sont supportés ?',
        answer: 'FHIR R4, HL7v2 (ADT, ORM, ORU), HPRIM, INS (Identité Nationale de Santé), MSSanté, DMP, RPU ATIH (format FEDORU). UrgenceOS suit le cadre CI-SIS de l\'ANS et les référentiels d\'interopérabilité en vigueur.',
      },
      {
        question: 'Les RPU sont-ils générés automatiquement ?',
        answer: 'Oui. Le Résumé de Passage aux Urgences est généré automatiquement à partir des données saisies durant le parcours patient, conformément au format normalisé de la FEDORU/ATIH.',
      },
      {
        question: 'Le socle est-il multi-tenant pour les GHT ?',
        answer: 'Oui. Le socle est conçu pour être mutualisé entre établissements d\'un même GHT : même infrastructure, données isolées par établissement, modules communs, connecteurs réutilisables, coûts divisés. La gouvernance d\'interopérabilité est commune.',
      },
    ],
  },
  {
    title: 'Sécurité & Conformité',
    items: [
      {
        question: 'Où sont hébergées les données ?',
        answer: 'Toutes les données sont hébergées en France sur une infrastructure certifiée HDS (Hébergement de Données de Santé), conformément à l\'article L.1111-8 du Code de la santé publique. Monitoring 24/7, disponibilité cible 99,9%.',
      },
      {
        question: 'Quels sont les principes de sécurité d\'UrgenceOS ?',
        answer: 'Six principes structurels : minimisation des accès (moindre privilège, zéro compte générique), RBAC strict vérifié côté serveur, traçabilité complète (logs immuables append-only, rétention 5 ans), séparation des environnements (dev/préprod/prod), chiffrement en transit (TLS 1.2+) et au repos (AES-256), journalisation et alerting centralisés.',
      },
      {
        question: 'Comment les menaces sont-elles prises en compte ?',
        answer: 'Le threat model couvre quatre acteurs : attaquant externe (ransomware, vol de données), utilisateur interne malveillant (export massif, accès non autorisé), utilisateur négligent (phishing, session ouverte), et fournisseur compromis (supply chain). Chaque risque est associé à des parades déployées.',
      },
      {
        question: 'UrgenceOS est-il conforme au RGPD ?',
        answer: 'Oui. Privacy-by-design : collecte minimale, durée de conservation définie, anonymisation des données non-cliniques, registre des traitements, DPO informé. Les données de production ne sont jamais utilisées en développement (anonymisation obligatoire).',
      },
      {
        question: 'Un test d\'intrusion est-il réalisé ?',
        answer: 'Oui. Un test d\'intrusion et un scan de vulnérabilités (infra + application) sont réalisés ou planifiés avant chaque go-live pilote. Audit sécurité annuel inclus dans l\'offre Extension. Objectif : aucune CVE critique connue non corrigée en production.',
      },
    ],
  },
  {
    title: 'Pilote & Déploiement',
    items: [
      {
        question: 'Comment fonctionne le pilote ?',
        answer: 'Le pilote dure 10 semaines sur un service d\'urgences. Il inclut 2 modules (récap parcours + traçabilité temps réel), l\'intégration DPI en lecture seule, la formation par rôle (2h par profil), et un rapport de mesure avant/après pour DG/DAF/DSI. Les critères go/no-go sont définis à l\'avance.',
      },
      {
        question: 'Quel est le coût d\'un pilote ?',
        answer: 'Le forfait pilote est calibré sur le périmètre (un service, 2 modules, 10 semaines). Il inclut le cadrage, le déploiement, la formation, et le rapport de mesure. Le montant exact dépend de la complexité d\'intégration avec votre DPI. Pas d\'engagement pluriannuel en première intention.',
      },
      {
        question: 'Que se passe-t-il après le pilote ?',
        answer: 'Si les critères go/no-go sont atteints, vous décidez de la suite : extension à d\'autres services, modules supplémentaires (triage, prescriptions, sortie), intégration bidirectionnelle DPI, SSO institutionnel. Si les résultats ne sont pas là, vous arrêtez. Pas d\'engagement automatique.',
      },
      {
        question: 'Combien de temps prend la formation ?',
        answer: 'La formation est dispensée par rôle : 2 heures par profil (médecin, IOA, IDE, AS, secrétaire). L\'interface est conçue pour une prise en main rapide — un écran par rôle, zéro ressaisie, ergonomie validée par le terrain.',
      },
      {
        question: 'Peut-on tester UrgenceOS avant de s\'engager ?',
        answer: 'Oui. Une démo interactive est accessible librement. Pour aller plus loin, le pilote de 10 semaines permet de mesurer le ROI sur vos données réelles avant tout engagement d\'extension.',
      },
    ],
  },
  {
    title: 'Modèle économique',
    items: [
      {
        question: 'Comment le modèle diffère-t-il d\'un éditeur classique ?',
        answer: 'Le socle est possédé par l\'hôpital. Pas de licence récurrente sur le socle. Les coûts portent sur le déploiement, la formation, le MCO et les évolutions. Ils sont prévisibles et décroissants — pas de hausse unilatérale. L\'hôpital garde le contrôle.',
      },
      {
        question: 'Comment construire le business case ?',
        answer: 'Nous fournissons un modèle de business case TCO 5 ans à remplir avec les données de votre établissement. Réunion de 60 minutes avec le DAF. Les formules ROI/payback sont transparentes. Les chiffres sont les vôtres, pas les nôtres.',
      },
      {
        question: 'Comment fonctionne le modèle GHT / consortium ?',
        answer: 'Le socle est mutualisé entre établissements : même infrastructure, données isolées, modules communs, connecteurs réutilisables. Les coûts sont divisés par établissement. La gouvernance d\'interopérabilité est commune. Les indicateurs sont consolidés et ARS-ready.',
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
