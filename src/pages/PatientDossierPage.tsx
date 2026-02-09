import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PatientBanner } from '@/components/urgence/PatientBanner';
import { calculateAge, isVitalAbnormal } from '@/lib/vitals-utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, FileText, AlertTriangle, Clock, FlaskConical, Image, Eye, DoorOpen, ToggleLeft, ToggleRight, Send, Loader2, ExternalLink, Pill, HeartPulse, Microscope, ScanLine, History, Stethoscope, Share2, PenLine, FileDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { toast } from 'sonner';
import { checkAllergyConflict, checkDrugInteractions, type DrugInteraction } from '@/lib/allergy-check';
import { DischargeDialog } from '@/components/urgence/DischargeDialog';
import { RecapDrawer } from '@/components/urgence/RecapDrawer';
import { PatientTimeline } from '@/components/urgence/PatientTimeline';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FHIRViewer } from '@/components/urgence/interop/FHIRViewer';
import { CRHPreview } from '@/components/urgence/documents/CRHPreview';
import { encounterBundleToFHIR, type FHIRBundle } from '@/lib/interop/fhir-adapter';
import { generateCRHHTML, generateOrdonnanceHTML } from '@/lib/interop/mssante-adapter';
import type { FullEncounterData, DocumentStatus, CanonicalAllergy, CanonicalCondition } from '@/lib/interop/canonical-model';
import { parsePrescriptionMeta as parseRxMetaForInterop } from '@/lib/prescription-types';
import { categorizePrescription, PRESCRIPTION_SECTIONS, PRESCRIPTION_TEMPLATES, PrescriptionCategory } from '@/lib/prescription-utils';
import {
  parsePrescriptionMeta,
  encodePrescriptionMeta,
  PRESCRIPTION_TYPES,
  PRESCRIPTION_TYPE_LABELS,
  PRESCRIPTION_TYPE_ICONS,
  PRESCRIPTION_TYPE_GROUPS,
  PRESCRIPTION_PACKS,
  EXAM_BIO_CATEGORIES,
  EXAM_IMAGERIE_CATEGORIES,
  AVIS_SPECIALTIES,
  O2_DEVICES,
  EXTENDED_MED_ROUTES,
  type PrescriptionType,
  type PrescriptionMetadata,
} from '@/lib/prescription-types';
import { Checkbox } from '@/components/ui/checkbox';

