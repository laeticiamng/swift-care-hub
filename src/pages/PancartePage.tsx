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
import { Check, Plus, FlaskConical, Image, ChevronDown, ChevronUp, Eye, History, Loader2, Pill, HeartPulse, ScanLine, ClipboardList, Activity, FileText } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { toast } from 'sonner';
import { categorizePrescription, PRESCRIPTION_SECTIONS } from '@/lib/prescription-utils';

export default function PancartePage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [encounter, setEncounter] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);

  const [showVitalsInput, setShowVitalsInput] = useState(false);
  const [newVitals, setNewVitals] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
  const [procType, setProcType] = useState('');
  const [darResultats, setDarResultats] = useState('');
  const [darCible, setDarCible] = useState('');

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
    const channel = supabase.channel('pancarte-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
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
    // Fetch medecin name
    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }
  };

  const [titrationDoses, setTitrationDoses] = useState<Record<string, string>>({});

  const handleAdminister = async (rx: any) => {
    if (!user || !encounter) return;
    const doseGiven = titrationDoses[rx.id] || rx.dosage;
    await supabase.from('administrations').insert({
      prescription_id: rx.id, encounter_id: encounter.id, patient_id: encounter.patient_id,
      administered_by: user.id, dose_given: doseGiven, route: rx.route,
    });
    await supabase.from('prescriptions').update({ status: 'completed' }).eq('id', rx.id);
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'administration', resource_type: 'prescription',
      resource_id: rx.id, details: { medication: rx.medication_name, dosage: doseGiven },
    });
    toast.success(`${rx.medication_name} administré — ${doseGiven}`);
    setTitrationDoses(prev => { const n = { ...prev }; delete n[rx.id]; return n; });
    fetchAll();
  };

  const handleSaveVitals = async () => {
    if (!user || !encounter) return;
    const obj: any = { encounter_id: encounter.id, patient_id: encounter.patient_id, recorded_by: user.id };
    if (newVitals.fc) obj.fc = parseInt(newVitals.fc);
    if (newVitals.pa_systolique) obj.pa_systolique = parseInt(newVitals.pa_systolique);
    if (newVitals.pa_diastolique) obj.pa_diastolique = parseInt(newVitals.pa_diastolique);
    if (newVitals.spo2) obj.spo2 = parseInt(newVitals.spo2);
    if (newVitals.temperature) obj.temperature = parseFloat(newVitals.temperature);
    if (newVitals.frequence_respiratoire) obj.frequence_respiratoire = parseInt(newVitals.frequence_respiratoire);
    if (newVitals.gcs) obj.gcs = parseInt(newVitals.gcs);
    if (newVitals.eva_douleur) obj.eva_douleur = parseInt(newVitals.eva_douleur);
    await supabase.from('vitals').insert(obj);
    toast.success('Constantes enregistrées');
    setNewVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
    setShowVitalsInput(false);
    fetchAll();
  };

  const handleProcedure = async () => {
    if (!user || !encounter || !procType) return;
    await supabase.from('procedures').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id,
      performed_by: user.id, procedure_type: procType as any,
    });
    const procLabels: Record<string, string> = { vvp: 'VVP', prelevement: 'Prélèvement', pansement: 'Pansement', sondage: 'Sondage', ecg: 'ECG', autre: 'Acte' };
    toast.success(`${procLabels[procType] || 'Acte'} tracé`);
    setProcType('');
    fetchAll();
  };

  const handleDAR = async () => {
    if (!user || !encounter) return;
    const lastVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
    const poidsStr = patient?.poids ? `Poids ${patient.poids} kg | ` : '';
    const donneesAuto = lastVital
      ? `${poidsStr}FC ${lastVital.fc || '—'} | PA ${lastVital.pa_systolique || '—'}/${lastVital.pa_diastolique || '—'} | SpO₂ ${lastVital.spo2 || '—'}% | T° ${lastVital.temperature || '—'}°C${lastVital.frequence_respiratoire ? ` | FR ${lastVital.frequence_respiratoire}` : ''}${lastVital.gcs ? ` | GCS ${lastVital.gcs}` : ''}${lastVital.eva_douleur != null ? ` | EVA ${lastVital.eva_douleur}` : ''}`
      : 'Pas de constantes récentes';
    const recentProcs = procedures.slice(0, 3);
    const recentAdmins = administrations.slice(0, 3);
    const actionsAuto = [
      ...recentAdmins.map(a => `Admin: ${a.dose_given} ${a.route}`),
      ...recentProcs.map(p => `Acte: ${p.procedure_type}`),
    ].join(' | ') || 'Aucun acte récent';

    await supabase.from('transmissions').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id, author_id: user.id,
      donnees: donneesAuto, actions: actionsAuto, resultats: darResultats, cible: darCible,
    });
    toast.success('Transmission validée');
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
  const isAdministered = (rxId: string) => administrations.some(a => a.prescription_id === rxId);
  const newResults = results.filter(r => !r.is_read).length;
  const activeRx = prescriptions.filter(rx => rx.status === 'active').length;

  const lastVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const poidsPreview = patient?.poids ? `Poids ${patient.poids} kg | ` : '';
  const donneesPreview = lastVital
    ? `${poidsPreview}FC ${lastVital.fc || '—'} | PA ${lastVital.pa_systolique || '—'}/${lastVital.pa_diastolique || '—'} | SpO₂ ${lastVital.spo2 || '—'}% | T° ${lastVital.temperature || '—'}°C${lastVital.frequence_respiratoire ? ` | FR ${lastVital.frequence_respiratoire}` : ''}${lastVital.gcs ? ` | GCS ${lastVital.gcs}` : ''}${lastVital.eva_douleur != null ? ` | EVA ${lastVital.eva_douleur}` : ''}`
    : 'Aucune constante disponible';
  const recentProcs = procedures.slice(0, 3);
  const recentAdmins = administrations.slice(0, 3);
  const actionsPreview = [
    ...recentAdmins.map(a => `${a.dose_given} ${a.route}`),
    ...recentProcs.map(p => p.procedure_type.toUpperCase()),
  ].join(', ') || 'Aucun acte récent';

  // Prescription groups using shared utility
  const rxGroups = {
    soins: prescriptions.filter(rx => categorizePrescription(rx) === 'soins'),
    examens_bio: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_bio'),
    examens_imagerie: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_imagerie'),
    traitements: prescriptions.filter(rx => categorizePrescription(rx) === 'traitements'),
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <PatientBanner nom={patient.nom} prenom={patient.prenom} age={age} sexe={patient.sexe}
        ccmu={encounter.ccmu} motif={encounter.motif_sfmu} allergies={patient.allergies || []} boxNumber={encounter.box_number} poids={patient.poids} medecinName={medecinName} onBack={() => navigate(-1)} />

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <OnboardingBanner role="ide" />
        {/* Résumé rapide */}
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="Rx actives" value={activeRx} icon={ClipboardList} variant={activeRx > 0 ? 'warning' : 'default'} />
          <StatCard label="Actes" value={procedures.length} icon={Activity} variant={procedures.length > 0 ? 'success' : 'default'} />
          <StatCard label="Résultats" value={newResults > 0 ? `${newResults} new` : results.length.toString()} icon={FlaskConical}
            variant={newResults > 0 ? 'critical' : 'default'} />
        </div>

        {/* Section 1 — Constantes */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Constantes</CardTitle>
              {lastVital && (() => {
                const lastTime = new Date(lastVital.recorded_at).getTime();
                const minAgo = Math.round((Date.now() - lastTime) / 60000);
                const color = minAgo > 60 ? 'text-medical-critical' : minAgo > 30 ? 'text-medical-warning' : 'text-medical-success';
                return <p className={cn('text-xs font-medium mt-0.5', color)}>Dernières il y a {minAgo} min</p>;
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
                const labels: Record<string, string> = { fc: 'FC', pa_systolique: 'PA', spo2: 'SpO₂', temperature: 'T°', frequence_respiratoire: 'FR', gcs: 'GCS', eva_douleur: 'EVA' };
                return (
                  <div key={key} className={cn('p-2 rounded-lg border text-center', abnormal && 'border-medical-critical bg-medical-critical/5')}>
                    <p className="text-xs text-muted-foreground">{labels[key]}</p>
                    <p className={cn('text-lg font-bold', abnormal && 'text-medical-critical')}>{last ?? '—'}</p>
                    {data.length > 1 && (
                      <ResponsiveContainer width="100%" height={24}>
                        <LineChart data={data}><YAxis hide domain={['auto', 'auto']} /><Line type="monotone" dataKey="value" stroke={abnormal ? 'hsl(var(--medical-critical))' : 'hsl(var(--primary))'} strokeWidth={1.5} dot={false} /></LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                );
              })}
            </div>
            {showVitalsInput && (
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 mt-3">
                <Input type="number" placeholder="FC" value={newVitals.fc} onChange={e => setNewVitals({ ...newVitals, fc: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="PA sys" value={newVitals.pa_systolique} onChange={e => setNewVitals({ ...newVitals, pa_systolique: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="PA dia" value={newVitals.pa_diastolique} onChange={e => setNewVitals({ ...newVitals, pa_diastolique: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="SpO₂" value={newVitals.spo2} onChange={e => setNewVitals({ ...newVitals, spo2: e.target.value })} className="text-center h-10" />
                <Input type="number" step="0.1" placeholder="T°C" value={newVitals.temperature} onChange={e => setNewVitals({ ...newVitals, temperature: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="FR" value={newVitals.frequence_respiratoire} onChange={e => setNewVitals({ ...newVitals, frequence_respiratoire: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="GCS" value={newVitals.gcs} onChange={e => setNewVitals({ ...newVitals, gcs: e.target.value })} className="text-center h-10" />
                <Input type="number" placeholder="EVA" value={newVitals.eva_douleur} onChange={e => setNewVitals({ ...newVitals, eva_douleur: e.target.value })} className="text-center h-10" />
                <Button onClick={handleSaveVitals} size="sm" className="h-10">OK</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2 — Prescriptions with shared categories */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Prescriptions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucune prescription</p>}
            {PRESCRIPTION_SECTIONS.filter(s => rxGroups[s.key as keyof typeof rxGroups].length > 0).map(s => (
              <div key={s.key}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">{s.icon} {s.label}</p>
                <div className="space-y-2">
                  {rxGroups[s.key as keyof typeof rxGroups].map((rx: any) => {
                    const done = isAdministered(rx.id) || rx.status === 'completed';
                    const isSuspended = rx.status === 'suspended';
                    const isCancelled = rx.status === 'cancelled';
                    const isInactive = isSuspended || isCancelled;
                    return (
                      <div key={rx.id} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                        done ? 'bg-medical-success/5 border-medical-success/20' : isInactive ? 'bg-muted/50 opacity-70' : 'bg-card',
                        rx.priority === 'stat' && !done && !isInactive && 'border-medical-critical/30 animate-pulse',
                        rx.priority === 'urgent' && !done && !isInactive && 'border-medical-warning/30',
                      )}>
                        <div className="flex-1">
                          <p className={cn('font-medium text-sm', isCancelled && 'line-through text-muted-foreground')}>{rx.medication_name} — {rx.dosage}</p>
                          <p className="text-xs text-muted-foreground">{rx.route} · {rx.frequency || 'Ponctuel'}</p>
                        </div>
                        {done ? (
                          <Badge className="bg-medical-success text-medical-success-foreground"><Check className="h-3 w-3 mr-1" /> Administré</Badge>
                        ) : isSuspended ? (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">Suspendue</Badge>
                        ) : isCancelled ? (
                          <Badge variant="outline" className="text-muted-foreground line-through">Annulée</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              value={titrationDoses[rx.id] ?? rx.dosage}
                              onChange={e => setTitrationDoses(prev => ({ ...prev, [rx.id]: e.target.value }))}
                              className="w-24 h-8 text-xs text-center"
                              title="Dose à administrer (titration)"
                            />
                            <Button size="sm" onClick={() => handleAdminister(rx)}
                              className="touch-target bg-medical-info hover:bg-medical-info/90 text-medical-info-foreground font-medium">
                              <Check className="h-4 w-4 mr-1" /> OK
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 3 — Actes */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Actes de soins</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={procType} onValueChange={setProcType}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Sélectionner un acte" /></SelectTrigger>
                <SelectContent>
                  {[['vvp', 'VVP'], ['prelevement', 'Prélèvement sanguin'], ['pansement', 'Pansement'], ['sondage', 'Sondage'], ['ecg', 'ECG'], ['autre', 'Autre']].map(([v, l]) => (
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
                    <span className="font-medium">{p.procedure_type.toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.performed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4 — Transmissions DAR with separate cards for D/A/R */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Transmissions DAR</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-accent/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">D — Données</p>
                <p className="text-sm leading-relaxed">{donneesPreview}</p>
              </div>
              <div className="p-3 rounded-lg border bg-accent/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">A — Actions</p>
                <p className="text-sm leading-relaxed">{actionsPreview}</p>
              </div>
              <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">R — Résultats</p>
                <p className="text-sm text-muted-foreground italic">À compléter ci-dessous</p>
              </div>
            </div>
            <div>
              <Label>Cible</Label>
              <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
                {['Douleur', 'Respiratoire', 'Hémodynamique', 'Neurologique', 'Digestif', 'Plaie/Pansement', 'Mobilité'].map(c => (
                  <button key={c} type="button" onClick={() => setDarCible(c)}
                    className={cn('px-2.5 py-1 rounded-full border text-xs transition-colors',
                      darCible === c ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>
                    {c}
                  </button>
                ))}
              </div>
              <Input value={darCible} onChange={e => setDarCible(e.target.value)} placeholder="Ou saisie libre..." />
            </div>
            <div>
              <Label>R — Résultats</Label>
              <Textarea value={darResultats} onChange={e => setDarResultats(e.target.value)} placeholder="Évaluation clinique..." className="mt-1" rows={3} />
            </div>
            <Button onClick={handleDAR} disabled={!darResultats} className="w-full touch-target">Valider transmission</Button>

            {/* Transmission history */}
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-1"><History className="h-4 w-4" /> Historique ({transmissions.length})</span>
                  {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {transmissions.length === 0 && <p className="text-sm text-muted-foreground">Aucune transmission précédente</p>}
                {transmissions.map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-lg border space-y-1 animate-in fade-in"
                    style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                    {t.cible && <p className="text-sm"><span className="font-medium">Cible :</span> {t.cible}</p>}
                    {t.donnees && <p className="text-xs text-muted-foreground">D: {t.donnees}</p>}
                    {t.actions && <p className="text-xs text-muted-foreground">A: {t.actions}</p>}
                    {t.resultats && <p className="text-sm">R: {t.resultats}</p>}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Section 5 — Résultats */}
        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setResultsOpen(!resultsOpen)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                Résultats
                {newResults > 0 && <Badge className="bg-medical-critical text-medical-critical-foreground">{newResults}</Badge>}
              </CardTitle>
              {resultsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {resultsOpen && (
            <CardContent className="space-y-2">
              {results.length === 0 && <p className="text-sm text-muted-foreground">Aucun résultat</p>}
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
                  {r.content && typeof r.content === 'object' && (() => {
                    const entries = Object.entries(r.content);
                    const bioNormals: Record<string, { unit: string; min?: number; max?: number }> = {
                      hemoglobine: { unit: 'g/dL', min: 12, max: 17 }, leucocytes: { unit: 'G/L', min: 4, max: 10 },
                      creatinine: { unit: 'µmol/L', min: 45, max: 104 }, potassium: { unit: 'mmol/L', min: 3.5, max: 5.0 },
                      troponine_us: { unit: 'ng/L', max: 14 }, CRP: { unit: 'mg/L', max: 5 }, lactates: { unit: 'mmol/L', max: 2 },
                      procalcitonine: { unit: 'ng/mL', max: 0.5 }, BNP: { unit: 'pg/mL', max: 100 },
                    };
                    if (r.category === 'imagerie' || r.category === 'ecg') {
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
                          <thead><tr className="bg-muted/50"><th className="text-left px-2 py-1 font-medium">Param.</th><th className="text-right px-2 py-1 font-medium">Valeur</th></tr></thead>
                          <tbody>
                            {entries.map(([k, v]) => {
                              const range = bioNormals[k];
                              const numVal = parseFloat(String(v));
                              const isAbn = range && !isNaN(numVal) && ((range.min !== undefined && numVal < range.min) || (range.max !== undefined && numVal > range.max));
                              return (
                                <tr key={k} className={cn('border-t', isAbn && 'bg-medical-critical/5')}>
                                  <td className="px-2 py-1 capitalize">{k.replace(/_/g, ' ')}</td>
                                  <td className={cn('text-right px-2 py-1 font-semibold', isAbn && 'text-medical-critical')}>
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
    </div>
  );
}
