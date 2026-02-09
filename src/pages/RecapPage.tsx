import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { PatientBanner } from '@/components/urgence/PatientBanner';
import { calculateAge, isVitalAbnormal } from '@/lib/vitals-utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity, Pill, CheckCircle, FlaskConical, Stethoscope,
  ArrowUpDown, MessageSquare, FileText, Loader2, Clock,
  ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

// --- Timeline event types ---
interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'vital' | 'prescription' | 'administration' | 'result' | 'procedure' | 'triage' | 'transmission';
  author_role: string;
  content: string;
  is_critical: boolean;
  status?: string;
}

type FilterType = 'all' | 'vital' | 'prescription' | 'administration' | 'result' | 'procedure' | 'transmission';

// --- Conclusion types ---
interface RecapSection {
  label: string;
  items: string[];
}

interface RecapConclusion {
  title: string;
  sections: RecapSection[];
}

// --- Icon mapping ---
function TypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'vital': return <Activity className={className} />;
    case 'prescription': return <Pill className={className} />;
    case 'administration': return <CheckCircle className={className} />;
    case 'result': return <FlaskConical className={className} />;
    case 'procedure': return <Stethoscope className={className} />;
    case 'triage': return <ArrowUpDown className={className} />;
    case 'transmission': return <MessageSquare className={className} />;
    default: return <FileText className={className} />;
  }
}

// --- Helpers ---
function getAbnormalVitals(v: any): string[] {
  if (!v) return [];
  const abnormals: string[] = [];
  if (v.fc && isVitalAbnormal('fc', v.fc)) abnormals.push(`FC ${v.fc} bpm`);
  if (v.spo2 && isVitalAbnormal('spo2', v.spo2)) abnormals.push(`SpO2 ${v.spo2}%`);
  if (v.pa_systolique && isVitalAbnormal('pa_systolique', v.pa_systolique)) abnormals.push(`PA ${v.pa_systolique}/${v.pa_diastolique || '?'}`);
  if (v.temperature && isVitalAbnormal('temperature', v.temperature)) abnormals.push(`T° ${v.temperature}°C`);
  if (v.frequence_respiratoire && isVitalAbnormal('frequence_respiratoire', v.frequence_respiratoire)) abnormals.push(`FR ${v.frequence_respiratoire}`);
  if (v.gcs && isVitalAbnormal('gcs', v.gcs)) abnormals.push(`GCS ${v.gcs}`);
  if (v.eva_douleur && isVitalAbnormal('eva_douleur', v.eva_douleur)) abnormals.push(`EVA ${v.eva_douleur}/10`);
  return abnormals;
}

