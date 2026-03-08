import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-medical-success/5" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-medical-success/5 blur-[100px] animate-[pulse_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[160px] animate-[pulse_10s_ease-in-out_infinite_4s]" />
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 pt-28 pb-24 relative">
        <motion.div {...fadeUp(0)}>
          <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <Building2 className="h-3.5 w-3.5" />
            Hospital-Owned Software
          </Badge>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]"
        >
          L'hôpital reprend la main<br />
          <span className="bg-gradient-to-r from-primary via-primary to-[hsl(207,67%,62%)] bg-clip-text text-transparent">
            sur son SI.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 text-xl sm:text-2xl font-semibold text-foreground max-w-3xl mx-auto leading-snug"
        >
          Un socle interne que votre hôpital possède, gouverne et fait évoluer — avec des modules urgences qui remboursent votre dette opérationnelle dès les premiers mois.
        </motion.p>

        <motion.p
          {...fadeUp(0.3)}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          UrgenceOS n'est pas un logiciel de plus. C'est un plan d'autonomie logicielle pour l'hôpital : plateforme interne + modules urgences à ROI + standards d'interopérabilité.
        </motion.p>

        <motion.div
          {...fadeUp(0.4)}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => navigate('/b2b')}
            className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-200"
          >
            Demander un pilote <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
            onClick={() => navigate('/demo')}
          >
            Voir la démo
          </Button>
        </motion.div>

        {/* Board mockup preview */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border bg-card shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-500" style={{ perspective: '1200px' }}>
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
                <div key={p.box} className={`rounded-lg border border-l-4 ${p.color} bg-background p-3 text-left hover:bg-accent/50 transition-colors`}>
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
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          {...fadeUp(0.7)}
          className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground"
        >
          {[
            'Socle possédé par l\'hôpital',
            'Interopérabilité FHIR R4',
            'Sécurité native',
            'ROI mesurable en semaines',
          ].map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-medical-success" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
