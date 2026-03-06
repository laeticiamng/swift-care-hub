import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, Play } from 'lucide-react';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/server-role-guard';
import MFAChallenge from '@/components/urgence/MFAChallenge';
import MFASetup from '@/components/urgence/MFASetup';

const loginSchema = z.object({
  email: z.string().trim().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

export default function LoginPage() {
  const { signIn, mfaRequired, mfaEnrollRequired, completeMFA, completeMFAEnroll, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA Challenge after login
  if (mfaRequired) {
    return <MFAChallenge onVerified={() => { completeMFA(); navigate('/select-role'); }} onCancel={signOut} />;
  }
  // MFA Enrollment required for medical roles
  if (mfaEnrollRequired) {
    return <MFASetup onComplete={() => { completeMFAEnroll(); navigate('/select-role'); }} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) { setError(validation.error.errors[0].message); return; }
    const rl = checkRateLimit(`login_${email}`, 5, 60_000);
    if (!rl.allowed) { setError(`Trop de tentatives. Réessayez dans ${Math.ceil(rl.resetIn / 1000)}s`); return; }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) { setError('Email ou mot de passe incorrect'); } else { navigate('/select-role'); }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left panel — illustration (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-medical-success/10 flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-medical-success/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/15 animate-[pulse_3s_ease-in-out_infinite]">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Urgence<span className="text-primary">OS</span></h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pilotez votre service d'urgences en temps réel. Triage, prescriptions, résultats et coordination — tout en un seul outil.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '< 30s', label: 'Temps de triage' },
              { value: '100%', label: 'Traçabilité' },
              { value: '0', label: 'Papier' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${(i + 1) * 150}ms`, animationFillMode: 'both' }}>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
          <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -right-32 w-80 h-80 bg-medical-success/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md mb-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
        </div>
        <Card className="w-full max-w-md shadow-lg border relative z-10 animate-in fade-in scale-in duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 lg:hidden">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">UrgenceOS</CardTitle>
              <CardDescription className="mt-1">
                Connexion au système
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@hopital.fr" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</Link>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
              </div>
              {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
              <Button type="submit" className="w-full touch-target" disabled={loading}>
                {loading ? 'Chargement...' : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">Créer un compte</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
              </div>
              <Button variant="outline" className="w-full touch-target bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300" onClick={() => navigate('/demo/live')}>
                <Play className="h-4 w-4 mr-2" /> Mode Démo — Aucun compte requis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
