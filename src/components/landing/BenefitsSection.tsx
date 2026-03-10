import { CheckCircle } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const TEXTS: Record<string, {
  badge: string; heading: string;
  benefits: { title: string; desc: string }[];
}> = {
  fr: {
    badge: 'Ce que vous gagnez',
    heading: 'Des résultats concrets, mesurables, sur votre périmètre.',
    benefits: [
      { title: 'Vous gardez le contrôle', desc: "C'est vous qui décidez des évolutions du logiciel, pas un éditeur externe." },
      { title: 'Plus de temps pour les patients', desc: 'Vos soignants récupèrent 30 à 50 % du temps perdu à naviguer entre les logiciels.' },
      { title: 'Moins de risques', desc: "Moins de logiciels ouverts sur le réseau = moins de portes d'entrée pour les cyberattaques." },
      { title: 'Compatible avec tout', desc: 'UrgenceOS communique avec vos logiciels existants grâce aux standards ouverts du secteur.' },
      { title: 'Tout est tracé', desc: "Chaque action est enregistrée avec l'heure et l'auteur. Utile en cas d'audit ou de litige." },
      { title: 'Des économies réelles', desc: 'Les logiciels satellites sont remplacés par des modules intégrés : moins cher à maintenir et plus sûr.' },
    ],
  },
  en: {
    badge: 'What you gain',
    heading: 'Concrete, measurable results within your scope.',
    benefits: [
      { title: 'You stay in control', desc: 'You decide on software evolution, not an external vendor.' },
      { title: 'More time for patients', desc: 'Your caregivers recover 30-50% of time lost navigating between tools.' },
      { title: 'Fewer risks', desc: 'Fewer software systems on the network = fewer entry points for cyberattacks.' },
      { title: 'Works with everything', desc: 'UrgenceOS communicates with your existing software via open industry standards.' },
      { title: 'Full traceability', desc: 'Every action is logged with time and author. Useful for audits or disputes.' },
      { title: 'Real savings', desc: 'Satellite tools are replaced by integrated modules: cheaper to maintain and more secure.' },
    ],
  },
  es: {
    badge: 'Lo que obtiene',
    heading: 'Resultados concretos, medibles, en su perímetro.',
    benefits: [
      { title: 'Usted mantiene el control', desc: 'Usted decide la evolución del software, no un proveedor externo.' },
      { title: 'Más tiempo para los pacientes', desc: 'Sus profesionales recuperan entre el 30 y el 50 % del tiempo perdido navegando entre herramientas.' },
      { title: 'Menos riesgos', desc: 'Menos software en la red = menos puntos de entrada para ciberataques.' },
      { title: 'Compatible con todo', desc: 'UrgenceOS se comunica con su software existente mediante estándares abiertos del sector.' },
      { title: 'Trazabilidad total', desc: 'Cada acción se registra con hora y autor. Útil en caso de auditoría o litigio.' },
      { title: 'Ahorros reales', desc: 'Las herramientas satélite se reemplazan por módulos integrados: más baratos de mantener y más seguros.' },
    ],
  },
  de: {
    badge: 'Was Sie gewinnen',
    heading: 'Konkrete, messbare Ergebnisse in Ihrem Bereich.',
    benefits: [
      { title: 'Sie behalten die Kontrolle', desc: 'Sie entscheiden über die Weiterentwicklung der Software, nicht ein externer Anbieter.' },
      { title: 'Mehr Zeit für Patienten', desc: 'Ihre Pflegekräfte gewinnen 30-50 % der Zeit zurück, die sie zwischen Tools verlieren.' },
      { title: 'Weniger Risiken', desc: 'Weniger Software im Netzwerk = weniger Einstiegspunkte für Cyberangriffe.' },
      { title: 'Kompatibel mit allem', desc: 'UrgenceOS kommuniziert mit Ihrer bestehenden Software über offene Branchenstandards.' },
      { title: 'Volle Nachverfolgbarkeit', desc: 'Jede Aktion wird mit Zeit und Autor protokolliert. Nützlich bei Audits oder Streitfällen.' },
      { title: 'Echte Einsparungen', desc: 'Satellitentools werden durch integrierte Module ersetzt: günstiger zu warten und sicherer.' },
    ],
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function BenefitsSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center"
        >
          {tx.badge}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-10"
        >
          {tx.heading}
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tx.benefits.map((item, i) => (
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
