import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const VITAL_LABELS: Record<string, string> = { fc: 'FC', pa_systolique: 'PA sys', spo2: 'SpO₂', temperature: 'T°', frequence_respiratoire: 'FR', gcs: 'GCS', eva_douleur: 'EVA' };
const VITAL_UNITS: Record<string, string> = { fc: 'bpm', pa_systolique: 'mmHg', spo2: '%', temperature: '°C', frequence_respiratoire: '/min', gcs: '/15', eva_douleur: '/10' };

interface VitalsPanelProps {
  vitals: any[];
  orderedVitalKeys: string[];
  contextPriorityVitals: string[];
}

export function VitalsPanel({ vitals, orderedVitalKeys, contextPriorityVitals }: VitalsPanelProps) {
  return (
    <Card className="animate-in fade-in duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      <CardHeader className="pb-2"><CardTitle className="text-lg">Constantes</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {orderedVitalKeys.map(key => {
            const data = vitals.map(v => ({ value: v[key] })).filter(d => d.value != null);
            const lastVal = data.length > 0 ? data[data.length - 1].value : null;
            const abnormal = isVitalAbnormal(key, lastVal);
            const isPriority = contextPriorityVitals.includes(key);
            return (
              <div key={key} className={cn('p-3 rounded-lg border', abnormal && 'border-medical-critical bg-medical-critical/5', isPriority && !abnormal && 'border-primary/30 bg-primary/5')}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{VITAL_LABELS[key]}</span>
                  <span className={cn('text-lg font-bold', abnormal && 'text-medical-critical')}>
                    {lastVal ?? '—'} <span className="text-xs font-normal">{VITAL_UNITS[key]}</span>
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
  );
}
