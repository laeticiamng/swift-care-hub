import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TestTubes,
  ImageIcon,
  HeartPulse,
  Microscope,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';

interface ExamLineProps {
  rx: any;
  meta: PrescriptionMetadata;
  onAction: (action: string, data?: any) => void;
}

type ExamStatus = NonNullable<PrescriptionMetadata['exam_status']>;

const EXAM_STATUS_STEPS: ExamStatus[] = [
  'demande',
  'preleve',
  'patient_parti',
  'realise',
  'resultat_recu',
];

const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  demande: 'Demande',
  preleve: 'Preleve',
  envoye: 'Envoye',
  patient_parti: 'Patient parti',
  realise: 'Realise',
  resultat_recu: 'Resultat recu',
};

/** Return the relevant workflow steps for this exam type. */
function getStepsForType(type: string): ExamStatus[] {
  switch (type) {
    case 'exam_bio':
      return ['demande', 'preleve', 'realise', 'resultat_recu'];
    case 'exam_imagerie':
      return ['demande', 'patient_parti', 'realise', 'resultat_recu'];
    case 'exam_ecg':
      return ['demande', 'realise', 'resultat_recu'];
    default:
      return ['demande', 'realise', 'resultat_recu'];
  }
}

function getExamIcon(type: string) {
  switch (type) {
    case 'exam_bio':
      return TestTubes;
    case 'exam_imagerie':
      return ImageIcon;
    case 'exam_ecg':
      return HeartPulse;
    default:
      return Microscope;
  }
}

function getExamColor(type: string) {
  switch (type) {
    case 'exam_bio':
      return {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-600 dark:text-teal-400',
        accent: 'teal',
      };
    case 'exam_imagerie':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-600 dark:text-indigo-400',
        accent: 'indigo',
      };
    case 'exam_ecg':
      return {
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-600 dark:text-rose-400',
        accent: 'rose',
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-900/30',
        text: 'text-slate-600 dark:text-slate-400',
        accent: 'slate',
      };
  }
}

export function ExamLine({ rx, meta, onAction }: ExamLineProps) {
  const currentStatus = meta.exam_status ?? 'demande';
  const steps = getStepsForType(meta.type);
  const currentIdx = steps.indexOf(currentStatus as ExamStatus);
  const Icon = getExamIcon(meta.type);
  const colors = getExamColor(meta.type);
  const isDone = currentStatus === 'resultat_recu';

  const handleAdvance = (targetStatus: ExamStatus) => {
    onAction('advance_exam', { status: targetStatus, rx_id: rx.id });
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1',
        isDone
          ? 'bg-green-50/50 dark:bg-green-950/10 border-green-500/20'
          : 'bg-card'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5',
          isDone ? 'bg-green-100 dark:bg-green-900/30' : colors.bg
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4',
            isDone ? 'text-green-600 dark:text-green-400' : colors.text
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title + urgency */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-medium text-sm leading-tight">{rx.medication_name}</p>
          {meta.exam_urgency === 'urgent' && (
            <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 text-[10px] px-1.5 py-0">
              Urgent
            </Badge>
          )}
        </div>

        {/* Exam list / site */}
        {meta.exam_list && meta.exam_list.length > 0 && (
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            {meta.exam_list.join(', ')}
          </p>
        )}
        {meta.exam_site && (
          <p className="text-xs text-muted-foreground mb-2">{meta.exam_site}</p>
        )}
        {meta.exam_indication && (
          <p className="text-xs text-muted-foreground/80 italic mb-2">
            {meta.exam_indication}
          </p>
        )}

        {/* Workflow status buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {steps.map((step, idx) => {
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
                    isNext && 'min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95',
                    isCompleted && !isCurrent && 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
                    isCurrent && !isDone && 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 font-semibold',
                    isDone && isCurrent && 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
                    !isCompleted && !isNext && 'text-muted-foreground/50'
                  )}
                >
                  {isCompleted && idx < currentIdx && (
                    <Check className="h-3 w-3 mr-0.5" />
                  )}
                  {EXAM_STATUS_LABELS[step]}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
