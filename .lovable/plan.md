

# Fonctionnalites encore manquantes -- Audit final spec vs code

Apres comparaison detaillee entre le cahier des charges et le code actuel (post-implementations precedentes), voici les ecarts restants.

---

## 1. Seuil EVA douleur manquant dans vitals-utils.ts

Le fichier `vitals-utils.ts` definit des seuils pour FC, PA, SpO2, T, FR, GCS mais pas pour `eva_douleur`. Le spec prevoit une detection automatique des anomalies pour toutes les constantes.

**Ajout :**
- Seuil `eva_douleur: { max: 6 }` (EVA > 6 = alerte)
- Cela activera automatiquement la mise en evidence rouge sur la pancarte et le dossier patient

**Fichier** : `src/lib/vitals-utils.ts`

---

## 2. Saisie du poids patient (formulaire manquant)

La colonne `poids` existe dans la table `patients` et s'affiche dans le bandeau, mais aucun formulaire ne permet de le saisir.

**Ajouts :**
- Champ poids dans le formulaire d'admission secretaire (`AccueilPage.tsx`)
- Champ poids dans l'etape Identite du tri IOA (`TriagePage.tsx`)
- Mise a jour du patient existant si le poids est saisi

**Fichiers** : `src/pages/AccueilPage.tsx`, `src/pages/TriagePage.tsx`

---

## 3. Aide-soignant -- Constantes FR manquante

L'interface AS ne saisit que FC, PA sys/dia, SpO2, T. Le spec dit que l'AS peut saisir les constantes de base. Il manque au minimum FR (frequence respiratoire).

**Ajout :**
- Champ FR dans le formulaire constantes AS
- Envoi du champ `frequence_respiratoire` dans l'insert vitals

**Fichier** : `src/pages/AideSoignantPage.tsx`

---

## 4. Selecteur de type de prescription (Soins / Examens Bio / Imagerie / Traitements)

Actuellement la categorisation est entierement basee sur des mots-cles dans le nom du medicament. Le spec prevoit 3 clics max pour prescrire, avec un type explicite.

**Ajouts :**
- Ajouter un selecteur "Type" dans le dialog de prescription (`PatientDossierPage.tsx`) : Traitement, Soins, Examens Bio, Imagerie
- Stocker le type dans le champ `notes` ou `frequency` (pas de nouvelle colonne DB necessaire) sous forme de prefixe lisible, ex: `[TYPE:soins]`
- Modifier `categorizePrescription()` pour d'abord verifier le prefixe de type, puis fallback sur mots-cles

**Fichiers** : `src/pages/PatientDossierPage.tsx`, `src/lib/prescription-utils.tsx`

---

## 5. Medecin affiche dans le bandeau patient

La prop `medecinName` existe dans `PatientBanner` mais n'est jamais passee depuis `PatientDossierPage` ni `PancartePage`.

**Ajouts :**
- Charger le profil du medecin assigne (`encounter.medecin_id`) dans `PatientDossierPage` et `PancartePage`
- Passer `medecinName` au composant `PatientBanner`

**Fichiers** : `src/pages/PatientDossierPage.tsx`, `src/pages/PancartePage.tsx`

---

## 6. Board adaptatif par role (vue differente selon le profil)

Le spec prevoit : "Board partage mais affiche differemment selon role : medecin voit diagnostics + Rx, IOA voit file d'attente, IDE voit statut soins, AS voit localisation, secretaire voit statut admin."

Actuellement le board est identique quel que soit le role.

**Ajouts :**
- En mode liste, afficher des infos supplementaires selon le role :
  - Medecin : badge nombre de prescriptions actives
  - IDE : badge "Rx a administrer" (nombre de prescriptions actives)
  - IOA : deja gere (bouton Trier visible)
  - AS : vue simplifiee deja geree via AideSoignantPage (RAS)
  - Secretaire : badge statut administratif
- En mode grille (BoxCell) : ajouter un indicateur contextuel selon le role

**Fichier** : `src/components/urgence/BoardPatientCard.tsx`, `src/pages/BoardPage.tsx`

---

## 7. Templates de prescription pre-remplis

Le spec prevoit "suggestions contextuelles, posologie pre-remplie" pour atteindre 3 clics max.

**Ajouts :**
- Liste de prescriptions frequentes avec posologie pre-remplie dans le dialog de prescription
- Suggestions basees sur le motif SFMU (ex: "Douleur thoracique" -> Aspirine 250mg PO, Heparine...)
- Boutons rapides cliquables qui pre-remplissent le formulaire

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 8. Saisie de poids dans le tri IOA (etape Identite)

Le spec mentionne "poids" dans le bandeau patient. Lors du tri, l'IOA peut mesurer le poids.

**Ajout :**
- Champ poids optionnel dans l'etape Constantes du tri
- Sauvegarde dans la table `patients` via update

**Fichier** : `src/pages/TriagePage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Seuil EVA douleur | Fix | vitals-utils.ts | Non |
| Saisie poids admission | Feature | AccueilPage, TriagePage | Non (colonne existe) |
| FR dans constantes AS | Fix | AideSoignantPage | Non |
| Selecteur type prescription | Feature | PatientDossierPage, prescription-utils | Non |
| Medecin dans bandeau | Fix | PatientDossierPage, PancartePage | Non |
| Board adaptatif par role | Feature | BoardPatientCard, BoardPage | Non |
| Templates prescription | Feature | PatientDossierPage | Non |

Aucune migration DB necessaire -- toutes les colonnes et tables existent deja.

