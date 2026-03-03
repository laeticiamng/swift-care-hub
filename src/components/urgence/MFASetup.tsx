import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MFASetupProps {
  onComplete: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
}

export default function MFASetup({ onComplete, onSkip, canSkip = false }: MFASetupProps) {
  const [qrUri, setQrUri] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'init' | 'verify'>('init');

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'UrgenceOS Auth' });
      if (error || !data) { toast.error(error?.message || 'Erreur MFA'); return; }
      setQrUri(data.totp.qr_code);
      setFactorId(data.id);
      setStep('verify');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { toast.error('Code à 6 chiffres requis'); return; }
    setLoading(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr || !challenge) { toast.error('Erreur challenge MFA'); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
      if (vErr) { toast.error('Code invalide'); return; }
      toast.success('MFA activé avec succès');
      onComplete();
    } finally { setLoading(false); }
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
          <CardTitle>Authentification à deux facteurs</CardTitle>
          <CardDescription>
            {step === 'init'
              ? 'Votre rôle médical nécessite l\'activation du MFA pour sécuriser l\'accès aux données patients.'
              : 'Scannez le QR code avec votre application d\'authentification (Google Authenticator, Authy...) puis entrez le code.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'init' && (
            <>
              <Button onClick={handleEnroll} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Configurer le MFA
              </Button>
              {canSkip && onSkip && (
                <Button variant="ghost" onClick={onSkip} className="w-full text-muted-foreground">
                  Configurer plus tard
                </Button>
              )}
            </>
          )}
          {step === 'verify' && (
            <>
              {qrUri && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrUri} alt="QR Code MFA" className="w-48 h-48" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Code de vérification (6 chiffres)</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>
              <Button onClick={handleVerify} className="w-full" disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Vérifier et activer
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
