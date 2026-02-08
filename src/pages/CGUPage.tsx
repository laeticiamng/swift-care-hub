import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CGUPage() {
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
        <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation de la plateforme UrgenceOS, éditée par EmotionsCare SASU. UrgenceOS est un logiciel de gestion des urgences hospitalières en phase de recherche et développement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">2. Accès à la plateforme</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'accès à UrgenceOS nécessite la création d'un compte utilisateur avec une adresse e-mail valide. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Tout accès réalisé avec ses identifiants est réputé effectué par l'utilisateur lui-même.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">3. Description du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS propose un système d'information pour la gestion des flux aux urgences hospitalières, incluant : l'admission des patients, le tri IOA, le suivi médical et infirmier, la gestion des prescriptions et administrations, et le board panoramique en temps réel.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Avertissement :</strong> UrgenceOS est un projet de recherche. Il ne constitue pas un dispositif médical certifié et ne doit pas être utilisé comme unique outil de décision clinique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">4. Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des éléments composant la plateforme UrgenceOS (code source, interface, textes, graphismes, logos) est protégé par le droit de la propriété intellectuelle et appartient exclusivement à EmotionsCare SASU. Toute reproduction ou exploitation non autorisée est interdite.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">5. Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU s'efforce de maintenir la plateforme accessible et fonctionnelle mais ne garantit pas l'absence d'interruptions ou d'erreurs. La responsabilité de EmotionsCare SASU ne saurait être engagée en cas de dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utilisation de la plateforme.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">6. Données personnelles</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le traitement des données personnelles est régi par notre <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>. En utilisant UrgenceOS, vous acceptez le traitement de vos données conformément à cette politique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">7. Modification des CGU</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">8. Droit applicable</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des tribunaux français.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>
        </div>
      </main>
    </div>
  );
}
