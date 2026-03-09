import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const fp = t.forgotPassword;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError(fp.emailRequired); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(fp.sendError);
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
            <ArrowLeft className="h-4 w-4" /> {fp.backToLogin}
          </Link>
        </div>

        <Card className="shadow-lg border animate-in fade-in scale-in duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{fp.title}</CardTitle>
              <CardDescription className="mt-1">{fp.subtitle}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
                <h3 className="text-lg font-bold">{fp.sentTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {fp.sentText} <span className="font-medium text-foreground">{email}</span>,
                  {' '}{fp.sentText.includes('recevrez') ? 'vous recevrez un lien de réinitialisation.' : 'you will receive a reset link.'}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                  <Mail className="h-3.5 w-3.5" />
                  {fp.checkSpam}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{fp.email}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={fp.emailPlaceholder} required />
                </div>
                {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? fp.sending : fp.sendLink}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
