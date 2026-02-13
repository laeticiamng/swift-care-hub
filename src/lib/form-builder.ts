// ================================================================
// UrgenceOS — Moteur de Formulaires No-Code
// Permet la configuration dynamique des formulaires sans développement
// Fonctionnalité absente chez nous, présente chez ResUrgences
// ================================================================

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'date'
  | 'time'
  | 'datetime'
  | 'scale'     // EVA, score numérique
  | 'vitals'    // Constantes vitales (composant intégré)
  | 'body_map'  // Schéma corporel
  | 'medication'// Sélecteur médicament
  | 'cim10';    // Sélecteur CIM-10

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  pattern_message?: string;
  custom_message?: string;
}

export interface ConditionalRule {
  field_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_empty';
  value: string | number | boolean | string[];
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help_text?: string;
  default_value?: unknown;
  options?: { label: string; value: string }[];
  validation?: FieldValidation;
  visible_when?: ConditionalRule[];
  required_when?: ConditionalRule[];
  group?: string;
  order: number;
  width?: 'full' | 'half' | 'third';
  // Scale-specific
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { value: number; label: string }[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
  collapsible?: boolean;
  collapsed_by_default?: boolean;
  visible_when?: ConditionalRule[];
}

export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  category: 'triage' | 'consultation' | 'prescription' | 'surveillance' | 'sortie' | 'custom';
  sections: FormSection[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
  tags?: string[];
}

export interface FormSubmission {
  form_id: string;
  form_version: number;
  encounter_id: string;
  patient_id: string;
  submitted_by: string;
  submitted_at: string;
  values: Record<string, unknown>;
  validation_errors?: Record<string, string>;
}

// ── Évaluation des conditions ──

export function evaluateCondition(rule: ConditionalRule, values: Record<string, unknown>): boolean {
  const fieldValue = values[rule.field_id];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    case 'not_equals':
      return fieldValue !== rule.value;
    case 'contains':
      if (typeof fieldValue === 'string') return fieldValue.includes(String(rule.value));
      if (Array.isArray(fieldValue)) return fieldValue.includes(rule.value);
      return false;
    case 'gt':
      return Number(fieldValue) > Number(rule.value);
    case 'lt':
      return Number(fieldValue) < Number(rule.value);
    case 'gte':
      return Number(fieldValue) >= Number(rule.value);
    case 'lte':
      return Number(fieldValue) <= Number(rule.value);
    case 'in':
      if (Array.isArray(rule.value)) return rule.value.includes(String(fieldValue));
      return false;
    case 'not_empty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    default:
      return true;
  }
}

export function evaluateConditions(rules: ConditionalRule[] | undefined, values: Record<string, unknown>): boolean {
  if (!rules || rules.length === 0) return true;
  return rules.every(rule => evaluateCondition(rule, values));
}

// ── Validation de formulaire ──

export function validateFormSubmission(
  form: FormDefinition,
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const section of form.sections) {
    if (!evaluateConditions(section.visible_when, values)) continue;

    for (const field of section.fields) {
      if (!evaluateConditions(field.visible_when, values)) continue;

      const value = values[field.id];
      const validation = field.validation;

      // Required check — required_when only applies if rules are explicitly defined
      const isRequired = validation?.required || (field.required_when && field.required_when.length > 0 && evaluateConditions(field.required_when, values));
      if (isRequired && (value === undefined || value === null || value === '')) {
        errors[field.id] = validation?.custom_message || `${field.label} est obligatoire`;
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      // Type-specific validation
      if (field.type === 'number' || field.type === 'scale') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors[field.id] = `${field.label} doit être un nombre`;
          continue;
        }
        if (validation?.min !== undefined && numValue < validation.min) {
          errors[field.id] = `${field.label} doit être ≥ ${validation.min}`;
        }
        if (validation?.max !== undefined && numValue > validation.max) {
          errors[field.id] = `${field.label} doit être ≤ ${validation.max}`;
        }
      }

      if (typeof value === 'string') {
        if (validation?.min_length !== undefined && value.length < validation.min_length) {
          errors[field.id] = `${field.label} doit contenir au moins ${validation.min_length} caractères`;
        }
        if (validation?.max_length !== undefined && value.length > validation.max_length) {
          errors[field.id] = `${field.label} doit contenir au plus ${validation.max_length} caractères`;
        }
        if (validation?.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            errors[field.id] = validation.pattern_message || `${field.label} ne respecte pas le format attendu`;
          }
        }
      }
    }
  }

  return errors;
}

