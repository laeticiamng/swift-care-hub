/**
 * FHIR R4 Resource Validator
 * --------------------------
 * Validates generated FHIR resources against R4 structural constraints.
 *
 * This is a lightweight, client-side validator that checks:
 *  - Required fields per resource type
 *  - Data type constraints (string, number, boolean, date formats)
 *  - Reference format validity
 *  - Bundle structure integrity
 *  - CodeableConcept / Coding structure
 *
 * It does NOT replace a full FHIR validation server (e.g. HAPI FHIR Validator)
 * but provides immediate feedback during resource construction.
 *
 * Supported resource types:
 *  Patient, Encounter, Observation, MedicationRequest, MedicationAdministration,
 *  ServiceRequest, Procedure, AllergyIntolerance, Condition, Composition,
 *  DiagnosticReport, Bundle
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

/** Severity of a validation issue */
export type ValidationSeverity = 'error' | 'warning';

/** Single validation issue */
export interface ValidationIssue {
  /** JSONPath-like path to the problematic field */
  path: string;
  /** Human-readable description of the issue */
  message: string;
  /** Severity level */
  severity: ValidationSeverity;
}

/** Validation result for a single resource or bundle */
export interface ValidationResult {
  /** Whether the resource passes all error-level checks */
  valid: boolean;
  /** List of all issues found (errors + warnings) */
  errors: ValidationIssue[];
}

// ────────────────────────────────────────────────────────────────
// Internal type alias
// ────────────────────────────────────────────────────────────────

type Resource = Record<string, unknown>;

// ────────────────────────────────────────────────────────────────
// Required fields per resource type
// ────────────────────────────────────────────────────────────────

/**
 * FHIR R4 required fields by resource type.
 * These are the mandatory (cardinality 1..1 or 1..*) elements.
 */
const REQUIRED_FIELDS: Record<string, string[]> = {
  Patient: ['resourceType'],
  Encounter: ['resourceType', 'status', 'class'],
  Observation: ['resourceType', 'status', 'code'],
  MedicationRequest: ['resourceType', 'status', 'intent', 'medicationCodeableConcept', 'subject'],
  MedicationAdministration: ['resourceType', 'status', 'medicationReference', 'subject'],
  ServiceRequest: ['resourceType', 'status', 'intent', 'subject'],
  Procedure: ['resourceType', 'status', 'subject'],
  AllergyIntolerance: ['resourceType', 'patient'],
  Condition: ['resourceType', 'subject'],
  Composition: ['resourceType', 'status', 'type', 'date', 'author', 'title'],
  DiagnosticReport: ['resourceType', 'status', 'code'],
  Bundle: ['resourceType', 'type'],
};

/**
 * Valid status values per resource type.
 */
const VALID_STATUSES: Record<string, string[]> = {
  Encounter: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown'],
  Observation: ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown'],
  MedicationRequest: ['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown'],
  MedicationAdministration: ['in-progress', 'not-done', 'on-hold', 'completed', 'entered-in-error', 'stopped', 'unknown'],
  ServiceRequest: ['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown'],
  Procedure: ['preparation', 'in-progress', 'not-done', 'on-hold', 'stopped', 'completed', 'entered-in-error', 'unknown'],
  Composition: ['preliminary', 'final', 'amended', 'entered-in-error'],
  DiagnosticReport: ['registered', 'partial', 'preliminary', 'final', 'amended', 'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown'],
};

