import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Gauge, Clock, Settings, CheckCircle2 } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';

interface PerfusionCardProps {
  rx: any;
  meta: PrescriptionMetadata;
  onAction: (action: string, data?: any) => void;
}

export function PerfusionCard({ rx, meta, onAction }: PerfusionCardProps) {
  const volumeTotal = meta.volume_total ?? 0;
  const volumePassed = meta.volume_passed ?? 0;
  const progressPct = volumeTotal > 0 ? Math.min((volumePassed / volumeTotal) * 100, 100) : 0;

  const elapsedLabel = useMemo(() => {
    if (!meta.started_at) return null;
    const started = new Date(meta.started_at);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - started.getTime()) / 60_000);
    if (diffMin < 60) return `${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
  }, [meta.started_at]);

  const startedTimeStr = meta.started_at
    ? new Date(meta.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const isComplete = progressPct >= 100;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2',
        isComplete
          ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/10'
          : 'border-blue-500/20 bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-950/10 dark:to-card'
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                isComplete
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              )}
            >
              <Droplets
                className={cn(
                  'h-5 w-5',
                  isComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {rx.medication_name}
              </p>
              {meta.dilution && (
                <p className="text-xs text-muted-foreground truncate">{meta.dilution}</p>
              )}
            </div>
          </div>
          {meta.duration && (
            <Badge variant="outline" className="shrink-0 text-xs font-medium">
              {meta.duration}
            </Badge>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          {rx.dosage && (
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {rx.dosage}
            </span>
          )}
          {meta.debit && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {meta.debit}
            </span>
          )}
          {startedTimeStr && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {startedTimeStr}
              {elapsedLabel && (
                <span className="text-muted-foreground/70">({elapsedLabel})</span>
              )}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {volumeTotal > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {volumePassed} / {volumeTotal} mL
              </span>
              <span className="text-xs font-semibold tabular-nums">
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  isComplete
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : progressPct > 75
                      ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400'
                      : 'bg-gradient-to-r from-blue-400 to-blue-500'
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] flex-1 text-xs font-medium"
            onClick={() => onAction('modify_debit', { currentDebit: meta.debit })}
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Modifier debit
          </Button>
          <Button
            variant={isComplete ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-h-[44px] flex-1 text-xs font-medium',
              isComplete
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30'
            )}
            onClick={() => onAction('terminate')}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Termine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
