import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("manage-roles");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  const end = log.start(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log.warn("Missing auth header");
      end(401);
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is a medecin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      log.warn("Auth failed", { error: userError?.message });
      end(401);
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller has medecin role
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "medecin")
      .maybeSingle();

    if (!callerRole) {
      log.warn("Forbidden: non-medecin caller", { user_id: user.id });
      end(403);
      return new Response(JSON.stringify({ error: "Accès réservé aux médecins" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = req.method;

    // GET: list all users with their roles
    if (method === "GET") {
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      const { data: roles } = await adminClient
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map<string, string>();
      for (const r of roles || []) {
        roleMap.set(r.user_id, r.role);
      }

      const users = (profiles || []).map((p) => ({
        ...p,
        role: roleMap.get(p.id) || null,
      }));

      log.info("Listed users", { count: users.length });
      end(200);
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: assign or update role
    if (method === "POST") {
      const { user_id, role } = await req.json();

      if (!user_id || !role) {
        end(400);
        return new Response(JSON.stringify({ error: "user_id et role requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validRoles = ["medecin", "ioa", "ide", "as", "secretaire"];
      if (!validRoles.includes(role)) {
        log.warn("Invalid role attempted", { role, by: user.id });
        end(400);
        return new Response(JSON.stringify({ error: "Rôle invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert: delete existing then insert
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      const { error: insertError } = await adminClient
        .from("user_roles")
        .insert({ user_id, role });

      if (insertError) {
        log.error("Role insert failed", { error: insertError.message });
        end(500);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Audit log
      await adminClient.from("audit_logs").insert({
        user_id: user.id,
        action: "role_assigned",
        resource_type: "user_roles",
        resource_id: user_id,
        details: { assigned_role: role, assigned_by: user.id },
      });

      log.info("Role assigned", { target_user: user_id, role, by: user.id });
      end(200);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    end(405);
    return new Response(JSON.stringify({ error: "Méthode non supportée" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log.error("Internal error", { error: String(err) });
    end(500);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
