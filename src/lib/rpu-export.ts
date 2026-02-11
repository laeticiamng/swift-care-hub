/**
 * RPU Export — Format ATIH normalise
 * -----------------------------------
 * Generates RPU (Resume de Passage aux Urgences) conforming to ATIH specifications.
 *
 * The RPU is a mandatory administrative dataset that every French emergency
 * department must submit to the ATIH (Agence Technique de l'Information
 * sur l'Hospitalisation) for epidemiological surveillance and activity reporting.
 *
 * Output formats:
 *  - XML (single RPU, conforming to ATIH XSD)
 *  - CSV (batch export for bulk submission)
 *
 * References:
 *  - ATIH RPU specification v2023
 *  - Arrete du 24 juillet 2013 relatif au recueil et au traitement des donnees
 *  - Format XML RPU: https://www.atih.sante.fr
 */

import type {
  FullEncounterData,
  CanonicalPatient,
  CanonicalEncounter,
} from './interop/canonical-model';

import { ESTABLISHMENT } from './interop/coding-systems';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

/**
 * RPU record containing all ATIH-required fields.
 * Field names follow the ATIH nomenclature.
 */
export interface RPURecord {
  /** FINESS juridique de l'etablissement */
  finess: string;
  /** Date et heure d'entree (ISO-8601) */
  date_entree: string;
  /** Mode d'entree: 6=domicile, 7=mutation, 8=transfert */
  mode_entree: '6' | '7' | '8';
  /** Provenance: 1=MCO, 2=SSR, 3=SLD, 4=PSY, 5=domicile, 8=autre */
  provenance: '1' | '2' | '3' | '4' | '5' | '8';
  /** Transport: 1=personnel, 2=ambulance, 3=VSAV, 4=SMUR, 5=helicoptere, 8=autre */
  transport?: '1' | '2' | '3' | '4' | '5' | '8';
  /** Motif de recours (thesaurus SFMU) */
  motif_recours: string;
  /** Gravite: classification CCMU */
  gravite: string;
  /** Diagnostic principal CIM-10 */
  dp?: string;
  /** Diagnostic(s) associe(s) CIM-10 */
  da?: string[];
  /** Actes CCAM realises */
  actes_ccam?: string[];
  /** Date et heure de sortie (ISO-8601) */
  date_sortie?: string;
  /** Mode de sortie: 6=domicile, 7=mutation, 8=transfert, 9=deces */
  mode_sortie?: '6' | '7' | '8' | '9';
  /** Destination: 1=MCO, 2=SSR, 3=SLD, 4=PSY, 6=HAD, 7=domicile */
  destination?: '1' | '2' | '3' | '4' | '6' | '7';
  /** Orientation: UHCD, REA, SC, SI, CHIR, MED, OBST, HDJ, FUGUE, SCAM, PSA, REO */
  orientation?: string;
  /** Age du patient en annees */
  age: number;
  /** Sexe: M ou F */
  sexe: 'M' | 'F';
  /** Code postal de residence */
  cp?: string;
  /** Code commune INSEE */
  commune?: string;
  /** CIMU (1-5) */
  cimu?: number;
  /** GEMSA (1-6) */
  gemsa?: number;
  /** Numero de passage (identifiant unique) */
  numero_passage: string;
  /** Date de naissance (YYYY-MM-DD) */
  date_naissance: string;
}

/** Validation result for a single RPU record */
export interface RPUValidationResult {
  /** Whether the RPU passes all validation checks */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of non-blocking warnings */
  warnings: string[];
}

// ────────────────────────────────────────────────────────────────
// Mapping from canonical model to RPU
// ────────────────────────────────────────────────────────────────

/**
 * Map a CanonicalEncounter discharge destination to ATIH mode_sortie.
 */
function mapModeExit(destination?: string): '6' | '7' | '8' | '9' | undefined {
  if (!destination) return undefined;
  const mapping: Record<string, '6' | '7' | '8' | '9'> = {
    domicile: '6',
    hospitalisation_mco: '7',
    hospitalisation_ssr: '7',
    hospitalisation_psy: '7',
    uhcd: '7',
    transfert: '8',
    deces: '9',
    fugue: '6',
    sortie_insu: '6',
    hap: '7',
  };
  return mapping[destination] ?? '6';
}

/**
 * Map discharge destination to ATIH destination code.
 */
