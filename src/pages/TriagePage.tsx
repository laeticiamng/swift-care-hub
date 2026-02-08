import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { ArrowLeft, ArrowRight, Check, Search, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const SFMU_MOTIFS = [
  'Douleur thoracique', 'Dyspnée', 'Douleur abdominale', 'Traumatisme membre',
  'Chute personne âgée', 'Céphalée', 'Malaise / syncope', 'Intoxication',
  'AEG', 'Plaie / brûlure',
];

const STEPS = ['Identité', 'Motif', 'Constantes', 'Classification', 'Orientation'];

function suggestCIMU(vitals: Record<string, string>): number | null {
  const fc = vitals.fc ? parseInt(vitals.fc) : null;
  const pas = vitals.pa_systolique ? parseInt(vitals.pa_systolique) : null;
  const spo2 = vitals.spo2 ? parseInt(vitals.spo2) : null;
  const gcs = vitals.gcs ? parseInt(vitals.gcs) : null;
  const fr = vitals.frequence_respiratoire ? parseInt(vitals.frequence_respiratoire) : null;

  // CIMU 1 — Détresse vitale immédiate
  if (gcs !== null && gcs <= 8) return 1;
  if (pas !== null && pas < 70) return 1;
  if (spo2 !== null && spo2 < 85) return 1;
  if (fr !== null && fr < 8) return 1;

  // CIMU 2 — Menace vitale
  if (gcs !== null && gcs <= 12) return 2;
  if (pas !== null && pas < 80) return 2;
  if (spo2 !== null && spo2 < 90) return 2;
  if (fc !== null && (fc > 140 || fc < 40)) return 2;

  // CIMU 3 — Paramètre anormal significatif
  let abnormalCount = 0;
  if (fc !== null && (fc > 120 || fc < 50)) abnormalCount++;
  if (pas !== null && (pas > 180 || pas < 90)) abnormalCount++;
  if (spo2 !== null && spo2 < 94) abnormalCount++;
  if (fr !== null && (fr > 25 || fr < 10)) abnormalCount++;
  if (abnormalCount >= 2) return 3;
  if (abnormalCount === 1) return 3;

  // CIMU 4 or 5
  const hasAnyVital = Object.values(vitals).some(v => v !== '');
  if (hasAnyVital) return 4;
  return null;
}

export default function TriagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 — Identity
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('M');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<any>(null);

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

  // Patient search
  const searchPatients = useCallback(async (searchNom: string) => {
    if (searchNom.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from('patients')
      .select('id, nom, prenom, date_naissance, sexe, allergies, antecedents')
      .ilike('nom', `%${searchNom}%`)
      .limit(5);
    if (data) setSearchResults(data);
  }, []);

  const handleNomChange = (value: string) => {
    setNom(value);
    setSelectedExisting(null);
    searchPatients(value);
  };

  const selectExistingPatient = (patient: any) => {
    setSelectedExisting(patient);
    setNom(patient.nom);
    setPrenom(patient.prenom);
    setDateNaissance(patient.date_naissance);
    setSexe(patient.sexe);
    setSearchResults([]);
  };

  const canNext = () => {
    if (step === 0) return nom && prenom && dateNaissance && sexe;
    if (step === 1) return motif;
    if (step === 2) return true;
    if (step === 3) return cimu !== null;
    if (step === 4) return zone;
    return false;
  };

  // Auto-suggest CIMU when entering step 3→4
  const goToStep = (nextStep: number) => {
    if (nextStep === 3 && step === 2) {
      const suggestion = suggestCIMU(vitalsData);
      if (suggestion && cimu === null) setCimu(suggestion);
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    let patientId: string;

    if (selectedExisting) {
      patientId = selectedExisting.id;
    } else {
      const { data: patient, error: patErr } = await supabase.from('patients').insert({
        nom, prenom, date_naissance: dateNaissance, sexe,
      }).select().single();
      if (!patient || patErr) { toast.error('Erreur création patient'); setSubmitting(false); return; }
      patientId = patient.id;
    }

    const { data: encounter, error: encErr } = await supabase.from('encounters').insert({
      patient_id: patientId,
      status: 'triaged',
      zone: zone as any,
      box_number: boxNumber ? parseInt(boxNumber) : null,
      ccmu: cimu, cimu,
      motif_sfmu: motif,
      triage_time: new Date().toISOString(),
    }).select().single();

    if (encErr || !encounter) { toast.error('Erreur création passage'); setSubmitting(false); return; }

    // Insert vitals if any
    const hasVitals = Object.values(vitalsData).some(v => v !== '');
    if (hasVitals) {
      const vObj: any = { encounter_id: encounter.id, patient_id: patientId, recorded_by: user.id };
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

    toast.success('Tri validé — patient orienté ✓');
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
  const cimuLabels = ['Détresse vitale', 'Menace vitale', 'Fonctionnel', 'Stable', 'Non urgent'];

  const suggested = suggestCIMU(vitalsData);

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
                  <div className="relative">
                    <Label>Nom</Label>
                    <Input value={nom} onChange={e => handleNomChange(e.target.value)} placeholder="DUPONT" className="mt-1" />
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 bg-card border rounded-lg shadow-lg mt-1 overflow-hidden">
                        <p className="text-xs text-muted-foreground px-3 py-1.5 border-b"><Search className="h-3 w-3 inline mr-1" />Patients existants :</p>
                        {searchResults.map(p => (
                          <button key={p.id} type="button" onClick={() => selectExistingPatient(p)}
                            className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm">
                            <span className="font-medium">{p.nom} {p.prenom}</span>
                            <span className="text-muted-foreground ml-2">{p.date_naissance} · {p.sexe}</span>
                            {p.allergies?.length > 0 && <span className="text-medical-critical ml-2 text-xs">⚠ {p.allergies.join(', ')}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedExisting && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Check className="h-3 w-3 mr-1" /> Patient connu
                        {selectedExisting.allergies?.length > 0 && (
                          <span className="text-medical-critical ml-1">⚠ Allergies: {selectedExisting.allergies.join(', ')}</span>
                        )}
                      </Badge>
                    )}
                  </div>
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
                {selectedExisting?.antecedents?.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent/50 border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Antécédents connus</p>
                    <p className="text-sm">{selectedExisting.antecedents.join(', ')}</p>
                  </div>
                )}
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
                {suggested !== null && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm">
                      Suggestion basée sur les constantes : <span className="font-bold">CIMU {suggested}</span> — {cimuLabels[suggested - 1]}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button key={level} onClick={() => setCimu(level)}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl text-lg font-bold transition-all touch-target-lg',
                        cimu === level ? cimuColors[level - 1] : 'border bg-card hover:bg-accent',
                      )}>
                      <span className="text-2xl">{level}</span>
                      <span className="text-[10px] mt-1 font-normal leading-tight text-center">{cimuLabels[level - 1]}</span>
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
            <Button onClick={() => goToStep(step + 1)} disabled={!canNext()} className="touch-target">
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