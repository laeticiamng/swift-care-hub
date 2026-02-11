/**
 * INS Teleservice Integration (simulation for prototype)
 * -------------------------------------------------------
 * Validates and qualifies patient identity via INS (Identite Nationale de Sante).
 *
 * In production this module would call the real INS teleservice (SOAP/REST).
 * For prototype purposes we simulate the call with deterministic logic
 * and realistic latency.
 *
 * References:
 *  - Referentiel INS (ANS) v1.6
 *  - NIR structure: 1 sexe + 2 annee + 2 mois + 2 departement + 3 commune + 3 ordre + 2 cle
 *  - Luhn-like key algorithm: cle = 97 - (NIR_13 mod 97)
 */

import { auditService } from './audit-service';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

/** Status of an INS identity */
export type INSStatus = 'provisoire' | 'qualifie' | 'invalide';

/** Result returned by the INS qualification process */
export interface INSValidationResult {
  /** Qualification status of the identity */
  status: INSStatus;
  /** The 15-digit NIR (13 digits + 2-digit key) */
  ins_numero: string;
  /** Nom de naissance (birth name, uppercase, no accents) */
  nom_naissance: string;
  /** Prenoms (all first names, space-separated) */
  prenoms: string;
  /** Date de naissance ISO-8601 (YYYY-MM-DD) */
  date_naissance: string;
  /** Sexe administratif */
  sexe: 'M' | 'F';
  /** Confidence score 0-100, reflects matching strength */
  confidence: number;
  /** ISO timestamp of the qualification */
  validated_at: string;
}

/** Format-validation result */
export interface INSFormatResult {
  /** Whether the format is valid */
  valid: boolean;
  /** Human-readable error when invalid */
  error?: string;
}

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

/** Valid department codes (metropolitan + overseas) */
const VALID_DEPT_PREFIXES = new Set([
  ...Array.from({ length: 95 }, (_, i) => String(i + 1).padStart(2, '0')),
  '97', '98', '99',           // DOM-TOM & temporaires
  '2A', '2B',                 // Corse
]);

/** Minimum simulated latency (ms) for the teleservice call */
const SIMULATED_LATENCY_MIN = 120;
/** Maximum simulated latency (ms) for the teleservice call */
const SIMULATED_LATENCY_MAX = 350;

// ────────────────────────────────────────────────────────────────
// NIR Key Calculation
// ────────────────────────────────────────────────────────────────

/**
 * Calculate the NIR control key (cle de controle).
 *
 * The key is: `97 - (NIR_13 mod 97)`.
 *
 * For Corsican departments (2A, 2B) the letters are replaced
 * by numeric values before computing the modulus:
 *   - 2A -> subtract 1000000 from the numeric value
 *   - 2B -> subtract 2000000 from the numeric value
 *
 * @param nir - The first 13 characters of the NIR
 * @returns The 2-digit key (0-96)
 * @throws Error if the NIR is not exactly 13 characters
 */
export function calculateNIRKey(nir: string): number {
  if (nir.length !== 13) {
    throw new Error(`NIR doit contenir exactement 13 caracteres, recu: ${nir.length}`);
  }

  let numericValue: bigint;

  // Handle Corsican department codes
  const upperNir = nir.toUpperCase();
  if (upperNir.includes('2A')) {
    const replaced = upperNir.replace('2A', '19');
    numericValue = BigInt(replaced);
    // No adjustment needed — the standard approach uses replacement
  } else if (upperNir.includes('2B')) {
    const replaced = upperNir.replace('2B', '18');
    numericValue = BigInt(replaced);
  } else {
    // Standard numeric NIR
    if (!/^\d{13}$/.test(nir)) {
      throw new Error('NIR doit etre compose de 13 chiffres (ou contenir 2A/2B pour la Corse)');
    }
    numericValue = BigInt(nir);
  }

  const key = 97 - Number(numericValue % 97n);
  return key;
}

// ────────────────────────────────────────────────────────────────
// Format Validation
// ────────────────────────────────────────────────────────────────

