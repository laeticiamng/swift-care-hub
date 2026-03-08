import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("status-monitor");

const SERVICES = [
  { name: 'app', url: Deno.env.get('SUPABASE_URL')!, label: 'Application Web (PWA)' },
  { name: 'api', url: `${Deno.env.get('SUPABASE_URL')!}/rest/v1/`, label: 'API & Backend' },
  { name: 'auth', url: `${Deno.env.get('SUPABASE_URL')!}/auth/v1/health`, label: 'Authentification & RBAC' },
  { name: 'realtime', url: `${Deno.env.get('SUPABASE_URL')!}/realtime/v1/`, label: 'Temps réel (Realtime)' },
]

async function checkService(service: { name: string; url: string; label: string }) {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(service.url, {
      signal: controller.signal,
      headers: { 'apikey': Deno.env.get('SUPABASE_ANON_KEY')! },
    })
    clearTimeout(timeout)
    const responseTime = Date.now() - start
    const status = resp.ok || resp.status === 401 || resp.status === 403 || resp.status === 404
      ? 'operational'
      : (resp.status >= 500 ? 'down' : 'degraded')
    return { service_name: service.name, status, response_time_ms: responseTime, details: { http_status: resp.status, label: service.label } }
  } catch (err) {
    return { service_name: service.name, status: 'down', response_time_ms: Date.now() - start, details: { error: String(err), label: service.label } }
  }
}

Deno.serve(async (req) => {
  const end = log.start(req);
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    end(204);
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (req.method === 'GET') {
    const { data: checks } = await supabase.from('status_checks').select('*').order('checked_at', { ascending: false }).limit(20)
    const { data: incidents } = await supabase.from('incident_logs').select('*').order('started_at', { ascending: false }).limit(20)

    const latestByService: Record<string, any> = {}
    for (const c of checks || []) {
      if (!latestByService[c.service_name]) latestByService[c.service_name] = c
    }

    const services = Object.values(latestByService)
    const allOperational = services.every((s: any) => s.status === 'operational')
    const anyDown = services.some((s: any) => s.status === 'down')
    const overall = anyDown ? 'down' : allOperational ? 'operational' : 'degraded'

    log.info("Status check GET", { overall, service_count: services.length });
    end(200);
    return new Response(JSON.stringify({ status: overall, services: latestByService, incidents: incidents || [], checked_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    })
  }

  if (req.method === 'POST') {
    // Verify internal caller — accept token from Authorization header OR apikey header
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");
    const apikeyToken = req.headers.get("apikey");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const validTokens = [serviceKey, anonKey].filter(Boolean);
    const providedToken = bearerToken || apikeyToken;
    if (!providedToken || !validTokens.includes(providedToken)) {
      log.warn("POST auth failed", { hasBearerToken: !!bearerToken, hasApikeyToken: !!apikeyToken });
      end(403);
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results = await Promise.all(SERVICES.map(checkService))

    const dbStart = Date.now()
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1)
    results.push({ service_name: 'database', status: dbError ? 'down' : 'operational', response_time_ms: Date.now() - dbStart, details: { error: dbError?.message || null, label: 'Base de données' } })

    const { error: insertError } = await supabase.from('status_checks').insert(results.map(r => ({
      service_name: r.service_name, status: r.status, response_time_ms: r.response_time_ms, details: r.details,
    })))

    if (insertError) {
      log.error("Status insert failed", { error: insertError.message });
      end(500);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const downServices = results.filter(r => r.status === 'down')
    for (const ds of downServices) {
      const { data: existing } = await supabase.from('incident_logs').select('id').eq('component', ds.service_name).in('status', ['investigating', 'identified', 'monitoring']).limit(1)
      if (!existing || existing.length === 0) {
        const incidentTitle = `${(ds.details as any)?.label || ds.service_name} — Indisponibilité détectée`;
        await supabase.from('incident_logs').insert({ component: ds.service_name, title: incidentTitle, description: `Le service ${ds.service_name} ne répond pas. Investigation en cours.`, status: 'investigating', severity: 'major' })
        log.warn("Incident created", { service: ds.service_name });
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')!}/functions/v1/send-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}` },
            body: JSON.stringify({ type: 'service_down', title: incidentTitle, details: `Le service "${ds.service_name}" ne répond pas (temps de réponse : ${ds.response_time_ms}ms). Une investigation automatique a été ouverte.`, severity: 'critical' }),
          });
        } catch (alertErr) { log.error("Failed to send alert email", { error: String(alertErr) }); }
      }
    }

    const operationalServices = results.filter(r => r.status === 'operational')
    for (const os of operationalServices) {
      const { data: openIncidents } = await supabase.from('incident_logs').select('id').eq('component', os.service_name).in('status', ['investigating', 'identified', 'monitoring'])
      if (openIncidents && openIncidents.length > 0) {
        for (const incident of openIncidents) {
          await supabase.from('incident_logs').update({ status: 'resolved', resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', incident.id)
        }
        log.info("Incident resolved", { service: os.service_name });
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')!}/functions/v1/send-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}` },
            body: JSON.stringify({ type: 'service_recovered', title: `${os.service_name} — Service rétabli`, details: `Le service "${os.service_name}" est de nouveau opérationnel (temps de réponse : ${os.response_time_ms}ms).`, severity: 'warning' }),
          });
        } catch (alertErr) { log.error("Failed to send recovery email", { error: String(alertErr) }); }
      }
    }

    const downCount = downServices.length;
    log.info("Health check completed", { total: results.length, down: downCount });
    end(200, { checked: results.length, down: downCount });
    return new Response(JSON.stringify({ success: true, results, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  end(405);
  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
})
