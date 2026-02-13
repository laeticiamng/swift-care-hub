// ================================================================
// UrgenceOS — Module Prescription Pédiatrique
// Calcul automatique des posologies adaptées au poids
// Fonctionnalité absente chez nous, présente chez ResUrgences
// ================================================================

export interface PediatricDrug {
  name: string;
  class: string;
  dose_per_kg: number;
  dose_unit: string;
  max_dose: number;
  max_dose_unit: string;
  route: string;
  frequency: string;
  min_age_months?: number;
  max_age_months?: number;
  contraindications?: string[];
  notes?: string;
}

export interface PediatricDoseResult {
  drug_name: string;
  weight_kg: number;
  age_months?: number;
  calculated_dose: number;
  dose_unit: string;
  capped: boolean;
  max_dose: number;
  route: string;
  frequency: string;
  warnings: string[];
  contraindicated: boolean;
  contraindication_reason?: string;
}

export interface PediatricAgeGroup {
  label: string;
  min_months: number;
  max_months: number;
  typical_weight_kg: number;
}

// ── Tranches d'âge pédiatriques ──

export const PEDIATRIC_AGE_GROUPS: PediatricAgeGroup[] = [
  { label: 'Nouveau-né (0-1 mois)', min_months: 0, max_months: 1, typical_weight_kg: 3.5 },
  { label: 'Nourrisson (1-12 mois)', min_months: 1, max_months: 12, typical_weight_kg: 8 },
  { label: 'Petit enfant (1-3 ans)', min_months: 12, max_months: 36, typical_weight_kg: 12 },
  { label: 'Enfant (3-6 ans)', min_months: 36, max_months: 72, typical_weight_kg: 18 },
  { label: 'Grand enfant (6-12 ans)', min_months: 72, max_months: 144, typical_weight_kg: 30 },
  { label: 'Adolescent (12-18 ans)', min_months: 144, max_months: 216, typical_weight_kg: 55 },
];

// ── Pharmacopée pédiatrique d'urgence ──

