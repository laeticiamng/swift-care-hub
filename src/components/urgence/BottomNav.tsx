import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Stethoscope, MessageCircle, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { path: '/board', label: 'Board', icon: LayoutGrid },
  { path: '/triage', label: 'Triage', icon: Stethoscope },
  { path: '/select-role', label: 'Profil', icon: User },
];

export function BottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  if (!isMobile) return null;

  // Only show on internal app pages, not landing/login
  const internalPaths = ['/board', '/triage', '/patient', '/pancarte', '/as', '/accueil', '/select-role', '/ioa-queue', '/garde', '/statistics', '/audit', '/recap', '/interop'];
  const isInternal = internalPaths.some(p => location.pathname.startsWith(p));
  if (!isInternal) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg pb-safe">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-target transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.path === '/board' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-4 min-w-[16px] rounded-full bg-medical-critical text-medical-critical-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
