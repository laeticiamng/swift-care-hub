import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FooterSection() {
  return (
    <footer className="border-t py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">
              Urgence<span className="text-primary">OS</span> — EmotionsCare SASU — {new Date().getFullYear()}
            </p>
            <a href="mailto:contact@emotionscare.com" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
              <Mail className="h-3 w-3" /> contact@emotionscare.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-primary hover:underline"
            >
              Haut de page
            </button>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-xs">React · TypeScript · Temps réel</span>
          </div>
        </div>

        {/* Navigation links - organized by section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t pt-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Produit</p>
            <Link to="/features" className="block text-xs hover:text-foreground transition-colors">Fonctionnalités</Link>
            <Link to="/tarifs" className="block text-xs hover:text-foreground transition-colors">Tarifs</Link>
            <Link to="/demo" className="block text-xs hover:text-foreground transition-colors">Démo</Link>
            <Link to="/securite" className="block text-xs hover:text-foreground transition-colors">Sécurité</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Entreprise</p>
            <Link to="/about" className="block text-xs hover:text-foreground transition-colors">À propos</Link>
            <Link to="/b2b" className="block text-xs hover:text-foreground transition-colors">Établissements</Link>
            <Link to="/blog" className="block text-xs hover:text-foreground transition-colors">Blog</Link>
            <Link to="/faq" className="block text-xs hover:text-foreground transition-colors">FAQ</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Légal</p>
            <Link to="/mentions-legales" className="block text-xs hover:text-foreground transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="block text-xs hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/cgu" className="block text-xs hover:text-foreground transition-colors">CGU</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Conformité</p>
            <span className="block text-xs">HDS Certifié</span>
            <span className="block text-xs">ISO 27001 (en cours)</span>
            <span className="block text-xs">RGPD Santé</span>
            <span className="block text-xs">CI-SIS / ANS</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
          UrgenceOS est un outil d'aide à la gestion des urgences hospitalières. Il ne constitue pas un dispositif médical certifié.
        </p>
      </div>
    </footer>
  );
}
