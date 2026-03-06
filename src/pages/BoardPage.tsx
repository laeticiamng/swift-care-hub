import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_ENCOUNTERS } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/urgence/StatCard';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { PatientCard } from '@/components/urgence/BoardPatientCard';
import { ZoneGrid } from '@/components/urgence/ZoneGrid';
import { WaitingBanner } from '@/components/urgence/WaitingBanner';
import { OnboardingBanner } from '@/components/urgence/OnboardingBanner';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';
import { LabAlertNotification } from '@/components/urgence/LabAlertNotification';
import { NotificationCenter } from '@/components/urgence/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { SIH_LAB_ALERTS } from '@/lib/sih-demo-data';
import { Users, LogOut, Filter, UserPlus, Hourglass, LayoutGrid, List, MapPin, Activity, CheckCircle, Syringe, ClipboardList } from 'lucide-react';
import { FloorPlanView } from '@/components/urgence/FloorPlanView';
import { ChatPanel } from '@/components/urgence/ChatPanel';
import type { ChatChannel } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { addToOfflineQueue } from '@/lib/offline-db';
import { DechocageConfirmDialog } from '@/components/urgence/DechocageConfirmDialog';

interface EncounterWithPatient {
  id: string;
  patient_id: string;
  status: string;
  zone: ZoneKey | null;
  box_number: number | null;
  ccmu: number | null;
  cimu: number | null;
  motif_sfmu: string | null;
  medecin_id: string | null;
  arrival_time: string;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string; allergies: string[] | null };
  medecin_profile?: { full_name: string } | null;
  diagnostic?: string | null;
  last_admin_at?: string | null;
  active_rx_count?: number;
}

