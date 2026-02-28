
-- Policy INSERT sur results pour IOA et médecin assigné
CREATE POLICY "IOA and medecin can insert results"
ON public.results
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'ioa'::app_role)
  OR (has_role(auth.uid(), 'medecin'::app_role) AND is_assigned_to_patient(auth.uid(), patient_id))
);
