

# AUDIT TECHNIQUE COMPLET — UrgenceOS (Mars 2026)

## 1. RESUME EXECUTIF

**Etat global** : Plateforme mature cote frontend avec une architecture bien structuree (lazy loading, role guards, RLS strictes, edge functions securisees). Les corrections precedentes (XSS, honeypot contact, audit_logs immutability, i18n partiel) ont ete appliquees. Cependant, plusieurs problemes significatifs subsistent.

**Verdict go-live : NON EN L'ETAT** — 2 P0, 5 P1 restants.

### P0 principaux
1. **B2B form sans honeypot** — Le formulaire B2BPage.tsx envoie au meme endpoint `contact-lead` mais ne contient pas de champ honeypot, contrairement a ContactPage. Le formulaire B2B est directement abusable par des bots.
2. **status-monitor POST toujours en 403** — Les logs montrent `bearerLen: 208` (anon key). Le caller n'envoie pas le service_role_key. Le monitoring automatique est mort — aucune donnee de sante des services n'est collectee.

### P1 principaux
1. **ForgotPasswordPage et ResetPasswordPage non i18n** — Toutes les chaines sont hardcodees en francais. Le switcher de langue est trompeur sur ces pages.
2. **DemoLivePage non i18n** — Page de selection de role demo entierement en francais hardcode.
3. **OpsPage requete `error_logs` et `contact_leads` avec RLS restrictive** — `error_logs` ne retourne que les logs du user connecte (`auth.uid() = user_id`), pas tous les logs. `contact_leads` a une policy `false` sur SELECT — la requete retournera toujours un tableau vide. Le dashboard Ops est partiellement non fonctionnel.
4. **`manage-roles` GET expose tous les profils** — L'edge function utilise le `serviceRoleKey` pour lister TOUS les profils. C'est voulu mais un medecin quelconque peut voir les emails de tous les utilisateurs. Pas de filtrage.
5. **hreflang pointe toutes les langues vers la meme URL** — Les balises hreflang generees dans `PageMeta` utilisent toutes `baseUrl` (la meme URL) pour fr/en/es/de. C'est semantiquement incorrect : hreflang doit pointer vers des URLs distinctes par langue. Google ignorera ces balises ou les signalera comme erreur.

---

## 2. TABLEAU D'AUDIT

| Priorite | Domaine | Page / Fonction | Probleme | Risque | Recommandation | Faisable ? |
|----------|---------|----------------|----------|--------|---------------|-----------|
| P0 | Security | B2BPage.tsx | Pas de honeypot — formulaire abusable par bots | Spam massif | Ajouter champ honeypot comme ContactPage | Oui |
| P0 | API | status-monitor POST | 403 permanent — monitoring mort | Aucune detection de panne | Identifier le caller ou ajouter un cron interne | Decision requise |
| P1 | i18n | ForgotPasswordPage | Toutes les chaines hardcodees FR | UX incoherente multilingue | Ajouter traductions | Oui |
| P1 | i18n | ResetPasswordPage | Toutes les chaines hardcodees FR | UX incoherente multilingue | Ajouter traductions | Oui |
| P1 | i18n | DemoLivePage | Toutes les chaines hardcodees FR | UX incoherente multilingue | Ajouter traductions | Oui |
| P1 | Database/RLS | OpsPage → contact_leads | RLS `false` sur SELECT — retourne toujours [] | Dashboard Ops montre 0 leads | Creer policy SELECT pour medecin ou lire via edge function | Oui (migration ou edge fn) |
| P1 | Database/RLS | OpsPage → error_logs | RLS `auth.uid() = user_id` — ne montre que ses propres erreurs | Dashboard Ops incomplet | Creer policy SELECT pour medecin ou lire via edge function | Oui (migration ou edge fn) |
| P1 | SEO | PageMeta hreflang | Toutes les langues pointent vers la meme URL | Google signale erreur hreflang | Retirer hreflang (pas de routes localisees) ou creer des routes distinctes | Oui (retirer) |
| P2 | i18n | GlossairePage | Non i18n | Coherence | Termes medicaux FR = voulu, mais les labels UI non traduits | Decision produit |
| P2 | i18n | B2BPage | Non i18n | Coherence | Traduire les textes UI (pas le contenu metier FR) | Oui |
| P2 | i18n | NotFound | Non i18n | Coherence | Ajouter traductions | Oui |
| P2 | Security | manage-roles GET | Expose tous les emails a tout medecin | Fuite info | Acceptable pour admin, mais documenter | Non critique |
| P2 | i18n | CookieConsent | Non i18n | Coherence | Ajouter traductions | Oui |
| P2 | Frontend | PricingPage features list | Features hardcodees en FR malgre i18n pour les titres/prix | Melange FR/traduit | Traduire les features | Oui |
| P3 | Accessibility | NotFound | Pas de PageMeta sur version anglaise | Minor | i18n NotFound | Oui |
| P3 | Performance | NavLink prefetch | Bon ajout, fonctionne correctement | — | — | — |

