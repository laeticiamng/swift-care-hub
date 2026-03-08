import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("csp-report");

const ALERT_THRESHOLD = 10;
const ALERT_WINDOW_MINUTES = 5;

Deno.serve(async (req) => {
  const end = log.start(req);
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    end(204);
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

    log.info("CSP violation received", { blocked_uri: blockedUri, directive: violatedDirective, document: documentUri });

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
      log.error("Insert error", { error: insertErr.message });
    }

    const windowStart = new Date(Date.now() - ALERT_WINDOW_MINUTES * 60_000).toISOString();

    const { count: recentCount, error: countErr } = await supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("action", "csp_violation")
      .eq("resource_type", "security")
      .gte("created_at", windowStart);

    if (countErr) {
      log.error("Count error", { error: countErr.message });
    }

    const violationCount = recentCount ?? 0;

    if (violationCount >= ALERT_THRESHOLD) {
      const { count: existingAlerts } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", "security_alert")
        .eq("resource_type", "security")
        .gte("created_at", windowStart);

      if ((existingAlerts ?? 0) === 0) {
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
            log.info("Webhook alert sent", { source_key: sourceKey });
          } catch (webhookErr) {
            log.error("Webhook alert failed", { error: String(webhookErr) });
          }
        } else {
          log.warn("No SECURITY_WEBHOOK_URL configured", { violation_count: violationCount });
        }

        log.warn("Security alert fired", { violation_count: violationCount, blocked_uri: blockedUri });
      }
    }

    end(200, { violation_count: violationCount });
    return new Response(JSON.stringify({ ok: true, violation_count: violationCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log.error("CSP report error", { error: String(e) });
    end(400);
    return new Response(JSON.stringify({ error: "invalid report" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
