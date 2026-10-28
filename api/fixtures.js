export default async function handler(req, res) {
  try {
    const apiToken = process.env.SPORTMONKS_API_TOKEN;

    if (!apiToken) {
      return res.status(500).json({
        error: "Token de SportMonks no configurado"
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

    const include = "participants;league.country;scores;state";
    const base = "https://api.sportmonks.com/v3/football";

    // No usamos All Fixtures porque puede devolver registros históricos.
    // MatchIA necesita los partidos de la fecha solicitada.
    const dateUrl =
      `${base}/fixtures/date/${encodeURIComponent(fecha)}?api_token=${encodeURIComponent(apiToken)}&include=${include}`;

    let response = await fetch(dateUrl, { cache: "no-store" });
    let data = await response.json();

    if (!response.ok || data.message) {
      return res.status(!response.ok ? response.status : 502).json({
        error: "SportMonks no disponible",
        detalle: data.message || data.errors || null
      });
    }

    const partidos = (data.data || []).map(item => {
      const participantes = item.participants || [];

      const localTeam =
        participantes.find(team => team.meta?.location === "home") ||
        participantes[0] ||
        null;

      const awayTeam =
        participantes.find(team => team.meta?.location === "away") ||
        participantes[1] ||
        null;

      const currentScores = (item.scores || []).filter(score =>
        score.description === "CURRENT"
      );

      const homeScore =
        currentScores.find(score => score.participant_id === localTeam?.id)?.score?.goals ?? 0;

      const awayScore =
        currentScores.find(score => score.participant_id === awayTeam?.id)?.score?.goals ?? 0;

      return {
        id: item.id ?? null,
        fecha: item.starting_at ?? null,
        estado: item.state?.short_name ?? item.state?.name ?? null,
        minuto: 0,
        local: localTeam?.name ?? "Local",
        visitante: awayTeam?.name ?? "Visitante",
        logoLocal: localTeam?.image_path ?? null,
        logoVisitante: awayTeam?.image_path ?? null,
        liga: item.league?.name ?? "Liga",
        pais: item.league?.country?.name ?? "",
        logoLiga: item.league?.image_path ?? null,
        golesLocal: homeScore,
        golesVisitante: awayScore
      };
    });

    return res.status(200).json({
      fecha,
      total: partidos.length,
      partidos
    });

  } catch (error) {
    console.error("Error en fixtures SportMonks:", error);

    return res.status(500).json({
      error: "No se pudieron obtener los partidos"
    });
  }
}
