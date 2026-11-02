export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "ID de partido inválido" });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada" });
  }

  // Datos en vivo: como máximo una actualización por minuto en caché compartida.
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("id", id);
    url.searchParams.set("timezone", "America/Argentina/Buenos_Aires");

    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey }
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      console.error("API-Football match error:", response.status, data.errors);
      return res.status(502).json({ error: "API-Football no pudo entregar el partido", detalle: data.errors || response.status });
    }

    const item = (data.response || [])[0];
    if (!item) return res.status(404).json({ error: "Partido no encontrado" });

    return res.status(200).json({
      id: item.fixture?.id,
      estado: item.fixture?.status?.short || "NS",
      minuto: item.fixture?.status?.elapsed ?? null,
      local: {
        id: item.teams?.home?.id ?? null,
        nombre: item.teams?.home?.name || "Local",
        logo: item.teams?.home?.logo || null
      },
      visitante: {
        id: item.teams?.away?.id ?? null,
        nombre: item.teams?.away?.name || "Visitante",
        logo: item.teams?.away?.logo || null
      },
      liga: {
        id: item.league?.id ?? null,
        nombre: item.league?.name || "Liga",
        pais: item.league?.country || ""
      },
      marcador: {
        local: item.goals?.home ?? 0,
        visitante: item.goals?.away ?? 0
      },
      estadisticas: [],
      fecha: item.fixture?.date || null
    });
  } catch (error) {
    console.error("MatchIA match:", error);
    return res.status(502).json({ error: "No se pudo conectar con API-Football" });
  }
}
