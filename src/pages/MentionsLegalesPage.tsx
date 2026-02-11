import { Link } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <h1 className="text-3xl font-bold">Mentions légales</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Éditeur du site</h2>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Raison sociale :</strong> EmotionsCare SASU</li>
            <li><strong className="text-foreground">SIREN :</strong> 944 505 445</li>
            <li><strong className="text-foreground">Forme juridique :</strong> Société par Actions Simplifiée Unipersonnelle</li>
            <li><strong className="text-foreground">Capital social :</strong> En cours de constitution</li>
            <li><strong className="text-foreground">Siège social :</strong> France</li>
            <li><strong className="text-foreground">Directeur de la publication :</strong> Le président de la SASU EmotionsCare</li>
            <li><strong className="text-foreground">Contact :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
            <li><strong className="text-foreground">Délégué à la Protection des Données (DPO) :</strong> <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Hébergement</h2>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Infrastructure applicative :</strong> Supabase Inc.</li>
            <li><strong className="text-foreground">Localisation des serveurs :</strong> Union Européenne (AWS Frankfurt, Allemagne)</li>
            <li><strong className="text-foreground">Hébergement web :</strong> Vercel Inc. / Netlify Inc.</li>
            <li><strong className="text-foreground">CDN :</strong> Cloudflare Inc.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des données est hébergé au sein de l'Union Européenne, conformément aux exigences du RGPD. La qualification HDS (Hébergeur de Données de Santé) est en cours d'obtention pour la phase de déploiement en production.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Nature du projet</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS est un projet de recherche et développement visant à concevoir un système d'information pour la gestion des urgences hospitalières. Le logiciel est actuellement en phase de prototype.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" role="alert">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Avertissement :</strong> UrgenceOS ne constitue pas un dispositif médical certifié au sens du Règlement (UE) 2017/745 relatif aux dispositifs médicaux. Il ne doit pas être utilisé comme unique outil de décision clinique.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble du contenu du site (textes, images, logiciels, code source, interface, algorithmes, base de données) est la propriété exclusive de EmotionsCare SASU. Toute reproduction, représentation ou diffusion, totale ou partielle, est interdite sans autorisation préalable écrite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Les marques, logos et noms commerciaux utilisés sur ce site sont la propriété de leurs titulaires respectifs. Les références aux standards médicaux (RPU, INS, FHIR R4, CIMU, HL7v2) sont utilisées à des fins d'information et d'interopérabilité.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Standards et références</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS intègre ou référence les standards suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">RPU :</strong> Résumé de Passage aux Urgences (format national)</li>
            <li><strong className="text-foreground">INS :</strong> Identité Nationale de Santé</li>
            <li><strong className="text-foreground">FHIR R4 :</strong> Fast Healthcare Interoperability Resources (HL7)</li>
            <li><strong className="text-foreground">CIMU :</strong> Classification Infirmière des Malades aux Urgences</li>
            <li><strong className="text-foreground">HL7v2 :</strong> Health Level 7 version 2 (messages)</li>
            <li><strong className="text-foreground">MSSanté :</strong> Messagerie Sécurisée de Santé</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les informations fournies par UrgenceOS sont données à titre indicatif et ne sauraient constituer un avis médical. EmotionsCare SASU ne pourra être tenue responsable de l'utilisation des informations diffusées sur ce site ou des décisions cliniques prises sur la base de ces informations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">Accessibilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU s'efforce de rendre la plateforme UrgenceOS accessible conformément au RGAA (Référentiel Général d'Amélioration de l'Accessibilité). L'application est optimisée pour une utilisation avec des gants et sur des écrans tactiles (cibles minimum 48px).
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
