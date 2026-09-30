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

// Obtener datos principales del partido
const partidoResponse = await fetch(
  `https://v3.football.api-sports.io/fixtures?id=${id}`,
  {
    headers
  }
);

if (!partidoResponse.ok) {
  return res.status(partidoResponse.status).json({
    error: "API-Football devolvió un error"
  });
}

const partidoData = await partidoResponse.json();

if (!partidoData.response || !partidoData.response.length) {
  return res.status(404).json({
    error: "Partido no encontrado"
  });
}

const partido = partidoData.response[0];

// Obtener estadísticas del partido
let estadisticas = {};

try {
  const statsResponse = await fetch(
    `https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`,
    {
      headers
    }
  );

  if (statsResponse.ok) {
    const statsData = await statsResponse.json();

    const equipos = statsData.response || [];

    const localId = partido.teams.home.id;
    const visitanteId = partido.teams.away.id;

    const localStats =
      equipos.find(equipo => equipo.team?.id === localId);

    const visitanteStats =
      equipos.find(equipo => equipo.team?.id === visitanteId);

    function obtenerValor(equipo, nombres) {
      if (!equipo || !equipo.statistics) {
        return null;
      }

      for (const nombre of nombres) {
        const encontrado = equipo.statistics.find(
          stat => stat.type === nombre
        );

        if (encontrado) {
          return encontrado.value;
        }
      }

      return null;
    }

    estadisticas = {
      tiros: {
        local: obtenerValor(localStats, ["Total Shots"]),
        visitante: obtenerValor(visitanteStats, ["Total Shots"])
      },

      tirosAlArco: {
        local: obtenerValor(localStats, ["Shots on Goal"]),
        visitante: obtenerValor(visitanteStats, ["Shots on Goal"])
      },

      corners: {
        local: obtenerValor(localStats, ["Corner Kicks"]),
        visitante: obtenerValor(visitanteStats, ["Corner Kicks"])
      },

      posesion: {
        local: obtenerValor(localStats, ["Ball Possession"]),
        visitante: obtenerValor(visitanteStats, ["Ball Possession"])
      },

      pasesPrecisos: {
        local: obtenerValor(localStats, ["Passes accurate"]),
        visitante: obtenerValor(visitanteStats, ["Passes accurate"])
      },

      faltas: {
        local: obtenerValor(localStats, ["Fouls"]),
        visitante: obtenerValor(visitanteStats, ["Fouls"])
      },

      amarillas: {
        local: obtenerValor(localStats, ["Yellow Cards"]),
        visitante: obtenerValor(visitanteStats, ["Yellow Cards"])
      },

      rojas: {
        local: obtenerValor(localStats, ["Red Cards"]),
        visitante: obtenerValor(visitanteStats, ["Red Cards"])
      }
    };
  }

} catch (error) {
  console.error("Error obteniendo estadísticas:", error);
}

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
  },

  estadisticas

});

} catch (error) {
console.error(error);

return res.status(500).json({
  error: "No se pudo obtener el partido"
});

}
}
