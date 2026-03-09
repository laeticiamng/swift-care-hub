

# AUDIT TECHNIQUE POST-CORRECTIFS — UrgenceOS

## 1. RESUME EXECUTIF

**Etat global** : Les correctifs P0 precedents ont ete correctement appliques (XSS AISynthesisPanel fixe, PatientDossierPage sanitise, sitemap nettoye, SiteHeader aria-expanded ajoute, i18n etendu a 5 pages). La plateforme a significativement progresse.

**Verdict go-live : NON EN L'ETAT** — 3 P0 restants, 4 P1 restants.

### P0 restants

1. **Triggers DB toujours absents** — `handle_new_user` et `prevent_audit_mutation` ne sont pas attaches malgre les fonctions existantes. Le signup cree un utilisateur sans profil, cassant le board et l'admin. Les audit_logs sont mutables (UPDATE/DELETE possible via service_role ou futur bug RLS).
2. **status-monitor POST toujours en 403** — Les logs montrent `bearerLen: 208` (longueur de l'anon key = 208 chars). Le code compare le bearer token aux cles, mais le caller envoie probablement le JWT utilisateur et non le service_role_key. Le caller de ce POST n'est pas identifie dans le code — il semble etre un cron externe ou un appel manuel non configure.
3. **Honeypot contact non implemente** — Malgre la demande, le honeypot n'a pas ete integre ni dans `ContactPage.tsx` ni dans `contact-lead/index.ts`. Le formulaire public reste abusable par des bots.

### P1 restants

1. **Pas de hreflang** malgre 4 langues — SEO multilingue inexistant.
2. **i18n partiel** — Les 5 pages principales sont traduites, mais ~40 pages internes restent en francais hardcode (board, patient, triage, admin, legal, glossaire, etc.). Le switcher reste trompeur pour ces pages.
3. **CRHPreview iframe avec srcDoc de contenu AI** — L'iframe a `sandbox=""` (restrictif), ce qui est correct, mais le contenu HTML est genere par l'IA et injecte via srcDoc. Risque faible grace au sandbox strict, mais le contenu n'est pas sanitise avant injection.
4. **Pas de drop console en prod** — `vite.config.ts` ne drop pas les console.log, exposant potentiellement des donnees de debug en production.

---

## 2. TABLEAU D'AUDIT (ELEMENTS RESTANTS)

| Priorite | Domaine | Probleme | Recommandation | Faisable ? |
|----------|---------|----------|---------------|-----------|
| P0 | Database | Trigger `handle_new_user` absent — signup cree user sans profil | Migration: CREATE TRIGGER on auth.users | Oui (migration) |
| P0 | Database | Trigger `prevent_audit_mutation` absent — audit_logs mutables | Migration: CREATE TRIGGER on audit_logs | Oui (migration) |
| P0 | API | status-monitor POST 403 — caller non identifie | Identifier le caller ou documenter que le POST doit etre appele avec service_role_key | Investigation requise |
| P0 | Security | Honeypot contact absent | Ajouter champ honeypot dans ContactPage + edge function | Oui |
| P1 | SEO | Pas de hreflang | Non recommande pour une SPA sans routes localisees — retirer le claim multilingue du SEO ou ajouter des routes /en/, /es/, /de/ | Decision produit |
| P1 | i18n | ~40 pages internes non traduites | Scope massif — prioriser ou masquer le switcher sur ces pages | Decision produit |
| P1 | Security | CRHPreview srcDoc avec contenu AI non sanitise | Acceptable grace a sandbox="" mais ajouter sanitization serait ideal | Oui |
| P2 | Performance | Pas de drop console en prod | Ajouter `esbuild: { drop: ['console', 'debugger'] }` dans vite.config.ts | Oui |
| P2 | SEO | `/flow` absent du sitemap | Ajouter | Oui |
| P2 | Observability | Pas de monitoring externe (Sentry) | Choix de service requis | Decision externe |
| P3 | Accessibility | Pas de skip-to-content link | Ajouter | Oui |
| P3 | Performance | Pas de prefetch au hover | Ajouter | Oui |

---

## 3. CORRECTIFS CONFIRMES APPLIQUES (REVUE)

Les elements suivants ont ete correctement corriges dans les passes precedentes :
- XSS `dangerouslySetInnerHTML` dans AISynthesisPanel → ReactMarkdown
- XSS PatientDossierPage ordonnanceHTML → rendu texte filtre
- Doublon sitemap `/statut` supprime, `/contact` ajoute
- `aria-expanded` sur le menu hamburger mobile
- i18n etendu a Login, Signup, Contact, Pricing, FAQ
- RLS policies migrees de `{public}` a `{authenticated}` (migration)
- error_logs restreint a `auth.uid() = user_id`

## 4. PLAN D'ACTION POUR CETTE ITERATION

### Correctifs immediats a implementer :

1. **Migration DB** : Creer les triggers `handle_new_user` (on auth.users AFTER INSERT) et `prevent_audit_mutation` (on audit_logs BEFORE UPDATE OR DELETE)
2. **Honeypot contact** : Ajouter le champ honeypot dans `ContactPage.tsx` et la verification dans `contact-lead/index.ts`
3. **vite.config.ts** : Ajouter drop console/debugger en production
4. **sitemap.xml** : Ajouter `/flow`

### Elements necessitant une decision :
- status-monitor POST caller : qui appelle ce POST ? Un cron externe ? Il faut configurer l'appel avec le service_role_key
- hreflang : decider si le site a des routes localisees ou si le multilingue est uniquement client-side
- i18n : definir le scope des pages internes a traduire

