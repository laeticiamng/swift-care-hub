import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { CCMUBadge } from './CCMUBadge';
import { ThemeToggle } from './ThemeToggle';
import { NetworkStatus } from './NetworkStatus';
import { RecapDrawer } from './RecapDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  boxNumber?: number | null;
  poids?: number | null;
  encounterId?: string;
  onBack?: () => void;
  className?: string;
}

export function PatientBanner({
  nom, prenom, age, sexe, ccmu, motif, allergies = [], medecinName, boxNumber, poids, encounterId, onBack, className,
}: PatientBannerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAllergies = allergies.length > 0;
  const isOnRecapPage = location.pathname.startsWith('/recap/');

  return (
    <div className={cn(
      'sticky top-0 z-30 border-b px-4 py-3 shadow-sm animate-in fade-in duration-300',
      'bg-card/80 backdrop-blur-xl',
      className,
    )}>
      <div className="flex items-center gap-3 flex-wrap">
        {onBack && (
          <button onClick={onBack} className="touch-target flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">Urgence<span className="text-primary">OS</span></span>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-lg font-semibold">{nom.toUpperCase()} {prenom}</h2>
          <span className="text-muted-foreground text-sm">{age} ans · {sexe}{poids ? ` · ${poids} kg` : ''}</span>
          {ccmu && <CCMUBadge level={ccmu} />}
          {boxNumber && (
            <Badge variant="outline" className="text-xs font-medium">
              Box {boxNumber}
            </Badge>
          )}
        </div>
        {motif && (
          <Badge variant="secondary" className="text-xs font-medium">
            {motif}
          </Badge>
        )}
        {hasAllergies && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-medical-critical/10 border border-medical-critical/20">
            <AlertTriangle className="h-3.5 w-3.5 text-medical-critical" />
            <span className="text-xs font-semibold text-medical-critical">
              {allergies.join(', ')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {medecinName && (
            <span className="text-sm text-muted-foreground mr-2">Dr. {medecinName}</span>
          )}
          {encounterId && !isOnRecapPage && (
            <RecapDrawer
              encounterId={encounterId}
              trigger={
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  RECAP
                </Button>
              }
            />
          )}
          <NetworkStatus />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
