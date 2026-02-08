import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) {
    return (
      <div className="flex items-center gap-1" title="Connecté">
        <span className="h-2 w-2 rounded-full bg-medical-success animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-medical-critical" title="Hors ligne">
      <WifiOff className="h-4 w-4" />
      <span className="text-xs font-medium">Hors ligne</span>
    </div>
  );
}
