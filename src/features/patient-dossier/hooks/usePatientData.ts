import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { buildPatientIdentity, buildSihTimelineEntries, mapCommunication, mapLabAlert, type CommunicationRow, type EncounterRow, type LabAlertRow, type PatientRow, type PrescriptionRow, type ResultRow, type TimelineItemRow, type VitalRow } from '@/lib/sih-live';
import type { Communication, LabAlert, PatientIdentity, TimelineEntry } from '@/lib/sih-types';

export function usePatientData(encounterId: string | undefined) {
  const [encounter, setEncounter] = useState<EncounterRow | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineItemRow[]>([]);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);
  const [allPatients, setAllPatients] = useState<PatientIdentity[]>([]);

  const [sihTimelineEntries, setSihTimelineEntries] = useState<TimelineEntry[]>([]);
  const [sihLabAlerts, setSihLabAlerts] = useState<LabAlert[]>([]);
  const [sihCommunications, setSihCommunications] = useState<Communication[]>([]);

  const fetchAll = useCallback(async () => {
    if (!encounterId) return;

    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId).single();
    if (!enc) {
      setEncounter(null);
      setPatient(null);
      setVitals([]);
      setPrescriptions([]);
      setResults([]);
      setTimeline([]);
      setSihTimelineEntries([]);
      setSihLabAlerts([]);
      setSihCommunications([]);
      return;
    }

    const encounterRow = enc as EncounterRow;
    setEncounter(encounterRow);

    const [
      patRes,
      vitRes,
      rxRes,
      resRes,
      tlRes,
      labAlertRes,
      commRes,
    ] = await Promise.all([
      supabase.from('patients').select('*').eq('id', encounterRow.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId).order('created_at', { ascending: false }),
      supabase.from('results').select('*').eq('encounter_id', encounterId).order('received_at', { ascending: false }),
      supabase.from('timeline_items').select('*').eq('patient_id', encounterRow.patient_id).order('created_at', { ascending: false }),
      supabase.from('lab_alerts' as never).select('*').eq('encounter_id', encounterId).order('created_at', { ascending: false }),
      supabase.from('communications' as never).select('*').eq('encounter_id', encounterId).order('created_at', { ascending: false }),
    ]);

    const patientRow = (patRes.data || null) as PatientRow | null;
    const vitalsRows = (vitRes.data || []) as VitalRow[];
    const prescriptionRows = (rxRes.data || []) as PrescriptionRow[];
    const resultRows = (resRes.data || []) as ResultRow[];
    const timelineRows = (tlRes.data || []) as TimelineItemRow[];
    const labAlerts = ((labAlertRes.data || []) as unknown as LabAlertRow[]).map(mapLabAlert);
    const communications = ((commRes.data || []) as unknown as CommunicationRow[]).map(mapCommunication);

    setPatient(patientRow);
    setVitals(vitalsRows);
    setPrescriptions(prescriptionRows);
    setResults(resultRows);
    setTimeline(timelineRows);
    setSihLabAlerts(labAlerts);
    setSihCommunications(communications);

    if (!patientRow) {
      setSihTimelineEntries([]);
      setAllPatients([]);
      return;
    }

    let resolvedMedecinName: string | undefined;
    if (encounterRow.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', encounterRow.medecin_id).single();
      resolvedMedecinName = profile?.full_name || undefined;
      setMedecinName(resolvedMedecinName);
    } else {
      setMedecinName(undefined);
    }

    const sameNamePatients = await supabase
      .from('patients')
      .select('id, nom, prenom, date_naissance, sexe, allergies, ins_numero, ipp, photo_url')
      .eq('nom', patientRow.nom)
      .eq('prenom', patientRow.prenom)
      .limit(10);

    const sameNameRows = (sameNamePatients.data || []) as PatientRow[];
    const encounterRowsByPatientId = sameNameRows.length > 0
      ? await supabase
          .from('encounters')
          .select('id, patient_id, zone, arrival_time')
          .in('patient_id', sameNameRows.map((currentPatient) => currentPatient.id))
          .order('arrival_time', { ascending: false })
      : { data: [] };

    const latestEncounterByPatient = new Map(
      ((encounterRowsByPatientId.data || []) as Array<Pick<EncounterRow, 'id' | 'patient_id' | 'zone'>>)
        .map((currentEncounter) => [currentEncounter.patient_id, currentEncounter]),
    );

    const homonymCandidates = sameNameRows
      .map((currentPatient) => buildPatientIdentity(currentPatient, latestEncounterByPatient.get(currentPatient.id) || encounterRow))
      .filter((candidate) => candidate.id !== patientRow.id);

    setAllPatients(homonymCandidates);
    setSihTimelineEntries(buildSihTimelineEntries({
      encounter: encounterRow,
      patient: patientRow,
      vitals: vitalsRows,
      prescriptions: prescriptionRows,
      results: resultRows,
      timeline: timelineRows,
      communications,
      labAlerts,
      medecinName: resolvedMedecinName,
    }));
  }, [encounterId]);

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();

    const channel = supabase.channel(`dossier-${encounterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `encounter_id=eq.${encounterId}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `encounter_id=eq.${encounterId}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_items' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_alerts' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communications' }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [encounterId, fetchAll]);

  return {
    encounter,
    patient,
    vitals,
    prescriptions,
    results,
    timeline,
    medecinName,
    allPatients,
    sihTimelineEntries,
    setSihTimelineEntries,
    sihLabAlerts,
    setSihLabAlerts,
    sihCommunications,
    fetchAll,
  };
}
