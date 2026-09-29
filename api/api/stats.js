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

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`,
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

    const equipos = data.response || [];

    const resultado = equipos.map(equipo => ({
      equipo: {
        id: equipo.team?.id || null,
        nombre: equipo.team?.name || null,
        logo: equipo.team?.logo || null
      },

      estadisticas: (equipo.statistics || []).map(stat => ({
        tipo: stat.type,
        valor: stat.value
      }))
    }));

    return res.status(200).json(resultado);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "No se pudieron obtener las estadísticas"
    });
  }
}
