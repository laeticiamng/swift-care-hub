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
