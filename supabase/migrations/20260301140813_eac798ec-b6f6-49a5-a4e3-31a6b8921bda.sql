
-- Policy UPDATE sur vitals : IDE et AS assignés peuvent corriger les constantes
CREATE POLICY "Assigned staff can update vitals"
ON public.vitals
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
  AND is_assigned_to_patient(auth.uid(), patient_id)
)
WITH CHECK (
  (has_role(auth.uid(), 'ide'::app_role) OR has_role(auth.uid(), 'as'::app_role))
  AND is_assigned_to_patient(auth.uid(), patient_id)
);

-- Policy UPDATE sur administrations : IDE assigné peut corriger une administration
CREATE POLICY "IDE can update administrations"
ON public.administrations
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'ide'::app_role)
  AND is_assigned_to_patient(auth.uid(), patient_id)
)
WITH CHECK (
  has_role(auth.uid(), 'ide'::app_role)
  AND is_assigned_to_patient(auth.uid(), patient_id)
);
