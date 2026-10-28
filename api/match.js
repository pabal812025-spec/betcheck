export default async function handler(req, res) {
  try {
    const apiToken = process.env.SPORTMONKS_API_TOKEN;
    const id = req.query.id;

    if (!apiToken) {
      return res.status(500).json({ error: "Token de SportMonks no configurado" });
    }

    if (!id) {
      return res.status(400).json({ error: "Falta el ID del partido" });
    }

    const base = "https://api.sportmonks.com/v3/football";
    const token = encodeURIComponent(apiToken);

    async function consultar(path) {
      try {
        const response = await fetch(
          `${base}${path}${path.includes("?") ? "&" : "?"}api_token=${token}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (!response.ok || data.message) return null;
        return data;
      } catch {
        return null;
      }
    }

    // Partido completo. Usamos el fixture ID que ya entrega /fixtures.
    const fixtureData = await consultar(
      `/fixtures/${encodeURIComponent(id)}?include=participants;league.country;scores;state;venue`
    );

    const fixture = fixtureData?.data;

    if (!fixture) {
      return res.status(503).json({
        error: "Partido no disponible en SportMonks"
      });
    }

    const participantes = fixture.participants || [];
    const local = participantes.find(t => t.meta?.location === "home") || participantes[0] || {};
    const visitante = participantes.find(t => t.meta?.location === "away") || participantes[1] || {};

    const currentScores = (fixture.scores || []).filter(
      score => score.description === "CURRENT"
    );

    const golesLocal =
      currentScores.find(s => Number(s.participant_id) === Number(local.id))?.score?.goals ?? 0;

    const golesVisitante =
      currentScores.find(s => Number(s.participant_id) === Number(visitante.id))?.score?.goals ?? 0;

    // Estadísticas del partido: si el plan las expone, las normalizamos.
    const statsData = await consultar(
      `/fixtures/${encodeURIComponent(id)}/statistics`
    );

    const estadisticas = (statsData?.data || []).map(equipo => ({
      equipo: {
        id: equipo.participant_id ?? equipo.team_id ?? null,
        nombre: equipo.participant?.name ?? equipo.team?.name ?? null,
        logo: equipo.participant?.image_path ?? equipo.team?.image_path ?? null
      },
      estadisticas: (equipo.statistics || equipo.stats || []).map(stat => ({
        tipo: stat.type?.name ?? stat.type?.developer_name ?? stat.type ?? null,
        valor: stat.data?.value ?? stat.value ?? null
      }))
    }));

    // La tabla y forma histórica pueden no estar disponibles en el Free Plan.
    // Dejamos arrays válidos para que MatchIA no se rompa.
    let tabla = [];
    let tablaLocal = null;
    let tablaVisitante = null;
    let h2h = [];
    let ultimosLocal = [];
    let ultimosVisitante = [];
    let lesiones = [];

    // Intentamos obtener standings de la liga sin romper el partido si el plan no los permite.
    if (fixture.league_id) {
      const standingsData = await consultar(
        `/standings/seasons/${encodeURIComponent(fixture.season_id || "")}`
      );

      if (Array.isArray(standingsData?.data)) {
        tabla = standingsData.data.map(item => ({
          posicion: item.position ?? item.rank ?? null,
          equipo: {
            id: item.participant_id ?? item.team_id ?? null,
            nombre: item.participant?.name ?? item.team?.name ?? null,
            logo: item.participant?.image_path ?? item.team?.image_path ?? null
          },
          puntos: item.points ?? 0,
          partidosJugados: item.details?.find?.(d => d.type?.developer_name === "MATCHES_PLAYED")?.value ?? 0,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          golesFavor: 0,
          golesContra: 0,
          diferenciaGoles: 0,
          forma: ""
        }));

        tablaLocal = tabla.find(x => Number(x.equipo.id) === Number(local.id)) || null;
        tablaVisitante = tabla.find(x => Number(x.equipo.id) === Number(visitante.id)) || null;
      }
    }

    return res.status(200).json({
      id: fixture.id ?? id,
      fecha: fixture.starting_at ?? null,
      estado: fixture.state?.short_name ?? fixture.state?.name ?? null,
      minuto: fixture.minute ?? 0,
      estadio: fixture.venue?.name ?? null,
      arbitro: fixture.referee?.name ?? null,
      liga: {
        id: fixture.league_id ?? fixture.league?.id ?? null,
        nombre: fixture.league?.name ?? null,
        pais: fixture.league?.country?.name ?? null,
        temporada: fixture.season_id ?? null
      },
      local: {
        id: local.id ?? null,
        nombre: local.name ?? null,
        logo: local.image_path ?? null
      },
      visitante: {
        id: visitante.id ?? null,
        nombre: visitante.name ?? null,
        logo: visitante.image_path ?? null
      },
      marcador: {
        local: golesLocal,
        visitante: golesVisitante
      },
      estadisticas,
      tabla,
      tablaLocal,
      tablaVisitante,
      h2h,
      ultimosLocal,
      ultimosVisitante,
      lesiones
    });
  } catch (error) {
    console.error("Error en match.js SportMonks:", error);
    return res.status(500).json({
      error: "No se pudieron obtener los datos del partido"
    });
  }
}
