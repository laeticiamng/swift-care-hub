import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { guardPrescription } from '@/lib/server-role-guard';
import { checkAllergyConflict, checkDrugInteractions, type DrugInteraction } from '@/lib/allergy-check';
import {
  encodePrescriptionMeta,
  PRESCRIPTION_PACKS,
  PRESCRIPTION_TYPE_ICONS,
  type PrescriptionType,
  type PrescriptionMetadata,
} from '@/lib/prescription-types';
import { type PrescriptionCategory } from '@/lib/prescription-utils';
import { toast } from 'sonner';

export function usePrescription(encounter: any, patient: any, prescriptions: any[], fetchAll: () => void) {
  const { user } = useAuth();
  const { isDemoMode } = useDemo();

  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState<string[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [interactionConfirmed, setInteractionConfirmed] = useState(false);
  const [newRx, setNewRx] = useState({ medication_name: '', dosage: '', route: 'PO' as string, frequency: '', priority: 'routine' as string, rx_type: 'traitements' as PrescriptionCategory });
  const [rxType, setRxType] = useState<PrescriptionType>('medicament');
  const [rxMeta, setRxMeta] = useState<Partial<PrescriptionMetadata>>({});
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const handleMedNameChange = (name: string) => {
    setNewRx({ ...newRx, medication_name: name });
    if (patient?.allergies) setAllergyWarning(checkAllergyConflict(name, patient.allergies));
    const currentMeds: string[] = [];
    if (patient?.traitements_actuels) {
      if (Array.isArray(patient.traitements_actuels)) {
        currentMeds.push(...patient.traitements_actuels.map((t: any) => typeof t === 'string' ? t : JSON.stringify(t)));
      }
    }
    prescriptions.filter(rx => rx.status === 'active').forEach(rx => currentMeds.push(rx.medication_name));
    setDrugInteractions(checkDrugInteractions(name, currentMeds));
    setInteractionConfirmed(false);
  };

  const handlePrescribe = async () => {
    if (!encounter || !user) return;
    if (!isDemoMode) {
      const check = await guardPrescription();
      if (!check.authorized) { toast.error(check.error || 'Non autorisé'); return; }
    }
    if (allergyWarning.length > 0) {
      toast.error(`ALLERGIE : ${allergyWarning.join(', ')} — bloquee`);
      return;
    }
    const warnings = drugInteractions.filter(i => i.level === 'warning');
    if (warnings.length > 0 && !interactionConfirmed) {
      toast.warning('Interactions detectees — veuillez confirmer');
      return;
    }
    const meta: PrescriptionMetadata = { type: rxType, ...rxMeta };
    if (rxType === 'exam_bio') meta.exam_list = selectedExams;
    const notes = encodePrescriptionMeta(meta);
    let medName = newRx.medication_name;
    if (!medName) {
      if (rxType === 'exam_bio') medName = 'Bio urgente';
      else if (rxType === 'exam_ecg') medName = 'ECG 12 derivations';
      else if (rxType === 'exam_imagerie') medName = rxMeta.exam_site || 'Imagerie';
      else if (rxType === 'oxygene') medName = 'O2';
      else if (rxType === 'surveillance') medName = rxMeta.surveillance_type || 'Surveillance';
      else if (rxType === 'regime') medName = rxMeta.regime_details || 'Regime';
      else if (rxType === 'mobilisation') medName = rxMeta.mobilisation_details || 'Mobilisation';
      else if (rxType === 'dispositif') medName = rxMeta.device_name || 'Dispositif';
      else if (rxType === 'avis_specialise') medName = `Avis ${rxMeta.avis_speciality || ''}`;
      else medName = 'Prescription';
    }
    const { error } = await supabase.from('prescriptions').insert({
      encounter_id: encounter.id, patient_id: encounter.patient_id, prescriber_id: user.id,
      medication_name: medName, dosage: newRx.dosage || '',
      route: (newRx.route || 'PO') as any, frequency: newRx.frequency || null,
      priority: (newRx.priority || 'routine') as any, notes,
    });
    if (error) { toast.error('Erreur de prescription'); return; }
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'prescription_created', resource_type: 'prescription',
      resource_id: encounter.id, details: { medication: medName, type: rxType },
    });
    toast.success(`${PRESCRIPTION_TYPE_ICONS[rxType]} ${medName} prescrit`);
    resetForm();
    fetchAll();
  };

  const resetForm = () => {
    setNewRx({ medication_name: '', dosage: '', route: 'PO', frequency: '', priority: 'routine', rx_type: 'traitements' });
    setRxType('medicament');
    setRxMeta({});
    setSelectedExams([]);
    setAllergyWarning([]);
    setDrugInteractions([]);
    setInteractionConfirmed(false);
    setPrescribeOpen(false);
  };

  const handleApplyPack = async (packKey: string) => {
    const pack = PRESCRIPTION_PACKS[packKey];
    if (!pack || !encounter || !user) return;
    if (!isDemoMode) {
      const check = await guardPrescription();
      if (!check.authorized) { toast.error(check.error || 'Non autorisé'); return; }
    }
    for (const item of pack.items) {
      const meta: PrescriptionMetadata = { ...item };
      const notes = encodePrescriptionMeta(meta);
      await supabase.from('prescriptions').insert({
        encounter_id: encounter.id, patient_id: encounter.patient_id, prescriber_id: user.id,
        medication_name: item.medication_name, dosage: item.dosage || '',
        route: (item.route || 'IV') as any, frequency: item.frequency || null,
        priority: (item.priority || 'routine') as any, notes,
      });
    }
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'pack_prescribed', resource_type: 'encounter',
      resource_id: encounter.id, details: { pack: packKey, items: pack.items.length },
    });
    toast.success(`Pack "${pack.label}" prescrit (${pack.items.length} items)`);
    setPrescribeOpen(false);
    fetchAll();
  };

  const handleCancelPrescription = async (rxId: string) => {
    if (!isDemoMode) {
      const check = await guardPrescription();
      if (!check.authorized) { toast.error(check.error || 'Non autorisé'); return; }
    }
    await supabase.from('prescriptions').update({ status: 'cancelled' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_cancelled', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription annulée');
    fetchAll();
  };

  const handleSuspendPrescription = async (rxId: string) => {
    if (!isDemoMode) {
      const check = await guardPrescription();
      if (!check.authorized) { toast.error(check.error || 'Non autorisé'); return; }
    }
    await supabase.from('prescriptions').update({ status: 'suspended' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_suspended', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription suspendue');
    fetchAll();
  };

  const handleReactivatePrescription = async (rxId: string) => {
    if (!isDemoMode) {
      const check = await guardPrescription();
      if (!check.authorized) { toast.error(check.error || 'Non autorisé'); return; }
    }
    await supabase.from('prescriptions').update({ status: 'active' as any }).eq('id', rxId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'prescription_reactivated', resource_type: 'prescription', resource_id: rxId,
      });
    }
    toast.success('Prescription réactivée');
    fetchAll();
  };

  return {
    prescribeOpen, setPrescribeOpen,
    allergyWarning, drugInteractions, interactionConfirmed, setInteractionConfirmed,
    newRx, setNewRx,
    rxType, setRxType,
    rxMeta, setRxMeta,
    selectedExams, setSelectedExams,
    handleMedNameChange, handlePrescribe, handleApplyPack,
    handleCancelPrescription, handleSuspendPrescription, handleReactivatePrescription,
  };
}
