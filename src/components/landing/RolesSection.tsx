import { Stethoscope, Shield, ClipboardList, Heart, UserCheck } from 'lucide-react';
import { Section } from './Section';
const roles = [{
  icon: Stethoscope,
  title: 'Médecin',
  desc: 'Board panoramique, dossier contextuel et prescriptions avec contrôle allergies.'
}, {
  icon: Shield,
  title: 'IOA',
  desc: 'Tri structuré en 5 étapes avec suggestion CIMU — moins de 2 minutes.'
}, {
  icon: ClipboardList,
  title: 'IDE',
  desc: 'Pancarte unifiée — administration médicamenteuse en 1 tap.'
}, {
  icon: Heart,
  title: 'Aide-soignant(e)',
  desc: '4 gros boutons, saisie rapide des constantes, zéro donnée médicale.'
}, {
  icon: UserCheck,
  title: 'Secrétaire',
  desc: 'Admission patient en moins de 90 secondes, recherche par nom ou INS.'
}];
export function RolesSection() {
  return <Section className="bg-secondary/30 py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Adapté à chacun</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">5 profils, 1 seul système</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Même patient, même donnée, cinq interfaces radicalement différentes — chacune montre uniquement l'essentiel.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {roles.map(r => <div key={r.title} className="group bg-card rounded-2xl border p-6 text-left hover:border-primary/20 transition-all duration-300 shadow-lg mx-0 px-[21px]">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <r.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{r.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>)}
        </div>
      </div>
    </Section>;
}