

# Retrait des faux avis et ajout des pages legales -- Finitions premium v14

---

## 1. Retirer la section Temoignages (faux avis)

La section `TestimonialsSection` affiche des temoignages fictifs avec de faux noms, roles et hopitaux. C'est trompeur pour un projet serieux. Elle sera retiree de la landing page.

**Actions :**
- Supprimer `<TestimonialsSection />` du rendu dans `LandingPage.tsx` (ligne 77)
- Supprimer l'import correspondant (ligne 10)
- Le fichier `TestimonialsSection.tsx` peut rester dans le projet mais ne sera plus utilise

**Fichier** : `src/pages/LandingPage.tsx`

---

## 2. Creer les pages legales obligatoires (SASU francaise)

En tant que SASU francaise (EmotionsCare SASU, SIREN 944 505 445), les pages legales suivantes sont obligatoires :

### 2.1 Mentions Legales (`/mentions-legales`)
Contenu : raison sociale, SIREN, siege social, directeur de publication, contact, hebergeur.

### 2.2 Politique de Confidentialite (`/politique-confidentialite`)
Contenu : responsable de traitement, donnees collectees, finalites, base legale, duree de conservation, droits RGPD, contact DPO.

### 2.3 Conditions Generales d'Utilisation (`/cgu`)
Contenu : objet, acces, propriete intellectuelle, responsabilite, donnees personnelles, droit applicable.

**Fichiers a creer :**
- `src/pages/MentionsLegalesPage.tsx`
- `src/pages/PolitiqueConfidentialitePage.tsx`
- `src/pages/CGUPage.tsx`

Chaque page aura un design premium coherent : en-tete avec logo UrgenceOS, contenu structure en sections, bouton retour, et footer avec liens vers les autres pages legales.

---

## 3. Ajouter les routes dans App.tsx

Ajouter 3 routes publiques (pas besoin d'authentification) :
- `/mentions-legales`
- `/politique-confidentialite`
- `/cgu`

**Fichier** : `src/App.tsx`

---

## 4. Mettre a jour le Footer avec les liens legaux

Ajouter les liens vers les 3 pages legales dans `FooterSection.tsx` : Mentions legales, Confidentialite, CGU.

**Fichier** : `src/components/landing/FooterSection.tsx`

---

## 5. Mise a jour du sous-titre Hero

Remplacer la description secondaire par le message premium du spec : "1 tap = 1 action. Zero formation. Interfaces pensees pour des gardes de 12h."

**Fichier** : `src/components/landing/HeroSection.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Retrait temoignages fictifs | Integrite | LandingPage | Non |
| Page Mentions Legales | Legal | nouveau fichier + App | Non |
| Page Politique Confidentialite | Legal | nouveau fichier + App | Non |
| Page CGU | Legal | nouveau fichier + App | Non |
| Liens legaux dans footer | Legal | FooterSection | Non |
| Sous-titre hero premium | Marketing | HeroSection | Non |

Aucune migration DB necessaire.

