import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const SFMU_MOTIFS = [
  'Douleur thoracique', 'Dyspnée', 'Douleur abdominale', 'Traumatisme membre',
  'Chute personne âgée', 'Céphalée', 'Malaise / syncope', 'Intoxication',
  'AEG', 'Plaie / brûlure',
];

const STEPS = ['Identité', 'Motif', 'Constantes', 'Classification', 'Orientation'];

export default function TriagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 — Identity
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('M');

  // Step 2 — Motif
  const [motif, setMotif] = useState('');
  const [motifSearch, setMotifSearch] = useState('');

  // Step 3 — Vitals
  const [vitalsData, setVitalsData] = useState({ fc: '', pa_systolique: '', pa_diastolique: '', spo2: '', temperature: '', frequence_respiratoire: '', gcs: '', eva_douleur: '' });

  // Step 4 — CIMU
  const [cimu, setCimu] = useState<number | null>(null);

  // Step 5 — Orientation
  const [zone, setZone] = useState<string>('sau');
  const [boxNumber, setBoxNumber] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const filteredMotifs = SFMU_MOTIFS.filter(m => m.toLowerCase().includes(motifSearch.toLowerCase()));

  const canNext = () => {
    if (step === 0) return nom && prenom && dateNaissance && sexe;
    if (step === 1) return motif;
    if (step === 2) return true;
    if (step === 3) return cimu !== null;
    if (step === 4) return zone;
    return false;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    // Create patient
    const { data: patient, error: patErr } = await supabase.from('patients').insert({
      nom, prenom, date_naissance: dateNaissance, sexe,
    }).select().single();

    if (!patient || patErr) { setSubmitting(false); return; }

    // Create encounter
    const { data: encounter } = await supabase.from('encounters').insert({
      patient_id: patient.id,
      status: 'triaged',
      zone: zone as any,
      box_number: boxNumber ? parseInt(boxNumber) : null,
      ccmu: cimu, cimu,
      motif_sfmu: motif,
      triage_time: new Date().toISOString(),
    }).select().single();

    // Insert vitals if any
    const hasVitals = Object.values(vitalsData).some(v => v !== '');
    if (hasVitals && encounter) {
      const vObj: any = { encounter_id: encounter.id, patient_id: patient.id, recorded_by: user.id };
      if (vitalsData.fc) vObj.fc = parseInt(vitalsData.fc);
      if (vitalsData.pa_systolique) vObj.pa_systolique = parseInt(vitalsData.pa_systolique);
      if (vitalsData.pa_diastolique) vObj.pa_diastolique = parseInt(vitalsData.pa_diastolique);
      if (vitalsData.spo2) vObj.spo2 = parseInt(vitalsData.spo2);
      if (vitalsData.temperature) vObj.temperature = parseFloat(vitalsData.temperature);
      if (vitalsData.frequence_respiratoire) vObj.frequence_respiratoire = parseInt(vitalsData.frequence_respiratoire);
      if (vitalsData.gcs) vObj.gcs = parseInt(vitalsData.gcs);
      if (vitalsData.eva_douleur) vObj.eva_douleur = parseInt(vitalsData.eva_douleur);
      await supabase.from('vitals').insert(vObj);
    }

    setSubmitting(false);
    navigate('/board');
  };

  const cimuColors = [
    'bg-medical-critical text-medical-critical-foreground',
    'bg-medical-critical/80 text-medical-critical-foreground',
    'bg-medical-warning text-medical-warning-foreground',
    'bg-medical-success/80 text-medical-success-foreground',
    'bg-medical-success text-medical-success-foreground',
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Tri IOA</h1>
            <span className="text-sm text-muted-foreground">Étape {step + 1} / 5</span>
          </div>
          <Progress value={((step + 1) / 5) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s} className={cn('text-xs', i <= step ? 'text-primary font-medium' : 'text-muted-foreground')}>{s}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            {/* Step 0 — Identité */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nom</Label><Input value={nom} onChange={e => setNom(e.target.value)} placeholder="DUPONT" className="mt-1" /></div>
                  <div><Label>Prénom</Label><Input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date de naissance</Label><Input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} className="mt-1" /></div>
                  <div>
                    <Label>Sexe</Label>
                    <Select value={sexe} onValueChange={setSexe}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Motif */}
            {step === 1 && (
              <div className="space-y-4">
                <Input value={motifSearch} onChange={e => { setMotifSearch(e.target.value); if (!motif) setMotif(e.target.value); }} placeholder="Rechercher un motif..." />
                <div className="flex flex-wrap gap-2">
                  {filteredMotifs.map(m => (
                    <button key={m} onClick={() => { setMotif(m); setMotifSearch(m); }}
                      className={cn('px-3 py-2 rounded-full border text-sm transition-colors touch-target',
                        motif === m ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                      )}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Constantes */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'fc', label: 'FC (bpm)', placeholder: '80' },
                  { key: 'pa_systolique', label: 'PA sys (mmHg)', placeholder: '120' },
                  { key: 'pa_diastolique', label: 'PA dia (mmHg)', placeholder: '80' },
                  { key: 'spo2', label: 'SpO₂ (%)', placeholder: '98' },
                  { key: 'temperature', label: 'T° (°C)', placeholder: '37.0' },
                  { key: 'frequence_respiratoire', label: 'FR (/min)', placeholder: '16' },
                  { key: 'gcs', label: 'GCS (/15)', placeholder: '15' },
                  { key: 'eva_douleur', label: 'EVA (/10)', placeholder: '3' },
                ].map(v => {
                  const val = vitalsData[v.key as keyof typeof vitalsData];
                  const abnormal = val ? isVitalAbnormal(v.key, parseFloat(val)) : false;
                  return (
                    <div key={v.key}>
                      <Label className={cn(abnormal && 'text-medical-critical')}>{v.label}</Label>
                      <Input
                        type="number" step="0.1"
                        value={val}
                        onChange={e => setVitalsData({ ...vitalsData, [v.key]: e.target.value })}
                        placeholder={v.placeholder}
                        className={cn('mt-1 text-lg font-semibold h-12', abnormal && 'border-medical-critical text-medical-critical')}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 3 — Classification CIMU */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button key={level} onClick={() => setCimu(level)}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl text-lg font-bold transition-all touch-target-lg',
                        cimu === level ? cimuColors[level - 1] : 'border bg-card hover:bg-accent',
                      )}>
                      <span className="text-2xl">{level}</span>
                      <span className="text-xs mt-1 font-normal">CIMU</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Orientation */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Zone</Label>
                  <Select value={zone} onValueChange={setZone}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sau">SAU</SelectItem>
                      <SelectItem value="uhcd">UHCD</SelectItem>
                      <SelectItem value="dechocage">Déchocage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>N° de box (optionnel)</Label>
                  <Input type="number" value={boxNumber} onChange={e => setBoxNumber(e.target.value)} placeholder="1" className="mt-1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)} className="touch-target">
            <ArrowLeft className="h-4 w-4 mr-2" /> {step === 0 ? 'Annuler' : 'Précédent'}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="touch-target">
              Suivant <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || !canNext()} className="touch-target bg-medical-success hover:bg-medical-success/90 text-medical-success-foreground">
              <Check className="h-4 w-4 mr-2" /> {submitting ? 'En cours...' : 'Valider le tri'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
