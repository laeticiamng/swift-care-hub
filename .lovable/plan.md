

# Audit complet et amelioration ergonomique de toutes les pages

## Objectif
Ameliorer l'ergonomie de chaque page non technique avec un design premium et minimaliste. Le board permettra de selectionner une seule zone (SAU, UHCD, Dechocage) au lieu d'afficher les 3 colonnes simultanement. Les prescriptions respecteront les 4 categories : Soins, Examens complementaires (Bilan), Imagerie, Traitements.

---

## 1. BoardPage -- Selection de zone unique (priorite haute)

**Probleme actuel** : En mode grille, les 3 zones sont affichees empilees verticalement, ce qui oblige a scroller. L'utilisateur veut pouvoir selectionner une zone specifique tout en gardant la vue d'ensemble.

**Solution** :
- Ajouter des boutons de filtre de zone cliquables dans le header (SAU, UHCD, Dechocage, Tous)
- Par defaut : "Tous" affiche les 3 zones empilees (comportement actuel)
- Cliquer sur une zone filtre la grille pour n'afficher que cette zone
- Chaque bouton de zone affiche son compteur (ex: "SAU 7/17")
- Le bouton actif a un style `bg-primary text-primary-foreground`
- Etat persiste dans localStorage (`urgenceos_selectedZone`)
- Le WaitingBanner reste toujours visible quel que soit le filtre
- Ajout d'animations staggerees sur les BoxCells a l'entree

**Fichier** : `src/pages/BoardPage.tsx`

---

## 2. PatientDossierPage -- Ergonomie prescription + antecedents

**Etat actuel** : Les 4 categories de prescriptions sont presentes (Traitements, Soins, Examens Bio, Imagerie) via `prescription-utils.tsx`. Les antecedents sont en haut de la colonne droite. Le dialog de prescription (visible dans le screenshot utilisateur) fonctionne.

**Ameliorations** :
- Ajouter un compteur par categorie dans un mini-resume en haut de la section prescriptions (deja present mais peut etre ameliore visuellement)
- Uniformiser les bordures laterales colorees sur les resultats critiques (border-l-4)
- Ajouter une animation d'entree staggeree sur les cartes de resultats
- Confirmer les 4 categories dans le code : Traitements (Pill), Soins (HeartPulse), Examens Bio (FlaskConical), Imagerie (ScanLine)
- Ameliorer le contraste du dialog de prescription (fond opaque, z-index)

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 3. PancartePage -- Ergonomie IDE amelioree

**Etat actuel** : Resume rapide en haut (Rx actives, Actes, Resultats). 4 categories de prescriptions presentes. DAR avec cards separees D/A/R.

**Ameliorations** :
- Renforcer visuellement le resume rapide avec des couleurs plus distinctes
- Ameliorer les animations staggerees (actuellement presentes mais timing a affiner)
- Ajouter un indicateur visuel quand une prescription est urgente/STAT (pulse subtil)

**Fichier** : `src/pages/PancartePage.tsx`

---

## 4. LoginPage -- Finitions premium

**Etat actuel** : Split layout desktop, animation pulse sur icone, comptes demo, gradient background.

**Ameliorations** :
- Ameliorer l'espacement de la zone de comptes demo (padding plus genereux)
- Ajouter une transition douce entre les modes connexion/inscription (slide animation)
- Renforcer le hover des boutons de comptes demo

**Fichier** : `src/pages/LoginPage.tsx`

---

## 5. RoleSelector -- Finitions

**Etat actuel** : Bien construit avec animations staggerees, gradient background, design premium.

**Ameliorations mineures** :
- Ajouter un effet hover plus prononce avec scale et shadow (actuellement `hover:scale-[1.03]`, passer a `hover:scale-[1.05] hover:shadow-xl`)
- Ameliorer l'espacement sur mobile (gap plus grand)

**Fichier** : `src/pages/RoleSelector.tsx`

---

## 6. TriagePage -- Coherence visuelle

**Etat actuel** : Stepper avec progress bar et points colores, BoxSelector visuel pour l'orientation.

**Ameliorations** :
- Ameliorer les zones tactiles des boutons de motif SFMU (deja `touch-target`, verifier taille minimum 44px)
- Ajouter des animations de transition entre les etapes (slide-in)
- Ameliorer le stepper header avec un meilleur contraste

**Fichier** : `src/pages/TriagePage.tsx`

---

## 7. IOAQueuePage -- Amelioration de la lisibilite

**Etat actuel** : StatCards en haut, cards avec bordure coloree par temps d'attente, heure d'arrivee visible.

**Ameliorations** :
- Renforcer le contraste des indicateurs d'attente (couleurs plus saturees)
- Ajouter un fond gradient coherent avec les autres pages
- Ameliorer l'animation vide (file d'attente vide)

**Fichier** : `src/pages/IOAQueuePage.tsx`

---

## 8. AccueilPage -- Coherence design

**Etat actuel** : Gradient de fond subtil, StatCards, animations staggerees sur la liste.

**Ameliorations** :
- Ameliorer le formulaire avec des labels plus visibles et un espacement coherent
- Renforcer les animations staggerees sur les admissions du jour
- Ajouter un hover sur les cards d'admission pour un retour visuel

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 9. AideSoignantPage -- Ergonomie tactile

**Etat actuel** : Bien adapte au mobile avec BigButtons, gradient de fond, animations.

**Ameliorations** :
- Ameliorer le retour visuel sur la selection de patient (animation plus visible)
- Ajouter une transition entre les vues plus fluide
- Renforcer la taille des zones de saisie de constantes

**Fichier** : `src/pages/AideSoignantPage.tsx`

---

## 10. LandingPage -- Pas de changement

La landing est bien structuree. Aucune modification prevue.

---

## Resume technique

| Page | Changement principal | Impact |
|------|---------------------|--------|
| BoardPage | Filtres de zone cliquables (SAU/UHCD/Dechocage/Tous) | Ergonomie majeure |
| PatientDossierPage | Polish prescriptions + resultats | Lisibilite |
| PancartePage | Polish resume + STAT pulse | Workflow IDE |
| LoginPage | Espacement demo, transitions | Polish |
| RoleSelector | Hover ameliore | Polish |
| TriagePage | Transitions etapes | UX |
| IOAQueuePage | Gradient, contraste | Coherence |
| AccueilPage | Labels, hover admissions | Coherence |
| AideSoignantPage | Transitions, taille saisie | Coherence |

Tous les changements respectent : icones Lucide uniquement (pas d'emoji), zones tactiles 44px minimum, code couleur semantique medical, animations staggerees, et les 4 categories de prescriptions (Soins, Examens Bio, Imagerie, Traitements).

