export default async function handler(req, res) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key no configurada"
      });
    }

    const fecha =
      req.query.date ||
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(fecha)}`,
      {
        headers: {
          "x-apisports-key": apiKey
        },
        cache: "no-store"
      }
    );

    const data = await response.json();

    if (!response.ok || data.errors?.access) {
      return res.status(response.status || 503).json({
        error: "API-Football no disponible",
        detalle: data.errors || null
      });
    }

    const partidos = (data.response || []).map(item => ({
      id: item.fixture?.id ?? null,

      fecha: item.fixture?.date ?? null,

      estado: item.fixture?.status?.short ?? null,

      minuto: item.fixture?.status?.elapsed ?? 0,

      local: item.teams?.home?.name ?? "Local",

      visitante: item.teams?.away?.name ?? "Visitante",

      logoLocal: item.teams?.home?.logo ?? null,

      logoVisitante: item.teams?.away?.logo ?? null,

      liga: item.league?.name ?? "Liga",

      pais: item.league?.country ?? "",

      logoLiga: item.league?.logo ?? null,

      golesLocal: item.goals?.home ?? 0,

      golesVisitante: item.goals?.away ?? 0
    }));

    return res.status(200).json({
      fecha,
      total: partidos.length,
      partidos
    });

  } catch (error) {
    console.error("Error en fixtures:", error);

    return res.status(500).json({
      error: "No se pudieron obtener los partidos"
    });
  }
}
