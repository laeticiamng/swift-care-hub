# AUDIT COMPLET — UrgenceOS v0.0.0

**Date :** 15 février 2026
**Commanditaire :** EMOTIONSCARE SASU
**Auditeur :** Développeur principal UrgenceOS
**Périmètre :** Audit technique et non-technique complet du projet UrgenceOS
**URL actuelle :** https://flow-pulse-assist.lovable.app/ (à renommer → urgenceos.fr)

---

## TABLE DES MATIÈRES

1. [Synthèse exécutive](#1-synthèse-exécutive)
2. [Inventaire du projet](#2-inventaire-du-projet)
3. [Audit technique](#3-audit-technique)
   - 3.1 Stack et dépendances
   - 3.2 Architecture et qualité du code
   - 3.3 Sécurité
   - 3.4 Base de données et RLS
   - 3.5 PWA et offline-first
   - 3.6 Interopérabilité (FHIR, HL7v2, MSSanté, DMP)
   - 3.7 Modules métier
   - 3.8 Tests et couverture
   - 3.9 Build et performances
4. [Audit non-technique](#4-audit-non-technique)
   - 4.1 UX/UI
   - 4.2 Accessibilité (WCAG 2.1)
   - 4.3 Conformité réglementaire
   - 4.4 RGPD / Protection des données
   - 4.5 Certification et normes
5. [Matrice des risques](#5-matrice-des-risques)
6. [Plan de remédiation](#6-plan-de-remédiation)
7. [Conclusion](#7-conclusion)

---

## 1. SYNTHÈSE EXÉCUTIVE

### Verdict global : PROTOTYPE AVANCÉ — Non prêt pour la production

UrgenceOS est un prototype ambitieux et fonctionnellement riche pour la gestion des urgences hospitalières. Le projet démontre une connaissance approfondie du domaine médical (8 modules SIH, modèle canonique, interopérabilité FHIR/HL7v2) et une architecture technique moderne (React 18, TypeScript, Supabase, PWA).

**Cependant, des lacunes critiques empêchent un déploiement en milieu hospitalier :**

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Architecture | 7/10 | Bonne séparation des préoccupations, code splitting, modèle canonique |
| Sécurité | 4/10 | CSP partiel, pas de chiffrement offline, RLS à renforcer |
| Interopérabilité | 5/10 | FHIR/HL7 partiels, MSSanté/DMP = stubs non fonctionnels |
| Qualité du code | 6/10 | 215 erreurs ESLint, TypeScript en mode `strict: false` |
| Tests | 6/10 | 521 tests passent, mais couverture à 60% (insuffisant pour santé) |
| UX/Accessibilité | 4/10 | Pas de conformité WCAG 2.1 AA, risques d'accessibilité |
| Conformité réglementaire | 3/10 | Pas de certification HDS, LAP, ANSM |
| PWA/Offline | 6/10 | Service Worker fonctionnel, mais pas de chiffrement IndexedDB |

### Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Fichiers source TypeScript/TSX | 201 |
| Lignes de code estimées | ~31 000 |
| Pages | 30 |
| Composants | 102 |
| Services/Bibliothèques | 25+ |
| Tests | 521 (24 fichiers) |
| Migrations de base de données | 12 |
| Dépendances directes | 44 |
| Dépendances de développement | 28 |
| Vulnérabilités npm | 8 (4 modérées, 4 hautes) |
| Erreurs ESLint | 215 |
| Warnings ESLint | 19 |

---

## 2. INVENTAIRE DU PROJET

### 2.1 Structure des répertoires

```
swift-care-hub/
├── public/                          # Assets statiques & PWA
│   ├── manifest.json               # Manifeste PWA (fr, medical app)
│   ├── sw.js                       # Service Worker v2 (229 lignes)
│   ├── icons/                      # Icônes PWA (192px, 512px SVG)
│   └── robots.txt, sitemap.xml
├── src/
│   ├── main.tsx                    # Point d'entrée + enregistrement SW
│   ├── App.tsx                     # Routage + providers (208 lignes)
│   ├── pages/              (30)    # Pages avec lazy loading
│   ├── components/         (102)   # Composants UI + métier
│   │   ├── ui/             (58)    # Shadcn/UI
│   │   ├── urgence/        (29)    # Composants métier urgences
│   │   ├── landing/        (9)     # Page d'accueil marketing
│   │   ├── documents/      (1)     # CRH preview
│   │   ├── interop/        (1)     # FHIR viewer
│   │   └── prescriptions/  (10)    # Affichage prescriptions
│   ├── contexts/           (2)     # AuthContext + DemoContext
│   ├── hooks/              (2)     # use-mobile, use-toast
│   ├── lib/                (25+)   # Services métier
│   │   └── interop/        (8)     # Adaptateurs FHIR/HL7/MSSanté/DMP
│   ├── integrations/       (2)     # Client Supabase + types
│   └── test/               (25)    # Tests unitaires
├── supabase/
│   ├── config.toml                 # Configuration Supabase
│   ├── seed.sql                    # Données de démonstration
│   ├── migrations/         (12)    # Schéma BDD + RLS
│   └── functions/          (1)     # Edge Function (seed-data)
├── Configuration racine
│   ├── package.json                # v0.0.0, 44 deps, 28 devDeps
│   ├── vite.config.ts              # Port 8080, HMR overlay off
│   ├── vitest.config.ts            # jsdom, 60% coverage threshold
│   ├── tsconfig.json               # strict: false, strictNullChecks: false
│   ├── tailwind.config.ts          # Couleurs médicales, dark mode
│   ├── eslint.config.js            # TypeScript-eslint, react-hooks
│   ├── index.html                  # CSP, SEO, Schema.org
│   └── .env                        # Clés Supabase (anon key publique)
└── .lovable/plan.md                # Plan corrections Lovable
```

### 2.2 Pages de l'application (30)

**Pages publiques (16) :**
- Landing, Login, Demo, Demo Live, Features, Tarifs, FAQ, About, B2B, Blog, Sécurité
- Mentions Légales, Politique Confidentialité, CGU, SIH Validation, 404

**Pages protégées — cliniques (14) :**

| Route | Rôles autorisés | Fonction |
|-------|-----------------|----------|
| `/select-role` | Authentifié | Sélection du rôle |
| `/board` | Tous (5 rôles) | Panoramique des urgences |
| `/patient/:id` | Médecin, IOA, IDE | Dossier patient |
| `/triage` `/triage/:id` | Médecin, IOA | Triage IOA (CIMU 1-5) |
| `/pancarte/:id` | IDE | Pancarte infirmière |
| `/as` `/constantes` | AS, IDE | Saisie constantes |
| `/accueil` `/admission` | Secrétaire | Accueil / admission |
| `/ioa-queue` | Médecin, IOA | File d'attente IOA |
| `/recap/:id` | Médecin, IOA, IDE | Synthèse patient |
| `/interop` | Médecin | Export FHIR/HL7 |
| `/garde` | Médecin, IOA, IDE | Vue de garde |
| `/audit` | Médecin | Logs d'audit |
| `/statistics` | Médecin, IOA, IDE | KPIs / Statistiques |
| `/prescriptions` | Médecin | Board prescriptions |

### 2.3 Les 5 rôles cliniques

| Rôle | Code | Périmètre |
|------|------|-----------|
| Médecin urgentiste | `medecin` | Prescriptions, validation, audit, interop |
| Infirmier(e) Organisateur d'Accueil | `ioa` | Triage CIMU, file d'attente, timeline |
| Infirmier(e) Diplômé(e) d'État | `ide` | Pancarte, administrations, transmissions |
| Aide-Soignant(e) | `as` | Saisie constantes vitales uniquement |
| Secrétaire médicale | `secretaire` | Accueil, admission, données administratives |

---

## 3. AUDIT TECHNIQUE

### 3.1 Stack et dépendances

**Stack principale :**

| Couche | Technologie | Version | Statut |
|--------|-------------|---------|--------|
| Frontend | React | 18.3.1 | OK |
| Langage | TypeScript | 5.8.3 | OK |
| Bundler | Vite | 5.4.19 | OK |
| UI | Shadcn/UI + Tailwind CSS | 3.4.17 | OK |
| Backend | Supabase (BaaS) | 2.95.3 | OK |
| Data fetching | TanStack React Query | 5.83.0 | OK |
| Formulaires | React Hook Form + Zod | 7.61 / 3.25 | OK |
| Routage | React Router | 6.30.1 | **VULNÉRABLE** |
| Graphiques | Recharts | 2.15.4 | OK |
| Thème | next-themes | 0.3.0 | OK |
| Icônes | Lucide React | 0.462.0 | OK |

**Vulnérabilités npm (8 trouvées) :**

| Package | Sévérité | Description |
|---------|----------|-------------|
| `react-router` / `@remix-run/router` | **HAUTE** | XSS via Open Redirects (GHSA-2w69-qvjg-hvjx) |
| `esbuild` / `vite` | Modérée | Requêtes vers le serveur dev depuis n'importe quel site |
| `glob` | **HAUTE** | Injection de commande via CLI |
| `js-yaml` | Modérée | Prototype pollution dans merge |
| `lodash` | Modérée | Prototype pollution dans `_.unset` / `_.omit` |

**Action requise :** `npm audit fix` corrige toutes les vulnérabilités. La vulnérabilité react-router (XSS Open Redirect) est **critique** pour une application de santé.

### 3.2 Architecture et qualité du code

#### Points forts

- **Code splitting exemplaire** : Toutes les 30 pages sont lazy-loadées via `React.lazy()` avec `Suspense`
- **Séparation des préoccupations** : Pages / Composants / Services / Contexts bien isolés
- **Modèle canonique** : Un modèle de données unique (`canonical-model.ts`) fait office de source de vérité
- **Providers bien structurés** : ThemeProvider → QueryClientProvider → AuthProvider → DemoProvider → Routes
- **ErrorBoundary global** : Capture les erreurs React non interceptées avec UI de récupération

#### Problèmes identifiés

**P1 — TypeScript en mode permissif (`strict: false`) :**
```json
// tsconfig.app.json
"strict": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noImplicitAny": false,
"strictNullChecks": false
```
**Impact :** Les erreurs de null/undefined ne sont pas détectées à la compilation. Dans un contexte médical, un `patient.weight_kg` accidentellement `undefined` peut provoquer un calcul de dose pédiatrique incorrect.

**P2 — 215 erreurs ESLint :**
- 196 erreurs `@typescript-eslint/no-explicit-any` (types `any` partout)
- 19 warnings `react-refresh/only-export-components`
- Usage de `require()` dans tailwind.config.ts

**P3 — Pas de React.StrictMode :**
```tsx
// main.tsx
createRoot(document.getElementById("root")!).render(<App />);
// Devrait être : <React.StrictMode><App /></React.StrictMode>
```

**P4 — Race condition dans AuthContext :**
```tsx
// setTimeout(0) pour fetchUserRoles → pas de garantie d'ordre
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => { fetchUserRoles(session.user.id); }, 0);
});
// + getSession() appelle aussi fetchUserRoles → doublon possible
```

**P5 — Pas de validation des entrées côté serveur :**
- `server-role-guard.ts` existe mais utilise le client Supabase côté frontend
- Ce n'est PAS une vérification serveur — c'est un appel API depuis le client
- Les Supabase RLS sont la seule vraie protection serveur

**P6 — Le `queryClient` a un `staleTime` de 10s :**
Adapté au contexte médical (données fraîches) mais peut causer des requêtes excessives sur les pages avec beaucoup de composants.

### 3.3 Sécurité

#### Ce qui est en place (positif)

| Mesure | Implémentation |
|--------|---------------|
| CSP (Content Security Policy) | Meta tag dans index.html |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer Policy | strict-origin-when-cross-origin |
| Session timeout | 30 min inactivité → auto-déconnexion |
| RLS Supabase | Activé sur les tables principales |
| Anti-self-insertion de rôles | Trigger PostgreSQL |
| Accès limité aux encounters terminés | Grace period 24h |
| Audit trail M8 | Logging exhaustif (qui, quand, quoi, quel patient) |
| HTTPS uniquement | Via Supabase + Lovable hosting |
| Mot de passe | Min 8 caractères + vérification HaveIBeenPwned |

#### Vulnérabilités critiques

**V1 — CRITIQUE : Données offline non chiffrées**
- IndexedDB stocke les données patients en clair (noms, allergies, constantes)
- Accessible via DevTools → Application → IndexedDB
- Un script XSS peut exfiltrer toutes les données offline
- **Recommandation :** Chiffrement AES-256 avec clé dérivée du JWT utilisateur

**V2 — HAUTE : Vulnérabilité XSS react-router**
- `react-router-dom@6.30.1` est vulnérable aux Open Redirects
- Un attaquant peut crafted une URL qui redirige vers un site malveillant
- **Recommandation :** Mettre à jour vers `react-router-dom@6.31+`

**V3 — HAUTE : CSP autorise `'unsafe-inline'` pour les scripts**
```html
script-src 'self' 'unsafe-inline'
```
- Rend la CSP inefficace contre les injections XSS
- Causé par le Schema.org JSON-LD inline dans index.html
- **Recommandation :** Déplacer les scripts JSON-LD dans des fichiers externes ou utiliser des nonces

**V4 — HAUTE : Grace period RLS trop permissive**
```sql
-- Tout staff clinique peut accéder aux encounters terminés pendant 24h
-- Devrait être limité au staff assigné au patient
```

**V5 — MOYENNE : Rate limiter côté client uniquement**
- Le `checkRateLimit()` dans `server-role-guard.ts` est une Map en mémoire JavaScript
- Réinitialisée à chaque rechargement de page → inefficace
- Pas de rate limiting côté Supabase

**V6 — MOYENNE : Clés Supabase dans `.env` commité**
- Le fichier `.env` contient la clé anon (publique) — c'est normal pour Supabase
- Mais le projet ID expose l'infrastructure
- **Recommandation :** Ajouter `.env` au `.gitignore` et utiliser des variables d'environnement CI/CD

**V7 — MOYENNE : Pas d'encryption at rest pour les colonnes PII**
- Noms, téléphones, adresses des patients stockés en clair dans PostgreSQL
- Supabase supporte pgcrypto — non utilisé
- **Recommandation :** Chiffrement des colonnes PII (nom, prenom, telephone, adresse)

### 3.4 Base de données et RLS

#### Schéma principal (12 migrations)

| Table | Fonction | RLS |
|-------|----------|-----|
| `patients` | Données démographiques | Oui |
| `encounters` | Passages aux urgences | Oui (scoped) |
| `prescriptions` | Ordonnances | Oui (medecin) |
| `administrations` | Administration médicaments | Oui (ide) |
| `vitals` | Constantes vitales | Oui |
| `profiles` | Profils utilisateurs | Oui |
| `user_roles` | Rôles (RBAC) | Oui (anti-self-insert) |
| `audit_logs` | Traçabilité (M8) | Oui (immutable) |
| `timeline_entries` | Chronologie patient (M2) | Oui |
| `lab_alerts` | Seuils d'alerte biologie (M3) | Oui |
| `homonymy_alerts` | Alertes homonymes | Oui |
| `communication_entries` | Transmissions | Oui |
| `oral_prescriptions` | Prescriptions orales | Oui |

#### Problèmes identifiés

**BDD-1 — Pas de contraintes CHECK sur les constantes vitales :**
```sql
-- Il manque :
-- CHECK (temperature BETWEEN 32.0 AND 45.0)
-- CHECK (heart_rate BETWEEN 20 AND 300)
-- CHECK (systolic BETWEEN 40 AND 300)
-- CHECK (spo2 BETWEEN 0 AND 100)
```
Un typo (FC = 5 au lieu de 50) serait accepté et déclencherait de fausses alertes.

**BDD-2 — Pas de politique de rétention des données :**
- Les encounters terminés restent indéfiniment
- La loi française impose une durée de conservation de 20 ans pour les dossiers médicaux (CSP R1112-7)
- Mais aussi une suppression automatique après ce délai
- Aucune procédure de purge n'est implémentée

**BDD-3 — Le champ `ins_status` est TEXT et non ENUM :**
- Accepte n'importe quelle chaîne de caractères
- Devrait être un type ENUM PostgreSQL (`provisoire`, `qualifie`, `invalide`)

**BDD-4 — Pas de transaction atomique pour le triage :**
- Création patient → vitales → encounter → timeline : 4 INSERT séparés
- Si l'un échoue, les autres restent → état incohérent

### 3.5 PWA et offline-first

#### Service Worker (sw.js)

| Stratégie | Usage | Évaluation |
|-----------|-------|------------|
| Pre-cache | App shell (/, index.html, manifest, icons) | OK |
| Network-first | Navigation (SPA fallback) | OK |
| Cache-first | Assets statiques (JS, CSS, images, fonts) | OK |
| Stale-while-revalidate | API REST Supabase | OK |
| Background sync | Queue de mutations offline | Partiel |
| Push notifications | Alertes critiques (structure, pas de UI) | Stub |

#### Problèmes PWA

**PWA-1 — Pas de chiffrement IndexedDB** (cf. V1)

**PWA-2 — Pas de UI pour les push notifications :**
- Le SW gère `push` et `notificationclick`
- Mais l'application ne demande jamais la permission
- Pas de bouton "Activer les notifications" dans l'interface

**PWA-3 — Background sync non garanti :**
```javascript
// Le SW envoie un message aux clients pour syncer
// Mais si l'app est fermée, les messages ne sont pas reçus
self.addEventListener('sync', (event) => {
  // Envoie 'SYNC_OFFLINE_QUEUE' aux clients...
  // qui doivent être ouverts pour le recevoir
});
```
**Recommandation :** Implémenter la sync directement dans le SW (pas via postMessage).

**PWA-4 — Pas de gestion de version du cache :**
- Le versionnement `urgenceos-v2` est statique
- Pas de mécanisme pour forcer la mise à jour du cache après un déploiement
- L'utilisateur pourrait garder une version obsolète indéfiniment

**PWA-5 — Offline queue dans localStorage (limite 5 Mo) :**
- Les mutations offline sont stockées dans localStorage
- Limite de 5 Mo → insuffisant si de nombreuses prescriptions créées offline
- L'IndexedDB est implémenté (`offline-db.ts`) mais pas utilisé par l'app

**PWA-6 — Pas de résolution de conflits :**
- Stratégie last-write-wins → perte de données potentielle
- 2 soignants modifient le même patient en offline → le second écrase le premier

### 3.6 Interopérabilité

#### FHIR R4 (`fhir-adapter.ts`)

| Ressource | Implémenté | Conforme R4 |
|-----------|-----------|-------------|
| Patient | Oui | Partiel (manque meta.profile, narrative) |
| Encounter | Oui | Partiel (manque Diagnosis, Location) |
| Observation (vitals) | Oui | OK (LOINC codes) |
| MedicationRequest | Oui | Partiel (manque timing, asNeeded) |
| ServiceRequest | Oui | OK |
| Condition | Oui | Partiel (manque category) |
| AllergyIntolerance | Oui | Partiel (manque criticality) |
| Procedure | Oui | OK |
| DiagnosticReport | Oui | Partiel |
| Bundle | Oui | OK (type: collection) |

**Lacunes FHIR :** Pas de narrative text (XHTML `text.div`) obligatoire. Pas de validation des bundles générés contre le schéma FHIR R4 officiel. Pas de meta.profile. Codes ATC mais pas CIP/CIS pour le contexte français.

#### HL7v2 (`hl7v2-adapter.ts`)

| Message | Implémenté | Conforme v2.5 |
|---------|-----------|---------------|
| ADT^A01 (admission) | Oui | Partiel (manque PV2, DG1) |
| ADT^A02 (transfert) | Oui | OK |
| ADT^A03 (sortie) | Oui | OK |
| ORM^O01 (demande exam) | Oui | Partiel (manque OBX enfants) |
| ORU^R01 (résultats) | Parsing | Fragile (assume ordre PID→OBX) |

**Lacunes HL7 :** Pas de message ACK. ID de message basé sur timestamp seul (collision possible). Parsing ORU fragile — ne gère pas les variations de format entre LIMS.

#### MSSanté (`mssante-adapter.ts`)

**Statut : STUB — Non fonctionnel**

Le module génère des structures de données (CRH HTML, RPU) mais :
- Aucune implémentation du protocole MSSanté (S/MIME, SMTP sécurisé)
- Pas de certificat de professionnel de santé
- Pas de signature électronique
- La conversion IV→PO est codée en dur (décision clinique, pas algorithmique)

#### DMP (`dmp-connector.ts`)

**Statut : STUB — Non fonctionnel**

Le module génère du CDA R2 (XML) et des enveloppes XDS.b mais :
- CDA en body non structuré (HTML base64 au lieu de structuredBody)
- Enveloppe SOAP 1.2 au lieu de 1.1 (incompatible DMP)
- Pas de signature numérique XML (xmldsig)
- Pas de gestion des certificats
- Pas de suivi de statut d'envoi (pending/sent/acknowledged/rejected)

### 3.7 Modules métier

#### M1 — Identito-vigilance (`identito-vigilance.ts`)

| Fonctionnalité | Implémenté | Évaluation |
|----------------|-----------|------------|
| Vérification identité (9 checks) | Oui | Bon |
| INS format validation | Oui | OK (regex 15 chiffres) |
| Cross-validation traits stricts | Oui | Bon (nom, prénom, DDN, sexe) |
| Normalisation diacritiques | Oui | OK (NFD + remove) |
| Bracelet patient (ZPL) | Oui | Basique |
| NNO (patient non identifié) | Oui | OK |
| Score d'identité (0-100) | Oui | OK |
| Homonyme detection | Oui | OK (Levenshtein + Soundex) |

**Lacunes :** Pas de connexion réelle au téléservice INSi. Le score est calculé localement, pas validé par un tiers de confiance.

#### M2 — Timeline patient

Implémentée avec `timeline_entries` en base et 3 composants d'affichage (SIHTimeline, UnifiedTimeline, PatientTimeline). Validation des entrées par le médecin.

#### M3 — Alertes biologie (`lab-alerts.ts`)

**Problèmes :**
- Seuils codés en dur (pas spécifiques à l'automate du labo)
- Pas de normalisation des analytes par code LOINC
- Pas d'ajustement âge/sexe (hémoglobine H vs F)
- Matching par sous-chaîne (`"Na+"` matche aussi `"Na+ urine"`)

#### M4 — Prescriptions (`prescription-types.ts`)

14 types de prescriptions supportés : médicament, perfusion, titration, conditionnel, oxygène, exam bio, exam imagerie, exam ECG, exam autre, surveillance, régime, mobilisation, dispositif, avis spécialisé.

**Problèmes :**
- Métadonnées stockées en JSON dans le champ `notes` (pas de colonnes typées)
- Conditions de déclenchement en texte libre (`"si EVA > 6"`)
- Pas de suivi de dose cumulative pour conditionnel/titration
- Packs de prescriptions non validés par un pharmacien

#### M5 — Prescriptions orales

Entrée et validation dans les 24h. Table dédiée `oral_prescriptions`.

#### M6 — Transmissions IDE (Pancarte)

Interface complète avec transmissions DAR, mais format non validé contre les standards HEGP.

#### M7 — Interopérabilité

Cf. section 3.6 ci-dessus.

#### M8 — Audit et traçabilité (`audit-service.ts`)

Queue en mémoire avec flush toutes les 5 secondes. Flush immédiat pour les actions critiques (prescription, administration, identité, alerte critique). Logging : qui, quand, quel patient (IPP), quel poste, quel module, quelle action.

**Problème :** Si le navigateur est fermé avant le flush, les entrées en queue sont perdues.

### 3.8 Tests et couverture

**Résultats :** 24 fichiers de tests, **521 tests, 100% passent**

| Suite | Tests | Statut |
|-------|-------|--------|
| Identito-vigilance | 34 | OK |
| Prescription types | 34 | OK |
| Coding systems | 32 | OK |
| FHIR adapter (lib) | 30 | OK |
| MSSanté adapter | 28 | OK |
| Vitals utils | 28 | OK |
| Lab alerts | 26 | OK |
| Pediatric prescriptions | 25 | OK |
| Form builder | 25 | OK |
| HL7v2 adapter | 24 | OK |
| PSMI generator | 24 | OK |
| INS service | 22 | OK |
| DMP connector | 22 | OK |
| AI triage | 19 | OK |
| Allergy check (×2) | 37 | OK |
| FHIR adapter (test) | 18 | OK |
| Homonymy detection (×2) | 34 | OK |
| FHIR import | 15 | OK |
| RPU export | 16 | OK |
| Offline queue | 13 | OK |
| Audit service | 9 | OK |
| Example | 6 | OK |

**Lacunes de test :**
- **Seuil de couverture à 60%** — insuffisant pour un logiciel de santé (cible : 80%+)
- Aucun test E2E (Playwright/Cypress)
- Aucun test des politiques RLS (sécurité base de données)
- Aucun test de composants React (pages, formulaires)
- Pas de test d'intégration FHIR (validation contre schéma officiel)
- Pas de test de performance/charge

### 3.9 Build et performances

**Build de production :**
```
✓ built in 14.99s
Total : ~1.3 Mo (gzip ~430 Ko)
```

**Chunks problématiques :**

| Chunk | Taille | Gzippé | Problème |
|-------|--------|--------|----------|
| `index.js` (vendor) | 524 Ko | 158 Ko | > 500 Ko (warning Vite) |
| `prescription-types.js` | 386 Ko | 107 Ko | Énorme — contient les packs de prescriptions |
| `PatientDossierPage.js` | 105 Ko | 28 Ko | Page complexe |
| `LoginPage.js` | 60 Ko | 14 Ko | Anormalement gros pour un login |

**Recommandations :**
- Séparer `prescription-types` en données statiques (JSON importé dynamiquement)
- Configurer `build.rollupOptions.output.manualChunks` pour splitter les vendors (React, Radix, Recharts)
- Analyser la taille de LoginPage (potentiellement des dépendances inutiles)

---

## 4. AUDIT NON-TECHNIQUE

### 4.1 UX/UI

#### Points forts

- **Interface adaptative par rôle** : Chaque profil a une vue dédiée (médecin, IOA, IDE, AS, secrétaire)
- **Dark mode** natif avec `next-themes`
- **Système de design cohérent** : Shadcn/UI + couleurs médicales (critical, warning, success, info, inactive)
- **Grandes cibles tactiles pour les AS** : Boutons 64px+ pour la saisie de constantes
- **Code splitting** : Chargement rapide par page
- **Board panoramique** avec vue par zone et statut en temps réel
- **Mode démonstration** sans inscription

#### Problèmes UX

**UX-1 — Incohérence données réelles vs démo :**
- Certaines pages (Board, Triage, Pancarte) utilisent Supabase en mode réel
- D'autres (Statistics) sont 100% démo avec données statiques
- L'utilisateur ne peut pas distinguer les deux modes

**UX-2 — Formulaire de triage complexe :**
- 5 étapes (Identité → Motif → Constantes → CIMU → Orientation)
- Pas de sauvegarde intermédiaire → tout est perdu si le navigateur crash
- Sélection CIMU en 5 boutons sans navigation clavier

**UX-3 — Pancarte surchargée :**
- Page de 34 Ko (minifiée) avec 7 sections de prescriptions
- Scrolling long sur mobile
- Pas de navigation par onglets entre sections

**UX-4 — Erreurs silencieuses :**
- Les mutations Supabase échouées ne montrent souvent aucun feedback utilisateur
- Pas de mécanisme de retry visible

**UX-5 — Disclaimer médical intrusif :**
- Bandeau fixé en bas de toutes les pages (y compris login)
- Bouton de fermeture trop petit (14×14px)
- Masque du contenu sur mobile

**UX-6 — URL actuelle non professionnelle :**
- `flow-pulse-assist.lovable.app` ne correspond pas au produit
- Doit être migrée vers `urgenceos.fr` (mentionné dans les meta OG)

### 4.2 Accessibilité (WCAG 2.1)

**Niveau de conformité actuel : Non conforme WCAG 2.1 AA**

| Critère WCAG | Statut | Détail |
|--------------|--------|--------|
| 1.1.1 Non-text Content | Échec | Icônes sans `aria-label` |
| 1.3.1 Info and Relationships | Échec | Listes sans `role="list"`, tables sans `scope` |
| 1.4.1 Use of Color | Échec | CCMU/CIMU communiqués uniquement par couleur |
| 1.4.3 Contrast (AA) | Non vérifié | Couleurs médicales non testées |
| 2.1.1 Keyboard | Échec | Pas de navigation clavier sur sélection CIMU |
| 2.1.2 No Keyboard Trap | Non vérifié | Modales sans gestion du focus |
| 2.3.1 Three Flashes | **ÉCHEC CRITIQUE** | Animation pulse plein écran lors d'alertes vitales |
| 2.4.1 Bypass Blocks | Échec | Pas de skip link |
| 2.4.3 Focus Order | Non vérifié | Tab order non testé |
| 3.3.1 Error Identification | Échec | Messages d'erreur génériques |
| 4.1.2 Name, Role, Value | Échec | Boutons icône-seul sans nom accessible |

**ALERTE CRITIQUE — Risque épileptique (WCAG 2.3.1) :**
La page AideSoignantPage déclenche une animation `animate-pulse` plein écran avec bordure rouge clignotante quand une constante anormale est détectée. Cela peut provoquer des crises d'épilepsie photosensible. Aucune vérification `prefers-reduced-motion` n'est en place.

**Recommandations accessibilité prioritaires :**
1. Ajouter `@media (prefers-reduced-motion: reduce)` pour désactiver les animations
2. Ajouter `aria-label` sur tous les boutons icône-seul
3. Implémenter des skip links sur toutes les pages
4. Compléter les indicateurs de couleur avec du texte/icônes
5. Tester le contraste de toutes les couleurs médicales
6. Auditer avec axe-core / Lighthouse

### 4.3 Conformité réglementaire

#### Référentiels applicables

| Référentiel | Statut | Commentaire |
|-------------|--------|-------------|
| **HDS** (Hébergement Données de Santé) | Non certifié | Supabase n'est pas certifié HDS. Migration nécessaire vers un hébergeur HDS (OVHcloud, Scaleway, Azure France) |
| **LAP v5** (Logiciel d'Aide à la Prescription) | Non certifié | Certification HAS obligatoire avant usage clinique |
| **RNIV** (Référentiel National d'Identitovigilance) | Partiel | Identito-vigilance implémentée mais pas de connexion INSi |
| **CI-SIS** (Cadre d'Interopérabilité) | Partiel | FHIR R4 et HL7v2 partiels, DMP/MSSanté = stubs |
| **SFMU** (Société Française de Médecine d'Urgence) | Partiel | Motifs SFMU corrects, mais algorithme CIMU non validé |
| **RPU ATIH** | Partiel | Génération XML mais pas de validation contre XSD ATIH |
| **ANSM** (Dispositif Médical) | Non applicable | Disclaimer indique "pas un dispositif médical" |
| **CNIL / RGPD** | Partiel | Cf. section 4.4 |

### 4.4 RGPD / Protection des données

#### Ce qui est en place

| Article RGPD | Implémentation |
|-------------|----------------|
| Art. 15 — Droit d'accès | `rgpd-service.ts` : export JSON du dossier patient |
| Art. 17 — Droit à l'effacement | Table `data_deletion_requests` + workflow |
| Art. 20 — Portabilité | Export JSON structuré |
| Art. 25 — Privacy by design | RLS Supabase, RBAC, audit trail |
| Art. 32 — Sécurité | CSP, HTTPS, session timeout |
| Art. 35 — AIPD | Non réalisée |
| Consentement cookies | Bandeau RGPD avec 3 catégories |

#### Lacunes RGPD

**RGPD-1 — Pas d'AIPD (Analyse d'Impact) :**
Obligatoire pour les traitements de données de santé à grande échelle (CNIL).

**RGPD-2 — Consentement cookies contradictoire :**
- "Refuser tout" stocke quand même le refus en localStorage
- Le consentement devrait être un opt-in affirmé (pas d'opt-out qui stocke)

**RGPD-3 — Minimisation des données insuffisante :**
- Toutes les données patient sont affichées à tous les rôles autorisés
- Un secrétaire voit les allergies (données de santé sensibles) alors qu'il n'en a pas besoin
- Le RBAC filtre les pages, pas les champs

**RGPD-4 — Pas de DPO (Délégué à la Protection des Données) identifié :**
- Aucune mention dans les CGU ou la politique de confidentialité
- Obligatoire si traitement de données de santé

**RGPD-5 — Pas de registre des traitements documenté :**
- L'audit_logs est un bon début mais ne constitue pas le registre RGPD

### 4.5 Certifications et normes

**Tableau récapitulatif des certifications requises :**

| Certification | Obligatoire ? | Statut | Action |
|--------------|--------------|--------|--------|
| HDS | **Oui** (hébergement santé) | Non | Migrer vers hébergeur HDS |
| LAP v5 | **Oui** (aide prescription) | Non | Audit HAS + certification |
| Marquage CE (DM) | Non (outil d'aide, pas DM) | N/A | Maintenir le disclaimer |
| FHIR R4 Conformance | Recommandé | Partiel | Valider les profils |
| HL7 France Connectathon | Recommandé | Non | Tester avec éditeurs SIH |
| ANS Référencement | Recommandé | Non | Dossier de conformité |

---

## 5. MATRICE DES RISQUES

### Risques critiques (action immédiate)

| # | Risque | Impact | Probabilité | Action |
|---|--------|--------|-------------|--------|
| R1 | Données offline non chiffrées | Fuite données santé | Haute | Chiffrement IndexedDB AES-256 |
| R2 | Animation épileptogène (WCAG 2.3.1) | Crise épileptique utilisateur | Moyenne | Désactiver avec `prefers-reduced-motion` |
| R3 | Vulnérabilité XSS react-router | Redirection malveillante | Haute | `npm audit fix` immédiat |
| R4 | Pas de certification HDS | Illégalité hébergement | Certaine (en prod) | Migration hébergeur HDS |
| R5 | MSSanté/DMP = stubs | Pas d'interopérabilité réelle | Certaine | Implémenter ou retirer de l'UI |

### Risques hauts (sprint suivant)

| # | Risque | Impact | Probabilité | Action |
|---|--------|--------|-------------|--------|
| R6 | TypeScript strict:false | Bugs null/undefined | Haute | Activer strictNullChecks progressivement |
| R7 | Pas de test E2E | Régressions non détectées | Haute | Implémenter Playwright |
| R8 | CSP unsafe-inline | XSS possible | Moyenne | Nonces CSP ou externaliser scripts |
| R9 | Pas de validation FHIR | Bundles invalides | Haute | Intégrer validateur FHIR officiel |
| R10 | Grace period RLS trop large | Accès non autorisé | Moyenne | Restreindre au staff assigné |
| R11 | 215 erreurs ESLint | Dette technique | Continue | Corriger par batch |
| R12 | Chunks > 500 Ko | Performance chargement | Moyenne | Configurer manualChunks |

### Risques moyens (roadmap)

| # | Risque | Impact | Action |
|---|--------|--------|--------|
| R13 | Pas d'AIPD CNIL | Non-conformité RGPD | Réaliser l'AIPD |
| R14 | Pas de LAP v5 | Usage prescription illégal | Audit HAS |
| R15 | Seuils labo codés en dur | Fausses alertes | Configurable en BDD |
| R16 | Calcul poids pédiatrique simpliste | Erreur de dosage (5-10%) | Courbes OMS |
| R17 | Pas d'i18n | Pas d'internationalisation | Intégrer i18next |

---

## 6. PLAN DE REMÉDIATION

### Phase 1 — Sécurité critique (immédiat)

- [ ] `npm audit fix` pour corriger les 8 vulnérabilités
- [ ] Désactiver l'animation pulse plein écran + ajouter `prefers-reduced-motion`
- [ ] Chiffrer IndexedDB (AES-256, clé dérivée du JWT)
- [ ] Remplacer `'unsafe-inline'` dans la CSP par des nonces
- [ ] Restreindre la grace period RLS au staff assigné

### Phase 2 — Qualité du code (sprint 1)

- [ ] Activer `strictNullChecks: true` dans tsconfig et corriger les erreurs
- [ ] Corriger les 215 erreurs ESLint (par batch de fichiers)
- [ ] Ajouter `<React.StrictMode>` dans main.tsx
- [ ] Configurer `manualChunks` dans Vite pour les vendors
- [ ] Extraire les données de `prescription-types` en JSON chargé dynamiquement
- [ ] Fixer la race condition `setTimeout(0)` dans AuthContext

### Phase 3 — Accessibilité (sprint 2)

- [ ] Ajouter `aria-label` sur tous les boutons icône-seul
- [ ] Implémenter des skip links
- [ ] Compléter les indicateurs couleur avec texte/icônes
- [ ] Tester le contraste de toutes les couleurs médicales (axe-core)
- [ ] Ajouter la gestion du focus dans les modales
- [ ] Agrandir les cibles tactiles à 48×48px minimum

### Phase 4 — Tests et validation (sprint 3)

- [ ] Monter le seuil de couverture à 80%
- [ ] Ajouter des tests E2E avec Playwright
- [ ] Tester les politiques RLS (pgTAP)
- [ ] Valider les bundles FHIR contre le schéma officiel
- [ ] Ajouter des tests de composants React (pages critiques)

### Phase 5 — Interopérabilité (sprints 4-6)

- [ ] Compléter l'export FHIR R4 (narrative, meta.profile, dosage timing)
- [ ] Ajouter les segments PV2/DG1 dans HL7v2
- [ ] Implémenter la vraie connexion MSSanté (S/MIME) ou retirer de l'UI
- [ ] Implémenter la soumission DMP structurée (CDA R2 structuredBody)
- [ ] Tester avec un connectathon HL7 France

### Phase 6 — Conformité réglementaire (continu)

- [ ] Réaliser l'AIPD (CNIL)
- [ ] Identifier et nommer un DPO
- [ ] Migrer vers un hébergeur HDS (OVHcloud, Scaleway)
- [ ] Préparer le dossier de certification LAP v5
- [ ] Renommer l'URL de `flow-pulse-assist.lovable.app` vers `urgenceos.fr`

---

## 7. CONCLUSION

UrgenceOS est un **prototype techniquement ambitieux** qui démontre une compréhension profonde des besoins métier des urgences hospitalières françaises. Le modèle canonique, l'architecture RBAC à 5 rôles, le système d'audit M8, et les 521 tests unitaires passants constituent une base solide.

**Le projet n'est cependant pas prêt pour un déploiement clinique** en raison de :

1. **Lacunes de sécurité** (données offline non chiffrées, CSP permissive, vulnérabilités npm)
2. **Non-conformité réglementaire** (pas de HDS, pas de LAP v5, AIPD manquante)
3. **Interopérabilité incomplète** (MSSanté et DMP sont des stubs)
4. **Accessibilité défaillante** (risque épileptique, pas de conformité WCAG)
5. **TypeScript en mode permissif** (strict: false → bugs potentiels non détectés)

La remédiation est réalisable avec un plan structuré en 6 phases. Les phases 1 et 2 (sécurité + qualité du code) sont les prérequis absolus avant toute démonstration en milieu hospitalier.

---

*Rapport généré le 15 février 2026 — UrgenceOS v0.0.0*
*EMOTIONSCARE SASU — Tous droits réservés*
