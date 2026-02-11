import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/urgence/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Urgence<span className="text-primary">OS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
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
          <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => navigate('/about')}>
            À propos
          </Button>
          <Button size="sm" onClick={() => navigate('/login')}>
            Connexion
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-6 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
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
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
          >
            À propos
          </Link>
        </div>
      )}
    </nav>
  );
}
