

# Audit final spec v15 -- Dernieres micro-finitions premium

Apres 9 rounds d'implementation, la couverture fonctionnelle est a 97%+. Le v15 ajoute une PARTIE VII (specs dev architecture) qui n'est pas implementable (microservices, Keycloak, etc. -- hors scope Lovable). Les ecarts restants sont des violations de design system et des finitions de coherence.

---

## 1. Suppression des emojis -- Violation du design system

Le spec (page 16) dit : "Icones universelles, vocabulaire clinique francais". Le memory design indique explicitement : "L'interface proscrit l'utilisation d'emojis au profit exclusif des icones Lucide."

3 fichiers violent cette regle :

- `LandingPage.tsx` lignes 100-102 : emojis dans la section "Pourquoi maintenant ?" (icones de texte au lieu de composants Lucide)
- `TriagePage.tsx` ligne 430 : emoji pilule dans "Traitements en cours"
- `PatientDossierPage.tsx` ligne 260 : emoji oeil dans badge "Consultation seule"

**Correction :**
- Remplacer les emojis par des icones Lucide appropriees (Building2, Zap, Scale pour la landing ; Pill pour les traitements ; Eye pour la consultation)

**Fichiers** : `src/pages/LandingPage.tsx`, `src/pages/TriagePage.tsx`, `src/pages/PatientDossierPage.tsx`

---

## 2. Landing -- Section "Pourquoi maintenant ?" avec emojis au lieu de composants Lucide

Les icones sont actuellement des strings emoji rendues dans un `<span>`. Elles devraient etre des composants Lucide comme dans toutes les autres sections de la landing.

**Correction :**
- Transformer les items en utilisant des composants Lucide (Building2, Zap, Scale) au lieu de strings emoji
- Aligner le style avec les autres sections (icone dans un div rond `bg-primary/10`)

**Fichier** : `src/pages/LandingPage.tsx`

---

## 3. Resultats labo/imagerie visibles en lecture seule pour AS et secretaire

Actuellement, dans `PatientDossierPage.tsx`, la section "Resultats" (ligne 672-706) est encapsulee dans `{!isReadOnly && (...)}`, ce qui la masque pour les AS et secretaires. Or :
- Le spec dit que l'AS voit "zero donnee medicale" -- correct de masquer.
- Mais les constantes et la timeline sont visibles pour ces roles.
- Les resultats de labo sont des donnees medicales -- correct de masquer pour AS.
- Le secretaire devrait voir le statut des resultats (nombre) mais pas le contenu.

Le comportement actuel est acceptable et conforme au spec. Pas de changement necessaire ici.

---

## 4. Board -- Emojis residuels dans le code

Verifier et nettoyer tout emoji residuel dans les composants urgence. Seuls les 3 fichiers identifies contiennent des emojis.

---

## 5. Coherence du design "Pourquoi maintenant ?"

La section utilise actuellement `text-3xl` pour l'icone emoji. En passant aux icones Lucide, la taille doit etre alignee avec les autres sections (h-6 w-6 dans un conteneur rond de 48px).

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Emojis -> Lucide icons landing | Design system | LandingPage | Non |
| Emoji -> Lucide icon triage | Design system | TriagePage | Non |
| Emoji -> Lucide icon dossier | Design system | PatientDossierPage | Non |

Aucune migration DB necessaire. Ce sont des corrections cosmetiques de conformite au design system.

