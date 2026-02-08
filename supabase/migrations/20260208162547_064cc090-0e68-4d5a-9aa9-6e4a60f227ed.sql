
-- 1. Fix procedures SELECT: add AS role
DROP POLICY IF EXISTS "Clinical staff can read procedures" ON public.procedures;
CREATE POLICY "Clinical staff can read procedures"
ON public.procedures
FOR SELECT
USING (
  has_role(auth.uid(), 'medecin'::app_role) OR
  has_role(auth.uid(), 'ide'::app_role) OR
  has_role(auth.uid(), 'as'::app_role)
);

-- 2. Add INSERT policy on timeline_items for medecin and ioa
CREATE POLICY "Medecin and IOA can insert timeline items"
ON public.timeline_items
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'medecin'::app_role) OR
  has_role(auth.uid(), 'ioa'::app_role)
);
