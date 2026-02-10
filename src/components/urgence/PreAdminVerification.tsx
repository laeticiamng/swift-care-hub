/**
 * M5-01 — Pre-administration re-verification
 * Display identity + lab result + prescription before validation
 * Button "confirm concordance"
 * M5-02 — Alert if lab result not found (blocking)
 * M5-03 — 5B concordance: bon Patient, Medicament, Dose, Voie, Moment + bracelet scan
 */

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Scan, User, Pill, FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { isElectrolyteMedication } from '@/lib/lab-alerts';
import type { AdministrationVerification } from '@/lib/sih-types';

interface PreAdminVerificationProps {
  open: boolean;
  patientNom: string;
  patientPrenom: string;
  patientDDN: string;
  patientIpp: string;
  medicationName: string;
  dosage: string;
  route: string;
  prescriberId: string;
  prescriberName: string;
  labResultAvailable: boolean;
  labResultValue?: string;
  labResultAnalyte?: string;
  onConfirm: (verification: Partial<AdministrationVerification>) => void;
  onCancel: () => void;
}

export function PreAdminVerification({
  open, patientNom, patientPrenom, patientDDN, patientIpp,
  medicationName, dosage, route, prescriberName,
  labResultAvailable, labResultValue, labResultAnalyte,
  onConfirm, onCancel,
}: PreAdminVerificationProps) {
  const [bonPatient, setBonPatient] = useState(false);
  const [bonMedicament, setBonMedicament] = useState(false);
  const [bonneDose, setBonneDose] = useState(false);
  const [bonneVoie, setBonneVoie] = useState(false);
  const [bonMoment, setBonMoment] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [resultConfirmed, setResultConfirmed] = useState(false);
  const [braceletScanned, setBraceletScanned] = useState(false);

  const electrolyteCheck = isElectrolyteMedication(medicationName);
  const all5BChecked = bonPatient && bonMedicament && bonneDose && bonneVoie && bonMoment;
  const canConfirm = all5BChecked && identityConfirmed && (labResultAvailable ? resultConfirmed : false);

  // M5-02: Blocking alert if no lab result
  if (open && !labResultAvailable && electrolyteCheck.isElectrolyte) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
        <DialogContent className="max-w-md border-red-500 border-2">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <DialogTitle className="text-red-600">ALERTE BLOQUANTE</DialogTitle>
            </div>
            <DialogDescription className="text-red-600 font-medium">
              Resultat biologique non retrouve pour cet electrolyte
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 space-y-3">
            <p className="text-sm font-bold text-red-600">
              Impossible d'administrer {medicationName} sans resultat biologique confirme.
            </p>
            <p className="text-xs text-red-600/80">
              Un resultat de {electrolyteCheck.type === 'K' ? 'kaliemie' : electrolyteCheck.type === 'Ca' ? 'calcemie' : 'natremie'} est requis
              avant l'administration de cet electrolyte.
            </p>
            <p className="text-xs text-red-600/80">
              M5-02 — Alerte resultat non retrouve (bloquante, non contournable)
            </p>
          </div>

          <DialogFooter>
            <Button onClick={onCancel} variant="outline" className="w-full min-h-[44px]">
              Retour — Verifier le resultat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Reverification pre-administration</DialogTitle>
          </div>
          <DialogDescription>
            Confirmez la concordance avant d'administrer le medicament
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient identity display */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">Identite patient</span>
            </div>
            <p className="text-sm">{patientNom.toUpperCase()} {patientPrenom}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs font-mono">DDN: {new Date(patientDDN).toLocaleDateString('fr-FR')}</Badge>
              <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">IPP: {patientIpp}</Badge>
            </div>
          </div>

          {/* Lab result display */}
          {labResultAvailable && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">Resultat biologique</span>
              </div>
              <p className="text-sm font-mono">{labResultAnalyte}: {labResultValue}</p>
            </div>
          )}

          {/* Prescription display */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-600">Prescription</span>
            </div>
            <p className="text-sm">{medicationName} — {dosage} — {route}</p>
            <p className="text-xs text-muted-foreground mt-1">Prescripteur: {prescriberName}</p>
          </div>

          {/* M5-04: Electrolyte pre-admin alert */}
          {electrolyteCheck.isElectrolyte && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-xs font-bold text-red-600">
                  ALERTE ELECTROLYTE ({electrolyteCheck.type}) — Verification renforcee
                </span>
              </div>
            </div>
          )}

          {/* 5B Concordance checklist */}
          <div className="space-y-3 p-3 rounded-lg border">
            <p className="text-sm font-bold">Concordance 5B</p>

            {[
              { id: 'bon-patient', label: 'Bon Patient', checked: bonPatient, onChange: setBonPatient },
              { id: 'bon-medicament', label: 'Bon Medicament', checked: bonMedicament, onChange: setBonMedicament },
              { id: 'bonne-dose', label: 'Bonne Dose', checked: bonneDose, onChange: setBonneDose },
              { id: 'bonne-voie', label: 'Bonne Voie', checked: bonneVoie, onChange: setBonneVoie },
              { id: 'bon-moment', label: 'Bon Moment', checked: bonMoment, onChange: setBonMoment },
            ].map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(v) => item.onChange(!!v)}
                  className="h-6 w-6"
                />
                <Label htmlFor={item.id} className="text-sm cursor-pointer">{item.label}</Label>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2 border-t">
              <Checkbox
                id="identity-confirmed"
                checked={identityConfirmed}
                onCheckedChange={(v) => setIdentityConfirmed(!!v)}
                className="h-6 w-6"
              />
              <Label htmlFor="identity-confirmed" className="text-sm cursor-pointer">
                Identite patient verifiee (bandeau + bracelet)
              </Label>
            </div>

            {labResultAvailable && (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="result-confirmed"
                  checked={resultConfirmed}
                  onCheckedChange={(v) => setResultConfirmed(!!v)}
                  className="h-6 w-6"
                />
                <Label htmlFor="result-confirmed" className="text-sm cursor-pointer">
                  Resultat biologique concordant
                </Label>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="bracelet-scanned"
                checked={braceletScanned}
                onCheckedChange={(v) => setBraceletScanned(!!v)}
                className="h-6 w-6"
              />
              <Label htmlFor="bracelet-scanned" className="text-sm cursor-pointer flex items-center gap-1">
                <Scan className="h-3.5 w-3.5" /> Bracelet scanne (optionnel)
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="min-h-[44px]">Annuler</Button>
          <Button
            onClick={() => onConfirm({
              bon_patient: bonPatient,
              bon_medicament: bonMedicament,
              bonne_dose: bonneDose,
              bonne_voie: bonneVoie,
              bon_moment: bonMoment,
              identity_confirmed: identityConfirmed,
              result_bio_confirmed: resultConfirmed,
              concordance_confirmed: all5BChecked,
              bracelet_scanned: braceletScanned,
              electrolyte_alert: electrolyteCheck.isElectrolyte,
              electrolyte_type: electrolyteCheck.type,
            })}
            disabled={!canConfirm}
            className={cn('min-h-[44px]', canConfirm ? 'bg-green-600 hover:bg-green-700' : '')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmer concordance — Administrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
