import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PrescriptionType,
  PrescriptionMetadata,
  EXTENDED_MED_ROUTES,
  O2_DEVICES,
  EXAM_BIO_CATEGORIES,
  EXAM_IMAGERIE_CATEGORIES,
  AVIS_SPECIALTIES,
  encodePrescriptionMeta,
} from '@/lib/prescription-types';
import { PrescriptionTypeSelector } from './PrescriptionTypeSelector';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PrescriptionFormProps {
  onSubmit: (data: {
    medication_name: string;
    dosage: string;
    route: string;
    frequency: string;
    priority: string;
    notes: string;
  }) => void;
  onCancel: () => void;
  motif?: string;
}

// ---------------------------------------------------------------------------
// Internal form state
// ---------------------------------------------------------------------------
interface FormState {
  type: PrescriptionType;
  priority: 'routine' | 'urgent' | 'stat';

  // Medicament
  medication_name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;

  // Perfusion
  perfusion_solute: string;
  perfusion_volume: string;
  perfusion_debit: string;
  perfusion_duration: string;

  // Titration
  titration_route: string;
  titration_dose_init: string;
  titration_step: string;
  titration_dose_max: string;
  titration_interval: string;
  titration_target: string;

  // Conditionnel
  cond_dose: string;
  cond_route: string;
  cond_trigger: string;
  cond_max_doses: string;
  cond_interval: string;

  // Oxygene
  o2_device: string;
  o2_debit: string;
  o2_target: string;

  // Exam bio
  exam_bio_items: string[];

  // Exam imagerie
  exam_imagerie_item: string;
  exam_imagerie_indication: string;

  // Surveillance
  surveillance_type: string;
  surveillance_frequency: string;

  // Avis specialise
  avis_specialty: string;
  avis_motif: string;
  avis_urgency: 'urgent' | 'rapide' | 'programme';

  // Regime
  regime_details: string;

  // Mobilisation
  mobilisation_details: string;

  // Dispositif
  dispositif_name: string;
  dispositif_details: string;

  // Sortie
  sortie_medications: Array<{ name: string; dose: string; route: string; frequency: string; duration: string }>;
  sortie_consignes: string;
  sortie_arret_travail: string;

  // General notes
  text_notes: string;
}

const INITIAL_STATE: FormState = {
  type: 'medicament',
  priority: 'routine',
  medication_name: '',
  dosage: '',
  route: 'IV',
  frequency: '',
  duration: '',
  perfusion_solute: 'NaCl 0.9%',
  perfusion_volume: '',
  perfusion_debit: '',
  perfusion_duration: '',
  titration_route: 'IV',
  titration_dose_init: '',
  titration_step: '',
  titration_dose_max: '',
  titration_interval: '',
  titration_target: '',
  cond_dose: '',
  cond_route: 'PO',
  cond_trigger: '',
  cond_max_doses: '',
  cond_interval: '',
  o2_device: 'Lunettes nasales',
  o2_debit: '',
  o2_target: 'SpO2 > 94%',
  exam_bio_items: [],
  exam_imagerie_item: '',
  exam_imagerie_indication: '',
  surveillance_type: '',
  surveillance_frequency: 'horaire',
  avis_specialty: '',
  avis_motif: '',
  avis_urgency: 'urgent',
  regime_details: '',
  mobilisation_details: '',
  dispositif_name: '',
  dispositif_details: '',
  sortie_medications: [],
  sortie_consignes: '',
  sortie_arret_travail: '',
  text_notes: '',
};

// ---------------------------------------------------------------------------
// Perfusion solutes
// ---------------------------------------------------------------------------
const PERFUSION_SOLUTES = ['NaCl 0.9%', 'Ringer Lactate', 'G5%', 'G10%'];

// ---------------------------------------------------------------------------
// Surveillance frequencies
// ---------------------------------------------------------------------------
const SURVEILLANCE_FREQUENCIES = [
  { value: 'continue', label: 'Continue' },
  { value: 'horaire', label: 'Horaire' },
  { value: 'q30min', label: 'Toutes les 30 min' },
  { value: 'q2h', label: 'Toutes les 2h' },
  { value: 'q4h', label: 'Toutes les 4h' },
];

