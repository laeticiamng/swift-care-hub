

# AUDIT DEFINITIF PREPRODUCTION v2 — UrgenceOS

---

## 1. RESUME EXECUTIF

**Verdict global** : Les corrections P0/P1 du premier audit ont significativement amélioré la plateforme. Le formulaire B2B fonctionne, le signup/login/reset password existent, le footer HDS est corrigé, le blog est retiré de la navigation. Cependant, une **faille de sécurité critique** a été introduite : un trigger auto-assigne le rôle `ide` à chaque nouvel inscrit, rendant la protection du RoleSelector inutile. La plateforme reste **NON PRETE** pour une production réelle avec patients.

**Note globale : 13.5/20** — En progression (+1.5 vs audit v1), mais des problèmes bloquants persistent.

**Publiable aujourd'hui : OUI SOUS CONDITIONS** — vitrine commerciale uniquement, après correction du trigger auto-role et du blog résiduel.

**Top 5 des risques avant production :**
1. Le trigger `handle_new_user_role` auto-assigne `ide` à tout nouvel inscrit — escalade de privilèges critique
2. La page `/blog` est toujours accessible par URL directe — 6 articles sans contenu, newsletter sans backend
3. La section "5 phrases prêtes à convaincre" sur /b2b est un outil commercial interne exposé publiquement
4. Les mentions légales affichent "Capital en cours de constitution" + hébergeur "Supabase Inc." — contradiction avec le discours Hospital-Owned
5. Aucun email de notification n'est envoyé quand un lead soumet le formulaire B2B — le lead est stocké mais personne n'est alerté

**Top 5 des forces réelles (confirmées) :**
1. Formulaire B2B fonctionnel avec edge function + validation + stockage DB
2. Parcours auth complet : signup avec confirmation email, login, forgot password, reset password
3. Protection auto-attribution rôle dans le RoleSelector UI (message "Contactez un administrateur")
4. Bandeau démo persistant "MODE DEMO — Données fictives" visible et dismissable
5. Preuve sociale ajoutée : chiffres clés animés, design partners, disclaimer honnête sur les noms

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 14 | Inchangé — clair pour DSI, flou pour soignants terrain | Majeur | Ajouter un sous-titre concret |
| Landing / accueil | 16 | Preuve sociale ajoutée, structure solide | Mineur | OK — ajouter screenshot produit |
| Onboarding | 13 | Signup + reset implémentés. Mais trigger auto-role `ide` rend le contrôle d'accès illusoire | Bloquant | Supprimer le trigger |
| Navigation | 14 | Blog retiré du header/footer mais /blog encore accessible | Mineur | Supprimer la route ou rediriger |
| Clarté UX | 14 | Etats vides ajoutés sur le Board, bandeau démo OK | Mineur | OK |
| Copywriting | 16 | Accents corrigés sur /demo. Bon niveau B2B | Cosmétique | OK |
| Crédibilité / confiance | 12 | HDS corrigé. Blog résiduel + mentions "Capital en cours" persistent | Majeur | Corriger |
| Fonctionnalité principale | 14 | Board + démo fonctionnels | Majeur | OK |
| Parcours utilisateur | 13 | Signup/login/reset OK. Mais nouvel utilisateur reçoit auto-role ide | Bloquant | Corriger trigger |
| Bugs / QA | 13 | Pas de bugs majeurs visuels. Blog résiduel | Mineur | OK |
| Sécurité préproduction | 10 | Trigger auto-role annule la protection. Rate limit toujours client-side | Critique | Corriger immédiatement |
| Conformité avant go-live | 10 | Mentions légales toujours problématiques | Majeur | Mettre à jour |

---

## 3. AUDIT PAGE PAR PAGE

### Landing Page (/) — 16/20 (progression +1)
- **Amélioré** : Section preuve sociale (SocialProofSection) avec compteurs animés et design partners. Footer corrigé "HDS (en cours)".
- **Clair** : Hero fort, structure argumentaire solide, disclaimer honnête sur les noms de partenaires.
- **Reste flou** : Toujours pas de capture d'écran du produit dans le hero. Le visiteur ne voit jamais à quoi ressemble l'interface.
- **Manque** : Un CTA "Voir la démo" dans le hero renvoie vers un scroll anchor "Comprendre la dette opérationnelle" — contre-intuitif. Le CTA secondaire devrait pointer vers /demo.
- **Correction P2** : Ajouter un mockup du Board dans le hero.

