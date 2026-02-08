import { Quote } from 'lucide-react';
import { Section } from './Section';

const testimonials = [
  {
    quote: "En 3 semaines d'utilisation, notre temps de tri IOA est passé de 4 à 2 minutes. L'interface est tellement intuitive que même les intérimaires l'adoptent immédiatement.",
    name: 'Dr. Camille Renard',
    role: 'Médecin urgentiste',
    hospital: 'CHU de Bordeaux',
  },
  {
    quote: "L'administration en 1 tap a changé mon quotidien. Je passe enfin plus de temps auprès du patient qu'à cliquer sur un écran.",
    name: 'Élodie Martin',
    role: 'IDE aux urgences',
    hospital: 'Hôpital Saint-Antoine, Paris',
  },
  {
    quote: "Le board panoramique donne une vision claire de la charge en temps réel. On anticipe mieux, on gère mieux les flux.",
    name: 'Marc-Antoine Leroy',
    role: 'Cadre de santé',
    hospital: 'CH de Nantes',
  },
];

export function TestimonialsSection() {
  return (
    <Section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Témoignages</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ce que disent les soignants</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
          Retours d'expérience de professionnels ayant testé UrgenceOS en conditions réelles.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl border p-8 shadow-sm text-left hover:shadow-md transition-shadow relative"
            >
              <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-primary font-medium">{t.role}</p>
                <p className="text-xs text-muted-foreground">{t.hospital}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
