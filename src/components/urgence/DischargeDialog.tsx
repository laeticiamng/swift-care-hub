import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DischargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encounterId: string;
  onDone: () => void;
}

const ORIENTATIONS = [
  { value: 'domicile', label: 'Retour à domicile' },
  { value: 'hospitalisation', label: 'Hospitalisation' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'uhcd', label: 'UHCD' },
  { value: 'deces', label: 'Décès' },
  { value: 'fugue', label: 'Fugue / Sortie contre avis' },
];

export function DischargeDialog({ open, onOpenChange, encounterId, onDone }: DischargeDialogProps) {
  const [orientation, setOrientation] = useState('domicile');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from('encounters').update({
      status: 'finished' as any,
      discharge_time: new Date().toISOString(),
      orientation,
    }).eq('id', encounterId);

    if (error) {
      toast.error('Erreur lors de la sortie');
    } else {
      toast.success('Patient sorti ✓');
      onDone();
    }
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Préparer la sortie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Orientation</Label>
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORIENTATIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Résumé de sortie</Label>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Synthèse clinique, consignes de sortie..." className="mt-1" rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'En cours...' : 'Valider la sortie'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
