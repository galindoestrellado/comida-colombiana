import { createClient } from "npm:@supabase/supabase-js@2";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

type ChatbotRequest = {
  message: string;
  history?: ChatMessage[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openAiApiKey) {
      throw new Error("Missing OPENAI_API_KEY secret");
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const body = (await req.json()) as ChatbotRequest;

    if (!body.message?.trim()) {
      return jsonResponse(
        {
          answer: "Escríbeme una pregunta y te ayudo 😊",
        },
        200,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: settings, error: settingsError } = await supabase
      .from("business_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settingsError) {
      throw settingsError;
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("name, category, description, price, is_available")
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (productsError) {
      throw productsError;
    }

    const menuText = products
      .map(
        (product) =>
          `- ${product.name} (${product.category}): ${Number(
            product.price,
          ).toFixed(2)} €. ${product.description}`,
      )
      .join("\n");

    const historyText = (body.history || [])
      .slice(-8)
      .map((message) => {
        const role = message.sender === "user" ? "Cliente" : "Asistente";
        return `${role}: ${message.text}`;
      })
      .join("\n");

    const systemPrompt = `
Eres el asistente de IA de "${settings.business_name}", una tienda de comida colombiana por encargo.

DATOS DEL NEGOCIO:
- Nombre: ${settings.business_name}
- Recogida: ${settings.pickup_location}
- WhatsApp negocio: ${settings.whatsapp_phone}
- Bizum: ${settings.bizum_phone}
- Aviso pedidos: ${settings.order_notice}

MENÚ DISPONIBLE:
${menuText}

REGLAS IMPORTANTES:
1. Responde en español, tono cercano, natural y útil.
2. No inventes platos, precios, horarios, ubicaciones ni servicios que no estén en los datos.
3. Puedes recomendar platos según número de personas, hambre, presupuesto, si quieren compartir, etc.
4. Si preguntan por alérgenos, embarazo, intolerancias o salud, no asegures nada: recomienda confirmarlo por WhatsApp antes de pagar.
5. Explica que el pedido se confirma por Bizum y que no se prepara hasta confirmar el pago.
6. Si piden domicilio, explica que de momento el flujo está orientado a recogida.
7. Si preguntan cómo pedir, explica: elegir platos, carrito, datos, generar pedido, Bizum y WhatsApp.
8. Si no tienes información suficiente, dilo claro y recomienda contactar por WhatsApp.
9. No digas que eres una FAQ. Eres un asistente de IA del negocio.
10. No crees pedidos tú todavía. Solo orienta y recomienda.
`.trim();

    const userPrompt = `
HISTORIAL RECIENTE:
${historyText || "Sin historial previo."}

PREGUNTA ACTUAL DEL CLIENTE:
${body.message}
`.trim();

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 450,
          temperature: 0.4,
        }),
      },
    );

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      throw new Error(`OpenAI error: ${errorText}`);
    }

    const openAiData = await openAiResponse.json();

    const answer =
      openAiData?.choices?.[0]?.message?.content?.trim() ||
      "No he podido generar respuesta ahora mismo. Prueba otra vez en unos segundos.";

    return jsonResponse(
      {
        answer,
      },
      200,
    );
  } catch (error) {
    console.error("Chatbot function error:", error);

    return jsonResponse(
      {
        answer:
          "Ahora mismo no puedo responder con IA. Prueba de nuevo en unos segundos o contacta por WhatsApp.",
        debug:
          error instanceof Error
            ? error.message
            : "Unknown chatbot function error",
      },
      500,
    );
  }
});

function jsonResponse(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

