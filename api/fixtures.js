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
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "API-Football devolvió un error"
      });
    }

    const data = await response.json();

    const partidos = (data.response || []).map(item => ({
      id: item.fixture.id,
      home: item.teams.home.name,
      away: item.teams.away.name,
      league: item.league.name,
      country: item.league.country
    }));

    return res.status(200).json(partidos);

  } catch (error) {
    console.error("Error en fixtures:", error);

    return res.status(500).json({
      error: "No se pudieron cargar los partidos"
    });
  }
}
