import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { calculateAge, isVitalAbnormal } from '@/lib/vitals-utils';
import { generateSynthesis, type Synthesis, type SynthesisData } from '@/lib/recap-synthesis';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Pill, CheckCircle, FlaskConical, Stethoscope,
  ArrowUpDown, MessageSquare, FileText, Clock,
  AlertTriangle, Brain, User, Loader2, Check, X, ChevronRight, Lightbulb,
} from 'lucide-react';
import { format } from 'date-fns';

// --- Timeline event ---
interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'vital' | 'prescription' | 'administration' | 'result' | 'procedure' | 'triage' | 'transmission';
  icon: string;
  content: string;
  author: string;
  is_critical: boolean;
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'vital': return <Activity className={className} />;
    case 'prescription': return <Pill className={className} />;
    case 'administration': return <CheckCircle className={className} />;
    case 'result': return <FlaskConical className={className} />;
    case 'procedure': return <Stethoscope className={className} />;
    case 'triage': return <ArrowUpDown className={className} />;
    case 'transmission': return <MessageSquare className={className} />;
    default: return <FileText className={className} />;
  }
}

// --- Role recap helpers ---
function getAbnormalVitals(v: Record<string, unknown> | null): string[] {
  if (!v) return [];
  const abnormals: string[] = [];
  if (v.fc && isVitalAbnormal('fc', v.fc as number)) abnormals.push(`FC ${v.fc} bpm`);
  if (v.spo2 && isVitalAbnormal('spo2', v.spo2 as number)) abnormals.push(`SpO2 ${v.spo2}%`);
  if (v.pa_systolique && isVitalAbnormal('pa_systolique', v.pa_systolique as number)) abnormals.push(`PA ${v.pa_systolique}/${v.pa_diastolique || '?'}`);
  if (v.temperature && isVitalAbnormal('temperature', v.temperature as number)) abnormals.push(`T° ${v.temperature}°C`);
  if (v.frequence_respiratoire && isVitalAbnormal('frequence_respiratoire', v.frequence_respiratoire as number)) abnormals.push(`FR ${v.frequence_respiratoire}`);
  return abnormals;
}

interface RoleSection { label: string; items: string[]; }

