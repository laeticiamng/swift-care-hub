

# Plan Sprint UrgenceOS — 8 Tickets CTO/PO

## Priorite immediate : Fix build (pre-requis)

Le fichier `rgpd-service.ts` reference des tables inexistantes (`data_deletion_requests`, `patient_consents`). Deux options :
- **Option A (rapide)** : caster tous les appels avec `(supabase as any).from(...)` pour debloquer le build en attendant le Ticket 4
- **Option B (propre, recommandee)** : creer les tables immediatement dans le cadre du Ticket 4, ce qui resout le build ET avance la conformite RGPD

On choisit l'Option B : integrer la creation des tables RGPD des le Sprint 1 pour resoudre le build et avancer sur la conformite.

---

## Sprint 1 — Securite critique (P0)

### Ticket 2 : Suppression auto-attribution de role

**Migration SQL :**
- Supprimer la policy `User can insert own role if none exists` sur `user_roles`
- Le trigger `handle_new_user_role()` (SECURITY DEFINER) reste la seule voie d'attribution automatique du role par defaut `ide`
- Aucune policy INSERT ne subsiste pour les utilisateurs standard
- Verifier qu'aucun code frontend ne tente un `INSERT` sur `user_roles`

**Fichiers concernes :** 1 migration SQL uniquement

---

### Ticket 5 : Audit trail immutable (trigger SQL)

**Migration SQL :**
- Creer un trigger `BEFORE UPDATE OR DELETE ON audit_logs` qui execute `RAISE EXCEPTION 'audit_logs is immutable'`
- Fonction trigger en `SECURITY DEFINER` pour s'appliquer meme aux proprietaires de table

```text
audit_logs
  +-- BEFORE UPDATE --> RAISE EXCEPTION
  +-- BEFORE DELETE --> RAISE EXCEPTION
  +-- INSERT        --> OK (seule operation permise)
```

**Fichiers concernes :** 1 migration SQL

---

### Ticket 4 : Module RGPD fonctionnel (+ fix build)

**Migration SQL :**
- Creer table `patient_consents` :
  - `id uuid PK`, `patient_id uuid NOT NULL`, `consent_type text NOT NULL`, `granted boolean NOT NULL`, `granted_at timestamptz`, `revoked_at timestamptz`, `granted_by uuid`, `created_at timestamptz DEFAULT now()`
- Creer table `data_deletion_requests` :
  - `id uuid PK`, `patient_id uuid NOT NULL`, `requested_by uuid NOT NULL`, `reason text`, `status text DEFAULT 'pending'`, `created_at timestamptz DEFAULT now()`, `executed_at timestamptz`
- RLS sur les deux tables : lecture/ecriture par medecin uniquement, insert audit_log automatique via trigger

**Code :**
- `rgpd-service.ts` : supprimer tous les `as any` — les tables existent desormais et les types seront regeneres automatiquement. Cela resout les 9 erreurs de build actuelles.

**Fichiers concernes :** 1 migration SQL + `src/lib/rgpd-service.ts`

---

### Ticket 1 : RLS par encounter (moindre privilege)

**Approche :**

Actuellement les policies verifient uniquement le role (`has_role`). L'objectif est d'ajouter une verification d'affectation : le medecin ou IDE doit etre assigne a l'encounter pour acceder aux donnees du patient.

**Migration SQL :**
1. Creer une fonction `SECURITY DEFINER` :
```text
is_assigned_to_encounter(user_id, encounter_id) -> boolean
  Verifie : encounter.medecin_id = user_id 
         OR encounter.ide_id = user_id
         OR encounter.status IN ('in_progress','completed') 
            AND encounter.discharge_time > now() - interval '24 hours'
```

2. Creer une fonction helper :
```text
is_assigned_to_patient(user_id, patient_id) -> boolean
  Verifie qu'il existe au moins un encounter actif 
  (ou < 24h post-sortie) ou le user est assigne
```

3. Mettre a jour les policies RLS sur :
   - `vitals` : ajouter `AND is_assigned_to_patient(auth.uid(), patient_id)`
   - `prescriptions` : idem
   - `results` : idem
   - `administrations` : idem
   - `procedures` : idem
   - `timeline_items` : idem
   - `patients` : conserver l'acces large pour IOA/secretaire (besoin d'enregistrement), restreindre pour les autres

4. Exception pour IOA : acces en lecture a tous les patients (besoin triage)

