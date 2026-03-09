import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/I18nContext';

const TEXTS: Record<string, { text: string; dismiss: string }> = {
  fr: { text: 'Premiers essais hospitaliers ouverts pour 2026', dismiss: "Fermer l'annonce" },
  en: { text: 'First hospital trials open for 2026', dismiss: 'Dismiss announcement' },
  es: { text: 'Primeros ensayos hospitalarios abiertos para 2026', dismiss: 'Cerrar anuncio' },
  de: { text: 'Erste Krankenhaus-Tests für 2026 geöffnet', dismiss: 'Ankündigung schließen' },
};

export function AnnouncementBanner() {
  const { locale } = useI18n();
  const tx = TEXTS[locale] || TEXTS.fr;

  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('announcement-dismissed') === '1'; } catch { return false; }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('announcement-dismissed', '1'); } catch {}
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/10"
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
            <Link
              to="/b2b"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group bg-primary/5 rounded-full px-4 py-1 border border-primary/15 hover:border-primary/30 hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-xs sm:text-sm">{tx.text}</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-primary/10 transition-colors"
              aria-label={tx.dismiss}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
