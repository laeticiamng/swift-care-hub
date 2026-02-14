import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import {
  ArrowRight, CheckCircle, Layers, MonitorSmartphone, Clock,
  Bell, ClipboardList, BarChart3, Shield, RefreshCcw,
  Database, Eye, Users, Key, FileText, Server,
} from 'lucide-react';

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Architecture produit</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Plateforme interne + Modules urgences à ROI.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Un socle que l'hôpital possède. Des modules qui remboursent la dette opérationnelle.
            Le DPI reste en place — on l'encadre, on ne le refait pas.
          </p>
        </div>

        {/* Architecture : Socle + Modules */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Architecture cible</h2>
          <p className="text-muted-foreground text-center mb-10">Socle transversal + modules métier déployables indépendamment</p>

          {/* Socle interne */}
          <div className="p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Socle interne (services transversaux)</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Le socle fournit les services communs à tous les modules. Il est possédé, gouverné et opéré par l'hôpital.
              Chaque module est déployable, testable et remplaçable indépendamment.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Key, title: 'Identité & SSO', desc: 'Authentification forte, gestion des sessions, compatibilité LDAP/ProSanté Connect.' },
                { icon: Users, title: 'RBAC', desc: '7 rôles de base, permissions granulaires, vérification côté serveur systématique.' },
                { icon: Eye, title: 'Audit logs', desc: 'Journalisation immuable de chaque action. Qui, quoi, quand, depuis où.' },
                { icon: FileText, title: 'API documentée', desc: 'REST OpenAPI, versionnée, authentifiée, rate-limitée. Contrats testés automatiquement.' },
                { icon: RefreshCcw, title: 'Bus d\'intégration', desc: 'Point unique d\'échange avec DPI/LIS/PACS. Connecteurs FHIR R4, HL7v2, HPRIM.' },
                { icon: BarChart3, title: 'Observabilité', desc: 'Métriques techniques et métier, alerting configurable, dashboard opérationnel.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 1 : Récap parcours patient */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MonitorSmartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] mb-1">Module ROI #1</Badge>
              <h2 className="text-xl font-bold">Récap parcours patient par rôle</h2>
            </div>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Un écran unique qui reconstitue le parcours complet d'un patient aux urgences, adapté au rôle de l'utilisateur.
            C'est la "Freebox" d'UrgenceOS — l'écran qui vend en 10 secondes.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-primary mb-3">MUST HAVE</h4>
              <ul className="space-y-2">
                {[
                  'Bandeau patient persistant (identité, allergies, CIMU, zone)',
                  'Timeline horodatée unifiée (admission → sortie)',
                  'Filtrage automatique par rôle (RBAC)',
                  'Alertes labo critiques avec valeur et seuil',
                  'Statut prescriptions temps réel',
                  'Synthèse de sortie pré-remplie',
                  'Intégration DPI lecture (FHIR R4/HL7v2)',
                  'Chargement < 2 secondes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">SHOULD HAVE</h4>
              <ul className="space-y-2">
                {[
                  'Recherche textuelle dans la timeline',
                  'Export PDF du parcours complet',
                  'Notifications push événements critiques',
                  'Mini-graphiques de constantes',
                  'Annotations médicales sur événements',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-muted-foreground/60 mb-3">LATER</h4>
              <ul className="space-y-2">
                {[
                  'Intégration bidirectionnelle DPI (écriture)',
                  'Reconnaissance vocale notes cliniques',
                  'Synthèse IA compte-rendu de sortie',
                  'Connexion DMP enrichissement dossier',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">Indicateurs de succès</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Temps de reconstitution parcours : cible -50 %',
                'Changements d\'écran par consultation : de 4-6 à 1',
                'Adoption à S+4 : > 80 % utilisation quotidienne',
                'Ressaisies éliminées : cible -70 %',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Module 2 : Traçabilité temps réel */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] mb-1">Module ROI #2</Badge>
              <h2 className="text-xl font-bold">Traçabilité temps réel</h2>
            </div>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Un journal de bord structuré du service. Chaque appel, chaque tâche, chaque résultat, chaque escalade
            est horodaté, attribué, et consultable. Plus jamais "qui a appelé le labo et quand ?".
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-primary mb-3">MUST HAVE</h4>
              <ul className="space-y-2">
                {[
                  'Journal d\'événements horodaté par patient',
                  'Suivi des tâches par acteur (assignation, statut)',
                  'Traçabilité des appels (labo, imagerie, spécialistes)',
                  'Notifications structurées routées par rôle',
                  'Escalades formalisées avec traçabilité',
                  'Dashboard service temps réel',
                  'Audit log immuable complet',
                  'RBAC sur le journal',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">SHOULD HAVE</h4>
              <ul className="space-y-2">
                {[
                  'Alertes de dépassement de délai configurables',
                  'Rapports d\'activité par période',
                  'Indicateurs de performance par poste',
                  'Export logs pour audit externe',
                  'Notifications multi-canal (écran + push + son)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm text-muted-foreground/60 mb-3">LATER</h4>
              <ul className="space-y-2">
                {[
                  'Analyse prédictive des délais',
                  'Détection d\'anomalies de flux',
                  'Interfaçage gestion des lits',
                  'Dashboard ARS-ready RPU consolidé',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">Indicateurs de succès</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Actions tracées automatiquement : 100 % système, > 90 % terrain',
                'Résolution escalade : cible -40 % vs processus informel',
                'Incidents "tâche oubliée" : cible -60 % à S+8',
                'Complétude journal par patient : > 95 % événements',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* L'écran iconique — La Freebox */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-2">L'écran iconique : la "Freebox" d'UrgenceOS</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            L'écran qui vend en 10 secondes. Quand un médecin, un IDE ou un DG voit cet écran, il comprend ce qui change.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Users, title: 'Bandeau patient', desc: 'Identité, allergies, CIMU, motif, zone, équipe assignée. Toujours visible.' },
              { icon: Clock, title: 'Timeline horodatée', desc: 'Triage, prescriptions, actes, résultats, appels, transmissions. Aucun trou.' },
              { icon: Bell, title: 'Alertes structurées', desc: 'Labo critiques, examens en attente, anomalies de constantes. Cliquables.' },
              { icon: ClipboardList, title: 'Tâches & responsabilités', desc: 'Qui fait quoi, statut, escalades. Bouton d\'escalade en un clic.' },
              { icon: Eye, title: 'Synthèse par rôle', desc: 'Le contenu s\'adapte : médecin, IDE, IOA, AS, secrétaire. Chacun voit ce dont il a besoin.' },
              { icon: Shield, title: 'RBAC + temps réel', desc: 'Données filtrées par droits, mises à jour en continu. Aucune donnée inventée.' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl border bg-background space-y-2">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intégration DPI/PACS/LIS */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <RefreshCcw className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Intégration : encadrer sans remplacer</h2>
              <p className="text-muted-foreground">
                Le DPI reste le système de référence. UrgenceOS le consomme et le complète via des connecteurs standards.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'DPI', items: ['Lecture FHIR R4 / HL7v2 (identité, antécédents, allergies)', 'Écriture post-pilote (observations, prescriptions)', 'DPI = référence admin, UrgenceOS = référence temps réel urgences'] },
              { title: 'LIS (Laboratoire)', items: ['Réception résultats via HL7v2/HPRIM', 'Détection automatique valeurs critiques', 'Routage alerte vers médecin prescripteur'] },
              { title: 'PACS (Imagerie)', items: ['Notification disponibilité examen via HL7v2', 'Lien contextuel vers viewer PACS', 'Pas de stockage d\'images dans UrgenceOS'] },
            ].map((sys) => (
              <div key={sys.title} className="p-4 rounded-xl border bg-background">
                <h4 className="font-semibold text-sm mb-3">{sys.title}</h4>
                <ul className="space-y-2">
                  {sys.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Gouvernance */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Gouvernance & versionnement</h2>
          <p className="text-muted-foreground text-center mb-8">L'hôpital garde la main sur le modèle de données et le rythme des évolutions.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Database, title: 'Modèle de données', desc: 'Documenté, versionné, chaque entité a un propriétaire identifié. Migrations réversibles et testées.' },
              { icon: Server, title: 'Versionnement', desc: 'Chaque module versionné (semver). Compatibilité ascendante garantie. Pré-production obligatoire.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 rounded-xl border bg-card">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">Prêt à évaluer l'architecture ?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Atelier technique DSI de 2 heures. Audit de votre existant. Connecteurs testables.
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