interface ResultCount { encounter_id: string; unread: number; critical: number; }
interface RxCount { encounter_id: string; count: number; }
export default function BoardPage() {
  const { status: syncStatus, doSync } = useOfflineSync();
  const { user, role, signOut } = useAuth();
  const { isDemoMode, demoRole } = useDemo();
  const effectiveRole = isDemoMode ? demoRole : role;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestPermission } = useNotifications(user?.id);
  const [encounters, setEncounters] = useState<EncounterWithPatient[]>([]);
  const [resultCounts, setResultCounts] = useState<ResultCount[]>([]);
  const [rxCounts, setRxCounts] = useState<RxCount[]>([]);
  const [medecins, setMedecins] = useState<{ id: string; full_name: string }[]>([]);
  const userKey = user?.id ? `_${user.id}` : '';
  const [myOnly, setMyOnly] = useState(() => localStorage.getItem(`urgenceos_myOnly${userKey}`) === 'true');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'plan'>(() => (localStorage.getItem(`urgenceos_viewMode${userKey}`) as 'grid' | 'list' | 'plan') || 'grid');
  const [selectedZone, setSelectedZone] = useState<ZoneKey | 'all'>(() => (localStorage.getItem(`urgenceos_selectedZone${userKey}`) as ZoneKey | 'all') || 'all');
  const [loading, setLoading] = useState(true);
  const [finishedCount, setFinishedCount] = useState(0);
  const [, setTick] = useState(0);
  const [labAlerts, setLabAlerts] = useState(() => {
    const acked = JSON.parse(localStorage.getItem('urgenceos_acked_lab_alerts') || '[]') as string[];
    return SIH_LAB_ALERTS.map(a => acked.includes(a.id) ? { ...a, acknowledged: true } : a);
  });
  const [dechocagePending, setDechocagePending] = useState<{ encounterId: string; patientName: string; boxNumber?: number; source: 'move' | 'drop' } | null>(null);

  useEffect(() => { localStorage.setItem(`urgenceos_myOnly${userKey}`, String(myOnly)); }, [myOnly, userKey]);
  useEffect(() => { localStorage.setItem(`urgenceos_viewMode${userKey}`, viewMode); }, [viewMode, userKey]);
  useEffect(() => { localStorage.setItem(`urgenceos_selectedZone${userKey}`, selectedZone); }, [selectedZone, userKey]);

  useEffect(() => {
    fetchEncounters();
    const channel = supabase
      .channel('board-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, () => fetchEncounters())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => fetchEncounters())
      .subscribe();
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => { supabase.removeChannel(channel); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (effectiveRole === 'as') { navigate('/as', { replace: true }); return; }
    if (effectiveRole === 'secretaire') { navigate('/accueil', { replace: true }); return; }
  }, [effectiveRole, navigate]);

  const fetchEncounters = async () => {
    if (isDemoMode) {
      const demoData = DEMO_ENCOUNTERS.map(e => ({
        id: e.id,
        patient_id: e.patient_id,
        status: e.status,
        zone: e.zone as ZoneKey | null,
        box_number: e.box_number,
        ccmu: e.ccmu,
        cimu: e.cimu,
        motif_sfmu: e.motif_sfmu,
        medecin_id: e.medecin_id,
        arrival_time: e.arrival_time,
        patients: { nom: e.patients.nom, prenom: e.patients.prenom, date_naissance: e.patients.date_naissance, sexe: e.patients.sexe, allergies: e.patients.allergies },
        medecin_profile: e.medecin_id ? { full_name: 'Dr. Martin Dupont' } : null,
        diagnostic: null,
        last_admin_at: null,
        active_rx_count: 0,
      }));
      setEncounters(demoData as EncounterWithPatient[]);
      setLoading(false);
      return;
    }
    // Fetch finished encounters in last 24h
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('encounters')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'finished')
      .gte('arrival_time', since24h);
    setFinishedCount(count ?? 0);

    // Fetch medecins list once
    if (medecins.length === 0) {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'medecin');
      if (roles && roles.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', roles.map(r => r.user_id));
        if (profiles) setMedecins(profiles);
      }
    }
    const [encRes, resRes, rxRes, admRes] = await Promise.all([
      supabase
        .from('encounters')
        .select('id, patient_id, status, zone, box_number, ccmu, cimu, motif_sfmu, medecin_id, arrival_time, patients(nom, prenom, date_naissance, sexe, allergies)')
        .in('status', ['arrived', 'triaged', 'in-progress'])
        .order('arrival_time', { ascending: true }),
      supabase.from('results').select('encounter_id, is_read, is_critical'),
      supabase.from('prescriptions').select('encounter_id, status'),
      supabase.from('administrations').select('encounter_id, administered_at').order('administered_at', { ascending: false }),
    ]);

    let encountersData: EncounterWithPatient[] = [];
    if (encRes.data) {
      encountersData = encRes.data as unknown as EncounterWithPatient[];
      // Fetch medecin profiles
      const medecinIds = [...new Set(encountersData.filter(e => e.medecin_id).map(e => e.medecin_id!))];
      if (medecinIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', medecinIds);
        if (profiles) {
          const profileMap = new Map(profiles.map(p => [p.id, p]));
          encountersData = encountersData.map(e => ({
            ...e,
            medecin_profile: e.medecin_id ? profileMap.get(e.medecin_id) || null : null,
          }));
        }
      }
      // Fetch latest diagnostics for each patient
      const patientIds = [...new Set(encountersData.map(e => e.patient_id))];
      if (patientIds.length > 0) {
        const { data: diags } = await supabase.from('timeline_items')
          .select('patient_id, content')
          .eq('item_type', 'diagnostic')
          .in('patient_id', patientIds)
          .order('created_at', { ascending: false });
        if (diags) {
          const diagMap = new Map<string, string>();
          for (const d of diags) { if (!diagMap.has(d.patient_id)) diagMap.set(d.patient_id, d.content); }
          encountersData = encountersData.map(e => ({
            ...e,
            diagnostic: diagMap.get(e.patient_id) || null,
          }));
        }
      }
      // Add last admin time per encounter (for IDE view)
      if (admRes.data) {
        const adminMap = new Map<string, string>();
        for (const a of admRes.data) {
          if (!adminMap.has(a.encounter_id)) adminMap.set(a.encounter_id, a.administered_at);
        }
        encountersData = encountersData.map(e => ({
          ...e,
          last_admin_at: adminMap.get(e.id) || null,
        }));
      }

      setEncounters(encountersData);
    }

    if (resRes.data) {
      const map = new Map<string, ResultCount>();
      for (const r of resRes.data) {
        if (!map.has(r.encounter_id)) map.set(r.encounter_id, { encounter_id: r.encounter_id, unread: 0, critical: 0 });
        const entry = map.get(r.encounter_id)!;
        if (!r.is_read) entry.unread++;
        if (r.is_critical) entry.critical++;
      }
      setResultCounts(Array.from(map.values()));
    }

    if (rxRes.data) {
      const rxMap = new Map<string, number>();
      for (const r of rxRes.data) {
        if (r.status === 'active') {
          rxMap.set(r.encounter_id, (rxMap.get(r.encounter_id) || 0) + 1);
        }
      }
      setRxCounts(Array.from(rxMap.entries()).map(([encounter_id, count]) => ({ encounter_id, count })));
    }
    setLoading(false);
  };

  const ZONE_LABELS: Record<string, string> = { sau: 'SAU', uhcd: 'UHCD', dechocage: 'Déchocage' };

  const logMovementToTimeline = async (encounterId: string, oldZone: string | null, newZone: string, boxNumber?: number) => {
    const enc = encounters.find(e => e.id === encounterId);
    if (!enc) return;
    const fromLabel = oldZone ? ZONE_LABELS[oldZone] || oldZone : 'Salle d\'attente';
    const toLabel = ZONE_LABELS[newZone] || newZone;
    const boxStr = boxNumber ? ` Box ${boxNumber}` : '';
    const content = `Déplacé de ${fromLabel} vers ${toLabel}${boxStr}`;
    await supabase.from('timeline_items').insert({
      patient_id: enc.patient_id,
      item_type: 'deplacement' as any,
      content,
      source_author: user?.email || 'Système',
      source_date: new Date().toISOString().split('T')[0],
    });
  };

  const getPatientName = (encounterId: string) => {
    const enc = encounters.find(e => e.id === encounterId);
    return enc ? `${enc.patients.nom.toUpperCase()} ${enc.patients.prenom}` : 'Patient';
  };

  const handleMoveZone = async (encounterId: string, newZone: ZoneKey) => {
    if (newZone === 'dechocage') {
      setDechocagePending({ encounterId, patientName: getPatientName(encounterId), source: 'move' });
      return;
    }
    await executeMoveZone(encounterId, newZone);
  };

  const executeMoveZone = async (encounterId: string, newZone: ZoneKey, motif?: string) => {
    const oldEnc = encounters.find(e => e.id === encounterId);
    const oldZone = oldEnc?.zone || null;
    if (!navigator.onLine) {
      await addToOfflineQueue({ table: 'encounters', operation: 'update', payload: { id: encounterId, zone: newZone }, userId: user?.id ?? null, priority: 'normal' });
      setEncounters(prev => prev.map(e => e.id === encounterId ? { ...e, zone: newZone } : e));
      return;
    }
    await supabase.from('encounters').update({ zone: newZone }).eq('id', encounterId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'zone_change', resource_type: 'encounter',
        resource_id: encounterId, details: { old_zone: oldZone, new_zone: newZone, ...(motif ? { motif_dechocage: motif } : {}) },
      });
      const suffix = motif ? ` — Motif: ${motif}` : '';
      await logMovementToTimeline(encounterId, oldZone, newZone);
      if (motif) {
        const enc = encounters.find(e => e.id === encounterId);
        if (enc) {
          await supabase.from('timeline_items').insert({
            patient_id: enc.patient_id,
            item_type: 'deplacement' as any,
            content: `⚠️ Transfert Déchocage — Motif: ${motif}`,
            source_author: user.email || 'Système',
            source_date: new Date().toISOString().split('T')[0],
          });
        }
      }
    }
    fetchEncounters();
  };

  const handleDropToZone = async (encounterId: string, newZone: string, boxNumber?: number) => {
    if (newZone === 'dechocage') {
      setDechocagePending({ encounterId, patientName: getPatientName(encounterId), boxNumber, source: 'drop' });
      return;
    }
    await executeDropToZone(encounterId, newZone, boxNumber);
  };

  const executeDropToZone = async (encounterId: string, newZone: string, boxNumber?: number, motif?: string) => {
    const oldEnc = encounters.find(e => e.id === encounterId);
    const oldZone = oldEnc?.zone || null;
    const update: Record<string, unknown> = { zone: newZone };
    if (boxNumber !== undefined) update.box_number = boxNumber;
    setEncounters(prev => prev.map(e =>
      e.id === encounterId
        ? { ...e, zone: newZone as ZoneKey, ...(boxNumber !== undefined ? { box_number: boxNumber } : {}) }
        : e
    ));
    if (!navigator.onLine) {
      await addToOfflineQueue({ table: 'encounters', operation: 'update', payload: { id: encounterId, ...update }, userId: user?.id ?? null, priority: 'normal' });
      return;
    }
    await supabase.from('encounters').update(update).eq('id', encounterId);
    if (user) {
      await supabase.from('audit_logs').insert([{
        user_id: user.id, action: 'drag_drop_move', resource_type: 'encounter',
        resource_id: encounterId, details: { old_zone: oldZone, ...update, ...(motif ? { motif_dechocage: motif } : {}) } as any,
      }]);
      await logMovementToTimeline(encounterId, oldZone, newZone, boxNumber);
      if (motif) {
        const enc = encounters.find(e => e.id === encounterId);
        if (enc) {
          await supabase.from('timeline_items').insert({
            patient_id: enc.patient_id,
            item_type: 'deplacement' as any,
            content: `⚠️ Transfert Déchocage${boxNumber ? ` Box ${boxNumber}` : ''} — Motif: ${motif}`,
            source_author: user.email || 'Système',
            source_date: new Date().toISOString().split('T')[0],
          });
        }
      }
    }
    fetchEncounters();
  };

  const handleDechocageConfirm = (motif: string) => {
    if (!dechocagePending) return;
    const { encounterId, boxNumber, source } = dechocagePending;
    setDechocagePending(null);
    if (source === 'move') {
      executeMoveZone(encounterId, 'dechocage', motif);
    } else {
      executeDropToZone(encounterId, 'dechocage', boxNumber, motif);
    }
  };

  const handleAssignMedecin = async (encounterId: string, medecinId: string) => {
    await supabase.from('encounters').update({ medecin_id: medecinId }).eq('id', encounterId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'medecin_assigned', resource_type: 'encounter',
        resource_id: encounterId, details: { medecin_id: medecinId },
      });
    }
    fetchEncounters();
  };

  const handleTriage = (patientId: string) => {
    navigate(`/triage?patientId=${patientId}`);
  };

  const navigateToPatient = (enc: { id: string }) => {
    navigate(role === 'ide' ? `/pancarte/${enc.id}` : `/patient/${enc.id}`);
  };

  const filtered = myOnly ? encounters.filter(e => e.medecin_id === user?.id) : encounters;
  const byZone = (zone: ZoneKey) => filtered.filter(e => e.zone === zone);
  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);
  const getRxCount = (encId: string) => rxCounts.find(r => r.encounter_id === encId)?.count;

  const preIOA = filtered.filter(e => e.status === 'arrived' && !e.zone);
  const noZone = filtered.filter(e => (e.status === 'triaged' || e.status === 'in-progress') && !e.zone);
  const noBox = filtered.filter(e => (e.status === 'triaged' || e.status === 'in-progress') && e.zone && !e.box_number);
  const waitingCount = preIOA.length + noZone.length + noBox.length;
  const waitingVariant = waitingCount > 10 ? 'critical' : waitingCount > 5 ? 'warning' : 'default';

  const highlightedIds = myOnly ? new Set(filtered.map(e => e.id)) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <DechocageConfirmDialog
        open={!!dechocagePending}
        patientName={dechocagePending?.patientName || ''}
        onConfirm={handleDechocageConfirm}
        onCancel={() => setDechocagePending(null)}
      />
      {/* M3-02: Lab alert notifications — visible on all board views */}
      <LabAlertNotification
        alerts={labAlerts}
        onAcknowledge={(alertId, note) => {
          setLabAlerts(prev => {
            const updated = prev.map(a =>
              a.id === alertId ? { ...a, acknowledged: true, acknowledged_by: user?.id || 'user', acknowledged_at: new Date().toISOString(), acknowledgment_note: note } : a
            );
            const acked = updated.filter(a => a.acknowledged).map(a => a.id);
            localStorage.setItem('urgenceos_acked_lab_alerts', JSON.stringify(acked));
            return updated;
          });
        }}
      />

      <header className="sticky top-0 z-20 border-b shadow-sm px-3 py-2 md:px-4 md:py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
          {/* Left: logo + role */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-lg md:text-xl font-bold">Urgence<span className="text-primary">OS</span></h1>
            {isDemoMode && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {effectiveRole === 'medecin' ? 'Med' : effectiveRole === 'ioa' ? 'IOA' : effectiveRole === 'ide' ? 'IDE' : effectiveRole || ''}
            </Badge>
            {!isMobile && <NetworkStatus syncStatus={syncStatus} onManualSync={doSync} />}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {(role === 'ioa' || role === 'medecin') && (
              <Button size="sm" className="h-8 px-2 md:px-3" onClick={() => navigate('/triage')}>
                <UserPlus className="h-4 w-4" /> {!isMobile && <span className="ml-1">Nouveau patient</span>}
              </Button>
            )}
            <Button variant={myOnly ? 'default' : 'outline'} size="sm" className="h-8 px-2 md:px-3" onClick={() => setMyOnly(!myOnly)}>
              <Filter className="h-4 w-4" /> {!isMobile && <span className="ml-1">Mes patients</span>}
            </Button>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-none px-1.5 h-8" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none px-1.5 h-8" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'plan' ? 'default' : 'ghost'} size="sm" className="rounded-none px-1.5 h-8" onClick={() => setViewMode('plan')}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {!isMobile && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Changer rôle</Button>
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRequestPermission={requestPermission}
                />
                <ChatPanel
                  channels={[
                    { type: 'zone', id: selectedZone || 'sau', label: `Zone ${(selectedZone || 'sau').toUpperCase()}`, icon: 'radio' },
                    { type: 'zone', id: 'sau', label: 'SAU', icon: 'radio' },
                    { type: 'zone', id: 'uhcd', label: 'UHCD', icon: 'radio' },
                    { type: 'zone', id: 'dechocage', label: 'Déchocage', icon: 'radio' },
                    { type: 'general', id: 'general', label: 'Général', icon: 'hash' },
                  ] as ChatChannel[]}
                  triggerLabel="Chat"
                />
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Zone filters — horizontal scroll on mobile */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-hide flex-nowrap max-w-7xl mx-auto pb-1 -mb-1">
          <button onClick={() => setSelectedZone('all')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0',
              selectedZone === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border')}>
            Tous ({filtered.length})
          </button>
          {ZONE_CONFIGS.map(z => (
            <button key={z.key} onClick={() => setSelectedZone(z.key)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0',
                selectedZone === z.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border')}>
              {z.label} {byZone(z.key).length}/{z.boxCount}
            </button>
          ))}
          <div className="shrink-0">
            <StatCard label="Attente" value={waitingCount} icon={Hourglass} variant={waitingVariant as any} className="py-1 px-2 text-xs" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 md:p-4 space-y-3 md:space-y-4 has-bottom-nav">
        {role && <OnboardingBanner role={role} />}
        {/* Role-adaptive stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          <StatCard label="Total" value={filtered.length} icon={Users} />
          {role === 'ioa' ? (
            <>
              <StatCard label="A trier" value={preIOA.length} icon={ClipboardList} variant={preIOA.length > 0 ? 'critical' : 'default'} />
              <StatCard label="A orienter" value={noZone.length} icon={Hourglass} variant={noZone.length > 0 ? 'warning' : 'default'} />
            </>
          ) : role === 'ide' ? (
            <>
              <StatCard label="Rx actives" value={rxCounts.reduce((sum, r) => sum + r.count, 0)} icon={Syringe} variant="warning" />
              <StatCard label="En cours" value={filtered.filter(e => e.status === 'in-progress' || e.status === 'triaged').length} icon={Activity} variant="default" />
            </>
          ) : (
            <>
              <StatCard label="Arrives" value={filtered.filter(e => e.status === 'arrived').length} icon={Hourglass} variant="warning" />
              <StatCard label="En cours" value={filtered.filter(e => e.status === 'in-progress' || e.status === 'triaged').length} icon={Activity} variant="default" />
            </>
          )}
          <StatCard label="Termines (24h)" value={finishedCount} icon={CheckCircle} variant="success" />
        </div>

        <WaitingBanner
          preIOA={preIOA}
          noZone={noZone}
          noBox={noBox}
          role={role}
          onTriage={handleTriage}
          onClickPatient={navigateToPatient}
        />

        {viewMode === 'plan' ? (
          <FloorPlanView
            encounters={filtered}
            resultCounts={resultCounts}
            waitingPatients={[...preIOA, ...noZone, ...noBox]}
            highlightedIds={highlightedIds}
            hasActiveFilter={myOnly}
            onClickEncounter={navigateToPatient}
            onDropToZone={handleDropToZone}
          />
        ) : viewMode === 'grid' ? (
          <div className="space-y-6">
            {ZONE_CONFIGS.filter(z => selectedZone === 'all' || z.key === selectedZone).map(z => (
              <ZoneGrid
                key={z.key}
                zone={z}
                encounters={byZone(z.key)}
                resultCounts={resultCounts}
                highlightedIds={highlightedIds}
                hasActiveFilter={myOnly}
                onClickEncounter={navigateToPatient}
                onDropToZone={handleDropToZone}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="text-muted-foreground">Aucun patient</p>
              </div>
            )}
            {filtered.map((enc, i) => (
              <PatientCard
                key={enc.id}
                encounter={enc}
                resultCount={getResultCount(enc.id)}
                rxCount={getRxCount(enc.id)}
                role={role}
                index={i}
                showZoneBadge
                showWaitingBadge
                medecins={medecins}
                onMoveZone={handleMoveZone}
                onAssignMedecin={handleAssignMedecin}
                onTriage={handleTriage}
                onClick={() => navigateToPatient(enc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
