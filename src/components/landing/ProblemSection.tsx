import { DollarSign, Clock, Shield, Link2 } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const debts = [
  {
    icon: DollarSign,
    title: 'Dette fournisseur',
    value: '3-7 %',
    label: 'du budget SI en licences non maîtrisées',
    desc: 'L\'hôpital dépend d\'éditeurs qui contrôlent le calendrier, les tarifs et les conditions de sortie.',
    accent: 'text-[hsl(var(--medical-critical))]',
  },
  {
    icon: Link2,
    title: 'Dette d\'intégration',
    value: '15-40',
    label: 'applications connectées par des interfaces fragiles',
    desc: 'Chaque connecteur est un point de fragilité. Chaque mise à jour est un risque de régression.',
    accent: 'text-[hsl(var(--medical-warning))]',
  },
  {
    icon: Clock,
    title: 'Dette de temps',
    value: '45-90 min',
    label: 'perdues par poste en friction logicielle',
    desc: 'Navigation entre écrans, ressaisies, attentes, coordination manuelle : autant de temps clinique perdu.',
    accent: 'text-primary',
  },
  {
    icon: Shield,
    title: 'Dette de sécurité',
    value: '×3',
    label: 'surface d\'attaque par rapport à un socle unifié',
    desc: 'Chaque application exposée, chaque connecteur non chiffré : autant de vecteurs d\'attaque.',
    accent: 'text-[hsl(var(--medical-critical))]',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ProblemSection() {
  return (
    <Section className="bg-secondary/30 py-24 px-6">
      <div id="problem" className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
        >
          Le constat
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
        >
          Votre hôpital accumule une dette invisible.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
        >
          Pas seulement financière. Opérationnelle. Chaque jour, cette dette se paie en capacité de soin perdue, en incidents de sécurité, en surcoûts de maintenance, en incapacité à évoluer.
        </motion.p>
        <p className="text-sm text-muted-foreground/80 mb-12 max-w-xl mx-auto">
          Le statu quo coûte plus cher que le changement.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {debts.map((d, i) => (
            <motion.div
              key={d.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col items-center gap-3 text-center group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <d.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d.title}</p>
              <p className={`text-3xl font-extrabold ${d.accent}`}>{d.value}</p>
              <p className="text-xs text-muted-foreground">{d.label}</p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
