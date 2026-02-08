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
import { Plus, FileText, AlertTriangle, Clock, FlaskConical, Image, Eye, DoorOpen, ToggleLeft, ToggleRight, Send, Loader2, ExternalLink } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { toast } from 'sonner';
import { checkAllergyConflict } from '@/lib/allergy-check';
import { DischargeDialog } from '@/components/urgence/DischargeDialog';

export default function PatientDossierPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [encounter, setEncounter] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState<string[]>([]);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [timelineEssential, setTimelineEssential] = useState(false);
  const [newRx, setNewRx] = useState({ medication_name: '', dosage: '', route: 'PO' as string, frequency: '', priority: 'routine' as string });

  // Medical notes
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

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
  };

  const handleMedNameChange = (name: string) => {
    setNewRx({ ...newRx, medication_name: name });
    if (patient?.allergies) setAllergyWarning(checkAllergyConflict(name, patient.allergies));
  };

  const handlePrescribe = async () => {
    if (!encounter || !user) return;
    if (allergyWarning.length > 0) {
      toast.error(`ALLERGIE DÉTECTÉE : ${allergyWarning.join(', ')} — Prescription bloquée`);
      return;
    }
    const { error } = await supabase.from('prescriptions').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id, prescriber_id: user.id,
      medication_name: newRx.medication_name, dosage: newRx.dosage,
      route: newRx.route as any, frequency: newRx.frequency, priority: newRx.priority as any,
    });
    if (error) { toast.error('Erreur de prescription'); return; }
    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'prescription_created', resource_type: 'prescription',
      resource_id: encounter.id, details: { medication: newRx.medication_name, dosage: newRx.dosage },
    });
    toast.success('Prescription validée');
    setNewRx({ medication_name: '', dosage: '', route: 'PO', frequency: '', priority: 'routine' });
    setAllergyWarning([]);
    setPrescribeOpen(false);
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

  if (!patient || !encounter) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const age = calculateAge(patient.date_naissance);
  const vitalKeys = ['fc', 'pa_systolique', 'spo2', 'temperature'];
  const vitalLabels: Record<string, string> = { fc: 'FC', pa_systolique: 'PA sys', spo2: 'SpO₂', temperature: 'T°' };
  const vitalUnits: Record<string, string> = { fc: 'bpm', pa_systolique: 'mmHg', spo2: '%', temperature: '°C' };

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

  return (
    <div className="min-h-screen bg-background">
      <PatientBanner nom={patient.nom} prenom={patient.prenom} age={age} sexe={patient.sexe}
        ccmu={encounter.ccmu} motif={encounter.motif_sfmu} allergies={patient.allergies || []} onBack={() => navigate(-1)} />

      <div className="max-w-7xl mx-auto p-4">
        {encounter.status !== 'finished' && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => setDischargeOpen(true)}>
              <DoorOpen className="h-4 w-4 mr-1" /> Préparer sortie
            </Button>
          </div>
        )}
        <DischargeDialog open={dischargeOpen} onOpenChange={setDischargeOpen} encounterId={encounter.id} patientId={encounter.patient_id} userId={user?.id || ''} onDone={() => { fetchAll(); navigate('/board'); }} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Timeline — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {/* Medical Notes */}
            <Card>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Timeline patient</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTimelineEssential(!timelineEssential)}>
                  {timelineEssential ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                  {timelineEssential ? 'Essentiel' : 'Voir tout'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeline.length === 0 && <p className="text-sm text-muted-foreground">Aucun élément</p>}
                {timeline.filter(item => !timelineEssential || ['allergie', 'crh', 'diagnostic'].includes(item.item_type)).map(item => {
                  const iconMap: Record<string, React.ReactNode> = {
                    allergie: <AlertTriangle className="h-4 w-4 text-medical-critical" />,
                    crh: <FileText className="h-4 w-4 text-primary" />,
                    resultat: <FlaskConical className="h-4 w-4 text-medical-info" />,
                  };
                  return (
                    <div key={item.id} className={cn('flex gap-3 p-3 rounded-lg border', item.item_type === 'allergie' && 'border-medical-critical/30 bg-medical-critical/5')}>
                      <div className="mt-0.5">{iconMap[item.item_type] || <Clock className="h-4 w-4 text-muted-foreground" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.item_type}</Badge>
                          {item.source_date && <span className="text-xs text-muted-foreground">{item.source_date}</span>}
                        </div>
                        <p className="text-sm mt-1">{item.content}</p>
                        {item.source_document && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">Source : {item.source_document} {item.source_author && `— ${item.source_author}`}</p>
                            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={(e) => { e.stopPropagation(); toast.info('Document source non disponible en démo'); }}>
                              <ExternalLink className="h-3 w-3 mr-1" /> Ouvrir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Actions — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Constantes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {vitalKeys.map(key => {
                    const data = vitals.map(v => ({ value: v[key] })).filter(d => d.value != null);
                    const lastVal = data.length > 0 ? data[data.length - 1].value : null;
                    const abnormal = isVitalAbnormal(key, lastVal);
                    return (
                      <div key={key} className={cn('p-3 rounded-lg border', abnormal && 'border-medical-critical bg-medical-critical/5')}>
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

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Prescriptions</CardTitle>
                <Dialog open={prescribeOpen} onOpenChange={setPrescribeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Prescrire</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvelle prescription</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Médicament</Label>
                        <Input value={newRx.medication_name} onChange={e => handleMedNameChange(e.target.value)} placeholder="Paracétamol" />
                        {allergyWarning.length > 0 && (
                          <div className="mt-1 p-2 rounded bg-medical-critical/10 border border-medical-critical/30">
                            <p className="text-xs font-bold text-medical-critical flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> ALLERGIE: {allergyWarning.join(', ')}
                            </p>
                            <p className="text-xs text-medical-critical">Prescription bloquée — choisir un autre médicament</p>
                          </div>
                        )}
                      </div>
                      <div><Label>Posologie</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="1g" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Voie</Label>
                          <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{['PO', 'IV', 'SC', 'IM', 'INH'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priorité</Label>
                          <Select value={newRx.priority} onValueChange={v => setNewRx({ ...newRx, priority: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">Routine</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="stat">STAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div><Label>Fréquence</Label><Input value={newRx.frequency} onChange={e => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="Toutes les 6h" /></div>
                      <Button onClick={handlePrescribe} className="w-full" disabled={!newRx.medication_name || !newRx.dosage || allergyWarning.length > 0}>
                        Valider la prescription
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucune prescription</p>}
                {(() => {
                  const soinsKeywords = ['pansement', 'soin', 'nursing', 'toilette', 'surveillance', 'scope', 'monitoring'];
                  const examBioKeywords = ['bilan', 'nfs', 'iono', 'crp', 'troponine', 'hémostase', 'gaz du sang', 'lactate', 'bhu', 'hémoglobine'];
                  const examImagerieKeywords = ['radio', 'scanner', 'irm', 'écho', 'imagerie', 'rx', 'tdm', 'radiographie'];
                  
                  const categorize = (rx: any) => {
                    const name = rx.medication_name.toLowerCase();
                    if (soinsKeywords.some(k => name.includes(k))) return 'soins';
                    if (examBioKeywords.some(k => name.includes(k))) return 'examens_bio';
                    if (examImagerieKeywords.some(k => name.includes(k))) return 'examens_imagerie';
                    return 'traitements';
                  };
                  
                  const groups = {
                    soins: prescriptions.filter(rx => categorize(rx) === 'soins'),
                    examens_bio: prescriptions.filter(rx => categorize(rx) === 'examens_bio'),
                    examens_imagerie: prescriptions.filter(rx => categorize(rx) === 'examens_imagerie'),
                    traitements: prescriptions.filter(rx => categorize(rx) === 'traitements'),
                  };

                  const renderRxItem = (rx: any) => (
                    <div key={rx.id} className={cn('p-3 rounded-lg border flex items-center justify-between',
                      rx.priority === 'stat' && 'border-medical-critical/30', rx.status === 'completed' && 'opacity-60')}>
                      <div>
                        <p className="font-medium text-sm">{rx.medication_name} — {rx.dosage}</p>
                        <p className="text-xs text-muted-foreground">{rx.route} · {rx.frequency || 'Ponctuel'}</p>
                      </div>
                      <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}>{rx.status === 'active' ? 'Active' : rx.status === 'completed' ? 'Administré' : rx.status}</Badge>
                    </div>
                  );

                  const sections = [
                    { key: 'traitements', label: '💊 Traitements', items: groups.traitements },
                    { key: 'soins', label: '🩹 Soins', items: groups.soins },
                    { key: 'examens_bio', label: '🧪 Examens — Bilan biologique', items: groups.examens_bio },
                    { key: 'examens_imagerie', label: '📷 Examens — Imagerie', items: groups.examens_imagerie },
                  ];

                  return sections.filter(s => s.items.length > 0).map(s => (
                    <div key={s.key}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
                      <div className="space-y-2">{s.items.map(renderRxItem)}</div>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  Résultats
                  {results.filter(r => !r.is_read).length > 0 && (
                    <Badge className="bg-medical-critical text-medical-critical-foreground">{results.filter(r => !r.is_read).length} nouveau(x)</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.length === 0 && <p className="text-sm text-muted-foreground">Aucun résultat</p>}
                {results.map(r => (
                  <div key={r.id} className={cn('p-3 rounded-lg border', r.is_critical && 'border-l-4 border-l-medical-critical', !r.is_read && 'bg-primary/5')}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
