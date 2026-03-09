

# AUDIT TECHNIQUE COMPLET — UrgenceOS

---

## 1. RESUME EXECUTIF

**Etat global** : Plateforme de qualite technique superieure pour un projet Lovable. Architecture bien pensee (RBAC serveur, RLS RESTRICTIVE, edge functions structurees, i18n 4 langues, CSP stricte). Cependant, plusieurs problemes critiques empechent un go-live en l'etat.

**Verdict go-live : NON EN L'ETAT**

### 5 P0 principaux

1. **XSS via dangerouslySetInnerHTML** — `AISynthesisPanel.tsx` injecte du HTML brut retourne par l'edge function `ai-clinical` sans sanitization. Un modele IA compromis ou un prompt injection pourrait injecter du JS executable.
2. **RLS policies ciblent `{public}` au lieu de `{authenticated}`** — Toutes les tables medicales (vitals, prescriptions, administrations, etc.) ont des policies scopees au role `public`. Seul `has_role()` retournant `false` pour `auth.uid() IS NULL` protege les donnees. Un bug dans `has_role()` exposerait toutes les donnees medicales aux anonymes.
3. **status-monitor POST echoue systematiquement (403)** — Les logs edge function montrent "POST auth failed" en continu. Le monitoring est casse : aucune donnee de sante des services n'est collectee.
4. **Leaked Password Protection desactivee** — Le linter Supabase confirme que la protection HIBP est desactivee malgre la config `enable_signup = true` dans `config.toml`. Les utilisateurs peuvent s'inscrire avec des mots de passe compromis.
5. **Trigger `handle_new_user` absent de la DB** — La section `db-triggers` indique "There are no triggers in the database". Le trigger qui cree automatiquement le profil apres signup n'existe pas. Les nouveaux inscrits n'auront pas de profil, ce qui cassera l'affichage des noms dans le board et l'admin.

### 5 P1 principaux

