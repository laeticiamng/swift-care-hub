import type { Database, Json } from '@/integrations/supabase/types';
import type { Communication, GuardSchedule, LabAlert, PatientIdentity, QualityIndicator, TimelineEntry, TimelineEntryType, TimelineValidationStatus } from '@/lib/sih-types';
import { generateIPP, generateNumeroSejour } from '@/lib/homonymy-detection';

export type EncounterRow = Database['public']['Tables']['encounters']['Row'];
export type PatientRow = Database['public']['Tables']['patients']['Row'] & {
  ipp?: string | null;
  photo_url?: string | null;
};
export type ResultRow = Database['public']['Tables']['results']['Row'];
export type PrescriptionRow = Database['public']['Tables']['prescriptions']['Row'];
export type TimelineItemRow = Database['public']['Tables']['timeline_items']['Row'];
export type VitalRow = Database['public']['Tables']['vitals']['Row'];

export interface LabAlertRow {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string | null;
  result_id: string | null;
  analyte: string;
  value: number;
  unit: string;
  is_critical: boolean;
  threshold_exceeded: 'low' | 'high';
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  acknowledgment_note: string | null;
  escalation_level: 1 | 2 | 3;
  escalation_history: Json;
  ipp_verified: boolean;
  lab_caller: string | null;
  lab_call_time: string | null;
  lab_interlocutor: string | null;
  created_at: string;
}

export interface CommunicationRow {
  id: string;
  encounter_id: string;
  patient_id: string;
  patient_ipp: string | null;
  type: Communication['type'];
  content: string;
  source: string;
  author_id: string;
  author_name: string;
  status: Communication['status'];
  seen_by: string | null;
  seen_at: string | null;
  treated_by: string | null;
  treated_at: string | null;
  lab_result_value: string | null;
  lab_interlocutor: string | null;
  target_service: string | null;
  created_at: string;
}

export interface GuardScheduleRow {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  services: string[];
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

const COMMUNICATION_TO_TIMELINE: Record<Communication['type'], TimelineEntryType> = {
  appel_labo: 'alerte_labo',
  info_orale: 'info_orale',
  prescription_orale: 'prescription_orale',
  appel_service: 'communication',
  transmission_inter_service: 'communication',
};

function jsonToEscalationHistory(value: Json): LabAlert['escalation_history'] {
  return Array.isArray(value) ? (value as LabAlert['escalation_history']) : [];
}

export function mapLabAlert(row: LabAlertRow): LabAlert {
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    patient_id: row.patient_id,
    patient_ipp: row.patient_ipp || generateIPP(row.patient_id),
    result_id: row.result_id || row.id,
    analyte: row.analyte,
    value: row.value,
    unit: row.unit,
    is_critical: row.is_critical,
    threshold_exceeded: row.threshold_exceeded,
    acknowledged: row.acknowledged,
    acknowledged_by: row.acknowledged_by || undefined,
    acknowledged_at: row.acknowledged_at || undefined,
    acknowledgment_note: row.acknowledgment_note || undefined,
    escalation_level: row.escalation_level,
    escalation_history: jsonToEscalationHistory(row.escalation_history),
    ipp_verified: row.ipp_verified,
    lab_caller: row.lab_caller || undefined,
    lab_call_time: row.lab_call_time || undefined,
    lab_interlocutor: row.lab_interlocutor || undefined,
    created_at: row.created_at,
  };
}

export function mapCommunication(row: CommunicationRow): Communication {
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    patient_id: row.patient_id,
    patient_ipp: row.patient_ipp || generateIPP(row.patient_id),
    type: row.type,
    content: row.content,
    source: row.source,
    author_id: row.author_id,
    author_name: row.author_name,
    status: row.status,
    seen_by: row.seen_by || undefined,
    seen_at: row.seen_at || undefined,
    treated_by: row.treated_by || undefined,
    treated_at: row.treated_at || undefined,
    lab_result_value: row.lab_result_value || undefined,
    lab_interlocutor: row.lab_interlocutor || undefined,
    target_service: row.target_service || undefined,
    created_at: row.created_at,
  };
}

