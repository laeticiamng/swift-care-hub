// ================================================================
// UrgenceOS — FHIR R4 Import Adapter
// Transforms FHIR R4 bundles back into canonical model
// Addresses the audit gap: "export only, no import"
// ================================================================

import type {
  CanonicalPatient,
  CanonicalEncounter,
  CanonicalVitals,
  CanonicalPrescription,
  CanonicalAllergy,
  CanonicalCondition,
  CanonicalResult,
  CanonicalProcedure,
  FullEncounterData,
} from './canonical-model';

import type { FHIRBundle, FHIRResource, FHIRBundleEntry } from './fhir-adapter';

// ── Import Result ──

export interface FHIRImportResult {
  success: boolean;
  data?: FullEncounterData;
  errors: string[];
  warnings: string[];
  resourceCounts: Record<string, number>;
}

// ── Main Import Function ──

export function importFHIRBundle(bundle: FHIRBundle): FHIRImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const resourceCounts: Record<string, number> = {};

  if (!bundle || bundle.resourceType !== 'Bundle') {
    return { success: false, errors: ['Le document n\'est pas un Bundle FHIR valide'], warnings, resourceCounts };
  }

  if (!bundle.entry || bundle.entry.length === 0) {
    return { success: false, errors: ['Le Bundle ne contient aucune entrée'], warnings, resourceCounts };
  }

  // Count resources
  for (const entry of bundle.entry) {
    const type = entry.resource?.resourceType || 'unknown';
    resourceCounts[type] = (resourceCounts[type] || 0) + 1;
  }

  // Build reference map for cross-referencing
  const refMap = new Map<string, FHIRResource>();
  for (const entry of bundle.entry) {
    if (entry.fullUrl) {
      refMap.set(entry.fullUrl, entry.resource);
    }
    if (entry.resource.id) {
      refMap.set(`${entry.resource.resourceType}/${entry.resource.id}`, entry.resource);
    }
  }

  // Extract resources by type
  const byType = (type: string) =>
    bundle.entry.filter(e => e.resource?.resourceType === type).map(e => e.resource);

  // ── Patient ──
  const fhirPatients = byType('Patient');
  if (fhirPatients.length === 0) {
    errors.push('Aucune ressource Patient trouvée dans le Bundle');
    return { success: false, errors, warnings, resourceCounts };
  }
  const patient = fhirPatientToCanonical(fhirPatients[0]);
  if (fhirPatients.length > 1) {
    warnings.push(`${fhirPatients.length} patients trouvés, seul le premier est importé`);
  }

  // ── Encounter ──
  const fhirEncounters = byType('Encounter');
  let encounter: CanonicalEncounter;
  if (fhirEncounters.length > 0) {
    encounter = fhirEncounterToCanonical(fhirEncounters[0], patient.id);
  } else {
    warnings.push('Aucun Encounter trouvé, un encounter par défaut est créé');
    encounter = {
      id: crypto.randomUUID(),
      patient_id: patient.id,
      status: 'arrived',
      arrival_time: new Date().toISOString(),
      provenance: 'import_fhir',
    };
  }

  // ── Vitals (Observations vital-signs) ──
  const fhirObservations = byType('Observation');
  const vitalObs = fhirObservations.filter(isVitalSignObservation);
  const vitals = groupVitalsFromObservations(vitalObs, patient.id, encounter.id);

  // ── Lab Results (Observations laboratory) ──
  const labObs = fhirObservations.filter(o => !isVitalSignObservation(o));
  const results: CanonicalResult[] = labObs.map(o => fhirObservationToResult(o, patient.id, encounter.id));

  // ── DiagnosticReport → Results (imaging) ──
  const fhirReports = byType('DiagnosticReport');
  for (const report of fhirReports) {
    results.push(fhirDiagnosticReportToResult(report, patient.id, encounter.id));
  }

  // ── Prescriptions ──
  const fhirMedRequests = byType('MedicationRequest');
  const fhirServiceRequests = byType('ServiceRequest');
  const prescriptions: CanonicalPrescription[] = [
    ...fhirMedRequests.map(mr => fhirMedRequestToCanonical(mr, patient.id, encounter.id)),
    ...fhirServiceRequests.map(sr => fhirServiceRequestToCanonical(sr, patient.id, encounter.id)),
  ];

  // ── Allergies ──
  const fhirAllergies = byType('AllergyIntolerance');
  const allergies: CanonicalAllergy[] = fhirAllergies.map(a => fhirAllergyToCanonical(a, patient.id));

  // ── Conditions ──
  const fhirConditions = byType('Condition');
  const conditions: CanonicalCondition[] = fhirConditions.map(c => fhirConditionToCanonical(c, patient.id, encounter.id));

  // ── Procedures ──
  const fhirProcedures = byType('Procedure');
  const procedures: CanonicalProcedure[] = fhirProcedures.map(p => fhirProcedureToCanonical(p, patient.id, encounter.id));

  const data: FullEncounterData = {
    patient,
    encounter,
    vitals,
    prescriptions,
    administrations: [],
    procedures,
    results,
    allergies,
    conditions,
    transmissions: [],
    documents: [],
  };

  return {
    success: true,
    data,
    errors,
    warnings,
    resourceCounts,
  };
}

