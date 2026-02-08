

# Corrections finales -- UrgenceOS

Apres audit complet de chaque page, composant, policy RLS et schema de base de donnees, toutes les 20 fonctionnalites du plan sont implementees. Cependant, 7 bugs/lacunes subsistent qui empechent certaines fonctionnalites de fonctionner correctement.

---

## 1. Le pre-remplissage depuis la file IOA ne fonctionne pas

**Probleme** : La page IOA Queue passe `{ patientId, encounterId }` via `navigate('/triage', { state: ... })` mais TriagePage ne lit jamais `location.state`. Le patient existant n'est pas pre-rempli, et un nouveau passage est cree au lieu de mettre a jour le passage existant (statut `arrived` -> `triaged`).

**Correction** :
- Importer `useLocation` dans TriagePage
- Lire `location.state.patientId` et `location.state.encounterId`
- Si `patientId` est present, pre-remplir le patient et verrouiller l'etape Identite
- Si `encounterId` est present, faire un `UPDATE` au lieu d'un `INSERT` sur encounters lors de la validation

---

## 2. Le resume de sortie n'est pas sauvegarde

**Probleme** : Dans `DischargeDialog`, le champ `summary` (textarea) est saisi mais jamais envoye a la base. La query `encounters.update()` n'inclut pas le resume.

**Correction** : Sauvegarder le resume dans `timeline_items` comme un CRH de sortie, puisque la table `encounters` n'a pas de colonne `summary`.

---

## 3. Pas d'audit log sur la sortie patient

**Probleme** : `DischargeDialog` ne trace pas l'action dans `audit_logs`. Toutes les autres actions critiques (prescriptions, administrations, changements de zone) sont tracees, mais pas la sortie.

**Correction** : Ajouter un insert dans `audit_logs` avec `action: 'patient_discharge'` dans `DischargeDialog`.

---

## 4. Le triage redirige toujours vers /board au lieu de /ioa-queue pour l'IOA

**Probleme** : Apres validation du tri, `handleSubmit` navigue vers `/board`. Pour un IOA, ce devrait etre `/ioa-queue`.

**Correction** : Utiliser le role de l'utilisateur pour rediriger vers la bonne page apres validation.

---

## 5. ThemeToggle et NetworkStatus absents de certaines pages

**Probleme** : Les composants `ThemeToggle` et `NetworkStatus` ne sont presents que sur BoardPage et IOAQueuePage. Ils manquent dans les headers de AccueilPage, AideSoignantPage, PancartePage et PatientDossierPage.

**Correction** : Ajouter ces composants dans les headers de toutes les pages.

---

## 6. L'AS ne peut pas lire les transmissions

**Probleme** : La policy SELECT sur `transmissions` n'autorise que `medecin` et `ide`. L'AS qui effectue des soins n'a pas acces aux transmissions IDE, ce qui l'empeche de voir le contexte clinique.

**Correction** : Ajouter `as` dans la policy SELECT de `transmissions`.

---

## 7. Pas de realtime sur les vitals dans la pancarte

**Probleme** : La pancarte IDE ecoute le realtime sur `prescriptions` et `results` mais pas sur `vitals`. Si l'AS saisit des constantes, l'IDE ne les voit pas en temps reel.

**Correction** : Ajouter `vitals` a la publication realtime et au channel de la pancarte.

---

## Plan technique

### Migration SQL
- Ajouter `as` dans la policy SELECT de `transmissions`
- Ajouter `vitals` a la publication supabase_realtime

### Fichiers a modifier

1. **`src/pages/TriagePage.tsx`**
   - Importer `useLocation` et lire `location.state`
   - Pre-remplir le patient si `patientId` est fourni (fetch patient et auto-select)
   - Si `encounterId` fourni, UPDATE au lieu d'INSERT
   - Rediriger vers `/ioa-queue` si role IOA apres validation

2. **`src/components/urgence/DischargeDialog.tsx`**
   - Sauvegarder le resume dans `timeline_items` (type `crh`, contenu = resume)
   - Ajouter un insert dans `audit_logs` pour la sortie
   - Passer `patientId` et `userId` en props

3. **`src/pages/AccueilPage.tsx`**
   - Ajouter `ThemeToggle` et `NetworkStatus` dans le header

4. **`src/pages/AideSoignantPage.tsx`**
   - Ajouter `ThemeToggle` et `NetworkStatus` dans le header

5. **`src/pages/PancartePage.tsx`**
   - Ajouter `ThemeToggle` et `NetworkStatus` dans le header (PatientBanner)
   - Ajouter `vitals` au channel realtime

6. **`src/pages/PatientDossierPage.tsx`**
   - Passer `patientId` et `userId` a `DischargeDialog`

### Ordre d'implementation
1. Fix IOA -> Triage pre-remplissage + UPDATE encounter (fonctionnalite cassee)
2. Fix DischargeDialog (resume + audit log)
3. Migration RLS transmissions + realtime vitals
4. ThemeToggle/NetworkStatus sur toutes les pages
5. Redirection triage IOA -> /ioa-queue

