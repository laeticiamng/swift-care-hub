import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MFAChallengeProps {
  onVerified: () => void;
  onCancel: () => void;
}

export default function MFAChallenge({ onVerified, onCancel }: MFAChallengeProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState('');

  useEffect(() => {
    const loadFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp && data.totp.length > 0) {
        const verified = data.totp.find(f => f.status === 'verified');
        if (verified) setFactorId(verified.id);
      }
    };
    loadFactors();
  }, []);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr || !challenge) { toast.error('Erreur challenge MFA'); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
      if (vErr) { toast.error('Code invalide'); setCode(''); return; }
      onVerified();
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) handleVerify();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
      </div>
      <Card className="w-full max-w-md shadow-lg relative z-10 animate-in fade-in scale-in duration-300">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Vérification MFA</CardTitle>
          <CardDescription>
            Entrez le code à 6 chiffres de votre application d'authentification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-verify-code">Code TOTP</Label>
            <Input
              id="mfa-verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
          </div>
          <Button onClick={handleVerify} className="w-full" disabled={loading || code.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
            Vérifier
          </Button>
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            Annuler
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
