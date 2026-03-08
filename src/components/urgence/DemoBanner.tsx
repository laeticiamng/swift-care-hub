import { useDemo } from '@/contexts/DemoContext';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const { isDemoMode, demoRole, exitDemo } = useDemo();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  const handleExitDemo = () => {
    exitDemo();
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-50 bg-medical-warning/90 text-medical-warning-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium backdrop-blur-sm">
      <FlaskConical className="h-4 w-4 shrink-0" />
      <span>MODE DÉMO — Données fictives • Rôle : {demoRole?.toUpperCase()}</span>
      <button
        onClick={handleExitDemo}
        className="ml-2 px-2 py-0.5 rounded text-xs bg-black/20 hover:bg-black/30 transition-colors inline-flex items-center gap-1"
        aria-label="Quitter la démo"
      >
        <LogOut className="h-3 w-3" /> Quitter
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Masquer le bandeau"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
