// MatchIA - ANÁLISIS IA
// Conecta el motor de datos reales con OpenAI sin exponer la API key en el APK.

async function obtenerAnalisisIA(datos) {
  if (!datos) return "";

  const response = await fetch("/api/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ datos })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "No se pudo generar el análisis con IA.");
  }

  return data.analysis || "";
}

// Mantiene compatibilidad con el código existente.
function obtenerAnalisis(datos) {
  return datos || {};
}

window.MatchIAAnalisis = {
  obtenerAnalisisIA
};
