

# Plan — 6 corrections hardening final (score 10/10)

## Analyse de faisabilité

| # | Correction | Faisabilité Lovable Cloud | Action |
|---|-----------|--------------------------|--------|
| 1 | Supprimer unsafe-inline CSP | **Impossible** — Vite injecte des scripts inline au build, Tailwind/Radix utilisent des styles inline. Nécessite un serveur avec nonces dynamiques, hors scope Lovable Cloud | Documenter + mitiger via CSP report-uri (déjà fait) |
| 2 | Test SQL automatique RLS sur tables futures | **Faisable** — Créer un test Vitest qui vérifie que toutes les tables publiques ont RLS activé | Nouveau fichier test |
| 3 | Leaked Password Protection HIBP | **Déjà activé** dans config.toml. Vérification effective via configure-auth | Vérifier/confirmer activation |
| 4 | Rate limiting serveur personnalisé | **Faisable** — Edge function middleware qui vérifie un compteur en DB avant les mutations sensibles | Nouvelle edge function |
| 5 | Alerting sécurité (Slack/Email) | **Partiellement faisable** — Edge function qui envoie des alertes email via Supabase (pas de connecteur Slack natif). Nécessite un webhook ou une clé API externe | Edge function + discussion secret |
| 6 | Tests E2E automatisés "rôle interdit" | **Faisable** — Tests Vitest vérifiant les guards de rôle côté client | Nouveau fichier test |

## Corrections à implémenter

### 1. Documenter limitation unsafe-inline (déjà fait)
Le commentaire dans `index.html` documente déjà cette limitation. Le `report-uri` est en place. **Aucune action supplémentaire.**

### 2. Test automatique RLS future-proof
**Fichier à créer** : `src/test/rls-coverage.test.ts`

Teste via requête SQL que toutes les tables du schéma `public` ont `row_security` activé. Utilise `supabase.rpc` ou une requête directe sur `pg_tables`.

Approche pragmatique : maintenir une liste whitelist des tables connues et vérifier qu'aucune n'a RLS désactivé.

### 3. Confirmer HIBP activation
Vérifier via `configure-auth` que leaked password protection est bien activée côté serveur.

### 4. Rate limiting serveur via edge function
**Fichier à créer** : `supabase/functions/rate-limit/index.ts`

Middleware serveur qui :
- Reçoit un identifiant d'action + user_id
- Vérifie un compteur en mémoire (Map) par user/action
- Retourne 429 si dépassé
- Les mutations critiques (prescriptions via edge function) appellent ce endpoint avant d'exécuter

Note : le rate limiting client est déjà en place. Le rate limiting serveur natif de Supabase Auth protège déjà les endpoints auth. Cette edge function ajoute une couche supplémentaire pour les endpoints métier.

### 5. Alerting sécurité
**Fichier à modifier** : `supabase/functions/csp-report/index.ts`

Étendre pour détecter les patterns d'attaque (violations CSP répétées, brute force) et envoyer une alerte.

Pour l'alerting email/Slack : nécessite soit un webhook Slack, soit un service email. Je recommande d'utiliser un webhook Discord/Slack que l'utilisateur fournit.

### 6. Tests E2E rôle interdit
**Fichier à créer** : `src/test/role-guards.test.ts`

Tests unitaires vérifiant :
- `guardPrescription()` refuse si rôle != medecin
- `guardTriage()` refuse si rôle != medecin/ioa
- `guardAdministration()` refuse si rôle != ide/medecin
- Rate limiter bloque après N tentatives

## Résumé des modifications

| # | Action | Fichiers | Effort |
|---|--------|----------|--------|
| 1 | Aucune action (déjà documenté) | — | 0 |
| 2 | Test RLS coverage | `src/test/rls-coverage.test.ts` | Léger |
| 3 | Vérifier HIBP | configure-auth | Minimal |
| 4 | Rate limit serveur | `supabase/functions/rate-limit/index.ts` | Moyen |
| 5 | Alerting sécurité | Extension `csp-report`, discussion webhook | Moyen |
| 6 | Tests guards rôle | `src/test/role-guards.test.ts` | Léger |

