-- ================================================================
-- UrgenceOS — Migration : Audit Remediation
-- Date : 2026-02-16
-- Purpose : Fix issues identified in the complete audit
--
-- Changes:
--   1. CHECK constraints on vitals (temperature, heart_rate, systolic, diastolic, spo2, pain_eva)
--   2. CHECK constraints on encounters (ccmu, cimu 1-5 range)
--   3. Tighten RLS grace period to assigned staff only (not all clinical)
--   4. Add missing CHECK on prescriptions status
-- ================================================================

-- ── 1. Vitals: Add range constraints ──
-- Prevents data entry errors (e.g., FC=5 instead of 50)

ALTER TABLE public.vitals
  ADD CONSTRAINT vitals_temperature_range
    CHECK (temperature IS NULL OR (temperature BETWEEN 30.0 AND 45.0)),
  ADD CONSTRAINT vitals_heart_rate_range
    CHECK (heart_rate IS NULL OR (heart_rate BETWEEN 20 AND 300)),
  ADD CONSTRAINT vitals_systolic_range
    CHECK (systolic IS NULL OR (systolic BETWEEN 30 AND 350)),
  ADD CONSTRAINT vitals_diastolic_range
    CHECK (diastolic IS NULL OR (diastolic BETWEEN 10 AND 250)),
  ADD CONSTRAINT vitals_spo2_range
    CHECK (spo2 IS NULL OR (spo2 BETWEEN 0 AND 100)),
  ADD CONSTRAINT vitals_pain_eva_range
    CHECK (pain_eva IS NULL OR (pain_eva BETWEEN 0 AND 10)),
  ADD CONSTRAINT vitals_respiratory_rate_range
    CHECK (respiratory_rate IS NULL OR (respiratory_rate BETWEEN 0 AND 80));

-- ── 2. Encounters: CCMU and CIMU range constraints ──

DO $$
BEGIN
  -- Only add if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encounters' AND column_name = 'ccmu') THEN
    ALTER TABLE public.encounters
      ADD CONSTRAINT encounters_ccmu_range CHECK (ccmu IS NULL OR (ccmu BETWEEN 1 AND 5));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encounters' AND column_name = 'cimu') THEN
    ALTER TABLE public.encounters
      ADD CONSTRAINT encounters_cimu_range CHECK (cimu IS NULL OR (cimu BETWEEN 1 AND 5));
  END IF;
END $$;

-- ── 3. Tighten grace period RLS policy ──
-- Old behavior: ALL clinical staff can access finished encounters for 24h
-- New behavior: Only ASSIGNED staff (doctor or nurse) can access finished encounters for 24h

-- Drop the old function if it exists and recreate with tighter logic
CREATE OR REPLACE FUNCTION public.can_access_encounter(encounter_row public.encounters)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Active encounters: any authenticated clinical staff can access
  IF encounter_row.status IN ('planned', 'arrived', 'triaged', 'in-progress') THEN
    RETURN true;
  END IF;

  -- Finished encounters: only assigned staff within 24h grace period
  IF encounter_row.status = 'finished' THEN
    -- Check if within 24h grace period
    IF encounter_row.discharge_at IS NOT NULL
       AND encounter_row.discharge_at > (now() - interval '24 hours') THEN
      -- Only allow assigned doctor or nurse
      RETURN (
        encounter_row.assigned_doctor_id = auth.uid()
        OR encounter_row.assigned_nurse_id = auth.uid()
      );
    END IF;
    -- Beyond 24h: no access
    RETURN false;
  END IF;

  RETURN false;
END;
$$;

-- ── 4. Prescriptions status constraint ──

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'status') THEN
    -- Add constraint only if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'prescriptions_status_valid' AND table_name = 'prescriptions'
    ) THEN
      ALTER TABLE public.prescriptions
        ADD CONSTRAINT prescriptions_status_valid
          CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'suspended'));
    END IF;
  END IF;
END $$;
