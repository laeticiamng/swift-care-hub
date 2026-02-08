import { cn } from '@/lib/utils';

interface CCMUBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ccmuConfig: Record<number, { label: string; className: string }> = {
  1: { label: 'CCMU 1', className: 'bg-medical-success text-medical-success-foreground' },
  2: { label: 'CCMU 2', className: 'bg-medical-success text-medical-success-foreground' },
  3: { label: 'CCMU 3', className: 'bg-medical-warning text-medical-warning-foreground' },
  4: { label: 'CCMU 4', className: 'bg-medical-critical text-medical-critical-foreground' },
  5: { label: 'CCMU 5', className: 'bg-medical-critical text-medical-critical-foreground' },
};

export function CCMUBadge({ level, size = 'md', className }: CCMUBadgeProps) {
  const config = ccmuConfig[level] || ccmuConfig[1];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5 font-medium',
    lg: 'text-base px-3 py-1 font-semibold',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full', config.className, sizeClasses[size], className)}>
      {config.label}
    </span>
  );
}
