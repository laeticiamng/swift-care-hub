import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AppRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Activity, ArrowLeft, ClipboardList, Heart, LogOut,
  Stethoscope, Timer, UserPlus, Users,
} from 'lucide-react';

const ROLES: { role: AppRole; label: string; desc: string; icon: React.ReactNode; color: string; route: string }[] = [
  { role: 'medecin', label: 'Medecin urgentiste', desc: 'Board panoramique, dossier patient, prescriptions', icon: <Stethoscope className="h-8 w-8" />, color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50', route: '/board' },
  { role: 'ioa', label: 'IOA', desc: 'Triage en 5 etapes, classification CIMU, file d\'attente', icon: <ClipboardList className="h-8 w-8" />, color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50', route: '/ioa-queue' },
  { role: 'ide', label: 'IDE', desc: 'Pancarte unifiee, administration medicaments, transmissions DAR', icon: <Heart className="h-8 w-8" />, color: 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50', route: '/board' },
  { role: 'as', label: 'Aide-soignant', desc: '4 gros boutons tactiles, saisie constantes, alertes', icon: <Activity className="h-8 w-8" />, color: 'border-green-500 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50', route: '/as' },
  { role: 'secretaire', label: 'Secretaire', desc: 'Admission rapide < 90s, recherche patient, attribution box', icon: <UserPlus className="h-8 w-8" />, color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50', route: '/accueil' },
];

export default function DemoLivePage() {
  const navigate = useNavigate();
  const { isDemoMode, enterDemo, exitDemo, demoRole } = useDemo();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectRole = (role: AppRole, route: string) => {
    enterDemo(role);
    navigate(route);
  };

  const handleExit = () => {
    exitDemo();
    navigate('/');
  };

  if (isDemoMode && demoRole) {
    const currentRole = ROLES.find(r => r.role === demoRole);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <Badge variant="secondary">Mode Demo</Badge>
            <p className="text-sm text-muted-foreground">
              Vous etes connecte en tant que <strong>{currentRole?.label}</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(currentRole?.route || '/board')}>
                Aller au board
              </Button>
              <Button variant="destructive" onClick={handleExit}>
                <LogOut className="h-4 w-4 mr-1" /> Quitter la demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/demo')} className="flex items-center gap-2 text-lg font-bold">
            <ArrowLeft className="h-4 w-4" /> Urgence<span className="text-primary">OS</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Demo interactive
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold">Choisissez votre role</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Selectionnez un profil pour explorer l'interface correspondante avec des donnees fictives.
            Aucun compte necessaire.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>10 patients simules — Donnees en temps reel</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map(r => (
            <button
              key={r.role}
              onClick={() => handleSelectRole(r.role, r.route)}
              className={cn(
                'p-6 rounded-xl border-2 text-left transition-all hover:shadow-md',
                r.color,
              )}
            >
              <div className="mb-3">{r.icon}</div>
              <h3 className="font-bold text-lg mb-1">{r.label}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/demo')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour a la demo guidee
          </Button>
        </div>

        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Les donnees affichees sont fictives et generees pour la demonstration.
            UrgenceOS ne constitue pas un dispositif medical certifie.
          </p>
        </div>
      </div>
    </div>
  );
}
