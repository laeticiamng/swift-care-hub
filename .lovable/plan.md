

# Rendre les comptes demo visibles dans le preview

## Probleme identifie

La section "Comptes demo" sur la page de connexion est protegee par la condition `import.meta.env.DEV` (ligne 145 de `LoginPage.tsx`). Or, le preview Lovable s'execute en mode production, donc `import.meta.env.DEV` vaut `false` -- les comptes demo sont caches partout (mobile ET desktop), pas uniquement sur mobile.

## Solution

Supprimer la condition `import.meta.env.DEV` pour que les comptes demo soient toujours visibles. C'est une application de demonstration et ces comptes sont necessaires pour tester l'app. Le label sera change de "dev uniquement" a "Comptes de demonstration".

## Fichier modifie

**`src/pages/LoginPage.tsx`** (ligne 145) :
- Remplacer `{!isSignUp && import.meta.env.DEV && (` par `{!isSignUp && (`
- Changer le texte "Comptes demo (dev uniquement)" en "Comptes de demonstration"