function getRoleRecap(
  role: AppRole | null,
  encounter: Record<string, unknown>,
  patient: Record<string, unknown>,
  vitals: Record<string, unknown>[],
  prescriptions: Record<string, unknown>[],
  administrations: Record<string, unknown>[],
  results: Record<string, unknown>[],
  procedures: Record<string, unknown>[],
): RoleSection[] {
  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const pendingAdmin = prescriptions
    .filter(rx => rx.status === 'active')
    .filter(rx => !administrations.some(a => a.prescription_id === rx.id));
  const abnormalVitals = getAbnormalVitals(latestVitals);
  const criticalResults = results.filter(r => r.is_critical);
  const unreadResults = results.filter(r => !r.is_read);
  const age = calculateAge(patient.date_naissance as string);

  switch (role) {
    case 'medecin':
      return [
        {
          label: 'Antecedents pertinents',
          items: (patient.antecedents as string[] | null)?.length
            ? (patient.antecedents as string[])
            : ['Aucun antecedent renseigne'],
        },
        {
          label: 'Resultats cles',
          items: criticalResults.length > 0
            ? criticalResults.map(r => `${r.is_critical ? 'CRITIQUE : ' : ''}${r.title}`)
            : unreadResults.length > 0
              ? unreadResults.map(r => r.title as string)
              : ['Tous les resultats sont lus'],
        },
        {
          label: 'Plan de soins',
          items: pendingAdmin.length > 0
            ? pendingAdmin.map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route} — en attente`)
            : ['Tous les traitements sont administres'],
        },
        {
          label: 'Prochaine etape',
          items: [
            ...(unreadResults.length > 0 ? [`Lire ${unreadResults.length} resultat(s)`] : []),
            ...(criticalResults.filter(r => !r.is_read).length > 0 ? ['URGENT: resultats critiques non lus'] : []),
            ...(!encounter.orientation ? ['Definir orientation'] : []),
            ...(unreadResults.length === 0 && criticalResults.length === 0 ? ['Reevaluation clinique'] : []),
          ],
        },
      ];

    case 'ide':
      return [
        {
          label: 'Prescriptions en cours',
          items: pendingAdmin.length > 0
            ? pendingAdmin.map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route}`)
            : ['Aucun traitement en attente'],
        },
        {
          label: 'Dernieres constantes',
          items: latestVitals
            ? [`FC ${latestVitals.fc || '-'} | PA ${latestVitals.pa_systolique || '-'}/${latestVitals.pa_diastolique || '-'} | SpO2 ${latestVitals.spo2 || '-'}% | T° ${latestVitals.temperature || '-'}°C${latestVitals.eva_douleur != null ? ` | EVA ${latestVitals.eva_douleur}` : ''}`]
            : ['Pas de constantes'],
        },
        {
          label: 'Actes realises',
          items: procedures.length > 0
            ? procedures.slice(0, 5).map(p => `${(p.procedure_type as string).toUpperCase()}${p.notes ? ` — ${p.notes}` : ''}`)
            : ['Aucun acte realise'],
        },
        {
          label: 'A surveiller',
          items: abnormalVitals.length > 0
            ? [...abnormalVitals, 'Reevaluer douleur']
            : ['Constantes stables', 'Surveillance standard'],
        },
      ];

    case 'ioa':
      return [
        {
          label: 'Situation',
          items: [`${(patient.nom as string).toUpperCase()} ${patient.prenom}, ${age}a, ${encounter.motif_sfmu || 'Motif non renseigne'}. CIMU ${encounter.cimu || '?'}`],
        },
        {
          label: 'Constantes IOA',
          items: latestVitals
            ? [`FC ${latestVitals.fc || '-'} | PA ${latestVitals.pa_systolique || '-'}/${latestVitals.pa_diastolique || '-'} | SpO2 ${latestVitals.spo2 || '-'}% | T° ${latestVitals.temperature || '-'}°C`]
            : ['Pas de constantes'],
        },
        {
          label: 'Alertes',
          items: [
            ...abnormalVitals.map(v => `Constante anormale : ${v}`),
            ...((patient.allergies as string[] | null)?.length ? [`Allergies : ${(patient.allergies as string[]).join(', ')}`] : []),
            ...(abnormalVitals.length === 0 && !(patient.allergies as string[] | null)?.length ? ['Aucune alerte'] : []),
          ],
        },
      ];

    case 'as':
      return [
        {
          label: 'Installation',
          items: [
            ...(age > 75 ? ['Personne agee — surveillance renforcee'] : []),
            ...(encounter.zone === 'uhcd' ? ['UHCD — installation prolongee'] : []),
            'Hydratation reguliere',
            'Position adaptee au motif',
          ],
        },
        {
          label: 'Surveillance',
          items: ['Douleur', 'Hydratation', 'Position', 'Appel IDE si changement'],
        },
        {
          label: 'Prevenir IDE si',
          items: ['Douleur > 5/10', 'Malaise', 'Chute', 'Agitation', 'Desaturation'],
        },
      ];

    case 'secretaire':
      return [
        {
          label: 'Dossier',
          items: [
            `${patient.nom} ${patient.prenom}`,
            `Ne(e) le ${patient.date_naissance}`,
            patient.ins_numero ? `INS: ${patient.ins_numero}` : 'INS: Non renseigne',
            patient.telephone ? `Tel: ${patient.telephone}` : 'Telephone non renseigne',
          ],
        },
        {
          label: 'Documents manquants',
          items: [
            ...(!patient.ins_numero ? ['Numero INS manquant'] : []),
            ...(!patient.telephone ? ['Telephone non renseigne'] : []),
            ...(!patient.adresse ? ['Adresse non renseignee'] : []),
            ...(patient.ins_numero && patient.telephone && patient.adresse ? ['Dossier complet'] : []),
          ],
        },
      ];

    default:
      return [{ label: 'Recap', items: ['Aucune donnee'] }];
  }
}

