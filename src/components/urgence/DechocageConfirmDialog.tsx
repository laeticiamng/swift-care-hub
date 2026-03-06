import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DechocageConfirmDialogProps {
  open: boolean;
  patientName: string;
  onConfirm: (motif: string) => void;
  onCancel: () => void;
}

export function DechocageConfirmDialog({ open, patientName, onConfirm, onCancel }: DechocageConfirmDialogProps) {
  const [motif, setMotif] = useState('');
  const isValid = motif.trim().length >= 3;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(motif.trim());
      setMotif('');
    }
  };

  const handleCancel = () => {
    setMotif('');
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-medical-critical">
            <AlertTriangle className="h-5 w-5" />
            Transfert vers Déchocage
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Vous êtes sur le point de transférer <strong>{patientName}</strong> vers la zone <strong>Déchocage</strong> (zone critique).
            </p>
            <p className="text-xs text-muted-foreground">
              Cette action sera tracée dans le dossier patient. Un motif est obligatoire.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="dechocage-motif">Motif du transfert *</Label>
          <Textarea
            id="dechocage-motif"
            placeholder="Ex: Détresse respiratoire aiguë, ACR, polytraumatisme…"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="min-h-[80px]"
            autoFocus
          />
          {motif.length > 0 && !isValid && (
            <p className="text-xs text-destructive">Le motif doit contenir au moins 3 caractères.</p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className="bg-medical-critical hover:bg-medical-critical/90 text-white"
          >
            Confirmer le transfert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
