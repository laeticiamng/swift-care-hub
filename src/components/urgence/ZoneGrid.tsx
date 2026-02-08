import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BoxCell } from './BoxCell';
import { ZoneConfig } from '@/lib/box-config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Encounter {
  id: string;
  patient_id: string;
  box_number: number | null;
  ccmu: number | null;
  arrival_time: string;
  medecin_id: string | null;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string };
}

interface ResultCount {
  encounter_id: string;
  unread: number;
  critical: number;
}

interface ZoneGridProps {
  zone: ZoneConfig;
  encounters: Encounter[];
  resultCounts: ResultCount[];
  highlightedIds?: Set<string>;
  onClickEncounter: (encounter: Encounter) => void;
}

export function ZoneGrid({ zone, encounters, resultCounts, highlightedIds, onClickEncounter }: ZoneGridProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const occupiedCount = encounters.filter(e => e.box_number).length;

  const encounterByBox = new Map<number, Encounter>();
  encounters.forEach(e => {
    if (e.box_number) encounterByBox.set(e.box_number, e);
  });

  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  const content = (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 mt-3">
      {Array.from({ length: zone.boxCount }, (_, i) => i + 1).map(num => {
        const enc = encounterByBox.get(num);
        return (
          <BoxCell
            key={num}
            boxNumber={num}
            encounter={enc}
            resultCount={enc ? getResultCount(enc.id) : undefined}
            isHighlighted={enc ? highlightedIds?.has(enc.id) : false}
            onClick={enc ? () => onClickEncounter(enc) : undefined}
          />
        );
      })}
    </div>
  );

  const header = (
    <div className={cn('rounded-xl p-3', zone.bgColor)}>
      <div className="flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full', zone.color)} />
        <h2 className="text-base font-semibold">{zone.label}</h2>
        <Badge variant="outline" className="font-semibold ml-auto">
          {occupiedCount}/{zone.boxCount}
        </Badge>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <div className={cn('rounded-xl p-3 flex items-center', zone.bgColor)}>
              <div className="flex items-center gap-2 flex-1">
                <div className={cn('h-3 w-3 rounded-full', zone.color)} />
                <h2 className="text-base font-semibold">{zone.label}</h2>
                <Badge variant="outline" className="font-semibold ml-auto mr-2">
                  {occupiedCount}/{zone.boxCount}
                </Badge>
              </div>
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      {header}
      {content}
    </div>
  );
}
