import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, patientData } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "synthesis") {
      systemPrompt = `Tu es un assistant médical IA spécialisé en médecine d'urgence. Tu génères des synthèses cliniques structurées à partir des données du dossier patient.

RÈGLES STRICTES:
- Tu NE poses PAS de diagnostic. Tu RÉSUMES les données disponibles.
- Tu signales les anomalies et les examens manquants.
- Tu utilises le vocabulaire médical français standard.
- Tu structures ta réponse en sections: SYNTHÈSE, POINTS D'ATTENTION, EXAMENS MANQUANTS, PROCHAINES ÉTAPES.
- Sois concis et factuel. Maximum 300 mots.
- Mentionne les sources (résultats bio, constantes, etc.) avec les horaires.`;

      userPrompt = `Génère une synthèse clinique structurée pour ce patient aux urgences:

${JSON.stringify(patientData, null, 2)}`;
    } else if (action === "crh") {
      systemPrompt = `Tu es un assistant médical IA qui génère des comptes-rendus d'hospitalisation (CRH) aux urgences. 

RÈGLES STRICTES:
- Format HTML propre avec les sections standard: Motif, Antécédents, Examen clinique, Examens complémentaires, Diagnostic, Traitement, Orientation.
- Style professionnel médical français.
- Utilise UNIQUEMENT les données fournies, n'invente rien.
- Le CRH doit être prêt à être signé par le médecin urgentiste.
- Inclus les résultats biologiques et d'imagerie s'ils sont disponibles.
- HTML avec classes CSS simples pour l'impression.`;

      userPrompt = `Génère un CRH HTML complet à partir de ces données patient:

${JSON.stringify(patientData, null, 2)}`;
    } else if (action === "prescription_suggest") {
      systemPrompt = `Tu es un assistant médical IA spécialisé en prescriptions d'urgence.

RÈGLES STRICTES:
- Tu SUGGÈRES des prescriptions basées sur le motif, les constantes et le terrain du patient.
- Tu NE remplaces PAS le médecin. Tes suggestions doivent être validées.
- Retourne un JSON structuré avec les prescriptions suggérées.
- Respecte les contre-indications (allergies, interactions).
- Priorise la sécurité patient.`;

      userPrompt = `Suggère des prescriptions adaptées pour ce patient:

${JSON.stringify(patientData, null, 2)}`;
    } else {
      return new Response(JSON.stringify({ error: "Action inconnue" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-clinical error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
