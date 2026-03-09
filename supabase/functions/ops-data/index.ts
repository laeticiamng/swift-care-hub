import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("ops-data");

Deno.serve(async (req) => {
  const end = log.start(req);
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    end(405);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Authenticate caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    end(401);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify user and role
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    log.warn("Auth failed", { error: userError?.message });
    end(401);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check medecin role using service client
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "medecin")
    .limit(1)
    .maybeSingle();

  if (!roleData) {
    log.warn("Non-medecin access attempt", { user_id: user.id });
    end(403);
    return new Response(JSON.stringify({ error: "Forbidden — medecin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const windowStart = body.windowStart || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [errorsRes, leadsRes] = await Promise.all([
      adminClient
        .from("error_logs")
        .select("*")
        .gte("created_at", windowStart)
        .order("created_at", { ascending: false })
        .limit(200),
      adminClient
        .from("contact_leads")
        .select("id, created_at, establishment")
        .gte("created_at", windowStart)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    log.info("Ops data fetched", {
      errors: errorsRes.data?.length ?? 0,
      leads: leadsRes.data?.length ?? 0,
    });
    end(200);

    return new Response(
      JSON.stringify({
        errorLogs: errorsRes.data || [],
        leads: leadsRes.data || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    log.error("Unexpected error", { error: String(err) });
    end(500);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
