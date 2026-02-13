/**
 * Tests unitaires — Module DMP Connector
 * Vérifie la construction des soumissions DMP et la génération CDA R2
 */
import { describe, it, expect } from 'vitest';
import {
  generateDocumentId,
  generateCDAHeader,
  wrapHTMLInCDABody,
  buildDMPSubmission,
  buildXDSbEnvelope,
  validateForDMP,
} from '@/lib/interop/dmp-connector';
import type { FullEncounterData, CanonicalDocument } from '@/lib/interop/canonical-model';

const makeFullData = (): FullEncounterData => ({
  patient: {
    id: 'pat-1',
    nom: 'DUPONT',
    prenom: 'Jean',
    date_naissance: '1985-03-15',
    sexe: 'M',
    ins_numero: '185037512345645',
    ins_status: 'qualifie',
    ipp: 'IPP-001',
  },
  encounter: {
    id: 'enc-1',
    patient_id: 'pat-1',
    status: 'finished',
    arrival_time: '2024-01-15T10:30:00Z',
    discharge_time: '2024-01-15T18:00:00Z',
    assigned_doctor_name: 'Martin',
    motif_sfmu: 'Douleur thoracique',
  },
  vitals: [],
  prescriptions: [],
  administrations: [],
  procedures: [],
  results: [],
  allergies: [],
  conditions: [],
  transmissions: [],
  documents: [],
});

const makeDocument = (): CanonicalDocument => ({
  encounter_id: 'enc-1',
  patient_id: 'pat-1',
  document_type: 'crh',
  content_html: '<p>Compte-rendu de passage</p>',
  status: 'signed',
});

describe('generateDocumentId', () => {
  it('génère un ID unique au format OID', () => {
    const id = generateDocumentId();
    expect(id).toContain('1.2.250.1.213');
    expect(id.split('.').length).toBeGreaterThan(4);
  });

  it('génère des IDs différents à chaque appel', () => {
    const id1 = generateDocumentId();
    const id2 = generateDocumentId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateCDAHeader', () => {
  it('génère un header CDA R2 valide', () => {
    const data = makeFullData();
    const header = generateCDAHeader(data, 'crh', 'test-doc-id');

    expect(header).toContain('<?xml version="1.0"');
    expect(header).toContain('ClinicalDocument');
    expect(header).toContain('urn:hl7-org:v3');
    expect(header).toContain('realmCode code="FR"');
  });

  it('inclut les données patient', () => {
    const data = makeFullData();
    const header = generateCDAHeader(data, 'crh', 'test-doc-id');

    expect(header).toContain('DUPONT');
    expect(header).toContain('Jean');
    expect(header).toContain('185037512345645');
    expect(header).toContain('19850315');
  });

  it('inclut le code LOINC pour un CRH', () => {
    const data = makeFullData();
    const header = generateCDAHeader(data, 'crh', 'test-doc-id');

    expect(header).toContain('34878-9'); // LOINC CRH code
    expect(header).toContain('LOINC');
  });

  it('inclut les données de l\'encounter', () => {
    const data = makeFullData();
    const header = generateCDAHeader(data, 'crh', 'test-doc-id');

    expect(header).toContain('enc-1');
    expect(header).toContain('Martin');
  });

  it('inclut le sexe au format HL7', () => {
    const data = makeFullData();
    data.patient.sexe = 'F';
    const header = generateCDAHeader(data, 'crh', 'test-doc-id');

    expect(header).toContain('administrativeGenderCode code="F"');
  });
});

describe('wrapHTMLInCDABody', () => {
  it('enveloppe le contenu HTML dans un body CDA', () => {
    const header = '<ClinicalDocument>';
    const html = '<p>Test</p>';
    const cda = wrapHTMLInCDABody(header, html);

    expect(cda).toContain('<ClinicalDocument>');
    expect(cda).toContain('nonXMLBody');
    expect(cda).toContain('text/html');
    expect(cda).toContain('</ClinicalDocument>');
  });

  it('encode le contenu HTML en base64', () => {
    const header = '<ClinicalDocument>';
    const html = '<p>Contenu test</p>';
    const cda = wrapHTMLInCDABody(header, html);

    expect(cda).toContain('representation="B64"');
    // Should contain base64 encoded content
    expect(cda).not.toContain('<p>Contenu test</p>');
  });
});

describe('buildDMPSubmission', () => {
  it('construit une soumission DMP valide', () => {
    const data = makeFullData();
    const doc = makeDocument();
    const result = buildDMPSubmission(data, doc);

    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.patientINS).toBe('185037512345645');
      expect(result.classCode).toBe('CR-URG');
      expect(result.cdaContent).toContain('ClinicalDocument');
      expect(result.metadata.authorPerson).toBe('Martin');
      expect(result.metadata.practiceSettingCode).toBe('SA07');
    }
  });

  it('refuse si INS manquant', () => {
    const data = makeFullData();
    data.patient.ins_numero = undefined;
    const doc = makeDocument();
    const result = buildDMPSubmission(data, doc);

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('INS');
    }
  });

  it('refuse si INS invalide', () => {
    const data = makeFullData();
    data.patient.ins_status = 'invalide';
    const doc = makeDocument();
    const result = buildDMPSubmission(data, doc);

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('invalide');
    }
  });

  it('mappe le type de document correctement', () => {
    const data = makeFullData();

    const docCRH = { ...makeDocument(), document_type: 'crh' as const };
    const resCRH = buildDMPSubmission(data, docCRH);
    if (!('error' in resCRH)) expect(resCRH.classCode).toBe('CR-URG');

    const docOrdo = { ...makeDocument(), document_type: 'ordonnance' as const };
    const resOrdo = buildDMPSubmission(data, docOrdo);
    if (!('error' in resOrdo)) expect(resOrdo.classCode).toBe('ORDO');

    const docCert = { ...makeDocument(), document_type: 'certificat' as const };
    const resCert = buildDMPSubmission(data, docCert);
    if (!('error' in resCert)) expect(resCert.classCode).toBe('CERT');
  });
});