/**
 * Validate the format of an INS/NIR number.
 *
 * Checks performed:
 *  1. Length: must be exactly 15 characters (13 body + 2 key)
 *  2. Sex digit: first character must be 1 or 2
 *  3. Year: characters 2-3 must be 00-99
 *  4. Month: characters 4-5 must be 01-12 (or 20-42 for unknown/special)
 *  5. Department: characters 6-7 must be a valid department code
 *  6. Commune: characters 8-10 must be 001-990
 *  7. Ordre: characters 11-13 must be 001-999
 *  8. Key: last 2 characters must match calculated key
 *
 * @param ins - Full 15-character INS/NIR string
 * @returns Validation result with optional error message
 */
export function validateINSFormat(ins: string): INSFormatResult {
  // Strip spaces and dashes for tolerance
  const cleaned = ins.replace(/[\s-]/g, '');

  // Length check
  if (cleaned.length !== 15) {
    return { valid: false, error: `Longueur invalide: attendu 15 caracteres, recu ${cleaned.length}` };
  }

  const upper = cleaned.toUpperCase();

  // Sex digit
  const sexDigit = upper[0];
  if (sexDigit !== '1' && sexDigit !== '2') {
    return { valid: false, error: `Premier caractere invalide: '${sexDigit}' (attendu 1 ou 2)` };
  }

  // Year (positions 1-2): any 2-digit number is valid
  const yearPart = upper.slice(1, 3);
  if (!/^\d{2}$/.test(yearPart)) {
    return { valid: false, error: `Annee invalide: '${yearPart}'` };
  }

  // Month (positions 3-4)
  const monthPart = upper.slice(3, 5);
  if (!/^\d{2}$/.test(monthPart)) {
    return { valid: false, error: `Mois invalide: '${monthPart}'` };
  }
  const monthNum = parseInt(monthPart, 10);
  const validMonths = (monthNum >= 1 && monthNum <= 12) || (monthNum >= 20 && monthNum <= 42) || monthNum === 99;
  if (!validMonths) {
    return { valid: false, error: `Mois invalide: ${monthPart} (attendu 01-12, 20-42, ou 99)` };
  }

  // Department (positions 5-6)
  const deptPart = upper.slice(5, 7);
  if (!VALID_DEPT_PREFIXES.has(deptPart) && deptPart !== '2A' && deptPart !== '2B') {
    return { valid: false, error: `Code departement invalide: '${deptPart}'` };
  }

  // Commune (positions 7-9)
  const communePart = upper.slice(7, 10);
  if (!/^\d{3}$/.test(communePart)) {
    return { valid: false, error: `Code commune invalide: '${communePart}'` };
  }

  // Ordre (positions 10-12)
  const ordrePart = upper.slice(10, 13);
  if (!/^\d{3}$/.test(ordrePart)) {
    return { valid: false, error: `Numero d'ordre invalide: '${ordrePart}'` };
  }

  // Key (positions 13-14)
  const keyPart = upper.slice(13, 15);
  if (!/^\d{2}$/.test(keyPart)) {
    return { valid: false, error: `Cle de controle invalide: '${keyPart}'` };
  }

  const nirBody = upper.slice(0, 13);
  let expectedKey: number;
  try {
    expectedKey = calculateNIRKey(nirBody);
  } catch {
    return { valid: false, error: 'Impossible de calculer la cle de controle (format NIR invalide)' };
  }

  const actualKey = parseInt(keyPart, 10);
  if (actualKey !== expectedKey) {
    return {
      valid: false,
      error: `Cle de controle incorrecte: recu ${keyPart}, attendu ${String(expectedKey).padStart(2, '0')}`,
    };
  }

  return { valid: true };
}

// ────────────────────────────────────────────────────────────────
// Helpers (internal)
// ────────────────────────────────────────────────────────────────

/**
 * Normalize a name for comparison: uppercase, NFD decomposition,
 * strip accents, trim, collapse whitespace.
 */
function normalizeName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Compute a similarity score (0-100) between two names.
 * Uses Jaro-Winkler-like heuristics suitable for French names.
 */
