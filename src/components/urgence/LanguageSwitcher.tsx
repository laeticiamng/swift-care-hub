import { useI18n, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const locales: Locale[] = ['fr', 'en', 'es', 'de'];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{LOCALE_FLAGS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLocale(l)}
            className={l === locale ? 'bg-accent font-medium' : ''}
          >
            <span className="mr-2">{LOCALE_FLAGS[l]}</span>
            {LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
