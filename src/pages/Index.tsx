import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return <Navigate to={user ? "/select-role" : "/login"} replace />;
};

export default Index;
