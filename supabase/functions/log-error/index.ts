import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("log-error");

Deno.serve(async (req) => {
  const end = log.start(req);
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    end(405);
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { source, message, stack, url, user_agent, function_name, metadata } = body;

    if (!message) {
      end(400);
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: { user } } = await userClient.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // Auth extraction is best-effort
      }
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: insertErr } = await adminClient.from("error_logs").insert({
      source: (source || "frontend").slice(0, 50),
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 5000) : null,
      url: url ? String(url).slice(0, 500) : null,
      user_agent: user_agent ? String(user_agent).slice(0, 500) : null,
      user_id: userId,
      function_name: function_name ? String(function_name).slice(0, 100) : null,
      metadata: metadata || {},
    });

    if (insertErr) {
      log.error("Insert failed", { error: insertErr.message });
      end(500);
      return new Response(JSON.stringify({ error: "Failed to log error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const windowStart = new Date(Date.now() - 5 * 60_000).toISOString();
    const { count } = await adminClient
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", windowStart);

    if ((count ?? 0) > 10) {
      const { count: alertCount } = await adminClient
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", "error_spike_alert")
        .gte("created_at", windowStart);

      if ((alertCount ?? 0) === 0) {
        await adminClient.from("audit_logs").insert({
          action: "error_spike_alert",
          resource_type: "security",
          details: {
            error_count: count,
            window_minutes: 5,
            severity: "high",
            latest_error: String(message).slice(0, 200),
            timestamp: new Date().toISOString(),
          },
        });
        log.warn("Error spike detected", { count });

        try {
          await fetch(`${Deno.env.get("SUPABASE_URL")!}/functions/v1/send-alert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
            },
            body: JSON.stringify({
              type: "error_spike",
              title: `Pic d'erreurs frontend — ${count} erreurs en 5 min`,
              details: `${count} erreurs détectées sur les 5 dernières minutes. Dernière erreur : "${String(message).slice(0, 200)}"`,
              severity: "high",
            }),
          });
        } catch (alertErr) {
          // Silent
        }
      }
    }

    log.info("Error logged", { source, function_name });
    end(200);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log.error("log-error failed", { error: String(e) });
    end(500);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
