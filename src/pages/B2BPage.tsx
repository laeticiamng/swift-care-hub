import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { JsonLd, PageMeta, webPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import {
  ArrowRight, Building2, Check, CheckCircle, Send, Shield,
  Clock, Users, Layers, RefreshCcw, Eye, Target,
} from 'lucide-react';

export default function B2BPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    try {
      const { error } = await supabase.functions.invoke('contact-lead', {
        body: {
          lastName: data.get('lastName'),
          firstName: data.get('firstName'),
          email: data.get('email'),
          establishment: data.get('establishment'),
          roleFunction: data.get('role'),
          passagesVolume: data.get('passages'),
          message: data.get('message'),
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setSubmitError('Une erreur est survenue. Veuillez réessayer ou nous contacter par email.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="UrgenceOS — Établissements hospitaliers | Reprenez le contrôle"
        description="Reprenez le contrôle de votre informatique hospitalière avec UrgenceOS. Un logiciel que votre hôpital possède, des résultats mesurables en 10 semaines."
        canonical="https://urgenceos.fr/b2b"
      />
      <JsonLd id="b2b-webpage" data={webPageSchema({
        name: 'UrgenceOS — Établissements hospitaliers',
        description: 'Un logiciel que votre hôpital possède, des modules urgences aux résultats mesurables, compatible avec votre existant.',
        url: 'https://urgenceos.fr/b2b',
        breadcrumb: ['Accueil', 'Établissements'],
      })} />
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <Breadcrumb items={[
          { label: 'Accueil', to: '/' },
          { label: 'Établissements' },
        ]} />
        {/* Hero — Positionnement stratégique */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4">Direction Générale / DAF / DSI / ARS</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Reprenez le contrôle de votre informatique hospitalière.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
            UrgenceOS n'est pas un logiciel de plus à acheter. C'est un plan d'autonomie :
            un logiciel que votre hôpital possède, des modules urgences aux résultats mesurables, et une compatibilité totale avec votre existant.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Votre dossier patient reste en place. Les outils dispersés disparaissent. Les coûts diminuent.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Demander un pilote <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/features')}>
              Voir les fonctionnalités
            </Button>
          </div>
        </div>

        {/* 4 discours par persona */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Un discours, quatre interlocuteurs.</h2>
          <p className="text-muted-foreground text-center mb-10">Chaque décideur trouve sa réponse dans UrgenceOS.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Building2,
                role: 'Direction Générale / DAF',
                message: 'Chaque année, 3 à 7 % du budget part en licences que vous ne maîtrisez pas. Pendant ce temps, 45 à 90 minutes par soignant sont perdues chaque jour sur des outils mal pensés. UrgenceOS inverse la tendance : un logiciel que vous possédez, des résultats mesurables, des coûts prévisibles et décroissants.',
              },
              {
                icon: Shield,
                role: 'DSI',
                message: 'Votre système d\'information est une mosaïque de 15 à 40 logiciels connectés par des interfaces artisanales. UrgenceOS propose un socle interne standardisé — gestion des identités, droits d\'accès, traçabilité, échanges sécurisés — que votre équipe contrôle. Le dossier patient reste en place. Les risques diminuent.',
              },
              {
                icon: Eye,
                role: 'ARS',
                message: 'Un modèle de sobriété logicielle mutualisable à l\'échelle d\'un GHT. Un socle commun déployable entre établissements, des modules standardisés, une gouvernance d\'interopérabilité alignée sur les référentiels nationaux (INS, DMP, MSSanté, RPU ATIH).',
              },
              {
                icon: Users,
                role: 'Terrain urgences',
                message: 'Un écran unique, structuré par rôle, où le parcours patient complet est lisible en moins de 10 secondes. Timeline horodatée, alertes labo, tâches en cours, transmissions. Un tap pour valider un acte. Zéro ressaisie. Zéro navigation inutile.',
              },
            ].map((p) => (
              <div key={p.role} className="p-6 rounded-xl border bg-card space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold">{p.role}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital-Owned Software */}
        <div className="mb-20 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Layers className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Hospital-Owned Software</h2>
              <p className="text-muted-foreground leading-relaxed">
                L'établissement détient, gouverne et priorise un socle logiciel interne. Le code est accessible.
                Les données restent sous gouvernance hospitalière. Les priorités d'évolution sont décidées par l'hôpital, pas par un éditeur.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {[
              'Le socle est possédé par l\'hôpital — pas loué à un éditeur',
              'Les données restent sous gouvernance hospitalière — pas de lock-in',
              'Les priorités sont décidées en interne — pas par un plan produit commercial',
              'La sécurité est auditable — pas de boîte noire',
              'Le DPI reste en place — le socle l\'encadre sans le remplacer',
              'Les coûts sont prévisibles et décroissants — pas de hausse unilatérale',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ce que nous remplaçons / Ce que nous unifions */}
        <div className="mb-20 grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-medical-critical" /> Ce que nous remplaçons
            </h3>
            <ul className="space-y-2">
              {[
                'Empilement de logiciels satellites non intégrés',
                'Interfaces artisanales entre applications',
                'Outils bureautiques détournés en outils métier',
                'Doubles saisies systématiques',
                'Coordination opaque : qui fait quoi, depuis quand',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-medical-critical shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Ce que nous unifions
            </h3>
            <ul className="space-y-2">
              {[
                'Parcours patient complet dans une seule timeline',
                'Tâches et responsabilités visibles par tous selon leurs droits',
                'Alertes structurées routées vers le bon professionnel',
                'Transmissions inter-équipes horodatées et rattachées au patient',
                'Audit et traçabilité : chaque action journalisée',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pilote 10 semaines */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Pilote DG/DSI ready : 10 semaines.</h2>
          <p className="text-muted-foreground text-center mb-8">
            Périmètre strict. ROI mesuré. Critères go/no-go définis avant le lancement.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 'S1-S2', title: 'Cadrage & baseline', desc: 'Audit technique, cartographie des flux, chronométrage terrain, mesure de l\'état initial.' },
              { step: 'S3-S5', title: 'Déploiement', desc: 'Socle + 2 modules urgences. Connecteurs DPI/LIS. Tests d\'intégration.' },
              { step: 'S6-S8', title: 'Formation & terrain', desc: 'Formation par rôle. Lancement progressif. Présence physique. Quick wins visibles.' },
              { step: 'S9-S10', title: 'Mesure & rapport', desc: 'Chronométrage post-déploiement. Rapport DG/DAF + DSI + terrain. Décision go/no-go.' },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-xl border bg-card">
                <span className="text-xs font-semibold text-primary">{s.step}</span>
                <h3 className="font-bold mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>




        {/* Contact form */}
        <div id="contact" className="scroll-mt-20 mb-20">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl border bg-card">
            <div className="text-center mb-8">
              <Building2 className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Demander un pilote</h2>
              <p className="text-muted-foreground">
                10 semaines, périmètre urgences, ROI mesuré. Notre équipe vous recontacte sous 48h.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Demande envoyée</h3>
                <p className="text-muted-foreground">
                  Merci. Notre équipe vous recontacte dans les 48 heures ouvrées pour organiser un premier échange.
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" placeholder="Dupont" required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" placeholder="Marie" required maxLength={200} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input id="email" name="email" type="email" placeholder="m.dupont@ch-exemple.fr" required maxLength={255} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishment">Établissement *</Label>
                    <Input id="establishment" name="establishment" placeholder="CH de Exemple" required maxLength={300} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Fonction *</Label>
                    <Input id="role" name="role" placeholder="DG, DAF, DSI, Chef de service..." required maxLength={200} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passages">Volume de passages/an (estimation)</Label>
                  <Input id="passages" name="passages" placeholder="ex: 35 000" maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Contexte et enjeux (optionnel)</Label>
                  <Textarea id="message" name="message" placeholder="DPI en place, nombre de services, irritants principaux..." rows={4} maxLength={2000} />
                </div>
                {submitError && <p className="text-sm text-medical-critical text-center">{submitError}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  <Send className="h-4 w-4 mr-2" /> {submitting ? 'Envoi en cours...' : 'Demander un pilote'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <Link to="/politique-confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            UrgenceOS est un outil d'aide à la gestion des urgences hospitalières.
            Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
