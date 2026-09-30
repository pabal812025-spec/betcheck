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

    async function obtenerEstadisticas() {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures/statistics?fixture=${encodeURIComponent(id)}`,
        {
          headers,
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `API-Football respondió ${response.status}`
        );
      }

      const data = await response.json();

      return data.response || [];
    }

    // Primer intento
    let equipos = await obtenerEstadisticas();

    // Si la API respondió sin estadísticas, hacemos un segundo intento
    if (!equipos.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
      equipos = await obtenerEstadisticas();
    }

    const resultado = equipos.map(equipo => ({
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

    return res.status(200).json(resultado);

  } catch (error) {
    console.error("Error en stats.js:", error);

    return res.status(500).json({
      error: "No se pudieron obtener las estadísticas"
    });
  }
      }
