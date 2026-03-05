import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: 'critical_result' | 'patient_assigned' | 'lab_alert' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  encounterId?: string;
  patientName?: string;
}

// Audio context for notification sounds
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playNotificationSound(type: 'critical' | 'alert' | 'info') {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'critical') {
      // Urgent: rapid beeps at high frequency
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else if (type === 'alert') {
      // Alert: two-tone
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else {
      // Info: gentle chime
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio not available
  }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const channelRef = useRef<any>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50

    // Play sound
    if (notif.type === 'critical_result') {
      playNotificationSound('critical');
      toast.error(notif.title, { description: notif.message, duration: 10000 });
    } else if (notif.type === 'lab_alert' || notif.type === 'patient_assigned') {
      playNotificationSound('alert');
      toast.warning(notif.title, { description: notif.message });
    } else {
      playNotificationSound('info');
      toast.info(notif.title, { description: notif.message });
    }

    // Browser push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/icons/icon-192.svg',
        tag: newNotif.id,
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Subscribe to realtime critical results
  useEffect(() => {
    if (!userId) return;

    channelRef.current = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'results',
      }, (payload) => {
        const result = payload.new as any;
        if (result.is_critical) {
          addNotification({
            type: 'critical_result',
            title: '🚨 Résultat critique',
            message: `${result.title} — Valeur critique détectée`,
            encounterId: result.encounter_id,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'encounters',
      }, (payload) => {
        const enc = payload.new as any;
        const old = payload.old as any;
        if (enc.medecin_id === userId && old.medecin_id !== userId) {
          addNotification({
            type: 'patient_assigned',
            title: '👤 Patient assigné',
            message: `Un nouveau patient vous a été assigné`,
            encounterId: enc.id,
          });
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
}
