import { cn } from '@/lib/utils';
import { ZONE_CONFIGS, ZoneKey } from '@/lib/box-config';

interface BoxSelectorProps {
  zone: ZoneKey;
  occupiedBoxes: number[];
  selectedBox: number | null;
  onSelect: (box: number) => void;
}

export function BoxSelector({ zone, occupiedBoxes, selectedBox, onSelect }: BoxSelectorProps) {
  const config = ZONE_CONFIGS.find(z => z.key === zone);
  if (!config) return null;

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
      {Array.from({ length: config.boxCount }, (_, i) => i + 1).map(num => {
        const occupied = occupiedBoxes.includes(num);
        const selected = selectedBox === num;
        return (
          <button
            key={num}
            type="button"
            disabled={occupied}
            onClick={() => onSelect(num)}
            className={cn(
              'h-12 rounded-lg border text-sm font-bold transition-all',
              occupied && 'bg-muted text-muted-foreground/40 cursor-not-allowed border-dashed',
              !occupied && !selected && 'bg-card hover:bg-accent hover:shadow-sm cursor-pointer',
              selected && 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30',
            )}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
