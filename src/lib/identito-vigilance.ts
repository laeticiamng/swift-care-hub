/**
 * Identito-vigilance — Module de sécurité d'identification patient
 * ----------------------------------------------------------------
 * Implements the French ANS (Agence du Numérique en Santé) identity
 * verification requirements for patient safety in emergency departments.
 *
 * Features:
 *  - INS identity cross-validation (traits stricts)
 *  - Identity threat level assessment
 *  - Bracelet/wristband verification workflow
 *  - Doublon detection (extended homonymy)
 *  - Identity qualification status tracking
 *  - Audit trail for identity verifications
 *
 * References:
 *  - Référentiel National d'Identitovigilance (RNIV) 2021
 *  - ANS Guide d'implémentation INS
 *  - SFMU Recommandations identitovigilance aux urgences 2019
 */

import type { CanonicalPatient } from './interop/canonical-model';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type IdentityStatus =
  | 'provisoire'       // Identity collected but not verified
  | 'recueillie'       // Identity collected from official document
  | 'qualifiee'        // Identity qualified via INS teleservice
  | 'validee'          // Identity validated (INS + official document match)
  | 'douteuse'         // Identity suspected incorrect
  | 'fictive';         // Temporary identity (unconscious patient, NNO)

export type IdentityThreatLevel =
  | 'aucun'     // No threat detected
  | 'faible'    // Minor inconsistency
  | 'modere'    // Possible identity issue
  | 'eleve'     // High risk of identity error
  | 'critique';  // Critical — wrong patient alert

export interface IdentityVerification {
  /** Patient ID */
  patientId: string;
  /** Current identity status */
  status: IdentityStatus;
  /** Threat level */
  threatLevel: IdentityThreatLevel;
  /** Verification checks performed */
  checks: IdentityCheck[];
  /** Overall score (0-100) */
  score: number;
  /** Recommended actions */
  actions: string[];
  /** Timestamp */
  verifiedAt: string;
  /** Verifier */
  verifiedBy?: string;
}

