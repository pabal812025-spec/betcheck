export default async function handler(req, res) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key no configurada"
      });
    }

    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        error: "Falta el ID del partido"
      });
    }

    const headers = {
      "x-apisports-key": apiKey
    };

    async function consultar(url) {
      try {
        const response = await fetch(url, {
          headers,
          cache: "no-store"
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        if (data.errors?.access) {
          return null;
        }

        return data.response || [];
      } catch {
        return null;
      }
    }

    /* Partido */
    const fixtureData = await consultar(
      `https://v3.football.api-sports.io/fixtures?id=${encodeURIComponent(id)}`
    );

    if (!fixtureData?.length) {
      return res.status(503).json({
        error: "Partido no disponible en API-Football"
      });
    }

    const fixture = fixtureData[0];

    const local = fixture.teams?.home;
    const visitante = fixture.teams?.away;

    const localId = local?.id;
    const visitanteId = visitante?.id;

    const ligaId = fixture.league?.id;
    const temporada = fixture.league?.season;

    /* Estadísticas */
    const statsData = await consultar(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${encodeURIComponent(id)}`
    );

    const estadisticas = (statsData || []).map(equipo => ({
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

    /* H2H */
    let h2h = [];

    if (localId && visitanteId) {
      const h2hData = await consultar(
        `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${localId}-${visitanteId}&last=5`
      );

      h2h = (h2hData || []).map(item => ({
        fecha: item.fixture?.date ?? null,
        local: item.teams?.home?.name ?? "",
        visitante: item.teams?.away?.name ?? "",
        golesLocal: item.goals?.home ?? 0,
        golesVisitante: item.goals?.away ?? 0
      }));
    }

    /* Últimos 5 del local */
    let ultimosLocal = [];

    if (localId) {
      const data = await consultar(
        `https://v3.football.api-sports.io/fixtures?team=${localId}&last=5`
      );

      ultimosLocal = (data || []).map(item => ({
        fecha: item.fixture?.date ?? null,
        local: item.teams?.home?.name ?? "",
        visitante: item.teams?.away?.name ?? "",
        golesLocal: item.goals?.home ?? 0,
        golesVisitante: item.goals?.away ?? 0
      }));
    }

    /* Últimos 5 del visitante */
    let ultimosVisitante = [];

    if (visitanteId) {
      const data = await consultar(
        `https://v3.football.api-sports.io/fixtures?team=${visitanteId}&last=5`
      );

      ultimosVisitante = (data || []).map(item => ({
        fecha: item.fixture?.date ?? null,
        local: item.teams?.home?.name ?? "",
        visitante: item.teams?.away?.name ?? "",
        golesLocal: item.goals?.home ?? 0,
        golesVisitante: item.goals?.away ?? 0
      }));
    }

    /* Lesiones */
    const lesionesData = await consultar(
      `https://v3.football.api-sports.io/injuries?fixture=${encodeURIComponent(id)}`
    );

    const lesiones = (lesionesData || []).map(item => ({
      equipo: item.team?.name ?? "",
      jugador: item.player?.name ?? "",
      tipo: item.player?.type ?? "",
      razon: item.player?.reason ?? ""
    }));

    /* Respuesta final */
    return res.status(200).json({

      id: fixture.fixture?.id ?? id,

      fecha: fixture.fixture?.date ?? null,

      estado: fixture.fixture?.status?.short ?? null,

      minuto: fixture.fixture?.status?.elapsed ?? 0,

      estadio:
        fixture.fixture?.venue?.name ?? null,

      arbitro:
        fixture.fixture?.referee ?? null,

      liga: {
        id: ligaId ?? null,
        nombre: fixture.league?.name ?? null,
        pais: fixture.league?.country ?? null,
        temporada: temporada ?? null
      },

      local: {
        id: localId ?? null,
        nombre: local?.name ?? null,
        logo: local?.logo ?? null
      },

      visitante: {
        id: visitanteId ?? null,
        nombre: visitante?.name ?? null,
        logo: visitante?.logo ?? null
      },

      marcador: {
        local: fixture.goals?.home ?? 0,
        visitante: fixture.goals?.away ?? 0
      },

      estadisticas,

      h2h,

      ultimosLocal,

      ultimosVisitante,

      lesiones

    });

  } catch (error) {

    console.error("Error en match.js:", error);

    return res.status(500).json({
      error: "No se pudieron obtener los datos del partido"
    });
  }
}
