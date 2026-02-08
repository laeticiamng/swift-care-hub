
# Implementation des fonctionnalites manquantes

## 1. Seuil EVA douleur (vitals-utils.ts)
Ajouter `eva_douleur: { max: 6 }` dans `VITAL_THRESHOLDS` pour declencher les alertes visuelles quand EVA > 6.

## 2. Saisie poids -- AccueilPage.tsx
Ajouter un champ "Poids (kg)" dans le formulaire d'admission (grid `grid-cols-2` existant ligne 168-171, ajouter un champ apres adresse). Passer `poids` dans l'insert patient.

## 3. Saisie poids -- TriagePage.tsx
Ajouter un champ "Poids (kg)" optionnel dans l'etape Constantes (step 2, ligne 400-426). Au submit, faire un `update` du patient avec le poids si renseigne.

## 4. FR dans AideSoignantPage.tsx
- Ajouter `frequence_respiratoire: ''` dans le state `vitals` (ligne 37)
- Ajouter le champ FR dans la liste des inputs constantes (ligne 174-180, apres temperature)
- Ajouter `if (vitals.frequence_respiratoire) obj.frequence_respiratoire = parseInt(vitals.frequence_respiratoire);` dans handleSaveVitals
- Reset FR dans le state apres sauvegarde

## 5. Selecteur type prescription -- PatientDossierPage.tsx
- Ajouter un champ `rx_type` dans le state `newRx` (defaut: `'traitements'`)
- Ajouter un `Select` "Type" dans le dialog de prescription (4 options: Traitement, Soins, Examens Bio, Imagerie)
- Prefixer le `medication_name` ou le `notes` avec `[TYPE:xxx]` pour persistence
- Ajouter des templates de prescriptions frequentes selon le motif SFMU (boutons rapides qui pre-remplissent)

## 6. Mise a jour prescription-utils.tsx
Modifier `categorizePrescription` pour d'abord verifier un prefixe `[TYPE:xxx]` dans `medication_name` ou `notes`, puis fallback sur les mots-cles.

## 7. Medecin dans bandeau -- PatientDossierPage.tsx + PancartePage.tsx
- Dans `fetchAll`, charger le profil du medecin assigne via `encounter.medecin_id`
- Passer `medecinName` a `PatientBanner`

## 8. Board adaptatif par role -- BoardPatientCard.tsx
Ajouter des badges contextuels selon le role passe en prop:
- `medecin` / `ide` : badge nombre de prescriptions actives (necessite ajout d'une prop `rxCount`)
- `secretaire` : badge statut administratif

## 9. BoardPage.tsx
- Fetcher les counts de prescriptions actives par encounter pour les passer aux PatientCards
- Passer `rxCount` a chaque PatientCard en mode liste

## 10. Templates de prescription
Dans le dialog de prescription, ajouter une section "Prescriptions rapides" avec des suggestions basees sur le motif SFMU de l'encounter. Boutons cliquables qui pre-remplissent nom + posologie + voie.

---

## Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `src/lib/vitals-utils.ts` | Ajout seuil `eva_douleur: { max: 6 }` |
| `src/lib/prescription-utils.tsx` | Support prefixe `[TYPE:xxx]` dans categorisation |
| `src/pages/AccueilPage.tsx` | Champ poids dans formulaire admission |
| `src/pages/TriagePage.tsx` | Champ poids dans etape constantes + update patient |
| `src/pages/AideSoignantPage.tsx` | Ajout FR dans saisie constantes |
| `src/pages/PatientDossierPage.tsx` | Selecteur type Rx, templates rapides, medecin bandeau |
| `src/pages/PancartePage.tsx` | Medecin dans bandeau |
| `src/components/urgence/BoardPatientCard.tsx` | Badges adaptatifs par role |
| `src/pages/BoardPage.tsx` | Fetch prescription counts, passage aux cards |

Aucune migration DB necessaire.