function nameMatchScore(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);

  if (na === nb) return 100;
  if (na.length === 0 || nb.length === 0) return 0;

  // Check if one contains the other (common for compound names)
  if (na.includes(nb) || nb.includes(na)) return 85;

  // Simple character-level Jaccard for remaining cases
  const setA = new Set(na.split(''));
  const setB = new Set(nb.split(''));
  let intersection = 0;
  for (const ch of setA) {
    if (setB.has(ch)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  const jaccard = union === 0 ? 0 : (intersection / union) * 100;

  return Math.round(jaccard);
}

/**
 * Simulate network latency for the teleservice call.
 */
function simulateLatency(): Promise<void> {
  const ms = SIMULATED_LATENCY_MIN + Math.random() * (SIMULATED_LATENCY_MAX - SIMULATED_LATENCY_MIN);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a deterministic but realistic-looking NIR for demo purposes.
 * Based on patient traits so the same patient always gets the same NIR.
 */
function generateDemoNIR(sexe: string, dateNaissance: string, nom: string): string {
  const sexDigit = sexe === 'F' ? '2' : '1';

  // Parse birth date
  const parts = dateNaissance.split('-');
  const year = parts[0]?.slice(2, 4) ?? '00';
  const month = parts[1] ?? '01';

  // Deterministic department from name hash
  const nameHash = Array.from(nom).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const dept = String((nameHash % 95) + 1).padStart(2, '0');

  // Deterministic commune and ordre
  const commune = String((nameHash * 7) % 990 + 1).padStart(3, '0');
  const ordre = String((nameHash * 13) % 999 + 1).padStart(3, '0');

  const body = `${sexDigit}${year}${month}${dept}${commune}${ordre}`;
  const key = calculateNIRKey(body);

  return `${body}${String(key).padStart(2, '0')}`;
}

// ────────────────────────────────────────────────────────────────
// INS Teleservice Call (simulated)
// ────────────────────────────────────────────────────────────────

/**
 * Simulate an INS teleservice qualification call.
 *
 * In production this would send a SOAP request to the INS teleservice
 * hosted by the CNAM/ANS. For the prototype we simulate the behaviour:
 *
 *  1. If `ins_numero` is provided, validate its format.
 *  2. Generate or verify the NIR, compute a confidence score based
 *     on the strength of the identity traits provided.
 *  3. Return a qualification result with status:
 *     - `qualifie` if confidence >= 80
 *     - `provisoire` if confidence 50-79
 *     - `invalide` if confidence < 50 or format error
 *
 * @param patient - Patient identity traits for qualification
 * @returns Qualification result
 */
export async function qualifyINS(patient: {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  ins_numero?: string;
}): Promise<INSValidationResult> {
  // Simulate teleservice latency
  await simulateLatency();

  const now = new Date().toISOString();
  const normalizedNom = normalizeName(patient.nom);
  const normalizedPrenom = normalizeName(patient.prenom);

  // Base confidence from trait completeness
  let confidence = 0;
  if (normalizedNom.length > 0) confidence += 25;
  if (normalizedPrenom.length > 0) confidence += 20;
  if (patient.date_naissance && /^\d{4}-\d{2}-\d{2}$/.test(patient.date_naissance)) confidence += 25;
  if (patient.sexe === 'M' || patient.sexe === 'F') confidence += 10;

  // If INS provided, validate format
  let nirToUse: string;
  if (patient.ins_numero) {
    const formatResult = validateINSFormat(patient.ins_numero);
    if (!formatResult.valid) {
      // Log the failed qualification attempt
      void auditService.log({
        user_id: 'system',
        user_name: 'INS Teleservice',
        module: 'M1-INS',
        action: 'ins_qualification_failed',
        resource_type: 'patient',
        details: { error: formatResult.error, ins_numero_masked: maskINS(patient.ins_numero) },
      });

      return {
        status: 'invalide',
        ins_numero: patient.ins_numero,
        nom_naissance: normalizedNom,
        prenoms: normalizedPrenom,
        date_naissance: patient.date_naissance,
        sexe: (patient.sexe === 'F' ? 'F' : 'M'),
        confidence: 0,
        validated_at: now,
      };
    }

    nirToUse = patient.ins_numero.replace(/[\s-]/g, '');

    // Cross-check sex digit against declared sex
    const nirSex = nirToUse[0] === '2' ? 'F' : 'M';
    if (nirSex === patient.sexe) {
      confidence += 10;
    } else {
      confidence -= 20;
    }

    // Cross-check birth year
    const nirYear = nirToUse.slice(1, 3);
    const declaredYear = patient.date_naissance.split('-')[0]?.slice(2, 4);
    if (nirYear === declaredYear) {
      confidence += 10;
    } else {
      confidence -= 15;
    }
  } else {
    // No INS provided: generate a demo NIR
    nirToUse = generateDemoNIR(patient.sexe, patient.date_naissance, patient.nom);
    // Lower confidence when we had to generate the NIR
    confidence = Math.min(confidence, 70);
  }

  // Clamp confidence
  confidence = Math.max(0, Math.min(100, confidence));

  // Determine status
  let status: INSStatus;
  if (confidence >= 80) {
    status = 'qualifie';
  } else if (confidence >= 50) {
    status = 'provisoire';
  } else {
    status = 'invalide';
  }

  // Simulate name-matching refinement (as the teleservice would return
  // the reference identity from the RNIPP)
  const simulatedReferenceNom = normalizedNom;
  const simulatedReferencePrenoms = normalizedPrenom;

  // Log the qualification
  void auditService.log({
    user_id: 'system',
    user_name: 'INS Teleservice',
    module: 'M1-INS',
    action: 'ins_qualification',
    resource_type: 'patient',
    details: {
      status,
      confidence,
      ins_numero_masked: maskINS(nirToUse),
    },
  });

  return {
    status,
    ins_numero: nirToUse,
    nom_naissance: simulatedReferenceNom,
    prenoms: simulatedReferencePrenoms,
    date_naissance: patient.date_naissance,
    sexe: (patient.sexe === 'F' ? 'F' : 'M'),
    confidence,
    validated_at: now,
  };
}

// ────────────────────────────────────────────────────────────────
// Batch Qualification
// ────────────────────────────────────────────────────────────────

/**
 * Qualify multiple patients in sequence.
 * Returns results in the same order as the input array.
 *
 * @param patients - Array of patient identity traits
 * @returns Array of qualification results
 */
export async function qualifyINSBatch(
  patients: Array<{
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    ins_numero?: string;
  }>
): Promise<INSValidationResult[]> {
  const results: INSValidationResult[] = [];
  for (const patient of patients) {
    results.push(await qualifyINS(patient));
  }
  return results;
}

// ────────────────────────────────────────────────────────────────
// Identity Cross-Check
// ────────────────────────────────────────────────────────────────

/**
 * Cross-check a patient's declared identity against an INS qualification result.
 * Returns a score indicating how well the declared identity matches.
 *
 * @param declared - The identity as declared by the patient / local system
 * @param insResult - The INS qualification result to compare against
 * @returns Match score 0-100 and list of discrepancies
 */
export function crossCheckIdentity(
  declared: { nom: string; prenom: string; date_naissance: string; sexe: string },
  insResult: INSValidationResult,
): { score: number; discrepancies: string[] } {
  const discrepancies: string[] = [];
  let score = 100;

  // Nom comparison
  const nomScore = nameMatchScore(declared.nom, insResult.nom_naissance);
  if (nomScore < 100) {
    score -= Math.round((100 - nomScore) * 0.4);
    if (nomScore < 80) {
      discrepancies.push(
        `Nom divergent: declare='${declared.nom}', INS='${insResult.nom_naissance}'`
      );
    }
  }

  // Prenom comparison
  const prenomScore = nameMatchScore(declared.prenom, insResult.prenoms);
  if (prenomScore < 100) {
    score -= Math.round((100 - prenomScore) * 0.3);
    if (prenomScore < 80) {
      discrepancies.push(
        `Prenom divergent: declare='${declared.prenom}', INS='${insResult.prenoms}'`
      );
    }
  }

  // Date de naissance
  if (declared.date_naissance !== insResult.date_naissance) {
    score -= 30;
    discrepancies.push(
      `Date de naissance divergente: declare='${declared.date_naissance}', INS='${insResult.date_naissance}'`
    );
  }

  // Sexe
  if (declared.sexe !== insResult.sexe) {
    score -= 20;
    discrepancies.push(
      `Sexe divergent: declare='${declared.sexe}', INS='${insResult.sexe}'`
    );
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    discrepancies,
  };
}

// ────────────────────────────────────────────────────────────────
// Utility: mask INS for logging
// ────────────────────────────────────────────────────────────────

/**
 * Mask an INS number for safe logging (RGPD compliance).
 * Shows only the first 3 and last 2 characters.
 *
 * @example maskINS("198056412345678") => "198**********78"
 */
function maskINS(ins: string): string {
  if (ins.length <= 5) return '***';
  return ins.slice(0, 3) + '*'.repeat(ins.length - 5) + ins.slice(-2);
}
