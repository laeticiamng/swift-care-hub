import { describe, it, expect } from 'vitest';
import {
  generateCRHHTML,
  generateRPU,
  buildMSSanteMessage,
} from '@/lib/interop/mssante-adapter';
import type { FullEncounterData } from '@/lib/interop/canonical-model';
import { ESTABLISHMENT } from '@/lib/interop/coding-systems';

function makeFullEncounterData(overrides?: Partial<FullEncounterData>): FullEncounterData {
  return {
    patient: {
      id: 'p1',
      nom: 'Dupont',
      prenom: 'Jean',
      date_naissance: '1985-03-15',
      sexe: 'M',
      ins_numero: '185031500012345',
      ipp: 'IPP-00000001',
      medecin_traitant: 'Dr Martin',
      medecin_traitant_mssante: 'dr.martin@medecin.mssante.fr',
    },
    encounter: {
      id: 'enc-1',
      patient_id: 'p1',
      status: 'in-progress',
      arrival_time: '2025-06-15T10:00:00Z',
      when_event: '2025-06-15T10:00:00Z',
      motif_sfmu: 'Douleur thoracique',
      ccmu: 2,
      cimu: 2,
      assigned_doctor_name: 'Dr Urgentiste',
      discharge_destination: 'domicile',
    },
    vitals: [{
      id: 'v1',
      patient_id: 'p1',
      encounter_id: 'enc-1',
      recorded_at: '2025-06-15T10:15:00Z',
      fc: 88,
      pas: 130,
      pad: 80,
      spo2: 97,
      temperature: 37.2,
    }],
    prescriptions: [{
      id: 'rx1',
      encounter_id: 'enc-1',
      patient_id: 'p1',
      prescription_type: 'medicament',
      medication_name: 'Paracetamol',
      dosage: '1g',
      route: 'IV',
      frequency: 'q6h',
      status: 'active',
    }],
    administrations: [],
    procedures: [],
    results: [],
    allergies: [{ patient_id: 'p1', substance: 'Penicilline', reaction: 'Urticaire' }],
    conditions: [
      {
        patient_id: 'p1',
        encounter_id: 'enc-1',
        category: 'diagnostic_actuel',
        verification_status: 'confirmed',
        code_cim10: 'I20.0',
        code_display: 'Angor instable',
      },
      {
        patient_id: 'p1',
        category: 'antecedent',
        code_display: 'HTA',
      },
    ],
    transmissions: [],
    documents: [],
    ...overrides,
  };
}

describe('generateCRHHTML', () => {
  it('produces valid HTML with DOCTYPE', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('includes patient name in the output', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Dupont');
    expect(html).toContain('Jean');
  });

  it('includes establishment information', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain(ESTABLISHMENT.name);
    expect(html).toContain(ESTABLISHMENT.service);
  });

  it('includes the motif de consultation', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Douleur thoracique');
  });

  it('includes allergy information', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Penicilline');
    expect(html).toContain('Urticaire');
  });

  it('displays "Aucune allergie connue" when no allergies', () => {
    const html = generateCRHHTML(makeFullEncounterData({ allergies: [] }));
    expect(html).toContain('Aucune allergie connue');
  });

  it('includes vitals in the output', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('FC 88/min');
    expect(html).toContain('PA 130/80 mmHg');
    expect(html).toContain('SpO2 97%');
  });

  it('includes prescribed medications', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Paracetamol');
  });

  it('includes the doctor name in the footer', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Dr Urgentiste');
  });

  it('escapes HTML special characters in patient data (XSS prevention)', () => {
    const data = makeFullEncounterData();
    data.patient.nom = '<script>alert("xss")</script>';
    const html = generateCRHHTML(data);
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes antecedents from conditions', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('HTA');
  });

  it('includes diagnostic from conditions', () => {
    const html = generateCRHHTML(makeFullEncounterData());
    expect(html).toContain('Angor instable');
    expect(html).toContain('I20.0');
  });
});

