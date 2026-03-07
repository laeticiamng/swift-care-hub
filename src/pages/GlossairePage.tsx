import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { JsonLd, PageMeta, webPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';

interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  definition: string;
  context: string;
  category: 'interop' | 'clinique' | 'securite' | 'reglementaire' | 'architecture';
}

const CATEGORIES: Record<string, string> = {
  interop: 'Interopérabilité',
  clinique: 'Clinique & Triage',
  securite: 'Sécurité',
  reglementaire: 'Réglementaire',
  architecture: 'Architecture',
};

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Classification Infirmière des Malades aux Urgences',
    abbreviation: 'CIMU',
    definition: 'Échelle française de triage aux urgences en 5 niveaux (1 = détresse vitale immédiate, 5 = consultation non urgente). Utilisée par l\'Infirmier Organisateur de l\'Accueil (IOA) pour prioriser la prise en charge des patients dès leur arrivée. Référence nationale recommandée par la SFMU.',
    context: 'UrgenceOS intègre le score CIMU dans le bandeau patient et le module de triage avec aide à la décision.',
    category: 'clinique',
  },
  {
    term: 'Résumé de Passage aux Urgences',
    abbreviation: 'RPU',
    definition: 'Document standardisé transmis aux ARS et à l\'ATIH (format FEDORU) après chaque passage aux urgences. Contient les données administratives et médicales minimales : identité, horaires, motif SFMU, diagnostic CIM-10, orientation, CCMU, GEMSA. Obligatoire pour tous les services d\'urgences en France.',
    context: 'UrgenceOS génère automatiquement le RPU à partir des données saisies durant le parcours patient, sans ressaisie.',
    category: 'reglementaire',
  },
  {
    term: 'Fast Healthcare Interoperability Resources',
    abbreviation: 'FHIR',
    definition: 'Standard international d\'interopérabilité pour les systèmes d\'information de santé, développé par HL7 International. Version R4 (Release 4) est la version stable de référence. FHIR utilise des ressources (Patient, Encounter, Observation, MedicationRequest…) échangeables en JSON/XML via des API REST. Adopté par l\'ANS dans le cadre du CI-SIS français.',
    context: 'UrgenceOS utilise FHIR R4 comme standard principal pour l\'intégration en lecture avec le DPI et l\'échange de données patient (identité, antécédents, allergies, résultats).',
    category: 'interop',
  },
  {
    term: 'Role-Based Access Control',
    abbreviation: 'RBAC',
    definition: 'Modèle de contrôle d\'accès où les permissions sont attribuées à des rôles (médecin, IOA, IDE, aide-soignant, secrétaire) plutôt qu\'à des utilisateurs individuels. Chaque utilisateur hérite des permissions de son rôle. Les vérifications sont effectuées côté serveur pour empêcher tout contournement client.',
    context: 'UrgenceOS implémente un RBAC strict avec 5 rôles cliniques, vérifié systématiquement côté serveur via Row Level Security (RLS). Aucun accès n\'est accordé par défaut.',
    category: 'securite',
  },
  {
    term: 'Hébergement de Données de Santé',
    abbreviation: 'HDS',
    definition: 'Certification obligatoire en France (article L.1111-8 du Code de la santé publique) pour tout hébergeur de données de santé à caractère personnel. Délivrée par un organisme accrédité COFRAC. Couvre l\'infrastructure physique, la gestion opérationnelle, et la sécurité des données. Renouvelée tous les 3 ans avec audits de surveillance.',
    context: 'UrgenceOS est hébergé exclusivement sur infrastructure certifiée HDS en France, avec monitoring 24/7 et disponibilité cible de 99,9%.',
    category: 'reglementaire',
  },
  {
    term: 'Health Level 7 version 2',
    abbreviation: 'HL7v2',
    definition: 'Standard de messagerie historique pour l\'échange de données médicales entre systèmes hospitaliers. Utilise des messages structurés (ADT pour admissions/transferts/sorties, ORM pour prescriptions, ORU pour résultats). Encore largement déployé dans les SIH français, progressivement complété par FHIR.',
    context: 'UrgenceOS supporte HL7v2 (ADT, ORM, ORU) pour l\'intégration avec les DPI, LIS et PACS existants qui n\'exposent pas encore d\'API FHIR.',
    category: 'interop',
  },
  {
    term: 'Dossier Patient Informatisé',
    abbreviation: 'DPI',
    definition: 'Système central de l\'hôpital qui regroupe l\'ensemble des informations médicales et administratives d\'un patient. Éditeurs principaux en France : Dedalus (DxCare), Maincare (M-Crossway), Softway Medical (HM), Cerner, Epic. Le DPI est le système de référence pour l\'identité patient et l\'historique médical.',
    context: 'UrgenceOS ne remplace pas le DPI. Il s\'y connecte en lecture seule via FHIR R4 / HL7v2 et le complète sur le périmètre urgences avec une interface temps réel par rôle.',
    category: 'architecture',
  },
  {
    term: 'Infirmier Organisateur de l\'Accueil',
    abbreviation: 'IOA',
    definition: 'Infirmier spécialisé posté à l\'accueil du service d\'urgences. Réalise le triage initial (score CIMU), évalue la gravité, oriente le patient vers la zone adaptée (SAU, UHCD, déchocage), et initie les premiers actes sur protocole. Rôle pivot de la gestion des flux.',
    context: 'UrgenceOS propose un écran dédié IOA avec file de triage, aide au score CIMU, et assignation zone/box en un tap.',
    category: 'clinique',
  },
  {
    term: 'Infirmier Diplômé d\'État',
    abbreviation: 'IDE',
    definition: 'Professionnel de santé responsable de l\'exécution des prescriptions médicales, de la surveillance clinique, de l\'administration des traitements, et des transmissions ciblées (méthode DAR : Données, Actions, Résultats). Aux urgences, l\'IDE gère en moyenne 4 à 8 patients simultanément.',
    context: 'UrgenceOS fournit à l\'IDE une pancarte infirmière unifiée avec administration médicaments en 1 tap, constantes, et transmissions DAR structurées.',
    category: 'clinique',
  },
  {
    term: 'Row Level Security',
    abbreviation: 'RLS',
    definition: 'Mécanisme de sécurité au niveau de la base de données qui filtre les lignes accessibles en fonction de l\'identité et du rôle de l\'utilisateur connecté. Chaque requête est automatiquement restreinte aux données autorisées, indépendamment du code applicatif. Empêche les fuites de données même en cas de bug applicatif.',
    context: 'UrgenceOS utilise RLS restrictif (deny-by-default) sur toutes les tables contenant des données de santé. Chaque politique est vérifiée côté serveur.',
    category: 'securite',
  },
  {
    term: 'Système d\'Information Hospitalier',
    abbreviation: 'SIH',
    definition: 'Ensemble des logiciels, bases de données, et réseaux utilisés par un établissement de santé pour gérer l\'activité clinique, administrative, et logistique. Comprend typiquement : DPI, GAP (gestion administrative du patient), LIS (laboratoire), PACS (imagerie), pharmacie, etc. Un SIH hospitalier peut compter de 15 à 40+ applications.',
    context: 'UrgenceOS se positionne comme un socle Hospital-Owned qui structure et réduit la complexité du SIH sur le périmètre urgences.',
    category: 'architecture',
  },
  {
    term: 'Hospital-Owned Software',
    abbreviation: 'HOS',
    definition: 'Modèle dans lequel l\'hôpital possède son socle logiciel interne (identité, droits, audit, bus d\'intégration) au lieu de le louer à un éditeur. Les modules métier se branchent sur ce socle via des standards ouverts. L\'hôpital décide des priorités d\'évolution, maîtrise les coûts, et n\'est plus dépendant d\'un fournisseur unique.',
    context: 'UrgenceOS est le premier socle Hospital-Owned Software conçu spécifiquement pour les urgences hospitalières françaises.',
    category: 'architecture',
  },
  {
    term: 'Groupement Hospitalier de Territoire',
    abbreviation: 'GHT',
    definition: 'Regroupement obligatoire d\'établissements publics de santé sur un même territoire (loi de modernisation du système de santé, 2016). Les GHT mutualisent leur SIH via un schéma directeur commun. 136 GHT couvrent l\'ensemble du territoire français.',
    context: 'UrgenceOS est conçu multi-tenant pour être mutualisé entre établissements d\'un même GHT : même infrastructure, données isolées, modules communs, coûts divisés.',
    category: 'reglementaire',
  },
  {
    term: 'Messagerie Sécurisée de Santé',
    abbreviation: 'MSSanté',
    definition: 'Système de messagerie sécurisée opéré par l\'ANS (Agence du Numérique en Santé) pour les échanges entre professionnels de santé. Garantit la confidentialité et la traçabilité des échanges contenant des données de santé. Utilisé notamment pour l\'envoi de comptes-rendus d\'hospitalisation et de résultats.',
    context: 'UrgenceOS intègre MSSanté pour l\'envoi automatique du compte-rendu d\'hospitalisation (CRH) au médecin traitant à la sortie du patient.',
    category: 'interop',
  },
  {
    term: 'Dossier Médical Partagé',
    abbreviation: 'DMP',
    definition: 'Carnet de santé numérique national accessible à tous les patients et professionnels de santé autorisés, intégré dans Mon Espace Santé depuis 2022. Contient l\'historique médical, les traitements, les allergies, les comptes-rendus. Alimenté automatiquement par les établissements de santé.',
    context: 'UrgenceOS peut consulter le DMP pour récupérer l\'historique médical du patient et l\'alimenter avec le compte-rendu de passage aux urgences.',
    category: 'interop',
  },
  {
    term: 'Classification Clinique des Malades aux Urgences',
    abbreviation: 'CCMU',
    definition: 'Classification en 5 niveaux évaluant l\'état clinique du patient à la sortie des urgences (CCMU 1 = état stable sans acte, CCMU 5 = pronostic vital engagé). Indicateur obligatoire du RPU. Différent du CIMU qui évalue la gravité à l\'entrée.',
    context: 'UrgenceOS enregistre le CCMU dans le dossier patient et l\'intègre automatiquement dans le RPU généré.',
    category: 'clinique',
  },
  {
    term: 'Cadre d\'Interopérabilité des Systèmes d\'Information de Santé',
    abbreviation: 'CI-SIS',
    definition: 'Référentiel publié par l\'ANS qui définit les standards, les formats, et les règles d\'interopérabilité à respecter par les éditeurs de logiciels de santé en France. Inclut les profils IHE, les nomenclatures (CIM-10, CCAM, SNOMED), et les volets de contenu (VSM, CR-BIO, etc.).',
    context: 'UrgenceOS suit les recommandations du CI-SIS pour tous ses échanges : profils FHIR, nomenclatures, et volets de contenu.',
    category: 'interop',
  },
  {
    term: 'Identité Nationale de Santé',
    abbreviation: 'INS',
    definition: 'Identifiant unique et pérenne attribué à chaque personne née en France, basé sur le NIR (numéro de sécurité sociale) et qualifié via le téléservice INSi opéré par l\'Assurance Maladie. Obligatoire dans les échanges de données de santé depuis le 1er janvier 2021.',
    context: 'UrgenceOS intègre la vérification INS via le téléservice INSi pour garantir l\'identitovigilance à l\'admission du patient.',
    category: 'reglementaire',
  },
];

