import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Zap, Clock, AlertCircle } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';
import type { Tables } from '@/integrations/supabase/types';

interface ConditionnelLineProps {
  rx: Tables<'prescriptions'>;
  meta: PrescriptionMetadata;
  administrations: Tables<'administrations'>[];
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export function ConditionnelLine({ rx, meta, administrations, onAction }: ConditionnelLineProps) {
  const maxDoses = meta.condition_max_doses ?? Infinity;
  const dosesGiven = administrations?.length ?? meta.condition_doses_given ?? 0;
  const dosesRemaining = Math.max(0, maxDoses - dosesGiven);
  const isMaxReached = maxDoses !== Infinity && dosesGiven >= maxDoses;

  const { intervalElapsed, nextAvailableTime } = useMemo(() => {
    if (!meta.condition_interval || !administrations?.length) {
      return { intervalElapsed: true, nextAvailableTime: null };
    }

    const intervalMatch = meta.condition_interval.match(/(\d+)\s*(min|h)/i);
    if (!intervalMatch) return { intervalElapsed: true, nextAvailableTime: null };

    const intervalMs =
      parseInt(intervalMatch[1]) * (intervalMatch[2].toLowerCase() === 'h' ? 3_600_000 : 60_000);

    const lastAdminTime = administrations
      .map((a: Tables<'administrations'>) => new Date(a.administered_at).getTime())
      .sort((a: number, b: number) => b - a)[0];

    if (!lastAdminTime) return { intervalElapsed: true, nextAvailableTime: null };

    const nextTime = lastAdminTime + intervalMs;
    const now = Date.now();

    if (now >= nextTime) {
      return { intervalElapsed: true, nextAvailableTime: null };
    }

    return {
      intervalElapsed: false,
      nextAvailableTime: new Date(nextTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, [meta.condition_interval, administrations]);

  const isDisabled = isMaxReached || !intervalElapsed;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1',
        isDisabled
          ? 'bg-muted/40 border-muted opacity-60'
          : 'bg-card border-amber-500/20 hover:border-amber-500/40'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          isDisabled
            ? 'bg-muted'
            : 'bg-amber-100 dark:bg-amber-900/30'
        )}
      >
        <Zap
          className={cn(
            'h-4 w-4',
            isDisabled
              ? 'text-muted-foreground'
              : 'text-amber-600 dark:text-amber-400'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              'font-medium text-sm leading-tight',
              isDisabled && 'text-muted-foreground'
            )}
          >
            {rx.medication_name} — {rx.dosage}
          </p>
          {rx.route && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {rx.route}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Condition trigger */}
          {meta.condition_trigger && (
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {meta.condition_trigger}
            </span>
          )}

          {/* Doses counter */}
          {maxDoses !== Infinity && (
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] px-1.5 py-0',
                isMaxReached
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : dosesRemaining <= 1
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-secondary text-secondary-foreground'
              )}
            >
              {dosesGiven}/{maxDoses} doses
            </Badge>
          )}

          {/* Interval */}
          {meta.condition_interval && (
            <span className="text-xs text-muted-foreground">
              toutes les {meta.condition_interval}
            </span>
          )}
        </div>

        {/* Next available time */}
        {!intervalElapsed && nextAvailableTime && (
          <p className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
            <Clock className="h-3 w-3" />
            Disponible a {nextAvailableTime}
          </p>
        )}

        {/* Max reached message */}
        {isMaxReached && (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
            <AlertCircle className="h-3 w-3" />
            Dose maximale atteinte
          </p>
        )}
      </div>

      {/* Action button */}
      <Button
        size="sm"
        disabled={isDisabled}
        onClick={() => onAction('administer_conditionnel', { rx_id: rx.id })}
        className={cn(
          'min-h-[44px] min-w-[44px] px-4 shrink-0 font-semibold text-sm transition-all active:scale-95',
          isDisabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
        )}
      >
        <Check className="h-4 w-4 mr-1" />
        Donner
      </Button>
    </div>
  );
}
