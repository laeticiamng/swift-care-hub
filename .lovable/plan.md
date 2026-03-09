

# AUDIT BÊTA-TESTEUR NON TECHNIQUE — UrgenceOS

---

## 1. RÉSUMÉ EXÉCUTIF

**Ce qu'un novice comprend en arrivant :**
- C'est un logiciel pour les urgences hospitalières
- L'hôpital en garde le contrôle (le concept "Hospital-Owned" est bien présent)
- Il y a un essai de 10 semaines

**Ce qu'un novice NE comprend PAS :**
- Le hero s'affiche **en anglais** par défaut (détecte la langue navigateur) alors que le produit cible le marché français — un directeur d'hôpital français arrive sur "The emergency software your hospital controls" → confusion immédiate
- Plusieurs sections restent en français dur (ProblemSection, SolutionSection, BenefitsSection, CTASection, AntiFeatureSection, SocialProofSection, TrustMarquee, AnnouncementBanner) même quand la langue est en anglais → mélange français/anglais chaotique
- Le bandeau annonce "Premiers essais hospitaliers ouverts pour 2026" reste en français quel que soit le réglage langue
- "Dashboard" dans le menu est un terme très vague — un novice ne sait pas ce que ça ouvre
- La différence entre "Demo", "Demo" (bouton outline), et "Essayer en live" n'est pas claire

**Les 5 plus gros freins :**
1. **Incohérence de langue** : mélange FR/EN massif sur toute la landing page quand le navigateur est en anglais
2. **Trop de CTA concurrents** : "Request a trial", "Demo" (×2 dans la nav!), "Voir le dashboard en direct", "Demander un essai gratuit" — le visiteur ne sait pas où cliquer
3. **"Dashboard" inaccessible** : mène vers `/flow` qui nécessite probablement un compte → page potentiellement vide/confuse pour un visiteur non connecté
4. **Sections non traduites** : ~60% de la landing page reste en français dur (pas via i18n) → expérience cassée pour les locales non-FR
5. **Répétition excessive** : le même message "10 semaines / votre hôpital possède / DPI reste en place" est répété 6-7 fois sur la landing → lassitude

