import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface DischargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encounterId: string;
  patientId: string;
  userId: string;
  onDone: () => void;
  motif?: string | null;
  prescriptions?: Array<Pick<Tables<'prescriptions'>, 'status' | 'medication_name' | 'dosage' | 'route' | 'frequency'>>;
  diagnostics?: Array<Pick<Tables<'timeline_items'>, 'content'>>;
  vitals?: Array<Pick<Tables<'vitals'>, 'fc' | 'pa_systolique' | 'pa_diastolique' | 'spo2' | 'temperature' | 'frequence_respiratoire' | 'gcs' | 'eva_douleur'>>;
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
  const [gemsa, setGemsa] = useState(GEMSA_MAP.domicile);
  const [summary, setSummary] = useState('');
  const [ordonnance, setOrdonnance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOrientationChange = (value: string) => {
    setOrientation(value);
    setGemsa(GEMSA_MAP[value] || '');
  };

  const generateCRH = () => {
    const sections: string[] = [];
    sections.push('=== COMPTE-RENDU DE PASSAGE AUX URGENCES ===');
    sections.push('');

    if (motif) {
      sections.push(`MOTIF DE CONSULTATION : ${motif}`);
      sections.push('');
    }

    if (diagnostics.length > 0) {
      sections.push('DIAGNOSTIC :');
      diagnostics.forEach((diagnostic) => sections.push(`  - ${diagnostic.content}`));
      sections.push('');
    }

    if (vitals.length > 0) {
      const first = vitals[0];
      const last = vitals[vitals.length - 1];
      const formatVitals = (vital: DischargeDialogProps['vitals'][number]) => {
        const values: string[] = [];

        if (vital.fc) values.push(`FC ${vital.fc} bpm`);
        if (vital.pa_systolique) values.push(`PA ${vital.pa_systolique}/${vital.pa_diastolique || '?'} mmHg`);
        if (vital.spo2) values.push(`SpO2 ${vital.spo2}%`);
        if (vital.temperature) values.push(`T ${vital.temperature}°C`);
        if (vital.frequence_respiratoire) values.push(`FR ${vital.frequence_respiratoire}/min`);
        if (vital.gcs) values.push(`GCS ${vital.gcs}/15`);
        if (vital.eva_douleur != null) values.push(`EVA ${vital.eva_douleur}/10`);

        return values.join(', ');
      };

      sections.push('CONSTANTES :');
      if (vitals.length > 1) {
        sections.push(`  Initiales : ${formatVitals(first)}`);
        sections.push(`  Sortie    : ${formatVitals(last)}`);
      } else {
        sections.push(`  ${formatVitals(last)}`);
      }
      sections.push('');
    }

    const activeOrCompletedPrescriptions = prescriptions.filter((rx) => rx.status === 'active' || rx.status === 'completed');
    if (activeOrCompletedPrescriptions.length > 0) {
      sections.push('TRAITEMENTS ADMINISTRES :');
      activeOrCompletedPrescriptions.forEach((rx) => {
        sections.push(`  - ${rx.medication_name} ${rx.dosage} ${rx.route}${rx.frequency ? ` (${rx.frequency})` : ''}`);
      });
      sections.push('');
    }

    sections.push(`ORIENTATION : ${ORIENTATIONS.find((o) => o.value === orientation)?.label || orientation}`);
    if (ccmuSortie) sections.push(`CCMU de sortie : ${ccmuSortie}`);
    if (gemsa) sections.push(`GEMSA : ${gemsa}`);

    setSummary(sections.join('\n'));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const updateData: TablesUpdate<'encounters'> = {
      status: 'finished',
      discharge_time: new Date().toISOString(),
      orientation,
    };

    if (ccmuSortie) updateData.ccmu = Number.parseInt(ccmuSortie, 10);
    if (gemsa) updateData.gemsa = Number.parseInt(gemsa, 10);

    const { error } = await supabase.from('encounters').update(updateData).eq('id', encounterId);
    if (error) {
      toast.error('Erreur lors de la sortie');
      setSubmitting(false);
      return;
    }

    if (summary.trim()) {
      const summaryTimelineItem: TablesInsert<'timeline_items'> = {
        patient_id: patientId,
        item_type: 'crh',
        content: summary.trim(),
        source_author: userId,
        source_date: new Date().toISOString().split('T')[0],
        source_document: `Sortie — ${ORIENTATIONS.find((o) => o.value === orientation)?.label || orientation}`,
      };
      await supabase.from('timeline_items').insert(summaryTimelineItem);
    }

    if (ordonnance.trim()) {
      const ordonnanceTimelineItem: TablesInsert<'timeline_items'> = {
        patient_id: patientId,
        item_type: 'crh',
        content: `Ordonnance de sortie :\n${ordonnance.trim()}`,
        source_author: userId,
        source_date: new Date().toISOString().split('T')[0],
        source_document: `Ordonnance — ${ORIENTATIONS.find((o) => o.value === orientation)?.label || orientation}`,
      };
      await supabase.from('timeline_items').insert(ordonnanceTimelineItem);
    }

    const auditLogEntry: TablesInsert<'audit_logs'> = {
      user_id: userId,
      action: 'patient_discharge',
      resource_type: 'encounter',
      resource_id: encounterId,
      details: { orientation, has_summary: !!summary.trim(), has_ordonnance: !!ordonnance.trim() },
    };
    await supabase.from('audit_logs').insert(auditLogEntry);

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
            <div className="flex items-center justify-between mb-1">
              <Label>Ordonnance de sortie (optionnel)</Label>
              {prescriptions.filter(rx => rx.status === 'active').length > 0 && (
                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => {
                  const activeRx = prescriptions.filter(rx => rx.status === 'active');
                  const lines = activeRx.map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route}${rx.frequency ? ` — ${rx.frequency}` : ''}`);
                  setOrdonnance(lines.join('\n'));
                }}>
                  Pre-remplir
                </Button>
              )}
            </div>
            <Textarea value={ordonnance} onChange={e => setOrdonnance(e.target.value)} placeholder="Paracetamol 1g x3/j pendant 5 jours..." className="mt-1" rows={3} />
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
