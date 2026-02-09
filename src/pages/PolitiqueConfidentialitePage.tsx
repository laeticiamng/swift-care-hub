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
        <h1 className="text-3xl font-bold">Politique de confidentialite</h1>
        <p className="text-muted-foreground">Derniere mise a jour : 1er fevrier 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">1. Responsable du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU (SIREN 944 505 445), societe par actions simplifiee unipersonnelle de droit francais, est responsable du traitement des donnees personnelles collectees via la plateforme UrgenceOS.
          </p>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Siege social :</strong> France</li>
            <li><strong className="text-foreground">Contact DPO :</strong> <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a></li>
            <li><strong className="text-foreground">Contact general :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">2. Donnees collectees</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dans le cadre de l'utilisation de la plateforme UrgenceOS, nous collectons les categories de donnees suivantes :
          </p>
          <h3 className="text-lg font-medium">2.1 Donnees d'identification des professionnels</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Nom, prenom, adresse e-mail professionnelle</li>
            <li>Role et fonction au sein de l'etablissement (medecin, IOA, IDE, aide-soignant, secretaire)</li>
            <li>Etablissement et service de rattachement</li>
          </ul>
          <h3 className="text-lg font-medium">2.2 Donnees de connexion et d'utilisation</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Adresse IP, identifiant de session, horodatage de connexion/deconnexion</li>
            <li>Actions realisees dans l'application (audit trail complet)</li>
            <li>Preferences d'interface (theme, langue)</li>
          </ul>
          <h3 className="text-lg font-medium">2.3 Donnees de sante (traitees pour le compte de l'etablissement)</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Donnees d'identification patient : nom, prenom, date de naissance, sexe, INS</li>
            <li>Donnees medicales : motif de consultation, constantes vitales, antecedents, allergies</li>
            <li>Donnees de prise en charge : prescriptions, administrations, resultats d'examens, transmissions</li>
            <li>Donnees de parcours : horodatage d'arrivee, triage, orientation, sortie</li>
          </ul>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important :</strong> Les donnees de sante sont traitees conformement a l'article 9.2(h) du RGPD (finalites de medecine preventive ou de la medecine du travail, diagnostics medicaux, prise en charge sanitaire). EmotionsCare agit en tant que sous-traitant au sens du RGPD pour le compte de l'etablissement de sante.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">3. Finalites du traitement</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Gestion de l'acces a la plateforme et authentification des professionnels de sante</li>
            <li>Prise en charge des patients aux urgences : admission, triage, prescriptions, suivi</li>
            <li>Tracabilite des actions pour la securite des soins (audit trail)</li>
            <li>Amelioration continue de l'experience utilisateur et de la performance du logiciel</li>
            <li>Recherche et developpement dans le cadre du projet UrgenceOS</li>
            <li>Respect des obligations legales et reglementaires</li>
            <li>Statistiques anonymisees d'utilisation du service</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">4. Base legale du traitement</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Execution du contrat</strong> (article 6.1.b RGPD) : fourniture du service de gestion des urgences</li>
            <li><strong className="text-foreground">Obligation legale</strong> (article 6.1.c RGPD) : conservation des logs d'acces, tracabilite des actes de soin</li>
            <li><strong className="text-foreground">Interet legitime</strong> (article 6.1.f RGPD) : amelioration du service, securite du systeme d'information</li>
            <li><strong className="text-foreground">Mission d'interet public</strong> (article 9.2.h RGPD) : traitement des donnees de sante pour la prise en charge sanitaire</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">5. Destinataires des donnees</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les donnees sont accessibles exclusivement :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Aux professionnels de sante autorises, selon leur role (Row Level Security strict)</li>
            <li>A l'equipe technique d'EmotionsCare, dans le cadre strict de la maintenance et du support</li>
            <li>Aux autorites competentes sur requisition judiciaire</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucune donnee n'est transmise a des tiers a des fins commerciales ou publicitaires.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">6. Duree de conservation</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Donnees de sante patient :</strong> 20 ans a compter de la derniere prise en charge (article R.1112-7 du Code de la sante publique)</li>
            <li><strong className="text-foreground">Donnees d'identification professionnel :</strong> duree du contrat + 3 ans</li>
            <li><strong className="text-foreground">Logs de connexion :</strong> 12 mois (article 6 de la loi n° 2004-575 - LCEN)</li>
            <li><strong className="text-foreground">Audit trail (actions) :</strong> 3 ans apres la derniere interaction</li>
            <li><strong className="text-foreground">Donnees de demo :</strong> supprimees automatiquement a la fin de la session</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">7. Transferts de donnees</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les donnees sont hebergees exclusivement au sein de l'Union Europeenne (infrastructure Supabase, datacenter AWS Frankfurt). Aucun transfert de donnees hors de l'UE n'est effectue.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">8. Securite des donnees</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU met en oeuvre les mesures techniques et organisationnelles suivantes :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Chiffrement des donnees en transit (TLS 1.3) et au repos (AES-256)</li>
            <li>Row Level Security (RLS) native sur toutes les tables de la base de donnees</li>
            <li>Authentification JWT avec refresh token et deconnexion automatique apres 30 minutes d'inactivite</li>
            <li>Journalisation exhaustive de tous les acces et modifications (audit trail)</li>
            <li>Hebergement certifie HDS (Hebergeur de Donnees de Sante) en cours de qualification</li>
            <li>Tests de securite reguliers et mises a jour de securite</li>
            <li>Controle d'acces base sur les roles (RBAC) strict</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">9. Vos droits (RGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformement au Reglement General sur la Protection des Donnees (UE) 2016/679 et a la loi Informatique et Libertes, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Droit d'acces</strong> (article 15 RGPD) : obtenir la confirmation du traitement et une copie de vos donnees</li>
            <li><strong className="text-foreground">Droit de rectification</strong> (article 16 RGPD) : corriger les donnees inexactes ou incompletes</li>
            <li><strong className="text-foreground">Droit a l'effacement</strong> (article 17 RGPD) : demander la suppression de vos donnees, sous reserve des obligations legales de conservation</li>
            <li><strong className="text-foreground">Droit a la limitation</strong> (article 18 RGPD) : limiter le traitement dans certaines circonstances</li>
            <li><strong className="text-foreground">Droit a la portabilite</strong> (article 20 RGPD) : recevoir vos donnees dans un format structure et interoperable (FHIR R4)</li>
            <li><strong className="text-foreground">Droit d'opposition</strong> (article 21 RGPD) : vous opposer au traitement pour des motifs legitimes</li>
            <li><strong className="text-foreground">Directives post-mortem</strong> (article 85 loi Informatique et Libertes) : definir des directives relatives au sort de vos donnees apres votre deces</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Pour exercer ces droits, contactez notre DPO a <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a>. Nous nous engageons a repondre dans un delai d'un mois. Vous pouvez egalement introduire une reclamation aupres de la CNIL (<a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">10. Cookies et traceurs</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS utilise exclusivement des <strong className="text-foreground">cookies techniques</strong> strictement necessaires au fonctionnement de la plateforme :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Cookie de session d'authentification (duree : session active, JWT)</li>
            <li>Preference de theme clair/sombre (duree : indefinie, stockage local)</li>
            <li>Cache service worker pour le mode hors ligne (duree : 4h maximum)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucun cookie publicitaire, analytique ou de suivi tiers n'est utilise. Conformement a la deliberation CNIL n°2020-091, les cookies strictement necessaires ne requierent pas de consentement prealable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">11. Notification de violation de donnees</h2>
          <p className="text-muted-foreground leading-relaxed">
            En cas de violation de donnees a caractere personnel susceptible d'engendrer un risque pour les droits et libertes des personnes, EmotionsCare SASU s'engage a :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Notifier la CNIL dans les 72 heures suivant la prise de connaissance de la violation</li>
            <li>Informer les personnes concernees dans les meilleurs delais si le risque est eleve</li>
            <li>Documenter la violation et les mesures correctives dans le registre des violations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">12. Modification de la politique</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nous nous reservons le droit de modifier cette politique de confidentialite a tout moment. Toute modification substantielle sera notifiee aux utilisateurs via l'application. La version en vigueur est toujours disponible a cette adresse.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions legales</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>
    </div>
  );
}
