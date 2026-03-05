// UrgenceOS — Enriched Prescription Type System
// Since the Supabase schema stores basic fields (medication_name, dosage, route, frequency, status, priority, notes),
// we use the `notes` field to store JSON metadata for extended prescription types.

export const PRESCRIPTION_TYPES = [
  'medicament', 'perfusion', 'titration', 'conditionnel', 'oxygene',
  'exam_bio', 'exam_imagerie', 'exam_ecg', 'exam_autre',
  'surveillance', 'regime', 'mobilisation', 'dispositif',
  'avis_specialise', 'sortie',
] as const;

export type PrescriptionType = typeof PRESCRIPTION_TYPES[number];

export const PRESCRIPTION_TYPE_LABELS: Record<PrescriptionType, string> = {
  medicament: 'Medicament',
  perfusion: 'Perfusion / Solute',
  titration: 'Titration',
  conditionnel: 'Conditionnel (si besoin)',
  oxygene: 'Oxygenotherapie',
  exam_bio: 'Examens biologiques',
  exam_imagerie: 'Imagerie',
  exam_ecg: 'ECG',
  exam_autre: 'Autre examen',
  surveillance: 'Surveillance',
  regime: 'Regime / Jeune',
  mobilisation: 'Mobilisation',
  dispositif: 'Dispositif medical',
  avis_specialise: 'Avis specialise',
  sortie: 'Prescription de sortie',
};

export const PRESCRIPTION_TYPE_ICONS: Record<PrescriptionType, string> = {
  medicament: '\u{1F48A}',    // 💊
  perfusion: '\u{1F4A7}',     // 💧
  titration: '\u2B06\uFE0F',  // ⬆️
  conditionnel: '\u26A1',     // ⚡
  oxygene: '\u{1FAC1}',       // 🫁
  exam_bio: '\u{1F9EA}',      // 🧪
  exam_imagerie: '\u{1F4F7}', // 📷
  exam_ecg: '\u2764\uFE0F',   // ❤️
  exam_autre: '\u{1F52C}',    // 🔬
  surveillance: '\u{1F441}',  // 👁
  regime: '\u{1F37D}',        // 🍽
  mobilisation: '\u{1F6B6}',  // 🚶
  dispositif: '\u{1F9B4}',    // 🦴
  avis_specialise: '\u{1F4DE}', // 📞
  sortie: '\u{1F4CB}',        // 📋
};

export const PRESCRIPTION_TYPE_GROUPS = [
  { label: 'Medicaments', types: ['medicament', 'perfusion', 'titration', 'conditionnel', 'oxygene'] as PrescriptionType[] },
  { label: 'Examens', types: ['exam_bio', 'exam_imagerie', 'exam_ecg', 'exam_autre'] as PrescriptionType[] },
  { label: 'Surveillance & Consignes', types: ['surveillance', 'regime', 'mobilisation', 'dispositif'] as PrescriptionType[] },
  { label: 'Autres', types: ['avis_specialise', 'sortie'] as PrescriptionType[] },
];

// Extended metadata stored as JSON in the `notes` field
export interface PrescriptionMetadata {
  type: PrescriptionType;

  // Conditionnel
  condition_trigger?: string;
  condition_max_doses?: number;
  condition_interval?: string;
  condition_doses_given?: number;

  // Titration
  titration_dose_init?: number;
  titration_dose_max?: number;
  titration_step?: number;
  titration_interval?: string;
  titration_target?: string;
  titration_cumulated?: number;

  // Perfusion
  debit?: string;
  duration?: string;
  dilution?: string;
  volume_total?: number;
  volume_passed?: number;
  started_at?: string;

  // Oxygene
  o2_device?: string;
  o2_debit?: string;
  o2_target?: string;

  // Examens
  exam_list?: string[];
  exam_urgency?: 'urgent' | 'normal';
  exam_indication?: string;
  exam_site?: string;
  exam_status?: 'demande' | 'preleve' | 'envoye' | 'realise' | 'patient_parti' | 'resultat_recu';

  // Surveillance
  surveillance_type?: string;
  surveillance_frequency?: string;

  // Avis
  avis_speciality?: string;
  avis_motif?: string;
  avis_urgency?: 'urgent' | 'rapide' | 'programme';
  avis_status?: 'demande' | 'appele' | 'vu' | 'avis_rendu';
  avis_notes?: string;

