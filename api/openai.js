export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY no configurada en el servidor"
    });
  }

  try {
    const body = req.body || {};
    const datos = body.datos ?? body.data ?? body.input;

    if (!datos) {
      return res.status(400).json({
        error: "Faltan los datos para el análisis"
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "developer",
            content:
              "Eres MatchIA, un analista de fútbol. Analiza únicamente los datos proporcionados. No inventes estadísticas. Entrega un análisis claro, prudente y útil para apoyar decisiones, dejando claro que ninguna predicción es garantía."
          },
          {
            role: "user",
            content:
              "Analiza estos datos del partido y devuelve: resumen, fortalezas y debilidades de ambos equipos, factores importantes, probabilidades estimadas de 1X2 si los datos permiten calcularlas y una conclusión. Datos:\\n" +
              JSON.stringify(datos)
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Error al consultar OpenAI"
      });
    }

    return res.status(200).json({
      ok: true,
      analysis: data.output_text || "",
      response_id: data.id || null
    });
  } catch (error) {
    console.error("Error en openai.js:", error);

    return res.status(500).json({
      error: "No se pudo completar el análisis con IA"
    });
  }
}
