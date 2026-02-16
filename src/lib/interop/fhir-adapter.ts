// ================================================================
// UrgenceOS — FHIR R4 Adapter
// Transforms canonical model data to FHIR R4 resources
// ================================================================

import {
  type CanonicalPatient,
  type CanonicalEncounter,
  type CanonicalVitals,
  type CanonicalPrescription,
  type CanonicalAdministration,
  type CanonicalProcedure,
  type CanonicalResult,
  type CanonicalAllergy,
  type CanonicalCondition,
  type CanonicalDocument,
  type FullEncounterData,
} from './canonical-model';

import {
  LOINC_VITALS,
  type LoincVitalKey,
  ESTABLISHMENT,
  mapEncounterStatusToFHIR,
  mapPrescriptionStatusToFHIR,
  mapServiceStatusToFHIR,
  mapExamCategoryToFHIR,
} from './coding-systems';

import { validateFHIRBundle, type ValidationResult } from '@/lib/fhir-validator';

// ── FHIR Type Definitions (simplified for MVP) ──

export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'collection' | 'document' | 'transaction';
  meta?: { lastUpdated?: string };
  timestamp?: string;
  entry: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
}

interface FHIRIdentifier {
  system: string;
  value?: string;
  use?: string;
}

interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

interface FHIRReference {
  reference?: string;
  display?: string;
}

interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

// ── Patient → FHIR Patient ──
export function patientToFHIR(patient: CanonicalPatient): FHIRResource {
  const identifiers: FHIRIdentifier[] = [];

  if (patient.ins_numero) {
    identifiers.push({
      system: 'urn:oid:1.2.250.1.213.1.4.8',
      value: patient.ins_numero,
      use: 'official',
    });
  }
  if (patient.ipp) {
    identifiers.push({
      system: `urn:oid:${ESTABLISHMENT.oid}`,
      value: patient.ipp,
      use: 'usual',
    });
  }

  return {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      lastUpdated: new Date().toISOString(),
    },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">Patient: ${patient.prenom} ${patient.nom}, born ${patient.date_naissance || 'unknown'}, gender ${patient.sexe === 'M' ? 'male' : 'female'}</div>`,
    },
    identifier: identifiers,
    name: [{
      family: patient.nom,
      given: [patient.prenom],
      use: 'official',
    }],
    birthDate: patient.date_naissance,
    gender: patient.sexe === 'M' ? 'male' : 'female',
    telecom: patient.telephone ? [{ system: 'phone', value: patient.telephone, use: 'mobile' }] : [],
    address: patient.adresse ? [{ text: patient.adresse }] : [],
    generalPractitioner: patient.medecin_traitant ? [{ display: patient.medecin_traitant }] : [],
  };
}

// ── Encounter → FHIR Encounter ──
export function encounterToFHIR(encounter: CanonicalEncounter): FHIRResource {
  return {
    resourceType: 'Encounter',
    id: encounter.id,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
      lastUpdated: new Date().toISOString(),
    },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">Emergency encounter for Patient/${encounter.patient_id}, status: ${encounter.status || 'unknown'}${encounter.motif_sfmu ? `, reason: ${encounter.motif_sfmu}` : ''}</div>`,
    },
    status: mapEncounterStatusToFHIR(encounter.status),
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'EMER',
      display: 'emergency',
    },
    subject: { reference: `Patient/${encounter.patient_id}` },
    period: {
      start: encounter.when_event || encounter.arrival_time,
      end: encounter.discharge_at || encounter.discharge_time || undefined,
    },
    location: encounter.location ? [{
      location: { display: encounter.location },
      status: 'active',
    }] : [],
    priority: encounter.cimu ? {
      coding: [{ system: 'urn:oid:local:cimu', code: encounter.cimu.toString() }],
    } : undefined,
    reasonCode: encounter.motif_sfmu ? [{ text: encounter.motif_sfmu }] : [],
    hospitalization: encounter.discharge_destination ? {
      dischargeDisposition: { text: encounter.discharge_destination },
    } : undefined,
  };
}

