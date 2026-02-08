

# Audit final spec v11 -- Polissage premium de la plateforme

Apres 6 rounds d'implementation et comparaison exhaustive du spec (50 pages) avec le code actuel, la couverture fonctionnelle est tres bonne. Les ecarts restants sont principalement des finitions UX premium et des details du spec non encore implementes.

---

## 1. Landing page -- Testimonials et section "7 innovations" manquantes

Le composant `TestimonialsSection` est importe dans le fichier mais n'est **pas affiche** dans `LandingPage.tsx`. La section "7 innovations cles" du spec (page 21) n'est pas non plus presente.

**Corrections :**
- Ajouter `<TestimonialsSection />` dans le rendu de `LandingPage.tsx` (entre ImpactSection et la section metriques)
- Ajouter une section "7 innovations cles" avec les items du spec : Pancarte unifiee, DAR, Interface adaptative, Admin 1 tap, Timeline IA, Offline-first, Secure-by-design
- Ajouter le tagline Apple-like du spec ("Moins de clics. Plus de soin.") dans le hero ou CTA

**Fichier** : `src/pages/LandingPage.tsx`

---

## 2. Diagnostic CIM-10 -- Pas de sauvegarde sur l'encounter

Le medecin peut saisir un diagnostic CIM-10 dans `PatientDossierPage.tsx` mais celui-ci est enregistre dans `timeline_items` et non sur l'encounter directement. Le spec dit que le diagnostic doit apparaitre sur le board pour les medecins. Actuellement, le board n'affiche aucun diagnostic.

**Ajout :**
- Afficher le dernier diagnostic (de type `diagnostic` dans `timeline_items`) sur la `PatientCard` du board en mode liste
- Ajouter un champ texte sous le nom du patient montrant le diagnostic si disponible

**Fichiers** : `src/components/urgence/BoardPatientCard.tsx`, `src/pages/BoardPage.tsx`

---

## 3. Board mode liste -- Drag and drop entre zones manquant

Le spec dit (page 13, section 9.1) : "Board panoramique SAU/UHCD/Dechocage. Drag and drop entre zones." Actuellement, le changement de zone se fait via un Select dropdown. Il manque un mecanisme de drag and drop visuel.

Implementer un vrai drag and drop est complexe, mais on peut ameliorer l'UX avec des boutons rapides de changement de zone directement visibles (au lieu d'un select cache).

**Ajout :**
- Sur chaque `PatientCard` en mode liste, remplacer le Select de zone par 3 boutons compacts colores (SAU/UHCD/Dechocage) avec l'actif mis en evidence
- Plus intuitif et plus rapide que le dropdown actuel

**Fichier** : `src/components/urgence/BoardPatientCard.tsx`

---

## 4. Onboarding zero-training -- Guided tour premier login

Le spec dit (page 16, section 11) : "Guided tour 3-5 min premier login (different par role). Tooltips contextuels." Actuellement, aucun onboarding n'existe.

**Ajout :**
- Detecter si c'est le premier login du role (via `localStorage` flag `urgenceos_onboarded_{role}`)
- Afficher un bandeau d'aide contextuel en haut de la page principale du role avec 3-4 tips specifiques au role
- Bouton "J'ai compris" pour ne plus afficher
- Pas de librairie externe, simple composant `OnboardingBanner`

**Fichiers** : `src/components/urgence/OnboardingBanner.tsx` (nouveau), `src/pages/BoardPage.tsx`, `src/pages/PancartePage.tsx`, `src/pages/IOAQueuePage.tsx`, `src/pages/AideSoignantPage.tsx`, `src/pages/AccueilPage.tsx`

---

## 5. PatientBanner -- Manque le motif en gras et le separateur premium

Le bandeau patient fonctionne mais peut etre plus premium visuellement. Le spec insiste sur une esthetique "Apple-like".

**Ajouts premium :**
- Motif affiche en badge discret au lieu de texte brut
- Separateurs visuels plus nets entre les elements
- Micro-animation de fade-in sur le bandeau
- Fond degrade subtil sur le bandeau (glassmorphism)

**Fichier** : `src/components/urgence/PatientBanner.tsx`

---

## 6. Pancarte IDE -- Compteur de temps depuis derniere constante

Le spec met l'accent sur la surveillance. Il serait utile d'afficher depuis combien de temps la derniere constante a ete prise, avec un code couleur (vert < 30 min, orange 30-60 min, rouge > 1h).

**Ajout :**
- Sous la section constantes de la pancarte, afficher "Dernieres constantes il y a X min" avec couleur contextuelle
- Timer qui se met a jour automatiquement

**Fichier** : `src/pages/PancartePage.tsx`

---

## 7. Board grille -- Animation premium sur les BoxCells

Les BoxCells sont fonctionnelles mais manquent de polish premium. Le spec dit "Apple-like".

**Ajouts :**
- Hover scale subtil (scale-[1.02]) sur les boxes occupees
- Transition de couleur fluide quand un patient est ajoute/retire
- Ombre portee plus marquee sur hover
- Micro-badge du temps d'attente dans la box

**Fichier** : `src/components/urgence/BoxCell.tsx`

---

## 8. Secretaire -- Compteur temps reel et bouton "Board" de contexte

La page secretaire n'a pas de timer temps reel ni de lien vers le board (le secretaire est redirige depuis le board, mais ne peut pas voir le board en lecture).

**Ajout :**
- Timer avec `setInterval` (60s) pour rafraichir les temps d'attente dans la liste des admissions
- Afficher le temps ecoule depuis l'arrivee pour chaque admission dans la liste

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 9. Discharge Dialog -- Ordonnance de sortie

Le spec dit (page 13) : "Sortie : CRH auto, ordonnance auto, RPU auto, envoi DMP/MSSante 1 clic." Le dialog de sortie permet un resume mais pas d'ordonnance de sortie.

**Ajout :**
- Champ "Ordonnance de sortie" (textarea optionnel) dans le `DischargeDialog`
- Sauvegarde comme `timeline_item` de type `ordonnance`

**Fichier** : `src/components/urgence/DischargeDialog.tsx`

---

## 10. Prescription -- Templates contextuels incomplets

Le spec dit "Suggestions contextuelles (motif + gravite)". Les templates existent pour certains motifs mais la liste est incomplete. Il manque des templates pour les motifs courants restants.

**Ajout :**
- Ajouter des templates pour : Chute personne agee, Malaise/syncope, Intoxication, AEG, Plaie/brulure
- Enrichir les templates existants

**Fichier** : `src/lib/prescription-utils.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Landing : testimonials + 7 innovations | UX | LandingPage | Non |
| Diagnostic sur board | Feature | BoardPatientCard, BoardPage | Non |
| Zone quick-switch boutons | UX | BoardPatientCard | Non |
| Onboarding banner par role | Feature | nouveau composant + 5 pages | Non |
| PatientBanner premium | UX | PatientBanner | Non |
| Timer dernieres constantes | UX | PancartePage | Non |
| BoxCell animations premium | UX | BoxCell | Non |
| Timer temps reel accueil | UX | AccueilPage | Non |
| Ordonnance dans discharge | Feature | DischargeDialog | Non |
| Templates Rx supplementaires | Feature | prescription-utils | Non |

Aucune migration DB necessaire.

