export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "ID de partido inválido" });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada" });
  }

  // Caché compartida para proteger el límite gratuito de consultas.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const headers = { "x-apisports-key": apiKey };

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("id", id);
    url.searchParams.set("timezone", "America/Argentina/Buenos_Aires");

    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      console.error("API-Football match error:", response.status, data.errors);
      return res.status(502).json({
        error: "API-Football no pudo entregar el partido",
        detalle: data.errors || response.status
      });
    }

    const item = (data.response || [])[0];
    if (!item) return res.status(404).json({ error: "Partido no encontrado" });

    const estado = item.fixture?.status?.short || "NS";
    const estadosEnJuego = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
    let estadisticas = [];

    // Las estadísticas se consultan solo durante el partido.
    // Si fallan o todavía no están publicadas, el marcador sigue funcionando.
    if (estadosEnJuego.includes(estado)) {
      try {
        const statsUrl = new URL("https://v3.football.api-sports.io/fixtures/statistics");
        statsUrl.searchParams.set("fixture", id);
        const statsResponse = await fetch(statsUrl.toString(), { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          estadisticas = (statsData.response || []).map(equipo => ({
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
        }
      } catch (statsError) {
        console.warn("MatchIA: estadísticas temporalmente no disponibles", statsError);
      }
    }

    return res.status(200).json({
      id: item.fixture?.id,
      estado,
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
      estadisticas,
      fecha: item.fixture?.date || null
    });
  } catch (error) {
    console.error("MatchIA match:", error);
    return res.status(502).json({ error: "No se pudo conectar con API-Football" });
  }
}
