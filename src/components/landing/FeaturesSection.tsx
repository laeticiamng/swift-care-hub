import { MonitorDot, Zap, Clock, ShieldAlert } from 'lucide-react';
import { Section } from './Section';

const features = [
  { icon: MonitorDot, title: 'Board temps réel', desc: 'Vue panoramique 3 colonnes SAU, UHCD et Déchocage avec drag and drop et mise à jour instantanée.' },
  { icon: Zap, title: '1 tap administration', desc: 'L\'IDE trace une administration médicamenteuse en un seul geste. De 6-8 clics à 1.' },
  { icon: Clock, title: 'Tri IOA en moins de 2 min', desc: 'Workflow guidé en 5 étapes avec suggestion CIMU automatique basée sur les constantes.' },
  { icon: ShieldAlert, title: 'Sécurité clinique', desc: 'Détection des allergies croisées et des constantes anormales en temps réel avec alertes visuelles.' },
];

export function FeaturesSection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Fonctionnalités</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Conçu pour le geste clinique</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Chaque écran, chaque bouton est pensé pour réduire la charge cognitive et accélérer le soin.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map(f => (
            <div key={f.title} className="group bg-card rounded-2xl border p-8 shadow-sm text-left hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
