import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { Activity, AlertTriangle, Bug, Clock, Server, Shield, ArrowLeft, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subHours, subDays } from "date-fns";
import { fr } from "date-fns/locale";

type TimeRange = "24h" | "7d" | "30d";

function getWindowStart(range: TimeRange): string {
  const now = new Date();
  if (range === "24h") return subHours(now, 24).toISOString();
  if (range === "7d") return subDays(now, 7).toISOString();
  return subDays(now, 30).toISOString();
}

export default function OpsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState<TimeRange>("24h");
  const [loading, setLoading] = useState(true);
  const [statusChecks, setStatusChecks] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [auditAlerts, setAuditAlerts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const windowStart = getWindowStart(range);

    const [checksRes, errorsRes, alertsRes, leadsRes, incidentsRes] = await Promise.all([
      supabase.from("status_checks").select("*").gte("checked_at", windowStart).order("checked_at", { ascending: true }).limit(1000),
      supabase.from("error_logs" as any).select("*").gte("created_at", windowStart).order("created_at", { ascending: false }).limit(200),
      supabase.from("audit_logs").select("*").in("action", ["error_spike_alert", "security_alert", "rate_limit_exceeded"]).gte("created_at", windowStart).order("created_at", { ascending: false }).limit(50),
      supabase.from("contact_leads").select("id, created_at, establishment").gte("created_at", windowStart).order("created_at", { ascending: false }).limit(50),
      supabase.from("incident_logs").select("*").order("started_at", { ascending: false }).limit(20),
    ]);

    setStatusChecks(checksRes.data || []);
    setErrorLogs((errorsRes.data as any[]) || []);
    setAuditAlerts(alertsRes.data || []);
    setLeads(leadsRes.data || []);
    setIncidents(incidentsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [range]);

  // ── Derived metrics ──

  const latencyByService = useMemo(() => {
    const grouped: Record<string, { times: number[]; name: string }> = {};
    for (const c of statusChecks) {
      if (!grouped[c.service_name]) grouped[c.service_name] = { times: [], name: c.service_name };
      if (c.response_time_ms) grouped[c.service_name].times.push(c.response_time_ms);
    }
    return Object.values(grouped).map(g => {
      const sorted = g.times.sort((a, b) => a - b);
      return {
        service: g.name,
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
        avg: sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
      };
    });
  }, [statusChecks]);

  const uptimeByService = useMemo(() => {
    const grouped: Record<string, { total: number; operational: number }> = {};
    for (const c of statusChecks) {
      if (!grouped[c.service_name]) grouped[c.service_name] = { total: 0, operational: 0 };
      grouped[c.service_name].total++;
      if (c.status === "operational") grouped[c.service_name].operational++;
    }
    return Object.entries(grouped).map(([name, data]) => ({
      service: name,
      uptime: data.total > 0 ? ((data.operational / data.total) * 100).toFixed(2) : "N/A",
      checks: data.total,
    }));
  }, [statusChecks]);

  const latencyTimeline = useMemo(() => {
    const points: { time: string; avg: number }[] = [];
    const bucketSize = range === "24h" ? 3600000 : range === "7d" ? 6 * 3600000 : 24 * 3600000;
    if (statusChecks.length === 0) return points;

    const start = new Date(statusChecks[0]?.checked_at).getTime();
    const end = Date.now();
    for (let t = start; t < end; t += bucketSize) {
      const bucketEnd = t + bucketSize;
      const inBucket = statusChecks.filter(c => {
        const ct = new Date(c.checked_at).getTime();
        return ct >= t && ct < bucketEnd && c.response_time_ms;
      });
      if (inBucket.length > 0) {
        const avg = Math.round(inBucket.reduce((s, c) => s + c.response_time_ms, 0) / inBucket.length);
        points.push({ time: format(new Date(t), range === "24h" ? "HH:mm" : "dd/MM", { locale: fr }), avg });
      }
    }
    return points;
  }, [statusChecks, range]);

  const errorTimeline = useMemo(() => {
    const bucketSize = range === "24h" ? 3600000 : range === "7d" ? 6 * 3600000 : 24 * 3600000;
    const buckets: Record<string, number> = {};

    for (const e of errorLogs) {
      const t = Math.floor(new Date(e.created_at).getTime() / bucketSize) * bucketSize;
      const label = format(new Date(t), range === "24h" ? "HH:mm" : "dd/MM", { locale: fr });
      buckets[label] = (buckets[label] || 0) + 1;
    }

    return Object.entries(buckets).map(([time, count]) => ({ time, count }));
  }, [errorLogs, range]);

  const errorsBySource = useMemo(() => {
    const grouped: Record<string, number> = {};
    for (const e of errorLogs) {
      const src = (e as any).source || "unknown";
      grouped[src] = (grouped[src] || 0) + 1;
    }
    return Object.entries(grouped).map(([source, count]) => ({ source, count }));
  }, [errorLogs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Observability Dashboard</h1>
            </div>
            <Badge variant="outline" className="text-xs font-mono">CTO</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> Services monitorés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uptimeByService.length}</div>
              <p className="text-xs text-muted-foreground">
                {uptimeByService.filter(s => parseFloat(s.uptime as string) >= 99).length} à 99%+
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Latence moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latencyByService.length > 0 ? Math.round(latencyByService.reduce((s, l) => s + l.avg, 0) / latencyByService.length) : "—"}
                <span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
              </div>
              <p className="text-xs text-muted-foreground">
                P95: {latencyByService.length > 0 ? Math.max(...latencyByService.map(l => l.p95)) : "—"} ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Bug className="h-3.5 w-3.5" /> Erreurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{errorLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                {errorsBySource.map(s => `${s.source}: ${s.count}`).join(", ") || "Aucune"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditAlerts.length}</div>
              <p className="text-xs text-muted-foreground">
                {incidents.filter(i => i.status !== "resolved").length} incidents ouverts
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="uptime" className="space-y-4">
          <TabsList>
            <TabsTrigger value="uptime">Uptime & Latence</TabsTrigger>
            <TabsTrigger value="errors">Erreurs</TabsTrigger>
            <TabsTrigger value="alerts">Alertes & Incidents</TabsTrigger>
            <TabsTrigger value="leads">Leads B2B</TabsTrigger>
          </TabsList>

          {/* ── Uptime & Latence ── */}
          <TabsContent value="uptime" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Uptime par service */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Uptime par service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uptimeByService.map(s => (
                      <div key={s.service} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parseFloat(s.uptime as string) >= 99.5 ? "bg-emerald-500" : parseFloat(s.uptime as string) >= 95 ? "bg-yellow-500" : "bg-destructive"}`} />
                          <span className="text-sm font-medium capitalize">{s.service}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{s.checks} checks</span>
                          <Badge variant={parseFloat(s.uptime as string) >= 99.5 ? "default" : "destructive"} className="font-mono text-xs">
                            {s.uptime}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {uptimeByService.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée sur cette période</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Latence par service */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Latence (P50 / P95 / P99)</CardTitle>
                </CardHeader>
                <CardContent>
                  {latencyByService.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={latencyByService}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="ms" />
                        <Tooltip />
                        <Bar dataKey="p50" fill="hsl(var(--primary))" name="P50" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="p95" fill="hsl(var(--primary) / 0.6)" name="P95" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="p99" fill="hsl(var(--primary) / 0.3)" name="P99" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground">Aucune donnée</p>}
                </CardContent>
              </Card>
            </div>

            {/* Latence timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Latence moyenne dans le temps</CardTitle>
              </CardHeader>
              <CardContent>
                {latencyTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={latencyTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} unit="ms" />
                      <Tooltip />
                      <Area type="monotone" dataKey="avg" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Latence moy." />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Pas assez de données</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Erreurs ── */}
          <TabsContent value="errors" className="space-y-4">
            {/* Error timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Erreurs dans le temps</CardTitle>
              </CardHeader>
              <CardContent>
                {errorTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={errorTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--destructive))" name="Erreurs" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Aucune erreur sur cette période 🎉</p>}
              </CardContent>
            </Card>

            {/* Error log table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dernières erreurs ({errorLogs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Source</th>
                        <th className="py-2 pr-3">Fonction</th>
                        <th className="py-2">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorLogs.slice(0, 50).map((e: any) => (
                        <tr key={e.id} className="border-b border-muted/30 hover:bg-muted/20">
                          <td className="py-1.5 pr-3 whitespace-nowrap font-mono text-muted-foreground">
                            {format(new Date(e.created_at), "dd/MM HH:mm:ss", { locale: fr })}
                          </td>
                          <td className="py-1.5 pr-3">
                            <Badge variant={e.source === "frontend" ? "outline" : "secondary"} className="text-[10px]">
                              {e.source}
                            </Badge>
                          </td>
                          <td className="py-1.5 pr-3 font-mono text-muted-foreground">{e.function_name || "—"}</td>
                          <td className="py-1.5 max-w-[400px] truncate">{e.message}</td>
                        </tr>
                      ))}
                      {errorLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">Aucune erreur enregistrée</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Alertes & Incidents ── */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Alertes de sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditAlerts.map(a => (
                      <div key={a.id} className="p-2 rounded-lg bg-muted/30 border text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="destructive" className="text-[10px]">{a.action}</Badge>
                          <span className="text-muted-foreground font-mono">
                            {format(new Date(a.created_at), "dd/MM HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-muted-foreground truncate">
                          {typeof a.details === "object" ? (a.details as any)?.message || JSON.stringify(a.details).slice(0, 100) : String(a.details)}
                        </p>
                      </div>
                    ))}
                    {auditAlerts.length === 0 && <p className="text-sm text-muted-foreground">Aucune alerte</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Incidents récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {incidents.map(i => (
                      <div key={i.id} className="p-2 rounded-lg bg-muted/30 border text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${i.status === "resolved" ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"}`} />
                            <span className="font-medium">{i.title}</span>
                          </div>
                          <Badge variant={i.status === "resolved" ? "outline" : "destructive"} className="text-[10px]">
                            {i.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{i.component}</span>
                          <span>·</span>
                          <span>{format(new Date(i.started_at), "dd/MM HH:mm", { locale: fr })}</span>
                          {i.resolved_at && <><span>→</span><span>{format(new Date(i.resolved_at), "HH:mm", { locale: fr })}</span></>}
                        </div>
                      </div>
                    ))}
                    {incidents.length === 0 && <p className="text-sm text-muted-foreground">Aucun incident</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Leads B2B ── */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Leads B2B récents ({leads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leads.map(l => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-xs">
                      <span className="font-medium">{l.establishment}</span>
                      <span className="text-muted-foreground font-mono">
                        {format(new Date(l.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </span>
                    </div>
                  ))}
                  {leads.length === 0 && <p className="text-sm text-muted-foreground">Aucun lead sur cette période</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
