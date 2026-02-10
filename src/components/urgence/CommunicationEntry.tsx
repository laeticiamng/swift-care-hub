/**
 * M6-01 — Lab call entry (lab side): 4 fields max, IPP auto-complete, <30s
 * M6-02 — Quick clinician entry: button "+ Communication" 1 click
 * Types: call/info/oral prescription
 */

import { useState } from 'react';
import { Phone, MessageSquare, Pill, Send, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { CommunicationType, Communication } from '@/lib/sih-types';

interface CommunicationEntryProps {
  patientId: string;
  patientIpp: string;
  encounterId: string;
  authorId: string;
  authorName: string;
  onSubmit: (communication: Omit<Communication, 'id' | 'created_at'>) => void;
}

const COMM_TYPES: { value: CommunicationType; label: string; icon: React.ReactNode }[] = [
  { value: 'appel_labo', label: 'Appel labo', icon: <Phone className="h-4 w-4" /> },
  { value: 'info_orale', label: 'Information orale', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'prescription_orale', label: 'Prescription orale', icon: <Pill className="h-4 w-4" /> },
  { value: 'appel_service', label: 'Appel inter-service', icon: <Phone className="h-4 w-4" /> },
];

export function CommunicationEntryButton(props: CommunicationEntryProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] gap-2"
      >
        <Plus className="h-4 w-4" />
        Communication
      </Button>

      {open && (
        <CommunicationDialog
          {...props}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface CommunicationDialogProps extends CommunicationEntryProps {
  onClose: () => void;
}

function CommunicationDialog({
  patientId, patientIpp, encounterId, authorId, authorName, onSubmit, onClose,
}: CommunicationDialogProps) {
  const [type, setType] = useState<CommunicationType>('appel_labo');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [labResultValue, setLabResultValue] = useState('');
  const [labInterlocutor, setLabInterlocutor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    setSubmitting(true);

    const communication: Omit<Communication, 'id' | 'created_at'> = {
      encounter_id: encounterId,
      patient_id: patientId,
      patient_ipp: patientIpp,
      type,
      content: content.trim(),
      source: source.trim() || authorName,
      author_id: authorId,
      author_name: authorName,
      status: 'saisi',
      lab_result_value: type === 'appel_labo' ? labResultValue.trim() : undefined,
      lab_interlocutor: type === 'appel_labo' ? labInterlocutor.trim() : undefined,
    };

    onSubmit(communication);
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Nouvelle communication
          </DialogTitle>
          <DialogDescription>
            Patient IPP: <strong>{patientIpp}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Communication type selector */}
          <div className="grid grid-cols-2 gap-2">
            {COMM_TYPES.map(ct => (
              <Button
                key={ct.value}
                variant={type === ct.value ? 'default' : 'outline'}
                className="min-h-[44px] gap-2 text-xs"
                onClick={() => setType(ct.value)}
              >
                {ct.icon}
                {ct.label}
              </Button>
            ))}
          </div>

          {/* M6-01: Lab call — 4 fields max */}
          {type === 'appel_labo' && (
            <>
              <div className="space-y-2">
                <Label>Resultat communique</Label>
                <Input
                  placeholder="Ex: K+ = 2.9 mmol/L"
                  value={labResultValue}
                  onChange={(e) => setLabResultValue(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Interlocuteur au labo</Label>
                <Input
                  placeholder="Nom du biologiste/technicien"
                  value={labInterlocutor}
                  onChange={(e) => setLabInterlocutor(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
            </>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label>
              {type === 'prescription_orale' ? 'Prescription (medicament + dose + voie)' : 'Contenu'}
            </Label>
            <Textarea
              placeholder={
                type === 'appel_labo'
                  ? 'Resume de l\'appel...'
                  : type === 'prescription_orale'
                  ? 'Ex: KCl 1g IV sur 1h — base: kaliemie a 2.9'
                  : 'Contenu de la communication...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>Source / Emetteur</Label>
            <Input
              placeholder={authorName}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="min-h-[44px] bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
