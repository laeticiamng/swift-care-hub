/**
 * Guard Mode Page — M7 Multi-service guard view
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardModeView } from '@/components/urgence/GuardModeView';
import { LabAlertNotification } from '@/components/urgence/LabAlertNotification';
import { SIH_PATIENTS, SIH_GUARD_SCHEDULE, SIH_LAB_ALERTS } from '@/lib/sih-demo-data';
import { generateIPP, generateNumeroSejour } from '@/lib/homonymy-detection';
import { useToast } from '@/hooks/use-toast';
import { DEMO_ENCOUNTERS } from '@/lib/demo-data';

const now = Date.now();
const hoursAgo = (h: number) => {
  const ms = h * 3600000;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h${(mins % 60).toString().padStart(2, '0')}`;
};

export default function GardePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [labAlerts, setLabAlerts] = useState(SIH_LAB_ALERTS);

  const guardPatients = DEMO_ENCOUNTERS
    .filter(e => e.status !== 'finished')
    .map(enc => {
      const sihPatient = SIH_PATIENTS.find(p => p.id === enc.patient_id);
      const waitMs = now - new Date(enc.arrival_time).getTime();
      const waitMins = Math.floor(waitMs / 60000);
      const waitStr = waitMins < 60 ? `${waitMins} min` : `${Math.floor(waitMins / 60)}h${(waitMins % 60).toString().padStart(2, '0')}`;

      return {
        id: enc.patient_id,
        nom: enc.patients.nom,
        prenom: enc.patients.prenom,
        date_naissance: enc.patients.date_naissance,
        ipp: sihPatient?.ipp || generateIPP(enc.patient_id),
        service: enc.zone === 'uhcd' ? 'UHCD' : enc.zone === 'dechocage' ? 'Dechocage' : 'SAU',
        numero_sejour: sihPatient?.numero_sejour || generateNumeroSejour(enc.id),
        sexe: enc.patients.sexe,
        allergies: enc.patients.allergies || [],
        encounterId: enc.id,
        motif: enc.motif_sfmu || 'Non precise',
        cimu: enc.cimu || 4,
        zone: enc.zone || 'SAU',
        boxNumber: enc.box_number || 0,
        status: enc.status,
        waitTime: waitStr,
        hasCriticalAlert: labAlerts.some(a => a.patient_id === enc.patient_id && !a.acknowledged),
        pendingActions: enc.status === 'arrived' ? 1 : 0,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <LabAlertNotification
        alerts={labAlerts}
        onAcknowledge={(alertId, note) => {
          setLabAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, acknowledged: true, acknowledged_by: 'demo-medecin', acknowledged_at: new Date().toISOString(), acknowledgment_note: note } : a
          ));
          toast({ title: 'Alerte acquittee', description: 'Resultat vu et pris en compte' });
        }}
      />

      <GuardModeView
        patients={guardPatients}
        guardSchedule={SIH_GUARD_SCHEDULE}
        services={['SAU', 'UHCD', 'Dechocage']}
        currentService="all"
        onPatientClick={(encId) => navigate(`/patient/${encId}`)}
        onGenerateHandover={(encId) => {
          toast({ title: 'Fiche transmission', description: 'Fiche de transmission generee (demo)' });
        }}
      />
    </div>
  );
}
