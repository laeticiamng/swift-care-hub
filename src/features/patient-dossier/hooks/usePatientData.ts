import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { DEMO_ENCOUNTERS, DEMO_PATIENTS, DEMO_VITALS } from '@/lib/demo-data';
import { SIH_TIMELINE_ENTRIES, SIH_LAB_ALERTS, SIH_COMMUNICATIONS } from '@/lib/sih-demo-data';
import { generateIPP } from '@/lib/homonymy-detection';
import type { TimelineEntry, Communication } from '@/lib/sih-types';

export function usePatientData(encounterId: string | undefined) {
  const { user } = useAuth();
  const { isDemoMode } = useDemo();

  const [encounter, setEncounter] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);

  // SIH state
  const [sihTimelineEntries, setSihTimelineEntries] = useState<TimelineEntry[]>([]);
  const [sihLabAlerts, setSihLabAlerts] = useState(SIH_LAB_ALERTS);
  const [sihCommunications, setSihCommunications] = useState(SIH_COMMUNICATIONS);

  const fetchAll = useCallback(async () => {
    if (!encounterId) return;

    if (isDemoMode) {
      const demoEnc = DEMO_ENCOUNTERS.find(e => e.id === encounterId);
      if (!demoEnc) return;
      const demoPat = DEMO_PATIENTS.find(p => p.id === demoEnc.patient_id);
      if (!demoPat) return;
      setEncounter({
        id: demoEnc.id, patient_id: demoEnc.patient_id, status: demoEnc.status,
        zone: demoEnc.zone, box_number: demoEnc.box_number, ccmu: demoEnc.ccmu,
        cimu: demoEnc.cimu, motif_sfmu: demoEnc.motif_sfmu, medecin_id: demoEnc.medecin_id,
        arrival_time: demoEnc.arrival_time, triage_time: demoEnc.triage_time,
      });
      setPatient({
        id: demoPat.id, nom: demoPat.nom, prenom: demoPat.prenom,
        date_naissance: demoPat.date_naissance, sexe: demoPat.sexe,
        allergies: demoPat.allergies, antecedents: demoPat.antecedents,
        medecin_traitant: demoPat.medecin_traitant, poids: demoPat.poids,
        telephone: demoPat.telephone,
      });
      setVitals(DEMO_VITALS.filter(v => v.encounter_id === encounterId));
      setPrescriptions([]);
      setResults([]);
      setTimeline([]);
      if (demoEnc.medecin_id) setMedecinName('Dr. Martin Dupont');
      return;
    }

    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId).single();
    if (!enc) return;
    setEncounter(enc);

    const [patRes, vitRes, rxRes, resRes, tlRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', enc.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId).order('created_at', { ascending: false }),
      supabase.from('results').select('*').eq('encounter_id', encounterId).order('received_at', { ascending: false }),
      supabase.from('timeline_items').select('*').eq('patient_id', enc.patient_id).order('source_date', { ascending: false }),
    ]);

    if (patRes.data) setPatient(patRes.data);
    if (vitRes.data) setVitals(vitRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (resRes.data) setResults(resRes.data);
    if (tlRes.data) setTimeline(tlRes.data);

    // Build SIH timeline
    const matchingEntries = SIH_TIMELINE_ENTRIES.filter(e => e.patient_id === enc.patient_id || e.encounter_id === encounterId);
    if (matchingEntries.length > 0) {
      setSihTimelineEntries(matchingEntries);
    } else {
      const autoEntries: TimelineEntry[] = [];
      const patientIpp = generateIPP(enc.patient_id);
      if (enc.arrival_time) {
        autoEntries.push({ id: `auto-arr-${enc.id}`, encounter_id: enc.id, patient_id: enc.patient_id, patient_ipp: patientIpp, entry_type: 'arrivee', content: `Arrivee aux urgences${enc.motif_sfmu ? ` — ${enc.motif_sfmu}` : ''}`, author_id: 'system', author_name: 'Systeme', validation_status: 'valide', created_at: enc.arrival_time });
      }
      if (enc.triage_time) {
        autoEntries.push({ id: `auto-tri-${enc.id}`, encounter_id: enc.id, patient_id: enc.patient_id, patient_ipp: patientIpp, entry_type: 'triage', content: `Triage IOA${enc.cimu ? ` — CIMU ${enc.cimu}` : ''}${enc.ccmu ? ` — CCMU ${enc.ccmu}` : ''}`, author_id: 'system', author_name: 'IOA', validation_status: 'valide', created_at: enc.triage_time });
      }
      if (rxRes.data) {
        rxRes.data.forEach((rx: any) => {
          autoEntries.push({ id: `auto-rx-${rx.id}`, encounter_id: enc.id, patient_id: enc.patient_id, patient_ipp: patientIpp, entry_type: 'prescription_ecrite', content: `${rx.medication_name} ${rx.dosage} ${rx.route}`, author_id: rx.prescriber_id || 'system', author_name: 'Prescripteur', validation_status: 'valide', created_at: rx.created_at });
        });
      }
      if (resRes.data) {
        resRes.data.forEach((r: any) => {
          const entryType = r.category === 'imagerie' ? 'resultat_imagerie' : r.category === 'ecg' ? 'resultat_ecg' : 'resultat_bio';
          autoEntries.push({ id: `auto-res-${r.id}`, encounter_id: enc.id, patient_id: enc.patient_id, patient_ipp: patientIpp, entry_type: entryType, content: `${r.title}${r.is_critical ? ' — CRITIQUE' : ''}`, author_id: 'system', author_name: r.category === 'imagerie' ? 'Imagerie' : r.category === 'ecg' ? 'ECG' : 'Labo', validation_status: r.is_critical ? 'critique' : 'valide', created_at: r.received_at || r.created_at });
        });
      }
      setSihTimelineEntries(autoEntries);
    }

    // Fetch medecin name
    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }
  }, [encounterId, isDemoMode]);

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
    if (isDemoMode) return;
    const channel = supabase.channel(`dossier-${encounterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `encounter_id=eq.${encounterId}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [encounterId, isDemoMode, fetchAll]);

  return {
    encounter, patient, vitals, prescriptions, results, timeline,
    medecinName, sihTimelineEntries, setSihTimelineEntries,
    sihLabAlerts, setSihLabAlerts, sihCommunications,
    fetchAll,
  };
}
