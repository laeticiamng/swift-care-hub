import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PrescriptionType,
  PRESCRIPTION_TYPE_GROUPS,
  PRESCRIPTION_TYPE_LABELS,
  PRESCRIPTION_TYPE_ICONS,
} from '@/lib/prescription-types';

interface PrescriptionTypeSelectorProps {
  value: PrescriptionType;
  onChange: (type: PrescriptionType) => void;
}

export function PrescriptionTypeSelector({ value, onChange }: PrescriptionTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PrescriptionType)}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {PRESCRIPTION_TYPE_ICONS[value]} {PRESCRIPTION_TYPE_LABELS[value]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PRESCRIPTION_TYPE_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </SelectLabel>
            {group.types.map((type) => (
              <SelectItem key={type} value={type}>
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{PRESCRIPTION_TYPE_ICONS[type]}</span>
                  <span>{PRESCRIPTION_TYPE_LABELS[type]}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
