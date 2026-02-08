

# Ecarts restants -- Audit final spec vs plateforme (v9)

Apres comparaison exhaustive du cahier des charges (50 pages) avec le code actuel (post-4 rounds d'implementation), voici les fonctionnalites encore manquantes dans le scope MVP/V1.

---

## 1. Prescription "Suspendre" manquante

Le plan precedent a ajoute "Annuler" mais le spec prevoit aussi la possibilite de **suspendre** une prescription active (statut `suspended` present dans l'enum DB `prescription_status`). Le bouton "Suspendre" n'existe pas dans le dossier medecin.

**Ajouts :**
- Bouton "Suspendre" a cote du bouton "Annuler" sur chaque prescription active dans `PatientDossierPage.tsx`
- Mise a jour du statut en DB vers `suspended`
- Affichage visuel differencie : fond grise + badge "Suspendue" (distinct du style "annulee" qui est barre)
- Bouton "Reactiver" sur les prescriptions suspendues pour revenir a `active`
- Audit log pour chaque action

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 2. Titration inline sur pancarte IDE

Le spec dit (page 14) : "Titration : champ dose modifiable inline". Actuellement, le bouton Administre valide la dose prescrite sans possibilite de la modifier.

**Ajouts :**
- Sur chaque prescription active dans la pancarte, ajouter un petit champ texte editable a cote du bouton Administre
- Pre-rempli avec `rx.dosage`, modifiable avant administration
- La dose saisie est envoyee dans `dose_given` de la table `administrations`

**Fichier** : `src/pages/PancartePage.tsx`

---

## 3. Antecedents et allergies dans le formulaire de tri IOA (etape Identite)

Les antecedents et allergies du patient existant sont affiches en lecture seule dans le tri, mais pour un **nouveau patient**, il n'y a aucun champ pour saisir les antecedents et allergies lors du tri. Le spec dit : "Patient inconnu = 5 champs max" mais les allergies sont une info critique a saisir des le tri.

**Ajouts :**
- Champ "Allergies" (optionnel, texte libre separe par virgules) dans l'etape Identite du tri (visible uniquement si pas de patient existant selectionne)
- Champ "Antecedents" (optionnel, idem)
- Sauvegarde dans la table `patients` lors de la creation

**Fichier** : `src/pages/TriagePage.tsx`

---

## 4. Homonymes : alerte visuelle

Le spec dit (page 12, section 8.2) : "Detecte les homonymes : alerte visuelle quand 2 patients ont des traits similaires". Actuellement, la recherche patient affiche les resultats mais aucune alerte homonyme n'est presentee.

**Ajouts :**
- Dans `AccueilPage.tsx` et `TriagePage.tsx`, lors de la recherche patient : si 2+ resultats ont des noms/prenoms tres proches (distance de Levenshtein ou match partiel), afficher un bandeau d'alerte jaune "Attention : patients homonymes detectes"
- Ajouter un badge visuel distinctif sur chaque resultat homonyme potentiel

**Fichiers** : `src/pages/AccueilPage.tsx`, `src/pages/TriagePage.tsx`

---

## 5. Pancarte IDE -- Titre/dose modifiable dans le formulaire DAR "Cible"

Le spec dit (page 13) : "Transmissions DAR : auto-alimentees depuis pancarte". La cible devrait pouvoir etre selectionnee parmi des cibles courantes au lieu d'etre uniquement du texte libre.

**Ajout :**
- Ajouter des suggestions de cibles courantes (boutons rapides) : "Douleur", "Respiratoire", "Hemodynamique", "Neurologique", "Digestif", "Plaie/Pansement", "Mobilite"
- Cliquer sur un bouton pre-remplit le champ cible
- Le champ texte libre reste disponible

**Fichier** : `src/pages/PancartePage.tsx`

---

## 6. Stat cards -- Board manque le nombre total de patients par statut

Le board affiche un compteur "En attente" mais pas de vue globale du nombre de patients par statut (Arrives, Tries, En cours, Termines). Le spec dit "Board panoramique" impliquant une vue d'ensemble.

**Ajout :**
- Ligne de stat cards en haut du board : Total patients, Arrives, En cours, Termines (aujourd'hui)
- Coherent avec les stat cards deja utilisees ailleurs (AccueilPage, IOAQueuePage)

**Fichier** : `src/pages/BoardPage.tsx`

---

## 7. GCS manquant dans la saisie constantes AS

L'aide-soignant peut saisir FR (ajoute precedemment) mais pas GCS. Le spec dit que l'AS peut saisir les constantes de base. GCS est une constante de surveillance importante.

**Ajout :**
- Ajouter un champ GCS dans le formulaire constantes AS (apres FR)
- Envoi dans l'insert vitals

**Fichier** : `src/pages/AideSoignantPage.tsx`

---

## 8. Landing page -- sections spec manquantes

La landing page existe mais ne mentionne pas certains elements cles du spec comme les "7 innovations" et les metriques de succes. Ce n'est pas bloquant mais renforce le positionnement produit.

**Ajout :**
- Section "Metriques cles" (Tri < 2 min, Administration 1 tap, Admission < 90s, 0 changement de page IDE, 3 clics/Rx)
- Coherent avec les sections existantes

**Fichier** : `src/pages/LandingPage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Suspendre/reactiver prescription | Feature | PatientDossierPage | Non |
| Titration inline pancarte | Feature | PancartePage | Non |
| Allergies/ATCD saisie tri (nouveau patient) | Feature | TriagePage | Non |
| Alerte homonymes | Feature | AccueilPage, TriagePage | Non |
| Cibles DAR rapides | UX | PancartePage | Non |
| Stat cards board global | UX | BoardPage | Non |
| GCS dans constantes AS | Fix | AideSoignantPage | Non |
| Metriques landing page | UX | LandingPage | Non |

Aucune migration DB necessaire -- toutes les colonnes, tables et enums existent deja.

