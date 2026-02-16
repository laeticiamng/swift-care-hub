import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PatientBanner } from '@/components/urgence/PatientBanner';
import { OnboardingBanner } from '@/components/urgence/OnboardingBanner';
import { calculateAge, isVitalAbnormal } from '@/lib/vitals-utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StatCard } from '@/components/urgence/StatCard';
import { Check, Plus, FlaskConical, Image, ChevronDown, ChevronUp, Eye, History, Loader2, Pill, ClipboardList, Activity, Phone, ArrowUp, Droplets, Wind, Stethoscope, Pin } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { toast } from 'sonner';
import { guardAdministration, guardClinical } from '@/lib/server-role-guard';
import { RecapDrawer } from '@/components/urgence/RecapDrawer';
import { trackAdministrationTap } from '@/lib/kpi-tracker';
import {
  parsePrescriptionMeta,
  getPancarteSection,
  PANCARTE_SECTION_ORDER,
  PANCARTE_SECTION_LABELS,
  PANCARTE_SECTION_ICONS,
  PRESCRIPTION_TYPE_ICONS,
  hasAdminAction,
  type PrescriptionMetadata,
  type PancarteSection,
} from '@/lib/prescription-types';

export default function PancartePage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [encounter, setEncounter] = useState<Record<string, unknown> | null>(null);
  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [vitals, setVitals] = useState<Record<string, unknown>[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, unknown>[]>([]);
  const [administrations, setAdministrations] = useState<Record<string, unknown>[]>([]);
  const [procedures, setProcedures] = useState<Record<string, unknown>[]>([]);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [transmissions, setTransmissions] = useState<Record<string, unknown>[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);

  const [showVitalsInput, setShowVitalsInput] = useState(false);
  const [newVitals, setNewVitals] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
  const [procType, setProcType] = useState('');
  const [darResultats, setDarResultats] = useState('');
  const [darCible, setDarCible] = useState('');

  // Adaptive admin state
  const [titrationDoses, setTitrationDoses] = useState<Record<string, string>>({});
  const [titrationEvas, setTitrationEvas] = useState<Record<string, string>>({});
  const [lotNumbers, setLotNumbers] = useState<Record<string, string>>({});
  const [avisNotes, setAvisNotes] = useState<Record<string, string>>({});
  const [debitEdits, setDebitEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
    const channel = supabase.channel('pancarte-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'administrations', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [encounterId]);

  const fetchAll = async () => {
    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId!).single();
    if (!enc) return;
    setEncounter(enc);
    const [patRes, vitRes, rxRes, admRes, procRes, resRes, transRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', enc.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId!).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId!).order('created_at', { ascending: false }),
      supabase.from('administrations').select('*').eq('encounter_id', encounterId!).order('administered_at', { ascending: false }),
      supabase.from('procedures').select('*').eq('encounter_id', encounterId!).order('performed_at', { ascending: false }),
      supabase.from('results').select('*').eq('encounter_id', encounterId!).order('received_at', { ascending: false }),
      supabase.from('transmissions').select('*').eq('encounter_id', encounterId!).order('created_at', { ascending: false }),
    ]);
    if (patRes.data) setPatient(patRes.data);
    if (vitRes.data) setVitals(vitRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (admRes.data) setAdministrations(admRes.data);
    if (procRes.data) setProcedures(procRes.data);
    if (resRes.data) setResults(resRes.data);
    if (transRes.data) setTransmissions(transRes.data);
    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }
  };

  // ── Admin handlers ──
  const handleAdminister = async (rx: Record<string, unknown>, doseGiven?: string, adminNotes?: string) => {
    if (!user || !encounter) return;
    // Server-side role verification before administration mutation
    const check = await guardAdministration();
    if (!check.authorized) { toast.error(check.error || 'Non autorisé à administrer'); return; }
    trackAdministrationTap(rx.id);
    const dose = doseGiven || titrationDoses[rx.id] || rx.dosage;
    const lot = lotNumbers[rx.id] || '';
    const notes = adminNotes || (lot ? `lot:${lot}` : null);
    await supabase.from('administrations').insert({
      prescription_id: rx.id, encounter_id: encounter.id, patient_id: encounter.patient_id,
      administered_by: user.id, dose_given: dose, route: rx.route, notes,
    });
    const meta = parsePrescriptionMeta(rx);
    // Only mark completed for single-dose meds, not titrations/conditionals
    if (meta.type === 'medicament' || meta.type === 'exam_ecg') {
      await supabase.from('prescriptions').update({ status: 'completed' }).eq('id', rx.id);
    }
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'administration', resource_type: 'prescription',
      resource_id: rx.id, details: { medication: rx.medication_name, dosage: dose },
    });
    toast.success(`${rx.medication_name || 'Acte'} — ${dose || 'fait'}`);
    setTitrationDoses(prev => { const n = { ...prev }; delete n[rx.id]; return n; });
    setTitrationEvas(prev => { const n = { ...prev }; delete n[rx.id]; return n; });
    setLotNumbers(prev => { const n = { ...prev }; delete n[rx.id]; return n; });
    fetchAll();
  };

  const handleUpdateExamStatus = async (rx: Record<string, unknown>, meta: PrescriptionMetadata, newStatus: string) => {
    const updatedMeta = { ...meta, exam_status: newStatus };
    await supabase.from('prescriptions').update({ notes: JSON.stringify(updatedMeta) }).eq('id', rx.id);
    if (newStatus === 'realise' || newStatus === 'resultat_recu') {
      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: user.id, action: `exam_${newStatus}`, resource_type: 'prescription', resource_id: rx.id,
        });
      }
    }
    toast.success(`Statut mis a jour: ${newStatus.replace('_', ' ')}`);
    fetchAll();
  };

  const handleUpdateAvisStatus = async (rx: Record<string, unknown>, meta: PrescriptionMetadata, newStatus: string) => {
    const updatedMeta = { ...meta, avis_status: newStatus, avis_notes: avisNotes[rx.id] || meta.avis_notes };
    await supabase.from('prescriptions').update({ notes: JSON.stringify(updatedMeta) }).eq('id', rx.id);
    toast.success(`Avis: ${newStatus.replace('_', ' ')}`);
    setAvisNotes(prev => { const n = { ...prev }; delete n[rx.id]; return n; });
    fetchAll();
  };

  const handleUpdateDeviceStatus = async (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    const updatedMeta = { ...meta, device_status: 'pose' as const };
    await supabase.from('prescriptions').update({ notes: JSON.stringify(updatedMeta) }).eq('id', rx.id);
    toast.success(`${meta.device_name || rx.medication_name} pose`);
    fetchAll();
  };

  const handleSaveVitals = async () => {
    if (!user || !encounter) return;
    const obj: Record<string, unknown> = { encounter_id: encounter.id, patient_id: encounter.patient_id, recorded_by: user.id };
    if (newVitals.fc) obj.fc = parseInt(newVitals.fc);
    if (newVitals.pa_systolique) obj.pa_systolique = parseInt(newVitals.pa_systolique);
    if (newVitals.pa_diastolique) obj.pa_diastolique = parseInt(newVitals.pa_diastolique);
    if (newVitals.spo2) obj.spo2 = parseInt(newVitals.spo2);
    if (newVitals.temperature) obj.temperature = parseFloat(newVitals.temperature);
    if (newVitals.frequence_respiratoire) obj.frequence_respiratoire = parseInt(newVitals.frequence_respiratoire);
    if (newVitals.gcs) obj.gcs = parseInt(newVitals.gcs);
    if (newVitals.eva_douleur) obj.eva_douleur = parseInt(newVitals.eva_douleur);
    await supabase.from('vitals').insert(obj as Record<string, unknown>);
    toast.success('Constantes enregistrees');
    setNewVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
    setShowVitalsInput(false);
    fetchAll();
  };

  const handleProcedure = async () => {
    if (!user || !encounter || !procType) return;
    const procCheck = await guardClinical();
    if (!procCheck.authorized) { toast.error(procCheck.error || 'Non autorisé'); return; }
    await supabase.from('procedures').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id,
      performed_by: user.id, procedure_type: procType as string,
    });
    const procLabels: Record<string, string> = { vvp: 'VVP', prelevement: 'Prelevement', pansement: 'Pansement', sondage: 'Sondage', ecg: 'ECG', autre: 'Acte' };
    toast.success(`${procLabels[procType] || 'Acte'} trace`);
    setProcType('');
    fetchAll();
  };

  const handleDAR = async () => {
    if (!user || !encounter) return;
    const lv = vitals.length > 0 ? vitals[vitals.length - 1] : null;
    const donneesAuto = lv
      ? `FC ${lv.fc || '—'} | PA ${lv.pa_systolique || '—'}/${lv.pa_diastolique || '—'} | SpO2 ${lv.spo2 || '—'}% | T ${lv.temperature || '—'}°C${lv.eva_douleur != null ? ` | EVA ${lv.eva_douleur}` : ''}`
      : 'Pas de constantes';
    const actionsAuto = [
      ...administrations.slice(0, 3).map(a => `${a.dose_given} ${a.route}`),
      ...procedures.slice(0, 3).map(p => p.procedure_type.toUpperCase()),
    ].join(' | ') || 'Aucun acte';
    await supabase.from('transmissions').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id, author_id: user.id,
      donnees: donneesAuto, actions: actionsAuto, resultats: darResultats, cible: darCible,
    });
    toast.success('Transmission validee');
    setDarResultats('');
    setDarCible('');
    fetchAll();
  };

  const handleMarkRead = async (resultId: string) => {
    await supabase.from('results').update({ is_read: true }).eq('id', resultId);
    fetchAll();
  };

  if (!patient || !encounter) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const age = calculateAge(patient.date_naissance);
  const newResults = results.filter(r => !r.is_read).length;
  const activeRx = prescriptions.filter(rx => rx.status === 'active').length;
  const lastVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  // ── Group prescriptions by pancarte section ──
  const rxWithMeta = prescriptions.map(rx => ({ rx, meta: parsePrescriptionMeta(rx) }));
  const sectionGroups: Record<PancarteSection, Array<{ rx: Record<string, unknown>; meta: PrescriptionMetadata }>> = {
    oxygene_surveillance: [],
    perfusions: [],
    titrations: [],
    medicaments: [],
    conditionnels: [],
    examens: [],
    avis: [],
    consignes: [],
  };
  for (const item of rxWithMeta) {
    const section = getPancarteSection(item.meta);
    sectionGroups[section].push(item);
  }

  const getRxAdmins = (rxId: string) => administrations.filter(a => a.prescription_id === rxId);
  const isRxDone = (rx: Record<string, unknown>) => rx.status === 'completed';

  // ── Section icons ──
  const sectionLucideIcons: Record<PancarteSection, React.ReactNode> = {
    oxygene_surveillance: <Wind className="h-4 w-4" />,
    perfusions: <Droplets className="h-4 w-4" />,
    titrations: <ArrowUp className="h-4 w-4" />,
    medicaments: <Pill className="h-4 w-4" />,
    conditionnels: <Stethoscope className="h-4 w-4" />,
    examens: <FlaskConical className="h-4 w-4" />,
    avis: <Phone className="h-4 w-4" />,
    consignes: <Pin className="h-4 w-4" />,
  };

  // ── Render a perfusion card ──
  const renderPerfusion = (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    const total = meta.volume_total || parseFloat(rx.dosage) || 500;
    const passed = meta.volume_passed || 0;
    const pct = Math.min(100, Math.round((passed / total) * 100));
    const done = isRxDone(rx);
    return (
      <div key={rx.id} className={cn('p-4 rounded-xl border bg-card transition-all', done && 'opacity-60')}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-sm">{PRESCRIPTION_TYPE_ICONS.perfusion} {rx.medication_name} {rx.dosage}</p>
            <p className="text-xs text-muted-foreground">{meta.debit}{meta.duration ? ` — ${meta.duration}` : ''}</p>
          </div>
          {done ? (
            <Badge className="bg-green-600 text-white">Termine</Badge>
          ) : (
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAdminister(rx, 'debit modifie')}>Modifier debit</Button>
              <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleAdminister(rx, `${total}mL termine`); }}>Termine</Button>
            </div>
          )}
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{passed}/{total} mL</span>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
        {meta.started_at && (
          <p className="text-xs text-muted-foreground mt-1">Debute {new Date(meta.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        )}
      </div>
    );
  };

  // ── Render a titration card ──
  const renderTitration = (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    const cumulated = meta.titration_cumulated || 0;
    const max = meta.titration_dose_max || 10;
    const step = meta.titration_step || 2;
    const pct = Math.min(100, Math.round((cumulated / max) * 100));
    const nextDose = Math.min(step, max - cumulated);
    const admins = getRxAdmins(rx.id);
    const lastAdmin = admins[0];
    let lastEva: string | null = null;
    if (lastAdmin?.notes) {
      try { const n = JSON.parse(lastAdmin.notes); lastEva = n.eva_before?.toString() || null; } catch { /* ignore */ }
    }
    const atMax = cumulated >= max;

    return (
      <div key={rx.id} className={cn('p-4 rounded-xl border bg-card transition-all', atMax && 'border-orange-300')}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-sm">{PRESCRIPTION_TYPE_ICONS.titration} {rx.medication_name}</p>
            <p className="text-xs text-muted-foreground">Obj: {meta.titration_target} — Palier {step}mg / {meta.titration_interval}</p>
          </div>
          {atMax ? (
            <Badge variant="outline" className="border-orange-400 text-orange-600">Dose max atteinte</Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={titrationEvas[rx.id] ?? ''}
                onChange={e => setTitrationEvas(prev => ({ ...prev, [rx.id]: e.target.value }))}
                className="w-16 h-9 text-xs text-center"
                placeholder="EVA"
                type="number"
              />
              <Button
                size="sm"
                className="h-9 min-w-[80px] bg-green-600 hover:bg-green-700 text-white font-bold active:scale-95 transition-all"
                onClick={() => {
                  const eva = titrationEvas[rx.id] || '';
                  handleAdminister(rx, `${nextDose}mg`, JSON.stringify({ eva_before: eva ? parseInt(eva) : null, titration_step: admins.length + 1 }));
                }}
              >
                +{nextDose}mg
              </Button>
            </div>
          )}
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-500', pct >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600')} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Cumule: {cumulated}/{max}mg</span>
          {lastAdmin && (
            <span className="text-xs text-muted-foreground">
              Dernier: {lastAdmin.dose_given} a {new Date(lastAdmin.administered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {lastEva && ` — EVA ${lastEva}`}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ── Render O2/Surveillance banner ──
  const renderOxySurveillance = (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    if (meta.type === 'oxygene') {
      const currentSpO2 = lastVital?.spo2;
      const target = meta.o2_target || '';
      const targetVal = parseInt(target.replace(/[^0-9]/g, '')) || 94;
      const isOk = currentSpO2 && currentSpO2 >= targetVal;
      return (
        <div key={rx.id} className={cn('p-3 rounded-lg border flex items-center justify-between', isOk ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200')}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{PRESCRIPTION_TYPE_ICONS.oxygene}</span>
            <div>
              <p className="font-medium text-sm">O2 {meta.o2_device} {meta.o2_debit}</p>
              <p className="text-xs text-muted-foreground">Cible: {meta.o2_target} — SpO2 actuelle: <span className={cn('font-bold', isOk ? 'text-green-600' : 'text-red-600')}>{currentSpO2 ?? '—'}%</span> {isOk ? '\u2713' : '\u2717'}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-8 text-xs">Modifier</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-300">Sevrer</Button>
          </div>
        </div>
      );
    }
    // Surveillance
    return (
      <div key={rx.id} className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{PRESCRIPTION_TYPE_ICONS.surveillance}</span>
          <div>
            <p className="font-medium text-sm">{meta.surveillance_type || rx.medication_name}</p>
            <p className="text-xs text-muted-foreground">Frequence: {meta.surveillance_frequency || 'continue'}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-blue-300 text-blue-600">En place</Badge>
      </div>
    );
  };

  // ── Render medication line ──
  const renderMedicament = (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    const admins = getRxAdmins(rx.id);
    const done = isRxDone(rx) || admins.length > 0;
    const isSuspended = rx.status === 'suspended';
    const isCancelled = rx.status === 'cancelled';
    const isInactive = isSuspended || isCancelled;
    return (
      <div key={rx.id} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
        done ? 'bg-green-50 dark:bg-green-950/20 border-green-200/40' : isInactive ? 'bg-muted/50 opacity-70' : 'bg-card',
        rx.priority === 'stat' && !done && !isInactive && 'border-red-300 animate-pulse',
        rx.priority === 'urgent' && !done && !isInactive && 'border-orange-300',
      )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{PRESCRIPTION_TYPE_ICONS.medicament}</span>
            <p className={cn('font-medium text-sm', isCancelled && 'line-through text-muted-foreground')}>{rx.medication_name} {rx.dosage}</p>
            {rx.priority === 'stat' && !done && <Badge className="bg-red-600 text-white text-[10px]">STAT</Badge>}
            {rx.priority === 'urgent' && !done && <Badge className="bg-orange-500 text-white text-[10px]">URG</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{rx.route} {rx.frequency ? `· ${rx.frequency}` : '· Ponctuel'}</p>
        </div>
        {done ? (
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <Badge className="bg-green-600 text-white"><Check className="h-3 w-3 mr-1" /> Fait</Badge>
            {admins[0] && (
              <span className="text-xs text-muted-foreground">
                {new Date(admins[0].administered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {admins[0].dose_given}
              </span>
            )}
          </div>
        ) : isSuspended ? (
          <Badge variant="secondary">Suspendue</Badge>
        ) : isCancelled ? (
          <Badge variant="outline" className="line-through">Annulee</Badge>
        ) : (
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <Button size="lg" onClick={() => handleAdminister(rx)}
              className="touch-target min-h-[48px] px-5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all">
              <Check className="h-5 w-5 mr-1" /> Administre
            </Button>
            <div className="flex items-center gap-1">
              <Input value={titrationDoses[rx.id] ?? rx.dosage} onChange={e => setTitrationDoses(prev => ({ ...prev, [rx.id]: e.target.value }))}
                className="w-16 h-6 text-[10px] text-center" placeholder="Dose" />
              <Input value={lotNumbers[rx.id] ?? ''} onChange={e => setLotNumbers(prev => ({ ...prev, [rx.id]: e.target.value }))}
                className="w-16 h-6 text-[10px] text-center" placeholder="Lot" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Render conditionnel line ──
  const renderConditionnel = (rx: Record<string, unknown>, meta: PrescriptionMetadata) => {
    const maxDoses = meta.condition_max_doses || 99;
    const dosesGiven = meta.condition_doses_given || 0;
    const remaining = maxDoses - dosesGiven;
    const admins = getRxAdmins(rx.id);
    const lastAdmin = admins[0];
    let nextAvailable: Date | null = null;
    if (lastAdmin && meta.condition_interval) {
      const hours = parseInt(meta.condition_interval);
      if (!isNaN(hours)) {
        nextAvailable = new Date(new Date(lastAdmin.administered_at).getTime() + hours * 3600000);
      }
    }
    const isAvailable = !nextAvailable || nextAvailable <= new Date();
    const canAdmin = remaining > 0 && isAvailable;
    return (
      <div key={rx.id} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all', !canAdmin && 'opacity-60 bg-muted/30')}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{PRESCRIPTION_TYPE_ICONS.conditionnel}</span>
            <p className="font-medium text-sm">{rx.medication_name} {rx.dosage} {rx.route}</p>
          </div>
          <p className="text-xs text-muted-foreground">{meta.condition_trigger}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">{remaining}/{maxDoses} restantes</Badge>
            {nextAvailable && nextAvailable > new Date() && (
              <span className="text-[10px] text-orange-600">Prochain dispo: {nextAvailable.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>
        {canAdmin ? (
          <Button size="lg" onClick={() => handleAdminister(rx)}
            className="touch-target min-h-[48px] px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm active:scale-95 transition-all">
            <Check className="h-5 w-5 mr-1" /> Administrer
          </Button>
        ) : (
          <Badge variant="secondary" className="shrink-0">{remaining <= 0 ? 'Max atteint' : 'Intervalle'}</Badge>
        )}
      </div>
    );
  };

  // ── Render exam line ──
  const renderExam = (rx: any, meta: PrescriptionMetadata) => {
    const status = meta.exam_status || 'demande';
    const examLabel = meta.type === 'exam_bio'
      ? (meta.exam_list?.join(', ') || rx.medication_name)
      : meta.type === 'exam_imagerie'
      ? (meta.exam_site || rx.medication_name)
      : rx.medication_name;
    const typeIcon = PRESCRIPTION_TYPE_ICONS[meta.type] || PRESCRIPTION_TYPE_ICONS.exam_bio;
    const statusSteps = meta.type === 'exam_bio'
      ? ['demande', 'preleve', 'resultat_recu']
      : meta.type === 'exam_imagerie'
      ? ['demande', 'patient_parti', 'realise', 'resultat_recu']
      : ['demande', 'realise'];
    const statusLabels: Record<string, string> = {
      demande: 'Demande', preleve: 'Preleve', envoye: 'Envoye', patient_parti: 'Patient parti',
      realise: 'Realise', resultat_recu: 'Resultat recu',
    };
    const currentIdx = statusSteps.indexOf(status);
    const nextStatus = currentIdx < statusSteps.length - 1 ? statusSteps[currentIdx + 1] : null;

    return (
      <div key={rx.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{typeIcon}</span>
            <p className="font-medium text-sm">{examLabel}</p>
            {meta.exam_urgency === 'urgent' && <Badge className="bg-orange-500 text-white text-[10px]">URG</Badge>}
          </div>
          {meta.exam_indication && <p className="text-xs text-muted-foreground mt-0.5">{meta.exam_indication}</p>}
          <div className="flex items-center gap-1 mt-1.5">
            {statusSteps.map((s, i) => (
              <span key={s} className={cn('text-[10px] px-1.5 py-0.5 rounded', i <= currentIdx ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
                {i <= currentIdx && <Check className="h-2.5 w-2.5 inline mr-0.5" />}{statusLabels[s]}
              </span>
            ))}
          </div>
        </div>
        {nextStatus && (
          <Button size="sm" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all shrink-0"
            onClick={() => handleUpdateExamStatus(rx, meta, nextStatus)}>
            {statusLabels[nextStatus]}
          </Button>
        )}
      </div>
    );
  };

  // ── Render avis line ──
  const renderAvis = (rx: any, meta: PrescriptionMetadata) => {
    const status = meta.avis_status || 'demande';
    const statusSteps = ['demande', 'appele', 'vu', 'avis_rendu'];
    const statusLabels: Record<string, string> = { demande: 'Demande', appele: 'Appele', vu: 'Vu par specialiste', avis_rendu: 'Avis rendu' };
    const currentIdx = statusSteps.indexOf(status);
    const nextStatus = currentIdx < statusSteps.length - 1 ? statusSteps[currentIdx + 1] : null;

    return (
      <div key={rx.id} className="p-3 rounded-lg border bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{PRESCRIPTION_TYPE_ICONS.avis_specialise}</span>
            <div>
              <p className="font-medium text-sm">Avis {meta.avis_speciality}</p>
              <p className="text-xs text-muted-foreground">{meta.avis_motif}</p>
            </div>
          </div>
          {meta.avis_urgency && (
            <Badge className={cn(meta.avis_urgency === 'urgent' ? 'bg-red-600 text-white' : meta.avis_urgency === 'rapide' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white')} >
              {meta.avis_urgency}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {statusSteps.map((s, i) => (
            <span key={s} className={cn('text-[10px] px-1.5 py-0.5 rounded', i <= currentIdx ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
              {i <= currentIdx && <Check className="h-2.5 w-2.5 inline mr-0.5" />}{statusLabels[s]}
            </span>
          ))}
        </div>
        {meta.avis_notes && <p className="text-xs p-2 rounded bg-accent/50">Avis: {meta.avis_notes}</p>}
        {nextStatus && (
          <div className="flex items-center gap-2">
            {nextStatus === 'avis_rendu' && (
              <Input value={avisNotes[rx.id] ?? ''} onChange={e => setAvisNotes(prev => ({ ...prev, [rx.id]: e.target.value }))}
                className="h-8 text-xs flex-1" placeholder="Notes de l'avis..." />
            )}
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all"
              onClick={() => handleUpdateAvisStatus(rx, meta, nextStatus)}>
              {statusLabels[nextStatus]}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ── Render consignes ──
  const renderConsignes = (items: Array<{ rx: any; meta: PrescriptionMetadata }>) => {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map(({ rx, meta }) => {
          const icon = PRESCRIPTION_TYPE_ICONS[meta.type] || '\u{1F4CC}';
          const label = meta.type === 'regime' ? (meta.regime_details || rx.medication_name)
            : meta.type === 'mobilisation' ? (meta.mobilisation_details || rx.medication_name)
            : meta.type === 'dispositif' ? `${meta.device_name || rx.medication_name}${meta.device_details ? ` (${meta.device_details})` : ''}`
            : rx.medication_name;
          const isDevice = meta.type === 'dispositif' && meta.device_status !== 'pose';
          return (
            <div key={rx.id} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-accent/30">
              <span>{icon}</span>
              <span className="text-sm">{label}</span>
              {isDevice && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] ml-1" onClick={() => handleUpdateDeviceStatus(rx, meta)}>Pose</Button>
              )}
              {meta.type === 'dispositif' && meta.device_status === 'pose' && <Check className="h-3.5 w-3.5 text-green-600" />}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Render a section ──
  const renderSection = (section: PancarteSection) => {
    const items = sectionGroups[section];
    if (items.length === 0) return null;

    if (section === 'consignes') {
      return (
        <Card key={section} className="animate-in fade-in duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">{sectionLucideIcons[section]} {PANCARTE_SECTION_LABELS[section]}</CardTitle>
          </CardHeader>
          <CardContent>{renderConsignes(items)}</CardContent>
        </Card>
      );
    }

    return (
      <Card key={section} className="animate-in fade-in duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">{sectionLucideIcons[section]} {PANCARTE_SECTION_LABELS[section]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(({ rx, meta }) => {
            switch (section) {
              case 'oxygene_surveillance': return renderOxySurveillance(rx, meta);
              case 'perfusions': return renderPerfusion(rx, meta);
              case 'titrations': return renderTitration(rx, meta);
              case 'medicaments': return renderMedicament(rx, meta);
              case 'conditionnels': return renderConditionnel(rx, meta);
              case 'examens': return renderExam(rx, meta);
              case 'avis': return renderAvis(rx, meta);
              default: return null;
            }
          })}
        </CardContent>
      </Card>
    );
  };

  const bioNormals: Record<string, { unit: string; min?: number; max?: number }> = {
    hemoglobine: { unit: 'g/dL', min: 12, max: 17 }, leucocytes: { unit: 'G/L', min: 4, max: 10 },
    creatinine: { unit: '\u00b5mol/L', min: 45, max: 104 }, potassium: { unit: 'mmol/L', min: 3.5, max: 5.0 },
    troponine_us: { unit: 'ng/L', max: 14 }, CRP: { unit: 'mg/L', max: 5 }, lactates: { unit: 'mmol/L', max: 2 },
    procalcitonine: { unit: 'ng/mL', max: 0.5 }, BNP: { unit: 'pg/mL', max: 100 },
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <PatientBanner nom={patient.nom} prenom={patient.prenom} age={age} sexe={patient.sexe}
        ccmu={encounter.ccmu} motif={encounter.motif_sfmu} allergies={patient.allergies || []} boxNumber={encounter.box_number} poids={patient.poids} medecinName={medecinName} encounterId={encounterId} onBack={() => navigate(-1)} />

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <OnboardingBanner role="ide" />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="Rx actives" value={activeRx} icon={ClipboardList} variant={activeRx > 0 ? 'warning' : 'default'} />
          <StatCard label="Actes" value={procedures.length} icon={Activity} variant={procedures.length > 0 ? 'success' : 'default'} />
          <StatCard label="Resultats" value={newResults > 0 ? `${newResults} new` : results.length.toString()} icon={FlaskConical}
            variant={newResults > 0 ? 'critical' : 'default'} />
        </div>

        {/* Section: Constantes */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Constantes</CardTitle>
              {lastVital && (() => {
                const minAgo = Math.round((Date.now() - new Date(lastVital.recorded_at).getTime()) / 60000);
                const color = minAgo > 60 ? 'text-red-600' : minAgo > 30 ? 'text-orange-500' : 'text-green-600';
                return <p className={cn('text-xs font-medium mt-0.5', color)}>il y a {minAgo} min</p>;
              })()}
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowVitalsInput(!showVitalsInput)}>
              <Plus className="h-4 w-4 mr-1" /> Saisir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {['fc', 'pa_systolique', 'spo2', 'temperature', 'frequence_respiratoire', 'gcs', 'eva_douleur'].map(key => {
                const data = vitals.map(v => ({ value: v[key] })).filter(d => d.value != null);
                const last = data.length > 0 ? data[data.length - 1].value : null;
                const abnormal = isVitalAbnormal(key, last);
                const labels: Record<string, string> = { fc: 'FC', pa_systolique: 'PA', spo2: 'SpO2', temperature: 'T\u00b0', frequence_respiratoire: 'FR', gcs: 'GCS', eva_douleur: 'EVA' };
                return (
                  <div key={key} className={cn('p-2 rounded-lg border text-center', abnormal && 'border-red-400 bg-red-50 dark:bg-red-950/20')}>
                    <p className="text-xs text-muted-foreground">{labels[key]}</p>
                    <p className={cn('text-lg font-bold', abnormal && 'text-red-600')}>{last ?? '\u2014'}</p>
                    {data.length > 1 && (
                      <ResponsiveContainer width="100%" height={24}>
                        <LineChart data={data}><YAxis hide domain={['auto', 'auto']} /><Line type="monotone" dataKey="value" stroke={abnormal ? '#dc2626' : '#2563eb'} strokeWidth={1.5} dot={false} /></LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                );
              })}
            </div>
            {showVitalsInput && (
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 mt-3">
                <Input type="number" placeholder="FC" value={newVitals.fc} onChange={e => setNewVitals({ ...newVitals, fc: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="PAs" value={newVitals.pa_systolique} onChange={e => setNewVitals({ ...newVitals, pa_systolique: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="PAd" value={newVitals.pa_diastolique} onChange={e => setNewVitals({ ...newVitals, pa_diastolique: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="SpO2" value={newVitals.spo2} onChange={e => setNewVitals({ ...newVitals, spo2: e.target.value })} className="text-center h-10" />
                <Input type="number" step="0.1" placeholder="T\u00b0C" value={newVitals.temperature} onChange={e => setNewVitals({ ...newVitals, temperature: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="FR" value={newVitals.frequence_respiratoire} onChange={e => setNewVitals({ ...newVitals, frequence_respiratoire: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="GCS" value={newVitals.gcs} onChange={e => setNewVitals({ ...newVitals, gcs: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="EVA" value={newVitals.eva_douleur} onChange={e => setNewVitals({ ...newVitals, eva_douleur: e.target.value })} className="text-center h-10" />
                <Button onClick={handleSaveVitals} size="sm" className="h-10">OK</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRESCRIPTION SECTIONS — grouped by nature */}
        {prescriptions.length === 0 ? (
          <Card className="animate-in fade-in duration-300">
            <CardContent className="text-center py-8 space-y-2">
              <Pill className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Aucune prescription</p>
              <p className="text-xs text-muted-foreground/70">Les prescriptions du medecin apparaitront ici en temps reel</p>
            </CardContent>
          </Card>
        ) : (
          PANCARTE_SECTION_ORDER.map(section => renderSection(section))
        )}

        {/* Actes de soins */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="pb-2"><CardTitle className="text-base">Actes de soins</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={procType} onValueChange={setProcType}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selectionner un acte" /></SelectTrigger>
                <SelectContent>
                  {[['vvp', 'VVP'], ['prelevement', 'Prelevement sanguin'], ['pansement', 'Pansement'], ['sondage', 'Sondage'], ['ecg', 'ECG'], ['autre', 'Autre']].map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleProcedure} disabled={!procType} className="touch-target">
                <Plus className="h-4 w-4 mr-1" /> Tracer
              </Button>
            </div>
            {procedures.length > 0 && (
              <div className="space-y-1">
                {procedures.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded bg-accent/30 animate-in fade-in"
                    style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}>
                    <span className="font-medium">{p.procedure_type.toUpperCase()}{p.notes ? ` — ${p.notes}` : ''}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.performed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transmissions DAR */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="pb-2"><CardTitle className="text-base">Transmissions DAR</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Cible</Label>
              <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
                {['Douleur', 'Respiratoire', 'Hemodynamique', 'Neurologique', 'Digestif', 'Plaie', 'Mobilite'].map(c => (
                  <button key={c} type="button" onClick={() => setDarCible(c)}
                    className={cn('px-2.5 py-1 rounded-full border text-xs transition-colors',
                      darCible === c ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* D — Donnees (pre-remplies avec constantes) */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-dashed space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">D — Donnees (auto)</p>
              <p className="text-xs text-foreground">
                {lastVital
                  ? `FC ${lastVital.fc || '\u2014'} | PA ${lastVital.pa_systolique || '\u2014'}/${lastVital.pa_diastolique || '\u2014'} | SpO2 ${lastVital.spo2 || '\u2014'}% | T ${lastVital.temperature || '\u2014'}\u00b0C${lastVital.eva_douleur != null ? ` | EVA ${lastVital.eva_douleur}` : ''}`
                  : 'Pas de constantes'}
              </p>
            </div>

            {/* A — Actions (pre-remplies avec derniers actes) */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-dashed space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">A — Actions (auto)</p>
              <p className="text-xs text-foreground">
                {[
                  ...administrations.slice(0, 3).map(a => `${a.dose_given} ${a.route}`),
                  ...procedures.slice(0, 3).map(p => p.procedure_type.toUpperCase()),
                ].join(' | ') || 'Aucun acte'}
              </p>
            </div>

            <div>
              <Label>R — Resultats</Label>
              <Textarea value={darResultats} onChange={e => setDarResultats(e.target.value)} placeholder="Evaluation clinique, evolution du patient..." className="mt-1" rows={3} />
            </div>
            <Button onClick={handleDAR} disabled={!darResultats} className="w-full touch-target">Valider transmission</Button>
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-1"><History className="h-4 w-4" /> Historique ({transmissions.length})</span>
                  {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {transmissions.length === 0 && <p className="text-sm text-muted-foreground">Aucune transmission</p>}
                {transmissions.map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-lg border space-y-1 animate-in fade-in" style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                    {t.cible && <p className="text-sm"><span className="font-medium">Cible:</span> {t.cible}</p>}
                    {t.donnees && <p className="text-xs text-muted-foreground">D: {t.donnees}</p>}
                    {t.actions && <p className="text-xs text-muted-foreground">A: {t.actions}</p>}
                    {t.resultats && <p className="text-sm">R: {t.resultats}</p>}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Resultats */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setResultsOpen(!resultsOpen)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                Resultats
                {newResults > 0 && <Badge className="bg-red-600 text-white">{newResults}</Badge>}
              </CardTitle>
              {resultsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {resultsOpen && (
            <CardContent className="space-y-2">
              {results.length === 0 && <p className="text-sm text-muted-foreground">Aucun resultat</p>}
              {results.map((r, idx) => (
                <div key={r.id} className={cn('p-3 rounded-lg border animate-in fade-in', r.is_critical && 'border-l-4 border-l-red-500', !r.is_read && 'bg-primary/5')}
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.category === 'bio' ? <FlaskConical className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                      <span className="font-medium text-sm">{r.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {r.is_critical && <Badge className="bg-red-600 text-white text-xs">Critique</Badge>}
                      {!r.is_read && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleMarkRead(r.id)}>
                          <Eye className="h-3 w-3 mr-1" /> Lu
                        </Button>
                      )}
                    </div>
                  </div>
                  {r.content && typeof r.content === 'object' && (() => {
                    const entries = Object.entries(r.content);
                    if (r.category === 'imagerie' || r.category === 'ecg') {
                      return (
                        <div className="mt-2 space-y-1">
                          {entries.map(([k, v]) => (
                            <div key={k} className="text-xs">
                              <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}: </span>
                              <span className="font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div className="mt-2 rounded-md border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted/50"><th className="text-left px-2 py-1 font-medium">Param.</th><th className="text-right px-2 py-1 font-medium">Valeur</th></tr></thead>
                          <tbody>
                            {entries.map(([k, v]) => {
                              const range = bioNormals[k];
                              const numVal = parseFloat(String(v));
                              const isAbn = range && !isNaN(numVal) && ((range.min !== undefined && numVal < range.min) || (range.max !== undefined && numVal > range.max));
                              return (
                                <tr key={k} className={cn('border-t', isAbn && 'bg-red-50 dark:bg-red-950/20')}>
                                  <td className="px-2 py-1 capitalize">{k.replace(/_/g, ' ')}</td>
                                  <td className={cn('text-right px-2 py-1 font-semibold', isAbn && 'text-red-600')}>
                                    {String(v)} {range?.unit && <span className="font-normal text-muted-foreground">{range.unit}</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Floating Recap FAB */}
      {encounterId && <RecapDrawer encounterId={encounterId} />}
    </div>
  );
}
