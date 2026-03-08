import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { motion } from 'framer-motion';

const PILLARS = [
  {
    icon: Building2,
    title: 'Vous êtes propriétaire',
    desc: 'Votre hôpital possède le logiciel, décide de ses évolutions et maîtrise son budget sur 5 ans.',
  },
  {
    icon: Shield,
    title: 'Plus sûr par conception',
    desc: 'Moins de logiciels exposés, droits d\'accès par rôle, traçabilité complète de chaque action.',
  },
  {
    icon: Clock,
    title: 'Vos soignants gagnent du temps',
    desc: 'Un seul écran par rôle. Zéro ressaisie. Jusqu\'à 50 % de temps administratif en moins aux urgences.',
  },
];

const pillarVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function CTASection() {
  const navigate = useNavigate();

  return (
    <Section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* 3 piliers */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={pillarVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-xl border bg-card/50 text-center space-y-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/15 p-12 sm:p-16 shadow-sm overflow-hidden"
        >
          {/* Subtle grid bg inside CTA */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Essai encadré, résultats mesurés</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">10 semaines pour voir les résultats.</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              Un essai de 10 semaines sur votre service d'urgences. Deux modules. Intégration avec votre dossier patient existant.
              Critères de succès définis avant le lancement. Si les résultats sont là, vous décidez de la suite.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/b2b')}
                className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Demander un pilote <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base hover:bg-primary/5 active:scale-[0.98] transition-all"
                onClick={() => navigate('/demo')}
              >
                Voir la démo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
