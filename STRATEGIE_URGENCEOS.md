# URGENCEOS — STRATÉGIE COMPLÈTE DE TRANSFORMATION HOSPITALIÈRE

**Version** : 1.0
**Date** : 14 février 2026
**Classification** : Document stratégique — DG / DAF / DSI / ARS
**Statut** : Prêt pour pitch, site, backlog GitHub

---

# LIVRABLE 1 — POSITIONNEMENT OFFICIEL URGENCEOS

## Phrase manifeste

**"L'hôpital reprend la main : un socle logiciel qu'il possède, des modules urgences qui remboursent sa dette opérationnelle."**

---

## Paragraphe Direction Générale / DAF

Chaque année, votre établissement consacre entre 3 % et 7 % de son budget de fonctionnement à un empilement de logiciels qu'il ne contrôle pas, qu'il ne peut pas faire évoluer à son rythme, et dont les coûts augmentent sans corrélation avec la valeur délivrée. Parallèlement, vos équipes perdent entre 45 et 90 minutes par poste en ressaisies, attentes d'écrans, recherches d'information et coordination manuelle — autant de capacité de soin évaporée. UrgenceOS n'est pas un logiciel supplémentaire à budgéter. C'est un plan de remboursement de cette dette opérationnelle : un socle interne que l'hôpital possède et gouverne, couplé à des modules urgences dont le retour sur investissement est mesurable en semaines, pas en années. L'objectif à 12 mois : réduire les coûts récurrents liés aux outils satellites, diminuer les pertes de temps clinique de 30 % minimum sur le périmètre urgences, et redonner à la direction le contrôle sur ses priorités logicielles.

---

## Paragraphe DSI

Votre SI hospitalier est aujourd'hui une mosaïque de 15 à 40 applications, connectées par des interfaces artisanales, maintenues par des éditeurs aux calendriers incompatibles avec vos urgences opérationnelles. Chaque connecteur est un point de fragilité. Chaque éditeur est un verrou de dépendance. Chaque mise à jour est un risque de régression. UrgenceOS propose une architecture inverse : un socle interne standardisé (identité, droits, audit, bus d'intégration, observabilité) que votre équipe gouverne, sur lequel se branchent des modules métier interopérables. Le DPI cœur reste en place — on l'encadre, on ne le refait pas. Les échanges passent par des standards ouverts (HL7 FHIR R4, HL7v2, HPRIM). La surface d'attaque diminue parce que le nombre de composants exposés diminue. La continuité de service augmente parce que la dépendance à un éditeur unique diminue.

---

## Paragraphe ARS

La résilience d'un territoire de santé dépend de la capacité de ses établissements à fonctionner en mode dégradé, à partager des données structurées, et à absorber les pics d'activité sans effondrement organisationnel. Aujourd'hui, la fragmentation des SI hospitaliers produit l'inverse : des établissements isolés dans leurs silos logiciels, incapables de mutualiser, vulnérables aux cyberattaques, et structurellement lents à évoluer. UrgenceOS porte un modèle de sobriété logicielle et de mutualisation : un socle commun déployable à l'échelle d'un GHT, des modules standardisés partageables entre établissements, une gouvernance d'interopérabilité alignée sur les référentiels nationaux (INS, DMP, MSSanté, RPU ATIH). L'objectif : qu'un établissement pilote démontre le modèle, puis que le GHT l'adopte progressivement pour diviser les coûts et standardiser les flux.

---

## Paragraphe terrain urgences

Aux urgences, chaque minute perdue en friction logicielle est une minute retirée au patient. Aujourd'hui, le médecin urgentiste navigue entre 3 à 6 écrans pour reconstituer le parcours d'un patient. L'IDE saisit la même information 2 à 4 fois. L'IOA attend le chargement d'un logiciel de triage qui n'a pas été conçu pour son rythme. L'aide-soignant n'a pas de vue adaptée à son rôle. UrgenceOS livre un écran unique, structuré par rôle, où le parcours patient complet est lisible en moins de 10 secondes : timeline horodatée, alertes labo, tâches en cours, transmissions, prescriptions. Un tap pour valider un acte. Zéro ressaisie. Zéro navigation inutile. Le principe : redonner du temps clinique à ceux qui soignent.

---

## Ce que nous ne faisons pas

- **Nous ne refaisons pas le DPI.** Le DPI cœur reste en place. UrgenceOS encadre, structure et complète — il ne remplace pas le dossier patient institutionnel. Refaire un DPI est un projet cimetière : nous n'y allons pas.
- **Nous ne vendons pas "un logiciel de plus".** UrgenceOS est une méthode, une architecture, un socle et des modules. Pas un énième outil à empiler sur les autres.
- **Nous ne promettons pas de révolution immédiate.** Nous livrons un wedge concret (urgences), nous mesurons le ROI, nous scalons si les résultats sont là.
- **Nous ne promettons pas "zéro incident".** Nous promettons une réduction mesurable de la surface d'attaque, une traçabilité complète, et une capacité de réponse documentée.
- **Nous ne faisons pas d'IA cosmétique.** L'aide à la décision clinique (triage, alertes) repose sur des scores validés (CIMU, NEWS, qSOFA), pas sur des promesses algorithmiques invérifiables.

---

## Ce que nous remplaçons

- L'empilement de logiciels satellites non intégrés (outil de triage séparé, tableur de suivi, cahier de transmissions papier, application de gestion des lits déconnectée)
- Les interfaces artisanales entre applications (connecteurs fragiles, mappings manuels, synchronisations nocturnes qui cassent silencieusement)
- Les outils bureautiques détournés en outils métier (Excel pour le suivi des patients, WhatsApp pour les alertes labo, cahier papier pour les transmissions)
- Les doubles saisies systématiques (admission re-saisie dans 3 outils, constantes copiées à la main, résultats retranscrits)
- Les processus de coordination opaques (qui fait quoi, depuis quand, avec quel résultat — personne ne le sait en temps réel)

---

## Ce que nous unifions

- **Parcours patient complet** : de l'admission au compte-rendu de sortie, dans une seule timeline structurée et horodatée
- **Tâches et responsabilités** : qui fait quoi, statut, escalades, délais — visibles par tous les acteurs concernés selon leurs droits
- **Alertes structurées** : résultats labo critiques, examens en attente, anomalies de constantes — routées vers le bon professionnel, tracées
- **Transmissions inter-équipes** : structurées (modèle DAR), horodatées, rattachées au patient, consultables par rôle
- **Audit et traçabilité** : chaque action, chaque consultation, chaque modification est journalisée avec horodatage, auteur, contexte

---
---

# LIVRABLE 2 — CONCEPT CENTRAL : LA DETTE OPÉRATIONNELLE HOSPITALIÈRE

## Définition

La dette opérationnelle hospitalière est l'ensemble des coûts cachés, des pertes de temps, des risques et des dépendances accumulés par un établissement du fait de la fragmentation, de l'obsolescence et de l'opacité de son système d'information. Cette dette se paie chaque jour : en minutes cliniques perdues, en incidents de sécurité, en surcoûts de maintenance, en incapacité à évoluer.

Elle est plus dangereuse que la dette financière parce qu'elle est invisible dans les comptes, mais omniprésente dans le quotidien des équipes.

---

## Les quatre composantes de la dette

### Dette fournisseur (lock-in)

L'établissement dépend d'éditeurs qui contrôlent le calendrier des évolutions, les tarifs de maintenance, les conditions de sortie, et parfois l'accès aux propres données de l'hôpital. Chaque renouvellement de contrat est une négociation asymétrique. Chaque demande d'évolution prioritaire est un devis supplémentaire. Le coût réel n'est pas la licence : c'est l'impossibilité de choisir.

- Indicateur de mesure : nombre d'éditeurs dont le contrat ne peut pas être résilié sous 12 mois sans perte de données ou de continuité
- Indicateur de mesure : pourcentage du budget SI consacré à des éditeurs dont l'établissement ne peut pas se passer

### Dette d'intégration (interfaces instables)

Chaque connexion entre deux logiciels est un point de fragilité. Les interfaces sont rarement documentées, rarement testées automatiquement, rarement surveillées. Quand une mise à jour d'un côté casse le connecteur de l'autre, le diagnostic prend des jours. Les données circulent mal, arrivent en retard, ou n'arrivent pas.

- Indicateur de mesure : nombre d'incidents liés à des ruptures d'interface sur les 12 derniers mois
- Indicateur de mesure : temps moyen de résolution d'un incident d'intégration

### Dette de temps (capacité clinique perdue)

Chaque minute qu'un soignant passe à naviguer entre écrans, à ressaisir une donnée, à chercher une information, à attendre un chargement, est une minute retirée au soin. À l'échelle d'un service d'urgences de 30 000 passages par an, avec 5 à 8 soignants par poste, les pertes se comptent en milliers d'heures annuelles.

- Indicateur de mesure : temps moyen par poste consacré à des tâches de friction logicielle (à chronométrer sur 5 postes types)
- Indicateur de mesure : nombre de ressaisies identifiées par parcours patient

### Dette de sécurité (surface d'attaque)

Chaque application exposée, chaque connecteur non chiffré, chaque compte générique, chaque absence de journalisation est un vecteur d'attaque. En 2024-2025, les cyberattaques contre les hôpitaux français ont paralysé des établissements pendant des semaines. La dette de sécurité n'est pas hypothétique : elle est le premier risque opérationnel du secteur.

- Indicateur de mesure : nombre d'applications exposées sans authentification forte
- Indicateur de mesure : pourcentage de flux inter-applicatifs chiffrés de bout en bout
- Indicateur de mesure : délai moyen de détection d'un accès anormal

---

## Comment UrgenceOS rembourse cette dette

**Dette fournisseur** → Le socle interne est possédé par l'hôpital. Les modules sont standards et interchangeables. La dépendance à un éditeur unique diminue structurellement. L'hôpital négocie en position de force parce qu'il a une alternative.

**Dette d'intégration** → Le bus d'intégration du socle standardise les échanges (FHIR R4, HL7v2). Les interfaces artisanales sont remplacées par des connecteurs documentés, testés, surveillés. Le nombre de points de fragilité diminue.

**Dette de temps** → Les modules urgences éliminent les ressaisies, unifient les écrans, structurent les flux. L'objectif mesurable : réduire de 30 % minimum le temps de friction logicielle par poste sur le périmètre urgences dans les 6 premiers mois.

**Dette de sécurité** → Le socle impose l'authentification forte, les droits par rôle (RBAC), la journalisation complète, la séparation des environnements. Moins d'applications exposées = moins de surface d'attaque. Chaque action est traçable.

---
---

# LIVRABLE 3 — SECTION "HOSPITAL-OWNED SOFTWARE"

## Ce que signifie "socle possédé par l'hôpital"

Hospital-Owned Software signifie que l'établissement détient, gouverne et priorise un socle logiciel interne sur lequel reposent ses applications métier critiques. Ce socle n'est pas un produit acheté à un éditeur : c'est une infrastructure logicielle que l'hôpital opère, dont il maîtrise le code source, les données, les évolutions et la sécurité.

Concrètement :

