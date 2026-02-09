import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
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
import { DEMO_ENCOUNTERS } from '@/lib/demo-data';
import { Activity, Eye, Truck, Bed, LogOut, ArrowLeft, Check, User, Users, Clock, Thermometer, Heart, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { OnboardingBanner } from '@/components/urgence/OnboardingBanner';

type ASView = 'menu' | 'constantes' | 'surveillance' | 'brancardage' | 'confort' | 'vital-temperature' | 'vital-pouls' | 'vital-tension' | 'vital-spo2';

interface EncounterItem {
  id: string;
  patient_id: string;
  box_number: number | null;
  zone: string | null;
  patients: { nom: string; prenom: string };
}

const VITAL_RANGES = {
  temperature: { min: 35, max: 38.5, unit: '°C', step: '0.1', placeholder: '37.0' },
  fc: { min: 50, max: 120, unit: 'bpm', step: '1', placeholder: '80' },
  pa_systolique: { min: 90, max: 180, unit: 'mmHg', step: '1', placeholder: '120' },
  pa_diastolique: { min: 50, max: 110, unit: 'mmHg', step: '1', placeholder: '80' },
  spo2: { min: 94, max: 100, unit: '%', step: '1', placeholder: '98' },
};

function triggerAbnormalAlert() {
  // Vibration
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
  // Sound alert via Web Audio API
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not supported
  }
}

