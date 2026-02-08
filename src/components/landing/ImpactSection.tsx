import { Zap, Timer, Clock, AppWindow, MousePointerClick, GraduationCap, FileText, FileCheck, Target, WifiOff } from 'lucide-react';
import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';

const impacts = [
  { value: '< 2 min', label: 'Tri IOA complet', icon: Timer },
  { value: '1 tap', label: 'Administration médicament', icon: Zap },
  { value: '< 90s', label: 'Admission patient', icon: Clock },
  { value: '0', label: 'Changement de page IDE', icon: AppWindow },
  { value: '3 clics', label: 'Prescription complète', icon: MousePointerClick },
  { value: '< 30 min', label: 'Autonomie formation', icon: GraduationCap },
  { value: '< 1 min', label: 'Transmission DAR', icon: FileText },
  { value: '0 sec', label: 'Accès CRH auto', icon: FileCheck },
  { value: '> 80', label: 'Score SUS cible', icon: Target },
  { value: '> 4h', label: 'Mode offline', icon: WifiOff },
];

export function ImpactSection() {
  return (
    <Section className="bg-secondary/30 py-24 px-6" id="impact">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Métriques vérifiables</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Moins de clics. Plus de soin.</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Chaque interaction a été optimisée pour redonner du temps au soignant.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
          {impacts.map(m => (
            <div key={m.label} className="bg-card rounded-2xl border p-5 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <AnimatedCounter value={m.value} className="text-xl font-extrabold text-primary" />
              <p className="text-xs text-muted-foreground leading-snug">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
