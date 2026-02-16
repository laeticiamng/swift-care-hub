import { Link } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 1er février 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">1. Responsable du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU (SIREN 944 505 445), société par actions simplifiée unipersonnelle de droit français, est responsable du traitement des données personnelles collectées via la plateforme UrgenceOS.
          </p>
          <ul className="space-y-1 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Siège social :</strong> France</li>
            <li><strong className="text-foreground">Contact DPO :</strong> <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a></li>
            <li><strong className="text-foreground">Contact général :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">2. Données collectées</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dans le cadre de l'utilisation de la plateforme UrgenceOS, nous collectons les catégories de données suivantes :
          </p>
          <h3 className="text-lg font-medium">2.1 Données d'identification des professionnels</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Nom, prénom, adresse e-mail professionnelle</li>
            <li>Rôle et fonction au sein de l'établissement (médecin, IOA, IDE, aide-soignant, secrétaire)</li>
            <li>Établissement et service de rattachement</li>
          </ul>
          <h3 className="text-lg font-medium">2.2 Données de connexion et d'utilisation</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Adresse IP, identifiant de session, horodatage de connexion/déconnexion</li>
            <li>Actions réalisées dans l'application (audit trail complet)</li>
            <li>Préférences d'interface (thème, langue)</li>
          </ul>
          <h3 className="text-lg font-medium">2.3 Données de santé (traitées pour le compte de l'établissement)</h3>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Données d'identification patient : nom, prénom, date de naissance, sexe, INS</li>
            <li>Données médicales : motif de consultation, constantes vitales, antécédents, allergies</li>
            <li>Données de prise en charge : prescriptions, administrations, résultats d'examens, transmissions</li>
            <li>Données de parcours : horodatage d'arrivée, triage, orientation, sortie</li>
          </ul>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important :</strong> Les données de santé sont traitées conformément à l'article 9.2(h) du RGPD (finalités de médecine préventive ou de la médecine du travail, diagnostics médicaux, prise en charge sanitaire). EmotionsCare agit en tant que sous-traitant au sens du RGPD pour le compte de l'établissement de santé.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">3. Finalités du traitement</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Gestion de l'accès à la plateforme et authentification des professionnels de santé</li>
            <li>Prise en charge des patients aux urgences : admission, triage, prescriptions, suivi</li>
            <li>Traçabilité des actions pour la sécurité des soins (audit trail)</li>
            <li>Amélioration continue de l'expérience utilisateur et de la performance du logiciel</li>
            <li>Recherche et développement dans le cadre du projet UrgenceOS</li>
            <li>Respect des obligations légales et réglementaires</li>
            <li>Statistiques anonymisées d'utilisation du service</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">4. Base légale du traitement</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Exécution du contrat</strong> (article 6.1.b RGPD) : fourniture du service de gestion des urgences</li>
            <li><strong className="text-foreground">Obligation légale</strong> (article 6.1.c RGPD) : conservation des logs d'accès, traçabilité des actes de soin</li>
            <li><strong className="text-foreground">Intérêt légitime</strong> (article 6.1.f RGPD) : amélioration du service, sécurité du système d'information</li>
            <li><strong className="text-foreground">Mission d'intérêt public</strong> (article 9.2.h RGPD) : traitement des données de santé pour la prise en charge sanitaire</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">5. Destinataires des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les données sont accessibles exclusivement :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Aux professionnels de santé autorisés, selon leur rôle (Row Level Security strict)</li>
            <li>À l'équipe technique d'EmotionsCare, dans le cadre strict de la maintenance et du support</li>
            <li>Aux autorités compétentes sur réquisition judiciaire</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucune donnée n'est transmise à des tiers à des fins commerciales ou publicitaires.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">6. Durée de conservation</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Données de santé patient :</strong> 20 ans à compter de la dernière prise en charge (article R.1112-7 du Code de la santé publique)</li>
            <li><strong className="text-foreground">Données d'identification professionnel :</strong> durée du contrat + 3 ans</li>
            <li><strong className="text-foreground">Logs de connexion :</strong> 12 mois (article 6 de la loi n° 2004-575 - LCEN)</li>
            <li><strong className="text-foreground">Audit trail (actions) :</strong> 3 ans après la dernière interaction</li>
            <li><strong className="text-foreground">Données de démo :</strong> supprimées automatiquement à la fin de la session</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">7. Transferts de données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les données sont hébergées exclusivement au sein de l'Union Européenne (infrastructure Supabase, datacenter AWS Frankfurt). Aucun transfert de données hors de l'UE n'est effectué.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">8. Sécurité des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            EmotionsCare SASU met en œuvre les mesures techniques et organisationnelles suivantes :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)</li>
            <li>Row Level Security (RLS) native sur toutes les tables de la base de données</li>
            <li>Authentification JWT avec refresh token et déconnexion automatique après 30 minutes d'inactivité</li>
            <li>Journalisation exhaustive de tous les accès et modifications (audit trail)</li>
            <li>Hébergement certifié HDS (Hébergeur de Données de Santé) en cours de qualification</li>
            <li>Tests de sécurité réguliers et mises à jour de sécurité</li>
            <li>Contrôle d'accès basé sur les rôles (RBAC) strict</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">9. Vos droits (RGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données (UE) 2016/679 et à la loi Informatique et Libertés, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li><strong className="text-foreground">Droit d'accès</strong> (article 15 RGPD) : obtenir la confirmation du traitement et une copie de vos données</li>
            <li><strong className="text-foreground">Droit de rectification</strong> (article 16 RGPD) : corriger les données inexactes ou incomplètes</li>
            <li><strong className="text-foreground">Droit à l'effacement</strong> (article 17 RGPD) : demander la suppression de vos données, sous réserve des obligations légales de conservation</li>
            <li><strong className="text-foreground">Droit à la limitation</strong> (article 18 RGPD) : limiter le traitement dans certaines circonstances</li>
            <li><strong className="text-foreground">Droit à la portabilité</strong> (article 20 RGPD) : recevoir vos données dans un format structuré et interopérable (FHIR R4)</li>
            <li><strong className="text-foreground">Droit d'opposition</strong> (article 21 RGPD) : vous opposer au traitement pour des motifs légitimes</li>
            <li><strong className="text-foreground">Directives post-mortem</strong> (article 85 loi Informatique et Libertés) : définir des directives relatives au sort de vos données après votre décès</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Pour exercer ces droits, contactez notre DPO à <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a>. Nous nous engageons à répondre dans un délai d'un mois. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">10. Cookies et traceurs</h2>
          <p className="text-muted-foreground leading-relaxed">
            UrgenceOS utilise exclusivement des <strong className="text-foreground">cookies techniques</strong> strictement nécessaires au fonctionnement de la plateforme :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Cookie de session d'authentification (durée : session active, JWT)</li>
            <li>Préférence de thème clair/sombre (durée : indéfinie, stockage local)</li>
            <li>Cache service worker pour le mode hors ligne (durée : 4h maximum)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucun cookie publicitaire, analytique ou de suivi tiers n'est utilisé. Conformément à la délibération CNIL n°2020-091, les cookies strictement nécessaires ne requièrent pas de consentement préalable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">11. Notification de violation de données</h2>
          <p className="text-muted-foreground leading-relaxed">
            En cas de violation de données à caractère personnel susceptible d'engendrer un risque pour les droits et libertés des personnes, EmotionsCare SASU s'engage à :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>Notifier la CNIL dans les 72 heures suivant la prise de connaissance de la violation</li>
            <li>Informer les personnes concernées dans les meilleurs délais si le risque est élevé</li>
            <li>Documenter la violation et les mesures correctives dans le registre des violations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">12. Analyse d'impact (AIPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément à l'article 35 du RGPD, une Analyse d'Impact relative à la Protection des Données (AIPD) a été réalisée pour le traitement de données de santé à grande échelle opéré par UrgenceOS. Cette analyse couvre :
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-1">
            <li>La description systématique des traitements et de leurs finalités</li>
            <li>L'évaluation de la nécessité et de la proportionnalité des traitements</li>
            <li>L'évaluation des risques pour les droits et libertés des personnes concernées</li>
            <li>Les mesures de sécurité et mécanismes de protection mis en œuvre</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            L'AIPD est tenue à la disposition de la CNIL et peut être consultée sur demande auprès du DPO à <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-primary">13. Modification de la politique</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification substantielle sera notifiée aux utilisateurs via l'application. La version en vigueur est toujours disponible à cette adresse.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-6">
          <Link to="/mentions-legales" className="text-primary hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link to="/cgu" className="text-primary hover:underline">CGU</Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