### Page Login (/login) — 15/20 (progression +4)
- **Amélioré** : Lien "Créer un compte" ajouté, lien "Mot de passe oublié" ajouté, credentials démo retirées, bouton "Mode Demo" propre.
- **Clair** : Parcours complet, formulaire structuré, validation Zod.
- **Problème résiduel** : Le bouton "Mode Demo — Aucun compte requis" est en vert avec accent manquant ("Demo" sans accent).
- **Correction cosmétique** : Ajouter l'accent → "Mode Démo".

### Page Signup (/signup) — 16/20
- **Nouveau** : Formulaire complet avec nom, email, mot de passe, confirmation, validation Zod, HIBP.
- **Clair** : Message post-inscription "Vérifiez votre email" + "un administrateur vous attribuera un rôle".
- **Problème CRITIQUE** : Le message dit "un administrateur vous attribuera un rôle" mais le trigger `handle_new_user_role` assigne automatiquement `ide`. L'utilisateur reçoit donc un accès IDE sans aucune intervention admin. **Contradiction directe avec la promesse de sécurité.**
- **Correction P0** : Supprimer le trigger `handle_new_user_role`.

### Page Forgot Password (/forgot-password) — 17/20
- **Nouveau** : Clean, fonctionnel. `resetPasswordForEmail` avec `redirectTo`. Message sécurisé "Si un compte existe...".
- **Bon** : Conseil de vérifier les courriers indésirables.
- **OK en l'état.**

### Page Reset Password (/reset-password) — 16/20
- **Nouveau** : Détection du token recovery, validation 8 caractères, HIBP, redirection auto vers login.
- **Problème mineur** : Si l'utilisateur arrive sans hash, le message "Ce lien est invalide ou a expiré" apparaît. Mais le `useEffect` écoute aussi `type=signup` — un email de confirmation signup pourrait déclencher ce formulaire de reset au lieu du flow prévu.
- **Correction P2** : Vérifier que le hash `type=signup` ne déclenche pas le formulaire de reset.

### Page Demo (/demo) — 16/20 (progression +1)
- **Amélioré** : Accents corrigés ("Découvrez", "Médecin", etc.).
- **Clair** : 5 rôles, mockups, navigation par étapes.
- **Reste** : Bouton "Demo interactive" (header badge) sans accent.

### Page Demo Live (/demo/live) — 15/20 (progression +2)
- **Amélioré** : Bandeau "MODE DÉMO — Données fictives • Rôle : [ROLE]" visible et persistant.
- **Clair** : Le mode démo est maintenant clairement identifié.

### Page B2B (/b2b) — 16/20 (progression stable)
- **Amélioré** : Formulaire fonctionnel avec edge function + validation serveur + stockage DB + gestion erreurs.
- **Problème P1** : Aucune notification email quand un lead est soumis. Les données sont stockées mais personne ne les consulte automatiquement. Un lead peut rester des jours sans réponse.
- **Problème P2** : La section "5 phrases prêtes à convaincre" reste publique — outil de vente interne visible par les prospects. Donne l'impression que le produit essaie de se vendre à lui-même.
- **Problème P2** : La section "10 convictions. Zéro marketing." est redondante avec le reste de la page. 20+ paragraphes de texte = page trop longue, taux de rebond élevé avant le formulaire.
- **Correction** : Ajouter notification email. Retirer ou reformuler la section "5 phrases".

### Blog (/blog) — 5/20 (inchangé)
- **Problème** : Retiré du header et du footer (bon), mais la route `/blog` est toujours active. Un lien externe, un bookmark, ou un moteur de recherche peut y mener. 6 articles sans contenu, newsletter sans backend.
- **Correction P1** : Supprimer la route ou rediriger vers `/` ou une 404.

### Page Tarifs (/tarifs) — 13/20 (inchangé)
- **Problème** : Toujours aucun chiffre, même indicatif. "Forfait cadré", "Sur mesure", "Mutualisé".
- **Correction P2** : Ajouter au minimum "à partir de XX k€".

