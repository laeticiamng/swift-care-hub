import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, Users, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: AppRole | null;
}

const ROLE_LABELS: Record<AppRole, string> = {
  medecin: 'Médecin',
  ioa: 'IOA',
  ide: 'IDE',
  as: 'Aide-soignant',
  secretaire: 'Secrétaire',
};

const ROLE_COLORS: Record<AppRole, string> = {
  medecin: 'bg-primary text-primary-foreground',
  ioa: 'bg-medical-warning/20 text-medical-warning',
  ide: 'bg-medical-success/20 text-medical-success',
  as: 'bg-secondary text-secondary-foreground',
  secretaire: 'bg-muted text-muted-foreground',
};

export default function AdminRolesPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('manage-roles', {
      method: 'GET',
    });
    if (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      setLoading(false);
      return;
    }
    setUsers(data.users || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdating(userId);
    const { error } = await supabase.functions.invoke('manage-roles', {
      method: 'POST',
      body: { user_id: userId, role: newRole },
    });
    if (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } else {
      toast.success('Rôle mis à jour avec succès');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setUpdating(null);
  };

  if (role !== 'medecin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-medical-warning mx-auto" />
          <h1 className="text-xl font-bold">Accès restreint</h1>
          <p className="text-muted-foreground">Cette page est réservée aux médecins.</p>
          <Button onClick={() => navigate('/board')}>Retour au board</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-lg px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/board')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Administration des rôles</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Utilisateurs inscrits</h2>
            <Badge variant="outline" className="ml-auto">{users.length}</Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Aucun utilisateur inscrit.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>

                  {u.role && (
                    <Badge className={`shrink-0 ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  )}

                  <div className="shrink-0 w-40">
                    <Select
                      value={u.role || ''}
                      onValueChange={(val) => handleRoleChange(u.id, val as AppRole)}
                      disabled={updating === u.id || u.id === user?.id}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Attribuer un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {updating === u.id && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                  {updating !== u.id && u.role && <CheckCircle className="h-4 w-4 text-medical-success shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Seuls les médecins peuvent attribuer et modifier les rôles. Chaque modification est tracée dans le journal d'audit.
          </p>
        </div>
      </div>
    </div>
  );
}
