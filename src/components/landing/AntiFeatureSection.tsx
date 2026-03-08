import { Unplug } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const items = [
  { title: 'Pas de refonte de votre existant', desc: 'Votre dossier patient reste en place. UrgenceOS se branche dessus — il ne le remplace pas.' },
  { title: 'Pas un logiciel de plus', desc: 'UrgenceOS est un socle intégré avec des modules par rôle. Pas un énième outil à empiler.' },
  { title: 'Pas de promesse irréaliste', desc: 'On commence par un essai de 10 semaines sur vos urgences. Si les résultats sont là, vous continuez.' },
  { title: 'Pas d\'IA gadget', desc: 'L\'aide à la décision repose sur des scores médicaux validés, pas sur des promesses algorithmiques.' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function AntiFeatureSection() {
  return (
    <Section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-center mb-8"
        >
          Ce que nous ne faisons pas
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex items-start gap-3 p-5 rounded-xl border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <Unplug className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
