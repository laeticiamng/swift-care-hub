import { MessageSquare } from 'lucide-react';
import { Section } from './Section';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const TEXTS: Record<string, {
  badge: string; heading: string; sub: string; disclaimer: string;
  feedbacks: { quote: string; role: string; context: string; initials: string }[];
}> = {
  fr: {
    badge: 'Retours terrain',
    heading: 'Ce que les soignants nous disent',
    sub: 'Retours recueillis lors de sessions de co-conception avec des professionnels des urgences.',
    disclaimer: "Verbatims anonymisés recueillis lors de sessions de co-conception. Les noms des établissements partenaires seront publiés après accord. UrgenceOS est en phase d'essai.",
    feedbacks: [
      { quote: "L'idée d'avoir un seul écran adapté à mon rôle, c'est exactement ce qui nous manque. On passe nos journées à jongler entre 4 logiciels.", role: 'Médecin urgentiste', context: 'Retour de co-conception', initials: 'MU' },
      { quote: "Si le board panoramique fonctionne comme dans la démo, ça change tout pour la coordination. Aujourd'hui on fait ça au tableau blanc.", role: 'Cadre de santé, service des urgences', context: 'Retour de co-conception', initials: 'CS' },
      { quote: "Ce qui m'intéresse c'est la traçabilité automatique. Aujourd'hui je note tout à la main et je retranscris après. C'est du temps perdu.", role: 'IDE aux urgences', context: 'Retour de co-conception', initials: 'ID' },
    ],
  },
  en: {
    badge: 'Field feedback',
    heading: 'What caregivers tell us',
    sub: 'Feedback gathered during co-design sessions with emergency professionals.',
    disclaimer: 'Anonymized verbatims collected during co-design sessions. Partner institution names will be published upon agreement. UrgenceOS is in trial phase.',
    feedbacks: [
      { quote: "Having one screen tailored to my role is exactly what we need. We spend our days juggling 4 different software tools.", role: 'Emergency physician', context: 'Co-design feedback', initials: 'EP' },
      { quote: "If the panoramic board works like the demo, it changes everything for coordination. Today we use a whiteboard.", role: 'Head nurse, emergency department', context: 'Co-design feedback', initials: 'HN' },
      { quote: "What interests me is automatic traceability. Today I write everything by hand and transcribe it later. It's wasted time.", role: 'ER nurse', context: 'Co-design feedback', initials: 'RN' },
    ],
  },
  es: {
    badge: 'Opiniones del terreno',
    heading: 'Lo que nos dicen los profesionales',
    sub: 'Comentarios recogidos durante sesiones de co-diseño con profesionales de urgencias.',
    disclaimer: 'Verbatims anonimizados recogidos durante sesiones de co-diseño. Los nombres de los centros asociados se publicarán tras su acuerdo. UrgenceOS está en fase de prueba.',
    feedbacks: [
      { quote: "Tener una sola pantalla adaptada a mi rol es exactamente lo que nos falta. Pasamos el día alternando entre 4 herramientas diferentes.", role: 'Médico de urgencias', context: 'Opinión de co-diseño', initials: 'MU' },
      { quote: "Si el tablero panorámico funciona como en la demo, cambia todo para la coordinación. Hoy lo hacemos en una pizarra.", role: 'Responsable de enfermería, urgencias', context: 'Opinión de co-diseño', initials: 'RE' },
      { quote: "Lo que me interesa es la trazabilidad automática. Hoy lo anoto todo a mano y lo transcribo después. Es tiempo perdido.", role: 'Enfermera de urgencias', context: 'Opinión de co-diseño', initials: 'EU' },
    ],
  },
  de: {
    badge: 'Rückmeldungen aus der Praxis',
    heading: 'Was uns Pflegekräfte sagen',
    sub: 'Feedback aus Co-Design-Sitzungen mit Notaufnahme-Fachleuten.',
    disclaimer: 'Anonymisierte Aussagen aus Co-Design-Sitzungen. Die Namen der Partnereinrichtungen werden nach Vereinbarung veröffentlicht. UrgenceOS befindet sich in der Testphase.',
    feedbacks: [
      { quote: "Einen einzigen Bildschirm zu haben, der auf meine Rolle zugeschnitten ist, ist genau das, was uns fehlt. Wir verbringen den Tag damit, zwischen 4 verschiedenen Tools zu jonglieren.", role: 'Notarzt', context: 'Co-Design-Feedback', initials: 'NA' },
      { quote: "Wenn das Panorama-Board so funktioniert wie in der Demo, ändert das alles für die Koordination. Heute machen wir das am Whiteboard.", role: 'Stationsleitung, Notaufnahme', context: 'Co-Design-Feedback', initials: 'SL' },
      { quote: "Was mich interessiert, ist die automatische Nachverfolgbarkeit. Heute schreibe ich alles von Hand und übertrage es später. Das ist verlorene Zeit.", role: 'Notaufnahme-Pflegekraft', context: 'Co-Design-Feedback', initials: 'NP' },
    ],
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function TestimonialsSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-12 sm:py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto text-center">
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
          className="text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
        >
          {tx.sub}
        </motion.p>
        <div className="grid sm:grid-cols-3 gap-6">
          {tx.feedbacks.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl border p-8 shadow-sm text-left hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group"
            >
              <MessageSquare className="h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors absolute top-6 right-6" />
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="border-t pt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs text-primary font-medium">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          {tx.disclaimer}
        </p>
      </div>
    </Section>
  );
}