// ── Formulaires pré-configurés ──

export const BUILTIN_FORMS: FormDefinition[] = [
  {
    id: 'triage-ioa-standard',
    name: 'Triage IOA Standard',
    description: 'Formulaire de triage IOA conforme aux recommandations SFMU',
    version: 1,
    category: 'triage',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['triage', 'IOA', 'SFMU'],
    sections: [
      {
        id: 'motif',
        title: 'Motif de consultation',
        order: 1,
        fields: [
          {
            id: 'motif_principal',
            label: 'Motif principal',
            type: 'text',
            order: 1,
            width: 'full',
            validation: { required: true, min_length: 3 },
            placeholder: 'Ex: Douleur thoracique, chute, fièvre...',
          },
          {
            id: 'mode_arrivee',
            label: 'Mode d\'arrivée',
            type: 'select',
            order: 2,
            width: 'half',
            options: [
              { label: 'Personnel', value: 'personnel' },
              { label: 'Ambulance', value: 'ambulance' },
              { label: 'Pompiers', value: 'pompiers' },
              { label: 'SMUR', value: 'smur' },
            ],
            validation: { required: true },
          },
          {
            id: 'delai_symptomes',
            label: 'Délai depuis le début des symptômes',
            type: 'text',
            order: 3,
            width: 'half',
            placeholder: 'Ex: 2h, depuis ce matin, 3 jours',
          },
        ],
      },
      {
        id: 'constantes',
        title: 'Constantes vitales',
        order: 2,
        fields: [
          { id: 'fc', label: 'FC (bpm)', type: 'number', order: 1, width: 'third', validation: { min: 20, max: 300 } },
          { id: 'pas', label: 'PAS (mmHg)', type: 'number', order: 2, width: 'third', validation: { min: 40, max: 300 } },
          { id: 'pad', label: 'PAD (mmHg)', type: 'number', order: 3, width: 'third', validation: { min: 20, max: 200 } },
          { id: 'spo2', label: 'SpO2 (%)', type: 'number', order: 4, width: 'third', validation: { min: 50, max: 100 } },
          { id: 'temperature', label: 'Température (°C)', type: 'number', order: 5, width: 'third', validation: { min: 30, max: 43 } },
          { id: 'fr', label: 'FR (/min)', type: 'number', order: 6, width: 'third', validation: { min: 5, max: 60 } },
          { id: 'gcs', label: 'Glasgow', type: 'number', order: 7, width: 'third', validation: { min: 3, max: 15 } },
          { id: 'eva', label: 'EVA Douleur', type: 'scale', order: 8, width: 'third', scale_min: 0, scale_max: 10, scale_labels: [{ value: 0, label: 'Aucune' }, { value: 5, label: 'Modérée' }, { value: 10, label: 'Maximale' }] },
          { id: 'glycemie', label: 'Glycémie (g/L)', type: 'number', order: 9, width: 'third', validation: { min: 0.1, max: 8 } },
        ],
      },
      {
        id: 'symptomes',
        title: 'Symptômes associés',
        order: 3,
        fields: [
          {
            id: 'symptomes_associes',
            label: 'Symptômes associés',
            type: 'multiselect',
            order: 1,
            width: 'full',
            options: [
              { label: 'Nausées/Vomissements', value: 'nausees' },
              { label: 'Dyspnée', value: 'dyspnee' },
              { label: 'Douleur', value: 'douleur' },
              { label: 'Saignement', value: 'saignement' },
              { label: 'Fièvre', value: 'fievre' },
              { label: 'Céphalées', value: 'cephalees' },
              { label: 'Vertiges', value: 'vertiges' },
              { label: 'Perte de connaissance', value: 'pdc' },
              { label: 'Traumatisme', value: 'traumatisme' },
            ],
          },
          {
            id: 'remarques_ioa',
            label: 'Remarques IOA',
            type: 'textarea',
            order: 2,
            width: 'full',
            placeholder: 'Observations cliniques, contexte...',
          },
        ],
      },
      {
        id: 'cimu_section',
        title: 'Classification CIMU',
        order: 4,
        fields: [
          {
            id: 'cimu',
            label: 'Niveau CIMU',
            type: 'radio',
            order: 1,
            width: 'full',
            validation: { required: true },
            options: [
              { label: '1 - Urgence vitale immédiate', value: '1' },
              { label: '2 - Urgence vraie', value: '2' },
              { label: '3 - Urgence relative', value: '3' },
              { label: '4 - Semi-urgent', value: '4' },
              { label: '5 - Non urgent', value: '5' },
            ],
          },
          {
            id: 'zone_orientation',
            label: 'Zone d\'orientation',
            type: 'select',
            order: 2,
            width: 'half',
            validation: { required: true },
            options: [
              { label: 'Déchocage', value: 'dechoc' },
              { label: 'Soins', value: 'soins' },
              { label: 'Trauma', value: 'trauma' },
              { label: 'Consultation', value: 'consultation' },
              { label: 'UHCD', value: 'uhcd' },
              { label: 'Psychiatrie', value: 'psy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'surveillance-ide-standard',
    name: 'Surveillance IDE',
    description: 'Protocole de surveillance paramétrable',
    version: 1,
    category: 'surveillance',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['IDE', 'surveillance'],
    sections: [
      {
        id: 'frequence',
        title: 'Paramètres de surveillance',
        order: 1,
        fields: [
          {
            id: 'frequence_constantes',
            label: 'Fréquence des constantes',
            type: 'select',
            order: 1,
            width: 'half',
            validation: { required: true },
            options: [
              { label: 'Toutes les 15 min', value: '15' },
              { label: 'Toutes les 30 min', value: '30' },
              { label: 'Toutes les heures', value: '60' },
              { label: 'Toutes les 2 heures', value: '120' },
              { label: 'Toutes les 4 heures', value: '240' },
            ],
          },
          {
            id: 'parametres_surveilles',
            label: 'Paramètres à surveiller',
            type: 'multiselect',
            order: 2,
            width: 'full',
            options: [
              { label: 'FC', value: 'fc' },
              { label: 'PA', value: 'pa' },
              { label: 'SpO2', value: 'spo2' },
              { label: 'Température', value: 'temperature' },
              { label: 'FR', value: 'fr' },
              { label: 'Glasgow', value: 'gcs' },
              { label: 'EVA Douleur', value: 'eva' },
              { label: 'Glycémie', value: 'glycemie' },
              { label: 'Diurèse', value: 'diurese' },
              { label: 'Score de Richmond', value: 'rass' },
            ],
          },
          {
            id: 'consignes_specifiques',
            label: 'Consignes spécifiques',
            type: 'textarea',
            order: 3,
            width: 'full',
            placeholder: 'Ex: Appeler si PAS < 90, SpO2 < 92...',
          },
        ],
      },
    ],
  },
];

// ── Recherche de formulaire ──

export function getFormById(formId: string): FormDefinition | undefined {
  return BUILTIN_FORMS.find(f => f.id === formId);
}

export function getFormsByCategory(category: FormDefinition['category']): FormDefinition[] {
  return BUILTIN_FORMS.filter(f => f.category === category && f.is_active);
}

// ── Extraction des valeurs visibles ──

export function getVisibleFields(form: FormDefinition, values: Record<string, unknown>): FormField[] {
  const visible: FormField[] = [];
  for (const section of form.sections) {
    if (!evaluateConditions(section.visible_when, values)) continue;
    for (const field of section.fields) {
      if (evaluateConditions(field.visible_when, values)) {
        visible.push(field);
      }
    }
  }
  return visible.sort((a, b) => a.order - b.order);
}
