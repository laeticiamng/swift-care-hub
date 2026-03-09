import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AppRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';
import {
  Activity, ArrowLeft, ArrowRight, ClipboardList, Heart, LogOut,
  Stethoscope, Timer, UserPlus, Users, Shield, FileText,
} from 'lucide-react';

export default function DemoLivePage() {
  const { t } = useI18n();
  const dl = t.demoLive;
  const roles = t.roles;
  const navigate = useNavigate();
  const { isDemoMode, enterDemo, exitDemo, demoRole } = useDemo();
  const [elapsed, setElapsed] = useState(0);

  const ROLES: { role: AppRole; label: string; desc: string; icon: React.ReactNode; color: string; route: string }[] = [
    { role: 'medecin', label: roles.medecin, desc: roles.medecinDesc, icon: <Stethoscope className="h-8 w-8" />, color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50', route: '/board' },
    { role: 'ioa', label: roles.ioa, desc: roles.ioaDesc, icon: <ClipboardList className="h-8 w-8" />, color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50', route: '/ioa-queue' },
    { role: 'ide', label: roles.ide, desc: roles.ideDesc, icon: <Heart className="h-8 w-8" />, color: 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50', route: '/board' },
    { role: 'as', label: roles.as, desc: roles.asDesc, icon: <Activity className="h-8 w-8" />, color: 'border-green-500 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50', route: '/as' },
    { role: 'secretaire', label: roles.secretaire, desc: roles.secretaireDesc, icon: <UserPlus className="h-8 w-8" />, color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50', route: '/accueil' },
  ];

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
            <Badge variant="secondary">{dl.demoMode}</Badge>
            <p className="text-sm text-muted-foreground">
              {dl.connectedAs} <strong>{currentRole?.label}</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(currentRole?.route || '/board')}>
                {dl.goToBoard}
              </Button>
              <Button variant="destructive" onClick={handleExit}>
                <LogOut className="h-4 w-4 mr-1" /> {dl.exitDemo}
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
              {dl.interactiveDemo}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold">{dl.chooseRole}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{dl.chooseRoleDesc}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{dl.simulatedPatients}</span>
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

        {/* Extra modules */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/sih-validation')} className="p-6 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-left transition-all hover:shadow-md">
            <div className="mb-3"><Shield className="h-8 w-8 text-red-600" /></div>
            <h3 className="font-bold text-lg mb-1">{dl.validationScenarios}</h3>
            <p className="text-sm text-muted-foreground">{dl.validationDesc}</p>
          </button>
          <button onClick={() => { enterDemo('medecin'); navigate('/garde'); }} className="p-6 rounded-xl border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-left transition-all hover:shadow-md">
            <div className="mb-3"><Users className="h-8 w-8 text-indigo-600" /></div>
            <h3 className="font-bold text-lg mb-1">{dl.guardMode}</h3>
            <p className="text-sm text-muted-foreground">{dl.guardDesc}</p>
          </button>
          <button onClick={() => { enterDemo('medecin'); navigate('/audit'); }} className="p-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-left transition-all hover:shadow-md">
            <div className="mb-3"><FileText className="h-8 w-8 text-emerald-600" /></div>
            <h3 className="font-bold text-lg mb-1">{dl.auditQuality}</h3>
            <p className="text-sm text-muted-foreground">{dl.auditDesc}</p>
          </button>
          <button onClick={() => { enterDemo('medecin'); navigate('/interop'); }} className="p-6 rounded-xl border-2 border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/50 text-left transition-all hover:shadow-md">
            <div className="mb-3"><Activity className="h-8 w-8 text-cyan-600" /></div>
            <h3 className="font-bold text-lg mb-1">{dl.ehrExchange}</h3>
            <p className="text-sm text-muted-foreground">{dl.ehrDesc}</p>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/demo')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {dl.backGuidedDemo}
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            {dl.backHome}
          </Button>
          <Button variant="outline" onClick={() => navigate('/signup')}>
            {dl.createAccount} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/login')}>
            {dl.login} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">{dl.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
