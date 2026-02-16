// ================================================================
// UrgenceOS — HL7v2 Adapter
// Generates HL7v2 messages for communication with DXCare & legacy SIH
// Format: pipe-delimited messages (HL7 v2.5)
// ================================================================

import {
  type CanonicalPatient,
  type CanonicalEncounter,
  type CanonicalPrescription,
  type CanonicalResult,
} from './canonical-model';

import { ESTABLISHMENT } from './coding-systems';

// ── Helpers ──

function formatHL7Date(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

function generateMsgId(): string {
  return `URGOS${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHL7(text: string): string {
  return text
    .replace(/\\/g, '\\E\\')
    .replace(/\|/g, '\\F\\')
    .replace(/\^/g, '\\S\\')
    .replace(/&/g, '\\T\\')
    .replace(/~/g, '\\R\\');
}

// ── ADT^A01: Admission patient ──
export function encounterToADT_A01(
  patient: CanonicalPatient,
  encounter: CanonicalEncounter,
): string {
  const now = formatHL7Date(new Date());
  const site = ESTABLISHMENT.site_code;

  const segments = [
    `MSH|^~\\&|URGENCEOS|${site}|DXCARE|${site}|${now}||ADT^A01^ADT_A01|${generateMsgId()}|P|2.5|||AL|NE||UTF-8`,
    `EVN|A01|${now}`,
    `PID|1||${escapeHL7(patient.ipp || '')}^^^${site}^PI~${escapeHL7(patient.ins_numero || '')}^^^INS^NH||${escapeHL7(patient.nom)}^${escapeHL7(patient.prenom)}||${patient.date_naissance ? formatHL7Date(patient.date_naissance) : ''}|${patient.sexe === 'M' ? 'M' : 'F'}|||${escapeHL7(patient.adresse || '')}||${escapeHL7(patient.telephone || '')}`,
    `PV1|1|E|${escapeHL7(encounter.location || `SAU BOX ${encounter.box_number || ''}`)}^^^${site}||||${encounter.assigned_doctor_id || ''}|||||||||||${encounter.id}|||||||||||||||||||||||${encounter.when_event ? formatHL7Date(encounter.when_event) : now}`,
    `PV2|||${escapeHL7(encounter.motif_sfmu || '')}||||||||${encounter.gemsa || ''}|||||||||||${escapeHL7(encounter.orientation || '')}`,
  ];

  return segments.join('\r');
}

// ── ADT^A03: Sortie patient ──
export function encounterToADT_A03(
  patient: CanonicalPatient,
  encounter: CanonicalEncounter,
): string {
  const now = formatHL7Date(new Date());
  const site = ESTABLISHMENT.site_code;

  const segments = [
    `MSH|^~\\&|URGENCEOS|${site}|DXCARE|${site}|${now}||ADT^A03^ADT_A03|${generateMsgId()}|P|2.5|||AL|NE||UTF-8`,
    `EVN|A03|${now}`,
    `PID|1||${escapeHL7(patient.ipp || '')}^^^${site}^PI~${escapeHL7(patient.ins_numero || '')}^^^INS^NH||${escapeHL7(patient.nom)}^${escapeHL7(patient.prenom)}||${patient.date_naissance ? formatHL7Date(patient.date_naissance) : ''}|${patient.sexe === 'M' ? 'M' : 'F'}`,
    `PV1|1|E|${escapeHL7(encounter.location || '')}^^^${site}||||${encounter.assigned_doctor_id || ''}|||||||||||${encounter.id}|||||||||||||||||||||||${encounter.when_event ? formatHL7Date(encounter.when_event) : ''}|${encounter.discharge_at ? formatHL7Date(encounter.discharge_at) : now}`,
    `PV2|||${escapeHL7(encounter.motif_sfmu || '')}`,
  ];

  return segments.join('\r');
}

// ── ADT^A02: Transfert patient (changement de box/zone) ──
export function encounterToADT_A02(
  patient: CanonicalPatient,
  encounter: CanonicalEncounter,
  newLocation: string,
): string {
  const now = formatHL7Date(new Date());
  const site = ESTABLISHMENT.site_code;

  const segments = [
    `MSH|^~\\&|URGENCEOS|${site}|DXCARE|${site}|${now}||ADT^A02^ADT_A02|${generateMsgId()}|P|2.5|||AL|NE||UTF-8`,
    `EVN|A02|${now}`,
    `PID|1||${escapeHL7(patient.ipp || '')}^^^${site}^PI||${escapeHL7(patient.nom)}^${escapeHL7(patient.prenom)}`,
    `PV1|1|E|${escapeHL7(newLocation)}^^^${site}||||||||||||||||${encounter.id}`,
  ];

  return segments.join('\r');
}

// ── ORM^O01: Demande d'examens ──
export function examRequestToORM(
  prescription: CanonicalPrescription,
  patient: CanonicalPatient,
): string {
  const now = formatHL7Date(new Date());
  const site = ESTABLISHMENT.site_code;
  const priorityCode = prescription.exam_urgency === 'urgent' ? 'S' : 'R';

  const segments: string[] = [
    `MSH|^~\\&|URGENCEOS|${site}|LIMS|${site}|${now}||ORM^O01^ORM_O01|${generateMsgId()}|P|2.5|||AL|NE||UTF-8`,
    `PID|1||${escapeHL7(patient.ipp || '')}^^^${site}^PI||${escapeHL7(patient.nom)}^${escapeHL7(patient.prenom)}`,
    `PV1|1|E|${escapeHL7(prescription.exam_site || '')}`,
  ];

  if (prescription.prescription_type === 'exam_bio' && prescription.exam_list) {
    prescription.exam_list.forEach((exam, i) => {
      segments.push(
        `ORC|NW|${prescription.id}-${i}|||${priorityCode}`,
        `OBR|${i + 1}|${prescription.id}-${i}||${escapeHL7(exam)}^^^LOCAL||${prescription.when_event ? formatHL7Date(prescription.when_event) : now}|||||||||${prescription.prescriber_id || ''}||||||||${priorityCode}`,
      );
    });
  }

  if (prescription.prescription_type === 'exam_imagerie') {
    segments.push(
      `ORC|NW|${prescription.id}|||${priorityCode}`,
      `OBR|1|${prescription.id}||${escapeHL7(prescription.exam_site || prescription.medication_name || '')}^^^LOCAL||${prescription.when_event ? formatHL7Date(prescription.when_event) : now}||||${escapeHL7(prescription.exam_indication || '')}|||${prescription.prescriber_id || ''}`,
    );
  }

  if (prescription.prescription_type === 'exam_ecg') {
    segments.push(
      `ORC|NW|${prescription.id}|||${priorityCode}`,
      `OBR|1|${prescription.id}||ECG^^^LOCAL||${prescription.when_event ? formatHL7Date(prescription.when_event) : now}`,
    );
  }

  return segments.join('\r');
}

// ── RXO (within ORM): Prescription medicament ──
export function prescriptionToRXO(
  prescription: CanonicalPrescription,
  patient: CanonicalPatient,
): string {
  const now = formatHL7Date(new Date());
  const site = ESTABLISHMENT.site_code;

  const segments = [
    `MSH|^~\\&|URGENCEOS|${site}|PHARMA|${site}|${now}||ORM^O01^ORM_O01|${generateMsgId()}|P|2.5|||AL|NE||UTF-8`,
    `PID|1||${escapeHL7(patient.ipp || '')}^^^${site}^PI||${escapeHL7(patient.nom)}^${escapeHL7(patient.prenom)}`,
    `PV1|1|E`,
    `ORC|NW|${prescription.id}|||${prescription.priority === 'stat' ? 'S' : 'R'}`,
    `RXO|${escapeHL7(prescription.medication_name || '')}^${prescription.medication_atc_code || ''}^ATC|${prescription.dose_value || ''}|${prescription.dose_unit || ''}||${prescription.route || ''}|||${prescription.frequency || ''}`,
  ];

  return segments.join('\r');
}

// ── ORU^R01: Parse incoming lab results ──
export function parseORU_R01(message: string): CanonicalResult[] {
  const segments = message.split('\r');
  const results: CanonicalResult[] = [];

  let currentPatientId = '';
  let currentEncounterId = '';

  for (const seg of segments) {
    const fields = seg.split('|');

    if (fields[0] === 'PID') {
      currentPatientId = fields[3]?.split('^')[0] || '';
    }

    if (fields[0] === 'PV1') {
      currentEncounterId = fields[19] || '';
    }

    if (fields[0] === 'OBX') {
      const valueType = fields[2];
      const nameField = fields[3] || '';
      const nameParts = nameField.split('^');

      results.push({
        encounter_id: currentEncounterId,
        patient_id: currentPatientId,
        name: nameParts[1] || nameParts[0] || nameField,
        code: nameParts[0],
        value_numeric: valueType === 'NM' ? parseFloat(fields[5]) : undefined,
        value_text: valueType === 'ST' || valueType === 'FT' ? fields[5] : undefined,
        value_unit: fields[6] || undefined,
        reference_range: fields[7] || undefined,
        abnormal_flag: (fields[8] as CanonicalResult['abnormal_flag']) || 'N',
        is_critical: ['HH', 'LL', 'A'].includes(fields[8] || ''),
        result_type: 'bio',
        when_event: fields[14] ? parseHL7Date(fields[14]) : undefined,
        provenance: 'import_hl7',
        source_system: 'LIMS',
      });
    }
  }

  return results;
}

function parseHL7Date(hl7Date: string): string {
  if (!hl7Date || hl7Date.length < 8) return '';
  const year = hl7Date.slice(0, 4);
  const month = hl7Date.slice(4, 6);
  const day = hl7Date.slice(6, 8);
  const hour = hl7Date.slice(8, 10) || '00';
  const min = hl7Date.slice(10, 12) || '00';
  const sec = hl7Date.slice(12, 14) || '00';
  return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
}

// ── Message type identification ──
export type HL7MessageType = 'ADT_A01' | 'ADT_A02' | 'ADT_A03' | 'ORM_O01' | 'ORU_R01' | 'UNKNOWN';

export function identifyMessageType(message: string): HL7MessageType {
  const firstLine = message.split('\r')[0] || '';
  const fields = firstLine.split('|');
  if (fields[0] !== 'MSH') return 'UNKNOWN';

  const msgType = fields[8] || '';
  if (msgType.includes('ADT^A01')) return 'ADT_A01';
  if (msgType.includes('ADT^A02')) return 'ADT_A02';
  if (msgType.includes('ADT^A03')) return 'ADT_A03';
  if (msgType.includes('ORM^O01')) return 'ORM_O01';
  if (msgType.includes('ORU^R01')) return 'ORU_R01';
  return 'UNKNOWN';
}

// ── Simulated message log (for demo) ──
export interface HL7MessageLog {
  id: string;
  timestamp: string;
  direction: 'sent' | 'received';
  messageType: HL7MessageType;
  target: string;
  patientName?: string;
  status: 'success' | 'error' | 'pending';
  rawMessage: string;
}

export function generateDemoHL7Logs(): HL7MessageLog[] {
  const now = new Date();
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      direction: 'sent',
      messageType: 'ADT_A01',
      target: 'DXCare',
      patientName: 'DUPONT Jean',
      status: 'success',
      rawMessage: 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|...',
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 4 * 60000).toISOString(),
      direction: 'sent',
      messageType: 'ORM_O01',
      target: 'LIMS',
      patientName: 'DUPONT Jean',
      status: 'success',
      rawMessage: 'MSH|^~\\&|URGENCEOS|URGOS01|LIMS|URGOS01|...',
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
      direction: 'received',
      messageType: 'ORU_R01',
      target: 'LIMS',
      patientName: 'DUPONT Jean',
      status: 'success',
      rawMessage: 'MSH|^~\\&|LIMS|URGOS01|URGENCEOS|URGOS01|...',
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
      direction: 'sent',
      messageType: 'ORM_O01',
      target: 'PACS',
      patientName: 'MARTIN Marie',
      status: 'success',
      rawMessage: 'MSH|^~\\&|URGENCEOS|URGOS01|PACS|URGOS01|...',
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 1 * 60000).toISOString(),
      direction: 'sent',
      messageType: 'ADT_A01',
      target: 'DXCare',
      patientName: 'BERNARD Pierre',
      status: 'success',
      rawMessage: 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|...',
    },
    {
      id: '6',
      timestamp: new Date(now.getTime() - 30000).toISOString(),
      direction: 'sent',
      messageType: 'ADT_A03',
      target: 'DXCare',
      patientName: 'PETIT Sophie',
      status: 'error',
      rawMessage: 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|...',
    },
  ];
}
