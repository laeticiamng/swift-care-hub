import { Section } from './Section';
import { motion } from 'framer-motion';

const phases = [
  { step: 'Phase 1', title: 'Pilote', desc: 'Un établissement prouve le ROI sur le périmètre urgences.' },
  { step: 'Phase 2', title: 'Mutualisation', desc: 'Trois établissements partagent le socle et les modules.' },
  { step: 'Phase 3', title: 'Standardisation', desc: 'Le GHT standardise ses flux et divise ses coûts.' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function VisionSection() {
  return (
    <Section className="py-16 px-6 bg-card border-y">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
        >
          Vision long terme
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl font-bold mb-4"
        >
          Un hôpital valide. Un GHT mutualise. Un territoire standardise.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Le socle UrgenceOS est conçu pour être partagé entre établissements d'un même GHT.
          Même infrastructure, données isolées, modules communs, coûts divisés.
        </motion.p>
        <div className="grid sm:grid-cols-3 gap-4">
          {phases.map((item, i) => (
            <motion.div
              key={item.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-xl border bg-background space-y-2 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <span className="text-xs font-semibold text-primary">{item.step}</span>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-sm text-muted-foreground italic"
        >
          L'objectif : que l'hôpital public reprenne le contrôle collectif sur son système d'information.
        </motion.p>
      </div>
    </Section>
  );
}
