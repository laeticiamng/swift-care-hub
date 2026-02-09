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
        <h1 className="text-3xl font-bold">Mentions legales</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Editeur du site</h2>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Raison sociale :</strong> EmotionsCare SASU</li>
            <li><strong className="text-foreground">SIREN :</strong> 944 505 445</li>
            <li><strong className="text-foreground">Forme juridique :</strong> Societe par Actions Simplifiee Unipersonnelle</li>
            <li><strong className="text-foreground">Capital social :</strong> En cours de constitution</li>
            <li><strong className="text-foreground">Siege social :</strong> France</li>
            <li><strong className="text-foreground">Directeur de la publication :</strong> Le president de la SASU EmotionsCare</li>
            <li><strong className="text-foreground">Contact :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
            <li><strong className="text-foreground">Delegue a la Protection des Donnees (DPO) :</strong> <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Hebergement</h2>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Infrastructure applicative :</strong> Supabase Inc.</li>
            <li><strong className="text-foreground">Localisation des serveurs :</strong> Union Europeenne (AWS Frankfurt, Allemagne)</li>
            <li><strong className="text-foreground">Hebergement web :</strong> Vercel Inc. / Netlify Inc.</li>
            <li><strong className="text-foreground">CDN :</strong> Cloudflare Inc.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des donnees est heberge au sein de l'Union Europeenne, conformement aux exigences du RGPD. La qualification HDS (Hebergeur de Donnees de Sante) est en cours d'obtention pour la phase de deploiement en production.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Nature du projet</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS est un projet de recherche et developpement visant a concevoir un systeme d'information pour la gestion des urgences hospitalieres. Le logiciel est actuellement en phase de prototype.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Avertissement :</strong> UrgenceOS ne constitue pas un dispositif medical certifie au sens du Reglement (UE) 2017/745 relatif aux dispositifs medicaux. Il ne doit pas etre utilise comme unique outil de decision clinique.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Propriete intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble du contenu du site (textes, images, logiciels, code source, interface, algorithmes, base de donnees) est la propriete exclusive de EmotionsCare SASU. Toute reproduction, representation ou diffusion, totale ou partielle, est interdite sans autorisation prealable ecrite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Les marques, logos et noms commerciaux utilises sur ce site sont la propriete de leurs titulaires respectifs. Les references aux standards medicaux (RPU, INS, FHIR R4, CIMU, HL7v2) sont utilisees a des fins d'information et d'interoperabilite.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Standards et references</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS integre ou reference les standards suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">RPU :</strong> Resume de Passage aux Urgences (format national)</li>
            <li><strong className="text-foreground">INS :</strong> Identite Nationale de Sante</li>
            <li><strong className="text-foreground">FHIR R4 :</strong> Fast Healthcare Interoperability Resources (HL7)</li>
            <li><strong className="text-foreground">CIMU :</strong> Classification Infirmiere des Malades aux Urgences</li>
            <li><strong className="text-foreground">HL7v2 :</strong> Health Level 7 version 2 (messages)</li>
            <li><strong className="text-foreground">MSSante :</strong> Messagerie Securisee de Sante</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Responsabilite</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les informations fournies par UrgenceOS sont donnees a titre indicatif et ne sauraient constituer un avis medical. EmotionsCare SASU ne pourra etre tenue responsable de l'utilisation des informations diffusees sur ce site ou des decisions cliniques prises sur la base de ces informations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Accessibilite</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU s'efforce de rendre la plateforme UrgenceOS accessible conformement au RGAA (Referentiel General d'Amelioration de l'Accessibilite). L'application est optimisee pour une utilisation avec des gants et sur des ecrans tactiles (cibles minimum 48px).
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialite</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>
    </div>
  );
}