export const PEDIATRIC_DRUGS: PediatricDrug[] = [
  // Antalgiques / Antipyrétiques
  {
    name: 'Paracétamol',
    class: 'antalgique',
    dose_per_kg: 15,
    dose_unit: 'mg',
    max_dose: 1000,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'toutes les 6h (max 60mg/kg/j)',
    notes: 'Forme sirop < 6 ans, comprimé > 6 ans',
  },
  {
    name: 'Ibuprofène',
    class: 'AINS',
    dose_per_kg: 10,
    dose_unit: 'mg',
    max_dose: 400,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'toutes les 8h (max 30mg/kg/j)',
    min_age_months: 3,
    contraindications: ['varicelle', 'déshydratation', 'insuffisance rénale', 'allergie AINS'],
    notes: 'CI avant 3 mois. CI si varicelle.',
  },
  // Antibiotiques
  {
    name: 'Amoxicilline',
    class: 'antibiotique',
    dose_per_kg: 25,
    dose_unit: 'mg',
    max_dose: 1000,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'toutes les 8h',
    contraindications: ['allergie pénicilline'],
  },
  {
    name: 'Amoxicilline/Ac. clavulanique',
    class: 'antibiotique',
    dose_per_kg: 25,
    dose_unit: 'mg',
    max_dose: 1000,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'toutes les 8h (composante amox)',
    contraindications: ['allergie pénicilline'],
  },
  {
    name: 'Ceftriaxone IV',
    class: 'antibiotique',
    dose_per_kg: 50,
    dose_unit: 'mg',
    max_dose: 2000,
    max_dose_unit: 'mg',
    route: 'IV',
    frequency: '1x/jour',
    contraindications: ['allergie céphalosporine', 'nouveau-né ictérique'],
    notes: 'Méningite: 100mg/kg/j. Max 4g/j.',
  },
  // Corticoïdes
  {
    name: 'Dexaméthasone (croup)',
    class: 'corticoïde',
    dose_per_kg: 0.15,
    dose_unit: 'mg',
    max_dose: 16,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'dose unique',
    notes: 'Laryngite aiguë / croup. Peut être donné en IM.',
  },
  {
    name: 'Prednisolone (asthme)',
    class: 'corticoïde',
    dose_per_kg: 1,
    dose_unit: 'mg',
    max_dose: 60,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: '1x/jour pendant 3-5 jours',
    notes: 'Crise d\'asthme modérée à sévère.',
  },
  // Antiémétiques
  {
    name: 'Ondansétron',
    class: 'antiémétique',
    dose_per_kg: 0.15,
    dose_unit: 'mg',
    max_dose: 4,
    max_dose_unit: 'mg',
    route: 'PO',
    frequency: 'dose unique (renouvelable 1x)',
    min_age_months: 6,
    notes: 'Vomissements associés à GEA. Aide à la réhydratation orale.',
  },
  // Anticonvulsivants
  {
    name: 'Midazolam buccal',
    class: 'anticonvulsivant',
    dose_per_kg: 0.3,
    dose_unit: 'mg',
    max_dose: 10,
    max_dose_unit: 'mg',
    route: 'BUCCAL',
    frequency: 'dose unique (renouveler 1x si échec à 10min)',
    notes: 'Convulsion fébrile complexe ou état de mal. Voie buccale privilégiée.',
  },
  {
    name: 'Diazépam intra-rectal',
    class: 'anticonvulsivant',
    dose_per_kg: 0.5,
    dose_unit: 'mg',
    max_dose: 10,
    max_dose_unit: 'mg',
    route: 'IR',
    frequency: 'dose unique',
    notes: 'Alternative si midazolam buccal non disponible.',
  },
  // Bronchodilatateurs
  {
    name: 'Salbutamol nébulisation',
    class: 'bronchodilatateur',
    dose_per_kg: 0.15,
    dose_unit: 'ml',
    max_dose: 1,
    max_dose_unit: 'ml (5mg)',
    route: 'INH',
    frequency: 'toutes les 20min x3, puis toutes les 4h',
    notes: 'Solution 5mg/ml. Compléter à 4ml avec NaCl 0.9%.',
  },
  // Adrénaline
  {
    name: 'Adrénaline IM (anaphylaxie)',
    class: 'urgence vitale',
    dose_per_kg: 0.01,
    dose_unit: 'mg',
    max_dose: 0.5,
    max_dose_unit: 'mg',
    route: 'IM',
    frequency: 'dose unique (renouveler à 5min si besoin)',
    notes: 'Solution 1mg/mL. Cuisse antéro-latérale.',
  },
  // Réhydratation
  {
    name: 'SRO (Soluté de Réhydratation Orale)',
    class: 'réhydratation',
    dose_per_kg: 50,
    dose_unit: 'mL',
    max_dose: 2000,
    max_dose_unit: 'mL',
    route: 'PO',
    frequency: 'sur 4 heures (déshydratation légère-modérée)',
    notes: '50-100 mL/kg selon degré de déshydratation.',
  },
  {
    name: 'NaCl 0.9% bolus IV',
    class: 'réhydratation',
    dose_per_kg: 20,
    dose_unit: 'mL',
    max_dose: 1000,
    max_dose_unit: 'mL',
    route: 'IV',
    frequency: 'bolus sur 20min (renouvelable x3)',
    notes: 'Choc hypovolémique. Max 60 mL/kg dans la 1ère heure.',
  },
];

// ── Calcul de posologie pédiatrique ──

export function calculatePediatricDose(
  drug: PediatricDrug,
  weight_kg: number,
  age_months?: number,
  patientAllergies?: string[],
  patientConditions?: string[],
): PediatricDoseResult {
  const warnings: string[] = [];
  let contraindicated = false;
  let contraindication_reason: string | undefined;

  // Vérification du poids
  if (weight_kg <= 0 || weight_kg > 150) {
    warnings.push(`Poids inhabituel: ${weight_kg} kg — vérifier la saisie`);
  }
  if (weight_kg < 1) {
    warnings.push('Poids < 1 kg: posologie à adapter par le néonatologue');
  }

  // Vérification de l'âge
  if (age_months !== undefined) {
    if (drug.min_age_months !== undefined && age_months < drug.min_age_months) {
      contraindicated = true;
      contraindication_reason = `${drug.name} est contre-indiqué avant ${drug.min_age_months} mois`;
    }
    if (drug.max_age_months !== undefined && age_months > drug.max_age_months) {
      warnings.push(`${drug.name}: limite d'âge dépassée (${drug.max_age_months} mois)`);
    }
  }

  // Vérification des allergies
  if (patientAllergies && drug.contraindications) {
    for (const ci of drug.contraindications) {
      for (const allergy of patientAllergies) {
        if (allergy.toLowerCase().includes(ci.toLowerCase()) || ci.toLowerCase().includes(allergy.toLowerCase())) {
          contraindicated = true;
          contraindication_reason = `Allergie déclarée "${allergy}" — ${drug.name} contre-indiqué`;
        }
      }
    }
  }

  // Vérification des conditions
  if (patientConditions && drug.contraindications) {
    for (const ci of drug.contraindications) {
      for (const condition of patientConditions) {
        if (condition.toLowerCase().includes(ci.toLowerCase())) {
          contraindicated = true;
          contraindication_reason = `Condition "${condition}" — ${drug.name} contre-indiqué`;
        }
      }
    }
  }

  // Calcul de la dose
  let calculatedDose = Math.round(drug.dose_per_kg * weight_kg * 100) / 100;
  const capped = calculatedDose > drug.max_dose;

  if (capped) {
    warnings.push(`Dose calculée (${calculatedDose} ${drug.dose_unit}) plafonnée à ${drug.max_dose} ${drug.max_dose_unit}`);
    calculatedDose = drug.max_dose;
  }

  // Avertissements spécifiques
  if (weight_kg > 40 && calculatedDose === drug.max_dose) {
    warnings.push('Poids > 40 kg: vérifier si posologie adulte applicable');
  }

  return {
    drug_name: drug.name,
    weight_kg,
    age_months,
    calculated_dose: calculatedDose,
    dose_unit: drug.dose_unit,
    capped,
    max_dose: drug.max_dose,
    route: drug.route,
    frequency: drug.frequency,
    warnings,
    contraindicated,
    contraindication_reason,
  };
}

