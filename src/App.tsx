import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import PolitiqueConfidentialitePage from "./pages/PolitiqueConfidentialitePage";
import CGUPage from "./pages/CGUPage";
import RoleSelector from "./pages/RoleSelector";
import BoardPage from "./pages/BoardPage";
import PatientDossierPage from "./pages/PatientDossierPage";
import TriagePage from "./pages/TriagePage";
import PancartePage from "./pages/PancartePage";
import AideSoignantPage from "./pages/AideSoignantPage";
import AccueilPage from "./pages/AccueilPage";
import IOAQueuePage from "./pages/IOAQueuePage";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "./components/urgence/CookieConsent";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!role) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/select-role" replace /> : <LoginPage />} />
      <Route path="/select-role" element={<ProtectedRoute><RoleSelector /></ProtectedRoute>} />
      <Route path="/board" element={<ProtectedRoute><RoleGuard><BoardPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/patient/:encounterId" element={<ProtectedRoute><RoleGuard><PatientDossierPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/triage" element={<ProtectedRoute><RoleGuard><TriagePage /></RoleGuard></ProtectedRoute>} />
      <Route path="/pancarte/:encounterId" element={<ProtectedRoute><RoleGuard><PancartePage /></RoleGuard></ProtectedRoute>} />
      <Route path="/as" element={<ProtectedRoute><RoleGuard><AideSoignantPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/accueil" element={<ProtectedRoute><RoleGuard><AccueilPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/ioa-queue" element={<ProtectedRoute><RoleGuard><IOAQueuePage /></RoleGuard></ProtectedRoute>} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
      <Route path="/cgu" element={<CGUPage />} />
      <Route path="/" element={user ? <Navigate to="/select-role" replace /> : <LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
