import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALERT_THRESHOLD = 10;
const ALERT_WINDOW_MINUTES = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const report = body["csp-report"] || body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const documentUri = report["document-uri"] || report.documentURL || "unknown";
    const violatedDirective = report["violated-directive"] || report.effectiveDirective || "unknown";
    const blockedUri = report["blocked-uri"] || report.blockedURL || "unknown";
    const sourceFile = report["source-file"] || report.sourceFile || null;
    const lineNumber = report["line-number"] || report.lineNumber || null;
    const sourceKey = `${blockedUri}|${violatedDirective}`;

    // Log the violation
    const { error: insertErr } = await supabase.from("audit_logs").insert({
      action: "csp_violation",
      resource_type: "security",
      details: {
        document_uri: documentUri,
        violated_directive: violatedDirective,
        blocked_uri: blockedUri,
        source_file: sourceFile,
        line_number: lineNumber,
        source_key: sourceKey,
        timestamp: new Date().toISOString(),
      },
    });

    if (insertErr) {
      console.error("Insert error:", insertErr);
    }

    // ── DB-based attack pattern detection ──
    const windowStart = new Date(Date.now() - ALERT_WINDOW_MINUTES * 60_000).toISOString();

    const { count: recentCount, error: countErr } = await supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("action", "csp_violation")
      .eq("resource_type", "security")
      .gte("created_at", windowStart);

    if (countErr) {
      console.error("Count error:", countErr);
    }

    const violationCount = recentCount ?? 0;

    if (violationCount >= ALERT_THRESHOLD) {
      // Check if we already fired an alert for this source_key recently (avoid spam)
      const { count: existingAlerts } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", "security_alert")
        .eq("resource_type", "security")
        .gte("created_at", windowStart);

      if ((existingAlerts ?? 0) === 0) {
        // First alert for this pattern in this window — fire it
        await supabase.from("audit_logs").insert({
          action: "security_alert",
          resource_type: "security",
          
          details: {
            alert_type: "repeated_csp_violations",
            source: blockedUri,
            directive: violatedDirective,
            document: documentUri,
            violation_count: violationCount,
            window_minutes: ALERT_WINDOW_MINUTES,
            severity: "high",
            timestamp: new Date().toISOString(),
            message: `Repeated CSP violations detected: ${violationCount}+ from ${blockedUri} in ${ALERT_WINDOW_MINUTES}min`,
          },
        });

        // Send webhook alert if configured
        const webhookUrl = Deno.env.get("SECURITY_WEBHOOK_URL");
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: `🚨 *Security Alert — UrgenceOS*\nRepeated CSP violations: ${violationCount}+ from \`${blockedUri}\`\nDirective: \`${violatedDirective}\`\nDocument: ${documentUri}`,
                content: `🚨 **Security Alert — UrgenceOS**\nRepeated CSP violations: ${violationCount}+ from \`${blockedUri}\`\nDirective: \`${violatedDirective}\``,
              }),
            });
            console.log(`[SECURITY] Webhook alert sent for ${sourceKey}`);
          } catch (webhookErr) {
            console.error("Webhook alert failed:", webhookErr);
          }
        } else {
          console.warn(`[SECURITY ALERT] No SECURITY_WEBHOOK_URL configured. Alert: ${violationCount}+ violations from ${blockedUri}`);
        }

        console.warn(`[SECURITY ALERT] Repeated CSP violations (${violationCount}) from ${blockedUri}`);
      }
    }

    return new Response(JSON.stringify({ ok: true, violation_count: violationCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("CSP report error:", e);
    return new Response(JSON.stringify({ error: "invalid report" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