function definedTermSetSchema(terms: GlossaryTerm[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Glossaire UrgenceOS — Termes métier des urgences hospitalières et du SIH',
    description: 'Définitions de référence des termes métier utilisés en urgences hospitalières : interopérabilité (FHIR, HL7v2, MSSanté, DMP), triage (CIMU, CCMU), sécurité (RBAC, RLS, HDS), réglementaire (RPU, INS, GHT, CI-SIS), et architecture (DPI, SIH, Hospital-Owned Software).',
    url: 'https://urgenceos.fr/glossaire',
    inLanguage: 'fr-FR',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.abbreviation ? `${t.abbreviation} — ${t.term}` : t.term,
      description: t.definition,
      inDefinedTermSet: 'https://urgenceos.fr/glossaire',
    })),
  };
}

export default function GlossairePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchSearch = !search || 
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        (t.abbreviation?.toLowerCase().includes(search.toLowerCase())) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !activeCategory || t.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const cat = t.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Glossaire UrgenceOS — CIMU, RPU, FHIR, RBAC, HDS et 13 autres termes métier"
        description="Définitions de référence des termes métier des urgences hospitalières : CIMU, RPU, FHIR R4, HL7v2, RBAC, RLS, HDS, DPI, SIH, INS, GHT, MSSanté, DMP, CI-SIS, Hospital-Owned Software."
      />
      <JsonLd id="glossaire-termset" data={definedTermSetSchema(GLOSSARY_TERMS)} />
      <JsonLd id="glossaire-webpage" data={webPageSchema({
        name: 'Glossaire UrgenceOS — Termes métier urgences hospitalières',
        description: 'Définitions structurées des termes clés : interopérabilité, triage, sécurité, réglementation, architecture SIH.',
        url: 'https://urgenceos.fr/glossaire',
        breadcrumb: ['Accueil', 'Glossaire'],
      })} />
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: 'Accueil', to: '/' },
          { label: 'Glossaire' },
        ]} />
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Référentiel
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Glossaire métier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {GLOSSARY_TERMS.length} termes clés des urgences hospitalières, de l'interopérabilité
            et du système d'information de santé. Définitions claires, contexte UrgenceOS.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un terme (ex: FHIR, triage, HDS…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Tous ({GLOSSARY_TERMS.length})
            </button>
            {Object.entries(CATEGORIES).map(([key, label]) => {
              const count = GLOSSARY_TERMS.filter((t) => t.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-10 mb-20">
          {Object.entries(grouped).map(([cat, terms]) => (
            <section key={cat}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {CATEGORIES[cat]}
              </h2>
              <div className="space-y-4">
                {terms.map((t) => (
                  <article
                    key={t.abbreviation || t.term}
                    className="p-5 rounded-xl border bg-card space-y-3"
                    id={t.abbreviation?.toLowerCase() || t.term.toLowerCase().replace(/\s+/g, '-')}
                  >
                    <div className="flex items-baseline gap-3 flex-wrap">
                      {t.abbreviation && (
                        <span className="text-xl font-bold text-primary">{t.abbreviation}</span>
                      )}
                      <h3 className="font-semibold text-sm">{t.term}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.definition}
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <BookOpen className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Dans UrgenceOS :</span>{' '}
                        {t.context}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun terme ne correspond à « {search} ».</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">Un terme manque ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ce glossaire est enrichi en continu. Contactez-nous pour ajouter un terme
            ou approfondir une définition.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/faq')}>
              Voir la FAQ <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/features')}>
              Architecture produit
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
