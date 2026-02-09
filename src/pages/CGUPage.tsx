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
        <h1 className="text-3xl font-bold">Conditions Generales d'Utilisation</h1>
        <p className="text-muted-foreground">Derniere mise a jour : 1er fevrier 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les presentes Conditions Generales d'Utilisation (CGU) definissent les modalites d'acces et d'utilisation de la plateforme UrgenceOS, editee par EmotionsCare SASU (SIREN 944 505 445). UrgenceOS est un logiciel de gestion des urgences hospitalieres en phase de recherche et developpement.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Avertissement important :</strong> UrgenceOS est un outil d'aide a la gestion des urgences hospitalieres. Il ne constitue pas un dispositif medical certifie au sens du Reglement (UE) 2017/745 et ne doit pas etre utilise comme unique outil de decision clinique.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">2. Acces a la plateforme</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'acces a UrgenceOS necessite la creation d'un compte utilisateur avec une adresse e-mail professionnelle valide. L'utilisateur est responsable de la confidentialite de ses identifiants de connexion. Tout acces realise avec ses identifiants est repute effectue par l'utilisateur lui-meme.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur s'engage a :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Utiliser un mot de passe robuste (minimum 6 caracteres, incluant lettres et chiffres)</li>
            <li>Ne pas partager ses identifiants avec des tiers</li>
            <li>Signaler immediatement toute utilisation non autorisee de son compte</li>
            <li>Se deconnecter apres chaque session sur un poste partage</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Une deconnexion automatique intervient apres 30 minutes d'inactivite pour des raisons de securite.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">3. Description du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS propose un systeme d'information pour la gestion des flux aux urgences hospitalieres, incluant :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>L'admission des patients et l'enregistrement administratif</li>
            <li>Le tri IOA avec classification CIMU assistee</li>
            <li>Le suivi medical et infirmier (prescriptions, administrations, constantes vitales)</li>
            <li>La gestion des resultats d'examens (biologie, imagerie, ECG)</li>
            <li>Le board panoramique en temps reel avec suivi par zone (SAU, UHCD, Dechocage)</li>
            <li>Les transmissions ciblees au format DAR (Donnees, Actions, Resultats)</li>
            <li>L'interoperabilite avec les systemes externes (FHIR R4, HL7v2)</li>
            <li>Le mode hors ligne avec synchronisation automatique</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">4. Roles et niveaux d'acces</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'acces aux fonctionnalites est controle par un systeme de roles strict (RBAC) :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Medecin :</strong> acces complet au dossier patient, prescriptions, resultats, board</li>
            <li><strong className="text-foreground">IOA :</strong> triage, classification CIMU, file d'attente, board (vue restreinte)</li>
            <li><strong className="text-foreground">IDE :</strong> pancarte, administrations, transmissions, constantes, board</li>
            <li><strong className="text-foreground">Aide-soignant :</strong> constantes vitales, surveillance, brancardage, soins de confort</li>
            <li><strong className="text-foreground">Secretaire :</strong> admission, recherche patient, attribution box</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Chaque role ne peut acceder qu'aux donnees strictement necessaires a l'exercice de ses fonctions (principe du moindre privilege).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">5. Obligations de l'utilisateur</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur s'engage a :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Utiliser la plateforme conformement a sa finalite et dans le respect de la reglementation</li>
            <li>Saisir des informations exactes et completes</li>
            <li>Respecter le secret medical et la confidentialite des donnees des patients</li>
            <li>Ne pas tenter de contourner les mesures de securite ou d'acceder a des donnees non autorisees</li>
            <li>Signaler tout dysfonctionnement ou incident de securite a l'equipe EmotionsCare</li>
            <li>Ne pas utiliser la plateforme a des fins non autorisees</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">6. Propriete intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des elements composant la plateforme UrgenceOS (code source, interface, textes, graphismes, logos, algorithmes) est protege par le droit de la propriete intellectuelle et appartient exclusivement a EmotionsCare SASU. Toute reproduction, representation, modification ou exploitation non autorisee est interdite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Les donnees saisies par les utilisateurs dans le cadre de leur activite professionnelle restent la propriete de l'etablissement de sante et des patients concernes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">7. Responsabilite</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU s'efforce de maintenir la plateforme accessible et fonctionnelle 24h/24 mais ne garantit pas l'absence d'interruptions ou d'erreurs. La responsabilite de EmotionsCare SASU ne saurait etre engagee en cas de :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Dommages directs ou indirects resultant de l'utilisation ou de l'impossibilite d'utilisation de la plateforme</li>
            <li>Decisions cliniques prises sur la base des informations affichees par la plateforme</li>
            <li>Perte de donnees en cas de force majeure ou defaillance de l'hebergeur</li>
            <li>Utilisation non conforme aux presentes CGU</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur reconnait que les suggestions automatiques (classification CIMU, alertes d'interaction medicamenteuse) sont fournies a titre indicatif et ne se substituent pas au jugement clinique du professionnel de sante.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">8. Mode hors ligne</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS dispose d'un mode hors ligne permettant de continuer a travailler en cas de perte de connexion. Les actions effectuees hors ligne sont mises en file d'attente et synchronisees automatiquement au retour de la connexion. La resolution des conflits suit le principe du "last-write-wins" avec journalisation complete.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur est informe que les donnees affichees en mode hors ligne peuvent ne pas refleter les dernieres modifications effectuees par d'autres utilisateurs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">9. Donnees personnelles</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le traitement des donnees personnelles est regi par notre <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialite</Link>. En utilisant UrgenceOS, vous acceptez le traitement de vos donnees conformement a cette politique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">10. Mode demonstration</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS propose un mode demonstration accessible sans creation de compte. Ce mode utilise des donnees fictives et ne doit en aucun cas etre utilise pour la prise en charge de vrais patients. Les donnees du mode demonstration ne sont pas persistees.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">11. Modification des CGU</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU se reserve le droit de modifier les presentes CGU a tout moment. Les utilisateurs seront informes de toute modification substantielle par notification dans l'application. La poursuite de l'utilisation de la plateforme apres modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">12. Resiliation</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'utilisateur peut a tout moment demander la suppression de son compte en contactant EmotionsCare SASU. EmotionsCare SASU se reserve le droit de suspendre ou resilier l'acces d'un utilisateur en cas de violation des presentes CGU, sans preavis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">13. Droit applicable et juridiction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les presentes CGU sont regies par le droit francais. Tout litige relatif a leur interpretation ou a leur execution releve de la competence exclusive des tribunaux francais competents du siege social de EmotionsCare SASU.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions legales</Link>
          <span>·</span>
          <Link to="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialite</Link>
        </div>
      </main>
    </div>
  );
}
