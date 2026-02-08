

# Audit UrgenceOS -- Resultats et Actions Restantes

## Etat des lieux : 90% deja implemente

Apres revue complete du code et des donnees en base, voici le constat :

### Deja fait (ne rien casser)

| # Ticket | Feature | Statut |
|----------|---------|--------|
| 1 | Route /triage | OK -- route `/triage` existe, navigation par state depuis IOA |
| 2 | Landing page a `/` | OK -- LandingPage affichee pour visiteurs non connectes |
| 3 | Prescriptions seed | OK -- 17 prescriptions en base |
| 4 | Resultats seed | OK -- 9 resultats dont 5 critiques, 1 troponine |
| 5 | Bouton Administre pancarte | OK -- `handleAdminister()` complet avec audit log |
| 6 | Workflow tri IOA 5 etapes | OK -- wizard complet avec progress bar, SFMU, CIMU auto |
| 7 | Sparklines constantes | OK -- Recharts LineChart sur dossier ET pancarte |
| 8 | Modal prescription | OK -- Dialog 3 champs + allergie check + audit log |
| 9 | Resultats avec alertes | OK -- badge critique, badge "Nouveau", contenu depliable |
| 10 | Timeline enrichie | OK -- icones par type, source/date/auteur, toggle Essentiel |
| 11 | Interface AS actions | OK -- 4 vues fonctionnelles avec insert DB |
| 12 | Accueil recherche patient | OK -- autocomplete + pre-remplissage |
| 13 | Landing marketing | OK -- Hero, Probleme, Roles, Impact, CTA |
| 14 | Board temps attente | OK -- rouge > 4h, orange > 2h (seuils corrects) |
| 16 | PrescriptionLine | OK -- integre directement dans PancartePage |
| 17 | Audit trail | OK -- administration, prescription, zone_change |
| 18 | Realtime prescriptions | OK -- subscription Supabase sur PancartePage |

### Ce qui reste a faire (5 items)

---

## Plan d'implementation

### 1. Toggle "Mes patients" persistant (localStorage)

Le bouton "Mes patients" sur le Board perd son etat au rechargement. Ajouter la persistance via localStorage.

**Fichier** : `src/pages/BoardPage.tsx`
- Remplacer `useState(false)` par un state initialise depuis `localStorage.getItem('urgenceos_myOnly')`
- Ajouter un `useEffect` qui sauvegarde dans localStorage a chaque changement

### 2. Enrichir le seed data

Les donnees existent mais sont insuffisantes pour une demo convaincante :
- Seulement 17 prescriptions (cible : 30+)
- 0 administrations (cible : 15+)
- 0 procedures (cible : 10+)
- 9 resultats tous "bio" (manque imagerie)
- 33 timeline items (suffisant mais manque diversite)

**Fichier** : `supabase/functions/seed-data/index.ts`
- Ajouter plus de prescriptions avec mix de priorites (routine/urgent/stat)
- Ajouter des administrations pour certaines prescriptions (pour montrer le statut vert)
- Ajouter des procedures (VVP, prelevement, ECG, pansement)
- Ajouter des resultats imagerie (radio thorax, scanner cerebral) avec `category: 'imagerie'`
- Enrichir les timeline items avec types varies (traitement, diagnostic)

### 3. Bouton "Ouvrir original" sur timeline items

Le ticket demande un bouton "Ouvrir original" sur chaque item de la timeline patient, meme en mode mock.

**Fichier** : `src/pages/PatientDossierPage.tsx`
- Ajouter un petit bouton "Ouvrir" avec icone `ExternalLink` sur chaque timeline item qui a un `source_document`
- Au clic : toast "Document source non disponible en demo"

### 4. Champ N. Securite Sociale sur Accueil

Le formulaire d'admission n'a pas de champ pour le numero de securite sociale.

**Fichier** : `src/pages/AccueilPage.tsx`
- Ajouter un champ "N. SS" optionnel dans le formulaire
- Mapper au champ `ins_numero` de la table `patients` (deja present dans le schema)

### 5. Branding coherent AccueilPage

Le header Accueil affiche "UrgenceOS -- Accueil" sans le span colore sur "OS".

**Fichier** : `src/pages/AccueilPage.tsx`
- Modifier en `Urgence<span className="text-primary">OS</span> -- Accueil`

---

## Details techniques

### BoardPage.tsx -- localStorage persistence
```text
// Remplacement du useState
const [myOnly, setMyOnly] = useState(() => {
  return localStorage.getItem('urgenceos_myOnly') === 'true';
});

useEffect(() => {
  localStorage.setItem('urgenceos_myOnly', String(myOnly));
}, [myOnly]);
```

### seed-data/index.ts -- Ajouts
- 15 administrations liees aux prescriptions existantes
- 10 procedures (vvp, prelevement, ecg, pansement)
- 5 resultats imagerie supplementaires
- Morphine en priorite "stat" pour certains patients

### PatientDossierPage.tsx -- Bouton Ouvrir
- Icone `ExternalLink` de lucide-react
- Positionne a droite de chaque timeline item ayant `source_document`
- Toast informatif au clic

### AccueilPage.tsx -- Champ SS
- Input optionnel place dans la grille existante (3 colonnes)
- Envoye comme `ins_numero` lors de l'insert patient

---

## Ordre d'execution

1. Branding AccueilPage (10 sec)
2. Toggle persistant Board (30 sec)
3. Champ SS Accueil (1 min)
4. Bouton "Ouvrir" timeline (1 min)
5. Enrichir seed data (5 min)

