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
import { Users, LogOut, Filter, UserPlus, Hourglass, LayoutGrid, List, Activity, CheckCircle, Syringe, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { user, role, signOut } = useAuth();
  const { isDemoMode, demoRole } = useDemo();
  const effectiveRole = isDemoMode ? demoRole : role;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [encounters, setEncounters] = useState<EncounterWithPatient[]>([]);
  const [resultCounts, setResultCounts] = useState<ResultCount[]>([]);
  const [rxCounts, setRxCounts] = useState<RxCount[]>([]);
  const [medecins, setMedecins] = useState<{ id: string; full_name: string }[]>([]);
  const userKey = user?.id ? `_${user.id}` : '';
  const [myOnly, setMyOnly] = useState(() => localStorage.getItem(`urgenceos_myOnly${userKey}`) === 'true');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => (localStorage.getItem(`urgenceos_viewMode${userKey}`) as 'grid' | 'list') || 'grid');
  const [selectedZone, setSelectedZone] = useState<ZoneKey | 'all'>(() => (localStorage.getItem(`urgenceos_selectedZone${userKey}`) as ZoneKey | 'all') || 'all');
  const [loading, setLoading] = useState(true);
  const [finishedCount, setFinishedCount] = useState(0);
  const [, setTick] = useState(0);

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

  const handleMoveZone = async (encounterId: string, newZone: ZoneKey) => {
    await supabase.from('encounters').update({ zone: newZone }).eq('id', encounterId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'zone_change', resource_type: 'encounter',
        resource_id: encounterId, details: { new_zone: newZone },
      });
    }
    fetchEncounters();
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
      <header className="sticky top-0 z-20 border-b shadow-sm px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span></h1>
            {isDemoMode && <Badge variant="secondary" className="text-[10px]">Demo</Badge>}
            <Badge variant="secondary" className="text-xs">
              {effectiveRole === 'medecin' ? 'Medecin' : effectiveRole === 'ioa' ? 'IOA' : effectiveRole === 'ide' ? 'IDE' : effectiveRole || ''}
            </Badge>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setSelectedZone('all')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                selectedZone === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border')}>
              Tous ({filtered.length})
            </button>
            {ZONE_CONFIGS.map(z => (
              <button key={z.key} onClick={() => setSelectedZone(z.key)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  selectedZone === z.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border')}>
                {z.label} {byZone(z.key).length}/{z.boxCount}
              </button>
            ))}
            <StatCard label="En attente" value={waitingCount} icon={Hourglass} variant={waitingVariant as any} className="py-1 px-3" />
          </div>
          <div className="flex items-center gap-2">
            {(role === 'ioa' || role === 'medecin') && (
              <Button size="sm" onClick={() => navigate('/triage')}>
                <UserPlus className="h-4 w-4 mr-1" /> {!isMobile && 'Nouveau patient'}
              </Button>
            )}
            <Button variant={myOnly ? 'default' : 'outline'} size="sm" onClick={() => setMyOnly(!myOnly)}>
              <Filter className="h-4 w-4 mr-1" /> {!isMobile && 'Mes patients'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>
              {!isMobile && 'Changer rôle'}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {role && <OnboardingBanner role={role} />}
        {/* Role-adaptive stat cards */}
        <div className="grid grid-cols-4 gap-3">
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

        {viewMode === 'grid' ? (
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
