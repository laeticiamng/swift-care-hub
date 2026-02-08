
# Completions manquantes pour UrgenceOS

## Analyse des lacunes

Apres audit complet du code et de la base de donnees, voici ce qui manque par rapport au plan initial :

---

## 1. RLS : AS ne peut pas inserer procedures/vitals pour brancardage/surveillance/confort

**Probleme** : L'interface AS utilise `procedures.insert()` pour surveillance, brancardage et confort, mais la policy RLS `IDE can insert procedures` n'autorise que le role IDE. L'AS est bloque en ecriture.

**Correction** : Ajouter le role AS dans la policy INSERT sur `procedures`.

---

## 2. Pas de medecin selectable dans le Triage etape 5 (Orientation)

**Probleme** : Le plan prevoit un dropdown de selection du medecin a l'etape 5 du triage. Actuellement seuls la zone et le numero de box sont proposes.

**Correction** : Ajouter un `Select` qui affiche les profils avec role `medecin`, et assigner `medecin_id` sur le `encounters.insert`.

---

## 3. Dossier Patient : pas de workflow "Preparer sortie"

**Probleme** : Le plan mentionne un bouton "Preparer sortie" dans le dossier patient medecin, avec un workflow (CRH + ordonnance + orientation). Non implemente.

**Correction** : Ajouter un bouton "Preparer sortie" qui :
- Ouvre une modale avec champs : orientation (domicile/hospitalisation/transfert), resume de sortie (textarea), ordonnances de sortie
- Met a jour `encounters.status = 'finished'`, `discharge_time = now()`, `orientation = valeur choisie`

---

## 4. Dossier Patient : pas de toggle "Essentiel / Voir tout" sur la timeline

**Probleme** : Le plan mentionne un filtre "Essentiel" vs "Voir tout" pour la timeline. Absent actuellement.

**Correction** : Ajouter un toggle qui filtre les items : mode "Essentiel" ne montre que `allergie`, `crh`, et items critiques.

---

## 5. Prescriptions : pas de verification d'allergie avant prescription

**Probleme** : Le plan exige une alerte bloquante rouge si un medicament prescrit est de la meme famille qu'une allergie connue. Non implemente.

**Correction** : Ajouter une table de mapping medicament-famille d'allergie (cote client, constante). Avant validation, verifier si le medicament contient un mot-cle d'allergie. Si oui, afficher une alerte rouge bloquante dans la modale de prescription.

---

## 6. Board : pas de lien "Nouveau patient" pour IOA

**Probleme** : Le header du board devrait avoir un bouton "Nouveau patient" qui lance le workflow IOA (lien vers /triage). Absent.

**Correction** : Ajouter un bouton dans le header du board, visible pour les roles IOA et medecin, qui navigue vers `/triage`.

---

## 7. Pancarte IDE : temperature manquante dans la saisie inline

**Probleme** : Le formulaire de saisie inline des constantes dans la pancarte affiche FC, PA sys, PA dia, SpO2 mais pas la temperature.

**Correction** : Ajouter un input T degrees dans la grille de saisie (5 champs + bouton OK = 6 colonnes, ou reorganiser).

---

## 8. Realtime : pas de realtime sur la page Accueil

**Probleme** : Quand un nouveau patient est admis par la secretaire, l'IOA ne voit pas le patient apparaitre en temps reel dans le triage/board.

**Correction** : La liste Accueil devrait aussi se rafraichir en realtime (channel sur encounters).

---

## 9. Board : pas de compteur total dans le header

**Probleme** : Le header affiche SAU/UHCD/Dechocage mais pas le total global de patients.

**Correction** : Ajouter un `StatCard` "Total" avec le nombre total de patients filtres.

---

## 10. Composant NetworkStatus manquant

**Probleme** : Le plan prevoit un composant `NetworkStatus` (pastille vert/orange/rouge indiquant la connexion). Non implemente.

**Correction** : Creer un composant leger qui ecoute `navigator.onLine` et les evenements `online`/`offline`, affiche une pastille dans le header.

---

## Plan d'implementation technique

### Migration SQL
- Modifier la policy RLS `IDE can insert procedures` pour inclure le role `as`

### Fichiers a modifier

1. **`src/pages/BoardPage.tsx`**
   - Ajouter bouton "Nouveau patient" (visible IOA/medecin) dans le header
   - Ajouter StatCard "Total" dans le header

2. **`src/pages/PatientDossierPage.tsx`**
   - Ajouter toggle "Essentiel / Voir tout" sur la timeline
   - Ajouter bouton "Preparer sortie" avec modale (orientation, resume, ordonnances)
   - Ajouter verification d'allergie dans la modale de prescription (mapping medicament -> famille)

3. **`src/pages/TriagePage.tsx`**
   - Ajouter dropdown selection medecin a l'etape 5 (fetch profiles avec role medecin)
   - Assigner `medecin_id` au `encounters.insert`

4. **`src/pages/PancartePage.tsx`**
   - Ajouter champ temperature dans la saisie inline des constantes

5. **`src/pages/AccueilPage.tsx`**
   - Ajouter channel realtime sur encounters pour rafraichir la liste automatiquement

6. **`src/components/urgence/NetworkStatus.tsx`** (nouveau)
   - Composant pastille qui ecoute `navigator.onLine`
   - Integrer dans le header commun ou dans chaque page

### Ordre de priorite
1. Fix RLS AS (bloquant)
2. Verification allergie prescription (securite patient)
3. Selection medecin au triage
4. Workflow sortie patient
5. Toggle timeline + bouton nouveau patient + total board
6. Temperature pancarte + realtime accueil + NetworkStatus
