import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { Stethoscope, ClipboardList, Syringe, Heart, UserPlus, LogOut, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import MFASetup from '@/components/urgence/MFASetup';
import MFAChallenge from '@/components/urgence/MFAChallenge';

const roleConfig: { role: AppRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { role: 'medecin', label: 'Médecin', description: 'Board panoramique & dossiers patients', icon: Stethoscope, color: 'text-medical-info' },
  { role: 'ioa', label: 'IOA', description: 'File d\'attente & tri des patients', icon: ClipboardList, color: 'text-medical-warning' },
  { role: 'ide', label: 'IDE', description: 'Pancarte unifiée & administrations', icon: Syringe, color: 'text-medical-success' },
  { role: 'as', label: 'Aide-soignant', description: 'Constantes & surveillance', icon: Heart, color: 'text-medical-critical' },
  { role: 'secretaire', label: 'Secrétaire', description: 'Admissions & accueil', icon: UserPlus, color: 'text-muted-foreground' },
];

const roleRedirects: Record<AppRole, string> = {
  medecin: '/board',
  ioa: '/ioa-queue',
  ide: '/board',
  as: '/as',
  secretaire: '/accueil',
};

export default function RoleSelector() {
  const { selectRole, availableRoles, role, signOut, user, loading, mfaRequired, mfaEnrollRequired, completeMFA, completeMFAEnroll } = useAuth();
  const navigate = useNavigate();
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!loading && role && availableRoles.length > 0) {
      navigate(roleRedirects[role], { replace: true });
    }
  }, [role, loading, availableRoles]);

  const handleSelect = async (selectedRole: AppRole) => {
    if (availableRoles.length === 0 && user) {
      // New users cannot self-assign roles — must be assigned by an administrator
      toast.error('Aucun rôle attribué à votre compte. Contactez un administrateur pour obtenir un accès.');
      return;
    }
    await selectRole(selectedRole);
    navigate(roleRedirects[selectedRole]);
  };

  const isNewUser = !loading && availableRoles.length === 0;
  const visibleRoles = roleConfig.filter(r => availableRoles.includes(r.role));

  // MFA screens for medical roles
  if (mfaEnrollRequired) {
    return <MFASetup onComplete={completeMFAEnroll} />;
  }
  if (mfaRequired) {
    return <MFAChallenge onVerified={completeMFA} onCancel={signOut} />;
  }

  if (!loading && role) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-success/5" />
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-medical-success/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center mb-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Urgence<span className="text-primary">OS</span></span>
        </div>
        <h1 className="text-2xl font-bold">
          {isNewUser ? 'En attente d\'attribution' : 'Sélection du rôle'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isNewUser ? 'Un administrateur doit vous attribuer un rôle pour accéder à la plateforme' : 'Choisissez votre profil pour cette session'}
        </p>
        {user && <p className="text-sm text-muted-foreground mt-2">{user.email}</p>}
      </div>

      {isNewUser ? (
        <div className="relative z-10 max-w-md w-full text-center p-8 rounded-2xl border bg-card shadow-sm animate-in fade-in duration-300">
          <AlertTriangle className="h-10 w-10 text-medical-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Aucun rôle attribué</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Votre compte n'a pas encore de rôle assigné. Contactez un administrateur pour obtenir l'accès à la plateforme.
          </p>
          <p className="text-xs text-muted-foreground">
            Email de contact : <a href="mailto:contact@urgenceos.fr" className="text-primary hover:underline">contact@urgenceos.fr</a>
          </p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl w-full">
          {visibleRoles.map(({ role: r, label, description, icon: Icon, color }, index) => (
            <button
              key={r}
              onClick={() => handleSelect(r)}
              disabled={assigning}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-xl border bg-card shadow-sm',
                'hover:shadow-xl hover:border-primary/30 hover:scale-[1.05] transition-all duration-300 active:scale-[0.98]',
                'touch-target min-h-[140px]',
                'animate-in fade-in slide-in-from-bottom-4',
                assigning && 'opacity-50 pointer-events-none',
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className={cn('h-8 w-8', color)} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">{label}</p>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Button variant="ghost" onClick={signOut} className="mt-8 text-muted-foreground relative z-10">
        <LogOut className="h-4 w-4 mr-2" /> Déconnexion
      </Button>
    </div>
  );
}
