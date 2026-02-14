import { useNavigate } from 'react-router-dom';
import {
  Building2, Shield, RefreshCcw, ArrowRight, CheckCircle,
  Layers, Eye, Clock, MonitorSmartphone, AlertTriangle, Unplug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* BLOC 1 — Hero */}
      <HeroSection />

      {/* BLOC 2 — Problème : dette opérationnelle */}
      <ProblemSection />

      {/* BLOC 3 — Solution : Hospital-Owned Software */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">La solution</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            La solution n'est pas un nouvel outil. C'est un changement de modèle.
          </h2>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12 leading-relaxed">
            Hospital-Owned Software : votre hôpital possède un socle logiciel interne sur lequel se branchent des modules métier interopérables. Le DPI reste en place. Les outils satellites disparaissent un par un.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Layers,
                title: 'Socle interne',
                desc: 'Identité, droits, audit, échanges de données sécurisés (FHIR), monitoring complet. Un socle que l\'hôpital possède et gouverne.',
              },
              {
                icon: MonitorSmartphone,
                title: 'Modules urgences à ROI',
                desc: 'Récap parcours patient par rôle + traçabilité temps réel. Déployables en 10 semaines, mesurables dès le premier mois.',
              },
              {
                icon: RefreshCcw,
                title: 'Intégration sans refonte',
                desc: 'Le DPI reste en place. Nous l\'encadrons via des connecteurs standards (FHIR R4, HL7v2). Zéro refonte inutile.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border bg-card space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC 4 — Pourquoi maintenant */}
      <section className="py-16 px-6 bg-card border-y">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pourquoi maintenant</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Le statu quo coûte plus cher que le changement.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: AlertTriangle, text: 'Cyberattaques en hausse : chaque hôpital est une cible.' },
              { icon: Building2, text: 'Coûts éditeurs croissants, sans corrélation avec la valeur.' },
              { icon: Clock, text: 'Soignants épuisés par la friction logicielle quotidienne.' },
              { icon: Eye, text: 'ARS exigeant des indicateurs que vos SI ne produisent pas.' },
            ].map((item) => (
              <div key={item.text} className="p-4 rounded-xl border bg-background text-center space-y-2">
                <item.icon className="h-5 w-5 text-medical-warning mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Chaque mois de statu quo est un mois de dette supplémentaire. Le pilote de 10 semaines ne demande pas une décision irréversible : il demande un test mesuré, cadré, avec critères de succès définis à l'avance.
          </p>
        </div>
      </section>

      {/* BLOC 5 — Ce que vous gagnez */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">Ce que vous gagnez</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Des résultats concrets, mesurables, sur votre périmètre.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Contrôle', desc: 'Vous décidez des priorités d\'évolution de votre SI, pas un éditeur.' },
              { title: 'Temps clinique', desc: 'Vos équipes urgences récupèrent 30 à 50 % du temps perdu en friction logicielle.' },
              { title: 'Résilience', desc: 'Moins d\'applications exposées, moins de surface d\'attaque, moins de dépendance fournisseur.' },
              { title: 'Interopérabilité', desc: 'Standards ouverts (FHIR, HL7v2) au lieu d\'interfaces propriétaires fragiles.' },
              { title: 'Traçabilité', desc: 'Chaque action horodatée, attribuée, auditable. Couverture médico-légale renforcée.' },
              { title: 'Économies structurelles', desc: 'Outils satellites remplacés par des modules intégrés : moins cher à maintenir, sécuriser, évoluer.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-5 rounded-xl border bg-card">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC 6 — Sécurité & contrôle */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <Shield className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">La sécurité n'est pas une option. C'est l'architecture.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Authentification forte. Droits par rôle vérifiés côté serveur. Journal d'audit non modifiable. Chiffrement en transit et au repos. Environnements isolés. Alertes automatiques sur comportements suspects.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Le socle réduit la surface d\'attaque en réduisant le nombre d\'applications exposées',
              'Chaque échange DPI passe par un bus d\'intégration documenté, testé, surveillé',
              'Pas de comptes partagés. Pas de données non chiffrées. Pas de données orphelines.',
              'Traçabilité complète : qui a vu quoi, fait quoi, quand — immuable',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-card border">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{point}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => navigate('/securite')}>
              En savoir plus sur la sécurité <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* BLOC 7 — Pilote + BLOC 8 — Vision (dans le CTA) */}
      <CTASection />

      {/* Vision long terme */}
      <section className="py-16 px-6 bg-card border-y">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Vision long terme</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Un hôpital valide. Un GHT mutualise. Un territoire standardise.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Le socle UrgenceOS est conçu pour être partagé entre établissements d'un même GHT.
            Même infrastructure, données isolées, modules communs, coûts divisés.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: 'Phase 1', title: 'Pilote', desc: 'Un établissement prouve le ROI sur le périmètre urgences.' },
              { step: 'Phase 2', title: 'Mutualisation', desc: 'Trois établissements partagent le socle et les modules.' },
              { step: 'Phase 3', title: 'Standardisation', desc: 'Le GHT standardise ses flux et divise ses coûts.' },
            ].map((item) => (
              <div key={item.step} className="p-5 rounded-xl border bg-background space-y-2">
                <span className="text-xs font-semibold text-primary">{item.step}</span>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground italic">
            L'objectif : que l'hôpital public reprenne le contrôle collectif sur son système d'information.
          </p>
        </div>
      </section>

      {/* Ce que nous ne faisons pas */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Ce que nous ne faisons pas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Pas de refonte DPI', desc: 'Le DPI cœur reste en place. UrgenceOS encadre, structure et complète — il ne remplace pas.' },
              { title: 'Pas un logiciel de plus', desc: 'UrgenceOS est une méthode, une architecture, un socle et des modules. Pas un énième outil à empiler.' },
              { title: 'Pas de révolution immédiate', desc: 'Un wedge concret (urgences), un ROI mesuré, une extension si les résultats sont là.' },
              { title: 'Pas d\'IA cosmétique', desc: 'L\'aide à la décision repose sur des scores validés (CIMU, NEWS, qSOFA), pas sur des promesses algorithmiques.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-5 rounded-xl border bg-card">
                <Unplug className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer réglementaire */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
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
