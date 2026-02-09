import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pill, Clock } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';

interface MedicamentLineProps {
  rx: any;
  meta: PrescriptionMetadata;
  lastAdmin: any;
  onAdminister: (doseGiven: string, lotNumber: string) => void;
}

export function MedicamentLine({ rx, meta, lastAdmin, onAdminister }: MedicamentLineProps) {
  const [doseInput, setDoseInput] = useState(rx.dosage ?? '');
  const [lotInput, setLotInput] = useState('');

  const isAdministered = !!lastAdmin || rx.status === 'completed';
  const isSuspended = rx.status === 'suspended';
  const isCancelled = rx.status === 'cancelled';
  const isInactive = isSuspended || isCancelled;
  const isStat = rx.priority === 'stat';
  const isUrgent = rx.priority === 'urgent';

  const lastAdminTime = lastAdmin?.administered_at
    ? new Date(lastAdmin.administered_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const lastAdminLot =
    lastAdmin?.notes?.startsWith('lot:')
      ? lastAdmin.notes.replace('lot:', '')
      : null;

  const handleAdminister = () => {
    onAdminister(doseInput, lotInput);
    setLotInput('');
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1',
        isAdministered && 'bg-green-50 dark:bg-green-950/20 border-green-500/20',
        isInactive && 'bg-muted/50 opacity-70',
        !isAdministered && !isInactive && 'bg-card',
        isStat && !isAdministered && !isInactive && 'border-red-500/30',
        isUrgent && !isAdministered && !isInactive && 'border-orange-500/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          isAdministered
            ? 'bg-green-100 dark:bg-green-900/30'
            : isInactive
              ? 'bg-muted'
              : isStat
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
        )}
      >
        {isAdministered ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Pill
            className={cn(
              'h-4 w-4',
              isInactive
                ? 'text-muted-foreground'
                : isStat
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              'font-medium text-sm leading-tight',
              isCancelled && 'line-through text-muted-foreground'
            )}
          >
            {rx.medication_name} — {rx.dosage}
          </p>
          {isStat && !isAdministered && !isInactive && (
            <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 text-[10px] px-1.5 py-0">
              STAT
            </Badge>
          )}
          {isUrgent && !isAdministered && !isInactive && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800 text-[10px] px-1.5 py-0">
              Urgent
            </Badge>
          )}
          {isSuspended && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Suspendue
            </Badge>
          )}
          {isCancelled && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 line-through text-muted-foreground">
              Annulee
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-0.5">
          {rx.route}{rx.frequency ? ` · ${rx.frequency}` : ' · Ponctuel'}
        </p>

        {/* Administration info */}
        {isAdministered && lastAdminTime && (
          <p className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 mt-1">
            <Clock className="h-3 w-3" />
            {lastAdminTime}
            {lastAdmin?.dose_given && ` — ${lastAdmin.dose_given}`}
            {lastAdmin?.route && ` ${lastAdmin.route}`}
            {lastAdminLot && (
              <span className="font-medium ml-1">(lot: {lastAdminLot})</span>
            )}
          </p>
        )}
      </div>

      {/* Action */}
      {isAdministered ? (
        <Badge className="bg-green-600 text-white shrink-0">
          <Check className="h-3 w-3 mr-1" />
          Administre
        </Badge>
      ) : isInactive ? null : (
        <div className="flex flex-col gap-2 items-end shrink-0">
          <Button
            size="lg"
            onClick={handleAdminister}
            className={cn(
              'min-h-[48px] px-5 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95',
              'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            <Check className="h-5 w-5 mr-1.5" />
            Administre
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              value={doseInput}
              onChange={(e) => setDoseInput(e.target.value)}
              className="w-20 h-7 text-xs text-center"
              placeholder="Dose"
              title="Dose administree"
            />
            <Input
              value={lotInput}
              onChange={(e) => setLotInput(e.target.value)}
              className="w-20 h-7 text-xs text-center"
              placeholder="N° lot"
              title="Numero de lot"
            />
          </div>
        </div>
      )}
    </div>
  );
}