  // Dispositif
  device_name?: string;
  device_details?: string;
  device_status?: 'prescrit' | 'pose';

  // Regime / Mobilisation
  regime_details?: string;
  mobilisation_details?: string;

  // Sortie
  sortie_medications?: Array<{ name: string; dose: string; route: string; frequency: string; duration: string }>;
  sortie_arret_travail?: number;
  sortie_consignes?: string;

  // General notes (non-metadata)
  text_notes?: string;
}

/** Parse the `notes` field to extract metadata. Falls back to legacy detection. */
export function parsePrescriptionMeta(rx: { medication_name: string; dosage?: string; notes?: string | null; frequency?: string | null }): PrescriptionMetadata {
  // Try to parse JSON from notes
  if (rx.notes) {
    try {
      const parsed = JSON.parse(rx.notes);
      if (parsed && typeof parsed === 'object' && parsed.type) {
        return parsed as PrescriptionMetadata;
      }
    } catch {
      // Not JSON, try legacy [type:...] format or fall through to heuristics
    }

    // Legacy [type:...] format
    const typeMatch = rx.notes.match(/\[(?:type|TYPE):([^\]]+)\]/i);
    if (typeMatch) {
      const legacyType = typeMatch[1].toLowerCase();
      if (legacyType === 'soins') return { type: 'surveillance' };
      if (legacyType === 'examens_bio') return { type: 'exam_bio' };
      if (legacyType === 'examens_imagerie') return { type: 'exam_imagerie' };
    }
  }

  // Heuristic detection based on medication_name
  const name = rx.medication_name.toLowerCase();
  const freq = (rx.frequency || '').toLowerCase();

  // Exams bio
  if (['nfs', 'iono', 'crp', 'troponine', 'bilan', 'hemostase', 'gaz du sang', 'lactate', 'bhu', 'hemoglobine', 'paracetamolemie'].some(k => name.includes(k))) {
    return { type: 'exam_bio', exam_list: [rx.medication_name] };
  }
  // Exams imagerie
  if (['radio', 'scanner', 'irm', 'echo', 'imagerie', 'rx', 'tdm', 'radiographie', 'angioscanner'].some(k => name.includes(k))) {
    return { type: 'exam_imagerie', exam_site: rx.medication_name };
  }
  // ECG
  if (name.includes('ecg')) return { type: 'exam_ecg' };
  // Surveillance
  if (['scope', 'monitoring', 'surveillance'].some(k => name.includes(k))) return { type: 'surveillance' };
  // Oxygene
  if (['oxygenotherapie', 'o2 ', 'oxygene'].some(k => name.includes(k))) return { type: 'oxygene' };
  // Perfusion (NaCl, Ringer, G5%, etc.)
  if (['nacl', 'ringer', 'g5%', 'g10%', 'glucose', 'bicarbonate'].some(k => name.includes(k))) return { type: 'perfusion' };
  // Titration
  if (freq.includes('titration')) return { type: 'titration' };
  // Conditionnel (si ...)
  if (freq.includes('si ')) return { type: 'conditionnel', condition_trigger: rx.frequency || undefined };

  return { type: 'medicament' };
}

/** Encode metadata into the notes field as JSON */
export function encodePrescriptionMeta(meta: PrescriptionMetadata): string {
  return JSON.stringify(meta);
}

/** Get display section key for grouping prescriptions on the Pancarte */
export type PancarteSection =
  | 'oxygene_surveillance'
  | 'perfusions'
  | 'titrations'
  | 'medicaments'
  | 'conditionnels'
  | 'examens'
  | 'avis'
  | 'consignes';

export function getPancarteSection(meta: PrescriptionMetadata): PancarteSection {
  switch (meta.type) {
    case 'oxygene':
    case 'surveillance':
      return 'oxygene_surveillance';
    case 'perfusion':
      return 'perfusions';
    case 'titration':
      return 'titrations';
    case 'conditionnel':
      return 'conditionnels';
    case 'exam_bio':
    case 'exam_imagerie':
    case 'exam_ecg':
    case 'exam_autre':
      return 'examens';
    case 'avis_specialise':
      return 'avis';
    case 'regime':
    case 'mobilisation':
    case 'dispositif':
      return 'consignes';
    case 'sortie':
      return 'consignes';
    default:
      return 'medicaments';
  }
}

