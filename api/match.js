export default async function handler(req, res) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    const id = req.query.id;

    if (!apiKey) {
      return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada" });
    }
    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({ error: "Falta un ID válido del partido" });
    }

    const headers = { "x-apisports-key": apiKey };
    const base = "https://v3.football.api-sports.io";

    const fixtureResponse = await fetch(
      `${base}/fixtures?id=${encodeURIComponent(id)}`,
      { headers, cache: "no-store" }
    );
    const fixtureData = await fixtureResponse.json();

    if (!fixtureResponse.ok || (fixtureData.errors && Object.keys(fixtureData.errors).length)) {
      console.error("API-Football match error:", fixtureData.errors || fixtureResponse.status);
      return res.status(fixtureResponse.status || 502).json({
        error: "API-Football no pudo consultar el partido",
        detalle: fixtureData.errors || null
      });
    }

    const fixture = fixtureData.response?.[0];
    if (!fixture) {
      return res.status(404).json({ error: "No se encontró el partido en API-Football" });
    }

    let estadisticas = [];
    try {
      const statsResponse = await fetch(
        `${base}/fixtures/statistics?fixture=${encodeURIComponent(id)}`,
        { headers, cache: "no-store" }
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        estadisticas = (statsData.response || []).map(team => ({
          equipo: {
            id: team.team?.id ?? null,
            nombre: team.team?.name ?? null,
            logo: team.team?.logo ?? null
          },
          estadisticas: (team.statistics || []).map(stat => ({
            tipo: stat.type ?? null,
            valor: stat.value ?? null
          }))
        }));
      }
    } catch (error) {
      console.warn("API-Football statistics no disponibles:", error);
    }

    const local = fixture.teams?.home || {};
    const visitante = fixture.teams?.away || {};
    const liga = fixture.league || {};

    // El plan gratuito puede no incluir clasificaciones ni forma histórica.
    // Devolvemos estructuras vacías para conservar compatibilidad con MatchIA.
    return res.status(200).json({
      id: fixture.fixture?.id ?? id,
      fecha: fixture.fixture?.date ?? null,
      estado: fixture.fixture?.status?.short ?? null,
      minuto: fixture.fixture?.status?.elapsed ?? 0,
      estadio: fixture.fixture?.venue?.name ?? null,
      arbitro: fixture.fixture?.referee ?? null,
      liga: {
        id: liga.id ?? null,
        nombre: liga.name ?? null,
        pais: liga.country ?? null,
        temporada: liga.season ?? null
      },
      local: {
        id: local.id ?? null,
        nombre: local.name ?? null,
        logo: local.logo ?? null
      },
      visitante: {
        id: visitante.id ?? null,
        nombre: visitante.name ?? null,
        logo: visitante.logo ?? null
      },
      marcador: {
        local: fixture.goals?.home ?? 0,
        visitante: fixture.goals?.away ?? 0
      },
      estadisticas,
      tabla: [],
      tablaLocal: null,
      tablaVisitante: null,
      h2h: [],
      ultimosLocal: [],
      ultimosVisitante: [],
      lesiones: []
    });
  } catch (error) {
    console.error("Error en match.js API-Football:", error);
    return res.status(500).json({ error: "No se pudieron obtener los datos del partido" });
  }
}
