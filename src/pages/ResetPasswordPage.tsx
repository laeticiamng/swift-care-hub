import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, CheckCircle } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const rp = t.resetPassword;
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setHasRecoveryToken(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoveryToken(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError(rp.minChars); return; }
    if (password !== confirmPassword) { setError(rp.mismatch); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message.includes('password') ? rp.compromised : error.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasRecoveryToken && !window.location.hash) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {rp.invalidLink} <br />
              <Button variant="link" onClick={() => navigate('/forgot-password')} className="text-primary">
                {rp.requestNew}
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
      </div>

      <Card className="w-full max-w-md shadow-lg border relative z-10 animate-in fade-in scale-in duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">{rp.title}</CardTitle>
            <CardDescription className="mt-1">{rp.subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
              <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
              <h3 className="text-lg font-bold">{rp.successTitle}</h3>
              <p className="text-sm text-muted-foreground">{rp.successRedirect}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{rp.newPassword}</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={rp.newPasswordPlaceholder} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{rp.confirm}</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={rp.confirmPlaceholder} required />
              </div>
              {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
              <Button type="submit" className="w-full touch-target" disabled={loading}>
                {loading ? rp.updating : rp.update}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
