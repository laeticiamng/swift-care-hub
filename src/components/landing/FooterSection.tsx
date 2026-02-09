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
        <div className="flex flex-wrap justify-center gap-4 text-xs border-t pt-4">
          <Link to="/features" className="hover:text-foreground transition-colors">Fonctionnalites</Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
          UrgenceOS est un outil d'aide a la gestion des urgences hospitalieres. Il ne constitue pas un dispositif medical certifie.
        </p>
      </div>
    </footer>
  );
}