1. **i18n couvre uniquement landing/header/footer/flow** — Les pages internes (board, patient, triage, admin, login, signup, contact, pricing, FAQ, etc.) sont 100% en francais hardcode. Le language switcher est trompeur.
2. **Donnees 100% mockees en mode demo** — Le mode demo utilise des donnees hardcodees (`demo-data.ts`). Toute fonctionnalite CRUD (prescriptions, vitals, administrations) est simulee cote client sans aucune persistance. C'est transparent mais cree une illusion de fonctionnalite complete.
3. **Pas de hreflang malgre 4 langues** — Le site est annonce multilingue (FR/EN/ES/DE) mais aucun hreflang n'est present dans `index.html`. SEO multilingue inexistant.
4. **error_logs lisibles par tous les medecins** — Tout utilisateur avec le role `medecin` peut lire toutes les lignes `error_logs`, incluant stack traces, URLs et metadata d'autres utilisateurs.
5. **`ai-clinical` edge function : `verify_jwt = false` dans config.toml** — Bien que le code fasse une verification JWT manuelle, la config desactive la verification automatique de Supabase, ce qui est fragile.

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorite | Domaine | Page / Route / Fonction | Probleme observe | Symptome / preuve | Risque | Recommandation | Faisable dans Lovable ? |
|----------|---------|------------------------|-----------------|-------------------|--------|---------------|----------------------|
| P0 | Security | AISynthesisPanel.tsx | XSS via dangerouslySetInnerHTML avec contenu AI | `dangerouslySetInnerHTML={{ __html: result }}` ligne 124 | Execution JS arbitraire | Utiliser react-markdown pour le CRH aussi, ou sanitizer (DOMPurify) | Oui |
| P0 | RLS | Toutes tables medicales | Policies scopees a `{public}` au lieu de `{authenticated}` | Scan securite confirme | Exposition donnees medicales si bug has_role | Migration ALTER POLICY ... TO authenticated | Oui (migration) |
| P0 | API | status-monitor POST | Auth echoue systematiquement | Logs: "POST auth failed" 403 en continu | Monitoring inoperant | Corriger l'authentification du POST caller | Oui |
| P0 | Auth | config.toml | Leaked password protection desactivee | Linter Supabase | Mots de passe compromis acceptes | Activer via configure_auth | Decision requise |
| P0 | Database | handle_new_user trigger | Trigger absent en DB | "There are no triggers" | Pas de profil cree au signup | Recreer le trigger | Oui (migration) |
| P1 | i18n | Pages internes | Seuls landing/header/footer traduits | 40+ pages en francais hardcode | Switcher trompeur | Etendre i18n ou retirer le switcher des pages internes | Oui |
| P1 | Security | error_logs SELECT | Tout medecin lit tous les error_logs | Policy: `has_role(auth.uid(), 'medecin')` sans filtre user_id | Fuite d'info inter-utilisateurs | Ajouter `auth.uid() = user_id` ou role admin | Oui (migration) |
| P1 | SEO | index.html | Pas de hreflang pour EN/ES/DE | Absent du head | SEO multilingue casse | Ajouter hreflang ou documenter FR-only | Oui |
| P1 | SEO | sitemap.xml | Doublon `/statut` (lignes 58-62 et 70-74) | Deux entrees identiques | Indexation confuse | Supprimer le doublon | Oui |
| P1 | Security | contact-lead | Pas de captcha/honeypot | Formulaire public sans protection anti-bot | Spam massif | Ajouter honeypot ou rate limit IP | Partiellement |
| P1 | Frontend | PatientDossierPage | dangerouslySetInnerHTML pour ordonnanceHTML | Ligne 543 | XSS si contenu interop malveillant | Sanitizer | Oui |
| P2 | Performance | App.tsx | Toutes pages lazy-loaded mais pas de prefetch | Lazy load seul | Latence sur premiere navigation | Ajouter prefetch sur hover des liens nav | Oui |
| P2 | Auth | config.toml | `ai-clinical` verify_jwt = false | Config visible | Verification JWT manuelle mais fragile | Mettre verify_jwt = true | Decision requise |
| P2 | Observability | audit_logs | Users ne peuvent lire que leurs propres logs | Pas d'acces admin global | Compliance audit impossible | Ajouter policy pour role medecin/admin | Oui (migration) |
| P2 | Frontend | Landing sections | ProblemSection, WhyNowSection, etc. non traduits | Composants sans useI18n | Contenu mixte en changeant de langue | Ajouter cles i18n | Oui |
| P2 | Accessibility | SiteHeader mobile | Menu hamburger sans aria-expanded | Code visible | Navigation inaccessible | Ajouter aria-expanded/aria-controls | Oui |
| P3 | SEO | Pages secondaires | Contact, FAQ, About sans canonical | Non confirme par inspection | Duplication potentielle | Ajouter PageMeta avec canonical | Oui |
| P3 | Performance | vite.config.ts | Pas de drop console en prod | Config absente | Console logs en prod | Ajouter esbuild.drop | Oui |
| P3 | Frontend | CookieConsent | Present mais non confirme fonctionnel | Code visible | Conformite RGPD | Tester manuellement | Test requis |

---

## 3. DETAIL PAR CATEGORIE

### A. Frontend & rendu

**Fonctionne :**
- Architecture solide : lazy loading, ErrorBoundary global, Suspense, PageLoader
- 404 page correcte avec meta SEO
- ThemeProvider (dark/light), responsive via useIsMobile
- BottomNav mobile conditionne aux routes internes
- Demo mode bien isole via DemoContext

**Casse / Douteux :**
- `dangerouslySetInnerHTML` dans AISynthesisPanel (CRH mode) et PatientDossierPage (ordonnance) — XSS potentiel
- `dangerouslySetInnerHTML` dans FHIRViewer pour highlight JSON — risque faible (donnees controlees)

### B. QA fonctionnelle

**Fonctionne :**
- Flow login → select-role → board fonctionnel (code verifie)
- Mode demo live avec selection de role et donnees fictives
- Contact form connecte a edge function reelle avec rate limit 24h
- Inscription avec validation Zod, indicateur force mot de passe

