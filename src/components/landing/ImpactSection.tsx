import { Zap, Timer, Clock, AppWindow } from 'lucide-react';
import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';

const impacts = [
  { value: '1 tap', label: 'au lieu de 6-8 clics pour administrer', icon: Zap },
  { value: '< 2 min', label: 'pour un tri IOA complet', icon: Timer },
  { value: '< 90 sec', label: 'pour une admission patient', icon: Clock },
  { value: '0', label: 'logiciel supplémentaire à ouvrir', icon: AppWindow },
];

export function ImpactSection() {
  return (
    <Section className="bg-secondary/30 py-24 px-6" id="impact">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Résultats</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Des gains mesurables dès le premier jour</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Chaque métrique a été conçue pour être vérifiable en situation réelle.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {impacts.map(m => (
            <div key={m.label} className="bg-card rounded-2xl border p-8 shadow-sm flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <m.icon className="h-8 w-8 text-primary" />
              </div>
              <AnimatedCounter value={m.value} className="text-3xl font-extrabold text-primary" />
              <p className="text-sm text-muted-foreground leading-snug">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
