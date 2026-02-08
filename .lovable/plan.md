

# Audit final spec v12 -- Dernieres finitions premium

Apres 7 rounds d'implementation, la couverture fonctionnelle est excellente. Les ecarts restants sont des details de tracabilite, des protections par role et du polish marketing/landing.

---

## 1. Dossier patient -- Protection lecture seule pour AS et secretaire

Le spec dit que l'AS n'a acces a aucune donnee medicale et que le secretaire voit uniquement le statut admin. Actuellement, si un AS ou secretaire navigue vers `/patient/:encounterId` (via lien direct ou accueil cliquable), il voit les boutons "Prescrire", "Diagnostic", "Preparer sortie" -- actions qui lui sont interdites par RLS mais dont les boutons sont visibles.

**Correction :**
- Recuperer le role dans `PatientDossierPage.tsx`
- Masquer les sections prescriptions (bouton Prescrire), diagnostic, notes medicales et sortie pour les roles `as` et `secretaire`
- Afficher uniquement : bandeau patient, constantes (lecture), timeline (lecture)
- Ajouter un badge "Consultation" en haut de page pour ces roles

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 2. Administration medicamenteuse -- Champ "Lot" pour tracabilite

Le spec dit (page 17, modele FHIR) : "Medicaments : Dose, heure, voie, **lot** (tracabilite IDE)". Le champ lot est absent du formulaire d'administration sur la pancarte. C'est un element de tracabilite critique en milieu hospitalier.

**Ajouts :**
- Ajouter un champ "Lot" (optionnel, texte court) a cote du champ de titration dans la pancarte
- Enregistrer le lot dans le champ `notes` de la table `administrations` (format: `lot:XXXX`)
- Afficher le lot dans l'historique des administrations

**Fichier** : `src/pages/PancartePage.tsx`

---

## 3. Sortie -- CRH auto-genere

Le spec dit (page 13) : "CRH auto, ordonnance auto, RPU auto". Actuellement, le resume de sortie est saisi manuellement. Le systeme pourrait pre-remplir un CRH basique a partir des donnees du passage.

**Ajout :**
- Dans `DischargeDialog.tsx`, ajouter un bouton "Generer CRH" qui pre-remplit le champ resume avec les donnees du passage (motif, diagnostics, prescriptions, constantes, orientation)
- Necessite de passer les donnees du passage au dialog (motif, prescriptions, diagnostics)

**Fichiers** : `src/components/urgence/DischargeDialog.tsx`, `src/pages/PatientDossierPage.tsx`

---

## 4. Sortie -- GEMSA auto-suggestion

Le GEMSA est un codage de sortie obligatoire pour le RPU. Le champ existe dans le dialog de sortie mais sans suggestion. Le GEMSA peut etre infere de l'orientation choisie.

**Ajout :**
- Quand l'orientation change dans le `DischargeDialog`, suggerer un GEMSA :
  - Domicile -> GEMSA 1
  - Hospitalisation -> GEMSA 4
  - UHCD -> GEMSA 3
  - Transfert -> GEMSA 5
  - Deces -> GEMSA 6
  - Fugue -> GEMSA 2
- L'utilisateur peut toujours modifier manuellement

**Fichier** : `src/components/urgence/DischargeDialog.tsx`

---

## 5. Tri IOA -- Traitements en cours visibles pour patient existant

Quand l'IOA selectionne un patient existant dans le tri, les allergies et antecedents s'affichent mais pas les traitements en cours (`traitements_actuels`). Le spec dit que le patient connu = antecedents disponibles.

**Ajout :**
- Lors de la selection d'un patient existant, afficher ses traitements en cours sous les allergies/antecedents
- Fetch le champ `traitements_actuels` dans la recherche patient

**Fichier** : `src/pages/TriagePage.tsx`

---

## 6. Landing page -- Manifesto et slogans du spec

Le spec contient une section "Manifesto" (page 30) et "10 slogans" (page 32) tres travailles qui ne sont pas sur la landing page. Le hero actuel n'utilise pas le slogan principal "Moins de clics. Plus de soin." de facon assez proeminente.

**Ajouts :**
- Ajouter une section "Manifesto" entre les innovations et les metriques, avec le texte condense du manifeste spec
- Integrer 3-4 slogans cles en tant que separateurs visuels entre les sections
- Le tagline "Moins de clics. Plus de soin." est deja dans la section metriques mais pourrait etre dans le hero egalement

**Fichier** : `src/pages/LandingPage.tsx`

---

## 7. Pancarte IDE -- Historique administrations avec horodatage et lot

L'historique des administrations n'est pas visible sur la pancarte. Le spec dit que chaque administration est "tracee, horodatage auto". Les IDE doivent pouvoir verifier rapidement ce qui a ete administre et quand.

**Ajout :**
- Sous chaque prescription completee dans la pancarte, afficher la ligne d'administration : heure, dose, voie, lot (si renseigne)
- Affichage compact, visible sans action supplementaire

**Fichier** : `src/pages/PancartePage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Dossier lecture seule AS/secretaire | Securite | PatientDossierPage | Non |
| Champ lot administration | Tracabilite | PancartePage | Non |
| CRH auto-genere a la sortie | Feature | DischargeDialog, PatientDossierPage | Non |
| GEMSA auto-suggestion | UX | DischargeDialog | Non |
| Traitements en cours dans tri | Feature | TriagePage | Non |
| Manifesto + slogans landing | UX | LandingPage | Non |
| Historique admin sur pancarte | UX | PancartePage | Non |

Aucune migration DB necessaire -- le champ `notes` de la table `administrations` est deja disponible pour stocker le numero de lot.

