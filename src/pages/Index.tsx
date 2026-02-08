import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Chargement...</div>;
  return <Navigate to={user ? "/select-role" : "/login"} replace />;
};

export default Index;
