export interface DemoPatient {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  allergies: string[];
  antecedents: string[];
  medecin_traitant: string | null;
  poids: number | null;
  telephone: string | null;
}

export interface DemoEncounter {
  id: string;
  patient_id: string;
  status: string;
  zone: string | null;
  box_number: number | null;
  ccmu: number | null;
  cimu: number | null;
  motif_sfmu: string | null;
  medecin_id: string | null;
  arrival_time: string;
  triage_time: string | null;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string; allergies: string[] | null };
}

export interface DemoVital {
  id: string;
  encounter_id: string;
  patient_id: string;
  fc: number | null;
  pa_systolique: number | null;
  pa_diastolique: number | null;
  spo2: number | null;
  temperature: number | null;
  frequence_respiratoire: number | null;
  gcs: number | null;
  eva_douleur: number | null;
  recorded_at: string;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();
const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

export const DEMO_PATIENTS: DemoPatient[] = [
  { id: 'demo-p1', nom: 'DUPONT', prenom: 'Marie', date_naissance: '1958-03-15', sexe: 'F', allergies: ['Penicilline'], antecedents: ['HTA', 'Diabete type 2'], medecin_traitant: 'Dr. Leroy', poids: 72, telephone: '06 12 34 56 78' },
  { id: 'demo-p2', nom: 'MARTIN', prenom: 'Lucas', date_naissance: '1994-06-22', sexe: 'M', allergies: ['Aspirine'], antecedents: [], medecin_traitant: 'Dr. Simon', poids: 78, telephone: null },
  { id: 'demo-p3', nom: 'BERNARD', prenom: 'Sophie', date_naissance: '1981-11-08', sexe: 'F', allergies: [], antecedents: ['Asthme allergique'], medecin_traitant: 'Dr. Laurent', poids: 60, telephone: '06 23 45 67 89' },
  { id: 'demo-p4', nom: 'PETIT', prenom: 'Jean', date_naissance: '1948-01-30', sexe: 'M', allergies: ['Iode'], antecedents: ['Insuffisance renale chronique', 'HTA'], medecin_traitant: 'Dr. Garcia', poids: 70, telephone: '06 34 56 78 90' },
  { id: 'demo-p5', nom: 'LEROY', prenom: 'Emma', date_naissance: '2001-05-12', sexe: 'F', allergies: [], antecedents: [], medecin_traitant: null, poids: 55, telephone: null },
  { id: 'demo-p6', nom: 'MOREAU', prenom: 'Camille', date_naissance: '1975-09-18', sexe: 'F', allergies: [], antecedents: ['Migraine chronique'], medecin_traitant: 'Dr. Martin', poids: 58, telephone: null },
  { id: 'demo-p7', nom: 'SIMON', prenom: 'Thomas', date_naissance: '1998-12-25', sexe: 'M', allergies: [], antecedents: [], medecin_traitant: null, poids: 75, telephone: null },
  { id: 'demo-p8', nom: 'LAURENT', prenom: 'Emilie', date_naissance: '1965-06-03', sexe: 'F', allergies: ['Penicilline', 'Sulfamides'], antecedents: ['HTA', 'Hypothyroidie'], medecin_traitant: 'Dr. Blanc', poids: 68, telephone: '06 56 78 90 12' },
  { id: 'demo-p9', nom: 'ROBERT', prenom: 'Antoine', date_naissance: '1937-02-14', sexe: 'M', allergies: [], antecedents: ['AVC', 'FA', 'HTA'], medecin_traitant: 'Dr. Dupont', poids: 72, telephone: '06 67 89 01 23' },
  { id: 'demo-p10', nom: 'ROUX', prenom: 'Chloe', date_naissance: '2003-08-07', sexe: 'F', allergies: [], antecedents: [], medecin_traitant: null, poids: 55, telephone: null },
];

export const DEMO_ENCOUNTERS: DemoEncounter[] = [
  { id: 'demo-e1', patient_id: 'demo-p1', status: 'in-progress', zone: 'sau', box_number: 1, ccmu: 3, cimu: 2, motif_sfmu: 'Douleur thoracique', medecin_id: 'demo-medecin', arrival_time: hoursAgo(4), triage_time: hoursAgo(3.75), patients: { nom: 'DUPONT', prenom: 'Marie', date_naissance: '1958-03-15', sexe: 'F', allergies: ['Penicilline'] } },
  { id: 'demo-e2', patient_id: 'demo-p2', status: 'in-progress', zone: 'sau', box_number: 3, ccmu: 4, cimu: 4, motif_sfmu: 'Traumatisme membre', medecin_id: 'demo-medecin', arrival_time: hoursAgo(2.5), triage_time: hoursAgo(2.33), patients: { nom: 'MARTIN', prenom: 'Lucas', date_naissance: '1994-06-22', sexe: 'M', allergies: ['Aspirine'] } },
  { id: 'demo-e3', patient_id: 'demo-p3', status: 'in-progress', zone: 'sau', box_number: 2, ccmu: 2, cimu: 2, motif_sfmu: 'Dyspnee', medecin_id: 'demo-medecin', arrival_time: hoursAgo(3), triage_time: hoursAgo(2.83), patients: { nom: 'BERNARD', prenom: 'Sophie', date_naissance: '1981-11-08', sexe: 'F', allergies: [] } },
  { id: 'demo-e4', patient_id: 'demo-p4', status: 'in-progress', zone: 'sau', box_number: 4, ccmu: 3, cimu: 3, motif_sfmu: 'Douleur abdominale', medecin_id: 'demo-medecin', arrival_time: hoursAgo(1.75), triage_time: hoursAgo(1.5), patients: { nom: 'PETIT', prenom: 'Jean', date_naissance: '1948-01-30', sexe: 'M', allergies: ['Iode'] } },
  { id: 'demo-e5', patient_id: 'demo-p5', status: 'in-progress', zone: 'uhcd', box_number: 1, ccmu: 2, cimu: 2, motif_sfmu: 'Intoxication', medecin_id: 'demo-medecin', arrival_time: hoursAgo(5), triage_time: hoursAgo(4.83), patients: { nom: 'LEROY', prenom: 'Emma', date_naissance: '2001-05-12', sexe: 'F', allergies: [] } },
  { id: 'demo-e6', patient_id: 'demo-p6', status: 'triaged', zone: 'sau', box_number: 6, ccmu: 3, cimu: 3, motif_sfmu: 'Cephalee', medecin_id: null, arrival_time: hoursAgo(1), triage_time: minsAgo(50), patients: { nom: 'MOREAU', prenom: 'Camille', date_naissance: '1975-09-18', sexe: 'F', allergies: [] } },
  { id: 'demo-e7', patient_id: 'demo-p7', status: 'in-progress', zone: 'dechocage', box_number: 1, ccmu: 1, cimu: 1, motif_sfmu: 'Malaise / syncope', medecin_id: 'demo-medecin', arrival_time: minsAgo(30), triage_time: minsAgo(25), patients: { nom: 'SIMON', prenom: 'Thomas', date_naissance: '1998-12-25', sexe: 'M', allergies: [] } },
  { id: 'demo-e8', patient_id: 'demo-p8', status: 'in-progress', zone: 'uhcd', box_number: 2, ccmu: 4, cimu: 4, motif_sfmu: 'AEG / Fievre', medecin_id: 'demo-medecin', arrival_time: hoursAgo(6), triage_time: hoursAgo(5.83), patients: { nom: 'LAURENT', prenom: 'Emilie', date_naissance: '1965-06-03', sexe: 'F', allergies: ['Penicilline', 'Sulfamides'] } },
  { id: 'demo-e9', patient_id: 'demo-p9', status: 'arrived', zone: null, box_number: null, ccmu: null, cimu: null, motif_sfmu: null, medecin_id: null, arrival_time: minsAgo(15), triage_time: null, patients: { nom: 'ROBERT', prenom: 'Antoine', date_naissance: '1937-02-14', sexe: 'M', allergies: [] } },
  { id: 'demo-e10', patient_id: 'demo-p10', status: 'triaged', zone: 'sau', box_number: 7, ccmu: 4, cimu: 4, motif_sfmu: 'Plaie', medecin_id: null, arrival_time: hoursAgo(1.25), triage_time: hoursAgo(1), patients: { nom: 'ROUX', prenom: 'Chloe', date_naissance: '2003-08-07', sexe: 'F', allergies: [] } },
];

export const DEMO_VITALS: DemoVital[] = [
  { id: 'dv1', encounter_id: 'demo-e1', patient_id: 'demo-p1', fc: 110, pa_systolique: 155, pa_diastolique: 90, spo2: 96, temperature: 37.2, frequence_respiratoire: 18, gcs: 15, eva_douleur: 8, recorded_at: hoursAgo(3.67) },
  { id: 'dv2', encounter_id: 'demo-e1', patient_id: 'demo-p1', fc: 88, pa_systolique: 145, pa_diastolique: 85, spo2: 97, temperature: 37.1, frequence_respiratoire: 16, gcs: 15, eva_douleur: 6, recorded_at: hoursAgo(2) },
  { id: 'dv3', encounter_id: 'demo-e1', patient_id: 'demo-p1', fc: 82, pa_systolique: 130, pa_diastolique: 80, spo2: 98, temperature: 37.0, frequence_respiratoire: 15, gcs: 15, eva_douleur: 3, recorded_at: minsAgo(30) },
  { id: 'dv4', encounter_id: 'demo-e2', patient_id: 'demo-p2', fc: 90, pa_systolique: 125, pa_diastolique: 78, spo2: 99, temperature: 37.0, frequence_respiratoire: 15, gcs: 15, eva_douleur: 7, recorded_at: hoursAgo(2.25) },
  { id: 'dv5', encounter_id: 'demo-e2', patient_id: 'demo-p2', fc: 82, pa_systolique: 120, pa_diastolique: 75, spo2: 99, temperature: 37.0, frequence_respiratoire: 14, gcs: 15, eva_douleur: 5, recorded_at: minsAgo(45) },
  { id: 'dv6', encounter_id: 'demo-e3', patient_id: 'demo-p3', fc: 105, pa_systolique: 130, pa_diastolique: 80, spo2: 89, temperature: 37.5, frequence_respiratoire: 32, gcs: 15, eva_douleur: 2, recorded_at: hoursAgo(2.75) },
  { id: 'dv7', encounter_id: 'demo-e3', patient_id: 'demo-p3', fc: 82, pa_systolique: 120, pa_diastolique: 75, spo2: 96, temperature: 37.1, frequence_respiratoire: 20, gcs: 15, eva_douleur: 0, recorded_at: minsAgo(20) },
  { id: 'dv8', encounter_id: 'demo-e4', patient_id: 'demo-p4', fc: 100, pa_systolique: 160, pa_diastolique: 95, spo2: 97, temperature: 37.1, frequence_respiratoire: 18, gcs: 15, eva_douleur: 9, recorded_at: hoursAgo(1.42) },
  { id: 'dv9', encounter_id: 'demo-e4', patient_id: 'demo-p4', fc: 85, pa_systolique: 145, pa_diastolique: 88, spo2: 98, temperature: 37.0, frequence_respiratoire: 16, gcs: 15, eva_douleur: 5, recorded_at: minsAgo(30) },
  { id: 'dv10', encounter_id: 'demo-e5', patient_id: 'demo-p5', fc: 68, pa_systolique: 105, pa_diastolique: 65, spo2: 97, temperature: 36.5, frequence_respiratoire: 14, gcs: 14, eva_douleur: 0, recorded_at: hoursAgo(4.75) },
  { id: 'dv11', encounter_id: 'demo-e7', patient_id: 'demo-p7', fc: 45, pa_systolique: 80, pa_diastolique: 50, spo2: 88, temperature: 36.2, frequence_respiratoire: 8, gcs: 10, eva_douleur: 0, recorded_at: minsAgo(25) },
  { id: 'dv12', encounter_id: 'demo-e8', patient_id: 'demo-p8', fc: 115, pa_systolique: 95, pa_diastolique: 55, spo2: 93, temperature: 39.2, frequence_respiratoire: 26, gcs: 14, eva_douleur: 3, recorded_at: hoursAgo(3.17) },
];

export const DEMO_USER_PROFILES: Record<string, { full_name: string; email: string }> = {
  'demo-medecin': { full_name: 'Dr. Martin Dupont', email: 'martin@urgenceos.fr' },
  'demo-ioa': { full_name: 'Sophie Lefevre', email: 'sophie@urgenceos.fr' },
  'demo-ide': { full_name: 'Julie Bernard', email: 'julie@urgenceos.fr' },
  'demo-as': { full_name: 'Marc Petit', email: 'marc@urgenceos.fr' },
  'demo-secretaire': { full_name: 'Nathalie Moreau', email: 'nathalie@urgenceos.fr' },
};
