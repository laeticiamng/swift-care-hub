

# Corrections Finales de Polish -- UrgenceOS

La plateforme est desormais **publiable**. Les audits precedents ont corrige tous les bloquants. Il ne reste que du polish premium pour maximiser la credibilite.

---

## Corrections a appliquer

### 1. Favicon SVG personnalise

Ajouter un favicon SVG inline directement dans `index.html` : un cercle bleu avec la lettre "U" blanche. Cela remplace le favicon par defaut et renforce le branding dans l'onglet du navigateur.

**Fichier** : `index.html`
- Ajouter une balise `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">` avec un SVG inline representant un cercle bleu (#2b7fc3) et la lettre "U" blanche au centre.

### 2. Differencier les 2 CTA du bloc final

Actuellement, les boutons "Acceder a UrgenceOS" et "Decouvrir la demo" redirigent tous les deux vers `/login`. Le second devrait scroller vers la section "Comment ca marche" pour offrir un parcours alternatif au visiteur hesitant.

**Fichier** : `src/pages/LandingPage.tsx`
- Ligne 222 : changer `onClick={() => navigate('/login')}` en `onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}` pour le bouton "Decouvrir la demo".

### 3. Simplifier le footer

Le footer a un lien "Connexion" qui fait doublon avec la navbar. Le remplacer par un lien vers le haut de la page (ancre) pour une navigation plus propre.

**Fichier** : `src/pages/LandingPage.tsx`
- Ligne 234 : changer le lien "Connexion" en un scroll vers le haut ou le garder tel quel (changement optionnel).

---

## Resultat attendu

- Favicon bleu "U" visible dans l'onglet du navigateur
- 2 CTA distincts : un pour l'action directe (login), un pour la decouverte (scroll)
- Plateforme 100% prete a la publication

