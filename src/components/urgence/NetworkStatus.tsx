import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

type NetworkState = 'online' | 'degraded' | 'offline';

export function NetworkStatus() {
  const [state, setState] = useState<NetworkState>(navigator.onLine ? 'online' : 'offline');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let degradedTimeout: ReturnType<typeof setTimeout> | null = null;

    const checkConnection = () => {
      if (!navigator.onLine) {
        setState('offline');
        setShowBanner(true);
        return;
      }
      // Quick latency check by fetching a tiny resource
      const start = Date.now();
      fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' })
        .then(() => {
          const latency = Date.now() - start;
          if (latency > 3000) {
            setState('degraded');
            setShowBanner(true);
          } else {
            setState('online');
            setShowBanner(false);
          }
        })
        .catch(() => {
          setState('degraded');
          setShowBanner(true);
        });
    };

    const goOnline = () => {
      setState('online');
      // Re-check after a moment to confirm
      degradedTimeout = setTimeout(checkConnection, 2000);
    };
    const goOffline = () => {
      setState('offline');
      setShowBanner(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Periodic check every 30s
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
      if (degradedTimeout) clearTimeout(degradedTimeout);
    };
  }, []);

  return (
    <>
      {/* Indicator dot */}
      <div
        className="flex items-center gap-1.5"
        title={state === 'online' ? 'Connecte' : state === 'degraded' ? 'Connexion instable' : 'Hors ligne'}
      >
        <span className={cn(
          'h-2.5 w-2.5 rounded-full transition-colors',
          state === 'online' && 'bg-medical-success animate-pulse',
          state === 'degraded' && 'bg-orange-500 animate-pulse',
          state === 'offline' && 'bg-medical-critical',
        )} />
        {state === 'degraded' && (
          <span className="text-xs font-medium text-orange-500">Instable</span>
        )}
        {state === 'offline' && (
          <span className="text-xs font-medium text-medical-critical flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> Hors ligne
          </span>
        )}
      </div>

      {/* Degraded / Offline banner */}
      {showBanner && state !== 'online' && (
        <div className={cn(
          'fixed top-0 left-0 right-0 z-[60] py-1.5 px-4 text-center text-xs font-medium animate-in slide-in-from-top-2 duration-300',
          state === 'offline'
            ? 'bg-medical-critical text-medical-critical-foreground'
            : 'bg-orange-500 text-white',
        )}>
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            {state === 'offline'
              ? 'Mode hors ligne — donnees non synchronisees'
              : 'Connexion instable — donnees potentiellement non synchronisees'}
          </div>
        </div>
      )}
    </>
  );
}
