# AUDIT COMPLET — UrgenceOS v0.0.0 (Prototype)

**Date** : 2026-02-11
**Auditeur** : Developpeur Principal — Claude (Opus 4.6)
**Perimetre** : Audit technique et non-technique exhaustif
**Branche** : `claude/urgenceos-complete-audit-d7UGD`
**Editeur** : EMOTIONSCARE SASU

---

## RESUME EXECUTIF

| Domaine | Score | Verdict |
|---|---|---|
| Architecture & Code | 5/10 | Structure correcte, dette technique significative |
| Securite | 3/10 | **CRITIQUE** — Failles RLS, secrets exposes, role client-side |
| Offline / PWA | 2/10 | **CRITIQUE** — SW minimal, localStorage 5MB, aucun cache patient |
| Tests | 1/10 | **BLOQUANT** — 1 seul test trivial (`true === true`) |
| Conformite (FHIR/RPU/INS) | 4/10 | Adaptateurs FHIR existent, zero integration reelle |
| UX / Accessibilite | 5/10 | Composants metier presents, dark mode desactive |
| KPIs annonces | 2/10 | **NON VERIFIABLES** — Aucun benchmark, aucune mesure |
| Documentation | 3/10 | README present, zero doc technique/API |

**Score global : 3.1 / 10 — Prototype non deployable en production**

---

## 1. ARCHITECTURE & CODE

### 1.1 Structure du projet

```
swift-care-hub/
├── src/
│   ├── components/
│   │   ├── ui/          → 38 composants Shadcn/Radix (beaucoup inutilises)
│   │   ├── urgence/     → 30+ composants metier
│   │   └── landing/     → 7 sections landing page
│   ├── contexts/        → AuthContext, DemoContext
│   ├── hooks/           → use-toast (1 seul hook)
│   ├── integrations/    → Supabase client + types generes
│   ├── lib/             → Utils, interop, types, offline queue
│   ├── pages/           → 22 pages
│   └── test/            → 1 test placeholder
├── public/              → SW, manifest, icons SVG
├── supabase/            → 11 migrations, 1 seed, 1 edge function
└── [config files]
```

### 1.2 Constatations

| # | Constat | Severite | Fichier |
|---|---------|----------|---------|
| A-01 | `package.json` name = `"vite_react_shadcn_ts"` au lieu de `"urgenceos"` | Mineure | `package.json:2` |
| A-02 | ~20 composants Radix UI importes mais jamais utilises (menubar, hover-card, context-menu, etc.) | Moyenne | `package.json:17-43` |
| A-03 | Zero code splitting / lazy loading — tout est charge d'un coup | Haute | `src/App.tsx` |
| A-04 | `QueryClient.staleTime = 60s` — donnees potentiellement obsoletes en contexte medical temps reel | Haute | `src/App.tsx:45` |
| A-05 | Pas de realtime actif cote client — `supabase_realtime` active en migration mais aucun `subscribe()` dans le code React | **Critique** | Global |
| A-06 | Pas de service de reporting d'erreurs (Sentry, Datadog, etc.) | Haute | N/A |
| A-07 | Pas de i18n — codage en dur en francais sans framework de localisation | Mineure | Global |
| A-08 | `next-themes` utilise avec `defaultTheme="light"` — **viole la regle #7** (mode sombre par defaut) | Haute | `src/App.tsx:122` |
| A-09 | Double declaration `Toaster` (ui/toaster + ui/sonner) — confusion possible | Mineure | `src/App.tsx:1-2` |
| A-10 | Aucun pre-commit hook, aucun linter CI, aucun check TypeScript strict | Moyenne | N/A |

### 1.3 Stack technique

| Composant | Version | Statut |
|-----------|---------|--------|
| React | 18.3.1 | OK |
| TypeScript | 5.8.3 | OK |
| Vite | 5.4.19 | OK |
| Supabase JS | 2.95.3 | OK |
| TanStack Query | 5.83.0 | OK |
| React Router | 6.30.1 | OK |
| Tailwind CSS | 3.4.17 | OK |
| Vitest | 3.2.4 | OK (mais inutilise) |
| Zod | 3.25.76 | OK (mais sous-utilise) |

---

## 2. SECURITE

