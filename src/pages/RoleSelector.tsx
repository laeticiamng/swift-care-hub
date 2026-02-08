import { useNavigate } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { Stethoscope, ClipboardList, Syringe, Heart, UserPlus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const roleConfig: { role: AppRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { role: 'medecin', label: 'Médecin', description: 'Board panoramique & dossiers patients', icon: Stethoscope, color: 'text-medical-info' },
  { role: 'ioa', label: 'IOA', description: 'Tri & orientation des patients', icon: ClipboardList, color: 'text-medical-warning' },
  { role: 'ide', label: 'IDE', description: 'Pancarte unifiée & administrations', icon: Syringe, color: 'text-medical-success' },
  { role: 'as', label: 'Aide-soignant', description: 'Constantes & surveillance', icon: Heart, color: 'text-medical-critical' },
  { role: 'secretaire', label: 'Secrétaire', description: 'Admissions & accueil', icon: UserPlus, color: 'text-muted-foreground' },
];

const roleRedirects: Record<AppRole, string> = {
  medecin: '/board',
  ioa: '/triage',
  ide: '/board',
  as: '/as',
  secretaire: '/accueil',
};

export default function RoleSelector() {
  const { selectRole, availableRoles, signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSelect = async (role: AppRole) => {
    await selectRole(role);
    navigate(roleRedirects[role]);
  };

  const visibleRoles = availableRoles.length > 0
    ? roleConfig.filter(r => availableRoles.includes(r.role))
    : roleConfig;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Sélection du rôle</h1>
        <p className="text-muted-foreground mt-1">Choisissez votre profil pour cette session</p>
        {user && <p className="text-sm text-muted-foreground mt-2">{user.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
        {visibleRoles.map(({ role, label, description, icon: Icon, color }) => (
          <button
            key={role}
            onClick={() => handleSelect(role)}
            className={cn(
              'flex flex-col items-center gap-3 p-6 rounded-xl border bg-card shadow-sm',
              'hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-[0.98]',
              'touch-target min-h-[140px]',
            )}
          >
            <Icon className={cn('h-10 w-10', color)} />
            <div className="text-center">
              <p className="font-semibold text-lg">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <Button variant="ghost" onClick={signOut} className="mt-8 text-muted-foreground">
        <LogOut className="h-4 w-4 mr-2" /> Déconnexion
      </Button>
    </div>
  );
}
