import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';
import { Building2, ShieldCheck, Clock, Users, Handshake } from 'lucide-react';

const stats = [
  { value: '10', suffix: ' sem.', label: 'Pilote opérationnel', icon: Clock },
  { value: '5', suffix: ' rôles', label: 'Interfaces métier dédiées', icon: Users },
  { value: '100', suffix: '%', label: 'Interop. FHIR R4 & HL7v2', icon: ShieldCheck },
  { value: '0', suffix: ' refonte', label: 'Le DPI reste en place', icon: Building2 },
];

const partners = [
  { name: 'CHU universitaire', status: 'Co-conception en cours' },
  { name: 'GHT multi-sites', status: 'Évaluation architecture' },
  { name: 'CH de proximité', status: 'Cadrage pilote' },
];

export function SocialProofSection() {
  return (
    <Section className="py-20 px-6 border-y bg-card/50">
      <div className="max-w-5xl mx-auto">
        {/* Chiffres clés */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Chiffres clés</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Des engagements concrets, pas des promesses.</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Chaque indicateur est vérifiable. Chaque résultat est mesurable dès le pilote.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 text-center space-y-2 hover:shadow-md transition-shadow">
              <s.icon className="h-5 w-5 text-primary mx-auto" />
              <p className="text-3xl font-extrabold text-foreground leading-none">
                <AnimatedCounter value={s.value} />
                <span className="text-lg font-semibold text-primary">{s.suffix}</span>
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Design Partners */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Design Partners</p>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Co-construit avec des établissements hospitaliers.</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            UrgenceOS se développe en partenariat direct avec des urgentistes, DSI et cadres de santé en milieu hospitalier.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.name} className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.status}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          Les noms des établissements partenaires seront publiés avec leur accord après le lancement du premier pilote.
        </p>
      </div>
    </Section>
  );
}
