/**
 * M2-01 — SIH Unified Patient Timeline
 * Unified chronological view: arrival, triage, consultation, prescriptions (written & oral),
 * acts, lab results, lab alerts, oral info, communications, administrations, discharge.
 * M2-02 — Lab alert integration (<30s visibility)
 * M2-03 — Unvalidated oral prescriptions with orange tag + auto-reminder
 * M2-04 — Undocumented oral information with pending tag
 * M2-05 — Color codes: green (validated), orange (pending), red (critical) + filters
 */

import { useState, useMemo } from 'react';
import {
  Clock, Stethoscope, ClipboardList, Pill, Syringe, FlaskConical,
  Phone, MessageSquare, AlertTriangle, DoorOpen, Activity, CheckCircle,
  Filter, ChevronDown, Bell, Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TimelineEntry, TimelineEntryType, TimelineValidationStatus } from '@/lib/sih-types';
import { VALIDATION_COLORS } from '@/lib/sih-types';

interface SIHTimelineProps {
  entries: TimelineEntry[];
  onValidateOralPrescription?: (entryId: string, prescriptionId: string) => void;
  onAcknowledgeLabAlert?: (entryId: string) => void;
  className?: string;
}

const ENTRY_TYPE_CONFIG: Record<TimelineEntryType, {
  icon: React.ReactNode;
  label: string;
  color: string;
}> = {
  arrivee: { icon: <DoorOpen className="h-4 w-4" />, label: 'Arrivee', color: 'text-blue-500' },
  triage: { icon: <ClipboardList className="h-4 w-4" />, label: 'Triage', color: 'text-orange-500' },
  consultation: { icon: <Stethoscope className="h-4 w-4" />, label: 'Consultation', color: 'text-primary' },
  prescription_ecrite: { icon: <Pill className="h-4 w-4" />, label: 'Prescription', color: 'text-indigo-500' },
  prescription_orale: { icon: <Pill className="h-4 w-4" />, label: 'Rx orale', color: 'text-orange-500' },
  acte: { icon: <Activity className="h-4 w-4" />, label: 'Acte', color: 'text-green-500' },
  resultat_bio: { icon: <FlaskConical className="h-4 w-4" />, label: 'Resultat bio', color: 'text-cyan-500' },
  resultat_imagerie: { icon: <Activity className="h-4 w-4" />, label: 'Resultat imagerie', color: 'text-indigo-500' },
  resultat_ecg: { icon: <Activity className="h-4 w-4" />, label: 'Resultat ECG', color: 'text-rose-500' },
  alerte_labo: { icon: <Bell className="h-4 w-4" />, label: 'Alerte labo', color: 'text-red-500' },
  info_orale: { icon: <MessageSquare className="h-4 w-4" />, label: 'Info orale', color: 'text-amber-500' },
  communication: { icon: <Phone className="h-4 w-4" />, label: 'Communication', color: 'text-indigo-500' },
  administration: { icon: <Syringe className="h-4 w-4" />, label: 'Administration', color: 'text-green-600' },
  sortie: { icon: <DoorOpen className="h-4 w-4" />, label: 'Sortie', color: 'text-gray-500' },
};

type FilterStatus = 'all' | 'valide' | 'en_attente' | 'critique';

