import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';
import { Building2, ShieldCheck, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { value: '10', suffix: ' sem.', label: 'Pilote opérationnel', icon: Clock },
  { value: '5', suffix: ' rôles', label: 'Interfaces métier dédiées', icon: Users },
  { value: '1', suffix: ' écran', label: 'Par rôle, tout est réuni', icon: ShieldCheck },
  { value: '0', suffix: ' refonte DPI', label: 'Votre DPI reste en place', icon: Building2 },
];


const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function SocialProofSection() {
  return (
    <Section className="py-20 px-6 border-y bg-card/50">
      <div className="max-w-5xl mx-auto">
        {/* Chiffres clés */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
          >
            Chiffres clés
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            Des engagements concrets, pas des promesses.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-xl mx-auto"
          >
            Chaque indicateur est vérifiable. Chaque résultat est mesurable dès le pilote.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border bg-card p-5 text-center space-y-2 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <s.icon className="h-5 w-5 text-primary mx-auto" />
              <p className="text-3xl font-extrabold text-foreground leading-none">
                <AnimatedCounter value={s.value} />
                <span className="text-lg font-semibold text-primary">{s.suffix}</span>
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Transparence */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block p-5 rounded-xl border bg-card max-w-lg"
          >
            <p className="text-sm font-semibold mb-2">🏗️ Produit en phase pilote</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              UrgenceOS est co-construit avec des urgentistes, DSI et cadres de santé.
              Premiers pilotes hospitaliers prévus en 2026. Les noms des établissements partenaires seront publiés après accord.
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