// ── Estimation du poids par âge (formules OMS simplifiées) ──

export function estimateWeightByAge(age_months: number): number {
  if (age_months <= 0) return 3.5;
  if (age_months <= 12) return 3.5 + (age_months * 0.5);
  if (age_months <= 60) return 10 + ((age_months - 12) * 0.2);
  if (age_months <= 144) return 20 + ((age_months - 60) * 0.3);
  return 50 + ((age_months - 144) * 0.25);
}

// ── Age en mois depuis la date de naissance ──

export function calculateAgeMonths(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

// ── Déterminer si un patient est pédiatrique ──

export function isPediatricPatient(dateNaissance: string): boolean {
  return calculateAgeMonths(dateNaissance) < 216; // < 18 ans
}

// ── Obtenir la tranche d'âge ──

export function getAgeGroup(age_months: number): PediatricAgeGroup | undefined {
  return PEDIATRIC_AGE_GROUPS.find(g => age_months >= g.min_months && age_months < g.max_months);
}

// ── Filtrer les médicaments appropriés pour l'âge ──

export function getDrugsForAge(age_months: number): PediatricDrug[] {
  return PEDIATRIC_DRUGS.filter(drug => {
    if (drug.min_age_months !== undefined && age_months < drug.min_age_months) return false;
    if (drug.max_age_months !== undefined && age_months > drug.max_age_months) return false;
    return true;
  });
}

// ── Score de Lund-Browder (brûlures pédiatriques) ──

export interface LundBrowderInput {
  age_years: number;
  head: number;        // % brûlé
  neck: number;
  trunk_anterior: number;
  trunk_posterior: number;
  buttocks: number;
  genitalia: number;
  upper_arm_left: number;
  upper_arm_right: number;
  lower_arm_left: number;
  lower_arm_right: number;
  hand_left: number;
  hand_right: number;
  thigh_left: number;
  thigh_right: number;
  leg_left: number;
  leg_right: number;
  foot_left: number;
  foot_right: number;
}

export function calculateLundBrowder(input: LundBrowderInput): {
  total_bsa: number;
  fluid_ml_first_24h: number;
  notes: string;
} {
  // Ajustement tête/jambes selon l'âge (simplifié)
  let headFactor = 1;
  let legFactor = 1;
  if (input.age_years < 1) { headFactor = 1.9; legFactor = 0.5; }
  else if (input.age_years < 5) { headFactor = 1.5; legFactor = 0.7; }
  else if (input.age_years < 10) { headFactor = 1.2; legFactor = 0.85; }

  const total_bsa =
    input.head * headFactor +
    input.neck +
    input.trunk_anterior + input.trunk_posterior +
    input.buttocks + input.genitalia +
    input.upper_arm_left + input.upper_arm_right +
    input.lower_arm_left + input.lower_arm_right +
    input.hand_left + input.hand_right +
    (input.thigh_left + input.thigh_right) * legFactor +
    (input.leg_left + input.leg_right) * legFactor +
    input.foot_left + input.foot_right;

  // Formule de Parkland pédiatrique modifiée
  const weight_estimated = input.age_years < 1 ? 5 : estimateWeightByAge(input.age_years * 12);
  const fluid_ml_first_24h = 3 * weight_estimated * total_bsa + (weight_estimated * 100); // maintenance

  return {
    total_bsa: Math.round(total_bsa * 10) / 10,
    fluid_ml_first_24h: Math.round(fluid_ml_first_24h),
    notes: total_bsa > 10
      ? 'Brûlure sévère (>10% SCT chez l\'enfant): transfert en centre de brûlés recommandé'
      : 'Brûlure modérée: prise en charge ambulatoire possible si critères remplis',
  };
}
