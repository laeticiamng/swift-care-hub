import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { encounterBundleToFHIR, validateGeneratedBundle, type FHIRBundle } from '@/lib/interop/fhir-adapter';
import { generateCRHHTML, generateOrdonnanceHTML } from '@/lib/interop/mssante-adapter';
import { parsePrescriptionMeta } from '@/lib/prescription-types';
import type { FullEncounterData, DocumentStatus, CanonicalAllergy, CanonicalCondition } from '@/lib/interop/canonical-model';
import { toast } from 'sonner';

export function useInterop(
  encounter: any, patient: any, vitals: any[], prescriptions: any[],
  results: any[], timeline: any[], medecinName: string | undefined,
) {
  const { user } = useAuth();
  const [fhirDrawerOpen, setFhirDrawerOpen] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [crhDrawerOpen, setCrhDrawerOpen] = useState(false);
  const [crhHTML, setCrhHTML] = useState('');
  const [crhStatus, setCrhStatus] = useState<DocumentStatus>('draft');
  const [ordonnanceDrawerOpen, setOrdonnanceDrawerOpen] = useState(false);
  const [ordonnanceHTML, setOrdonnanceHTML] = useState('');

  const buildFullEncounterData = (): FullEncounterData => {
    const allergies: CanonicalAllergy[] = (patient?.allergies || []).map((a: string) => ({
      patient_id: patient.id, substance: a, status: 'active' as const,
    }));

    const conditions: CanonicalCondition[] = [];
    timeline.filter(t => t.item_type === 'antecedent').forEach(t => {
      conditions.push({ patient_id: patient.id, encounter_id: encounter.id, code_display: t.content, category: 'antecedent', clinical_status: 'active' });
    });
    timeline.filter(t => t.item_type === 'diagnostic').forEach(t => {
      const match = t.content.match(/^([A-Z]\d+\.?\d*)\s*[—-]\s*(.+)$/);
      conditions.push({ patient_id: patient.id, encounter_id: encounter.id, code_cim10: match?.[1] || undefined, code_display: match?.[2] || t.content, category: 'diagnostic_actuel', verification_status: 'confirmed', clinical_status: 'active' });
    });

    const canonicalRx = prescriptions.map((rx: any) => {
      const meta = parsePrescriptionMeta(rx);
      return {
        id: rx.id, encounter_id: rx.encounter_id, patient_id: rx.patient_id, prescriber_id: rx.prescriber_id,
        prescription_type: meta.type, medication_name: rx.medication_name, dosage: rx.dosage, route: rx.route,
        frequency: rx.frequency, status: rx.status, priority: rx.priority, when_event: rx.created_at, notes: rx.notes, ...meta,
      };
    });

    return {
      patient: {
        id: patient.id, nom: patient.nom, prenom: patient.prenom, date_naissance: patient.date_naissance,
        sexe: patient.sexe, ins_numero: patient.ins_numero, poids: patient.poids, telephone: patient.telephone,
        adresse: patient.adresse, medecin_traitant: patient.medecin_traitant, allergies: patient.allergies,
        antecedents: patient.antecedents, traitements_actuels: patient.traitements_actuels,
      },
      encounter: {
        id: encounter.id, patient_id: encounter.patient_id, status: encounter.status,
        arrival_time: encounter.arrival_time, when_event: encounter.arrival_time, triage_time: encounter.triage_time,
        discharge_time: encounter.discharge_time, motif_sfmu: encounter.motif_sfmu, ccmu: encounter.ccmu,
        cimu: encounter.cimu, gemsa: encounter.gemsa, zone: encounter.zone, box_number: encounter.box_number,
        location: encounter.zone ? `${encounter.zone.toUpperCase()} Box ${encounter.box_number || ''}` : undefined,
        assigned_doctor_name: medecinName, medecin_id: encounter.medecin_id, orientation: encounter.orientation,
      },
      vitals: vitals.map((v: any) => ({
        id: v.id, patient_id: v.patient_id, encounter_id: v.encounter_id, recorded_at: v.recorded_at,
        when_event: v.recorded_at, fc: v.fc, pa_systolique: v.pa_systolique, pa_diastolique: v.pa_diastolique,
        spo2: v.spo2, temperature: v.temperature, frequence_respiratoire: v.frequence_respiratoire,
        gcs: v.gcs, eva_douleur: v.eva_douleur, recorded_by: v.recorded_by,
      })),
      prescriptions: canonicalRx,
      administrations: [], procedures: [],
      results: results.map((r: any) => ({
        id: r.id, encounter_id: r.encounter_id, patient_id: r.patient_id, title: r.title, category: r.category,
        result_type: r.category as 'bio' | 'imagerie' | 'ecg', is_critical: r.is_critical, is_read: r.is_read,
        content: r.content, when_event: r.received_at,
        value_text: typeof r.content === 'object' ? JSON.stringify(r.content) : String(r.content),
      })),
      allergies, conditions, transmissions: [], documents: [],
    };
  };

  const handleExportFHIR = () => {
    const data = buildFullEncounterData();
    const bundle = encounterBundleToFHIR(data);
    const validation = validateGeneratedBundle(bundle);
    if (!validation.valid) {
      console.warn(`[FHIR] Bundle has validation errors`, validation.errors);
    }
    setFhirBundle(bundle);
    setFhirDrawerOpen(true);
    if (user) {
      supabase.from('audit_logs').insert({
        user_id: user.id, action: 'fhir_export', resource_type: 'encounter',
        resource_id: encounter.id, details: { resources: bundle.entry.length, fhir_valid: validation.valid },
      });
    }
  };

  const handleGenerateCRH = () => {
    const data = buildFullEncounterData();
    setCrhHTML(generateCRHHTML(data));
    setCrhStatus('draft');
    setCrhDrawerOpen(true);
  };

  const handleSignCRH = () => {
    setCrhStatus('signed');
    toast.success('CRH signe');
    if (user) {
      supabase.from('audit_logs').insert({ user_id: user.id, action: 'crh_signed', resource_type: 'document', resource_id: encounter.id });
    }
  };

  const handleSendMSSante = () => {
    setCrhStatus('sent');
    if (user) {
      supabase.from('audit_logs').insert({
        user_id: user.id, action: 'mssante_sent', resource_type: 'document',
        resource_id: encounter.id, details: { type: 'crh', recipient: patient?.medecin_traitant || 'MT' },
      });
    }
  };

  const handleGenerateOrdonnance = () => {
    const data = buildFullEncounterData();
    setOrdonnanceHTML(generateOrdonnanceHTML(data));
    setOrdonnanceDrawerOpen(true);
  };

  return {
    fhirDrawerOpen, setFhirDrawerOpen, fhirBundle,
    crhDrawerOpen, setCrhDrawerOpen, crhHTML, crhStatus,
    ordonnanceDrawerOpen, setOrdonnanceDrawerOpen, ordonnanceHTML,
    handleExportFHIR, handleGenerateCRH, handleSignCRH, handleSendMSSante, handleGenerateOrdonnance,
  };
}
