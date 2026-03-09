import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { Send, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';

export default function ContactPage() {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [roleFunction, setRoleFunction] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !establishment.trim() || !roleFunction.trim()) {
      toast.error(t.contact.fillRequired);
      return;
    }
    if (website) {
      setSuccess(true);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('contact-lead', {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          establishment: establishment.trim(),
          roleFunction: roleFunction.trim(),
          message: message.trim() || null,
          website: '',
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch {
      toast.error(t.contact.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Breadcrumb items={[
          { label: t.contact.breadcrumbHome, to: '/' },
          { label: t.contact.breadcrumbContact },
        ]} />

        <div className="text-center mb-10 mt-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            {t.contact.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t.contact.title}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        {success ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-10 space-y-4">
              <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
              <h2 className="text-xl font-bold">{t.contact.successTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {t.contact.successText}
              </p>
              <Button variant="outline" asChild>
                <Link to="/">{t.contact.backToHome}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t.contact.formTitle}
              </CardTitle>
              <CardDescription>
                {t.contact.formDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t.contact.firstName}</Label>
                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t.contact.firstNamePlaceholder} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t.contact.lastName}</Label>
                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t.contact.lastNamePlaceholder} required maxLength={100} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.contact.professionalEmail}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.contact.emailPlaceholder} required maxLength={255} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishment">{t.contact.establishment}</Label>
                    <Input id="establishment" value={establishment} onChange={e => setEstablishment(e.target.value)} placeholder={t.contact.establishmentPlaceholder} required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">{t.contact.role}</Label>
                    <Input id="role" value={roleFunction} onChange={e => setRoleFunction(e.target.value)} placeholder={t.contact.rolePlaceholder} required maxLength={200} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.contact.message}</Label>
                  <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder={t.contact.messagePlaceholder} rows={4} maxLength={2000} />
                </div>
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.contact.sending : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> {t.contact.send}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {t.contact.directEmail}{' '}
                  <a href="mailto:contact@urgenceos.fr" className="text-primary hover:underline">contact@urgenceos.fr</a>
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
