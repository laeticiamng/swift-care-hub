import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wind, Settings, Power, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';

interface OxygeneBannerProps {
  rx: any;
  meta: PrescriptionMetadata;
  lastVital: any;
  onAction: (action: string, data?: any) => void;
}

export function OxygeneBanner({ rx, meta, lastVital, onAction }: OxygeneBannerProps) {
  const currentSpO2 = lastVital?.spo2 ?? lastVital?.SpO2 ?? lastVital?.spO2 ?? null;

  const { targetValue, spO2Status } = useMemo(() => {
    const target = meta.o2_target ?? '';
    // Parse target like "SpO2 > 94%" or "> 92%"
    const match = target.match(/>\s*(\d+)/);
    const targetNum = match ? parseInt(match[1]) : null;

    if (currentSpO2 === null || targetNum === null) {
      return { targetValue: targetNum, spO2Status: 'unknown' as const };
    }

    return {
      targetValue: targetNum,
      spO2Status: currentSpO2 >= targetNum ? ('ok' as const) : ('below' as const),
    };
  }, [currentSpO2, meta.o2_target]);

  const isPlaced = rx.status === 'active' || rx.status === 'completed';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2',
        spO2Status === 'below'
          ? 'bg-red-50 dark:bg-red-950/15 border-red-500/30'
          : 'bg-sky-50/60 dark:bg-sky-950/10 border-sky-500/20'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
          spO2Status === 'below'
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-sky-100 dark:bg-sky-900/30'
        )}
      >
        <Wind
          className={cn(
            'h-5 w-5',
            spO2Status === 'below'
              ? 'text-red-600 dark:text-red-400'
              : 'text-sky-600 dark:text-sky-400'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm leading-tight">O2</p>
          {meta.o2_device && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
              {meta.o2_device}
            </Badge>
          )}
          {meta.o2_debit && (
            <span className="text-xs font-medium text-muted-foreground">
              {meta.o2_debit}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
          {/* Current SpO2 */}
          {currentSpO2 !== null && (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                spO2Status === 'ok'
                  ? 'text-green-600 dark:text-green-400'
                  : spO2Status === 'below'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
              )}
            >
              SpO2 {currentSpO2}%
              {spO2Status === 'below' && (
                <AlertTriangle className="inline h-3.5 w-3.5 ml-1 -mt-0.5" />
              )}
            </span>
          )}

          {/* Target */}
          {meta.o2_target && (
            <span className="text-xs text-muted-foreground">
              Cible : {meta.o2_target}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isPlaced && (
          <Button
            size="sm"
            onClick={() => onAction('place_o2')}
            className="min-h-[44px] px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium shadow-sm active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mis en place
          </Button>
        )}
        {isPlaced && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('modify_o2_debit', { currentDebit: meta.o2_debit })}
              className="min-h-[44px] px-3 text-xs font-medium"
            >
              <Settings className="h-4 w-4 mr-1" />
              Modifier debit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('stop_o2')}
              className="min-h-[44px] px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              <Power className="h-4 w-4 mr-1" />
              Sevre
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
