
-- ============================================================
-- TICKET 1: RLS par encounter (moindre privilège)
-- ============================================================

-- Fonction: vérifie si un utilisateur est assigné à un encounter
CREATE OR REPLACE FUNCTION public.is_assigned_to_encounter(_user_id uuid, _encounter_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.encounters
    WHERE id = _encounter_id
      AND (
        medecin_id = _user_id
        OR ide_id = _user_id
      )
      AND (
        status IN ('arrived', 'triaged', 'in-progress')
        OR (status = 'finished' AND discharge_time > now() - interval '24 hours')
      )
  )
$$;

-- Fonction: vérifie si un utilisateur est assigné à au moins un encounter actif du patient
CREATE OR REPLACE FUNCTION public.is_assigned_to_patient(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.encounters
    WHERE patient_id = _patient_id
      AND (
        medecin_id = _user_id
        OR ide_id = _user_id
      )
      AND (
        status IN ('arrived', 'triaged', 'in-progress')
        OR (status = 'finished' AND discharge_time > now() - interval '24 hours')
      )
  )
$$;

-- ── VITALS ──
DROP POLICY IF EXISTS "Clinical staff can read vitals" ON public.vitals;
CREATE POLICY "Clinical staff can read vitals"
  ON public.vitals FOR SELECT
  USING (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Clinical staff can insert vitals" ON public.vitals;
CREATE POLICY "Clinical staff can insert vitals"
  ON public.vitals FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      (has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

-- ── PRESCRIPTIONS ──
DROP POLICY IF EXISTS "Clinical staff can read prescriptions" ON public.prescriptions;
CREATE POLICY "Clinical staff can read prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Medecin can insert prescriptions" ON public.prescriptions;
CREATE POLICY "Medecin can insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'medecin'::app_role)
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

DROP POLICY IF EXISTS "Medecin and IDE can update prescriptions" ON public.prescriptions;
CREATE POLICY "Medecin and IDE can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

-- ── RESULTS ──
DROP POLICY IF EXISTS "Clinical staff can read results" ON public.results;
CREATE POLICY "Clinical staff can read results"
  ON public.results FOR SELECT
  USING (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Staff can update results" ON public.results;
CREATE POLICY "Staff can update results"
  ON public.results FOR UPDATE
  USING (
    (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

-- ── ADMINISTRATIONS ──
DROP POLICY IF EXISTS "Clinical staff can read administrations" ON public.administrations;
CREATE POLICY "Clinical staff can read administrations"
  ON public.administrations FOR SELECT
  USING (
    (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

DROP POLICY IF EXISTS "IDE can insert administrations" ON public.administrations;
CREATE POLICY "IDE can insert administrations"
  ON public.administrations FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ide'::app_role)
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

-- ── PROCEDURES ──
DROP POLICY IF EXISTS "Clinical staff can read procedures" ON public.procedures;
CREATE POLICY "Clinical staff can read procedures"
  ON public.procedures FOR SELECT
  USING (
    (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

DROP POLICY IF EXISTS "IDE and AS can insert procedures" ON public.procedures;
CREATE POLICY "IDE and AS can insert procedures"
  ON public.procedures FOR INSERT
  WITH CHECK (
    (has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

-- ── TIMELINE_ITEMS ──
DROP POLICY IF EXISTS "Clinical staff can read timeline" ON public.timeline_items;
CREATE POLICY "Clinical staff can read timeline"
  ON public.timeline_items FOR SELECT
  USING (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role))
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Medecin and IOA can insert timeline items" ON public.timeline_items;
CREATE POLICY "Medecin and IOA can insert timeline items"
  ON public.timeline_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      has_role(auth.uid(), 'medecin'::app_role)
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Medecin and IOA can update timeline items" ON public.timeline_items;
CREATE POLICY "Medecin and IOA can update timeline items"
  ON public.timeline_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      has_role(auth.uid(), 'medecin'::app_role)
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'ioa'::app_role)
    OR (
      has_role(auth.uid(), 'medecin'::app_role)
      AND is_assigned_to_patient(auth.uid(), patient_id)
    )
  );

-- ── TRANSMISSIONS ──
DROP POLICY IF EXISTS "Clinical staff can read transmissions" ON public.transmissions;
CREATE POLICY "Clinical staff can read transmissions"
  ON public.transmissions FOR SELECT
  USING (
    (has_role(auth.uid(), 'medecin'::app_role) OR has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );

DROP POLICY IF EXISTS "IDE can insert transmissions" ON public.transmissions;
CREATE POLICY "IDE can insert transmissions"
  ON public.transmissions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'ide'::app_role)
    AND is_assigned_to_patient(auth.uid(), patient_id)
  );
