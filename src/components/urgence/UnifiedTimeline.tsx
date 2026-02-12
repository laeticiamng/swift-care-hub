/**
 * M2-01 — Unified Patient Timeline
 * All events: arrival, triage, consultation, prescriptions (written & oral), acts, lab results,
 * lab alerts, oral information. Timestamped + author.
 * M2-05 — Color codes: green (validated), orange (pending), red (critical)
 */

import { useState } from 'react';
import {
  Clock, FlaskConical, Pill, Phone, Stethoscope, Activity, FileText, AlertTriangle,
  MessageSquare, Syringe, LogIn, Filter, ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TimelineEntry, TimelineEntryType, TimelineValidationStatus } from '@/lib/sih-types';
import { VALIDATION_COLORS } from '@/lib/sih-types';

interface UnifiedTimelineProps {
  entries: TimelineEntry[];
  onValidateEntry?: (entryId: string) => void;
  className?: string;
}

const ENTRY_ICONS: Record<TimelineEntryType, React.ReactNode> = {
  arrivee: <LogIn className="h-4 w-4 text-blue-500" />,
  triage: <Activity className="h-4 w-4 text-purple-500" />,
  consultation: <Stethoscope className="h-4 w-4 text-primary" />,
  prescription_ecrite: <Pill className="h-4 w-4 text-medical-info" />,
  prescription_orale: <Pill className="h-4 w-4 text-orange-500" />,
  acte: <Syringe className="h-4 w-4 text-medical-success" />,
  resultat_bio: <FlaskConical className="h-4 w-4 text-medical-info" />,
  resultat_imagerie: <FileText className="h-4 w-4 text-indigo-500" />,
  resultat_ecg: <Activity className="h-4 w-4 text-rose-500" />,
  alerte_labo: <AlertTriangle className="h-4 w-4 text-red-500" />,
  info_orale: <MessageSquare className="h-4 w-4 text-amber-500" />,
  communication: <Phone className="h-4 w-4 text-indigo-500" />,
  administration: <CheckCircle className="h-4 w-4 text-green-500" />,
  sortie: <FileText className="h-4 w-4 text-muted-foreground" />,
};

const ENTRY_LABELS: Record<TimelineEntryType, string> = {
  arrivee: 'Arrivee',
  triage: 'Triage',
  consultation: 'Consultation',
  prescription_ecrite: 'Prescription ecrite',
  prescription_orale: 'Prescription orale',
  acte: 'Acte',
  resultat_bio: 'Resultat biologique',
  resultat_imagerie: 'Resultat imagerie',
  resultat_ecg: 'Resultat ECG',
  alerte_labo: 'Alerte labo',
  info_orale: 'Information orale',
  communication: 'Communication',
  administration: 'Administration',
  sortie: 'Sortie',
};

type FilterType = 'all' | TimelineValidationStatus | TimelineEntryType;

export function UnifiedTimeline({ entries, onValidateEntry, className }: UnifiedTimelineProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState(true);

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'valide' || filter === 'en_attente' || filter === 'critique') {
      return entry.validation_status === filter;
    }
    return entry.entry_type === filter;
  });

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const pendingCount = entries.filter(e => e.validation_status === 'en_attente').length;
  const criticalCount = entries.filter(e => e.validation_status === 'critique').length;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Fil chronologique unifie</h3>
          <Badge variant="outline" className="text-xs">{entries.length}</Badge>
          {pendingCount > 0 && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 text-xs">
              {pendingCount} en attente
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs animate-pulse">
              {criticalCount} critique(s)
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {(['all', 'critique', 'en_attente', 'valide'] as FilterType[]).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'ghost'}
              className={cn('h-7 text-xs px-2', filter === f && f === 'critique' && 'bg-red-600 hover:bg-red-700')}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tout' : f === 'critique' ? 'Critique' : f === 'en_attente' ? 'En attente' : 'Valide'}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Timeline entries */}
      {expanded && (
        <div className="space-y-2">
          {sortedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun evenement</p>
          ) : (
            sortedEntries.map((entry, idx) => (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                index={idx}
                onValidate={onValidateEntry}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TimelineEntryCard({
  entry, index, onValidate,
}: { entry: TimelineEntry; index: number; onValidate?: (id: string) => void }) {
  const colors = VALIDATION_COLORS[entry.validation_status];
  const time = new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(entry.created_at).toLocaleDateString('fr-FR');

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-1',
        colors.bg,
        entry.validation_status === 'critique' && 'border-red-300 dark:border-red-800',
        entry.validation_status === 'en_attente' && 'border-orange-300 dark:border-orange-800',
      )}
      style={{ animationDelay: `${index * 20}ms`, animationFillMode: 'both' }}
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="mt-0.5">
          {ENTRY_ICONS[entry.entry_type] || <Clock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('text-xs', colors.text)}>
            {ENTRY_LABELS[entry.entry_type] || entry.entry_type}
          </Badge>
          <span className="text-xs text-muted-foreground">{time}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-xs text-muted-foreground">— {entry.author_name}</span>

          {/* Validation status badge */}
          {entry.validation_status === 'en_attente' && (
            <Badge className="bg-orange-500 text-white text-xs animate-pulse">En attente validation</Badge>
          )}
          {entry.validation_status === 'critique' && (
            <Badge className="bg-red-600 text-white text-xs animate-pulse">CRITIQUE</Badge>
          )}
        </div>

        <p className="text-sm">{entry.content}</p>

        {/* Lab alert specific info */}
        {entry.lab_result_value && (
          <p className="text-xs font-mono text-red-600 dark:text-red-400 font-bold">
            Resultat: {entry.lab_result_value}
          </p>
        )}
        {entry.lab_interlocutor && (
          <p className="text-xs text-muted-foreground">Interlocuteur: {entry.lab_interlocutor}</p>
        )}

        {/* Oral prescription pending validation */}
        {entry.entry_type === 'prescription_orale' && entry.validation_status === 'en_attente' && onValidate && (
          <Button
            size="sm"
            className="h-7 text-xs mt-1 bg-orange-500 hover:bg-orange-600"
            onClick={() => onValidate(entry.id)}
          >
            Valider la prescription orale
          </Button>
        )}
      </div>
    </div>
  );
}
