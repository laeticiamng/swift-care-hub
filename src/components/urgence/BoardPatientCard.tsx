import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CCMUBadge } from '@/components/urgence/CCMUBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { FlaskConical, Stethoscope, AlertTriangle, ClipboardList, UserPlus, Pill, Clock, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';

type Zone = 'sau' | 'uhcd' | 'dechocage';
const ZONES: { key: Zone; label: string }[] = [
  { key: 'sau', label: 'SAU' },
  { key: 'uhcd', label: 'UHCD' },
  { key: 'dechocage', label: 'Déchocage' },
];

const ccmuBorderColors: Record<number, string> = {
  1: 'border-l-medical-success',
  2: 'border-l-medical-info',
  3: 'border-l-medical-warning',
  4: 'border-l-medical-critical',
  5: 'border-l-medical-critical',
};

const zoneBadgeColors: Record<string, string> = {
  sau: 'bg-medical-info/10 text-medical-info',
  uhcd: 'bg-medical-warning/10 text-medical-warning',
  dechocage: 'bg-medical-critical/10 text-medical-critical',
};

export type WaitingStatus = 'a-trier' | 'a-installer' | 'a-orienter' | null;

export function getWaitingStatus(encounter: { status: string; zone: Zone | null; box_number: number | null }): WaitingStatus {
  if (encounter.status === 'arrived' && !encounter.zone) return 'a-trier';
  if ((encounter.status === 'triaged' || encounter.status === 'in-progress') && !encounter.zone) return 'a-orienter';
  if (encounter.zone && !encounter.box_number) return 'a-installer';
  return null;
}

