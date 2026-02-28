
-- ============================================================
-- TICKET 2: Supprimer auto-attribution de rôle
-- ============================================================
DROP POLICY IF EXISTS "User can insert own role if none exists" ON public.user_roles;

-- ============================================================
-- TICKET 5: Audit trail immutable (trigger SQL)
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is immutable: % operations are not allowed', TG_OP;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_mutation();

-- ============================================================
-- TICKET 4: Tables RGPD (patient_consents + data_deletion_requests)
-- ============================================================

-- Table patient_consents
CREATE TABLE public.patient_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamptz,
  revoked_at timestamptz,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medecin can read consents"
  ON public.patient_consents FOR SELECT
  USING (has_role(auth.uid(), 'medecin'::app_role));

CREATE POLICY "Medecin can insert consents"
  ON public.patient_consents FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'medecin'::app_role));

CREATE POLICY "Medecin can update consents"
  ON public.patient_consents FOR UPDATE
  USING (has_role(auth.uid(), 'medecin'::app_role));

-- Table data_deletion_requests
CREATE TABLE public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medecin can read deletion requests"
  ON public.data_deletion_requests FOR SELECT
  USING (has_role(auth.uid(), 'medecin'::app_role));

CREATE POLICY "Medecin can insert deletion requests"
  ON public.data_deletion_requests FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'medecin'::app_role));

CREATE POLICY "Medecin can update deletion requests"
  ON public.data_deletion_requests FOR UPDATE
  USING (has_role(auth.uid(), 'medecin'::app_role));
