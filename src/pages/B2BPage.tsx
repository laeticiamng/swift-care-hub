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
  ArrowRight, Building2, Check, CheckCircle, Send, Shield,
  Clock, Users, Layers, RefreshCcw, Eye, Target,
} from 'lucide-react';

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
        {/* Hero — Positionnement stratégique */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4">Direction Générale / DAF / DSI / ARS</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Reprenez le contrôle de votre SI hospitalier.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
            UrgenceOS n'est pas un logiciel à acheter. C'est un plan d'autonomie logicielle :
            un socle interne possédé par l'hôpital + des modules urgences à ROI mesurable + des standards d'interopérabilité ouverts.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Le DPI reste en place. Les outils satellites disparaissent. La dette opérationnelle se rembourse.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Demander un pilote <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/features')}>
              Voir l'architecture
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
                message: 'Chaque année, 3 à 7 % du budget de fonctionnement part en licences non maîtrisées. Pendant ce temps, 45 à 90 minutes par poste sont perdues en friction logicielle. UrgenceOS rembourse cette dette : un socle que vous possédez, des modules à ROI mesurable, des coûts prévisibles et décroissants.',
              },
              {
                icon: Shield,
                role: 'DSI',
                message: 'Votre SI est une mosaïque de 15 à 40 applications connectées par des interfaces artisanales. UrgenceOS propose un socle interne standardisé — identité, RBAC, audit, bus FHIR — que votre équipe gouverne. Le DPI reste en place. La surface d\'attaque diminue. La continuité de service augmente.',
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

        {/* Phrases prêtes à coller par persona */}
        <div className="mb-20 p-8 rounded-2xl border bg-card">
          <h2 className="text-xl font-bold mb-6 text-center">5 phrases prêtes à convaincre</h2>
          <div className="space-y-4">
            {[
              { role: 'DG', phrase: 'Avec Hospital-Owned Software, vous cessez de louer votre SI : vous en devenez propriétaire, vous décidez des priorités, et vous maîtrisez les coûts sur 5 ans.' },
              { role: 'DAF', phrase: 'Chaque outil satellite remplacé par un module intégré au socle, c\'est une ligne de coût récurrent supprimée et un risque de surcoût éditeur éliminé.' },
              { role: 'DSI', phrase: 'Le socle interne vous donne ce qu\'aucun éditeur ne vous donnera jamais : le contrôle total sur l\'architecture, la sécurité, les données et le rythme des évolutions.' },
              { role: 'ARS', phrase: 'Hospital-Owned Software, c\'est un modèle de sobriété logicielle mutualisable à l\'échelle d\'un GHT : un socle commun, des modules standards, des coûts divisés.' },
              { role: 'Urgences', phrase: 'Vous n\'aurez plus à naviguer entre 5 écrans pour savoir où en est un patient : un seul écran, adapté à votre rôle, mis à jour en temps réel.' },
            ].map((item) => (
              <div key={item.role} className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 mt-0.5 text-xs min-w-[72px] justify-center">{item.role}</Badge>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{item.phrase}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10 punchlines Free vs Orange */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">10 convictions. Zéro marketing.</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Chaque phrase est vérifiable. Chaque promesse est mesurable ou formulée comme un objectif évalué.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Un hôpital qui loue son SI à un éditeur ne maîtrise ni ses coûts, ni ses priorités, ni sa sécurité.',
              'La dette opérationnelle ne se voit pas dans les bilans. Elle se voit dans le temps que les soignants ne passent plus avec les patients.',
              'Chaque outil satellite ajouté augmente la surface d\'attaque. Chaque module intégré au socle la réduit.',
              'Le DPI est nécessaire. L\'empilement autour du DPI est le problème. UrgenceOS remplace l\'empilement, pas le DPI.',
              'Un éditeur vous vend une roadmap. Hospital-Owned Software vous donne le contrôle de la vôtre.',
              'Quand un hôpital possède son socle logiciel, il cesse de négocier des augmentations de licence — il décide de ses investissements.',
              '45 à 90 minutes par poste et par jour perdues en friction logicielle. Ce n\'est pas un problème IT. C\'est une perte de capacité clinique.',
              'La sécurité n\'est pas une fonctionnalité. C\'est une architecture. Soit elle est dans le socle, soit elle n\'existe pas.',
              'Un GHT qui mutualise un socle logiciel interne divise ses coûts, standardise ses flux et augmente sa résilience. Un GHT qui empile les éditeurs multiplie les trois.',
              'Le pilote ne dure pas un an. Il dure 10 semaines. Si le ROI n\'est pas là, vous arrêtez. Si il est là, vous scalez.',
            ].map((phrase, i) => (
              <div key={i} className="p-4 rounded-xl border bg-card flex items-start gap-3">
                <span className="text-xs font-bold text-primary shrink-0 mt-0.5 w-5">{i + 1}.</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{phrase}</p>
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
                    <Input id="role" placeholder="DG, DAF, DSI, Chef de service..." required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passages">Volume de passages/an (estimation)</Label>
                  <Input id="passages" placeholder="ex: 35 000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Contexte et enjeux (optionnel)</Label>
                  <Textarea id="message" placeholder="DPI en place, nombre de services, irritants principaux..." rows={4} />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" /> Demander un pilote
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
