import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatCard } from '@/components/urgence/StatCard';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { PatientCard, getWaitingStatus } from '@/components/urgence/BoardPatientCard';
import { Users, LogOut, Filter, UserPlus, Inbox, Hourglass, ClipboardList, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';

type Zone = 'sau' | 'uhcd' | 'dechocage';
const ZONES: { key: Zone; label: string; color: string; bgColor: string }[] = [
  { key: 'sau', label: 'SAU', color: 'bg-medical-info', bgColor: 'bg-medical-info/5' },
  { key: 'uhcd', label: 'UHCD', color: 'bg-medical-warning', bgColor: 'bg-medical-warning/5' },
  { key: 'dechocage', label: 'Déchocage', color: 'bg-medical-critical', bgColor: 'bg-medical-critical/5' },
];

interface EncounterWithPatient {
  id: string;
  patient_id: string;
  status: string;
  zone: Zone | null;
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
  const [myOnly, setMyOnly] = useState(() => localStorage.getItem('urgenceos_myOnly') === 'true');
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState<string>(() => localStorage.getItem('urgenceos_activeZone') || 'all');

  useEffect(() => { localStorage.setItem('urgenceos_myOnly', String(myOnly)); }, [myOnly]);
  useEffect(() => { localStorage.setItem('urgenceos_activeZone', activeZone); }, [activeZone]);

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

  const handleMoveZone = async (encounterId: string, newZone: Zone) => {
    await supabase.from('encounters').update({ zone: newZone }).eq('id', encounterId);
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'zone_change', resource_type: 'encounter',
        resource_id: encounterId, details: { new_zone: newZone },
      });
    }
    fetchEncounters();
  };

  const handleTriage = (patientId: string) => {
    navigate(`/triage?patientId=${patientId}`);
  };

  const filtered = myOnly ? encounters.filter(e => e.medecin_id === user?.id) : encounters;
  const byZone = (zone: Zone) => filtered.filter(e => e.zone === zone);
  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  // Waiting patients
  const preIOA = filtered.filter(e => e.status === 'arrived' && !e.zone);
  const postIOANoBox = filtered.filter(e => (e.status === 'triaged' || e.status === 'in-progress') && e.zone && !e.box_number);
  const noZone = filtered.filter(e => (e.status === 'triaged' || e.status === 'in-progress') && !e.zone);
  const waitingCount = preIOA.length + postIOANoBox.length + noZone.length;

  const displayedEncounters = activeZone === 'all' ? filtered : activeZone === 'waiting' ? [] : filtered.filter(e => e.zone === activeZone);

  const cardProps = (encounter: EncounterWithPatient, index: number, showZoneBadge = false) => ({
    encounter,
    resultCount: getResultCount(encounter.id),
    role,
    index,
    showZoneBadge,
    showWaitingBadge: activeZone === 'all',
    onMoveZone: handleMoveZone,
    onTriage: handleTriage,
    onClick: () => navigate(role === 'ide' ? `/pancarte/${encounter.id}` : `/patient/${encounter.id}`),
  });

  const waitingVariant = waitingCount > 10 ? 'critical' : waitingCount > 5 ? 'warning' : 'default';

  const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center py-16 space-y-3">
      <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b shadow-sm px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span></h1>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatCard label="Total" value={filtered.length} icon={Users} className="py-1 px-3" />
            {!isMobile && ZONES.map(z => (
              <StatCard key={z.key} label={z.label} value={byZone(z.key).length} icon={Users} className="py-1 px-3" />
            ))}
            <StatCard label="En attente" value={waitingCount} icon={Hourglass} variant={waitingVariant} className="py-1 px-3" />
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

      <div className="max-w-5xl mx-auto p-4">
        <Tabs value={activeZone} onValueChange={setActiveZone}>
          <TabsList className="w-full mb-4 h-12 flex-wrap">
            <TabsTrigger value="all" className="flex-1 text-sm font-medium h-10">
              Tous ({filtered.length})
            </TabsTrigger>
            {ZONES.map(z => (
              <TabsTrigger key={z.key} value={z.key} className="flex-1 text-sm font-medium h-10 gap-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full', z.color)} />
                {z.label} ({byZone(z.key).length})
              </TabsTrigger>
            ))}
            <TabsTrigger value="waiting" className="flex-1 text-sm font-medium h-10 gap-1.5">
              <Hourglass className="h-3.5 w-3.5" />
              En attente ({waitingCount})
            </TabsTrigger>
          </TabsList>

          {/* All */}
          <TabsContent value="all">
            <div className="space-y-3">
              {displayedEncounters.length === 0 && <EmptyState text="Aucun patient" />}
              {displayedEncounters.map((enc, i) => (
                <PatientCard key={enc.id} {...cardProps(enc, i, true)} />
              ))}
            </div>
          </TabsContent>

          {/* Per-zone */}
          {ZONES.map(z => (
            <TabsContent key={z.key} value={z.key}>
              <div className={cn('rounded-xl p-3 mb-4', z.bgColor)}>
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', z.color)} />
                  <h2 className="text-lg font-semibold">{z.label}</h2>
                  <Badge variant="outline" className="font-semibold ml-auto">{byZone(z.key).length}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {byZone(z.key).length === 0 && <EmptyState text="Aucun patient dans cette zone" />}
                {byZone(z.key).map((enc, i) => (
                  <PatientCard key={enc.id} {...cardProps(enc, i)} />
                ))}
              </div>
            </TabsContent>
          ))}

          {/* Waiting */}
          <TabsContent value="waiting">
            <div className="space-y-6">
              {/* Pre-IOA */}
              <div>
                <div className="rounded-xl p-3 mb-3 bg-orange-500/5 border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                    <h2 className="text-base font-semibold text-orange-700 dark:text-orange-400">Pré-IOA — À trier</h2>
                    <Badge variant="outline" className="ml-auto border-orange-500/30 text-orange-600">{preIOA.length}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {preIOA.length === 0 && <EmptyState text="Aucun patient en attente de triage" />}
                  {preIOA.map((enc, i) => (
                    <PatientCard key={enc.id} {...cardProps(enc, i, true)} showWaitingBadge />
                  ))}
                </div>
              </div>

              {/* No zone */}
              {noZone.length > 0 && (
                <div>
                  <div className="rounded-xl p-3 mb-3 bg-yellow-500/5 border border-yellow-500/20">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-600" />
                      <h2 className="text-base font-semibold text-yellow-700 dark:text-yellow-400">À orienter</h2>
                      <Badge variant="outline" className="ml-auto border-yellow-500/30 text-yellow-600">{noZone.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {noZone.map((enc, i) => (
                      <PatientCard key={enc.id} {...cardProps(enc, i, true)} showWaitingBadge />
                    ))}
                  </div>
                </div>
              )}

              {/* Post-IOA no box */}
              <div>
                <div className="rounded-xl p-3 mb-3 bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <h2 className="text-base font-semibold text-blue-700 dark:text-blue-400">Post-IOA — À installer</h2>
                    <Badge variant="outline" className="ml-auto border-blue-500/30 text-blue-600">{postIOANoBox.length}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {postIOANoBox.length === 0 && <EmptyState text="Aucun patient en attente d'installation" />}
                  {postIOANoBox.map((enc, i) => (
                    <PatientCard key={enc.id} {...cardProps(enc, i, true)} showWaitingBadge />
                  ))}
                </div>
              </div>

              {waitingCount === 0 && <EmptyState text="Aucun patient en attente" />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