### 2.1 Authentification

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| S-01 | `.env` committe dans le repo avec cle Supabase anon | **Critique** | `.env:1-3` — La cle anon est publique par design mais le fichier `.env` ne devrait JAMAIS etre committe. `.gitignore` ne le bloque pas. |
| S-02 | Role stocke en `sessionStorage` — modifiable via DevTools | **Critique** | `AuthContext.tsx:71-78` — Un utilisateur peut changer son role en modifiant `sessionStorage('urgenceos_role')` |
| S-03 | Mode Demo bypass total de l'authentification | Haute | `DemoContext.tsx` + `App.tsx:58` — `if (isDemoMode) return <>{children}</>` saute toute verification |
| S-04 | Auto-logout 30 min mais pas de re-verification a la reprise | Moyenne | `AuthContext.tsx:107-127` |
| S-05 | Pas de MFA / 2FA | Haute | Critique pour un SIH hospitalier |
| S-06 | `signUp` ouvert — n'importe qui peut creer un compte | **Critique** | `AuthContext.tsx:88-98` — Aucune restriction, aucune invitation, aucun domaine email |
| S-07 | Pas de verrouillage apres tentatives echouees | Haute | Pas de rate limiting cote client |

### 2.2 Autorisation (RLS — Row Level Security)

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| S-08 | Tables `communications`, `lab_alerts`, `guard_schedule` : RLS = `USING (true)` | **Critique** | `20260210_sih_cdc_tables.sql:87-99` — Tout utilisateur authentifie peut lire, inserer ET modifier toutes les alertes labo et communications |
| S-09 | Tables `allergies`, `conditions`, `care_plans`, `generated_documents` : **AUCUNE politique RLS** | **Critique** | `20260209_canonical_model.sql` — Tables creees sans aucune policy |
| S-10 | `audit_logs` : utilisateur peut lire uniquement ses propres logs | Haute | Pas d'acces admin pour audit global |
| S-11 | `audit_logs` : pas de protection DELETE/UPDATE — logs mutables | **Critique** | Violation de l'immutabilite requise M8-01 |
| S-12 | `prescriptions` : pas de politique DELETE — un medecin ne peut pas annuler proprement | Moyenne | `20260208155827.sql:282-287` |
| S-13 | `results` : pas de politique INSERT — comment les resultats arrivent-ils ? | Haute | Pas de mecanisme d'ingestion |

### 2.3 Chiffrement et securite reseau

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| S-14 | Aucun chiffrement cote client des donnees sensibles | Haute | Donnees patients en clair dans localStorage (offline queue) |
| S-15 | Pas de CSP (Content Security Policy) configure | Haute | `index.html` — pas de meta CSP |
| S-16 | Pas de headers de securite (X-Frame-Options, X-Content-Type-Options) | Haute | Configuration serveur absente |
| S-17 | `fetch` dans service worker sans validation d'origine | Moyenne | `public/sw.js` |

### 2.4 Audit trail

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| S-18 | `ip_address` = `'client'` (string fixe) — pas de capture d'IP reelle | Haute | `audit-service.ts:21` |
| S-19 | `workstation` = `navigator.userAgent` tronque — pas d'ID de poste | Moyenne | `audit-service.ts:22` |
| S-20 | Queue d'audit en memoire — perdue si onglet ferme avant flush (5s) | Haute | `audit-service.ts:15` |
| S-21 | Pas de signature cryptographique des entrees d'audit | Haute | Violation integrabilite 10 ans |

---

## 3. OFFLINE / PWA

### 3.1 Service Worker

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| O-01 | SW cache seulement 3 fichiers : `/`, `/index.html`, `/manifest.json` | **Critique** | `public/sw.js:2-6` — Les bundles JS/CSS ne sont pas pre-caches |
| O-02 | Aucun cache des donnees patient / encounters | **Critique** | Pas d'IndexedDB, pas de cache API pour les donnees metier |
| O-03 | Les appels Supabase sont completement ignores par le SW | Haute | `sw.js:34` — `if (url.hostname.includes('supabase')) return;` |
| O-04 | Pas de strategie de versioning du cache | Moyenne | Cache name = `'urgenceos-v1'` en dur |
| O-05 | Pas de notification de mise a jour disponible | Moyenne | `skipWaiting()` force sans prevenir l'utilisateur |

