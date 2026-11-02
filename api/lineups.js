export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "ID de partido inválido", lineups: [] });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Proveedor de fútbol no configurado", lineups: [] });
  }

  // Las alineaciones suelen publicarse antes del inicio y no cambian cada minuto.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures/lineups");
    url.searchParams.set("fixture", id);
    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey }
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length)) {
      return res.status(502).json({ error: "No se pudieron consultar las alineaciones", lineups: [] });
    }

    const lineups = (data.response || []).map(team => ({
      team: {
        id: team.team?.id ?? null,
        name: team.team?.name || "Equipo",
        logo: team.team?.logo || null
      },
      formation: team.formation || null,
      coach: team.coach?.name || null,
      startXI: (team.startXI || []).map(item => ({
        number: item.player?.number ?? null,
        name: item.player?.name || "Jugador",
        pos: item.player?.pos || null,
        grid: item.player?.grid || null
      })),
      substitutes: (team.substitutes || []).map(item => ({
        number: item.player?.number ?? null,
        name: item.player?.name || "Jugador",
        pos: item.player?.pos || null
      }))
    }));

    return res.status(200).json({
      fixture: Number(id),
      available: lineups.length > 0,
      lineups
    });
  } catch (error) {
    console.error("MatchIA lineups:", error);
    return res.status(502).json({ error: "Error al consultar las alineaciones", lineups: [] });
  }
}
