import { Users, UserPlus, ClipboardList, Activity, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BoardEmptyStateProps {
  role: string | null;
  isDemoMode?: boolean;
  hasFilter?: boolean;
}

export function BoardEmptyState({ role, isDemoMode, hasFilter }: BoardEmptyStateProps) {
  const navigate = useNavigate();

  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Aucun patient dans votre liste</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Aucun patient ne vous est actuellement assigné. Désactivez le filtre « Mes patients » pour voir l'ensemble du service.
          </p>
        </div>
      </div>
    );
  }

  const configs: Record<string, { icon: typeof Users; title: string; desc: string; cta?: string; action?: () => void }> = {
    ioa: {
      icon: ClipboardList,
      title: 'Aucun patient en attente de tri',
      desc: 'Tous les patients ont été triés ou aucun patient n\'est enregistré. Enregistrez un nouveau patient à son arrivée.',
      cta: 'Enregistrer un patient',
      action: () => navigate('/triage'),
    },
    medecin: {
      icon: Activity,
      title: 'Aucun patient en cours',
      desc: 'Il n\'y a actuellement aucun patient actif dans le service. Les nouveaux patients apparaîtront automatiquement après le tri IOA.',
      cta: 'Nouveau patient',
      action: () => navigate('/triage'),
    },
    ide: {
      icon: Inbox,
      title: 'Aucun patient à prendre en charge',
      desc: 'Aucun patient n\'est actuellement présent dans le service. Les patients apparaîtront ici dès leur arrivée et leur tri.',
    },
  };

  const config = configs[role || ''] || {
    icon: Users,
    title: 'Aucun patient en cours',
    desc: 'Le service est actuellement vide. Les patients apparaîtront automatiquement à leur arrivée.',
  };

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{config.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          {config.desc}
        </p>
      </div>
      {config.cta && config.action && !isDemoMode && (
        <Button onClick={config.action} className="gap-2 mt-2">
          <UserPlus className="h-4 w-4" />
          {config.cta}
        </Button>
      )}
    </div>
  );
}
