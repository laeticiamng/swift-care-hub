import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Attack pattern detection ──
const violationTracker = new Map<string, { count: number; firstSeen: number }>();
const ALERT_THRESHOLD = 10; // violations from same source
const ALERT_WINDOW_MS = 5 * 60_000; // 5 minutes

function detectAttackPattern(sourceKey: string): boolean {
  const now = Date.now();
  const entry = violationTracker.get(sourceKey);

  if (!entry || now - entry.firstSeen > ALERT_WINDOW_MS) {
    violationTracker.set(sourceKey, { count: 1, firstSeen: now });
    return false;
  }

  entry.count++;
  return entry.count >= ALERT_THRESHOLD;
}

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

    // Log the violation
    await supabase.from("audit_logs").insert({
      action: "csp_violation",
      resource_type: "security",
      details: {
        document_uri: documentUri,
        violated_directive: violatedDirective,
        blocked_uri: blockedUri,
        source_file: sourceFile,
        line_number: lineNumber,
        timestamp: new Date().toISOString(),
      },
    });

    // ── Attack pattern detection ──
    const sourceKey = `${blockedUri}|${violatedDirective}`;
    const isAttackPattern = detectAttackPattern(sourceKey);

    if (isAttackPattern) {
      // Log security alert
      await supabase.from("audit_logs").insert({
        action: "security_alert",
        resource_type: "security",
        details: {
          alert_type: "repeated_csp_violations",
          source: blockedUri,
          directive: violatedDirective,
          document: documentUri,
          violation_count: ALERT_THRESHOLD,
          window_minutes: ALERT_WINDOW_MS / 60_000,
          severity: "high",
          timestamp: new Date().toISOString(),
          message: `Repeated CSP violations detected: ${ALERT_THRESHOLD}+ from ${blockedUri} in ${ALERT_WINDOW_MS / 60_000}min`,
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
              text: `🚨 *Security Alert — UrgenceOS*\nRepeated CSP violations: ${ALERT_THRESHOLD}+ from \`${blockedUri}\`\nDirective: \`${violatedDirective}\`\nDocument: ${documentUri}`,
              // Discord-compatible format
              content: `🚨 **Security Alert — UrgenceOS**\nRepeated CSP violations: ${ALERT_THRESHOLD}+ from \`${blockedUri}\``,
            }),
          });
        } catch (webhookErr) {
          console.error("Webhook alert failed:", webhookErr);
        }
      }

      console.warn(`[SECURITY ALERT] Repeated CSP violations from ${blockedUri}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
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
