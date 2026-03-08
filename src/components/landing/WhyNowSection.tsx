import { AlertTriangle, Building2, Clock, Eye } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const urgencies = [
  { icon: AlertTriangle, text: 'Les cyberattaques contre les hôpitaux se multiplient chaque année.' },
  { icon: Building2, text: 'Les éditeurs augmentent leurs tarifs sans que le logiciel s\'améliore.' },
  { icon: Clock, text: 'Vos soignants perdent chaque jour du temps sur des outils mal pensés.' },
  { icon: Eye, text: 'Les autorités de santé demandent des indicateurs que vos outils ne produisent pas.' },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function WhyNowSection() {
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
          Pourquoi maintenant
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl font-bold mb-6"
        >
          Chaque mois d'attente aggrave la situation.
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {urgencies.map((item, i) => (
            <motion.div
              key={item.text}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-4 rounded-xl border bg-background text-center space-y-2 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <item.icon className="h-5 w-5 text-[hsl(var(--medical-warning))] mx-auto" />
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Chaque mois sans changement coûte en temps soignant, en risques de sécurité et en opportunités manquées. Le pilote de 10 semaines n'est pas un engagement irréversible : c'est un test cadré, avec des critères de réussite définis à l'avance.
        </motion.p>
      </div>
    </Section>
  );
}
