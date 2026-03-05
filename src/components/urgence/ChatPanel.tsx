import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, type ChannelType, type ChatChannel } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  MessageSquare, Send, AlertTriangle, CheckCheck, Check, X,
  Users, User, Radio, Hash,
} from 'lucide-react';

// ── Channel Selector ──────────────────────────────────────────────
function ChannelSelector({
  channels,
  active,
  onSelect,
  unreadMap,
}: {
  channels: ChatChannel[];
  active: ChatChannel;
  onSelect: (c: ChatChannel) => void;
  unreadMap: Record<string, number>;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    patient: <User className="h-3.5 w-3.5" />,
    zone: <Radio className="h-3.5 w-3.5" />,
    general: <Hash className="h-3.5 w-3.5" />,
  };

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 border-b px-1">
      {channels.map((ch) => {
        const key = `${ch.type}-${ch.id}`;
        const isActive = active.type === ch.type && active.id === ch.id;
        const unread = unreadMap[key] || 0;
        return (
          <button
            key={key}
            onClick={() => onSelect(ch)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {iconMap[ch.type]}
            {ch.label}
            {unread > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                {unread}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────
function MessageBubble({
  content,
  senderName,
  isOwn,
  isUrgent,
  readBy,
  totalRecipients,
  timestamp,
}: {
  content: string;
  senderName: string;
  isOwn: boolean;
  isUrgent: boolean;
  readBy: number;
  totalRecipients: number;
  timestamp: string;
}) {
  return (
    <div className={cn('flex flex-col gap-0.5 max-w-[85%]', isOwn ? 'ml-auto items-end' : 'items-start')}>
      {!isOwn && (
        <span className="text-[10px] text-muted-foreground font-medium px-1">{senderName}</span>
      )}
      <div
        className={cn(
          'rounded-xl px-3 py-2 text-sm',
          isUrgent && 'border-2 border-destructive',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        {isUrgent && (
          <div className="flex items-center gap-1 text-[10px] font-bold mb-1 text-destructive-foreground">
            <AlertTriangle className="h-3 w-3" /> URGENT
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isOwn && (
          readBy >= totalRecipients ? (
            <CheckCheck className="h-3 w-3 text-primary" />
          ) : (
            <Check className="h-3 w-3 text-muted-foreground" />
          )
        )}
      </div>
    </div>
  );
}

// ── Main Chat Panel (inside Sheet) ─────────────────────────────────
function ChatContent({
  channels,
  defaultChannel,
}: {
  channels: ChatChannel[];
  defaultChannel?: ChatChannel;
}) {
  const { user } = useAuth();
  const { isDemoMode } = useDemo();
  const userId = isDemoMode ? 'demo-user' : user?.id;

  const [activeChannel, setActiveChannel] = useState<ChatChannel>(defaultChannel || channels[0]);
  const [inputValue, setInputValue] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, loading, unreadCount, sendMessage, markAllAsRead } = useChat(
    activeChannel.type,
    activeChannel.id,
    userId
  );

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark as read when channel is viewed
  useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [activeChannel, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue, isUrgent);
    setInputValue('');
    setIsUrgent(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Demo messages for demo mode
  const displayMessages = isDemoMode && messages.length === 0
    ? getDemoMessages(activeChannel)
    : messages;

  // Unread map for channel selector
  const unreadMap: Record<string, number> = {};
  // We only track current channel's unread here; for multi-channel we'd need multiple hooks
  unreadMap[`${activeChannel.type}-${activeChannel.id}`] = unreadCount;

  return (
    <div className="flex flex-col h-full">
      {channels.length > 1 && (
        <ChannelSelector
          channels={channels}
          active={activeChannel}
          onSelect={setActiveChannel}
          unreadMap={unreadMap}
        />
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef as any}>
        <div className="space-y-3 min-h-full flex flex-col justify-end">
          {loading && (
            <div className="text-center text-muted-foreground text-xs py-8">Chargement…</div>
          )}
          {!loading && displayMessages.length === 0 && (
            <div className="text-center text-muted-foreground text-xs py-8">
              Aucun message dans ce canal
            </div>
          )}
          {displayMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              senderName={msg.sender_name || 'Soignant'}
              isOwn={msg.sender_id === userId}
              isUrgent={msg.is_urgent}
              readBy={msg.read_by.length}
              totalRecipients={2}
              timestamp={msg.created_at}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-3 space-y-2">
        {isUrgent && (
          <div className="flex items-center gap-1 text-xs text-destructive font-semibold animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            Mode URGENT — le message déclenchera une alerte sonore
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isUrgent ? 'destructive' : 'ghost'}
            className="h-9 w-9 p-0 shrink-0"
            onClick={() => setIsUrgent(!isUrgent)}
            title="Message urgent"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre message…"
            className="flex-1 h-9 text-sm"
          />
          <Button
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Demo messages for demo mode ────────────────────────────────────
function getDemoMessages(channel: ChatChannel) {
  const now = new Date();
  const base = [
    {
      id: 'demo-1',
      channel_type: channel.type,
      channel_id: channel.id,
      sender_id: 'dr-martin',
      sender_name: 'Dr. Martin',
      content: 'Résultat tropo box 3 revenu négatif, on peut lever la surveillance.',
      is_urgent: false,
      read_by: ['demo-user', 'dr-martin'],
      created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: 'demo-2',
      channel_type: channel.type,
      channel_id: channel.id,
      sender_id: 'ide-sophie',
      sender_name: 'IDE Sophie',
      content: 'Bien reçu, je prépare la sortie. Ordonnance signée ?',
      is_urgent: false,
      read_by: ['demo-user', 'ide-sophie'],
      created_at: new Date(now.getTime() - 12 * 60000).toISOString(),
    },
    {
      id: 'demo-3',
      channel_type: channel.type,
      channel_id: channel.id,
      sender_id: 'dr-martin',
      sender_name: 'Dr. Martin',
      content: 'Oui ordonnance validée. Merci Sophie.',
      is_urgent: false,
      read_by: ['dr-martin'],
      created_at: new Date(now.getTime() - 10 * 60000).toISOString(),
    },
  ];

  if (channel.type === 'zone') {
    return [
      {
        id: 'demo-z1',
        channel_type: channel.type,
        channel_id: channel.id,
        sender_id: 'ioa-lucas',
        sender_name: 'IOA Lucas',
        content: `Arrivée trauma crânien sévère, GCS 8 — préparation déchocage.`,
        is_urgent: true,
        read_by: ['ioa-lucas'],
        created_at: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: 'demo-z2',
        channel_type: channel.type,
        channel_id: channel.id,
        sender_id: 'demo-user',
        sender_name: 'Vous',
        content: 'Reçu, j\'y vais. Appeler neuro de garde.',
        is_urgent: false,
        read_by: ['demo-user', 'ioa-lucas'],
        created_at: new Date(now.getTime() - 4 * 60000).toISOString(),
      },
    ];
  }

  return base;
}

// ── Exported Chat Sheet Trigger ────────────────────────────────────
interface ChatPanelProps {
  channels: ChatChannel[];
  defaultChannel?: ChatChannel;
  triggerClassName?: string;
  triggerLabel?: string;
  unreadTotal?: number;
}

export function ChatPanel({
  channels,
  defaultChannel,
  triggerClassName,
  triggerLabel = 'Chat',
  unreadTotal = 0,
}: ChatPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('relative gap-1.5', triggerClassName)}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">{triggerLabel}</span>
          {unreadTotal > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Messagerie équipe
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ChatContent channels={channels} defaultChannel={defaultChannel} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
