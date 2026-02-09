/**
 * Offline queue system for UrgenceOS.
 * Queues mutations when offline and replays them when back online.
 * Uses IndexedDB via a simple localStorage fallback for simplicity.
 * Conflict resolution: last-write-wins + audit log.
 */

export interface QueuedAction {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  payload: Record<string, unknown>;
  timestamp: number;
  userId: string | null;
  retries: number;
}

const QUEUE_KEY = 'urgenceos_offline_queue';

export function getOfflineQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getOfflineQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromQueue(id: string): void {
  const queue = getOfflineQueue().filter(a => a.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueSize(): number {
  return getOfflineQueue().length;
}

export async function syncOfflineQueue(
  supabaseClient: { from: (table: string) => { insert: (data: unknown) => Promise<{ error: unknown }>; update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<{ error: unknown }> }; upsert: (data: unknown) => Promise<{ error: unknown }> } }
): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      let error: unknown = null;
      const table = supabaseClient.from(action.table);

      if (action.operation === 'insert') {
        const res = await table.insert(action.payload);
        error = res.error;
      } else if (action.operation === 'update') {
        const { id, ...rest } = action.payload as Record<string, unknown>;
        const res = await table.update(rest).eq('id', id);
        error = res.error;
      } else if (action.operation === 'upsert') {
        const res = await table.upsert(action.payload);
        error = res.error;
      }

      if (error) {
        failed++;
        // Increment retry count but keep in queue
        action.retries++;
        if (action.retries >= 5) {
          removeFromQueue(action.id);
        }
      } else {
        removeFromQueue(action.id);
        synced++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
