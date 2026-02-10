/**
 * M7-01 — Multi-service Guard Mode View
 * All patients on guard visible
 * M7-02 — Lab alert routing in guard mode
 * M7-03 — Integrated on-call schedule
 * M7-04 — Structured handover sheet auto-generated
 */

import { useState } from 'react';
import { Shield, Users, Clock, AlertTriangle, FileText, ChevronRight, Bell, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CIMU_COLORS } from '@/lib/sih-types';
import type { GuardSchedule, HandoverSheet, PatientIdentity } from '@/lib/sih-types';

interface GuardPatient extends PatientIdentity {
  encounterId: string;
  motif: string;
  cimu: number;
  zone: string;
  boxNumber: number;
  status: string;
  waitTime: string;
  hasCriticalAlert: boolean;
  pendingActions: number;
}

interface GuardModeViewProps {
  patients: GuardPatient[];
  guardSchedule: GuardSchedule[];
  services: string[];
  currentService?: string;
  onPatientClick: (encounterId: string) => void;
  onGenerateHandover: (encounterId: string) => void;
}

export function GuardModeView({
  patients, guardSchedule, services, currentService, onPatientClick, onGenerateHandover,
}: GuardModeViewProps) {
  const [activeService, setActiveService] = useState(currentService || 'all');

  const filteredPatients = activeService === 'all'
    ? patients
    : patients.filter(p => p.service === activeService);

  const criticalPatients = filteredPatients.filter(p => p.hasCriticalAlert);
  const onCallNow = guardSchedule.filter(g => g.is_active);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Mode Garde Multi-Services</h2>
          <Badge variant="outline">{filteredPatients.length} patients</Badge>
        </div>
        {criticalPatients.length > 0 && (
          <Badge className="bg-red-600 text-white animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {criticalPatients.length} alerte(s) critique(s)
          </Badge>
        )}
      </div>

      <Tabs value={activeService} onValueChange={setActiveService}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="min-h-[44px]">
            Tous ({patients.length})
          </TabsTrigger>
          {services.map(service => {
            const count = patients.filter(p => p.service === service).length;
            return (
              <TabsTrigger key={service} value={service} className="min-h-[44px]">
                {service} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Guard schedule */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Equipe de garde</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onCallNow.length > 0 ? onCallNow.map(g => (
              <Badge key={g.id} variant="secondary" className="text-xs">
                {g.user_name} ({g.role}) — {g.services.join(', ')}
              </Badge>
            )) : (
              <span className="text-xs text-muted-foreground">Aucune equipe de garde configuree</span>
            )}
          </div>
        </div>

        {/* Patient grid */}
        <TabsContent value={activeService} className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map(patient => (
              <GuardPatientCard
                key={patient.encounterId}
                patient={patient}
                onClick={() => onPatientClick(patient.encounterId)}
                onHandover={() => onGenerateHandover(patient.encounterId)}
              />
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                Aucun patient dans ce service
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GuardPatientCard({
  patient, onClick, onHandover,
}: { patient: GuardPatient; onClick: () => void; onHandover: () => void }) {
  const cimuColor = CIMU_COLORS[patient.cimu] || CIMU_COLORS[4];

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-all',
        patient.hasCriticalAlert && 'border-red-500 animate-pulse',
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">
            {patient.nom.toUpperCase()} {patient.prenom}
          </CardTitle>
          <Badge className={cn('text-xs', cimuColor.bg, cimuColor.text)}>
            CIMU {patient.cimu}
          </Badge>
        </div>
        <div className="flex gap-1 flex-wrap">
          <Badge variant="secondary" className="text-xs font-mono">IPP: {patient.ipp}</Badge>
          <Badge variant="outline" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {patient.zone} Box {patient.boxNumber}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{patient.motif}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {patient.waitTime}
          </Badge>
          {patient.hasCriticalAlert && (
            <Badge className="bg-red-600 text-white text-xs">
              <Bell className="h-3 w-3 mr-1" />
              Alerte
            </Badge>
          )}
          {patient.pendingActions > 0 && (
            <Badge variant="secondary" className="text-xs">
              {patient.pendingActions} action(s)
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full min-h-[44px] text-xs mt-1"
          onClick={(e) => { e.stopPropagation(); onHandover(); }}
        >
          <FileText className="h-3 w-3 mr-1" />
          Fiche transmission
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * M7-04 — Handover sheet display
 */
export function HandoverSheetView({ sheet }: { sheet: HandoverSheet }) {
  return (
    <div className="space-y-4 p-4 max-w-lg">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Fiche de transmission</h3>
      </div>
      <Badge variant="secondary" className="text-xs">
        IPP: {sheet.patient_ipp} — Genere le {new Date(sheet.generated_at).toLocaleString('fr-FR')}
      </Badge>

      <div className="space-y-3">
        <Section title="Resume patient" content={sheet.content.patient_summary} />
        <Section title="Statut actuel" content={sheet.content.current_status} />
        <ListSection title="Actions en attente" items={sheet.content.pending_actions} color="text-orange-600" />
        <ListSection title="Alertes critiques" items={sheet.content.critical_alerts} color="text-red-600" />
        <ListSection title="Resultats en attente" items={sheet.content.pending_results} />
        <ListSection title="Medicaments en cours" items={sheet.content.medications} />
        <ListSection title="Communications" items={sheet.content.communications} />
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{title}</p>
      <p className="text-sm">{content}</p>
    </div>
  );
}

function ListSection({ title, items, color }: { title: string; items: string[]; color?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={cn('text-sm flex items-center gap-1', color)}>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
