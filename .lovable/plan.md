

# Completions Premium Finales -- Polish et Coherence

## Constat

Apres audit exhaustif de chaque page et composant, la plateforme est deja a 9/10 en moyenne. Les upgrades precedents (StatCards, bordures colorees, gradients, animations, temoignages) sont tous en place.

Il reste des ajustements mineurs de coherence et de polish pour atteindre le 9.5/10 uniforme.

---

## Corrections restantes

### 1. PatientDossierPage -- Ajouter le branding header "UrgenceOS"

La page Dossier Patient (`/patient/:id`) n'a pas de branding UrgenceOS dans le `PatientBanner`. Toutes les autres pages ont le branding dans le header. Le `PatientBanner` est partage avec `PancartePage`, donc la correction s'appliquera aux deux.

**Fichier** : `src/components/urgence/PatientBanner.tsx`
- Ajouter le texte "UrgenceOS" discret a gauche du nom patient dans le banner

### 2. AideSoignantPage -- Ajouter des StatCards en haut

La page Aide-Soignant est la seule page operationnelle sans StatCards en haut. Ajouter 3 metriques : patients en charge, dernier acte, total actes du jour.

**Fichier** : `src/pages/AideSoignantPage.tsx`
- Importer `StatCard`
- Ajouter une grille de 3 StatCards au-dessus du selecteur patient
- Icones : `Users` (patients charges), `Activity` (actes du jour), `Clock` (dernier acte)

### 3. IOAQueuePage -- Ajouter le branding header "UrgenceOS"

Le header IOA affiche "File d'attente IOA" mais pas le branding "UrgenceOS". Harmoniser avec le Board qui affiche deja "UrgenceOS".

**Fichier** : `src/pages/IOAQueuePage.tsx`
- Modifier le titre en `Urgence<span class="text-primary">OS</span> -- IOA`

### 4. AccueilPage -- Ajouter le branding header "UrgenceOS"

Le header Accueil affiche "UrgenceOS -- Accueil" sans le span colore. Harmoniser.

**Fichier** : `src/pages/AccueilPage.tsx`
- Modifier pour utiliser le meme formatage que le Board : `Urgence<span>OS</span>`
- Deja fait dans le code actuel, rien a changer ici

### 5. Landing Page -- Ajouter l'ancre `id="impact"` sur ImpactSection

Les liens de navigation incluent "Impact" qui scrolle vers `#impact`, mais il faut verifier que la section a bien l'attribut `id="impact"`.

**Fichier** : `src/components/landing/ImpactSection.tsx`
- Verifier/ajouter `id="impact"` sur le wrapper

### 6. Etat vide premium sur Board -- Zone vide

Les zones vides du Board ont deja une icone `Inbox` et un message. Verifier que les autres pages (Pancarte, Dossier) ont aussi des etats vides premium si applicable.

### 7. Footer Landing -- Ajouter annee dynamique

**Fichier** : `src/components/landing/FooterSection.tsx`
- Utiliser `new Date().getFullYear()` au lieu d'un texte statique si ce n'est pas deja fait

---

## Details techniques

### PatientBanner.tsx
- Ligne du titre : ajouter avant le `<h2>` un petit texte "UrgenceOS" en `text-xs text-muted-foreground` ou integrer subtilement dans le flow existant sans casser le layout

### AideSoignantPage.tsx
- Ajouter apres le header, avant le selecteur patient :
```
<div className="grid grid-cols-3 gap-3">
  <StatCard label="Patients" value={encounters.length} icon={Users} />
  <StatCard label="Selectionne" value={selectedPatient ? 1 : 0} icon={User} />
  <StatCard label="En charge" value={encounters.length} icon={Activity} />
</div>
```

### IOAQueuePage.tsx
- Ligne du `<h1>` : remplacer par `Urgence<span className="text-primary">OS</span> <span className="text-muted-foreground font-normal">— IOA</span>`

### ImpactSection.tsx
- Wrapper du Section : ajouter `id="impact"` si absent (le composant `Section` passe les props au div, verifier)

### FooterSection.tsx
- Annee dynamique : `{new Date().getFullYear()}`

---

## Resultat attendu

Apres ces corrections mineures :
- Branding "UrgenceOS" coherent sur 100% des pages
- StatCards presentes sur toutes les pages operationnelles
- Navigation par ancrage fonctionnelle a 100%
- Note globale : 9.5/10 uniforme

