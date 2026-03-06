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
            onClick={() => navigate('/demo')}
          >
            Voir la démo
          </Button>
        </div>

        {/* Board mockup preview */}
        <div className="mt-16 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <div className="rounded-2xl border bg-card shadow-xl overflow-hidden" style={{ perspective: '1200px' }}>
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 font-medium">Board — SAU</span>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[
                { box: 1, name: 'M. Dupont', ccmu: 3, time: '1h20', color: 'border-l-yellow-500' },
                { box: 2, name: 'Mme Martin', ccmu: 2, time: '0h45', color: 'border-l-green-500' },
                { box: 3, name: 'M. Bernard', ccmu: 4, time: '2h10', color: 'border-l-orange-500' },
                { box: 5, name: 'Mme Petit', ccmu: 1, time: '0h15', color: 'border-l-green-500' },
              ].map((p) => (
                <div key={p.box} className={`rounded-lg border border-l-4 ${p.color} bg-background p-3 text-left`}>
                  <div className="text-[10px] text-muted-foreground font-medium">Box {p.box}</div>
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">CCMU {p.ccmu}</span>
                    <span className="text-[10px] text-muted-foreground">{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Aperçu du board panoramique — données fictives</p>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Socle possédé par l'hôpital</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Interopérabilité FHIR R4</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> Sécurité native</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-medical-success" /> ROI mesurable en semaines</span>
        </div>
      </div>
    </header>
  );
}
