import { createLogger } from "../_shared/logger.ts";

const log = createLogger("ai-clinical");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  const end = log.start(req);

  if (req.method === "OPTIONS") {
    end(204);
    return new Response(null, { headers: corsHeaders });
  }

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
- Tu SUGGÈRES des prescriptions basées sur le motif, les constantes, le terrain et les résultats du patient.
- Tu NE remplaces PAS le médecin. Tes suggestions doivent être validées.
- Respecte les contre-indications (allergies, interactions).
- Priorise la sécurité patient.
- Structure ta réponse en Markdown avec pour chaque suggestion:
  ## Catégorie (ex: Traitement, Bilan biologique, Imagerie, Surveillance)
  - **Nom** : posologie, voie, fréquence
  - *Justification* : raison clinique
  - ⚠️ Précaution : si applicable (allergie, interaction, terrain)
- Maximum 8 suggestions, classées par priorité.
- Mentionne les examens complémentaires manquants si pertinents.`;

      userPrompt = `Suggère des prescriptions adaptées pour ce patient aux urgences:

${JSON.stringify(patientData, null, 2)}`;
    } else {
      log.warn("Unknown action", { action });
      end(400);
      return new Response(JSON.stringify({ error: "Action inconnue" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log.info("AI request", { action });

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
        log.warn("AI rate limited");
        end(429);
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        log.warn("AI credits exhausted");
        end(402);
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      log.error("AI gateway error", { status: response.status, body: t.slice(0, 200) });
      end(500);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log.info("AI stream started", { action });
    end(200, { action, streaming: true });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    log.error("ai-clinical error", { error: e instanceof Error ? e.message : String(e) });
    end(500);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