export const PANCARTE_SECTION_ORDER: PancarteSection[] = [
  'oxygene_surveillance',
  'perfusions',
  'titrations',
  'medicaments',
  'conditionnels',
  'examens',
  'avis',
  'consignes',
];

export const PANCARTE_SECTION_LABELS: Record<PancarteSection, string> = {
  oxygene_surveillance: 'Oxygene & Surveillance',
  perfusions: 'Perfusions en cours',
  titrations: 'Titrations en cours',
  medicaments: 'Medicaments',
  conditionnels: 'Si besoin',
  examens: 'Examens',
  avis: 'Avis',
  consignes: 'Consignes',
};

export const PANCARTE_SECTION_ICONS: Record<PancarteSection, string> = {
  oxygene_surveillance: '\u{1FAC1}',
  perfusions: '\u{1F4A7}',
  titrations: '\u2B06\uFE0F',
  medicaments: '\u{1F48A}',
  conditionnels: '\u26A1',
  examens: '\u{1F9EA}',
  avis: '\u{1F4DE}',
  consignes: '\u{1F4CC}',
};

/** Whether this prescription type has an admin button (vs info-only banner) */
export function hasAdminAction(type: PrescriptionType): boolean {
  return !['regime', 'mobilisation', 'sortie'].includes(type);
}

// ==========================================
// EXAM BIO CATEGORIES
// ==========================================
export const EXAM_BIO_CATEGORIES = [
  { label: 'Hematologie', items: ['NFS', 'TP/INR', 'Fibrinogene', 'Groupe Rh RAI', 'D-Dimeres'] },
  { label: 'Biochimie', items: ['Ionogramme', 'Creatinine', 'CRP', 'Bilan hepatique', 'Lipase', 'Lactates', 'BNP'] },
  { label: 'Cardiologie', items: ['Troponine', 'CPK', 'Myoglobine'] },
  { label: 'Toxicologie', items: ['Paracetamolemie', 'Alcoolemie', 'HCG', 'TSH'] },
  { label: 'Infectiologie', items: ['Hemocultures', 'ECBU', 'PCR'] },
  { label: 'Gazometrie', items: ['GDS arteriels', 'GDS veineux'] },
  { label: 'Urinaire', items: ['BU', 'Ionogramme urinaire'] },
];

// ==========================================
// EXAM IMAGERIE CATEGORIES
// ==========================================
export const EXAM_IMAGERIE_CATEGORIES = [
  { label: 'Radiographie', items: ['Thorax face', 'Thorax F+P', 'Bassin face', 'Rachis cervical', 'Epaule', 'Coude', 'Poignet', 'Main', 'Hanche', 'Genou', 'Cheville', 'Pied', 'ASP'] },
  { label: 'Scanner', items: ['Cerebral', 'Cervical', 'Thoracique', 'Abdo-pelvien', 'TAP', 'Body scanner', 'Angioscanner pulmonaire', 'Angioscanner aortique'] },
  { label: 'Echographie', items: ['Abdo', 'Renale', 'FAST echo', 'Doppler MI', 'Doppler TSA', 'Echo cardiaque'] },
  { label: 'IRM', items: ['Cerebrale', 'Medullaire'] },
];

// ==========================================
// AVIS SPECIALTIES
// ==========================================
export const AVIS_SPECIALTIES = [
  'Cardiologie', 'Chirurgie generale', 'Chirurgie ortho', 'Neurologie', 'Neurochirurgie',
  'Pneumologie', 'Gastro-enterologie', 'Nephrologie', 'Reanimation', 'Pediatrie',
  'Gynecologie', 'Psychiatrie', 'ORL', 'Ophtalmologie', 'Dermatologie', 'Urologie',
];

// ==========================================
// O2 DEVICES
// ==========================================
export const O2_DEVICES = [
  'Lunettes nasales', 'Masque simple', 'Masque HC', 'Masque haute concentration',
  'OHD/Optiflow', 'VNI', 'IOT',
];

// ==========================================
// PRESCRIPTION PACKS (suggestions contextuelles)
// ==========================================
export interface PrescriptionPack {
  label: string;
  items: Array<PrescriptionMetadata & { medication_name: string; dosage: string; route: string; frequency?: string; priority?: string }>;
}

