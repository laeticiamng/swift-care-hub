
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name text NOT NULL,
  first_name text NOT NULL,
  email text NOT NULL,
  establishment text NOT NULL,
  role_function text NOT NULL,
  passages_volume text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- No public access — only edge functions with service role key can insert/read
