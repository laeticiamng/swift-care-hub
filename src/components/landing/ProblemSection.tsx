import { DollarSign, Clock, Shield, Link2 } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const TEXTS: Record<string, {
  badge: string; heading: string; sub: string; subSmall: string;
  debts: { title: string; value: string; label: string; desc: string }[];
}> = {
  fr: {
    badge: 'Le constat',
    heading: "Votre service d'urgences perd du temps chaque jour.",
    sub: "Trop de logiciels, trop de ressaisies, trop de clics. Vos soignants perdent du temps sur l'informatique au lieu de le consacrer aux patients.",
    subSmall: "Ne rien changer coûte plus cher que d'agir.",
    debts: [
      { title: 'Coûts qui augmentent', value: '3-7 %', label: 'du budget informatique en licences subies', desc: "Votre hôpital paie des éditeurs qui décident seuls des tarifs, du calendrier et des conditions." },
      { title: "Trop d'outils", value: '15-40', label: 'logiciels différents mal connectés entre eux', desc: "Chaque logiciel supplémentaire crée de la complexité. Chaque mise à jour risque de casser les liens." },
      { title: 'Temps perdu', value: '45-90 min', label: 'perdues par soignant chaque jour', desc: "Changer d'écran, ressaisir les mêmes infos, attendre, se coordonner à la main : du temps en moins pour les patients." },
      { title: 'Risques de sécurité', value: '×3', label: "plus de failles qu'avec un système unifié", desc: "Chaque logiciel ouvert sur le réseau est une porte d'entrée potentielle pour les cyberattaques." },
    ],
  },
  en: {
    badge: 'The problem',
    heading: 'Your emergency department wastes time every day.',
    sub: 'Too many tools, too much re-entry, too many clicks. Your caregivers spend time on IT instead of patients.',
    subSmall: 'Doing nothing costs more than acting.',
    debts: [
      { title: 'Rising costs', value: '3-7%', label: 'of IT budget on imposed licenses', desc: 'Your hospital pays vendors who alone decide pricing, schedules and terms.' },
      { title: 'Too many tools', value: '15-40', label: 'poorly connected software systems', desc: 'Each additional tool adds complexity. Each update risks breaking integrations.' },
      { title: 'Wasted time', value: '45-90 min', label: 'lost per caregiver per day', desc: 'Switching screens, re-entering data, waiting, coordinating manually: less time for patients.' },
      { title: 'Security risks', value: '×3', label: 'more vulnerabilities than a unified system', desc: 'Each software open on the network is a potential entry point for cyberattacks.' },
    ],
  },
  es: {
    badge: 'El problema',
    heading: 'Su servicio de urgencias pierde tiempo cada día.',
    sub: 'Demasiadas herramientas, demasiada reintroducción de datos, demasiados clics. Sus profesionales pierden tiempo en informática en lugar de dedicarlo a los pacientes.',
    subSmall: 'No hacer nada cuesta más que actuar.',
    debts: [
      { title: 'Costes crecientes', value: '3-7%', label: 'del presupuesto IT en licencias impuestas', desc: 'Su hospital paga a proveedores que deciden solos los precios, plazos y condiciones.' },
      { title: 'Demasiadas herramientas', value: '15-40', label: 'sistemas de software mal conectados', desc: 'Cada herramienta adicional añade complejidad. Cada actualización puede romper las integraciones.' },
      { title: 'Tiempo perdido', value: '45-90 min', label: 'perdidos por profesional cada día', desc: 'Cambiar de pantalla, reintroducir datos, esperar, coordinarse manualmente: menos tiempo para los pacientes.' },
      { title: 'Riesgos de seguridad', value: '×3', label: 'más vulnerabilidades que un sistema unificado', desc: 'Cada software abierto en la red es un punto de entrada potencial para ciberataques.' },
    ],
  },
  de: {
    badge: 'Das Problem',
    heading: 'Ihre Notaufnahme verliert jeden Tag Zeit.',
    sub: 'Zu viele Tools, zu viele Doppeleingaben, zu viele Klicks. Ihre Pflegekräfte verbringen Zeit mit IT statt mit Patienten.',
    subSmall: 'Nichts zu tun kostet mehr als zu handeln.',
    debts: [
      { title: 'Steigende Kosten', value: '3-7%', label: 'des IT-Budgets für aufgezwungene Lizenzen', desc: 'Ihr Krankenhaus zahlt Anbieter, die allein über Preise, Zeitpläne und Bedingungen entscheiden.' },
      { title: 'Zu viele Tools', value: '15-40', label: 'schlecht verbundene Software-Systeme', desc: 'Jedes zusätzliche Tool erhöht die Komplexität. Jedes Update kann Integrationen gefährden.' },
      { title: 'Verlorene Zeit', value: '45-90 Min', label: 'pro Pflegekraft pro Tag verloren', desc: 'Bildschirme wechseln, Daten erneut eingeben, warten, manuell koordinieren: weniger Zeit für Patienten.' },
      { title: 'Sicherheitsrisiken', value: '×3', label: 'mehr Schwachstellen als ein einheitliches System', desc: 'Jede im Netzwerk offene Software ist ein potenzieller Einstiegspunkt für Cyberangriffe.' },
    ],
  },
};

const ICONS = [DollarSign, Link2, Clock, Shield];
const ACCENTS = [
  'text-[hsl(var(--medical-critical))]',
  'text-[hsl(var(--medical-warning))]',
  'text-primary',
  'text-[hsl(var(--medical-critical))]',
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function ProblemSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="bg-secondary/30 py-12 sm:py-24 px-4 sm:px-6">
      <div id="problem" className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
        >
          {tx.badge}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
        >
          {tx.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
        >
          {tx.sub}
        </motion.p>
        <p className="text-sm text-muted-foreground/80 mb-12 max-w-xl mx-auto">
          {tx.subSmall}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tx.debts.map((d, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={d.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col items-center gap-3 text-center group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d.title}</p>
                <p className={`text-3xl font-extrabold ${ACCENTS[i]}`}>{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">{d.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