export default function AideSoignantPage() {
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDemo();
  const navigate = useNavigate();
  const [view, setView] = useState<ASView>('menu');
  const [encounters, setEncounters] = useState<EncounterItem[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<string>('');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalValue2, setVitalValue2] = useState('');
  const [vitals, setVitals] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
  const [survNotes, setSurvNotes] = useState('');
  const [brancDestination, setBrancDestination] = useState('');
  const [confortNotes, setConfortNotes] = useState('');
  const [abnormalAlert, setAbnormalAlert] = useState(false);

  useEffect(() => { fetchEncounters(); }, []);

  const fetchEncounters = async () => {
    if (isDemoMode) {
      const demoEncs = DEMO_ENCOUNTERS.filter(e => e.status !== 'arrived').map(e => ({
        id: e.id,
        patient_id: e.patient_id,
        box_number: e.box_number,
        zone: e.zone,
        patients: { nom: e.patients.nom, prenom: e.patients.prenom },
      }));
      setEncounters(demoEncs);
      return;
    }
    const { data } = await supabase.from('encounters').select('id, patient_id, box_number, zone, patients(nom, prenom)').in('status', ['arrived', 'triaged', 'in-progress']);
    if (data) setEncounters(data as unknown as EncounterItem[]);
  };

  const getSelectedPatientId = () => encounters.find(e => e.id === selectedEncounter)?.patient_id;

  const checkAndAlert = useCallback((key: string, value: number) => {
    const abnormal = isVitalAbnormal(key, value);
    if (abnormal) {
      setAbnormalAlert(true);
      triggerAbnormalAlert();
      toast.error(`Valeur anormale detectee ! ${key.replace('_', ' ')} = ${value}`, { duration: 5000 });
      setTimeout(() => setAbnormalAlert(false), 3000);
    }
  }, []);

  const handleSaveVital = async (key: string, value: string, value2?: string) => {
    if (!selectedEncounter || !value) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;

    const numValue = parseFloat(value);
    checkAndAlert(key, numValue);
    if (value2 && key === 'pa_systolique') {
      checkAndAlert('pa_diastolique', parseFloat(value2));
    }

    if (isDemoMode) {
      toast.success('Constante enregistree (demo)');
      setVitalValue('');
      setVitalValue2('');
      setView('constantes');
      return;
    }

    const obj: Record<string, unknown> = { encounter_id: selectedEncounter, patient_id: patientId, recorded_by: user?.id };
    obj[key] = numValue;
    if (value2 && key === 'pa_systolique') {
      obj.pa_diastolique = parseFloat(value2);
    }

    const { error } = await supabase.from('vitals').insert(obj);
    if (error) { toast.error('Erreur lors de l\'enregistrement'); return; }
    toast.success('Constante enregistree');
    setVitalValue('');
    setVitalValue2('');
    setView('constantes');
  };

  const handleSaveVitals = async () => {
    if ((!user && !isDemoMode) || !selectedEncounter) return;
    const patientId = getSelectedPatientId();
    if (!patientId) return;

    // Check for abnormal values
    Object.entries(vitals).forEach(([key, val]) => {
      if (val) checkAndAlert(key, parseFloat(val));
    });

    if (isDemoMode) {
      toast.success('Constantes enregistrees (demo)');
      setVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
      setView('menu');
      return;
    }

    const obj: Record<string, unknown> = { encounter_id: selectedEncounter, patient_id: patientId, recorded_by: user?.id };
    if (vitals.fc) obj.fc = parseInt(vitals.fc);
    if (vitals.pa_systolique) obj.pa_systolique = parseInt(vitals.pa_systolique);
    if (vitals.pa_diastolique) obj.pa_diastolique = parseInt(vitals.pa_diastolique);
    if (vitals.spo2) obj.spo2 = parseInt(vitals.spo2);
    if (vitals.temperature) obj.temperature = parseFloat(vitals.temperature);
    if (vitals.frequence_respiratoire) obj.frequence_respiratoire = parseInt(vitals.frequence_respiratoire);
    if (vitals.gcs) obj.gcs = parseInt(vitals.gcs);
    if (vitals.eva_douleur) obj.eva_douleur = parseInt(vitals.eva_douleur);
    const { error } = await supabase.from('vitals').insert(obj);
    if (error) { toast.error('Erreur lors de l\'enregistrement'); return; }
    toast.success('Constantes enregistrees');
    setVitals({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });
    setView('menu');
  };

  const handleSurveillance = async () => {
    if ((!user && !isDemoMode) || !selectedEncounter) return;
    if (isDemoMode) { toast.success('Surveillance tracee (demo)'); setSurvNotes(''); setView('menu'); return; }
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user!.id, procedure_type: 'autre' as any, notes: `Surveillance: ${survNotes || 'Patient vu, RAS'}` });
    toast.success('Surveillance tracee');
    setSurvNotes(''); setView('menu');
  };

  const handleBrancardage = async () => {
    if ((!user && !isDemoMode) || !selectedEncounter) return;
    if (isDemoMode) { toast.success('Brancardage trace (demo)'); setBrancDestination(''); setView('menu'); return; }
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user!.id, procedure_type: 'autre' as any, notes: `Brancardage: ${brancDestination || 'Transport effectue'}` });
    toast.success('Brancardage trace');
    setBrancDestination(''); setView('menu');
  };

  const handleConfort = async () => {
    if ((!user && !isDemoMode) || !selectedEncounter) return;
    if (isDemoMode) { toast.success('Soin de confort trace (demo)'); setConfortNotes(''); setView('menu'); return; }
    const patientId = getSelectedPatientId();
    if (!patientId) return;
    await supabase.from('procedures').insert({ encounter_id: selectedEncounter, patient_id: patientId, performed_by: user!.id, procedure_type: 'autre' as any, notes: `Confort: ${confortNotes || 'Soins de confort effectues'}` });
    toast.success('Soin de confort trace');
    setConfortNotes(''); setView('menu');
  };

  const selectedPatient = encounters.find(e => e.id === selectedEncounter);

  const handleSignOut = () => {
    if (isDemoMode) { navigate('/demo/live'); return; }
    signOut();
  };

  return (
    <div className={cn('min-h-screen bg-background relative', abnormalAlert && 'animate-pulse')}>
      {abnormalAlert && (
        <div className="fixed inset-0 z-50 pointer-events-none border-4 border-medical-critical animate-pulse rounded-sm" />
      )}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-medical-critical/3" />
      </div>

      <header className="sticky top-0 z-20 border-b px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span> — AS</h1>
            <NetworkStatus />
            {isDemoMode && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => isDemoMode ? navigate('/demo/live') : navigate('/select-role')}>Role</Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4 relative z-10">
        <OnboardingBanner role="as" />
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="Patients" value={encounters.length} icon={Users} />
          <StatCard label="Selectionne" value={selectedPatient ? 1 : 0} icon={User} />
          <StatCard label="En charge" value={encounters.length} icon={Activity} />
        </div>

        <Select value={selectedEncounter} onValueChange={setSelectedEncounter}>
          <SelectTrigger className="h-14 text-base">
            <SelectValue placeholder="Selectionner un patient" />
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

        {view === 'constantes' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Button variant="ghost" onClick={() => setView('menu')} className="touch-target mb-3">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>

            {/* 4 BIG tactile buttons for quick vital entry */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { key: 'vital-temperature' as ASView, label: 'Temperature', icon: Thermometer, color: 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-950/50', textColor: 'text-red-700 dark:text-red-300' },
                { key: 'vital-pouls' as ASView, label: 'Pouls', icon: Heart, color: 'bg-pink-100 dark:bg-pink-950/30 border-pink-300 dark:border-pink-800 hover:bg-pink-200 dark:hover:bg-pink-950/50', textColor: 'text-pink-700 dark:text-pink-300' },
                { key: 'vital-tension' as ASView, label: 'Tension', icon: Activity, color: 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-950/50', textColor: 'text-blue-700 dark:text-blue-300' },
                { key: 'vital-spo2' as ASView, label: 'SpO2', icon: Droplets, color: 'bg-cyan-100 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-950/50', textColor: 'text-cyan-700 dark:text-cyan-300' },
              ].map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => { setVitalValue(''); setVitalValue2(''); setView(item.key); }}
                  disabled={!selectedEncounter}
                  className={cn(
                    'flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all min-h-[120px] touch-target-lg active:scale-95',
                    selectedEncounter ? item.color : 'bg-muted border-muted-foreground/20 opacity-50',
                    'animate-in fade-in slide-in-from-bottom-4',
                  )}
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
                  <item.icon className={cn('h-10 w-10 mb-2', selectedEncounter ? item.textColor : 'text-muted-foreground')} />
                  <span className={cn('text-lg font-bold', selectedEncounter ? item.textColor : 'text-muted-foreground')}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Full form link */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Saisie complete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'fc', label: 'FC (bpm)', placeholder: '80' },
                  { key: 'pa_systolique', label: 'PA systolique', placeholder: '120' },
                  { key: 'pa_diastolique', label: 'PA diastolique', placeholder: '80' },
                  { key: 'spo2', label: 'SpO2 (%)', placeholder: '98' },
                  { key: 'temperature', label: 'Temperature (°C)', placeholder: '37.0' },
                  { key: 'frequence_respiratoire', label: 'FR (/min)', placeholder: '16' },
                  { key: 'gcs', label: 'GCS (/15)', placeholder: '15' },
                  { key: 'eva_douleur', label: 'EVA douleur (/10)', placeholder: '0' },
                ].map(v => {
                  const val = vitals[v.key as keyof typeof vitals];
                  const abnormal = val ? isVitalAbnormal(v.key, parseFloat(val)) : false;
                  return (
                    <div key={v.key}>
                      <Label className={cn('text-sm', abnormal && 'text-medical-critical font-semibold')}>{v.label} {abnormal && <AlertTriangle className="h-3 w-3 inline" />}</Label>
                      <Input type="number" step="0.1" inputMode="decimal" value={val}
                        onChange={e => setVitals({ ...vitals, [v.key]: e.target.value })}
                        placeholder={v.placeholder}
                        className={cn('mt-1 text-xl font-semibold h-14', abnormal && 'border-medical-critical text-medical-critical bg-red-50 dark:bg-red-950/20')} />
                    </div>
                  );
                })}
                <Button onClick={handleSaveVitals} className="w-full touch-target-lg text-lg h-14" disabled={!selectedEncounter}>
                  <Check className="h-5 w-5 mr-2" /> Enregistrer toutes
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Individual vital sign entry screens */}
        {view === 'vital-temperature' && (
          <VitalEntryScreen
            title="Temperature"
            icon={<Thermometer className="h-8 w-8 text-red-600" />}
            unit="°C"
            step="0.1"
            placeholder="37.0"
            inputMode="decimal"
            value={vitalValue}
            onChange={setVitalValue}
            abnormal={vitalValue ? isVitalAbnormal('temperature', parseFloat(vitalValue)) : false}
            rangeHint="Normal : 35.0 — 38.5 °C"
            onSave={() => handleSaveVital('temperature', vitalValue)}
            onBack={() => setView('constantes')}
            disabled={!selectedEncounter}
          />
        )}

        {view === 'vital-pouls' && (
          <VitalEntryScreen
            title="Pouls (FC)"
            icon={<Heart className="h-8 w-8 text-pink-600" />}
            unit="bpm"
            step="1"
            placeholder="80"
            inputMode="numeric"
            value={vitalValue}
            onChange={setVitalValue}
            abnormal={vitalValue ? isVitalAbnormal('fc', parseFloat(vitalValue)) : false}
            rangeHint="Normal : 50 — 120 bpm"
            onSave={() => handleSaveVital('fc', vitalValue)}
            onBack={() => setView('constantes')}
            disabled={!selectedEncounter}
          />
        )}

        {view === 'vital-tension' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
            <Button variant="ghost" onClick={() => setView('constantes')} className="touch-target">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold">Tension arterielle</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={cn('text-lg', vitalValue && isVitalAbnormal('pa_systolique', parseFloat(vitalValue)) && 'text-medical-critical font-bold')}>
                      Systolique
                    </Label>
                    <Input
                      type="number" inputMode="numeric" step="1" placeholder="120"
                      value={vitalValue} onChange={e => setVitalValue(e.target.value)}
                      className={cn('mt-2 text-4xl font-bold h-20 text-center', vitalValue && isVitalAbnormal('pa_systolique', parseFloat(vitalValue)) && 'border-medical-critical text-medical-critical bg-red-50 dark:bg-red-950/20')}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-1">mmHg (90—180)</p>
                  </div>
                  <div>
                    <Label className={cn('text-lg', vitalValue2 && isVitalAbnormal('pa_diastolique', parseFloat(vitalValue2)) && 'text-medical-critical font-bold')}>
                      Diastolique
                    </Label>
                    <Input
                      type="number" inputMode="numeric" step="1" placeholder="80"
                      value={vitalValue2} onChange={e => setVitalValue2(e.target.value)}
                      className={cn('mt-2 text-4xl font-bold h-20 text-center', vitalValue2 && isVitalAbnormal('pa_diastolique', parseFloat(vitalValue2)) && 'border-medical-critical text-medical-critical bg-red-50 dark:bg-red-950/20')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">mmHg (50—110)</p>
                  </div>
                </div>
                {(vitalValue || vitalValue2) && (
                  <div className="text-center">
                    <span className="text-3xl font-bold">{vitalValue || '—'}/{vitalValue2 || '—'}</span>
                    <span className="text-lg text-muted-foreground ml-2">mmHg</span>
                  </div>
                )}
                <Button onClick={() => handleSaveVital('pa_systolique', vitalValue, vitalValue2)} className="w-full touch-target-lg text-xl h-16" disabled={!selectedEncounter || !vitalValue}>
                  <Check className="h-6 w-6 mr-2" /> Enregistrer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'vital-spo2' && (
          <VitalEntryScreen
            title="SpO2"
            icon={<Droplets className="h-8 w-8 text-cyan-600" />}
            unit="%"
            step="1"
            placeholder="98"
            inputMode="numeric"
            value={vitalValue}
            onChange={setVitalValue}
            abnormal={vitalValue ? isVitalAbnormal('spo2', parseFloat(vitalValue)) : false}
            rangeHint="Normal : >= 94%"
            onSave={() => handleSaveVital('spo2', vitalValue)}
            onBack={() => setView('constantes')}
            disabled={!selectedEncounter}
          />
        )}

        {view !== 'menu' && view !== 'constantes' && !view.startsWith('vital-') && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <Button variant="ghost" onClick={() => setView('menu')} className="touch-target">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>

            {view === 'surveillance' && (
              <Card>
                <CardHeader><CardTitle>Surveillance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={survNotes} onChange={e => setSurvNotes(e.target.value)} placeholder="Notes de surveillance (optionnel)..." rows={4} className="text-base" />
                  <Button onClick={handleSurveillance} className="w-full touch-target-lg text-lg h-14" disabled={!selectedEncounter}>
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
                  <Button onClick={handleBrancardage} className="w-full touch-target-lg text-lg h-14" disabled={!selectedEncounter}>
                    <Check className="h-5 w-5 mr-2" /> Transport effectue
                  </Button>
                </CardContent>
              </Card>
            )}

            {view === 'confort' && (
              <Card>
                <CardHeader><CardTitle>Soins de confort</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={confortNotes} onChange={e => setConfortNotes(e.target.value)} placeholder="Hydratation, installation, couverture, repas..." rows={4} className="text-base" />
                  <Button onClick={handleConfort} className="w-full touch-target-lg text-lg h-14" disabled={!selectedEncounter}>
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

function VitalEntryScreen({ title, icon, unit, step, placeholder, inputMode, value, onChange, abnormal, rangeHint, onSave, onBack, disabled }: {
  title: string; icon: React.ReactNode; unit: string; step: string; placeholder: string; inputMode: 'numeric' | 'decimal';
  value: string; onChange: (v: string) => void; abnormal: boolean; rangeHint: string;
  onSave: () => void; onBack: () => void; disabled: boolean;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
      <Button variant="ghost" onClick={onBack} className="touch-target">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>
      <Card className={cn('border-2', abnormal && 'border-medical-critical')}>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          {abnormal && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800">
              <AlertTriangle className="h-5 w-5 text-medical-critical" />
              <span className="text-sm font-semibold text-medical-critical">Valeur hors norme !</span>
            </div>
          )}
          <div className="text-center">
            <Input
              type="number" inputMode={inputMode} step={step} placeholder={placeholder}
              value={value} onChange={e => onChange(e.target.value)}
              className={cn('text-5xl font-bold h-24 text-center', abnormal && 'border-medical-critical text-medical-critical bg-red-50 dark:bg-red-950/20')}
              autoFocus
            />
            <p className="text-lg text-muted-foreground mt-2">{unit}</p>
            <p className="text-xs text-muted-foreground mt-1">{rangeHint}</p>
          </div>
          <Button onClick={onSave} className="w-full touch-target-lg text-xl h-16" disabled={disabled || !value}>
            <Check className="h-6 w-6 mr-2" /> Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