### RoleSelector (/select-role) — 14/20 (progression +2)
- **Amélioré** : Le code UI bloque l'auto-attribution et affiche "Aucun rôle attribué — Contactez un administrateur".
- **Problème CRITIQUE** : Le trigger `handle_new_user_role` assigne automatiquement `ide` à tout nouvel utilisateur. Le RoleSelector ne voit jamais `availableRoles.length === 0` car le rôle est déjà assigné. L'écran "Aucun rôle attribué" ne s'affichera **jamais**. La protection est **illusoire**.
- **Correction P0** : Supprimer le trigger `on_auth_user_created_role` et la fonction `handle_new_user_role`.

### Page Admin Rôles (/admin/roles) — 14/20
- **Nouveau** : Liste utilisateurs + attribution de rôle par dropdown. Protégé par RoleGuard (prescribers).
- **Problème** : Protégé par `PRESCRIBERS` (médecin seulement en pratique), ce qui est correct. Mais la vérification serveur dans l'edge function `manage-roles` vérifie `has_role(medecin)` — cohérent.
- **Problème** : Pas d'interface de recherche/filtrage si beaucoup d'utilisateurs.
- **OK pour un MVP.**

### Board (/board) — 15/20 (progression +1)
- **Amélioré** : Etats vides avec CTA contextuels par rôle. Bouton admin "Rôles" visible pour les médecins.
- **Clair** : L'utilisateur comprend quoi faire quand le board est vide.

### Mentions légales — 11/20 (inchangé)
- **Problèmes persistants** :
  - "Capital social : En cours de constitution"
  - "Infrastructure applicative : Supabase Inc." nommé explicitement
  - Hébergeur "Vercel Inc. / Netlify Inc." — lequel est-ce réellement ?

---

## 4. SECURITE / GO-LIVE READINESS

| Observé | Risque | Action avant prod |
|---|---|---|
| Trigger `handle_new_user_role` auto-assigne `ide` à tout inscrit | Tout compte créé a immédiatement accès IDE : voir patients, constantes, prescriptions | **P0** — Supprimer le trigger immédiatement |
| Rate limiter login est client-side (localStorage) | Contournable par un attaquant | **P1** — Implémenter rate limit serveur |
| `/blog` accessible sans contenu | Risque de crédibilité, pas de sécurité | **P1** — Supprimer la route |
| B2B leads stockés sans notification | Pas de risque sécurité mais risque business | **P1** — Ajouter notification |
| RLS `contact_leads` n'a aucune policy | OK — insertion via service_role dans edge function | OK |
| `handle_new_user` trigger crée un profil | OK — attendu | OK |
| MFA pour rôles médicaux | Bon | OK |
| Auto-logout 30 min | Bon | OK |
| Audit logs immuables | Bon | OK |
| ResetPassword accepte `type=signup` hash | Risque mineur — un signup pourrait déclencher le reset | **P2** — Filtrer |

---

## 5. LISTE DES PROBLEMES PRIORISES

### P0 — Bloquant production

1. **Trigger `handle_new_user_role` auto-assigne `ide`** — Impact : tout inscrit accède immédiatement aux données patients comme IDE. Où : migration `20260208163455`. Correction : DROP TRIGGER `on_auth_user_created_role` + DROP FUNCTION `handle_new_user_role`.

### P1 — Très important

2. **Route `/blog` toujours accessible** — Impact : coquille vide accessible par URL directe ou moteur de recherche. Où : App.tsx L139. Correction : Rediriger `/blog` vers `/` ou supprimer la route.

3. **Aucune notification email pour les leads B2B** — Impact : leads potentiellement ignorés pendant des jours. Où : edge function `contact-lead`. Correction : Ajouter envoi email notification à contact@emotionscare.com.

4. **Section "5 phrases prêtes à convaincre" publique** — Impact : donne une impression d'amateurisme / outil de vente interne. Où : B2BPage.tsx L212-228. Correction : Retirer ou reformuler.

### P2 — Amélioration forte valeur

5. **Accent manquant "Mode Demo"** — Où : LoginPage.tsx L135. Correction : "Mode Démo".

