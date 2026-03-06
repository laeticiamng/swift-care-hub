import { cn } from '@/lib/utils';
import { WifiOff, AlertTriangle, RefreshCw, CloudOff, Cloud } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useOfflineSync';

interface NetworkStatusProps {
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
}

export function NetworkStatus({ syncStatus, onManualSync }: NetworkStatusProps) {
  const state = syncStatus?.state ?? (navigator.onLine ? 'online' : 'offline');
  const queueCount = syncStatus?.queueCount ?? 0;
  const isSyncing = syncStatus?.isSyncing ?? false;
  const offlineDuration = syncStatus?.offlineDuration ?? 0;
  const lastSyncResult = syncStatus?.lastSyncResult;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h${Math.floor((seconds % 3600) / 60)}min`;
  };

  return (
    <>
      {/* Compact indicator */}
      <div
        className="flex items-center gap-1.5 cursor-pointer"
        onClick={onManualSync}
        title={
          state === 'online'
            ? `Connecté${queueCount > 0 ? ` — ${queueCount} en attente` : ''}`
            : state === 'degraded'
            ? 'Connexion instable'
            : `Hors ligne${offlineDuration > 0 ? ` depuis ${formatDuration(offlineDuration)}` : ''}`
        }
      >
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors',
            state === 'online' && 'bg-medical-success animate-pulse',
            state === 'degraded' && 'bg-orange-500 animate-pulse',
            state === 'offline' && 'bg-medical-critical'
          )}
        />
        {isSyncing && (
          <RefreshCw className="h-3 w-3 text-primary animate-spin" />
        )}
        {state === 'online' && queueCount > 0 && !isSyncing && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {queueCount} ⏳
          </span>
        )}
        {state === 'degraded' && (
          <span className="text-xs font-medium text-orange-500">Instable</span>
        )}
        {state === 'offline' && (
          <span className="text-xs font-medium text-medical-critical flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> Hors ligne
          </span>
        )}
      </div>

      {/* Banners */}
      {state === 'offline' && (
        <div className="fixed top-0 left-0 right-0 z-[60] py-1.5 px-4 text-center text-xs font-medium animate-in slide-in-from-top-2 duration-300 bg-medical-critical text-medical-critical-foreground">
          <div className="flex items-center justify-center gap-2">
            <CloudOff className="h-3.5 w-3.5" />
            Mode hors ligne
            {offlineDuration > 0 && ` depuis ${formatDuration(offlineDuration)}`}
            {queueCount > 0
              ? ` — ${queueCount} action(s) en attente de synchronisation`
              : ' — données en cache disponibles'}
          </div>
        </div>
      )}

      {state === 'degraded' && (
        <div className="fixed top-0 left-0 right-0 z-[60] py-1.5 px-4 text-center text-xs font-medium animate-in slide-in-from-top-2 duration-300 bg-orange-500 text-white">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Connexion instable — les modifications seront mises en file d'attente
          </div>
        </div>
      )}

      {/* Sync complete toast-like banner */}
      {state === 'online' && lastSyncResult && lastSyncResult.synced > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[60] py-1.5 px-4 text-center text-xs font-medium animate-in slide-in-from-top-2 duration-300 bg-medical-success text-white">
          <div className="flex items-center justify-center gap-2">
            <Cloud className="h-3.5 w-3.5" />
            ✓ {lastSyncResult.synced} action(s) synchronisée(s)
            {lastSyncResult.failed > 0 && ` — ${lastSyncResult.failed} échouée(s)`}
          </div>
        </div>
      )}
    </>
  );
}