// ── Vitals → FHIR Observation[] ──
export function vitalsToFHIR(vitals: CanonicalVitals): FHIRResource[] {
  const observations: FHIRResource[] = [];

  const vitalMapping: Array<{ field: LoincVitalKey; accessor: (v: CanonicalVitals) => number | undefined | null }> = [
    { field: 'fc', accessor: (v) => v.fc },
    { field: 'pas', accessor: (v) => v.pas ?? v.pa_systolique },
    { field: 'pad', accessor: (v) => v.pad ?? v.pa_diastolique },
    { field: 'spo2', accessor: (v) => v.spo2 },
    { field: 'temperature', accessor: (v) => v.temperature },
    { field: 'fr', accessor: (v) => v.fr ?? v.frequence_respiratoire },
    { field: 'gcs', accessor: (v) => v.gcs },
    { field: 'eva', accessor: (v) => v.eva ?? v.eva_douleur },
  ];

  for (const m of vitalMapping) {
    const value = m.accessor(vitals);
    if (value != null) {
      const loinc = LOINC_VITALS[m.field];
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          }],
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: loinc.code,
            display: loinc.display,
          }],
        },
        subject: { reference: `Patient/${vitals.patient_id}` },
        encounter: { reference: `Encounter/${vitals.encounter_id}` },
        effectiveDateTime: vitals.when_event || vitals.recorded_at,
        valueQuantity: {
          value,
          unit: loinc.unit,
          system: 'http://unitsofmeasure.org',
          code: loinc.unit,
        },
        performer: vitals.recorded_by ? [{ reference: `Practitioner/${vitals.recorded_by}` }] : [],
      });
    }
  }

  return observations;
}

// ── Prescription → FHIR MedicationRequest | ServiceRequest ──
export function prescriptionToFHIR(rx: CanonicalPrescription): FHIRResource {
  const isMedication = ['medicament', 'perfusion', 'titration', 'conditionnel', 'oxygene'].includes(rx.prescription_type);

  if (isMedication) {
    return medicationRequestToFHIR(rx);
  }
  return serviceRequestToFHIR(rx);
}

function medicationRequestToFHIR(rx: CanonicalPrescription): FHIRResource {
  const medication: FHIRCodeableConcept = {
    text: rx.medication_name,
  };

  if (rx.medication_atc_code) {
    medication.coding = [{
      system: 'http://www.whocc.no/atc',
      code: rx.medication_atc_code,
      display: rx.medication_name,
    }];
  }

  const dosageInstruction: Record<string, unknown> = {};
  if (rx.dose_value && rx.dose_unit) {
    dosageInstruction.doseAndRate = [{
      doseQuantity: { value: rx.dose_value, unit: rx.dose_unit },
    }];
  } else if (rx.dosage) {
    dosageInstruction.text = rx.dosage;
  }
  if (rx.route) {
    dosageInstruction.route = { text: rx.route };
  }
  if (rx.frequency) {
    dosageInstruction.timing = { code: { text: rx.frequency } };
  }

  // Titration-specific additional instructions
  if (rx.prescription_type === 'titration') {
    dosageInstruction.additionalInstruction = [{
      text: `Titration: init ${rx.titration_dose_init}mg, max ${rx.titration_dose_max}mg, step ${rx.titration_step}mg q${rx.titration_interval}, target ${rx.titration_target}`,
    }];
  }

  // Conditionnel-specific
  if (rx.prescription_type === 'conditionnel' && rx.condition_trigger) {
    dosageInstruction.asNeededCodeableConcept = { text: rx.condition_trigger };
    if (rx.condition_max_doses) {
      dosageInstruction.maxDosePerPeriod = {
        numerator: { value: rx.condition_max_doses },
        denominator: { value: 1, unit: 'cycle' },
      };
    }
  }

  return {
    resourceType: 'MedicationRequest',
    id: rx.id,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/MedicationRequest'],
      lastUpdated: new Date().toISOString(),
    },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">MedicationRequest: ${rx.medication_name || 'unknown medication'} for Patient/${rx.patient_id}</div>`,
    },
    status: mapPrescriptionStatusToFHIR(rx.status),
    intent: rx.provenance === 'ia_suggestion' ? 'proposal' : 'order',
    priority: rx.priority || 'routine',
    medicationCodeableConcept: medication,
    subject: { reference: `Patient/${rx.patient_id}` },
    encounter: { reference: `Encounter/${rx.encounter_id}` },
    authoredOn: rx.when_event || rx.created_at,
    requester: rx.prescriber_id ? { reference: `Practitioner/${rx.prescriber_id}` } : undefined,
    dosageInstruction: [dosageInstruction],
    note: rx.notes ? [{ text: rx.notes }] : [],
  };
}

