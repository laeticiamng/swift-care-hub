import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BigButton } from '@/components/urgence/BigButton';
import { StatCard } from '@/components/urgence/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { Activity, Eye, Truck, Bed, LogOut, ArrowLeft, Check, User, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';

type ASView = 'menu' | 'constantes' | 'surveillance' | 'brancardage' | 'confort';

interface EncounterItem {
  id: string;
  patient_id: string;
  box_number: number | null;
  zone: string | null;
  patients: { nom: string; prenom: string };
}

export default function AideSoignantPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ASView>('menu');
  const [encounters, setEncounters] = useState<EncounterItem[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<string>('');
  const [vitals, setVitals] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '' });
  const [survNotes, setSurvNotes] = useState('');
  const [brancDestination, setBrancDestination] = useState('');
  const [confortNotes, setConfortNotes] = useState('');

  useEffect(() => { fetchEncounters(); }, []);

  const fetchEncounters = async () => {
    const { data } = await supabase.from('encounters').select('id, patient_id, box_number, zone, patients(nom, prenom)').in('status', ['arrived', 'triaged', 'in-progress']);
    if (data) setEncounters(data as unknown as EncounterItem[]);
  };

  const getSelectedPatientId = () => encounters.find(e => e.id === selectedEncounter)?.patient_id;

  const handleSaveVitals = async () => {
    if (!user || !selectedEncounter) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    const obj: any = { encounter_id: selectedEncounter, patient_id: patientId, recorded_by: user.id };
    if (vitals.fc) obj.fc = parseInt(vitals.fc);
    if (vitals.pa_systolique) obj.pa_systolique = parseInt(vitals.pa_systolique);
    if (vitals.pa_diastolique) obj.pa_diastolique = parseInt(vitals.pa_diastolique);
    if (vitals.spo2) obj.spo2 = parseInt(vitals.spo2);
    if (vitals.temperature) obj.temperature = parseFloat(vitals.temperature);
    if (vitals.frequence_respiratoire) obj.frequence_respiratoire = parseInt(vitals.frequence_respiratoire);
    const { error } = await supabase.from('vitals').insert(obj);
    if (error) { toast.error('Erreur lors de l\'enregistrement'); return; }
    toast.success('Constantes enregistrées');
    setVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '' });
    setView('menu');
  };

  const handleSurveillance = async () => {
    if (!user || !selectedEncounter) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user.id, procedure_type: 'autre' as any, notes: `Surveillance: ${survNotes || 'Patient vu, RAS'}` });
    toast.success('Surveillance tracée');
    setSurvNotes(''); setView('menu');
  };

  const handleBrancardage = async () => {
    if (!user || !selectedEncounter) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user.id, procedure_type: 'autre' as any, notes: `Brancardage: ${brancDestination || 'Transport effectué'}` });
    toast.success('Brancardage tracé');
    setBrancDestination(''); setView('menu');
  };

  const handleConfort = async () => {
    if (!user || !selectedEncounter) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user.id, procedure_type: 'autre' as any, notes: `Confort: ${confortNotes || 'Soins de confort effectués'}` });
    toast.success('Soin de confort tracé');
    setConfortNotes(''); setView('menu');
  };

  const selectedPatient = encounters.find(e => e.id === selectedEncounter);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-medical-critical/3" />
      </div>

      <header className="sticky top-0 z-20 border-b px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span> — AS</h1>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4 relative z-10">
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="Patients" value={encounters.length} icon={Users} />
          <StatCard label="Sélectionné" value={selectedPatient ? 1 : 0} icon={User} />
          <StatCard label="En charge" value={encounters.length} icon={Activity} />
        </div>

        <Select value={selectedEncounter} onValueChange={setSelectedEncounter}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Sélectionner un patient" />
          </SelectTrigger>
          <SelectContent>
            {encounters.map(e => (
              <SelectItem key={e.id} value={e.id}>
                {e.patients?.nom} {e.patients?.prenom} {e.box_number ? `— Box ${e.box_number}` : ''} {e.zone ? `(${e.zone.toUpperCase()})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPatient && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in scale-in duration-200">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {selectedPatient.patients?.nom?.toUpperCase()} {selectedPatient.patients?.prenom}
            </span>
            {selectedPatient.box_number && (
              <Badge variant="outline" className="text-xs ml-1">Box {selectedPatient.box_number}</Badge>
            )}
          </div>
        )}

        {view === 'menu' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Constantes', icon: Activity, view: 'constantes' as ASView },
              { label: 'Surveillance', icon: Eye, view: 'surveillance' as ASView },
              { label: 'Brancardage', icon: Truck, view: 'brancardage' as ASView },
              { label: 'Confort', icon: Bed, view: 'confort' as ASView },
            ].map((item, idx) => (
              <div key={item.view} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>
                <BigButton label={item.label} icon={item.icon} onClick={() => setView(item.view)} />
              </div>
            ))}
          </div>
        )}

        {view !== 'menu' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <Button variant="ghost" onClick={() => setView('menu')} className="touch-target">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>

            {view === 'constantes' && (
              <Card>
                <CardHeader><CardTitle>Saisie constantes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'fc', label: 'FC (bpm)', placeholder: '80' },
                    { key: 'pa_systolique', label: 'PA systolique', placeholder: '120' },
                    { key: 'pa_diastolique', label: 'PA diastolique', placeholder: '80' },
                    { key: 'spo2', label: 'SpO₂ (%)', placeholder: '98' },
                    { key: 'temperature', label: 'Température (°C)', placeholder: '37.0' },
                    { key: 'frequence_respiratoire', label: 'FR (/min)', placeholder: '16' },
                  ].map(v => {
                    const val = vitals[v.key as keyof typeof vitals];
                    const abnormal = val ? isVitalAbnormal(v.key, parseFloat(val)) : false;
                    return (
                      <div key={v.key}>
                        <Label className={cn('text-base', abnormal && 'text-medical-critical')}>{v.label}</Label>
                      <Input type="number" step="0.1" value={val}
                          onChange={e => setVitals({ ...vitals, [v.key]: e.target.value })}
                          placeholder={v.placeholder}
                          className={cn('mt-1 text-2xl font-semibold h-16', abnormal && 'border-medical-critical text-medical-critical')} />
                      </div>
                    );
                  })}
                  <Button onClick={handleSaveVitals} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    <Check className="h-5 w-5 mr-2" /> Enregistrer
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'surveillance' && (
              <Card>
                <CardHeader><CardTitle>Surveillance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={survNotes} onChange={e => setSurvNotes(e.target.value)} placeholder="Notes de surveillance (optionnel)..." rows={4} className="text-base" />
                  <Button onClick={handleSurveillance} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    <Check className="h-5 w-5 mr-2" /> Patient vu
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'brancardage' && (
              <Card>
                <CardHeader><CardTitle>Brancardage</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base">Destination</Label>
                    <Input value={brancDestination} onChange={e => setBrancDestination(e.target.value)} placeholder="Radio, Scanner, Bloc..." className="mt-1 text-lg h-14" />
                  </div>
                  <Button onClick={handleBrancardage} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    <Check className="h-5 w-5 mr-2" /> Transport effectué
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'confort' && (
              <Card>
                <CardHeader><CardTitle>Soins de confort</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={confortNotes} onChange={e => setConfortNotes(e.target.value)} placeholder="Hydratation, installation, couverture, repas..." rows={4} className="text-base" />
                  <Button onClick={handleConfort} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    <Check className="h-5 w-5 mr-2" /> Enregistrer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
