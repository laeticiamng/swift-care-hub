
-- Trigger: make audit_logs immutable (the auth trigger already exists)
CREATE TRIGGER prevent_audit_log_mutation
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_mutation();