function serviceRequestToFHIR(rx: CanonicalPrescription): FHIRResource {
  const codeText = rx.exam_list?.join(', ')
    || rx.exam_site
    || rx.avis_speciality
    || rx.surveillance_type
    || rx.device_name
    || rx.medication_name
    || '';

  return {
    resourceType: 'ServiceRequest',
    id: rx.id,
    status: mapServiceStatusToFHIR(rx.status),
    intent: 'order',
    priority: rx.priority || 'routine',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/service-category',
        code: mapExamCategoryToFHIR(rx.prescription_type),
      }],
    }],
    code: { text: codeText },
    subject: { reference: `Patient/${rx.patient_id}` },
    encounter: { reference: `Encounter/${rx.encounter_id}` },
    authoredOn: rx.when_event || rx.created_at,
    requester: rx.prescriber_id ? { reference: `Practitioner/${rx.prescriber_id}` } : undefined,
    reasonCode: rx.exam_indication ? [{ text: rx.exam_indication }] : [],
    note: rx.notes ? [{ text: rx.notes }] : [],
  };
}

// ── Administration → FHIR MedicationAdministration ──
export function administrationToFHIR(admin: CanonicalAdministration): FHIRResource {
  const dosage: Record<string, unknown> = {};
  if (admin.dose_given != null && admin.dose_unit) {
    dosage.dose = { value: admin.dose_given, unit: admin.dose_unit };
  }
  if (admin.route) {
    dosage.route = { text: admin.route };
  }

  return {
    resourceType: 'MedicationAdministration',
    id: admin.id,
    status: admin.status || 'completed',
    medicationReference: { reference: `MedicationRequest/${admin.prescription_id}` },
    subject: admin.patient_id ? { reference: `Patient/${admin.patient_id}` } : undefined,
    context: { reference: `Encounter/${admin.encounter_id}` },
    effectiveDateTime: admin.when_event,
    performer: admin.performer_id ? [{ actor: { reference: `Practitioner/${admin.performer_id}` } }] : [],
    dosage,
    note: admin.notes ? [{ text: admin.notes }] : [],
  };
}

// ── Procedure → FHIR Procedure ──
export function procedureToFHIR(proc: CanonicalProcedure): FHIRResource {
  return {
    resourceType: 'Procedure',
    id: proc.id,
    status: proc.status || 'completed',
    code: {
      coding: proc.code ? [{ code: proc.code }] : [],
      text: proc.procedure_type,
    },
    subject: { reference: `Patient/${proc.patient_id}` },
    encounter: { reference: `Encounter/${proc.encounter_id}` },
    performedDateTime: proc.when_event,
    performer: proc.performed_by ? [{ actor: { reference: `Practitioner/${proc.performed_by}` } }] : [],
    bodySite: proc.body_site ? [{ text: proc.body_site }] : [],
    note: proc.notes ? [{ text: proc.notes }] : [],
  };
}

