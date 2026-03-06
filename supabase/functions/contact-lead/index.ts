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
    const { lastName, firstName, email, establishment, roleFunction, passagesVolume, message } = body;

    // Basic validation
    if (!lastName || !firstName || !email || !establishment || !roleFunction) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to insert (bypasses RLS)
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

    const { error } = await supabaseAdmin.from("contact_leads").insert(leadData);

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erreur serveur" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log lead details for notification visibility in edge function logs
    // TODO: Intégrer un vrai service email (Resend, SendGrid) avant production clinique
    console.log("=== NOUVEAU LEAD B2B ===");
    console.log(`Nom: ${leadData.last_name} ${leadData.first_name}`);
    console.log(`Email: ${leadData.email}`);
    console.log(`Établissement: ${leadData.establishment}`);
    console.log(`Fonction: ${leadData.role_function}`);
    console.log(`Volume passages: ${leadData.passages_volume || 'Non renseigné'}`);
    console.log(`Message: ${leadData.message || 'Aucun'}`);
    console.log("========================");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
