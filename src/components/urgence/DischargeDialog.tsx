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
  patientId: string;
  userId: string;
  onDone: () => void;
  motif?: string | null;
  prescriptions?: any[];
  diagnostics?: any[];
  vitals?: any[];
}

const GEMSA_MAP: Record<string, string> = {
  domicile: '1',
  hospitalisation: '4',
  uhcd: '3',
  transfert: '5',
  deces: '6',
  fugue: '2',
};

const ORIENTATIONS = [
  { value: 'domicile', label: 'Retour à domicile' },
  { value: 'hospitalisation', label: 'Hospitalisation' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'uhcd', label: 'UHCD' },
  { value: 'deces', label: 'Décès' },
  { value: 'fugue', label: 'Fugue / Sortie contre avis' },
];

export function DischargeDialog({ open, onOpenChange, encounterId, patientId, userId, onDone, motif, prescriptions = [], diagnostics = [], vitals = [] }: DischargeDialogProps) {
  const [orientation, setOrientation] = useState('domicile');
  const [ccmuSortie, setCcmuSortie] = useState('');
  const [gemsa, setGemsa] = useState(GEMSA_MAP['domicile'] || '');

  const handleOrientationChange = (value: string) => {
    setOrientation(value);
    setGemsa(GEMSA_MAP[value] || '');
  };

  const generateCRH = () => {
    const parts: string[] = [];
    if (motif) parts.push(`Motif : ${motif}`);
    if (diagnostics.length > 0) parts.push(`Diagnostic : ${diagnostics.map(d => d.content).join(', ')}`);
    if (prescriptions.length > 0) {
      const rxList = prescriptions.filter(rx => rx.status === 'active' || rx.status === 'completed').map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route}`);
      if (rxList.length > 0) parts.push(`Traitements : ${rxList.join(' ; ')}`);
    }
    if (vitals.length > 0) {
      const last = vitals[vitals.length - 1];
      const vParts = [];
      if (last.fc) vParts.push(`FC ${last.fc}`);
      if (last.pa_systolique) vParts.push(`PA ${last.pa_systolique}/${last.pa_diastolique || '?'}`);
      if (last.spo2) vParts.push(`SpO₂ ${last.spo2}%`);
      if (last.temperature) vParts.push(`T° ${last.temperature}°C`);
      if (vParts.length > 0) parts.push(`Dernières constantes : ${vParts.join(', ')}`);
    }
    parts.push(`Orientation : ${ORIENTATIONS.find(o => o.value === orientation)?.label || orientation}`);
    setSummary(parts.join('\n'));
  };
  const [summary, setSummary] = useState('');
  const [ordonnance, setOrdonnance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const updateData: any = {
      status: 'finished' as any,
      discharge_time: new Date().toISOString(),
      orientation,
    };
    if (ccmuSortie) updateData.ccmu = parseInt(ccmuSortie);
    if (gemsa) updateData.gemsa = parseInt(gemsa);
    const { error } = await supabase.from('encounters').update(updateData).eq('id', encounterId);

    if (error) {
      toast.error('Erreur lors de la sortie');
      setSubmitting(false);
      return;
    }

    // Save summary as CRH in timeline_items
    if (summary.trim()) {
      await supabase.from('timeline_items').insert({
        patient_id: patientId,
        item_type: 'crh' as any,
        content: summary.trim(),
        source_author: userId,
        source_date: new Date().toISOString().split('T')[0],
        source_document: `Sortie — ${ORIENTATIONS.find(o => o.value === orientation)?.label || orientation}`,
      });
    }

    // Save ordonnance in timeline_items
    if (ordonnance.trim()) {
      await supabase.from('timeline_items').insert({
        patient_id: patientId,
        item_type: 'crh' as any,
        content: `Ordonnance de sortie :\n${ordonnance.trim()}`,
        source_author: userId,
        source_date: new Date().toISOString().split('T')[0],
        source_document: `Ordonnance — ${ORIENTATIONS.find(o => o.value === orientation)?.label || orientation}`,
      });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'patient_discharge',
      resource_type: 'encounter',
      resource_id: encounterId,
      details: { orientation, has_summary: !!summary.trim(), has_ordonnance: !!ordonnance.trim() },
    });

    toast.success('Patient sorti');
    onDone();
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Préparer la sortie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Orientation</Label>
            <Select value={orientation} onValueChange={handleOrientationChange}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORIENTATIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CCMU de sortie</Label>
              <Select value={ccmuSortie} onValueChange={setCcmuSortie}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>CCMU {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>GEMSA</Label>
              <Select value={gemsa} onValueChange={setGemsa}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>GEMSA {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Résumé de sortie</Label>
              <Button type="button" variant="outline" size="sm" onClick={generateCRH} className="text-xs h-7">
                ✨ Générer CRH
              </Button>
            </div>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Synthèse clinique, consignes de sortie..." className="mt-1" rows={4} />
          </div>
          <div>
            <Label>Ordonnance de sortie (optionnel)</Label>
            <Textarea value={ordonnance} onChange={e => setOrdonnance(e.target.value)} placeholder="Paracétamol 1g x3/j pendant 5 jours..." className="mt-1" rows={3} />
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
