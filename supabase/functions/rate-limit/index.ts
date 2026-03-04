import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limit store (per isolate lifecycle)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Action-specific limits
const ACTION_LIMITS: Record<string, { max: number; windowMs: number }> = {
  prescription: { max: 20, windowMs: 60_000 },
  triage: { max: 10, windowMs: 60_000 },
  administration: { max: 30, windowMs: 60_000 },
  login: { max: 5, windowMs: 60_000 },
  default: { max: 100, windowMs: 60_000 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Parse request
    const body = await req.json();
    const action = body.action || "default";
    const limits = ACTION_LIMITS[action] || ACTION_LIMITS.default;

    // Check rate limit
    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + limits.windowMs });
      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: limits.max - 1,
          resetIn: limits.windowMs,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(limits.max),
            "X-RateLimit-Remaining": String(limits.max - 1),
          },
        },
      );
    }

    entry.count++;
    const remaining = Math.max(0, limits.max - entry.count);
    const resetIn = entry.resetAt - now;

    if (entry.count > limits.max) {
      // Log rate limit violation
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await adminClient.from("audit_logs").insert({
        user_id: userId,
        action: "rate_limit_exceeded",
        resource_type: "security",
        details: {
          limited_action: action,
          count: entry.count,
          max: limits.max,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          resetIn,
          error: `Rate limit exceeded for ${action}. Retry in ${Math.ceil(resetIn / 1000)}s`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Limit": String(limits.max),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({ allowed: true, remaining, resetIn }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(limits.max),
          "X-RateLimit-Remaining": String(remaining),
        },
      },
    );
  } catch (e) {
    console.error("Rate limit error:", e);
    // Fail open — don't block if rate limiter errors
    return new Response(
      JSON.stringify({ allowed: true, error: "Rate limiter unavailable" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
