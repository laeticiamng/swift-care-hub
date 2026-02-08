import { Section } from './Section';
import { ClipboardList, FileText, Monitor, Zap, Brain, WifiOff, Shield } from 'lucide-react';

const innovations = [
  { icon: ClipboardList, title: 'Pancarte unifiée', desc: 'Constantes, prescriptions, actes et transmissions sur un seul écran sans changement de page.' },
  { icon: FileText, title: 'Transmissions DAR', desc: 'Format Données-Actions-Résultats avec pré-remplissage automatique des constantes et actes.' },
  { icon: Monitor, title: 'Interface adaptative', desc: 'Chaque rôle voit exactement ce dont il a besoin — pas plus, pas moins.' },
  { icon: Zap, title: 'Admin 1 tap', desc: 'Administration médicamenteuse en un seul geste avec titration intégrée.' },
  { icon: Brain, title: 'Timeline IA', desc: 'Historique patient structuré avec antécédents, allergies et diagnostics contextualisés.' },
  { icon: WifiOff, title: 'Offline-first', desc: 'Fonctionne même en cas de coupure réseau — les données se synchronisent automatiquement.' },
  { icon: Shield, title: 'Secure-by-design', desc: 'Chiffrement, RLS, audit trail et contrôle d\'accès par rôle intégrés nativement.' },
];

export function InnovationsSection() {
  return (
    <Section id="innovations" className="py-24 px-6 bg-secondary/20">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Architecture</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">7 innovations clés</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Chaque brique a été conçue pour éliminer les frictions du quotidien aux urgences.
        </p>
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
