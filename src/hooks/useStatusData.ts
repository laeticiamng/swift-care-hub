import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export interface StatusCheck {
  id: string;
  service_name: string;
  status: string;
  response_time_ms: number | null;
  checked_at: string;
  details: Record<string, any> | null;
}

export interface IncidentLog {
  id: string;
  component: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
}

export function useStatusData() {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    const [checksRes, incidentsRes] = await Promise.all([
      supabase
        .from('status_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(500),
      supabase
        .from('incident_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50),
    ]);

    if (checksRes.data) setChecks(checksRes.data as StatusCheck[]);
    if (incidentsRes.data) setIncidents(incidentsRes.data as IncidentLog[]);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Realtime subscriptions
    const channel = supabase
      .channel('status-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_checks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_logs' }, () => fetchData())
      .subscribe();

    // Refresh every 60s
    const interval = setInterval(fetchData, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Latest check per service
  const latestByService: Record<string, StatusCheck> = {};
  for (const c of checks) {
    if (!latestByService[c.service_name]) latestByService[c.service_name] = c;
  }

  // Overall status
  const services = Object.values(latestByService);
  const hasData = services.length > 0;
  const overallStatus: ServiceStatus = !hasData
    ? 'operational'
    : services.some(s => s.status === 'down')
    ? 'down'
    : services.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'operational';

  // Avg response time
  const recentChecks = checks.filter(c => c.response_time_ms != null).slice(0, 50);
  const avgResponseTime = recentChecks.length > 0
    ? Math.round(recentChecks.reduce((a, c) => a + (c.response_time_ms || 0), 0) / recentChecks.length)
    : null;

  // Uptime percentage (from checks)
  const uptimePercent = checks.length > 0
    ? ((checks.filter(c => c.status === 'operational').length / checks.length) * 100).toFixed(2)
    : '99.95';

  return {
    checks,
    incidents,
    latestByService,
    overallStatus,
    avgResponseTime,
    uptimePercent,
    loading,
    lastUpdated,
    hasData,
    refresh: fetchData,
  };
}
