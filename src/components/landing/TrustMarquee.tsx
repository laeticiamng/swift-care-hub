import { ShieldCheck, FileCode, Building2, Lock, Server, Stethoscope } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'RGPD Santé' },
  { icon: FileCode, label: 'FHIR R4 / HL7v2' },
  { icon: Building2, label: 'Hospital-Owned' },
  { icon: Lock, label: 'Chiffrement AES-256' },
  { icon: Server, label: 'HDS France' },
  { icon: Stethoscope, label: 'CI-SIS / ANS' },
];

export function TrustMarquee() {
  return (
    <div className="relative overflow-hidden border-y bg-card/50 py-4">
      {/* Fade edges */}
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