// ── Result → FHIR Observation (lab) or DiagnosticReport (imaging) ──
export function resultToFHIR(result: CanonicalResult): FHIRResource {
  if (result.result_type === 'imagerie') {
    return {
      resourceType: 'DiagnosticReport',
      id: result.id,
      status: 'final',
      category: [{
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'RAD', display: 'Radiology' }],
      }],
      code: {
        coding: result.code ? [{ system: 'http://loinc.org', code: result.code }] : [],
        text: result.title || result.name,
      },
      subject: { reference: `Patient/${result.patient_id}` },
      encounter: { reference: `Encounter/${result.encounter_id}` },
      effectiveDateTime: result.when_event,
      conclusion: result.value_text,
    };
  }

  // Lab observation
  const obs: FHIRResource = {
    resourceType: 'Observation',
    id: result.id,
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: result.result_type === 'ecg' ? 'procedure' : 'laboratory',
      }],
    }],
    code: {
      coding: result.code ? [{ system: 'http://loinc.org', code: result.code }] : [],
      text: result.title || result.name,
    },
    subject: { reference: `Patient/${result.patient_id}` },
    encounter: { reference: `Encounter/${result.encounter_id}` },
    effectiveDateTime: result.when_event,
    interpretation: result.abnormal_flag && result.abnormal_flag !== 'N' ? [{
      coding: [{ code: result.abnormal_flag }],
    }] : [],
  };

  if (result.value_numeric != null) {
    obs.valueQuantity = {
      value: result.value_numeric,
      unit: result.value_unit,
    } as FHIRQuantity;
  } else if (result.value_text) {
    obs.valueString = result.value_text;
  }

  if (result.reference_range) {
    obs.referenceRange = [{ text: result.reference_range }];
  }

  return obs;
}

// ── Allergy → FHIR AllergyIntolerance ──
export function allergyToFHIR(allergy: CanonicalAllergy): FHIRResource {
  return {
    resourceType: 'AllergyIntolerance',
    id: allergy.id,
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: allergy.status || 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }],
    },
    criticality: allergy.criticality || 'unable-to-assess',
    code: {
      coding: allergy.substance_code ? [{ code: allergy.substance_code }] : [],
      text: allergy.substance,
    },
    patient: { reference: `Patient/${allergy.patient_id}` },
    reaction: allergy.reaction ? [{
      manifestation: [{ text: allergy.reaction }],
      severity: allergy.severity === 'severe' ? 'severe' : allergy.severity === 'moderee' ? 'moderate' : 'mild',
    }] : [],
  };
}

// ── Condition → FHIR Condition ──
export function conditionToFHIR(condition: CanonicalCondition): FHIRResource {
  return {
    resourceType: 'Condition',
    id: condition.id,
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: condition.clinical_status || 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: condition.verification_status || 'provisional' }],
    },
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-category',
        code: condition.category === 'antecedent' ? 'problem-list-item' : 'encounter-diagnosis',
      }],
    }],
    code: {
      coding: condition.code_cim10 ? [{
        system: 'http://hl7.org/fhir/sid/icd-10',
        code: condition.code_cim10,
        display: condition.code_display,
      }] : [],
      text: condition.code_display,
    },
    subject: { reference: `Patient/${condition.patient_id}` },
    encounter: condition.encounter_id ? { reference: `Encounter/${condition.encounter_id}` } : undefined,
    onsetDateTime: condition.onset_date,
    note: condition.notes ? [{ text: condition.notes }] : [],
  };
}

