/**
 * M1-01 — Bandeau identitaire permanent
 * NOM + Prénom + DDN + IPP + Service + N° séjour sur 100% des écrans
 * M1-02 — Détection homonymie : bandeau rouge clignotant
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText, Shield, ShieldAlert, User, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CCMUBadge } from './CCMUBadge';
import { ThemeToggle } from './ThemeToggle';
import { NetworkStatus } from './NetworkStatus';
import { RecapDrawer } from './RecapDrawer';
import { HomonymyAlertDialog } from './HomonymyAlert';
import { generateIPP, generateNumeroSejour, detectHomonymy } from '@/lib/homonymy-detection';
import type { PatientIdentity, HomonymyAlert as HomonymyAlertType } from '@/lib/sih-types';

interface IdentityBannerProps {
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  patientId: string;
  encounterId?: string;
  service?: string;
  ccmu?: number | null;
  cimu?: number | null;
  motif?: string | null;
  allergies?: string[];
  medecinName?: string;
  boxNumber?: number | null;
  poids?: number | null;
  photoUrl?: string;
  allPatients?: PatientIdentity[];
  onBack?: () => void;
  className?: string;
}

export function IdentityBanner({
  nom, prenom, dateNaissance, sexe, patientId, encounterId, service = 'SAU',
  ccmu, cimu, motif, allergies = [], medecinName, boxNumber, poids, photoUrl,
  allPatients = [], onBack, className,
}: IdentityBannerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [homonymyAlerts, setHomonymyAlerts] = useState<HomonymyAlertType[]>([]);
  const [showHomonymyDialog, setShowHomonymyDialog] = useState(false);

  const ipp = generateIPP(patientId);
  const numeroSejour = encounterId ? generateNumeroSejour(encounterId) : '—';
  const hasAllergies = allergies.length > 0;
  const isOnRecapPage = location.pathname.startsWith('/recap/');

  // Calculate age
  const age = Math.floor((Date.now() - new Date(dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000));

  // M1-02: Detect homonymy
  useEffect(() => {
    if (allPatients.length === 0) return;
    const currentPatient: PatientIdentity = {
      id: patientId,
      nom,
      prenom,
      date_naissance: dateNaissance,
      ipp,
      service,
      numero_sejour: numeroSejour,
      sexe,
      allergies,
    };
    const alerts = detectHomonymy(currentPatient, allPatients);
    setHomonymyAlerts(alerts);
    if (alerts.length > 0) {
      setShowHomonymyDialog(true);
    }
  }, [patientId, nom, prenom, allPatients.length]);

  const hasHomonymy = homonymyAlerts.length > 0;

  return (
    <>
      <div className={cn(
        'sticky top-0 z-30 border-b px-4 py-2 shadow-sm animate-in fade-in duration-300',
        'bg-card/80 backdrop-blur-xl',
        hasHomonymy && 'border-red-500 bg-red-50/80 dark:bg-red-950/30 animate-pulse',
        className,
      )}>
        {/* M1-02: Homonymy warning bar */}
        {hasHomonymy && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-md bg-red-600 text-white animate-pulse">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-bold">
              ALERTE HOMONYMIE — {homonymyAlerts.length} patient(s) avec le meme nom/prenom — Verification obligatoire
            </span>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto h-6 text-xs bg-white text-red-600 hover:bg-red-50 border-white"
              onClick={() => setShowHomonymyDialog(true)}
            >
              Verifier
            </Button>
          </div>
        )}

        {/* Row 1: Back + Patient name + Actions */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button onClick={onBack} className="touch-target flex items-center justify-center rounded-lg hover:bg-accent transition-colors shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Patient photo / avatar */}
          <div className="shrink-0 hidden sm:block">
            {photoUrl ? (
              <img src={photoUrl} alt={`${nom} ${prenom}`} className="h-10 w-10 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>

          {/* M1-01: Core identity — always visible */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold truncate max-w-[200px] sm:max-w-none">{nom.toUpperCase()} {prenom}</h2>
            <span className="text-muted-foreground text-xs sm:text-sm shrink-0">
              {age}a · {sexe}{poids ? ` · ${poids}kg` : ''}
            </span>
            {ccmu && <CCMUBadge level={ccmu} />}
            {boxNumber && (
              <Badge variant="outline" className="text-xs font-medium shrink-0">Box {boxNumber}</Badge>
            )}
          </div>

          {/* Right actions — compact on mobile */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {encounterId && !isOnRecapPage && (
              <RecapDrawer
                encounterId={encounterId}
                trigger={
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 sm:px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">RECAP</span>
                  </Button>
                }
              />
            )}
            <div className="hidden sm:flex items-center gap-1">
              <NetworkStatus />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Row 2: Identifiers + Allergies — scrollable on mobile */}
        <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-hide flex-nowrap pb-0.5 -mb-0.5">
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono shrink-0 hidden sm:inline-flex">
            <Shield className="h-3 w-3 mr-0.5 text-primary" /> UrgenceOS
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono shrink-0">
            DDN: {new Date(dateNaissance).toLocaleDateString('fr-FR')}
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono bg-primary/10 text-primary shrink-0">
            IPP: {ipp}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
            {service}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs font-mono shrink-0">
            {numeroSejour}
          </Badge>
          {motif && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium shrink-0">{motif}</Badge>
          )}
          {medecinName && (
            <span className="text-xs text-muted-foreground shrink-0 hidden md:inline">Dr. {medecinName}</span>
          )}
          {hasAllergies && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-medical-critical/10 border border-medical-critical/20 shrink-0">
              <AlertTriangle className="h-3 w-3 text-medical-critical" />
              <span className="text-[10px] sm:text-xs font-semibold text-medical-critical whitespace-nowrap">
                {allergies.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* M1-02: Homonymy confirmation dialog */}
      {showHomonymyDialog && homonymyAlerts.length > 0 && (
        <HomonymyAlertDialog
          alerts={homonymyAlerts}
          currentPatient={{ id: patientId, nom, prenom, date_naissance: dateNaissance, ipp, service, numero_sejour: numeroSejour, sexe, allergies }}
          onConfirm={() => setShowHomonymyDialog(false)}
          onCancel={() => {
            setShowHomonymyDialog(false);
            if (onBack) onBack();
            else navigate(-1);
          }}
        />
      )}
    </>
  );
}
