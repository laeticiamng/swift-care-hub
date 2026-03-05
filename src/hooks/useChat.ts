import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ChannelType = 'patient' | 'zone' | 'general';

export interface ChatMessage {
  id: string;
  channel_type: ChannelType;
  channel_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  is_urgent: boolean;
  read_by: string[];
  created_at: string;
}

export interface ChatChannel {
  type: ChannelType;
  id: string;
  label: string;
  icon: string;
}

export function useChat(channelType: ChannelType, channelId: string, userId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const unreadCount = messages.filter(
    (m) => userId && !m.read_by.includes(userId) && m.sender_id !== userId
  ).length;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_type', channelType)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      setMessages(data as unknown as ChatMessage[]);
    }
    setLoading(false);
  }, [channelType, channelId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, isUrgent = false) => {
      if (!userId || !content.trim()) return;
      await supabase.from('messages').insert({
        channel_type: channelType,
        channel_id: channelId,
        sender_id: userId,
        content: content.trim(),
        is_urgent: isUrgent,
      } as any);
    },
    [channelType, channelId, userId]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!userId) return;
      const msg = messages.find((m) => m.id === messageId);
      if (msg && !msg.read_by.includes(userId)) {
        const newReadBy = [...msg.read_by, userId];
        await supabase
          .from('messages')
          .update({ read_by: newReadBy } as any)
          .eq('id', messageId);
      }
    },
    [userId, messages]
  );

  // Mark all visible as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const unread = messages.filter(
      (m) => !m.read_by.includes(userId) && m.sender_id !== userId
    );
    for (const msg of unread) {
      const newReadBy = [...msg.read_by, userId];
      await supabase
        .from('messages')
        .update({ read_by: newReadBy } as any)
        .eq('id', msg.id);
    }
  }, [userId, messages]);

  // Realtime subscription
  useEffect(() => {
    fetchMessages();

    channelRef.current = supabase
      .channel(`chat-${channelType}-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as unknown as ChatMessage]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === (payload.new as any).id ? (payload.new as unknown as ChatMessage) : m))
            );
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelType, channelId, fetchMessages]);

  return {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    markAllAsRead,
  };
}