function generateConclusion(
  role: AppRole | null,
  encounter: any,
  patient: any,
  vitals: any[],
  prescriptions: any[],
  administrations: any[],
  results: any[],
): RecapConclusion {
  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const criticalResults = results.filter(r => r.is_critical);
  const pendingAdmin = prescriptions
    .filter(rx => rx.status === 'active')
    .filter(rx => !administrations.some(a => a.prescription_id === rx.id));
  const abnormalVitals = getAbnormalVitals(latestVitals);
  const unreadResults = results.filter(r => !r.is_read);

  const alerts: string[] = [
    ...abnormalVitals.map(v => `Constante anormale : ${v}`),
    ...criticalResults.map(r => `Resultat critique : ${r.title}`),
    ...(patient.allergies?.length ? [`Allergies : ${patient.allergies.join(', ')}`] : []),
  ];

  switch (role) {
    case 'medecin':
      return {
        title: 'Recap Medecin',
        sections: [
          { label: "Points d'alerte", items: alerts.length > 0 ? alerts : ['Aucune alerte active'] },
          { label: 'Resultats en attente', items: unreadResults.length > 0 ? unreadResults.map(r => r.title) : ['Tous les resultats sont lus'] },
          { label: 'Traitements en attente', items: pendingAdmin.length > 0 ? pendingAdmin.map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route}`) : ['Tous les traitements sont administres'] },
          { label: 'Prochaine etape', items: getNextSteps(encounter, results, prescriptions) },
        ],
      };

    case 'ide':
      return {
        title: 'Recap IDE',
        sections: [
          { label: 'A surveiller', items: abnormalVitals.length > 0 ? [...abnormalVitals, 'Douleur', 'Conscience'] : ['Douleur', 'Conscience', 'Constantes stables'] },
          { label: 'Traitements en attente', items: pendingAdmin.length > 0 ? pendingAdmin.map(rx => `${rx.medication_name} ${rx.dosage} ${rx.route}`) : ['Aucun traitement en attente'] },
          { label: 'Alerte si', items: getAlertConditions(latestVitals) },
        ],
      };

    case 'ioa':
      return {
        title: 'Recap IOA',
        sections: [
          { label: 'Situation', items: [`${patient.nom} ${patient.prenom}, ${calculateAge(patient.date_naissance)}a, ${encounter.motif_sfmu || 'Motif non renseigne'}. CIMU ${encounter.cimu || '?'}`] },
          { label: 'Constantes', items: latestVitals ? [`FC ${latestVitals.fc || '-'} | PA ${latestVitals.pa_systolique || '-'}/${latestVitals.pa_diastolique || '-'} | SpO2 ${latestVitals.spo2 || '-'}% | T° ${latestVitals.temperature || '-'}°C`] : ['Pas de constantes'] },
          { label: 'Alertes', items: alerts.length > 0 ? alerts : ['Aucune alerte'] },
        ],
      };

    case 'as':
      return {
        title: 'Recap Aide-Soignant',
        sections: [
          { label: 'Installation', items: getComfortNeeds(patient, encounter) },
          { label: 'Surveillance', items: ['Douleur', 'Hydratation', 'Position', 'Appel IDE si changement'] },
          { label: 'Prevenir IDE si', items: ['Douleur > 5/10', 'Malaise', 'Chute', 'Agitation', 'Desaturation'] },
        ],
      };

    case 'secretaire':
      return {
        title: 'Recap Administratif',
        sections: [
          { label: 'Dossier', items: [`${patient.nom} ${patient.prenom}`, `Ne(e) le ${patient.date_naissance}`, `Sexe: ${patient.sexe}`, patient.ins_numero ? `INS: ${patient.ins_numero}` : 'INS: Non renseigne'] },
          { label: 'Documents manquants', items: getMissingDocuments(patient) },
          { label: 'Contacts', items: [patient.telephone ? `Tel: ${patient.telephone}` : 'Telephone non renseigne', patient.medecin_traitant ? `MT: ${patient.medecin_traitant}` : 'Medecin traitant non renseigne'] },
        ],
      };

    default:
      return {
        title: 'Recap',
        sections: [
          { label: 'Alertes', items: alerts.length > 0 ? alerts : ['Aucune alerte'] },
        ],
      };
  }
}

function getNextSteps(encounter: any, results: any[], prescriptions: any[]): string[] {
  const steps: string[] = [];
  const unreadResults = results.filter(r => !r.is_read);
  if (unreadResults.length > 0) steps.push(`Lire ${unreadResults.length} resultat(s) en attente`);
  const criticalResults = results.filter(r => r.is_critical && !r.is_read);
  if (criticalResults.length > 0) steps.push(`URGENT: ${criticalResults.length} resultat(s) critique(s) non lu(s)`);
  if (prescriptions.filter(rx => rx.status === 'active').length === 0 && results.length > 0) steps.push('Reevaluer les prescriptions');
  if (!encounter.orientation) steps.push('Definir orientation du patient');
  if (steps.length === 0) steps.push('Reevaluation clinique', 'Envisager orientation/sortie');
  return steps;
}

function getAlertConditions(latestVitals: any): string[] {
  const conditions: string[] = [];
  if (latestVitals?.spo2 && latestVitals.spo2 < 96) conditions.push(`SpO2 < ${Math.max(90, latestVitals.spo2 - 2)}%`);
  else conditions.push('SpO2 < 92%');
  conditions.push('PA systolique < 90 mmHg', 'FC > 130 ou < 45 bpm', 'EVA douleur > 6/10', 'Trouble conscience');
  return conditions;
}

function getComfortNeeds(patient: any, encounter: any): string[] {
  const needs: string[] = [];
  const age = calculateAge(patient.date_naissance);
  if (age > 75) needs.push('Personne agee — surveillance renforcee, risque chute');
  if (encounter.zone === 'uhcd') needs.push('UHCD — installation prolongee, confort lit');
  needs.push('Hydratation reguliere', 'Position adaptee au motif');
  if (patient.poids && patient.poids > 100) needs.push('Patient forte corpulence — lit adapte');
  return needs;
}

function getMissingDocuments(patient: any): string[] {
  const missing: string[] = [];
  if (!patient.ins_numero) missing.push('Numero INS manquant');
  if (!patient.telephone) missing.push('Telephone non renseigne');
  if (!patient.adresse) missing.push('Adresse non renseignee');
  if (!patient.medecin_traitant) missing.push('Medecin traitant non renseigne');
  if (missing.length === 0) missing.push('Dossier administratif complet');
  return missing;
}

// --- Main component ---
export default function RecapPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [encounter, setEncounter] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [medecinName, setMedecinName] = useState<string | undefined>(undefined);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    if (!encounterId) return;
    fetchAll();
  }, [encounterId]);

  const fetchAll = async () => {
    const { data: enc } = await supabase.from('encounters').select('*').eq('id', encounterId!).single();
    if (!enc) return;
    setEncounter(enc);

    const [patRes, vitRes, rxRes, admRes, procRes, resRes, transRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', enc.patient_id).single(),
      supabase.from('vitals').select('*').eq('encounter_id', encounterId!).order('recorded_at', { ascending: true }),
      supabase.from('prescriptions').select('*').eq('encounter_id', encounterId!).order('created_at', { ascending: true }),
      supabase.from('administrations').select('*').eq('encounter_id', encounterId!).order('administered_at', { ascending: true }),
      supabase.from('procedures').select('*').eq('encounter_id', encounterId!).order('performed_at', { ascending: true }),
      supabase.from('results').select('*').eq('encounter_id', encounterId!).order('received_at', { ascending: true }),
      supabase.from('transmissions').select('*').eq('encounter_id', encounterId!).order('created_at', { ascending: true }),
    ]);

    const vit = vitRes.data || [];
    const rx = rxRes.data || [];
    const adm = admRes.data || [];
    const proc = procRes.data || [];
    const res = resRes.data || [];
    const trans = transRes.data || [];

    if (patRes.data) setPatient(patRes.data);
    setVitals(vit);
    setPrescriptions(rx);
    setAdministrations(adm);
    setProcedures(proc);
    setResults(res);
    setTransmissions(trans);

    if (enc.medecin_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', enc.medecin_id).single();
      if (profile) setMedecinName(profile.full_name);
    }

    // Build timeline
    const events: TimelineEvent[] = [];

    // Triage event
    if (enc.triage_time) {
      events.push({
        id: `triage-${enc.id}`,
        timestamp: enc.triage_time,
        type: 'triage',
        content: `Tri IOA : CIMU ${enc.cimu || '?'} — ${enc.motif_sfmu || 'Motif non precise'} — ${enc.zone ? enc.zone.toUpperCase() : 'Zone non definie'}`,
        author_role: 'IOA',
        is_critical: enc.cimu != null && enc.cimu <= 2,
      });
    }

    // Vitals
    vit.forEach((v, i) => {
      const abnormals = getAbnormalVitals(v);
      events.push({
        id: `vital-${v.id || i}`,
        timestamp: v.recorded_at,
        type: 'vital',
        content: `FC ${v.fc || '-'} | PA ${v.pa_systolique || '-'}/${v.pa_diastolique || '-'} | SpO2 ${v.spo2 || '-'}% | T° ${v.temperature || '-'}°C${v.eva_douleur != null ? ` | EVA ${v.eva_douleur}/10` : ''}`,
        author_role: 'IDE',
        is_critical: abnormals.length > 0,
      });
    });

    // Prescriptions
    rx.forEach((p, i) => {
      events.push({
        id: `rx-${p.id || i}`,
        timestamp: p.created_at,
        type: 'prescription',
        content: `Prescription : ${p.medication_name} ${p.dosage} ${p.route} ${p.frequency || ''}`.trim(),
        author_role: 'Medecin',
        is_critical: p.priority === 'stat',
        status: p.status === 'active' ? 'validated' : 'completed',
      });
    });

    // Administrations
    adm.forEach((a, i) => {
      events.push({
        id: `admin-${a.id || i}`,
        timestamp: a.administered_at,
        type: 'administration',
        content: `Administre : ${a.dose_given} ${a.route}`,
        author_role: 'IDE',
        is_critical: false,
      });
    });

    // Results
    res.forEach((r, i) => {
      events.push({
        id: `result-${r.id || i}`,
        timestamp: r.received_at,
        type: 'result',
        content: `Resultat ${r.category} : ${r.title}${r.is_critical ? ' — CRITIQUE' : ''}`,
        author_role: 'Labo/Imagerie',
        is_critical: r.is_critical,
      });
    });

    // Procedures
    proc.forEach((p, i) => {
      events.push({
        id: `proc-${p.id || i}`,
        timestamp: p.performed_at,
        type: 'procedure',
        content: `Acte : ${p.procedure_type.toUpperCase()}${p.notes ? ` — ${p.notes}` : ''}`,
        author_role: 'IDE',
        is_critical: false,
      });
    });

    // Transmissions
    trans.forEach((t, i) => {
      events.push({
        id: `trans-${t.id || i}`,
        timestamp: t.created_at,
        type: 'transmission',
        content: `Transmission DAR${t.cible ? ` — Cible: ${t.cible}` : ''}`,
        author_role: 'IDE',
        is_critical: false,
      });
    });

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setTimeline(events);

    // Audit log
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'recap_viewed', resource_type: 'encounter', resource_id: enc.id,
      });
    }
  };

  if (!patient || !encounter) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const age = calculateAge(patient.date_naissance);
  const filteredTimeline = filter === 'all' ? timeline : timeline.filter(e => e.type === filter);
  const conclusion = generateConclusion(role, encounter, patient, vitals, prescriptions, administrations, results);

  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const pendingAdmin = prescriptions
    .filter(rx => rx.status === 'active')
    .filter(rx => !administrations.some(a => a.prescription_id === rx.id));
  const alerts = [
    ...getAbnormalVitals(latestVitals).map(v => `Constante anormale : ${v}`),
    ...results.filter(r => r.is_critical).map(r => `Resultat critique : ${r.title}`),
    ...(patient.allergies?.length ? [`Allergies : ${patient.allergies.join(', ')}`] : []),
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'vital', label: 'Constantes' },
    { key: 'prescription', label: 'Prescriptions' },
    { key: 'administration', label: 'Administrations' },
    { key: 'result', label: 'Resultats' },
    { key: 'procedure', label: 'Actes' },
    { key: 'transmission', label: 'Transmissions' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <PatientBanner
        nom={patient.nom}
        prenom={patient.prenom}
        age={age}
        sexe={patient.sexe}
        ccmu={encounter.ccmu}
        motif={encounter.motif_sfmu}
        allergies={patient.allergies || []}
        boxNumber={encounter.box_number}
        poids={patient.poids}
        medecinName={medecinName}
        encounterId={encounterId}
        onBack={() => navigate(-1)}
      />

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Recap patient</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactMode(!compactMode)}
            className="flex items-center gap-1.5"
          >
            {compactMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {compactMode ? '2 min' : 'Complet'}
          </Button>
        </div>

        {/* COUCHE 1 — Situation actuelle */}
        <Card className="animate-in fade-in duration-300">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-2">Situation actuelle</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {patient.nom.toUpperCase()} {patient.prenom}, {age}a, arrive(e) a{' '}
              {encounter.arrival_time
                ? format(new Date(encounter.arrival_time), 'HH:mm')
                : '?'}{' '}
              pour {encounter.motif_sfmu || 'motif non precise'}.
              {encounter.ccmu ? ` CCMU ${encounter.ccmu}.` : ''}
              {encounter.zone ? ` Zone : ${encounter.zone.toUpperCase()}` : ''}
              {encounter.box_number ? ` Box ${encounter.box_number}.` : '.'}
              {medecinName ? ` Dr. ${medecinName}.` : ''}
            </p>
            {patient.allergies?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {patient.allergies.map((a: string) => (
                  <Badge key={a} variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {a}
                  </Badge>
                ))}
              </div>
            )}

            {/* Compact mode — quick summary */}
            {compactMode && (
              <div className="mt-3 space-y-2 border-t pt-3">
                {latestVitals && (
                  <p className="text-sm">
                    <span className="font-medium">Constantes :</span>{' '}
                    FC {latestVitals.fc || '-'} | PA {latestVitals.pa_systolique || '-'}/{latestVitals.pa_diastolique || '-'} | SpO2 {latestVitals.spo2 || '-'}% | T° {latestVitals.temperature || '-'}°C
                    {latestVitals.eva_douleur != null ? ` | EVA ${latestVitals.eva_douleur}` : ''}
                  </p>
                )}
                {pendingAdmin.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Traitements en attente :</span>{' '}
                    {pendingAdmin.map(rx => `${rx.medication_name} ${rx.dosage}`).join(', ')}
                  </p>
                )}
                {alerts.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-red-600 dark:text-red-400">Alertes :</span>{' '}
                    {alerts.join(' | ')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* COUCHE 2 — Timeline (hidden in compact mode) */}
        {!compactMode && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-1.5">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                    filter === f.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent border-border',
                  )}
                >
                  {f.label}
                  {f.key !== 'all' && (
                    <span className="ml-1 opacity-70">
                      ({timeline.filter(e => e.type === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Timeline events */}
            <Card className="animate-in fade-in duration-300">
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline ({filteredTimeline.length} evenements)
                </h2>
                {filteredTimeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun evenement</p>
                ) : (
                  <div className="space-y-1">
                    {filteredTimeline.map((event, idx) => (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-start gap-3 px-3 py-2 rounded-lg text-sm animate-in fade-in',
                          event.is_critical && 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500',
                          event.type === 'administration' && !event.is_critical && 'bg-green-50 dark:bg-green-950/20',
                          event.type === 'prescription' && !event.is_critical && 'bg-blue-50 dark:bg-blue-950/20',
                          !event.is_critical && event.type === 'vital' && 'bg-gray-50 dark:bg-gray-900/30',
                          !event.is_critical && event.type === 'result' && 'bg-purple-50 dark:bg-purple-950/20',
                          !event.is_critical && event.type === 'procedure' && 'bg-orange-50 dark:bg-orange-950/20',
                          !event.is_critical && event.type === 'transmission' && 'bg-yellow-50 dark:bg-yellow-950/20',
                          !event.is_critical && event.type === 'triage' && 'bg-indigo-50 dark:bg-indigo-950/20',
                        )}
                        style={{ animationDelay: `${idx * 20}ms`, animationFillMode: 'both' }}
                      >
                        <span className="text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap text-xs mt-0.5">
                          {format(new Date(event.timestamp), 'HH:mm')}
                        </span>
                        <TypeIcon type={event.type} className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{event.content}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{event.author_role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* COUCHE 3 — Conclusion par role */}
        <Card className="animate-in fade-in duration-300">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3">{conclusion.title}</h2>
            {conclusion.sections.map(section => (
              <div key={section.label} className="mb-3">
                <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {section.label}
                </h3>
                <ul className="mt-1 space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t text-xs text-gray-400 dark:text-gray-500">
              Genere a {format(new Date(), 'HH:mm')} — Base sur les donnees structurees du dossier. Aucune interpretation IA.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
