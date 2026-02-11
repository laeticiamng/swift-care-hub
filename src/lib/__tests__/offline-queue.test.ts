import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOfflineQueue,
  addToOfflineQueue,
  removeFromQueue,
  clearOfflineQueue,
  getQueueSize,
} from '@/lib/offline-queue';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2, 10)}`,
});

describe('offline-queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getOfflineQueue', () => {
    it('returns empty array when no queue exists', () => {
      expect(getOfflineQueue()).toEqual([]);
    });

    it('returns empty array when localStorage contains corrupted JSON', () => {
      localStorage.setItem('urgenceos_offline_queue', 'not-valid-json{{{');
      expect(getOfflineQueue()).toEqual([]);
    });

    it('returns parsed queue from localStorage', () => {
      const data = [{ id: '1', table: 'vitals', operation: 'insert', payload: {}, timestamp: 123, userId: null, retries: 0 }];
      localStorage.setItem('urgenceos_offline_queue', JSON.stringify(data));
      expect(getOfflineQueue()).toEqual(data);
    });
  });

  describe('addToOfflineQueue', () => {
    it('adds an item to an empty queue', () => {
      addToOfflineQueue({
        table: 'prescriptions',
        operation: 'insert',
        payload: { medication_name: 'Paracetamol' },
        userId: 'user-1',
      });
      const queue = getOfflineQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].table).toBe('prescriptions');
      expect(queue[0].operation).toBe('insert');
      expect(queue[0].payload).toEqual({ medication_name: 'Paracetamol' });
      expect(queue[0].userId).toBe('user-1');
      expect(queue[0].retries).toBe(0);
      expect(queue[0].id).toBeDefined();
      expect(queue[0].timestamp).toBeGreaterThan(0);
    });

    it('adds multiple items and preserves all of them', () => {
      addToOfflineQueue({ table: 'vitals', operation: 'insert', payload: { fc: 80 }, userId: 'u1' });
      addToOfflineQueue({ table: 'vitals', operation: 'insert', payload: { fc: 90 }, userId: 'u1' });
      addToOfflineQueue({ table: 'prescriptions', operation: 'upsert', payload: { name: 'Test' }, userId: 'u2' });
      expect(getOfflineQueue()).toHaveLength(3);
    });

    it('assigns unique ids to each item', () => {
      addToOfflineQueue({ table: 'a', operation: 'insert', payload: {}, userId: null });
      addToOfflineQueue({ table: 'b', operation: 'insert', payload: {}, userId: null });
      const queue = getOfflineQueue();
      expect(queue[0].id).not.toBe(queue[1].id);
    });
  });

  describe('removeFromQueue', () => {
    it('removes a specific item by id', () => {
      addToOfflineQueue({ table: 'vitals', operation: 'insert', payload: { fc: 80 }, userId: null });
      addToOfflineQueue({ table: 'prescriptions', operation: 'insert', payload: { name: 'X' }, userId: null });
      const queue = getOfflineQueue();
      const idToRemove = queue[0].id;
      removeFromQueue(idToRemove);
      const updated = getOfflineQueue();
      expect(updated).toHaveLength(1);
      expect(updated[0].table).toBe('prescriptions');
    });

    it('does nothing when id does not exist', () => {
      addToOfflineQueue({ table: 'vitals', operation: 'insert', payload: {}, userId: null });
      removeFromQueue('non-existent-id');
      expect(getOfflineQueue()).toHaveLength(1);
    });
  });

  describe('clearOfflineQueue', () => {
    it('removes all items from the queue', () => {
      addToOfflineQueue({ table: 'a', operation: 'insert', payload: {}, userId: null });
      addToOfflineQueue({ table: 'b', operation: 'insert', payload: {}, userId: null });
      clearOfflineQueue();
      expect(getOfflineQueue()).toEqual([]);
    });

    it('works fine when queue is already empty', () => {
      clearOfflineQueue();
      expect(getOfflineQueue()).toEqual([]);
    });
  });

  describe('getQueueSize', () => {
    it('returns 0 for empty queue', () => {
      expect(getQueueSize()).toBe(0);
    });

    it('returns correct count after additions', () => {
      addToOfflineQueue({ table: 'a', operation: 'insert', payload: {}, userId: null });
      addToOfflineQueue({ table: 'b', operation: 'insert', payload: {}, userId: null });
      addToOfflineQueue({ table: 'c', operation: 'insert', payload: {}, userId: null });
      expect(getQueueSize()).toBe(3);
    });

    it('returns correct count after removals', () => {
      addToOfflineQueue({ table: 'a', operation: 'insert', payload: {}, userId: null });
      addToOfflineQueue({ table: 'b', operation: 'insert', payload: {}, userId: null });
      const queue = getOfflineQueue();
      removeFromQueue(queue[0].id);
      expect(getQueueSize()).toBe(1);
    });
  });
});
