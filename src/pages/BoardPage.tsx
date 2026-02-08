import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CCMUBadge } from '@/components/urgence/CCMUBadge';
import { StatCard } from '@/components/urgence/StatCard';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { Users, LogOut, Filter, FlaskConical, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Zone = 'sau' | 'uhcd' | 'dechocage';
const ZONES: { key: Zone; label: string }[] = [
  { key: 'sau', label: 'SAU' },
  { key: 'uhcd', label: 'UHCD' },
  { key: 'dechocage', label: 'Déchocage' },
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
  patients: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    allergies: string[] | null;
  };
}

interface ResultCount {
  encounter_id: string;
  unread: number;
  critical: number;
}

export default function BoardPage() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EncounterWithPatient[]>([]);
  const [resultCounts, setResultCounts] = useState<ResultCount[]>([]);
  const [myOnly, setMyOnly] = useState(false);
  const [loading, setLoading] = useState(true);

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
      supabase
        .from('results')
        .select('encounter_id, is_read, is_critical'),
    ]);

    if (encRes.data) setEncounters(encRes.data as unknown as EncounterWithPatient[]);

    // Compute result counts per encounter
    if (resRes.data) {
      const map = new Map<string, ResultCount>();
      for (const r of resRes.data) {
        if (!map.has(r.encounter_id)) {
          map.set(r.encounter_id, { encounter_id: r.encounter_id, unread: 0, critical: 0 });
        }
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
    fetchEncounters();
  };

  const filtered = myOnly ? encounters.filter(e => e.medecin_id === user?.id) : encounters;
  const byZone = (zone: Zone) => filtered.filter(e => e.zone === zone);
  const getResultCount = (encId: string) => resultCounts.find(r => r.encounter_id === encId);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">UrgenceOS</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {ZONES.map(z => (
              <StatCard key={z.key} label={z.label} value={byZone(z.key).length} icon={Users} className="py-1 px-3" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant={myOnly ? 'default' : 'outline'} size="sm" onClick={() => setMyOnly(!myOnly)}>
              <Filter className="h-4 w-4 mr-1" /> Mes patients
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>
              Changer rôle
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {ZONES.map(zone => (
          <div key={zone.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{zone.label}</h2>
              <span className="text-sm text-muted-foreground">{byZone(zone.key).length} patients</span>
            </div>
            <div className="space-y-2">
              {byZone(zone.key).map(encounter => {
                const p = encounter.patients;
                const age = calculateAge(p.date_naissance);
                const waitMin = getWaitTimeMinutes(encounter.arrival_time);
                const waitStr = formatWaitTime(waitMin);
                const waitCritical = waitMin > 240;
                const waitWarning = waitMin > 120;
                const rc = getResultCount(encounter.id);

                return (
                  <Card
                    key={encounter.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99]"
                    onClick={() => navigate(role === 'ide' ? `/pancarte/${encounter.id}` : `/patient/${encounter.id}`)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.nom.toUpperCase()} {p.prenom}</span>
                          <span className="text-sm text-muted-foreground">{age}a · {p.sexe}</span>
                        </div>
                        {encounter.ccmu && <CCMUBadge level={encounter.ccmu} size="sm" />}
                      </div>
                      {encounter.motif_sfmu && (
                        <p className="text-sm text-muted-foreground">{encounter.motif_sfmu}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className={cn(
                          'font-medium',
                          waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground',
                        )}>
                          {waitStr}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {rc && rc.critical > 0 && (
                            <Badge className="bg-medical-critical text-medical-critical-foreground text-xs px-1.5 py-0">
                              <FlaskConical className="h-3 w-3 mr-0.5" /> {rc.critical}
                            </Badge>
                          )}
                          {rc && rc.unread > 0 && rc.critical === 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              <FlaskConical className="h-3 w-3 mr-0.5" /> {rc.unread}
                            </Badge>
                          )}
                          {encounter.box_number && <span className="text-muted-foreground">Box {encounter.box_number}</span>}
                        </div>
                        <Select
                          value={encounter.zone || ''}
                          onValueChange={(v) => { handleMoveZone(encounter.id, v as Zone); }}
                        >
                          <SelectTrigger className="w-auto h-7 text-xs" onClick={e => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ZONES.map(z => <SelectItem key={z.key} value={z.key}>{z.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {p.allergies && p.allergies.length > 0 && (
                        <p className="text-xs text-medical-critical font-medium">⚠ {p.allergies.join(', ')}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {byZone(zone.key).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun patient</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}