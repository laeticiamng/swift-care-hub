
-- P0 #1: Block all direct access to contact_leads (only service_role via edge function)
CREATE POLICY "Deny all select on contact_leads"
  ON public.contact_leads FOR SELECT
  TO authenticated, anon
  USING (false);

CREATE POLICY "Deny all insert on contact_leads"
  ON public.contact_leads FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny all update on contact_leads"
  ON public.contact_leads FOR UPDATE
  TO authenticated, anon
  USING (false);

CREATE POLICY "Deny all delete on contact_leads"
  ON public.contact_leads FOR DELETE
  TO authenticated, anon
  USING (false);

-- P1 #3: Replace permissive INSERT policies on status_checks, incident_logs, error_logs
-- Drop existing overly permissive policies and replace with deny-all (service_role bypasses RLS)
DROP POLICY IF EXISTS "Service role insert status checks" ON public.status_checks;
CREATE POLICY "Deny anon insert status checks"
  ON public.status_checks FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "Service role insert incidents" ON public.incident_logs;
CREATE POLICY "Deny anon insert incidents"
  ON public.incident_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "Service role update incidents" ON public.incident_logs;
CREATE POLICY "Deny anon update incidents"
  ON public.incident_logs FOR UPDATE
  TO authenticated, anon
  USING (false);

DROP POLICY IF EXISTS "Service role can insert error logs" ON public.error_logs;
CREATE POLICY "Deny anon insert error logs"
  ON public.error_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- P0 #6: Re-attach prevent_audit_mutation trigger if missing
DROP TRIGGER IF EXISTS prevent_audit_mutation ON public.audit_logs;
CREATE TRIGGER prevent_audit_mutation
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_mutation();
