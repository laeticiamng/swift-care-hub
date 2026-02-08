import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  className?: string;
}

export function StatCard({ label, value, icon: Icon, variant = 'default', className }: StatCardProps) {
  const variantClasses = {
    default: 'bg-card text-card-foreground',
    critical: 'bg-medical-critical/10 text-medical-critical',
    warning: 'bg-medical-warning/10 text-medical-warning',
    success: 'bg-medical-success/10 text-medical-success',
  };

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm', variantClasses[variant], className)}>
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
