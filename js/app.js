// ============================================================
// MATCHIA — APLICACIÓN PRINCIPAL
// MOTOR PREPARTIDO CON DATOS REALES DE API-FOOTBALL
//
// IMPORTANTE:
// - NO modifica js/calibraciones.js
// - NO utiliza fuerzas inventadas por nombre de equipo
// - Utiliza tabla, forma, goles, rendimiento local/visitante,
//   últimos 5 partidos y H2H.
// ============================================================


// ============================================================
// UTILIDADES
// ============================================================

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}


function porcentaje(valor) {
  return Math.max(0, Math.min(100, numero(valor)));
}


function promedio(valor, cantidad) {
  if (!cantidad) return 0;
  return valor / cantidad;
}


function normalizarNombre(nombre) {

  return String(nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


// ============================================================
// FORMA RECIENTE
// W = VICTORIA
// D = EMPATE
// L = DERROTA
// ============================================================

function analizarForma(formString) {

  const forma = String(formString || "")
    .toUpperCase()
    .replace(/[^WDL]/g, "")
    .slice(-5);

  let victorias = 0;
  let empates = 0;
  let derrotas = 0;

  for (const resultado of forma) {

    if (resultado === "W") victorias++;

    if (resultado === "D") empates++;

    if (resultado === "L") derrotas++;
  }

  const partidos =
    victorias + empates + derrotas;

  const puntos =
    victorias * 3 + empates;

  return {

    forma,

    victorias,

    empates,

    derrotas,

    partidos,

    puntos,

    puntosPorPartido:
      promedio(puntos, partidos),

    porcentajePuntos:
      partidos
        ? puntos / (partidos * 3) * 100
        : 50
  };
}


// ============================================================
// ÚLTIMOS 5 PARTIDOS
// ============================================================

function analizarUltimosPartidos(partidos, nombreEquipo) {

  const nombreNormalizado =
    normalizarNombre(nombreEquipo);

  let victorias = 0;
  let empates = 0;
  let derrotas = 0;

  let golesFavor = 0;
  let golesContra = 0;

  let partidosJugados = 0;

  for (const partido of partidos || []) {

    const local =
      normalizarNombre(partido.local);

    const visitante =
      normalizarNombre(partido.visitante);

    const golesLocal =
      numero(partido.golesLocal);

    const golesVisitante =
      numero(partido.golesVisitante);

    if (
      local !== nombreNormalizado &&
      visitante !== nombreNormalizado
    ) {
      continue;
    }

    partidosJugados++;

    const esLocal =
      local === nombreNormalizado;

    const golesPropios =
      esLocal
        ? golesLocal
        : golesVisitante;

    const golesRecibidos =
      esLocal
        ? golesVisitante
        : golesLocal;

    golesFavor += golesPropios;

    golesContra += golesRecibidos;

    if (golesPropios > golesRecibidos) {
      victorias++;
    }
    else if (golesPropios === golesRecibidos) {
      empates++;
    }
    else {
      derrotas++;
    }
  }

  const puntos =
    victorias * 3 + empates;

  return {

    partidos: partidosJugados,

    victorias,

    empates,

    derrotas,

    golesFavor,

    golesContra,

    diferenciaGoles:
      golesFavor - golesContra,

    puntos,

    puntosPorPartido:
      promedio(puntos, partidosJugados),

    golesFavorPorPartido:
      promedio(golesFavor, partidosJugados),

    golesContraPorPartido:
      promedio(golesContra, partidosJugados)
  };
}


// ============================================================
// DATOS DEL EQUIPO DESDE LA TABLA
// ============================================================

function obtenerDatosTabla(equipoTabla) {

  if (!equipoTabla) {

    return {

      posicion: 50,

      puntos: 0,

      partidosJugados: 0,

      victorias: 0,

      empates: 0,

      derrotas: 0,

      golesFavor: 0,

      golesContra: 0,

      diferenciaGoles: 0,

      forma: "",

      porcentajeVictorias: 0,

      puntosPorPartido: 0,

      golesFavorPorPartido: 0,

      golesContraPorPartido: 0,

      local: {},
      visitante: {}
    };
  }

  const partidos =
    numero(equipoTabla.partidosJugados);

  return {

    posicion:
      numero(equipoTabla.posicion),

    puntos:
      numero(equipoTabla.puntos),

    partidosJugados:
      partidos,

    victorias:
      numero(equipoTabla.victorias),

    empates:
      numero(equipoTabla.empates),

    derrotas:
      numero(equipoTabla.derrotas),

    golesFavor:
      numero(equipoTabla.golesFavor),

    golesContra:
      numero(equipoTabla.golesContra),

    diferenciaGoles:
      numero(equipoTabla.diferenciaGoles),

    forma:
      analizarForma(equipoTabla.forma),

    porcentajeVictorias:
      partidos
        ? numero(equipoTabla.victorias) /
          partidos * 100
        : 0,

    puntosPorPartido:
      promedio(
        numero(equipoTabla.puntos),
        partidos
      ),

    golesFavorPorPartido:
      promedio(
        numero(equipoTabla.golesFavor),
        partidos
      ),

    golesContraPorPartido:
      promedio(
        numero(equipoTabla.golesContra),
        partidos
      ),

    local:
      equipoTabla.local || {},

    visitante:
      equipoTabla.visitante || {}
  };
}


// ============================================================
// RENDIMIENTO LOCAL / VISITANTE
// ============================================================

function obtenerRendimientoSede(datos, tipo) {

  const sede =
    datos?.[tipo] || {};

  const partidos =
    numero(sede.partidos);

  const victorias =
    numero(sede.victorias);

  const empates =
    numero(sede.empates);

  const derrotas =
    numero(sede.derrotas);

  const golesFavor =
    numero(sede.golesFavor);

  const golesContra =
    numero(sede.golesContra);

  const puntos =
    victorias * 3 + empates;

  return {

    partidos,

    victorias,

    empates,

    derrotas,

    golesFavor,

    golesContra,

    puntos,

    puntosPorPartido:
      promedio(puntos, partidos),

    golesFavorPorPartido:
      promedio(golesFavor, partidos),

    golesContraPorPartido:
      promedio(golesContra, partidos)
  };
}


// ============================================================
// H2H ÚLTIMOS 5
// ============================================================

function analizarH2H(h2h, homeName, awayName) {

  let homeVictorias = 0;
  let empates = 0;
  let awayVictorias = 0;

  let golesHome = 0;
  let golesAway = 0;

  const homeNormalizado =
    normalizarNombre(homeName);

  const awayNormalizado =
    normalizarNombre(awayName);

  for (const partido of h2h || []) {

    const local =
      normalizarNombre(partido.local);

    const visitante =
      normalizarNombre(partido.visitante);

    const gl =
      numero(partido.golesLocal);

    const gv =
      numero(partido.golesVisitante);

    if (
      local !== homeNormalizado &&
      visitante !== homeNormalizado &&
      local !== awayNormalizado &&
      visitante !== awayNormalizado
    ) {
      continue;
    }

    const homeEsLocal =
      local === homeNormalizado;

    const golesDelHome =
      homeEsLocal ? gl : gv;

    const golesDelAway =
      homeEsLocal ? gv : gl;

    golesHome += golesDelHome;
    golesAway += golesDelAway;

    if (golesDelHome > golesDelAway) {
      homeVictorias++;
    }
    else if (golesDelHome === golesDelAway) {
      empates++;
    }
    else {
      awayVictorias++;
    }
  }

  const partidos =
    homeVictorias +
    empates +
    awayVictorias;

  return {

    partidos,

    homeVictorias,

    empates,

    awayVictorias,

    golesHome,

    golesAway,

    puntosHome:
      homeVictorias * 3 + empates,

    puntosAway:
      awayVictorias * 3 + empates
  };
}


// ============================================================
// CÁLCULO PREPARTIDO
//
// El motor combina:
// 1. Tabla general
// 2. Forma reciente
// 3. Rendimiento local/visitante
// 4. Goles
// 5. Últimos 5
// 6. H2H
// 7. Localía
//
// La localía NO decide el partido.
// Es solamente un factor.
// ============================================================

function calculatePrematchFromData(datos) {

  const homeName =
    datos.local?.nombre || "Local";

  const awayName =
    datos.visitante?.nombre || "Visitante";


  const homeTabla =
    obtenerDatosTabla(datos.tablaLocal);

  const awayTabla =
    obtenerDatosTabla(datos.tablaVisitante);


  const homeSede =
    obtenerRendimientoSede(
      homeTabla,
      "local"
    );

  const awaySede =
    obtenerRendimientoSede(
      awayTabla,
      "visitante"
    );


  const homeRecent =
    analizarUltimosPartidos(
      datos.ultimosLocal,
      homeName
    );

  const awayRecent =
    analizarUltimosPartidos(
      datos.ultimosVisitante,
      awayName
    );


  const h2h =
    analizarH2H(
      datos.h2h,
      homeName,
      awayName
    );


  // ----------------------------------------------------------
  // PUNTUACIÓN DE CADA EQUIPO
  // ----------------------------------------------------------

  let homeScore = 50;
  let awayScore = 50;


  // ----------------------------------------------------------
  // TABLA GENERAL
  // ----------------------------------------------------------

  homeScore +=
    (homeTabla.puntosPorPartido -
     awayTabla.puntosPorPartido) * 7;

  awayScore +=
    (awayTabla.puntosPorPartido -
     homeTabla.puntosPorPartido) * 7;


  // Diferencia de goles
  homeScore +=
    (
      homeTabla.golesFavorPorPartido -
      homeTabla.golesContraPorPartido
    ) * 3;

  awayScore +=
    (
      awayTabla.golesFavorPorPartido -
      awayTabla.golesContraPorPartido
    ) * 3;


  // ----------------------------------------------------------
  // FORMA DE LOS ÚLTIMOS 5
  // ----------------------------------------------------------

  homeScore +=
    (
      homeRecent.puntosPorPartido -
      awayRecent.puntosPorPartido
    ) * 6;

  awayScore +=
    (
      awayRecent.puntosPorPartido -
      homeRecent.puntosPorPartido
    ) * 6;


  // ----------------------------------------------------------
  // RENDIMIENTO ESPECÍFICO
  // LOCAL VS VISITANTE
  // ----------------------------------------------------------

  homeScore +=
    (
      homeSede.puntosPorPartido -
      awaySede.puntosPorPartido
    ) * 5;

  awayScore +=
    (
      awaySede.puntosPorPartido -
      homeSede.puntosPorPartido
    ) * 5;


  // ----------------------------------------------------------
  // GOLES RECIENTES
  // ----------------------------------------------------------

  homeScore +=
    (
      homeRecent.golesFavorPorPartido -
      awayRecent.golesFavorPorPartido
    ) * 2;

  awayScore +=
    (
      awayRecent.golesFavorPorPartido -
      homeRecent.golesFavorPorPartido
    ) * 2;


  homeScore -=
    (
      homeRecent.golesContraPorPartido -
      awayRecent.golesContraPorPartido
    ) * 2;

  awayScore -=
    (
      awayRecent.golesContraPorPartido -
      homeRecent.golesContraPorPartido
    ) * 2;


  // ----------------------------------------------------------
  // H2H
  // SOLO TIENE PESO SI HAY HISTORIAL REAL
  // ----------------------------------------------------------

  if (h2h.partidos > 0) {

    const diferenciaH2H =
      (
        h2h.puntosHome -
        h2h.puntosAway
      ) / h2h.partidos;

    homeScore +=
      diferenciaH2H * 1.5;

    awayScore -=
      diferenciaH2H * 1.5;
  }


  // ----------------------------------------------------------
  // LOCALÍA
  //
  // Factor moderado.
  // NO puede tapar una diferencia fuerte de rendimiento.
  // ----------------------------------------------------------

  homeScore += 3.5;


  // ----------------------------------------------------------
  // DIFERENCIA FINAL
  // ----------------------------------------------------------

  const diferencia =
    homeScore - awayScore;


  // ----------------------------------------------------------
  // PROBABILIDAD DE EMPATE
  //
  // Cuanto más parejos los equipos,
  // mayor posibilidad de empate.
  // ----------------------------------------------------------

  const distancia =
    Math.min(
      30,
      Math.abs(diferencia)
    );


  let drawProbability =
    31 - distancia * 0.35;


  drawProbability =
    Math.max(
      18,
      Math.min(
        34,
        drawProbability
      )
    );


  // ----------------------------------------------------------
  // PROBABILIDAD HOME / AWAY
  // ----------------------------------------------------------

  const disponible =
    100 - drawProbability;


  // Función logística para evitar porcentajes absurdos
  const intensidad = 0.075;

  const ventaja =
    1 /
    (
      1 +
      Math.exp(
        -diferencia * intensidad
      )
    );


  let homeProbability =
    disponible * ventaja;

  let awayProbability =
    disponible - homeProbability;


  // ----------------------------------------------------------
  // PROTECCIONES
  // ----------------------------------------------------------

  homeProbability =
    Math.max(
      1,
      Math.min(
        95,
        homeProbability
      )
    );

  awayProbability =
    Math.max(
      1,
      Math.min(
        95,
        awayProbability
      )
    );


  // ----------------------------------------------------------
  // NORMALIZACIÓN FINAL
  // ----------------------------------------------------------

  const total =
    homeProbability +
    drawProbability +
    awayProbability;


  homeProbability =
    homeProbability / total * 100;

  drawProbability =
    drawProbability / total * 100;

  awayProbability =
    awayProbability / total * 100;


  return {

    home:
      Math.round(homeProbability),

    draw:
      Math.round(drawProbability),

    away:
      Math.round(awayProbability),

    raw: {

      homeScore,

      awayScore,

      diferencia,

      drawProbability
    },

    datos: {

      homeTabla,

      awayTabla,

      homeSede,

      awaySede,

      homeRecent,

      awayRecent,

      h2h
    }
  };
}


// ============================================================
// ANÁLISIS EXPLICATIVO
// ============================================================

function generatePrematchAnalysisFromData(datos, resultado) {

  const messages = [];

  const homeName =
    datos.local?.nombre || "Local";

  const awayName =
    datos.visitante?.nombre || "Visitante";


  const home =
    resultado.datos.homeTabla;

  const away =
    resultado.datos.awayTabla;


  const homeRecent =
    resultado.datos.homeRecent;

  const awayRecent =
    resultado.datos.awayRecent;


  const h2h =
    resultado.datos.h2h;


  // ----------------------------------------------------------
  // TABLA
  // ----------------------------------------------------------

  if (
    home.posicion &&
    away.posicion &&
    home.posicion < away.posicion
  ) {

    messages.push(
      `${homeName} está mejor ubicado en la tabla (${home.posicion}° contra ${away.posicion}°).`
    );

  }
  else if (
    home.posicion &&
    away.posicion &&
    away.posicion < home.posicion
  ) {

    messages.push(
      `${awayName} está mejor ubicado en la tabla (${away.posicion}° contra ${home.posicion}°).`
    );

  }
  else {

    messages.push(
      "La posición de ambos equipos en la tabla es relativamente pareja."
    );
  }


  // ----------------------------------------------------------
  // FORMA
  // ----------------------------------------------------------

  if (
    homeRecent.puntos >
    awayRecent.puntos
  ) {

    messages.push(
      `${homeName} llega con mejor rendimiento en sus últimos partidos.`
    );

  }
  else if (
    awayRecent.puntos >
    homeRecent.puntos
  ) {

    messages.push(
      `${awayName} llega con mejor rendimiento en sus últimos partidos.`
    );

  }
  else {

    messages.push(
      "Los últimos resultados de ambos equipos son similares."
    );
  }


  // ----------------------------------------------------------
  // RENDIMIENTO DE SEDE
  // ----------------------------------------------------------

  const homeLocal =
    resultado.datos.homeSede;

  const awayVisitante =
    resultado.datos.awaySede;


  if (
    homeLocal.partidos > 0 &&
    awayVisitante.partidos > 0
  ) {

    if (
      homeLocal.puntosPorPartido >
      awayVisitante.puntosPorPartido
    ) {

      messages.push(
        `${homeName} presenta mejor rendimiento como local que ${awayName} como visitante.`
      );

    }
    else if (
      awayVisitante.puntosPorPartido >
      homeLocal.puntosPorPartido
    ) {

      messages.push(
        `${awayName} presenta mejor rendimiento como visitante que ${homeName} como local.`
      );

    }
  }


  // ----------------------------------------------------------
  // H2H
  // ----------------------------------------------------------

  if (h2h.partidos > 0) {

    if (
      h2h.homeVictorias >
      h2h.awayVictorias
    ) {

      messages.push(
        `En los últimos ${h2h.partidos} enfrentamientos registrados, ${homeName} tiene ventaja.`
      );

    }
    else if (
      h2h.awayVictorias >
      h2h.homeVictorias
    ) {

      messages.push(
        `En los últimos ${h2h.partidos} enfrentamientos registrados, ${awayName} tiene ventaja.`
      );

    }
    else {

      messages.push(
        `Los últimos ${h2h.partidos} enfrentamientos registrados fueron equilibrados.`
      );
    }
  }


  // ----------------------------------------------------------
  // LOCALÍA
  // ----------------------------------------------------------

  messages.push(
    `La localía de ${homeName} se considera como un factor adicional, no como una garantía de victoria.`
  );


  // ----------------------------------------------------------
  // RESULTADO DEL MOTOR
  // ----------------------------------------------------------

  const p =
    resultado;


  let favorito =
    homeName;

  let porcentajeFavorito =
    p.home;


  if (p.away > p.home) {

    favorito =
      awayName;

    porcentajeFavorito =
      p.away;
  }


  messages.push(
    `Según los datos disponibles, ${favorito} presenta la mayor probabilidad prepartido (${porcentajeFavorito}%).`
  );


  return messages;
}


// ============================================================
// OBTENER DATOS REALES DEL PARTIDO
// ============================================================

async function getMatchData(fixtureId) {

  if (!fixtureId) {

    throw new Error(
      "Falta el ID del partido."
    );
  }


  const response =
    await fetch(
      `/api/match?id=${encodeURIComponent(fixtureId)}`,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "No se pudieron obtener los datos del partido."
    );
  }


  const data =
    await response.json();


  if (data.error) {

    throw new Error(
      data.error
    );
  }


  return data;
}


// ============================================================
// FUNCIÓN PRINCIPAL PREPARTIDO
// ============================================================

async function getPrematchPredictionById(fixtureId) {

  const datos =
    await getMatchData(fixtureId);


  const resultado =
    calculatePrematchFromData(datos);


  const analysis =
    generatePrematchAnalysisFromData(
      datos,
      resultado
    );


  return {

    fixture: datos,

    probabilities: {

      home:
        resultado.home,

      draw:
        resultado.draw,

      away:
        resultado.away
    },

    analysis,

    details:
      resultado.datos
  };
}


// ============================================================
// COMP
