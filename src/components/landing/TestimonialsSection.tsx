import { MessageSquare } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const feedbacks = [
  {
    quote: "L'idée d'avoir un seul écran adapté à mon rôle, c'est exactement ce qui nous manque. On passe nos journées à jongler entre 4 logiciels.",
    role: 'Médecin urgentiste',
    context: 'Retour de co-conception',
    initials: 'MU',
  },
  {
    quote: "Si le board panoramique fonctionne comme dans la démo, ça change tout pour la coordination. Aujourd'hui on fait ça au tableau blanc.",
    role: 'Cadre de santé, service des urgences',
    context: 'Retour de co-conception',
    initials: 'CS',
  },
  {
    quote: "Ce qui m'intéresse c'est la traçabilité automatique. Aujourd'hui je note tout à la main et je retranscris après. C'est du temps perdu.",
    role: 'IDE aux urgences',
    context: 'Retour de co-conception',
    initials: 'ID',
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
          Retours terrain
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
        >
          Ce que les soignants nous disent
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
        >
          Retours recueillis lors de sessions de co-conception avec des professionnels des urgences.
        </motion.p>
        <div className="grid sm:grid-cols-3 gap-6">
          {feedbacks.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl border p-8 shadow-sm text-left hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group"
            >
              <MessageSquare className="h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors absolute top-6 right-6" />
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="border-t pt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs text-primary font-medium">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Verbatims anonymisés recueillis lors de sessions de co-conception. UrgenceOS est en phase d'essai.
        </p>
      </div>
    </Section>
  );
}