### 3.2 Offline Queue

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| O-06 | Queue basee sur `localStorage` — **limite a 5 MB** | **Critique** | `offline-queue.ts:18` — Insuffisant pour >4h de donnees medicales |
| O-07 | Resolution de conflits = "last-write-wins" | Haute | `offline-queue.ts:6` — Risque de perte de donnees medicales |
| O-08 | Pas de detection automatique online/offline | Haute | Pas de `navigator.onLine` listener, pas de Background Sync API |
| O-09 | Retry max 5 fois puis **suppression silencieuse** | **Critique** | `offline-queue.ts:83-85` — Donnees medicales supprimees sans alerte |
| O-10 | Pas de chiffrement de la queue offline | Haute | Donnees patients en clair dans localStorage |

### 3.3 PWA Manifest

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| O-11 | Icones SVG uniquement — pas de PNG pour compatibilite iOS/Android | Moyenne | `manifest.json:12-22` |
| O-12 | Pas de splash screen | Mineure | Manifest incomplet |
| O-13 | `background_color: "#f8f8f8"` (clair) — incoherent avec mode sombre | Mineure | `manifest.json:8` |

### 3.4 Verdict offline KPI ">4h"

**ECHEC** — Le systeme ne peut pas fonctionner 4h offline car :
1. Aucune donnee patient n'est cachee localement
2. localStorage limite a 5 MB
3. Aucun mecanisme de pre-chargement des donnees
4. Les requetes Supabase echoueront silencieusement

---

## 4. TESTS & QUALITE DU CODE

### 4.1 Etat des tests

| Metrique | Annonce | Realite |
|----------|---------|---------|
| Nombre de tests | "45 tests" | **1 test** |
| Fichiers de test | N/A | `src/test/example.test.ts` |
| Contenu du test | N/A | `expect(true).toBe(true)` |
| Couverture | N/A | **0%** (aucun code applicatif teste) |
| Tests E2E | N/A | **Aucun** (pas de Playwright/Cypress) |
| Tests integration | N/A | **Aucun** |
| Tests composants | N/A | **Aucun** |

### 4.2 Constats qualite

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| T-01 | **1 seul test trivial** — affirmation "45 tests" mensongere | **Bloquant** | `src/test/example.test.ts` |
| T-02 | Zero coverage — aucune configuration de couverture | **Critique** | `vitest.config.ts` — pas de `coverage` |
| T-03 | Pas de CI/CD pipeline visible | Haute | Pas de `.github/workflows/`, pas de Makefile |
| T-04 | ESLint configure mais aucune evidence d'execution | Moyenne | `eslint.config.js` existe |
| T-05 | TypeScript non-strict — `strict: true` dans tsconfig mais pas verifie en CI | Moyenne | Pas de `tsc --noEmit` en pre-commit |
| T-06 | Zod installe mais sous-utilise — formulaires non valides | Haute | `zod@3.25.76` dans deps mais peu de schemas definis |

### 4.3 Tests critiques manquants (priorite)

1. **AuthContext** — connexion, deconnexion, auto-logout, persistence role
2. **RoleGuard** — acces par role, redirection, bypass demo
3. **OfflineQueue** — queue/dequeue, sync, retry, limite taille
4. **FHIR Adapter** — conversion patient, encounter, prescriptions, bundle
5. **Allergy Check** — detection interactions medicamenteuses
6. **Triage CIMU** — classification correcte des niveaux
7. **PancartePage** — administration 1-tap, verification pre-admin
8. **Homonymie** — detection homonymes, alerte
9. **AuditService** — logging, flush, reprise apres erreur

---

## 5. CONFORMITE REGLEMENTAIRE

### 5.1 FHIR R4

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-01 | Adaptateur FHIR R4 **complet en export** — Patient, Encounter, Observation, MedicationRequest, ServiceRequest, Procedure, DiagnosticReport, AllergyIntolerance, Condition, Composition | OK | `src/lib/interop/fhir-adapter.ts` |
| C-02 | **Zero import FHIR** — pas de parser pour les ressources entrantes | Haute | Pas de `fhirToPatient()`, `fhirToEncounter()`, etc. |
| C-03 | Pas de validation FHIR — les bundles generes ne sont pas valides contre le schema | Haute | Pas de validation JSON Schema R4 |
| C-04 | Systemes de codage definis (LOINC, ATC, CIM-10) mais partiels | Moyenne | `coding-systems.ts` |

