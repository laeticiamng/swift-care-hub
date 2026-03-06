import { cn } from '@/lib/utils';
import { FLOOR_PLAN, ZONE_GRID_TEMPLATES, FloorBox } from '@/lib/floor-plan-config';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';
import { Badge } from '@/components/ui/badge';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { FlaskConical, GripVertical, Users } from 'lucide-react';
import { useState, DragEvent } from 'react';

interface Encounter {
  id: string;
  patient_id: string;
  status: string;
  zone: ZoneKey | null;
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

interface FloorPlanViewProps {
  encounters: Encounter[];
  resultCounts: ResultCount[];
  waitingPatients: Encounter[];
  highlightedIds?: Set<string>;
  hasActiveFilter?: boolean;
  onClickEncounter: (encounter: Encounter) => void;
  onDropToZone?: (encounterId: string, zone: string, boxNumber?: number) => void;
}

const ccmuBorderColors: Record<number, string> = {
  1: 'border-l-medical-success',
  2: 'border-l-medical-info',
  3: 'border-l-medical-warning',
  4: 'border-l-medical-critical',
  5: 'border-l-medical-critical',
};

const zoneLabelColors: Record<ZoneKey, string> = {
  sau: 'bg-medical-info/15 text-medical-info',
  uhcd: 'bg-medical-warning/15 text-medical-warning',
  dechocage: 'bg-medical-critical/15 text-medical-critical',
};

function FloorBoxCell({
  box,
  encounter,
  resultCount,
  isHighlighted,
  hasActiveFilter,
  onClick,
}: {
  box: FloorBox;
  encounter?: Encounter;
  resultCount?: ResultCount;
  isHighlighted?: boolean;
  hasActiveFilter?: boolean;
  onClick?: () => void;
}) {
  if (!encounter) {
    return (
      <div
        className="rounded-md border-2 border-dashed border-border/40 flex flex-col items-center justify-center p-1.5 bg-muted/20 transition-colors min-h-[70px]"
        style={{ gridColumn: box.col, gridRow: box.row }}
      >
        <span className="text-xs font-semibold text-muted-foreground/30">{box.label}</span>
        <span className="text-[9px] text-muted-foreground/20">Libre</span>
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
        'rounded-md border p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-200 min-h-[70px]',
        'bg-card hover:shadow-md hover:scale-[1.02] active:scale-[0.97]',
        borderColor && `border-l-[3px] ${borderColor}`,
        isHighlighted && 'ring-2 ring-primary ring-offset-1',
        hasActiveFilter && !isHighlighted && 'opacity-40',
      )}
      style={{ gridColumn: box.col, gridRow: box.row }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground font-medium">{box.label}</span>
          {rc && rc.critical > 0 && (
            <FlaskConical className="h-3 w-3 text-medical-critical animate-pulse" />
          )}
        </div>
        <p className="font-semibold text-xs leading-tight truncate mt-0.5">
          {p.nom.toUpperCase().slice(0, 8)}
        </p>
        <p className="text-[9px] text-muted-foreground">{age}a · {p.sexe}</p>
      </div>
      <p className={cn(
        'text-[10px] font-medium',
        waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground',
      )}>
        {waitStr}
      </p>
    </div>
  );
}

function WaitingArea({ patients, onClick }: { patients: Encounter[]; onClick: (e: Encounter) => void }) {
  if (patients.length === 0) return null;
  return (
    <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">Salle d'attente / Couloir</span>
        <Badge variant="outline" className="text-xs">{patients.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {patients.map(enc => {
          const waitMin = getWaitTimeMinutes(enc.arrival_time);
          const waitCritical = waitMin > 240;
          const waitWarning = waitMin > 120;
          return (
            <button
              key={enc.id}
              onClick={() => onClick(enc)}
              className={cn(
                'rounded-md border bg-card px-2 py-1 text-left cursor-pointer hover:shadow-sm transition-all',
                'hover:scale-[1.02] active:scale-[0.97]',
                enc.ccmu && enc.ccmu >= 4 && 'border-l-[3px] border-l-medical-critical',
                enc.ccmu === 3 && 'border-l-[3px] border-l-medical-warning',
              )}
            >
              <p className="text-xs font-semibold truncate max-w-[80px]">{enc.patients.nom.toUpperCase().slice(0, 8)}</p>
              <p className={cn(
                'text-[9px] font-medium',
                waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground',
              )}>
                {formatWaitTime(waitMin)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FloorPlanView({
  encounters,
  resultCounts,
  waitingPatients,
  highlightedIds,
  hasActiveFilter,
  onClickEncounter,
}: FloorPlanViewProps) {
  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  const encountersByZoneBox = new Map<string, Encounter>();
  encounters.forEach(e => {
    if (e.zone && e.box_number) {
      encountersByZoneBox.set(`${e.zone}-${e.box_number}`, e);
    }
  });

  return (
    <div className="space-y-4">
      <WaitingArea patients={waitingPatients} onClick={onClickEncounter} />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        {/* SAU — main zone, left side */}
        <ZoneSection
          zoneKey="sau"
          encountersByZoneBox={encountersByZoneBox}
          resultCounts={resultCounts}
          highlightedIds={highlightedIds}
          hasActiveFilter={hasActiveFilter}
          onClickEncounter={onClickEncounter}
          getResultCount={getResultCount}
        />

        {/* Right column: UHCD + Déchocage stacked */}
        <div className="space-y-4">
          <ZoneSection
            zoneKey="uhcd"
            encountersByZoneBox={encountersByZoneBox}
            resultCounts={resultCounts}
            highlightedIds={highlightedIds}
            hasActiveFilter={hasActiveFilter}
            onClickEncounter={onClickEncounter}
            getResultCount={getResultCount}
          />
          <ZoneSection
            zoneKey="dechocage"
            encountersByZoneBox={encountersByZoneBox}
            resultCounts={resultCounts}
            highlightedIds={highlightedIds}
            hasActiveFilter={hasActiveFilter}
            onClickEncounter={onClickEncounter}
            getResultCount={getResultCount}
          />
        </div>
      </div>
    </div>
  );
}

function ZoneSection({
  zoneKey,
  encountersByZoneBox,
  resultCounts,
  highlightedIds,
  hasActiveFilter,
  onClickEncounter,
  getResultCount,
}: {
  zoneKey: ZoneKey;
  encountersByZoneBox: Map<string, Encounter>;
  resultCounts: ResultCount[];
  highlightedIds?: Set<string>;
  hasActiveFilter?: boolean;
  onClickEncounter: (e: Encounter) => void;
  getResultCount: (id: string) => ResultCount | undefined;
}) {
  const zoneConfig = ZONE_CONFIGS.find(z => z.key === zoneKey)!;
  const boxes = FLOOR_PLAN[zoneKey];
  const gridTemplate = ZONE_GRID_TEMPLATES[zoneKey];
  const occupiedCount = boxes.filter(b => encountersByZoneBox.has(`${zoneKey}-${b.boxNumber}`)).length;

  return (
    <div className="rounded-xl border bg-card/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('px-2.5 py-1 rounded-md text-xs font-bold', zoneLabelColors[zoneKey])}>
          {zoneConfig.label}
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {occupiedCount}/{zoneConfig.boxCount}
        </Badge>
      </div>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: gridTemplate.columns,
          gridTemplateRows: gridTemplate.rows,
        }}
      >
        {boxes.map(box => {
          const enc = encountersByZoneBox.get(`${zoneKey}-${box.boxNumber}`);
          return (
            <FloorBoxCell
              key={`${zoneKey}-${box.boxNumber}`}
              box={box}
              encounter={enc}
              resultCount={enc ? getResultCount(enc.id) : undefined}
              isHighlighted={enc ? highlightedIds?.has(enc.id) : false}
              hasActiveFilter={hasActiveFilter}
              onClick={enc ? () => onClickEncounter(enc) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
