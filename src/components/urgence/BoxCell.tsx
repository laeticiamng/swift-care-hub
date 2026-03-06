import { cn } from '@/lib/utils';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { FlaskConical, GripVertical } from 'lucide-react';
import { DragEvent } from 'react';

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
  zoneKey?: string;
  encounter?: BoxCellPatient;
  resultCount?: { unread: number; critical: number };
  isHighlighted?: boolean;
  hasActiveFilter?: boolean;
  isDragOver?: boolean;
  onClick?: () => void;
  onDropEncounter?: (encounterId: string, boxNumber: number) => void;
}

export function BoxCell({ boxNumber, zoneKey, encounter, resultCount, isHighlighted, hasActiveFilter, isDragOver, onClick, onDropEncounter }: BoxCellProps) {

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!encounter) return;
    e.dataTransfer.setData('application/urgenceos-encounter', JSON.stringify({
      encounterId: encounter.id,
      fromZone: zoneKey || null,
      fromBox: boxNumber,
    }));
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLDivElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.opacity = '1';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/urgenceos-encounter'));
      if (data.encounterId && onDropEncounter) {
        onDropEncounter(data.encounterId, boxNumber);
      }
    } catch {}
  };

  if (!encounter) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-dashed p-2 flex flex-col items-center justify-center min-h-[90px] md:min-h-[90px] transition-all duration-200',
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.03] shadow-md'
            : 'border-border/50 bg-muted/30',
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className={cn('text-lg font-bold', isDragOver ? 'text-primary' : 'text-muted-foreground/40')}>{boxNumber}</span>
        <span className={cn('text-[10px]', isDragOver ? 'text-primary font-medium' : 'text-muted-foreground/30')}>
          {isDragOver ? 'Déposer ici' : 'Libre'}
        </span>
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
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onClick}
      className={cn(
        'rounded-lg border p-2 min-h-[100px] md:min-h-[90px] flex flex-col justify-between cursor-grab transition-all duration-200',
        'bg-card hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]',
        'active:cursor-grabbing',
        borderColor && `border-l-4 ${borderColor}`,
        isHighlighted && 'ring-2 ring-primary ring-offset-1',
        hasActiveFilter && !isHighlighted && 'opacity-40',
        isDragOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">{boxNumber}</span>
          <div className="flex items-center gap-0.5">
            {rc && rc.critical > 0 && (
              <FlaskConical className="h-3.5 w-3.5 text-medical-critical animate-pulse" />
            )}
            {rc && rc.unread > 0 && rc.critical === 0 && (
              <FlaskConical className="h-3 w-3 text-muted-foreground" />
            )}
            <GripVertical className="h-3 w-3 text-muted-foreground/40" />
          </div>
        </div>
        <p className="font-semibold text-sm leading-tight truncate mt-0.5">
          {p.nom.toUpperCase().slice(0, 12)}
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
