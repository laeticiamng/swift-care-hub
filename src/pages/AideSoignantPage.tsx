import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BigButton } from '@/components/urgence/BigButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { Activity, Eye, Truck, Bed, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ASView = 'menu' | 'constantes' | 'surveillance' | 'brancardage' | 'confort';

export default function AideSoignantPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ASView>('menu');
  const [encounters, setEncounters] = useState<any[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<string>('');

  // Vitals
  const [vitals, setVitals] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '' });

  // Surveillance
  const [survNotes, setSurvNotes] = useState('');

  // Brancardage
  const [brancStatus, setBrancStatus] = useState('demande');

  // Confort
  const [confortNotes, setConfortNotes] = useState('');

  useEffect(() => {
    fetchEncounters();
  }, []);

  const fetchEncounters = async () => {
    const { data } = await supabase
      .from('encounters')
      .select('id, box_number, zone, patients(nom, prenom)')
      .in('status', ['arrived', 'triaged', 'in-progress']);
    if (data) setEncounters(data as any[]);
  };

  const selectedPatient = encounters.find(e => e.id === selectedEncounter);

  const handleSaveVitals = async () => {
    if (!user || !selectedEncounter) return;
    const enc = encounters.find(e => e.id === selectedEncounter);
    if (!enc) return;
    const obj: any = { encounter_id: selectedEncounter, patient_id: enc.id, recorded_by: user.id };
    if (vitals.fc) obj.fc = parseInt(vitals.fc);
    if (vitals.pa_systolique) obj.pa_systolique = parseInt(vitals.pa_systolique);
    if (vitals.pa_diastolique) obj.pa_diastolique = parseInt(vitals.pa_diastolique);
    if (vitals.spo2) obj.spo2 = parseInt(vitals.spo2);
    if (vitals.temperature) obj.temperature = parseFloat(vitals.temperature);

    // We need patient_id from the encounter, refetch
    const { data: encData } = await supabase.from('encounters').select('patient_id').eq('id', selectedEncounter).single();
    if (encData) {
      obj.patient_id = encData.patient_id;
      await supabase.from('vitals').insert(obj);
    }
    setVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '' });
    setView('menu');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold">UrgenceOS — AS</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Patient selector */}
        <Select value={selectedEncounter} onValueChange={setSelectedEncounter}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Sélectionner un patient" />
          </SelectTrigger>
          <SelectContent>
            {encounters.map(e => (
              <SelectItem key={e.id} value={e.id}>
                {e.patients?.nom} {e.patients?.prenom} {e.box_number ? `— Box ${e.box_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {view === 'menu' && (
          <div className="grid grid-cols-2 gap-4">
            <BigButton label="Constantes" icon={Activity} onClick={() => setView('constantes')} />
            <BigButton label="Surveillance" icon={Eye} onClick={() => setView('surveillance')} />
            <BigButton label="Brancardage" icon={Truck} onClick={() => setView('brancardage')} />
            <BigButton label="Confort" icon={Bed} onClick={() => setView('confort')} />
          </div>
        )}

        {view !== 'menu' && (
          <>
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
                  ].map(v => {
                    const val = vitals[v.key as keyof typeof vitals];
                    const abnormal = val ? isVitalAbnormal(v.key, parseFloat(val)) : false;
                    return (
                      <div key={v.key}>
                        <Label className={cn('text-base', abnormal && 'text-medical-critical')}>{v.label}</Label>
                        <Input type="number" step="0.1" value={val}
                          onChange={e => setVitals({ ...vitals, [v.key]: e.target.value })}
                          placeholder={v.placeholder}
                          className={cn('mt-1 text-xl font-semibold h-14', abnormal && 'border-medical-critical text-medical-critical')} />
                      </div>
                    );
                  })}
                  <Button onClick={handleSaveVitals} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'surveillance' && (
              <Card>
                <CardHeader><CardTitle>Surveillance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={survNotes} onChange={e => setSurvNotes(e.target.value)} placeholder="Notes de surveillance..." rows={4} className="text-base" />
                  <Button onClick={() => { setSurvNotes(''); setView('menu'); }} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    Patient vu ✓
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'brancardage' && (
              <Card>
                <CardHeader><CardTitle>Demande de brancardage</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={brancStatus} onValueChange={setBrancStatus}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demande">Demandé</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setView('menu')} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    Valider
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'confort' && (
              <Card>
                <CardHeader><CardTitle>Soins de confort</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={confortNotes} onChange={e => setConfortNotes(e.target.value)} placeholder="Hydratation, installation, couverture..." rows={4} className="text-base" />
                  <Button onClick={() => { setConfortNotes(''); setView('menu'); }} className="w-full touch-target-lg text-lg" disabled={!selectedEncounter}>
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
