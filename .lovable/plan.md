

# Ecarts restants -- Audit final spec v10 vs plateforme

Apres 5 rounds d'implementation et comparaison exhaustive du spec (50 pages) avec le code actuel, voici les fonctionnalites encore manquantes ou incompletes.

---

## 1. Board -- "Termines (24h)" affiche toujours 0

Le stat card "Termines (24h)" dans `BoardPage.tsx` ligne 215 est code en dur a `value={0}`. Il devrait compter les encounters avec `status='finished'` des dernieres 24h. Ce compteur est essentiel pour le "board panoramique" du spec.

**Correction :**
- Ajouter un fetch des encounters termines dans les dernieres 24h
- Afficher le vrai compteur dans le stat card

**Fichier** : `src/pages/BoardPage.tsx`

---

## 2. AS -- EVA douleur manquant dans le formulaire constantes

Le formulaire aide-soignant (`AideSoignantPage.tsx`) inclut FC, PA, SpO2, T, FR et GCS mais pas EVA douleur. Le spec dit "constantes de base" et EVA est une constante de surveillance frequente saisie par l'AS.

La colonne `eva_douleur` existe dans la table `vitals` et est deja present dans les formulaires IDE et IOA.

**Ajout :**
- Ajouter `eva_douleur: ''` dans le state `vitals` (ligne 37)
- Ajouter le champ EVA dans la liste des inputs (ligne 183, apres GCS)
- Ajouter `if (vitals.eva_douleur) obj.eva_douleur = parseInt(vitals.eva_douleur);` dans `handleSaveVitals`
- Reset EVA dans le state apres sauvegarde (ligne 66)

**Fichier** : `src/pages/AideSoignantPage.tsx`

---

## 3. Pancarte IDE -- Prescriptions suspendues non affichees

Sur la pancarte, seules les prescriptions `active` et `completed` sont visibles via le bouton "Administre". Les prescriptions `suspended` et `cancelled` ne sont pas distinguees visuellement -- elles ne sont pas filtrees mais n'ont aucun badge specifique.

Le dossier medecin affiche correctement les badges "Suspendue"/"Annulee" mais la pancarte IDE ne fait pas cette distinction.

**Ajout :**
- Ajouter un badge "Suspendue" (grise) sur les prescriptions suspendues dans la pancarte
- Ajouter un badge "Annulee" (barre) sur les prescriptions annulees
- Desactiver le bouton d'administration et le champ titration pour ces statuts

**Fichier** : `src/pages/PancartePage.tsx`

---

## 4. Board -- Affichage different par role (spec section 10.1)

Le spec dit : "Board partage mais affiche differemment selon role : medecin voit diagnostics + Rx, IOA voit file d'attente, IDE voit statut soins, AS voit localisation, secretaire voit statut admin."

Actuellement, le board redirige correctement les IOA vers `/ioa-queue` et les AS vers `/as`, mais quand un **secretaire** accede au board, il voit la meme interface que le medecin. Le secretaire devrait etre redirige vers `/accueil` automatiquement ou voir une vue adaptee.

La page `RoleSelector` gere deja les redirections initiales (`secretaire -> /accueil`, `as -> /as`). Mais si un secretaire ou AS navigue manuellement vers `/board`, il voit tout.

**Ajout :**
- Dans `BoardPage.tsx`, ajouter une redirection automatique si le role est `as` ou `secretaire` (vers `/as` ou `/accueil`)
- Cela garantit l'isolation des vues par profil

**Fichier** : `src/pages/BoardPage.tsx`

---

## 5. Pancarte IDE -- Transmissions : champ "Donnees" n'affiche pas le poids patient

Le spec (bandeau patient) dit : "Identite, age, **poids**, CCMU, motif, allergies, medecin. Toujours visible."

Le poids est affiche dans le bandeau (`PatientBanner`), mais les donnees auto-generees dans les transmissions DAR ne mentionnent pas le poids du patient alors qu'il pourrait etre utile cliniquement.

**Ajout leger :**
- Dans `donneesAuto` et `donneesPreview` (lignes 134-136 et 167-169), ajouter le poids du patient si disponible : `Poids ${patient.poids} kg | ...`

**Fichier** : `src/pages/PancartePage.tsx`

---

## 6. Accueil secretaire -- Liste admissions non cliquable

La liste "Admissions du jour" dans `AccueilPage.tsx` affiche les passages mais ils ne sont pas cliquables. Le secretaire devrait pouvoir naviguer vers le dossier d'un patient pour consulter son statut (en lecture seule).

**Ajout :**
- Rendre chaque carte cliquable avec navigation vers `/patient/:encounterId`
- Le dossier est deja protege par RLS (lecture seule pour secretaire)

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 7. IOA queue -- Lien vers board manquant pour contexte

Le bouton "Board" existe deja dans le header de `IOAQueuePage.tsx` (ligne 74). Cependant, il n'y a pas de compteur total de patients (tries + en cours) visible depuis la file IOA pour donner du contexte a l'IOA.

**Ajout :**
- Ajouter un stat card supplementaire "Tries/En cours" avec un count des encounters non-arrived

**Fichier** : `src/pages/IOAQueuePage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Termines (24h) compteur reel | Fix | BoardPage | Non |
| EVA douleur dans constantes AS | Fix | AideSoignantPage | Non |
| Prescriptions suspendues/annulees sur pancarte | Fix | PancartePage | Non |
| Redirection board par role (AS/secretaire) | UX | BoardPage | Non |
| Poids dans donnees DAR | UX | PancartePage | Non |
| Admissions cliquables accueil | UX | AccueilPage | Non |
| Stat "Tries/En cours" file IOA | UX | IOAQueuePage | Non |

Aucune migration DB necessaire.

