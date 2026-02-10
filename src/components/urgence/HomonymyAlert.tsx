/**
 * M1-02 — Homonymy Alert Dialog
 * Red blinking banner + mandatory confirmation popup
 * Shows IPP + DDN + Service + Photo for each homonyme
 */

import { AlertTriangle, ShieldAlert, User, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PatientIdentity, HomonymyAlert } from '@/lib/sih-types';

interface HomonymyAlertDialogProps {
  alerts: HomonymyAlert[];
  currentPatient: PatientIdentity;
  onConfirm: () => void;
  onCancel: () => void;
}

export function HomonymyAlertDialog({ alerts, currentPatient, onConfirm, onCancel }: HomonymyAlertDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-lg border-red-500 border-2">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
            <DialogTitle className="text-red-600 text-lg">ALERTE HOMONYMIE</DialogTitle>
          </div>
          <DialogDescription className="text-red-600/80 font-medium">
            {alerts.length} patient(s) avec le meme nom et prenom detecte(s). Verification d'identite obligatoire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Current patient */}
          <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Patient actuel</span>
            </div>
            <PatientCard patient={currentPatient} />
          </div>

          {/* Homonyme patients */}
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-red-600">Homonyme detecte</span>
              </div>
              <PatientCard patient={alert.patient_b} />
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            Confirmez que vous accedez bien au dossier de <strong>{currentPatient.nom.toUpperCase()} {currentPatient.prenom}</strong>,
            ne(e) le <strong>{new Date(currentPatient.date_naissance).toLocaleDateString('fr-FR')}</strong>,
            IPP <strong>{currentPatient.ipp}</strong>.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="min-h-[44px]">
            Annuler — Revenir
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]">
            <CheckCircle className="h-4 w-4 mr-2" />
            Je confirme l'identite du patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PatientCard({ patient }: { patient: PatientIdentity }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        {patient.photo_url ? (
          <img src={patient.photo_url} alt="" className="h-12 w-12 rounded-full object-cover border" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm">{patient.nom.toUpperCase()} {patient.prenom}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs font-mono">
            DDN: {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}
          </Badge>
          <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
            IPP: {patient.ipp}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {patient.service}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            {patient.numero_sejour}
          </Badge>
        </div>
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-500">{patient.allergies.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
