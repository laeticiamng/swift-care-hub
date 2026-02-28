# Plan de Tests E2E — UrgenceOS

## Scénarios Critiques

### 1. Flow médecin complet
1. Login avec compte médecin
2. Arrivée sur le board → vérifier liste encounters
3. Ouvrir un dossier patient → vérifier bandeau identitaire
4. Prescrire un médicament (paracétamol 1g PO)
5. Vérifier la prescription dans la liste
6. Exporter en FHIR → vérifier le bundle
7. Générer un CRH → vérifier le contenu
8. Préparer la sortie → valider discharge

### 2. Contrôle d'accès par rôle
1. Login IDE → ouvrir dossier patient
2. Tenter de prescrire → **doit être refusé** (guard + RLS)
3. Administrer un médicament → **doit fonctionner**
4. Login aide-soignant → **mode lecture seule** (pas de prescription/diagnostic)

### 3. Contrôle d'accès par encounter (RLS)
1. Médecin A assigné à encounter X
2. Médecin B **non** assigné → **accès refusé** aux vitals/prescriptions
3. IOA → **accès lecture tous patients** (exception triage)
4. Grace period : vérifier accès 24h post-discharge, refus après

### 4. Triage IOA
1. Login IOA → accéder page triage
2. Créer nouveau patient (identité + motif + constantes)
3. CIMU auto-suggéré basé sur constantes
4. Orienter vers SAU/UHCD + assigner box
5. Vérifier encounter créé sur le board

### 5. Pancarte IDE
1. Login IDE → ouvrir pancarte d'un encounter assigné
2. Administrer un médicament prescrit
3. Saisir constantes vitales
4. Créer transmission DAR
5. Tracer un acte (VVP, prélèvement)

### 6. RGPD
1. Login médecin → créer un consentement patient
2. Révoquer un consentement → vérifier revoked_at
3. Demander suppression données → statut "pending"
4. Exporter données patient (Art. 15) → vérifier JSON complet

### 7. Audit trail
1. Effectuer prescription → vérifier entrée audit_logs
2. Tenter UPDATE audit_logs → **doit échouer** (trigger immutable)
3. Tenter DELETE audit_logs → **doit échouer**

### 8. Sécurité
1. Appel API direct sans auth → 401
2. Tentative INSERT user_roles → **refusé** (policy supprimée)
3. Vérifier absence de policies permissives (true)
4. CSP violations → console propre

## Tests Unitaires (Vitest)

### Hooks extraits (Ticket 6)
- `usePatientData` : mock supabase, vérifier state après fetch
- `usePrescription` : guard check, allergy detection, form reset
- `useInterop` : FHIR bundle structure, CRH HTML non vide

### Utilitaires existants
- `allergy-check.test.ts` ✅
- `homonymy-detection.test.ts` ✅
- `vitals-utils.test.ts` ✅
- `prescription-types.test.ts` ✅
- `fhir-adapter.test.ts` ✅
- `audit-service.test.ts` ✅

## Outils de validation
- **Browser tools Lovable** : navigate, act, observe, screenshot
- **Vitest** : tests unitaires hooks + utilitaires
- **Linter sécurité** : vérification RLS automatique
