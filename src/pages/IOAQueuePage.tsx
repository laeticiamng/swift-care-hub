import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateAge, getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { LogOut, ClipboardList, ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-medical-warning" />
            <h1 className="text-xl font-bold">File d'attente IOA</h1>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{encounters.length} en attente</Badge>
            <Button size="sm" onClick={() => navigate('/triage')}>Nouveau tri</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/board')}>Board</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-3">
        {loading && <p className="text-muted-foreground text-center py-8">Chargement...</p>}
        {!loading && encounters.length === 0 && (
          <p className="text-muted-foreground text-center py-12">Aucun patient en attente de tri</p>
        )}
        {encounters.map(enc => {
          const p = enc.patients;
          const age = calculateAge(p.date_naissance);
          const waitMin = getWaitTimeMinutes(enc.arrival_time);
          const waitStr = formatWaitTime(waitMin);
          const waitCritical = waitMin > 60;
          const waitWarning = waitMin > 30;

          return (
            <Card key={enc.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.nom.toUpperCase()} {p.prenom}</span>
                    <span className="text-sm text-muted-foreground">{age}a · {p.sexe}</span>
                  </div>
                  {enc.motif_sfmu && <p className="text-sm text-muted-foreground">{enc.motif_sfmu}</p>}
                  <p className={cn('text-sm font-medium',
                    waitCritical ? 'text-medical-critical' : waitWarning ? 'text-medical-warning' : 'text-muted-foreground'
                  )}>
                    Attente : {waitStr}
                  </p>
                  {p.allergies && p.allergies.length > 0 && (
                    <p className="text-xs text-medical-critical font-medium">⚠ {p.allergies.join(', ')}</p>
                  )}
                </div>
                <Button onClick={() => navigate('/triage', { state: { patientId: enc.patient_id, encounterId: enc.id } })}>
                  Trier <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
