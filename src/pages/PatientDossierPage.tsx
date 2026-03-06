import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { IdentityBanner } from '@/components/urgence/IdentityBanner';
import { SIHTimeline } from '@/components/urgence/SIHTimeline';
import { CommunicationEntryButton } from '@/components/urgence/CommunicationEntry';
import { LabAlertNotification } from '@/components/urgence/LabAlertNotification';
import { SIH_PATIENTS } from '@/lib/sih-demo-data';
import { generateIPP } from '@/lib/homonymy-detection';
import type { TimelineEntry } from '@/lib/sih-types';
import { isVitalAbnormal } from '@/lib/vitals-utils';
import { calculateAge } from '@/lib/vitals-utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, DoorOpen, ToggleLeft, ToggleRight, Send, Loader2, FileText, Share2, FileDown, History, Microscope, ScanLine, Pill, Stethoscope, Eye, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FHIRViewer } from '@/components/urgence/interop/FHIRViewer';
import { CRHPreview } from '@/components/urgence/documents/CRHPreview';
import { DischargeDialog } from '@/components/urgence/DischargeDialog';
import { RecapDrawer } from '@/components/urgence/RecapDrawer';
import { PatientTimeline } from '@/components/urgence/PatientTimeline';
import { AISynthesisPanel } from '@/components/urgence/AISynthesisPanel';
import { ProtocolLibrary } from '@/components/urgence/ProtocolLibrary';
import { ChatPanel } from '@/components/urgence/ChatPanel';
import type { ChatChannel } from '@/hooks/useChat';
import { toast } from 'sonner';

// Feature modules
import { usePatientData } from '@/features/patient-dossier/hooks/usePatientData';
import { usePrescription } from '@/features/patient-dossier/hooks/usePrescription';
import { useInterop } from '@/features/patient-dossier/hooks/useInterop';
import { VitalsPanel } from '@/features/patient-dossier/components/VitalsPanel';
import { ResultsPanel } from '@/features/patient-dossier/components/ResultsPanel';
import { PrescriptionPanel } from '@/features/patient-dossier/components/PrescriptionPanel';
import { detectContext, getOrderedVitalKeys, CONTEXT_LABELS } from '@/features/patient-dossier/types';

