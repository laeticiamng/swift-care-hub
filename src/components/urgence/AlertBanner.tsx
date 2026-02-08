import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AlertBannerProps {
  message: string;
  level: 'critical' | 'warning' | 'info';
  dismissable?: boolean;
  className?: string;
}

export function AlertBanner({ message, level, dismissable = true, className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const config = {
    critical: { bg: 'bg-medical-critical text-medical-critical-foreground', icon: AlertTriangle, canDismiss: false },
    warning: { bg: 'bg-medical-warning text-medical-warning-foreground', icon: AlertTriangle, canDismiss: true },
    info: { bg: 'bg-medical-info text-medical-info-foreground', icon: Info, canDismiss: true },
  };

  const { bg, icon: IconComp, canDismiss } = config[level];

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg', bg, className)}>
      <IconComp className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {dismissable && canDismiss && (
        <button onClick={() => setDismissed(true)} className="touch-target flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
