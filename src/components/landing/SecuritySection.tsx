import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { motion } from 'framer-motion';

const points = [
  'Moins de logiciels ouverts = moins de portes d\'entrée pour les cyberattaques',
  'Chaque échange avec votre dossier patient est documenté, testé et surveillé',
  'Pas de comptes partagés. Pas de données non chiffrées. Pas de données orphelines.',
  'Traçabilité complète : qui a vu quoi, fait quoi, quand — enregistrement non modifiable',
];

const cardVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function SecuritySection() {
  const navigate = useNavigate();

  return (
    <Section className="py-16 px-6 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-4 mb-8"
        >
          <Shield className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">La sécurité n'est pas une option. C'est l'architecture.</h2>
            <p className="text-muted-foreground leading-relaxed">
              Authentification forte. Droits par rôle vérifiés côté serveur. Journal d'audit non modifiable. Chiffrement en transit et au repos. Environnements isolés. Alertes automatiques sur comportements suspects.
            </p>
          </div>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-3">
          {points.map((point, i) => (
            <motion.div
              key={point}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              className="flex items-start gap-2 text-sm p-3 rounded-lg bg-card border hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{point}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button variant="outline" onClick={() => navigate('/securite')}>
            En savoir plus sur la sécurité <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </Section>
  );
}
