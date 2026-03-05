
-- Channel type enum
CREATE TYPE public.channel_type AS ENUM ('patient', 'zone', 'general');

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type public.channel_type NOT NULL,
  channel_id text NOT NULL, -- encounter_id for patient, zone name for zone, 'general' for general
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_urgent boolean NOT NULL DEFAULT false,
  read_by uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- All clinical staff can read messages in their channels
CREATE POLICY "Clinical staff can read messages"
ON public.messages FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'medecin'::app_role)
  OR has_role(auth.uid(), 'ioa'::app_role)
  OR has_role(auth.uid(), 'ide'::app_role)
  OR has_role(auth.uid(), 'as'::app_role)
);

-- Clinical staff can send messages
CREATE POLICY "Clinical staff can insert messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    has_role(auth.uid(), 'medecin'::app_role)
    OR has_role(auth.uid(), 'ioa'::app_role)
    OR has_role(auth.uid(), 'ide'::app_role)
    OR has_role(auth.uid(), 'as'::app_role)
  )
);

-- Staff can update messages (for read receipts)
CREATE POLICY "Staff can update messages for read receipts"
ON public.messages FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'medecin'::app_role)
  OR has_role(auth.uid(), 'ioa'::app_role)
  OR has_role(auth.uid(), 'ide'::app_role)
  OR has_role(auth.uid(), 'as'::app_role)
);

-- Index for fast channel queries
CREATE INDEX idx_messages_channel ON public.messages (channel_type, channel_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
