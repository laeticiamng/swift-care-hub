

# Audit complet pré-production UrgenceOS

---

## 1. SECURITE

### 1.1 RLS & Politiques d'accès (base de donnees)

| Constat | Severite | Detail |
|---------|----------|--------|
| **`contact_leads` : RLS active mais AUCUNE politique** | **P0 CRITIQUE** | La table est accessible en lecture/ecriture sans restriction. N'importe quel utilisateur anonyme ou authentifie peut lire tous les leads B2B (noms, emails, etablissements). |
| **`status_checks` / `incident_logs` : INSERT avec `WITH CHECK (true)`** | **P1** | Le scan de securite remonte "RLS Policy Always True". Ces tables permettent un INSERT ouvert. Risque d'injection de faux status/incidents. Recommandation : restreindre INSERT au `service_role` uniquement (supprimer la policy permissive et utiliser le service role key dans les edge functions, ce qui est deja le cas). |
| **`error_logs` : INSERT avec `WITH CHECK (true)`** | P1 | Meme probleme, INSERT ouvert. L'edge function utilise deja le service role, la policy permissive est redondante et dangereuse. |
| **Leaked Password Protection desactivee** | **P0** | Le scan de securite confirme que HIBP est desactive malgre la config dans `config.toml`. A reverifier / reactiver. |

### 1.2 Edge Functions — CORS & JWT

| Constat | Severite |
|---------|----------|
| **Toutes les edge functions utilisent `Access-Control-Allow-Origin: *`** | **P1** | En production, restreindre aux domaines autorises (`https://urgenceos.fr`, `https://flow-pulse-assist.lovable.app`). |
| **`ai-clinical` : `verify_jwt = false`** | **P0** | N'importe qui peut appeler l'endpoint IA sans authentification. Consommation de credits IA non controlee + risque d'abus. L'edge function ne verifie pas non plus le JWT manuellement. |
| **`send-alert` : `verify_jwt = false`** | **P1** | Accessible publiquement. Un attaquant peut envoyer des emails d'alerte frauduleux via Resend. |
| **`status-monitor POST` : `verify_jwt = false`** | **P1** | Quiconque peut declencher un health check POST et inserer des donnees dans `status_checks`. |

### 1.3 Authentification

| Constat | Severite |
|---------|----------|
| Rate limit login : **client-side uniquement** (Map en memoire) | **P1** | Le code le documente clairement. Un rate limit serveur (edge function ou pg) est necessaire pour les endpoints sensibles. |
| Auto-confirm email : non active (bien) | OK |
| MFA TOTP pour roles medicaux | OK |
| Inactivite 30 min auto-logout | OK |
| Password min 8 chars + Zod validation | OK |

### 1.4 Headers de securite

| Header | Statut |
|--------|--------|
| CSP | ✅ Stricte (frame-ancestors none, object-src none, connect-src restreint) |
| HSTS | ✅ max-age=63072000 |
| X-Content-Type-Options | ✅ nosniff |
| X-Frame-Options | ✅ DENY |
| Referrer-Policy | ✅ strict-origin-when-cross-origin |
| Permissions-Policy | ✅ Tout desactive (camera, micro, geo, payment) |

**Verdict headers : complet et solide.**

---

## 2. ARCHITECTURE & CODE

### 2.1 Frontend

| Aspect | Statut | Notes |
|--------|--------|-------|
| Code splitting (lazy) | ✅ | 40+ pages lazy-loaded |
| Error boundary global | ✅ | Avec report vers edge function |
| Global error handlers (error + unhandledrejection) | ✅ | |
| Service Worker (offline) | ✅ | Cache strategies correctes (cache-first, network-first, SWR) |
| Offline queue + sync | ✅ | IndexedDB + background sync |
| React Query (staleTime 10s) | ✅ | Adapte au contexte medical |
| Theme dark par defaut | ✅ | |
| PWA manifest + icons | ✅ | |

### 2.2 Backend (Edge Functions)

| Function | JWT | Rate limit serveur | Logging structure |
|----------|-----|---------------------|-------------------|
| `manage-roles` | ✅ (via header) | Non | ✅ |
| `contact-lead` | Non (public) | ✅ (1/email/24h) | ✅ |
| `ai-clinical` | **Non** | Non | ✅ |
| `log-error` | Non (public) | Non | ✅ |
| `send-alert` | **Non** | Non | ✅ |
| `status-monitor` | Non | Non | ✅ |
| `healthz` | Non (correct pour probe) | N/A | ✅ |
| `csp-report` | Non (correct pour navigateur) | Non | ✅ |
| `seed-data` | ✅ | Non | ✅ |

### 2.3 Base de donnees

