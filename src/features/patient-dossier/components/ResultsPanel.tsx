import { cn } from '@/lib/utils';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Image, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BIO_NORMAL_RANGES: Record<string, { unit: string; min?: number; max?: number }> = {
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

interface ResultsPanelProps {
  results: any[];
  showResultsFirst: boolean;
  fetchAll: () => void;
}

export function ResultsPanel({ results, showResultsFirst, fetchAll }: ResultsPanelProps) {
  const handleMarkRead = async (resultId: string) => {
    await supabase.from('results').update({ is_read: true }).eq('id', resultId);
    fetchAll();
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
              const range = BIO_NORMAL_RANGES[k];
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
    <Card className="animate-in fade-in duration-300" style={{ animationDelay: showResultsFirst ? '100ms' : '200ms', animationFillMode: 'both' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Resultats
          {results.filter(r => !r.is_read).length > 0 && (
            <Badge className="bg-medical-critical text-medical-critical-foreground">{results.filter(r => !r.is_read).length} nouveau(x)</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.length === 0 && <p className="text-sm text-muted-foreground">Aucun resultat</p>}
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
            {renderResultContent(r.content, r.category)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
