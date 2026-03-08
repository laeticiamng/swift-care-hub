
-- Error logs table for self-hosted error tracking
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'frontend',
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  user_id uuid,
  function_name text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- RLS: service role inserts, medecins can read
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Medecin can read error logs"
  ON public.error_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'medecin'));

-- Index for recent errors queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX idx_error_logs_source ON public.error_logs (source);