// ── Individual Resource Converters ──

function fhirPatientToCanonical(resource: FHIRResource): CanonicalPatient {
  const name = getFirst(resource.name as any[]);
  const identifiers = (resource.identifier as any[]) || [];

  const insId = identifiers.find((i: any) => i.system === 'urn:oid:1.2.250.1.213.1.4.8');
  const ippId = identifiers.find((i: any) => i.use === 'usual');

  return {
    id: resource.id || crypto.randomUUID(),
    nom: name?.family || '',
    prenom: getFirst(name?.given) || '',
    date_naissance: (resource.birthDate as string) || '',
    sexe: resource.gender === 'female' ? 'F' : 'M',
    ins_numero: insId?.value,
    ipp: ippId?.value,
    telephone: extractTelecom(resource.telecom as any[], 'phone'),
    adresse: extractAddress(resource.address as any[]),
    medecin_traitant: extractDisplay(getFirst(resource.generalPractitioner as any[])),
    provenance: 'import_fhir',
  };
}

function fhirEncounterToCanonical(resource: FHIRResource, patientId: string): CanonicalEncounter {
  const period = resource.period as any;
  const priority = resource.priority as any;
  const reasonCode = getFirst(resource.reasonCode as any[]);
  const hospitalization = resource.hospitalization as any;
  const location = getFirst(resource.location as any[]);

  const cimuCode = priority?.coding?.[0]?.code;

  return {
    id: resource.id || crypto.randomUUID(),
    patient_id: patientId,
    status: mapFHIRStatusToEncounter(resource.status as string),
    arrival_time: period?.start || new Date().toISOString(),
    discharge_time: period?.end,
    motif_sfmu: reasonCode?.text,
    cimu: cimuCode ? parseInt(cimuCode, 10) : undefined,
    location: location?.location?.display,
    discharge_destination: hospitalization?.dischargeDisposition?.text,
    provenance: 'import_fhir',
  };
}

function isVitalSignObservation(resource: FHIRResource): boolean {
  const categories = resource.category as any[];
  if (!categories) return false;
  return categories.some((cat: any) =>
    cat.coding?.some((c: any) => c.code === 'vital-signs')
  );
}

function groupVitalsFromObservations(
  observations: FHIRResource[],
  patientId: string,
  encounterId: string,
): CanonicalVitals[] {
  if (observations.length === 0) return [];

  // Group by effectiveDateTime (approximate)
  const groups = new Map<string, FHIRResource[]>();
  for (const obs of observations) {
    const dt = (obs.effectiveDateTime as string) || 'unknown';
    const key = dt.slice(0, 16); // Group by minute
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(obs);
  }

  return Array.from(groups.entries()).map(([timeKey, obsGroup]) => {
    const vitals: CanonicalVitals = {
      id: crypto.randomUUID(),
      patient_id: patientId,
      encounter_id: encounterId,
      recorded_at: obsGroup[0].effectiveDateTime as string || new Date().toISOString(),
      provenance: 'import_fhir',
    };

    for (const obs of obsGroup) {
      const code = extractCodeFromCoding(obs.code as any);
      const value = (obs.valueQuantity as any)?.value;
      if (value == null) continue;

      // Map LOINC codes back to vital fields
      switch (code) {
        case '8867-4': vitals.fc = value; break;           // Heart rate
        case '8480-6': vitals.pas = value; break;           // Systolic BP
        case '8462-4': vitals.pad = value; break;           // Diastolic BP
        case '2708-6': vitals.spo2 = value; break;          // SpO2
        case '8310-5': vitals.temperature = value; break;    // Temperature
        case '9279-1': vitals.fr = value; break;             // Respiratory rate
        case '9269-2': vitals.gcs = value; break;            // GCS
        case '38208-5': vitals.eva = value; break;           // Pain (EVA)
      }
    }

    return vitals;
  });
}

