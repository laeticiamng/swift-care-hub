

# Audit complet et amelioration ergonomique de toutes les pages

## Objectif
Ameliorer l'ergonomie de chaque page non technique avec un design premium et minimaliste. Le board permettra de selectionner une seule zone (SAU, UHCD, Dechocage) au lieu d'afficher les 3 colonnes simultanement. Les prescriptions respecteront les 4 categories : Soins, Examens complementaires (Bilan), Imagerie, Traitements.

---

## 1. BoardPage — Selection de zone unique (priorite haute)

**Probleme actuel** : Sur desktop, les 3 zones sont affichees en colonnes simultanement. L'utilisateur souhaite pouvoir selectionner une seule zone a la fois, comme sur mobile avec les onglets.

**Solution** :
- Remplacer la grille 3 colonnes desktop par un systeme d'onglets universel (mobile + desktop)
- Ajouter une option "Tous" pour voir l'ensemble si besoin
- Chaque onglet affiche le compteur de patients
- Les StatCards en header affichent les compteurs de chaque zone pour garder la vue d'ensemble
- Ajouter des animations d'entree staggerees sur les cards patients
- Ajouter un indicateur visuel du filtre actif avec effet glassmorphism sur le header

**Fichier** : `src/pages/BoardPage.tsx`

---

## 2. PatientDossierPage — Ergonomie prescription + antecedents

**Probleme actuel** : Les categories de prescriptions sont presentes mais les antecedents pourraient etre mieux integres dans le layout global.

**Ameliorations** :
- Deplacer le bloc antecedents/allergies groupes en haut de la colonne droite (au-dessus des constantes) pour une visibilite immediate
- Ajouter un compteur par categorie de prescription dans un mini-resume en haut de la section prescriptions
- Uniformiser les bordures laterales colorees sur les resultats critiques
- Ajouter une animation d'entree sur les cartes de resultats
- Confirmer les 4 categories : Traitements (Pill), Soins (HeartPulse), Examens Bio (FlaskConical), Imagerie (ScanLine)

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 3. PancartePage — Ergonomie IDE amelioree

**Ameliorations** :
- Ajouter un resume rapide en haut : nombre de prescriptions actives, actes effectues, resultats non lus
- Confirmer les 4 categories de prescriptions coherentes avec le dossier medecin
- Ameliorer la section transmissions DAR avec un layout plus clair (cards separees D/A/R)
- Ajouter des animations d'entree staggerees

**Fichier** : `src/pages/PancartePage.tsx`

---

## 4. LoginPage — Finitions premium

**Ameliorations** :
- Ajouter un effet d'animation subtil sur l'icone du panneau gauche (pulse lent)
- Ameliorer l'espacement et le padding de la zone de comptes demo
- Ajouter une transition douce entre les modes connexion/inscription

**Fichier** : `src/pages/LoginPage.tsx`

---

## 5. RoleSelector — Finitions

**Etat actuel** : Deja bien construit avec animations staggerees, gradient background, et design premium.

**Ameliorations mineures** :
- Ajouter un effet hover plus prononce avec scale et shadow
- Ameliorer l'espacement sur mobile

**Fichier** : `src/pages/RoleSelector.tsx`

---

## 6. TriagePage — Coherence visuelle

**Etat actuel** : Fonctionnel avec stepper et progress bar.

**Ameliorations** :
- Ajouter un indicateur visuel plus clair du step actif (point colore au lieu de texte seul)
- Ameliorer les zones tactiles des boutons de motif SFMU
- Ajouter des animations de transition entre les etapes

**Fichier** : `src/pages/TriagePage.tsx`

---

## 7. IOAQueuePage — Amelioration de la lisibilite

**Ameliorations** :
- Ajouter une heure d'arrivee visible sur chaque card
- Animation d'entree staggeree sur les cards
- Ameliorer le contraste des indicateurs d'attente

**Fichier** : `src/pages/IOAQueuePage.tsx`

---

## 8. AccueilPage — Coherence design

**Ameliorations** :
- Ajouter des animations d'entree staggerees sur la liste des admissions du jour
- Ameliorer le formulaire avec des labels plus visibles
- Ajouter un gradient de fond subtil coherent avec les autres pages

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 9. AideSoignantPage — Ergonomie tactile

**Etat actuel** : Bien adapte au mobile avec BigButtons.

**Ameliorations** :
- Ajouter un gradient de fond coherent
- Ameliorer le retour visuel sur la selection de patient (animation)
- Animations de transition entre les vues

**Fichier** : `src/pages/AideSoignantPage.tsx`

---

## 10. LandingPage — Pas de changement majeur

La landing est deja bien structuree avec ses sections componentisees. Pas de modification prevue.

---

## Resume technique

| Page | Changement principal | Impact |
|------|---------------------|--------|
| BoardPage | Onglets au lieu de 3 colonnes, option "Tous" | Ergonomie majeure |
| PatientDossierPage | Antecedents en haut, resume prescriptions | Lisibilite |
| PancartePage | Resume rapide en haut, DAR ameliore | Workflow IDE |
| LoginPage | Animations subtiles, finitions | Polish |
| RoleSelector | Hover ameliore | Polish |
| TriagePage | Steps visuels, transitions | UX |
| IOAQueuePage | Heure arrivee, animations | Lisibilite |
| AccueilPage | Animations, gradient | Coherence |
| AideSoignantPage | Gradient, animations | Coherence |

Tous les changements respectent : icones Lucide uniquement (pas d'emoji), zones tactiles 44px minimum, code couleur semantique medical, animations staggerees, et les 4 categories de prescriptions (Soins, Examens Bio, Imagerie, Traitements).

