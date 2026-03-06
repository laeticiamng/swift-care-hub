import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  email: z.string().trim().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validation = signupSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Un compte existe déjà avec cet email.');
        } else if (error.message.includes('password')) {
          setError('Le mot de passe a été compromis ou est trop faible. Choisissez-en un autre.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
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
            Rejoignez la plateforme de gestion des urgences hospitalières. Créez votre compte et un administrateur vous attribuera votre rôle.
          </p>
        </div>
      </div>

      {/* Right panel — signup form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
        </div>

        <div className="w-full max-w-md mb-4 relative z-10">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
        </div>

        <Card className="w-full max-w-md shadow-lg border relative z-10 animate-in fade-in scale-in duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 lg:hidden">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
              <CardDescription className="mt-1">
                Inscription à UrgenceOS
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
                <h3 className="text-lg font-bold">Vérifiez votre email</h3>
                <p className="text-sm text-muted-foreground">
                  Un email de confirmation a été envoyé à <span className="font-medium text-foreground">{email}</span>.
                  Cliquez sur le lien pour activer votre compte.
                </p>
                <p className="text-xs text-muted-foreground">
                  Après confirmation, un administrateur vous attribuera un rôle pour accéder à la plateforme.
                </p>
                <Button variant="outline" onClick={() => navigate('/login')} className="mt-4">
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Marie Dupont" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@hopital.fr" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 caractères" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répétez le mot de passe" required />
                </div>
                {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  En créant un compte, vous acceptez nos{' '}
                  <Link to="/cgu" className="text-primary hover:underline">CGU</Link> et notre{' '}
                  <Link to="/politique-confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
