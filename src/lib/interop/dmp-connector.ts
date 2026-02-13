/**
 * DMP Connector — Dossier Médical Partagé (Mon Espace Santé)
 * ----------------------------------------------------------
 * Implements document submission to the French national health record system.
 *
 * Protocol: XDS.b (IHE ITI-41 Provide and Register Document Set)
 * Transport: SOAP/MTOM over MSSanté or DMP-Direct
 * Format: CDA R2 (HL7 Clinical Document Architecture)
 *
 * References:
 *  - ANS CI-SIS Volet Structuration Minimale
 *  - ANS CI-SIS Volet CR d'examens de biologie médicale
 *  - DMP Cadre d'Interopérabilité des SIS (CI-SIS)
 */

import type {
  FullEncounterData,
  CanonicalDocument,
  DocumentType,
} from './canonical-model';
import { ESTABLISHMENT } from './coding-systems';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface DMPSubmission {
  /** Unique document ID (OID format) */
  documentUniqueId: string;
  /** Patient INS matricule */
  patientINS: string;
  /** Document type (CDA classCode) */
  classCode: DMPClassCode;
  /** Format code */
  formatCode: string;
  /** CDA R2 document content */
  cdaContent: string;
  /** Submission metadata */
  metadata: DMPMetadata;
}

export interface DMPMetadata {
  /** Author institution */
  authorInstitution: string;
  /** Author person */
  authorPerson: string;
  /** Author specialty */
  authorSpecialty: string;
  /** Practice setting code */
  practiceSettingCode: string;
  /** Healthcare facility type code */
  healthcareFacilityTypeCode: string;
  /** Creation time (HL7 DTM format) */
  creationTime: string;
  /** Service start time */
  serviceStartTime: string;
  /** Service stop time */
  serviceStopTime?: string;
  /** Source patient ID (INS) */
  sourcePatientId: string;
  /** Title */
  title: string;
  /** Confidentiality code */
  confidentialityCode: 'N' | 'R' | 'V';
}

export type DMPClassCode =
  | 'CR-URG'     // Compte-rendu de passage aux urgences
  | 'ORDO'       // Ordonnance
  | 'CR-BIO'     // Compte-rendu de biologie
  | 'CR-IMG'     // Compte-rendu d'imagerie
  | 'CERT'       // Certificat médical
  | 'LDL-SES'    // Lettre de liaison SES (sortie d'établissement)
  | 'SYNTH';     // Document de synthèse

export interface DMPResponse {
  success: boolean;
  documentId?: string;
  registryErrorList?: string[];
  timestamp: string;
}

export interface DMPConfig {
  /** DMP endpoint URL */
  endpoint: string;
  /** Establishment OID */
  establishmentOID: string;
  /** FINESS code */
  finess: string;
  /** Authentication certificate (base64) */
  authCertificate?: string;
  /** MSSanté relay mode */
  useMSSanteRelay: boolean;
}

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

const DMP_OID_ROOT = '1.2.250.1.213';
const DMP_FORMAT_CDA_R2 = 'urn:ihe:iti:xds-sd:pdf:2008';
const DMP_FORMAT_CDA_BODY = `${DMP_OID_ROOT}.1.1.1`;
const LOINC_CRH_CODE = '34878-9';    // Emergency department Note
const LOINC_ORDO_CODE = '57833-6';   // Prescriptions
const LOINC_BIO_CODE = '11502-2';    // Laboratory report
const LOINC_SYNTH_CODE = '60591-5';  // Patient summary

const DOC_TYPE_TO_CLASS: Record<DocumentType, DMPClassCode> = {
  crh: 'CR-URG',
  ordonnance: 'ORDO',
  rpu: 'CR-URG',
  courrier: 'LDL-SES',
  certificat: 'CERT',
  arret_travail: 'CERT',
};

const DOC_TYPE_TO_LOINC: Record<DocumentType, string> = {
  crh: LOINC_CRH_CODE,
  ordonnance: LOINC_ORDO_CODE,
  rpu: LOINC_CRH_CODE,
  courrier: LOINC_SYNTH_CODE,
  certificat: LOINC_SYNTH_CODE,
  arret_travail: LOINC_SYNTH_CODE,
};

