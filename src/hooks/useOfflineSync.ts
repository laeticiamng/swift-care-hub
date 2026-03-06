/**
 * useOfflineSync — Central hook for offline/online detection,
 * proactive data caching, and automatic background sync.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  syncOfflineQueue,
  getQueueSize,
  addToOfflineQueue,
  cachePatient,
  cacheEncounter,
  cleanupExpiredCache,
  isOffline,
  getOfflineDurationSeconds,
  type QueuedAction,
} from '@/lib/offline-db';

export type ConnectionState = 'online' | 'degraded' | 'offline';

export interface SyncStatus {
  state: ConnectionState;
  queueCount: number;
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastSyncResult: { synced: number; failed: number } | null;
  offlineDuration: number; // seconds
}

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>({
    state: navigator.onLine ? 'online' : 'offline',
    queueCount: 0,
    isSyncing: false,
    lastSyncAt: null,
    lastSyncResult: null,
    offlineDuration: 0,
  });

  const syncingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // ── Sync the offline queue ──
  const doSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    const count = await getQueueSize();
    if (count === 0) {
      setStatus(s => ({ ...s, queueCount: 0 }));
      return;
    }

    syncingRef.current = true;
    setStatus(s => ({ ...s, isSyncing: true }));

    try {
      const result = await syncOfflineQueue(supabase as any);
      const remaining = await getQueueSize();
      setStatus(s => ({
        ...s,
        isSyncing: false,
        lastSyncAt: Date.now(),
        lastSyncResult: result,
        queueCount: remaining,
      }));
      if (result.synced > 0) {
        console.log(`[OfflineSync] ✓ ${result.synced} synced, ${result.failed} failed, ${remaining} remaining`);
      }
    } catch (err) {
      console.error('[OfflineSync] Sync error', err);
      setStatus(s => ({ ...s, isSyncing: false }));
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // ── Proactively cache current board data for offline use ──
  const cacheCurrentData = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const [encRes, patRes] = await Promise.all([
        supabase.from('encounters').select('*').in('status', ['arrived', 'triaged', 'in-progress']),
        supabase.from('patients').select('*'),
      ]);
      if (encRes.data) {
        for (const e of encRes.data) await cacheEncounter(e as any);
      }
      if (patRes.data) {
        for (const p of patRes.data) await cachePatient(p as any);
      }
    } catch {
      // Ignore — caching is best-effort
    }
  }, []);

  // ── Queue a mutation for offline replay ──
  const queueMutation = useCallback(
    async (
      table: string,
      operation: QueuedAction['operation'],
      payload: Record<string, unknown>,
      userId: string | null,
      priority: 'critical' | 'normal' = 'normal'
    ) => {
      await addToOfflineQueue({ table, operation, payload, userId, priority });
      const count = await getQueueSize();
      setStatus(s => ({ ...s, queueCount: count }));
    },
    []
  );

  // ── Connection state detection ──
  useEffect(() => {
    const goOnline = () => {
      setStatus(s => ({ ...s, state: 'online', offlineDuration: 0 }));
      // Auto-sync on reconnect
      setTimeout(doSync, 1000);
      // Re-cache fresh data
      setTimeout(cacheCurrentData, 3000);
    };

    const goOffline = () => {
      setStatus(s => ({ ...s, state: 'offline' }));
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Listen for SW sync message
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_QUEUE') {
        doSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Periodic tasks
    intervalRef.current = setInterval(() => {
      // Update offline duration
      if (!navigator.onLine) {
        setStatus(s => ({ ...s, offlineDuration: getOfflineDurationSeconds() }));
      }
      // Periodic sync attempt when online
      if (navigator.onLine) {
        doSync();
      }
      // Update queue count
      getQueueSize().then(count => {
        setStatus(s => ({ ...s, queueCount: count }));
      }).catch(() => {});
    }, 15000);

    // Latency-based degraded detection
    const checkLatency = () => {
      if (!navigator.onLine) return;
      const start = Date.now();
      fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' })
        .then(() => {
          const latency = Date.now() - start;
          setStatus(s => ({
            ...s,
            state: latency > 3000 ? 'degraded' : 'online',
          }));
        })
        .catch(() => {
          setStatus(s => ({ ...s, state: 'degraded' }));
        });
    };
    const latencyInterval = setInterval(checkLatency, 30000);

    // Initial load: cache data + sync queue + cleanup
    getQueueSize().then(count => setStatus(s => ({ ...s, queueCount: count }))).catch(() => {});
    if (navigator.onLine) {
      doSync();
      cacheCurrentData();
      cleanupExpiredCache().catch(() => {});
    }

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
      clearInterval(intervalRef.current);
      clearInterval(latencyInterval);
    };
  }, [doSync, cacheCurrentData]);

  return { status, doSync, queueMutation, cacheCurrentData };
}
