/**
 * Role Guards Tests — Scénarios "rôle interdit"
 * Vérifie que les guards côté client bloquent les rôles non autorisés
 * et que le rate limiter fonctionne correctement.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/server-role-guard';

// Mock supabase for guard functions
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({ error: null })),
    })),
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { guardPrescription, guardTriage, guardAdministration, guardClinical, guardAdmin } from '@/lib/server-role-guard';

function mockUserWithRole(role: string | null, userId = 'user-123') {
  const getUser = vi.mocked(supabase.auth.getUser);
  if (!role) {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('No session') } as any);
    return;
  }
  getUser.mockResolvedValue({ data: { user: { id: userId } }, error: null } as any);

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { role }, error: null }),
      }),
    }),
    insert: vi.fn().mockResolvedValue({ error: null }),
  } as any);
}

describe('Role Guards — forbidden role scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── guardPrescription: médecin only ──

  it('guardPrescription allows médecin', async () => {
    mockUserWithRole('medecin');
    const result = await guardPrescription();
    expect(result.authorized).toBe(true);
    expect(result.role).toBe('medecin');
  });

  it('guardPrescription blocks IDE', async () => {
    mockUserWithRole('ide');
    const result = await guardPrescription();
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('insuffisant');
  });

  it('guardPrescription blocks IOA', async () => {
    mockUserWithRole('ioa');
    const result = await guardPrescription();
    expect(result.authorized).toBe(false);
  });

  it('guardPrescription blocks AS', async () => {
    mockUserWithRole('as');
    const result = await guardPrescription();
    expect(result.authorized).toBe(false);
  });

  it('guardPrescription blocks secrétaire', async () => {
    mockUserWithRole('secretaire');
    const result = await guardPrescription();
    expect(result.authorized).toBe(false);
  });

  it('guardPrescription blocks unauthenticated', async () => {
    mockUserWithRole(null);
    const result = await guardPrescription();
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('Session');
  });

  // ── guardTriage: médecin + IOA ──

  it('guardTriage allows médecin', async () => {
    mockUserWithRole('medecin');
    const result = await guardTriage();
    expect(result.authorized).toBe(true);
  });

  it('guardTriage allows IOA', async () => {
    mockUserWithRole('ioa');
    const result = await guardTriage();
    expect(result.authorized).toBe(true);
  });

  it('guardTriage blocks IDE', async () => {
    mockUserWithRole('ide');
    const result = await guardTriage();
    expect(result.authorized).toBe(false);
  });

  it('guardTriage blocks AS', async () => {
    mockUserWithRole('as');
    const result = await guardTriage();
    expect(result.authorized).toBe(false);
  });

  // ── guardAdministration: IDE + médecin ──

  it('guardAdministration allows IDE', async () => {
    mockUserWithRole('ide');
    const result = await guardAdministration();
    expect(result.authorized).toBe(true);
  });

  it('guardAdministration allows médecin', async () => {
    mockUserWithRole('medecin');
    const result = await guardAdministration();
    expect(result.authorized).toBe(true);
  });

  it('guardAdministration blocks AS', async () => {
    mockUserWithRole('as');
    const result = await guardAdministration();
    expect(result.authorized).toBe(false);
  });

  it('guardAdministration blocks secrétaire', async () => {
    mockUserWithRole('secretaire');
    const result = await guardAdministration();
    expect(result.authorized).toBe(false);
  });

  // ── guardClinical: médecin + IOA + IDE ──

  it('guardClinical allows all clinical roles', async () => {
    for (const role of ['medecin', 'ioa', 'ide']) {
      mockUserWithRole(role);
      const result = await guardClinical();
      expect(result.authorized).toBe(true);
    }
  });

  it('guardClinical blocks AS and secrétaire', async () => {
    for (const role of ['as', 'secretaire']) {
      mockUserWithRole(role);
      const result = await guardClinical();
      expect(result.authorized).toBe(false);
    }
  });

  // ── guardAdmin: médecin only ──

  it('guardAdmin blocks non-médecin', async () => {
    for (const role of ['ioa', 'ide', 'as', 'secretaire']) {
      mockUserWithRole(role);
      const result = await guardAdmin();
      expect(result.authorized).toBe(false);
    }
  });
});

describe('Rate Limiter', () => {
  it('allows requests within limit', () => {
    const key = `test_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(key, 5, 60000);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks after exceeding limit', () => {
    const key = `test_block_${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60000);
    }
    const result = checkRateLimit(key, 3, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', async () => {
    const key = `test_reset_${Date.now()}`;
    // Fill the bucket with a short window
    for (let i = 0; i < 2; i++) {
      checkRateLimit(key, 2, 50); // 50ms window
    }
    // Wait for window to expire
    await new Promise(r => setTimeout(r, 60));
    const result = checkRateLimit(key, 2, 50);
    // Should be allowed because window reset
    expect(result.allowed).toBe(true);
  });

  it('tracks remaining correctly', () => {
    const key = `test_remaining_${Date.now()}`;
    const r1 = checkRateLimit(key, 10, 60000);
    expect(r1.remaining).toBe(9);
    const r2 = checkRateLimit(key, 10, 60000);
    expect(r2.remaining).toBe(8);
  });
});
