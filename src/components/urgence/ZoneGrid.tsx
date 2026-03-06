import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BoxCell } from './BoxCell';
import { ZoneConfig } from '@/lib/box-config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState, DragEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Encounter {
  id: string;
  patient_id: string;
  box_number: number | null;
  ccmu: number | null;
  arrival_time: string;
  motif_sfmu?: string | null;
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
  hasActiveFilter?: boolean;
  onClickEncounter: (encounter: Encounter) => void;
  onDropToZone?: (encounterId: string, zone: string, boxNumber?: number) => void;
}

export function ZoneGrid({ zone, encounters, resultCounts, highlightedIds, hasActiveFilter, onClickEncounter, onDropToZone }: ZoneGridProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverBox, setDragOverBox] = useState<number | null>(null);
  const occupiedCount = encounters.filter(e => e.box_number).length;

  const encounterByBox = new Map<number, Encounter>();
  encounters.forEach(e => {
    if (e.box_number) encounterByBox.set(e.box_number, e);
  });

  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  const handleZoneDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleZoneDragLeave = (e: DragEvent) => {
    // Only if leaving the zone container itself
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragOverBox(null);
    }
  };

  const handleZoneDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverBox(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/urgenceos-encounter'));
      if (data.encounterId && onDropToZone) {
        onDropToZone(data.encounterId, zone.key);
      }
    } catch {}
  };

  const handleDropToBox = (encounterId: string, boxNumber: number) => {
    setDragOverBox(null);
    setIsDragOver(false);
    if (onDropToZone) {
      onDropToZone(encounterId, zone.key, boxNumber);
    }
  };

  const content = (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 mt-3"
      onDragOver={(e) => {
        e.preventDefault();
        // Detect which box we're over based on target
      }}
    >
      {Array.from({ length: zone.boxCount }, (_, i) => i + 1).map(num => {
        const enc = encounterByBox.get(num);
        return (
          <div
            key={num}
            onDragEnter={() => setDragOverBox(num)}
            onDragLeave={(e) => {
              if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                setDragOverBox(null);
              }
            }}
          >
            <BoxCell
              boxNumber={num}
              zoneKey={zone.key}
              encounter={enc}
              resultCount={enc ? getResultCount(enc.id) : undefined}
              isHighlighted={enc ? highlightedIds?.has(enc.id) : false}
              hasActiveFilter={hasActiveFilter}
              isDragOver={dragOverBox === num && !enc}
              onClick={enc ? () => onClickEncounter(enc) : undefined}
              onDropEncounter={(eid) => handleDropToBox(eid, num)}
            />
          </div>
        );
      })}
    </div>
  );

  const header = (
    <div
      className={cn(
        'rounded-xl p-3 transition-all duration-200',
        zone.bgColor,
        isDragOver && 'ring-2 ring-primary shadow-lg scale-[1.01]',
      )}
      onDragOver={handleZoneDragOver}
      onDragLeave={handleZoneDragLeave}
      onDrop={handleZoneDrop}
    >
      <div className="flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full', zone.color)} />
        <h2 className="text-base font-semibold">{zone.label}</h2>
        {isDragOver && (
          <span className="text-xs text-primary font-medium animate-pulse">
            Déposer pour déplacer vers {zone.label}
          </span>
        )}
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
            <div
              className={cn(
                'rounded-xl p-3 flex items-center transition-all duration-200',
                zone.bgColor,
                isDragOver && 'ring-2 ring-primary shadow-lg',
              )}
              onDragOver={handleZoneDragOver}
              onDragLeave={handleZoneDragLeave}
              onDrop={handleZoneDrop}
            >
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