export default function PatientDossierPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isReadOnly = role === 'as' || role === 'secretaire';
  const [encounter, setEncounter] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState<string[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [interactionConfirmed, setInteractionConfirmed] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [timelineEssential, setTimelineEssential] = useState(false);
  const [newRx, setNewRx] = useState({ medication_name: '', dosage: '', route: 'PO' as string, frequency: '', priority: 'routine' as string, rx_type: 'traitements' as PrescriptionCategory });
  const [rxType, setRxType] = useState<PrescriptionType>('medicament');
  const [rxMeta, setRxMeta] = useState<Partial<PrescriptionMetadata>>({});
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [diagnosticContent, setDiagnosticContent] = useState('');
  const [savingDiag, setSavingDiag] = useState(false);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);
  // Interop state
  const [fhirDrawerOpen, setFhirDrawerOpen] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [crhDrawerOpen, setCrhDrawerOpen] = useState(false);
  const [crhHTML, setCrhHTML] = useState('');
  const [crhStatus, setCrhStatus] = useState<DocumentStatus>('draft');
  const [ordonnanceDrawerOpen, setOrdonnanceDrawerOpen] = useState(false);
  const [ordonnanceHTML, setOrdonnanceHTML] = useState('');

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
    const channel = supabase.channel(`dossier-${encounterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [encounterId]);

  const fetchAll = async () => {
    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId!).single();
    if (!enc) return;
    setEncounter(enc);
    const [patRes, vitRes, rxRes, resRes, tlRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', enc.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId!).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId!).order('created_at', { ascending: false }),
      supabase.from('results').select('*').eq('encounter_id', encounterId!).order('received_at', { ascending: false }),
      supabase.from('timeline_items').select('*').eq('patient_id', enc.patient_id).order('source_date', { ascending: false }),
    ]);
    if (patRes.data) setPatient(patRes.data);
    if (vitRes.data) setVitals(vitRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (resRes.data) setResults(resRes.data);
    if (tlRes.data) setTimeline(tlRes.data);
    // Fetch medecin name
    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }
  };

  const handleMedNameChange = (name: string) => {
    setNewRx({ ...newRx, medication_name: name });
    if (patient?.allergies) setAllergyWarning(checkAllergyConflict(name, patient.allergies));
    // Check drug interactions with current treatments
    const currentMeds: string[] = [];
    if (patient?.traitements_actuels) {
      if (Array.isArray(patient.traitements_actuels)) {
        currentMeds.push(...patient.traitements_actuels.map((t: any) => typeof t === 'string' ? t : JSON.stringify(t)));
      }
    }
    // Also include active prescriptions
    prescriptions.filter(rx => rx.status === 'active').forEach(rx => currentMeds.push(rx.medication_name));
    setDrugInteractions(checkDrugInteractions(name, currentMeds));
    setInteractionConfirmed(false);
  };

  const handlePrescribe = async () => {
    if (!encounter || !user) return;
    if (allergyWarning.length > 0) {
      toast.error(`ALLERGIE : ${allergyWarning.join(', ')} — bloquee`);
      return;
    }
    const warnings = drugInteractions.filter(i => i.level === 'warning');
    if (warnings.length > 0 && !interactionConfirmed) {
      toast.warning('Interactions detectees — veuillez confirmer');
      return;
    }
    // Build metadata
    const meta: PrescriptionMetadata = { type: rxType, ...rxMeta };
    if (rxType === 'exam_bio') meta.exam_list = selectedExams;
    const notes = encodePrescriptionMeta(meta);
    // Auto-set medication_name for non-med types
    let medName = newRx.medication_name;
    if (!medName) {
      if (rxType === 'exam_bio') medName = 'Bio urgente';
      else if (rxType === 'exam_ecg') medName = 'ECG 12 derivations';
      else if (rxType === 'exam_imagerie') medName = rxMeta.exam_site || 'Imagerie';
      else if (rxType === 'oxygene') medName = 'O2';
      else if (rxType === 'surveillance') medName = rxMeta.surveillance_type || 'Surveillance';
      else if (rxType === 'regime') medName = rxMeta.regime_details || 'Regime';
      else if (rxType === 'mobilisation') medName = rxMeta.mobilisation_details || 'Mobilisation';
      else if (rxType === 'dispositif') medName = rxMeta.device_name || 'Dispositif';
      else if (rxType === 'avis_specialise') medName = `Avis ${rxMeta.avis_speciality || ''}`;
      else medName = 'Prescription';
    }
    const { error } = await supabase.from('prescriptions').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id, prescriber_id: user.id,
      medication_name: medName, dosage: newRx.dosage || '',
      route: (newRx.route || 'PO') as any, frequency: newRx.frequency || null,
      priority: (newRx.priority || 'routine') as any, notes,
    });
    if (error) { toast.error('Erreur de prescription'); return; }
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'prescription_created', resource_type: 'prescription',
      resource_id: encounter.id, details: { medication: medName, type: rxType },
    });
    toast.success(`${PRESCRIPTION_TYPE_ICONS[rxType]} ${medName} prescrit`);
    resetPrescriptionForm();
    fetchAll();
  };

  const resetPrescriptionForm = () => {
    setNewRx({ medication_name: '', dosage: '', route: 'PO', frequency: '', priority: 'routine', rx_type: 'traitements' });
    setRxType('medicament');
    setRxMeta({});
    setSelectedExams([]);
    setAllergyWarning([]);
    setDrugInteractions([]);
    setInteractionConfirmed(false);
    setPrescribeOpen(false);
  };

  const handleApplyPack = async (packKey: string) => {
    const pack = PRESCRIPTION_PACKS[packKey];
    if (!pack || !encounter || !user) return;
    for (const item of pack.items) {
      const meta: PrescriptionMetadata = { ...item };
      const notes = encodePrescriptionMeta(meta);
      await supabase.from('prescriptions').insert({
        encounter_id: encounter.id, patient_id: encounter.patient_id, prescriber_id: user.id,
        medication_name: item.medication_name, dosage: item.dosage || '',
        route: (item.route || 'IV') as any, frequency: item.frequency || null,
        priority: (item.priority || 'routine') as any, notes,
      });
    }
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'pack_prescribed', resource_type: 'encounter',
      resource_id: encounter.id, details: { pack: packKey, items: pack.items.length },
    });
    toast.success(`Pack "${pack.label}" prescrit (${pack.items.length} items)`);
    setPrescribeOpen(false);
    fetchAll();
  };

  const handleCancelPrescription = async (rxId: string) => {
    await supabase.from('prescriptions').update({ status: 'cancelled' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_cancelled', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription annulée');
    fetchAll();
  };

  const handleSuspendPrescription = async (rxId: string) => {
    await supabase.from('prescriptions').update({ status: 'suspended' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_suspended', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription suspendue');
    fetchAll();
  };

  const handleReactivatePrescription = async (rxId: string) => {
    await supabase.from('prescriptions').update({ status: 'active' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_reactivated', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription réactivée');
    fetchAll();
  };

  const handleMarkRead = async (resultId: string) => {
    await supabase.from('results').update({ is_read: true }).eq('id', resultId);
    fetchAll();
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !patient || !user) return;
    setSavingNote(true);
    const { error } = await supabase.from('timeline_items').insert({
      patient_id: patient.id,
      item_type: 'crh' as any,
      content: noteContent.trim(),
      source_author: user.email,
      source_date: new Date().toISOString().split('T')[0],
    });
    if (error) { toast.error('Erreur d\'enregistrement'); setSavingNote(false); return; }
    toast.success('Note enregistrée');
    setNoteContent('');
    setSavingNote(false);
    fetchAll();
  };

  // ── Build FullEncounterData for interop adapters ──
  const buildFullEncounterData = (): FullEncounterData => {
    // Convert patient allergies array to CanonicalAllergy[]
    const allergies: CanonicalAllergy[] = (patient?.allergies || []).map((a: string) => ({
      patient_id: patient.id,
      substance: a,
      status: 'active' as const,
    }));

    // Convert timeline diagnostics to CanonicalCondition[]
    const conditions: CanonicalCondition[] = [];
    // Add antecedents from timeline
    timeline.filter(t => t.item_type === 'antecedent').forEach(t => {
      conditions.push({
        patient_id: patient.id,
        encounter_id: encounter.id,
        code_display: t.content,
        category: 'antecedent',
        clinical_status: 'active',
      });
    });
    // Add diagnostics from timeline
    timeline.filter(t => t.item_type === 'diagnostic').forEach(t => {
      const match = t.content.match(/^([A-Z]\d+\.?\d*)\s*[—-]\s*(.+)$/);
      conditions.push({
        patient_id: patient.id,
        encounter_id: encounter.id,
        code_cim10: match?.[1] || undefined,
        code_display: match?.[2] || t.content,
        category: 'diagnostic_actuel',
        verification_status: 'confirmed',
        clinical_status: 'active',
      });
    });

    // Convert prescriptions with their metadata
    const canonicalRx = prescriptions.map((rx: any) => {
      const meta = parseRxMetaForInterop(rx);
      return {
        id: rx.id,
        encounter_id: rx.encounter_id,
        patient_id: rx.patient_id,
        prescriber_id: rx.prescriber_id,
        prescription_type: meta.type,
        medication_name: rx.medication_name,
        dosage: rx.dosage,
        route: rx.route,
        frequency: rx.frequency,
        status: rx.status,
        priority: rx.priority,
        when_event: rx.created_at,
        notes: rx.notes,
        ...meta,
      };
    });

    return {
      patient: {
        id: patient.id,
        nom: patient.nom,
        prenom: patient.prenom,
        date_naissance: patient.date_naissance,
        sexe: patient.sexe,
        ins_numero: patient.ins_numero,
        poids: patient.poids,
        telephone: patient.telephone,
        adresse: patient.adresse,
        medecin_traitant: patient.medecin_traitant,
        allergies: patient.allergies,
        antecedents: patient.antecedents,
        traitements_actuels: patient.traitements_actuels,
      },
      encounter: {
        id: encounter.id,
        patient_id: encounter.patient_id,
        status: encounter.status,
        arrival_time: encounter.arrival_time,
        when_event: encounter.arrival_time,
        triage_time: encounter.triage_time,
        discharge_time: encounter.discharge_time,
        motif_sfmu: encounter.motif_sfmu,
        ccmu: encounter.ccmu,
        cimu: encounter.cimu,
        gemsa: encounter.gemsa,
        zone: encounter.zone,
        box_number: encounter.box_number,
        location: encounter.zone ? `${encounter.zone.toUpperCase()} Box ${encounter.box_number || ''}` : undefined,
        assigned_doctor_name: medecinName,
        medecin_id: encounter.medecin_id,
        orientation: encounter.orientation,
      },
      vitals: vitals.map((v: any) => ({
        id: v.id,
        patient_id: v.patient_id,
        encounter_id: v.encounter_id,
        recorded_at: v.recorded_at,
        when_event: v.recorded_at,
        fc: v.fc,
        pa_systolique: v.pa_systolique,
        pa_diastolique: v.pa_diastolique,
        spo2: v.spo2,
        temperature: v.temperature,
        frequence_respiratoire: v.frequence_respiratoire,
        gcs: v.gcs,
        eva_douleur: v.eva_douleur,
        recorded_by: v.recorded_by,
      })),
      prescriptions: canonicalRx,
      administrations: [],
      procedures: [],
      results: results.map((r: any) => ({
        id: r.id,
        encounter_id: r.encounter_id,
        patient_id: r.patient_id,
        title: r.title,
        category: r.category,
        result_type: r.category as 'bio' | 'imagerie' | 'ecg',
        is_critical: r.is_critical,
        is_read: r.is_read,
        content: r.content,
        when_event: r.received_at,
        value_text: typeof r.content === 'object' ? JSON.stringify(r.content) : String(r.content),
      })),
      allergies,
      conditions,
      transmissions: [],
      documents: [],
    };
  };

  const handleExportFHIR = () => {
    const data = buildFullEncounterData();
    const bundle = encounterBundleToFHIR(data);
    setFhirBundle(bundle);
    setFhirDrawerOpen(true);
    if (user) {
      supabase.from('audit_logs').insert({
        user_id: user.id, action: 'fhir_export', resource_type: 'encounter',
        resource_id: encounter.id, details: { resources: bundle.entry.length },
      });
    }
  };

  const handleGenerateCRH = () => {
    const data = buildFullEncounterData();
    const html = generateCRHHTML(data);
    setCrhHTML(html);
    setCrhStatus('draft');
    setCrhDrawerOpen(true);
  };

  const handleSignCRH = () => {
    setCrhStatus('signed');
    toast.success('CRH signe');
    if (user) {
      supabase.from('audit_logs').insert({
        user_id: user.id, action: 'crh_signed', resource_type: 'document',
        resource_id: encounter.id,
      });
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
    const html = generateOrdonnanceHTML(data);
    setOrdonnanceHTML(html);
    setOrdonnanceDrawerOpen(true);
  };

  if (!patient || !encounter) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const age = calculateAge(patient.date_naissance);
  const vitalKeys = ['fc', 'pa_systolique', 'spo2', 'temperature', 'frequence_respiratoire', 'gcs', 'eva_douleur'];
  const vitalLabels: Record<string, string> = { fc: 'FC', pa_systolique: 'PA sys', spo2: 'SpO₂', temperature: 'T°', frequence_respiratoire: 'FR', gcs: 'GCS', eva_douleur: 'EVA' };
  const vitalUnits: Record<string, string> = { fc: 'bpm', pa_systolique: 'mmHg', spo2: '%', temperature: '°C', frequence_respiratoire: '/min', gcs: '/15', eva_douleur: '/10' };

  // ── Adaptive section ordering based on motif SFMU and encounter status ──
  type DossierContext = 'cardio' | 'trauma' | 'respiratoire' | 'infectieux' | 'sortie' | 'default';
  const detectContext = (): DossierContext => {
    if (encounter.status === 'ready_for_discharge' || encounter.status === 'finished') return 'sortie';
    const motif = (encounter.motif_sfmu || '').toLowerCase();
    if (['douleur thoracique', 'dt', 'precordialgie', 'angor', 'infarctus', 'cardio'].some(k => motif.includes(k))) return 'cardio';
    if (['traumatisme', 'trauma', 'fracture', 'entorse', 'luxation', 'chute', 'plaie'].some(k => motif.includes(k))) return 'trauma';
    if (['dyspnee', 'asthme', 'detresse respiratoire', 'insuffisance respiratoire', 'bronchospasme'].some(k => motif.includes(k))) return 'respiratoire';
    if (['fievre', 'aeg', 'sepsis', 'infection'].some(k => motif.includes(k))) return 'infectieux';
    return 'default';
  };
  const dossierContext = detectContext();

  // Priority vital keys per context (shown first / highlighted)
  const priorityVitalKeys: Record<DossierContext, string[]> = {
    cardio: ['fc', 'pa_systolique', 'spo2', 'eva_douleur'],
    trauma: ['eva_douleur', 'fc', 'pa_systolique', 'gcs'],
    respiratoire: ['spo2', 'frequence_respiratoire', 'fc'],
    infectieux: ['temperature', 'fc', 'pa_systolique', 'frequence_respiratoire'],
    sortie: [],
    default: [],
  };

  // Reorder vital keys: priority first, then the rest
  const contextPriorityVitals = priorityVitalKeys[dossierContext];
  const orderedVitalKeys = contextPriorityVitals.length > 0
    ? [...contextPriorityVitals, ...vitalKeys.filter(k => !contextPriorityVitals.includes(k))]
    : vitalKeys;

  // For cardio/respiratoire/infectieux contexts, show results before prescriptions
  const showResultsFirst = ['cardio', 'respiratoire', 'infectieux'].includes(dossierContext);

  // Context label for the adaptive indicator
  const contextLabels: Record<DossierContext, string> = {
    cardio: 'Contexte cardiologique',
    trauma: 'Contexte traumatologique',
    respiratoire: 'Contexte respiratoire',
    infectieux: 'Contexte infectieux',
    sortie: 'Preparation sortie',
    default: '',
  };

  const bioNormalRanges: Record<string, { unit: string; min?: number; max?: number }> = {
    hemoglobine: { unit: 'g/dL', min: 12, max: 17 },
    leucocytes: { unit: 'G/L', min: 4, max: 10 },
    creatinine: { unit: 'µmol/L', min: 45, max: 104 },
    potassium: { unit: 'mmol/L', min: 3.5, max: 5.0 },
    troponine_us: { unit: 'ng/L', max: 14 },
    CRP: { unit: 'mg/L', max: 5 },
    lactates: { unit: 'mmol/L', max: 2 },
    procalcitonine: { unit: 'ng/mL', max: 0.5 },
    BNP: { unit: 'pg/mL', max: 100 },
  };

  const renderResultContent = (content: any, category: string) => {
    if (!content || typeof content !== 'object') return null;
    const entries = Object.entries(content);
    if (category === 'imagerie' || category === 'ecg') {
      return (
        <div className="mt-2 space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')} : </span>
              <span className="font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-2 rounded-md border overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-muted/50"><th className="text-left px-2 py-1 font-medium">Paramètre</th><th className="text-right px-2 py-1 font-medium">Valeur</th><th className="text-right px-2 py-1 font-medium">Réf.</th></tr></thead>
          <tbody>
            {entries.map(([k, v]) => {
              const range = bioNormalRanges[k];
              const numVal = parseFloat(String(v));
              const isAbnormal = range && !isNaN(numVal) && ((range.min !== undefined && numVal < range.min) || (range.max !== undefined && numVal > range.max));
              return (
                <tr key={k} className={cn('border-t', isAbnormal && 'bg-medical-critical/5')}>
                  <td className="px-2 py-1 capitalize">{k.replace(/_/g, ' ')}</td>
                  <td className={cn('text-right px-2 py-1 font-semibold', isAbnormal && 'text-medical-critical')}>
                    {String(v)} {range?.unit && <span className="font-normal text-muted-foreground">{range.unit}</span>}
                  </td>
                  <td className="text-right px-2 py-1 text-muted-foreground">
                    {range ? `${range.min !== undefined ? range.min : ''}-${range.max !== undefined ? range.max : ''}` : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the Results section (reused in different positions based on context)
  const renderResultsSection = () => (
    <Card className="animate-in fade-in duration-300" style={{ animationDelay: showResultsFirst ? '100ms' : '200ms', animationFillMode: 'both' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Resultats
          {results.filter(r => !r.is_read).length > 0 && (
            <Badge className="bg-medical-critical text-medical-critical-foreground">{results.filter(r => !r.is_read).length} nouveau(x)</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.length === 0 && <p className="text-sm text-muted-foreground">Aucun resultat</p>}
        {results.map((r, idx) => (
          <div key={r.id} className={cn('p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2', r.is_critical && 'border-l-4 border-l-medical-critical', !r.is_read && 'bg-primary/5')}
            style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {r.category === 'bio' ? <FlaskConical className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                <span className="font-medium text-sm">{r.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {r.is_critical && <Badge className="bg-medical-critical text-medical-critical-foreground text-xs">Critique</Badge>}
                {!r.is_read && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleMarkRead(r.id)}>
                    <Eye className="h-3 w-3 mr-1" /> Lu
                  </Button>
                )}
              </div>
            </div>
            {renderResultContent(r.content, r.category)}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Prescription category counts
  const rxGroups = {
    soins: prescriptions.filter(rx => categorizePrescription(rx) === 'soins'),
    examens_bio: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_bio'),
    examens_imagerie: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_imagerie'),
    traitements: prescriptions.filter(rx => categorizePrescription(rx) === 'traitements'),
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientBanner nom={patient.nom} prenom={patient.prenom} age={age} sexe={patient.sexe}
        ccmu={encounter.ccmu} motif={encounter.motif_sfmu} allergies={patient.allergies || []} boxNumber={encounter.box_number} poids={patient.poids} medecinName={medecinName} encounterId={encounterId} onBack={() => navigate(-1)} />

      <div className="max-w-7xl mx-auto p-4">
        {isReadOnly && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1.5 w-fit"><Eye className="h-4 w-4" /> Consultation seule</Badge>
          </div>
        )}
        {!isReadOnly && (
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleExportFHIR}>
              <Share2 className="h-4 w-4 mr-1" /> Export FHIR
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateCRH}>
              <FileText className="h-4 w-4 mr-1" /> Generer CRH
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateOrdonnance}>
              <FileDown className="h-4 w-4 mr-1" /> Ordonnance
            </Button>
            {encounter.status !== 'finished' && (
              <Button variant="outline" size="sm" onClick={() => setDischargeOpen(true)}>
                <DoorOpen className="h-4 w-4 mr-1" /> Preparer sortie
              </Button>
            )}
          </div>
        )}
        {!isReadOnly && (
          <DischargeDialog open={dischargeOpen} onOpenChange={setDischargeOpen} encounterId={encounter.id} patientId={encounter.patient_id} userId={user?.id || ''}
            motif={encounter.motif_sfmu} prescriptions={prescriptions} diagnostics={timeline.filter(t => t.item_type === 'diagnostic')} vitals={vitals}
            onDone={() => { fetchAll(); navigate('/board'); }} />
        )}

        {/* Contextual priority banner — progressive disclosure */}
        {!isReadOnly && (() => {
          const criticalResults = results.filter(r => r.is_critical && !r.is_read);
          const unreadResults = results.filter(r => !r.is_read);
          const abnormalVitals = vitals.length > 0 ? (() => {
            const last = vitals[vitals.length - 1];
            const abnormals: string[] = [];
            if (isVitalAbnormal('fc', last.fc)) abnormals.push(`FC ${last.fc}`);
            if (isVitalAbnormal('pa_systolique', last.pa_systolique)) abnormals.push(`PA ${last.pa_systolique}/${last.pa_diastolique || '?'}`);
            if (isVitalAbnormal('spo2', last.spo2)) abnormals.push(`SpO2 ${last.spo2}%`);
            if (isVitalAbnormal('temperature', last.temperature)) abnormals.push(`T ${last.temperature}`);
            return abnormals;
          })() : [];
          const isCritical = (encounter.ccmu && encounter.ccmu >= 4) || criticalResults.length > 0;
          const hasAlerts = abnormalVitals.length > 0 || unreadResults.length > 0;

          if (!isCritical && !hasAlerts) return null;

          return (
            <div className={cn('mb-4 p-3 rounded-lg border flex flex-wrap items-center gap-3',
              isCritical ? 'border-medical-critical/40 bg-medical-critical/5' : 'border-medical-warning/40 bg-medical-warning/5')}>
              <AlertTriangle className={cn('h-4 w-4 shrink-0', isCritical ? 'text-medical-critical' : 'text-medical-warning')} />
              <span className={cn('text-sm font-semibold', isCritical ? 'text-medical-critical' : 'text-medical-warning')}>
                {isCritical ? 'Patient critique' : 'Points d\'attention'}
              </span>
              {criticalResults.length > 0 && (
                <Badge className="bg-medical-critical text-medical-critical-foreground text-xs">
                  {criticalResults.length} resultat(s) critique(s) non lu(s)
                </Badge>
              )}
              {abnormalVitals.length > 0 && (
                <Badge variant="outline" className="text-xs border-medical-warning/30 text-medical-warning">
                  Constantes anormales : {abnormalVitals.join(', ')}
                </Badge>
              )}
              {unreadResults.length > 0 && criticalResults.length === 0 && (
                <Badge variant="outline" className="text-xs">
                  {unreadResults.length} resultat(s) non lu(s)
                </Badge>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Timeline — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {/* Medical Notes — hidden for AS/secretaire */}
            {!isReadOnly && (
              <Card className="animate-in fade-in duration-300">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Notes médicales</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                      placeholder="Observation clinique, hypothèse diagnostique, compte-rendu..." rows={3} className="flex-1" />
                    <Button onClick={handleSaveNote} disabled={!noteContent.trim() || savingNote} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagnostic CIM-10 — hidden for AS/secretaire */}
            {!isReadOnly && (
              <Card className="animate-in fade-in duration-300" style={{ animationDelay: '25ms', animationFillMode: 'both' }}>
                <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> Diagnostic</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={diagnosticContent} onChange={e => setDiagnosticContent(e.target.value)}
                      placeholder="Diagnostic CIM-10 (ex: J18.9 — Pneumonie)" className="flex-1" />
                    <Button onClick={async () => {
                      if (!diagnosticContent.trim() || !patient || !user) return;
                      setSavingDiag(true);
                      await supabase.from('timeline_items').insert({
                        patient_id: patient.id, item_type: 'diagnostic' as any,
                        content: diagnosticContent.trim(), source_author: user.email,
                        source_date: new Date().toISOString().split('T')[0],
                      });
                      toast.success('Diagnostic enregistré');
                      setDiagnosticContent(''); setSavingDiag(false); fetchAll();
                    }} disabled={!diagnosticContent.trim() || savingDiag}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {timeline.filter(t => t.item_type === 'diagnostic').length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {timeline.filter(t => t.item_type === 'diagnostic').map(d => (
                        <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border bg-primary/5">
                          <Microscope className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium">{d.content}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{d.source_date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="animate-in fade-in duration-300" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Timeline patient</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTimelineEssential(!timelineEssential)}>
                  {timelineEssential ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                  {timelineEssential ? 'Essentiel' : 'Voir tout'}
                </Button>
              </CardHeader>
              <CardContent>
                <PatientTimeline items={timeline} showEssentialOnly={timelineEssential} />
              </CardContent>
            </Card>
          </div>

          {/* Actions — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Context indicator */}
            {dossierContext !== 'default' && (
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium',
                dossierContext === 'sortie' ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400' : 'border-primary/30 bg-primary/5 text-primary')}>
                <ScanLine className="h-3.5 w-3.5" />
                {contextLabels[dossierContext]} — sections adaptees
              </div>
            )}

            {/* Sortie quick actions — shown first when patient ready for discharge */}
            {dossierContext === 'sortie' && !isReadOnly && (
              <Card className="animate-in fade-in duration-300 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DoorOpen className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Actions de sortie</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleGenerateCRH} className="border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10">
                      <FileText className="h-4 w-4 mr-1" /> Generer CRH
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerateOrdonnance} className="border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10">
                      <FileDown className="h-4 w-4 mr-1" /> Ordonnance
                    </Button>
                    {encounter.status !== 'finished' && (
                      <Button size="sm" onClick={() => setDischargeOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                        <DoorOpen className="h-4 w-4 mr-1" /> Preparer sortie
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Antécédents + Allergies summary at TOP of right column */}
            {(patient.antecedents?.length > 0 || patient.allergies?.length > 0) && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4 space-y-3">
                  {patient.allergies?.length > 0 && (
                    <div className="p-3 rounded-lg border border-medical-critical/30 bg-medical-critical/5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="h-4 w-4 text-medical-critical" />
                        <span className="text-xs font-semibold text-medical-critical uppercase tracking-wide">Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.allergies.map((a: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-medical-critical/30 text-medical-critical text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.antecedents?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Antécédents</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.antecedents.map((a: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Traitements en cours */}
            {patient.traitements_actuels && (Array.isArray(patient.traitements_actuels) ? patient.traitements_actuels.length > 0 : Object.keys(patient.traitements_actuels).length > 0) && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4 text-medical-warning" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Traitements en cours</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(patient.traitements_actuels) ? patient.traitements_actuels : Object.entries(patient.traitements_actuels).map(([k, v]) => `${k}: ${v}`)).map((t: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs border-medical-warning/30 text-medical-warning">
                        {typeof t === 'object' ? JSON.stringify(t) : String(t)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Médecin traitant */}
            {patient.medecin_traitant && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Médecin traitant</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{patient.medecin_traitant}</p>
                </CardContent>
              </Card>
            )}

            <Card className="animate-in fade-in duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Constantes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {orderedVitalKeys.map(key => {
                    const data = vitals.map(v => ({ value: v[key] })).filter(d => d.value != null);
                    const lastVal = data.length > 0 ? data[data.length - 1].value : null;
                    const abnormal = isVitalAbnormal(key, lastVal);
                    const isPriorityVital = contextPriorityVitals.includes(key);
                    return (
                      <div key={key} className={cn('p-3 rounded-lg border', abnormal && 'border-medical-critical bg-medical-critical/5', isPriorityVital && !abnormal && 'border-primary/30 bg-primary/5')}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{vitalLabels[key]}</span>
                          <span className={cn('text-lg font-bold', abnormal && 'text-medical-critical')}>
                            {lastVal ?? '—'} <span className="text-xs font-normal">{vitalUnits[key]}</span>
                          </span>
                        </div>
                        {data.length > 1 && (
                          <ResponsiveContainer width="100%" height={30}>
                            <LineChart data={data}><YAxis hide domain={['auto', 'auto']} />
                              <Line type="monotone" dataKey="value" stroke={abnormal ? 'hsl(var(--medical-critical))' : 'hsl(var(--primary))'} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Results shown FIRST for cardio/respiratoire/infectieux contexts */}
            {showResultsFirst && !isReadOnly && renderResultsSection()}

            {!isReadOnly && (
            <Card className="animate-in fade-in duration-300" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Prescriptions</CardTitle>
                <Dialog open={prescribeOpen} onOpenChange={setPrescribeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Prescrire</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nouvelle prescription</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      {/* Intelligent pack suggestions based on motif */}
                      {encounter.motif_sfmu && (() => {
                        const motifLower = (encounter.motif_sfmu || '').toLowerCase();
                        const MOTIF_KEYWORDS: Record<string, string[]> = {
                          'Douleur thoracique': ['douleur thoracique', 'dt', 'precordialgie', 'thorax', 'cardio', 'angor', 'infarctus'],
                          'Traumatisme membre': ['traumatisme', 'trauma', 'fracture', 'entorse', 'luxation', 'chute'],
                          'Dyspnee': ['dyspnee', 'asthme', 'bronchospasme', 'detresse respiratoire', 'insuffisance respiratoire'],
                          'Douleur abdominale': ['douleur abdominale', 'abdo', 'colique', 'nephretique', 'ventre'],
                          'Intoxication': ['intoxication', 'intox', 'surdosage', 'ingestion'],
                          'AEG / Fievre': ['fievre', 'aeg', 'sepsis', 'infection', 'alteration etat general'],
                          'Malaise / syncope': ['malaise', 'syncope', 'perte connaissance', 'lipothymie'],
                        };
                        const matchedPacks: string[] = [];
                        // Exact match first
                        if (PRESCRIPTION_PACKS[encounter.motif_sfmu]) {
                          matchedPacks.push(encounter.motif_sfmu);
                        }
                        // Keyword matching
                        for (const [packKey, keywords] of Object.entries(MOTIF_KEYWORDS)) {
                          if (matchedPacks.includes(packKey)) continue;
                          if (keywords.some(kw => motifLower.includes(kw))) {
                            matchedPacks.push(packKey);
                          }
                        }
                        if (matchedPacks.length === 0) return null;
                        return (
                          <div className="space-y-2">
                            {matchedPacks.map(packKey => {
                              const pack = PRESCRIPTION_PACKS[packKey];
                              if (!pack) return null;
                              return (
                                <div key={packKey} className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                                  <p className="text-xs font-semibold text-primary mb-2">Pack suggere — {packKey}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{pack.items.length} items</Badge>
                                    <Button size="sm" className="h-7 text-xs" onClick={() => handleApplyPack(packKey)}>
                                      Prescrire "{pack.label}"
                                    </Button>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {pack.items.map((item, i) => (
                                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-accent">{PRESCRIPTION_TYPE_ICONS[item.type]} {item.medication_name}</span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Smart suggestions based on latest vitals */}
                      {vitals.length > 0 && (() => {
                        const lastVitals = vitals[vitals.length - 1];
                        const motifLower = (encounter.motif_sfmu || '').toLowerCase();
                        const suggestions: Array<{ label: string; reason: string; action: () => void }> = [];

                        // SpO2 < 92% → suggest O2
                        if (lastVitals.spo2 != null && lastVitals.spo2 < 92) {
                          suggestions.push({
                            label: 'Oxygenotherapie',
                            reason: `SpO2 ${lastVitals.spo2}% < 92%`,
                            action: () => { setRxType('oxygene'); setRxMeta({ o2_device: 'Masque HC', o2_debit: '6L/min', o2_target: 'SpO2 > 94%' }); },
                          });
                        }

                        // EVA > 6 → suggest analgesic
                        if (lastVitals.eva_douleur != null && lastVitals.eva_douleur > 6) {
                          suggestions.push({
                            label: 'Antalgique (EVA elevee)',
                            reason: `EVA ${lastVitals.eva_douleur}/10`,
                            action: () => { setRxType('titration'); setNewRx(prev => ({ ...prev, medication_name: 'Morphine', route: 'IV' })); setRxMeta({ titration_dose_init: 2, titration_step: 2, titration_dose_max: 10, titration_interval: '5 min', titration_target: 'EVA < 4' }); },
                          });
                        }

                        // FC > 120 + motif DT → suggest troponine urgente + ECG
                        if (lastVitals.fc != null && lastVitals.fc > 120 && ['douleur thoracique', 'dt', 'precordialgie', 'angor'].some(k => motifLower.includes(k))) {
                          suggestions.push({
                            label: 'Troponine urgente + ECG',
                            reason: `FC ${lastVitals.fc} bpm + contexte DT`,
                            action: () => { setRxType('exam_bio'); setSelectedExams(['Troponine', 'CPK']); setRxMeta({ exam_urgency: 'urgent' }); setNewRx(prev => ({ ...prev, priority: 'stat' })); },
                          });
                        }

                        // Temperature > 38.5 → suggest bilan infectieux
                        if (lastVitals.temperature != null && lastVitals.temperature > 38.5) {
                          suggestions.push({
                            label: 'Bilan infectieux',
                            reason: `T° ${lastVitals.temperature}°C`,
                            action: () => { setRxType('exam_bio'); setSelectedExams(['NFS', 'CRP', 'Hemocultures', 'ECBU', 'Lactates']); setRxMeta({ exam_urgency: 'urgent' }); },
                          });
                        }

                        // PA systolique < 90 → suggest remplissage
                        if (lastVitals.pa_systolique != null && lastVitals.pa_systolique < 90) {
                          suggestions.push({
                            label: 'Remplissage vasculaire',
                            reason: `PAS ${lastVitals.pa_systolique} mmHg`,
                            action: () => { setRxType('perfusion'); setNewRx(prev => ({ ...prev, medication_name: 'NaCl 0.9%', dosage: '500mL' })); setRxMeta({ debit: '500 mL/h', duration: 'Bolus' }); setNewRx(prev => ({ ...prev, priority: 'stat' })); },
                          });
                        }

                        if (suggestions.length === 0) return null;
                        return (
                          <div className="p-3 rounded-lg border border-orange-400/30 bg-orange-50 dark:bg-orange-950/20">
                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" /> Suggestions basees sur les constantes
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {suggestions.map((s, i) => (
                                <button key={i} type="button" onClick={s.action}
                                  className="px-2 py-1 rounded border border-orange-300 dark:border-orange-600 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left">
                                  <span className="font-medium">{s.label}</span>
                                  <span className="text-orange-500 dark:text-orange-400 ml-1">({s.reason})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Type selector */}
                      <div>
                        <Label>Type de prescription</Label>
                        <Select value={rxType} onValueChange={v => { setRxType(v as PrescriptionType); setRxMeta({}); setSelectedExams([]); }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRESCRIPTION_TYPE_GROUPS.map(group => (
                              <div key={group.label}>
                                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{group.label}</p>
                                {group.types.map(t => (
                                  <SelectItem key={t} value={t}>{PRESCRIPTION_TYPE_ICONS[t]} {PRESCRIPTION_TYPE_LABELS[t]}</SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* ADAPTIVE FORM FIELDS */}
                      {(rxType === 'medicament' || rxType === 'perfusion' || rxType === 'titration' || rxType === 'conditionnel') && (
                        <>
                          <div>
                            <Label>Medicament</Label>
                            <Input value={newRx.medication_name} onChange={e => handleMedNameChange(e.target.value)} placeholder="Nom DCI" />
                            {allergyWarning.length > 0 && (
                              <div className="mt-1 p-2 rounded bg-red-50 border border-red-200 dark:bg-red-950/20">
                                <p className="text-xs font-bold text-red-600"><AlertTriangle className="h-3 w-3 inline mr-1" />ALLERGIE: {allergyWarning.join(', ')}</p>
                              </div>
                            )}
                          </div>
                          {drugInteractions.length > 0 && (
                            <div className="space-y-1">
                              {drugInteractions.filter(i => i.level === 'warning').map((i, idx) => (
                                <div key={idx} className="p-2 rounded bg-orange-50 border border-orange-200 dark:bg-orange-950/20">
                                  <p className="text-xs font-semibold text-orange-600"><AlertTriangle className="h-3 w-3 inline mr-1" />{i.message}</p>
                                </div>
                              ))}
                              {drugInteractions.some(i => i.level === 'warning') && !interactionConfirmed && (
                                <Button variant="outline" size="sm" className="w-full text-xs border-orange-300 text-orange-600" onClick={() => setInteractionConfirmed(true)}>
                                  Confirmer malgre les interactions
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {rxType === 'medicament' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div><Label>Dose</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="1g" /></div>
                            <div>
                              <Label>Voie</Label>
                              <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{EXTENDED_MED_ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div><Label>Frequence</Label><Input value={newRx.frequency} onChange={e => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="q6h" /></div>
                          </div>
                        </>
                      )}

                      {rxType === 'perfusion' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div><Label>Volume (mL)</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="500mL" /></div>
                            <div><Label>Debit (mL/h)</Label><Input value={rxMeta.debit || ''} onChange={e => setRxMeta({ ...rxMeta, debit: e.target.value })} placeholder="125 mL/h" /></div>
                          </div>
                          <div><Label>Duree</Label><Input value={rxMeta.duration || ''} onChange={e => setRxMeta({ ...rxMeta, duration: e.target.value })} placeholder="4h" /></div>
                        </>
                      )}

                      {rxType === 'titration' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Voie</Label>
                              <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{['IV', 'SC', 'IVSE'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div><Label>Dose initiale (mg)</Label><Input type="number" value={rxMeta.titration_dose_init || ''} onChange={e => setRxMeta({ ...rxMeta, titration_dose_init: parseFloat(e.target.value) })} placeholder="2" /></div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><Label>Palier (mg)</Label><Input type="number" value={rxMeta.titration_step || ''} onChange={e => setRxMeta({ ...rxMeta, titration_step: parseFloat(e.target.value) })} placeholder="2" /></div>
                            <div><Label>Dose max (mg)</Label><Input type="number" value={rxMeta.titration_dose_max || ''} onChange={e => setRxMeta({ ...rxMeta, titration_dose_max: parseFloat(e.target.value) })} placeholder="10" /></div>
                            <div><Label>Intervalle</Label><Input value={rxMeta.titration_interval || ''} onChange={e => setRxMeta({ ...rxMeta, titration_interval: e.target.value })} placeholder="5 min" /></div>
                          </div>
                          <div><Label>Objectif</Label><Input value={rxMeta.titration_target || ''} onChange={e => setRxMeta({ ...rxMeta, titration_target: e.target.value })} placeholder="EVA < 4" /></div>
                        </>
                      )}

                      {rxType === 'conditionnel' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div><Label>Dose</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="3mg" /></div>
                            <div>
                              <Label>Voie</Label>
                              <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{EXTENDED_MED_ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div><Label>Max doses</Label><Input type="number" value={rxMeta.condition_max_doses || ''} onChange={e => setRxMeta({ ...rxMeta, condition_max_doses: parseInt(e.target.value) })} placeholder="3" /></div>
                          </div>
                          <div>
                            <Label>Condition</Label>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {['si EVA > 6', 'si T > 38.5', 'si PAS > 180', 'si nausees', 'si agitation'].map(c => (
                                <button key={c} type="button" onClick={() => setRxMeta({ ...rxMeta, condition_trigger: c })}
                                  className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.condition_trigger === c ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{c}</button>
                              ))}
                            </div>
                            <Input value={rxMeta.condition_trigger || ''} onChange={e => setRxMeta({ ...rxMeta, condition_trigger: e.target.value })} placeholder="si EVA > 6" />
                          </div>
                          <div><Label>Intervalle min entre doses</Label><Input value={rxMeta.condition_interval || ''} onChange={e => setRxMeta({ ...rxMeta, condition_interval: e.target.value })} placeholder="4h" /></div>
                        </>
                      )}

                      {rxType === 'oxygene' && (
                        <>
                          <div>
                            <Label>Dispositif</Label>
                            <Select value={rxMeta.o2_device || ''} onValueChange={v => setRxMeta({ ...rxMeta, o2_device: v })}>
                              <SelectTrigger><SelectValue placeholder="Selectionner..." /></SelectTrigger>
                              <SelectContent>{O2_DEVICES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><Label>Debit</Label><Input value={rxMeta.o2_debit || ''} onChange={e => setRxMeta({ ...rxMeta, o2_debit: e.target.value })} placeholder="6L/min" /></div>
                            <div>
                              <Label>Cible SpO2</Label>
                              <Select value={rxMeta.o2_target || ''} onValueChange={v => setRxMeta({ ...rxMeta, o2_target: v })}>
                                <SelectTrigger><SelectValue placeholder="Cible..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SpO2 > 94%">SpO2 &gt; 94%</SelectItem>
                                  <SelectItem value="SpO2 88-92% (BPCO)">SpO2 88-92% (BPCO)</SelectItem>
                                  <SelectItem value="SpO2 > 96%">SpO2 &gt; 96%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}

                      {rxType === 'exam_bio' && (
                        <div className="space-y-2">
                          <Label>Examens biologiques</Label>
                          {EXAM_BIO_CATEGORIES.map(cat => (
                            <div key={cat.label}>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {cat.items.map(item => (
                                  <label key={item} className={cn('flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer transition-colors',
                                    selectedExams.includes(item) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>
                                    <input type="checkbox" className="sr-only" checked={selectedExams.includes(item)}
                                      onChange={e => setSelectedExams(e.target.checked ? [...selectedExams, item] : selectedExams.filter(x => x !== item))} />
                                    {item}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div>
                            <Label>Urgence</Label>
                            <Select value={rxMeta.exam_urgency || 'urgent'} onValueChange={v => setRxMeta({ ...rxMeta, exam_urgency: v as 'urgent' | 'normal' })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {rxType === 'exam_imagerie' && (
                        <div className="space-y-2">
                          <Label>Type d'imagerie</Label>
                          {EXAM_IMAGERIE_CATEGORIES.map(cat => (
                            <div key={cat.label}>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
                              <div className="flex flex-wrap gap-1">
                                {cat.items.map(item => (
                                  <button key={item} type="button" onClick={() => setRxMeta({ ...rxMeta, exam_site: item })}
                                    className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors',
                                      rxMeta.exam_site === item ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>{item}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div><Label>Indication</Label><Input value={rxMeta.exam_indication || ''} onChange={e => setRxMeta({ ...rxMeta, exam_indication: e.target.value })} placeholder="Indication clinique..." /></div>
                        </div>
                      )}

                      {rxType === 'exam_ecg' && (
                        <p className="text-sm text-muted-foreground p-3 rounded bg-accent/30">ECG 12 derivations sera prescrit</p>
                      )}

                      {rxType === 'surveillance' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label>Type</Label><Input value={rxMeta.surveillance_type || ''} onChange={e => setRxMeta({ ...rxMeta, surveillance_type: e.target.value })} placeholder="scope + SpO2" /></div>
                          <div>
                            <Label>Frequence</Label>
                            <Select value={rxMeta.surveillance_frequency || 'continue'} onValueChange={v => setRxMeta({ ...rxMeta, surveillance_frequency: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['continue', 'horaire', 'q30min', 'q2h', 'q4h'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {rxType === 'avis_specialise' && (
                        <>
                          <div>
                            <Label>Specialite</Label>
                            <Select value={rxMeta.avis_speciality || ''} onValueChange={v => setRxMeta({ ...rxMeta, avis_speciality: v })}>
                              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                              <SelectContent>{AVIS_SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div><Label>Motif</Label><Textarea value={rxMeta.avis_motif || ''} onChange={e => setRxMeta({ ...rxMeta, avis_motif: e.target.value })} placeholder="Motif de l'avis..." rows={2} /></div>
                          <div>
                            <Label>Urgence</Label>
                            <Select value={rxMeta.avis_urgency || 'rapide'} onValueChange={v => setRxMeta({ ...rxMeta, avis_urgency: v as 'urgent' | 'rapide' | 'programme' })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="rapide">Rapide</SelectItem>
                                <SelectItem value="programme">Programme</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {rxType === 'regime' && (
                        <div>
                          <Label>Details</Label>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {['A jeun strict', 'Regime sans sel', 'Boissons libres'].map(r => (
                              <button key={r} type="button" onClick={() => setRxMeta({ ...rxMeta, regime_details: r })}
                                className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.regime_details === r ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{r}</button>
                            ))}
                          </div>
                          <Input value={rxMeta.regime_details || ''} onChange={e => setRxMeta({ ...rxMeta, regime_details: e.target.value })} />
                        </div>
                      )}

                      {rxType === 'mobilisation' && (
                        <div>
                          <Label>Details</Label>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {['Repos strict au lit', 'Lever autorise avec aide', 'Pas d\'appui MIG', 'Pas d\'appui MID'].map(m => (
                              <button key={m} type="button" onClick={() => setRxMeta({ ...rxMeta, mobilisation_details: m })}
                                className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.mobilisation_details === m ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{m}</button>
                            ))}
                          </div>
                          <Input value={rxMeta.mobilisation_details || ''} onChange={e => setRxMeta({ ...rxMeta, mobilisation_details: e.target.value })} />
                        </div>
                      )}

                      {rxType === 'dispositif' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label>Dispositif</Label><Input value={rxMeta.device_name || ''} onChange={e => setRxMeta({ ...rxMeta, device_name: e.target.value })} placeholder="Attelle, minerve..." /></div>
                          <div><Label>Details</Label><Input value={rxMeta.device_details || ''} onChange={e => setRxMeta({ ...rxMeta, device_details: e.target.value })} placeholder="Pied G, taille M..." /></div>
                        </div>
                      )}

                      {/* Priority for all types */}
                      <div>
                        <Label>Priorite</Label>
                        <Select value={newRx.priority} onValueChange={v => setNewRx({ ...newRx, priority: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="stat">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handlePrescribe} className="w-full" disabled={allergyWarning.length > 0 || (drugInteractions.some(i => i.level === 'warning') && !interactionConfirmed)}>
                        {PRESCRIPTION_TYPE_ICONS[rxType]} Valider la prescription
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini-résumé par catégorie */}
                {prescriptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {PRESCRIPTION_SECTIONS.filter(s => rxGroups[s.key as keyof typeof rxGroups].length > 0).map(s => (
                      <Badge key={s.key} variant="outline" className="text-xs gap-1">
                        {s.icon} {s.label} ({rxGroups[s.key as keyof typeof rxGroups].length})
                      </Badge>
                    ))}
                  </div>
                )}
                {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucune prescription</p>}
                {PRESCRIPTION_SECTIONS.filter(s => rxGroups[s.key as keyof typeof rxGroups].length > 0).map(s => (
                  <div key={s.key}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">{s.icon} {s.label}</p>
                    <div className="space-y-2">
                      {rxGroups[s.key as keyof typeof rxGroups].map((rx: any) => (
                        <div key={rx.id} className={cn('p-3 rounded-lg border flex items-center justify-between animate-in fade-in duration-200',
                          rx.priority === 'stat' && rx.status === 'active' && 'border-medical-critical/30 animate-pulse',
                          rx.priority === 'urgent' && rx.status === 'active' && 'border-medical-warning/30',
                          rx.status === 'completed' && 'opacity-60',
                          rx.status === 'cancelled' && 'opacity-40 line-through',
                          rx.status === 'suspended' && 'opacity-50 bg-muted/30')}>
                          <div>
                            <p className={cn('font-medium text-sm', rx.status === 'cancelled' && 'line-through')}>{rx.medication_name} — {rx.dosage}</p>
                            <p className="text-xs text-muted-foreground">{rx.route} · {rx.frequency || 'Ponctuel'}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {rx.status === 'active' && (
                              <>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-warning" onClick={() => handleSuspendPrescription(rx.id)}>
                                  Suspendre
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-critical" onClick={() => handleCancelPrescription(rx.id)}>
                                  Annuler
                                </Button>
                              </>
                            )}
                            {rx.status === 'suspended' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-success" onClick={() => handleReactivatePrescription(rx.id)}>
                                Réactiver
                              </Button>
                            )}
                            <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}
                              className={cn(rx.status === 'suspended' && 'bg-medical-warning/10 text-medical-warning border-medical-warning/30')}>
                              {rx.status === 'active' ? 'Active' : rx.status === 'completed' ? 'Administré' : rx.status === 'cancelled' ? 'Annulée' : rx.status === 'suspended' ? 'Suspendue' : rx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            )}

            {/* Results shown AFTER prescriptions for default/trauma/sortie contexts */}
            {!showResultsFirst && !isReadOnly && renderResultsSection()}
          </div>
        </div>
      </div>

      {/* Floating Recap FAB */}
      {encounterId && <RecapDrawer encounterId={encounterId} />}

      {/* FHIR Export Drawer */}
      <Sheet open={fhirDrawerOpen} onOpenChange={setFhirDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Export FHIR R4</SheetTitle>
          </SheetHeader>
          {fhirBundle && <FHIRViewer bundle={fhirBundle} title={`Bundle FHIR — ${patient.nom} ${patient.prenom}`} />}
        </SheetContent>
      </Sheet>

      {/* CRH Preview Drawer */}
      <Sheet open={crhDrawerOpen} onOpenChange={setCrhDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Compte-rendu de passage</SheetTitle>
          </SheetHeader>
          {crhHTML && (
            <CRHPreview
              htmlContent={crhHTML}
              status={crhStatus}
              onSign={handleSignCRH}
              onSendMSSante={handleSendMSSante}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Ordonnance Preview Drawer */}
      <Sheet open={ordonnanceDrawerOpen} onOpenChange={setOrdonnanceDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Ordonnance de sortie</SheetTitle>
          </SheetHeader>
          {ordonnanceHTML && (
            <CRHPreview
              htmlContent={ordonnanceHTML}
              status="draft"
              onSign={() => toast.success('Ordonnance signee')}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
