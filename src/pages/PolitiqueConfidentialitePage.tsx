import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Link>
          </Button>
          <span className="text-lg font-bold tracking-tight">
            Urgence<span className="text-primary">OS</span>
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 8 février 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Responsable du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU (SIREN 944 505 445) est responsable du traitement des données personnelles collectées via la plateforme UrgenceOS.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Contact : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Données collectées</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Données d'identification : nom, prénom, adresse e-mail professionnelle</li>
            <li>Données de connexion : adresse IP, logs de connexion, horodatage</li>
            <li>Données d'utilisation : actions réalisées dans l'application, rôle sélectionné</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Finalités du traitement</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Gestion de l'accès à la plateforme et authentification</li>
            <li>Amélioration continue de l'expérience utilisateur</li>
            <li>Recherche et développement dans le cadre du projet UrgenceOS</li>
            <li>Respect des obligations légales et réglementaires</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Base légale</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le traitement des données est fondé sur le consentement de l'utilisateur (article 6.1.a du RGPD) et l'intérêt légitime de EmotionsCare SASU (article 6.1.f du RGPD) pour l'amélioration de ses services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Durée de conservation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les données personnelles sont conservées pendant la durée nécessaire aux finalités mentionnées ci-dessus, et au maximum 3 ans après la dernière interaction avec la plateforme. Les logs de connexion sont conservés 12 mois conformément à la réglementation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Vos droits (RGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Pour exercer ces droits, contactez-nous à <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Sécurité des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit (TLS) et au repos, Row Level Security (RLS) native, hébergement en Union Européenne, journalisation des accès.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Cookies et traceurs</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS utilise exclusivement des <strong className="text-foreground">cookies techniques</strong> strictement nécessaires au fonctionnement de la plateforme :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Cookie de session d'authentification (durée : session active)</li>
            <li>Préférence de thème clair/sombre (durée : indéfinie, stockage local)</li>
            <li>Consentement cookies (durée : 13 mois, stockage local)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucun cookie publicitaire, analytique ou de suivi tiers n'est utilisé. Conformément à la délibération CNIL n°2020-091, les cookies strictement nécessaires ne requièrent pas de consentement préalable. Un bandeau d'information est néanmoins affiché par transparence.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Vous pouvez supprimer ces cookies à tout moment via les paramètres de votre navigateur. La suppression du cookie de session entraînera une déconnexion automatique.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>
    </div>
  );
}
