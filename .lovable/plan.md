

# Audit Mobile Complet — UrgenceOS

## Methode
Inspection du code source + navigation live sur viewport 390x844 (iPhone 14). Pages auditees : Landing, Login, Board, Patient Dossier, Pancarte, Triage.

---

## 1. Points positifs (ce qui fonctionne bien)

- **PWA configuree** : manifest.json, service worker, icones — installable sur home screen.
- **Breakpoint mobile** : `useIsMobile()` a 768px, utilise dans Board, ZoneGrid, header (masque textes boutons).
- **Touch targets** : classes utilitaires `touch-target` (44px) et `touch-target-lg` (60px) definies, `BigButton` a 80px min-height, `active:scale-95` pour feedback tactile.
- **Zones collapsibles** : `ZoneGrid` passe en `Collapsible` sur mobile — bon pattern pour ecrans etroits.
- **Grille adaptative** : BoxCell grid passe de 6 colonnes (XL) a 2 colonnes (mobile).
- **Pinch-to-zoom** : hook `usePinchZoom` disponible pour FloorPlanView.
- **Offline** : queue offline avec localStorage + sync automatique.
- **Dark mode** : variables CSS completes pour light/dark.

---

## 2. Problemes identifies

### P1 — Critiques (bloquants en usage reel)

| # | Probleme | Localisation |
|---|----------|-------------|
| 1 | **Header Board surchargee** : 3 rangees d'elements (logo+badges, filtres zones, boutons actions) empilees sans organisation mobile. Les filtres zone `flex-wrap` debordent et poussent le contenu sous le fold. Sur 390px, le header peut occuper 200px+ de hauteur. | `BoardPage.tsx` L391-461 |
| 2 | **Pas de navigation mobile globale** : aucun bottom nav bar ni hamburger menu dans les pages internes (Board, Dossier, Pancarte). L'utilisateur ne peut pas naviguer entre sections sans bouton retour du navigateur. | Toutes pages internes |
| 3 | **Boutons d'action Dossier Patient non scrollables** : la barre de boutons (Export FHIR, CRH, Ordonnance, Chat, Preparer sortie) est en `flex-wrap` sans scroll horizontal — sur mobile, 5-6 boutons s'empilent sur 3 lignes. | `PatientDossierPage.tsx` L132-149 |
| 4 | **StatCards grid-cols-4 fixe** : les 4 stat cards du Board sont en `grid-cols-4` sans breakpoint mobile, ce qui les ecrase a ~85px chacune. | `BoardPage.tsx` L467 |

### P2 — Importants (degradent l'experience)

| # | Probleme | Localisation |
|---|----------|-------------|
| 5 | **BoxCell trop petite** : `min-h-[90px]` sur 2 colonnes = cartes etroites, texte tronque agressivement (8 caracteres nom). Le grip icon drag n'est pas utilisable au doigt. | `BoxCell.tsx` |
| 6 | **Drag & Drop non fonctionnel sur mobile** : utilise les evenements HTML5 DragEvent qui ne fonctionnent PAS sur ecrans tactiles. Touch events sont necessaires pour le drag mobile. | `BoxCell.tsx`, `ZoneGrid.tsx`, `BoardPatientCard.tsx` |
| 7 | **PatientDossierPage layout 1/5 cols** : le `grid grid-cols-1 lg:grid-cols-5` empile tout verticalement, mais la colonne droite (resultats, prescriptions) se retrouve tres bas — pas de tabs mobile. | `PatientDossierPage.tsx` L187 |
| 8 | **Formulaire Triage stepper** : pas de validation de la taille des touch targets des inputs vitaux. Les selects natifs sont OK mais les boutons stepper (Precedent/Suivant) manquent de `touch-target`. | `TriagePage.tsx` |
| 9 | **Pancarte tres longue** : 900+ lignes, sections collapsibles mais la page peut facilement depasser 10 ecrans en scroll vertical. Pas de navigation rapide entre sections. | `PancartePage.tsx` |

### P3 — Mineurs (ameliorations)

| # | Probleme | Localisation |
|---|----------|-------------|
| 10 | **Cookie consent** : les 3 boutons sont empiles correctement mais occupent beaucoup d'espace vertical sur petit ecran. | Visible au screenshot |
| 11 | **Filtres zone** dans le header : les chips ne sont pas scrollables horizontalement, elles wrap. | `BoardPage.tsx` L401-413 |
| 12 | **Pas de safe-area-inset** : le CSS ne gere pas les notch/home indicator iOS. | `index.css` |

---

## 3. Plan de correction recommande

### Phase 1 — Header Board mobile (P1-1, P1-4, P2-11)
- Reorganiser le header Board mobile : logo + role a gauche, icones compactes a droite
- Filtres zone dans un scroll horizontal `overflow-x-auto flex-nowrap`
- StatCards en `grid-cols-2 sm:grid-cols-4`
- Boutons texte masques sur mobile (deja partiellement fait)

### Phase 2 — Bottom Navigation (P1-2)
- Ajouter un `BottomNav` fixe sur mobile avec 4-5 items : Board, Triage, Chat, Notifications, Profil
- Appliquer `pb-safe` / `env(safe-area-inset-bottom)` pour iOS

### Phase 3 — Dossier Patient mobile (P1-3, P2-7)
- Remplacer la barre de boutons par un menu dropdown ou une barre scrollable horizontale
- Transformer le layout 5-cols en Tabs mobiles (Synthese | Resultats | Prescriptions | Timeline)

### Phase 4 — Drag & Drop tactile (P2-6)
- Implementer touch-based drag avec `touchstart/touchmove/touchend` events
- Ou remplacer par un systeme de "selectionner puis choisir destination" sur mobile (plus fiable)

### Phase 5 — Polish
- Safe area insets CSS (`env(safe-area-inset-*)`)
- BoxCell touch targets plus grands sur mobile (`min-h-[110px]`)
- Pancarte : navigation rapide par ancres ou tabs par section
- Triage : boutons stepper avec `touch-target` class

---

## Resume

```text
┌─────────────────────────────────────┐
│         SCORE MOBILE GLOBAL         │
│           ██████░░░░  6/10          │
├─────────────────────────────────────┤
│ PWA / Offline        ██████████ 10  │
│ Touch targets        ███████░░░  7  │
│ Layout responsif     █████░░░░░  5  │
│ Navigation           ████░░░░░░  4  │
│ Drag & Drop mobile   ██░░░░░░░░  2  │
│ Formulaires          ███████░░░  7  │
│ Performance percue   ████████░░  8  │
└─────────────────────────────────────┘
```

Les fondations (PWA, offline, theme) sont solides. Les principales faiblesses sont le **header Board surchargee**, l'**absence de navigation mobile**, et le **drag & drop inoperant** sur tactile. Les phases 1 a 3 suffiraient a passer de 6/10 a 8/10.

