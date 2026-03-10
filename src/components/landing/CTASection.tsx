import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const ICONS = [Building2, Shield, Clock];

const TEXTS: Record<string, {
  pillars: { title: string; desc: string }[];
  badge: string; heading: string; sub: string; cta: string; ctaDemo: string;
}> = {
  fr: {
    pillars: [
      { title: 'Vous êtes propriétaire', desc: "Votre hôpital possède le logiciel, décide de ses évolutions et maîtrise son budget sur 5 ans." },
      { title: 'Plus sûr par conception', desc: "Moins de logiciels exposés, droits d'accès par rôle, traçabilité complète de chaque action." },
      { title: 'Vos soignants gagnent du temps', desc: "Un seul écran par rôle. Zéro ressaisie. Jusqu'à 50 % de temps administratif en moins aux urgences." },
    ],
    badge: 'Essai encadré, résultats mesurés',
    heading: '10 semaines pour voir les résultats.',
    sub: "Un essai de 10 semaines sur votre service d'urgences. Deux modules. Intégration avec votre dossier patient existant. Critères de succès définis avant le lancement. Si les résultats sont là, vous décidez de la suite.",
    cta: 'Demander un essai',
    ctaDemo: 'Voir la démo',
  },
  en: {
    pillars: [
      { title: 'You own it', desc: 'Your hospital owns the software, decides its roadmap and controls its 5-year budget.' },
      { title: 'Secure by design', desc: 'Fewer exposed tools, role-based access, full traceability of every action.' },
      { title: 'Your caregivers save time', desc: 'One screen per role. Zero re-entry. Up to 50% less admin time in the ER.' },
    ],
    badge: 'Structured trial, measured results',
    heading: '10 weeks to see results.',
    sub: 'A 10-week trial in your emergency department. Two modules. Integration with your existing EHR. Success criteria defined before launch. If results are there, you decide what comes next.',
    cta: 'Request a trial',
    ctaDemo: 'See the demo',
  },
  es: {
    pillars: [
      { title: 'Usted es el propietario', desc: 'Su hospital posee el software, decide su evolución y controla su presupuesto a 5 años.' },
      { title: 'Seguro por diseño', desc: 'Menos herramientas expuestas, acceso por rol, trazabilidad completa de cada acción.' },
      { title: 'Sus profesionales ahorran tiempo', desc: 'Una pantalla por rol. Cero reintroducción de datos. Hasta un 50 % menos de tiempo administrativo en urgencias.' },
    ],
    badge: 'Ensayo estructurado, resultados medidos',
    heading: '10 semanas para ver resultados.',
    sub: 'Un ensayo de 10 semanas en su servicio de urgencias. Dos módulos. Integración con su historia clínica existente. Criterios de éxito definidos antes del lanzamiento. Si los resultados están ahí, usted decide.',
    cta: 'Solicitar un ensayo',
    ctaDemo: 'Ver la demo',
  },
  de: {
    pillars: [
      { title: 'Es gehört Ihnen', desc: 'Ihr Krankenhaus besitzt die Software, bestimmt die Roadmap und kontrolliert das 5-Jahres-Budget.' },
      { title: 'Sicher durch Design', desc: 'Weniger exponierte Tools, rollenbasierter Zugriff, vollständige Nachverfolgbarkeit jeder Aktion.' },
      { title: 'Ihre Pflegekräfte sparen Zeit', desc: 'Ein Bildschirm pro Rolle. Keine Doppeleingabe. Bis zu 50 % weniger Verwaltungszeit in der Notaufnahme.' },
    ],
    badge: 'Strukturierter Test, gemessene Ergebnisse',
    heading: '10 Wochen, um Ergebnisse zu sehen.',
    sub: 'Ein 10-wöchiger Test in Ihrer Notaufnahme. Zwei Module. Integration mit Ihrem bestehenden KIS. Erfolgskriterien vor dem Start definiert. Wenn die Ergebnisse stimmen, entscheiden Sie.',
    cta: 'Test anfordern',
    ctaDemo: 'Demo ansehen',
  },
};

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
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {tx.pillars.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={p.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={pillarVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 sm:p-6 rounded-xl border bg-card/50 text-center space-y-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl sm:rounded-3xl border border-primary/15 p-6 sm:p-12 md:p-16 shadow-sm overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">{tx.badge}</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">{tx.heading}</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              {tx.sub}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/b2b')}
                className="gap-2 px-6 sm:px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                {tx.cta} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6 sm:px-8 h-12 text-base hover:bg-primary/5 active:scale-[0.98] transition-all w-full sm:w-auto"
                onClick={() => navigate('/demo')}
              >
                {tx.ctaDemo}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
