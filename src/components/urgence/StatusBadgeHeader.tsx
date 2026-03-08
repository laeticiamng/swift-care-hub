import { Link } from 'react-router-dom';
import { useStatusData, type ServiceStatus } from '@/hooks/useStatusData';

function dotColor(status: ServiceStatus) {
  switch (status) {
    case 'operational': return 'bg-emerald-500';
    case 'degraded': return 'bg-amber-500';
    case 'down': return 'bg-red-500';
    case 'maintenance': return 'bg-blue-500';
  }
}

export function StatusBadgeHeader() {
  const { overallStatus } = useStatusData();

  return (
    <Link
      to="/statut"
      className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border bg-card hover:bg-accent transition-colors"
      title="Statut des services"
    >
      <span className={`h-2 w-2 rounded-full ${dotColor(overallStatus)} animate-pulse`} />
      <span className="text-muted-foreground">
        {overallStatus === 'operational' ? 'Opérationnel' : overallStatus === 'degraded' ? 'Dégradé' : 'Incident'}
      </span>
    </Link>
  );
}
