import { createLogger } from "../_shared/logger.ts";

const log = createLogger("healthz");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VERSION = "1.0.0";
const REGION = Deno.env.get("DENO_REGION") || "unknown";

Deno.serve(async (req) => {
  const end = log.start(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    end(405);
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  end(200);
  return new Response(
    JSON.stringify({
      status: "ok",
      version: VERSION,
      region: REGION,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
    }
  );
});
