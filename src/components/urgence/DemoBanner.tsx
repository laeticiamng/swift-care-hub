import { useDemo } from '@/contexts/DemoContext';
import { FlaskConical, X } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const { isDemoMode, demoRole, exitDemo } = useDemo();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-medical-warning/90 text-medical-warning-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium backdrop-blur-sm">
      <FlaskConical className="h-4 w-4 shrink-0" />
      <span>MODE DÉMO — Données fictives • Rôle : {demoRole?.toUpperCase()}</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Masquer le bandeau"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
