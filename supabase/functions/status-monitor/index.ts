import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Services to monitor
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
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
      },
    })
    clearTimeout(timeout)
    const responseTime = Date.now() - start
    const status = resp.ok ? 'operational' : (resp.status >= 500 ? 'down' : 'degraded')
    return {
      service_name: service.name,
      status,
      response_time_ms: responseTime,
      details: { http_status: resp.status, label: service.label },
    }
  } catch (err) {
    return {
      service_name: service.name,
      status: 'down',
      response_time_ms: Date.now() - start,
      details: { error: String(err), label: service.label },
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // GET = return current status as JSON (public status.json)
  if (req.method === 'GET') {
    // Fetch latest check per service
    const { data: checks } = await supabase
      .from('status_checks')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(20)

    // Fetch active/recent incidents
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20)

    // Dedupe to latest per service
    const latestByService: Record<string, any> = {}
    for (const c of checks || []) {
      if (!latestByService[c.service_name]) latestByService[c.service_name] = c
    }

    const services = Object.values(latestByService)
    const allOperational = services.every((s: any) => s.status === 'operational')
    const anyDown = services.some((s: any) => s.status === 'down')

    const overall = anyDown ? 'down' : allOperational ? 'operational' : 'degraded'

    return new Response(JSON.stringify({
      status: overall,
      services: latestByService,
      incidents: incidents || [],
      checked_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    })
  }

  // POST = run health checks and store results
  if (req.method === 'POST') {
    // Optional: verify a shared secret for webhook security
    const authHeader = req.headers.get('authorization')
    const expectedKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (authHeader !== `Bearer ${expectedKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results = await Promise.all(SERVICES.map(checkService))

    // DB check via a simple query
    const dbStart = Date.now()
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1)
    results.push({
      service_name: 'database',
      status: dbError ? 'down' : 'operational',
      response_time_ms: Date.now() - dbStart,
      details: { error: dbError?.message || null, label: 'Base de données' },
    })

    // Insert all results
    const { error: insertError } = await supabase
      .from('status_checks')
      .insert(results.map(r => ({
        service_name: r.service_name,
        status: r.status,
        response_time_ms: r.response_time_ms,
        details: r.details,
      })))

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Auto-create incident if any service is down
    const downServices = results.filter(r => r.status === 'down')
    for (const ds of downServices) {
      // Check if there's already an open incident for this component
      const { data: existing } = await supabase
        .from('incident_logs')
        .select('id')
        .eq('component', ds.service_name)
        .in('status', ['investigating', 'identified', 'monitoring'])
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.from('incident_logs').insert({
          component: ds.service_name,
          title: `${(ds.details as any)?.label || ds.service_name} — Indisponibilité détectée`,
          description: `Le service ${ds.service_name} ne répond pas. Investigation en cours.`,
          status: 'investigating',
          severity: 'major',
        })
      }
    }

    // Auto-resolve incidents if service is back up
    const operationalServices = results.filter(r => r.status === 'operational')
    for (const os of operationalServices) {
      const { data: openIncidents } = await supabase
        .from('incident_logs')
        .select('id')
        .eq('component', os.service_name)
        .in('status', ['investigating', 'identified', 'monitoring'])

      if (openIncidents && openIncidents.length > 0) {
        for (const incident of openIncidents) {
          await supabase.from('incident_logs').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', incident.id)
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders })
})
