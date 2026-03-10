import { Section } from './Section';
import { AnimatedCounter } from './AnimatedCounter';
import { Building2, ShieldCheck, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const ICONS = [Clock, Users, ShieldCheck, Building2];

const TEXTS: Record<string, {
  badge: string; heading: string; sub: string;
  stats: { value: string; suffix: string; label: string }[];
  transparency: { title: string; desc: string };
}> = {
  fr: {
    badge: 'Le produit en bref',
    heading: 'Ce que vous obtenez dès le premier jour.',
    sub: 'Quatre repères simples pour comprendre ce que change UrgenceOS dans votre service.',
    stats: [
      { value: '10', suffix: ' sem.', label: 'Essai opérationnel' },
      { value: '5', suffix: ' rôles', label: 'Interfaces métier dédiées' },
      { value: '1', suffix: ' écran', label: 'Par rôle, tout est réuni' },
      { value: '0', suffix: ' refonte DPI', label: 'Votre DPI reste en place' },
    ],
    transparency: {
      title: "🏗️ Produit en phase d'essai",
      desc: "UrgenceOS est co-construit avec des urgentistes, directions informatiques et cadres de santé. Premiers essais hospitaliers prévus en 2026. Les noms des établissements partenaires seront publiés après accord.",
    },
  },
  en: {
    badge: 'The product at a glance',
    heading: 'What you get from day one.',
    sub: 'Four simple benchmarks to understand what UrgenceOS changes in your department.',
    stats: [
      { value: '10', suffix: ' wks', label: 'Operational trial' },
      { value: '5', suffix: ' roles', label: 'Dedicated role-based interfaces' },
      { value: '1', suffix: ' screen', label: 'Per role, everything in one place' },
      { value: '0', suffix: ' EHR overhaul', label: 'Your EHR stays in place' },
    ],
    transparency: {
      title: '🏗️ Product in trial phase',
      desc: 'UrgenceOS is co-built with emergency physicians, IT directors and health managers. First hospital trials planned for 2026. Partner names will be published upon agreement.',
    },
  },
  es: {
    badge: 'El producto en resumen',
    heading: 'Lo que obtiene desde el primer día.',
    sub: 'Cuatro indicadores simples para entender lo que cambia UrgenceOS en su servicio.',
    stats: [
      { value: '10', suffix: ' sem.', label: 'Ensayo operativo' },
      { value: '5', suffix: ' roles', label: 'Interfaces profesionales dedicadas' },
      { value: '1', suffix: ' pantalla', label: 'Por rol, todo en un lugar' },
      { value: '0', suffix: ' reestructuración HCE', label: 'Su HCE sigue en su lugar' },
    ],
    transparency: {
      title: '🏗️ Producto en fase de prueba',
      desc: 'UrgenceOS se co-construye con urgenciólogos, direcciones informáticas y responsables de enfermería. Primeros ensayos hospitalarios previstos en 2026. Los nombres de los centros asociados se publicarán tras su acuerdo.',
    },
  },
  de: {
    badge: 'Das Produkt auf einen Blick',
    heading: 'Was Sie ab Tag eins erhalten.',
    sub: 'Vier einfache Kennzahlen, um zu verstehen, was UrgenceOS in Ihrer Abteilung verändert.',
    stats: [
      { value: '10', suffix: ' Wo.', label: 'Operativer Test' },
      { value: '5', suffix: ' Rollen', label: 'Dedizierte rollenbasierte Oberflächen' },
      { value: '1', suffix: ' Bildschirm', label: 'Pro Rolle, alles an einem Ort' },
      { value: '0', suffix: ' KIS-Umbau', label: 'Ihr KIS bleibt bestehen' },
    ],
    transparency: {
      title: '🏗️ Produkt in der Testphase',
      desc: 'UrgenceOS wird gemeinsam mit Notärzten, IT-Leitungen und Pflegedienstleitungen entwickelt. Erste Krankenhaus-Tests für 2026 geplant. Die Namen der Partnereinrichtungen werden nach Vereinbarung veröffentlicht.',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function SocialProofSection() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-12 sm:py-20 px-4 sm:px-6 border-y bg-card/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
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
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            {tx.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-xl mx-auto"
          >
            {tx.sub}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {tx.stats.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl border bg-card p-5 text-center space-y-2 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <Icon className="h-5 w-5 text-primary mx-auto" />
                <p className="text-3xl font-extrabold text-foreground leading-none">
                  <AnimatedCounter value={s.value} />
                  <span className="text-lg font-semibold text-primary">{s.suffix}</span>
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block p-5 rounded-xl border bg-card max-w-lg"
          >
            <p className="text-sm font-semibold mb-2">{tx.transparency.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tx.transparency.desc}
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