**Fichiers concernes :** 1 migration SQL (pas de changement frontend — le filtrage est invisible cote client)

---

### Ticket 3 : Verification role serveur avant mutations

**Approche :**

Le fichier `server-role-guard.ts` existe deja avec `guardPrescription()`, `guardTriage()`, etc. Le probleme : ces guards utilisent le client Supabase browser (pas veritablement "cote serveur"). Sur Lovable Cloud, la vraie verification serveur passe par les RLS policies (deja renforcees par Tickets 1-2).

**Actions :**
- Brancher les guards existants comme pre-verification UI dans les pages critiques :
  - `PatientDossierPage.tsx` : appeler `guardPrescription()` avant `supabase.from('prescriptions').insert()`
  - `PancartePage.tsx` : appeler `guardAdministration()` avant insertion d'administration
  - `TriagePage.tsx` : appeler `guardTriage()` avant mise a jour encounter
- Ajouter un toast d'erreur explicite si le guard echoue
- Logger les tentatives non autorisees via `auditService.log()`

**Fichiers concernes :** `PatientDossierPage.tsx`, `PancartePage.tsx`, `TriagePage.tsx`, `server-role-guard.ts`

---

## Sprint 2 — Refactor et qualite

### Ticket 6 : Refactor PatientDossierPage (1593 lignes)

**Structure cible :**

```text
src/features/patient-dossier/
  +-- hooks/
  |     +-- usePatientData.ts      (fetch encounter, patient, vitals, results)
  |     +-- usePrescription.ts     (logique prescription, allergy check, submit)
  |     +-- useInterop.ts          (export FHIR, CRH, ordonnance)
  +-- components/
  |     +-- VitalsPanel.tsx         (sparklines, constantes)
  |     +-- PrescriptionPanel.tsx   (formulaire + liste prescriptions)
  |     +-- ResultsPanel.tsx        (bio, imagerie, ECG)
  |     +-- TimelinePanel.tsx       (SIHTimeline + communications)
  |     +-- InteropActions.tsx      (boutons export FHIR/CRH)
  |     +-- DossierHeader.tsx       (IdentityBanner + navigation)
  +-- PatientDossierPage.tsx        (< 200 lignes, orchestrateur)
```

**Regle :** aucun changement fonctionnel, uniquement de la reorganisation. Chaque composant < 400 lignes.

---

### Ticket 7 : Tests E2E flow medecin

**Limitation Lovable :** Playwright/Cypress ne peuvent pas etre executes directement dans l'environnement Lovable. A la place :
- Utiliser les outils browser integres (navigate, act, observe) pour valider les flows critiques
- Documenter les scenarios de test dans un fichier `E2E_TEST_PLAN.md`
- Creer des tests unitaires Vitest pour les hooks extraits au Ticket 6

**Scenarios documentes :**
1. Login medecin -> board -> ouvrir dossier -> prescrire -> verifier prescription
2. Role IDE -> tentative prescription -> refus
3. Export FHIR -> validation bundle
4. Deconnexion apres inactivite

---

### Ticket 8 : CSP strict

**Actions :**
- Ajouter meta tag CSP dans `index.html` :
  - `default-src 'self'`
  - `script-src 'self'` (Vite gere le bundling, pas de scripts inline en prod)
  - `connect-src 'self' https://*.supabase.co`
  - `frame-ancestors 'none'`
  - `style-src 'self' 'unsafe-inline'` (necessaire pour Tailwind/Radix)
- Brancher `logCSPViolation()` dans un endpoint de reporting
- Tester que l'application fonctionne normalement avec la CSP active

**Fichiers concernes :** `index.html`, potentiellement `vite.config.ts` pour les headers de dev

---

## Resume de l'ordre d'execution

| Ordre | Ticket | Type | Impact |
|-------|--------|------|--------|
| 1 | T2 - Suppr auto-role | Migration SQL | Ferme escalade privileges |
| 2 | T5 - Audit immutable | Migration SQL | Protege trace audit |
| 3 | T4 - Tables RGPD | Migration SQL + code | Fix build + conformite |
| 4 | T1 - RLS encounter | Migration SQL | Moindre privilege |
| 5 | T3 - Server guards | Code frontend | Defense en profondeur |
| 6 | T6 - Refactor dossier | Code frontend | Maintenabilite |
| 7 | T7 - Plan E2E | Documentation + tests | Qualite |
| 8 | T8 - CSP | Config | Hardening front |