| Aspect | Statut |
|--------|--------|
| 14 tables avec RLS | ✅ (sauf `contact_leads`) |
| Roles via `user_roles` (table separee) | ✅ |
| `has_role()` SECURITY DEFINER | ✅ |
| `is_assigned_to_patient()` SECURITY DEFINER | ✅ |
| `audit_logs` immutable (trigger) | ✅ |
| Trigger validation `patient_dob` | ✅ |
| `handle_new_user` trigger | ✅ |
| 23 migrations | ✅ |

**Note : le listing des triggers montre "no triggers" mais le code reference `prevent_audit_mutation`. A verifier si le trigger est bien attache.**

---

## 3. OBSERVABILITE & MONITORING

| Aspect | Statut |
|--------|--------|
| Logging structure JSON (edge functions) | ✅ |
| trace_id front → edge correlation | ✅ |
| Error reporting (front → log-error) | ✅ |
| Error spike detection (>10 en 5 min) | ✅ |
| Status monitoring (5 services) | ✅ |
| Alerting email (Resend) | ⚠️ Domaine `emotionscare.com` non verifie |
| Dashboard Ops (`/ops`) | ✅ |
| `/healthz` endpoint | ✅ |
| Sentry | ❌ Non integre |

---

## 4. RGPD / CONFORMITE

| Aspect | Statut |
|--------|--------|
| Export donnees patient (Art.15/20) | ✅ |
| Demande suppression (Art.17) | ✅ |
| Gestion consentement | ✅ |
| Anonymisation export | ✅ |
| Cookie consent (essential + preferences) | ✅ |
| Pas de tracking analytique tiers | ✅ |
| Mentions legales / Politique confidentialite / CGU | ✅ |
| Medical disclaimer | ✅ |

---

## 5. SEO & PERFORMANCE

| Aspect | Statut |
|--------|--------|
| Schema.org (SoftwareApplication, MedicalOrganization, WebSite) | ✅ |
| Open Graph + Twitter Cards | ✅ |
| Canonical URL | ✅ |
| Sitemap + robots.txt | ✅ |
| security.txt | ✅ |
| 404 page | ✅ |
| Font self-hosted (Inter) | ✅ |

---

## 6. TESTS

| Type | Couverture |
|------|------------|
| Tests unitaires (vitest) | ✅ 20+ fichiers test |
| RLS coverage test | ✅ |
| Edge function tests | ✅ (contact-lead, rate-limit) |
| E2E test plan | ✅ (documente, non automatise) |
| Tests interop (FHIR, HL7v2, MSSante) | ✅ |

---

## 7. ACTIONS P0 AVANT MISE EN PRODUCTION

| # | Action | Effort |
|---|--------|--------|
| 1 | **Ajouter RLS policies sur `contact_leads`** (SELECT restreint au service role, INSERT via edge function uniquement) | 30 min |
| 2 | **Proteger `ai-clinical`** : activer `verify_jwt = true` OU ajouter verification JWT manuelle dans la function | 1h |
| 3 | **Proteger `send-alert`** : ajouter verification d'un secret/token interne ou restreindre aux appels internes | 30 min |
| 4 | **Reactiver Leaked Password Protection** (HIBP) — le scan montre qu'elle est desactivee malgre le config.toml | 15 min |
| 5 | **Restreindre CORS** sur toutes les edge functions au domaine de production | 1h |
| 6 | **Verifier que le trigger `prevent_audit_mutation` est bien attache** a la table `audit_logs` | 15 min |
| 7 | **Verifier le domaine `emotionscare.com` dans Resend** pour que l'alerting email fonctionne | Externe |

## 8. ACTIONS P1 (POST-LANCEMENT)

| # | Action |
|---|--------|
| 1 | Integrer Sentry (front + edge) |
| 2 | Rate limit serveur sur login et endpoints sensibles |
| 3 | Durcir les policies `WITH CHECK (true)` sur `status_checks`, `incident_logs`, `error_logs` |
| 4 | Cron automatique pour `status-monitor` (toutes les 5 min) |
| 5 | Automatiser les tests E2E (Playwright) |
| 6 | Ajouter `Access-Control-Allow-Methods` aux CORS headers |

---

## VERDICT GLOBAL

**L'application est techniquement mature** avec une architecture solide (RBAC serveur, audit immuable, offline-first, interop FHIR/HL7v2, RGPD). Les 7 actions P0 sont toutes realisables en une demi-journee. Les failles principales sont :
- `contact_leads` expose sans protection
- `ai-clinical` accessible sans authentification
- `send-alert` callable publiquement
- CORS `*` sur toutes les edge functions

Une fois ces points corriges, l'application est prete pour une mise en production.

