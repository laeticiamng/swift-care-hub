-- Fix 6: Add AS role to transmissions SELECT policy
DROP POLICY IF EXISTS "Clinical staff can read transmissions" ON public.transmissions;
CREATE POLICY "Clinical staff can read transmissions"
ON public.transmissions FOR SELECT
USING (
  has_role(auth.uid(), 'medecin'::app_role) OR
  has_role(auth.uid(), 'ide'::app_role) OR
  has_role(auth.uid(), 'as'::app_role)
);

-- Fix 7: Add vitals to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;