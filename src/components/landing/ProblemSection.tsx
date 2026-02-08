import { Activity, MonitorDot, MousePointerClick } from 'lucide-react';
import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';

const stats = [
  { value: '40-60 %', label: 'Taux de burnout chez les urgentistes', icon: Activity, accent: 'text-medical-critical' },
  { value: '15+', label: 'Logiciels utilisés par service d\'urgences', icon: MonitorDot, accent: 'text-medical-warning' },
  { value: '6-8 clics', label: 'Pour une seule administration médicamenteuse', icon: MousePointerClick, accent: 'text-primary' },
];

export function ProblemSection() {
  return (
    <Section className="bg-secondary/30 py-24 px-6">
      <div id="problem" className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Le constat</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Un système fragmenté, des soignants épuisés</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Les urgences croulent sous les outils fragmentés. L'information est éparpillée, le soignant perd du temps — au détriment du patient.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map(s => (
            <div key={s.label} className="bg-card rounded-2xl border p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <AnimatedCounter value={s.value} className={`text-4xl font-extrabold ${s.accent}`} />
              <p className="text-sm text-muted-foreground leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
