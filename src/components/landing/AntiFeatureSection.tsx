import { Unplug } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const TEXTS: Record<string, {
  heading: string;
  items: { title: string; desc: string }[];
}> = {
  fr: {
    heading: 'Ce que nous ne faisons pas',
    items: [
      { title: 'Pas de refonte de votre existant', desc: 'Votre dossier patient reste en place. UrgenceOS se branche dessus — il ne le remplace pas.' },
      { title: "Pas un logiciel de plus", desc: "UrgenceOS est un socle intégré avec des modules par rôle. Pas un énième outil à empiler." },
      { title: 'Pas de promesse irréaliste', desc: "On commence par un essai de 10 semaines sur vos urgences. Si les résultats sont là, vous continuez." },
      { title: "Pas d'IA gadget", desc: "L'aide à la décision repose sur des scores médicaux validés, pas sur des promesses algorithmiques." },
    ],
  },
  en: {
    heading: "What we don\u2019t do",
    items: [
      { title: 'No overhaul of your systems', desc: "Your EHR stays in place. UrgenceOS plugs into it \u2014 it doesn\u2019t replace it." },
      { title: 'Not another tool to stack', desc: "UrgenceOS is an integrated platform with role-based modules. Not yet another tool to pile on." },
      { title: 'No unrealistic promises', desc: 'We start with a 10-week trial in your ER. If results are there, you continue.' },
      { title: 'No gimmick AI', desc: 'Decision support relies on validated medical scores, not algorithmic hype.' },
    ],
  },
  es: {
    heading: 'Lo que no hacemos',
    items: [
      { title: 'Sin reestructuración de su sistema', desc: 'Su historia clínica sigue en su lugar. UrgenceOS se conecta a ella, no la reemplaza.' },
      { title: 'No es otra herramienta más', desc: 'UrgenceOS es una plataforma integrada con módulos por rol. No otra herramienta que acumular.' },
      { title: 'Sin promesas irrealistas', desc: 'Empezamos con un ensayo de 10 semanas en sus urgencias. Si los resultados están ahí, usted continúa.' },
      { title: 'Sin IA de juguete', desc: 'El apoyo a la decisión se basa en escalas médicas validadas, no en promesas algorítmicas.' },
    ],
  },
  de: {
    heading: 'Was wir nicht tun',
    items: [
      { title: 'Kein Umbau Ihrer Systeme', desc: 'Ihr KIS bleibt bestehen. UrgenceOS dockt an — es ersetzt es nicht.' },
      { title: 'Kein weiteres Tool zum Stapeln', desc: 'UrgenceOS ist eine integrierte Plattform mit rollenbasierten Modulen. Kein weiteres Tool zum Ansammeln.' },
      { title: 'Keine unrealistischen Versprechen', desc: 'Wir starten mit einem 10-Wochen-Test in Ihrer Notaufnahme. Wenn die Ergebnisse stimmen, machen Sie weiter.' },
      { title: 'Keine Gimmick-KI', desc: 'Entscheidungshilfe basiert auf validierten medizinischen Scores, nicht auf algorithmischem Hype.' },
    ],
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function AntiFeatureSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-center mb-8"
        >
          {tx.heading}
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tx.items.map((item, i) => (
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