---

## 3. DETAIL PAR CATEGORIE

### Frontend & Rendu
- **Fonctionne** : Lazy loading, ErrorBoundary, PageLoader, role guards, redirections auth, 404 page, CookieConsent, responsive SiteHeader, skip-to-content link.
- **Casse** : Rien de bloquant cote rendu.
- **Douteux** : PricingPage melange titres i18n avec features hardcodees FR.

### QA Fonctionnelle
- **Fonctionne** : Login/signup/forgot/reset flows complets. MFA challenge/enroll. Demo mode avec 5 roles. Contact form avec honeypot. Rate limiting client-side sur login.
- **Casse** : OpsPage dashboard montre 0 leads (RLS) et seulement ses propres erreurs.
- **Non confirme** : Persistance reelle des donnees apres signup (trigger `handle_new_user` — la DB indique "no triggers" mais la fonction existe, donc le trigger pourrait avoir ete cree dans une migration precedente et ne pas apparaitre dans le snapshot actuel).

### Auth & Autorisations
- **Fonctionne** : ProtectedRoute, RoleGuard, inactivity timeout 30min, MFA pour roles medicaux, session refresh, admin restricted to medecin.
- **Bien** : manage-roles valide le role medecin cote serveur (edge function).
- **Douteux** : Aucun rate limiting serveur sur login (seulement client-side `checkRateLimit` qui est contournable).

### APIs & Edge Functions
- **Fonctionne** : contact-lead (avec honeypot, dedup 24h, validation email, truncation), manage-roles (auth + role check serveur), send-alert (auth interne), ai-clinical, csp-report.
- **Casse** : status-monitor POST en 403 permanent.
- **Bien** : CORS restrictif avec whitelist de domaines.

### Database & RLS
- **Fonctionne** : RLS RESTRICTIVE sur toutes les tables. Separation par role et assignation encounter. audit_logs immutable (UPDATE/DELETE denied). contact_leads totalement verrouille (toutes operations denied cote client).
- **Probleme** : contact_leads SELECT `false` empeche OpsPage de les lire. error_logs SELECT `auth.uid() = user_id` empeche le dashboard admin de voir toutes les erreurs.
- **Bien** : Fonctions security definer avec search_path fige. has_role, is_assigned_to_patient, is_assigned_to_encounter bien implementees.

### Securite
- **Bien** : CSP, honeypot contact, sanitizeHtml CRHPreview, verify_jwt false avec auth manuelle dans edge functions, CORS whitelist, HIBP enabled.
- **Probleme** : B2B form sans honeypot. Rate limiting login seulement client-side.
- **Mineur** : contact-lead email template injecte directement `leadData.message` dans HTML — potential XSS dans l'email (mais ce sont des emails internes envoyes a l'equipe, risque faible).

