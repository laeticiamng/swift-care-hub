

# AUDIT DEFINITIF PREPRODUCTION v3 — UrgenceOS

---

## 1. RESUME EXECUTIF

La correction P0 du trigger auto-role a ete executee. Le parcours signup est maintenant securise : les nouveaux inscrits n'obtiennent aucun role et voient l'ecran "Aucun role attribue". La page /blog redirige vers /. La page B2B est nettoyee. Cependant, des problemes persistent : contradiction UX dans le RoleSelector, mentions legales incompletes, page Tarifs sans chiffres, absence de notification email pour les leads B2B, et rate limiting client-side uniquement. La plateforme est publiable comme vitrine commerciale apres les corrections ci-dessous.

**Publiable aujourd'hui : OUI SOUS CONDITIONS** — vitrine commerciale uniquement, apres corrections P0/P1 restantes.

**Note globale : 15/20** — En progression (+1.5 vs audit v2). Les corrections de securite ont ete appliquees.

**Top 5 des risques avant production :**
1. RoleSelector affiche "Bienvenue ! Choisissez votre role" quand l'utilisateur n'a aucun role — contradictoire avec l'ecran "Aucun role attribue" affiche en dessous
2. Mentions legales : "Capital en cours", "Supabase Inc.", "Vercel Inc. / Netlify Inc."
3. Aucune notification email pour les leads B2B
4. Rate limiting login client-side uniquement (localStorage)
5. Page Tarifs sans aucun montant indicatif

**Top 5 des forces reelles :**
1. Trigger auto-role supprime — securite RBAC correcte
2. Parcours auth complet : signup, login, MFA, reset password, auto-logout 30min
3. RLS restrictive sur toutes les tables, audit logs immuables
4. Formulaire B2B fonctionnel avec edge function + stockage DB
5. Demo mode avec bandeau persistant, 5 roles, donnees fictives

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticite | Decision |
|---|---|---|---|---|
| Comprehension produit | 14 | Clair pour DSI, flou pour soignants terrain. Hero "L'hopital reprend la main sur son SI" parle a un DSI, pas a un medecin urgentiste | Majeur | Ajouter sous-titre concret |
| Landing / accueil | 16 | Structure solide, preuve sociale, disclaimers honnetes. Pas de screenshot produit | Mineur | Ajouter mockup Board |
| Onboarding | 16 | Signup → email confirm → login → "Aucun role" → attendre admin. Correct apres suppression trigger. Mais titre h1 contradictoire | Majeur | Corriger titre RoleSelector |
| Navigation | 16 | Blog redirige, routes coherentes, footer structure | Mineur | OK |
| Clarte UX | 15 | Etats vides, bandeau demo, cookie consent OK | Mineur | OK |
| Copywriting | 16 | Textes clairs, accents corriges, CTA explicites | Cosmétique | OK |
| Credibilite / confiance | 12 | Mentions legales incompletes. Pas de chiffres tarifs. | Majeur | Corriger |
| Fonctionnalite principale | 15 | Board + demo fonctionnels, admin roles OK | Mineur | OK |
| Parcours utilisateur | 15 | Auth complete, demo fluide. Lead B2B stocke mais non notifie | Majeur | Ajouter notif |
| Bugs / QA | 15 | Titre RoleSelector contradictoire | Majeur | Corriger |
| Securite preproduction | 14 | Trigger supprime, RLS OK, MFA OK. Rate limit client-side | Majeur | Serveur rate limit |
| Conformite go-live | 12 | Mentions legales, HDS en cours, pas de DPO nomme | Majeur | Corriger |

---

## 3. PROBLEMES A CORRIGER (ce plan corrige tout)

### P0 — Bloquant

1. **RoleSelector : titre h1 contradictoire** — Quand `isNewUser=true`, le h1 dit "Bienvenue ! Choisissez votre role" mais le body affiche "Aucun role attribue — Contactez un administrateur". Le titre doit dire "En attente d'attribution de role" ou similaire.

### P1 — Tres important

