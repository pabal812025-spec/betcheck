export default async function handler(req, res) {
  // SportMonks fue retirado de MatchIA.
  // Este endpoint queda reservado para el próximo proveedor de fútbol.
  res.setHeader("Cache-Control", "no-store");
  return res.status(503).json({
    error: "Proveedor de datos de partido no configurado",
    mensaje: "La conexión anterior fue retirada. Los detalles estarán disponibles al integrar el nuevo proveedor.",
    id: req.query.id || null
  });
}