### 5.2 HL7v2

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-05 | Adaptateur HL7v2 present mais **outbound only** | Haute | `src/lib/interop/hl7v2-adapter.ts` — generation de messages mais pas de parsing |
| C-06 | Pas de connecteur MLLP/TCP pour envoi reel | Haute | Aucune integration reseau |

### 5.3 RPU (Resume de Passage aux Urgences)

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-07 | Type `DocumentType` inclut `'rpu'` dans le modele canonique | OK | `canonical-model.ts:22` |
| C-08 | **Aucune implementation d'export RPU** | **Critique** | Pas de generateur RPU normalise, pas de template, pas d'export |
| C-09 | Champs RPU partiellement mappes (CCMU, CIMU, GEMSA, motif_sfmu, orientation) | Moyenne | Schema `encounters` |

### 5.4 INS (Identite Nationale de Sante)

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-10 | Champ `ins_numero` present dans le schema patients | OK | `patients.ins_numero` |
| C-11 | Champ `ins_status` (provisoire/qualifie/invalide) ajoute | OK | `20260209_canonical_model.sql:10` |
| C-12 | **Zero integration avec le teleservice INSi** | **Critique** | Pas d'appel API INS, pas de validation, pas de qualification |
| C-13 | Pas de gestion du matricule INS (NIR) | Haute | Aucun algorithme de verification |

### 5.5 MSSante / DMP

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-14 | Adaptateur MSSante present dans `interop/` | OK | `mssante-adapter.ts` |
| C-15 | **Zero envoi reel** — pas de SMTP, pas d'API MSSante | **Critique** | Stub uniquement |
| C-16 | Champs DMP dans `generated_documents` (sent_dmp, sent_dmp_at) | OK | Schema OK |
| C-17 | **Zero integration DMP** | **Critique** | Aucune API DMP |

