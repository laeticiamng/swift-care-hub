import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Phone,
  ChevronRight,
  Check,
  MessageSquare,
  Send,
} from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';
import type { Tables } from '@/integrations/supabase/types';

interface AvisLineProps {
  rx: Tables<'prescriptions'>;
  meta: PrescriptionMetadata;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

type AvisStatus = NonNullable<PrescriptionMetadata['avis_status']>;

const AVIS_STATUS_STEPS: AvisStatus[] = ['demande', 'appele', 'vu', 'avis_rendu'];

const AVIS_STATUS_LABELS: Record<AvisStatus, string> = {
  demande: 'Demande',
  appele: 'Appele',
  vu: 'Vu',
  avis_rendu: 'Avis rendu',
};

const URGENCY_CONFIG: Record<string, { label: string; className: string }> = {
  urgent: {
    label: 'Urgent',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
  },
  rapide: {
    label: 'Rapide',
    className:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
  },
  programme: {
    label: 'Programme',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  },
};

export function AvisLine({ rx, meta, onAction }: AvisLineProps) {
  const [notesInput, setNotesInput] = useState(meta.avis_notes ?? '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const currentStatus = meta.avis_status ?? 'demande';
  const currentIdx = AVIS_STATUS_STEPS.indexOf(currentStatus);
  const isDone = currentStatus === 'avis_rendu';
  const urgencyConfig = meta.avis_urgency ? URGENCY_CONFIG[meta.avis_urgency] : null;

  const handleAdvance = (targetStatus: AvisStatus) => {
    onAction('advance_avis', { status: targetStatus, rx_id: rx.id });
  };

  const handleSaveNotes = () => {
    onAction('save_avis_notes', { notes: notesInput, rx_id: rx.id });
    setIsEditingNotes(false);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1',
        isDone
          ? 'bg-green-50/50 dark:bg-green-950/10 border-green-500/20'
          : 'bg-card'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5',
            isDone
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-purple-100 dark:bg-purple-900/30'
          )}
        >
          <Phone
            className={cn(
              'h-4 w-4',
              isDone
                ? 'text-green-600 dark:text-green-400'
                : 'text-purple-600 dark:text-purple-400'
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {meta.avis_speciality && (
              <p className="font-semibold text-sm leading-tight">
                {meta.avis_speciality}
              </p>
            )}
            {urgencyConfig && (
              <Badge className={cn('text-[10px] px-1.5 py-0', urgencyConfig.className)}>
                {urgencyConfig.label}
              </Badge>
            )}
          </div>

          {/* Motif */}
          {meta.avis_motif && (
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {meta.avis_motif}
            </p>
          )}

          {/* Workflow status buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {AVIS_STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              const isNext = idx === currentIdx + 1;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step} className="flex items-center">
                  {idx > 0 && (
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 mx-0.5 shrink-0',
                        isCompleted ? 'text-green-500' : 'text-muted-foreground/30'
                      )}
                    />
                  )}
                  <Button
                    variant={isNext ? 'default' : 'ghost'}
                    size="sm"
                    disabled={!isNext}
                    onClick={() => handleAdvance(step)}
                    className={cn(
                      'h-8 px-2.5 text-xs font-medium transition-all',
                      isNext &&
                        'min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95',
                      isCompleted &&
                        !isCurrent &&
                        'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
                      isCurrent &&
                        !isDone &&
                        'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20 font-semibold',
                      isDone &&
                        isCurrent &&
                        'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
                      !isCompleted && !isNext && 'text-muted-foreground/50'
                    )}
                  >
                    {isCompleted && idx < currentIdx && (
                      <Check className="h-3 w-3 mr-0.5" />
                    )}
                    {AVIS_STATUS_LABELS[step]}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes field */}
      <div className="ml-11">
        {isEditingNotes ? (
          <div className="flex items-center gap-2">
            <Input
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Compte-rendu de l'avis..."
              className="flex-1 h-9 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNotes();
                if (e.key === 'Escape') setIsEditingNotes(false);
              }}
            />
            <Button
              size="sm"
              onClick={handleSaveNotes}
              className="min-h-[44px] min-w-[44px] bg-purple-600 hover:bg-purple-700 text-white active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingNotes(true)}
            className={cn(
              'flex items-center gap-1.5 w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors min-h-[44px]',
              meta.avis_notes
                ? 'bg-purple-50 dark:bg-purple-950/20 text-foreground hover:bg-purple-100 dark:hover:bg-purple-950/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-purple-500" />
            {meta.avis_notes || 'Ajouter un compte-rendu...'}
          </button>
        )}
      </div>
    </div>
  );
}
