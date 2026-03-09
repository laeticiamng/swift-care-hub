import { Section } from './Section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Brain, Siren, Target, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Brain, Siren, Target, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';

const FEATURES = [
  {
    icon: LayoutDashboard,
    titleKey: 'flowDashboard',
    descKey: 'flowDesc',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Brain,
    titleKey: 'aiTriage',
    descKey: 'triageDesc',
    color: 'text-orange-600',
    bg: 'bg-orange-600/10',
  },
  {
    icon: Siren,
    titleKey: 'samuIntegration',
    descKey: 'samuDesc',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Target,
    titleKey: 'qualityMetrics',
    descKey: 'qualityDesc',
    color: 'text-orange-600',
    bg: 'bg-orange-600/10',
  },
  {
    icon: ShieldCheck,
    titleKey: 'cyberSecurity',
    descKey: 'cyberDesc',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
] as const;

const TEXTS: Record<string, Record<string, string>> = {
  fr: {
    heading: 'La plateforme en action',
    sub: 'Cinq modules intégrés pour piloter vos urgences en temps réel.',
    cta: 'Voir le dashboard en direct',
    flowDashboard: 'Flow Dashboard',
    flowDesc: "Carte temps réel des zones avec codes couleur, compteurs d'attente et alertes de goulets d'étranglement.",
    aiTriage: 'Triage IA Manchester',
    triageDesc: 'Catégorisation P1-P5 automatique avec score de confiance et raisonnement clinique.',
    samuIntegration: 'Intégration SAMU',
    samuDesc: 'Alertes pré-hospitalières, compte à rebours ETA et préparation de salle en un clic.',
    qualityMetrics: 'Indicateurs Qualité',
    qualityDesc: 'KPIs mensuels : taux DTAS, cible 4h, réadmission 72h, satisfaction patient.',
    cyberSecurity: 'Cybersécurité',
    cyberDesc: 'Chiffrement TLS 1.3, audit de sécurité régulier et monitoring des incidents en continu.',
  },
  en: {
    heading: 'The platform in action',
    sub: 'Five integrated modules to manage your ER in real time.',
    cta: 'See the live dashboard',
    flowDashboard: 'Flow Dashboard',
    flowDesc: 'Real-time zone map with color codes, wait counters and bottleneck alerts.',
    aiTriage: 'AI Manchester Triage',
    triageDesc: 'Automatic P1-P5 categorization with confidence score and clinical reasoning.',
    samuIntegration: 'SAMU Integration',
    samuDesc: 'Pre-hospital alerts, ETA countdown and one-click room preparation.',
    qualityMetrics: 'Quality Metrics',
    qualityDesc: 'Monthly KPIs: DTAS rate, 4-hour target, 72h readmission, patient satisfaction.',
    cyberSecurity: 'Cybersecurity',
    cyberDesc: 'TLS 1.3 encryption, regular security audits and continuous incident monitoring.',
  },
  es: {
    heading: 'La plataforma en acción',
    sub: 'Cinco módulos integrados para gestionar sus urgencias en tiempo real.',
    cta: 'Ver el dashboard en vivo',
    flowDashboard: 'Flow Dashboard',
    flowDesc: 'Mapa en tiempo real con códigos de color, contadores de espera y alertas de cuellos de botella.',
    aiTriage: 'Triaje IA Manchester',
    triageDesc: 'Categorización automática P1-P5 con puntuación de confianza y razonamiento clínico.',
    samuIntegration: 'Integración SAMU',
    samuDesc: 'Alertas prehospitalarias, cuenta regresiva ETA y preparación de sala con un clic.',
    qualityMetrics: 'Indicadores de Calidad',
    qualityDesc: 'KPIs mensuales: tasa DTAS, objetivo 4h, readmisión 72h, satisfacción del paciente.',
    cyberSecurity: 'Ciberseguridad',
    cyberDesc: 'Cifrado TLS 1.3, auditorías de seguridad regulares y monitoreo continuo de incidentes.',
  },
  de: {
    heading: 'Die Plattform in Aktion',
    sub: 'Fünf integrierte Module zur Echtzeit-Steuerung Ihrer Notaufnahme.',
    cta: 'Live-Dashboard ansehen',
    flowDashboard: 'Flow Dashboard',
    flowDesc: 'Echtzeit-Zonenkarte mit Farbcodes, Wartezählern und Engpass-Warnungen.',
    aiTriage: 'KI Manchester Triage',
    triageDesc: 'Automatische P1-P5 Kategorisierung mit Konfidenzwert und klinischer Begründung.',
    samuIntegration: 'SAMU Integration',
    samuDesc: 'Präklinische Alarme, ETA-Countdown und Ein-Klick-Raumvorbereitung.',
    qualityMetrics: 'Qualitätskennzahlen',
    qualityDesc: 'Monatliche KPIs: DTAS-Rate, 4-Stunden-Ziel, 72h-Wiederaufnahme, Patientenzufriedenheit.',
    cyberSecurity: 'Cybersicherheit',
    cyberDesc: 'TLS 1.3 Verschlüsselung, regelmäßige Sicherheitsaudits und kontinuierliches Incident-Monitoring.',
  },
};

export function PlatformPreviewSection() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  return (
    <Section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {tx.heading}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {tx.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Card
                  className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm cursor-pointer group h-full hover-scale"
                  onClick={() => navigate('/flow')}
                >
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${f.bg}`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{tx[f.titleKey]}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tx[f.descKey]}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" onClick={() => navigate('/flow')} className="gap-2">
            {tx.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
