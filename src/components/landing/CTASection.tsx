import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';

const PILLARS = [
  { icon: Sparkles, title: 'Simplicité terrain', desc: '1 tap = 1 action. Zéro formation. Interfaces pensées pour des gardes de 12h.' },
  { icon: ShieldCheck, title: 'Confiance clinique', desc: 'Données chiffrées, RLS par rôle, traçabilité complète. Aucun compromis sur la sécurité.' },
  { icon: Rocket, title: 'Déploiement réaliste', desc: 'PWA, offline-first, zéro installation. Opérationnel en 5 minutes sur n\'importe quel terminal.' },
];

export function CTASection() {
  const navigate = useNavigate();

  return (
    <Section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* 3 piliers */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {PILLARS.map(p => (
            <div key={p.title} className="p-6 rounded-xl border bg-card/50 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/10 p-12 sm:p-16 shadow-sm">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Essai immédiat</p>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Prêt à transformer les urgences ?</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            5 profils préconfigurés pour tester immédiatement. Aucune installation requise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Accéder à UrgenceOS <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base"
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Revoir la démo
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