describe('generateRPU', () => {
  it('produces all required RPU fields', () => {
    const rpu = generateRPU(makeFullEncounterData());
    const requiredFields = [
      'NOM', 'PRENOM', 'DATE_NAISSANCE', 'SEXE',
      'DATE_ENTREE', 'MOTIF_SFMU', 'FINESS', 'SERVICE',
    ];
    for (const field of requiredFields) {
      expect(rpu).toHaveProperty(field);
    }
  });

  it('includes patient identification data', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.NOM).toBe('Dupont');
    expect(rpu.PRENOM).toBe('Jean');
    expect(rpu.DATE_NAISSANCE).toBe('1985-03-15');
    expect(rpu.SEXE).toBe('M');
  });

  it('includes INS and IPP', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.INS).toBe('185031500012345');
    expect(rpu.IPP).toBe('IPP-00000001');
  });

  it('includes motif SFMU', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.MOTIF_SFMU).toBe('Douleur thoracique');
  });

  it('includes CCMU and CIMU', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.CCMU).toBe(2);
    expect(rpu.CIMU).toBe(2);
  });

  it('includes FINESS from establishment config', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.FINESS).toBe(ESTABLISHMENT.finess);
  });

  it('includes confirmed diagnostic CIM10 code', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.DIAGNOSTIC_CIM10).toBe('I20.0');
    expect(rpu.DIAGNOSTIC_LIBELLE).toBe('Angor instable');
  });

  it('returns null for diagnostic when none is confirmed', () => {
    const data = makeFullEncounterData({ conditions: [] });
    const rpu = generateRPU(data);
    expect(rpu.DIAGNOSTIC_CIM10).toBeNull();
  });

  it('includes orientation/discharge destination', () => {
    const rpu = generateRPU(makeFullEncounterData());
    expect(rpu.ORIENTATION).toBe('domicile');
  });
});

describe('buildMSSanteMessage', () => {
  it('has correct from address using establishment domain', () => {
    const data = makeFullEncounterData();
    const crhHTML = '<html>test</html>';
    const msg = buildMSSanteMessage(data, crhHTML);
    expect(msg.from).toBe(`urgences@${ESTABLISHMENT.mssante_domain}`);
  });

  it('sends to medecin traitant MSSante address', () => {
    const data = makeFullEncounterData();
    const msg = buildMSSanteMessage(data, '<html>test</html>');
    expect(msg.to).toContain('dr.martin@medecin.mssante.fr');
  });

  it('includes patient identification in the message', () => {
    const data = makeFullEncounterData();
    const msg = buildMSSanteMessage(data, '<html>test</html>');
    expect(msg.patient.nom).toBe('Dupont');
    expect(msg.patient.prenom).toBe('Jean');
    expect(msg.patient.ins).toBe('185031500012345');
    expect(msg.patient.dateNaissance).toBe('1985-03-15');
  });

  it('has document type crh', () => {
    const data = makeFullEncounterData();
    const msg = buildMSSanteMessage(data, '<html>test</html>');
    expect(msg.document.type).toBe('crh');
  });

  it('passes the CRH HTML content through', () => {
    const data = makeFullEncounterData();
    const crhHTML = '<html><body>CRH content here</body></html>';
    const msg = buildMSSanteMessage(data, crhHTML);
    expect(msg.document.contentHTML).toBe(crhHTML);
  });

  it('includes metadata with auteur and etablissement', () => {
    const data = makeFullEncounterData();
    const msg = buildMSSanteMessage(data, '<html>test</html>');
    expect(msg.document.metadata.auteur).toBe('Dr Urgentiste');
    expect(msg.document.metadata.etablissement).toBe(ESTABLISHMENT.name);
    expect(msg.document.metadata.service).toBe(ESTABLISHMENT.service);
  });

  it('has a subject line containing patient name', () => {
    const data = makeFullEncounterData();
    const msg = buildMSSanteMessage(data, '<html>test</html>');
    expect(msg.subject).toContain('Dupont');
    expect(msg.subject).toContain('Jean');
    expect(msg.subject).toContain('CR passage urgences');
  });
});