### Paiement / Billing
- Pas de systeme de paiement. Le pricing est un modele B2B avec "Demander un essai" — pas de checkout en ligne. Coherent avec le positionnement.

### Performance
- **Bien** : Lazy loading toutes les pages, code splitting, queryClient avec staleTime 10s, NavLink prefetch au hover, console drop en prod.
- **Douteux** : Images non evaluables sans test navigateur.

### SEO
- **Bien** : PageMeta sur toutes les pages publiques, canonical, JSON-LD (howTo, webPage, organization, FAQ), sitemap complet, robots.txt.
- **Probleme** : hreflang genere pointe toutes les langues vers la meme URL — semantiquement incorrect et potentiellement penalisant.

### Accessibilite
- **Bien** : skip-to-content, aria-expanded hamburger, aria-current sur nav, labels formulaires, focus visible, role="navigation", role="menubar".
- **Manquant** : Pas de mode haut contraste, pas de reduce-motion.

### i18n
- **Traduit** : Login, Signup, Contact, Pricing, FAQ, About, Statut, RoleSelector, SiteHeader, nav, hero.
- **Non traduit** : ForgotPassword, ResetPassword, DemoLivePage, B2B, Glossaire, NotFound, CookieConsent, BoardPage, PatientDossier, Triage, toutes les pages cliniques internes (~30 pages), PricingPage features list.
- **Probleme structurel** : hreflang annonce 4 langues mais le contenu est majoritairement FR sur les pages internes.

### Observabilite / Go-live
- **Bien** : status page (/statut), edge function healthz, audit_logs, error_logs, structured logging dans edge functions, CookieConsent RGPD, pages legales completes, medical disclaimer.
- **Probleme** : status-monitor POST 403 = monitoring automatique mort. Pas de Sentry. Pas d'analytics.

---

## 4. PLAN D'ACTION PRIORISE

### P0 — Correctifs immediats
1. **B2BPage honeypot** : Ajouter champ `website` hidden + verifier avant envoi (comme ContactPage)
2. **status-monitor** : Documenter / investiguer le caller. Potentiellement creer un pg_cron qui appelle avec service_role_key via pg_net.

### P1 — Correctifs rapides
3. **Retirer hreflang** des pages (pas de routes localisees = hreflang incorrect)
4. **OpsPage data access** : Creer une edge function `ops-data` qui utilise service_role_key pour lire error_logs et contact_leads, reservee aux medecins
5. **i18n ForgotPasswordPage** : Ajouter traductions (4 langues)
6. **i18n ResetPasswordPage** : Ajouter traductions (4 langues)
7. **i18n DemoLivePage** : Ajouter traductions (4 langues)

### P2 — Ameliorations
8. i18n NotFound, CookieConsent, PricingPage features
9. Rate limiting serveur sur login (edge function ou middleware)
10. Sanitize leadData.message dans email template contact-lead

### P3 — Polish
11. Mode haut contraste
12. prefers-reduced-motion
13. Analytics integration

---

## 5. IMPLEMENTATION IMMEDIATE

Les correctifs suivants seront implementes :

1. **B2BPage honeypot** — Ajouter le champ website hidden et la verification avant envoi
2. **Retirer hreflang** — Les hreflang pointant vers la meme URL sont incorrects et potentiellement penalisants. Les retirer de PageMeta.
3. **i18n ForgotPasswordPage** — Ajouter cles de traduction + cablage
4. **i18n ResetPasswordPage** — Ajouter cles de traduction + cablage
5. **i18n DemoLivePage** — Ajouter cles de traduction + cablage
6. **i18n NotFound** — Ajouter cles de traduction + cablage

Les elements NON implementes (necessitent decision) :
- status-monitor caller (qui l'appelle ? pg_cron ? cron externe ?)
- OpsPage data access (edge function ops-data vs migration RLS)
- Rate limiting serveur login
- Analytics / Sentry

