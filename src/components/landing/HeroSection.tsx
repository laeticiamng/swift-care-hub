import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const easing = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: easing as unknown as [number, number, number, number], delay },
});

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Gradient mesh orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-[hsl(var(--medical-success))]/5" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--medical-success))]/5 blur-[100px] animate-[pulse_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[160px] animate-[pulse_10s_ease-in-out_infinite_4s]" />
      </div>

      {/* Top gradient fade */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 pt-28 pb-24 relative">
        <motion.div {...fadeUp(0)}>
          <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-default group">
            <Building2 className="h-3.5 w-3.5 group-hover:rotate-6 transition-transform" />
            Logiciel possédé par l'hôpital
          </Badge>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]"
        >
          Le logiciel des urgences<br />
          <span className="relative inline-block bg-gradient-to-r from-primary via-[hsl(207,67%,62%)] to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
            que votre hôpital contrôle.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 text-xl sm:text-2xl font-semibold text-foreground max-w-3xl mx-auto leading-snug"
        >
          Un seul écran par soignant. Zéro ressaisie. Triage, prescriptions, résultats et coordination — tout réuni, en temps réel, adapté à chaque rôle.
        </motion.p>

        <motion.p
          {...fadeUp(0.3)}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          UrgenceOS remplace les outils dispersés de votre service d'urgences par une plateforme intégrée, interopérable avec votre DPI existant. L'hôpital garde le contrôle total du logiciel et de ses données.
        </motion.p>

        <motion.div
          {...fadeUp(0.4)}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => navigate('/b2b')}
            className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Demander un pilote <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base hover:bg-primary/5 hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
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
          <div className="rounded-2xl border bg-card shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-500 group/board">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--medical-warning))]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--medical-success))]" />
              </div>
              <span className="ml-2 font-medium">Board — SAU</span>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[
                { box: 1, name: 'M. Dupont', ccmu: 2, time: '1h20', color: 'border-l-[hsl(var(--medical-warning))]' },
                { box: 2, name: 'Mme Martin', ccmu: 4, time: '0h45', color: 'border-l-[hsl(var(--medical-success))]' },
                { box: 3, name: 'M. Bernard', ccmu: 1, time: '0h15', color: 'border-l-destructive' },
                { box: 5, name: 'Mme Petit', ccmu: 3, time: '2h10', color: 'border-l-[hsl(var(--medical-warning))]' },
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
            'Compatible avec votre DPI existant',
            'Un écran unique par rôle soignant',
            'Données hébergées en France (HDS)',
            'Résultats mesurables en 10 semaines',
          ].map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--medical-success))]" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
