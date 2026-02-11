import { Link } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 1er février 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation de la plateforme UrgenceOS, éditée par EmotionsCare SASU (SIREN 944 505 445). UrgenceOS est un logiciel de gestion des urgences hospitalières en phase de recherche et développement.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Avertissement important :</strong> UrgenceOS est un outil d'aide à la gestion des urgences hospitalières. Il ne constitue pas un dispositif médical certifié au sens du Règlement (UE) 2017/745 et ne doit pas être utilisé comme unique outil de décision clinique.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">2. Accès à la plateforme</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'accès à UrgenceOS nécessite la création d'un compte utilisateur avec une adresse e-mail professionnelle valide. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Tout accès réalisé avec ses identifiants est réputé effectué par l'utilisateur lui-même.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur s'engage à :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Utiliser un mot de passe robuste (minimum 6 caractères, incluant lettres et chiffres)</li>
            <li>Ne pas partager ses identifiants avec des tiers</li>
            <li>Signaler immédiatement toute utilisation non autorisée de son compte</li>
            <li>Se déconnecter après chaque session sur un poste partagé</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Une déconnexion automatique intervient après 30 minutes d'inactivité pour des raisons de sécurité.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">3. Description du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS propose un système d'information pour la gestion des flux aux urgences hospitalières, incluant :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>L'admission des patients et l'enregistrement administratif</li>
            <li>Le tri IOA avec classification CIMU assistée</li>
            <li>Le suivi médical et infirmier (prescriptions, administrations, constantes vitales)</li>
            <li>La gestion des résultats d'examens (biologie, imagerie, ECG)</li>
            <li>Le board panoramique en temps réel avec suivi par zone (SAU, UHCD, Déchocage)</li>
            <li>Les transmissions ciblées au format DAR (Données, Actions, Résultats)</li>
            <li>L'interopérabilité avec les systèmes externes (FHIR R4, HL7v2)</li>
            <li>Le mode hors ligne avec synchronisation automatique</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">4. Rôles et niveaux d'accès</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'accès aux fonctionnalités est contrôlé par un système de rôles strict (RBAC) :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Médecin :</strong> accès complet au dossier patient, prescriptions, résultats, board</li>
            <li><strong className="text-foreground">IOA :</strong> triage, classification CIMU, file d'attente, board (vue restreinte)</li>
            <li><strong className="text-foreground">IDE :</strong> pancarte, administrations, transmissions, constantes, board</li>
            <li><strong className="text-foreground">Aide-soignant :</strong> constantes vitales, surveillance, brancardage, soins de confort</li>
            <li><strong className="text-foreground">Secrétaire :</strong> admission, recherche patient, attribution box</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Chaque rôle ne peut accéder qu'aux données strictement nécessaires à l'exercice de ses fonctions (principe du moindre privilège).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">5. Obligations de l'utilisateur</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur s'engage à :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Utiliser la plateforme conformément à sa finalité et dans le respect de la réglementation</li>
            <li>Saisir des informations exactes et complètes</li>
            <li>Respecter le secret médical et la confidentialité des données des patients</li>
            <li>Ne pas tenter de contourner les mesures de sécurité ou d'accéder à des données non autorisées</li>
            <li>Signaler tout dysfonctionnement ou incident de sécurité à l'équipe EmotionsCare</li>
            <li>Ne pas utiliser la plateforme à des fins non autorisées</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">6. Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des éléments composant la plateforme UrgenceOS (code source, interface, textes, graphismes, logos, algorithmes) est protégé par le droit de la propriété intellectuelle et appartient exclusivement à EmotionsCare SASU. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Les données saisies par les utilisateurs dans le cadre de leur activité professionnelle restent la propriété de l'établissement de santé et des patients concernés.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">7. Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU s'efforce de maintenir la plateforme accessible et fonctionnelle 24h/24 mais ne garantit pas l'absence d'interruptions ou d'erreurs. La responsabilité de EmotionsCare SASU ne saurait être engagée en cas de :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utilisation de la plateforme</li>
            <li>Décisions cliniques prises sur la base des informations affichées par la plateforme</li>
            <li>Perte de données en cas de force majeure ou défaillance de l'hébergeur</li>
            <li>Utilisation non conforme aux présentes CGU</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur reconnaît que les suggestions automatiques (classification CIMU, alertes d'interaction médicamenteuse) sont fournies à titre indicatif et ne se substituent pas au jugement clinique du professionnel de santé.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">8. Mode hors ligne</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS dispose d'un mode hors ligne permettant de continuer à travailler en cas de perte de connexion. Les actions effectuées hors ligne sont mises en file d'attente et synchronisées automatiquement au retour de la connexion. La résolution des conflits suit le principe du « last-write-wins » avec journalisation complète.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur est informé que les données affichées en mode hors ligne peuvent ne pas refléter les dernières modifications effectuées par d'autres utilisateurs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">9. Données personnelles</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le traitement des données personnelles est régi par notre <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>. En utilisant UrgenceOS, vous acceptez le traitement de vos données conformément à cette politique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">10. Mode démonstration</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS propose un mode démonstration accessible sans création de compte. Ce mode utilise des données fictives et ne doit en aucun cas être utilisé pour la prise en charge de vrais patients. Les données du mode démonstration ne sont pas persistées.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">11. Modification des CGU</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par notification dans l'application. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">12. Résiliation</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur peut à tout moment demander la suppression de son compte en contactant EmotionsCare SASU. EmotionsCare SASU se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes CGU, sans préavis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">13. Droit applicable et juridiction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des tribunaux français compétents du siège social de EmotionsCare SASU.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
