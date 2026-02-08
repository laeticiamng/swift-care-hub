import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PatientBanner } from '@/components/urgence/PatientBanner';
import { CCMUBadge } from '@/components/urgence/CCMUBadge';
import { calculateAge, isVitalAbnormal } from '@/lib/vitals-utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, FileText, AlertTriangle, Clock, FlaskConical, Image } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

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
  const [newRx, setNewRx] = useState({ medication_name: '', dosage: '', route: 'PO' as string, frequency: '', priority: 'routine' as string });

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
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

  const handlePrescribe = async () => {
    if (!encounter || !user) return;
    await supabase.from('prescriptions').insert({
      encounter_id: encounter.id,
      patient_id: encounter.patient_id,
      prescriber_id: user.id,
      medication_name: newRx.medication_name,
      dosage: newRx.dosage,
      route: newRx.route as any,
      frequency: newRx.frequency,
      priority: newRx.priority as any,
    });
    setNewRx({ medication_name: '', dosage: '', route: 'PO', frequency: '', priority: 'routine' });
    setPrescribeOpen(false);
    fetchAll();
  };

  if (!patient || !encounter) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Chargement...</div>;

  const age = calculateAge(patient.date_naissance);
  const vitalKeys = ['fc', 'pa_systolique', 'spo2', 'temperature'];
  const vitalLabels: Record<string, string> = { fc: 'FC', pa_systolique: 'PA sys', spo2: 'SpO₂', temperature: 'T°' };
  const vitalUnits: Record<string, string> = { fc: 'bpm', pa_systolique: 'mmHg', spo2: '%', temperature: '°C' };

  return (
    <div className="min-h-screen bg-background">
      <PatientBanner
        nom={patient.nom} prenom={patient.prenom} age={age} sexe={patient.sexe}
        ccmu={encounter.ccmu} motif={encounter.motif_sfmu}
        allergies={patient.allergies || []} onBack={() => navigate(-1)}
      />

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Timeline — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Timeline patient</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {timeline.length === 0 && <p className="text-sm text-muted-foreground">Aucun élément</p>}
              {timeline.map(item => {
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
                      {item.source_document && <p className="text-xs text-muted-foreground mt-1">Source : {item.source_document}</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Actions — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vitals sparklines */}
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
                          <LineChart data={data}>
                            <YAxis hide domain={['auto', 'auto']} />
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

          {/* Prescriptions */}
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
                      <Input value={newRx.medication_name} onChange={e => setNewRx({ ...newRx, medication_name: e.target.value })} placeholder="Paracétamol" />
                    </div>
                    <div>
                      <Label>Posologie</Label>
                      <Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="1g" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Voie</Label>
                        <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['PO', 'IV', 'SC', 'IM', 'INH'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
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
                    <div>
                      <Label>Fréquence</Label>
                      <Input value={newRx.frequency} onChange={e => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="Toutes les 6h" />
                    </div>
                    <Button onClick={handlePrescribe} className="w-full" disabled={!newRx.medication_name || !newRx.dosage}>
                      Valider la prescription
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-2">
              {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucune prescription</p>}
              {prescriptions.map(rx => (
                <div key={rx.id} className={cn('p-3 rounded-lg border flex items-center justify-between',
                  rx.priority === 'stat' && 'border-medical-critical/30',
                  rx.status === 'completed' && 'opacity-60',
                )}>
                  <div>
                    <p className="font-medium text-sm">{rx.medication_name} — {rx.dosage}</p>
                    <p className="text-xs text-muted-foreground">{rx.route} · {rx.frequency || 'Ponctuel'}</p>
                  </div>
                  <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}>{rx.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Results */}
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
                <div key={r.id} className={cn('p-3 rounded-lg border', r.is_critical && 'border-l-4 border-l-medical-critical')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.category === 'bio' ? <FlaskConical className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                      <span className="font-medium text-sm">{r.title}</span>
                    </div>
                    {r.is_critical && <Badge className="bg-medical-critical text-medical-critical-foreground text-xs">Critique</Badge>}
                    {!r.is_read && <Badge variant="secondary" className="text-xs">Nouveau</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
