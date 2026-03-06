

# Plan de Service — Vue spatiale des locaux d'urgence

## Contexte

Actuellement, le board affiche les patients dans une grille numerique (box 1, 2, 3...) par zone. C'est fonctionnel mais ne reflete pas la realite spatiale des locaux. Un "plan de service" permet de voir d'un coup d'oeil ou se trouve physiquement chaque patient dans le batiment.

## Ce qui sera construit

### 1. Configuration spatiale des boxes (`box-config.ts`)

Ajouter des coordonnees x/y et dimensions pour chaque box dans chaque zone, representant leur position reelle dans les locaux. Layout type service d'urgence :

```text
+--------------------------------------------------+
|  ACCUEIL / SALLE D'ATTENTE                       |
+--------+--------+--------+--------+--------+-----+
|  Box 1 |  Box 2 |  Box 3 |  Box 4 |  Box 5 |    |
+--------+--------+--------+--------+--------+ C  |
|  Box 6 |  Box 7 |  Box 8 |  Box 9 | Box 10 | O  |
+--------+--------+--------+--------+--------+ U  |
| Box 11 | Box 12 | Box 13 | Box 14 | Box 15 | L  |
+--------+--------+--------+--------+--------+ O  |
|       Box 16    |       Box 17    |         | I  |
+-----------------+-----------------+---------+ R  |
|                                             |    |
|          U H C D  (8 lits)                  |    |
|  +-----+-----+-----+-----+                 |    |
|  | L1  | L2  | L3  | L4  |                 |    |
|  +-----+-----+-----+-----+                 |    |
|  | L5  | L6  | L7  | L8  |                 |    |
|  +-----+-----+-----+-----+                 |    |
+--------------------------------------------|    |
|       DECHOCAGE (5 boxes)                   |    |
|  +--------+--------+--------+              |    |
|  | Dech 1 | Dech 2 | Dech 3 |              |    |
|  +--------+--------+--------+              |    |
|  |   Dech 4   |   Dech 5   |               |    |
|  +-------------+-----------+               |    |
+--------------------------------------------------+
```

### 2. Composant `FloorPlanView` (nouveau)

- Vue SVG/CSS interactive representant le plan du service
- Chaque box est un rectangle cliquable positionne spatialement
- Code couleur identique a BoxCell (CCMU border, temps d'attente, resultats critiques)
- Box vide = grise/pointille, box occupee = carte patient condensee
- Zones visuellement separees avec labels (SAU, UHCD, Dechocage)
- Zone d'attente/couloir pour patients non installes
- Responsive : zoom/pan sur mobile, vue complete sur desktop

### 3. Integration dans BoardPage

- Ajouter un 3e mode de vue : Grille | Liste | **Plan**
- Toggle dans le header (icone `Map`)
- Persistance du choix dans localStorage
- Memes interactions : clic sur un box ouvre le dossier patient

### 4. Details techniques

**Fichiers a creer :**
- `src/components/urgence/FloorPlanView.tsx` — composant principal du plan spatial
- `src/lib/floor-plan-config.ts` — coordonnees/dimensions des boxes par zone

**Fichiers a modifier :**
- `src/pages/BoardPage.tsx` — ajouter le toggle "Plan" et le rendu conditionnel
- `src/lib/box-config.ts` — enrichir avec positions spatiales (optionnel, peut etre dans un fichier separe)

**Approche rendu :**
- CSS Grid avec `grid-template-areas` pour un layout fidele aux locaux
- Pas de SVG complexe : des divs positionnees dans une grille, plus maintenable
- Couloir central et salle d'attente comme zones visuelles non-interactives
- Patients en attente affiches dans la zone "salle d'attente" du plan

