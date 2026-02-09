import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

interface PrescriptionLineProps {
  prescription: {
    id: string;
    medication_name: string;
    dosage: string;
    route: string;
    frequency: string | null;
    status: string;
    priority: string;
  };
  lastAdministration?: {
    administered_at: string;
    dose_given: string;
    route: string;
    notes?: string | null;
  } | null;
  onAdminister: (prescriptionId: string, doseGiven: string, lotNumber: string) => void;
}

export function PrescriptionLine({ prescription, lastAdministration, onAdminister }: PrescriptionLineProps) {
  const [dose, setDose] = useState(prescription.dosage);
  const [lot, setLot] = useState('');

  const done = !!lastAdministration || prescription.status === 'completed';
  const isSuspended = prescription.status === 'suspended';
  const isCancelled = prescription.status === 'cancelled';
  const isInactive = isSuspended || isCancelled;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
        done ? 'bg-green-50 dark:bg-green-950/20 border-green-500/20' : isInactive ? 'bg-muted/50 opacity-70' : 'bg-card',
        prescription.priority === 'stat' && !done && !isInactive && 'border-red-500/30 animate-pulse',
        prescription.priority === 'urgent' && !done && !isInactive && 'border-orange-500/30',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', isCancelled && 'line-through text-muted-foreground')}>
          {prescription.medication_name} — {prescription.dosage}
        </p>
        <p className="text-xs text-muted-foreground">
          {prescription.route} · {prescription.frequency || 'Ponctuel'}
        </p>
      </div>

      {done ? (
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge className="bg-green-600 text-white">
            <Check className="h-3 w-3 mr-1" /> Administre
          </Badge>
          {lastAdministration && (
            <span className="text-xs text-muted-foreground">
              {new Date(lastAdministration.administered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {' — '}{lastAdministration.dose_given} {lastAdministration.route}
              {lastAdministration.notes?.startsWith('lot:') && (
                <span className="ml-1 font-medium">(lot: {lastAdministration.notes.replace('lot:', '')})</span>
              )}
            </span>
          )}
        </div>
      ) : isSuspended ? (
        <Badge variant="secondary" className="bg-muted text-muted-foreground shrink-0">Suspendue</Badge>
      ) : isCancelled ? (
        <Badge variant="outline" className="text-muted-foreground line-through shrink-0">Annulee</Badge>
      ) : (
        <div className="flex flex-col gap-2 items-end shrink-0">
          <Button
            size="lg"
            onClick={() => onAdminister(prescription.id, dose, lot)}
            className="touch-target min-h-[48px] px-5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Check className="h-5 w-5 mr-1.5" /> Administre
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              value={dose}
              onChange={e => setDose(e.target.value)}
              className="w-20 h-7 text-xs text-center"
              title="Dose (titration)"
              placeholder="Dose"
            />
            <Input
              value={lot}
              onChange={e => setLot(e.target.value)}
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