export interface IdentityCheck {
  /** Check name */
  name: string;
  /** Passed */
  passed: boolean;
  /** Details */
  detail: string;
  /** Severity if failed */
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface WristbandData {
  /** Patient full name */
  nom: string;
  prenom: string;
  /** Date of birth */
  dateNaissance: string;
  /** Sex */
  sexe: 'M' | 'F';
  /** IPP or encounter number */
  identifiant: string;
  /** Barcode content (IPP) */
  barcode: string;
  /** Allergies (if critical) */
  allergiesCritiques?: string[];
}

export interface IdentityAuditEntry {
  timestamp: string;
  action: 'verification' | 'qualification' | 'correction' | 'fusion' | 'alert';
  patientId: string;
  performedBy: string;
  previousStatus?: IdentityStatus;
  newStatus: IdentityStatus;
  details: string;
}

// ────────────────────────────────────────────────────────────────
// Traits stricts (ANS RNIV)
// ────────────────────────────────────────────────────────────────

export interface TraitsStricts {
  nomNaissance: string;    // Nom de naissance (état civil)
  premierPrenom: string;   // 1er prénom de l'acte de naissance
  dateNaissance: string;   // Date de naissance (YYYY-MM-DD)
  sexe: 'M' | 'F';        // Sexe
}

export interface TraitsComplementaires {
  lieuNaissance?: string;   // Code INSEE commune de naissance
  prenomUsuel?: string;     // Prénom usuel si différent
  nomUsuel?: string;        // Nom d'usage (marital, etc.)
}

// ────────────────────────────────────────────────────────────────
// Core Identity Verification
// ────────────────────────────────────────────────────────────────

/**
 * Perform comprehensive identity verification for a patient.
 * Returns a structured report with all checks, score, and recommended actions.
 */
export function verifyIdentity(
  patient: CanonicalPatient,
  insTraits?: TraitsStricts,
): IdentityVerification {
  const checks: IdentityCheck[] = [];
  let score = 0;
  const actions: string[] = [];

  // Check 1: Nom present and valid
  checks.push(checkNomPresent(patient));
  if (patient.nom && patient.nom.length >= 2) score += 10;

  // Check 2: Prenom present and valid
  checks.push(checkPrenomPresent(patient));
  if (patient.prenom && patient.prenom.length >= 2) score += 10;

  // Check 3: Date de naissance valid
  checks.push(checkDateNaissance(patient));
  if (patient.date_naissance && isValidDate(patient.date_naissance)) score += 10;

  // Check 4: Sexe valid
  checks.push(checkSexe(patient));
  if (patient.sexe === 'M' || patient.sexe === 'F') score += 5;

  // Check 5: INS present
  const insCheck = checkINS(patient);
  checks.push(insCheck);
  if (insCheck.passed) score += 20;

  // Check 6: INS qualification status
  const qualCheck = checkINSQualification(patient);
  checks.push(qualCheck);
  if (qualCheck.passed) score += 15;

  // Check 7: IPP present
  checks.push(checkIPP(patient));
  if (patient.ipp) score += 10;

  // Check 8: Cross-validate with INS traits stricts
  if (insTraits) {
    const traitChecks = crossValidateTraitsStricts(patient, insTraits);
    checks.push(...traitChecks);
    const passedTraits = traitChecks.filter(c => c.passed).length;
    score += passedTraits * 5;
  } else {
    score += 0;
    actions.push('Vérifier l\'identité via le téléservice INSi');
  }

  // Check 9: Name format (uppercase, no special chars)
  checks.push(checkNameFormat(patient));

  // Determine status
  let status: IdentityStatus = 'provisoire';
  if (score >= 90) status = 'validee';
  else if (score >= 70) status = 'qualifiee';
  else if (score >= 40) status = 'recueillie';
  else if (score < 20) status = 'douteuse';

  // Determine threat level
  const failedCritical = checks.filter(c => !c.passed && c.severity === 'critical');
  const failedError = checks.filter(c => !c.passed && c.severity === 'error');
  const failedWarning = checks.filter(c => !c.passed && c.severity === 'warning');

  let threatLevel: IdentityThreatLevel = 'aucun';
  if (failedCritical.length > 0) threatLevel = 'critique';
  else if (failedError.length >= 2) threatLevel = 'eleve';
  else if (failedError.length > 0) threatLevel = 'modere';
  else if (failedWarning.length > 0) threatLevel = 'faible';

  // Generate actions
  if (!patient.ins_numero) {
    actions.push('Interroger le téléservice INSi pour récupérer l\'INS');
  }
  if (patient.ins_status !== 'qualifie') {
    actions.push('Qualifier l\'INS via pièce d\'identité officielle');
  }
  if (failedCritical.length > 0) {
    actions.push('URGENT: Vérifier l\'identité du patient — risque d\'erreur d\'identité');
  }
  if (!patient.ipp) {
    actions.push('Attribuer un IPP au patient');
  }

  return {
    patientId: patient.id,
    status,
    threatLevel,
    checks,
    score: Math.min(score, 100),
    actions,
    verifiedAt: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────────
// Individual Checks
// ────────────────────────────────────────────────────────────────

function checkNomPresent(p: CanonicalPatient): IdentityCheck {
  if (!p.nom || p.nom.trim().length === 0) {
    return { name: 'NOM_PRESENT', passed: false, detail: 'Nom manquant', severity: 'critical' };
  }
  if (p.nom.trim().length < 2) {
    return { name: 'NOM_PRESENT', passed: false, detail: 'Nom trop court (< 2 caractères)', severity: 'error' };
  }
  return { name: 'NOM_PRESENT', passed: true, detail: `Nom: ${p.nom}`, severity: 'info' };
}

function checkPrenomPresent(p: CanonicalPatient): IdentityCheck {
  if (!p.prenom || p.prenom.trim().length === 0) {
    return { name: 'PRENOM_PRESENT', passed: false, detail: 'Prénom manquant', severity: 'critical' };
  }
  return { name: 'PRENOM_PRESENT', passed: true, detail: `Prénom: ${p.prenom}`, severity: 'info' };
}

function checkDateNaissance(p: CanonicalPatient): IdentityCheck {
  if (!p.date_naissance) {
    return { name: 'DDN_VALIDE', passed: false, detail: 'Date de naissance manquante', severity: 'critical' };
  }
  if (!isValidDate(p.date_naissance)) {
    return { name: 'DDN_VALIDE', passed: false, detail: 'Date de naissance invalide', severity: 'error' };
  }
  // Check not in the future
  if (new Date(p.date_naissance) > new Date()) {
    return { name: 'DDN_VALIDE', passed: false, detail: 'Date de naissance dans le futur', severity: 'error' };
  }
  // Check not unrealistically old
  const age = calculateAge(p.date_naissance);
  if (age > 130) {
    return { name: 'DDN_VALIDE', passed: false, detail: `Âge irréaliste: ${age} ans`, severity: 'error' };
  }
  return { name: 'DDN_VALIDE', passed: true, detail: `DDN: ${p.date_naissance} (${age} ans)`, severity: 'info' };
}

function checkSexe(p: CanonicalPatient): IdentityCheck {
  if (!p.sexe || !['M', 'F'].includes(p.sexe)) {
    return { name: 'SEXE_VALIDE', passed: false, detail: 'Sexe non renseigné ou invalide', severity: 'error' };
  }
  return { name: 'SEXE_VALIDE', passed: true, detail: `Sexe: ${p.sexe}`, severity: 'info' };
}

function checkINS(p: CanonicalPatient): IdentityCheck {
  if (!p.ins_numero) {
    return { name: 'INS_PRESENT', passed: false, detail: 'Matricule INS non renseigné', severity: 'warning' };
  }
  // Basic format check (15 digits for NIR/NIA)
  const cleaned = p.ins_numero.replace(/\s/g, '');
  if (!/^\d{13}\d{2}$/.test(cleaned) && !/^[12]\d{14}$/.test(cleaned)) {
    return { name: 'INS_PRESENT', passed: false, detail: 'Format INS invalide', severity: 'error' };
  }
  return { name: 'INS_PRESENT', passed: true, detail: `INS: ${p.ins_numero}`, severity: 'info' };
}

function checkINSQualification(p: CanonicalPatient): IdentityCheck {
  if (p.ins_status === 'qualifie') {
    return { name: 'INS_QUALIFIE', passed: true, detail: 'INS qualifié', severity: 'info' };
  }
  if (p.ins_status === 'provisoire') {
    return { name: 'INS_QUALIFIE', passed: false, detail: 'INS provisoire — qualification requise', severity: 'warning' };
  }
  if (p.ins_status === 'invalide') {
    return { name: 'INS_QUALIFIE', passed: false, detail: 'INS invalide', severity: 'error' };
  }
  return { name: 'INS_QUALIFIE', passed: false, detail: 'Statut INS non renseigné', severity: 'warning' };
}

function checkIPP(p: CanonicalPatient): IdentityCheck {
  if (!p.ipp) {
    return { name: 'IPP_PRESENT', passed: false, detail: 'IPP non attribué', severity: 'warning' };
  }
  return { name: 'IPP_PRESENT', passed: true, detail: `IPP: ${p.ipp}`, severity: 'info' };
}

function checkNameFormat(p: CanonicalPatient): IdentityCheck {
  if (!p.nom) {
    return { name: 'FORMAT_NOM', passed: false, detail: 'Nom manquant', severity: 'error' };
  }
  // RNIV: nom de naissance en majuscules
  if (p.nom !== p.nom.toUpperCase()) {
    return { name: 'FORMAT_NOM', passed: false, detail: 'Le nom doit être en majuscules (norme RNIV)', severity: 'warning' };
  }
  // Check for suspicious characters
  if (/[0-9]/.test(p.nom)) {
    return { name: 'FORMAT_NOM', passed: false, detail: 'Le nom contient des chiffres', severity: 'error' };
  }
  return { name: 'FORMAT_NOM', passed: true, detail: 'Format nom conforme RNIV', severity: 'info' };
}

// ────────────────────────────────────────────────────────────────
// Cross-validation with INS traits stricts
// ────────────────────────────────────────────────────────────────

/**
 * Cross-validate patient data against INS teleservice response (traits stricts).
 * This is a critical safety check to prevent identity errors.
 */
export function crossValidateTraitsStricts(
  patient: CanonicalPatient,
  insTraits: TraitsStricts,
): IdentityCheck[] {
  const checks: IdentityCheck[] = [];

  // Compare nom de naissance
  const nomMatch = normalizeForComparison(patient.nom) === normalizeForComparison(insTraits.nomNaissance);
  checks.push({
    name: 'TRAIT_NOM',
    passed: nomMatch,
    detail: nomMatch
      ? 'Nom concordant avec INS'
      : `Discordance nom: dossier="${patient.nom}" vs INS="${insTraits.nomNaissance}"`,
    severity: nomMatch ? 'info' : 'critical',
  });

  // Compare premier prénom
  const prenomMatch = normalizeForComparison(patient.prenom) === normalizeForComparison(insTraits.premierPrenom);
  checks.push({
    name: 'TRAIT_PRENOM',
    passed: prenomMatch,
    detail: prenomMatch
      ? 'Prénom concordant avec INS'
      : `Discordance prénom: dossier="${patient.prenom}" vs INS="${insTraits.premierPrenom}"`,
    severity: prenomMatch ? 'info' : 'critical',
  });

  // Compare date de naissance
  const ddnMatch = patient.date_naissance === insTraits.dateNaissance;
  checks.push({
    name: 'TRAIT_DDN',
    passed: ddnMatch,
    detail: ddnMatch
      ? 'Date de naissance concordante'
      : `Discordance DDN: dossier="${patient.date_naissance}" vs INS="${insTraits.dateNaissance}"`,
    severity: ddnMatch ? 'info' : 'critical',
  });

  // Compare sexe
  const sexeMatch = patient.sexe === insTraits.sexe;
  checks.push({
    name: 'TRAIT_SEXE',
    passed: sexeMatch,
    detail: sexeMatch
      ? 'Sexe concordant'
      : `Discordance sexe: dossier="${patient.sexe}" vs INS="${insTraits.sexe}"`,
    severity: sexeMatch ? 'info' : 'error',
  });

  return checks;
}

// ────────────────────────────────────────────────────────────────
// Wristband Generation
// ────────────────────────────────────────────────────────────────

/**
 * Generate wristband/bracelet data for patient identification.
 * Includes critical allergies for safety.
 */
export function generateWristbandData(
  patient: CanonicalPatient,
  criticalAllergies?: string[],
): WristbandData {
  return {
    nom: patient.nom,
    prenom: patient.prenom,
    dateNaissance: patient.date_naissance,
    sexe: patient.sexe,
    identifiant: patient.ipp || patient.id,
    barcode: patient.ipp || patient.id,
    allergiesCritiques: criticalAllergies,
  };
}

/**
 * Format wristband data for printing (ZPL-like label format).
 * Returns a text representation suitable for label printers.
 */
export function formatWristbandLabel(data: WristbandData): string {
  const lines: string[] = [
    `${data.nom} ${data.prenom}`,
    `DDN: ${data.dateNaissance} — ${data.sexe}`,
    `ID: ${data.identifiant}`,
  ];

  if (data.allergiesCritiques && data.allergiesCritiques.length > 0) {
    lines.push(`⚠ ALLERGIES: ${data.allergiesCritiques.join(', ')}`);
  }

  return lines.join('\n');
}

// ────────────────────────────────────────────────────────────────
// NNO (Numéro Nominatif de remplacement pour patient non identifié)
// ────────────────────────────────────────────────────────────────

let _nnoCounter = 0;

/**
 * Generate a temporary NNO identity for unidentified patients
 * (unconscious, NNO procedure per RNIV).
 */
export function generateNNOIdentity(
  sexeEstime?: 'M' | 'F',
  ageEstime?: number,
): CanonicalPatient {
  _nnoCounter++;
  const timestamp = Date.now();
  const nnoId = `NNO-${timestamp}-${_nnoCounter}`;

  return {
    id: nnoId,
    nom: 'INCONNU',
    prenom: `NNO-${timestamp.toString(36).toUpperCase()}`,
    date_naissance: ageEstime
      ? estimateBirthDate(ageEstime)
      : '1900-01-01',
    sexe: sexeEstime || 'M',
    ins_status: 'invalide',
    provenance: 'saisie_humaine',
  };
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function normalizeForComparison(str: string): string {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
    .replace(/[-'\s]/g, '')           // Remove hyphens, apostrophes, spaces
    .trim();
}

function isValidDate(dateStr: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function calculateAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function estimateBirthDate(ageEstime: number): string {
  const now = new Date();
  const year = now.getFullYear() - ageEstime;
  return `${year}-01-01`;
}
