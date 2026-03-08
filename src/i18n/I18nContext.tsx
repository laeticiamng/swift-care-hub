import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type Locale, LOCALE_LABELS, LOCALE_FLAGS } from './translations';

type TranslationTree = typeof translations['fr'];

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationTree;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('urgenceos-locale');
    if (saved && saved in translations) return saved as Locale;
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang in translations) return browserLang as Locale;
  } catch {}
  return 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('urgenceos-locale', l); } catch {}
    document.documentElement.lang = l;
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { LOCALE_LABELS, LOCALE_FLAGS, type Locale };
