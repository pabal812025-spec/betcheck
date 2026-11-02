export default async function handler(req, res) {
  // SportMonks fue retirado de MatchIA.
  // Este endpoint queda reservado para el próximo proveedor de fútbol.
  res.setHeader("Cache-Control", "no-store");
  return res.status(503).json({
    error: "Proveedor de partidos no configurado",
    mensaje: "La conexión anterior fue retirada. MatchIA está esperando la integración del nuevo proveedor.",
    fecha: req.query.date || null,
    total: 0,
    partidos: []
  });
}