/** Valid values for coded fields that are not simple status */
const VALID_CODED_FIELDS: Record<string, Record<string, string[]>> = {
  MedicationRequest: {
    intent: ['proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option'],
    priority: ['routine', 'urgent', 'asap', 'stat'],
  },
  ServiceRequest: {
    intent: ['proposal', 'plan', 'directive', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option'],
    priority: ['routine', 'urgent', 'asap', 'stat'],
  },
  AllergyIntolerance: {
    criticality: ['low', 'high', 'unable-to-assess'],
  },
  Patient: {
    gender: ['male', 'female', 'other', 'unknown'],
  },
};

/**
 * Valid Bundle types.
 */
const VALID_BUNDLE_TYPES = [
  'document', 'message', 'transaction', 'transaction-response',
  'batch', 'batch-response', 'history', 'searchset', 'collection',
];

// ────────────────────────────────────────────────────────────────
// Core Validation Logic
// ────────────────────────────────────────────────────────────────

/**
 * Validate a single FHIR R4 resource.
 *
 * Performs structural validation including:
 *  - resourceType presence and correctness
 *  - Required field presence
 *  - Status value validity
 *  - Reference format checking
 *  - Date/dateTime format checking
 *  - CodeableConcept / Coding structure
 *
 * @param resource - The FHIR resource to validate
 * @returns Validation result
 */
export function validateFHIRResource(resource: Resource): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ── Basic structure ──
  if (!resource || typeof resource !== 'object') {
    issues.push({
      path: '',
      message: 'Resource must be a non-null object',
      severity: 'error',
    });
    return { valid: false, errors: issues };
  }

  // resourceType check
  const resourceType = resource.resourceType as string | undefined;
  if (!resourceType || typeof resourceType !== 'string') {
    issues.push({
      path: 'resourceType',
      message: 'resourceType is required and must be a string',
      severity: 'error',
    });
    return { valid: false, errors: issues };
  }

  // Known resource type check
  const knownTypes = Object.keys(REQUIRED_FIELDS);
  if (!knownTypes.includes(resourceType)) {
    issues.push({
      path: 'resourceType',
      message: `Unknown resource type '${resourceType}'. Supported: ${knownTypes.join(', ')}`,
      severity: 'warning',
    });
  }

  // ── Required fields ──
  const requiredFields = REQUIRED_FIELDS[resourceType] || [];
  for (const field of requiredFields) {
    if (field === 'resourceType') continue; // Already checked above
    const value = resource[field];
    if (value === undefined || value === null) {
      issues.push({
        path: field,
        message: `Required field '${field}' is missing`,
        severity: 'error',
      });
    }
  }

  // ── Status validation ──
  if (resource.status !== undefined) {
    const validStatuses = VALID_STATUSES[resourceType];
    if (validStatuses && !validStatuses.includes(resource.status as string)) {
      issues.push({
        path: 'status',
        message: `Invalid status '${resource.status}'. Valid values: ${validStatuses.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // ── Coded field validation ──
  const codedFields = VALID_CODED_FIELDS[resourceType];
  if (codedFields) {
    for (const [field, validValues] of Object.entries(codedFields)) {
      if (resource[field] !== undefined) {
        const val = resource[field] as string;
        if (typeof val === 'string' && !validValues.includes(val)) {
          issues.push({
            path: field,
            message: `Invalid value '${val}' for ${resourceType}.${field}. Valid: ${validValues.join(', ')}`,
            severity: 'error',
          });
        }
      }
    }
  }

  // ── Type-specific validations ──
  switch (resourceType) {
    case 'Patient':
      validatePatient(resource, issues);
      break;
    case 'Encounter':
      validateEncounter(resource, issues);
      break;
    case 'Observation':
      validateObservation(resource, issues);
      break;
    case 'MedicationRequest':
      validateMedicationRequest(resource, issues);
      break;
    case 'MedicationAdministration':
      validateMedicationAdministration(resource, issues);
      break;
    case 'ServiceRequest':
      validateServiceRequest(resource, issues);
      break;
    case 'Procedure':
      validateProcedure(resource, issues);
      break;
    case 'AllergyIntolerance':
      validateAllergyIntolerance(resource, issues);
      break;
    case 'Condition':
      validateCondition(resource, issues);
      break;
    case 'Composition':
      validateComposition(resource, issues);
      break;
    case 'DiagnosticReport':
      validateDiagnosticReport(resource, issues);
      break;
  }

  // ── Common field validations ──
  validateCommonFields(resource, issues);

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    errors: issues,
  };
}

// ────────────────────────────────────────────────────────────────
// Bundle Validation
// ────────────────────────────────────────────────────────────────

/**
 * Validate a FHIR R4 Bundle resource.
 *
 * In addition to standard resource validation, checks:
 *  - Bundle type is valid
 *  - Each entry has a resource
 *  - Each entry's resource is individually valid
 *  - fullUrl format if present
 *  - Cross-entry reference resolution
 *
 * @param bundle - The FHIR Bundle to validate
 * @returns Validation result covering the bundle and all entries
 */
export function validateFHIRBundle(bundle: Resource): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ── Basic checks ──
  if (!bundle || typeof bundle !== 'object') {
    issues.push({ path: '', message: 'Bundle must be a non-null object', severity: 'error' });
    return { valid: false, errors: issues };
  }

  if (bundle.resourceType !== 'Bundle') {
    issues.push({
      path: 'resourceType',
      message: `Expected resourceType 'Bundle', got '${bundle.resourceType}'`,
      severity: 'error',
    });
  }

  // ── Bundle type ──
  const bundleType = bundle.type as string | undefined;
  if (!bundleType) {
    issues.push({ path: 'type', message: 'Bundle type is required', severity: 'error' });
  } else if (!VALID_BUNDLE_TYPES.includes(bundleType)) {
    issues.push({
      path: 'type',
      message: `Invalid bundle type '${bundleType}'. Valid: ${VALID_BUNDLE_TYPES.join(', ')}`,
      severity: 'error',
    });
  }

  // ── Timestamp ──
  if (bundle.timestamp !== undefined) {
    validateDateTime(bundle.timestamp as string, 'timestamp', issues);
  }

  // ── Entries ──
  const entries = bundle.entry;
  if (!entries) {
    issues.push({ path: 'entry', message: 'Bundle has no entries', severity: 'warning' });
    return { valid: !issues.some((i) => i.severity === 'error'), errors: issues };
  }

  if (!Array.isArray(entries)) {
    issues.push({ path: 'entry', message: 'Bundle.entry must be an array', severity: 'error' });
    return { valid: false, errors: issues };
  }

  if (entries.length === 0) {
    issues.push({ path: 'entry', message: 'Bundle has an empty entry array', severity: 'warning' });
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as Resource;
    const basePath = `entry[${i}]`;

    if (!entry || typeof entry !== 'object') {
      issues.push({ path: basePath, message: 'Entry must be a non-null object', severity: 'error' });
      continue;
    }

    // fullUrl format check
    if (entry.fullUrl !== undefined) {
      const fullUrl = entry.fullUrl as string;
      if (typeof fullUrl !== 'string' || fullUrl.trim() === '') {
        issues.push({
          path: `${basePath}.fullUrl`,
          message: 'fullUrl must be a non-empty string',
          severity: 'warning',
        });
      }
    }

    // Resource presence
    const entryResource = entry.resource as Resource | undefined;
    if (!entryResource) {
      issues.push({
        path: `${basePath}.resource`,
        message: 'Bundle entry is missing a resource',
        severity: 'error',
      });
      continue;
    }

    // Validate the individual resource
    const resourceResult = validateFHIRResource(entryResource);
    for (const issue of resourceResult.errors) {
      issues.push({
        path: `${basePath}.resource.${issue.path}`,
        message: `${(entryResource.resourceType as string) || 'Unknown'}: ${issue.message}`,
        severity: issue.severity,
      });
    }
  }

  // ── Cross-entry reference checks ──
  validateBundleReferences(entries as Resource[], issues);

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    errors: issues,
  };
}

// ────────────────────────────────────────────────────────────────
// Type-Specific Validators
// ────────────────────────────────────────────────────────────────

function validatePatient(resource: Resource, issues: ValidationIssue[]): void {
  // birthDate format
  if (resource.birthDate !== undefined) {
    validateDate(resource.birthDate as string, 'birthDate', issues);
  }

  // name array
  if (resource.name !== undefined) {
    if (!Array.isArray(resource.name)) {
      issues.push({ path: 'name', message: 'Patient.name must be an array', severity: 'error' });
    } else {
      for (let i = 0; i < (resource.name as unknown[]).length; i++) {
        const name = (resource.name as Resource[])[i];
        if (!name.family) {
          issues.push({
            path: `name[${i}].family`,
            message: 'Patient name should include family name',
            severity: 'warning',
          });
        }
        if (name.given !== undefined && !Array.isArray(name.given)) {
          issues.push({
            path: `name[${i}].given`,
            message: 'given must be an array of strings',
            severity: 'error',
          });
        }
      }
    }
  }

  // identifier
  if (resource.identifier !== undefined) {
    validateIdentifierArray(resource.identifier, 'identifier', issues);
  }

  // telecom
  if (resource.telecom !== undefined) {
    if (!Array.isArray(resource.telecom)) {
      issues.push({ path: 'telecom', message: 'Patient.telecom must be an array', severity: 'error' });
    }
  }
}

function validateEncounter(resource: Resource, issues: ValidationIssue[]): void {
  // class is required (FHIR R4)
  if (resource.class !== undefined) {
    const cls = resource.class as Resource;
    if (!cls.system || !cls.code) {
      issues.push({
        path: 'class',
        message: 'Encounter.class should have system and code',
        severity: 'warning',
      });
    }
  }

  // subject reference
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  // period
  if (resource.period !== undefined) {
    const period = resource.period as Resource;
    if (period.start !== undefined) validateDateTime(period.start as string, 'period.start', issues);
    if (period.end !== undefined) validateDateTime(period.end as string, 'period.end', issues);
    if (period.start && period.end) {
      const start = new Date(period.start as string);
      const end = new Date(period.end as string);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        issues.push({
          path: 'period',
          message: 'period.end must be after period.start',
          severity: 'error',
        });
      }
    }
  }

  // location
  if (resource.location !== undefined) {
    if (!Array.isArray(resource.location)) {
      issues.push({ path: 'location', message: 'Encounter.location must be an array', severity: 'error' });
    }
  }
}

function validateObservation(resource: Resource, issues: ValidationIssue[]): void {
  // code is required
  if (resource.code !== undefined) {
    validateCodeableConcept(resource.code as Resource, 'code', issues);
    // Check coding system presence
    const code = resource.code as Resource;
    if (code.coding && Array.isArray(code.coding)) {
      const codings = code.coding as Resource[];
      if (codings.length > 0 && !codings[0].system) {
        issues.push({
          path: 'code.coding[0].system',
          message: 'Observation code should have a coding system (e.g., LOINC)',
          severity: 'warning',
        });
      }
    }
  }

  // subject reference
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  // encounter reference
  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  // valueQuantity
  if (resource.valueQuantity !== undefined) {
    const q = resource.valueQuantity as Resource;
    if (q.value !== undefined && typeof q.value !== 'number') {
      issues.push({
        path: 'valueQuantity.value',
        message: 'valueQuantity.value must be a number',
        severity: 'error',
      });
    }
    if (q.unit === undefined && q.code === undefined) {
      issues.push({
        path: 'valueQuantity',
        message: 'valueQuantity should specify a unit or code',
        severity: 'warning',
      });
    }
  }

  // category
  if (resource.category !== undefined) {
    if (!Array.isArray(resource.category)) {
      issues.push({ path: 'category', message: 'Observation.category must be an array', severity: 'error' });
    }
  }

  // effectiveDateTime
  if (resource.effectiveDateTime !== undefined) {
    validateDateTime(resource.effectiveDateTime as string, 'effectiveDateTime', issues);
  }

  // Must have value[x] or dataAbsentReason (warn only)
  const hasValue = resource.valueQuantity !== undefined
    || resource.valueString !== undefined
    || resource.valueBoolean !== undefined
    || resource.valueInteger !== undefined
    || resource.valueCodeableConcept !== undefined;
  if (!hasValue && resource.dataAbsentReason === undefined && resource.component === undefined) {
    issues.push({
      path: '',
      message: 'Observation should have a value[x], dataAbsentReason, or component',
      severity: 'warning',
    });
  }
}

function validateMedicationRequest(resource: Resource, issues: ValidationIssue[]): void {
  // subject
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  // encounter
  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  // medicationCodeableConcept
  if (resource.medicationCodeableConcept !== undefined) {
    validateCodeableConcept(
      resource.medicationCodeableConcept as Resource,
      'medicationCodeableConcept',
      issues,
    );
  }

  // requester
  if (resource.requester !== undefined) {
    validateReference(resource.requester as Resource, 'requester', issues);
  }

  // authoredOn
  if (resource.authoredOn !== undefined) {
    validateDateTime(resource.authoredOn as string, 'authoredOn', issues);
  }

  // dosageInstruction
  if (resource.dosageInstruction !== undefined) {
    if (!Array.isArray(resource.dosageInstruction)) {
      issues.push({
        path: 'dosageInstruction',
        message: 'dosageInstruction must be an array',
        severity: 'error',
      });
    }
  }
}

function validateMedicationAdministration(resource: Resource, issues: ValidationIssue[]): void {
  // medicationReference
  if (resource.medicationReference !== undefined) {
    validateReference(resource.medicationReference as Resource, 'medicationReference', issues);
  }

  // subject
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  // context (encounter)
  if (resource.context !== undefined) {
    validateReference(resource.context as Resource, 'context', issues);
  }

  // effectiveDateTime
  if (resource.effectiveDateTime !== undefined) {
    validateDateTime(resource.effectiveDateTime as string, 'effectiveDateTime', issues);
  }

  // performer
  if (resource.performer !== undefined) {
    if (!Array.isArray(resource.performer)) {
      issues.push({
        path: 'performer',
        message: 'MedicationAdministration.performer must be an array',
        severity: 'error',
      });
    }
  }
}

function validateServiceRequest(resource: Resource, issues: ValidationIssue[]): void {
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  if (resource.requester !== undefined) {
    validateReference(resource.requester as Resource, 'requester', issues);
  }

  if (resource.authoredOn !== undefined) {
    validateDateTime(resource.authoredOn as string, 'authoredOn', issues);
  }

  if (resource.category !== undefined) {
    if (!Array.isArray(resource.category)) {
      issues.push({
        path: 'category',
        message: 'ServiceRequest.category must be an array',
        severity: 'error',
      });
    }
  }
}

function validateProcedure(resource: Resource, issues: ValidationIssue[]): void {
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  if (resource.performedDateTime !== undefined) {
    validateDateTime(resource.performedDateTime as string, 'performedDateTime', issues);
  }

  if (resource.code !== undefined) {
    validateCodeableConcept(resource.code as Resource, 'code', issues);
  }

  if (resource.bodySite !== undefined) {
    if (!Array.isArray(resource.bodySite)) {
      issues.push({
        path: 'bodySite',
        message: 'Procedure.bodySite must be an array',
        severity: 'error',
      });
    }
  }
}

function validateAllergyIntolerance(resource: Resource, issues: ValidationIssue[]): void {
  // patient is required
  if (resource.patient !== undefined) {
    validateReference(resource.patient as Resource, 'patient', issues);
  }

  // clinicalStatus
  if (resource.clinicalStatus !== undefined) {
    validateCodeableConcept(resource.clinicalStatus as Resource, 'clinicalStatus', issues);
  }

  // verificationStatus
  if (resource.verificationStatus !== undefined) {
    validateCodeableConcept(resource.verificationStatus as Resource, 'verificationStatus', issues);
  }

  // code
  if (resource.code !== undefined) {
    validateCodeableConcept(resource.code as Resource, 'code', issues);
  }

  // reaction array
  if (resource.reaction !== undefined) {
    if (!Array.isArray(resource.reaction)) {
      issues.push({ path: 'reaction', message: 'reaction must be an array', severity: 'error' });
    } else {
      for (let i = 0; i < (resource.reaction as unknown[]).length; i++) {
        const reaction = (resource.reaction as Resource[])[i];
        if (!reaction.manifestation || !Array.isArray(reaction.manifestation)) {
          issues.push({
            path: `reaction[${i}].manifestation`,
            message: 'Each reaction must have a manifestation array',
            severity: 'error',
          });
        }
        if (reaction.severity !== undefined) {
          const validSeverities = ['mild', 'moderate', 'severe'];
          if (!validSeverities.includes(reaction.severity as string)) {
            issues.push({
              path: `reaction[${i}].severity`,
              message: `Invalid severity '${reaction.severity}'. Valid: ${validSeverities.join(', ')}`,
              severity: 'error',
            });
          }
        }
      }
    }
  }
}

function validateCondition(resource: Resource, issues: ValidationIssue[]): void {
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  if (resource.clinicalStatus !== undefined) {
    validateCodeableConcept(resource.clinicalStatus as Resource, 'clinicalStatus', issues);
  }

  if (resource.verificationStatus !== undefined) {
    validateCodeableConcept(resource.verificationStatus as Resource, 'verificationStatus', issues);
  }

  if (resource.code !== undefined) {
    validateCodeableConcept(resource.code as Resource, 'code', issues);
  }

  if (resource.onsetDateTime !== undefined) {
    validateDateTime(resource.onsetDateTime as string, 'onsetDateTime', issues);
  }

  if (resource.category !== undefined) {
    if (!Array.isArray(resource.category)) {
      issues.push({
        path: 'category',
        message: 'Condition.category must be an array',
        severity: 'error',
      });
    }
  }
}

function validateComposition(resource: Resource, issues: ValidationIssue[]): void {
  // type is required
  if (resource.type !== undefined) {
    validateCodeableConcept(resource.type as Resource, 'type', issues);
  }

  // date
  if (resource.date !== undefined) {
    validateDateTime(resource.date as string, 'date', issues);
  }

  // subject
  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  // encounter
  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  // author is required (1..*)
  if (resource.author !== undefined) {
    if (!Array.isArray(resource.author)) {
      issues.push({
        path: 'author',
        message: 'Composition.author must be an array',
        severity: 'error',
      });
    } else if ((resource.author as unknown[]).length === 0) {
      issues.push({
        path: 'author',
        message: 'Composition.author must have at least one entry',
        severity: 'warning',
      });
    }
  }

  // title
  if (resource.title !== undefined && typeof resource.title !== 'string') {
    issues.push({
      path: 'title',
      message: 'Composition.title must be a string',
      severity: 'error',
    });
  }

  // section
  if (resource.section !== undefined) {
    if (!Array.isArray(resource.section)) {
      issues.push({
        path: 'section',
        message: 'Composition.section must be an array',
        severity: 'error',
      });
    } else {
      for (let i = 0; i < (resource.section as unknown[]).length; i++) {
        const section = (resource.section as Resource[])[i];
        if (!section.title && !section.code) {
          issues.push({
            path: `section[${i}]`,
            message: 'Section should have a title or code',
            severity: 'warning',
          });
        }
      }
    }
  }
}

function validateDiagnosticReport(resource: Resource, issues: ValidationIssue[]): void {
  if (resource.code !== undefined) {
    validateCodeableConcept(resource.code as Resource, 'code', issues);
  }

  if (resource.subject !== undefined) {
    validateReference(resource.subject as Resource, 'subject', issues);
  }

  if (resource.encounter !== undefined) {
    validateReference(resource.encounter as Resource, 'encounter', issues);
  }

  if (resource.effectiveDateTime !== undefined) {
    validateDateTime(resource.effectiveDateTime as string, 'effectiveDateTime', issues);
  }

  if (resource.category !== undefined) {
    if (!Array.isArray(resource.category)) {
      issues.push({
        path: 'category',
        message: 'DiagnosticReport.category must be an array',
        severity: 'error',
      });
    }
  }
}

// ────────────────────────────────────────────────────────────────
// Shared Validation Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Validate common fields found on most FHIR resources.
 */
function validateCommonFields(resource: Resource, issues: ValidationIssue[]): void {
  // id (if present, must be string without spaces)
  if (resource.id !== undefined) {
    if (typeof resource.id !== 'string') {
      issues.push({ path: 'id', message: 'Resource id must be a string', severity: 'error' });
    } else if ((resource.id as string).includes(' ')) {
      issues.push({ path: 'id', message: 'Resource id must not contain spaces', severity: 'error' });
    }
  }

  // meta.lastUpdated
  if (resource.meta !== undefined) {
    const meta = resource.meta as Resource;
    if (meta.lastUpdated !== undefined) {
      validateDateTime(meta.lastUpdated as string, 'meta.lastUpdated', issues);
    }
  }

  // note array
  if (resource.note !== undefined) {
    if (!Array.isArray(resource.note)) {
      issues.push({ path: 'note', message: 'note must be an array', severity: 'warning' });
    }
  }
}

/**
 * Validate a FHIR Reference object.
 */
function validateReference(ref: Resource, path: string, issues: ValidationIssue[]): void {
  if (!ref || typeof ref !== 'object') {
    issues.push({ path, message: `${path} must be a Reference object`, severity: 'error' });
    return;
  }

  // A reference must have at least a 'reference' or 'display' field
  if (!ref.reference && !ref.display && !ref.identifier) {
    issues.push({
      path,
      message: `${path}: Reference should have at least one of 'reference', 'display', or 'identifier'`,
      severity: 'warning',
    });
  }

  // If reference is present, check format: ResourceType/id or urn:uuid:...
  if (ref.reference !== undefined) {
    const refStr = ref.reference as string;
    if (typeof refStr !== 'string') {
      issues.push({ path: `${path}.reference`, message: 'reference must be a string', severity: 'error' });
    } else {
      const validRefPattern = /^(([A-Z][a-zA-Z]+\/[^\s]+)|(urn:uuid:[0-9a-fA-F-]+)|(urn:oid:[0-9.]+)|(https?:\/\/.+))$/;
      if (!validRefPattern.test(refStr)) {
        issues.push({
          path: `${path}.reference`,
          message: `Invalid reference format: '${refStr}'. Expected ResourceType/id, urn:uuid:..., or URL`,
          severity: 'warning',
        });
      }
    }
  }
}

/**
 * Validate a FHIR CodeableConcept.
 */
function validateCodeableConcept(cc: Resource, path: string, issues: ValidationIssue[]): void {
  if (!cc || typeof cc !== 'object') {
    issues.push({ path, message: `${path} must be a CodeableConcept object`, severity: 'error' });
    return;
  }

  // Should have at least text or coding
  if (!cc.text && !cc.coding) {
    issues.push({
      path,
      message: `${path}: CodeableConcept should have at least 'text' or 'coding'`,
      severity: 'warning',
    });
  }

  // Validate coding array
  if (cc.coding !== undefined) {
    if (!Array.isArray(cc.coding)) {
      issues.push({ path: `${path}.coding`, message: 'coding must be an array', severity: 'error' });
    } else {
      for (let i = 0; i < (cc.coding as unknown[]).length; i++) {
        const coding = (cc.coding as Resource[])[i];
        if (!coding.code && !coding.display) {
          issues.push({
            path: `${path}.coding[${i}]`,
            message: 'Coding should have at least a code or display',
            severity: 'warning',
          });
        }
      }
    }
  }
}

/**
 * Validate a FHIR identifier array.
 */
function validateIdentifierArray(identifiers: unknown, path: string, issues: ValidationIssue[]): void {
  if (!Array.isArray(identifiers)) {
    issues.push({ path, message: `${path} must be an array`, severity: 'error' });
    return;
  }

  for (let i = 0; i < identifiers.length; i++) {
    const id = identifiers[i] as Resource;
    if (!id.system && !id.value) {
      issues.push({
        path: `${path}[${i}]`,
        message: 'Identifier should have at least system or value',
        severity: 'warning',
      });
    }
  }
}

/**
 * Validate a FHIR date string (YYYY, YYYY-MM, or YYYY-MM-DD).
 */
function validateDate(value: string, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== 'string') {
    issues.push({ path, message: `${path} must be a string`, severity: 'error' });
    return;
  }

  const datePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;
  if (!datePattern.test(value)) {
    issues.push({
      path,
      message: `${path}: Invalid date format '${value}'. Expected YYYY, YYYY-MM, or YYYY-MM-DD`,
      severity: 'error',
    });
    return;
  }

  // If full date, validate it is a real date
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value + 'T00:00:00Z');
    if (isNaN(d.getTime())) {
      issues.push({ path, message: `${path}: Invalid date '${value}'`, severity: 'error' });
    }
  }
}

/**
 * Validate a FHIR dateTime string (ISO-8601).
 */
function validateDateTime(value: string, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== 'string') {
    issues.push({ path, message: `${path} must be a string`, severity: 'error' });
    return;
  }

  // Accept date-only or full ISO-8601 datetime
  const dateTimePattern = /^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?)?)?$/;
  if (!dateTimePattern.test(value)) {
    issues.push({
      path,
      message: `${path}: Invalid dateTime format '${value}'. Expected ISO-8601`,
      severity: 'warning',
    });
  }
}

/**
 * Check that references within a Bundle point to resources that exist in the bundle.
 * This is a best-effort cross-reference validation.
 */
function validateBundleReferences(entries: Resource[], issues: ValidationIssue[]): void {
  // Build a set of available resource references
  const availableRefs = new Set<string>();

  for (const entry of entries) {
    if (entry.fullUrl && typeof entry.fullUrl === 'string') {
      availableRefs.add(entry.fullUrl);
    }
    const res = entry.resource as Resource | undefined;
    if (res?.resourceType && res?.id) {
      availableRefs.add(`${res.resourceType}/${res.id}`);
    }
  }

  // Check references in each entry's resource
  for (let i = 0; i < entries.length; i++) {
    const res = entries[i].resource as Resource | undefined;
    if (!res) continue;

    const refs = extractReferences(res);
    for (const ref of refs) {
      // Skip external references
      if (ref.startsWith('http://') || ref.startsWith('https://')) continue;

      // Check if reference resolves within the bundle
      const resolved = availableRefs.has(ref) ||
        Array.from(availableRefs).some((available) => available.endsWith(ref));

      if (!resolved) {
        issues.push({
          path: `entry[${i}].resource`,
          message: `Unresolved internal reference: '${ref}'`,
          severity: 'warning',
        });
      }
    }
  }
}

/**
 * Recursively extract all reference strings from a FHIR resource.
 * Limited to a depth of 10 to prevent stack overflow on circular structures.
 */
function extractReferences(obj: unknown, depth: number = 0): string[] {
  if (depth > 10 || !obj || typeof obj !== 'object') return [];

  const refs: string[] = [];

  if (Array.isArray(obj)) {
    for (const item of obj) {
      refs.push(...extractReferences(item, depth + 1));
    }
  } else {
    const record = obj as Resource;
    if (record.reference && typeof record.reference === 'string') {
      refs.push(record.reference as string);
    }
    for (const value of Object.values(record)) {
      if (value && typeof value === 'object') {
        refs.push(...extractReferences(value, depth + 1));
      }
    }
  }

  return refs;
}

// ────────────────────────────────────────────────────────────────
// Convenience: Validate + summarize
// ────────────────────────────────────────────────────────────────

/**
 * Validate a resource and return a human-readable summary string.
 *
 * @param resource - FHIR resource to validate (handles both plain resources and Bundles)
 * @returns A formatted summary of the validation outcome
 */
export function validateAndSummarize(resource: Resource): string {
  const result = resource.resourceType === 'Bundle'
    ? validateFHIRBundle(resource)
    : validateFHIRResource(resource);

  const errorCount = result.errors.filter((e) => e.severity === 'error').length;
  const warningCount = result.errors.filter((e) => e.severity === 'warning').length;

  const lines: string[] = [];
  lines.push(`FHIR Validation: ${result.valid ? 'VALID' : 'INVALID'}`);
  lines.push(`  Errors: ${errorCount}, Warnings: ${warningCount}`);

  if (result.errors.length > 0) {
    lines.push('  Issues:');
    for (const issue of result.errors) {
      const prefix = issue.severity === 'error' ? 'ERR' : 'WRN';
      lines.push(`    [${prefix}] ${issue.path || '(root)'}: ${issue.message}`);
    }
  }

  return lines.join('\n');
}
