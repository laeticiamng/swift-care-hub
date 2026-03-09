import { Layers, MonitorSmartphone, RefreshCcw } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const ICONS = [Layers, MonitorSmartphone, RefreshCcw];

const TEXTS: Record<string, {
  badge: string; heading: string; sub: string;
  cards: { title: string; desc: string }[];
}> = {
  fr: {
    badge: 'La solution',
    heading: "Un seul logiciel au lieu de dizaines d'outils dispersés.",
    sub: "Votre hôpital possède un socle logiciel sur lequel se branchent des modules adaptés à chaque rôle soignant. Votre dossier patient reste en place. Les outils satellites disparaissent un par un.",
    cards: [
      { title: 'Un socle que vous possédez', desc: "Gestion des identités, des droits d'accès, traçabilité et échanges de données sécurisés. Votre hôpital possède et contrôle le logiciel." },
      { title: 'Des modules métier concrets', desc: "Vue synthétique du parcours patient par rôle + suivi en temps réel. Opérationnel en 10 semaines, résultats mesurables dès le premier mois." },
      { title: 'Compatible avec votre existant', desc: "Votre dossier patient informatisé reste en place. UrgenceOS se connecte dessus via des standards ouverts. Aucune refonte requise." },
    ],
  },
  en: {
    badge: 'The solution',
    heading: 'One platform instead of dozens of scattered tools.',
    sub: 'Your hospital owns a software foundation with role-specific modules plugged in. Your EHR stays in place. Satellite tools are phased out one by one.',
    cards: [
      { title: 'A foundation you own', desc: 'Identity management, access rights, traceability and secure data exchange. Your hospital owns and controls the software.' },
      { title: 'Practical role-based modules', desc: 'Synthetic patient journey view per role + real-time monitoring. Operational in 10 weeks, measurable results from month one.' },
      { title: 'Works with your existing systems', desc: 'Your EHR stays in place. UrgenceOS connects to it via open standards. No overhaul required.' },
    ],
  },
  es: {
    badge: 'La solución',
    heading: 'Una sola plataforma en lugar de decenas de herramientas dispersas.',
    sub: 'Su hospital posee una base de software con módulos adaptados a cada rol asistencial. Su historia clínica sigue en su lugar. Las herramientas satélite desaparecen una a una.',
    cards: [
      { title: 'Una base que usted posee', desc: 'Gestión de identidades, derechos de acceso, trazabilidad e intercambios de datos seguros. Su hospital posee y controla el software.' },
      { title: 'Módulos profesionales concretos', desc: 'Vista sintética del recorrido del paciente por rol + seguimiento en tiempo real. Operativo en 10 semanas, resultados medibles desde el primer mes.' },
      { title: 'Compatible con su sistema actual', desc: 'Su historia clínica electrónica sigue en su lugar. UrgenceOS se conecta mediante estándares abiertos. Sin necesidad de reestructuración.' },
    ],
  },
  de: {
    badge: 'Die Lösung',
    heading: 'Eine Plattform statt Dutzender verstreuter Tools.',
    sub: 'Ihr Krankenhaus besitzt eine Software-Basis mit rollenspezifischen Modulen. Ihr KIS bleibt bestehen. Satellitentools werden Schritt für Schritt abgelöst.',
    cards: [
      { title: 'Eine Basis, die Ihnen gehört', desc: 'Identitätsmanagement, Zugriffsrechte, Nachverfolgbarkeit und sicherer Datenaustausch. Ihr Krankenhaus besitzt und kontrolliert die Software.' },
      { title: 'Praxisnahe Fachmodule', desc: 'Synthetische Patientenübersicht pro Rolle + Echtzeit-Monitoring. In 10 Wochen einsatzbereit, messbare Ergebnisse ab dem ersten Monat.' },
      { title: 'Kompatibel mit Ihren bestehenden Systemen', desc: 'Ihr KIS bleibt bestehen. UrgenceOS verbindet sich über offene Standards. Keine Umstrukturierung nötig.' },
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

export function SolutionSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

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
          {tx.badge}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          {tx.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground text-center max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {tx.sub}
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {tx.cards.map((item, i) => {
            const Icon = ICONS[i];
            return (
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
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
