import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    await supabase.from("audit_logs").insert({
      action: "csp_violation",
      resource_type: "security",
      details: {
        document_uri: report["document-uri"] || report.documentURL,
        violated_directive: report["violated-directive"] || report.effectiveDirective,
        blocked_uri: report["blocked-uri"] || report.blockedURL,
        source_file: report["source-file"] || report.sourceFile,
        line_number: report["line-number"] || report.lineNumber,
        timestamp: new Date().toISOString(),
      },
    });

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