// --- RecapDrawer component ---
interface RecapDrawerProps {
  encounterId: string;
  trigger?: React.ReactNode;
}

export function RecapDrawer({ encounterId, trigger }: RecapDrawerProps) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [encounter, setEncounter] = useState<Record<string, unknown> | null>(null);
  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [vitals, setVitals] = useState<Record<string, unknown>[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, unknown>[]>([]);
  const [administrations, setAdministrations] = useState<Record<string, unknown>[]>([]);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [procedures, setProcedures] = useState<Record<string, unknown>[]>([]);
  const [transmissions, setTransmissions] = useState<Record<string, unknown>[]>([]);
  const [timelineItems, setTimelineItems] = useState<Record<string, unknown>[]>([]);
  const [medecinName, setMedecinName] = useState<string>('');

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);

  useEffect(() => {
    if (open && encounterId) {
      fetchData();
    }
  }, [open, encounterId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId).single();
    if (!enc) { setLoading(false); return; }
    setEncounter(enc);

    const [patRes, vitRes, rxRes, admRes, procRes, resRes, transRes, tlRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', enc.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId).order('created_at', { ascending: true }),
      supabase.from('administrations').select('*').eq('encounter_id', encounterId).order('administered_at', { ascending: true }),
      supabase.from('procedures').select('*').eq('encounter_id', encounterId).order('performed_at', { ascending: true }),
      supabase.from('results').select('*').eq('encounter_id', encounterId).order('received_at', { ascending: true }),
      supabase.from('transmissions').select('*').eq('encounter_id', encounterId).order('created_at', { ascending: true }),
      supabase.from('timeline_items').select('*').eq('patient_id', enc.patient_id).order('source_date', { ascending: false }),
    ]);

    const vit = vitRes.data || [];
    const rx = rxRes.data || [];
    const adm = admRes.data || [];
    const proc = procRes.data || [];
    const res = resRes.data || [];
    const trans = transRes.data || [];
    const tl = tlRes.data || [];

    if (patRes.data) setPatient(patRes.data);
    setVitals(vit);
    setPrescriptions(rx);
    setAdministrations(adm);
    setProcedures(proc);
    setResults(res);
    setTransmissions(trans);
    setTimelineItems(tl);

    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }

    // Build timeline
    const events: TimelineEvent[] = [];

    // Arrival
    if (enc.arrival_time) {
      events.push({
        id: `arrival-${enc.id}`,
        timestamp: enc.arrival_time,
        type: 'triage',
        icon: '🚑',
        content: `Arrivee — Motif: ${enc.motif_sfmu || 'non precise'}`,
        author: 'IOA',
        is_critical: false,
      });
    }

    // Triage
    if (enc.triage_time) {
      events.push({
        id: `triage-${enc.id}`,
        timestamp: enc.triage_time,
        type: 'triage',
        icon: '🔀',
        content: `Tri CIMU ${enc.cimu || '?'} — ${enc.zone ? enc.zone.toUpperCase() : 'Zone non definie'}${enc.box_number ? ` Box ${enc.box_number}` : ''}`,
        author: 'IOA',
        is_critical: enc.cimu != null && enc.cimu <= 2,
      });
    }

    // Vitals
    vit.forEach((v: Record<string, unknown>) => {
      events.push({
        id: `vital-${v.id}`,
        timestamp: v.recorded_at as string,
        type: 'vital',
        icon: '📊',
        content: `FC ${v.fc || '-'} | PA ${v.pa_systolique || '-'}/${v.pa_diastolique || '-'} | SpO2 ${v.spo2 || '-'}% | T° ${v.temperature || '-'}°C${v.eva_douleur != null ? ` | EVA ${v.eva_douleur}/10` : ''}`,
        author: 'IDE',
        is_critical: getAbnormalVitals(v).length > 0,
      });
    });

    // Procedures
    proc.forEach((p: Record<string, unknown>) => {
      events.push({
        id: `proc-${p.id}`,
        timestamp: p.performed_at as string,
        type: 'procedure',
        icon: '🩺',
        content: `${(p.procedure_type as string).toUpperCase()}${p.notes ? ` — ${p.notes}` : ''}`,
        author: 'IDE',
        is_critical: false,
      });
    });

    // Prescriptions
    rx.forEach((p: Record<string, unknown>) => {
      events.push({
        id: `rx-${p.id}`,
        timestamp: p.created_at as string,
        type: 'prescription',
        icon: '💊',
        content: `Prescription: ${p.medication_name} ${p.dosage} ${p.route}`,
        author: 'Dr',
        is_critical: p.priority === 'stat',
      });
    });

    // Administrations
    adm.forEach((a: Record<string, unknown>) => {
      events.push({
        id: `admin-${a.id}`,
        timestamp: a.administered_at as string,
        type: 'administration',
        icon: '✅',
        content: `Administre: ${a.dose_given} ${a.route}`,
        author: 'IDE',
        is_critical: false,
      });
    });

    // Results
    res.forEach((r: Record<string, unknown>) => {
      events.push({
        id: `result-${r.id}`,
        timestamp: r.received_at as string,
        type: 'result',
        icon: r.category === 'imagerie' ? '🩻' : r.category === 'ecg' ? '💓' : '🔬',
        content: `Resultat ${r.category === 'imagerie' ? 'imagerie' : r.category === 'ecg' ? 'ECG' : 'bio'}: ${r.title}${r.is_critical ? ' — CRITIQUE' : ''}`,
        author: r.category === 'imagerie' ? 'Imagerie' : r.category === 'ecg' ? 'ECG' : 'Labo',
        is_critical: r.is_critical as boolean,
      });
    });

    // Transmissions
    trans.forEach((t: Record<string, unknown>) => {
      events.push({
        id: `trans-${t.id}`,
        timestamp: t.created_at as string,
        type: 'transmission',
        icon: '📝',
        content: `Transmission DAR${t.cible ? ` — ${t.cible}` : ''}`,
        author: 'IDE',
        is_critical: false,
      });
    });

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setTimeline(events);

    // Generate synthesis
    if (patRes.data) {
      const synthData: SynthesisData = {
        patient: patRes.data as SynthesisData['patient'],
        encounter: enc as SynthesisData['encounter'],
        vitals: vit as SynthesisData['vitals'],
        prescriptions: rx as SynthesisData['prescriptions'],
        administrations: adm as SynthesisData['administrations'],
        results: res as SynthesisData['results'],
        procedures: proc as SynthesisData['procedures'],
        transmissions: trans as SynthesisData['transmissions'],
        timelineItems: tl as SynthesisData['timelineItems'],
      };
      setSynthesis(generateSynthesis(synthData));
    }

    // Audit
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'recap_drawer_viewed', resource_type: 'encounter', resource_id: enc.id,
      });
    }

    setLoading(false);
  };

  const age = patient ? calculateAge(patient.date_naissance as string) : 0;
  const roleLabels: Record<string, string> = {
    medecin: 'Medecin', ide: 'IDE', ioa: 'IOA', as: 'Aide-Soignant', secretaire: 'Secretaire',
  };

  const roleSections = patient && encounter
    ? getRoleRecap(role, encounter, patient, vitals, prescriptions, administrations, results, procedures)
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-0 flex items-center justify-center"
            aria-label="Recap patient"
          >
            <FileText className="h-6 w-6" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[520px] sm:max-w-[520px] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-3 border-b bg-card shrink-0">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Recap patient
            </SheetTitle>
            {patient && encounter && (
              <div className="mt-1.5 space-y-1">
                <p className="text-sm font-medium">
                  {(patient.nom as string).toUpperCase()} {patient.prenom as string}, {age}a
                  {encounter.ccmu ? ` — CCMU ${encounter.ccmu}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(encounter.motif_sfmu as string) || 'Motif non precise'}
                  {encounter.zone ? ` · ${(encounter.zone as string).toUpperCase()}` : ''}
                  {encounter.box_number ? ` Box ${encounter.box_number}` : ''}
                  {medecinName ? ` · Dr. ${medecinName}` : ''}
                </p>
                {(patient.allergies as string[] | null)?.length ? (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-medical-critical" />
                    <span className="text-xs font-semibold text-medical-critical">
                      {(patient.allergies as string[]).join(', ')}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </SheetHeader>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-3 shrink-0 grid grid-cols-3">
                <TabsTrigger value="timeline" className="text-xs">
                  <Clock className="h-3.5 w-3.5 mr-1" /> Timeline
                </TabsTrigger>
                <TabsTrigger value="role" className="text-xs">
                  <User className="h-3.5 w-3.5 mr-1" /> {roleLabels[role || ''] || 'Role'}
                </TabsTrigger>
                <TabsTrigger value="synthesis" className="text-xs">
                  <Brain className="h-3.5 w-3.5 mr-1" /> Synthese
                </TabsTrigger>
              </TabsList>

              {/* Tab 1 — Timeline */}
              <TabsContent value="timeline" className="flex-1 overflow-y-auto px-4 pb-4 mt-2">
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucun evenement</p>
                ) : (
                  <div className="space-y-0.5">
                    {timeline.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm',
                          event.is_critical && 'bg-red-50 dark:bg-red-950/30 border-l-3 border-l-red-500',
                          event.type === 'administration' && !event.is_critical && 'bg-green-50/50 dark:bg-green-950/10',
                        )}
                      >
                        <span className="text-muted-foreground font-mono text-xs whitespace-nowrap mt-0.5 w-10 shrink-0">
                          {format(new Date(event.timestamp), 'HH:mm')}
                        </span>
                        <span className="shrink-0 mt-0.5 text-xs">{event.icon}</span>
                        <span className="flex-1 text-xs leading-relaxed">{event.content}</span>
                        <span className="text-muted-foreground text-[10px] whitespace-nowrap mt-0.5 shrink-0">{event.author}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 2 — Role-based recap */}
              <TabsContent value="role" className="flex-1 overflow-y-auto px-4 pb-4 mt-2">
                <div className="space-y-4">
                  {roleSections.map((section) => (
                    <div key={section.label}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        {section.label}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3 — AI Synthesis */}
              <TabsContent value="synthesis" className="flex-1 overflow-y-auto px-4 pb-4 mt-2">
                {synthesis ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <Brain className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Synthese structuree</p>
                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60">
                          {patient ? `${(patient.nom as string).toUpperCase()} ${patient.prenom}, ${age} ans` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Ce qu'on sait */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-green-600" />
                        <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Ce qu'on sait</h3>
                      </div>
                      <ul className="space-y-1 ml-5">
                        {synthesis.known.map((item, i) => (
                          <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ce qui manque */}
                    {synthesis.missing.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">Ce qui manque</h3>
                        </div>
                        <ul className="space-y-1 ml-5">
                          {synthesis.missing.map((item, i) => (
                            <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ce qui inquiete */}
                    {synthesis.concerns.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <X className="h-4 w-4 text-red-500" />
                          <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Ce qui inquiete</h3>
                        </div>
                        <ul className="space-y-1 ml-5">
                          {synthesis.concerns.map((item, i) => (
                            <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                              <span className="text-red-500 mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prochaine etape */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">Prochaine etape suggeree</h3>
                      </div>
                      <ul className="space-y-1 ml-5">
                        {synthesis.nextSteps.map((item, i) => (
                          <li key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sources */}
                    {synthesis.sources.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-[10px] text-muted-foreground">
                          Sources : {synthesis.sources.join(' · ')}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Genere a {format(new Date(), 'HH:mm')} — Template structure, pas d'IA generative.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
