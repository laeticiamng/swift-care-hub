import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';

const PILLARS = [
  {
    icon: Building2,
    title: 'Contrôle total',
    desc: 'L\'hôpital possède le socle, gouverne les priorités, et maîtrise les coûts sur 5 ans.',
  },
  {
    icon: Shield,
    title: 'Sécurité structurelle',
    desc: 'Moins d\'applications exposées, droits par rôle, traçabilité complète. La surface d\'attaque diminue.',
  },
  {
    icon: Clock,
    title: 'Temps clinique récupéré',
    desc: 'Un seul écran par rôle. Zéro ressaisie. 30 à 50 % de friction logicielle en moins aux urgences.',
  },
];

export function CTASection() {
  const navigate = useNavigate();

  return (
    <Section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* 3 piliers */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {PILLARS.map((p) => (
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
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Pilote cadré, ROI mesuré</p>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">10 semaines pour prouver le modèle.</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            Périmètre urgences. Deux modules. Intégration avec votre DPI existant.
            Critères de succès définis avant le lancement. Si les résultats sont là, vous décidez de la suite.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/b2b')}
              className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Demander un pilote <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base"
              onClick={() => navigate('/demo')}
            >
              Voir la démo
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