// ────────────────────────────────────────────────────────────────
// CDA R2 Generation
// ────────────────────────────────────────────────────────────────

/** Format date to HL7 DTM (YYYYMMDDHHMMSS) */
function toHL7DateTime(isoDate: string | Date): string {
  const d = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  return d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

/** Generate a unique document ID using OID format */
export function generateDocumentId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${DMP_OID_ROOT}.9.${ESTABLISHMENT.finess}.${timestamp}.${random}`;
}

/** Generate CDA R2 header for DMP submission */
export function generateCDAHeader(
  data: FullEncounterData,
  docType: DocumentType,
  documentId: string,
): string {
  const patient = data.patient;
  const encounter = data.encounter;
  const loincCode = DOC_TYPE_TO_LOINC[docType] || LOINC_CRH_CODE;

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="CDA.xsl"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="urn:hl7-org:v3 CDA.xsd">
  <realmCode code="FR"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="${DMP_OID_ROOT}.1.1.1.12.4"/>
  <id root="${documentId}"/>
  <code code="${loincCode}" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC"
    displayName="${docType === 'crh' ? 'Compte-rendu de passage aux urgences' : 'Document médical'}"/>
  <title>${escapeXml(getDocumentTitle(docType, patient.nom, patient.prenom))}</title>
  <effectiveTime value="${toHL7DateTime(new Date())}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <languageCode code="fr-FR"/>

  <!-- Patient -->
  <recordTarget>
    <patientRole>
      ${patient.ins_numero ? `<id root="${DMP_OID_ROOT}.1.4.8" extension="${escapeXml(patient.ins_numero)}"/>` : ''}
      ${patient.ipp ? `<id root="${ESTABLISHMENT.oid}" extension="${escapeXml(patient.ipp)}"/>` : ''}
      <patient>
        <name>
          <family>${escapeXml(patient.nom)}</family>
          <given>${escapeXml(patient.prenom)}</given>
        </name>
        <administrativeGenderCode code="${patient.sexe === 'M' ? 'M' : 'F'}"
          codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="${patient.date_naissance.replace(/-/g, '')}"/>
      </patient>
    </patientRole>
  </recordTarget>

  <!-- Author -->
  <author>
    <time value="${toHL7DateTime(new Date())}"/>
    <assignedAuthor>
      <id root="${ESTABLISHMENT.oid}" extension="${encounter.assigned_doctor_id || 'urgentiste'}"/>
      <assignedPerson>
        <name><prefix>Dr</prefix><given>${escapeXml(encounter.assigned_doctor_name || 'Urgentiste')}</given></name>
      </assignedPerson>
      <representedOrganization>
        <id root="${DMP_OID_ROOT}.1.6" extension="${ESTABLISHMENT.finess}"/>
        <name>${escapeXml(ESTABLISHMENT.name)}</name>
      </representedOrganization>
    </assignedAuthor>
  </author>

  <!-- Custodian -->
  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization>
        <id root="${DMP_OID_ROOT}.1.6" extension="${ESTABLISHMENT.finess}"/>
        <name>${escapeXml(ESTABLISHMENT.name)}</name>
      </representedCustodianOrganization>
    </assignedCustodian>
  </custodian>

  <!-- Encounter -->
  <componentOf>
    <encompassingEncounter>
      <id root="${ESTABLISHMENT.oid}" extension="${escapeXml(encounter.id)}"/>
      <effectiveTime>
        <low value="${toHL7DateTime(encounter.arrival_time)}"/>
        ${encounter.discharge_time ? `<high value="${toHL7DateTime(encounter.discharge_time)}"/>` : ''}
      </effectiveTime>
    </encompassingEncounter>
  </componentOf>`;
}

/** Safe base64 encoding that handles UTF-8 */
function safeBase64Encode(str: string): string {
  try {
    // Node.js / test environment
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
  } catch { /* fallback */ }
  // Browser environment
  return btoa(unescape(encodeURIComponent(str)));
}

/** Wrap HTML content into a CDA R2 body */
export function wrapHTMLInCDABody(cdaHeader: string, htmlContent: string): string {
  return `${cdaHeader}

  <!-- Body (non-structuré) -->
  <component>
    <nonXMLBody>
      <text mediaType="text/html" representation="B64">
        ${safeBase64Encode(htmlContent)}
      </text>
    </nonXMLBody>
  </component>
</ClinicalDocument>`;
}

