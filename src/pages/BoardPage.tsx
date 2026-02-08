import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/urgence/StatCard';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { PatientCard } from '@/components/urgence/BoardPatientCard';
import { ZoneGrid } from '@/components/urgence/ZoneGrid';
import { WaitingBanner } from '@/components/urgence/WaitingBanner';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';
import { Users, LogOut, Filter, UserPlus, Hourglass, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface EncounterWithPatient {
  id: string;
  patient_id: string;
  status: string;
  zone: ZoneKey | null;
  box_number: number | null;
  ccmu: number | null;
  motif_sfmu: string | null;
  medecin_id: string | null;
  arrival_time: string;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string; allergies: string[] | null };
  medecin_profile?: { full_name: string } | null;
}

interface ResultCount { encounter_id: string; unread: number; critical: number; }

export default function BoardPage() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [encounters, setEncounters] = useState<EncounterWithPatient[]>([]);
  const [resultCounts, setResultCounts] = useState<ResultCount[]>([]);
  const [medecins, setMedecins] = useState<{ id: string; full_name: string }[]>([]);
  const [myOnly, setMyOnly] = useState(() => localStorage.getItem('urgenceos_myOnly') === 'true');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => (localStorage.getItem('urgenceos_viewMode') as 'grid' | 'list') || 'grid');
  const [selectedZone, setSelectedZone] = useState<ZoneKey | 'all'>(() => (localStorage.getItem('urgenceos_selectedZone') as ZoneKey | 'all') || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { localStorage.setItem('urgenceos_myOnly', String(myOnly)); }, [myOnly]);
  useEffect(() => { localStorage.setItem('urgenceos_viewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('urgenceos_selectedZone', selectedZone); }, [selectedZone]);

  useEffect(() => {
    fetchEncounters();
    const channel = supabase
      .channel('board-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, () => fetchEncounters())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => fetchEncounters())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchEncounters = async () => {
    // Fetch medecins list once
    if (medecins.length === 0) {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'medecin');
      if (roles && roles.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', roles.map(r => r.user_id));
        if (profiles) setMedecins(profiles);
      }
    }
    const [encRes, resRes] = await Promise.all([
      supabase
        .from('encounters')
        .select('id, patient_id, status, zone, box_number, ccmu, motif_sfmu, medecin_id, arrival_time, patients(nom, prenom, date_naissance, sexe, allergies)')
        .in('status', ['arrived', 'triaged', 'in-progress'])
        .order('arrival_time', { ascending: true }),
      supabase.from('results').select('encounter_id, is_read, is_critical'),
    ]);

    let encountersData: EncounterWithPatient[] = [];
    if (encRes.data) {
      encountersData = encRes.data as unknown as EncounterWithPatient[];
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
