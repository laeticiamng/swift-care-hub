/**
 * Mapping médicament → familles d'allergies connues.
 * Utilisé pour la vérification avant prescription.
 */
const ALLERGY_FAMILIES: Record<string, string[]> = {
  // Pénicillines
  amoxicilline: ['penicilline', 'pénicilline', 'amoxicilline', 'augmentin', 'beta-lactamine', 'bêta-lactamine'],
  augmentin: ['penicilline', 'pénicilline', 'amoxicilline', 'augmentin', 'beta-lactamine'],
  'amoxicilline/acide clavulanique': ['penicilline', 'pénicilline', 'amoxicilline', 'augmentin', 'beta-lactamine'],
  oxacilline: ['penicilline', 'pénicilline', 'beta-lactamine'],
  // Céphalosporines
  ceftriaxone: ['cephalosporine', 'céphalosporine', 'beta-lactamine', 'bêta-lactamine'],
  cefotaxime: ['cephalosporine', 'céphalosporine', 'beta-lactamine'],
  // AINS
  ibuprofene: ['ains', 'ibuprofène', 'ibuprofen', 'anti-inflammatoire'],
  ibuprofène: ['ains', 'ibuprofène', 'anti-inflammatoire'],
  ketoprofene: ['ains', 'kétoprofène', 'anti-inflammatoire'],
  kétoprofène: ['ains', 'kétoprofène', 'anti-inflammatoire'],
  diclofenac: ['ains', 'diclofénac', 'anti-inflammatoire'],
  aspirine: ['ains', 'aspirine', 'acide acétylsalicylique', 'anti-inflammatoire'],
  // Sulfamides
  sulfamethoxazole: ['sulfamide', 'sulfaméthoxazole', 'bactrim'],
  bactrim: ['sulfamide', 'sulfaméthoxazole', 'bactrim'],
  // Morphiniques
  morphine: ['morphine', 'morphinique', 'opioïde', 'opiacé'],
  tramadol: ['tramadol', 'opioïde'],
  codeine: ['codéine', 'opioïde', 'opiacé'],
  codéine: ['codéine', 'opioïde', 'opiacé'],
  // Produits de contraste
  iode: ['iode', 'produit de contraste', 'pci'],
  // Latex
  latex: ['latex'],
};

/**
 * Vérifie si un médicament entre en conflit avec les allergies du patient.
 * Retourne la liste des allergies en conflit, ou un tableau vide si aucun conflit.
 */
export function checkAllergyConflict(medicationName: string, patientAllergies: string[]): string[] {
  if (!patientAllergies || patientAllergies.length === 0) return [];
  
  const medLower = medicationName.toLowerCase().trim();
  const conflicts: string[] = [];
  
  // Check direct match
  for (const allergy of patientAllergies) {
    const allergyLower = allergy.toLowerCase().trim();
    
    // Direct name match
    if (medLower.includes(allergyLower) || allergyLower.includes(medLower)) {
      conflicts.push(allergy);
      continue;
    }
    
    // Check via family mapping
    for (const [drug, families] of Object.entries(ALLERGY_FAMILIES)) {
      if (medLower.includes(drug)) {
        if (families.some(f => allergyLower.includes(f) || f.includes(allergyLower))) {
          conflicts.push(allergy);
          break;
        }
      }
    }
  }
  
  return [...new Set(conflicts)];
}

/**
 * Interactions médicamenteuses courantes aux urgences.
 * Niveau 'warning' = prescription autorisée avec confirmation.
 * Niveau 'info' = note discrète.
 */
export interface DrugInteraction {
  level: 'warning' | 'info';
  message: string;
}

const INTERACTION_RULES: { meds: string[]; with_meds: string[]; level: 'warning' | 'info'; message: string }[] = [
  // AINS + anticoagulants → warning
  { meds: ['ibuprofene', 'ibuprofène', 'ketoprofene', 'kétoprofène', 'diclofenac', 'aspirine'], with_meds: ['heparine', 'enoxaparine', 'lovenox', 'warfarine', 'coumadine', 'rivaroxaban', 'xarelto', 'apixaban', 'eliquis', 'dabigatran', 'pradaxa', 'anticoagulant'], level: 'warning', message: 'AINS + anticoagulant : risque hémorragique majoré' },
  // AINS + AINS → warning
  { meds: ['ibuprofene', 'ibuprofène', 'ketoprofene', 'kétoprofène', 'diclofenac'], with_meds: ['aspirine'], level: 'warning', message: 'Association AINS + aspirine : risque gastrique et hémorragique' },
  // AINS + insuffisance rénale marqueurs
  { meds: ['ibuprofene', 'ibuprofène', 'ketoprofene', 'kétoprofène', 'diclofenac'], with_meds: ['ieca', 'iec', 'ramipril', 'enalapril', 'lisinopril', 'perindopril', 'sartan', 'losartan', 'valsartan', 'irbesartan'], level: 'warning', message: 'AINS + IEC/sartan : risque d\'insuffisance rénale aiguë' },
  // Morphine + benzodiazépines → warning
  { meds: ['morphine', 'oxycodone', 'fentanyl', 'tramadol', 'codeine', 'codéine'], with_meds: ['diazepam', 'diazépam', 'midazolam', 'lorazepam', 'lorazépam', 'alprazolam', 'benzodiazepine', 'benzodiazépine'], level: 'warning', message: 'Opioïde + benzodiazépine : risque de dépression respiratoire' },
  // Metformine + produit de contraste iodé → info
  { meds: ['metformine', 'glucophage'], with_meds: ['iode', 'produit de contraste', 'scanner injecté'], level: 'info', message: 'Metformine à suspendre si injection de produit de contraste iodé' },
  // Potassium + IEC/spironolactone → info
  { meds: ['potassium', 'diffu-k', 'kaleorid'], with_meds: ['spironolactone', 'aldactone', 'eplérénone', 'ramipril', 'enalapril', 'lisinopril'], level: 'info', message: 'Potassium + IEC/antialdostérone : surveiller la kaliémie' },
];

/**
 * Vérifie les interactions médicamenteuses entre un nouveau médicament
 * et les traitements en cours du patient.
 */
export function checkDrugInteractions(
  medicationName: string,
  currentMedications: string[]
): DrugInteraction[] {
  if (!currentMedications || currentMedications.length === 0) return [];

  const medLower = medicationName.toLowerCase().trim();
  const interactions: DrugInteraction[] = [];

  for (const rule of INTERACTION_RULES) {
    const newMedMatches = rule.meds.some(m => medLower.includes(m));
    const currentMatches = currentMedications.some(cm => {
      const cmLower = cm.toLowerCase().trim();
      return rule.with_meds.some(wm => cmLower.includes(wm));
    });
    // Also check reverse (new med is the "with" and current is the "med")
    const newMedMatchesReverse = rule.with_meds.some(m => medLower.includes(m));
    const currentMatchesReverse = currentMedications.some(cm => {
      const cmLower = cm.toLowerCase().trim();
      return rule.meds.some(wm => cmLower.includes(wm));
    });

    if ((newMedMatches && currentMatches) || (newMedMatchesReverse && currentMatchesReverse)) {
      interactions.push({ level: rule.level, message: rule.message });
    }
  }

  return [...new Map(interactions.map(i => [i.message, i])).values()];
}