// ── CRH Document → FHIR Composition ──
export function documentToFHIRComposition(
  doc: CanonicalDocument,
  encounter: CanonicalEncounter,
  patient: CanonicalPatient,
): FHIRResource {
  return {
    resourceType: 'Composition',
    status: doc.status === 'signed' ? 'final' : 'preliminary',
    type: {
      coding: [{
        system: 'http://loinc.org',
        code: '18842-5',
        display: 'Discharge summary',
      }],
    },
    subject: { reference: `Patient/${patient.id}` },
    encounter: { reference: `Encounter/${encounter.id}` },
    date: doc.signed_at || doc.when_recorded || new Date().toISOString(),
    author: doc.signed_by ? [{ reference: `Practitioner/${doc.signed_by}` }] : [],
    title: `Compte-rendu de passage aux urgences - ${patient.nom} ${patient.prenom}`,
    section: [
      { title: 'Motif', text: { status: 'generated', div: `<div>${encounter.motif_sfmu || ''}</div>` } },
      { title: 'Diagnostic', text: { status: 'generated', div: '<div>Voir sections cliniques</div>' } },
      { title: 'Traitement', text: { status: 'generated', div: '<div>Voir prescriptions</div>' } },
      { title: 'Orientation', text: { status: 'generated', div: `<div>${encounter.discharge_destination || 'En cours'}</div>` } },
    ],
  };
}

// ── Full Encounter Bundle ──
export function encounterBundleToFHIR(data: FullEncounterData): FHIRBundle {
  const entries: FHIRBundleEntry[] = [];

  // Patient
  entries.push({
    fullUrl: `urn:uuid:Patient/${data.patient.id}`,
    resource: patientToFHIR(data.patient),
  });

  // Encounter
  entries.push({
    fullUrl: `urn:uuid:Encounter/${data.encounter.id}`,
    resource: encounterToFHIR(data.encounter),
  });

  // Allergies
  for (const allergy of data.allergies) {
    entries.push({
      fullUrl: `urn:uuid:AllergyIntolerance/${allergy.id || crypto.randomUUID()}`,
      resource: allergyToFHIR(allergy),
    });
  }

  // Conditions
  for (const condition of data.conditions) {
    entries.push({
      fullUrl: `urn:uuid:Condition/${condition.id || crypto.randomUUID()}`,
      resource: conditionToFHIR(condition),
    });
  }

  // Vitals
  for (const vital of data.vitals) {
    for (const obs of vitalsToFHIR(vital)) {
      entries.push({
        fullUrl: `urn:uuid:Observation/${crypto.randomUUID()}`,
        resource: obs,
      });
    }
  }

  // Prescriptions
  for (const rx of data.prescriptions) {
    entries.push({
      fullUrl: `urn:uuid:${rx.prescription_type?.startsWith('exam') ? 'ServiceRequest' : 'MedicationRequest'}/${rx.id}`,
      resource: prescriptionToFHIR(rx),
    });
  }

  // Administrations
  for (const admin of data.administrations) {
    entries.push({
      fullUrl: `urn:uuid:MedicationAdministration/${admin.id}`,
      resource: administrationToFHIR(admin),
    });
  }

  // Procedures
  for (const proc of data.procedures) {
    entries.push({
      fullUrl: `urn:uuid:Procedure/${proc.id}`,
      resource: procedureToFHIR(proc),
    });
  }

  // Results
  for (const result of data.results) {
    entries.push({
      fullUrl: `urn:uuid:${result.result_type === 'imagerie' ? 'DiagnosticReport' : 'Observation'}/${result.id || crypto.randomUUID()}`,
      resource: resultToFHIR(result),
    });
  }

  // Documents
  for (const doc of data.documents) {
    if (doc.document_type === 'crh') {
      entries.push({
        fullUrl: `urn:uuid:Composition/${doc.id || crypto.randomUUID()}`,
        resource: documentToFHIRComposition(doc, data.encounter, data.patient),
      });
    }
  }

  return {
    resourceType: 'Bundle',
    type: 'collection',
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}

// ── Utility: Count resources by type in a bundle ──
export function countBundleResources(bundle: FHIRBundle): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of bundle.entry) {
    const type = entry.resource.resourceType;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

// ── Utility: Validate a generated FHIR bundle ──
export function validateGeneratedBundle(bundle: FHIRBundle): ValidationResult {
  return validateFHIRBundle(bundle as unknown as Record<string, unknown>);
}
