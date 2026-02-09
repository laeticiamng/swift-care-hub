import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Activity, CheckCircle2, XCircle, Clock,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Server, FileJson,
  Mail, Shield, Database,
} from 'lucide-react';
import {
  generateDemoHL7Logs,
  type HL7MessageLog,
  type HL7MessageType,
} from '@/lib/interop/hl7v2-adapter';
import { generateDemoMSSanteLogs, type MSSanteLog } from '@/lib/interop/mssante-adapter';
import { ESTABLISHMENT } from '@/lib/interop/coding-systems';

// Connection status for demo
interface SystemConnection {
  name: string;
  protocol: string;
  status: 'connected' | 'disconnected' | 'degraded';
  lastSync: string;
  messagesPerDay: number;
  icon: React.ReactNode;
}

function StatusDot({ status }: { status: 'connected' | 'disconnected' | 'degraded' }) {
  const colors = {
    connected: 'bg-emerald-500',
    disconnected: 'bg-red-500',
    degraded: 'bg-amber-500',
  };
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === 'connected' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`} />
    </span>
  );
}

function HL7MessageTypeIcon({ type }: { type: HL7MessageType }) {
  const labels: Record<HL7MessageType, { label: string; color: string }> = {
    ADT_A01: { label: 'ADT A01', color: 'bg-blue-100 text-blue-700' },
    ADT_A02: { label: 'ADT A02', color: 'bg-blue-100 text-blue-700' },
    ADT_A03: { label: 'ADT A03', color: 'bg-indigo-100 text-indigo-700' },
    ORM_O01: { label: 'ORM O01', color: 'bg-purple-100 text-purple-700' },
    ORU_R01: { label: 'ORU R01', color: 'bg-green-100 text-green-700' },
    UNKNOWN: { label: '???', color: 'bg-gray-100 text-gray-700' },
  };
  const config = labels[type] || labels.UNKNOWN;
  return <Badge className={`${config.color} text-[10px] font-mono`}>{config.label}</Badge>;
}

export default function InteropPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const hl7Logs = generateDemoHL7Logs();
  const mssanteLogs = generateDemoMSSanteLogs();

  const connections: SystemConnection[] = [
    {
      name: 'DXCare (SIH)',
      protocol: 'HL7v2 / MLLP',
      status: 'connected',
      lastSync: new Date(Date.now() - 30000).toLocaleTimeString('fr-FR'),
      messagesPerDay: 487,
      icon: <Server className="h-5 w-5" />,
    },
    {
      name: 'LIMS (Laboratoire)',
      protocol: 'HL7v2 / MLLP',
      status: 'connected',
      lastSync: new Date(Date.now() - 45000).toLocaleTimeString('fr-FR'),
      messagesPerDay: 234,
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: 'PACS (Imagerie)',
      protocol: 'HL7v2 / DICOM',
      status: 'degraded',
      lastSync: new Date(Date.now() - 300000).toLocaleTimeString('fr-FR'),
      messagesPerDay: 89,
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: 'MSSante',
      protocol: 'API REST / CDA',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000).toLocaleTimeString('fr-FR'),
      messagesPerDay: 12,
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  const fhirExports = [
    { id: '1', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), patient: 'DUPONT Jean', resources: 24, size: '12.3 Ko' },
    { id: '2', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), patient: 'MARTIN Marie', resources: 18, size: '8.7 Ko' },
    { id: '3', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), patient: 'BERNARD Pierre', resources: 31, size: '15.2 Ko' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Interoperabilite — Tableau de bord DSI
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ESTABLISHMENT.name} — Supervision des flux d'echange
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Actualiser
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Connection status cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Connexions systemes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {connections.map(conn => (
              <Card key={conn.name} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={conn.status} />
                      <span className="font-semibold text-sm">{conn.name}</span>
                    </div>
                    <div className="text-muted-foreground">{conn.icon}</div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Protocole</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{conn.protocol}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Dernier sync</span>
                      <span className="font-medium">{conn.lastSync}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Messages/jour</span>
                      <span className="font-medium">{conn.messagesPerDay}</span>
                    </div>
                  </div>
                  {conn.status === 'connected' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                  {conn.status === 'degraded' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                  {conn.status === 'disconnected' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {hl7Logs.filter(l => l.status === 'success').length}
              </p>
              <p className="text-xs text-muted-foreground">Messages HL7 OK</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {hl7Logs.filter(l => l.status === 'error').length}
              </p>
              <p className="text-xs text-muted-foreground">Messages en erreur</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{fhirExports.length}</p>
              <p className="text-xs text-muted-foreground">Exports FHIR R4</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-violet-600">
                {mssanteLogs.filter(l => l.status === 'sent').length}
              </p>
              <p className="text-xs text-muted-foreground">Documents MSSante</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed logs */}
        <Tabs defaultValue="hl7" className="space-y-3">
          <TabsList>
            <TabsTrigger value="hl7" className="gap-1.5">
              <Server className="h-3.5 w-3.5" /> HL7v2
            </TabsTrigger>
            <TabsTrigger value="fhir" className="gap-1.5">
              <FileJson className="h-3.5 w-3.5" /> FHIR R4
            </TabsTrigger>
            <TabsTrigger value="mssante" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" /> MSSante
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Securite
            </TabsTrigger>
          </TabsList>

          {/* HL7v2 Messages */}
          <TabsContent value="hl7">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Messages HL7v2 recents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hl7Logs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                      {log.direction === 'sent' ? (
                        <ArrowUpRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                      <HL7MessageTypeIcon type={log.messageType} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.target}</span>
                          {log.patientName && (
                            <span className="text-xs text-muted-foreground">— {log.patientName}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : log.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FHIR R4 Exports */}
          <TabsContent value="fhir">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Exports FHIR R4 recents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fhirExports.map(exp => (
                    <div key={exp.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                      <FileJson className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{exp.patient}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {exp.resources} ressources — {exp.size}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(exp.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">Bundle</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Architecture FHIR R4</h4>
                  <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                    <p>Patient → FHIR Patient (INS + IPP identifiers)</p>
                    <p>Passage → FHIR Encounter (class=EMER)</p>
                    <p>Constantes → FHIR Observation (LOINC-coded vital signs)</p>
                    <p>Prescriptions med → FHIR MedicationRequest (ATC-coded)</p>
                    <p>Prescriptions exam → FHIR ServiceRequest</p>
                    <p>Administrations → FHIR MedicationAdministration</p>
                    <p>Resultats bio → FHIR Observation (LOINC) + DiagnosticReport</p>
                    <p>Allergies → FHIR AllergyIntolerance</p>
                    <p>Diagnostics → FHIR Condition (ICD-10)</p>
                    <p>CRH → FHIR Composition (discharge-summary)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MSSante */}
          <TabsContent value="mssante">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Documents MSSante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mssanteLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                      <Mail className="h-4 w-4 text-violet-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.patientName}</span>
                          <Badge variant="outline" className="text-[10px]">{log.documentType.toUpperCase()}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.recipient}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {log.status === 'sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-lg border bg-violet-50 dark:bg-violet-950/20">
                  <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2">Flux MSSante</h4>
                  <div className="text-xs text-violet-600 dark:text-violet-300 space-y-1">
                    <p>CRH (Compte-rendu) → PDF signe → Medecin traitant</p>
                    <p>Ordonnance de sortie → PDF → Medecin traitant</p>
                    <p>Courrier specialiste → PDF → Specialiste</p>
                    <p>Format: PDF + CDA R2 (CI-SIS)</p>
                    <p>Identification patient: INS qualifie</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conformite & Securite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Double timestamp', desc: 'when_event + when_recorded sur chaque donnee', status: true },
                    { label: 'Provenance tracable', desc: 'saisie_humaine / import_hl7 / import_fhir / ia_suggestion', status: true },
                    { label: 'Audit trail complet', desc: 'Chaque action logguee (who, what, when, where)', status: true },
                    { label: 'INS qualifie', desc: 'Identite patient INS (NIR) conforme CI-SIS', status: true },
                    { label: 'Codage LOINC', desc: 'Constantes vitales codees LOINC', status: true },
                    { label: 'Codage ATC', desc: 'Medicaments codes ATC', status: true },
                    { label: 'Codage CIM-10', desc: 'Diagnostics codes CIM-10', status: true },
                    { label: 'FHIR R4 export', desc: 'Bundle complet exportable en un clic', status: true },
                    { label: 'HL7v2 compatible', desc: 'ADT, ORM, ORU pour SIH legacy (DXCare)', status: true },
                    { label: 'MSSante', desc: 'Envoi securise documents au medecin traitant', status: true },
                    { label: 'RLS Supabase', desc: 'Row Level Security actif sur toutes les tables', status: true },
                    { label: 'Chiffrement TLS', desc: 'Communications chiffrees bout en bout', status: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.status ? 'text-emerald-500' : 'text-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-950/20">
                  <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Modele canonique</h4>
                  <div className="text-xs text-emerald-600 dark:text-emerald-300 space-y-1">
                    <p>Chaque evenement clinique respecte: <strong>who + when_event + when_recorded + what + value + status + provenance</strong></p>
                    <p>Les adaptateurs FHIR, HL7v2, MSSante sont des <strong>vues de sortie</strong> sur le modele canonique.</p>
                    <p>Le modele canonique est la <strong>source de verite unique</strong>.</p>
                    <p>Aucun lock-in : exportez toutes vos donnees en FHIR R4 en un clic.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