6. **ResetPassword accepte hash `type=signup`** — Où : ResetPasswordPage.tsx L22. Correction : Ne pas activer `hasRecoveryToken` pour `type=signup`.

7. **Pas de screenshot produit dans le Hero** — Impact : le visiteur ne voit jamais l'interface. Correction : Ajouter un mockup.

8. **Mentions légales : capital, hébergeur** — Impact : signaux de fragilité. Correction : Mettre à jour.

9. **Page Tarifs sans aucun chiffre** — Impact : DAF ne peut pas budgéter. Correction : Ajouter un ordre de grandeur.

### P3 — Confort / finition

10. **Page B2B trop longue** — 10 convictions + 5 phrases + formulaire = trop dense.
11. **"Demo interactive" badge sans accent** — DemoPage.tsx header.
12. **Pas de breadcrumbs** dans les pages profondes.

---

## 6. PARCOURS UTILISATEUR CRITIQUES

### Parcours 1 : Prospect → Lead — 16/20 (progression +7)
- Landing → B2B → Formulaire → Soumission → Stockage DB
- **Fonctionnel.** Le lead est sauvegardé.
- **Friction** : Personne n'est notifié. Le prospect reçoit un "Merci, 48h" mais personne ne voit la demande.

### Parcours 2 : Nouvel utilisateur crée un compte — 8/20
- Signup → Email confirmation → Login → RoleSelector → **Accès IDE automatique**
- Le trigger `handle_new_user_role` assigne `ide` avant que l'admin ne puisse intervenir. L'écran "Aucun rôle attribué" ne s'affiche jamais. Le nouvel utilisateur accède directement au Board avec le rôle IDE.
- **Correction P0** : Supprimer le trigger.

### Parcours 3 : Utilisateur oublie son mot de passe — 17/20 (nouveau)
- Login → "Mot de passe oublié" → Email → Lien → Reset → Login
- **Fonctionnel et bien conçu.**

### Parcours 4 : Prospect teste la démo — 16/20 (progression +1)
- Landing/Login → "Mode Demo" → DemoLive → Sélection rôle → Board
- **Bandeau démo visible.** Parcours fluide.

### Parcours 5 : Admin attribue un rôle — 14/20 (nouveau)
- Login médecin → Board → Bouton "Rôles" → /admin/roles → Dropdown → Attribution
- **Fonctionnel.** Mais rendu inutile par le trigger auto-role.

---

## 7. VERDICT FINAL

### La plateforme est-elle réellement prête ?

**Non.** La faille du trigger `handle_new_user_role` est un **régression de sécurité** qui annule la correction majeure de l'audit v1. Tout nouvel inscrit obtient automatiquement le rôle IDE et accède aux données patients. Le RoleSelector affiche un message de protection qui ne s'exécutera jamais.

Les corrections apportées depuis l'audit v1 sont **solides et bien implémentées** : signup, login, reset password, formulaire B2B fonctionnel, bandeau démo, preuve sociale, états vides, admin rôles. L'exécution technique est bonne.

### Qu'est-ce qui empêcherait un expert d'autoriser la mise en production ?
1. Le trigger auto-role qui donne accès IDE à tout inscrit
2. L'absence de notification email pour les leads B2B
3. La route `/blog` résiduelle accessible par URL

### Qu'est-ce qui donne confiance ?
L'architecture RBAC est solide (quand le trigger est supprimé). Le parcours auth est complet et bien implémenté. Le formulaire B2B fonctionne réellement. Le bandeau démo est clair. L'admin rôles est fonctionnel.

### 3 corrections les plus rentables immédiatement :
1. **Supprimer le trigger `handle_new_user_role`** — 1 migration SQL, impact sécurité maximal
2. **Rediriger `/blog` vers `/`** — 1 ligne dans App.tsx, supprime un signal d'inachèvement
3. **Ajouter notification email dans `contact-lead`** — 10 lignes, impact business direct

### Si j'étais décideur externe, publierais-je aujourd'hui ?
**Non.** Je publierais immédiatement après suppression du trigger auto-role, ce qui prend moins de 5 minutes. Ensuite, la vitrine commerciale est publiable. L'accès applicatif reste réservé aux pilotes encadrés avec attribution de rôle manuelle par un admin.