// ────────────────────────────────────────────────────────────────
// DMP Submission Builder
// ────────────────────────────────────────────────────────────────

/** Build a DMP submission from a canonical document */
export function buildDMPSubmission(
  data: FullEncounterData,
  document: CanonicalDocument,
): DMPSubmission | { error: string } {
  // Validate INS is required for DMP
  if (!data.patient.ins_numero) {
    return { error: 'INS qualifié requis pour l\'alimentation du DMP' };
  }

  if (data.patient.ins_status === 'invalide') {
    return { error: 'INS invalide — impossible d\'alimenter le DMP' };
  }

  const docType = document.document_type;
  const documentId = generateDocumentId();

  // Generate CDA content
  const cdaHeader = generateCDAHeader(data, docType, documentId);
  const cdaContent = wrapHTMLInCDABody(
    cdaHeader,
    document.content_html || '<p>Contenu non disponible</p>',
  );

  return {
    documentUniqueId: documentId,
    patientINS: data.patient.ins_numero,
    classCode: DOC_TYPE_TO_CLASS[docType] || 'CR-URG',
    formatCode: DMP_FORMAT_CDA_BODY,
    cdaContent,
    metadata: {
      authorInstitution: ESTABLISHMENT.name,
      authorPerson: data.encounter.assigned_doctor_name || 'Dr Urgentiste',
      authorSpecialty: 'Médecine d\'urgence',
      practiceSettingCode: 'SA07',  // Service d'urgence
      healthcareFacilityTypeCode: 'ETABLISSEMENT',
      creationTime: toHL7DateTime(new Date()),
      serviceStartTime: toHL7DateTime(data.encounter.arrival_time),
      serviceStopTime: data.encounter.discharge_time
        ? toHL7DateTime(data.encounter.discharge_time)
        : undefined,
      sourcePatientId: data.patient.ins_numero,
      title: getDocumentTitle(docType, data.patient.nom, data.patient.prenom),
      confidentialityCode: 'N',
    },
  };
}

