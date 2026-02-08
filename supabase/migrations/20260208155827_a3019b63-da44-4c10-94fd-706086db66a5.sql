
-- ==========================================
-- UrgenceOS — Full Database Schema
-- ==========================================

-- 1. Create enums
CREATE TYPE public.app_role AS ENUM ('medecin', 'ioa', 'ide', 'as', 'secretaire');
CREATE TYPE public.encounter_status AS ENUM ('planned', 'arrived', 'triaged', 'in-progress', 'finished');
CREATE TYPE public.zone_type AS ENUM ('sau', 'uhcd', 'dechocage');
CREATE TYPE public.med_route AS ENUM ('IV', 'PO', 'SC', 'IM', 'INH');
CREATE TYPE public.prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.prescription_priority AS ENUM ('routine', 'urgent', 'stat');
CREATE TYPE public.procedure_type AS ENUM ('vvp', 'prelevement', 'pansement', 'sondage', 'ecg', 'autre');
CREATE TYPE public.result_category AS ENUM ('bio', 'imagerie', 'ecg');
CREATE TYPE public.timeline_item_type AS ENUM ('antecedent', 'allergie', 'traitement', 'crh', 'resultat', 'diagnostic');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user's current role (returns first role)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 5. Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  sexe TEXT NOT NULL CHECK (sexe IN ('M', 'F')),
  ins_numero TEXT,
  allergies TEXT[] DEFAULT '{}',
  antecedents TEXT[] DEFAULT '{}',
  traitements_actuels JSONB DEFAULT '[]',
  medecin_traitant TEXT,
  adresse TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 6. Encounters table
CREATE TABLE public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  status encounter_status NOT NULL DEFAULT 'planned',
  zone zone_type,
  box_number INT,
  ccmu INT CHECK (ccmu BETWEEN 1 AND 5),
  cimu INT CHECK (cimu BETWEEN 1 AND 5),
  motif_sfmu TEXT,
  medecin_id UUID REFERENCES auth.users(id),
  ide_id UUID REFERENCES auth.users(id),
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  triage_time TIMESTAMPTZ,
  discharge_time TIMESTAMPTZ,
  orientation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

-- 7. Vitals table
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  fc INT,
  pa_systolique INT,
  pa_diastolique INT,
  spo2 INT,
  temperature NUMERIC(4,1),
  frequence_respiratoire INT,
  gcs INT,
  eva_douleur INT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

-- 8. Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  prescriber_id UUID NOT NULL REFERENCES auth.users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route med_route NOT NULL DEFAULT 'PO',
  frequency TEXT,
  status prescription_status NOT NULL DEFAULT 'active',
  priority prescription_priority NOT NULL DEFAULT 'routine',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- 9. Administrations table
CREATE TABLE public.administrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  administered_by UUID NOT NULL REFERENCES auth.users(id),
  dose_given TEXT NOT NULL,
  route med_route NOT NULL,
  administered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.administrations ENABLE ROW LEVEL SECURITY;

-- 10. Procedures table
CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  procedure_type procedure_type NOT NULL,
  notes TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- 11. Transmissions table
CREATE TABLE public.transmissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  donnees TEXT,
  actions TEXT,
  resultats TEXT,
  cible TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transmissions ENABLE ROW LEVEL SECURITY;

-- 12. Results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  category result_category NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_critical BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- 13. Timeline items table
CREATE TABLE public.timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  item_type timeline_item_type NOT NULL,
  content TEXT NOT NULL,
  source_document TEXT,
  source_date DATE,
  source_author TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

-- 14. Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Profiles: users can read all profiles, update own
CREATE POLICY "Anyone authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Patients: accessible to all clinical roles (medecin, ioa, ide), admin data for secretaire, basic for AS
CREATE POLICY "Clinical staff can read patients" ON public.patients FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "IOA and secretaire can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'secretaire') OR
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "Clinical staff can update patients" ON public.patients FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa')
);

-- Encounters: all authenticated staff can read
CREATE POLICY "Staff can read encounters" ON public.encounters FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "IOA and medecin can insert encounters" ON public.encounters FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'secretaire')
);
CREATE POLICY "Medecin and IOA can update encounters" ON public.encounters FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa')
);

-- Vitals: clinical staff can read, IDE/IOA/AS can insert
CREATE POLICY "Clinical staff can read vitals" ON public.vitals FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as')
);
CREATE POLICY "Clinical staff can insert vitals" ON public.vitals FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide') OR
  public.has_role(auth.uid(), 'as')
);

-- Prescriptions: NOT visible to AS or secretaire
CREATE POLICY "Clinical staff can read prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "Medecin can insert prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'medecin')
);
CREATE POLICY "Medecin can update prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin')
);

-- Administrations: IDE and medecin can read/insert
CREATE POLICY "Clinical staff can read administrations" ON public.administrations FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "IDE can insert administrations" ON public.administrations FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ide')
);

-- Procedures: IDE and medecin
CREATE POLICY "Clinical staff can read procedures" ON public.procedures FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "IDE can insert procedures" ON public.procedures FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ide')
);

-- Transmissions: IDE and medecin
CREATE POLICY "Clinical staff can read transmissions" ON public.transmissions FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "IDE can insert transmissions" ON public.transmissions FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'ide')
);

-- Results: medecin, ioa, ide
CREATE POLICY "Clinical staff can read results" ON public.results FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);
CREATE POLICY "Staff can update results" ON public.results FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ide')
);

-- Timeline items: medecin, ioa, ide
CREATE POLICY "Clinical staff can read timeline" ON public.timeline_items FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'medecin') OR
  public.has_role(auth.uid(), 'ioa') OR
  public.has_role(auth.uid(), 'ide')
);

-- Audit logs: only readable, auto-inserted
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- Enable Realtime
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.encounters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.results;

-- ==========================================
-- Trigger: auto-create profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
