import { ShieldCheck, Monitor, Building2, Lock, Server, Stethoscope } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

const ICONS = [ShieldCheck, Monitor, Building2, Lock, Server, Stethoscope];

const TEXTS: Record<string, string[]> = {
  fr: [
    'Conforme RGPD Santé',
    'Compatible avec votre DPI',
    "Possédé par l'hôpital",
    'Données chiffrées',
    'Hébergé en France (HDS)',
    'Standards de santé français',
  ],
  en: [
    'Health GDPR compliant',
    'Compatible with your EHR',
    'Hospital-owned',
    'Encrypted data',
    'Hosted in France (HDS)',
    'French health standards',
  ],
  es: [
    'Conforme RGPD Salud',
    'Compatible con su HCE',
    'Propiedad del hospital',
    'Datos cifrados',
    'Alojado en Francia (HDS)',
    'Estándares de salud franceses',
  ],
  de: [
    'DSGVO Gesundheit konform',
    'Kompatibel mit Ihrem KIS',
    'Im Besitz des Krankenhauses',
    'Verschlüsselte Daten',
    'In Frankreich gehostet (HDS)',
    'Französische Gesundheitsstandards',
  ],
};

export function TrustMarquee() {
  const { locale } = useI18n();
  const labels = TEXTS[locale] || TEXTS.fr;
  const items = ICONS.map((icon, i) => ({ icon, label: labels[i] }));

  return (
    <div className="relative overflow-hidden border-y bg-card/50 py-4">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 w-max">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <item.icon className="h-4 w-4 text-primary/60" />
            <span className="font-medium whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