export default function PatientDossierPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { demoRole } = useDemo();
  const { role } = useAuth();
  const { isDemoMode } = useDemo();
  const effectiveRole = isDemoMode ? demoRole : role;
  const isReadOnly = effectiveRole === 'as' || effectiveRole === 'secretaire';

  // Data
  const data = usePatientData(encounterId);
  const { encounter, patient, vitals, prescriptions, results, timeline, medecinName, sihTimelineEntries, setSihTimelineEntries, sihLabAlerts, setSihLabAlerts, fetchAll } = data;

  // Prescription logic
  const rx = usePrescription(encounter, patient, prescriptions, fetchAll);

  // Interop (FHIR, CRH, ordonnance)
  const interop = useInterop(encounter, patient, vitals, prescriptions, results, timeline, medecinName);

  // Local UI state
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [timelineEssential, setTimelineEssential] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [diagnosticContent, setDiagnosticContent] = useState('');
  const [savingDiag, setSavingDiag] = useState(false);

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !patient || !user) return;
    setSavingNote(true);
    const { error } = await supabase.from('timeline_items').insert({
      patient_id: patient.id, item_type: 'crh' as any,
      content: noteContent.trim(), source_author: user.email,
      source_date: new Date().toISOString().split('T')[0],
    });
    if (error) { toast.error('Erreur d\'enregistrement'); setSavingNote(false); return; }
    toast.success('Note enregistrée');
    setNoteContent(''); setSavingNote(false); fetchAll();
  };

  const handleSaveDiagnostic = async () => {
    if (!diagnosticContent.trim() || !patient || !user) return;
    setSavingDiag(true);
    await supabase.from('timeline_items').insert({
      patient_id: patient.id, item_type: 'diagnostic' as any,
      content: diagnosticContent.trim(), source_author: user.email,
      source_date: new Date().toISOString().split('T')[0],
    });
    toast.success('Diagnostic enregistré');
    setDiagnosticContent(''); setSavingDiag(false); fetchAll();
  };

  if (!patient || !encounter) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const age = calculateAge(patient.date_naissance);
  const dossierContext = detectContext(encounter);
  const { orderedVitalKeys, contextPriorityVitals } = getOrderedVitalKeys(dossierContext);
  const showResultsFirst = ['cardio', 'respiratoire', 'infectieux'].includes(dossierContext);

  return (
    <div className="min-h-screen bg-background has-bottom-nav">
      <IdentityBanner
        nom={patient.nom} prenom={patient.prenom} dateNaissance={patient.date_naissance}
        sexe={patient.sexe} patientId={patient.id} encounterId={encounterId}
        service={encounter.zone === 'uhcd' ? 'UHCD' : encounter.zone === 'dechocage' ? 'Dechocage' : 'SAU'}
        ccmu={encounter.ccmu} cimu={encounter.cimu} motif={encounter.motif_sfmu}
        allergies={patient.allergies || []} boxNumber={encounter.box_number}
        poids={patient.poids} photoUrl={patient.photo_url} allPatients={SIH_PATIENTS}
        medecinName={medecinName} onBack={() => navigate(-1)}
      />

      <LabAlertNotification
        alerts={sihLabAlerts.filter(a => a.patient_id === patient.id)}
        onAcknowledge={(alertId, note) => {
          setSihLabAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, acknowledged: true, acknowledged_by: user?.id || 'user', acknowledged_at: new Date().toISOString(), acknowledgment_note: note } : a
          ));
          toast.success('Alerte acquittee — Vu et pris en compte');
        }}
      />

      <div className="max-w-7xl mx-auto p-4">
        {isReadOnly && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1.5 w-fit"><Eye className="h-4 w-4" /> Consultation seule</Badge>
          </div>
        )}
        {!isReadOnly && (
          <div className="flex justify-end gap-2 mb-4 overflow-x-auto scrollbar-hide flex-nowrap pb-1 -mb-1">
            <div className="shrink-0"><ProtocolLibrary onApplyProtocol={rx.handleApplyPack} motifSfmu={encounter.motif_sfmu} /></div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={interop.handleExportFHIR}><Share2 className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Export</span> FHIR</Button>
            <Button variant="outline" size="sm" className="shrink-0" onClick={interop.handleGenerateCRH}><FileText className="h-4 w-4 mr-1" /> CRH</Button>
            <Button variant="outline" size="sm" className="shrink-0" onClick={interop.handleGenerateOrdonnance}><FileDown className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Ordonnance</span><span className="sm:hidden">Ordo</span></Button>
            <div className="shrink-0">
              <ChatPanel
                channels={[
                  { type: 'patient', id: encounterId || '', label: `${patient.nom} ${patient.prenom}`, icon: 'user' },
                  { type: 'zone', id: encounter.zone || 'sau', label: `Zone ${(encounter.zone || 'sau').toUpperCase()}`, icon: 'radio' },
                  { type: 'general', id: 'general', label: 'Général', icon: 'hash' },
                ] as ChatChannel[]}
                defaultChannel={{ type: 'patient', id: encounterId || '', label: `${patient.nom} ${patient.prenom}`, icon: 'user' }}
                triggerLabel="Chat"
              />
            </div>
            {encounter.status !== 'finished' && (
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => setDischargeOpen(true)}><DoorOpen className="h-4 w-4 mr-1" /> Sortie</Button>
            )}
          </div>
        )}
        {!isReadOnly && (
          <DischargeDialog open={dischargeOpen} onOpenChange={setDischargeOpen} encounterId={encounter.id} patientId={encounter.patient_id} userId={user?.id || ''}
            motif={encounter.motif_sfmu} prescriptions={prescriptions} diagnostics={timeline.filter(t => t.item_type === 'diagnostic')} vitals={vitals}
            onDone={() => { fetchAll(); navigate('/board'); }} />
        )}

        {/* Priority banner */}
        {!isReadOnly && (() => {
          const criticalResults = results.filter(r => r.is_critical && !r.is_read);
          const unreadResults = results.filter(r => !r.is_read);
          const abnormalVitals = vitals.length > 0 ? (() => {
            const last = vitals[vitals.length - 1];
            const abnormals: string[] = [];
            if (isVitalAbnormal('fc', last.fc)) abnormals.push(`FC ${last.fc}`);
            if (isVitalAbnormal('pa_systolique', last.pa_systolique)) abnormals.push(`PA ${last.pa_systolique}/${last.pa_diastolique || '?'}`);
            if (isVitalAbnormal('spo2', last.spo2)) abnormals.push(`SpO2 ${last.spo2}%`);
            if (isVitalAbnormal('temperature', last.temperature)) abnormals.push(`T ${last.temperature}`);
            return abnormals;
          })() : [];
          const isCritical = (encounter.ccmu && encounter.ccmu >= 4) || criticalResults.length > 0;
          const hasAlerts = abnormalVitals.length > 0 || unreadResults.length > 0;
          if (!isCritical && !hasAlerts) return null;
          return (
            <div className={cn('mb-4 p-3 rounded-lg border flex flex-wrap items-center gap-3',
              isCritical ? 'border-medical-critical/40 bg-medical-critical/5' : 'border-medical-warning/40 bg-medical-warning/5')}>
              <AlertTriangle className={cn('h-4 w-4 shrink-0', isCritical ? 'text-medical-critical' : 'text-medical-warning')} />
              <span className={cn('text-sm font-semibold', isCritical ? 'text-medical-critical' : 'text-medical-warning')}>
                {isCritical ? 'Patient critique' : 'Points d\'attention'}
              </span>
              {criticalResults.length > 0 && <Badge className="bg-medical-critical text-medical-critical-foreground text-xs">{criticalResults.length} resultat(s) critique(s) non lu(s)</Badge>}
              {abnormalVitals.length > 0 && <Badge variant="outline" className="text-xs border-medical-warning/30 text-medical-warning">Constantes anormales : {abnormalVitals.join(', ')}</Badge>}
              {unreadResults.length > 0 && criticalResults.length === 0 && <Badge variant="outline" className="text-xs">{unreadResults.length} resultat(s) non lu(s)</Badge>}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left column — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {!isReadOnly && (
              <AISynthesisPanel
                patientData={{
                  patient: { nom: patient.nom, prenom: patient.prenom, date_naissance: patient.date_naissance, sexe: patient.sexe, poids: patient.poids, allergies: patient.allergies, antecedents: patient.antecedents, medecin_traitant: patient.medecin_traitant },
                  encounter: { motif_sfmu: encounter.motif_sfmu, ccmu: encounter.ccmu, cimu: encounter.cimu, zone: encounter.zone, arrival_time: encounter.arrival_time },
                  vitals: vitals.map(v => ({ fc: v.fc, pa_systolique: v.pa_systolique, pa_diastolique: v.pa_diastolique, spo2: v.spo2, temperature: v.temperature, frequence_respiratoire: v.frequence_respiratoire, gcs: v.gcs, eva_douleur: v.eva_douleur, recorded_at: v.recorded_at })),
                  prescriptions: prescriptions.map(rx => ({ medication_name: rx.medication_name, dosage: rx.dosage, route: rx.route, status: rx.status })),
                  results: results.map(r => ({ title: r.title, category: r.category, content: r.content, is_critical: r.is_critical })),
                  timeline: timeline.map(t => ({ item_type: t.item_type, content: t.content })),
                }}
                onCRHGenerated={interop.handleSetAICRH}
                className="animate-in fade-in duration-300"
              />
            )}

            {!isReadOnly && (
              <Card className="animate-in fade-in duration-300">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Notes médicales</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Observation clinique, hypothèse diagnostique..." rows={3} className="flex-1" />
                    <Button onClick={handleSaveNote} disabled={!noteContent.trim() || savingNote} className="self-end"><Send className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isReadOnly && (
              <Card className="animate-in fade-in duration-300" style={{ animationDelay: '25ms', animationFillMode: 'both' }}>
                <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> Diagnostic</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={diagnosticContent} onChange={e => setDiagnosticContent(e.target.value)} placeholder="Diagnostic CIM-10 (ex: J18.9 — Pneumonie)" className="flex-1" />
                    <Button onClick={handleSaveDiagnostic} disabled={!diagnosticContent.trim() || savingDiag}><Send className="h-4 w-4" /></Button>
                  </div>
                  {timeline.filter(t => t.item_type === 'diagnostic').length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {timeline.filter(t => t.item_type === 'diagnostic').map(d => (
                        <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border bg-primary/5">
                          <Microscope className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium">{d.content}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{d.source_date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SIH Timeline */}
            {sihTimelineEntries.length > 0 && (
              <Card className="animate-in fade-in duration-300" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Fil chronologique SIH</CardTitle>
                  {!isReadOnly && patient && (
                    <CommunicationEntryButton
                      patientId={patient.id} patientIpp={generateIPP(patient.id)} encounterId={encounterId!}
                      authorId={user?.id || 'demo'} authorName={medecinName || user?.email || 'Clinicien'}
                      onSubmit={(comm) => {
                        const newEntry: TimelineEntry = {
                          id: `comm-${Date.now()}`, encounter_id: encounterId!, patient_id: patient.id,
                          patient_ipp: generateIPP(patient.id),
                          entry_type: comm.type === 'prescription_orale' ? 'prescription_orale' : comm.type === 'appel_labo' ? 'alerte_labo' : 'communication',
                          content: comm.content, author_id: comm.author_id, author_name: comm.author_name,
                          validation_status: comm.type === 'appel_labo' ? 'critique' : 'en_attente',
                          created_at: new Date().toISOString(), lab_result_value: comm.lab_result_value, lab_interlocutor: comm.lab_interlocutor,
                        };
                        setSihTimelineEntries(prev => [newEntry, ...prev]);
                        toast.success('Communication enregistree dans le fil');
                      }}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <SIHTimeline entries={sihTimelineEntries}
                    onValidateOralPrescription={(entryId) => { setSihTimelineEntries(prev => prev.map(e => e.id === entryId ? { ...e, validation_status: 'valide' as const, validated_at: new Date().toISOString() } : e)); toast.success('Prescription orale validee'); }}
                    onAcknowledgeLabAlert={(entryId) => { setSihTimelineEntries(prev => prev.map(e => e.id === entryId ? { ...e, validation_status: 'valide' as const } : e)); toast.success('Alerte labo acquittee'); }}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="animate-in fade-in duration-300" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Timeline patient</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTimelineEssential(!timelineEssential)}>
                  {timelineEssential ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                  {timelineEssential ? 'Essentiel' : 'Voir tout'}
                </Button>
              </CardHeader>
              <CardContent><PatientTimeline items={timeline} showEssentialOnly={timelineEssential} /></CardContent>
            </Card>
          </div>

          {/* Right column — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {dossierContext !== 'default' && (
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium',
                dossierContext === 'sortie' ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400' : 'border-primary/30 bg-primary/5 text-primary')}>
                <ScanLine className="h-3.5 w-3.5" /> {CONTEXT_LABELS[dossierContext]} — sections adaptees
              </div>
            )}

            {dossierContext === 'sortie' && !isReadOnly && (
              <Card className="animate-in fade-in duration-300 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3"><DoorOpen className="h-4 w-4 text-green-600" /><span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Actions de sortie</span></div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={interop.handleGenerateCRH} className="border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10"><FileText className="h-4 w-4 mr-1" /> Generer CRH</Button>
                    <Button size="sm" variant="outline" onClick={interop.handleGenerateOrdonnance} className="border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10"><FileDown className="h-4 w-4 mr-1" /> Ordonnance</Button>
                    {encounter.status !== 'finished' && <Button size="sm" onClick={() => setDischargeOpen(true)} className="bg-green-600 hover:bg-green-700 text-white"><DoorOpen className="h-4 w-4 mr-1" /> Preparer sortie</Button>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allergies + antecedents */}
            {(patient.antecedents?.length > 0 || patient.allergies?.length > 0) && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4 space-y-3">
                  {patient.allergies?.length > 0 && (
                    <div className="p-3 rounded-lg border border-medical-critical/30 bg-medical-critical/5">
                      <div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="h-4 w-4 text-medical-critical" /><span className="text-xs font-semibold text-medical-critical uppercase tracking-wide">Allergies</span></div>
                      <div className="flex flex-wrap gap-1.5">{patient.allergies.map((a: string, i: number) => <Badge key={i} variant="outline" className="border-medical-critical/30 text-medical-critical text-xs">{a}</Badge>)}</div>
                    </div>
                  )}
                  {patient.antecedents?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><History className="h-4 w-4 text-muted-foreground" /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Antécédents</span></div>
                      <div className="flex flex-wrap gap-1.5">{patient.antecedents.map((a: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Traitements en cours */}
            {patient.traitements_actuels && (Array.isArray(patient.traitements_actuels) ? patient.traitements_actuels.length > 0 : Object.keys(patient.traitements_actuels).length > 0) && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><Pill className="h-4 w-4 text-medical-warning" /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Traitements en cours</span></div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(patient.traitements_actuels) ? patient.traitements_actuels : Object.entries(patient.traitements_actuels).map(([k, v]) => `${k}: ${v}`)).map((t: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs border-medical-warning/30 text-medical-warning">{typeof t === 'object' ? JSON.stringify(t) : String(t)}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {patient.medecin_traitant && (
              <Card className="animate-in fade-in duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-muted-foreground" /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Médecin traitant</span></div>
                  <p className="text-sm font-medium mt-1">{patient.medecin_traitant}</p>
                </CardContent>
              </Card>
            )}

            <VitalsPanel vitals={vitals} orderedVitalKeys={orderedVitalKeys} contextPriorityVitals={contextPriorityVitals} />

            {showResultsFirst && !isReadOnly && <ResultsPanel results={results} showResultsFirst={showResultsFirst} fetchAll={fetchAll} />}

            {!isReadOnly && (
              <PrescriptionPanel
                prescriptions={prescriptions} encounter={encounter} vitals={vitals}
                {...rx}
              />
            )}

            {!showResultsFirst && !isReadOnly && <ResultsPanel results={results} showResultsFirst={showResultsFirst} fetchAll={fetchAll} />}
          </div>
        </div>
      </div>

      {encounterId && <RecapDrawer encounterId={encounterId} />}

      <Sheet open={interop.fhirDrawerOpen} onOpenChange={interop.setFhirDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] p-0">
          <SheetHeader className="sr-only"><SheetTitle>Export FHIR R4</SheetTitle></SheetHeader>
          {interop.fhirBundle && <FHIRViewer bundle={interop.fhirBundle} title={`Bundle FHIR — ${patient.nom} ${patient.prenom}`} />}
        </SheetContent>
      </Sheet>

      <Sheet open={interop.crhDrawerOpen} onOpenChange={interop.setCrhDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader className="sr-only"><SheetTitle>CRH</SheetTitle></SheetHeader>
          <CRHPreview htmlContent={interop.crhHTML} status={interop.crhStatus} onSign={interop.handleSignCRH} onSendMSSante={interop.handleSendMSSante} />
        </SheetContent>
      </Sheet>

      <Sheet open={interop.ordonnanceDrawerOpen} onOpenChange={interop.setOrdonnanceDrawerOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader className="sr-only"><SheetTitle>Ordonnance</SheetTitle></SheetHeader>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Ordonnance — {patient.nom} {patient.prenom}</h3>
            <div dangerouslySetInnerHTML={{ __html: interop.ordonnanceHTML }} className="prose prose-sm max-w-none" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
