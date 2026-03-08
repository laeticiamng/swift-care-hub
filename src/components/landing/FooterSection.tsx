import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';

export function FooterSection() {
  const { t } = useI18n();

  return (
    <footer className="border-t py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">
              Urgence<span className="text-primary">OS</span> — EmotionsCare SASU — {new Date().getFullYear()}
            </p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
              <Mail className="h-3 w-3" /> {t.footer.contactUs}
            </Link>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-primary hover:underline text-sm"
          >
            {t.footer.backToTop}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t pt-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{t.footer.product}</p>
            <Link to="/features" className="block text-xs hover:text-foreground transition-colors">{t.footer.features}</Link>
            <Link to="/tarifs" className="block text-xs hover:text-foreground transition-colors">{t.footer.pricing}</Link>
            <Link to="/demo" className="block text-xs hover:text-foreground transition-colors">{t.footer.demo}</Link>
            <Link to="/securite" className="block text-xs hover:text-foreground transition-colors">{t.footer.security}</Link>
            <Link to="/flow" className="block text-xs hover:text-foreground transition-colors">{t.footer.dashboard}</Link>
            <Link to="/statut" className="block text-xs hover:text-foreground transition-colors">{t.footer.status}</Link>
            <Link to="/sla" className="block text-xs hover:text-foreground transition-colors">{t.footer.sla}</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{t.footer.company}</p>
            <Link to="/about" className="block text-xs hover:text-foreground transition-colors">{t.footer.about}</Link>
            <Link to="/b2b" className="block text-xs hover:text-foreground transition-colors">{t.footer.establishments}</Link>
            <Link to="/faq" className="block text-xs hover:text-foreground transition-colors">{t.footer.faq}</Link>
            <Link to="/contact" className="block text-xs hover:text-foreground transition-colors">{t.footer.contact}</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{t.footer.legal}</p>
            <Link to="/mentions-legales" className="block text-xs hover:text-foreground transition-colors">{t.footer.legalNotices}</Link>
            <Link to="/politique-confidentialite" className="block text-xs hover:text-foreground transition-colors">{t.footer.privacy}</Link>
            <Link to="/cgu" className="block text-xs hover:text-foreground transition-colors">{t.footer.terms}</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{t.footer.compliance}</p>
            <span className="block text-xs">{t.footer.hdsTarget}</span>
            <span className="block text-xs">{t.footer.isoTarget}</span>
            <span className="block text-xs">{t.footer.rgpdHealth}</span>
            <span className="block text-xs">{t.footer.ciSis}</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
