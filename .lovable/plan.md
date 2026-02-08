

# Vue grille des boxes -- tout le service d'un coup d'oeil

## Concept

Remplacer la vue liste/onglets actuelle par une **vue grille** ou chaque box physique du service est represente par une cellule. L'ensemble des 3 zones + la file d'attente sont affiches **simultanement sur la meme page**, sans onglets.

```text
+-----------------------------------------------------------------+
| Header (stats globaux + filtres)                                |
+-----------------------------------------------------------------+
| EN ATTENTE (bandeau horizontal)                                 |
| [Pre-IOA: DUPONT] [A orienter: MARTIN] [A installer: LEROY]    |
+-----------------------------------------------------------------+
| SAU (17 boxes)                              7/17 occupes        |
| +----+ +----+ +----+ +----+ +----+ +----+                      |
| | 1  | | 2  | | 3  | | 4  | | 5  | | 6  |                     |
| |DUP.| |    | |MAR.| |LER.| |    | |PET.|                      |
| |C3  | |    | |C2  | |C4  | |    | |C1  |                      |
| +----+ +----+ +----+ +----+ +----+ +----+                      |
| +----+ +----+ +----+ +----+ +----+ +----+                      |
| | 7  | | 8  | | 9  | |10  | |11  | |12  |                     |
| +----+ +----+ +----+ +----+ +----+ +----+                      |
| +----+ +----+ +----+ +----+ +----+                              |
| |13  | |14  | |15  | |16  | |17  |                             |
| +----+ +----+ +----+ +----+ +----+                              |
+-----------------------------------------------------------------+
| UHCD (8 boxes)                              3/8 occupes         |
| +----+ +----+ +----+ +----+ +----+ +----+ +----+ +----+        |
| | 1  | | 2  | | 3  | | 4  | | 5  | | 6  | | 7  | | 8  |      |
| +----+ +----+ +----+ +----+ +----+ +----+ +----+ +----+        |
+-----------------------------------------------------------------+
| DECHOCAGE (5 boxes)                         1/5 occupes         |
| +----+ +----+ +----+ +----+ +----+                              |
| | 1  | | 2  | | 3  | | 4  | | 5  |                             |
| +----+ +----+ +----+ +----+ +----+                              |
+-----------------------------------------------------------------+
```

Pas d'onglets, pas de changement de vue : tout est visible simultanement.

---

## Fichiers a creer

### 1. `src/lib/box-config.ts` -- Configuration du service

Nombre de boxes par zone, configurable en un seul endroit :
- SAU : 17 boxes
- UHCD : 8 boxes
- Dechocage : 5 boxes

### 2. `src/components/urgence/BoxCell.tsx` -- Cellule d'un box

Composant compact (environ 120x100px) representant un box physique :

**Box occupe :**
- Bordure gauche coloree selon le CCMU (meme code couleur existant)
- Nom patient en gras (tronque si necessaire)
- Age, sexe en petit
- Temps d'attente (colore si > 2h / > 4h)
- Icone resultat critique (pulse si critique)
- Clic = ouvre le dossier patient

**Box vide :**
- Fond attenue, numero du box centre
- Texte "Libre" discret
- Bordure en pointilles

### 3. `src/components/urgence/ZoneGrid.tsx` -- Grille d'une zone

Affiche une zone complete :
- Header : pastille coloree + nom zone + compteur "occupes/total"
- Grille responsive : 6 colonnes desktop, 3 colonnes tablette, 2 colonnes mobile
- Genere les cellules de 1 a N en mappant les encounters par box_number

### 4. `src/components/urgence/WaitingBanner.tsx` -- Bandeau patients en attente

Bandeau horizontal en haut du board, sous le header, affichant :
- **Pre-IOA** (pastille orange) : patients `arrived` sans zone
- **A orienter** (pastille jaune) : patients tries mais sans zone
- **A installer** (pastille bleue) : patients avec zone mais sans box

Chaque patient est un petit chip cliquable (nom + temps attente). Bouton "Trier" pour les pre-IOA si role IOA/medecin.

---

## Fichiers a modifier

### 5. `src/pages/BoardPage.tsx` -- Refonte complete du layout

- Supprimer le systeme d'onglets (Tabs/TabsList/TabsTrigger/TabsContent)
- Elargir le container a `max-w-7xl` pour exploiter la largeur
- Afficher les 3 zones empilees verticalement avec ZoneGrid
- Afficher le WaitingBanner entre le header et les grilles
- Toggle Grille/Liste persiste dans localStorage (`urgenceos_viewMode`)
- Le mode liste reste disponible (vue actuelle avec PatientCard) comme fallback
- Le filtre "Mes patients" met en surbrillance les boxes concernes dans la grille
- StatCards du header : afficher le taux d'occupation (ex: "SAU 7/17")

### 6. `src/pages/TriagePage.tsx` -- Selecteur visuel de box

A l'etape Orientation (step 4), remplacer l'input numero par un selecteur visuel :
- Afficher les boxes disponibles de la zone selectionnee en grille de badges cliquables
- Boxes occupes = grise et non cliquable
- Boxes libres = cliquable, le clic remplit le champ box_number
- Necessite de passer les encounters en cours au composant (ou fetch les boxes occupes)

### 7. `src/components/urgence/PatientBanner.tsx` -- Afficher le box

Ajouter une prop optionnelle `boxNumber` :
- Si present, afficher "Box X" a cote du nom du patient dans la banniere
- Style discret mais visible (badge outline)

### 8. `src/pages/PatientDossierPage.tsx` -- Passer boxNumber au banner

Transmettre `encounter.box_number` au composant PatientBanner.

### 9. `src/pages/PancartePage.tsx` -- Passer boxNumber au banner

Meme chose : transmettre `encounter.box_number` au PatientBanner.

---

## Details techniques

**Responsive :**
- Desktop (>1280px) : 6 colonnes par zone, toutes zones visibles
- Tablette (768-1280px) : 4 colonnes
- Mobile (<768px) : 2 colonnes, zones collapsibles pour economiser l'espace vertical

**Performance :**
- Meme requete Supabase existante, pas de requete supplementaire
- Realtime deja en place sur `encounters` et `results`
- Les boxes vides sont generes cote client a partir de box-config.ts

**Aucune modification base de donnees requise.**

