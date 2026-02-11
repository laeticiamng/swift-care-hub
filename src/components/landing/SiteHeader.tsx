import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useCallback } from 'react';

const NAV_LINKS = [
  { label: 'Produit', to: '/features' },
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Établissements', to: '/b2b' },
  { label: 'Sécurité', to: '/securite' },
  { label: 'Blog', to: '/blog' },
  { label: 'Démo', to: '/demo' },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <ThemeToggle />
          <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => navigate('/about')} aria-label="À propos d'UrgenceOS">
            À propos
          </Button>
          <Button size="sm" onClick={() => navigate('/login')} aria-label="Se connecter à UrgenceOS">
            Connexion
          </Button>

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
        </div>
      )}
    </nav>
  );
}