export function SIHTimeline({
  entries,
  onValidateOralPrescription,
  onAcknowledgeLabAlert,
  className,
}: SIHTimelineProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const sorted = useMemo(() => {
    const filtered = filterStatus === 'all'
      ? entries
      : entries.filter(e => e.validation_status === filterStatus);
    return [...filtered].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [entries, filterStatus]);

  const statusCounts = useMemo(() => ({
    valide: entries.filter(e => e.validation_status === 'valide').length,
    en_attente: entries.filter(e => e.validation_status === 'en_attente').length,
    critique: entries.filter(e => e.validation_status === 'critique').length,
  }), [entries]);

  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">Aucun evenement dans le fil chronologique</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Fil chronologique</span>
          <Badge variant="outline" className="text-xs">{entries.length} evenements</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            Filtres
            <ChevronDown className={cn('h-3.5 w-3.5 ml-1 transition-transform', showFilters && 'rotate-180')} />
          </Button>
        </div>
      </div>

      {/* M2-05: Status filter pills */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200">
          <FilterPill
            label="Tous"
            count={entries.length}
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          />
          <FilterPill
            label="Valide"
            count={statusCounts.valide}
            active={filterStatus === 'valide'}
            onClick={() => setFilterStatus('valide')}
            colorClass="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
          />
          <FilterPill
            label="En attente"
            count={statusCounts.en_attente}
            active={filterStatus === 'en_attente'}
            onClick={() => setFilterStatus('en_attente')}
            colorClass="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
          />
          <FilterPill
            label="Critique"
            count={statusCounts.critique}
            active={filterStatus === 'critique'}
            onClick={() => setFilterStatus('critique')}
            colorClass="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          />
        </div>
      )}

      {/* Timeline entries */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {sorted.map((entry, idx) => (
            <TimelineEntryRow
              key={entry.id}
              entry={entry}
              index={idx}
              onValidateOralPrescription={onValidateOralPrescription}
              onAcknowledgeLabAlert={onAcknowledgeLabAlert}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEntryRow({
  entry,
  index,
  onValidateOralPrescription,
  onAcknowledgeLabAlert,
}: {
  entry: TimelineEntry;
  index: number;
  onValidateOralPrescription?: (entryId: string, prescriptionId: string) => void;
  onAcknowledgeLabAlert?: (entryId: string) => void;
}) {
  const config = ENTRY_TYPE_CONFIG[entry.entry_type] || ENTRY_TYPE_CONFIG.communication;
  const statusColor = VALIDATION_COLORS[entry.validation_status];
  const time = new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const isCritical = entry.validation_status === 'critique';
  const isPending = entry.validation_status === 'en_attente';
  const isOralPrescription = entry.entry_type === 'prescription_orale';
  const isLabAlert = entry.entry_type === 'alerte_labo';

  return (
    <div
      className={cn(
        'relative flex gap-3 pl-2 pr-3 py-2.5 rounded-lg transition-colors',
        'animate-in fade-in slide-in-from-left-2',
        isCritical && 'bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900',
        isPending && 'bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900',
        !isCritical && !isPending && 'hover:bg-muted/50',
      )}
      style={{ animationDelay: `${index * 20}ms`, animationFillMode: 'both' }}
    >
      {/* Icon dot */}
      <div className={cn(
        'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background flex-shrink-0',
        isCritical && 'border-red-500 animate-pulse',
        isPending && 'border-orange-400',
        !isCritical && !isPending && 'border-muted-foreground/20',
      )}>
        <span className={config.color}>{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">{time}</span>
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {config.label}
          </Badge>
          {/* M2-05: Validation status badge */}
          <Badge className={cn('text-xs px-1.5 py-0', statusColor.bg, statusColor.text)}>
            {statusColor.label}
          </Badge>
          {/* M2-03: Oral prescription tag */}
          {isOralPrescription && (
            <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0 animate-pulse">
              Oral — En attente validation
            </Badge>
          )}
        </div>

        <p className={cn('text-sm', isCritical && 'font-semibold text-red-700 dark:text-red-400')}>
          {entry.content}
        </p>

        {/* Author */}
        <p className="text-xs text-muted-foreground">
          {entry.author_name}
          {entry.lab_interlocutor && ` — Interlocuteur: ${entry.lab_interlocutor}`}
        </p>

        {/* Lab result value */}
        {entry.lab_result_value && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <FlaskConical className="h-3 w-3 text-red-600" />
            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
              {entry.lab_result_value}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          {/* M2-03: Validate oral prescription */}
          {isOralPrescription && isPending && entry.oral_prescription_id && onValidateOralPrescription && (
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onValidateOralPrescription(entry.id, entry.oral_prescription_id!)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Valider prescription
            </Button>
          )}

          {/* M3-03: Acknowledge lab alert */}
          {isLabAlert && isCritical && onAcknowledgeLabAlert && (
            <Button
              size="sm"
              className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onAcknowledgeLabAlert(entry.id)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Acquitter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label, count, active, onClick, colorClass,
}: {
  label: string; count: number; active: boolean; onClick: () => void; colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px]',
        active
          ? colorClass || 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        active && colorClass && 'ring-2 ring-offset-1 ring-current/20',
      )}
    >
      {label} ({count})
    </button>
  );
}
