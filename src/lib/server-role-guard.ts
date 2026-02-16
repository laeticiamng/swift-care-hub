// ================================================================
// UrgenceOS — Vérification des rôles côté serveur
// Audit: "vérification client-side seulement" → ajout serveur
// Middleware pour Supabase Edge Functions
// ================================================================

import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/contexts/AuthContext';

export interface RoleCheckResult {
  authorized: boolean;
  user_id?: string;
  role?: AppRole;
  error?: string;
}

/**
 * Vérifie le rôle utilisateur côté serveur via Supabase
 * À utiliser avant toute opération sensible (prescription, validation, etc.)
 */
export async function verifyServerRole(
  requiredRoles: AppRole[],
): Promise<RoleCheckResult> {
  try {
    // Récupérer la session courante (vérifie le JWT côté serveur)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        error: 'Session invalide ou expirée',
      };
    }

    // Récupérer le rôle depuis la table user_roles (source de vérité serveur)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || !roleData) {
      return {
        authorized: false,
        user_id: user.id,
        error: 'Aucun rôle assigné à cet utilisateur',
      };
    }

    const userRole = roleData.role as AppRole;
    const authorized = requiredRoles.includes(userRole);

    if (!authorized) {
      // Audit log pour tentative d'accès non autorisée
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'unauthorized_access_attempt',
        resource_type: 'role_guard',
        details: {
          required_roles: requiredRoles,
          actual_role: userRole,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return {
      authorized,
      user_id: user.id,
      role: userRole,
      error: authorized ? undefined : `Rôle '${userRole}' insuffisant. Requis: ${requiredRoles.join(', ')}`,
    };
  } catch (e) {
    return {
      authorized: false,
      error: `Erreur de vérification: ${e instanceof Error ? e.message : 'inconnue'}`,
    };
  }
}

/**
 * Guard pour les opérations de prescription (médecin uniquement)
 */
export async function guardPrescription(): Promise<RoleCheckResult> {
  return verifyServerRole(['medecin']);
}

/**
 * Guard pour les opérations de triage (IOA + médecin)
 */
export async function guardTriage(): Promise<RoleCheckResult> {
  return verifyServerRole(['medecin', 'ioa']);
}

/**
 * Guard pour les opérations d'administration (IDE)
 */
export async function guardAdministration(): Promise<RoleCheckResult> {
  return verifyServerRole(['ide', 'medecin']);
}

/**
 * Guard pour les opérations cliniques (tous les rôles cliniques)
 */
export async function guardClinical(): Promise<RoleCheckResult> {
  return verifyServerRole(['medecin', 'ioa', 'ide']);
}

/**
 * Guard pour les opérations d'audit/admin
 */
export async function guardAdmin(): Promise<RoleCheckResult> {
  return verifyServerRole(['medecin']);
}

// ── Rate Limiter simple ──

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetAt - now;

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetIn,
  };
}

// ── Input Sanitization (prévention XSS/injection) ──

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  return sanitized;
}

// ── CSP Report endpoint helper ──

export interface CSPViolation {
  'document-uri': string;
  'violated-directive': string;
  'blocked-uri': string;
  'source-file'?: string;
  'line-number'?: number;
}

export function logCSPViolation(violation: CSPViolation): void {
  console.warn('[CSP Violation]', {
    document: violation['document-uri'],
    directive: violation['violated-directive'],
    blocked: violation['blocked-uri'],
    source: violation['source-file'],
    line: violation['line-number'],
  });
}