describe('buildXDSbEnvelope', () => {
  it('génère une enveloppe SOAP XDS.b', () => {
    const data = makeFullData();
    const doc = makeDocument();
    const submission = buildDMPSubmission(data, doc);
    if ('error' in submission) throw new Error('Should not error');

    const envelope = buildXDSbEnvelope(submission);

    expect(envelope).toContain('soap:Envelope');
    expect(envelope).toContain('ProvideAndRegisterDocumentSet');
    expect(envelope).toContain('RegistryObjectList');
    expect(envelope).toContain('ExtrinsicObject');
    expect(envelope).toContain('SubmissionSet');
  });

  it('inclut les métadonnées de la soumission', () => {
    const data = makeFullData();
    const doc = makeDocument();
    const submission = buildDMPSubmission(data, doc);
    if ('error' in submission) throw new Error('Should not error');

    const envelope = buildXDSbEnvelope(submission);

    expect(envelope).toContain('185037512345645');
    expect(envelope).toContain('Martin');
    expect(envelope).toContain('creationTime');
  });
});

describe('validateForDMP', () => {
  it('valide des données complètes', () => {
    const data = makeFullData();
    const result = validateForDMP(data);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('signale un INS manquant', () => {
    const data = makeFullData();
    data.patient.ins_numero = undefined;
    const result = validateForDMP(data);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('INS'))).toBe(true);
  });

  it('signale un INS invalide', () => {
    const data = makeFullData();
    data.patient.ins_status = 'invalide';
    const result = validateForDMP(data);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('INS_INVALIDE'))).toBe(true);
  });

  it('avertit si INS provisoire', () => {
    const data = makeFullData();
    data.patient.ins_status = 'provisoire';
    const result = validateForDMP(data);

    expect(result.valid).toBe(true); // Still valid but with warning
    expect(result.warnings.some(w => w.includes('PROVISOIRE'))).toBe(true);
  });

  it('signale une identité incomplète', () => {
    const data = makeFullData();
    data.patient.nom = '';
    const result = validateForDMP(data);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('IDENTITE'))).toBe(true);
  });

  it('signale une date d\'entrée manquante', () => {
    const data = makeFullData();
    (data.encounter as any).arrival_time = '';
    const result = validateForDMP(data);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('DATE_ENTREE'))).toBe(true);
  });

  it('avertit si médecin auteur absent', () => {
    const data = makeFullData();
    data.encounter.assigned_doctor_name = undefined;
    const result = validateForDMP(data);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('AUTEUR'))).toBe(true);
  });
});
