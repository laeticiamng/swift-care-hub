import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, Info, Play } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) { setError(validation.error.errors[0].message); return; }
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
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
              </div>
              {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
              <Button type="submit" className="w-full touch-target" disabled={loading}>
                {loading ? 'Chargement...' : 'Se connecter'}
              </Button>
            </form>
            {(
              <div className="mt-6 space-y-4">
                <Button variant="outline" className="w-full touch-target bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300" onClick={() => navigate('/demo/live')}>
                  <Play className="h-4 w-4 mr-2" /> Mode Demo — Aucun compte requis
                </Button>
              <div className="p-5 rounded-xl bg-muted/50 border border-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Comptes de demonstration
                </div>
                <div className="space-y-1">
                  {[
                    { email: 'martin@urgenceos.fr', label: 'Dr. Martin Dupont', role: 'Médecin' },
                    { email: 'sophie@urgenceos.fr', label: 'Sophie Lefevre', role: 'IOA' },
                    { email: 'julie@urgenceos.fr', label: 'Julie Bernard', role: 'IDE' },
                    { email: 'marc@urgenceos.fr', label: 'Marc Petit', role: 'Aide-soignant' },
                    { email: 'nathalie@urgenceos.fr', label: 'Nathalie Moreau', role: 'Secrétaire' },
                  ].map(account => (
                    <button key={account.email} type="button"
                      onClick={() => { setEmail(account.email); setPassword('urgenceos2026'); }}
                      className="flex items-center justify-between w-full text-sm text-primary hover:bg-accent hover:shadow-sm rounded-lg px-3 py-2.5 transition-all touch-target">
                      <span className="font-medium">{account.label}</span>
                      <span className="text-muted-foreground text-xs">{account.role}</span>
                    </button>
                  ))}
                </div>
              </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
