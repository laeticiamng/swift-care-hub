import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { CyberSecurityFooter } from '@/components/urgence/CyberSecurityFooter';
import { FlowDashboard } from '@/components/urgence/FlowDashboard';
import { AITriagePanel } from '@/components/urgence/AITriagePanel';
import { SAMUPanel } from '@/components/urgence/SAMUPanel';
import { QualityMetrics } from '@/components/urgence/QualityMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n/I18nContext';
import { PageMeta } from '@/components/seo/JsonLd';
import { LayoutDashboard, Brain, Siren, Target } from 'lucide-react';

export default function FlowDashboardPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="UrgenceOS — Dashboard temps réel & Triage IA"
        description="Tableau de bord temps réel, triage IA Manchester, intégration SAMU et indicateurs qualité pour les urgences hospitalières."
        canonical="https://urgenceos.fr/flow"
      />
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="flow" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto">
            <TabsTrigger value="flow" className="gap-1.5 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.flow.title}</span>
              <span className="sm:hidden">Flow</span>
            </TabsTrigger>
            <TabsTrigger value="triage" className="gap-1.5 text-xs">
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Triage IA</span>
              <span className="sm:hidden">Triage</span>
            </TabsTrigger>
            <TabsTrigger value="samu" className="gap-1.5 text-xs">
              <Siren className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SAMU</span>
              <span className="sm:hidden">SAMU</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.quality.title}</span>
              <span className="sm:hidden">KPIs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flow">
            <FlowDashboard />
          </TabsContent>
          <TabsContent value="triage">
            <AITriagePanel />
          </TabsContent>
          <TabsContent value="samu">
            <SAMUPanel />
          </TabsContent>
          <TabsContent value="quality">
            <QualityMetrics />
          </TabsContent>
        </Tabs>
      </main>

      <CyberSecurityFooter />
      <FooterSection />
    </div>
  );
}
