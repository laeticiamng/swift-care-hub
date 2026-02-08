import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BigButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success';
  className?: string;
}

export function BigButton({ label, icon: Icon, onClick, variant = 'default', className }: BigButtonProps) {
  const variantClasses = {
    default: 'bg-card hover:bg-accent border',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-medical-success text-medical-success-foreground hover:bg-medical-success/90',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'touch-target-lg flex flex-col items-center justify-center gap-3 rounded-xl p-6 shadow-sm transition-all duration-200 active:scale-[0.98]',
        'text-lg font-medium min-h-[120px]',
        variantClasses[variant],
        className,
      )}
    >
      <Icon className="h-8 w-8" />
      <span>{label}</span>
    </button>
  );
}
