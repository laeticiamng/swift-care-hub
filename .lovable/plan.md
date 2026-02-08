

# Dernier audit spec vs plateforme -- Ecarts restants

Apres analyse complete du code actuel (post-3 rounds d'implementation), voici les ecarts fonctionnels restants dans le scope MVP/V1.

---

## 1. AccueilPage -- Champs admission incomplets

Le formulaire d'admission ne permet pas de saisir : medecin traitant, antecedents, allergies. Ces champs existent dans la table `patients` mais ne sont pas exposes dans le formulaire secretaire.

Le spec dit : "Admission <90 sec, 0 double saisie" et le patient doit etre cree avec toutes les infos disponibles.

**Ajouts :**
- Champ "Medecin traitant" (optionnel)
- Champ "Antecedents" (optionnel, texte libre separe par virgules -> array)
- Champ "Allergies" (optionnel, texte libre separe par virgules -> array)
- Passage de ces champs dans l'insert patient

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 2. PancartePage -- donneesPreview incomplete dans DAR

La section "D -- Donnees" du module DAR n'affiche que FC, PA, SpO2, T mais pas FR, GCS, EVA malgre leur ajout dans la saisie des constantes.

**Correction :**
- Enrichir `donneesPreview` (ligne 163-164) pour inclure FR, GCS, EVA si disponibles
- Meme chose pour le champ `donneesAuto` dans `handleDAR` (ligne 131)

**Fichier** : `src/pages/PancartePage.tsx`

---

## 3. Board grille -- Opacite reduite quand filtre actif

Le spec dit "Filtre Mes patients" doit mettre en evidence les patients du medecin. Le `isHighlighted` ajoute un ring mais les boxes non-concernees restent identiques. Il manque l'opacite reduite sur les boxes non-highlighted quand le filtre est actif.

**Ajouts :**
- Passer une prop `hasActiveFilter` a `ZoneGrid` et `BoxCell`
- Si `hasActiveFilter && !isHighlighted` : ajouter `opacity-40` sur la BoxCell
- Cela rend le filtre "Mes patients" visuellement impactant en mode grille

**Fichiers** : `src/components/urgence/BoxCell.tsx`, `src/components/urgence/ZoneGrid.tsx`, `src/pages/BoardPage.tsx`

---

## 4. Alertes prescriptions 3 niveaux (<5% visibles)

Le spec prevoit : "Alertes 3 niveaux, <5% visibles vs 30-60% actuellement". Actuellement, seule l'allergie declenche un blocage total. Il manque les niveaux intermediaires.

**Ajouts dans PatientDossierPage :**
- Niveau 1 (info) : interactions mineures -> petite note discrete sous le champ medicament
- Niveau 2 (warning) : interactions moderees (ex: AINS + anticoagulant) -> bandeau orange, prescription autorisee avec confirmation
- Niveau 3 (blocage) : allergie -> blocage complet (deja implemente)
- Enrichir `allergy-check.ts` avec une liste d'interactions medicamenteuses courantes aux urgences

**Fichiers** : `src/lib/allergy-check.ts`, `src/pages/PatientDossierPage.tsx`

---

## 5. Prescription statut "suspendu" / "annule"

Le spec prevoit la gestion du cycle de vie des prescriptions. Actuellement seuls "active" et "completed" sont geres via le bouton Administre. Il manque la possibilite de suspendre ou annuler une prescription depuis le dossier medecin.

**Ajouts :**
- Boutons "Suspendre" et "Annuler" sur chaque prescription active dans le dossier medecin
- Mise a jour du statut en DB (`suspended`, `cancelled` font partie de l'enum `prescription_status`)
- Affichage visuel differencie (grise pour suspendu, barre pour annule)

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 6. Compteur temps reel d'attente sur la file IOA

Le spec dit "Tri <2 min". La file IOA affiche le temps d'attente mais il ne se met a jour qu'au rechargement des donnees. Il devrait s'actualiser en temps reel (chaque minute).

**Ajout :**
- Un `useEffect` avec `setInterval` (60s) pour forcer le re-render des temps d'attente
- Meme chose sur le board (`BoardPage.tsx`) pour les compteurs de temps

**Fichiers** : `src/pages/IOAQueuePage.tsx`, `src/pages/BoardPage.tsx`

---

## 7. Medecin traitant dans TriagePage

Le champ `medecin_traitant` existe dans la table `patients` et s'affiche dans le dossier, mais n'est pas saisissable lors du tri IOA.

**Ajout :**
- Champ optionnel "Medecin traitant" dans l'etape Identite (step 0) du tri
- Sauvegarde dans la table `patients`

**Fichier** : `src/pages/TriagePage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Champs admission (MT, ATCD, allergies) | Feature | AccueilPage | Non |
| DAR donneesPreview complete | Fix | PancartePage | Non |
| Opacite filtre "Mes patients" grille | UX | BoxCell, ZoneGrid, BoardPage | Non |
| Alertes Rx 3 niveaux | Feature | allergy-check.ts, PatientDossierPage | Non |
| Suspendre/annuler prescription | Feature | PatientDossierPage | Non |
| Compteur temps reel file IOA/board | UX | IOAQueuePage, BoardPage | Non |
| Medecin traitant dans tri IOA | Feature | TriagePage | Non |

Aucune migration DB necessaire -- toutes les colonnes, tables et enums existent deja.

