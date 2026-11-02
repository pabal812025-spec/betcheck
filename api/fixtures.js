export default async function handler(req, res) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Fecha inválida", partidos: [] });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no está configurada", partidos: [] });
  }

  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");

  try {
    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("date", date);
    url.searchParams.set("timezone", "America/Argentina/Buenos_Aires");

    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey }
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
      console.error("API-Football fixtures error:", response.status, data.errors);
      return res.status(502).json({ error: "API-Football no pudo entregar los partidos", detalle: data.errors || response.status, partidos: [] });
    }

    const partidos = (data.response || []).map(item => ({
      id: item.fixture?.id,
      liga: item.league?.name || "Otras competiciones",
      fecha: item.fixture?.date || null,
      pais: item.league?.country || "",
      estado: item.fixture?.status?.short || "NS",
      minuto: item.fixture?.status?.elapsed ?? null,
      golesLocal: item.goals?.home ?? null,
      golesVisitante: item.goals?.away ?? null,
      local: item.teams?.home?.name || "Local",
      visitante: item.teams?.away?.name || "Visitante",
      logoLocal: item.teams?.home?.logo || null,
      logoVisitante: item.teams?.away?.logo || null
    }));

    return res.status(200).json({ fecha: date, total: partidos.length, partidos });
  } catch (error) {
    console.error("MatchIA fixtures:", error);
    return res.status(502).json({ error: "No se pudo conectar con API-Football", partidos: [] });
  }
}