function mapDestination(destination?: string): '1' | '2' | '3' | '4' | '6' | '7' | undefined {
  if (!destination) return undefined;
  const mapping: Record<string, '1' | '2' | '3' | '4' | '6' | '7'> = {
    domicile: '7',
    hospitalisation_mco: '1',
    hospitalisation_ssr: '2',
    hospitalisation_psy: '4',
    uhcd: '1',
    transfert: '1',
    hap: '6',
    fugue: '7',
    sortie_insu: '7',
  };
  return mapping[destination] ?? '7';
}

/**
 * Calculate age in years from a birth date string and a reference date.
 */
function calculateAge(dateNaissance: string, referenceDate: string): number {
  const birth = new Date(dateNaissance);
  const ref = new Date(referenceDate);

  if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return 0;

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

// ────────────────────────────────────────────────────────────────
// Encounter → RPU
// ────────────────────────────────────────────────────────────────

/**
 * Convert a FullEncounterData (canonical model) into an RPURecord.
 *
 * Extracts all ATIH-required fields from the patient, encounter,
 * conditions, and procedures data.
 *
 * @param data - Complete encounter data from the canonical model
 * @returns RPU record ready for XML or CSV export
 */
export function encounterToRPU(data: FullEncounterData): RPURecord {
  const { patient, encounter, conditions, procedures } = data;

  // Extract CIM-10 diagnoses
  const confirmedConditions = conditions.filter(
    (c) => c.verification_status === 'confirmed' || c.verification_status === 'provisional'
  );
  const dp = confirmedConditions.find((c) => c.category === 'diagnostic_actuel')?.code_cim10;
  const da = confirmedConditions
    .filter((c) => c.code_cim10 && c.code_cim10 !== dp)
    .map((c) => c.code_cim10!)
    .filter(Boolean);

  // Extract CCAM procedure codes
  const actesCcam = procedures
    .filter((p) => p.code)
    .map((p) => p.code!)
    .filter(Boolean);

  const arrivalTime = encounter.when_event || encounter.arrival_time;
  const exitTime = encounter.discharge_at || encounter.discharge_time;

  return {
    finess: ESTABLISHMENT.finess,
    date_entree: arrivalTime,
    mode_entree: '6',                    // Default: from home
    provenance: '5',                     // Default: domicile
    motif_recours: encounter.motif_sfmu || encounter.motif || 'Non renseigne',
    gravite: encounter.ccmu ? String(encounter.ccmu) : '2',
    dp,
    da: da.length > 0 ? da : undefined,
    actes_ccam: actesCcam.length > 0 ? actesCcam : undefined,
    date_sortie: exitTime || undefined,
    mode_sortie: mapModeExit(encounter.discharge_destination),
    destination: mapDestination(encounter.discharge_destination),
    orientation: mapOrientation(encounter),
    age: calculateAge(patient.date_naissance, arrivalTime),
    sexe: patient.sexe,
    cp: extractPostalCode(patient),
    date_naissance: patient.date_naissance,
    cimu: encounter.cimu,
    gemsa: encounter.gemsa,
    numero_passage: encounter.id,
  };
}

/**
 * Map encounter orientation to ATIH orientation code.
 */
function mapOrientation(encounter: CanonicalEncounter): string | undefined {
  if (!encounter.orientation && !encounter.discharge_destination) return undefined;

  const orientation = encounter.orientation?.toUpperCase();
  const validOrientations = [
    'UHCD', 'REA', 'SC', 'SI', 'CHIR', 'MED', 'OBST',
    'HDJ', 'FUGUE', 'SCAM', 'PSA', 'REO',
  ];

  if (orientation && validOrientations.includes(orientation)) {
    return orientation;
  }

  // Infer from discharge destination
  const dest = encounter.discharge_destination;
  if (dest === 'uhcd') return 'UHCD';
  if (dest === 'hospitalisation_mco') return 'MED';
  if (dest === 'hospitalisation_psy') return 'PSA';
  if (dest === 'fugue') return 'FUGUE';

  return undefined;
}

/**
 * Extract postal code from patient address (best-effort parsing).
 */
function extractPostalCode(patient: CanonicalPatient): string | undefined {
  if (!patient.adresse) return undefined;
  const match = patient.adresse.match(/\b(\d{5})\b/);
  return match ? match[1] : undefined;
}

// ────────────────────────────────────────────────────────────────
// RPU → XML
// ────────────────────────────────────────────────────────────────

/**
 * Escape special XML characters.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create an XML element. Returns empty string for undefined values.
 */
function xmlElement(tag: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  return `    <${tag}>${escapeXml(String(value))}</${tag}>`;
}

/**
 * Generate an ATIH-conformant XML representation of a single RPU.
 *
 * The output XML follows the ATIH XSD schema for RPU submission.
 *
 * @param rpu - RPU record to serialize
 * @returns XML string
 */
export function rpuToXML(rpu: RPURecord): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<RPU xmlns="urn:fr:atih:rpu" version="2023">');
  lines.push(`  <PASSAGE id="${escapeXml(rpu.numero_passage)}">`);

  lines.push(xmlElement('FINESS', rpu.finess));
  lines.push(xmlElement('DATE_ENTREE', formatATIHDateTime(rpu.date_entree)));
  lines.push(xmlElement('MODE_ENTREE', rpu.mode_entree));
  lines.push(xmlElement('PROVENANCE', rpu.provenance));
  lines.push(xmlElement('TRANSPORT', rpu.transport));
  lines.push(xmlElement('DATE_NAISSANCE', formatATIHDate(rpu.date_naissance)));
  lines.push(xmlElement('SEXE', rpu.sexe));
  lines.push(xmlElement('CP', rpu.cp));
  lines.push(xmlElement('COMMUNE', rpu.commune));
  lines.push(xmlElement('MOTIF_RECOURS', rpu.motif_recours));
  lines.push(xmlElement('GRAVITE', rpu.gravite));
  lines.push(xmlElement('CIMU', rpu.cimu));
  lines.push(xmlElement('GEMSA', rpu.gemsa));
  lines.push(xmlElement('DP', rpu.dp));

  // Diagnostics associes
  if (rpu.da && rpu.da.length > 0) {
    for (const diag of rpu.da) {
      lines.push(xmlElement('DA', diag));
    }
  }

  // Actes CCAM
  if (rpu.actes_ccam && rpu.actes_ccam.length > 0) {
    for (const acte of rpu.actes_ccam) {
      lines.push(xmlElement('ACTE', acte));
    }
  }

  lines.push(xmlElement('DATE_SORTIE', rpu.date_sortie ? formatATIHDateTime(rpu.date_sortie) : undefined));
  lines.push(xmlElement('MODE_SORTIE', rpu.mode_sortie));
  lines.push(xmlElement('DESTINATION', rpu.destination));
  lines.push(xmlElement('ORIENTATION', rpu.orientation));

  lines.push('  </PASSAGE>');
  lines.push('</RPU>');

  // Filter out empty lines from undefined optional elements
  return lines.filter((l) => l.trim() !== '').join('\n');
}