// ---------------------------------------------------------------------------
// SpO2 targets
// ---------------------------------------------------------------------------
const SPO2_TARGETS = [
  'SpO2 > 88%',
  'SpO2 > 90%',
  'SpO2 > 92%',
  'SpO2 > 94%',
  'SpO2 > 96%',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PrescriptionForm({ onSubmit, onCancel, motif }: PrescriptionFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_STATE,
    avis_motif: motif || '',
  }));

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle a bio exam item
  const toggleBioItem = useCallback((item: string) => {
    setForm((prev) => {
      const items = prev.exam_bio_items.includes(item)
        ? prev.exam_bio_items.filter((i) => i !== item)
        : [...prev.exam_bio_items, item];
      return { ...prev, exam_bio_items: items };
    });
  }, []);

  // Add a sortie medication line
  const addSortieMed = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      sortie_medications: [
        ...prev.sortie_medications,
        { name: '', dose: '', route: 'PO', frequency: '', duration: '' },
      ],
    }));
  }, []);

  // Update a sortie medication line field
  const updateSortieMed = useCallback(
    (index: number, field: keyof FormState['sortie_medications'][number], value: string) => {
      setForm((prev) => {
        const meds = [...prev.sortie_medications];
        meds[index] = { ...meds[index], [field]: value };
        return { ...prev, sortie_medications: meds };
      });
    },
    [],
  );

  // Remove a sortie medication line
  const removeSortieMed = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      sortie_medications: prev.sortie_medications.filter((_, i) => i !== index),
    }));
  }, []);

  // -----------------------------------------------------------------------
  // Build submission payload
  // -----------------------------------------------------------------------
  const handleSubmit = () => {
    const meta: PrescriptionMetadata = { type: form.type };
    let medication_name = '';
    let dosage = '';
    let route = '';
    let frequency = '';

    switch (form.type) {
      case 'medicament':
        medication_name = form.medication_name;
        dosage = form.dosage;
        route = form.route;
        frequency = form.frequency;
        if (form.duration) meta.duration = form.duration;
        break;

      case 'perfusion':
        medication_name = form.perfusion_solute;
        dosage = form.perfusion_volume ? `${form.perfusion_volume}mL` : '';
        route = 'IV';
        frequency = form.perfusion_debit ? `${form.perfusion_debit} mL/h` : '';
        meta.debit = form.perfusion_debit ? `${form.perfusion_debit} mL/h` : undefined;
        meta.duration = form.perfusion_duration || undefined;
        meta.volume_total = form.perfusion_volume ? parseInt(form.perfusion_volume, 10) : undefined;
        break;

      case 'titration':
        medication_name = form.medication_name;
        dosage = form.titration_dose_init ? `${form.titration_dose_init}mg init` : '';
        route = form.titration_route;
        frequency = 'Titration';
        meta.titration_dose_init = form.titration_dose_init ? parseFloat(form.titration_dose_init) : undefined;
        meta.titration_step = form.titration_step ? parseFloat(form.titration_step) : undefined;
        meta.titration_dose_max = form.titration_dose_max ? parseFloat(form.titration_dose_max) : undefined;
        meta.titration_interval = form.titration_interval || undefined;
        meta.titration_target = form.titration_target || undefined;
        break;

      case 'conditionnel':
        medication_name = form.medication_name;
        dosage = form.cond_dose;
        route = form.cond_route;
        frequency = form.cond_trigger ? `si ${form.cond_trigger}` : 'si besoin';
        meta.condition_trigger = form.cond_trigger || undefined;
        meta.condition_max_doses = form.cond_max_doses ? parseInt(form.cond_max_doses, 10) : undefined;
        meta.condition_interval = form.cond_interval || undefined;
        break;

      case 'oxygene':
        medication_name = `O2 ${form.o2_device}`;
        dosage = form.o2_debit ? `${form.o2_debit}L/min` : '';
        route = 'INH';
        frequency = 'Continu';
        meta.o2_device = form.o2_device;
        meta.o2_debit = form.o2_debit ? `${form.o2_debit}L/min` : undefined;
        meta.o2_target = form.o2_target || undefined;
        break;

      case 'exam_bio':
        medication_name = 'Bio urgente';
        dosage = '';
        route = '';
        frequency = '';
        meta.exam_list = form.exam_bio_items;
        meta.exam_urgency = form.priority === 'routine' ? 'normal' : 'urgent';
        break;

      case 'exam_imagerie':
        medication_name = form.exam_imagerie_item || 'Imagerie';
        dosage = '';
        route = '';
        frequency = '';
        meta.exam_site = form.exam_imagerie_item || undefined;
        meta.exam_indication = form.exam_imagerie_indication || undefined;
        meta.exam_urgency = form.priority === 'routine' ? 'normal' : 'urgent';
        break;

      case 'exam_ecg':
        medication_name = 'ECG 12 derivations';
        dosage = '';
        route = '';
        frequency = '';
        meta.exam_urgency = form.priority === 'routine' ? 'normal' : 'urgent';
        break;

      case 'exam_autre':
        medication_name = form.medication_name || 'Examen';
        dosage = '';
        route = '';
        frequency = '';
        meta.exam_indication = form.text_notes || undefined;
        break;

      case 'surveillance':
        medication_name = form.surveillance_type || 'Surveillance';
        dosage = '';
        route = '';
        frequency = form.surveillance_frequency;
        meta.surveillance_type = form.surveillance_type || undefined;
        meta.surveillance_frequency = form.surveillance_frequency || undefined;
        break;

      case 'avis_specialise':
        medication_name = `Avis ${form.avis_specialty}`;
        dosage = '';
        route = '';
        frequency = '';
        meta.avis_speciality = form.avis_specialty || undefined;
        meta.avis_motif = form.avis_motif || undefined;
        meta.avis_urgency = form.avis_urgency;
        break;

      case 'regime':
        medication_name = form.regime_details || 'Regime';
        dosage = '';
        route = '';
        frequency = '';
        meta.regime_details = form.regime_details || undefined;
        break;

      case 'mobilisation':
        medication_name = form.mobilisation_details || 'Mobilisation';
        dosage = '';
        route = '';
        frequency = '';
        meta.mobilisation_details = form.mobilisation_details || undefined;
        break;

      case 'dispositif':
        medication_name = form.dispositif_name || 'Dispositif medical';
        dosage = '';
        route = '';
        frequency = '';
        meta.device_name = form.dispositif_name || undefined;
        meta.device_details = form.dispositif_details || undefined;
        break;

      case 'sortie':
        medication_name = 'Prescription de sortie';
        dosage = '';
        route = '';
        frequency = '';
        meta.sortie_medications = form.sortie_medications.length > 0 ? form.sortie_medications : undefined;
        meta.sortie_consignes = form.sortie_consignes || undefined;
        meta.sortie_arret_travail = form.sortie_arret_travail
          ? parseInt(form.sortie_arret_travail, 10)
          : undefined;
        break;
    }

    if (form.text_notes && form.type !== 'exam_autre') {
      meta.text_notes = form.text_notes;
    }

    onSubmit({
      medication_name,
      dosage,
      route,
      frequency,
      priority: form.priority,
      notes: encodePrescriptionMeta(meta),
    });
  };

  // -----------------------------------------------------------------------
  // Render helpers for each type
  // -----------------------------------------------------------------------

  const renderMedicamentFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Nom du medicament</Label>
        <Input
          value={form.medication_name}
          onChange={(e) => update('medication_name', e.target.value)}
          placeholder="ex: Paracetamol"
          className="mt-1"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Posologie</Label>
          <Input
            value={form.dosage}
            onChange={(e) => update('dosage', e.target.value)}
            placeholder="ex: 1g"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Voie</Label>
          <Select value={form.route} onValueChange={(v) => update('route', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXTENDED_MED_ROUTES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Frequence</Label>
          <Input
            value={form.frequency}
            onChange={(e) => update('frequency', e.target.value)}
            placeholder="ex: q6h, q8h, 1 dose"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Duree</Label>
          <Input
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
            placeholder="ex: 5 jours"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderPerfusionFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Solute</Label>
        <Select value={form.perfusion_solute} onValueChange={(v) => update('perfusion_solute', v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERFUSION_SOLUTES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Volume (mL)</Label>
          <Input
            type="number"
            value={form.perfusion_volume}
            onChange={(e) => update('perfusion_volume', e.target.value)}
            placeholder="500"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Debit (mL/h)</Label>
          <Input
            type="number"
            value={form.perfusion_debit}
            onChange={(e) => update('perfusion_debit', e.target.value)}
            placeholder="125"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Duree</Label>
          <Input
            value={form.perfusion_duration}
            onChange={(e) => update('perfusion_duration', e.target.value)}
            placeholder="ex: 4h, Bolus"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderTitrationFields = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Medicament</Label>
          <Input
            value={form.medication_name}
            onChange={(e) => update('medication_name', e.target.value)}
            placeholder="ex: Morphine"
            className="mt-1"
            autoFocus
          />
        </div>
        <div>
          <Label>Voie</Label>
          <Select value={form.titration_route} onValueChange={(v) => update('titration_route', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXTENDED_MED_ROUTES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Dose initiale (mg)</Label>
          <Input
            type="number"
            value={form.titration_dose_init}
            onChange={(e) => update('titration_dose_init', e.target.value)}
            placeholder="2"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Palier (mg)</Label>
          <Input
            type="number"
            value={form.titration_step}
            onChange={(e) => update('titration_step', e.target.value)}
            placeholder="2"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Dose max (mg)</Label>
          <Input
            type="number"
            value={form.titration_dose_max}
            onChange={(e) => update('titration_dose_max', e.target.value)}
            placeholder="10"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Intervalle</Label>
          <Input
            value={form.titration_interval}
            onChange={(e) => update('titration_interval', e.target.value)}
            placeholder="ex: 5 min"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Cible</Label>
          <Input
            value={form.titration_target}
            onChange={(e) => update('titration_target', e.target.value)}
            placeholder="ex: EVA < 4"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderConditionnelFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Medicament</Label>
        <Input
          value={form.medication_name}
          onChange={(e) => update('medication_name', e.target.value)}
          placeholder="ex: Paracetamol"
          className="mt-1"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Dose</Label>
          <Input
            value={form.cond_dose}
            onChange={(e) => update('cond_dose', e.target.value)}
            placeholder="ex: 1g"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Voie</Label>
          <Select value={form.cond_route} onValueChange={(v) => update('cond_route', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXTENDED_MED_ROUTES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Condition de declenchement</Label>
        <Input
          value={form.cond_trigger}
          onChange={(e) => update('cond_trigger', e.target.value)}
          placeholder="ex: EVA > 6, T > 38.5, PAS < 90"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Max doses</Label>
          <Input
            type="number"
            value={form.cond_max_doses}
            onChange={(e) => update('cond_max_doses', e.target.value)}
            placeholder="ex: 4"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Intervalle min</Label>
          <Input
            value={form.cond_interval}
            onChange={(e) => update('cond_interval', e.target.value)}
            placeholder="ex: 6h"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderOxygeneFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Dispositif</Label>
        <Select value={form.o2_device} onValueChange={(v) => update('o2_device', v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {O2_DEVICES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Debit (L/min)</Label>
          <Input
            type="number"
            value={form.o2_debit}
            onChange={(e) => update('o2_debit', e.target.value)}
            placeholder="ex: 3"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Cible SpO2</Label>
          <Select value={form.o2_target} onValueChange={(v) => update('o2_target', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPO2_TARGETS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderExamBioFields = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Examens biologiques</Label>
      {form.exam_bio_items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {form.exam_bio_items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleBioItem(item)}
            >
              {item} &times;
            </Badge>
          ))}
        </div>
      )}
      <div className="max-h-60 overflow-y-auto rounded-md border p-3 space-y-4">
        {EXAM_BIO_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {cat.label}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {cat.items.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={form.exam_bio_items.includes(item)}
                    onCheckedChange={() => toggleBioItem(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExamImagerieFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Type d'imagerie</Label>
        <Select
          value={form.exam_imagerie_item}
          onValueChange={(v) => update('exam_imagerie_item', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choisir un examen..." />
          </SelectTrigger>
          <SelectContent>
            {EXAM_IMAGERIE_CATEGORIES.map((cat) => (
              <SelectGroup key={cat.label}>
                <SelectLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {cat.label}
                </SelectLabel>
                {cat.items.map((item) => {
                  const fullLabel = `${cat.label === 'Radiographie' ? 'Radio' : cat.label === 'Echographie' ? 'Echo' : cat.label} ${item}`;
                  return (
                    <SelectItem key={fullLabel} value={fullLabel}>
                      {item}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Indication clinique</Label>
        <Textarea
          value={form.exam_imagerie_indication}
          onChange={(e) => update('exam_imagerie_indication', e.target.value)}
          placeholder="Contexte clinique et question posee..."
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );

  const renderExamEcgFields = () => (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-sm text-muted-foreground">
          Prescription d'un ECG standard 12 derivations
        </p>
        <Badge variant="outline" className="text-base px-4 py-2">
          ECG 12 derivations
        </Badge>
      </div>
    </div>
  );

  const renderExamAutreFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Nom de l'examen</Label>
        <Input
          value={form.medication_name}
          onChange={(e) => update('medication_name', e.target.value)}
          placeholder="ex: EEG, Fond d'oeil..."
          className="mt-1"
          autoFocus
        />
      </div>
      <div>
        <Label>Indication / Details</Label>
        <Textarea
          value={form.text_notes}
          onChange={(e) => update('text_notes', e.target.value)}
          placeholder="Indication clinique..."
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );

  const renderSurveillanceFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Type de surveillance</Label>
        <Input
          value={form.surveillance_type}
          onChange={(e) => update('surveillance_type', e.target.value)}
          placeholder="ex: Scope, SpO2, Glasgow, diurese..."
          className="mt-1"
          autoFocus
        />
      </div>
      <div>
        <Label>Frequence</Label>
        <Select
          value={form.surveillance_frequency}
          onValueChange={(v) => update('surveillance_frequency', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SURVEILLANCE_FREQUENCIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAvisFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Specialite</Label>
        <Select value={form.avis_specialty} onValueChange={(v) => update('avis_specialty', v)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choisir une specialite..." />
          </SelectTrigger>
          <SelectContent>
            {AVIS_SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Motif de l'avis</Label>
        <Textarea
          value={form.avis_motif}
          onChange={(e) => update('avis_motif', e.target.value)}
          placeholder="Motif de la demande d'avis..."
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <Label>Degre d'urgence</Label>
        <Select
          value={form.avis_urgency}
          onValueChange={(v) => update('avis_urgency', v as FormState['avis_urgency'])}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="rapide">Rapide (dans l'heure)</SelectItem>
            <SelectItem value="programme">Programme</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderRegimeFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Details</Label>
        <Textarea
          value={form.regime_details}
          onChange={(e) => update('regime_details', e.target.value)}
          placeholder="Consignes alimentaires..."
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['A jeun strict', 'Regime sans sel', 'Boissons libres'].map((quick) => (
          <Button
            key={quick}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              const current = form.regime_details;
              const updated = current ? `${current}\n${quick}` : quick;
              update('regime_details', updated);
            }}
          >
            {quick}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderMobilisationFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Details</Label>
        <Textarea
          value={form.mobilisation_details}
          onChange={(e) => update('mobilisation_details', e.target.value)}
          placeholder="Consignes de mobilisation..."
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['Repos strict au lit', 'Lever autorise avec aide', 'Pas d\'appui MIG/MID'].map(
          (quick) => (
            <Button
              key={quick}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                const current = form.mobilisation_details;
                const updated = current ? `${current}\n${quick}` : quick;
                update('mobilisation_details', updated);
              }}
            >
              {quick}
            </Button>
          ),
        )}
      </div>
    </div>
  );

  const renderDispositifFields = () => (
    <div className="space-y-3">
      <div>
        <Label>Nom du dispositif</Label>
        <Input
          value={form.dispositif_name}
          onChange={(e) => update('dispositif_name', e.target.value)}
          placeholder="ex: Attelle, Sonde urinaire, VVP..."
          className="mt-1"
          autoFocus
        />
      </div>
      <div>
        <Label>Details</Label>
        <Textarea
          value={form.dispositif_details}
          onChange={(e) => update('dispositif_details', e.target.value)}
          placeholder="Precision sur le dispositif..."
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  );

  const renderSortieFields = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Ordonnance de sortie</Label>
          <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={addSortieMed}>
            + Ajouter un medicament
          </Button>
        </div>
        {form.sortie_medications.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Aucun medicament de sortie. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </p>
        )}
        <div className="space-y-2">
          {form.sortie_medications.map((med, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-md border bg-muted/30">
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                <Input
                  value={med.name}
                  onChange={(e) => updateSortieMed(idx, 'name', e.target.value)}
                  placeholder="Medicament"
                  className="text-xs h-8"
                />
                <Input
                  value={med.dose}
                  onChange={(e) => updateSortieMed(idx, 'dose', e.target.value)}
                  placeholder="Dose"
                  className="text-xs h-8"
                />
                <Input
                  value={med.route}
                  onChange={(e) => updateSortieMed(idx, 'route', e.target.value)}
                  placeholder="Voie"
                  className="text-xs h-8"
                />
                <Input
                  value={med.frequency}
                  onChange={(e) => updateSortieMed(idx, 'frequency', e.target.value)}
                  placeholder="Freq"
                  className="text-xs h-8"
                />
                <Input
                  value={med.duration}
                  onChange={(e) => updateSortieMed(idx, 'duration', e.target.value)}
                  placeholder="Duree"
                  className="text-xs h-8"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => removeSortieMed(idx)}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Consignes de sortie</Label>
        <Textarea
          value={form.sortie_consignes}
          onChange={(e) => update('sortie_consignes', e.target.value)}
          placeholder="Consignes de surveillance, reconsulter si..."
          className="mt-1"
          rows={3}
        />
      </div>
      <div>
        <Label>Arret de travail (jours)</Label>
        <Input
          type="number"
          value={form.sortie_arret_travail}
          onChange={(e) => update('sortie_arret_travail', e.target.value)}
          placeholder="0"
          className="mt-1 w-24"
          min={0}
        />
      </div>
    </div>
  );

  // -----------------------------------------------------------------------
  // Map type to renderer
  // -----------------------------------------------------------------------
  const renderTypeFields = () => {
    switch (form.type) {
      case 'medicament':
        return renderMedicamentFields();
      case 'perfusion':
        return renderPerfusionFields();
      case 'titration':
        return renderTitrationFields();
      case 'conditionnel':
        return renderConditionnelFields();
      case 'oxygene':
        return renderOxygeneFields();
      case 'exam_bio':
        return renderExamBioFields();
      case 'exam_imagerie':
        return renderExamImagerieFields();
      case 'exam_ecg':
        return renderExamEcgFields();
      case 'exam_autre':
        return renderExamAutreFields();
      case 'surveillance':
        return renderSurveillanceFields();
      case 'avis_specialise':
        return renderAvisFields();
      case 'regime':
        return renderRegimeFields();
      case 'mobilisation':
        return renderMobilisationFields();
      case 'dispositif':
        return renderDispositifFields();
      case 'sortie':
        return renderSortieFields();
      default:
        return null;
    }
  };

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div>
        <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Type de prescription
        </Label>
        <PrescriptionTypeSelector
          value={form.type}
          onChange={(type) => update('type', type)}
        />
      </div>

      {/* Dynamic fields */}
      {renderTypeFields()}

      {/* Priority selector */}
      <div>
        <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Priorite
        </Label>
        <div className="flex gap-2">
          {(
            [
              { value: 'routine', label: 'Routine', className: 'border-border' },
              { value: 'urgent', label: 'Urgent', className: 'border-orange-500 text-orange-600' },
              { value: 'stat', label: 'STAT', className: 'border-red-500 text-red-600' },
            ] as const
          ).map((p) => (
            <Button
              key={p.value}
              type="button"
              variant={form.priority === p.value ? 'default' : 'outline'}
              size="sm"
              className={
                form.priority === p.value
                  ? p.value === 'stat'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : p.value === 'urgent'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : ''
                  : p.className
              }
              onClick={() => update('priority', p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes (general purpose, not shown for types that embed notes differently) */}
      {!['exam_bio', 'exam_ecg', 'exam_autre', 'regime', 'mobilisation', 'sortie'].includes(form.type) && (
        <div>
          <Label>Notes</Label>
          <Textarea
            value={form.text_notes}
            onChange={(e) => update('text_notes', e.target.value)}
            placeholder="Notes supplementaires..."
            className="mt-1"
            rows={2}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="min-w-[100px]"
        >
          Valider
        </Button>
      </div>
    </div>
  );
}
