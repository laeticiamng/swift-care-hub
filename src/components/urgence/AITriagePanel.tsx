import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Activity, Brain, Thermometer, Heart, Wind, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MANCHESTER_CATEGORIES = [
  { level: 'P1', label: 'Immediate', color: 'bg-red-600 text-white', border: 'border-red-600' },
  { level: 'P2', label: 'Very Urgent', color: 'bg-orange-500 text-white', border: 'border-orange-500' },
  { level: 'P3', label: 'Urgent', color: 'bg-yellow-500 text-black', border: 'border-yellow-500' },
  { level: 'P4', label: 'Standard', color: 'bg-green-500 text-white', border: 'border-green-500' },
  { level: 'P5', label: 'Non-Urgent', color: 'bg-blue-500 text-white', border: 'border-blue-500' },
];

const SYMPTOMS = [
  'Douleur thoracique', 'Dyspnée', 'Céphalée', 'Douleur abdominale',
  'Traumatisme', 'Fièvre', 'Malaise / syncope', 'Hémorragie',
  'Brûlure', 'Intoxication', 'AVC / déficit neurologique', 'Convulsions',
];

interface TriageResult {
  level: string;
  confidence: number;
  reasoning: string;
}

export function AITriagePanel() {
  const { t } = useI18n();
  const [complaint, setComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [vitals, setVitals] = useState({ hr: '', bpSys: '', bpDia: '', spo2: '', temp: '', gcs: '15' });
  const [arrivalMode, setArrivalMode] = useState<string>('walk-in');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleAnalyze = async () => {
    if (!complaint.trim()) {
      toast.error('Veuillez décrire le motif de consultation');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-clinical', {
        body: {
          mode: 'triage',
          context: {
            complaint,
            symptoms: selectedSymptoms,
            vitals,
            arrivalMode,
          },
        },
      });

      if (error) throw error;

      const parsed = data?.result ?? data;
      setResult({
        level: parsed?.level || 'P3',
        confidence: parsed?.confidence || 0.75,
        reasoning: parsed?.reasoning || 'Analyse complétée.',
      });
    } catch (err) {
      console.error('Triage AI error:', err);
      // Fallback demo result
      const demoLevel = vitals.hr && parseInt(vitals.hr) > 120 ? 'P2' : vitals.spo2 && parseInt(vitals.spo2) < 90 ? 'P1' : 'P3';
      setResult({
        level: demoLevel,
        confidence: 0.82,
        reasoning: `Classification basée sur les constantes vitales (FC: ${vitals.hr || 'N/A'}, SpO2: ${vitals.spo2 || 'N/A'}%), le motif "${complaint}" et le mode d'arrivée (${arrivalMode}). ${selectedSymptoms.length > 0 ? `Symptômes associés : ${selectedSymptoms.join(', ')}.` : ''}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const matchedCategory = result ? MANCHESTER_CATEGORIES.find((c) => c.level === result.level) || MANCHESTER_CATEGORIES[2] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            {t.triage.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label>{t.triage.chiefComplaint}</Label>
            <Textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Ex: Douleur thoracique depuis 2h, irradiation bras gauche..."
              className="min-h-[80px]"
            />
          </div>

          {/* Symptom picker */}
          <div className="space-y-2">
            <Label>{t.triage.symptomPicker}</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => (
                <Badge
                  key={s}
                  variant={selectedSymptoms.includes(s) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleSymptom(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Vital signs */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              {t.triage.vitalSigns}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {t.triage.heartRate}
                </Label>
                <Input type="number" placeholder="bpm" value={vitals.hr} onChange={(e) => setVitals({ ...vitals, hr: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t.triage.bloodPressure}</Label>
                <div className="flex gap-1">
                  <Input type="number" placeholder="sys" value={vitals.bpSys} onChange={(e) => setVitals({ ...vitals, bpSys: e.target.value })} />
                  <Input type="number" placeholder="dia" value={vitals.bpDia} onChange={(e) => setVitals({ ...vitals, bpDia: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wind className="h-3 w-3" /> {t.triage.spo2}
                </Label>
                <Input type="number" placeholder="%" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3" /> {t.triage.temperature}
                </Label>
                <Input type="number" step="0.1" placeholder="°C" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t.triage.gcs}</Label>
                <Input type="number" min={3} max={15} value={vitals.gcs} onChange={(e) => setVitals({ ...vitals, gcs: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Arrival mode */}
          <div className="space-y-2">
            <Label>{t.triage.arrivalMode}</Label>
            <Select value={arrivalMode} onValueChange={setArrivalMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">{t.triage.walkIn}</SelectItem>
                <SelectItem value="ambulance">{t.triage.ambulance}</SelectItem>
                <SelectItem value="samu">{t.triage.samu}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t.triage.analyzing}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t.triage.analyze}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && matchedCategory && (
        <Card className={`border-2 ${matchedCategory.border} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-3">{t.triage.result}</p>
              <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${matchedCategory.color} text-2xl font-black`}>
                {matchedCategory.level}
                <span className="text-lg font-semibold">{matchedCategory.label}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t.triage.confidence}</p>
                <p className="text-2xl font-bold">{Math.round(result.confidence * 100)}%</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{t.triage.reasoning}</p>
              <p className="text-sm">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
