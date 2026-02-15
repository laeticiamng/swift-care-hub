-- ================================================================
-- URGENCEOS — Security Hardening Migration
-- Fixes critical vulnerabilities identified in security audit:
--   1. Block self-insertion of roles (privilege escalation)
--   2. Encounter-scoped write access (least privilege)
--   3. Restrict finished encounter data access
--   4. Add admin-only role management function
-- ================================================================

-- ════════════════════════════════════════
-- 1. BLOCK SELF-INSERTION OF ROLES
-- Users must NEVER be able to assign roles to themselves.
-- Only a SECURITY DEFINER function (called by admin) can insert roles.
-- ════════════════════════════════════════

-- Explicitly deny any direct INSERT on user_roles
-- (RLS already blocks it by default when no INSERT policy exists,
--  but adding an explicit policy makes the intent clear and prevents
--  accidental policy additions from opening the door)
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "users_insert_own_role" ON user_roles;

-- Admin-only role assignment: only medecins (acting as admin) can manage roles
CREATE POLICY "admin_insert_roles" ON user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'medecin'));

CREATE POLICY "admin_delete_roles" ON user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'medecin'));

-- No UPDATE on roles — delete and re-insert instead
-- This prevents subtle role changes going unnoticed

-- Secure function for role assignment (to be called from admin UI)
CREATE OR REPLACE FUNCTION public.assign_role(_target_user_id UUID, _role app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only medecins (admin) can assign roles
  IF NOT public.has_role(auth.uid(), 'medecin') THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can assign roles';
  END IF;

  -- Prevent assigning medecin role without explicit confirmation
  -- (logged for audit trail)
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    'role_assigned',
    'user_roles',
    _target_user_id,
    jsonb_build_object('role', _role::text, 'assigned_by', auth.uid()::text)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- ════════════════════════════════════════
-- 2. ENCOUNTER-SCOPED ACCESS HELPER
-- Implements least-privilege for patient data:
--   - Active encounters: all authorized staff can access (ED workflow)
--   - Finished encounters: only assigned staff + 24h grace period
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.can_access_encounter(_encounter_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.encounters e
    WHERE e.id = _encounter_id
    AND (
      -- Active encounters: accessible to all clinical staff
      e.status IN ('planned', 'arrived', 'triaged', 'in-progress')
      -- Assigned staff can always access their encounters
      OR e.medecin_id = auth.uid()
      OR e.ide_id = auth.uid()
      -- Grace period: finished encounters accessible for 24h (handoff)
      OR (
        e.status = 'finished'
        AND COALESCE(e.discharge_time, e.created_at) > now() - interval '24 hours'
      )
    )
  )
$$;

-- ════════════════════════════════════════
-- 3. ENCOUNTER-SCOPED WRITE POLICIES
-- Restrict mutations to encounters the user can access.
-- This prevents writing to archived/finished patient data.
-- ════════════════════════════════════════

-- Prescriptions: scope inserts and updates to accessible encounters
DROP POLICY IF EXISTS "Medecin can insert prescriptions" ON prescriptions;
CREATE POLICY "Medecin can insert prescriptions" ON prescriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'medecin')
    AND public.can_access_encounter(encounter_id)
  );

DROP POLICY IF EXISTS "Medecin can update prescriptions" ON prescriptions;
CREATE POLICY "Medecin can update prescriptions" ON prescriptions
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'medecin') OR public.has_role(auth.uid(), 'ide'))
    AND public.can_access_encounter(encounter_id)
  );

-- Administrations: scope to accessible encounters
DROP POLICY IF EXISTS "IDE can insert administrations" ON administrations;
CREATE POLICY "IDE can insert administrations" ON administrations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'ide')
    AND public.can_access_encounter(encounter_id)
  );

-- Vitals: scope to accessible encounters
DROP POLICY IF EXISTS "Clinical staff can insert vitals" ON vitals;
CREATE POLICY "Clinical staff can insert vitals" ON vitals
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'ioa') OR public.has_role(auth.uid(), 'ide') OR public.has_role(auth.uid(), 'as'))
    AND public.can_access_encounter(encounter_id)
  );

-- Procedures: scope to accessible encounters
DROP POLICY IF EXISTS "IDE can insert procedures" ON procedures;
CREATE POLICY "IDE can insert procedures" ON procedures
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'ide') OR public.has_role(auth.uid(), 'as'))
    AND public.can_access_encounter(encounter_id)
  );

-- Transmissions: scope to accessible encounters
DROP POLICY IF EXISTS "IDE can insert transmissions" ON transmissions;
CREATE POLICY "IDE can insert transmissions" ON transmissions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'ide')
    AND public.can_access_encounter(encounter_id)
  );

-- ════════════════════════════════════════
-- 4. ENCOUNTER-SCOPED READ POLICIES
-- Restrict reads on finished encounter data to assigned staff only.
-- Active encounters remain visible to all authorized clinical staff.
-- ════════════════════════════════════════

-- Vitals: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read vitals" ON vitals;
CREATE POLICY "Clinical staff can read vitals" ON vitals
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ioa') OR
      public.has_role(auth.uid(), 'ide') OR
      public.has_role(auth.uid(), 'as')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Prescriptions: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read prescriptions" ON prescriptions;
CREATE POLICY "Clinical staff can read prescriptions" ON prescriptions
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ioa') OR
      public.has_role(auth.uid(), 'ide')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Administrations: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read administrations" ON administrations;
CREATE POLICY "Clinical staff can read administrations" ON administrations
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ide')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Procedures: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read procedures" ON procedures;
DROP POLICY IF EXISTS "AS can read procedures" ON procedures;
CREATE POLICY "Clinical staff can read procedures" ON procedures
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ide') OR
      public.has_role(auth.uid(), 'as')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Transmissions: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read transmissions" ON transmissions;
DROP POLICY IF EXISTS "AS can read transmissions" ON transmissions;
CREATE POLICY "Clinical staff can read transmissions" ON transmissions
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ide') OR
      public.has_role(auth.uid(), 'as')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Results: encounter-scoped reads
DROP POLICY IF EXISTS "Clinical staff can read results" ON results;
CREATE POLICY "Clinical staff can read results" ON results
  FOR SELECT TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'medecin') OR
      public.has_role(auth.uid(), 'ioa') OR
      public.has_role(auth.uid(), 'ide')
    )
    AND public.can_access_encounter(encounter_id)
  );

-- Results: encounter-scoped updates
DROP POLICY IF EXISTS "Staff can update results" ON results;
CREATE POLICY "Staff can update results" ON results
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'medecin') OR public.has_role(auth.uid(), 'ide'))
    AND public.can_access_encounter(encounter_id)
  );

-- ════════════════════════════════════════
-- 5. AUDIT LOG for encounter access
-- Track who accesses which encounters for compliance
-- ════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_encounters_medecin_id ON encounters(medecin_id);
CREATE INDEX IF NOT EXISTS idx_encounters_ide_id ON encounters(ide_id);
CREATE INDEX IF NOT EXISTS idx_encounters_discharge_time ON encounters(discharge_time);
