import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { CCMUBadge } from './CCMUBadge';
import { cn } from '@/lib/utils';

interface PatientBannerProps {
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  ccmu?: number | null;
  motif?: string | null;
  allergies?: string[];
  medecinName?: string;
  onBack?: () => void;
  className?: string;
}

export function PatientBanner({
  nom, prenom, age, sexe, ccmu, motif, allergies = [], medecinName, onBack, className,
}: PatientBannerProps) {
  const hasAllergies = allergies.length > 0;

  return (
    <div className={cn('sticky top-0 z-30 bg-card border-b px-4 py-3 shadow-sm', className)}>
      <div className="flex items-center gap-3 flex-wrap">
        {onBack && (
          <button onClick={onBack} className="touch-target flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">{nom.toUpperCase()} {prenom}</h2>
          <span className="text-muted-foreground text-sm">{age} ans · {sexe}</span>
          {ccmu && <CCMUBadge level={ccmu} />}
        </div>
        {motif && <span className="text-sm text-muted-foreground">— {motif}</span>}
        {hasAllergies && (
          <div className="flex items-center gap-1 ml-auto">
            <AlertTriangle className="h-4 w-4 text-medical-critical" />
            <span className="text-sm font-medium text-medical-critical">
              {allergies.join(', ')}
            </span>
          </div>
        )}
        {medecinName && (
          <span className="text-sm text-muted-foreground ml-auto">Dr. {medecinName}</span>
        )}
      </div>
    </div>
  );
}
