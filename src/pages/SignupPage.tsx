import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useI18n } from '@/i18n/I18nContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const signupSchema = z.object({
    fullName: z.string().trim().min(2, t.signup.minChars).max(100, t.signup.maxChars),
    email: z.string().trim().email(t.signup.invalidEmail),
    password: z.string().min(8, t.login.minChars),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.signup.passwordsMismatch,
    path: ['confirmPassword'],
  });

  const passwordStrength = (() => {
    if (password.length === 0) return { label: '', color: '', percent: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: t.signup.strengthWeak, color: 'bg-medical-critical', percent: 20 };
    if (score <= 2) return { label: t.signup.strengthMedium, color: 'bg-medical-warning', percent: 40 };
    if (score <= 3) return { label: t.signup.strengthFair, color: 'bg-yellow-500', percent: 60 };
    if (score <= 4) return { label: t.signup.strengthStrong, color: 'bg-medical-success', percent: 80 };
    return { label: t.signup.strengthVeryStrong, color: 'bg-medical-success', percent: 100 };
  })();

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
          setError(t.signup.alreadyRegistered);
        } else if (error.message.includes('password')) {
          setError(t.signup.compromisedPassword);
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
            {t.signup.leftPanelText}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
        </div>

        <div className="w-full max-w-md mb-4 relative z-10">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t.signup.backToLogin}
          </Link>
        </div>

        <Card className="w-full max-w-md shadow-lg border relative z-10 animate-in fade-in scale-in duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 lg:hidden">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t.signup.title}</CardTitle>
              <CardDescription className="mt-1">
                {t.signup.subtitle}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
                <h3 className="text-lg font-bold">{t.signup.successTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.signup.successText} <span className="font-medium text-foreground">{email}</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.signup.successNote}
                </p>
                <Button variant="outline" onClick={() => navigate('/login')} className="mt-4">
                  {t.signup.backToLoginBtn}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.signup.fullName}</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t.signup.fullNamePlaceholder} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.signup.professionalEmail}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.signup.emailPlaceholder} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.signup.password}</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.signup.passwordPlaceholder} required className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showPassword ? t.signup.hidePassword : t.signup.showPassword}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.percent}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{passwordStrength.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{t.signup.passwordHint}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.signup.confirmPassword}</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t.signup.confirmPlaceholder} required className="pr-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showConfirm ? t.signup.hidePassword : t.signup.showPassword}>
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-[10px] text-medical-critical">{t.signup.passwordsMismatch}</p>
                  )}
                </div>
                {error && <p className="text-sm text-medical-critical animate-in fade-in duration-200">{error}</p>}
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? t.signup.creating : t.signup.createAccount}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {t.signup.termsAgree}{' '}
                  <Link to="/cgu" className="text-primary hover:underline">{t.signup.termsLink}</Link> {t.signup.andOur}{' '}
                  <Link to="/politique-confidentialite" className="text-primary hover:underline">{t.signup.privacyLink}</Link>.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  {t.signup.alreadyHaveAccount}{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">{t.signup.loginLink}</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