**Douteux :**
- Mode demo : toutes les interactions cliniques (prescriptions, vitals) sont en memoire locale, non persistees
- Board en mode reel : requetes Supabase presentes mais non testables sans compte

**Non confirme :**
- Flux complet signup → email verification → role assignment → board (necessite un vrai compte)
- MFA enrollment et challenge (fonctionnel selon code mais non testable)

### C. Auth & autorisations

**Fonctionne :**
- AuthContext bien structure : onAuthStateChange avant getSession
- MFA TOTP pour roles medicaux
- Inactivity timeout 30min
- RoleGuard frontend granulaire par route
- Edge function manage-roles verifie le role medecin server-side
- Nouveaux inscrits sans role = ecran "en attente" (pas d'auto-attribution)

**Problemes :**
- Trigger `handle_new_user` absent — les profils ne sont pas crees au signup
- `selectRole()` ne valide pas cote serveur que le role demande est bien dans availableRoles (la validation est front-side uniquement, mais RLS protege les donnees)

### D. APIs & edge functions

**Fonctionne :**
- `contact-lead` : validation, sanitization, rate limit 24h, notification email Resend
- `manage-roles` : auth + verification role medecin + audit log
- `ai-clinical` : verification JWT manuelle correcte
- CORS restreint aux domaines autorises (pas de wildcard `*`)
- Logger structure dans `_shared/logger.ts`

**Casse :**
- `status-monitor` POST retourne 403 systematiquement (logs confirment). Le bearer token envoye par le caller ne matche pas le service_role_key ni l'anon_key.

**Douteux :**
- `ai-clinical` a `verify_jwt = false` dans config.toml — la verification est faite manuellement dans le code mais c'est une couche de defense en moins

### E. Database & RLS

**Fonctionne :**
- RLS activee sur toutes les tables avec mode RESTRICTIVE
- `has_role()` et `is_assigned_to_patient()` en SECURITY DEFINER avec search_path fixe
- Pas de DELETE autorise sur les tables cliniques
- audit_logs immutables (prevent_audit_mutation trigger — mais trigger absent en DB !)
- Foreign keys correctes

**Problemes :**
- Toutes les policies ciblent le role `{public}` au lieu de `{authenticated}` — defense en profondeur insuffisante
- `error_logs` SELECT sans filtre user_id — tous les medecins voient tous les logs
- Trigger `handle_new_user` et `prevent_audit_mutation` declares dans les fonctions mais absents de la table des triggers — probablement jamais attaches

### F. Securite

**Fonctionne :**
- CSP stricte avec frame-ancestors none, object-src none
- X-Frame-Options DENY, HSTS, Referrer-Policy
- Permissions-Policy restrictive
- Sanitization input cote client (sanitizeInput/sanitizeObject)
- Rate limit UX cote client (documente comme non-securite)

**Problemes :**
- XSS via dangerouslySetInnerHTML (P0)
- Pas de captcha/honeypot sur le formulaire contact public
- Leaked password protection desactivee

### G. Paiement / Billing

**Aucun systeme de paiement implemente.** La page pricing affiche des plans (15 000EUR essai, sur mesure, mutualise) avec des CTA "Demander un essai" et "Contacter l'equipe" qui redirigent vers /contact. C'est coherent pour un produit B2B. Pas de Stripe.

### H. Performance

**Correct :**
- Code splitting via lazy() pour toutes les pages
- QueryClient avec staleTime 10s et retry 2
- Service worker pour offline

**Ameliorable :**
- Pas de prefetch au hover
- Pas de drop console en prod
- Images non evaluees (pas d'images lourdes visibles dans le code)

### I. SEO technique

**Fonctionne :**
- index.html complet : title, description, OG tags, Twitter card, structured data (SoftwareApplication, MedicalOrganization, WebSite)
- robots.txt detaille avec disallow sur routes privees
- sitemap.xml present avec pages publiques
- PageMeta composant pour titre/description par page

**Problemes :**
- Doublon `/statut` dans sitemap.xml
- Pas de hreflang malgre 4 langues
- Canonical fixe sur `urgenceos.fr/` dans index.html — ne change pas par page (SPA limitation)
- `/contact` et `/flow` absents du sitemap

### J. Accessibilite

**Correct :**
- aria-label sur le PageLoader
- role="navigation", role="menubar" dans SiteHeader
- aria-current="page" sur lien actif
- Labels de formulaire sur login/signup
- aria-label sur bouton toggle password

**Ameliorable :**
- Menu hamburger mobile : pas d'aria-expanded
- Pas de skip-to-content link
- Focus ring non confirme visuellement

### K. i18n

**Fonctionne :**
- 4 langues completes pour : nav, hero, triage, flow, samuPanel, quality, cyber, footer, common
- LanguageSwitcher dans le header
- Persistance locale par I18nContext

**Problemes majeurs :**
- Seules ~7 sections sont traduites sur ~50+ composants
- Pages login, signup, contact, pricing, FAQ, about, board, patient, admin, legal, glossaire, etc. = 100% francais hardcode
- Validation errors en francais hardcode (Zod schemas)
- Les meta SEO dans index.html sont en francais fixe
- Le switcher de langue dans le header laisse croire que tout est traduit — trompeur

### L. Observabilite / Go-live

**Fonctionne :**
- Status page (`/statut`) avec health checks
- Edge function healthz
- Structured logging dans toutes les edge functions
- Error reporter global (installGlobalErrorHandlers)
- Audit logs dans la DB
- Pages legales presentes (mentions legales, confidentialite, CGU)
- Cookie consent present
- Medical disclaimer present
- security.txt dans .well-known

**Problemes :**
- Monitoring casse (status-monitor 403)
- Triggers absents en DB (handle_new_user, prevent_audit_mutation)
- Donnees de demo dans le code (DEMO_PATIENTS) — acceptable si mode demo est clairement identifie
- Pas de Sentry ni monitoring d'erreurs externe

---

## 4. PLAN D'ACTION PRIORISE

### P0 — Correctifs immediats
1. Remplacer `dangerouslySetInnerHTML` dans AISynthesisPanel par un sanitizer ou ReactMarkdown
2. Migration DB : scoper toutes les policies medicales a `{authenticated}` au lieu de `{public}`
3. Fixer status-monitor POST (auth logic)
4. Recreer le trigger `handle_new_user` via migration
5. Recreer le trigger `prevent_audit_mutation` via migration
6. Activer leaked password protection

### P1 — Correctifs rapides
1. Restreindre error_logs SELECT au proprietaire (`auth.uid() = user_id`) via migration
2. Sanitizer PatientDossierPage ordonnanceHTML
3. Supprimer doublon sitemap.xml
4. Ajouter hreflang ou retirer le language switcher des pages non traduites
5. Ajouter honeypot au formulaire contact

### P2 — Ameliorations
1. Etendre i18n aux pages internes majeures
2. Ajouter policy audit_logs pour acces admin global
3. Ajouter aria-expanded au menu mobile
4. Ajouter /contact et /flow au sitemap
5. drop console en production (vite.config)

### P3 — Polish
1. Prefetch sur hover des liens nav
2. Skip-to-content link
3. PageMeta canonical par page
4. Monitoring externe (Sentry ou equivalent)

---

## 5. IMPLEMENTATION IMMEDIATE

Les correctifs suivants seront implementes dans le message d'implementation :

1. **AISynthesisPanel.tsx** : remplacer `dangerouslySetInnerHTML` par `ReactMarkdown` pour le mode CRH
2. **PatientDossierPage.tsx** : sanitizer l'ordonnanceHTML avant injection
3. **sitemap.xml** : supprimer le doublon `/statut`
4. **Migration DB** : 
   - Scoper les policies a `authenticated` 
   - Recreer trigger `handle_new_user`
   - Recreer trigger `prevent_audit_mutation`
   - Restreindre `error_logs` SELECT
5. **status-monitor** : corriger la logique d'auth POST

Les elements suivants necessitent une decision externe :
- Activation leaked password protection (config auth)
- Ajout captcha/honeypot (decision produit)
- Monitoring externe (choix de service)
- Extension i18n (scope a definir)