/**
 * Format an ISO datetime string to ATIH format (YYYYMMDDHHMI).
 */
function formatATIHDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}`;
}

/**
 * Format an ISO date string to ATIH date format (YYYYMMDD).
 */
function formatATIHDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

// ────────────────────────────────────────────────────────────────
// Batch XML Export
// ────────────────────────────────────────────────────────────────

/**
 * Generate a single XML document containing multiple RPUs.
 *
 * @param rpus - Array of RPU records
 * @returns XML string containing all RPUs wrapped in a PASSAGES root element
 */
export function rpuBatchToXML(rpus: RPURecord[]): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(`<PASSAGES xmlns="urn:fr:atih:rpu" version="2023" finess="${escapeXml(ESTABLISHMENT.finess)}" count="${rpus.length}">`);

  for (const rpu of rpus) {
    lines.push(`  <PASSAGE id="${escapeXml(rpu.numero_passage)}">`);
    lines.push(xmlElement('FINESS', rpu.finess));
    lines.push(xmlElement('DATE_ENTREE', formatATIHDateTime(rpu.date_entree)));
    lines.push(xmlElement('MODE_ENTREE', rpu.mode_entree));
    lines.push(xmlElement('PROVENANCE', rpu.provenance));
    lines.push(xmlElement('TRANSPORT', rpu.transport));
    lines.push(xmlElement('DATE_NAISSANCE', formatATIHDate(rpu.date_naissance)));
    lines.push(xmlElement('SEXE', rpu.sexe));
    lines.push(xmlElement('CP', rpu.cp));
    lines.push(xmlElement('MOTIF_RECOURS', rpu.motif_recours));
    lines.push(xmlElement('GRAVITE', rpu.gravite));
    lines.push(xmlElement('CIMU', rpu.cimu));
    lines.push(xmlElement('GEMSA', rpu.gemsa));
    lines.push(xmlElement('DP', rpu.dp));

    if (rpu.da && rpu.da.length > 0) {
      for (const diag of rpu.da) {
        lines.push(xmlElement('DA', diag));
      }
    }

    if (rpu.actes_ccam && rpu.actes_ccam.length > 0) {
      for (const acte of rpu.actes_ccam) {
        lines.push(xmlElement('ACTE', acte));
      }
    }

    lines.push(xmlElement('DATE_SORTIE', rpu.date_sortie ? formatATIHDateTime(rpu.date_sortie) : undefined));
    lines.push(xmlElement('MODE_SORTIE', rpu.mode_sortie));
    lines.push(xmlElement('DESTINATION', rpu.destination));
    lines.push(xmlElement('ORIENTATION', rpu.orientation));
    lines.push('  </PASSAGE>');
  }

  lines.push('</PASSAGES>');

  return lines.filter((l) => l.trim() !== '').join('\n');
}

// ────────────────────────────────────────────────────────────────
// RPU → CSV
// ────────────────────────────────────────────────────────────────

/** CSV column headers matching ATIH specification */
const CSV_HEADERS = [
  'FINESS', 'NUMERO_PASSAGE', 'DATE_ENTREE', 'MODE_ENTREE', 'PROVENANCE',
  'TRANSPORT', 'DATE_NAISSANCE', 'SEXE', 'CP', 'COMMUNE',
  'MOTIF_RECOURS', 'GRAVITE', 'CIMU', 'GEMSA', 'DP', 'DA',
  'ACTES', 'DATE_SORTIE', 'MODE_SORTIE', 'DESTINATION', 'ORIENTATION',
] as const;

/**
 * Export an array of RPU records to CSV format.
 *
 * The CSV follows ATIH conventions:
 *  - Semicolon-separated (French convention)
 *  - UTF-8 encoding
 *  - First row is the header
 *  - Multi-value fields (DA, ACTES) are pipe-delimited within their cell
 *
 * @param rpus - Array of RPU records
 * @returns CSV string
 */
export function rpuToCSV(rpus: RPURecord[]): string {
  const lines: string[] = [];

  // Header
  lines.push(CSV_HEADERS.join(';'));

  // Data rows
  for (const rpu of rpus) {
    const row = [
      csvEscape(rpu.finess),
      csvEscape(rpu.numero_passage),
      formatATIHDateTime(rpu.date_entree),
      rpu.mode_entree,
      rpu.provenance,
      rpu.transport ?? '',
      formatATIHDate(rpu.date_naissance),
      rpu.sexe,
      rpu.cp ?? '',
      rpu.commune ?? '',
      csvEscape(rpu.motif_recours),
      rpu.gravite,
      rpu.cimu?.toString() ?? '',
      rpu.gemsa?.toString() ?? '',
      rpu.dp ?? '',
      rpu.da ? rpu.da.join('|') : '',
      rpu.actes_ccam ? rpu.actes_ccam.join('|') : '',
      rpu.date_sortie ? formatATIHDateTime(rpu.date_sortie) : '',
      rpu.mode_sortie ?? '',
      rpu.destination ?? '',
      rpu.orientation ?? '',
    ];
    lines.push(row.join(';'));
  }

  return lines.join('\n');
}

/**
 * Escape a value for CSV: wrap in quotes if it contains semicolons, quotes, or newlines.
 */
function csvEscape(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────

/**
 * Validate an RPU record against ATIH requirements.
 *
 * Checks:
 *  - All mandatory fields are present and non-empty
 *  - Date formats are parseable
 *  - Code values are within allowed ranges
 *  - Logical consistency (exit date > entry date, etc.)
 *
 * @param rpu - RPU record to validate
 * @returns Validation result with errors and warnings
 */
export function validateRPU(rpu: RPURecord): RPUValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Mandatory field checks ──

  if (!rpu.finess || rpu.finess.length !== 9) {
    errors.push('FINESS: doit contenir exactement 9 caracteres');
  }

  if (!rpu.date_entree) {
    errors.push('DATE_ENTREE: champ obligatoire manquant');
  } else if (isNaN(new Date(rpu.date_entree).getTime())) {
    errors.push('DATE_ENTREE: format de date invalide');
  }

  if (!rpu.numero_passage) {
    errors.push('NUMERO_PASSAGE: champ obligatoire manquant');
  }

  if (!rpu.date_naissance) {
    errors.push('DATE_NAISSANCE: champ obligatoire manquant');
  } else if (isNaN(new Date(rpu.date_naissance).getTime())) {
    errors.push('DATE_NAISSANCE: format de date invalide');
  }

  if (!rpu.sexe || (rpu.sexe !== 'M' && rpu.sexe !== 'F')) {
    errors.push('SEXE: doit etre M ou F');
  }

  if (!['6', '7', '8'].includes(rpu.mode_entree)) {
    errors.push(`MODE_ENTREE: valeur invalide '${rpu.mode_entree}' (attendu 6, 7 ou 8)`);
  }

  if (!['1', '2', '3', '4', '5', '8'].includes(rpu.provenance)) {
    errors.push(`PROVENANCE: valeur invalide '${rpu.provenance}' (attendu 1-5 ou 8)`);
  }

  if (!rpu.motif_recours || rpu.motif_recours.trim() === '') {
    errors.push('MOTIF_RECOURS: champ obligatoire manquant');
  }

  if (!rpu.gravite) {
    errors.push('GRAVITE (CCMU): champ obligatoire manquant');
  }

  // ── Optional field value checks ──

  if (rpu.mode_sortie && !['6', '7', '8', '9'].includes(rpu.mode_sortie)) {
    errors.push(`MODE_SORTIE: valeur invalide '${rpu.mode_sortie}' (attendu 6, 7, 8 ou 9)`);
  }

  if (rpu.destination && !['1', '2', '3', '4', '6', '7'].includes(rpu.destination)) {
    errors.push(`DESTINATION: valeur invalide '${rpu.destination}' (attendu 1-4, 6 ou 7)`);
  }

  if (rpu.cimu !== undefined && (rpu.cimu < 1 || rpu.cimu > 5)) {
    errors.push(`CIMU: valeur invalide ${rpu.cimu} (attendu 1-5)`);
  }

  if (rpu.gemsa !== undefined && (rpu.gemsa < 1 || rpu.gemsa > 6)) {
    errors.push(`GEMSA: valeur invalide ${rpu.gemsa} (attendu 1-6)`);
  }

  if (rpu.age < 0 || rpu.age > 150) {
    errors.push(`AGE: valeur incoherente ${rpu.age}`);
  }

  if (rpu.cp && !/^\d{5}$/.test(rpu.cp)) {
    warnings.push(`CP: format inhabituel '${rpu.cp}' (attendu 5 chiffres)`);
  }

  // ── CIM-10 format checks ──

  if (rpu.dp && !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(rpu.dp)) {
    warnings.push(`DP: format CIM-10 inhabituel '${rpu.dp}'`);
  }

  if (rpu.da) {
    for (const diag of rpu.da) {
      if (!/^[A-Z]\d{2}(\.\d{1,2})?$/.test(diag)) {
        warnings.push(`DA: format CIM-10 inhabituel '${diag}'`);
      }
    }
  }

  // ── Logical consistency checks ──

  if (rpu.date_entree && rpu.date_sortie) {
    const entree = new Date(rpu.date_entree);
    const sortie = new Date(rpu.date_sortie);
    if (sortie < entree) {
      errors.push('DATE_SORTIE anterieure a DATE_ENTREE');
    }
    // Warn if stay exceeds 72 hours (unusual for ED)
    const stayHours = (sortie.getTime() - entree.getTime()) / (1000 * 60 * 60);
    if (stayHours > 72) {
      warnings.push(`Duree de passage superieure a 72h (${Math.round(stayHours)}h)`);
    }
  }

  // Warn if discharge fields are inconsistent
  if (rpu.date_sortie && !rpu.mode_sortie) {
    warnings.push('DATE_SORTIE present sans MODE_SORTIE');
  }
  if (rpu.mode_sortie && !rpu.date_sortie) {
    warnings.push('MODE_SORTIE present sans DATE_SORTIE');
  }

  // Warn if no DP at discharge
  if (rpu.date_sortie && !rpu.dp) {
    warnings.push('Pas de diagnostic principal (DP) alors que le patient est sorti');
  }

  // Transport should be present for mode_entree = 6
  if (rpu.mode_entree === '6' && !rpu.transport) {
    warnings.push('TRANSPORT non renseigne pour un patient venant du domicile');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ────────────────────────────────────────────────────────────────
// Batch Validation
// ────────────────────────────────────────────────────────────────

/**
 * Validate an array of RPU records and return a summary.
 *
 * @param rpus - Array of RPU records to validate
 * @returns Summary with per-record results and aggregate counts
 */
export function validateRPUBatch(rpus: RPURecord[]): {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  totalErrors: number;
  totalWarnings: number;
  details: Array<{ numero_passage: string; result: RPUValidationResult }>;
} {
  const details = rpus.map((rpu) => ({
    numero_passage: rpu.numero_passage,
    result: validateRPU(rpu),
  }));

  return {
    totalRecords: rpus.length,
    validRecords: details.filter((d) => d.result.valid).length,
    invalidRecords: details.filter((d) => !d.result.valid).length,
    totalErrors: details.reduce((acc, d) => acc + d.result.errors.length, 0),
    totalWarnings: details.reduce((acc, d) => acc + d.result.warnings.length, 0),
    details,
  };
}
