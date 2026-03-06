import { cn } from '@/lib/utils';
import { FLOOR_PLAN, ZONE_GRID_TEMPLATES, FloorBox } from '@/lib/floor-plan-config';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';
import { Badge } from '@/components/ui/badge';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { FlaskConical, GripVertical, Users, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, DragEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePinchZoom } from '@/hooks/usePinchZoom';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

// ── Types ──

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

// ── Constants ──

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

// ── FloorBoxCell (with drag & drop) ──

function FloorBoxCell({
  box,
  zoneKey,
  encounter,
  resultCount,
  isHighlighted,
  hasActiveFilter,
  isDragOver,
  compact,
  onClick,
  onDropEncounter,
}: {
  box: FloorBox;
  zoneKey: ZoneKey;
  encounter?: Encounter;
  resultCount?: ResultCount;
  isHighlighted?: boolean;
  hasActiveFilter?: boolean;
  isDragOver?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onDropEncounter?: (encounterId: string, boxNumber: number) => void;
}) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!encounter) return;
    e.dataTransfer.setData('application/urgenceos-encounter', JSON.stringify({
      encounterId: encounter.id,
      fromZone: zoneKey,
      fromBox: box.boxNumber,
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
        onDropEncounter(data.encounterId, box.boxNumber);
      }
    } catch {}
  };

  const minH = compact ? 'min-h-[48px]' : 'min-h-[70px]';

  if (!encounter) {
    return (
      <div
        className={cn(
          'rounded-md border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all duration-200',
          minH,
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.03] shadow-md'
            : 'border-border/40 bg-muted/20',
        )}
        style={{ gridColumn: box.col, gridRow: box.row }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className={cn(
          compact ? 'text-[9px]' : 'text-xs',
          'font-semibold',
          isDragOver ? 'text-primary' : 'text-muted-foreground/30',
        )}>{box.label}</span>
        {!compact && (
          <span className={cn('text-[9px]', isDragOver ? 'text-primary font-medium' : 'text-muted-foreground/20')}>
            {isDragOver ? 'Déposer ici' : 'Libre'}
          </span>
        )}
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
        'rounded-md border flex flex-col justify-between cursor-grab transition-all duration-200',
        minH,
        compact ? 'p-1' : 'p-1.5',
        'bg-card hover:shadow-md active:scale-[0.95]',
        'active:cursor-grabbing',
        borderColor && `border-l-[3px] ${borderColor}`,
        isHighlighted && 'ring-2 ring-primary ring-offset-1',
        hasActiveFilter && !isHighlighted && 'opacity-40',
        isDragOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
      style={{ gridColumn: box.col, gridRow: box.row }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className={cn(compact ? 'text-[8px]' : 'text-[9px]', 'text-muted-foreground font-medium')}>{box.label}</span>
          <div className="flex items-center gap-0.5">
            {rc && rc.critical > 0 && (
              <FlaskConical className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3', 'text-medical-critical animate-pulse')} />
            )}
            {!compact && <GripVertical className="h-3 w-3 text-muted-foreground/40" />}
          </div>
        </div>
        <p className={cn('font-semibold leading-tight truncate mt-0.5', compact ? 'text-[10px]' : 'text-xs')}>
          {p.nom.toUpperCase().slice(0, compact ? 6 : 8)}
        </p>
        {!compact && <p className="text-[9px] text-muted-foreground">{age}a · {p.sexe}</p>}
      </div>
      <p className={cn(
        'font-medium',
        compact ? 'text-[9px]' : 'text-[10px]',
        waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground',
      )}>
        {waitStr}
      </p>
    </div>
  );
}

// ── WaitingArea ──

function WaitingArea({ patients, onClick }: { patients: Encounter[]; onClick: (e: Encounter) => void }) {
  if (patients.length === 0) return null;
  return (
    <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/10 p-2 sm:p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Salle d'attente</span>
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
                'active:scale-[0.95]',
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

// ── Main FloorPlanView ──

export function FloorPlanView({
  encounters,
  resultCounts,
  waitingPatients,
  highlightedIds,
  hasActiveFilter,
  onClickEncounter,
  onDropToZone,
}: FloorPlanViewProps) {
  const isMobile = useIsMobile();
  const { containerRef, scale, translateX, translateY, reset } = usePinchZoom(0.5, 3);
  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  const encountersByZoneBox = new Map<string, Encounter>();
  encounters.forEach(e => {
    if (e.zone && e.box_number) {
      encountersByZoneBox.set(`${e.zone}-${e.box_number}`, e);
    }
  });

  const zoomIn = () => {
    // Manual zoom button for mobile
    const el = containerRef.current;
    if (!el) return;
    reset(); // reset is simpler; for zoom buttons we just toggle
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        <WaitingArea patients={waitingPatients} onClick={onClickEncounter} />

        {/* Zoom controls */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-muted-foreground">Pincer pour zoomer · Glisser pour naviguer</p>
          <div className="flex items-center gap-1">
            {scale !== 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Badge variant="outline" className="text-[10px] font-mono">
              {Math.round(scale * 100)}%
            </Badge>
          </div>
        </div>

        {/* Pinch-zoomable container */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-xl border bg-muted/5 touch-none"
          style={{ minHeight: '300px' }}
        >
          <div
            className="origin-top-left transition-transform duration-75 will-change-transform"
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            }}
          >
            {/* Stacked zones for mobile */}
            <div className="space-y-3 p-2" style={{ minWidth: '340px' }}>
              {(['sau', 'uhcd', 'dechocage'] as ZoneKey[]).map(zk => (
                <MobileZoneSection
                  key={zk}
                  zoneKey={zk}
                  encountersByZoneBox={encountersByZoneBox}
                  resultCounts={resultCounts}
                  highlightedIds={highlightedIds}
                  hasActiveFilter={hasActiveFilter}
                  onClickEncounter={onClickEncounter}
                  getResultCount={getResultCount}
                  onDropToZone={onDropToZone}
                  compact={scale < 0.8}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div className="space-y-4">
      <WaitingArea patients={waitingPatients} onClick={onClickEncounter} />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        <ZoneSection
          zoneKey="sau"
          encountersByZoneBox={encountersByZoneBox}
          resultCounts={resultCounts}
          highlightedIds={highlightedIds}
          hasActiveFilter={hasActiveFilter}
          onClickEncounter={onClickEncounter}
          getResultCount={getResultCount}
          onDropToZone={onDropToZone}
        />
        <div className="space-y-4">
          <ZoneSection
            zoneKey="uhcd"
            encountersByZoneBox={encountersByZoneBox}
            resultCounts={resultCounts}
            highlightedIds={highlightedIds}
            hasActiveFilter={hasActiveFilter}
            onClickEncounter={onClickEncounter}
            getResultCount={getResultCount}
            onDropToZone={onDropToZone}
          />
          <ZoneSection
            zoneKey="dechocage"
            encountersByZoneBox={encountersByZoneBox}
            resultCounts={resultCounts}
            highlightedIds={highlightedIds}
            hasActiveFilter={hasActiveFilter}
            onClickEncounter={onClickEncounter}
            getResultCount={getResultCount}
            onDropToZone={onDropToZone}
          />
        </div>
      </div>
    </div>
  );
}

// ── Mobile Zone Section (collapsible, compact grid) ──

function MobileZoneSection({
  zoneKey,
  encountersByZoneBox,
  resultCounts,
  highlightedIds,
  hasActiveFilter,
  onClickEncounter,
  getResultCount,
  onDropToZone,
  compact,
}: {
  zoneKey: ZoneKey;
  encountersByZoneBox: Map<string, Encounter>;
  resultCounts: ResultCount[];
  highlightedIds?: Set<string>;
  hasActiveFilter?: boolean;
  onClickEncounter: (e: Encounter) => void;
  getResultCount: (id: string) => ResultCount | undefined;
  onDropToZone?: (encounterId: string, zone: string, boxNumber?: number) => void;
  compact?: boolean;
}) {
  const zoneConfig = ZONE_CONFIGS.find(z => z.key === zoneKey)!;
  const boxes = FLOOR_PLAN[zoneKey];
  const occupiedCount = boxes.filter(b => encountersByZoneBox.has(`${zoneKey}-${b.boxNumber}`)).length;
  const [open, setOpen] = useState(true);

  const handleDropToBox = (encounterId: string, boxNumber: number) => {
    if (onDropToZone) onDropToZone(encounterId, zoneKey, boxNumber);
  };

  // On mobile, use a simple responsive grid instead of CSS grid positioning
  const gridCols = zoneKey === 'sau' ? 'grid-cols-3' : zoneKey === 'uhcd' ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full">
          <div className={cn(
            'rounded-lg p-2 flex items-center transition-all',
            zoneKey === 'sau' ? 'bg-medical-info/10' : zoneKey === 'uhcd' ? 'bg-medical-warning/10' : 'bg-medical-critical/10',
          )}>
            <div className="flex items-center gap-2 flex-1">
              <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold', zoneLabelColors[zoneKey])}>
                {zoneConfig.label}
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold">
                {occupiedCount}/{zoneConfig.boxCount}
              </Badge>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform text-muted-foreground', open && 'rotate-180')} />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn('grid gap-1 mt-1.5', gridCols)}>
          {boxes.map(box => {
            const enc = encountersByZoneBox.get(`${zoneKey}-${box.boxNumber}`);
            return (
              <FloorBoxCell
                key={`${zoneKey}-${box.boxNumber}`}
                box={{ ...box, col: 'auto', row: 'auto' }}
                zoneKey={zoneKey}
                encounter={enc}
                resultCount={enc ? getResultCount(enc.id) : undefined}
                isHighlighted={enc ? highlightedIds?.has(enc.id) : false}
                hasActiveFilter={hasActiveFilter}
                compact={compact}
                onClick={enc ? () => onClickEncounter(enc) : undefined}
                onDropEncounter={(eid, boxNum) => handleDropToBox(eid, boxNum)}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Desktop Zone Section (with drag & drop) ──

function ZoneSection({
  zoneKey,
  encountersByZoneBox,
  resultCounts,
  highlightedIds,
  hasActiveFilter,
  onClickEncounter,
  getResultCount,
  onDropToZone,
}: {
  zoneKey: ZoneKey;
  encountersByZoneBox: Map<string, Encounter>;
  resultCounts: ResultCount[];
  highlightedIds?: Set<string>;
  hasActiveFilter?: boolean;
  onClickEncounter: (e: Encounter) => void;
  getResultCount: (id: string) => ResultCount | undefined;
  onDropToZone?: (encounterId: string, zone: string, boxNumber?: number) => void;
}) {
  const zoneConfig = ZONE_CONFIGS.find(z => z.key === zoneKey)!;
  const boxes = FLOOR_PLAN[zoneKey];
  const gridTemplate = ZONE_GRID_TEMPLATES[zoneKey];
  const occupiedCount = boxes.filter(b => encountersByZoneBox.has(`${zoneKey}-${b.boxNumber}`)).length;
  const [isDragOverZone, setIsDragOverZone] = useState(false);
  const [dragOverBox, setDragOverBox] = useState<number | null>(null);

  const handleZoneDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverZone(true);
  };

  const handleZoneDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOverZone(false);
      setDragOverBox(null);
    }
  };

  const handleZoneDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOverZone(false);
    setDragOverBox(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/urgenceos-encounter'));
      if (data.encounterId && onDropToZone) {
        onDropToZone(data.encounterId, zoneKey);
      }
    } catch {}
  };

  const handleDropToBox = (encounterId: string, boxNumber: number) => {
    setDragOverBox(null);
    setIsDragOverZone(false);
    if (onDropToZone) {
      onDropToZone(encounterId, zoneKey, boxNumber);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-card/50 p-3 transition-all duration-200',
        isDragOverZone && 'ring-2 ring-primary shadow-lg scale-[1.01]',
      )}
      onDragOver={handleZoneDragOver}
      onDragLeave={handleZoneDragLeave}
      onDrop={handleZoneDrop}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('px-2.5 py-1 rounded-md text-xs font-bold', zoneLabelColors[zoneKey])}>
          {zoneConfig.label}
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {occupiedCount}/{zoneConfig.boxCount}
        </Badge>
        {isDragOverZone && (
          <span className="text-xs text-primary font-medium animate-pulse">
            Déposer vers {zoneConfig.label}
          </span>
        )}
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
            <div
              key={`${zoneKey}-${box.boxNumber}`}
              onDragEnter={() => setDragOverBox(box.boxNumber)}
              onDragLeave={(e) => {
                if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                  setDragOverBox(null);
                }
              }}
              style={{ gridColumn: box.col, gridRow: box.row }}
            >
              <FloorBoxCell
                box={{ ...box, col: '1 / -1', row: '1 / -1' }}
                zoneKey={zoneKey}
                encounter={enc}
                resultCount={enc ? getResultCount(enc.id) : undefined}
                isHighlighted={enc ? highlightedIds?.has(enc.id) : false}
                hasActiveFilter={hasActiveFilter}
                isDragOver={dragOverBox === box.boxNumber && !enc}
                onClick={enc ? () => onClickEncounter(enc) : undefined}
                onDropEncounter={(eid, boxNum) => handleDropToBox(eid, boxNum)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
