import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, MapPin, Hourglass } from 'lucide-react';
import { getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';

interface WaitingEncounter {
  id: string;
  patient_id: string;
  status: string;
  zone: string | null;
  box_number: number | null;
  arrival_time: string;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string };
}

interface WaitingBannerProps {
  preIOA: WaitingEncounter[];
  noZone: WaitingEncounter[];
  noBox: WaitingEncounter[];
  role: string | null;
  onTriage: (patientId: string) => void;
  onClickPatient: (encounter: WaitingEncounter) => void;
}

function WaitingChip({ encounter, color, onClick }: { encounter: WaitingEncounter; color: string; onClick: () => void }) {
  const waitMin = getWaitTimeMinutes(encounter.arrival_time);
  const waitStr = formatWaitTime(waitMin);
  const urgent = waitMin > 30;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm active:scale-95',
        color,
      )}
    >
      <span className="font-semibold truncate max-w-[80px]">{encounter.patients.nom.toUpperCase()}</span>
      <span className={cn('text-[10px]', urgent && 'text-medical-critical font-bold')}>{waitStr}</span>
    </button>
  );
}

export function WaitingBanner({ preIOA, noZone, noBox, role, onTriage, onClickPatient }: WaitingBannerProps) {
  const total = preIOA.length + noZone.length + noBox.length;
  if (total === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Hourglass className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">En attente</span>
        <Badge variant="outline" className="text-xs">{total}</Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        {preIOA.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
              <ClipboardList className="h-3 w-3" /> Pré-IOA
            </span>
            {preIOA.map(enc => (
              <div key={enc.id} className="flex items-center gap-1">
                <WaitingChip encounter={enc} color="bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400" onClick={() => onClickPatient(enc)} />
                {(role === 'ioa' || role === 'medecin') && (
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-orange-600" onClick={() => onTriage(enc.patient_id)}>
                    Trier
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {noZone.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-600 uppercase tracking-wide">
              <MapPin className="h-3 w-3" /> À orienter
            </span>
            {noZone.map(enc => (
              <WaitingChip key={enc.id} encounter={enc} color="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400" onClick={() => onClickPatient(enc)} />
            ))}
          </div>
        )}

        {noBox.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
              <MapPin className="h-3 w-3" /> À installer
            </span>
            {noBox.map(enc => (
              <WaitingChip key={enc.id} encounter={enc} color="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400" onClick={() => onClickPatient(enc)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