**Les 5 priorités absolues :**
1. Forcer le français par défaut (ou traduire TOUTES les sections)
2. Simplifier les CTA : 1 CTA primaire clair, 1 secondaire max
3. Supprimer le doublon "Demo" dans la nav (déjà un lien Demo + un bouton Demo outline)
4. Renommer "Dashboard" par quelque chose de compréhensible
5. Protéger la route `/flow` pour les non-connectés (ou fournir un contenu de découverte)

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorité | Page / Zone | Problème observé | Ressenti novice | Impact | Recommandation | Faisable maintenant ? |
|----------|-------------|-------------------|-----------------|--------|----------------|----------------------|
| **P0** | Landing / Hero | Titre en anglais si navigateur EN ("The emergency software your hospital controls") alors que site FR. Sous-titre en anglais, reste de la page en français. | "Ce site est-il français ou anglais ? C'est bizarre." | Perte immédiate de crédibilité et confusion | Forcer `fr` par défaut OU traduire les 6+ sections hardcodées en français | **Oui** |
| **P0** | Nav | "Demo" apparaît 2 fois : dans le menu ET comme bouton outline à droite | "Pourquoi Demo est là deux fois ?" | Confusion, impression d'amateurisme | Supprimer le bouton Demo outline de la barre de droite (le lien menu suffit) | **Oui** |
| **P0** | Landing | ~60% des sections (ProblemSection, SolutionSection, BenefitsSection, CTASection, AntiFeatureSection, SocialProofSection, TrustMarquee) sont hardcodées en français, non connectées au système i18n | Mélange FR/EN chaotique quand locale ≠ FR | Détruit la crédibilité multilingue | Soit tout passer en i18n, soit retirer le sélecteur de langue de la landing | **Partiellement** — retirer le sélecteur est immédiat |
| **P1** | Nav | "Dashboard" est vague — un novice ne comprend pas ce que ça ouvre | "Dashboard de quoi ? C'est pour moi ?" | Clic hésitant ou évité | Renommer en "Plateforme" ou "Voir la plateforme" | **Oui** |
| **P1** | Landing | 7 CTA différents : "Request a trial", "Demo" ×3, "Voir le dashboard en direct", "Demander un essai gratuit", "Voir la démo" | "Je ne sais pas lequel est pour moi" | Paralysie de choix → baisse de conversion | Max 2 CTA : "Demander un essai" (primaire) + "Voir la démo" (secondaire) | **Oui** |
| **P1** | Landing / Répétition | Le message "10 semaines / hôpital possède / DPI reste" est martelé dans : Hero, SocialProof, Solution, CTA, AntiFeature, PlatformPreview | "J'ai compris, pourquoi me le redit-on ?" | Lassitude, perte d'attention | Chaque section devrait apporter une info NOUVELLE, pas reformuler la même | **Oui** (réécriture copy) |
| **P1** | Landing / TrustMarquee | Défile avec des labels type "Conforme RGPD Santé", "Possédé par l'hôpital" — en français uniquement | Incohérence si locale EN | Casse la confiance | Traduire ou masquer si locale ≠ FR | **Oui** |
| **P2** | SocialProofSection | "Chiffres clés" avec 10 sem / 5 rôles / 1 écran / 0 refonte — ce ne sont pas des preuves sociales, ce sont des features | "Ce n'est pas impressionnant, c'est juste la description du produit" | Pas de réassurance réelle | Renommer en "Le produit en bref" ou supprimer si redondant avec Hero | **Oui** |
| **P2** | TestimonialsSection | "Retours terrain" = citations anonymes de "co-conception" — aucun nom, aucun hôpital | "C'est crédible ça ? N'importe qui peut écrire ça" | Faible réassurance | Ajouter la mention "Noms publiés après accord des établissements" (déjà en SocialProof mais pas ici) | **Oui** |
| **P2** | PlatformPreviewSection | 5 cartes identiques visuellement (même orange) — cliquer sur n'importe laquelle mène à `/flow` | "Pourquoi 5 cartes qui font la même chose ?" | Confusion, faux affordance | Chaque carte devrait mener à un onglet spécifique de `/flow` | **Oui** |
| **P2** | AnnouncementBanner | Toujours en français, pas traduisible | Incohérent si locale EN | Mineur mais casse la cohérence | Traduire ou masquer si locale ≠ FR | **Oui** |
| **P2** | Mobile / Hero | "Request a trial" prend toute la largeur mais "Demo" et "Login" sont cachés — il faut ouvrir le hamburger | "Je ne trouve pas comment me connecter" | Friction mobile | Garder Login visible sur mobile | **Oui** |
| **P2** | Mobile / Nav | 7 liens dans le menu hamburger + 2 boutons en bas — beaucoup pour un novice mobile | "C'est quoi tout ça ?" | Surcharge | Réduire à 4-5 liens essentiels | **Oui** |
| **P3** | Footer | "HDS Target", "ISO 27001 Target" — le mot "Target" indique que ce n'est PAS encore certifié. Un novice ne le remarque peut-être pas, mais un acheteur B2B oui | "Ils ne sont pas certifiés alors ?" | Risque de perte de confiance B2B | Clairement dire "Certification en cours" plutôt que "Target" | **Oui** |
| **P3** | Landing / CyberSecurityFooter | "Last audit: 2026-02-15" — hardcodé et en anglais quand locale EN mais la date est toujours statique | Mineur mais semble figé | Faible | Rendre dynamique ou noter "date du dernier contrôle" | Non |
| **P3** | Pricing | "À partir de 15 000 €" = bien visible, mais le "À partir de" peut inquiéter — pas de fourchette haute | "Ça peut coûter combien au max ?" | Incertitude | Ajouter "entre X et Y selon votre taille" | **Oui** (copy) |
| **P3** | FAQ | Excellente, très complète et bien rédigée | Rassurante | Positif | RAS | — |
| **P3** | Demo page | "Essayer en live" mène vers `/demo/live` — nécessite probablement un contexte démo activé | Potentiellement vide ou confus | Frustration | S'assurer que la démo live fonctionne sans compte | À vérifier |

