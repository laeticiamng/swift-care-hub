import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';
import { Building2, ShieldCheck, Clock, Users, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

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

        {/* Design Partners */}
        <div className="text-center mb-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
          >
            Phase d'amorçage
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-xl sm:text-2xl font-bold mb-2"
          >
            Co-construit avec des établissements hospitaliers.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-lg mx-auto"
          >
            UrgenceOS se développe en partenariat direct avec des urgentistes, DSI et cadres de santé. Les noms seront publiés après accord des établissements.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.status}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          Phase pré-commerciale — premiers pilotes prévus en 2026.
        </p>
      </div>
    </Section>
  );
}
