import { Layers, MonitorSmartphone, RefreshCcw } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const solutions = [
  {
    icon: Layers,
    title: 'Un socle que vous possédez',
    desc: 'Gestion des identités, des droits d\'accès, traçabilité et échanges de données sécurisés. Votre hôpital possède et contrôle le logiciel.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Des modules métier concrets',
    desc: 'Vue synthétique du parcours patient par rôle + suivi en temps réel. Opérationnel en 10 semaines, résultats mesurables dès le premier mois.',
  },
  {
    icon: RefreshCcw,
    title: 'Compatible avec votre existant',
    desc: 'Votre dossier patient informatisé reste en place. UrgenceOS se connecte dessus via des standards ouverts. Aucune refonte requise.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function SolutionSection() {
  return (
    <Section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center"
        >
          La solution
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          La solution n'est pas un nouvel outil. C'est un changement de modèle.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground text-center max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Hospital-Owned Software : votre hôpital possède un socle logiciel interne sur lequel se branchent des modules métier interopérables. Le DPI reste en place. Les outils satellites disparaissent un par un.
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {solutions.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-xl border bg-card space-y-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