---

## 3. AMÉLIORATIONS PRIORITAIRES À IMPLÉMENTER IMMÉDIATEMENT

### A. Résoudre le problème de langue (P0)
- **Forcer le français comme locale par défaut** dans `I18nContext.tsx` : ignorer la détection navigateur et toujours démarrer en `fr`. Le produit cible la France, les sections non-traduites rendent l'expérience cassée en toute autre langue.
- Alternative : masquer le `LanguageSwitcher` de la landing page et ne le montrer que sur les pages internes.

### B. Supprimer le doublon "Demo" dans la nav (P0)
- Retirer le bouton outline "Demo" de la barre de droite du `SiteHeader` — le lien "Demo" existe déjà dans le menu principal.

### C. Renommer "Dashboard" en "Plateforme" (P1)
- Dans les traductions i18n, changer `dashboard: 'Dashboard'` → `dashboard: 'Plateforme'` (FR), garder "Platform" (EN).

### D. Simplifier la hiérarchie CTA (P1)
- Hero : garder "Demander un essai" (primaire) + "Voir la démo" (secondaire) — DÉJÀ BON
- PlatformPreviewSection : changer le CTA "Voir le dashboard en direct" → "Découvrir la plateforme"
- CTASection : le texte est bon mais le bouton "Demander un essai gratuit" devrait juste dire "Demander un essai" (cohérence)

### E. Réécrire les titres de section pour éviter la répétition (P1)
- SocialProofSection heading : "Des engagements concrets, pas des promesses" → "Le produit en bref"
- BenefitsSection heading : OK tel quel, contenu varié
- CTASection : la redite "10 semaines" est OK ici car c'est le CTA final

### F. PlatformPreviewSection — différencier les destinations des cartes (P2)
- Chaque carte devrait mener vers `/flow?tab=X` avec l'onglet pertinent, au lieu de toutes vers `/flow`

### G. Footer — clarifier "Target" (P3)
- "HDS Target" → "Certification HDS (en cours)"
- "ISO 27001 Target" → "ISO 27001 (en cours)"

---

## 4. PLAN D'IMPLÉMENTATION

Les modifications faisables immédiatement :

1. **`src/i18n/I18nContext.tsx`** : forcer `return 'fr'` comme locale par défaut (supprimer la détection navigateur)
2. **`src/components/landing/SiteHeader.tsx`** : supprimer le bouton outline "Demo" de la barre de droite
3. **`src/i18n/translations.ts`** : renommer `dashboard` → "Plateforme" (FR) / "Platform" (EN/ES/DE)
4. **`src/components/landing/PlatformPreviewSection.tsx`** : changer le CTA text et différencier les destinations des cartes
5. **`src/components/landing/SocialProofSection.tsx`** : réécrire le heading pour éviter la redite
6. **`src/components/landing/CTASection.tsx`** : aligner le libellé CTA ("Demander un essai" sans "gratuit")
7. **`src/i18n/translations.ts`** : footer compliance → "Certification HDS (en cours)", "ISO 27001 (en cours)"

### Ce qui reste à faire après (décision humaine requise) :
- Décider si le multilingue doit être maintenu (si oui, traduire TOUTES les sections hardcodées)
- Vérifier que `/flow` et `/demo/live` fonctionnent sans authentification
- Ajouter de vrais témoignages avec noms quand disponibles
- Fournir une fourchette de prix haute sur la page Pricing
- Tests mobile complets après les changements

