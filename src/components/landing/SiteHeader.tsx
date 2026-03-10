import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { LanguageSwitcher } from '@/components/urgence/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useI18n } from '@/i18n/I18nContext';

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useDemo();
  const { t } = useI18n();

  const NAV_LINKS = [
    { label: t.nav.features, to: '/features' },
    { label: t.nav.dashboard, to: '/flow' },
    { label: t.nav.demo, to: '/demo' },
    { label: t.nav.pricing, to: '/tarifs' },
    { label: t.nav.establishments, to: '/b2b' },
    { label: t.nav.faq, to: '/faq' },
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
      Aller au contenu principal
    </a>
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b" role="navigation" aria-label="Navigation principale">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
        <Link to="/" className="text-lg font-bold tracking-tight shrink-0" aria-label="UrgenceOS — Accueil">
          Urgence<span className="text-primary">OS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1" role="menubar">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              role="menuitem"
              aria-current={location.pathname === link.to ? 'page' : undefined}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                location.pathname === link.to
                  ? 'text-foreground bg-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex text-muted-foreground" onClick={() => navigate('/about')}>
            {t.nav.about}
          </Button>
          {isDemoMode ? (
            <Button size="sm" onClick={() => navigate('/board')} className="hidden sm:inline-flex">
              <LayoutGrid className="h-4 w-4 mr-1" /> {t.nav.board}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex text-muted-foreground" onClick={() => navigate('/login')}>
                {t.nav.login}
              </Button>
              <Button size="sm" onClick={() => navigate('/b2b')} className="hidden sm:inline-flex">
                {t.nav.requestTrial}
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-accent touch-target flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-[53px] bg-black/20 z-30 md:hidden" onClick={closeMobile} aria-hidden="true" />
          <div id="mobile-nav" className="md:hidden border-t bg-background px-4 sm:px-6 py-3 space-y-0.5 relative z-40 max-h-[calc(100dvh-53px)] overflow-y-auto" role="menu" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="menuitem"
                onClick={closeMobile}
                aria-current={location.pathname === link.to ? 'page' : undefined}
                className={`block px-3 py-3 text-sm rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-foreground bg-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/about" role="menuitem" onClick={closeMobile} className="block px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
              {t.nav.about}
            </Link>
            <Link to="/login" role="menuitem" onClick={closeMobile} className="block px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
              {t.nav.login}
            </Link>
            <div className="border-t pt-3 mt-2 flex gap-2">
              {isDemoMode ? (
                <Button size="sm" className="flex-1 h-11" onClick={() => { closeMobile(); navigate('/board'); }}>
                  <LayoutGrid className="h-4 w-4 mr-1" /> {t.nav.board}
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="flex-1 h-11" onClick={() => { closeMobile(); navigate('/demo'); }}>
                    {t.nav.seeDemo}
                  </Button>
                  <Button size="sm" className="flex-1 h-11" onClick={() => { closeMobile(); navigate('/b2b'); }}>
                    {t.nav.requestTrial}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
    </>
  );
}
