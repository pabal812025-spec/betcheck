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

        if (!response.ok) return null;

        const data = await response.json();

        if (data.errors?.access) return null;

        return data.response || [];
      } catch {
        return null;
      }
    }

    // ============================================================
    // PARTIDO
    // ============================================================

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

    // ============================================================
    // ESTADÍSTICAS DEL PARTIDO
    // ============================================================

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

    // ============================================================
    // TABLA DE POSICIONES
    // ============================================================

    let tabla = [];

    if (ligaId && temporada) {
      const standingsData = await consultar(
        `https://v3.football.api-sports.io/standings?league=${ligaId}&season=${temporada}`
      );

      const grupos = standingsData?.[0]?.league?.standings || [];

      const posiciones = grupos.flat();

      tabla = posiciones.map(item => ({
        posicion: item.rank ?? null,

        equipo: {
          id: item.team?.id ?? null,
          nombre: item.team?.name ?? null,
          logo: item.team?.logo ?? null
        },

        puntos: item.points ?? 0,

        partidosJugados: item.all?.played ?? 0,

        victorias: item.all?.win ?? 0,

        empates: item.all?.draw ?? 0,

        derrotas: item.all?.lose ?? 0,

        golesFavor: item.all?.goals?.for ?? 0,

        golesContra: item.all?.goals?.against ?? 0,

        diferenciaGoles: item.goalsDiff ?? 0,

        forma: item.form ?? "",

        local: {
          partidos: item.home?.played ?? 0,
          victorias: item.home?.win ?? 0,
          empates: item.home?.draw ?? 0,
          derrotas: item.home?.lose ?? 0,
          golesFavor: item.home?.goals?.for ?? 0,
          golesContra: item.home?.goals?.against ?? 0
        },

        visitante: {
          partidos: item.away?.played ?? 0,
          victorias: item.away?.win ?? 0,
          empates: item.away?.draw ?? 0,
          derrotas: item.away?.lose ?? 0,
          golesFavor: item.away?.goals?.for ?? 0,
          golesContra: item.away?.goals?.against ?? 0
        }
      }));
    }

    // ============================================================
    // DATOS DE TABLA DE CADA EQUIPO
    // ============================================================

    const tablaLocal =
      tabla.find(item =>
        Number(item.equipo.id) === Number(localId)
      ) || null;

    const tablaVisitante =
      tabla.find(item =>
        Number(item.equipo.id) === Number(visitanteId)
      ) || null;

    // ============================================================
    // H2H ÚLTIMOS 5
    // ============================================================

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

    // ============================================================
    // ÚLTIMOS 5 DEL LOCAL
    // ============================================================

    let ultimosLocal = [];

    if (localId) {

      const data = await consultar(
        `https://v3.football.api-sports.io/fixtures?team=${localId}&last=5`
      );

      ultimosLocal = (data || []).map(item => ({
        id: item.fixture?.id ?? null,

        fecha: item.fixture?.date ?? null,

        local: item.teams?.home?.name ?? "",

        visitante: item.teams?.away?.name ?? "",

        golesLocal: item.goals?.home ?? 0,

        golesVisitante: item.goals?.away ?? 0,

        estado: item.fixture?.status?.short ?? null
      }));
    }

    // ============================================================
    // ÚLTIMOS 5 DEL VISITANTE
    // ============================================================

    let ultimosVisitante = [];

    if (visitanteId) {

      const data = await consultar(
        `https://v3.football.api-sports.io/fixtures?team=${visitanteId}&last=5`
      );

      ultimosVisitante = (data || []).map(item => ({
        id: item.fixture?.id ?? null,

        fecha: item.fixture?.date ?? null,

        local: item.teams?.home?.name ?? "",

        visitante: item.teams?.away?.name ?? "",

        golesLocal: item.goals?.home ?? 0,

        golesVisitante: item.goals?.away ?? 0,

        estado: item.fixture?.status?.short ?? null
      }));
    }

    // ============================================================
    // LESIONES
    // ============================================================

    const lesionesData = await consultar(
      `https://v3.football.api-sports.io/injuries?fixture=${encodeURIComponent(id)}`
    );

    const lesiones = (lesionesData || []).map(item => ({
      equipo: item.team?.name ?? "",

      jugador: item.player?.name ?? "",

      tipo: item.player?.type ?? "",

      razon: item.player?.reason ?? ""
    }));

    // ============================================================
    // RESPUESTA FINAL
    // ============================================================

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

        nombre:
          fixture.league?.name ?? null,

        pais:
          fixture.league?.country ?? null,

        temporada:
          temporada ?? null
      },

      local: {
        id: localId ?? null,

        nombre:
          local?.name ?? null,

        logo:
          local?.logo ?? null
      },

      visitante: {
        id: visitanteId ?? null,

        nombre:
          visitante?.name ?? null,

        logo:
          visitante?.logo ?? null
      },

      marcador: {
        local:
          fixture.goals?.home ?? 0,

        visitante:
          fixture.goals?.away ?? 0
      },

      // Estadísticas actuales del partido
      estadisticas,

      // Tabla completa de la competición
      tabla,

      // Datos específicos de cada equipo en la tabla
      tablaLocal,

      tablaVisitante,

      // Historial entre ambos
      h2h,

      // Forma reciente
      ultimosLocal,

      ultimosVisitante,

      // Lesiones
      lesiones

    });

  } catch (error) {

    console.error("Error en match.js:", error);

    return res.status(500).json({
      error: "No se pudieron obtener los datos del partido"
    });
  }
}
