import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/urgence/StatCard';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { LogOut, ClipboardList, ArrowRight, AlertTriangle, Loader2, Users, Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';

interface QueuePatient {
  id: string;
  patient_id: string;
  arrival_time: string;
  motif_sfmu: string | null;
  patients: { nom: string; prenom: string; date_naissance: string; sexe: string; allergies: string[] | null };
}

export default function IOAQueuePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const channel = supabase
      .channel('ioa-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, () => fetchQueue())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from('encounters')
      .select('id, patient_id, arrival_time, motif_sfmu, patients(nom, prenom, date_naissance, sexe, allergies)')
      .eq('status', 'arrived')
      .order('arrival_time', { ascending: true });
    if (data) setEncounters(data as unknown as QueuePatient[]);
    setLoading(false);
  };

  const waitTimes = encounters.map(e => getWaitTimeMinutes(e.arrival_time));
  const avgWait = waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
  const maxWait = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

  const getWaitBorderColor = (waitMin: number) => {
    if (waitMin > 60) return 'border-l-medical-critical';
    if (waitMin > 30) return 'border-l-medical-warning';
    return 'border-l-medical-success';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b shadow-sm px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-medical-warning" />
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span> <span className="text-muted-foreground font-normal">— IOA</span></h1>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/triage')}>Nouveau tri</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/board')}>Board</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="En attente" value={encounters.length} icon={Users} />
          <StatCard label="Attente moy." value={`${avgWait} min`} icon={Clock} variant={avgWait > 30 ? 'warning' : 'default'} />
          <StatCard label="Attente max" value={`${maxWait} min`} icon={Timer} variant={maxWait > 60 ? 'critical' : 'default'} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />Chargement...
          </div>
        )}

        {!loading && encounters.length === 0 && (
          <div className="text-center py-16 space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-medical-success/10 flex items-center justify-center">
              <ClipboardList className="h-10 w-10 text-medical-success" />
            </div>
            <div>
              <p className="text-lg font-semibold">File d'attente vide</p>
              <p className="text-sm text-muted-foreground mt-1">Tous les patients ont été triés.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {encounters.map((enc, index) => {
            const p = enc.patients;
            const age = calculateAge(p.date_naissance);
            const waitMin = getWaitTimeMinutes(enc.arrival_time);
            const waitStr = formatWaitTime(waitMin);
            const waitCritical = waitMin > 60;
            const waitWarning = waitMin > 30;
            const arrivalTime = new Date(enc.arrival_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            return (
              <Card
                key={enc.id}
                className={cn(
                  'hover:shadow-md transition-all border-l-4 animate-in fade-in slide-in-from-bottom-2',
                  getWaitBorderColor(waitMin),
                )}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.nom.toUpperCase()} {p.prenom}</span>
                      <span className="text-sm text-muted-foreground">{age}a · {p.sexe}</span>
                    </div>
                    {enc.motif_sfmu && <p className="text-sm text-muted-foreground">{enc.motif_sfmu}</p>}
                    <div className="flex items-center gap-3">
                      <p className={cn('text-sm font-medium',
                        waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground'
                      )}>
                        Attente : {waitStr}
                      </p>
                      <span className="text-xs text-muted-foreground">Arrivée {arrivalTime}</span>
                    </div>
                    {p.allergies && p.allergies.length > 0 && (
                      <p className="text-xs text-medical-critical font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {p.allergies.join(', ')}</p>
                    )}
                  </div>
                  <Button onClick={() => navigate('/triage', { state: { patientId: enc.patient_id, encounterId: enc.id } })} className="touch-target">
                    Trier <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
