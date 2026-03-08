import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { StatusBadgeHeader } from '@/components/urgence/StatusBadgeHeader';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';

const NAV_LINKS = [
  { label: 'Fonctionnalités', to: '/features' },
  { label: 'Démo', to: '/demo' },
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Établissements', to: '/b2b' },
  { label: 'FAQ', to: '/faq' },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useDemo();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b" role="navigation" aria-label="Navigation principale">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight" aria-label="UrgenceOS — Accueil">
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

        <div className="flex items-center gap-2">
          <StatusBadgeHeader />
          <ThemeToggle />
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex text-muted-foreground" onClick={() => navigate('/about')} aria-label="À propos d'UrgenceOS">
            À propos
          </Button>
          {isDemoMode ? (
            <Button size="sm" onClick={() => navigate('/board')} aria-label="Aller au board">
              <LayoutGrid className="h-4 w-4 mr-1" /> Board
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => navigate('/demo')} aria-label="Voir la démo UrgenceOS">
                Démo
              </Button>
              <Button size="sm" onClick={() => navigate('/b2b')} aria-label="Demander un pilote UrgenceOS">
                Demander un pilote
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
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
        <div id="mobile-nav" className="md:hidden border-t bg-background px-6 py-3 space-y-1" role="menu" aria-label="Menu mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              role="menuitem"
              onClick={closeMobile}
              aria-current={location.pathname === link.to ? 'page' : undefined}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                location.pathname === link.to
                  ? 'text-foreground bg-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/about"
            role="menuitem"
            onClick={closeMobile}
            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
          >
            À propos
          </Link>
          <div className="border-t pt-2 mt-2 flex gap-2">
            {isDemoMode ? (
              <Button size="sm" className="flex-1" onClick={() => { closeMobile(); navigate('/board'); }}>
                <LayoutGrid className="h-4 w-4 mr-1" /> Board
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { closeMobile(); navigate('/demo'); }}>
                  Voir la démo
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { closeMobile(); navigate('/b2b'); }}>
                  Demander un pilote
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
