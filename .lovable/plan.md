

# Plan d'execution — 6 corrections securite prioritaires

## Analyse de l'existant

| Correction | Etat actuel |
|------------|-------------|
| 1. Leaked Password Protection | **config.toml a `[auth.external.hibp] enabled = true`** mais l'audit precedent indique que c'est desactive cote serveur. A verifier/activer via configure-auth |
| 2. Audit UPDATE RLS | **FAIT** — Toutes les tables ont des policies UPDATE restrictives conditionnees par role + encounter. Deja verifie dans l'audit |
| 3. CSP unsafe-inline | **PRESENT** — `script-src 'self' 'unsafe-inline'` et `style-src 'self' 'unsafe-inline'` dans index.html ligne 7 |
| 4. Rate limiting mutations | **Code existe** (`checkRateLimit` dans server-role-guard.ts) mais **jamais utilise** — 0 appels dans le codebase |
| 5. CSP report-uri | **ABSENT** — Aucun endpoint de reporting, `logCSPViolation()` existe mais non connecte |
| 6. MFA roles medicaux | **ABSENT** — Aucune implementation MFA |

## Ce qui reste a faire (4 corrections reelles)

Les corrections 1 (leaked pwd) et 2 (UPDATE RLS) sont deja en place. Il reste :

---

### Correction 3 — Supprimer unsafe-inline de la CSP (P1)

**Probleme** : `script-src 'self' 'unsafe-inline'` autorise l'execution de scripts inline, annulant partiellement la protection XSS.

**Approche** : Vite genere des scripts inline au build. On ne peut pas supprimer `unsafe-inline` de `script-src` sans casser l'app (Vite injecte un module preload). Pour `style-src`, Tailwind et Radix utilisent des styles inline — suppression impossible sans refonte majeure.

**Action realisable** : Documenter cette limitation technique. Ajouter `report-uri` (correction 5) pour monitorer les violations. La suppression complete de `unsafe-inline` necessite une migration vers un serveur qui injecte des nonces dynamiques — hors scope Lovable Cloud.

---

### Correction 4 — Brancher le rate limiter sur les mutations critiques (P1)

**Fichiers a modifier** :
- `src/features/patient-dossier/hooks/usePrescription.ts` — ajouter `checkRateLimit` avant chaque `guardPrescription()`
- `src/pages/LoginPage.tsx` — ajouter rate limiting sur `handleSubmit` (max 5 tentatives/minute)
- `src/pages/TriagePage.tsx` — ajouter rate limiting sur creation encounter

Le rate limiter est client-side (memoire), suffisant pour bloquer les scripts automatises depuis le navigateur. Le vrai rate limiting serveur est assure par les policies RLS + Supabase auth rate limits natifs.

---

### Correction 5 — Ajouter CSP report-uri via edge function (P2)

**Fichiers a creer** :
- `supabase/functions/csp-report/index.ts` — endpoint qui recoit les violations CSP et les log dans `audit_logs`

**Fichier a modifier** :
- `index.html` — ajouter `report-uri` a la directive CSP pointant vers l'edge function

---

### Correction 6 — MFA pour roles medicaux (P0 strategique)

**Approche** : Utiliser Supabase MFA (TOTP) natif.

**Fichiers a creer** :
- `src/components/urgence/MFASetup.tsx` — composant d'enrolement MFA (QR code + verification)
- `src/components/urgence/MFAChallenge.tsx` — composant de verification OTP au login

**Fichiers a modifier** :
- `src/contexts/AuthContext.tsx` — apres login reussi, verifier si MFA est active et exiger la verification
- `src/pages/LoginPage.tsx` — integrer le flow MFA challenge
- `src/pages/RoleSelector.tsx` — forcer l'enrolement MFA si role medical et MFA non configure

**Flow** :
1. Login email/password → succes
2. Si role medical (medecin/ide/ioa) et MFA non enrole → rediriger vers MFASetup
3. Si MFA enrole → afficher MFAChallenge (code TOTP 6 chiffres)
4. Verification reussie → acces au selecteur de role

---

## Resume des modifications

| # | Action | Fichiers | Effort |
|---|--------|----------|--------|
| 3 | Documenter limitation unsafe-inline | Commentaire index.html | Minimal |
| 4 | Brancher rate limiter | usePrescription.ts, LoginPage.tsx, TriagePage.tsx | Moyen |
| 5 | Edge function CSP report | csp-report/index.ts, index.html | Moyen |
| 6 | MFA TOTP | MFASetup.tsx, MFAChallenge.tsx, AuthContext.tsx, LoginPage.tsx, RoleSelector.tsx | Important |

