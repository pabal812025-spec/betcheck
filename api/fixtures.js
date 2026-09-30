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

    const data = await response.json();

    return res.status(200).json({
      fechaConsultada: fecha,
      estadoHTTP: response.status,
      resultados: data.results ?? null,
      erroresAPI: data.errors ?? null,
      cantidadRespuesta: Array.isArray(data.response)
        ? data.response.length
        : null
    });

  } catch (error) {
    console.error("Error en fixtures:", error);

    return res.status(500).json({
      error: "No se pudo consultar API-Football"
    });
  }
}
