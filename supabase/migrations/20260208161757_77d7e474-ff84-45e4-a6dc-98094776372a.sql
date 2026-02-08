
-- Fix RLS: Allow AS role to insert procedures (for brancardage/surveillance/confort)
DROP POLICY IF EXISTS "IDE can insert procedures" ON public.procedures;
CREATE POLICY "IDE and AS can insert procedures"
ON public.procedures
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role));
