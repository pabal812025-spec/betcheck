export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "ID de partido inválido" });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada" });
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const headers = { "x-apisports-key": apiKey };

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("id", id);
    url.searchParams.set("timezone", "America/Argentina/Buenos_Aires");
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      console.error("API-Football match error:", response.status, data.errors);
      return res.status(502).json({ error: "API-Football no pudo entregar el partido" });
    }

    const item = (data.response || [])[0];
    if (!item) return res.status(404).json({ error: "Partido no encontrado" });

    const estado = item.fixture?.status?.short || "NS";
    const estadosConEstadisticas = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "FT", "AET", "PEN"];
    let estadisticas = [];
    let estadisticasEstado = "pendientes";
    let estadisticasMensaje = "Las estadísticas todavía no están disponibles para este partido.";
    let estadisticasCodigo = null;

    if (!estadosConEstadisticas.includes(estado)) {
      estadisticasEstado = "no_iniciado";
      estadisticasMensaje = "Las estadísticas aparecerán cuando comience el partido.";
    } else {
      try {
        const statsUrl = new URL("https://v3.football.api-sports.io/fixtures/statistics");
        statsUrl.searchParams.set("fixture", id);
        const statsResponse = await fetch(statsUrl.toString(), { headers });
        const statsData = await statsResponse.json();

        if (!statsResponse.ok || (statsData.errors && Object.keys(statsData.errors).length > 0)) {
          estadisticasEstado = "error_api";
          estadisticasCodigo = statsResponse.status;
          estadisticasMensaje = "API-Football respondió con un error al consultar las estadísticas.";
          console.error("API-Football statistics error:", statsResponse.status, statsData.errors);
        } else {
          const raw = Array.isArray(statsData.response) ? statsData.response : [];
          estadisticas = raw.map(equipo => ({
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

          if (estadisticas.length) {
            estadisticasEstado = "disponibles";
            estadisticasMensaje = "";
            // Ordenar explícitamente por equipo local y visitante para la pantalla.
            const homeId = item.teams?.home?.id;
            const awayId = item.teams?.away?.id;
            estadisticas.sort((a, b) => {
              if (a.equipo.id === homeId) return -1;
              if (b.equipo.id === homeId) return 1;
              if (a.equipo.id === awayId) return 1;
              if (b.equipo.id === awayId) return -1;
              return 0;
            });
          } else {
            estadisticasEstado = "sin_publicar";
            estadisticasMensaje = "API-Football todavía no publicó estadísticas para este partido o liga.";
          }
        }
      } catch (statsError) {
        estadisticasEstado = "error_conexion";
        estadisticasMensaje = "No se pudo conectar con API-Football para consultar las estadísticas.";
        console.warn("MatchIA: estadísticas no disponibles", statsError);
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
      estadisticasEstado,
      estadisticasMensaje,
      estadisticasCodigo,
      fecha: item.fixture?.date || null
    });
  } catch (error) {
    console.error("MatchIA match:", error);
    return res.status(502).json({ error: "No se pudo conectar con API-Football" });
  }
}
