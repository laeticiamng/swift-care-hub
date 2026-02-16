import { cn } from '@/lib/utils';
import { UtensilsCrossed, PersonStanding, Stethoscope, ClipboardList } from 'lucide-react';
import type { PrescriptionMetadata } from '@/lib/prescription-types';
import type { Tables } from '@/integrations/supabase/types';

interface ConsignesBannerProps {
  items: Array<{ rx: Tables<'prescriptions'>; meta: PrescriptionMetadata }>;
}

function getConsigneIcon(type: string) {
  switch (type) {
    case 'regime':
      return UtensilsCrossed;
    case 'mobilisation':
      return PersonStanding;
    case 'dispositif':
      return Stethoscope;
    default:
      return ClipboardList;
  }
}

function getConsigneColor(type: string) {
  switch (type) {
    case 'regime':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
      };
    case 'mobilisation':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'dispositif':
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/40',
        text: 'text-slate-600 dark:text-slate-400',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800/40',
        text: 'text-gray-600 dark:text-gray-400',
      };
  }
}

function getConsigneText(rx: Tables<'prescriptions'>, meta: PrescriptionMetadata): string {
  switch (meta.type) {
    case 'regime':
      return meta.regime_details || rx.medication_name;
    case 'mobilisation':
      return meta.mobilisation_details || rx.medication_name;
    case 'dispositif':
      return [meta.device_name, meta.device_details].filter(Boolean).join(' — ') || rx.medication_name;
    default:
      return rx.medication_name;
  }
}

export function ConsignesBanner({ items }: ConsignesBannerProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in-0 slide-in-from-top-2 transition-all duration-300">
      {items.map(({ rx, meta }, idx) => {
        const Icon = getConsigneIcon(meta.type);
        const colors = getConsigneColor(meta.type);
        const text = getConsigneText(rx, meta);

        return (
          <div
            key={rx.id ?? idx}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent',
              'bg-muted/40 dark:bg-muted/20'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                colors.bg
              )}
            >
              <Icon className={cn('h-4 w-4', colors.text)} />
            </div>
            <p className="text-sm text-foreground/80 leading-snug">{text}</p>
          </div>
        );
      })}
    </div>
  );
}
