/**
 * M2-03 / M4-02 — Oral Prescription Quick Entry
 * Quick entry + tag "Pending validation" orange
 * Alert if not validated after X min
 * Convertible to written prescription in 1 click
 * M4-05 — Tag "base: oral transmission" for a posteriori audit
 */

import { useState } from 'react';
import { Pill, Clock, CheckCircle, AlertTriangle, Mic } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SecurePrescription } from '@/lib/sih-types';

interface OralPrescriptionEntryProps {
  patientId: string;
  patientIpp: string;
  encounterId: string;
  prescriberId: string;
  prescriberName: string;
  onSubmit: (prescription: Omit<SecurePrescription, 'id' | 'created_at'>) => void;
}

export function OralPrescriptionButton(props: OralPrescriptionEntryProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] gap-2"
      >
        <Mic className="h-4 w-4" />
        Prescription orale
      </Button>

      {open && <OralPrescriptionDialog {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

interface OralPrescriptionDialogProps extends OralPrescriptionEntryProps {
  onClose: () => void;
}

function OralPrescriptionDialog({
  patientId, patientIpp, encounterId, prescriberId, prescriberName, onSubmit, onClose,
}: OralPrescriptionDialogProps) {
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState('IV');
  const [frequency, setFrequency] = useState('');
  const [decisionBasis, setDecisionBasis] = useState('');
  const [linkedAnalyte, setLinkedAnalyte] = useState('');
  const [linkedValue, setLinkedValue] = useState('');
  const [recheckType, setRecheckType] = useState<'bio' | 'ecg' | 'bio_ecg' | ''>('');

  const handleSubmit = () => {
    if (!medication.trim() || !dosage.trim()) return;

    const prescription: Omit<SecurePrescription, 'id' | 'created_at'> = {
      encounter_id: encounterId,
      patient_id: patientId,
      patient_ipp: patientIpp,
      medication_name: medication.trim(),
      dosage: dosage.trim(),
      route,
      frequency: frequency.trim() || undefined,
      prescriber_id: prescriberId,
      prescriber_name: prescriberName,
      origin: 'orale',
      oral_decision_basis: decisionBasis.trim() || undefined,
      oral_validated: false,
      linked_result_analyte: linkedAnalyte.trim() || undefined,
      linked_result_value: linkedValue.trim() || undefined,
      recheck_scheduled: !!recheckType,
      recheck_type: recheckType || undefined,
      base_transmission_orale: true,
      ipp_verified_before_prescription: true,
      status: 'oral_pending',
    };

    onSubmit(prescription);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Mic className="h-5 w-5" />
            Prescription orale rapide
          </DialogTitle>
          <DialogDescription>
            Sera taguee "oral — en attente validation". Convertible en 1 clic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
            <Clock className="h-3 w-3 mr-1" />
            Tag: oral — en attente validation
          </Badge>

          <div className="space-y-2">
            <Label>Medicament *</Label>
            <Input
              placeholder="Ex: Chlorure de potassium (KCl)"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dose *</Label>
              <Input
                placeholder="Ex: 1g"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Voie</Label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="PO">PO</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="IM">IM</SelectItem>
                  <SelectItem value="INH">INH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequence</Label>
            <Input
              placeholder="Ex: Sur 1h, en 1 fois"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Base de la decision / Transmission orale</Label>
            <Textarea
              placeholder="Ex: Appel labo — kaliemie a 2.9 mmol/L"
              value={decisionBasis}
              onChange={(e) => setDecisionBasis(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* M4-03: Link to lab result */}
          <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Lien resultat biologique (optionnel)</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Analyte (ex: K+)" value={linkedAnalyte} onChange={(e) => setLinkedAnalyte(e.target.value)} className="min-h-[44px] text-sm" />
              <Input placeholder="Valeur (ex: 2.9)" value={linkedValue} onChange={(e) => setLinkedValue(e.target.value)} className="min-h-[44px] text-sm" />
            </div>
          </div>

          {/* M4-04: Mandatory recheck */}
          <div className="space-y-2">
            <Label>Recontrole obligatoire</Label>
            <div className="flex gap-2">
              {[
                { value: 'bio', label: 'Bio' },
                { value: 'ecg', label: 'ECG' },
                { value: 'bio_ecg', label: 'Bio + ECG' },
              ].map(opt => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={recheckType === opt.value ? 'default' : 'outline'}
                  className="min-h-[44px] flex-1"
                  onClick={() => setRecheckType(recheckType === opt.value ? '' : opt.value as typeof recheckType)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!medication.trim() || !dosage.trim()}
            className="min-h-[44px] bg-orange-500 hover:bg-orange-600"
          >
            <Pill className="h-4 w-4 mr-2" />
            Enregistrer (oral)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Card for displaying an oral prescription in the timeline */
export function OralPrescriptionCard({
  prescription, onValidate,
}: { prescription: SecurePrescription; onValidate?: (id: string) => void }) {
  const isPending = !prescription.oral_validated;

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      isPending ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    )}>
      <div className="flex items-center gap-2 mb-2">
        {isPending ? (
          <Badge className="bg-orange-500 text-white text-xs animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Oral — en attente validation
          </Badge>
        ) : (
          <Badge className="bg-green-600 text-white text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valide
          </Badge>
        )}
        {prescription.base_transmission_orale && (
          <Badge variant="outline" className="text-xs">Base: transmission orale</Badge>
        )}
      </div>

      <p className="text-sm font-medium">
        {prescription.medication_name} {prescription.dosage} {prescription.route}
        {prescription.frequency && ` — ${prescription.frequency}`}
      </p>

      {prescription.oral_decision_basis && (
        <p className="text-xs text-muted-foreground mt-1">
          Decision: {prescription.oral_decision_basis}
        </p>
      )}

      {prescription.linked_result_analyte && (
        <p className="text-xs text-muted-foreground">
          Lie a: {prescription.linked_result_analyte} = {prescription.linked_result_value}
        </p>
      )}

      {prescription.recheck_scheduled && (
        <div className="flex items-center gap-1 mt-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Recontrole programme: {prescription.recheck_type === 'bio_ecg' ? 'Bio + ECG' : prescription.recheck_type?.toUpperCase()}
          </span>
        </div>
      )}

      {isPending && onValidate && (
        <Button
          size="sm"
          className="mt-2 h-8 text-xs bg-orange-500 hover:bg-orange-600"
          onClick={() => onValidate(prescription.id)}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Valider (convertir en prescription ecrite)
        </Button>
      )}
    </div>
  );
}
