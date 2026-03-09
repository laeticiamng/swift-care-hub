
-- Validate patient DOB trigger (IF NOT EXISTS not supported, use DROP first)
DROP TRIGGER IF EXISTS validate_patient_dob_trigger ON public.patients;
CREATE TRIGGER validate_patient_dob_trigger
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_patient_dob();

-- SCOPE ALL RLS POLICIES TO authenticated
ALTER POLICY "Assigned staff can update vitals" ON public.vitals TO authenticated;
ALTER POLICY "Clinical staff can insert vitals" ON public.vitals TO authenticated;
ALTER POLICY "Clinical staff can read vitals" ON public.vitals TO authenticated;
ALTER POLICY "Clinical staff can read prescriptions" ON public.prescriptions TO authenticated;
ALTER POLICY "Medecin and IDE can update prescriptions" ON public.prescriptions TO authenticated;
ALTER POLICY "Medecin can insert prescriptions" ON public.prescriptions TO authenticated;
ALTER POLICY "Clinical staff can read administrations" ON public.administrations TO authenticated;
ALTER POLICY "IDE can insert administrations" ON public.administrations TO authenticated;
ALTER POLICY "IDE can update administrations" ON public.administrations TO authenticated;
ALTER POLICY "Clinical staff can update encounters" ON public.encounters TO authenticated;
ALTER POLICY "IOA and medecin can insert encounters" ON public.encounters TO authenticated;
ALTER POLICY "Staff can read encounters" ON public.encounters TO authenticated;
ALTER POLICY "Clinical staff can read patients" ON public.patients TO authenticated;
ALTER POLICY "Clinical staff can update patients" ON public.patients TO authenticated;
ALTER POLICY "IOA and secretaire can insert patients" ON public.patients TO authenticated;
ALTER POLICY "Clinical staff can read results" ON public.results TO authenticated;
ALTER POLICY "IOA and medecin can insert results" ON public.results TO authenticated;
ALTER POLICY "Staff can update results" ON public.results TO authenticated;
ALTER POLICY "Clinical staff can read transmissions" ON public.transmissions TO authenticated;
ALTER POLICY "IDE can insert transmissions" ON public.transmissions TO authenticated;
ALTER POLICY "Clinical staff can read procedures" ON public.procedures TO authenticated;
ALTER POLICY "IDE and AS can insert procedures" ON public.procedures TO authenticated;
ALTER POLICY "Clinical staff can insert messages" ON public.messages TO authenticated;
ALTER POLICY "Clinical staff can read messages" ON public.messages TO authenticated;
ALTER POLICY "Staff can update messages for read receipts" ON public.messages TO authenticated;
ALTER POLICY "Clinical staff can read timeline" ON public.timeline_items TO authenticated;
ALTER POLICY "Medecin and IOA can insert timeline items" ON public.timeline_items TO authenticated;
ALTER POLICY "Medecin and IOA can update timeline items" ON public.timeline_items TO authenticated;
ALTER POLICY "Staff can see other staff profiles" ON public.profiles TO authenticated;
ALTER POLICY "Users can insert own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can read own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can update own profile" ON public.profiles TO authenticated;
ALTER POLICY "Authenticated users can insert audit logs" ON public.audit_logs TO authenticated;
ALTER POLICY "Users can read own audit logs" ON public.audit_logs TO authenticated;
ALTER POLICY "Users can read own roles" ON public.user_roles TO authenticated;
ALTER POLICY "Medecin can insert deletion requests" ON public.data_deletion_requests TO authenticated;
ALTER POLICY "Medecin can read deletion requests" ON public.data_deletion_requests TO authenticated;
ALTER POLICY "Medecin can update deletion requests" ON public.data_deletion_requests TO authenticated;
ALTER POLICY "Medecin can insert consents" ON public.patient_consents TO authenticated;
ALTER POLICY "Medecin can read consents" ON public.patient_consents TO authenticated;
ALTER POLICY "Medecin can update consents" ON public.patient_consents TO authenticated;

-- RESTRICT error_logs SELECT to own user_id
DROP POLICY IF EXISTS "Medecin can read error logs" ON public.error_logs;
CREATE POLICY "Users can read own error logs"
  ON public.error_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
ALTER POLICY "Deny anon insert error logs" ON public.error_logs TO authenticated;

-- Status/incident: keep readable by anon+authenticated
ALTER POLICY "Anyone can read status checks" ON public.status_checks TO anon, authenticated;
ALTER POLICY "Deny anon insert status checks" ON public.status_checks TO anon, authenticated;
ALTER POLICY "Anyone can read incidents" ON public.incident_logs TO anon, authenticated;
ALTER POLICY "Deny anon insert incidents" ON public.incident_logs TO anon, authenticated;
ALTER POLICY "Deny anon update incidents" ON public.incident_logs TO anon, authenticated;
ALTER POLICY "Deny all delete on contact_leads" ON public.contact_leads TO anon, authenticated;
ALTER POLICY "Deny all insert on contact_leads" ON public.contact_leads TO anon, authenticated;
ALTER POLICY "Deny all select on contact_leads" ON public.contact_leads TO anon, authenticated;
ALTER POLICY "Deny all update on contact_leads" ON public.contact_leads TO anon, authenticated;
