
-- Status checks table for monitoring data
CREATE TABLE public.status_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  status text NOT NULL DEFAULT 'operational',
  response_time_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb
);

-- Incident log table
CREATE TABLE public.incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'investigating',
  severity text NOT NULL DEFAULT 'minor',
  started_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No RLS needed: public read, write via edge function only
ALTER TABLE public.status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read status checks" ON public.status_checks FOR SELECT USING (true);
CREATE POLICY "Anyone can read incidents" ON public.incident_logs FOR SELECT USING (true);

-- Service role insert (edge functions use service role)
CREATE POLICY "Service can insert status checks" ON public.status_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert incidents" ON public.incident_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update incidents" ON public.incident_logs FOR UPDATE USING (true);

-- Index for fast queries
CREATE INDEX idx_status_checks_service ON public.status_checks (service_name, checked_at DESC);
CREATE INDEX idx_incident_logs_status ON public.incident_logs (status, started_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_logs;