/** Build XDS.b ITI-41 SOAP envelope */
export function buildXDSbEnvelope(submission: DMPSubmission): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
  xmlns:xds="urn:ihe:iti:xds-b:2007"
  xmlns:rim="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0"
  xmlns:rs="urn:oasis:names:tc:ebxml-regrep:xsd:rs:3.0">
  <soap:Header>
    <wsa:Action xmlns:wsa="http://www.w3.org/2005/08/addressing">
      urn:ihe:iti:2007:ProvideAndRegisterDocumentSet-b
    </wsa:Action>
  </soap:Header>
  <soap:Body>
    <xds:ProvideAndRegisterDocumentSetRequest>
      <lcm:SubmitObjectsRequest xmlns:lcm="urn:oasis:names:tc:ebxml-regrep:xsd:lcm:3.0">
        <rim:RegistryObjectList>
          <!-- ExtrinsicObject = Document Entry -->
          <rim:ExtrinsicObject id="doc01" mimeType="text/xml"
            objectType="urn:uuid:7edca82f-054d-47f2-a032-9b2a5b5186c1">
            <rim:Slot name="creationTime">
              <rim:ValueList><rim:Value>${submission.metadata.creationTime}</rim:Value></rim:ValueList>
            </rim:Slot>
            <rim:Slot name="languageCode">
              <rim:ValueList><rim:Value>fr-FR</rim:Value></rim:ValueList>
            </rim:Slot>
            <rim:Slot name="sourcePatientId">
              <rim:ValueList><rim:Value>${escapeXml(submission.patientINS)}^^^&amp;${DMP_OID_ROOT}.1.4.8&amp;ISO</rim:Value></rim:ValueList>
            </rim:Slot>
            <rim:Slot name="serviceStartTime">
              <rim:ValueList><rim:Value>${submission.metadata.serviceStartTime}</rim:Value></rim:ValueList>
            </rim:Slot>
            ${submission.metadata.serviceStopTime ? `
            <rim:Slot name="serviceStopTime">
              <rim:ValueList><rim:Value>${submission.metadata.serviceStopTime}</rim:Value></rim:ValueList>
            </rim:Slot>` : ''}
            <rim:Classification classificationScheme="urn:uuid:93606bcf-9494-43ec-9b4e-a7748d1a838d"
              classifiedObject="doc01" nodeRepresentation="">
              <rim:Slot name="authorPerson">
                <rim:ValueList><rim:Value>${escapeXml(submission.metadata.authorPerson)}</rim:Value></rim:ValueList>
              </rim:Slot>
              <rim:Slot name="authorInstitution">
                <rim:ValueList><rim:Value>${escapeXml(submission.metadata.authorInstitution)}</rim:Value></rim:ValueList>
              </rim:Slot>
              <rim:Slot name="authorSpecialty">
                <rim:ValueList><rim:Value>${escapeXml(submission.metadata.authorSpecialty)}</rim:Value></rim:ValueList>
              </rim:Slot>
            </rim:Classification>
            <rim:Name>
              <rim:LocalizedString value="${escapeXml(submission.metadata.title)}"/>
            </rim:Name>
          </rim:ExtrinsicObject>

          <!-- SubmissionSet -->
          <rim:RegistryPackage id="ss01">
            <rim:Slot name="submissionTime">
              <rim:ValueList><rim:Value>${submission.metadata.creationTime}</rim:Value></rim:ValueList>
            </rim:Slot>
          </rim:RegistryPackage>

          <!-- Association Document -> SubmissionSet -->
          <rim:Association associationType="urn:oasis:names:tc:ebxml-regrep:AssociationType:HasMember"
            sourceObject="ss01" targetObject="doc01">
            <rim:Slot name="SubmissionSetStatus">
              <rim:ValueList><rim:Value>Original</rim:Value></rim:ValueList>
            </rim:Slot>
          </rim:Association>
        </rim:RegistryObjectList>
      </lcm:SubmitObjectsRequest>

      <!-- Document content -->
      <xds:Document id="doc01">${safeBase64Encode(submission.cdaContent)}</xds:Document>
    </xds:ProvideAndRegisterDocumentSetRequest>
  </soap:Body>
</soap:Envelope>`;
}

// ────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────

export interface DMPValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate data readiness for DMP submission */
export function validateForDMP(data: FullEncounterData): DMPValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // INS obligatoire
  if (!data.patient.ins_numero) {
    errors.push('INS_MANQUANT: Le matricule INS est obligatoire pour le DMP');
  } else if (data.patient.ins_status === 'invalide') {
    errors.push('INS_INVALIDE: Le matricule INS n\'est pas valide');
  } else if (data.patient.ins_status === 'provisoire') {
    warnings.push('INS_PROVISOIRE: L\'INS n\'est pas encore qualifié — le document sera soumis mais peut être rejeté');
  }

  // Nom et prénom
  if (!data.patient.nom || !data.patient.prenom) {
    errors.push('IDENTITE_INCOMPLETE: Nom et prénom obligatoires');
  }

  // Date de naissance
  if (!data.patient.date_naissance) {
    errors.push('DDN_MANQUANTE: Date de naissance obligatoire');
  }

  // Sexe
  if (!data.patient.sexe || !['M', 'F'].includes(data.patient.sexe)) {
    errors.push('SEXE_INVALIDE: Sexe doit être M ou F');
  }

  // Encounter dates
  if (!data.encounter.arrival_time) {
    errors.push('DATE_ENTREE_MANQUANTE: Date d\'entrée obligatoire');
  }

  // Médecin auteur
  if (!data.encounter.assigned_doctor_name) {
    warnings.push('AUTEUR_ABSENT: Nom du médecin auteur non renseigné');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function getDocumentTitle(docType: DocumentType, nom: string, prenom: string): string {
  const titles: Record<DocumentType, string> = {
    crh: 'Compte-rendu de passage aux urgences',
    ordonnance: 'Ordonnance de sortie',
    rpu: 'Résumé de passage aux urgences',
    courrier: 'Lettre de liaison urgences',
    certificat: 'Certificat médical',
    arret_travail: 'Arrêt de travail',
  };
  return `${titles[docType] || 'Document médical'} — ${nom} ${prenom}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
