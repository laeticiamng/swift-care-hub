import { CheckCircle } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';

const benefits = [
  { title: 'Contrôle', desc: 'Vous décidez des priorités d\'évolution de votre SI, pas un éditeur.' },
  { title: 'Temps clinique', desc: 'Vos équipes urgences récupèrent 30 à 50 % du temps perdu en friction logicielle.' },
  { title: 'Résilience', desc: 'Moins d\'applications exposées, moins de surface d\'attaque, moins de dépendance fournisseur.' },
  { title: 'Interopérabilité', desc: 'Standards ouverts (FHIR, HL7v2) au lieu d\'interfaces propriétaires fragiles.' },
  { title: 'Traçabilité', desc: 'Chaque action horodatée, attribuée, auditable. Couverture médico-légale renforcée.' },
  { title: 'Économies structurelles', desc: 'Outils satellites remplacés par des modules intégrés : moins cher à maintenir, sécuriser, évoluer.' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function BenefitsSection() {
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
          Ce que vous gagnez
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-10"
        >
          Des résultats concrets, mesurables, sur votre périmètre.
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((item, i) => (
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
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
