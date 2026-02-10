/**
 * Audit Dashboard Page — M8 Quality & Traceability
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditDashboard } from '@/components/urgence/AuditDashboard';
import { SIH_QUALITY_INDICATORS, SIH_LAB_ALERTS } from '@/lib/sih-demo-data';

export default function AuditPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b px-4 py-3 shadow-sm bg-card/80 backdrop-blur-xl flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <span className="text-sm font-semibold">Urgence<span className="text-primary">OS</span></span>
        <span className="text-muted-foreground text-sm">— Module M8 Audit & Tracabilite</span>
      </div>

      <AuditDashboard
        indicators={SIH_QUALITY_INDICATORS}
        auditCount={1247}
        criticalAlertCount={SIH_LAB_ALERTS.filter(a => !a.acknowledged).length}
        pendingPrescriptions={3}
        averageResponseTime={187}
        systemStatus="operational"
      />
    </div>
  );
}