export function mapGuardSchedule(row: GuardScheduleRow): GuardSchedule {
  return {
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name,
    role: row.role,
    services: row.services || [],
    start_time: row.start_time,
    end_time: row.end_time,
    is_active: row.is_active,
  };
}

export function buildPatientIdentity(patient: PatientRow, encounter: Pick<EncounterRow, 'id' | 'zone'>): PatientIdentity {
  return {
    id: patient.id,
    nom: patient.nom,
    prenom: patient.prenom,
    date_naissance: patient.date_naissance,
    ipp: patient.ipp || generateIPP(patient.id),
    ins_numero: patient.ins_numero || undefined,
    service: encounter.zone === 'uhcd' ? 'UHCD' : encounter.zone === 'dechocage' ? 'Dechocage' : 'SAU',
    numero_sejour: generateNumeroSejour(encounter.id),
    photo_url: patient.photo_url || undefined,
    sexe: patient.sexe,
    allergies: patient.allergies || [],
  };
}

export function buildSihTimelineEntries(params: {
  encounter: EncounterRow;
  patient: PatientRow;
  vitals: VitalRow[];
  prescriptions: PrescriptionRow[];
  results: ResultRow[];
  timeline: TimelineItemRow[];
  communications: Communication[];
  labAlerts: LabAlert[];
  medecinName?: string;
}): TimelineEntry[] {
  const { encounter, patient, vitals, prescriptions, results, timeline, communications, labAlerts, medecinName } = params;
  const ipp = patient.ipp || generateIPP(patient.id);

  const entries: TimelineEntry[] = [];

  entries.push({
    id: `arrival-${encounter.id}`,
    encounter_id: encounter.id,
    patient_id: patient.id,
    patient_ipp: ipp,
    entry_type: 'arrivee',
    content: `Arrivée aux urgences${encounter.motif_sfmu ? ` — ${encounter.motif_sfmu}` : ''}`,
    author_id: 'system',
    author_name: 'UrgenceOS',
    validation_status: 'valide',
    created_at: encounter.arrival_time,
  });

  if (encounter.triage_time) {
    entries.push({
      id: `triage-${encounter.id}`,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: 'triage',
      content: `Triage IOA${encounter.cimu ? ` — CIMU ${encounter.cimu}` : ''}${encounter.ccmu ? ` — CCMU ${encounter.ccmu}` : ''}`,
      author_id: 'system',
      author_name: 'IOA',
      validation_status: encounter.cimu && encounter.cimu <= 2 ? 'critique' : 'valide',
      created_at: encounter.triage_time,
    });
  }

  for (const vital of vitals) {
    const values = [
      vital.fc ? `FC ${vital.fc}` : null,
      vital.pa_systolique ? `PA ${vital.pa_systolique}${vital.pa_diastolique ? `/${vital.pa_diastolique}` : ''}` : null,
      vital.spo2 ? `SpO2 ${vital.spo2}%` : null,
      vital.temperature ? `T ${vital.temperature}°C` : null,
    ].filter(Boolean).join(' · ');

    if (values) {
      entries.push({
        id: `vital-${vital.id}`,
        encounter_id: encounter.id,
        patient_id: patient.id,
        patient_ipp: ipp,
        entry_type: 'consultation',
        content: `Constantes relevées — ${values}`,
        author_id: vital.recorded_by || 'system',
        author_name: 'Surveillance',
        validation_status: 'valide',
        created_at: vital.recorded_at,
      });
    }
  }

  for (const item of timeline) {
    const validationStatus: TimelineValidationStatus = item.item_type === 'diagnostic' ? 'valide' : 'en_attente';
    entries.push({
      id: item.id,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: item.item_type === 'diagnostic' ? 'consultation' : item.item_type === 'deplacement' ? 'acte' : 'communication',
      content: item.content,
      author_id: item.source_author || 'system',
      author_name: item.source_author || medecinName || 'UrgenceOS',
      validation_status: validationStatus,
      created_at: item.created_at,
    });
  }

  for (const prescription of prescriptions) {
    entries.push({
      id: `rx-${prescription.id}`,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: 'prescription_ecrite',
      content: `${prescription.medication_name} ${prescription.dosage}${prescription.route ? ` · ${prescription.route}` : ''}`,
      author_id: prescription.prescriber_id,
      author_name: medecinName || 'Prescripteur',
      validation_status: prescription.status === 'active' ? 'valide' : 'en_attente',
      created_at: prescription.created_at,
    });
  }

  for (const result of results) {
    const entryType: TimelineEntryType = result.category === 'imagerie'
      ? 'resultat_imagerie'
      : result.category === 'ecg'
        ? 'resultat_ecg'
        : 'resultat_bio';

    entries.push({
      id: `res-${result.id}`,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: entryType,
      content: `${result.title}${result.is_critical ? ' — critique' : ''}`,
      details: typeof result.content === 'object' && result.content ? result.content as Record<string, unknown> : undefined,
      author_id: 'system',
      author_name: 'Résultats',
      validation_status: result.is_critical ? 'critique' : 'valide',
      created_at: result.received_at,
    });
  }

  for (const alert of labAlerts) {
    entries.push({
      id: `lab-${alert.id}`,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: 'alerte_labo',
      content: `${alert.analyte}: ${alert.value} ${alert.unit}${alert.acknowledged ? ' — acquittée' : ' — en attente d\'acquittement'}`,
      author_id: alert.acknowledged_by || 'system',
      author_name: alert.lab_caller || 'Laboratoire',
      validation_status: alert.acknowledged ? 'valide' : 'critique',
      created_at: alert.created_at,
      lab_result_value: `${alert.value} ${alert.unit}`,
      lab_interlocutor: alert.lab_interlocutor,
    });
  }

  for (const communication of communications) {
    entries.push({
      id: `comm-${communication.id}`,
      encounter_id: encounter.id,
      patient_id: patient.id,
      patient_ipp: ipp,
      entry_type: COMMUNICATION_TO_TIMELINE[communication.type],
      content: communication.content,
      author_id: communication.author_id,
      author_name: communication.author_name,
      validation_status: communication.status === 'traite' ? 'valide' : 'en_attente',
      created_at: communication.created_at,
      lab_result_value: communication.lab_result_value,
      lab_interlocutor: communication.lab_interlocutor,
    });
  }

  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function buildQualityIndicators(params: {
  totalPassages: number;
  withCcmu: number;
  withOrientation: number;
  triagedTotal: number;
  triageUnder10: number;
  acknowledgedLabAlerts: number;
  totalLabAlerts: number;
  documentedDiagnostics: number;
}): QualityIndicator[] {
  const now = new Date().toISOString();
  const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 1000) / 10 : 0);

  return [
    {
      id: 'quality-ccmu',
      name: 'CCMU renseigné',
      description: 'Passages avec classification CCMU documentée.',
      value: pct(params.withCcmu, params.totalPassages),
      target: 95,
      unit: '%',
      period: '30j',
      calculated_at: now,
    },
    {
      id: 'quality-orientation',
      name: 'Orientation documentée',
      description: 'Passages avec orientation ou sortie formalisée.',
      value: pct(params.withOrientation, params.totalPassages),
      target: 90,
      unit: '%',
      period: '30j',
      calculated_at: now,
    },
    {
      id: 'quality-triage',
      name: 'Triage < 10 min',
      description: 'Patients triés en moins de 10 minutes après l’arrivée.',
      value: pct(params.triageUnder10, params.triagedTotal),
      target: 90,
      unit: '%',
      period: '30j',
      calculated_at: now,
    },
    {
      id: 'quality-lab',
      name: 'Alertes labo acquittées',
      description: 'Résultats critiques reconnus et tracés.',
      value: pct(params.acknowledgedLabAlerts, params.totalLabAlerts),
      target: 95,
      unit: '%',
      period: '30j',
      calculated_at: now,
    },
    {
      id: 'quality-diagnostic',
      name: 'Diagnostics documentés',
      description: 'Dossiers avec diagnostic dans la timeline médicale.',
      value: pct(params.documentedDiagnostics, params.totalPassages),
      target: 90,
      unit: '%',
      period: '30j',
      calculated_at: now,
    },
  ];
}
