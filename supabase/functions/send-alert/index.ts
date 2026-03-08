import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("send-alert");

interface AlertPayload {
  type: "service_down" | "error_spike" | "service_recovered";
  title: string;
  details: string;
  severity: "critical" | "high" | "warning";
  timestamp?: string;
}

const ALERT_RECIPIENTS = ["support@urgenceos.fr"];

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

  // ── Internal caller verification ──
  // Only accept calls from other edge functions using service role key
  const authHeader = req.headers.get("Authorization");
  const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  // Accept service_role key OR anon key from internal edge function calls
  const token = authHeader?.replace("Bearer ", "");
  if (!token || (token !== expectedKey && token !== anonKey)) {
    log.warn("Unauthorized send-alert attempt");
    end(403);
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    log.error("RESEND_API_KEY not configured");
    end(500);
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { type, title, details, severity, timestamp } = payload;

    if (!title || !details) {
      end(400);
      return new Response(JSON.stringify({ error: "title and details required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ts = timestamp || new Date().toISOString();
    const severityColor = severity === "critical" ? "#dc2626" : severity === "high" ? "#ea580c" : "#ca8a04";
    const severityLabel = severity === "critical" ? "🔴 CRITIQUE" : severity === "high" ? "🟠 ÉLEVÉ" : "🟡 AVERTISSEMENT";
    const typeLabel =
      type === "service_down" ? "Service indisponible" :
      type === "error_spike" ? "Pic d'erreurs détecté" :
      type === "service_recovered" ? "Service rétabli" : type;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: ${severityColor}; padding: 16px 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 18px;">${severityLabel} — ${typeLabel}</h1>
    </div>
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 16px; color: #1e293b;">${title}</h2>
      <p style="margin: 0 0 16px; font-size: 14px; color: #475569; line-height: 1.6;">${details}</p>
      <table style="width: 100%; font-size: 13px; color: #64748b;">
        <tr><td style="padding: 4px 0;"><strong>Horodatage :</strong></td><td>${ts}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Sévérité :</strong></td><td>${severity}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Type :</strong></td><td>${type}</td></tr>
      </table>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        <a href="https://flow-pulse-assist.lovable.app/ops" style="display: inline-block; padding: 10px 20px; background: ${severityColor}; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          Voir le dashboard Ops
        </a>
      </div>
    </div>
    <div style="padding: 12px 24px; background: #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
      UrgenceOS Monitoring — Alerte automatique
    </div>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "UrgenceOS Alerts <alerts@emotionscare.com>",
        to: ALERT_RECIPIENTS,
        subject: `[${severity.toUpperCase()}] ${title}`,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      log.error("Resend API error", { status: resendRes.status, body: errBody });
      end(502);
      return new Response(JSON.stringify({ error: "Email delivery failed", detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendData = await resendRes.json();
    log.info("Alert email sent", { type, severity, emailId: resendData.id });
    end(200);
    return new Response(JSON.stringify({ ok: true, emailId: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log.error("send-alert failed", { error: String(e) });
    end(500);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
