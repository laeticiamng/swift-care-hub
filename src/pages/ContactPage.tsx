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
import { Mail, Send, CheckCircle, Building2, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [roleFunction, setRoleFunction] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !establishment.trim() || !roleFunction.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
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
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch {
      toast.error('Une erreur est survenue. Réessayez ou contactez-nous par email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Breadcrumb items={[
          { label: 'Accueil', to: '/' },
          { label: 'Contact' },
        ]} />

        <div className="text-center mb-10 mt-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            Nous contacter
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Parlons de votre projet</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Une question sur UrgenceOS, un essai à planifier, ou simplement envie d'en savoir plus ? Remplissez le formulaire ci-dessous.
          </p>
        </div>

        {success ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-10 space-y-4">
              <CheckCircle className="h-12 w-12 text-medical-success mx-auto" />
              <h2 className="text-xl font-bold">Message envoyé !</h2>
              <p className="text-sm text-muted-foreground">
                Nous reviendrons vers vous sous 48h ouvrées.
              </p>
              <Button variant="outline" asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Formulaire de contact
              </CardTitle>
              <CardDescription>
                Tous les champs marqués * sont obligatoires.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" required maxLength={100} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie.dupont@hopital.fr" required maxLength={255} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishment">Établissement *</Label>
                    <Input id="establishment" value={establishment} onChange={e => setEstablishment(e.target.value)} placeholder="CHU de Lyon" required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Fonction *</Label>
                    <Input id="role" value={roleFunction} onChange={e => setRoleFunction(e.target.value)} placeholder="DSI, Médecin urgentiste..." required maxLength={200} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Décrivez votre besoin, la taille de votre service, vos contraintes..." rows={4} maxLength={2000} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Envoyer le message
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Vous pouvez aussi nous écrire directement à{' '}
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
