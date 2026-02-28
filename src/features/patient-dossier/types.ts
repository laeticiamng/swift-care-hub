// Shared types for patient-dossier feature

export type DossierContext = 'cardio' | 'trauma' | 'respiratoire' | 'infectieux' | 'sortie' | 'default';

export const CONTEXT_LABELS: Record<DossierContext, string> = {
  cardio: 'Contexte cardiologique',
  trauma: 'Contexte traumatologique',
  respiratoire: 'Contexte respiratoire',
  infectieux: 'Contexte infectieux',
  sortie: 'Preparation sortie',
  default: '',
};

const VITAL_KEYS = ['fc', 'pa_systolique', 'spo2', 'temperature', 'frequence_respiratoire', 'gcs', 'eva_douleur'];

const PRIORITY_VITAL_KEYS: Record<DossierContext, string[]> = {
  cardio: ['fc', 'pa_systolique', 'spo2', 'eva_douleur'],
  trauma: ['eva_douleur', 'fc', 'pa_systolique', 'gcs'],
  respiratoire: ['spo2', 'frequence_respiratoire', 'fc'],
  infectieux: ['temperature', 'fc', 'pa_systolique', 'frequence_respiratoire'],
  sortie: [],
  default: [],
};

export function detectContext(encounter: any): DossierContext {
  if (encounter.status === 'ready_for_discharge' || encounter.status === 'finished') return 'sortie';
  const motif = (encounter.motif_sfmu || '').toLowerCase();
  if (['douleur thoracique', 'dt', 'precordialgie', 'angor', 'infarctus', 'cardio'].some(k => motif.includes(k))) return 'cardio';
  if (['traumatisme', 'trauma', 'fracture', 'entorse', 'luxation', 'chute', 'plaie'].some(k => motif.includes(k))) return 'trauma';
  if (['dyspnee', 'asthme', 'detresse respiratoire', 'insuffisance respiratoire', 'bronchospasme'].some(k => motif.includes(k))) return 'respiratoire';
  if (['fievre', 'aeg', 'sepsis', 'infection'].some(k => motif.includes(k))) return 'infectieux';
  return 'default';
}

export function getOrderedVitalKeys(context: DossierContext) {
  const priority = PRIORITY_VITAL_KEYS[context];
  const ordered = priority.length > 0
    ? [...priority, ...VITAL_KEYS.filter(k => !priority.includes(k))]
    : VITAL_KEYS;
  return { orderedVitalKeys: ordered, contextPriorityVitals: priority };
}
