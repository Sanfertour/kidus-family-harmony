import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_KEY') || "");

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { image } = await req.json()
    if (!image) throw new Error("No image data received");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Actúa como 'KidUs AI', experto en logística de tribus familiares.
      Analiza esta imagen y extrae la información en formato JSON.
      
      CATEGORÍAS: school, meal, health, activity, other.

      INSTRUCCIONES:
      - Si es un MENÚ escolar: Sugiere una CENA equilibrada en 'description'.
      - Si es EXCURSIÓN: Detalla equipamiento en 'description'.
      - Usa términos: 'Tribu', 'Nido', 'Peques'.

      RESPONDE SOLO JSON:
      {
        "title": "Título corto",
        "start_time": "ISO_TIMESTAMP (hoy si no hay)",
        "end_time": "ISO_TIMESTAMP (+1h)",
        "category": "categoría",
        "description": "Notas, equipo o cena sugerida",
        "is_private": false
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image, mimeType: "image/jpeg" } }
    ]);

    const data = JSON.parse(result.response.text().replace(/```json/g, "").replace(/```/g, "").trim());

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
