import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight, Building2, Check, Clock, FileText, Heart,
  Lock, Monitor, RefreshCcw, Shield, Stethoscope, Timer,
  Users, Wifi, WifiOff, Zap, CheckCircle, Send,
} from 'lucide-react';

const PAIN_POINTS = [
  { icon: Clock, stat: '45 min', desc: 'perdues par garde en clics inutiles par soignant' },
  { icon: Monitor, stat: '12+', desc: 'écrans différents pour une seule prise en charge' },
  { icon: WifiOff, stat: '0', desc: 'outil fonctionnel quand le réseau tombe' },
  { icon: Users, stat: '1', desc: 'interface identique pour 5 métiers différents' },
];

const BENEFITS = [
  {
    icon: Timer,
    title: 'Tri IOA en < 2 minutes',
    desc: 'Workflow 5 étapes avec suggestion CIMU automatique. Fini les 5-8 minutes de saisie.',
  },
  {
    icon: Zap,
    title: 'Administration en 1 tap',
    desc: 'De 6-8 clics à 1 seul tap pour administrer un médicament. Traçabilité automatique.',
  },
  {
    icon: Heart,
    title: 'Admission en < 90 secondes',
    desc: 'Workflow secrétariat optimisé avec vérification INS intégrée.',
  },
  {
    icon: Stethoscope,
    title: 'Pancarte IDE zéro page',
    desc: 'Tout le dossier infirmier sur un seul écran. Prescriptions, constantes, transmissions.',
  },
  {
    icon: Wifi,
    title: 'Offline 4h+',
    desc: 'PWA avec cache local. Les urgences ne s\'arrêtent pas quand le réseau tombe.',
  },
  {
    icon: Lock,
    title: 'Sécurité native',
    desc: 'HDS, RLS, chiffrement, audit trail. Conforme dès la conception.',
  },
];

const INTEGRATION_POINTS = [
  'FHIR R4 (Patient, Encounter, Observation, MedicationRequest)',
  'HL7v2 (ADT, ORM, ORU) — flux bidirectionnels',
  'MSSanté — échanges sécurisés professionnels de santé',
  'Identité INS — vérification d\'identité nationale',
  'RPU normalisé FEDORU — génération automatique',
  'SSO / LDAP — authentification établissement',
];

const DEPLOYMENT_STEPS = [
  { step: '1', title: 'Cadrage', desc: 'Audit du workflow existant, identification des zones et boxes, mapping SIH', duration: 'Semaine 1' },
  { step: '2', title: 'Configuration', desc: 'Paramétrage UrgenceOS, connecteurs SIH, tests d\'intégration', duration: 'Semaine 2' },
  { step: '3', title: 'Formation', desc: 'Formation des référents (1 jour), déploiement pilote sur un périmètre restreint', duration: 'Semaine 3' },
  { step: '4', title: 'Go-live', desc: 'Mise en production, support renforcé, ajustements terrain', duration: 'Semaine 4' },
];

export default function B2BPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4">Établissements de santé</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Digitalisez vos urgences en 4 semaines
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            UrgenceOS est le système d'exploitation conçu spécifiquement pour les services
            d'accueil des urgences. Déploiement clé en main, hébergement HDS,
            interopérabilité SIH native.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Demander une démo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/tarifs')}>
              Voir les tarifs
            </Button>
          </div>
        </div>

        {/* Pain points */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Le constat terrain</h2>
          <p className="text-muted-foreground text-center mb-8">
            Les outils actuels des urgences ne sont pas à la hauteur de l'exigence du terrain
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAIN_POINTS.map((p) => (
              <div key={p.desc} className="p-6 rounded-xl border bg-card text-center">
                <p.icon className="h-6 w-6 text-medical-critical mx-auto mb-3" />
                <p className="text-3xl font-extrabold text-medical-critical">{p.stat}</p>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Ce qu'UrgenceOS change</h2>
          <p className="text-muted-foreground text-center mb-8">
            Des résultats mesurables dès les premières semaines
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-xl border bg-card space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <RefreshCcw className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Interopérabilité SIH native</h2>
              <p className="text-muted-foreground">
                UrgenceOS s'intègre à votre système d'information hospitalier sans remplacer vos outils existants.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {INTEGRATION_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* Deployment timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Déploiement en 4 semaines</h2>
          <p className="text-muted-foreground text-center mb-8">
            Un accompagnement structuré pour une mise en production rapide et maîtrisée
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPLOYMENT_STEPS.map((s) => (
              <div key={s.step} className="p-6 rounded-xl border bg-card">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-xs text-primary font-medium mb-2">{s.duration}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Certifications & conformité</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'HDS Certifié',
                desc: 'Hébergement de Données de Santé conforme à l\'article L.1111-8 du Code de la santé publique.',
              },
              {
                icon: Lock,
                title: 'ISO 27001',
                desc: 'Système de management de la sécurité de l\'information. Démarche de certification en cours.',
              },
              {
                icon: FileText,
                title: 'Conformité ANS',
                desc: 'Respect du cadre d\'interopérabilité CI-SIS et des référentiels de l\'Agence du Numérique en Santé.',
              },
            ].map((c) => (
              <div key={c.title} className="p-6 rounded-xl border bg-card text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div id="contact" className="scroll-mt-20 mb-20">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl border bg-card">
            <div className="text-center mb-8">
              <Building2 className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Demander une présentation</h2>
              <p className="text-muted-foreground">
                Remplissez ce formulaire et notre équipe vous recontacte sous 48h.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-medical-success mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Demande envoyée</h3>
                <p className="text-muted-foreground">
                  Merci pour votre intérêt. Notre équipe vous recontacte dans les 48 heures ouvrées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" placeholder="Dupont" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" placeholder="Marie" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input id="email" type="email" placeholder="m.dupont@ch-exemple.fr" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishment">Établissement *</Label>
                    <Input id="establishment" placeholder="CH de Exemple" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Fonction *</Label>
                    <Input id="role" placeholder="DSI, Chef de service, Directeur..." required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passages">Volume de passages/an (estimation)</Label>
                  <Input id="passages" placeholder="ex: 35 000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea id="message" placeholder="Décrivez votre contexte, vos enjeux..." rows={4} />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" /> Envoyer la demande
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <a href="/politique-confidentialite" className="text-primary hover:underline">politique de confidentialité</a>.
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
      </div>

      <FooterSection />
    </div>
  );
}
