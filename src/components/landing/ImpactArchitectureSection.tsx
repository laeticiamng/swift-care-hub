import { Zap, Timer, Clock, AppWindow, MousePointerClick, GraduationCap, FileText, FileCheck, Target, WifiOff, ClipboardList, Monitor, Brain, Shield } from 'lucide-react';
import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';

const impacts = [
  { value: '< 2 min', label: 'Tri IOA complet', icon: Timer },
  { value: '1 tap', label: 'Administration medicament', icon: Zap },
  { value: '< 90s', label: 'Admission patient', icon: Clock },
  { value: '0', label: 'Changement de page IDE', icon: AppWindow },
  { value: '3 clics', label: 'Prescription complete', icon: MousePointerClick },
  { value: '< 30 min', label: 'Autonomie formation', icon: GraduationCap },
  { value: '< 1 min', label: 'Transmission DAR', icon: FileText },
  { value: '0 sec', label: 'Acces CRH auto', icon: FileCheck },
  { value: '> 80', label: 'Score SUS cible', icon: Target },
  { value: '> 4h', label: 'Mode offline', icon: WifiOff },
];

const innovations = [
  { icon: ClipboardList, title: 'Pancarte unifiee', desc: 'Constantes, prescriptions, actes et transmissions sur un seul ecran sans changement de page.' },
  { icon: FileText, title: 'Transmissions DAR', desc: 'Format Donnees-Actions-Resultats avec pre-remplissage automatique des constantes et actes.' },
  { icon: Monitor, title: 'Interface adaptative', desc: 'Chaque role voit exactement ce dont il a besoin — pas plus, pas moins.' },
  { icon: Zap, title: 'Admin 1 tap', desc: 'Administration medicamenteuse en un seul geste avec titration integree.' },
  { icon: Brain, title: 'Timeline IA', desc: 'Historique patient structure avec antecedents, allergies et diagnostics contextualises.' },
  { icon: WifiOff, title: 'Offline-first', desc: 'Fonctionne meme en cas de coupure reseau — les donnees se synchronisent automatiquement.' },
  { icon: Shield, title: 'Secure-by-design', desc: 'Chiffrement, RLS, audit trail et controle d\'acces par role integres nativement.' },
];

export function ImpactArchitectureSection() {
  return (
    <Section className="bg-secondary/30 py-24 px-6" id="impact">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Impact & Architecture</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Moins de clics. Plus de soin.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Chaque interaction a ete optimisee pour redonner du temps au soignant.
          </p>
        </div>

        {/* KPIs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 mb-16">
          {impacts.map(m => (
            <div key={m.label} className="bg-card rounded-2xl border p-5 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <AnimatedCounter value={m.value} className="text-xl font-extrabold text-primary" />
              <p className="text-xs text-muted-foreground leading-snug text-center">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Innovations grid */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold">7 innovations cles</h3>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
            Chaque brique a ete concue pour eliminer les frictions du quotidien aux urgences.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {innovations.map((item, i) => (
            <div
              key={item.title}
              className="text-left p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
