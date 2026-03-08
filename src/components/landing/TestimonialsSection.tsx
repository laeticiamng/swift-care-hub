import { Quote } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "En 3 semaines d'utilisation, notre temps de tri IOA est passé de 4 à 2 minutes. L'interface est tellement intuitive que même les intérimaires l'adoptent immédiatement.",
    name: 'Dr. Camille Renard',
    role: 'Médecin urgentiste',
    hospital: 'CHU de Bordeaux',
    initials: 'CR',
  },
  {
    quote: "L'administration en 1 tap a changé mon quotidien. Je passe enfin plus de temps auprès du patient qu'à cliquer sur un écran.",
    name: 'Élodie Martin',
    role: 'IDE aux urgences',
    hospital: 'Hôpital Saint-Antoine, Paris',
    initials: 'EM',
  },
  {
    quote: "Le board panoramique donne une vision claire de la charge en temps réel. On anticipe mieux, on gère mieux les flux.",
    name: 'Marc-Antoine Leroy',
    role: 'Cadre de santé',
    hospital: 'CH de Nantes',
    initials: 'ML',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function TestimonialsSection() {
  return (
    <Section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
        >
          Témoignages
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
        >
          Ce que disent les soignants
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
        >
          Retours d'expérience de professionnels ayant testé UrgenceOS en conditions réelles.
        </motion.p>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl border p-8 shadow-sm text-left hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group"
            >
              <Quote className="h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors absolute top-6 right-6" />
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="border-t pt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-primary font-medium">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.hospital}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
