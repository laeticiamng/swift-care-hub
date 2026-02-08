

# Completions restantes pour UrgenceOS

Apres audit complet du code, de la base de donnees et des policies RLS, voici les elements encore manquants par rapport au plan initial.

---

## 1. RLS : AS ne peut pas lire les procedures

**Probleme** : La policy SELECT sur `procedures` n'autorise que `medecin` et `ide`. L'AS qui insere des procedures (surveillance, brancardage, confort) ne peut meme pas relire ses propres actes.

**Correction** : Ajouter `as` dans la policy SELECT de `procedures`.

---

## 2. RLS : AS ne peut pas mettre a jour les encounters (update zone)

**Probleme** : La policy UPDATE sur `encounters` autorise `medecin`, `ioa`, `ide` mais pas `as`. L'AS ne devrait peut-etre pas deplacer un patient, mais le plan ne l'exige pas non plus. Pas de changement necessaire ici.

---

## 3. Pas de mode sombre fonctionnel (toggle manquant)

**Probleme** : Les variables CSS dark sont definies dans index.css, mais il n'y a aucun toggle pour activer le mode sombre, et `next-themes` est installe mais pas utilise. Le header ne propose pas de switch clair/sombre.

**Correction** : Ajouter un `ThemeProvider` avec `next-themes` dans App.tsx et un bouton toggle (Sun/Moon) dans les headers du Board et des autres pages.

---

## 4. Dossier Patient : pas de notes/observations medicales

**Probleme** : Le medecin ne peut pas ajouter de notes cliniques / observations dans le dossier patient. Il n'y a pas de textarea pour ecrire un examen clinique, une hypothese diagnostique, ou un compte-rendu.

**Correction** : Ajouter une section "Notes medicales" dans PatientDossierPage avec un textarea et un bouton d'enregistrement. Stocker dans `timeline_items` avec `item_type = 'crh'` ou ajouter un nouveau type `observation`.

---

## 5. Timeline : pas d'insertion possible (timeline en lecture seule)

**Probleme** : La table `timeline_items` n'a aucune policy INSERT. Les medecins ne peuvent pas ajouter de CRH, notes, ou diagnostics dans la timeline du patient.

**Correction** : Ajouter une policy INSERT pour le role `medecin` (et eventuellement `ioa`) sur `timeline_items`.

---

## 6. Board : pas d'indication du medecin referent sur les cartes

**Probleme** : Le plan mentionne que les cartes patient sur le board doivent afficher le medecin referent. Actuellement seuls nom, age, motif, CCMU, et temps d'attente sont affiches.

**Correction** : Joindre `profiles` via `medecin_id` dans la requete du board et afficher le nom du medecin sur la carte.

---

## 7. Board : pas de filtre par zone (tous les filtres d'un coup)

**Probleme** : Le board affiche les 3 colonnes simultanement. Sur mobile, c'est difficilement lisible. Il n'y a pas de navigation par onglets pour mobile.

**Correction** : Ajouter des onglets (Tabs) sur mobile pour naviguer entre SAU/UHCD/Dechocage, tout en gardant les 3 colonnes sur desktop.

---

## 8. Pas d'audit log sur les actions critiques

**Probleme** : La table `audit_logs` existe mais n'est jamais alimentee. Aucune action (prescription, administration, sortie) n'est tracee dans l'audit.

**Correction** : Ajouter des inserts dans `audit_logs` lors des actions critiques : prescription, administration, sortie patient, modification de zone.

---

## 9. Pancarte : pas de section transmissions historique

**Probleme** : La pancarte IDE affiche le formulaire DAR mais ne montre pas l'historique des transmissions precedentes.

**Correction** : Ajouter un collapsible sous le formulaire DAR qui affiche les transmissions passees pour ce passage.

---

## 10. IOA : pas de route dediee pour la file d'attente IOA

**Probleme** : L'IOA est redirige vers `/triage` (creation) mais n'a pas de vue de la file d'attente des patients en statut `arrived` (admis par la secretaire, non encore tries).

**Correction** : Ajouter une page `/ioa-queue` ou un onglet dans le board qui filtre les patients `arrived` pour que l'IOA puisse les voir et lancer le tri.

---

## Plan d'implementation technique

### Migration SQL
1. Ajouter `as` dans la policy SELECT de `procedures`
2. Ajouter une policy INSERT sur `timeline_items` pour `medecin` et `ioa`

### Fichiers a modifier

1. **`src/App.tsx`**
   - Ajouter `ThemeProvider` de next-themes
   - Ajouter route `/ioa-queue`

2. **`src/pages/BoardPage.tsx`**
   - Joindre profiles via medecin_id, afficher nom medecin sur les cartes
   - Ajouter Tabs responsive (onglets sur mobile, colonnes sur desktop)
   - Ajouter toggle mode sombre dans le header
   - Ajouter inserts audit_logs lors de changements de zone

3. **`src/pages/PatientDossierPage.tsx`**
   - Ajouter section "Notes medicales" (textarea + bouton)
   - Ajouter insert dans timeline_items pour les notes
   - Ajouter insert audit_logs sur les prescriptions et sorties

4. **`src/pages/PancartePage.tsx`**
   - Ajouter historique des transmissions DAR (collapsible)
   - Ajouter insert audit_logs sur les administrations

5. **`src/pages/IOAQueuePage.tsx`** (nouveau)
   - Liste des patients en statut `arrived`, non tries
   - Bouton "Trier ce patient" qui passe en /triage avec pre-remplissage
   - Realtime sur encounters

6. **`src/pages/RoleSelector.tsx`**
   - Mettre a jour le redirect IOA vers `/ioa-queue`

### Ordre de priorite
1. Fix RLS (procedures SELECT pour AS + timeline INSERT pour medecin)
2. Notes medicales dans le dossier patient
3. File d'attente IOA
4. Historique transmissions dans la pancarte
5. Medecin referent sur les cartes board
6. Onglets mobile board
7. Toggle mode sombre
8. Audit logs

