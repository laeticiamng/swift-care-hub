/**
 * M3-02 — Critical Lab Result Push Notification
 * Configurable thresholds, push to prescriber + on-call physician
 * Visual + audio alert
 * M3-03 — Mandatory acknowledgment with 3-level escalation
 */

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Bell, BellRing, CheckCircle, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LabAlert, EscalationLevel } from '@/lib/sih-types';
import { getEscalationLabel } from '@/lib/lab-alerts';

interface LabAlertNotificationProps {
  alerts: LabAlert[];
  onAcknowledge: (alertId: string, note: string) => void;
  className?: string;
}

export function LabAlertNotification({ alerts, onAcknowledge, className }: LabAlertNotificationProps) {
  const [selectedAlert, setSelectedAlert] = useState<LabAlert | null>(null);
  const [acknowledgmentNote, setAcknowledgmentNote] = useState('');
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unacknowledged = alerts.filter(a => !a.acknowledged);

  // Play alert sound for unacknowledged alerts
  useEffect(() => {
    if (unacknowledged.length > 0 && !muted) {
      // Use Web Audio API for alert beep
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      } catch {
        // Audio not available
      }
    }
  }, [unacknowledged.length, muted]);

  if (unacknowledged.length === 0) return null;

  return (
    <>
      {/* Floating alert banner */}
      <div className={cn(
        'fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right fade-in',
        className,
      )}>
        <div className="bg-red-600 text-white rounded-lg shadow-2xl border border-red-500 overflow-hidden">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 animate-pulse" />
              <span className="font-bold text-sm">
                {unacknowledged.length} alerte(s) critique(s) labo
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-6 w-6 p-0 text-white hover:bg-red-700"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {unacknowledged.slice(0, 3).map(alert => (
              <button
                key={alert.id}
                className="w-full text-left p-2 rounded bg-red-700/50 hover:bg-red-700 transition-colors flex items-center gap-2"
                onClick={() => setSelectedAlert(alert)}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">
                    {alert.analyte}: {alert.value} {alert.unit}
                  </p>
                  <p className="text-xs opacity-80">
                    IPP: {alert.patient_ipp} — Niveau {alert.escalation_level}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Acknowledgment dialog */}
      {selectedAlert && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) setSelectedAlert(null); }}>
          <DialogContent className="max-w-md border-red-500 border-2">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle className="text-red-600">Alerte critique — Acquittement obligatoire</DialogTitle>
              </div>
              <DialogDescription>
                Resultat biologique critique necessitant une prise en charge immediate
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-red-600">{selectedAlert.analyte}</span>
                    <Badge variant="outline" className="border-red-400 text-red-600">
                      Seuil {selectedAlert.threshold_exceeded === 'high' ? 'haut' : 'bas'} depasse
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedAlert.value} {selectedAlert.unit}
                  </p>
                  <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                    <span>IPP: {selectedAlert.patient_ipp}</span>
                    {selectedAlert.lab_caller && <span>Appelant: {selectedAlert.lab_caller}</span>}
                    {selectedAlert.lab_call_time && (
                      <span>Heure: {new Date(selectedAlert.lab_call_time).toLocaleTimeString('fr-FR')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Escalation history */}
              {selectedAlert.escalation_history.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Historique escalade</p>
                  {selectedAlert.escalation_history.map((esc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">Niveau {esc.level}</Badge>
                      <span>{esc.notified_user_name}</span>
                      <span className="text-muted-foreground">
                        {new Date(esc.notified_at).toLocaleTimeString('fr-FR')}
                      </span>
                      {esc.response && (
                        <Badge variant={esc.response === 'acknowledged' ? 'default' : 'secondary'} className="text-xs">
                          {esc.response}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Current escalation level */}
              <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Bell className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Niveau d'escalade actuel: {getEscalationLabel(selectedAlert.escalation_level)}
                </span>
              </div>

              {/* Acknowledgment note */}
              <div className="space-y-2">
                <Label>Note d'acquittement (obligatoire)</Label>
                <Textarea
                  placeholder="Vu et pris en compte. Mesures prises: ..."
                  value={acknowledgmentNote}
                  onChange={(e) => setAcknowledgmentNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  onAcknowledge(selectedAlert.id, acknowledgmentNote);
                  setSelectedAlert(null);
                  setAcknowledgmentNote('');
                }}
                disabled={!acknowledgmentNote.trim()}
                className="w-full min-h-[44px] bg-red-600 hover:bg-red-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Vu et pris en compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
