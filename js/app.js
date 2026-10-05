// ============================================================
// MATCHIA — APLICACIÓN PRINCIPAL
// CÁLCULO PREPARTIDO
// NO MODIFICA LAS CALIBRACIONES DEL MOTOR EN VIVO.
// ============================================================

const PREMATCH_TEAMS = {
  river: {
    strength: 88,
    attack: 90,
    defense: 87,
    form: 86
  },

  boca: {
    strength: 87,
    attack: 88,
    defense: 86,
    form: 85
  },

  racing: {
    strength: 82,
    attack: 83,
    defense: 80,
    form: 81
  },

  independiente: {
    strength: 78,
    attack: 77,
    defense: 79,
    form: 78
  },

  sanlorenzo: {
    strength: 76,
    attack: 75,
    defense: 78,
    form: 76
  },

  equipo_chico: {
    strength: 62,
    attack: 60,
    defense: 63,
    form: 61
  }
};

// ------------------------------------------------------------
// OBTENER DATOS DEL EQUIPO
// ------------------------------------------------------------

function getTeamData(name) {

  const key = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  return PREMATCH_TEAMS[key] || PREMATCH_TEAMS.equipo_chico;
}

// ------------------------------------------------------------
// PROBABILIDAD PREPARTIDO
// ------------------------------------------------------------

function calculatePrematch(homeName, awayName) {

  const home = getTeamData(homeName);
  const away = getTeamData(awayName);

  // Fuerza general
  let homeScore = home.strength;
  let awayScore = away.strength;

  // Ataque
  homeScore += home.attack * 0.35;
  awayScore += away.attack * 0.35;

  // Defensa
  homeScore += home.defense * 0.25;
  awayScore += away.defense * 0.25;

  // Forma
  homeScore += home.form * 0.30;
  awayScore += away.form * 0.30;

  // ----------------------------------------------------------
  // LOCALÍA
  // ----------------------------------------------------------

  homeScore += 8;

  // ----------------------------------------------------------
  // CONVERSIÓN A PROBABILIDADES
  // ----------------------------------------------------------

  const difference = homeScore - awayScore;

  let homeProbability =
    50 + difference * 1.05;

  let awayProbability =
    50 - difference * 1.05;

  // Empate base
  let drawProbability = 26;

  // Reducimos proporcionalmente para reservar espacio al empate
  const resultTotal =
    homeProbability + awayProbability;

  const available = 100 - drawProbability;

  homeProbability =
    homeProbability / resultTotal * available;

  awayProbability =
    awayProbability / resultTotal * available;

  // ----------------------------------------------------------
  // PROTECCIONES
  // ----------------------------------------------------------

  homeProbability =
    Math.max(1, Math.min(94, homeProbability));

  awayProbability =
    Math.max(1, Math.min(94, awayProbability));

  drawProbability =
    Math.max(5, Math.min(40, drawProbability));

  // Normalización final
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
    home: Math.round(homeProbability),
    draw: Math.round(drawProbability),
    away: Math.round(awayProbability)
  };
}

// ------------------------------------------------------------
// ANÁLISIS PREPARTIDO
// ------------------------------------------------------------

function generatePrematchAnalysis(homeName, awayName) {

  const home = getTeamData(homeName);
  const away = getTeamData(awayName);

  const messages = [];

  if (home.strength > away.strength + 10) {

    messages.push(
      `${homeName} parte con una ventaja importante por diferencia de nivel.`
    );

  } else if (away.strength > home.strength + 10) {

    messages.push(
      `${awayName} parte con una ventaja importante por diferencia de nivel.`
    );

  } else {

    messages.push(
      "La diferencia de nivel entre ambos equipos es reducida."
    );
  }

  messages.push(
    `La localía favorece a ${homeName}.`
  );

  if (home.form > away.form + 8) {

    messages.push(
      `${homeName} llega con mejor forma reciente.`
    );

  } else if (away.form > home.form + 8) {

    messages.push(
      `${awayName} llega con mejor forma reciente.`
    );

  } else {

    messages.push(
      "La forma reciente de ambos equipos es relativamente pareja."
    );
  }

  return messages;
}

// ------------------------------------------------------------
// FUNCIÓN PRINCIPAL PREPARTIDO
// ------------------------------------------------------------

function getPrematchPrediction(homeName, awayName) {

  const probabilities =
    calculatePrematch(homeName, awayName);

  const analysis =
    generatePrematchAnalysis(homeName, awayName);

  return {
    probabilities,
    analysis
  };
}

// ------------------------------------------------------------
// EXPORTACIÓN
// ------------------------------------------------------------

window.MatchIAPrematch = {
  teams: PREMATCH_TEAMS,
  getTeamData,
  calculatePrematch,
  generatePrematchAnalysis,
  getPrematchPrediction
};

console.log("MatchIA — módulo prepartido iniciado");
