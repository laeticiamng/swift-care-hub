import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const log = createLogger("contact-lead");

async function sendLeadNotification(leadData: Record<string, string | null>) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    log.warn("RESEND_API_KEY not configured — skipping email notification");
    return;
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Swift Care Hub <leads@swiftcarehub.com>",
        to: ["contact@emotionscare.com"],
        subject: `🏥 Nouveau lead B2B — ${leadData.establishment}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#1a1a2e;border-bottom:2px solid #0ea5e9;padding-bottom:12px">Nouveau lead Swift Care Hub</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr><td style="padding:8px 0;color:#666;width:140px">Nom</td><td style="padding:8px 0;font-weight:600">${leadData.last_name} ${leadData.first_name}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${leadData.email}">${leadData.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666">Établissement</td><td style="padding:8px 0;font-weight:600">${leadData.establishment}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Fonction</td><td style="padding:8px 0">${leadData.role_function}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Volume passages</td><td style="padding:8px 0">${leadData.passages_volume || "Non renseigné"}</td></tr>
            </table>
            ${leadData.message ? `<div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px"><strong>Message :</strong><br/>${leadData.message}</div>` : ""}
            <p style="margin-top:24px;color:#94a3b8;font-size:12px">Envoyé automatiquement par Swift Care Hub — ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
          </div>
        `,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      log.error("Resend error", { status: resp.status, body: err.slice(0, 200) });
    } else {
      log.info("Email notification sent");
    }
  } catch (err) {
    log.error("Email send failed", { error: String(err) });
  }
}

Deno.serve(async (req) => {
  const end = log.start(req);
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { lastName, firstName, email, establishment, roleFunction, passagesVolume, message } = body;

    if (!lastName || !firstName || !email || !establishment || !roleFunction) {
      end(400);
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      end(400);
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const leadData = {
      last_name: lastName.trim().substring(0, 200),
      first_name: firstName.trim().substring(0, 200),
      email: email.trim().toLowerCase().substring(0, 255),
      establishment: establishment.trim().substring(0, 300),
      role_function: roleFunction.trim().substring(0, 200),
      passages_volume: passagesVolume?.trim().substring(0, 100) || null,
      message: message?.trim().substring(0, 2000) || null,
    };

    const { data: recentLead } = await supabaseAdmin
      .from("contact_leads")
      .select("id")
      .eq("email", leadData.email)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle();

    if (recentLead) {
      log.warn("Duplicate lead attempt", { email: leadData.email });
      end(429);
      return new Response(JSON.stringify({ error: "Demande déjà envoyée. Réessayez dans 24h." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabaseAdmin.from("contact_leads").insert(leadData);

    if (error) {
      log.error("Insert error", { error: error.message });
      end(500);
      return new Response(JSON.stringify({ error: "Erreur serveur" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log.info("Lead created", { establishment: leadData.establishment });
    await sendLeadNotification(leadData);

    end(200);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const corsHeaders = getCorsHeaders(req);
    log.error("Unexpected error", { error: String(err) });
    end(500);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
