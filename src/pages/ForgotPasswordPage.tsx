import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email requis'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError('Erreur lors de l\'envoi. Vérifiez votre email et réessayez.');
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-4">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
        </div>

        <Card className="shadow-lg border animate-in fade-in scale-in duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription className="mt-1">
                Recevez un lien de réinitialisation par email
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
                <h3 className="text-lg font-bold">Email envoyé</h3>
                <p className="text-sm text-muted-foreground">
                  Si un compte existe avec l'adresse <span className="font-medium text-foreground">{email}</span>,
                  vous recevrez un lien de réinitialisation.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                  <Mail className="h-3.5 w-3.5" />
                  Vérifiez aussi vos courriers indésirables.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@hopital.fr" required />
                </div>
                {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
