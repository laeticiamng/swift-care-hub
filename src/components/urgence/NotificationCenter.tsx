import { Bell, BellRing, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRequestPermission: () => void;
}

const TYPE_STYLES: Record<string, { icon: string; bg: string }> = {
  critical_result: { icon: '🚨', bg: 'border-l-medical-critical bg-medical-critical/5' },
  patient_assigned: { icon: '👤', bg: 'border-l-primary bg-primary/5' },
  lab_alert: { icon: '🧪', bg: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/10' },
  info: { icon: 'ℹ️', bg: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10' },
};

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRequestPermission,
}: NotificationCenterProps) {
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" onClick={onRequestPermission}>
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-amber-500 animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center bg-medical-critical text-white text-[10px] animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onMarkAllAsRead}>
              <CheckCheck className="h-3 w-3 mr-1" /> Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'px-4 py-3 border-l-2 transition-colors cursor-pointer hover:bg-accent/50',
                      style.bg,
                      notif.read && 'opacity-60'
                    )}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (notif.encounterId) {
                        navigate(`/patient/${notif.encounterId}`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium', !notif.read && 'font-semibold')}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