function fhirObservationToResult(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalResult {
  const category = getFirst(resource.category as any[]);
  const categoryCode = category?.coding?.[0]?.code;
  const code = resource.code as any;
  const interpretation = getFirst(resource.interpretation as any[]);

  let resultType: 'bio' | 'imagerie' | 'ecg' | 'autre' = 'bio';
  if (categoryCode === 'procedure') resultType = 'ecg';

  return {
    id: resource.id || crypto.randomUUID(),
    encounter_id: encounterId,
    patient_id: patientId,
    when_event: resource.effectiveDateTime as string,
    result_type: resultType,
    name: code?.text || code?.coding?.[0]?.display || '',
    code: code?.coding?.[0]?.code,
    value_numeric: (resource.valueQuantity as any)?.value,
    value_unit: (resource.valueQuantity as any)?.unit,
    value_text: resource.valueString as string,
    reference_range: getFirst(resource.referenceRange as any[])?.text,
    abnormal_flag: interpretation?.coding?.[0]?.code as any,
    provenance: 'import_fhir',
  };
}

function fhirDiagnosticReportToResult(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalResult {
  const code = resource.code as any;
  return {
    id: resource.id || crypto.randomUUID(),
    encounter_id: encounterId,
    patient_id: patientId,
    when_event: resource.effectiveDateTime as string,
    result_type: 'imagerie',
    name: code?.text || code?.coding?.[0]?.display || 'Imagerie',
    code: code?.coding?.[0]?.code,
    value_text: resource.conclusion as string,
    provenance: 'import_fhir',
  };
}

function fhirMedRequestToCanonical(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalPrescription {
  const medication = resource.medicationCodeableConcept as any;
  const dosage = getFirst(resource.dosageInstruction as any[]);
  const doseAndRate = getFirst(dosage?.doseAndRate);

  return {
    id: resource.id || crypto.randomUUID(),
    encounter_id: encounterId,
    patient_id: patientId,
    prescription_type: 'medicament',
    medication_name: medication?.text || medication?.coding?.[0]?.display || '',
    medication_atc_code: medication?.coding?.[0]?.code,
    dose_value: doseAndRate?.doseQuantity?.value,
    dose_unit: doseAndRate?.doseQuantity?.unit,
    dosage: dosage?.text,
    route: dosage?.route?.text,
    frequency: dosage?.timing?.code?.text,
    status: mapFHIRStatusToPrescription(resource.status as string),
    priority: (resource.priority as string) || 'routine',
    created_at: resource.authoredOn as string,
    provenance: 'import_fhir',
  };
}

function fhirServiceRequestToCanonical(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalPrescription {
  const code = resource.code as any;
  const category = getFirst(resource.category as any[]);
  const categoryCode = category?.coding?.[0]?.code;

  let prescriptionType: string = 'exam_autre';
  if (categoryCode === '108252007') prescriptionType = 'exam_bio';
  else if (categoryCode === '363679005') prescriptionType = 'exam_imagerie';

  return {
    id: resource.id || crypto.randomUUID(),
    encounter_id: encounterId,
    patient_id: patientId,
    prescription_type: prescriptionType as any,
    medication_name: code?.text || '',
    exam_list: code?.text ? code.text.split(', ') : [],
    exam_indication: getFirst(resource.reasonCode as any[])?.text,
    status: mapFHIRStatusToPrescription(resource.status as string),
    priority: (resource.priority as string) || 'routine',
    created_at: resource.authoredOn as string,
    provenance: 'import_fhir',
  };
}

function fhirAllergyToCanonical(resource: FHIRResource, patientId: string): CanonicalAllergy {
  const code = resource.code as any;
  const reaction = getFirst(resource.reaction as any[]);
  const clinicalStatus = resource.clinicalStatus as any;

  let severity: 'legere' | 'moderee' | 'severe' | 'inconnue' = 'inconnue';
  if (reaction?.severity === 'severe') severity = 'severe';
  else if (reaction?.severity === 'moderate') severity = 'moderee';
  else if (reaction?.severity === 'mild') severity = 'legere';

  return {
    id: resource.id || crypto.randomUUID(),
    patient_id: patientId,
    substance: code?.text || code?.coding?.[0]?.display || '',
    substance_code: code?.coding?.[0]?.code,
    reaction: reaction?.manifestation?.[0]?.text,
    severity,
    criticality: (resource.criticality as any) || 'unable-to-assess',
    status: clinicalStatus?.coding?.[0]?.code || 'active',
    provenance: 'import_fhir',
  };
}

function fhirConditionToCanonical(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalCondition {
  const code = resource.code as any;
  const category = getFirst(resource.category as any[]);
  const categoryCode = category?.coding?.[0]?.code;
  const clinicalStatus = resource.clinicalStatus as any;
  const verificationStatus = resource.verificationStatus as any;

  return {
    id: resource.id || crypto.randomUUID(),
    patient_id: patientId,
    encounter_id: encounterId,
    code_cim10: code?.coding?.find((c: any) => c.system?.includes('icd'))?.code,
    code_display: code?.text || code?.coding?.[0]?.display || '',
    category: categoryCode === 'problem-list-item' ? 'antecedent' : 'diagnostic_actuel',
    clinical_status: clinicalStatus?.coding?.[0]?.code,
    verification_status: verificationStatus?.coding?.[0]?.code,
    onset_date: resource.onsetDateTime as string,
    notes: getFirst(resource.note as any[])?.text,
    provenance: 'import_fhir',
  };
}

function fhirProcedureToCanonical(
  resource: FHIRResource,
  patientId: string,
  encounterId: string,
): CanonicalProcedure {
  const code = resource.code as any;
  const bodySite = getFirst(resource.bodySite as any[]);
  const performer = getFirst(resource.performer as any[]);

  return {
    id: resource.id || crypto.randomUUID(),
    encounter_id: encounterId,
    patient_id: patientId,
    procedure_type: code?.text || code?.coding?.[0]?.display || '',
    code: code?.coding?.[0]?.code,
    body_site: bodySite?.text,
    status: resource.status as string,
    when_event: resource.performedDateTime as string,
    performed_by: performer?.actor?.reference?.replace('Practitioner/', ''),
    notes: getFirst(resource.note as any[])?.text,
    provenance: 'import_fhir',
  };
}

// ── Helpers ──

function getFirst<T>(arr: T[] | undefined | null): T | undefined {
  return arr?.[0];
}

function extractTelecom(telecoms: any[] | undefined, system: string): string | undefined {
  return telecoms?.find((t: any) => t.system === system)?.value;
}

function extractAddress(addresses: any[] | undefined): string | undefined {
  const addr = addresses?.[0];
  if (!addr) return undefined;
  if (addr.text) return addr.text;
  return [addr.line?.join(' '), addr.postalCode, addr.city].filter(Boolean).join(', ');
}

function extractDisplay(ref: any): string | undefined {
  return ref?.display;
}

function extractCodeFromCoding(codeableConcept: any): string | undefined {
  return codeableConcept?.coding?.[0]?.code;
}

function mapFHIRStatusToEncounter(status: string): 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'finished' {
  switch (status) {
    case 'planned': return 'planned';
    case 'arrived': return 'arrived';
    case 'triaged': return 'triaged';
    case 'in-progress': return 'in-progress';
    case 'finished': case 'cancelled': case 'entered-in-error': return 'finished';
    default: return 'arrived';
  }
}

function mapFHIRStatusToPrescription(status: string): string {
  switch (status) {
    case 'draft': return 'draft';
    case 'active': return 'active';
    case 'completed': return 'completed';
    case 'cancelled': case 'entered-in-error': return 'cancelled';
    case 'on-hold': return 'suspended';
    default: return 'active';
  }
}

// ── JSON Import Utility ──

export function importFHIRFromJSON(jsonString: string): FHIRImportResult {
  try {
    const parsed = JSON.parse(jsonString);
    return importFHIRBundle(parsed as FHIRBundle);
  } catch (e) {
    return {
      success: false,
      errors: [`Erreur de parsing JSON: ${e instanceof Error ? e.message : 'format invalide'}`],
      warnings: [],
      resourceCounts: {},
    };
  }
}
