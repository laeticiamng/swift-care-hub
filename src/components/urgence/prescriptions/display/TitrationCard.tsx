import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, Plus, Target, Clock, Activity } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';
import type { Tables } from '@/integrations/supabase/types';

interface TitrationCardProps {
  rx: Tables<'prescriptions'>;
  meta: PrescriptionMetadata;
  administrations: Tables<'administrations'>[];
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export function TitrationCard({ rx, meta, administrations, onAction }: TitrationCardProps) {
  const [evaInput, setEvaInput] = useState('');

  const doseMax = meta.titration_dose_max ?? 0;
  const doseStep = meta.titration_step ?? 0;
  const cumulated = meta.titration_cumulated ?? 0;
  const progressPct = doseMax > 0 ? Math.min((cumulated / doseMax) * 100, 100) : 0;
  const isMaxReached = doseMax > 0 && cumulated >= doseMax;
  const nextDose = Math.min(doseStep, doseMax - cumulated);

  const lastAdmin = useMemo(() => {
    if (!administrations || administrations.length === 0) return null;
    return administrations[administrations.length - 1];
  }, [administrations]);

  const lastAdminTime = lastAdmin?.administered_at
    ? new Date(lastAdmin.administered_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const lastEva = lastAdmin?.notes?.match(/EVA[:\s]*(\d+)/i)?.[1] ?? null;

  const canAdminister = useMemo(() => {
    if (isMaxReached) return false;
    if (!meta.titration_interval || !lastAdmin?.administered_at) return true;
    const intervalMatch = meta.titration_interval.match(/(\d+)\s*(min|h)/i);
    if (!intervalMatch) return true;
    const intervalMs =
      parseInt(intervalMatch[1]) * (intervalMatch[2].toLowerCase() === 'h' ? 3_600_000 : 60_000);
    const elapsed = Date.now() - new Date(lastAdmin.administered_at).getTime();
    return elapsed >= intervalMs;
  }, [isMaxReached, meta.titration_interval, lastAdmin]);

  const handleAdminister = () => {
    onAction('administer_titration', {
      dose: nextDose,
      eva: evaInput || undefined,
      cumulated: cumulated + nextDose,
    });
    setEvaInput('');
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2',
        isMaxReached
          ? 'border-orange-500/30 bg-orange-50/40 dark:bg-orange-950/10'
          : 'border-violet-500/20 bg-gradient-to-br from-violet-50/40 to-white dark:from-violet-950/10 dark:to-card'
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                isMaxReached
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-violet-100 dark:bg-violet-900/30'
              )}
            >
              <ArrowUpCircle
                className={cn(
                  'h-5 w-5',
                  isMaxReached
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-violet-600 dark:text-violet-400'
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {rx.medication_name}
              </p>
              {meta.titration_target && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Target className="h-3 w-3" />
                  Objectif : {meta.titration_target}
                </p>
              )}
            </div>
          </div>
          {isMaxReached && (
            <Badge className="shrink-0 bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800">
              Dose max atteinte
            </Badge>
          )}
        </div>

        {/* Dose progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Cumul : {cumulated} / {doseMax} mg
            </span>
            <span className="text-xs font-semibold tabular-nums">{Math.round(progressPct)}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                isMaxReached
                  ? 'bg-gradient-to-r from-orange-400 to-red-400'
                  : progressPct > 60
                    ? 'bg-gradient-to-r from-violet-400 via-violet-500 to-orange-400'
                    : 'bg-gradient-to-r from-violet-400 to-violet-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Last admin info */}
        {lastAdmin && (
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            {lastAdminTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Derniere : {lastAdminTime}
              </span>
            )}
            {lastEva && (
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                EVA {lastEva}/10
              </span>
            )}
            {lastAdmin.dose_given && (
              <span className="font-medium">{lastAdmin.dose_given}</span>
            )}
          </div>
        )}

        {/* Interval info */}
        {meta.titration_interval && (
          <p className="text-xs text-muted-foreground mb-3">
            Intervalle : toutes les {meta.titration_interval}
          </p>
        )}

        {/* Action: next dose + EVA */}
        {!isMaxReached && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={10}
              value={evaInput}
              onChange={(e) => setEvaInput(e.target.value)}
              placeholder="EVA"
              className="w-20 h-11 text-center text-sm tabular-nums"
            />
            <Button
              size="lg"
              disabled={!canAdminister}
              onClick={handleAdminister}
              className={cn(
                'flex-1 min-h-[44px] font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95',
                canAdminister
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              +{nextDose > 0 ? nextDose : doseStep}mg
            </Button>
          </div>
        )}

        {!canAdminister && !isMaxReached && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
            Intervalle non ecoule — patientez avant la prochaine dose
          </p>
        )}
      </CardContent>
    </Card>
  );
}
