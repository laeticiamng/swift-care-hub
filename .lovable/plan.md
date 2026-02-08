

# Ajout des fonctionnalites manquantes -- Audit complet spec vs plateforme

## Analyse des ecarts

Apres comparaison detaillee du cahier des charges (50 pages) avec le code actuel, voici les fonctionnalites manquantes, classees par priorite.

---

## 1. Dossier Patient -- Diagnostic et codage CIM-10 (manquant)

Le spec prevoit : "Diagnostic CIM-10, code, severite" (section 12, FHIR model). Actuellement, le dossier patient n'a aucun champ diagnostic.

**Ajouts :**
- Section "Diagnostic" dans `PatientDossierPage.tsx` (colonne gauche, sous les notes medicales)
- Champ texte libre pour le diagnostic + badge codage CIM-10 (optionnel)
- Sauvegarde comme `timeline_item` de type `diagnostic` (type deja dans l'enum DB)
- Affichage dans la timeline avec icone Microscope

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 2. Dossier Patient -- Traitements en cours du patient (affichage manquant)

Le spec prevoit : "Derniere ordonnance, traitements en cours remontes". Le champ `traitements_actuels` existe dans la table `patients` (jsonb) mais n'est affiche nulle part.

**Ajouts :**
- Section "Traitements en cours" dans la colonne droite du dossier, sous les antecedents/allergies
- Affichage des traitements actuels du patient (issus de `patient.traitements_actuels`)
- Icone Pill, style coherent avec les badges antecedents

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## 3. Pancarte IDE -- Frequence respiratoire + GCS + EVA douleur (manquants)

Le spec prevoit 8 constantes : FC, PA, SpO2, T, FR, GCS, EVA. La pancarte n'affiche que 4 (FC, PA, SpO2, T) et la saisie n'inclut pas FR, GCS, EVA.

**Ajouts :**
- Ajouter FR, GCS, EVA dans l'affichage des constantes (grille 4 -> 7 colonnes adaptatives)
- Ajouter FR, GCS, EVA dans le formulaire de saisie inline
- Meme logique d'alerte anomalie (`isVitalAbnormal` deja supporte ces champs)

**Fichier** : `src/pages/PancartePage.tsx`

---

## 4. Pancarte IDE -- Historique des transmissions DAR (lecture manquante)

Les transmissions sont creees mais l'historique n'est pas affiche. Le spec dit "Transmissions DAR auto-alimentees".

**Ajouts :**
- Section depliable sous la DAR active montrant les transmissions anterieures
- Chaque transmission avec horodatage, contenu D/A/R, et auteur
- Collapsible pour ne pas surcharger l'ecran

**Fichier** : `src/pages/PancartePage.tsx`

---

## 5. Board -- Filtre "Mes patients" en mode grille (surbrillance manquante)

Le `highlightedIds` est passe a `ZoneGrid` mais le composant `BoxCell` ne l'utilise pas pour un effet visuel.

**Ajouts :**
- `BoxCell` : si le patient est dans les "highlighted", ajouter un ring/halo visuel (ring-2 ring-primary)
- Les boxes non highlights restent en opacite reduite quand le filtre est actif

**Fichiers** : `src/components/urgence/BoxCell.tsx`, `src/components/urgence/ZoneGrid.tsx`

---

## 6. Sortie patient -- CCMU/GEMSA de sortie (manquant)

Le spec prevoit CCMU de sortie et codage GEMSA. Le `DischargeDialog` ne les inclut pas.

**Ajouts :**
- Selecteur CCMU de sortie (1-5) dans le dialog
- Selecteur GEMSA (1-6) dans le dialog
- Sauvegarde dans l'encounter (champ ccmu deja present, ajouter un champ `gemsa` ou utiliser les `details` du audit_log)

**Fichier** : `src/components/urgence/DischargeDialog.tsx`
**Migration** : Ajouter colonne `gemsa integer` a la table `encounters`

---

## 7. Accueil Secretaire -- Adresse patient (champ manquant)

Le spec prevoit adresse dans le formulaire d'admission. Le champ `adresse` existe dans la table `patients` mais n'est pas dans le formulaire.

**Ajout :**
- Champ "Adresse" dans le formulaire d'admission

**Fichier** : `src/pages/AccueilPage.tsx`

---

## 8. Dossier Patient -- Poids du patient (manquant dans le bandeau)

Le spec prevoit "Identite, age, poids, CCMU, motif, allergies, medecin" dans le bandeau patient.

**Ajouts :**
- Champ poids optionnel dans la fiche patient (necessite colonne `poids` dans `patients`)
- Affichage dans le `PatientBanner` si present

**Fichier** : `src/components/urgence/PatientBanner.tsx`
**Migration** : Ajouter colonne `poids numeric` a la table `patients`

---

## 9. Board -- Assignation medecin depuis le board (manquant)

Le spec prevoit : "Notification medecin" lors de l'orientation. Le board permet de changer de zone mais pas d'assigner un medecin.

**Ajouts :**
- Selecteur medecin dans la PatientCard du mode liste (dropdown)
- Action "Assigner medecin" depuis le board

**Fichier** : `src/components/urgence/BoardPatientCard.tsx`

---

## 10. IOA Queue -- Navigation vers le board (amelioration)

Le spec prevoit que l'IOA puisse voir le board ET la file. Le bouton "Board" existe deja. RAS.

---

## 11. Medecin traitant (affichage manquant)

Le champ `medecin_traitant` existe dans `patients` mais n'est affiche nulle part.

**Ajout :**
- Affichage dans le dossier patient, section antecedents/infos

**Fichier** : `src/pages/PatientDossierPage.tsx`

---

## Resume des changements

| Changement | Type | Fichier(s) | Migration DB |
|---|---|---|---|
| Diagnostic CIM-10 | Feature | PatientDossierPage | Non (enum existe) |
| Traitements en cours | Affichage | PatientDossierPage | Non (champ existe) |
| FR + GCS + EVA pancarte | Feature | PancartePage | Non (colonnes existent) |
| Historique transmissions | Affichage | PancartePage | Non |
| Surbrillance "Mes patients" | UX | BoxCell, ZoneGrid | Non |
| CCMU/GEMSA sortie | Feature | DischargeDialog | Oui (colonne gemsa) |
| Adresse admission | Affichage | AccueilPage | Non (champ existe) |
| Poids patient | Feature | PatientBanner | Oui (colonne poids) |
| Assignation medecin board | Feature | BoardPatientCard | Non |
| Medecin traitant affichage | Affichage | PatientDossierPage | Non |

## Migrations DB necessaires

```sql
ALTER TABLE encounters ADD COLUMN gemsa integer;
ALTER TABLE patients ADD COLUMN poids numeric;
```

## Ce qui n'est PAS implemente (hors scope MVP)

Les elements suivants sont decrits dans le spec comme V2/V3 et ne sont pas inclus dans ce plan :
- IA RAG pipeline (V2)
- Documentation ambiante (V2)
- CRH/RPU auto-genere (V2)
- Offline-first / Service Workers (architecture V1+)
- Interop HL7v2/FHIR (V1)
- DMP/MSSante (V2)
- Guided tour onboarding (V2)
- Drag and drop board (V2)

