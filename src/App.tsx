import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth, type AppRole } from "@/contexts/AuthContext";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import { Loader2 } from "lucide-react";
import { CookieConsent } from "./components/urgence/CookieConsent";
import { MedicalDisclaimer } from "./components/urgence/MedicalDisclaimer";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ── Lazy-loaded pages (code splitting) ──
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const MentionsLegalesPage = lazy(() => import("./pages/MentionsLegalesPage"));
const PolitiqueConfidentialitePage = lazy(() => import("./pages/PolitiqueConfidentialitePage"));
const CGUPage = lazy(() => import("./pages/CGUPage"));
const RoleSelector = lazy(() => import("./pages/RoleSelector"));
const BoardPage = lazy(() => import("./pages/BoardPage"));
const PatientDossierPage = lazy(() => import("./pages/PatientDossierPage"));
const TriagePage = lazy(() => import("./pages/TriagePage"));
const PancartePage = lazy(() => import("./pages/PancartePage"));
const AideSoignantPage = lazy(() => import("./pages/AideSoignantPage"));
const AccueilPage = lazy(() => import("./pages/AccueilPage"));
const IOAQueuePage = lazy(() => import("./pages/IOAQueuePage"));
const RecapPage = lazy(() => import("./pages/RecapPage"));
const InteropPage = lazy(() => import("./pages/InteropPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const DemoLivePage = lazy(() => import("./pages/DemoLivePage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const GardePage = lazy(() => import("./pages/GardePage"));
const AuditPage = lazy(() => import("./pages/AuditPage"));
const SIHValidationPage = lazy(() => import("./pages/SIHValidationPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const B2BPage = lazy(() => import("./pages/B2BPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ── Loading fallback ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground" role="status" aria-label="Chargement">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

// ── Query client with medical-appropriate staleTime ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000, // 10s — medical context needs fresher data
      retry: 2,
      refetchOnWindowFocus: true, // Re-fetch when clinician returns to tab
    },
    mutations: {
      retry: 1,
    },
  },
});

// ── Auth guard — redirects unauthenticated users ──
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  if (isDemoMode) return <>{children}</>;
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Granular role guard — checks specific allowed roles ──
function RoleGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { role, loading } = useAuth();
  const { isDemoMode, demoRole } = useDemo();

  if (isDemoMode && demoRole) {
    if (allowedRoles && !allowedRoles.includes(demoRole)) {
      return <Navigate to="/select-role" replace />;
    }
    return <>{children}</>;
  }

  if (loading) return <PageLoader />;
  if (!role) return <Navigate to="/select-role" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
}

// ── All 5 roles ──
const ALL_CLINICAL: AppRole[] = ['medecin', 'ioa', 'ide', 'as', 'secretaire'];
const CLINICAL_CORE: AppRole[] = ['medecin', 'ioa', 'ide'];
const PRESCRIBERS: AppRole[] = ['medecin'];
const TRIAGE_ROLES: AppRole[] = ['medecin', 'ioa'];
const IDE_ROLES: AppRole[] = ['ide'];
const AS_ROLES: AppRole[] = ['as', 'ide'];
const SECRETAIRE_ROLES: AppRole[] = ['secretaire'];

function AppRoutes() {
  const { user } = useAuth();
  const { isDemoMode } = useDemo();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/select-role" replace /> : <LoginPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/demo/live" element={<DemoLivePage />} />
        <Route path="/sih-validation" element={<SIHValidationPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/tarifs" element={<PricingPage />} />
        <Route path="/pricing" element={<Navigate to="/tarifs" replace />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/b2b" element={<B2BPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/securite" element={<SecurityPage />} />
        <Route path="/security" element={<Navigate to="/securite" replace />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
        <Route path="/cgu" element={<CGUPage />} />
        <Route path="/landing" element={user ? <Navigate to="/select-role" replace /> : <LandingPage />} />
        <Route path="/" element={user && !isDemoMode ? <Navigate to="/select-role" replace /> : <LandingPage />} />

        {/* Role selection */}
        <Route path="/select-role" element={<ProtectedRoute><RoleSelector /></ProtectedRoute>} />

        {/* Board — all clinical staff */}
        <Route path="/board" element={<ProtectedRoute><RoleGuard allowedRoles={ALL_CLINICAL}><BoardPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/board" replace />} />
        <Route path="/app" element={<Navigate to="/board" replace />} />

        {/* Patient dossier — clinical roles */}
        <Route path="/patient/:encounterId" element={<ProtectedRoute><RoleGuard allowedRoles={CLINICAL_CORE}><PatientDossierPage /></RoleGuard></ProtectedRoute>} />

        {/* Triage — IOA + medecin */}
        <Route path="/triage" element={<ProtectedRoute><RoleGuard allowedRoles={TRIAGE_ROLES}><TriagePage /></RoleGuard></ProtectedRoute>} />
        <Route path="/triage/:encounterId" element={<ProtectedRoute><RoleGuard allowedRoles={TRIAGE_ROLES}><TriagePage /></RoleGuard></ProtectedRoute>} />

        {/* Pancarte IDE */}
        <Route path="/pancarte/:encounterId" element={<ProtectedRoute><RoleGuard allowedRoles={IDE_ROLES}><PancartePage /></RoleGuard></ProtectedRoute>} />

        {/* Aide-soignant — constantes */}
        <Route path="/as" element={<ProtectedRoute><RoleGuard allowedRoles={AS_ROLES}><AideSoignantPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/constantes" element={<ProtectedRoute><RoleGuard allowedRoles={AS_ROLES}><AideSoignantPage /></RoleGuard></ProtectedRoute>} />

        {/* Accueil / admission — secretaire */}
        <Route path="/accueil" element={<ProtectedRoute><RoleGuard allowedRoles={SECRETAIRE_ROLES}><AccueilPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/admission" element={<ProtectedRoute><RoleGuard allowedRoles={SECRETAIRE_ROLES}><AccueilPage /></RoleGuard></ProtectedRoute>} />

        {/* IOA queue */}
        <Route path="/ioa-queue" element={<ProtectedRoute><RoleGuard allowedRoles={TRIAGE_ROLES}><IOAQueuePage /></RoleGuard></ProtectedRoute>} />

        {/* Prescriptions — medecin only */}
        <Route path="/prescriptions" element={<ProtectedRoute><RoleGuard allowedRoles={PRESCRIBERS}><BoardPage /></RoleGuard></ProtectedRoute>} />

        {/* Recap / Interop / Garde / Audit — clinical */}
        <Route path="/recap/:encounterId" element={<ProtectedRoute><RoleGuard allowedRoles={CLINICAL_CORE}><RecapPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/interop" element={<ProtectedRoute><RoleGuard allowedRoles={PRESCRIBERS}><InteropPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/garde" element={<ProtectedRoute><RoleGuard allowedRoles={CLINICAL_CORE}><GardePage /></RoleGuard></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><RoleGuard allowedRoles={PRESCRIBERS}><AuditPage /></RoleGuard></ProtectedRoute>} />

        {/* Statistics — médecin + IOA */}
        <Route path="/statistics" element={<ProtectedRoute><RoleGuard allowedRoles={CLINICAL_CORE}><StatisticsPage /></RoleGuard></ProtectedRoute>} />
        <Route path="/statistiques" element={<Navigate to="/statistics" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <DemoProvider>
                <AppRoutes />
                <MedicalDisclaimer />
                <CookieConsent />
              </DemoProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
