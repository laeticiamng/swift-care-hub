import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LogOut, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '@/lib/vitals-utils';

export default function AccueilPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('M');
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [todayEncounters, setTodayEncounters] = useState<any[]>([]);

  useEffect(() => { fetchToday(); }, []);

  const fetchToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('encounters')
      .select('id, status, arrival_time, motif_sfmu, patients(nom, prenom, date_naissance, sexe)')
      .gte('arrival_time', today)
      .order('arrival_time', { ascending: false });
    if (data) setTodayEncounters(data as any[]);
  };

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: patient } = await supabase.from('patients').insert({
      nom, prenom, date_naissance: dateNaissance, sexe,
    }).select().single();

    if (patient) {
      await supabase.from('encounters').insert({
        patient_id: patient.id,
        status: 'arrived',
        motif_sfmu: motif || null,
      });
    }

    setNom(''); setPrenom(''); setDateNaissance(''); setSexe('M'); setMotif('');
    setSubmitting(false);
    fetchToday();
  };

  const statusLabels: Record<string, string> = {
    planned: 'Planifié', arrived: 'Arrivé', triaged: 'Trié', 'in-progress': 'En cours', finished: 'Terminé',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <h1 className="text-xl font-bold">UrgenceOS — Accueil</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Nouvelle admission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdmission} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom</Label><Input value={nom} onChange={e => setNom(e.target.value)} placeholder="DUPONT" required className="mt-1" /></div>
                <div><Label>Prénom</Label><Input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" required className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date de naissance</Label><Input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required className="mt-1" /></div>
                <div>
                  <Label>Sexe</Label>
                  <Select value={sexe} onValueChange={setSexe}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Motif (optionnel)</Label>
                <Input value={motif} onChange={e => setMotif(e.target.value)} placeholder="Motif administratif" className="mt-1" />
              </div>
              <Button type="submit" className="w-full touch-target text-base" disabled={submitting}>
                {submitting ? 'En cours...' : 'Créer le passage'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admissions du jour</CardTitle></CardHeader>
          <CardContent>
            {todayEncounters.length === 0 && <p className="text-sm text-muted-foreground">Aucune admission aujourd'hui</p>}
            <div className="space-y-2">
              {todayEncounters.map(enc => {
                const p = enc.patients;
                return (
                  <div key={enc.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{p?.nom?.toUpperCase()} {p?.prenom}</p>
                      <p className="text-xs text-muted-foreground">{enc.motif_sfmu || 'Pas de motif'} · {new Date(enc.arrival_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <Badge variant="outline">{statusLabels[enc.status] || enc.status}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
