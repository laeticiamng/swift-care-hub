import { cn } from '@/lib/utils';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMoveBarProps {
  patientName: string;
  currentZone: ZoneKey | null;
  onMoveToZone: (zone: ZoneKey) => void;
  onCancel: () => void;
}

const ZONE_COLORS: Record<string, string> = {
  sau: 'bg-medical-info text-medical-info-foreground',
  uhcd: 'bg-medical-warning text-medical-warning-foreground',
  dechocage: 'bg-medical-critical text-medical-critical-foreground',
};

export function MobileMoveBar({ patientName, currentZone, onMoveToZone, onCancel }: MobileMoveBarProps) {
  return (
    <div className="fixed bottom-14 left-0 right-0 z-50 px-3 pb-safe animate-in slide-in-from-bottom-4 duration-200">
      <div className="rounded-xl border bg-card shadow-2xl p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ArrowRight className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold truncate">
              Déplacer <span className="text-primary">{patientName}</span>
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Zone buttons */}
        <div className="flex gap-2">
          {ZONE_CONFIGS.map(z => {
            const isCurrent = z.key === currentZone;
            return (
              <button
                key={z.key}
                disabled={isCurrent}
                onClick={() => onMoveToZone(z.key)}
                className={cn(
                  'flex-1 rounded-lg py-3 text-sm font-semibold transition-all touch-target',
                  isCurrent
                    ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                    : cn(ZONE_COLORS[z.key], 'active:scale-95 hover:opacity-90 shadow-sm'),
                )}
              >
                {z.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
