import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MentionsLegalesPage() {
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
        <h1 className="text-3xl font-bold">Mentions légales</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Éditeur du site</h2>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Raison sociale :</strong> EmotionsCare SASU</li>
            <li><strong className="text-foreground">SIREN :</strong> 944 505 445</li>
            <li><strong className="text-foreground">Forme juridique :</strong> Société par Actions Simplifiée Unipersonnelle</li>
            <li><strong className="text-foreground">Siège social :</strong> France</li>
            <li><strong className="text-foreground">Directeur de la publication :</strong> Le président de la SASU EmotionsCare</li>
            <li><strong className="text-foreground">Contact :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Hébergement</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'application UrgenceOS est hébergée par des fournisseurs d'infrastructure cloud conformes aux standards de sécurité européens (données hébergées en Union Européenne).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble du contenu du site (textes, images, logiciels, code source, interface) est la propriété exclusive de EmotionsCare SASU. Toute reproduction, représentation ou diffusion, totale ou partielle, est interdite sans autorisation préalable écrite.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS est un projet de recherche. Les informations fournies sont données à titre indicatif et ne sauraient constituer un avis médical. EmotionsCare SASU ne pourra être tenue responsable de l'utilisation des informations diffusées sur ce site.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>
    </div>
  );
}
