

# Audit final spec v13 -- Derniers micro-ecarts

Apres 8 rounds d'implementation, la plateforme couvre 95%+ du spec. Les ecarts restants sont des finitions de contenu marketing, d'accessibilite mobile et de coherence UX.

---

## 1. Hero -- Tagline principale manquante

Le spec (page 38) dit : "Tagline recommandee : Moins de clics. Plus de soin." Ce tagline est present dans la section metriques (ligne 102 de LandingPage) mais PAS dans le hero. Le hero dit "Le systeme d'exploitation des urgences hospitalieres" ce qui est correct mais le spec insiste sur la prominence du tagline principal.

**Correction :**
- Ajouter "Moins de clics. Plus de soin." comme sous-titre principal dans `HeroSection.tsx`, en remplacement ou en complement de la description actuelle
- Ajouter la "Signature de preuve" du spec (page 38) : "Un point d'entree urgences. Une timeline patient sourcee. Une pancarte IDE en un ecran."

**Fichier** : `src/components/landing/HeroSection.tsx`

---

## 2. Landing -- Section "Pourquoi maintenant ?" manquante

Le spec (page 33) contient une section structuree "Pourquoi maintenant ?" avec 3 arguments (tension hospitaliere maximale, technologie mature, cadre reglementaire stabilise). Cette section n'existe pas sur la landing.

**Ajout :**
- Nouvelle section entre le Manifesto et les metriques dans `LandingPage.tsx`
- 3 colonnes avec les 3 arguments du spec, style premium avec icones

**Fichier** : `src/pages/LandingPage.tsx`

---

## 3. Landing -- "Brand one-pager" comme section visuelle

Le spec (page 39) contient un "Brand one-pager" structure (Ce que c'est / Le probleme / La solution / Le coeur differenciant / Securite / Deploiement / Resultat). Ce contenu pourrait enrichir la section CTA ou remplacer la section actuelle par quelque chose de plus impactant.

**Ajout :**
- Enrichir le `CTASection.tsx` avec la "Proposition de valeur" et les "3 piliers de la marque" du spec (page 37)
- Ajouter les 3 piliers : Simplicite terrain, Confiance clinique, Deploiement realiste

**Fichier** : `src/components/landing/CTASection.tsx`

---

## 4. Dossier patient -- Bouton "Ouvrir" source document sans action

Dans `PatientDossierPage.tsx` (ligne 370), le bouton "Ouvrir" sur les documents source affiche `toast.info('Document source non disponible en demo')`. C'est correct mais le bouton devrait etre style differemment pour indiquer clairement qu'il s'agit d'un placeholder demo.

**Correction :**
- Ajouter un `disabled` visuel et un tooltip "Fonctionnalite demo" au lieu d'un bouton actif qui affiche un toast
- Changer le texte en "Source" avec une icone plus subtile

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 5. AS -- Interface "4 gros boutons" non conforme mobile-first

Le spec (page 14) dit : "4 gros boutons (constantes, surveillance, brancardage, confort). Grandes zones tactiles." Les boutons existent mais le composant `BigButton` pourrait etre plus grand et plus tactile sur mobile (spec dit "44px min").

**Ajout :**
- Augmenter la taille des BigButtons en mode mobile (min-height 80px au lieu de la taille actuelle)
- Ajouter un effet de press/haptic (scale-95 on active) pour le feedback tactile

**Fichier** : `src/components/urgence/BigButton.tsx`

---

## 6. Board -- Filtre "Mes patients" devrait persister par session

Le filtre "Mes patients" persiste via localStorage (deja fait, ligne 44 de BoardPage), mais quand un medecin se deconnecte et se reconnecte, l'etat persiste meme si c'est un autre medecin. Ce n'est pas un bug grave mais le spec insiste sur l'isolation par profil.

**Correction :**
- Prefixer le localStorage key avec l'user ID : `urgenceos_myOnly_${user.id}`

**Fichier** : `src/pages/BoardPage.tsx`

---

## 7. Landing -- Section "Metriques de succes" incomplete

Le spec (page 21) liste 10 metriques de succes. La landing n'en montre que 5. Ajouter les 5 restantes pour une couverture complete.

**Ajout :**
- Ajouter les metriques manquantes : Autonomie < 30 min, Transmission DAR < 1 min, Acces CRH 0 sec, Score SUS > 80, Offline > 4h
- Passer de 5 colonnes a 2 rangees de 5

**Fichier** : `src/pages/LandingPage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Tagline hero + signature de preuve | Marketing | HeroSection | Non |
| Section "Pourquoi maintenant ?" | Marketing | LandingPage | Non |
| CTA enrichi 3 piliers | Marketing | CTASection | Non |
| Bouton source demo | UX | PatientDossierPage | Non |
| BigButton tactile mobile | UX | BigButton | Non |
| localStorage isole par user | Fix | BoardPage | Non |
| 10 metriques completes | Marketing | LandingPage | Non |

Aucune migration DB necessaire.
