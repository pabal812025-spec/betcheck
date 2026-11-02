export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      codigo: "CLAVE_AUSENTE",
      mensaje: "No está configurada API_FOOTBALL_KEY en el servidor."
    });
  }

  try {
    const response = await fetch("https://v3.football.api-sports.io/status", {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      cache: "no-store"
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      return res.status(502).json({
        ok: false,
        codigo: "RESPUESTA_INVALIDA",
        mensaje: "API-Football respondió algo que no es JSON.",
        http: response.status
      });
    }

    const errors = data.errors || {};
    const account = data.response?.account || {};
    const subscription = data.response?.subscription || {};
    const requests = data.response?.requests || {};

    if (!response.ok || (Array.isArray(errors) && errors.length) ||
        (typeof errors === "object" && !Array.isArray(errors) && Object.keys(errors).length)) {
      return res.status(200).json({
        ok: false,
        codigo: "API_RECHAZO_LA_SOLICITUD",
        http: response.status,
        errores: errors
      });
    }

    return res.status(200).json({
      ok: true,
      codigo: "CLAVE_ACEPTADA",
      mensaje: "API-Football aceptó la clave.",
      cuenta: {
        activa: account.firstname ? true : null
      },
      suscripcion: {
        activa: subscription.active ?? null,
        plan: subscription.plan ?? null,
        vence: subscription.end ?? null
      },
      solicitudes: {
        usadas: requests.current ?? null,
        limite: requests.limit_day ?? null
      }
    });
  } catch (error) {
    console.error("Error comprobando API-Football:", error);
    return res.status(502).json({
      ok: false,
      codigo: "ERROR_DE_CONEXION",
      mensaje: "El servidor no pudo comunicarse con API-Football."
    });
  }
}
