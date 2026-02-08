

# Plan complet -- Corrections finales + Page d'accueil premium

## Audit des lacunes restantes

Apres audit exhaustif de chaque fichier, composant, page, policy RLS, et schema de base, voici les problemes identifies et les ajouts demandes.

---

## PARTIE A -- Corrections et lacunes existantes

### 1. ThemeToggle en conflit avec next-themes

**Probleme** : `App.tsx` utilise `<ThemeProvider attribute="class">` de `next-themes`, mais `ThemeToggle.tsx` manipule manuellement `document.documentElement.classList` et `localStorage`. Les deux systemes interferent.

**Correction** : Refactorer `ThemeToggle` pour utiliser le hook `useTheme()` de `next-themes` (3 lignes de code, suppression des `useEffect` manuels).

### 2. PatientBanner manque ThemeToggle et NetworkStatus

**Probleme** : Les pages `PancartePage` et `PatientDossierPage` utilisent `PatientBanner` comme seul header. Elles n'ont pas de `ThemeToggle` ni `NetworkStatus`.

**Correction** : Ajouter ces deux composants dans `PatientBanner`, aligne a droite du banner.

### 3. Warning console "Function components cannot be given refs"

**Probleme** : React Router emet un warning sur `Navigate` et `LoginPage` car ils ne sont pas enveloppes dans `forwardRef`. C'est un warning mineur mais visible en console.

**Correction** : Ce warning est lie a React Router v6 et n'affecte pas le fonctionnement. Pas de correction necessaire -- c'est cosmique.

---

## PARTIE B -- Page d'accueil premium (avant login)

Le prompt demande "AJOUTE LA PAGE D'ACCUEIL PREMIUM". Il s'agit d'une landing page publique de presentation d'UrgenceOS, visible AVANT le login, style Apple-like avec une esthetique premium.

### Contenu de la page d'accueil

1. **Hero section** : grand titre "UrgenceOS", sous-titre "La revolution des urgences hospitalieres", bouton CTA "Acces au systeme" (redirige vers /login)

2. **Section "Le probleme"** : 3 StatCards avec des chiffres percutants :
   - "40-60%" de burnout urgentistes
   - "15+" logiciels differents par SAU
   - "6-8 clics" pour une administration medicamenteuse

3. **Section "5 profils, 1 systeme"** : cards visuelles pour chaque role (Medecin, IOA, IDE, AS, Secretaire) avec icone, titre et description courte

4. **Section "Fonctionnalites cles"** : 4 blocs illustres :
   - Board panoramique temps reel
   - Pancarte unifiee IDE (1 tap administration)
   - Tri IOA en moins de 2 minutes
   - Securite clinique automatisee (allergies, constantes anormales)

5. **Section "Design Apple-like"** : mise en avant du code couleur semantique (rouge/orange/vert/bleu/gris) avec exemples visuels

6. **Footer** : "UrgenceOS -- Reflexion academique -- Fevrier 2026" + lien vers login

### Style
- Fond gradient subtil, sections alternees fond blanc/fond gris clair
- Animations d'entree douces (fade-in au scroll)
- Espaces blancs genereux, typographie Inter
- Responsive mobile-first
- Support dark mode natif

---

## Plan technique

### Fichiers a modifier

1. **`src/components/urgence/ThemeToggle.tsx`** -- Refactorer pour utiliser `useTheme()` de `next-themes`

2. **`src/components/urgence/PatientBanner.tsx`** -- Ajouter `ThemeToggle` et `NetworkStatus` a droite

3. **`src/pages/LandingPage.tsx`** (NOUVEAU) -- Page d'accueil premium avec hero, stats, roles, fonctionnalites, design system

4. **`src/App.tsx`** -- Ajouter la route `/` vers `LandingPage` (route publique), ajuster la redirection existante

### Fichiers inchanges
Toutes les autres pages (Board, Dossier, Pancarte, Triage, IOA Queue, AS, Accueil, Login, RoleSelector) restent inchangees.

### Ordre d'implementation
1. Refactorer ThemeToggle (useTheme)
2. Mettre a jour PatientBanner (ajout ThemeToggle + NetworkStatus)
3. Creer LandingPage
4. Mettre a jour App.tsx (route /)

