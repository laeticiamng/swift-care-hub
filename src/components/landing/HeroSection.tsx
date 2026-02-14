import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
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
          <Building2 className="h-3.5 w-3.5" />
          Hospital-Owned Software
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
          L'hôpital reprend la main<br />
          <span className="text-primary">sur son SI.</span>
        </h1>

        <p className="mt-6 text-xl sm:text-2xl font-semibold text-foreground max-w-3xl mx-auto leading-snug animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Un socle interne que votre hôpital possède, gouverne et fait évoluer — avec des modules urgences qui remboursent votre dette opérationnelle dès les premiers mois.
        </p>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          UrgenceOS n'est pas un logiciel de plus. C'est un plan d'autonomie logicielle pour l'hôpital : plateforme interne + modules urgences à ROI + standards d'interopérabilité.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/b2b')}
            className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
          >
            Demander un pilote <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
            onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Comprendre la dette opérationnelle
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Socle possédé par l'hôpital</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Interopérabilité FHIR R4</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Security-first</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> ROI mesurable en semaines</span>
        </div>
      </div>
    </header>
  );
}
