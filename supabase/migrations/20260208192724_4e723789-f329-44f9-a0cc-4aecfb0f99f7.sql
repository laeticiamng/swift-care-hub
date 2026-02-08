
-- 1. Restrict profiles SELECT policy to role-based access
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Staff can see other staff profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as') OR
  public.has_role(auth.uid(), 'secretaire')
);

-- 2. Add timeline_items UPDATE policy
CREATE POLICY "Medecin and IOA can update timeline items"
ON public.timeline_items FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa')
)
WITH CHECK (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa')
);

-- 3. Add patient date_naissance validation via trigger (not CHECK to avoid immutability issues)
CREATE OR REPLACE FUNCTION public.validate_patient_dob()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_naissance > CURRENT_DATE THEN
    RAISE EXCEPTION 'La date de naissance ne peut pas être dans le futur';
  END IF;
  IF NEW.date_naissance < '1900-01-01'::date THEN
    RAISE EXCEPTION 'Date de naissance invalide';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_patient_dob_trigger
BEFORE INSERT OR UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.validate_patient_dob();
