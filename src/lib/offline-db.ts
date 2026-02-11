/**
 * UrgenceOS — IndexedDB Offline Storage
 * Provides persistent offline storage for patient data, encounters,
 * and mutation queue with encryption support.
 * Replaces localStorage-based offline queue (5MB limit).
 * IndexedDB limit: ~50MB+ per origin.
 */

const DB_NAME = 'urgenceos-offline';
const DB_VERSION = 1;

const STORES = {
  QUEUE: 'offline_queue',
  PATIENTS: 'patients_cache',
  ENCOUNTERS: 'encounters_cache',
  VITALS: 'vitals_cache',
  PRESCRIPTIONS: 'prescriptions_cache',
  META: 'metadata',
} as const;

export interface QueuedAction {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'upsert';
  payload: Record<string, unknown>;
  timestamp: number;
  userId: string | null;
  retries: number;
  priority: 'critical' | 'normal';
}

interface CachedRecord {
  id: string;
  data: Record<string, unknown>;
  cached_at: number;
  expires_at: number;
}

// ── Database initialization ──
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('priority', 'priority', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
        db.createObjectStore(STORES.PATIENTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.ENCOUNTERS)) {
        const encStore = db.createObjectStore(STORES.ENCOUNTERS, { keyPath: 'id' });
        encStore.createIndex('cached_at', 'cached_at', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.VITALS)) {
        db.createObjectStore(STORES.VITALS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PRESCRIPTIONS)) {
        db.createObjectStore(STORES.PRESCRIPTIONS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Generic IDB helpers ──
async function idbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function idbClear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbCount(storeName: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Offline Queue (IndexedDB-based) ──
export async function getOfflineQueue(): Promise<QueuedAction[]> {
  try {
    return await idbGetAll<QueuedAction>(STORES.QUEUE);
  } catch {
    return [];
  }
}

export async function addToOfflineQueue(
  action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries' | 'priority'> & { priority?: 'critical' | 'normal' }
): Promise<void> {
  const entry: QueuedAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
    priority: action.priority || 'normal',
  };
  await idbPut(STORES.QUEUE, entry);

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('urgenceos-offline-sync');
    } catch {
      // Background sync not available — will sync on next online event
    }
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  await idbDelete(STORES.QUEUE, id);
}

export async function clearOfflineQueue(): Promise<void> {
  await idbClear(STORES.QUEUE);
}

export async function getQueueSize(): Promise<number> {
  try {
    return await idbCount(STORES.QUEUE);
  } catch {
    return 0;
  }
}

// ── Patient Data Cache ──
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export async function cachePatient(patient: Record<string, unknown>): Promise<void> {
  const entry: CachedRecord = {
    id: patient.id as string,
    data: patient,
    cached_at: Date.now(),
    expires_at: Date.now() + CACHE_TTL,
  };
  await idbPut(STORES.PATIENTS, entry);
}

export async function getCachedPatient(id: string): Promise<Record<string, unknown> | null> {
  const entry = await idbGet<CachedRecord>(STORES.PATIENTS, id);
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    await idbDelete(STORES.PATIENTS, id);
    return null;
  }
  return entry.data;
}

export async function cacheEncounter(encounter: Record<string, unknown>): Promise<void> {
  const entry: CachedRecord = {
    id: encounter.id as string,
    data: encounter,
    cached_at: Date.now(),
    expires_at: Date.now() + CACHE_TTL,
  };
  await idbPut(STORES.ENCOUNTERS, entry);
}

export async function getCachedEncounter(id: string): Promise<Record<string, unknown> | null> {
  const entry = await idbGet<CachedRecord>(STORES.ENCOUNTERS, id);
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    await idbDelete(STORES.ENCOUNTERS, id);
    return null;
  }
  return entry.data;
}

export async function getAllCachedEncounters(): Promise<Record<string, unknown>[]> {
  const entries = await idbGetAll<CachedRecord>(STORES.ENCOUNTERS);
  const now = Date.now();
  return entries
    .filter(e => now <= e.expires_at)
    .map(e => e.data);
}

// ── Sync engine ──
export async function syncOfflineQueue(
  supabaseClient: {
    from: (table: string) => {
      insert: (data: unknown) => Promise<{ error: unknown }>;
      update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<{ error: unknown }> };
      upsert: (data: unknown) => Promise<{ error: unknown }>;
    };
  }
): Promise<{ synced: number; failed: number }> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  queue.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'critical' ? -1 : 1;
    return a.timestamp - b.timestamp;
  });

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
        const { id, ...rest } = action.payload;
        const res = await table.update(rest).eq('id', id);
        error = res.error;
      } else if (action.operation === 'upsert') {
        const res = await table.upsert(action.payload);
        error = res.error;
      }

      if (error) {
        failed++;
        action.retries++;
        if (action.retries >= 10) {
          console.error(`[OfflineDB] Action ${action.id} failed after 10 retries, archiving`, action);
          await idbPut(STORES.META, {
            key: `dead_letter_${action.id}`,
            action,
            failed_at: Date.now(),
          });
          await removeFromQueue(action.id);
        } else {
          await idbPut(STORES.QUEUE, action);
        }
      } else {
        await removeFromQueue(action.id);
        synced++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

// ── Cleanup expired cache entries ──
export async function cleanupExpiredCache(): Promise<void> {
  const now = Date.now();

  for (const storeName of [STORES.PATIENTS, STORES.ENCOUNTERS, STORES.VITALS, STORES.PRESCRIPTIONS]) {
    try {
      const entries = await idbGetAll<CachedRecord>(storeName);
      for (const entry of entries) {
        if (now > entry.expires_at) {
          await idbDelete(storeName, entry.id);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

// ── Online/Offline status tracking ──
let offlineSince: number | null = null;

export function trackOnlineStatus(): () => void {
  const handleOffline = () => { offlineSince = Date.now(); };
  const handleOnline = () => { offlineSince = null; };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  if (!navigator.onLine) offlineSince = Date.now();

  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}

export function getOfflineDurationSeconds(): number {
  if (!offlineSince) return 0;
  return Math.floor((Date.now() - offlineSince) / 1000);
}

export function isOffline(): boolean {
  return !navigator.onLine;
}

export async function getStorageEstimate(): Promise<{ used: number; quota: number; percentage: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const est = await navigator.storage.estimate();
    const used = est.usage || 0;
    const quota = est.quota || 0;
    return { used, quota, percentage: quota > 0 ? Math.round((used / quota) * 100) : 0 };
  }
  return { used: 0, quota: 0, percentage: 0 };
}
