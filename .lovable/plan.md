

# Ajouter les patients en attente au Board (avant et apres IOA)

## Probleme

Le board filtre les patients par zone (SAU, UHCD, Dechocage) mais les patients qui n'ont pas encore de zone assignee sont invisibles :
- **Avant IOA** : status `arrived`, zone = null (patient enregistre par la secretaire, pas encore trie)
- **Apres IOA sans box** : status `triaged`, zone assignee mais box_number = null (trie mais pas encore installe)
- **Sans zone** : status `triaged` ou `in-progress` mais zone = null (cas marginal)

Ces patients disparaissent du radar de l'equipe.

## Solution

### 1. Nouvelle section "En attente" sur le BoardPage

Ajouter un 5e onglet/section visible en permanence dans les tabs :

```text
[ Tous (30) ] [ SAU (17) ] [ UHCD (8) ] [ Dechocage (5) ] [ En attente (4) ]
```

Le compteur "En attente" combine :
- Patients `arrived` (pre-IOA) : pastille orange "A trier"
- Patients avec zone assignee mais sans box : pastille bleue "A installer"
- Patients sans zone (triaged/in-progress) : pastille jaune "A orienter"

### 2. Contenu de l'onglet "En attente"

Deux sous-sections visuellement distinctes :

**Pre-IOA** (status = `arrived`, zone = null)
- Header avec icone `ClipboardList` et fond orange leger
- Chaque card affiche : nom, age, sexe, heure d'arrivee, temps d'attente (colore si > 30min)
- Bouton "Trier" qui redirige vers `/triage` avec le patientId pre-rempli (comme IOAQueuePage)

**Post-IOA sans box** (status = `triaged` ou `in-progress`, box_number = null)
- Header avec icone `MapPin` et fond bleu leger
- Chaque card affiche : nom, age, sexe, CCMU, motif, zone assignee, temps d'attente
- Dropdown pour assigner un box directement

### 3. Statistique "En attente" dans le header

Ajouter un StatCard supplementaire dans le header du board :
- Icone `Clock` ou `Hourglass`
- Valeur = nombre total de patients en attente
- Variante `warning` si > 5, `critical` si > 10

### 4. Indicateur visuel dans l'onglet "Tous"

Dans la vue "Tous", les patients en attente (sans zone) apparaissent aussi, avec un badge distinctif :
- "A trier" (orange) pour les `arrived`
- "A installer" (bleu) pour ceux avec zone mais sans box

### 5. Modification de la requete de donnees

La requete `fetchEncounters` reste inchangee (elle recupere deja les status `arrived`, `triaged`, `in-progress`). Seul le filtrage cote client change pour inclure les patients sans zone dans la nouvelle section.

---

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/pages/BoardPage.tsx` | Ajout onglet "En attente", StatCard attente dans header, logique de filtrage pour patients sans zone/box |
| `src/components/urgence/BoardPatientCard.tsx` | Ajout props pour afficher badges "A trier" / "A installer", bouton Trier conditionnel |

Aucun nouveau fichier necessaire. Aucune modification base de donnees.

