import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const APP_ROUTES = ['/board', '/patient', '/triage', '/pancarte', '/as', '/constantes', '/accueil', '/admission', '/ioa-queue', '/prescriptions', '/recap', '/interop', '/demo/live'];

export function MedicalDisclaimer() {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();
  const isAppRoute = APP_ROUTES.some(r => location.pathname.startsWith(r));

  if (!isAppRoute || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-800 px-4 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>UrgenceOS est un outil d'aide a la gestion des urgences hospitalieres. Il ne constitue pas un dispositif medical certifie.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors">
          <X className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
        </button>
      </div>
    </div>
  );
}