export const PRESCRIPTION_PACKS: Record<string, PrescriptionPack> = {
  'Douleur thoracique': {
    label: 'Pack DT standard',
    items: [
      { type: 'medicament', medication_name: 'Paracetamol', dosage: '1g', route: 'IV', frequency: 'q6h', priority: 'routine' },
      { type: 'conditionnel', medication_name: 'Morphine', dosage: '3mg', route: 'SC', condition_trigger: 'si EVA > 6', condition_max_doses: 3, condition_interval: '4h' },
      { type: 'exam_bio', medication_name: 'Bio urgente', dosage: '', route: '', exam_list: ['NFS', 'CRP', 'Ionogramme', 'Troponine', 'D-Dimeres', 'BNP'], exam_urgency: 'urgent' },
      { type: 'exam_ecg', medication_name: 'ECG 12 derivations', dosage: '', route: '', priority: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Radio thorax face', dosage: '', route: '', exam_site: 'Thorax face', exam_urgency: 'urgent' },
      { type: 'surveillance', medication_name: 'Scope continu', dosage: '', route: '', surveillance_type: 'scope + SpO2', surveillance_frequency: 'continue' },
      { type: 'regime', medication_name: 'A jeun strict', dosage: '', route: '', regime_details: 'A jeun strict' },
    ],
  },
  'Traumatisme membre': {
    label: 'Pack trauma simple',
    items: [
      { type: 'medicament', medication_name: 'Ketoprofene', dosage: '100mg', route: 'IV', frequency: '1 dose', priority: 'routine' },
      { type: 'conditionnel', medication_name: 'Paracetamol', dosage: '1g', route: 'PO', condition_trigger: 'si EVA > 4', condition_max_doses: 4, condition_interval: '6h' },
      { type: 'exam_imagerie', medication_name: 'Radio membre', dosage: '', route: '', exam_site: 'Face + profil', exam_urgency: 'normal' },
    ],
  },
  'Dyspnee': {
    label: 'Pack asthme aigu',
    items: [
      { type: 'medicament', medication_name: 'Salbutamol', dosage: '5mg', route: 'INH', frequency: 'q20min x3 puis q1h', priority: 'stat' },
      { type: 'medicament', medication_name: 'Ipratropium', dosage: '0.5mg', route: 'INH', frequency: 'q20min x3', priority: 'stat' },
      { type: 'medicament', medication_name: 'Methylprednisolone', dosage: '80mg', route: 'IV', frequency: '1 dose', priority: 'urgent' },
      { type: 'oxygene', medication_name: 'O2', dosage: '', route: '', o2_device: 'Masque HC', o2_debit: '6L/min', o2_target: 'SpO2 > 94%' },
      { type: 'surveillance', medication_name: 'Surveillance respiratoire', dosage: '', route: '', surveillance_type: 'SpO2 + FR + DEP', surveillance_frequency: 'q30min' },
      { type: 'exam_bio', medication_name: 'Bio', dosage: '', route: '', exam_list: ['GDS arteriels', 'NFS', 'CRP', 'Ionogramme'], exam_urgency: 'urgent' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '500mL', route: 'IV', debit: '60 mL/h' },
    ],
  },
  'Douleur abdominale': {
    label: 'Pack colique nephretique',
    items: [
      { type: 'titration', medication_name: 'Morphine', dosage: '', route: 'IV', titration_dose_init: 2, titration_dose_max: 10, titration_step: 2, titration_interval: '5 min', titration_target: 'EVA < 4' },
      { type: 'medicament', medication_name: 'Ketoprofene', dosage: '100mg', route: 'IV', frequency: '1 dose', priority: 'stat' },
      { type: 'medicament', medication_name: 'Phloroglucinol', dosage: '80mg', route: 'IV', frequency: 'q6h', priority: 'routine' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '1000mL', route: 'IV', debit: '125 mL/h' },
      { type: 'exam_bio', medication_name: 'Bio', dosage: '', route: '', exam_list: ['Creatinine', 'Ionogramme', 'NFS', 'BU'], exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Scanner abdo-pelvien', dosage: '', route: '', exam_site: 'Abdo-pelvien sans injection', exam_urgency: 'urgent' },
    ],
  },
  'Intoxication': {
    label: 'Pack intox medicamenteuse',
    items: [
      { type: 'medicament', medication_name: 'N-Acetylcysteine', dosage: '150mg/kg', route: 'IV', frequency: 'protocole Prescott', priority: 'stat' },
      { type: 'perfusion', medication_name: 'G5%', dosage: '500mL', route: 'IV', debit: '250 mL/h' },
      { type: 'surveillance', medication_name: 'Surveillance continue', dosage: '', route: '', surveillance_type: 'scope + conscience + diurese', surveillance_frequency: 'horaire' },
      { type: 'exam_bio', medication_name: 'Bio toxicologique', dosage: '', route: '', exam_list: ['Paracetamolemie', 'Bilan hepatique', 'TP/INR', 'Ionogramme', 'Creatinine', 'GDS', 'Lactates'], exam_urgency: 'urgent' },
      { type: 'regime', medication_name: 'A jeun strict', dosage: '', route: '', regime_details: 'A jeun strict' },
      { type: 'avis_specialise', medication_name: 'Avis reanimation', dosage: '', route: '', avis_speciality: 'Reanimation', avis_motif: 'Intox medicamenteuse, discussion transfert rea', avis_urgency: 'urgent' },
    ],
  },
  'AEG / Fievre': {
    label: 'Pack sepsis',
    items: [
      { type: 'medicament', medication_name: 'Paracetamol', dosage: '1g', route: 'IV', frequency: 'q6h', priority: 'routine' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '1000mL', route: 'IV', debit: '500 mL/h', duration: 'Bolus' },
      { type: 'exam_bio', medication_name: 'Bio infectieux', dosage: '', route: '', exam_list: ['NFS', 'CRP', 'Hemocultures', 'ECBU', 'Lactates', 'Ionogramme', 'Creatinine'], exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Radio thorax', dosage: '', route: '', exam_site: 'Thorax face', exam_urgency: 'normal' },
    ],
  },
  'Malaise / syncope': {
    label: 'Pack syncope',
    items: [
      { type: 'exam_bio', medication_name: 'Bio', dosage: '', route: '', exam_list: ['NFS', 'Ionogramme', 'Troponine', 'Creatinine'], exam_urgency: 'urgent' },
      { type: 'exam_ecg', medication_name: 'ECG 12 derivations', dosage: '', route: '', priority: 'urgent' },
      { type: 'surveillance', medication_name: 'Scope continu', dosage: '', route: '', surveillance_type: 'scope + SpO2', surveillance_frequency: 'continue' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '500mL', route: 'IV', debit: '125 mL/h' },
    ],
  },
  // ==========================================
  // NEW PROTOCOLS — AVC, Sepsis sévère, Polytraumatisme, Anaphylaxie, État de mal épileptique
  // ==========================================
  'AVC / Deficit neurologique': {
    label: 'Pack AVC aigu',
    items: [
      { type: 'surveillance', medication_name: 'Scope neuro continu', dosage: '', route: '', surveillance_type: 'scope + GCS + pupilles + glycemie + PA', surveillance_frequency: 'q15min' },
      { type: 'exam_bio', medication_name: 'Bio AVC', dosage: '', route: '', exam_list: ['NFS', 'TP/INR', 'Ionogramme', 'Creatinine', 'Troponine', 'Glycemie'], exam_urgency: 'urgent' },
      { type: 'exam_ecg', medication_name: 'ECG 12 derivations', dosage: '', route: '', priority: 'stat' },
      { type: 'exam_imagerie', medication_name: 'Scanner cerebral + angioscanner', dosage: '', route: '', exam_site: 'Cerebral sans puis avec injection + angio TSA/Willis', exam_urgency: 'urgent' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '500mL', route: 'IV', debit: '60 mL/h' },
      { type: 'regime', medication_name: 'A jeun strict', dosage: '', route: '', regime_details: 'A jeun strict — risque de thrombolyse' },
      { type: 'conditionnel', medication_name: 'Nicardipine IVSE', dosage: '1mg/h', route: 'IVSE', condition_trigger: 'si PAS > 220 ou PAD > 120 (AVC ischemique) / PAS > 180 (AVC hemorragique)', condition_max_doses: 1 },
      { type: 'avis_specialise', medication_name: 'Avis UNV / Neurologie', dosage: '', route: '', avis_speciality: 'Neurologie', avis_motif: 'Deficit neurologique aigu — evaluation thrombolyse / thrombectomie', avis_urgency: 'urgent' },
      { type: 'mobilisation', medication_name: 'Repos strict au lit', dosage: '', route: '', mobilisation_details: 'Decubitus dorsal 30° — pas de lever' },
    ],
  },
  'Sepsis severe / Choc septique': {
    label: 'Pack sepsis severe (Surviving Sepsis)',
    items: [
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '1000mL', route: 'IV', debit: '1000 mL/h', duration: 'Bolus 30mL/kg en 1h' },
      { type: 'medicament', medication_name: 'Cefotaxime', dosage: '2g', route: 'IV', frequency: 'q8h', priority: 'stat' },
      { type: 'medicament', medication_name: 'Gentamicine', dosage: '5mg/kg', route: 'IV', frequency: '1 dose', priority: 'stat' },
      { type: 'conditionnel', medication_name: 'Noradrenaline IVSE', dosage: '0.1µg/kg/min', route: 'IVSE', condition_trigger: 'si PAM < 65 apres remplissage 30mL/kg', condition_max_doses: 1 },
      { type: 'exam_bio', medication_name: 'Bio sepsis complet', dosage: '', route: '', exam_list: ['NFS', 'CRP', 'Hemocultures', 'Lactates', 'Ionogramme', 'Creatinine', 'Bilan hepatique', 'TP/INR', 'Fibrinogene', 'GDS arteriels'], exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Radio thorax', dosage: '', route: '', exam_site: 'Thorax face', exam_urgency: 'urgent' },
      { type: 'surveillance', medication_name: 'Monitorage hemodynamique', dosage: '', route: '', surveillance_type: 'scope + PA invasive + diurese horaire + lactates q2h', surveillance_frequency: 'continue' },
      { type: 'medicament', medication_name: 'Paracetamol', dosage: '1g', route: 'IV', frequency: 'q6h', priority: 'routine' },
      { type: 'regime', medication_name: 'A jeun strict', dosage: '', route: '', regime_details: 'A jeun strict' },
      { type: 'avis_specialise', medication_name: 'Avis reanimation', dosage: '', route: '', avis_speciality: 'Reanimation', avis_motif: 'Sepsis severe / choc septique — discussion transfert rea', avis_urgency: 'urgent' },
    ],
  },
  'Polytraumatisme': {
    label: 'Pack polytrauma / trauma grave',
    items: [
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '1000mL', route: 'IV', debit: '1000 mL/h', duration: 'Bolus' },
      { type: 'medicament', medication_name: 'Acide tranexamique', dosage: '1g', route: 'IV', frequency: '1 dose en 10min (< H3 post-trauma)', priority: 'stat' },
      { type: 'titration', medication_name: 'Morphine', dosage: '', route: 'IV', titration_dose_init: 2, titration_dose_max: 20, titration_step: 2, titration_interval: '5 min', titration_target: 'EVA < 4', priority: 'stat' },
      { type: 'exam_bio', medication_name: 'Bio trauma', dosage: '', route: '', exam_list: ['NFS', 'Groupe Rh RAI', 'TP/INR', 'Fibrinogene', 'Ionogramme', 'Creatinine', 'Lactates', 'GDS arteriels'], exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Body scanner', dosage: '', route: '', exam_site: 'Body scanner (crane + rachis + TAP)', exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'FAST echo', dosage: '', route: '', exam_site: 'FAST echo (epanchement)', exam_urgency: 'urgent' },
      { type: 'surveillance', medication_name: 'Monitorage complet', dosage: '', route: '', surveillance_type: 'scope + SpO2 + PA + GCS + pupilles + diurese', surveillance_frequency: 'continue' },
      { type: 'oxygene', medication_name: 'O2', dosage: '', route: '', o2_device: 'Masque HC', o2_debit: '15L/min', o2_target: 'SpO2 > 95%' },
      { type: 'regime', medication_name: 'A jeun strict', dosage: '', route: '', regime_details: 'A jeun strict — bloc potentiel' },
      { type: 'dispositif', medication_name: 'Collier cervical rigide', dosage: '', route: '', device_name: 'Collier cervical rigide', device_details: 'Maintien jusqua TDM rachis cervical' },
      { type: 'avis_specialise', medication_name: 'Avis chirurgie', dosage: '', route: '', avis_speciality: 'Chirurgie generale', avis_motif: 'Polytraumatisme — evaluation chirurgicale', avis_urgency: 'urgent' },
    ],
  },
  'Anaphylaxie': {
    label: 'Pack anaphylaxie',
    items: [
      { type: 'medicament', medication_name: 'Adrenaline IM', dosage: '0.5mg', route: 'IM', frequency: '1 dose (repeter a 5min si besoin)', priority: 'stat' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '1000mL', route: 'IV', debit: '1000 mL/h', duration: 'Bolus rapide' },
      { type: 'medicament', medication_name: 'Methylprednisolone', dosage: '120mg', route: 'IV', frequency: '1 dose', priority: 'stat' },
      { type: 'medicament', medication_name: 'Dexchlorpheniramine', dosage: '5mg', route: 'IV', frequency: '1 dose', priority: 'urgent' },
      { type: 'conditionnel', medication_name: 'Salbutamol nebulise', dosage: '5mg', route: 'INH', condition_trigger: 'si bronchospasme', condition_max_doses: 3, condition_interval: '20min' },
      { type: 'oxygene', medication_name: 'O2', dosage: '', route: '', o2_device: 'Masque HC', o2_debit: '15L/min', o2_target: 'SpO2 > 95%' },
      { type: 'surveillance', medication_name: 'Surveillance anaphylaxie', dosage: '', route: '', surveillance_type: 'scope + PA + SpO2 + signes cutanes + voies aeriennes', surveillance_frequency: 'continue' },
      { type: 'exam_bio', medication_name: 'Bio anaphylaxie', dosage: '', route: '', exam_list: ['Tryptase', 'NFS', 'Histamine'], exam_urgency: 'urgent' },
      { type: 'mobilisation', medication_name: 'Position allongee', dosage: '', route: '', mobilisation_details: 'Decubitus dorsal — jambes surelevees' },
    ],
  },
  'Etat de mal epileptique': {
    label: 'Pack EME',
    items: [
      { type: 'medicament', medication_name: 'Clonazepam', dosage: '1mg', route: 'IV', frequency: '1 dose IVL (1min) — repeter 1x a 5min si echec', priority: 'stat' },
      { type: 'conditionnel', medication_name: 'Levetiracetam', dosage: '30mg/kg', route: 'IV', condition_trigger: 'si crise persistante > 5min apres benzodiazepine', condition_max_doses: 1 },
      { type: 'conditionnel', medication_name: 'Fosphenytoine', dosage: '20mg EP/kg', route: 'IV', condition_trigger: 'si echec levetiracetam a 30min', condition_max_doses: 1 },
      { type: 'oxygene', medication_name: 'O2', dosage: '', route: '', o2_device: 'Masque HC', o2_debit: '15L/min', o2_target: 'SpO2 > 95%' },
      { type: 'perfusion', medication_name: 'NaCl 0.9%', dosage: '500mL', route: 'IV', debit: '60 mL/h' },
      { type: 'surveillance', medication_name: 'Surveillance EME', dosage: '', route: '', surveillance_type: 'scope + GCS + pupilles + glycemie + SpO2 + chrono crises', surveillance_frequency: 'continue' },
      { type: 'exam_bio', medication_name: 'Bio EME', dosage: '', route: '', exam_list: ['NFS', 'Ionogramme', 'Creatinine', 'CPK', 'Lactates', 'Glycemie', 'GDS arteriels'], exam_urgency: 'urgent' },
      { type: 'exam_imagerie', medication_name: 'Scanner cerebral', dosage: '', route: '', exam_site: 'Cerebral sans injection', exam_urgency: 'urgent' },
      { type: 'mobilisation', medication_name: 'PLS si convulsions', dosage: '', route: '', mobilisation_details: 'PLS — protection des VAS — canule de Guedel' },
      { type: 'avis_specialise', medication_name: 'Avis reanimation', dosage: '', route: '', avis_speciality: 'Reanimation', avis_motif: 'EME refractaire — discussion IOT + transfert rea', avis_urgency: 'urgent' },
    ],
  },
};

// ==========================================
// EXTENDED MED ROUTES (for frontend only, Supabase enum is limited)
// ==========================================
export const EXTENDED_MED_ROUTES = [
  'IV', 'IVL', 'IVSE', 'IM', 'SC', 'PO', 'SL', 'IR', 'INH',
  'NASAL', 'TOPIQUE', 'IO', 'INTRATH',
] as const;
