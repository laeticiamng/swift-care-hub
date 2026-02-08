import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <header className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-medical-success/6" />
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-medical-success/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 pt-28 pb-24 relative">
        <Badge variant="secondary" className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 gap-1.5 px-4 py-1.5 text-sm">
          <Shield className="h-3.5 w-3.5" />
          Projet de recherche 2026
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
          Urgence<span className="text-primary">OS</span>
        </h1>

        <p className="mt-6 text-2xl sm:text-3xl font-semibold text-foreground max-w-2xl mx-auto leading-snug animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Moins de clics. Plus de soin.
        </p>

        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          1 tap = 1 action. Zéro formation. Interfaces pensées pour des gardes de 12h.
        </p>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Un point d'entrée urgences · Une timeline patient sourcée · Une pancarte IDE en un écran
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
          >
            Accéder à UrgenceOS <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
            onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Découvrir
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Données chiffrées RLS</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Temps réel</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> 5 profils métier</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Mode sombre</span>
        </div>
      </div>
    </header>
  );
}