const waitingBadgeConfig: Record<string, { label: string; className: string }> = {
  'a-trier': { label: 'À trier', className: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
  'a-installer': { label: 'À installer', className: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  'a-orienter': { label: 'À orienter', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
};

interface PatientCardProps {
  encounter: {
    id: string;
    patient_id: string;
    status: string;
    zone: Zone | null;
    box_number: number | null;
    ccmu: number | null;
    cimu: number | null;
    motif_sfmu: string | null;
    medecin_id: string | null;
    arrival_time: string;
    patients: { nom: string; prenom: string; date_naissance: string; sexe: string; allergies: string[] | null };
    medecin_profile?: { full_name: string } | null;
    diagnostic?: string | null;
    last_admin_at?: string | null;
    active_rx_count?: number;
  };
  resultCount?: { unread: number; critical: number };
  rxCount?: number;
  role: string | null;
  index: number;
  showZoneBadge?: boolean;
  showWaitingBadge?: boolean;
  medecins?: { id: string; full_name: string }[];
  onMoveZone: (encounterId: string, zone: Zone) => void;
  onAssignMedecin?: (encounterId: string, medecinId: string) => void;
  onClick: () => void;
  onTriage?: (patientId: string) => void;
}

export function PatientCard({ encounter, resultCount, rxCount, role, index, showZoneBadge, showWaitingBadge, medecins, onMoveZone, onAssignMedecin, onClick, onTriage }: PatientCardProps) {
  const p = encounter.patients;
  const age = calculateAge(p.date_naissance);
  const waitMin = getWaitTimeMinutes(encounter.arrival_time);
  const waitStr = formatWaitTime(waitMin);
  const waitCritical = waitMin > 240;
  const waitWarning = waitMin > 120;
  const rc = resultCount;
  const borderColor = encounter.ccmu ? ccmuBorderColors[encounter.ccmu] || '' : '';
  const ws = showWaitingBadge ? getWaitingStatus(encounter) : null;

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-2',
        borderColor && `border-l-4 ${borderColor}`,
      )}
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{p.nom.toUpperCase()} {p.prenom}</span>
            <span className="text-sm text-muted-foreground">{age}a · {p.sexe}</span>
            {showZoneBadge && encounter.zone && (
              <Badge variant="outline" className={cn('text-xs', zoneBadgeColors[encounter.zone])}>
                {encounter.zone.toUpperCase()}
              </Badge>
            )}
            {ws && waitingBadgeConfig[ws] && (
              <Badge variant="outline" className={cn('text-xs', waitingBadgeConfig[ws].className)}>
                {waitingBadgeConfig[ws].label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {encounter.ccmu && <CCMUBadge level={encounter.ccmu} size="sm" />}
            {ws === 'a-trier' && onTriage && (role === 'ioa' || role === 'medecin') && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                onClick={(e) => { e.stopPropagation(); onTriage(encounter.patient_id); }}
              >
                <ClipboardList className="h-3 w-3 mr-1" /> Trier
              </Button>
            )}
          </div>
        </div>
        {encounter.motif_sfmu && <p className="text-sm text-muted-foreground">{encounter.motif_sfmu}</p>}

        {/* Role-adaptive info */}
        {role === 'medecin' && encounter.diagnostic && (
          <p className="text-xs text-primary font-medium truncate">Dx: {encounter.diagnostic}</p>
        )}
        {role === 'ioa' && encounter.cimu && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-xs',
              encounter.cimu <= 2 ? 'border-medical-critical/30 text-medical-critical' :
              encounter.cimu === 3 ? 'border-medical-warning/30 text-medical-warning' :
              'border-muted-foreground/30 text-muted-foreground'
            )}>
              CIMU {encounter.cimu}
            </Badge>
            {!encounter.zone && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> En attente d'orientation
              </span>
            )}
          </div>
        )}
        {role === 'ide' && (
          <div className="flex items-center gap-2 text-xs">
            {encounter.active_rx_count !== undefined && encounter.active_rx_count > 0 && (
              <Badge variant="outline" className="text-xs gap-0.5 border-medical-warning/30 text-medical-warning">
                <Syringe className="h-3 w-3" /> {encounter.active_rx_count} Rx actives
              </Badge>
            )}
            {encounter.last_admin_at && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dern. admin {new Date(encounter.last_admin_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}
        {encounter.medecin_profile && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Stethoscope className="h-3 w-3" /> {encounter.medecin_profile.full_name}
          </p>
        )}
        {!encounter.medecin_id && onAssignMedecin && medecins && medecins.length > 0 && (role === 'ioa' || role === 'medecin') && (
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <UserPlus className="h-3 w-3 text-muted-foreground" />
            <Select onValueChange={(v) => onAssignMedecin(encounter.id, v)}>
              <SelectTrigger className="w-auto h-7 text-xs">
                <SelectValue placeholder="Assigner médecin" />
              </SelectTrigger>
              <SelectContent>
                {medecins.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className={cn('font-medium', waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground')}>
            {waitStr}
          </span>
          <div className="flex items-center gap-1.5">
            {(role === 'medecin' || role === 'ide') && rxCount !== undefined && rxCount > 0 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 gap-0.5 border-medical-warning/30 text-medical-warning">
                <Pill className="h-3 w-3" /> {rxCount} Rx
              </Badge>
            )}
            {role === 'secretaire' && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {encounter.status === 'arrived' ? 'Admis' : encounter.status === 'triaged' ? 'Trié' : 'En cours'}
              </Badge>
            )}
            {rc && rc.critical > 0 && (
              <Badge className="bg-medical-critical text-medical-critical-foreground text-xs px-1.5 py-0">
                <FlaskConical className="h-3 w-3 mr-0.5" /> {rc.critical}
              </Badge>
            )}
            {rc && rc.unread > 0 && rc.critical === 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <FlaskConical className="h-3 w-3 mr-0.5" /> {rc.unread}
              </Badge>
            )}
            {encounter.box_number && <span className="text-muted-foreground">Box {encounter.box_number}</span>}
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {ZONES.map(z => (
              <button
                key={z.key}
                onClick={() => onMoveZone(encounter.id, z.key)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-semibold border transition-all',
                  encounter.zone === z.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-accent border-border text-muted-foreground',
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
        {p.allergies && p.allergies.length > 0 && (
          <p className="text-xs text-medical-critical font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {p.allergies.join(', ')}</p>
        )}
      </CardContent>
    </Card>
  );
}
