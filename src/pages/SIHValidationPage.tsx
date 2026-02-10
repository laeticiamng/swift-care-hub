/**
 * SIH CDC Validation Scenarios — TV-01 to TV-08
 * Interactive demonstration of all 8 test scenarios from the CDC
 * Based on Dr. Laeticia Motongane's ORION analysis
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, AlertTriangle, ShieldAlert, Phone, Pill, Eye,
  Bell, Users, Syringe, FileText, Activity, Clock, Shield, Play, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HomonymyAlertDialog } from '@/components/urgence/HomonymyAlert';
import { IdentityVerificationDialog } from '@/components/urgence/IdentityVerificationDialog';
import { LabAlertNotification } from '@/components/urgence/LabAlertNotification';
import { SIHTimeline } from '@/components/urgence/SIHTimeline';
import { CommunicationEntryButton } from '@/components/urgence/CommunicationEntry';
import {
  SIH_PATIENTS, SIH_TIMELINE_ENTRIES, SIH_LAB_ALERTS,
  SIH_COMMUNICATIONS, SIH_PRESCRIPTIONS,
} from '@/lib/sih-demo-data';
import type { HomonymyAlert } from '@/lib/sih-types';
import { detectHomonymy } from '@/lib/homonymy-detection';
import { toast } from 'sonner';

interface Scenario {
  id: string;
  title: string;
  module: string;
  priority: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'TV-01', title: 'Homonymie detectee', module: 'M1-02',
    priority: 'P0', description: '2 patients DUPONT Marie — bandeau rouge clignotant + popup confirmation obligatoire',
    icon: <ShieldAlert className="h-5 w-5" />, color: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  },
  {
    id: 'TV-02', title: 'Appel labo trace', module: 'M2-02 + M6-01',
    priority: 'P0', description: 'K+ = 2.9 mmol/L — entree dans le fil < 30s sur tous postes',
    icon: <Phone className="h-5 w-5" />, color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'TV-03', title: 'Blocage prescription croisee', module: 'M4-01',
    priority: 'P0', description: 'Prescrire K+ pour patient B avec resultat patient A → BLOCAGE non contournable',
    icon: <Shield className="h-5 w-5" />, color: 'border-red-600 bg-red-50 dark:bg-red-950/20',
  },
  {
    id: 'TV-04', title: 'Prescription sans resultat visible', module: 'M5-02',
    priority: 'P0', description: 'Resultat bio absent → alerte bloquante avant administration',
    icon: <AlertTriangle className="h-5 w-5" />, color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'TV-05', title: 'Prescription orale tracee', module: 'M2-03 + M4-02',
    priority: 'P0', description: 'Tag orange "En attente validation" → relance automatique → conversion 1 clic',
    icon: <Pill className="h-5 w-5" />, color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'TV-06', title: 'Acquittement avec escalade', module: 'M3-03',
    priority: 'P0', description: 'Alerte critique → rappel 5 min → senior 10 min → chef garde 15 min',
    icon: <Bell className="h-5 w-5" />, color: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  },
  {
    id: 'TV-07', title: 'Mode garde multi-services', module: 'M7-01',
    priority: 'P0', description: 'Vue unifiee SAU + UHCD + Dechocage avec routage alertes',
    icon: <Users className="h-5 w-5" />, color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'TV-08', title: 'Reverification IDE avant administration', module: 'M5-01 + M5-03',
    priority: 'P0', description: 'Affichage identite + resultat bio + prescription → concordance 5B',
    icon: <Syringe className="h-5 w-5" />, color: 'border-green-500 bg-green-50 dark:bg-green-950/20',
  },
];

export default function SIHValidationPage() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  // TV-01 state
  const [showHomonymyDialog, setShowHomonymyDialog] = useState(false);
  const [homonymyAlerts, setHomonymyAlerts] = useState<HomonymyAlert[]>([]);

  // TV-02 state - SIH Timeline
  const [timelineEntries, setTimelineEntries] = useState(SIH_TIMELINE_ENTRIES);

  // TV-05 state - Oral prescription
  const [oralPrescriptions, setOralPrescriptions] = useState(SIH_PRESCRIPTIONS.filter(p => p.origin === 'orale'));

  // TV-06 state - Lab alerts with escalation
  const [labAlerts, setLabAlerts] = useState(SIH_LAB_ALERTS);

  // TV-03 state - Cross-prescription blocking
  const [showIPPMismatch, setShowIPPMismatch] = useState(false);

  // TV-04 state
  const [showMissingResult, setShowMissingResult] = useState(false);

  // TV-08 state
  const [show5BVerification, setShow5BVerification] = useState(false);

  const handleLaunchScenario = (scenarioId: string) => {
    setActiveScenario(scenarioId);

    switch (scenarioId) {
      case 'TV-01': {
        const patient = SIH_PATIENTS[0]; // DUPONT Marie (1958)
        const alerts = detectHomonymy(patient, SIH_PATIENTS);
        setHomonymyAlerts(alerts);
        setShowHomonymyDialog(true);
        break;
      }
      case 'TV-02':
        // Already showing SIH timeline with lab call entries
        break;
      case 'TV-03':
        setShowIPPMismatch(true);
        break;
      case 'TV-04':
        setShowMissingResult(true);
        break;
      case 'TV-05':
        // Already showing oral prescriptions in timeline
        break;
      case 'TV-06':
        // Lab alerts are already shown
        break;
      case 'TV-07':
        navigate('/garde');
        return;
      case 'TV-08':
        setShow5BVerification(true);
        break;
    }
  };

  const markComplete = (scenarioId: string) => {
    setCompletedScenarios(prev => new Set([...prev, scenarioId]));
    setActiveScenario(null);
    toast.success(`Scenario ${scenarioId} valide`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Lab alerts overlay for TV-06 */}
      {activeScenario === 'TV-06' && (
        <LabAlertNotification
          alerts={labAlerts}
          onAcknowledge={(alertId, note) => {
            setLabAlerts(prev => prev.map(a =>
              a.id === alertId ? { ...a, acknowledged: true, acknowledged_by: 'demo', acknowledged_at: new Date().toISOString(), acknowledgment_note: note } : a
            ));
            markComplete('TV-06');
          }}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 border-b px-4 py-3 shadow-sm bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">Urgence<span className="text-primary">OS</span></span>
            <span className="text-muted-foreground text-sm">— Scenarios de validation CDC SIH</span>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {completedScenarios.size}/8 valides
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Overview */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-2xl font-bold">Scenarios de validation TV-01 a TV-08</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            8 scenarios de test extraits du Cahier des Charges SIH Urgences.
            Chaque scenario valide un ou plusieurs modules fonctionnels (M1 a M8).
          </p>
        </div>

        {/* Scenario cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {SCENARIOS.map(scenario => {
            const isCompleted = completedScenarios.has(scenario.id);
            const isActive = activeScenario === scenario.id;

            return (
              <Card
                key={scenario.id}
                className={cn(
                  'transition-all cursor-pointer',
                  scenario.color,
                  isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  isActive && 'ring-2 ring-primary',
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        isCompleted ? 'text-green-600' : '',
                      )}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : scenario.icon}
                      </span>
                      <div>
                        <span className="font-bold text-sm">{scenario.id}</span>
                        <span className="text-xs text-muted-foreground ml-2">{scenario.module}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{scenario.priority}</Badge>
                  </div>

                  <div>
                    <p className="font-medium text-sm">{scenario.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                  </div>

                  <Button
                    size="sm"
                    className={cn(
                      'w-full min-h-[44px] text-xs',
                      isCompleted && 'bg-green-600 hover:bg-green-700',
                    )}
                    onClick={() => handleLaunchScenario(scenario.id)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Valide</>
                    ) : (
                      <><Play className="h-3.5 w-3.5 mr-1" /> Lancer le scenario</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active scenario detail panels */}

        {/* TV-01: Homonymy */}
        {showHomonymyDialog && homonymyAlerts.length > 0 && (
          <HomonymyAlertDialog
            alerts={homonymyAlerts}
            currentPatient={SIH_PATIENTS[0]}
            onConfirm={() => { setShowHomonymyDialog(false); markComplete('TV-01'); }}
            onCancel={() => setShowHomonymyDialog(false)}
          />
        )}

        {/* TV-02: Lab call in timeline */}
        {activeScenario === 'TV-02' && (
          <Card className="border-orange-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-500" />
                TV-02 — Appel labo trace dans le fil chronologique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Patient PETIT Jean — K+ = 2.9 mmol/L signale par le labo.
                L'entree apparait dans le fil en &lt;30 secondes.
              </p>
              <SIHTimeline
                entries={timelineEntries.filter(e => e.patient_id === 'demo-p4')}
                onAcknowledgeLabAlert={() => markComplete('TV-02')}
              />
            </CardContent>
          </Card>
        )}

        {/* TV-03: Cross-prescription blocking */}
        {showIPPMismatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="max-w-md border-2 border-red-600 animate-in zoom-in duration-200">
              <CardContent className="p-6 space-y-4 text-center">
                <ShieldAlert className="h-12 w-12 text-red-600 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-red-600">BLOCAGE — Verification IPP</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>IPP resultat bio</strong> (IPP-DEMOP4) ≠ <strong>IPP patient actif</strong> (IPP-DEMOP1)
                </p>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                    Tentative de prescription de KCl pour le patient DUPONT Marie (IPP-DEMOP1) basee sur le resultat de PETIT Jean (IPP-DEMOP4). ACTION BLOQUEE.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  M4-01 — Le systeme verifie que IPP resultat = IPP patient actif.
                  Ce blocage est non contournable.
                </p>
                <Button
                  className="w-full min-h-[44px] bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => { setShowIPPMismatch(false); markComplete('TV-03'); }}
                >
                  Compris — Retour au dossier
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TV-04: Missing result alert */}
        {showMissingResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="max-w-md border-2 border-amber-500 animate-in zoom-in duration-200">
              <CardContent className="p-6 space-y-4 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto" />
                <h3 className="text-lg font-bold text-amber-600">ALERTE — Resultat bio absent</h3>
                <p className="text-sm text-muted-foreground">
                  Aucun resultat de kaliemie retrouve pour le patient.
                  La prescription d'electrolytes necessite un resultat biologique recente.
                </p>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    M5-02 — Alerte bloquante: resultat bio absent avant administration.
                    Veuillez verifier le dossier biologique du patient.
                  </p>
                </div>
                <Button
                  className="w-full min-h-[44px]"
                  onClick={() => { setShowMissingResult(false); markComplete('TV-04'); }}
                >
                  Compris — Verifier les resultats
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TV-05: Oral prescription in timeline */}
        {activeScenario === 'TV-05' && (
          <Card className="border-orange-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-orange-500" />
                TV-05 — Prescription orale tracee + tag orange
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                KCl 1g IV sur 1h — prescription orale du Dr. Dupont suite appel labo K+ 2.9.
                Tag orange "En attente validation". Cliquez pour valider en 1 clic.
              </p>
              <SIHTimeline
                entries={timelineEntries.filter(e => e.patient_id === 'demo-p4' && (e.entry_type === 'prescription_orale' || e.entry_type === 'alerte_labo'))}
                onValidateOralPrescription={() => markComplete('TV-05')}
              />
            </CardContent>
          </Card>
        )}

        {/* TV-08: 5B Verification */}
        {show5BVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-lg w-full border-2 border-green-500 animate-in zoom-in duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Syringe className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Reverification IDE — Concordance 5B</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  M5-01 + M5-03 — Avant administration, verification obligatoire:
                </p>

                <div className="space-y-2">
                  {[
                    { label: 'Bon Patient', detail: 'PETIT Jean — IPP-DEMOP4 — DDN 30/01/1948', icon: <Shield className="h-4 w-4" /> },
                    { label: 'Bon Medicament', detail: 'Chlorure de potassium (KCl)', icon: <Pill className="h-4 w-4" /> },
                    { label: 'Bonne Dose', detail: '1g en perfusion lente', icon: <Activity className="h-4 w-4" /> },
                    { label: 'Bonne Voie', detail: 'IV (intraveineuse)', icon: <Syringe className="h-4 w-4" /> },
                    { label: 'Bon Moment', detail: `${new Date().toLocaleTimeString('fr-FR')} — Base: K+ 2.9 mmol/L`, icon: <Clock className="h-4 w-4" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                      <div className="text-green-600">{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    Resultat bio confirme: <strong>K+ = 2.9 mmol/L</strong> (IPP verifie)
                  </p>
                </div>

                <Button
                  className="w-full min-h-[44px] bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setShow5BVerification(false); markComplete('TV-08'); }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer concordance — Administrer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CDC Module summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Couverture CDC SIH — 33 exigences / 8 modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { module: 'M1', name: 'Identite Patient', count: 4, phase: 'Phase 1' },
                { module: 'M2', name: 'Fil chronologique', count: 5, phase: 'Phase 2' },
                { module: 'M3', name: 'Resultats bio & alertes', count: 6, phase: 'Phase 1' },
                { module: 'M4', name: 'Prescription securisee', count: 5, phase: 'Phase 3' },
                { module: 'M5', name: 'Administration IDE', count: 4, phase: 'Phase 3' },
                { module: 'M6', name: 'Tracabilite communications', count: 4, phase: 'Phase 1' },
                { module: 'M7', name: 'Mode garde', count: 4, phase: 'Phase 2' },
                { module: 'M8', name: 'Audit & tracabilite', count: 4, phase: 'Phase 4' },
              ].map(m => (
                <div key={m.module} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{m.module}</Badge>
                    <span className="text-sm font-medium">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{m.count} exigences</Badge>
                    <Badge variant="outline" className="text-xs">{m.phase}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
