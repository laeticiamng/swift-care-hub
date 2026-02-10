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

        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button onClick={onBack} className="touch-target flex items-center justify-center rounded-lg hover:bg-accent transition-colors min-w-[44px] min-h-[44px]">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Patient photo / avatar */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={`${nom} ${prenom}`} className="h-10 w-10 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>

          {/* M1-01: Identity fields - NOM + Prénom + DDN + IPP + Service + N° séjour */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">Urgence<span className="text-primary">OS</span></span>
            </div>
            <div className="h-4 w-px bg-border" />
            <h2 className="text-lg font-bold">{nom.toUpperCase()} {prenom}</h2>
            <span className="text-muted-foreground text-sm">
              {age} ans · {sexe}{poids ? ` · ${poids} kg` : ''}
            </span>
            {ccmu && <CCMUBadge level={ccmu} />}
            {boxNumber && (
              <Badge variant="outline" className="text-xs font-medium">Box {boxNumber}</Badge>
            )}
          </div>

          {/* M1-01: Identifiers row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-mono">
              DDN: {new Date(dateNaissance).toLocaleDateString('fr-FR')}
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
              IPP: {ipp}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {service}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {numeroSejour}
            </Badge>
          </div>

          {motif && (
            <Badge variant="secondary" className="text-xs font-medium">{motif}</Badge>
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
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
