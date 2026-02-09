import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Check } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';

interface SurveillanceBannerProps {
  rx: any;
  meta: PrescriptionMetadata;
  onAction: (action: string, data?: any) => void;
}

export function SurveillanceBanner({ rx, meta, onAction }: SurveillanceBannerProps) {
  const isContinuous =
    meta.surveillance_frequency?.toLowerCase() === 'continue' ||
    meta.surveillance_frequency?.toLowerCase() === 'continu';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2',
        'bg-indigo-50/60 dark:bg-indigo-950/10 border-indigo-500/20'
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-indigo-100 dark:bg-indigo-900/30">
        <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">
          {meta.surveillance_type || rx.medication_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {meta.surveillance_frequency && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 font-medium',
                isContinuous &&
                  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800'
              )}
            >
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              {meta.surveillance_frequency}
            </Badge>
          )}
        </div>
      </div>

      {/* Acknowledge button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction('acknowledge_surveillance', { rx_id: rx.id })}
        className="min-h-[44px] px-3 text-xs font-medium text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950/30 active:scale-95"
      >
        <Check className="h-4 w-4 mr-1" />
        Fait
      </Button>
    </div>
  );
}
