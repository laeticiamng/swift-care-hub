
-- Fix: IDE must be able to update prescriptions (for ✓ Administré status change)
DROP POLICY IF EXISTS "Medecin can update prescriptions" ON public.prescriptions;
CREATE POLICY "Medecin and IDE can update prescriptions" 
ON public.prescriptions FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'medecin') OR has_role(auth.uid(), 'ide'));

-- Fix: IDE needs to be able to update encounters (for status changes)  
DROP POLICY IF EXISTS "Medecin and IOA can update encounters" ON public.encounters;
CREATE POLICY "Clinical staff can update encounters"
ON public.encounters FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'medecin') OR has_role(auth.uid(), 'ioa') OR has_role(auth.uid(), 'ide'));
