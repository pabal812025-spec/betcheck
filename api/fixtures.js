export default async function handler(req, res) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key no configurada" });
    }

    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
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
    return res.status(500).json({
      error: "No se pudieron cargar los partidos"
    });
  }
}