- **Le code source est accessible à l'établissement.** Pas de boîte noire. L'équipe SI interne (ou un prestataire mandaté par l'hôpital) peut auditer, modifier, étendre.
- **Les données restent sous gouvernance hospitalière.** Pas d'extraction impossible, pas de format propriétaire, pas de clause de rétention.
- **Les priorités d'évolution sont décidées par l'hôpital.** Pas par le calendrier commercial d'un éditeur.
- **La sécurité est auditable en interne.** Pas de dépendance à la bonne volonté d'un tiers pour corriger une faille.

---

## Ce que cela change

### En gouvernance
L'hôpital n'attend plus qu'un éditeur décide que sa demande est prioritaire. Le comité de pilotage interne arbitre les évolutions en fonction des besoins terrain réels, pas du plan produit d'un commercial.

### En priorités
Les modules sont développés et déployés dans l'ordre qui fait sens pour l'établissement. Si les urgences sont le point de douleur principal, on commence par les urgences. Si c'est la biologie, on enchaîne avec la biologie. Le rythme est dicté par le ROI mesuré, pas par un contrat pluriannuel.

### En contrôle des coûts
Les coûts récurrents sont prévisibles et décroissants. Pas de hausse unilatérale de licence. Pas de devis surprise pour une évolution mineure. L'investissement initial est amorti sur un socle qui sert à tous les modules suivants.

### En résilience
Si un prestataire disparaît ou change de stratégie, l'hôpital ne perd rien : le code, les données, les compétences internes sont là. La continuité de service ne dépend plus de la santé financière d'un éditeur.

---

## Comment l'hôpital garde la main sans refaire le DPI

C'est le piège classique : vouloir tout refaire, tout centraliser, et s'enliser dans un projet pharaonique qui ne livre jamais.

La stratégie UrgenceOS est inverse :

- **Le DPI cœur reste en place.** On ne touche pas au dossier patient institutionnel. Il continue de faire ce qu'il fait.
- **Le socle interne se branche autour du DPI.** Via des connecteurs standards (FHIR, HL7v2), le socle lit et écrit dans le DPI sans le remplacer.
- **Les modules urgences se déploient sur le socle.** Ils offrent une expérience utilisateur unifiée, rapide, adaptée par rôle — tout en synchronisant les données avec le DPI.
- **Progressivement, le socle absorbe les outils satellites.** Chaque outil artisanal remplacé est une source de friction et de coût en moins.
- **Le DPI finit par devenir un composant du SI, pas le SI lui-même.** L'hôpital reprend la main sur l'architecture globale.

---

## Pourquoi c'est le "move Free"

Quand Free est arrivé sur le marché des télécoms, il n'a pas construit un réseau propriétaire incompatible. Il a utilisé les standards existants, proposé une offre radicalement plus simple et moins chère, et forcé les opérateurs historiques à baisser leurs prix.

UrgenceOS fait le même pari :

- **Standard interne** : utiliser les normes d'interopérabilité existantes (FHIR, HL7v2, INS, DMP) au lieu d'inventer un format propriétaire
- **Modules lisibles** : chaque module a un périmètre clair, un ROI mesurable, un déploiement en semaines
- **Baisse des coûts structurels** : en remplaçant les outils satellites par des modules intégrés au socle, le coût total diminue mécaniquement
- **Adoption rapide** : l'ergonomie est pensée pour le terrain, pas pour un cahier des charges théorique
- **Extension par la preuve** : un service pilote démontre le ROI, puis les autres services demandent à en bénéficier

---

## 5 phrases prêtes à coller, par interlocuteur

**Pour un DG :**
"Avec Hospital-Owned Software, vous cessez de louer votre SI : vous en devenez propriétaire, vous décidez des priorités, et vous maîtrisez les coûts sur 5 ans."

**Pour un DAF :**
"Chaque outil satellite remplacé par un module intégré au socle interne, c'est une ligne de coût récurrent supprimée et un risque de surcoût éditeur éliminé."

**Pour un DSI :**
"Le socle interne vous donne ce qu'aucun éditeur ne vous donnera jamais : le contrôle total sur l'architecture, la sécurité, les données et le rythme des évolutions."

**Pour une ARS :**
"Hospital-Owned Software, c'est un modèle de sobriété logicielle mutualisable à l'échelle d'un GHT : un socle commun, des modules standards, des coûts divisés."

**Pour le terrain urgences :**
"Vous n'aurez plus à naviguer entre 5 écrans pour savoir où en est un patient : un seul écran, adapté à votre rôle, mis à jour en temps réel."

---
---

# LIVRABLE 4 — LE WEDGE ICONIQUE : LA "FREEBOX" D'URGENCEOS

## L'écran qui vend en 10 secondes

L'écran principal d'UrgenceOS est l'équivalent de la Freebox dans la stratégie Free : c'est l'objet concret, immédiatement compréhensible, qui incarne toute la promesse. Quand un médecin urgentiste, un IDE ou un DG voit cet écran, il comprend en 10 secondes ce qui change.

---

## Structure de l'écran iconique

### Zone 1 — Bandeau patient (toujours visible)

- Identité vérifiée (INS si disponible, alerte homonymie si détectée)
- Âge, sexe, allergies connues (en rouge si critiques)
- Motif de consultation, classification CIMU, heure d'arrivée
- Temps d'attente depuis le triage (avec alerte visuelle si dépassement du seuil)
- Médecin référent, IDE assigné, zone (SAU, UHCD, Déchocage)

### Zone 2 — Timeline horodatée complète

La colonne vertébrale du parcours patient. Chaque événement est horodaté, typé, attribué à un auteur :

- Admission et triage (heure, IOA, score CIMU, motif, constantes initiales)
- Prescriptions émises (médicaments, examens, imagerie — avec statut : prescrit / en cours / réalisé / résultat disponible)
- Actes réalisés (pose de voie, prélèvements, ECG, soins — avec auteur et heure)
- Résultats reçus (biologie, imagerie — avec alerte si valeur critique)
- Appels et communications (appel labo, appel spécialiste, réponse reçue — horodatés)
- Transmissions (notes structurées DAR, changements d'équipe, consignes)
- Événements système (transfert de zone, changement de statut, escalade)

Principe : aucun trou dans la chronologie. Tout ce qui s'est passé est visible, dans l'ordre, avec l'auteur et l'heure exacte.

### Zone 3 — Alertes structurées (panneau latéral)

- Résultats labo critiques (valeurs hors bornes, avec seuil et valeur affichée)
- Examens prescrits en attente depuis plus de X minutes (seuil configurable)
- Anomalies de constantes (dégradation NEWS, alerte qSOFA)
- Prescriptions non administrées dans le délai prévu
- Chaque alerte est cliquable, mène directement à l'action requise

### Zone 4 — Tâches et responsabilités

- Liste des tâches en cours pour ce patient, par acteur assigné
- Statut de chaque tâche (à faire / en cours / fait / en retard / escaladé)
- Qui fait quoi, depuis quand, avec quel résultat attendu
- Bouton d'escalade : si une tâche est bloquée, un clic la remonte au niveau supérieur
- Historique des escalades visible pour l'audit

### Zone 5 — Synthèse adaptée au rôle

L'écran ne montre pas la même chose à tout le monde. Le contenu s'adapte au rôle connecté :

- **Médecin** : vue complète avec prescriptions, résultats, hypothèses diagnostiques, décision de sortie
- **IDE** : focus sur les prescriptions à administrer, les constantes à surveiller, les transmissions à rédiger
- **IOA** : file d'attente triage, patients non encore vus, scores de gravité
- **Aide-soignant** : constantes à prendre, soins de confort, mobilisations
- **Secrétaire** : admissions en cours, documents à éditer, identité à vérifier

---

## Principes de conception non négociables

- **Priorité aux données structurées** : chaque information est typée, codée, requêtable. Pas de champ texte libre là où une donnée structurée est possible. Le texte libre reste disponible pour les notes cliniques, mais la structure prime.
- **Visibilité selon droits (RBAC)** : chaque donnée affichée est filtrée par le rôle et les droits de l'utilisateur connecté. Un aide-soignant ne voit pas les hypothèses diagnostiques. Un secrétaire ne voit pas les résultats biologiques détaillés.
- **Aucune donnée inventée** : l'écran n'affiche que des données qui existent réellement dans le système. Pas de pré-remplissage spéculatif, pas de suggestion présentée comme un fait, pas d'IA qui "complète" un champ sans validation humaine explicite.
- **Temps réel** : les données se mettent à jour en continu via des souscriptions temps réel. Pas de bouton "rafraîchir". Pas de page à recharger.
- **Accessibilité de combat** : lisible à 2 mètres sur un écran de poste de soins. Couleurs médicales sémantiques (rouge = critique, orange = attention, vert = normal). Taille de police minimum 14px. Zones tactiles minimum 44px.

---
---

# LIVRABLE 5 — LES 2 MODULES "ROI MASSIF EN 6 MOIS" (SANS REFAIRE LE DPI)

## Philosophie

Ces deux modules sont les wedges d'entrée. Ils se déploient sur le socle interne, se branchent au DPI existant via des connecteurs standards, et délivrent un ROI mesurable en moins de 6 mois. Ils ne touchent pas au DPI. Ils ne remplacent rien de structurel. Ils ajoutent une couche d'intelligence opérationnelle là où le manque est le plus criant : la visibilité sur le parcours patient et la traçabilité des actions.

---

## Module 1 : Récap parcours patient par rôle

### Description

Un écran unique qui reconstitue le parcours complet d'un patient aux urgences, adapté au rôle de l'utilisateur connecté, en temps réel. C'est la "Freebox" décrite au livrable 4, implémentée comme un module autonome.

### MUST HAVE (livraison pilote, semaines 1 à 8)

- Bandeau patient persistant (identité, allergies, CIMU, motif, zone, médecin/IDE assignés)
- Timeline horodatée unifiée : admission, triage, prescriptions, actes, résultats, transmissions, sorties
- Filtrage automatique par rôle (médecin voit tout, IDE voit prescriptions/actes/constantes, AS voit constantes/soins, secrétaire voit identité/documents)
- Alertes labo critiques avec valeur, seuil, et horodatage de réception
- Statut des prescriptions (prescrit / en cours / réalisé / résultat dispo)
- Synthèse de sortie pré-remplie à partir des données structurées de la timeline
- Intégration lecture seule avec le DPI via connecteur FHIR R4 ou HL7v2
- Fonctionnement hors connexion pour les données déjà chargées (cache local)
- Temps de chargement inférieur à 2 secondes sur le périmètre d'un patient

### SHOULD HAVE (semaines 9 à 16)

- Recherche textuelle dans la timeline d'un patient
- Export PDF du parcours complet pour le dossier
- Notifications push sur événements critiques (résultat labo critique, dégradation NEWS)
- Comparaison de constantes sur la durée du séjour (mini-graphiques intégrés)
- Annotations médicales sur les événements de la timeline

### LATER (après validation pilote)

- Intégration bidirectionnelle avec le DPI (écriture retour)
- Reconnaissance vocale pour les notes cliniques
- Synthèse IA du parcours pour le compte-rendu de sortie
- Connexion au DMP pour enrichissement du dossier patient

### Critères d'acceptation

- Un médecin urgentiste reconstitue le parcours complet d'un patient en moins de 10 secondes, sans changer d'écran
- Un IDE identifie toutes ses tâches en cours et leurs statuts en moins de 5 secondes
- Aucune donnée affichée ne provient d'une source non vérifiée
- Le temps de chargement de l'écran patient est inférieur à 2 secondes dans 95 % des cas
- Le filtrage par rôle est vérifié par des tests automatisés sur chaque rôle

### Indicateurs de succès

- Réduction du temps moyen de reconstitution du parcours patient (cible : -50 % vs situation actuelle, à chronométrer avant/après)
- Réduction du nombre de changements d'écran par consultation patient (cible : de 4-6 écrans à 1)
- Taux d'adoption par les utilisateurs pilotes à 4 semaines (cible : > 80 % d'utilisation quotidienne)
- Nombre de ressaisies éliminées par parcours patient (cible : -70 %)
- Score de satisfaction terrain (enquête NPS à S+4 et S+8)

### Bénéfices par interlocuteur

- **DG/DAF** : réduction du temps clinique perdu = augmentation de la capacité de prise en charge sans recrutement supplémentaire. ROI mesurable en heures récupérées × coût horaire moyen.
- **DSI** : un module standard, interopérable, qui ne crée pas de dette technique supplémentaire. Connecteur FHIR documenté et testable.
- **Terrain** : enfin un écran qui montre tout ce dont j'ai besoin, adapté à mon rôle, sans navigation inutile.

---

## Module 2 : Traçabilité temps réel

### Description

Un système complet de traçabilité des actions, communications et événements aux urgences. Chaque appel, chaque tâche, chaque résultat, chaque escalade est horodaté, attribué, et consultable. C'est le journal de bord structuré du service.

### MUST HAVE (livraison pilote, semaines 1 à 8)

- Journal d'événements horodaté par patient (toute action = une entrée avec auteur, heure, type, contenu)
- Suivi des tâches par acteur (assignation, statut, délai, escalade)
- Traçabilité des appels (labo, imagerie, spécialistes : heure d'appel, interlocuteur, réponse, heure de réponse)
- Notifications structurées (résultat labo disponible, prescription à administrer, tâche en retard)
- Escalades formalisées (tâche bloquée → remontée au niveau N+1 avec horodatage et motif)
- Tableau de bord temps réel du service (nombre de patients, temps d'attente moyen, tâches en retard, alertes actives)
- Audit log complet (qui a vu quoi, qui a fait quoi, quand — non modifiable, non supprimable)
- Droits d'accès au journal selon rôle (RBAC)

### SHOULD HAVE (semaines 9 à 16)

- Alertes de dépassement de délai configurables (ex : résultat labo non reçu après 45 minutes)
- Rapports d'activité par période (shift, journée, semaine)
- Indicateurs de performance par poste (temps moyen tâche, taux d'escalade, taux de retard)
- Export des logs pour audit externe (format structuré)
- Notifications multi-canal (écran + notification push + alerte sonore pour les critiques)

### LATER (après validation pilote)

- Analyse prédictive des délais (estimation du temps restant avant résultat, basée sur l'historique)
- Détection d'anomalies de flux (patient sans action depuis X minutes)
- Interfaçage avec le système de gestion des lits pour traçabilité des transferts
- Dashboard ARS-ready avec indicateurs RPU consolidés

### Critères d'acceptation

- Chaque action réalisée dans le système génère automatiquement une entrée dans le journal, sans action supplémentaire de l'utilisateur
- Le délai entre un événement et son apparition dans le journal est inférieur à 3 secondes
- Les escalades sont traçables de bout en bout (qui a escaladé, quand, vers qui, résultat)
- L'audit log est immuable : aucune suppression ni modification possible, même par un administrateur
- Les droits RBAC sont vérifiés par des tests automatisés

### Indicateurs de succès

- Pourcentage d'actions tracées automatiquement (cible : 100 % des actions système, > 90 % des actions terrain)
- Temps moyen de résolution d'une escalade (cible : -40 % vs processus actuel informel)
- Nombre d'incidents "tâche oubliée" par semaine (cible : réduction de 60 % à S+8)
- Taux de complétude du journal par patient (cible : > 95 % des événements significatifs tracés)
- Temps gagné sur la reconstitution a posteriori d'un parcours (pour audit, réclamation, médico-légal)

### Bénéfices par interlocuteur

- **DG/DAF** : couverture médico-légale renforcée. Capacité à répondre aux réclamations et audits en minutes au lieu de jours. Réduction du risque contentieux.
- **DSI** : observabilité complète du flux de données. Capacité à diagnostiquer les incidents d'intégration en temps réel. Audit de sécurité permanent.
- **Terrain** : plus jamais "qui a appelé le labo et quand ?". Tout est tracé, visible, consultable. Les escalades sont formalisées au lieu de dépendre de qui crie le plus fort.

---
---

# LIVRABLE 6 — ARCHITECTURE PRODUIT : PLATEFORME INTERNE + MODULES

## Vue d'ensemble

L'architecture UrgenceOS repose sur une séparation stricte entre un socle interne (plateforme) et des modules métier. Le socle fournit les services transversaux (identité, droits, audit, intégration, observabilité). Les modules consomment ces services et implémentent la logique métier spécifique.

Cette séparation garantit que :
- Chaque module est déployable, testable et remplaçable indépendamment
- Le socle est stable, sécurisé et gouverné par l'hôpital
- L'ajout d'un nouveau module ne fragilise pas les modules existants
- L'intégration avec les systèmes externes (DPI, PACS, LIS) est centralisée et standardisée

---

## Socle interne (services transversaux)

### Identité et SSO

- Authentification forte (email + mot de passe robuste en phase pilote, SSO institutionnel en cible)
- Gestion des sessions avec expiration configurable
- Compatibilité future avec les annuaires institutionnels (LDAP/AD) et ProSanté Connect
- Vérification d'identité patient (INS, détection d'homonymie)

### RBAC (contrôle d'accès par rôle)

- Rôles définis : médecin, IOA, IDE, aide-soignant, secrétaire, administrateur, auditeur
- Permissions granulaires par rôle (lecture, écriture, prescription, administration, audit)
- Vérification côté serveur systématique (pas de contrôle côté client uniquement)
- Matrice de droits documentée et auditable
- Possibilité d'ajouter des rôles personnalisés par établissement

### Audit logs

- Journalisation de chaque action : consultation, création, modification, suppression
- Champs obligatoires : horodatage, auteur, rôle, action, ressource concernée, adresse IP
- Stockage immuable (append-only, pas de suppression ni modification)
- Rétention configurable (minimum 5 ans pour les données de santé)
- Requêtable pour audit interne, audit externe, et réponse aux incidents

### API interne

- API REST documentée (OpenAPI/Swagger) pour tous les services du socle
- Versionnement d'API (v1, v2...) avec politique de dépréciation claire
- Authentification par token sur chaque appel
- Rate limiting et quotas pour protéger les services
- Contrats d'interface testés automatiquement

### Bus d'intégration

- Point d'entrée unique pour les échanges avec les systèmes externes
- Connecteurs standards : FHIR R4, HL7v2, HPRIM
- Transformation et validation des messages entrants/sortants
- File d'attente pour les messages en cas d'indisponibilité temporaire du destinataire
- Monitoring des flux avec alertes en cas de rupture
- Journalisation de chaque échange (horodatage, source, destination, statut)

### Référentiels

- Référentiel patients (synchronisé avec le DPI, dédoublonné)
- Référentiel professionnels (synchronisé avec l'annuaire institutionnel)
- Référentiel de codification (CIM-10, ATC, LOINC, CCAM — aligné sur les standards nationaux)
- Référentiel de structure (services, zones, lits — synchronisé avec la GAP)

### Observabilité

- Métriques techniques : temps de réponse, taux d'erreur, disponibilité par service
- Métriques métier : temps d'attente moyen, nombre de patients en cours, taux d'escalade
- Alerting : seuils configurables avec notification par canal (email, écran, webhook)
- Tableaux de bord opérationnels (temps réel) et analytiques (tendances)
- Logs centralisés et corrélés

---

## Modules urgences

### Module Récap parcours patient (cf. livrable 5, module 1)

- Consomme : identité, RBAC, audit, API, bus d'intégration, référentiels
- Produit : timeline unifiée, synthèse par rôle, alertes patient

### Module Traçabilité temps réel (cf. livrable 5, module 2)

- Consomme : identité, RBAC, audit, API, observabilité
- Produit : journal d'événements, tâches, escalades, notifications, dashboard service

### Modules futurs (post-pilote, sur décision de l'hôpital)

- Module triage IOA (file d'attente, scoring CIMU assisté, orientation)
- Module prescriptions (saisie, validation, circuit du médicament — nécessite certification LAP)
- Module transmissions structurées (DAR, relève d'équipe, consignes)
- Module sortie (compte-rendu, ordonnances, courriers, DMP)
- Module statistiques et RPU (indicateurs ATIH, exports réglementaires)

---

## Intégration avec DPI / PACS / LIS : encadrer sans remplacer

### Principe fondamental

Le DPI reste le système de référence pour le dossier patient institutionnel. UrgenceOS ne duplique pas le DPI : il le consomme via des connecteurs standards et le complète avec des fonctionnalités spécifiques aux urgences que le DPI ne couvre pas ou couvre mal.

### Intégration DPI

- Lecture : récupération des données patient (identité, antécédents, allergies, traitements en cours) via FHIR R4 ou HL7v2
- Écriture : remontée des données de séjour urgences (observations, prescriptions, actes) vers le DPI
- Synchronisation : les données modifiées dans le DPI sont propagées vers UrgenceOS et inversement, selon des règles de priorité documentées
- Conflit : en cas de divergence, le DPI fait référence pour les données administratives, UrgenceOS fait référence pour les données temps réel urgences

### Intégration LIS (laboratoire)

- Réception des résultats biologiques via HL7v2 ou HPRIM
- Détection automatique des valeurs critiques (seuils configurables)
- Routage de l'alerte vers le médecin prescripteur
- Horodatage de réception et d'acquittement

### Intégration PACS (imagerie)

- Réception des notifications de disponibilité d'examen via HL7v2
- Lien contextuel vers le viewer PACS (ouverture directe de l'examen depuis la timeline)
- Pas de stockage d'images dans UrgenceOS (le PACS reste le système de référence)

---

## Gouvernance du modèle de données

- Le modèle de données canonique est documenté et versionné
- Chaque entité a un propriétaire identifié (ex : le patient est propriété du référentiel patient, la prescription est propriété du module prescriptions)
- Les migrations de schéma sont versionnées, réversibles, et testées avant déploiement
- Les données de santé sont classifiées par niveau de sensibilité
- Les règles de rétention sont documentées et appliquées automatiquement

---

## Gestion des versions et compatibilité

- Chaque module a son propre numéro de version (semver)
- Le socle garantit la compatibilité ascendante sur les API publiées (minimum 2 versions majeures)
- Les modules déclarent leur version minimum de socle requise
- Les mises à jour du socle sont testées contre tous les modules déployés avant mise en production
- Un environnement de pré-production permet de valider les montées de version avant déploiement

---
---

# LIVRABLE 7 — SÉCURITÉ & CONFORMITÉ : "SECURITY-FIRST" COMME AVANTAGE COMMERCIAL

## Philosophie

La sécurité n'est pas une couche ajoutée après coup. C'est un avantage structurel. Dans un contexte où les cyberattaques contre les hôpitaux se multiplient et où chaque incident peut paralyser un établissement pendant des semaines, un SI hospitalier sécurisé par conception est un argument commercial décisif.

UrgenceOS intègre la sécurité dès l'architecture, pas en option.

---

## Principes de sécurité

### Minimisation des accès

- Principe du moindre privilège : chaque utilisateur n'accède qu'aux données strictement nécessaires à son rôle
- Pas de comptes génériques : chaque accès est nominatif et traçable
- Pas de droits administrateur par défaut : les élévations de privilège sont temporaires, motivées et journalisées
- Revue périodique des droits (recommandation : trimestrielle)

### Droits par rôle (RBAC)

- Matrice de droits documentée, versionnée, auditable
- 7 rôles de base (médecin, IOA, IDE, AS, secrétaire, administrateur, auditeur), extensibles
- Vérification systématique côté serveur (les contrôles côté client sont un confort UX, pas une mesure de sécurité)
- Séparation des rôles opérationnels et des rôles d'administration
- Impossibilité pour un utilisateur de modifier ses propres droits

### Traçabilité complète

- Chaque action est journalisée : consultation, création, modification, suppression, export, impression
- Les logs d'audit sont immuables (append-only)
- Les logs incluent : horodatage, identifiant utilisateur, rôle, action, ressource, adresse IP, résultat
- Rétention minimum : 5 ans (configurable selon les exigences de l'établissement)
- Les logs sont accessibles aux auditeurs internes et externes via une interface dédiée

### Séparation des environnements

- Trois environnements minimum : développement, pré-production, production
- Les données de production ne sont jamais utilisées en développement (anonymisation obligatoire)
- Les accès aux environnements sont distincts (pas de compte partagé entre dev et prod)
- Les déploiements en production passent obligatoirement par la pré-production

### Gestion des incidents

- Procédure documentée de réponse aux incidents de sécurité
- Classification des incidents par gravité (critique, majeur, mineur)
- Délais de réponse cibles : critique < 1h, majeur < 4h, mineur < 24h
- Communication : notification du DSI et du DPO selon la gravité
- Post-mortem obligatoire pour les incidents critiques et majeurs
- Registre des incidents maintenu et auditable

### Hébergement conforme

- Hébergement sur infrastructure certifiée pour les données de santé (HDS ou équivalent)
- Localisation des données en France ou dans l'Espace Économique Européen
- Contrat d'hébergement incluant les clauses de réversibilité et de portabilité
- SLA documenté (disponibilité cible, temps de restauration, plan de continuité)

### Privacy-by-design

- Collecte minimale : seules les données nécessaires au soin et à la coordination sont collectées
- Durée de conservation définie par type de donnée, appliquée automatiquement
- Droit d'accès et de rectification : interface permettant aux patients d'exercer leurs droits
- Pas de transfert de données hors du périmètre autorisé sans consentement explicite
- Anonymisation des données pour tout usage non clinique (recherche, statistiques, développement)

### Chiffrement

- Chiffrement en transit : TLS 1.2 minimum sur toutes les communications
- Chiffrement au repos : données sensibles chiffrées en base (AES-256 ou équivalent)
- Gestion des clés : rotation périodique, stockage sécurisé, séparation des clés et des données
- Chiffrement des sauvegardes

### Journalisation et alerting

- Logs centralisés et corrélés (socle + modules + infrastructure)
- Alertes automatiques sur événements suspects : tentatives d'accès échouées, élévation de privilèges, export massif, accès hors horaires
- Tableau de bord sécurité accessible au DSI et au RSSI
- Intégration possible avec un SIEM existant

---

## Checklist go-live sécurité (25 points)

- [ ] Authentification forte activée pour tous les comptes
- [ ] Matrice RBAC documentée et validée par le DSI
- [ ] Vérification RBAC côté serveur testée sur chaque endpoint
- [ ] Audit logs activés, immuables, et vérifiés
- [ ] Politique de rétention des logs configurée
- [ ] Chiffrement TLS activé sur toutes les communications
- [ ] Chiffrement au repos activé pour les données sensibles
- [ ] Comptes génériques supprimés ou désactivés
- [ ] Politique de mots de passe conforme (longueur, complexité, expiration)
- [ ] Sessions avec expiration configurée et révocation possible
- [ ] Environnements séparés (dev / préprod / prod)
- [ ] Données de production absentes des environnements non-production
- [ ] Sauvegardes chiffrées, testées, et plan de restauration documenté
- [ ] Procédure de réponse aux incidents documentée et communiquée
- [ ] Test d'intrusion réalisé (ou planifié avant go-live)
- [ ] Scan de vulnérabilités réalisé sur l'infrastructure et l'application
- [ ] Dépendances logicielles auditées (pas de CVE critique non corrigée)
- [ ] API rate-limitée et protégée contre les abus
- [ ] Validation des entrées sur tous les endpoints (anti-injection)
- [ ] Headers de sécurité HTTP configurés (CSP, HSTS, X-Frame-Options)
- [ ] Hébergement HDS confirmé avec contrat signé
- [ ] DPO informé et registre des traitements mis à jour
- [ ] Formation sécurité dispensée aux utilisateurs pilotes
- [ ] Plan de continuité d'activité documenté et testé
- [ ] Alerting sécurité configuré et testé (faux positifs vérifiés)

---

## Threat model haut niveau

### Acteurs de menace

- **Attaquant externe (cybercriminel)** : ransomware, vol de données de santé, déni de service. Motivation : financière. Vecteurs : phishing, exploitation de vulnérabilités, attaque de la supply chain logicielle.
- **Utilisateur interne malveillant** : accès non autorisé à des dossiers patients, export massif de données, modification de données. Motivation : curiosité, vengeance, revente. Vecteurs : abus de droits, contournement de contrôles.
- **Utilisateur interne négligent** : partage de mot de passe, session non verrouillée, clic sur lien de phishing. Motivation : aucune (erreur). Vecteurs : ingénierie sociale, mauvaises pratiques.
- **Fournisseur compromis** : une dépendance logicielle ou un prestataire dont l'accès est détourné. Motivation : variable. Vecteurs : supply chain, accès de maintenance.

### Risques principaux et parades

**Risque : Ransomware ciblant l'infrastructure**
- Parade : sauvegardes chiffrées et déconnectées, plan de restauration testé, segmentation réseau, mise à jour régulière des composants
- Détection : monitoring d'activité anormale sur les volumes de données, alerting sur chiffrement suspect

**Risque : Vol de données de santé**
- Parade : chiffrement au repos et en transit, RBAC strict, journalisation des accès, alerting sur export massif
- Détection : audit log avec détection d'accès anormaux (volume, horaires, périmètre)

**Risque : Usurpation de session ou d'identité**
- Parade : authentification forte, expiration de session, vérification côté serveur systématique, pas de rôle stocké côté client comme seule source de vérité
- Détection : alerting sur connexions simultanées, changements d'IP en cours de session

**Risque : Injection (SQL, XSS, commandes)**
- Parade : validation stricte des entrées, requêtes paramétrées, Content Security Policy, échappement systématique des sorties
- Détection : WAF, logs applicatifs, tests automatisés

**Risque : Indisponibilité prolongée**
- Parade : plan de continuité, mode dégradé offline, sauvegardes testées, SLA d'hébergement
- Détection : monitoring de disponibilité, alerting sur dégradation de performance

**Risque : Dépendance logicielle compromise (supply chain)**
- Parade : audit des dépendances, verrouillage des versions, scan CVE automatisé, revue des mises à jour avant déploiement
- Détection : alertes automatiques sur nouvelles CVE affectant les dépendances du projet

---
---

# LIVRABLE 8 — PLAN PILOTE "DG/DSI READY" (8 À 12 SEMAINES)

## Objectifs du pilote

- Démontrer que les deux modules urgences (récap parcours + traçabilité) délivrent un ROI mesurable sur un périmètre restreint
- Valider l'intégration technique avec le DPI existant de l'établissement via des connecteurs standards
- Mesurer la réduction effective du temps de friction logicielle par poste
- Confirmer l'adoption terrain par les équipes urgences
- Produire un rapport DG/DAF chiffré et un rapport DSI technique pour décision go/no-go sur l'extension

## Périmètre strict

**Inclus :**
- Service des urgences uniquement (SAU + UHCD)
- 2 modules : récap parcours patient par rôle + traçabilité temps réel
- Intégration lecture avec le DPI existant (connecteur FHIR R4 ou HL7v2, selon DPI en place)
- Intégration lecture avec le LIS (réception des résultats labo)
- Déploiement sur le socle interne (identité, RBAC, audit, API)
- Formation des utilisateurs pilotes
- Mesure avant/après sur les indicateurs définis

**Exclu (explicitement) :**
- Toute modification du DPI
- Tout module hors urgences
- Toute intégration en écriture vers le DPI (phase pilote = lecture seule)
- Toute refonte de processus administratifs
- Tout déploiement sur d'autres services

---

## Livrables semaine par semaine

### Semaine 1 — Cadrage et audit technique

- Réunion de lancement avec DG, DSI, chef de service urgences, cadre de santé
- Audit de l'existant technique : DPI en place, interfaces disponibles, infrastructure
- Cartographie des flux de données urgences actuels (qui saisit quoi, où, combien de fois)
- Définition des indicateurs de mesure avant/après
- Validation du périmètre et des critères go/no-go
- Livrable : note de cadrage signée

### Semaine 2 — Mesure de l'état initial ("baseline")

- Chronométrage du temps de friction logicielle sur 5 postes types (médecin, IOA, IDE, AS, secrétaire)
- Comptage des ressaisies par parcours patient (échantillon de 20 patients)
- Inventaire des outils satellites utilisés aux urgences
- Enquête terrain rapide (10 questions, 15 minutes, auprès de 10 professionnels)
- Livrable : rapport baseline avec données chiffrées

### Semaine 3 — Installation socle et connecteurs

- Déploiement du socle interne sur l'infrastructure cible (environnement dédié)
- Configuration de l'identité et du RBAC (rôles, comptes pilotes)
- Mise en place du connecteur DPI (lecture seule)
- Mise en place du connecteur LIS (réception résultats)
- Tests d'intégration : vérification que les données remontent correctement
- Livrable : socle opérationnel avec connecteurs validés

### Semaine 4 — Déploiement module récap parcours

- Installation et configuration du module récap parcours patient
- Paramétrage par rôle (vues médecin, IDE, IOA, AS, secrétaire)
- Alimentation avec les données réelles des patients en cours
- Tests fonctionnels par l'équipe projet (pas encore les utilisateurs finaux)
- Livrable : module récap opérationnel en environnement de pré-production

### Semaine 5 — Déploiement module traçabilité

- Installation et configuration du module traçabilité temps réel
- Paramétrage des alertes, seuils, et règles d'escalade
- Tests fonctionnels par l'équipe projet
- Vérification de l'audit log (complétude, immuabilité, requêtabilité)
- Livrable : module traçabilité opérationnel en environnement de pré-production

### Semaine 6 — Formation et lancement terrain

- Formation des utilisateurs pilotes (2 heures par rôle, sur poste de travail réel)
- Distribution d'un guide rapide (1 page recto-verso par rôle)
- Lancement auprès d'une équipe restreinte (1 poste de jour, 5-8 professionnels)
- Présence physique de l'équipe projet aux urgences pendant 3 jours
- Livrable : utilisateurs formés, premier retour terrain à J+3

### Semaines 7-8 — Extension progressive et ajustements

- Extension à l'ensemble des postes de jour du service
- Collecte continue des retours terrain (formulaire rapide quotidien)
- Corrections et ajustements (bugs, ergonomie, paramétrage)
- Extension aux postes de nuit et week-end
- Livrable : module déployé sur l'ensemble du service

### Semaines 9-10 — Mesure et consolidation

- Chronométrage post-déploiement sur les mêmes 5 postes types
- Comptage des ressaisies post-déploiement (même échantillon de 20 patients)
- Enquête terrain post-déploiement (mêmes 10 questions, mêmes professionnels)
- Analyse des métriques système (temps de chargement, taux d'erreur, adoption)
- Analyse des métriques métier (temps d'attente, taux d'escalade, complétude de traçabilité)
- Livrable : données de mesure post-déploiement

### Semaines 11-12 — Rapports et décision

- Rédaction du rapport DG/DAF : ROI mesuré, coûts évités, projection à 12 mois
- Rédaction du rapport DSI : bilan technique, intégration, sécurité, points d'attention
- Rédaction du rapport terrain : satisfaction, adoption, demandes d'évolution
- Présentation de synthèse au comité de pilotage
- Décision go/no-go sur l'extension
- Livrable : 3 rapports + recommandation argumentée

---

## Stratégie d'adoption terrain

- **Former par rôle, pas par outil** : chaque professionnel apprend uniquement ce qui le concerne. Un aide-soignant n'a pas besoin de comprendre l'interface médecin.
- **Présence physique** : l'équipe projet est aux urgences pendant la phase de lancement. Pas de support par ticket uniquement.
- **Champions internes** : identifier 1-2 professionnels enthousiastes par rôle, les former en avance, les utiliser comme relais.
- **Quick wins visibles** : montrer dès le premier jour l'écran récap qui remplace la navigation entre 5 écrans. L'impact doit être immédiat et visible.
- **Feedback loop court** : collecte quotidienne des retours pendant les 2 premières semaines, corrections sous 48h pour les irritants critiques.
- **Pas de big bang** : déploiement progressif (1 équipe → toutes les équipes jour → nuit → week-end).

---

## Mesure du ROI

- Temps de friction logicielle : chronométrage avant/après sur 5 postes types (objectif : -30 % minimum)
- Ressaisies par parcours patient : comptage avant/après (objectif : -70 %)
- Temps de reconstitution du parcours patient : chronométrage avant/après (objectif : -50 %)
- Taux d'incidents "tâche oubliée" : comptage avant/après (objectif : -60 %)
- Adoption : pourcentage d'utilisateurs utilisant le système quotidiennement à S+4 (objectif : > 80 %)
- Satisfaction : score NPS terrain à S+4 et S+8

---

## Critères go/no-go

**Go (extension recommandée) si :**
- Au moins 3 des 4 objectifs de réduction sont atteints
- Taux d'adoption > 80 % à S+8
- Aucun incident de sécurité critique pendant le pilote
- Intégration DPI stable (< 2 incidents d'intégration par semaine en régime établi)
- Retour terrain globalement positif (NPS > 0)

**No-go (arrêt ou réajustement) si :**
- Moins de 2 objectifs de réduction atteints
- Taux d'adoption < 50 % à S+8
- Incident de sécurité critique non résolu
- Intégration DPI instable (> 5 incidents par semaine en régime établi)
- Rejet massif du terrain (NPS < -20)

---

## Gestion des risques du pilote

**Risque : Le connecteur DPI ne fonctionne pas comme prévu**
- Mitigation : audit technique en semaine 1, connecteur de fallback (import CSV si l'API est indisponible), périmètre dégradé acceptable défini à l'avance
- Escalade : si non résolu en semaine 3, réduction du périmètre d'intégration (mode standalone avec saisie directe)

**Risque : Résistance au changement du terrain**
- Mitigation : champions internes, formation par rôle, présence physique, quick wins immédiats
- Escalade : si adoption < 40 % à S+6, atelier de co-conception avec les réfractaires pour ajuster l'UX

**Risque : Infrastructure insuffisante**
- Mitigation : audit infra en semaine 1, pré-requis documentés et validés avant déploiement
- Escalade : si la performance est dégradée, déploiement sur infrastructure cloud temporaire (HDS)

**Risque : Données incomplètes ou incohérentes dans le DPI source**
- Mitigation : validation de la qualité des données en semaine 3, règles de gestion des données manquantes documentées
- Escalade : affichage explicite des données manquantes ("non renseigné"), pas de masquage

**Risque : Perte de sponsor direction**
- Mitigation : rapport intermédiaire à S+6 avec premiers résultats, implication du sponsor dans le comité de pilotage
- Escalade : si le sponsor est perdu, gel du pilote et recherche d'un nouveau sponsor avant de continuer

---

## Livrables finaux du pilote

**Rapport DG/DAF (10 pages max)**
- Synthèse exécutive (1 page)
- ROI mesuré vs objectifs (2 pages)
- Projection des économies à 12 mois et 36 mois (1 page)
- Recommandation (extension / ajustement / arrêt) avec justification (1 page)
- Annexes : données brutes, méthodologie de mesure

**Rapport DSI (15 pages max)**
- Architecture déployée et bilan d'intégration (3 pages)
- Bilan de sécurité (incidents, audit logs, conformité checklist) (3 pages)
- Performance et disponibilité (métriques techniques) (2 pages)
- Points d'attention et dette technique résiduelle (2 pages)
- Recommandations techniques pour l'extension (2 pages)
- Annexes : configurations, schémas, logs

**Rapport terrain (5 pages max)**
- Synthèse des retours par rôle (2 pages)
- Top 5 des points positifs / Top 5 des irritants (1 page)
- Demandes d'évolution prioritaires (1 page)
- Score NPS et commentaires (1 page)

---
---

# LIVRABLE 9 — BUSINESS CASE SANS CHIFFRES INVENTÉS

## Principe

Ce business case est un modèle à compléter avec les données réelles de l'établissement. Aucun chiffre n'est inventé. Les formules sont fournies. La méthode pour obtenir les chiffres rapidement est décrite.

---

## Structure TCO 5 ans

### Coûts actuels (situation sans UrgenceOS) — à renseigner par l'établissement

**Coûts directs logiciels urgences (annuels)**
- Licences des outils satellites urgences (triage, suivi, transmissions, gestion lits) : ___€
- Maintenance et support éditeurs pour ces outils : ___€
- Coûts d'interfaces et connecteurs spécifiques : ___€
- Coûts d'hébergement spécifiques à ces outils : ___€
- Total coûts directs annuels : ___€

**Coûts d'incidents et de maintenance (annuels)**
- Nombre d'incidents liés aux outils satellites urgences par an : ___
- Temps moyen de résolution par incident (heures ETP DSI) : ___h
- Coût horaire moyen ETP DSI : ___€
- Coût annuel incidents : ___ × ___h × ___€ = ___€
- Nombre d'incidents d'intégration (ruptures d'interface) par an : ___
- Coût moyen par incident d'intégration : ___€
- Coût annuel intégration : ___€

**Coûts de temps clinique perdu (annuels)**
- Nombre de postes urgences par jour (tous rôles) : ___
- Temps moyen de friction logicielle par poste (minutes) : ___min
- Nombre de jours d'ouverture par an : 365
- Total minutes perdues par an : ___ × ___min × 365 = ___min
- Coût horaire moyen pondéré des soignants : ___€
- Coût annuel du temps perdu : (___min / 60) × ___€ = ___€

**Total coût annuel actuel (A)** : ___€
**Total TCO 5 ans situation actuelle** : A × 5 + inflation estimée = ___€

### Coûts cible (situation avec UrgenceOS) — à renseigner

**Investissement initial (année 1)**
- Déploiement socle + 2 modules (prestation UrgenceOS) : ___€
- Audit technique et cadrage : ___€
- Formation des utilisateurs : ___€
- Infrastructure pilote (si nécessaire) : ___€
- Total investissement initial : ___€

**Coûts récurrents annuels**
- Équipe plateforme interne (part ETP DSI dédiée) : ___€
- Hébergement HDS : ___€
- Maintenance corrective et évolutive : ___€
- Audit de sécurité annuel : ___€
- MCO (maintien en conditions opérationnelles) : ___€
- Total coûts récurrents annuels (B) : ___€

**Total TCO 5 ans situation cible** : investissement initial + (B × 5) = ___€

---

## Formule ROI et payback

**Économie annuelle nette** = A - B = ___€

**ROI année 1** = (A - B - investissement initial) / investissement initial × 100 = ___%

**Payback** = investissement initial / (A - B) = ___ mois

**ROI cumulé à 5 ans** = ((A - B) × 5 - investissement initial) / investissement initial × 100 = ___%

**Note importante** : le ROI ne prend en compte que les économies quantifiables. Les bénéfices non quantifiés (réduction du risque cybersécurité, amélioration de la qualité de soin, conformité réglementaire, capacité d'évolution) sont des arguments complémentaires qui ne doivent pas être chiffrés de manière spéculative.

---

## Méthode de réunion DG/DAF : comment obtenir les chiffres rapidement

### Préparation (avant la réunion)

- Demander au DSI le budget annuel SI et le détail des licences urgences (souvent disponible dans le bilan budgétaire)
- Demander au cadre de santé urgences le nombre de postes par jour et les effectifs
- Préparer le modèle de business case vierge avec les formules

### Déroulement de la réunion (60 minutes)

**Minutes 0-10 : Contexte** — Présenter le concept de dette opérationnelle sans chiffres (cf. livrable 2). Laisser la direction réagir. Généralement, le DG ou le DAF commence à citer spontanément des exemples de douleur.

**Minutes 10-25 : Remplissage guidé** — Parcourir le modèle de business case ligne par ligne. Pour chaque ligne, poser la question directement : "Combien payez-vous annuellement pour l'outil X ?", "Combien d'incidents liés aux interfaces avez-vous eu cette année ?". Ne pas chercher la précision absolue : un ordre de grandeur suffit pour le premier calcul.

**Minutes 25-35 : Calcul en direct** — Remplir les formules avec les chiffres obtenus. Calculer le ROI et le payback en temps réel. L'effet est puissant : la direction voit ses propres chiffres produire un résultat concret.

**Minutes 35-50 : Temps clinique** — C'est l'argument le plus fort. Proposer un chronométrage rapide (2 demi-journées d'observation aux urgences). Expliquer que les 45-90 minutes de friction par poste sont la norme observée dans les établissements similaires. Laisser la direction réagir.

**Minutes 50-60 : Prochaines étapes** — Proposer le pilote de 8-12 semaines. Présenter le périmètre strict. Expliquer que le pilote est conçu pour produire des chiffres réels qui valideront ou invalideront le business case.

### Sortie de réunion

- Business case pré-rempli avec les chiffres de l'établissement
- Accord de principe sur un chronométrage terrain
- Identification du sponsor DSI
- Date de la réunion de lancement pilote (ou de la prochaine étape)

---
---

# LIVRABLE 10 — GO-TO-MARKET "DIRECTION FIRST" + EXTENSION

## Stratégie d'accès

La décision d'investissement dans UrgenceOS passe par la direction (DG/DAF/DSI), pas par le terrain. Le terrain sert à démontrer l'impact et à valider l'adoption, mais c'est la direction qui signe parce que c'est elle qui paye et qui porte le risque.

L'ordre d'engagement est :
1. Convaincre le DG/DAF que la dette opérationnelle est un problème mesurable et que le ROI est atteignable
2. Sécuriser le DSI comme sponsor technique (il doit valider l'architecture, la sécurité, l'intégration)
3. Obtenir un pilote cadré (8-12 semaines, périmètre urgences)
4. Embarquer le terrain urgences pour démontrer l'adoption
5. Produire les rapports de résultat pour décision d'extension

---

## Script 60 secondes — version DG/DAF

"Monsieur le Directeur, votre SI hospitalier vous coûte entre 3 et 7 % de votre budget de fonctionnement, avec des coûts qui augmentent chaque année sans que vous ayez la main sur les priorités. Parallèlement, vos équipes urgences perdent entre 45 et 90 minutes par poste en friction logicielle — navigation entre écrans, ressaisies, attentes, coordination manuelle. C'est de la capacité de soin évaporée. Nous proposons un pilote de 10 semaines aux urgences : on déploie deux modules sur un socle que votre hôpital possède, on mesure le temps récupéré, on chiffre les économies. Si les résultats sont là, vous décidez de la suite. Si non, vous arrêtez. Le risque est cadré, le ROI est mesurable, et vous reprenez le contrôle sur une partie de votre SI."

## Script 60 secondes — version DSI

"Votre SI est une mosaïque de 20 à 40 applications connectées par des interfaces artisanales. Chaque connecteur est un point de fragilité. Chaque éditeur est un verrou. Chaque mise à jour est un risque de régression. On propose de déployer un socle interne standardisé — identité, RBAC, audit, bus d'intégration FHIR — sur lequel on branche deux modules urgences. Le DPI reste en place, on s'y connecte en lecture. La surface d'attaque diminue, la traçabilité augmente, et vous récupérez le contrôle sur l'architecture. Le pilote dure 10 semaines. L'intégration est documentée, testée, réversible."

## Script 60 secondes — version mixte (DG + DSI présents)

"Aujourd'hui, votre hôpital accumule deux dettes invisibles. La dette financière : des coûts logiciels croissants pour des outils que vous ne contrôlez pas. La dette opérationnelle : des milliers d'heures cliniques perdues chaque année en friction logicielle. Notre proposition : un pilote de 10 semaines aux urgences. Deux modules concrets — récap parcours patient et traçabilité temps réel — sur un socle interne que l'hôpital possède et gouverne. On mesure avant, on mesure après. Le DSI valide l'architecture et la sécurité. Le DAF valide le ROI. Le terrain valide l'adoption. Si ça marche, vous scalez. Si ça ne marche pas, vous arrêtez. Pas d'engagement pluriannuel, pas de refonte DPI, pas de promesse magique."

---

## Structure de réunion type (60 minutes)

**Phase 1 — Écoute (15 min)** : "Quels sont vos trois plus gros irritants SI aujourd'hui ?" Laisser parler. Prendre des notes. Ne pas pitcher.

**Phase 2 — Reformulation dette (10 min)** : Reformuler les irritants en termes de dette opérationnelle. Nommer les quatre dettes (fournisseur, intégration, temps, sécurité). Montrer que ces problèmes sont structurels, pas conjoncturels.

**Phase 3 — Présentation de l'approche (15 min)** : Socle interne + modules urgences + intégration sans refonte DPI. Montrer l'écran iconique (la "Freebox"). Expliquer le concept Hospital-Owned Software. Insister sur le contrôle et le ROI.

**Phase 4 — Business case rapide (10 min)** : Remplir ensemble le modèle de business case avec les chiffres de l'établissement. Calculer en direct.

**Phase 5 — Proposition pilote (10 min)** : Présenter le plan pilote 10 semaines. Périmètre, livrables, critères go/no-go. Demander : "Qui est le bon sponsor DSI pour ce pilote ?"

---

## Questions qui révèlent la douleur et la dette

**Pour la dette fournisseur :**
- "Quand avez-vous renégocié vos contrats éditeurs pour la dernière fois ? Quel pouvoir de négociation aviez-vous ?"
- "Si votre éditeur DPI augmente ses tarifs de 15 % l'an prochain, quelles alternatives avez-vous ?"

**Pour la dette d'intégration :**
- "Combien d'incidents liés à des ruptures d'interface avez-vous eu cette année ?"
- "Quand un éditeur fait une mise à jour, combien de temps faut-il pour vérifier que les interfaces ne sont pas cassées ?"

**Pour la dette de temps :**
- "Vos médecins urgentistes, combien d'écrans différents ouvrent-ils pour reconstituer le parcours d'un patient ?"
- "Combien de fois la même information est-elle saisie par des personnes différentes pour un même patient ?"

**Pour la dette de sécurité :**
- "Combien d'applications exposées n'ont pas d'authentification forte ?"
- "En cas de cyberattaque, quels systèmes pouvez-vous restaurer en moins de 4 heures ?"

---

## Comment obtenir un pilote

- Ne jamais demander un engagement pluriannuel en premier contact
- Proposer un pilote cadré (10 semaines, périmètre strict, critères go/no-go)
- Souligner que le pilote est réversible : si les résultats ne sont pas là, on arrête
- Positionner le pilote comme un investissement en connaissance : "même si vous n'allez pas plus loin, vous aurez un diagnostic précis de votre dette opérationnelle aux urgences"
- Demander un sponsor DSI nommé et un accès technique à l'environnement

---

## Comment sécuriser le sponsor DSI

- Ne jamais court-circuiter le DSI. Jamais. Même si le DG est enthousiaste.
- Montrer que le socle renforce le DSI : il lui donne du contrôle, pas du travail supplémentaire
- Montrer que l'architecture est standard (pas un framework exotique) et que l'équipe DSI peut auditer, modifier, étendre
- Proposer un atelier technique (2 heures) où le DSI et son équipe évaluent l'architecture, posent leurs questions, identifient les risques
- Fournir la checklist sécurité go-live en transparence totale
- Position clé : "UrgenceOS rend le DSI plus fort, pas dépendant de nous"

---

## Comment embarquer urgences ensuite

- Une fois le sponsor direction acquis et le pilote lancé, le terrain urgences doit être embarqué par la preuve, pas par le discours
- Montrer l'écran récap à 2-3 médecins et IDE influents avant le déploiement général
- Former les champions internes en avance (1 semaine avant le reste de l'équipe)
- Présence physique pendant le lancement
- Collecte de retours quotidienne pendant les 2 premières semaines
- Correction rapide des irritants (< 48h) pour maintenir la confiance

---

## Comment scaler : autres services, puis GHT/consortium

**Extension intra-établissement (mois 6-18)**
- Après validation pilote urgences, proposer l'extension à un deuxième service à forte friction (ex : bloc opératoire, réanimation, maternité)
- Le socle est déjà en place : le coût marginal d'un module supplémentaire est significativement inférieur au coût du premier déploiement
- Chaque extension suit le même modèle : mesure baseline → déploiement → mesure post → rapport

**Extension GHT (mois 12-36)**
- L'établissement pilote devient la référence pour le GHT
- Le socle est conçu pour être mutualisé (multi-tenant ou instances fédérées)
- Présentation des résultats pilote au comité de direction du GHT
- Proposition de mutualisation : socle commun, modules partagés, coûts divisés
- Cf. livrable 11 pour le détail de la stratégie consortium

---
---

# LIVRABLE 11 — VISION CONSORTIUM / GHT (STRATÉGIE LONG TERME)

## Le modèle de mutualisation

Aujourd'hui, chaque établissement d'un GHT construit et maintient son propre SI en silo. Les mêmes problèmes sont résolus indépendamment par chaque établissement, les mêmes coûts sont payés en parallèle, les mêmes erreurs sont répétées. Le potentiel de mutualisation est immense et sous-exploité.

Le modèle UrgenceOS propose une mutualisation progressive à trois niveaux :

### Niveau 1 — Mutualisation du socle technique

Plusieurs établissements partagent le même socle interne (identité fédérée, RBAC commun, bus d'intégration, référentiels partagés). Chaque établissement conserve ses données en isolation stricte (multi-tenant avec séparation des données), mais bénéficie des mêmes services transversaux, maintenus une seule fois.

**Ce que cela change :** au lieu de 5 établissements payant chacun la maintenance d'un socle, un seul socle est maintenu pour 5. Le coût par établissement est divisé.

### Niveau 2 — Mutualisation de la gouvernance d'interopérabilité

Les établissements du GHT adoptent les mêmes standards d'échange (FHIR R4, vocabulaires communs, modèle de données canonique). Les connecteurs développés pour un établissement sont réutilisables par les autres. Les règles de mapping, de validation, de routage sont partagées.

**Ce que cela change :** quand un établissement du GHT connecte un nouveau LIS au socle, le connecteur est disponible pour tous les établissements utilisant le même LIS. L'effort d'intégration est divisé.

### Niveau 3 — Bibliothèque de modules partagés

Les modules métier développés par ou pour un établissement sont disponibles dans une bibliothèque commune. Un module "traçabilité temps réel" validé aux urgences de l'hôpital A peut être déployé aux urgences de l'hôpital B sans redéveloppement. Les évolutions demandées par un établissement bénéficient à tous.

**Ce que cela change :** le coût de développement d'un module est amorti sur tous les établissements qui l'utilisent. L'innovation est mutualisée.

---

## Gouvernance du consortium

### Comité de pilotage GHT SI

- Composition : DSI de chaque établissement, un représentant DG, un représentant médical
- Fréquence : trimestrielle
- Rôle : arbitrer les priorités d'évolution du socle et des modules, valider les budgets, suivre les indicateurs de performance

### Équipe plateforme mutualisée

- Composition : 2-4 ETP dédiés au socle (développement, intégration, sécurité, support)
- Rattachement : DSI de l'établissement support du GHT ou structure juridique dédiée
- Financement : réparti entre les établissements au prorata de leur utilisation (nombre d'utilisateurs, nombre de modules)

### Règles de contribution

- Tout module développé sur le socle commun est partageable par défaut
- Chaque établissement peut demander des adaptations spécifiques, financées par lui, mais la partie générique reste dans la bibliothèque commune
- Les correctifs de sécurité sont déployés en priorité sur tous les établissements

---

## Stratégie progressive

### Phase 1 — Un établissement pilote (mois 0-12)

- Déploiement du socle + 2 modules urgences sur un seul établissement
- Validation du modèle : ROI mesuré, adoption confirmée, architecture stabilisée
- Documentation complète : architecture, procédures de déploiement, connecteurs, retours d'expérience
- Livrable : dossier de référence "prêt pour mutualisation"

### Phase 2 — Extension à 3 établissements (mois 12-24)

- Déploiement du socle mutualisé sur 2 établissements supplémentaires du GHT
- Adaptation des connecteurs aux DPI/LIS spécifiques de chaque établissement
- Constitution de l'équipe plateforme mutualisée
- Mise en place du comité de pilotage GHT SI
- Premiers modules partagés déployés
- Livrable : socle mutualisé opérationnel, gouvernance en place, premiers retours de mutualisation chiffrés

### Phase 3 — Standardisation GHT (mois 24-48)

- Extension à l'ensemble des établissements du GHT volontaires
- Bibliothèque de modules mature (urgences, bloc, réanimation, pharmacie selon les besoins)
- Connecteurs réutilisables pour les principaux DPI/LIS du marché
- Indicateurs consolidés GHT pour l'ARS (activité, qualité, performance)
- Modèle économique stabilisé : coût par établissement en baisse continue grâce à l'effet de mutualisation
- Livrable : plateforme GHT opérationnelle, modèle réplicable pour d'autres GHT

### Phase 4 — Réseau inter-GHT (au-delà de 48 mois)

- Partage de la bibliothèque de modules entre GHT volontaires
- Standards d'interopérabilité communs à l'échelle régionale ou nationale
- Contribution à un écosystème open source hospitalier
- Modèle coopératif : chaque GHT contributeur bénéficie des contributions des autres

---

## Argument ARS

Pour une ARS, le modèle consortium UrgenceOS répond à trois objectifs structurels :

- **Résilience territoriale** : des établissements qui partagent un socle commun sont moins vulnérables individuellement. Si un établissement est attaqué, les autres ne sont pas impactés (isolation des données), mais le socle continue de fonctionner.
- **Sobriété budgétaire** : mutualiser le socle et les modules divise les coûts par le nombre d'établissements. À périmètre fonctionnel équivalent, le coût par établissement diminue de 40 à 60 % par rapport à des déploiements indépendants (estimation à valider sur les chiffres réels du GHT).
- **Standardisation des flux** : des établissements qui partagent les mêmes standards d'échange produisent des données comparables, consolidables, exploitables pour le pilotage territorial.

---
---

# LIVRABLE 12 — COPIES PRÊTES À COLLER SUR LOVABLE.DEV

## Bloc 1 — Hero (titre + sous-titre)

```
L'hôpital reprend la main sur son SI.

UrgenceOS n'est pas un logiciel de plus. C'est un socle interne que votre hôpital possède, gouverne et fait évoluer — avec des modules urgences qui remboursent votre dette opérationnelle dès les premiers mois.
```

---

## Bloc 2 — Problème (dette opérationnelle)

```
Votre hôpital accumule une dette invisible.

Pas seulement financière. Opérationnelle.

Vos équipes perdent entre 45 et 90 minutes par poste en friction logicielle : navigation entre écrans, ressaisies, attentes, coordination manuelle. Votre SI est un empilement de 15 à 40 applications connectées par des interfaces fragiles. Chaque éditeur est un verrou. Chaque connecteur est un risque. Chaque mise à jour peut casser la chaîne.

Cette dette se paie chaque jour : en capacité de soin perdue, en incidents de sécurité, en surcoûts de maintenance, en incapacité à évoluer.
```

---

## Bloc 3 — Solution (hospital-owned software + plateforme + modules)

```
La solution n'est pas un nouvel outil. C'est un changement de modèle.

Hospital-Owned Software : votre hôpital possède un socle logiciel interne — identité, droits, audit, intégration, observabilité — sur lequel se branchent des modules métier interopérables.

Le DPI reste en place. On l'encadre, on ne le refait pas. Les outils satellites disparaissent un par un, remplacés par des modules intégrés au socle. La surface d'attaque diminue. Les coûts récurrents baissent. Les équipes retrouvent du temps clinique.

Deux modules urgences à ROI immédiat : récap parcours patient par rôle et traçabilité temps réel. Déployables en 10 semaines. Mesurables dès le premier mois.
```

---

## Bloc 4 — Pourquoi maintenant

```
Le statu quo coûte plus cher que le changement.

Les cyberattaques contre les hôpitaux se multiplient. Les coûts éditeurs augmentent sans corrélation avec la valeur. Les soignants quittent des services où la friction logicielle rend le travail insupportable. Les ARS demandent des indicateurs que vos systèmes fragmentés ne peuvent pas produire.

Chaque mois de statu quo est un mois de dette supplémentaire. Le pilote de 10 semaines ne demande pas un acte de foi : il demande un test mesuré, cadré, réversible.
```

---

## Bloc 5 — Ce que vous gagnez

```
Contrôle. Vous décidez des priorités d'évolution de votre SI, pas un éditeur.

Temps clinique. Vos équipes urgences récupèrent 30 à 50 % du temps aujourd'hui perdu en friction logicielle.

Résilience. Moins d'applications exposées, moins de surface d'attaque, moins de dépendance à un fournisseur unique.

Interopérabilité. Des standards ouverts (FHIR, HL7v2) au lieu d'interfaces propriétaires fragiles.

Traçabilité. Chaque action horodatée, attribuée, auditable. Couverture médico-légale renforcée.

Économies structurelles. Les outils satellites remplacés par des modules intégrés coûtent moins cher à maintenir, à sécuriser, à faire évoluer.
```

---

## Bloc 6 — Sécurité & contrôle

```
La sécurité n'est pas une option. C'est l'architecture.

Authentification forte. Droits par rôle vérifiés côté serveur. Audit log immuable sur chaque action. Chiffrement en transit et au repos. Séparation des environnements. Alerting sur comportements suspects.

Le socle réduit la surface d'attaque en réduisant le nombre d'applications exposées. Chaque échange avec le DPI passe par un bus d'intégration documenté, testé, surveillé.

Pas de comptes génériques. Pas de données en clair. Pas de zone d'ombre.
```

---

## Bloc 7 — Pilote

```
10 semaines pour prouver le modèle.

Périmètre : service des urgences. Deux modules : récap parcours patient et traçabilité temps réel. Intégration lecture seule avec votre DPI existant.

Semaine 1-2 : audit et mesure de l'état initial. Semaine 3-5 : déploiement socle et modules. Semaine 6-8 : formation et lancement terrain. Semaine 9-10 : mesure et rapport.

Critères de succès définis avant le lancement. ROI mesuré avec vos chiffres, pas les nôtres. Si les résultats sont là, vous décidez de la suite. Si non, vous arrêtez.
```

---

## Bloc 8 — Vision long terme / consortium

```
Un hôpital valide le modèle. Un GHT le mutualise. Un territoire le standardise.

Le socle UrgenceOS est conçu pour être partagé entre établissements d'un même GHT. Même infrastructure, données isolées, modules communs, coûts divisés.

Phase 1 : un établissement pilote prouve le ROI. Phase 2 : trois établissements mutualisent le socle. Phase 3 : le GHT standardise ses flux et divise ses coûts.

L'objectif : que l'hôpital public reprenne le contrôle collectif sur son système d'information, service par service, établissement par établissement.
```

---
---

# LIVRABLE 13 — BACKLOG PRODUIT PRÊT GITHUB

## Priorité 1 — Socle plateforme (fondations)

- **[SOCLE-001] Refonte authentification serveur** — Remplacer le stockage de rôle côté client (sessionStorage) par une vérification systématique côté serveur via Supabase RLS et JWT. Priorité : critique.
  - Critère d'acceptation : aucune élévation de privilège possible par manipulation côté client
  - Estimation : 3-5 jours

- **[SOCLE-002] RBAC complet côté serveur** — Implémenter les Row-Level Security policies sur toutes les tables sensibles. Matrice de droits documentée. Tests automatisés par rôle.
  - Critère d'acceptation : chaque rôle ne peut accéder qu'aux données autorisées, vérifié par tests
  - Estimation : 5-8 jours

- **[SOCLE-003] Audit log immuable** — Créer un système de journalisation append-only pour toutes les actions critiques (consultation, modification, suppression, export). Champs : horodatage, utilisateur, rôle, action, ressource, IP, résultat.
  - Critère d'acceptation : impossible de supprimer ou modifier un log, même en tant qu'admin
  - Estimation : 3-5 jours

- **[SOCLE-004] API interne documentée** — Documenter tous les endpoints existants au format OpenAPI. Ajouter l'authentification par token sur chaque appel. Versionner l'API.
  - Critère d'acceptation : documentation Swagger accessible, tous les endpoints authentifiés
  - Estimation : 5-8 jours

- **[SOCLE-005] Bus d'intégration FHIR/HL7v2** — Consolider les adaptateurs FHIR et HL7v2 existants en un bus d'intégration centralisé. File d'attente pour les messages. Monitoring des flux. Journalisation des échanges.
  - Critère d'acceptation : les échanges DPI/LIS passent par le bus, sont journalisés, et les ruptures sont détectées
  - Estimation : 8-12 jours

- **[SOCLE-006] Observabilité** — Mettre en place les métriques techniques (temps de réponse, taux d'erreur, disponibilité) et métier (temps d'attente, patients en cours, alertes actives). Alerting configurable.
  - Critère d'acceptation : tableau de bord opérationnel fonctionnel avec alertes testées
  - Estimation : 5-8 jours

- **[SOCLE-007] Fermeture inscription ouverte** — Désactiver l'inscription publique. Seuls les administrateurs peuvent créer des comptes. Validation de domaine email.
  - Critère d'acceptation : impossible de créer un compte sans être administrateur
  - Estimation : 1-2 jours

- **[SOCLE-008] Suppression .env du dépôt** — Retirer le fichier .env du contrôle de version. Ajouter au .gitignore. Documenter la gestion des secrets.
  - Critère d'acceptation : aucun secret dans le dépôt git, .env dans .gitignore
  - Estimation : 0.5 jour

---

## Priorité 2 — Module récap parcours patient

- **[RECAP-001] Bandeau patient persistant** — Identité vérifiée, allergies, CIMU, motif, zone, médecin/IDE assignés. Toujours visible en haut de l'écran patient.
  - Critère d'acceptation : les informations critiques sont visibles sans scroll, allergies en rouge si critiques
  - Estimation : 2-3 jours

- **[RECAP-002] Timeline unifiée horodatée** — Fusionner tous les événements patient (admission, triage, prescriptions, actes, résultats, appels, transmissions) dans une timeline unique, ordonnée chronologiquement, avec auteur et type.
  - Critère d'acceptation : aucun événement significatif manquant, ordre chronologique vérifié
  - Estimation : 5-8 jours

- **[RECAP-003] Filtrage par rôle** — Adapter le contenu affiché au rôle connecté. Médecin : vue complète. IDE : prescriptions/actes/constantes. AS : constantes/soins. Secrétaire : identité/documents.
  - Critère d'acceptation : tests automatisés vérifiant le filtrage pour chaque rôle
  - Estimation : 3-5 jours

- **[RECAP-004] Alertes labo intégrées** — Afficher les résultats critiques dans la timeline et dans un panneau latéral d'alertes. Valeur, seuil, horodatage.
  - Critère d'acceptation : un résultat critique est visible en moins de 3 secondes après réception
  - Estimation : 2-3 jours

- **[RECAP-005] Statut prescriptions** — Afficher le statut de chaque prescription (prescrit / en cours / réalisé / résultat dispo) dans la timeline.
  - Critère d'acceptation : le statut est mis à jour en temps réel, sans rechargement
  - Estimation : 2-3 jours

- **[RECAP-006] Synthèse de sortie pré-remplie** — Générer une synthèse de sortie à partir des données structurées de la timeline. Modifiable par le médecin avant validation.
  - Critère d'acceptation : la synthèse contient les éléments clés du séjour, est modifiable, et ne contient aucune donnée inventée
  - Estimation : 3-5 jours

- **[RECAP-007] Mode hors connexion** — Cache local des données patient déjà chargées. Indicateur visuel de mode offline. Synchronisation au retour de la connexion.
  - Critère d'acceptation : les données déjà chargées restent consultables en mode offline
  - Estimation : 3-5 jours

---

## Priorité 3 — Module traçabilité temps réel

- **[TRACE-001] Journal d'événements par patient** — Chaque action génère automatiquement une entrée horodatée avec auteur, type, contenu. Append-only.
  - Critère d'acceptation : 100 % des actions système génèrent une entrée, délai < 3 secondes
  - Estimation : 3-5 jours

- **[TRACE-002] Suivi des tâches par acteur** — Assignation, statut (à faire / en cours / fait / en retard / escaladé), délais, historique.
  - Critère d'acceptation : chaque tâche a un propriétaire, un statut, un horodatage de chaque transition
  - Estimation : 5-8 jours

- **[TRACE-003] Traçabilité des appels** — Enregistrement des appels labo, imagerie, spécialistes : heure d'appel, interlocuteur, réponse, heure de réponse.
  - Critère d'acceptation : un appel non répondu après X minutes génère une alerte
  - Estimation : 3-5 jours

- **[TRACE-004] Notifications structurées** — Résultat labo disponible, prescription à administrer, tâche en retard. Routées vers le bon professionnel selon le contexte.
  - Critère d'acceptation : la notification arrive au bon destinataire en moins de 5 secondes
  - Estimation : 3-5 jours

- **[TRACE-005] Mécanisme d'escalade** — Tâche bloquée → remontée N+1 avec horodatage, motif, et traçabilité de bout en bout.
  - Critère d'acceptation : l'escalade est traçable de la demande à la résolution
  - Estimation : 2-3 jours

- **[TRACE-006] Dashboard service temps réel** — Nombre de patients, temps d'attente moyen, tâches en retard, alertes actives. Mis à jour en continu.
  - Critère d'acceptation : les données sont rafraîchies sans rechargement, latence < 5 secondes
  - Estimation : 3-5 jours

---

## Priorité 4 — UX/UI wedge

- **[UX-001] Écran iconique "Freebox"** — Implémenter l'écran décrit au livrable 4 avec les 5 zones (bandeau, timeline, alertes, tâches, synthèse rôle).
  - Critère d'acceptation : un médecin reconstitue le parcours complet d'un patient en < 10 secondes
  - Estimation : 8-12 jours

- **[UX-002] Design responsive urgences** — Optimisation pour écrans de poste de soins (grands écrans), tablettes, et consultation rapide mobile. Zones tactiles 44px minimum.
  - Critère d'acceptation : utilisable sur les 3 formats sans perte de fonctionnalité critique
  - Estimation : 5-8 jours

- **[UX-003] Couleurs médicales sémantiques** — Audit et standardisation de la palette. Rouge = critique uniquement. Pas de rouge pour des éléments non critiques.
  - Critère d'acceptation : aucune utilisation du rouge pour un élément non critique
  - Estimation : 2-3 jours

- **[UX-004] Performance chargement** — Temps de chargement < 2 secondes pour l'écran patient dans 95 % des cas. Optimisation des requêtes, lazy loading, cache.
  - Critère d'acceptation : mesure automatisée sur un échantillon de 100 chargements
  - Estimation : 3-5 jours

---

## Priorité 5 — Sécurité

- **[SECU-001] Test d'intrusion** — Réaliser un pentest sur l'application et l'infrastructure avant tout déploiement pilote.
  - Critère d'acceptation : rapport de pentest avec zéro vulnérabilité critique non corrigée
  - Estimation : prestation externe, 5-10 jours

- **[SECU-002] Scan de dépendances** — Mettre en place un scan automatique des CVE sur les dépendances npm. Bloquer le déploiement si CVE critique non résolue.
  - Critère d'acceptation : pipeline CI bloquant sur CVE critique
  - Estimation : 1-2 jours

- **[SECU-003] Headers de sécurité HTTP** — Configurer CSP, HSTS, X-Frame-Options, X-Content-Type-Options sur toutes les réponses.
  - Critère d'acceptation : score A+ sur un outil d'analyse de headers
  - Estimation : 1 jour

- **[SECU-004] Rate limiting API** — Protéger tous les endpoints contre les abus (brute force, scraping).
  - Critère d'acceptation : les tentatives excessives sont bloquées et journalisées
  - Estimation : 1-2 jours

---

## Priorité 6 — Tests

- **[TEST-001] Tests unitaires socle** — Couverture > 80 % sur les services critiques (auth, RBAC, audit, intégration).
  - Estimation : 5-8 jours

- **[TEST-002] Tests d'intégration connecteurs** — Tests automatisés sur les connecteurs FHIR et HL7v2 avec données de test réalistes.
  - Estimation : 3-5 jours

- **[TEST-003] Tests E2E parcours critiques** — Scénarios automatisés : admission → triage → prescription → résultat → sortie, par rôle.
  - Estimation : 5-8 jours

- **[TEST-004] Tests de charge** — Simuler 50 utilisateurs simultanés avec 200 patients en cours. Vérifier la tenue en performance.
  - Estimation : 2-3 jours

---

## Priorité 7 — Documentation

- **[DOC-001] Documentation API (OpenAPI)** — Swagger complet de tous les endpoints.
  - Estimation : 3-5 jours

- **[DOC-002] Guide de déploiement** — Procédure pas à pas pour installer le socle + modules sur une infrastructure HDS.
  - Estimation : 2-3 jours

- **[DOC-003] Matrice RBAC** — Document de référence des droits par rôle, maintenu à jour.
  - Estimation : 1 jour

- **[DOC-004] Procédure de réponse aux incidents** — Document opérationnel pour le DSI.
  - Estimation : 1-2 jours

---

## Priorité 8 — Intégrations

- **[INTEG-001] Connecteur DPI générique FHIR R4** — Lecture des données patient (identité, antécédents, allergies, traitements) depuis un DPI compatible FHIR.
  - Estimation : 5-8 jours

- **[INTEG-002] Connecteur LIS HL7v2** — Réception des résultats biologiques, détection valeurs critiques, routage alertes.
  - Estimation : 3-5 jours

- **[INTEG-003] Connecteur PACS notification** — Réception des notifications de disponibilité d'examen, lien contextuel vers le viewer.
  - Estimation : 2-3 jours

- **[INTEG-004] Export RPU ATIH** — Export des données RPU au format réglementaire (XML/CSV).
  - Estimation : 2-3 jours

---

## Priorité 9 — Métriques ROI

- **[KPI-001] Dashboard ROI pilote** — Tableau de bord affichant les métriques avant/après : temps de friction, ressaisies, adoption, incidents, escalades.
  - Estimation : 3-5 jours

- **[KPI-002] Chronométrage intégré** — Outil de mesure du temps passé par action (optionnel, activable pour les phases de mesure).
  - Estimation : 2-3 jours

- **[KPI-003] Export rapport DG/DAF** — Génération automatique du rapport de ROI à partir des métriques collectées.
  - Estimation : 3-5 jours

---
---

# LIVRABLE 14 — 10 PHRASES "FREE VS ORANGE" PRÊTES À ÊTRE UTILISÉES EN COMMUNICATION

**1.** "Votre SI hospitalier vous coûte de plus en plus cher pour faire de moins en moins bien. UrgenceOS inverse la courbe : un socle que vous possédez, des modules qui remboursent leur investissement en semaines."

**2.** "Un médecin urgentiste ouvre 5 écrans pour reconstituer le parcours d'un patient. Avec UrgenceOS, il en ouvre un seul. Les 4 autres, c'est du temps clinique rendu au patient."

**3.** "Chaque interface artisanale entre deux logiciels est une faille de sécurité qui attend son jour. Le socle UrgenceOS réduit la surface d'attaque en réduisant le nombre de composants exposés."

**4.** "Vous ne contrôlez pas votre SI : vos éditeurs le contrôlent. Hospital-Owned Software signifie que vous reprenez la main sur les priorités, les coûts et les données."

**5.** "La question n'est pas 'combien coûte UrgenceOS'. La question est 'combien vous coûte chaque mois de statu quo' — en temps perdu, en incidents, en dépendance, en risque."

**6.** "Free n'a pas construit un meilleur réseau télécom. Free a proposé un meilleur modèle. UrgenceOS ne construit pas un meilleur DPI. UrgenceOS propose un meilleur modèle de SI hospitalier."

**7.** "45 à 90 minutes par poste en friction logicielle. Multipliez par le nombre de postes. Multipliez par 365 jours. C'est la capacité de soin que votre SI vous fait perdre chaque année."

**8.** "Nous ne vendons pas un logiciel. Nous accompagnons l'hôpital à devenir autonome. Le jour où vous n'avez plus besoin de nous, c'est que nous avons réussi."

**9.** "Un seul établissement valide le modèle. Trois établissements mutualisent le socle. Le GHT standardise ses flux et divise ses coûts. C'est la stratégie : prouver petit, scaler vite."

**10.** "Le prochain incident cyber sur un hôpital français n'est pas une question de 'si', mais de 'quand'. La seule question qui compte : votre SI sera-t-il en état de résister et de se rétablir ?"

---
---

# ANNEXE — GLOSSAIRE

- **DPI** : Dossier Patient Informatisé — le système central de gestion du dossier patient dans un établissement
- **FHIR R4** : Fast Healthcare Interoperability Resources, version 4 — standard international d'échange de données de santé
- **HL7v2** : Health Level 7 version 2 — standard historique de messagerie inter-applicative en santé
- **HPRIM** : standard français d'échange de résultats de biologie
- **GHT** : Groupement Hospitalier de Territoire — regroupement d'établissements publics de santé
- **ARS** : Agence Régionale de Santé
- **RBAC** : Role-Based Access Control — contrôle d'accès basé sur les rôles
- **INS** : Identité Nationale de Santé — identifiant unique du patient dans le système de santé français
- **DMP** : Dossier Médical Partagé — dossier patient national
- **MSSanté** : Messagerie Sécurisée de Santé — système de messagerie sécurisé pour les professionnels de santé
- **RPU** : Résumé de Passage aux Urgences — données réglementaires transmises à l'ATIH
- **ATIH** : Agence Technique de l'Information sur l'Hospitalisation
- **LIS** : Laboratory Information System — système d'information du laboratoire
- **PACS** : Picture Archiving and Communication System — système de gestion des images médicales
- **HDS** : Hébergement de Données de Santé — certification française pour l'hébergement de données de santé
- **TCO** : Total Cost of Ownership — coût total de possession
- **MCO** : Maintien en Conditions Opérationnelles
- **IOA** : Infirmier Organisateur de l'Accueil — infirmier de triage aux urgences
- **IDE** : Infirmier Diplômé d'État
- **AS** : Aide-Soignant
- **CIMU** : Classification Infirmière des Malades aux Urgences — échelle de triage française
- **NEWS** : National Early Warning Score — score d'alerte précoce
- **qSOFA** : quick Sequential Organ Failure Assessment — score de dépistage du sepsis
- **DAR** : Données, Actions, Résultats — modèle de transmission infirmière structurée
- **NPS** : Net Promoter Score — indicateur de satisfaction
- **SLA** : Service Level Agreement — accord de niveau de service
- **WAF** : Web Application Firewall
- **SIEM** : Security Information and Event Management
- **CVE** : Common Vulnerabilities and Exposures — base de vulnérabilités connues
- **SSO** : Single Sign-On — authentification unique