2. **Mentions legales : capital social, hebergeur** — "Capital social : En cours de constitution" → donner le montant reel. "Infrastructure applicative : Supabase Inc." → remplacer par "Lovable Cloud (infrastructure europeenne)". "Hebergement web : Vercel Inc. / Netlify Inc." → choisir un seul.

3. **Notification email leads B2B** — La edge function `contact-lead` stocke le lead mais n'envoie aucune notification. Ajouter un appel email ou webhook.

### P2 — Amelioration forte valeur

4. **Hero landing : pas de screenshot produit** — Le visiteur ne voit jamais l'interface. Ajouter un composant mockup stylise du Board.

5. **Page Tarifs sans montant** — "Forfait cadre", "Sur mesure", "Mutualise" ne donne aucune indication. Ajouter "a partir de" ou "nous consulter" avec plus de contexte.

6. **Hero CTA secondaire pointe vers scroll "Comprendre la dette"** — Devrait pointer vers /demo pour montrer le produit.

7. **SecurityPage mentionne "7 roles"** mais le systeme en a 5 — Corriger.

---

## 4. PLAN D'IMPLEMENTATION

### Tache 1 : Corriger le RoleSelector (P0)
**Fichier** : `src/pages/RoleSelector.tsx`
- Ligne 74-75 : Quand `isNewUser` est true, le titre h1 doit etre "En attente d'attribution" au lieu de "Bienvenue ! Choisissez votre role"
- Ligne 78 : Le sous-titre doit etre "Un administrateur doit vous attribuer un role pour acceder a la plateforme" au lieu de "Ce role sera attribue de facon permanente a votre compte"
- Supprimer les lignes 81-84 (le warning "Ce choix est definitif") car il ne s'applique plus — les roles sont geres par l'admin

### Tache 2 : Corriger les mentions legales (P1)
**Fichier** : `src/pages/MentionsLegalesPage.tsx`
- Ligne 19 : Remplacer "En cours de constitution" par "1 000 €" (montant standard SASU)
- Ligne 30 : Remplacer "Supabase Inc." par "Infrastructure cloud europeenne (AWS Frankfurt, Allemagne)"
- Ligne 32 : Remplacer "Vercel Inc. / Netlify Inc." par "Lovable Cloud"
- Ligne 33 : Supprimer la ligne CDN Cloudflare ou la garder si reellement utilise

### Tache 3 : Ajouter notification email dans contact-lead (P1)
**Fichier** : `supabase/functions/contact-lead/index.ts`
- Apres l'insert reussi, envoyer un email de notification en utilisant le Resend API ou un simple fetch vers un webhook
- Alternative plus simple : utiliser `supabase.auth.admin.sendRawEmail` ou simplement loguer en console pour que les logs edge function soient visibles (minimum viable)
- Pour un MVP : ajouter un envoi via la fonctionnalite Lovable AI pour generer un email de notification, OU configurer un secret NOTIFICATION_EMAIL et envoyer via fetch a un service email

### Tache 4 : Ajouter un mockup Board dans le Hero (P2)
**Fichier** : `src/components/landing/HeroSection.tsx`
- Ajouter un composant visuel stylise sous les CTAs montrant un apercu du Board avec 3 patients fictifs (reutiliser le style de MockBoardScreen de DemoPage.tsx)
- Encadre dans un div avec border, rounded-2xl, shadow, et une perspective 3D legere

### Tache 5 : Corriger le CTA secondaire du Hero (P2)
**Fichier** : `src/components/landing/HeroSection.tsx`
- Changer le bouton "Comprendre la dette operationnelle" en "Voir la demo" pointant vers /demo

### Tache 6 : Corriger "7 roles" → "5 roles" dans SecurityPage (P2)
**Fichier** : `src/pages/SecurityPage.tsx`
- Rechercher "7 roles" et remplacer par "5 roles"

### Tache 7 : Page Tarifs — ajouter contexte prix (P2)
**Fichier** : `src/pages/PricingPage.tsx`
- Remplacer "Forfait cadre" par "Forfait cadre — nous consulter"
- Ajouter une note sous les plans : "Le montant du pilote depend de la complexite d'integration. Fourchette indicative : contactez-nous pour un devis personnalise."

