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
  `https://v3.football.api-sports.io/fixtures?id=${id}`,
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

if (!data.response || !data.response.length) {
  return res.status(404).json({
    error: "Partido no encontrado"
  });
}

const partido = data.response[0];

return res.status(200).json({
  id: partido.fixture.id,

  fecha: partido.fixture.date,

  estado: partido.fixture.status.short,

  minuto: partido.fixture.status.elapsed ?? null,

  estadoLargo: partido.fixture.status.long ?? null,

  estadio: partido.fixture.venue?.name || null,

  arbitro: partido.fixture.referee || null,

  local: {
    id: partido.teams.home.id,
    nombre: partido.teams.home.name,
    logo: partido.teams.home.logo
  },

  visitante: {
    id: partido.teams.away.id,
    nombre: partido.teams.away.name,
    logo: partido.teams.away.logo
  },

  liga: {
    id: partido.league.id,
    nombre: partido.league.name,
    pais: partido.league.country,
    logo: partido.league.logo
  },

  marcador: {
    local: partido.goals.home,
    visitante: partido.goals.away
  }
});

} catch (error) {
console.error(error);

return res.status(500).json({
  error: "No se pudo obtener el partido"
});

}
}
