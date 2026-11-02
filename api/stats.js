export default async function handler(req, res) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada" });
  }

  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "ID de partido inválido" });
  }

  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=15");

  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures/statistics?fixture=" + encodeURIComponent(id),
      { headers: { "x-apisports-key": apiKey } }
    );
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      console.error("API-Football stats error:", response.status, data.errors);
      return res.status(502).json({
        error: "API-Football no pudo entregar las estadísticas",
        codigo: response.status
      });
    }

    const equipos = Array.isArray(data.response) ? data.response : [];
    if (!equipos.length) {
      return res.status(200).json({
        estadisticas: [],
        estado: "sin_publicar",
        mensaje: "API-Football todavía no publicó estadísticas para este partido o liga."
      });
    }

    const resultado = equipos.map(equipo => ({
      equipo: {
        id: equipo.team?.id ?? null,
        nombre: equipo.team?.name ?? null,
        logo: equipo.team?.logo ?? null
      },
      estadisticas: (equipo.statistics || []).map(stat => ({
        tipo: stat.type ?? null,
        valor: stat.value ?? null
      }))
    }));

    return res.status(200).json({
      estadisticas: resultado,
      estado: "disponibles",
      mensaje: ""
    });
  } catch (error) {
    console.error("Error en stats.js:", error);
    return res.status(502).json({
      error: "No se pudo conectar con API-Football para consultar las estadísticas"
    });
  }
}
