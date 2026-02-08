import { cn } from '@/lib/utils';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { FlaskConical } from 'lucide-react';

const ccmuBorderColors: Record<number, string> = {
  1: 'border-l-medical-success',
  2: 'border-l-medical-info',
  3: 'border-l-medical-warning',
  4: 'border-l-medical-critical',
  5: 'border-l-medical-critical',
};

interface BoxCellPatient {
  id: string;
  patient_id: string;
  ccmu: number | null;
  arrival_time: string;
  motif_sfmu?: string | null;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string };
  medecin_id: string | null;
}

interface BoxCellProps {
  boxNumber: number;
  encounter?: BoxCellPatient;
  resultCount?: { unread: number; critical: number };
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function BoxCell({ boxNumber, encounter, resultCount, isHighlighted, onClick }: BoxCellProps) {
  if (!encounter) {
    return (
      <div className={cn(
        'rounded-lg border-2 border-dashed border-border/50 p-2 flex flex-col items-center justify-center min-h-[90px] bg-muted/30 transition-colors',
      )}>
        <span className="text-lg font-bold text-muted-foreground/40">{boxNumber}</span>
        <span className="text-[10px] text-muted-foreground/30">Libre</span>
      </div>
    );
  }

  const p = encounter.patients;
  const age = calculateAge(p.date_naissance);
  const waitMin = getWaitTimeMinutes(encounter.arrival_time);
  const waitStr = formatWaitTime(waitMin);
  const waitCritical = waitMin > 240;
  const waitWarning = waitMin > 120;
  const borderColor = encounter.ccmu ? ccmuBorderColors[encounter.ccmu] : '';
  const rc = resultCount;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border p-2 min-h-[90px] flex flex-col justify-between cursor-pointer transition-all hover:shadow-md active:scale-[0.97]',
        'bg-card',
        borderColor && `border-l-4 ${borderColor}`,
        isHighlighted && 'ring-2 ring-primary ring-offset-1',
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">{boxNumber}</span>
          {rc && rc.critical > 0 && (
            <FlaskConical className="h-3.5 w-3.5 text-medical-critical animate-pulse" />
          )}
          {rc && rc.unread > 0 && rc.critical === 0 && (
            <FlaskConical className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <p className="font-semibold text-sm leading-tight truncate mt-0.5">
          {p.nom.toUpperCase().slice(0, 8)}
        </p>
        <p className="text-[10px] text-muted-foreground">{age}a · {p.sexe}</p>
        {encounter.motif_sfmu && (
          <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">{encounter.motif_sfmu}</p>
        )}
      </div>
      <p className={cn(
        'text-xs font-medium mt-1',
        waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground',
      )}>
        {waitStr}
      </p>
    </div>
  );
}
