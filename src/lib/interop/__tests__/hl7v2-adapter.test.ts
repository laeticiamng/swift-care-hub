import { describe, it, expect } from 'vitest';
import {
  encounterToADT_A01,
  parseORU_R01,
  identifyMessageType,
} from '@/lib/interop/hl7v2-adapter';
import type { CanonicalPatient, CanonicalEncounter } from '@/lib/interop/canonical-model';

const samplePatient: CanonicalPatient = {
  id: 'patient-1',
  nom: 'Dupont',
  prenom: 'Jean',
  date_naissance: '1985-03-15',
  sexe: 'M',
  ipp: 'IPP-00000001',
  ins_numero: '185031500012345',
  telephone: '0612345678',
  adresse: '12 rue de la Paix',
};

const sampleEncounter: CanonicalEncounter = {
  id: 'enc-1',
  patient_id: 'patient-1',
  status: 'in-progress',
  arrival_time: '2025-06-15T10:00:00Z',
  when_event: '2025-06-15T10:00:00Z',
  location: 'Box 3',
};

describe('encounterToADT_A01', () => {
  it('produces a message containing MSH segment', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    const segments = msg.split('\r');
    expect(segments[0]).toMatch(/^MSH\|/);
  });

  it('contains ADT^A01 message type in MSH', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    expect(msg).toContain('ADT^A01^ADT_A01');
  });

  it('produces a PID segment with patient name', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    const segments = msg.split('\r');
    const pid = segments.find(s => s.startsWith('PID'));
    expect(pid).toBeDefined();
    expect(pid).toContain('Dupont');
    expect(pid).toContain('Jean');
  });

  it('produces a PV1 segment with encounter id', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    const segments = msg.split('\r');
    const pv1 = segments.find(s => s.startsWith('PV1'));
    expect(pv1).toBeDefined();
    expect(pv1).toContain('enc-1');
  });

  it('includes E (emergency) in PV1 patient class', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    const segments = msg.split('\r');
    const pv1 = segments.find(s => s.startsWith('PV1'));
    expect(pv1).toBeDefined();
    // PV1|1|E|...
    const fields = pv1!.split('|');
    expect(fields[2]).toBe('E');
  });

  it('uses HL7 v2.5 version', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    expect(msg).toContain('|2.5|');
  });

  it('includes EVN segment', () => {
    const msg = encounterToADT_A01(samplePatient, sampleEncounter);
    const segments = msg.split('\r');
    const evn = segments.find(s => s.startsWith('EVN'));
    expect(evn).toBeDefined();
    expect(evn).toContain('A01');
  });
});

describe('escapeHL7 (tested indirectly via encounterToADT_A01)', () => {
  it('escapes pipe characters in patient data', () => {
    const patientWithPipe: CanonicalPatient = {
      ...samplePatient,
      adresse: 'Rue A|B',
    };
    const msg = encounterToADT_A01(patientWithPipe, sampleEncounter);
    // The pipe should be escaped as \F\
    expect(msg).toContain('\\F\\');
    // But the message should still have valid MSH|PID|PV1 structure
    const segments = msg.split('\r');
    expect(segments.length).toBeGreaterThanOrEqual(3);
  });

  it('escapes caret characters in patient data', () => {
    const patientWithCaret: CanonicalPatient = {
      ...samplePatient,
      adresse: 'Apt 5^Floor 2',
    };
    const msg = encounterToADT_A01(patientWithCaret, sampleEncounter);
    expect(msg).toContain('\\S\\');
  });
});

describe('parseORU_R01', () => {
  const oruMessage = [
    'MSH|^~\\&|LIMS|URGOS01|URGENCEOS|URGOS01|20250615120000||ORU^R01^ORU_R01|MSG001|P|2.5',
    'PID|1||IPP-001^^^URGOS01^PI||DUPONT^Jean',
    'PV1|1|E|Box 3^^^URGOS01||||||||||||||||ENC-001',
    'OBR|1|REQ001||NFS^^^LOCAL||20250615110000',
    'OBX|1|NM|6690-2^Hemoglobine^LN||13.5|g/dL|12.0-16.0|N|||F|||20250615115000',
    'OBX|2|NM|2951-2^Sodium^LN||142|mmol/L|136-145|N|||F|||20250615115000',
    'OBX|3|NM|2823-3^Potassium^LN||6.1|mmol/L|3.5-5.0|HH|||F|||20250615115000',
  ].join('\r');

  it('extracts all OBX results', () => {
    const results = parseORU_R01(oruMessage);
    expect(results).toHaveLength(3);
  });

  it('correctly parses numeric values from NM type', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].value_numeric).toBe(13.5);
    expect(results[1].value_numeric).toBe(142);
  });

  it('extracts the analyte name from OBX', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].name).toBe('Hemoglobine');
  });

  it('identifies critical results with HH flag', () => {
    const results = parseORU_R01(oruMessage);
    const potassium = results[2];
    expect(potassium.abnormal_flag).toBe('HH');
    expect(potassium.is_critical).toBe(true);
  });

  it('extracts patient_id from PID segment', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].patient_id).toBe('IPP-001');
  });

  it('extracts encounter_id from PV1 segment', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].encounter_id).toBe('ENC-001');
  });

  it('includes reference range from OBX-7', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].reference_range).toBe('12.0-16.0');
  });

  it('marks normal results as non-critical', () => {
    const results = parseORU_R01(oruMessage);
    expect(results[0].is_critical).toBe(false);
    expect(results[0].abnormal_flag).toBe('N');
  });
});

describe('identifyMessageType', () => {
  it('identifies ADT_A01 message', () => {
    const msg = 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|20250615||ADT^A01^ADT_A01|MSG1|P|2.5';
    expect(identifyMessageType(msg)).toBe('ADT_A01');
  });

  it('identifies ADT_A02 message', () => {
    const msg = 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|20250615||ADT^A02^ADT_A02|MSG1|P|2.5';
    expect(identifyMessageType(msg)).toBe('ADT_A02');
  });

  it('identifies ADT_A03 message', () => {
    const msg = 'MSH|^~\\&|URGENCEOS|URGOS01|DXCARE|URGOS01|20250615||ADT^A03^ADT_A03|MSG1|P|2.5';
    expect(identifyMessageType(msg)).toBe('ADT_A03');
  });

  it('identifies ORU_R01 message', () => {
    const msg = 'MSH|^~\\&|LIMS|URGOS01|URGENCEOS|URGOS01|20250615||ORU^R01^ORU_R01|MSG1|P|2.5';
    expect(identifyMessageType(msg)).toBe('ORU_R01');
  });

  it('identifies ORM_O01 message', () => {
    const msg = 'MSH|^~\\&|URGENCEOS|URGOS01|LIMS|URGOS01|20250615||ORM^O01^ORM_O01|MSG1|P|2.5';
    expect(identifyMessageType(msg)).toBe('ORM_O01');
  });

  it('returns UNKNOWN for invalid messages', () => {
    expect(identifyMessageType('NOT_HL7_MESSAGE')).toBe('UNKNOWN');
  });

  it('returns UNKNOWN for empty string', () => {
    expect(identifyMessageType('')).toBe('UNKNOWN');
  });
});
