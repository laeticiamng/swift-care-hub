import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardModeView } from '@/components/urgence/GuardModeView';
import { LabAlertNotification } from '@/components/urgence/LabAlertNotification';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { buildPatientIdentity, mapGuardSchedule, mapLabAlert, type GuardScheduleRow, type LabAlertRow, type PatientRow } from '@/lib/sih-live';
import type { GuardSchedule, LabAlert } from '@/lib/sih-types';
import { generateIPP } from '@/lib/homonymy-detection';

interface EncounterWithPatient {
  id: string;
  patient_id: string;
  status: string;
  zone: 'sau' | 'uhcd' | 'dechocage' | null;
  box_number: number | null;
  cimu: number | null;
  motif_sfmu: string | null;
  arrival_time: string;
  patients: PatientRow | null;
}

function formatWaitTime(arrivalTime: string) {
  const waitMs = Date.now() - new Date(arrivalTime).getTime();
  const waitMins = Math.floor(waitMs / 60000);
  return waitMins < 60 ? `${waitMins} min` : `${Math.floor(waitMins / 60)}h${String(waitMins % 60).padStart(2, '0')}`;
}

export default function GardePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [encounters, setEncounters] = useState<EncounterWithPatient[]>([]);
  const [labAlerts, setLabAlerts] = useState<LabAlert[]>([]);
  const [guardSchedule, setGuardSchedule] = useState<GuardSchedule[]>([]);

  useEffect(() => {
    const fetchGuardData = async () => {
      const [encountersRes, alertsRes, scheduleRes] = await Promise.all([
        supabase
          .from('encounters')
          .select('id, patient_id, status, zone, box_number, cimu, motif_sfmu, arrival_time, patients(*)')
          .neq('status', 'finished')
          .order('arrival_time', { ascending: true }),
        supabase.from('lab_alerts' as never).select('*').order('created_at', { ascending: false }),
        supabase.from('guard_schedule' as never).select('*').eq('is_active', true).order('start_time', { ascending: false }),
      ]);

      setEncounters((encountersRes.data || []) as unknown as EncounterWithPatient[]);
      setLabAlerts(((alertsRes.data || []) as unknown as LabAlertRow[]).map(mapLabAlert));
      setGuardSchedule(((scheduleRes.data || []) as unknown as GuardScheduleRow[]).map(mapGuardSchedule));
    };

    fetchGuardData();

    const channel = supabase
      .channel('garde-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, fetchGuardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_alerts' }, fetchGuardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_schedule' }, fetchGuardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const guardPatients = useMemo(() => encounters
    .filter((encounter) => encounter.patients)
    .map((encounter) => {
      const patient = encounter.patients as PatientRow;
      const identity = buildPatientIdentity(patient, { id: encounter.id, zone: encounter.zone });

      return {
        ...identity,
        ipp: identity.ipp || generateIPP(patient.id),
        encounterId: encounter.id,
        motif: encounter.motif_sfmu || 'Motif non renseigné',
        cimu: encounter.cimu || 4,
        zone: encounter.zone || 'sau',
        boxNumber: encounter.box_number || 0,
        status: encounter.status,
        waitTime: formatWaitTime(encounter.arrival_time),
        hasCriticalAlert: labAlerts.some((alert) => alert.patient_id === encounter.patient_id && !alert.acknowledged),
        pendingActions: Number(encounter.status === 'arrived') + Number((encounter.zone && !encounter.box_number) || false),
      };
    }), [encounters, labAlerts]);

  return (
    <div className="min-h-screen bg-background has-bottom-nav">
      <LabAlertNotification
        alerts={labAlerts.filter((alert) => !alert.acknowledged)}
        onAcknowledge={async (alertId, note) => {
          await supabase
            .from('lab_alerts' as never)
            .update({
              acknowledged: true,
              acknowledged_at: new Date().toISOString(),
              acknowledgment_note: note,
            } as never)
            .eq('id', alertId);

          setLabAlerts((currentAlerts) => currentAlerts.map((alert) => (
            alert.id === alertId
              ? { ...alert, acknowledged: true, acknowledged_at: new Date().toISOString(), acknowledgment_note: note }
              : alert
          )));
          toast({ title: 'Alerte acquittée', description: 'Résultat critique tracé côté backend.' });
        }}
      />

      <GuardModeView
        patients={guardPatients}
        guardSchedule={guardSchedule}
        services={['SAU', 'UHCD', 'Dechocage']}
        currentService="all"
        onPatientClick={(encounterId) => navigate(`/patient/${encounterId}`)}
        onGenerateHandover={(encounterId) => {
          navigate(`/recap/${encounterId}`);
          toast({ title: 'Transmission prête', description: 'La synthèse patient a été ouverte à partir des données live.' });
        }}
      />
    </div>
  );
}
