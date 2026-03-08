
-- Tighten write policies: only service_role can write (no anon/authenticated)
DROP POLICY "Service can insert status checks" ON public.status_checks;
DROP POLICY "Service can insert incidents" ON public.incident_logs;
DROP POLICY "Service can update incidents" ON public.incident_logs;

CREATE POLICY "Service role insert status checks" ON public.status_checks FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert incidents" ON public.incident_logs FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update incidents" ON public.incident_logs FOR UPDATE TO service_role USING (true);