### 5.6 RGPD / Protection des donnees

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| C-18 | `CookieConsent` component present | OK | `CookieConsent.tsx` |
| C-19 | Pas de mecanisme d'export des donnees (portabilite) | Haute | Droit RGPD Art. 20 non couvert |
| C-20 | Pas de mecanisme de suppression (droit a l'oubli) | Haute | Droit RGPD Art. 17 non couvert |
| C-21 | Pas de registre des traitements documente | Haute | Obligation RGPD Art. 30 |
| C-22 | Pas de DPO designe dans l'application | Moyenne | Coordonnees DPO absentes |
| C-23 | Pas de politique de retention des donnees implementee | Haute | Audit trail "10 ans" annonce mais non implemente |
| C-24 | Pas de gestion du consentement eclaire patient | **Critique** | Obligatoire en contexte medical |

---

## 6. UX / UI PAR PROFIL METIER

### 6.1 Theme et accessibilite

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| U-01 | `defaultTheme="light"` — **devrait etre `"dark"`** | Haute | `App.tsx:122` — Regle #7 violee |
| U-02 | Dark mode CSS bien defini avec variables HSL dediees | OK | `index.css:61-95` |
| U-03 | Couleurs medicales semantiques definies (critical, warning, success, info) | OK | `tailwind.config.ts:53-64` |
| U-04 | `touch-target` (44px) et `touch-target-lg` (60px) definis | OK | `index.css:110-115` |
| U-05 | Pas d'audit Lighthouse / axe-core documente | Haute | Aucune mesure d'accessibilite |
| U-06 | `lang="fr"` correct dans index.html | OK | `index.html:2` |
| U-07 | Police Inter chargee via CDN — **risque offline** | Haute | `index.css:1` — Pas de fallback self-hosted |

### 6.2 Profils metier (5 vues)

| Profil | Route principale | Implementation | Statut |
|--------|-----------------|----------------|--------|
| Medecin | `/board` | BoardPage + prescriptions | Partiel |
| IOA | `/ioa-queue` + `/triage` | IOAQueuePage + TriagePage | Partiel |
| IDE | `/pancarte/:id` | PancartePage + PreAdminVerification | Partiel |
| Aide-soignant(e) | `/as` | AideSoignantPage (constantes) | Partiel |
| Secretaire | `/accueil` | AccueilPage (admission) | Partiel |

### 6.3 Constats UX

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| U-08 | `/prescriptions` redirige vers `/board` — pas de vue prescriptions dediee | Moyenne | `App.tsx:93` |
| U-09 | Pas de filtrage des routes par role — tous les roles accedent a toutes les pages | Haute | `RoleGuard` verifie seulement qu'un role existe, pas lequel |
| U-10 | `DemoProvider` enveloppe `AuthProvider` — ordre potentiellement incorrect | Moyenne | `App.tsx:128-131` |
| U-11 | `MedicalDisclaimer` et `CookieConsent` affiches globalement — y compris en contexte clinique | Mineure | `App.tsx:131-132` |
| U-12 | Onboarding "<30min" annonce mais pas de tutoriel / guide interactif | Moyenne | Regle #6 non verifiable |

---

## 7. KPIs ANNONCES — VERIFICATION

| KPI annonce | Mesurable ? | Atteint ? | Commentaire |
|-------------|-------------|-----------|-------------|
| `<2min tri IOA` | Non | **Non verifiable** | TriagePage existe mais aucun chronometre, aucun benchmark, pas de mesure du temps reel |
| `1 tap administration` | Non | **Faux** | `PreAdminVerification` impose verification 5B (5 confirmations) avant administration — **minimum 6 taps** |
| `<90s admission` | Non | **Non verifiable** | AccueilPage existe mais aucune mesure de temps |
| `0 changement page IDE` | Partiellement | **Non** | `/prescriptions` redirige vers `/board` (changement de page), PancartePage est une page separee |
| `>4h mode offline` | Non | **Faux** | localStorage 5MB, pas de cache patient, SW minimal |

---

## 8. SEO & LEGAL

### 8.1 SEO

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| L-01 | Meta tags OG et Twitter corrects | OK | `index.html:11-20` |
| L-02 | Structured data (JSON-LD) SoftwareApplication + MedicalOrganization | OK | `index.html:29-70` |
| L-03 | `robots.txt` et `sitemap.xml` presents | OK | `public/` |
| L-04 | Canonical URL = `https://urgenceos.fr/` — domaine pas encore actif ? | A verifier | `index.html:24` |
| L-05 | URL actuelle encore `flow-pulse-assist.lovable.app` — a renommer | Haute | Conforme contexte projet |

### 8.2 Legal

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| L-06 | Mentions legales, CGU, Politique de confidentialite presents | OK | Routes `/mentions-legales`, `/cgu`, `/politique-confidentialite` |
| L-07 | Medical disclaimer "ne constitue pas un dispositif medical certifie" | OK | `MedicalDisclaimer.tsx` |
| L-08 | Schema.org inclut `"Attention : UrgenceOS est un outil d'aide, pas un dispositif medical certifie"` | OK | `index.html:66` |

---

## 9. BASE DE DONNEES

### 9.1 Schema (12 tables + 6 nouvelles)

**Tables principales (migration initiale)** :
`profiles`, `user_roles`, `patients`, `encounters`, `vitals`, `prescriptions`, `administrations`, `procedures`, `transmissions`, `results`, `timeline_items`, `audit_logs`

**Tables ajoutees (migrations enrichissement)** :
`allergies`, `conditions`, `care_plans`, `generated_documents`, `communications`, `lab_alerts`, `guard_schedule`

### 9.2 Constats base de donnees

| # | Constat | Severite | Detail |
|---|---------|----------|--------|
| D-01 | Realtime active sur `encounters`, `prescriptions`, `results` | OK | Migration initiale |
| D-02 | Index performants sur `communications`, `lab_alerts`, `guard_schedule`, `patients` | OK | `20260210.sql:70-79` |
| D-03 | **Pas d'index sur `encounters.patient_id`** — requete frequente | Haute | Manquant |
| D-04 | **Pas d'index sur `prescriptions.encounter_id`** | Haute | Manquant |
| D-05 | **Pas d'index sur `vitals.encounter_id`** | Haute | Manquant |
| D-06 | `gemsa` dans encounters (GEMSA obsolete en France) | Mineure | Garder pour retro-compatibilite |
| D-07 | `poids` dans patients + `weight_kg` en doublon | Mineure | `20260209_canonical_model.sql` |
| D-08 | `med_route` enum trop restrictif (5 valeurs) vs canonical model (13 valeurs) | Haute | Incoherence enum DB vs TypeScript |
| D-09 | `ipp` ajoute deux fois (migration canonique + migration SIH) | Mineure | Idempotent grace a `IF NOT EXISTS` |
| D-10 | Pas de trigger pour mise a jour automatique `updated_at` | Moyenne | Champ ajoute mais non automatise |

---

## 10. INTEROPERABILITE

### 10.1 Modele canonique

Le modele canonique (`src/lib/interop/canonical-model.ts`) est **bien concu** :
- Patron `who + when_event + when_recorded + what + value + status + provenance`
- Traçabilite des sources (saisie_humaine, import_hl7, import_fhir, device, ia_suggestion, pack_protocole)
- Types TypeScript exhaustifs pour Patient, Encounter, Vitals, Prescription, Administration, Procedure, Result, Allergy, Condition, Transmission, Document

### 10.2 Adaptateurs

| Adaptateur | Existence | Export | Import | Integration reelle |
|-----------|-----------|--------|--------|-------------------|
| FHIR R4 | Oui | Oui (complet) | Non | Non |
| HL7v2 | Oui | Oui (partiel) | Non | Non |
| MSSante | Oui | Oui (stub) | N/A | Non |

### 10.3 Points forts interop

- Mapping LOINC pour constantes vitales
- Mapping ATC pour medicaments
- Mapping CIM-10 pour conditions
- Bundle FHIR complet (collection) avec toutes les ressources d'un passage

### 10.4 Points faibles interop

- Aucune validation des ressources FHIR generees
- Pas de profils IHE (PAM, PDQ, PIX)
- Pas de connecteur reseau (MLLP, REST FHIR server)
- Pas de message ORU/ADT parsable

---

## 11. POINTS FORTS DU PROJET

Malgre les constats critiques, le projet presente des bases solides :

1. **Architecture de donnees bien pensee** — Le modele canonique avec provenance est professionnel
2. **FHIR R4 export complet** — Rare pour un prototype, couvre 10+ types de ressources
3. **RLS par role sur les tables principales** — Les 12 tables initiales ont des policies granulaires
4. **Composants metier specialises** — PreAdminVerification (5B), TriagePage (CIMU), BoardPatientCard
5. **Audit service avec batching** — Architecture correcte (queue + flush periodique)
6. **Systemes de codage** — LOINC, ATC, CIM-10, OID INS
7. **SEO et structured data** — JSON-LD bien structure
8. **Types TypeScript exhaustifs** — SIH types, canonical model, prescription types
9. **Detection d'homonymie** — Systeme de detection homonymes avec alerte
10. **Alertes labo critiques** — Seuils par defaut, escalade 3 niveaux

---

## 12. PLAN D'ACTION PRIORITAIRE

### Phase 1 — Securite (BLOQUANT — Semaine 1-2)

| # | Action | Priorite |
|---|--------|----------|
| P1-01 | Ajouter `.env` au `.gitignore` et revoquer les cles actuelles | **Urgence** |
| P1-02 | Implementer verification du role cote serveur (RLS + middleware) — ne JAMAIS se fier au `sessionStorage` | **Urgence** |
| P1-03 | Ajouter RLS sur `allergies`, `conditions`, `care_plans`, `generated_documents` | **Urgence** |
| P1-04 | Restreindre RLS sur `communications`, `lab_alerts`, `guard_schedule` par role | **Urgence** |
| P1-05 | Rendre `audit_logs` immutable (supprimer UPDATE/DELETE, trigger only) | **Urgence** |
| P1-06 | Fermer `signUp` — acces par invitation uniquement | **Urgence** |
| P1-07 | Ajouter CSP headers | Haute |
| P1-08 | Chiffrer les donnees sensibles dans localStorage | Haute |
| P1-09 | Configurer rate limiting sur l'authentification | Haute |

### Phase 2 — Tests (BLOQUANT — Semaine 2-4)

| # | Action | Priorite |
|---|--------|----------|
| P2-01 | Ecrire tests unitaires pour AuthContext, OfflineQueue, AuditService, FHIR Adapter | **Urgence** |
| P2-02 | Ecrire tests composants pour les pages critiques (Triage, Pancarte, Board) | Haute |
| P2-03 | Configurer couverture de code (>80% sur lib/, >60% sur composants) | Haute |
| P2-04 | Mettre en place CI/CD (GitHub Actions) : lint + typecheck + tests | Haute |
| P2-05 | Ajouter tests E2E avec Playwright pour les parcours critiques | Moyenne |

### Phase 3 — Offline (Semaine 3-5)

| # | Action | Priorite |
|---|--------|----------|
| P3-01 | Migrer offline queue de localStorage vers IndexedDB (Dexie.js) | **Urgence** |
| P3-02 | Implementer cache des donnees patient en IndexedDB | Haute |
| P3-03 | Ajouter pre-cache des bundles JS/CSS dans le SW (workbox) | Haute |
| P3-04 | Implementer Background Sync API pour la queue offline | Haute |
| P3-05 | Self-host la police Inter (pas de CDN en offline) | Moyenne |
| P3-06 | Ajouter icones PNG au manifest | Moyenne |

### Phase 4 — Conformite (Semaine 4-8)

| # | Action | Priorite |
|---|--------|----------|
| P4-01 | Implementer export RPU normalise | Haute |
| P4-02 | Integrer teleservice INSi pour qualification identite | Haute |
| P4-03 | Ajouter validation FHIR (json-schema R4) | Moyenne |
| P4-04 | Implementer import FHIR (parser de ressources) | Moyenne |
| P4-05 | Developper mecanisme export/suppression RGPD | Haute |
| P4-06 | Implementer politique de retention des donnees | Moyenne |

### Phase 5 — UX & Performance (Semaine 5-8)

| # | Action | Priorite |
|---|--------|----------|
| P5-01 | Passer `defaultTheme` a `"dark"` | **Immediate** |
| P5-02 | Ajouter lazy loading (React.lazy + Suspense) sur toutes les pages | Haute |
| P5-03 | Activer les subscriptions realtime Supabase dans les composants | Haute |
| P5-04 | Ajouter RoleGuard granulaire (verifier le role specifique, pas juste "a un role") | Haute |
| P5-05 | Implementer des benchmarks pour les KPIs (chronometre, mesures) | Moyenne |
| P5-06 | Audit Lighthouse et correction accessibilite | Moyenne |
| P5-07 | Supprimer les dependances Radix inutilisees | Mineure |
| P5-08 | Renommer package.json name en "urgenceos" | Mineure |

---

## 13. MATRICE DE RISQUES

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Acces non autorise aux donnees patient via RLS ouvert | Elevee | **Critique** | P1-03, P1-04 |
| Usurpation de role via sessionStorage | Elevee | **Critique** | P1-02 |
| Perte de donnees en offline (localStorage 5MB) | Moyenne | **Critique** | P3-01, P3-02 |
| Inscription libre d'utilisateurs malveillants | Elevee | Haute | P1-06 |
| Logs d'audit modifiables (non-immutables) | Moyenne | Haute | P1-05 |
| Non-conformite RGPD (pas d'export/suppression) | Certaine | Haute | P4-05 |
| KPIs non mesurables en pre-production | Certaine | Moyenne | P5-05 |
| Absence de tests = regressions silencieuses | Elevee | Haute | P2-01 a P2-05 |

---

## 14. CONCLUSION

UrgenceOS est un **prototype prometteur** avec une architecture de donnees bien pensee (modele canonique, FHIR R4, types SIH complets). Cependant, il presente des **failles de securite critiques** (RLS ouvert, role client-side, signup libre), une **absence quasi-totale de tests**, un **offline non fonctionnel**, et des **KPIs non mesurables**.

**Le projet ne doit PAS etre deploye en production en l'etat.**

Les priorites immediates sont :
1. Corriger les failles de securite (RLS, auth, secrets)
2. Ecrire des tests (de 1 a minimum 50 tests significatifs)
3. Rendre l'offline fonctionnel (IndexedDB, cache patient, workbox)
4. Passer en mode sombre par defaut
5. Ajouter les integrations reelles (INS, RPU, MSSante)

Avec ces corrections, UrgenceOS aura le potentiel de devenir un outil genuinement utile pour les urgences hospitalieres.

---

*Rapport genere le 2026-02-11 par audit automatise — EMOTIONSCARE SASU*
*Branche : `claude/urgenceos-complete-audit-d7UGD`*
