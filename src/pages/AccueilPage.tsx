import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/urgence/StatCard';
import { LogOut, UserPlus, Check, Users, Clock, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '@/lib/vitals-utils';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { NetworkStatus } from '@/components/urgence/NetworkStatus';
import { OnboardingBanner } from '@/components/urgence/OnboardingBanner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getWaitTimeMinutes, formatWaitTime } from '@/lib/vitals-utils';
import { startAdmissionTimer, stopAdmissionTimer } from '@/lib/kpi-tracker';
import { validateINSFormat } from '@/lib/ins-service';

export default function AccueilPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState('');
  const [insNumero, setInsNumero] = useState('');
  const [adresse, setAdresse] = useState('');
  const [poids, setPoids] = useState('');
  const [medecinTraitant, setMedecinTraitant] = useState('');
  const [antecedents, setAntecedents] = useState('');
  const [allergies, setAllergies] = useState('');
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [todayEncounters, setTodayEncounters] = useState<Array<Record<string, unknown>>>([]);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; nom: string; prenom: string; date_naissance: string; sexe: string; telephone: string | null }>>([]);
  const [selectedExisting, setSelectedExisting] = useState<{ id: string; nom: string; prenom: string; date_naissance: string; sexe: string; telephone: string | null } | null>(null);

  const [, setTick] = useState(0);

  useEffect(() => {
    fetchToday();
    const channel = supabase.channel('accueil-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, () => fetchToday())
      .subscribe();
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => { supabase.removeChannel(channel); clearInterval(timer); };
  }, []);

  const fetchToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('encounters')
      .select('id, status, arrival_time, motif_sfmu, patients(nom, prenom, date_naissance, sexe)')
      .gte('arrival_time', today)
      .order('arrival_time', { ascending: false });
    if (data) setTodayEncounters(data as Array<Record<string, unknown>>);
  };

  const [homonymAlert, setHomonymAlert] = useState(false);

  const detectHomonyms = (patients: Array<{ nom: string; prenom: string }>) => {
    if (patients.length < 2) { setHomonymAlert(false); return; }
    for (let i = 0; i < patients.length; i++) {
      for (let j = i + 1; j < patients.length; j++) {
        const a = patients[i], b = patients[j];
        if (a.nom.toLowerCase() === b.nom.toLowerCase() && a.prenom.toLowerCase() === b.prenom.toLowerCase()) {
          setHomonymAlert(true); return;
        }
      }
    }
    setHomonymAlert(false);
  };

  const searchPatients = useCallback(async (searchNom: string) => {
    if (searchNom.length < 2) { setSearchResults([]); setHomonymAlert(false); return; }
    const { data } = await supabase.from('patients').select('id, nom, prenom, date_naissance, sexe, telephone').ilike('nom', `%${searchNom}%`).limit(10);
    if (data) { setSearchResults(data); detectHomonyms(data); }
  }, []);

  const handleNomChange = (value: string) => { setNom(value); setSelectedExisting(null); searchPatients(value); };
  const selectExistingPatient = (patient: typeof searchResults[number]) => {
    setSelectedExisting(patient); setNom(patient.nom); setPrenom(patient.prenom);
    setDateNaissance(patient.date_naissance); setSexe(patient.sexe); setTelephone(patient.telephone || ''); setSearchResults([]);
  };

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const admissionTimerId = `admission_${Date.now()}`;
    startAdmissionTimer(admissionTimerId);
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    if (birthDate > today) { toast.error('La date de naissance ne peut pas être dans le futur'); setSubmitting(false); return; }
    if (birthDate < new Date('1900-01-01')) { toast.error('Date de naissance invalide'); setSubmitting(false); return; }

    // INS format validation if provided
    if (insNumero) {
      const insResult = validateINSFormat(insNumero);
      if (!insResult.valid) {
        toast.error(`N° SS invalide : ${insResult.error}`);
        setSubmitting(false);
        return;
      }
    }

    let patientId: string;
    if (selectedExisting) { patientId = selectedExisting.id; }
    else {
      const { data: patient, error } = await supabase.from('patients').insert({ nom, prenom, date_naissance: dateNaissance, sexe, telephone: telephone || null, ins_numero: insNumero || null, adresse: adresse || null, poids: poids ? parseFloat(poids) : null, medecin_traitant: medecinTraitant || null, antecedents: antecedents ? antecedents.split(',').map(s => s.trim()).filter(Boolean) : null, allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : null }).select().single();
      if (error || !patient) { toast.error('Erreur de création patient'); setSubmitting(false); return; }
      patientId = patient.id;
    }
    const { error } = await supabase.from('encounters').insert({ patient_id: patientId, status: 'arrived', motif_sfmu: motif || null });
    if (error) { toast.error('Erreur de création passage'); setSubmitting(false); return; }
    const admissionSecs = stopAdmissionTimer(admissionTimerId);
    toast.success(`Passage créé${admissionSecs > 0 ? ` (${admissionSecs}s)` : ''}`);
    setNom(''); setPrenom(''); setDateNaissance(''); setSexe('M'); setMotif(''); setTelephone(''); setInsNumero(''); setAdresse(''); setPoids('');
    setMedecinTraitant(''); setAntecedents(''); setAllergies('');
    setSelectedExisting(null); setSubmitting(false); fetchToday();
  };

  const statusLabels: Record<string, string> = { planned: 'Planifié', arrived: 'Arrivé', triaged: 'Trié', 'in-progress': 'En cours', finished: 'Terminé' };
  const statusColors: Record<string, string> = {
    arrived: 'bg-medical-warning/10 text-medical-warning', triaged: 'bg-medical-info/10 text-medical-info',
    'in-progress': 'bg-medical-success/10 text-medical-success', finished: 'bg-muted text-muted-foreground',
  };
  const statusBorderColors: Record<string, string> = {
    arrived: 'border-l-medical-warning', triaged: 'border-l-medical-info',
    'in-progress': 'border-l-medical-success', finished: 'border-l-muted-foreground',
  };

  const waitingCount = todayEncounters.filter(e => e.status === 'arrived').length;
  const inProgressCount = todayEncounters.filter(e => e.status === 'in-progress').length;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-medical-success/3" />
      </div>

      <header className="sticky top-0 z-20 border-b px-4 py-3 bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Urgence<span className="text-primary">OS</span> — Accueil</h1>
            <NetworkStatus />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/select-role')}>Rôle</Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6 relative z-10">
        <OnboardingBanner role="secretaire" />
        <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
          <StatCard label="Admissions" value={todayEncounters.length} icon={Users} />
          <StatCard label="En attente" value={waitingCount} icon={Clock} variant={waitingCount > 5 ? 'warning' : 'default'} />
          <StatCard label="En cours" value={inProgressCount} icon={Activity} />
        </div>

        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Nouvelle admission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdmission} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Label className="text-sm font-medium">Nom</Label>
                  <Input value={nom} onChange={e => handleNomChange(e.target.value)} placeholder="DUPONT" required className="mt-1" />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-card border rounded-lg shadow-lg mt-1 overflow-hidden">
                      {homonymAlert && (
                        <div className="px-3 py-2 bg-medical-warning/10 border-b border-medical-warning/30 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-medical-warning" />
                          <span className="text-xs font-semibold text-medical-warning">Attention : patients homonymes détectés</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground px-3 py-1.5 border-b">Patients existants :</p>
                      {searchResults.map(p => (
                        <button key={p.id} type="button" onClick={() => selectExistingPatient(p)}
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm touch-target">
                          <span className="font-medium">{p.nom} {p.prenom}</span>
                          <span className="text-muted-foreground ml-2">{p.date_naissance} · {p.sexe}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedExisting && (
                    <Badge variant="secondary" className="mt-1 text-xs"><Check className="h-3 w-3 mr-1" /> Patient existant sélectionné</Badge>
                  )}
                </div>
                <div><Label className="text-sm font-medium">Prénom</Label><Input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" required className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-sm font-medium">Date de naissance</Label><Input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required className="mt-1" /></div>
                <div>
                  <Label className="text-sm font-medium">Sexe</Label>
                  <Select value={sexe} onValueChange={setSexe}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-sm font-medium">Téléphone</Label><Input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06..." className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-sm font-medium">N° Sécurité Sociale (optionnel)</Label><Input value={insNumero} onChange={e => setInsNumero(e.target.value)} placeholder="1 85 07 75 123 456 78" className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Adresse (optionnel)</Label><Input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="12 rue de la Paix, 75001 Paris" className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Poids (kg, optionnel)</Label><Input type="number" step="0.1" value={poids} onChange={e => setPoids(e.target.value)} placeholder="70" className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-sm font-medium">Médecin traitant (optionnel)</Label><Input value={medecinTraitant} onChange={e => setMedecinTraitant(e.target.value)} placeholder="Dr Martin" className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Antécédents (optionnel)</Label><Input value={antecedents} onChange={e => setAntecedents(e.target.value)} placeholder="HTA, diabète..." className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Allergies (optionnel)</Label><Input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Pénicilline, iode..." className="mt-1" /></div>
              </div>
              <div>
                <Label className="text-sm font-medium">Motif (optionnel)</Label>
                <Input value={motif} onChange={e => setMotif(e.target.value)} placeholder="Motif administratif" className="mt-1" />
              </div>
              <Button type="submit" className="w-full touch-target text-base" disabled={submitting}>
                {submitting ? 'En cours...' : 'Créer le passage'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Admissions du jour</span>
              <Badge variant="outline">{todayEncounters.length} passages</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEncounters.length === 0 && <p className="text-sm text-muted-foreground">Aucune admission aujourd'hui</p>}
            <div className="space-y-2">
              {todayEncounters.map((enc, index) => {
                const p = enc.patients;
                return (
                  <div key={enc.id}
                    onClick={() => navigate(`/patient/${enc.id}`)}
                    className={cn('flex items-center justify-between p-3 rounded-lg border border-l-4 animate-in fade-in slide-in-from-bottom-2 hover:shadow-sm hover:bg-accent/30 transition-all cursor-pointer',
                      statusBorderColors[enc.status] || 'border-l-muted-foreground')}
                    style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}>
                    <div>
                      <p className="font-medium text-sm">{p?.nom?.toUpperCase()} {p?.prenom}</p>
                      <p className="text-xs text-muted-foreground">
                        {enc.motif_sfmu || 'Pas de motif'} · {new Date(enc.arrival_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {enc.status !== 'finished' && (() => {
                          const waitMin = getWaitTimeMinutes(enc.arrival_time);
                          return <span className={cn('ml-2', waitMin > 60 ? 'text-medical-critical font-medium' : waitMin > 30 ? 'text-medical-warning' : '')}> · {formatWaitTime(waitMin)}</span>;
                        })()}
                      </p>
                    </div>
                    <Badge className={statusColors[enc.status] || ''} variant="outline">
                      {statusLabels[enc.status] || enc.status}
                    </Badge>
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
