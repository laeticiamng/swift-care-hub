import { LogIn, LayoutDashboard, MousePointerClick } from 'lucide-react';
import { Section } from './Section';

const steps = [
  { icon: LogIn, step: '01', title: 'Connexion', desc: 'Identifiez-vous avec votre profil hospitalier.' },
  { icon: LayoutDashboard, step: '02', title: 'Interface adaptée', desc: 'Votre rôle détermine votre vue — uniquement l\'essentiel.' },
  { icon: MousePointerClick, step: '03', title: 'Action en 1 tap', desc: 'Chaque geste clinique se fait en un minimum de clics.' },
];

export function HowItWorksSection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Simple et rapide</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">3 étapes, de la connexion à l'action</h2>
        <p className="text-muted-foreground mb-14 max-w-xl mx-auto leading-relaxed">
          Un workflow pensé pour le soignant, pas pour l'informaticien.
        </p>
        <div className="grid sm:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center gap-5">
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-muted-foreground/15" />
              )}
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center relative shadow-sm">
                <s.icon className="h-10 w-10 text-primary" />
                <span className="absolute -top-2.5 -right-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center shadow-md">
                  {s.step}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
