// MatchIA - UI
// Maneja navegación, pantallas y elementos generales.
// NO modifica las calibraciones de porcentajes.

(function () {
  "use strict";

  let selectedFixtureId = null;
  let currentScreen = "home";

  window.MatchIAUI = {
    getSelectedFixtureId: function () {
      return selectedFixtureId;
    },

    setSelectedFixtureId: function (id) {
      selectedFixtureId = id;
    },

    getCurrentScreen: function () {
      return currentScreen;
    }
  };

  // =========================================================
  // SPLASH
  // =========================================================

  function hideSplash() {
    const splash = document.getElementById("splash");

    if (!splash) return;

    setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.transition = "opacity .25s ease";

      setTimeout(function () {
        splash.style.display = "none";
      }, 280);
    }, 1600);
  }

  // =========================================================
  // NAVEGACIÓN PRINCIPAL
  // =========================================================

  window.show = function (screenName) {
    const screens = document.querySelectorAll(".screen");
    const navItems = document.querySelectorAll(".nav-item");

    screens.forEach(function (screen) {
      screen.classList.remove("active");
    });

    const target = document.getElementById(screenName);

    if (!target) {
      console.warn("Pantalla no encontrada:", screenName);
      return;
    }

    target.classList.add("active");

    navItems.forEach(function (item) {
      item.classList.remove("active");

      if (item.dataset.screen === screenName) {
        item.classList.add("active");
      }
    });

    currentScreen = screenName;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (screenName === "finished") {
      if (typeof window.renderFinishedMatches === "function") {
        window.renderFinishedMatches();
      }
    }

    if (screenName === "search") {
      const input = document.getElementById("searchInput");

      if (input) {
        setTimeout(function () {
          input.focus();
        }, 100);
      }
    }
  };

  // =========================================================
  // TABS
  // =========================================================

  window.tab = function (tabName, button) {
    const panels = document.querySelectorAll(".tab-panel");
    const buttons = document.querySelectorAll(".tab");

    panels.forEach(function (panel) {
      panel.classList.remove("active");
    });

    buttons.forEach(function (item) {
      item.classList.remove("active");
    });

    const target = document.getElementById(tabName);

    if (target) {
      target.classList.add("active");
    }

    if (button) {
      button.classList.add("active");
    }
  };

  // =========================================================
  // ABRIR PARTIDO
  // =========================================================

  window.openMatch = function (fixtureId, live) {
    if (!fixtureId) {
      console.warn("No se recibió ID del partido.");
      return;
    }

    selectedFixtureId = fixtureId;

    if (window.MatchIAUI) {
      window.MatchIAUI.setSelectedFixtureId(fixtureId);
    }

    if (live) {
      show("live");

      if (typeof window.loadLiveMatch === "function") {
        window.loadLiveMatch(fixtureId);
      }

      return;
    }

    show("match");

    if (typeof window.openPrematch === "function") {
      window.openPrematch(fixtureId);
    }
  };

  // =========================================================
  // ANÁLISIS PRE-PARTIDO
  // =========================================================

  window.openPrematch = async function (fixtureId) {
    const id = fixtureId || selectedFixtureId;

    if (!id) {
      console.warn("No hay partido seleccionado.");
      return;
    }

    selectedFixtureId = id;

    const loading = document.getElementById("analysisText");

    if (loading) {
      loading.textContent = "Analizando datos reales del partido...";
    }

    try {
      if (
        !window.MatchIAPrematch ||
        typeof window.MatchIAPrematch.getPrematchPredictionById !== "function"
      ) {
        throw new Error("Motor MatchIA pre-partido no disponible.");
      }

      const resultado =
        await window.MatchIAPrematch.getPrematchPredictionById(id);

      if (!resultado) {
        throw new Error("No se recibió información del partido.");
      }

      renderPrematch(resultado);

    } catch (error) {
      console.error("Error en análisis pre-partido:", error);

      if (loading) {
        loading.textContent =
          "No se pudo cargar el análisis de este partido.";
      }
    }
  };

  // =========================================================
  // RENDER PARTIDO PRE-PARTIDO
  // =========================================================

  function renderPrematch(resultado) {
    const datos = resultado.datos || resultado.data || resultado;

    const prediccion =
      resultado.prediccion ||
      resultado.prediction ||
      resultado.probabilidades ||
      {};

    const analisis =
      resultado.analisis ||
      resultado.analysis ||
      "";

    const local =
      datos.local ||
      resultado.local ||
      {};

    const visitante =
      datos.visitante ||
      resultado.visitante ||
      {};

    const liga =
      datos.liga ||
      resultado.liga ||
      {};

    setText("matchHome", local.nombre || "Local");
    setText("matchAway", visitante.nombre || "Visitante");

    setText("probHomeName", local.nombre || "Local");
    setText("probAwayName", visitante.nombre || "Visitante");

    setText("formHomeTitle", local.nombre || "Local");
    setText("formAwayTitle", visitante.nombre || "Visitante");

    setText("matchLeague", liga.nombre || "Liga");

    setImage("matchHomeLogo", local.logo);
    setImage("matchAwayLogo", visitante.logo);

    const fecha = datos.fecha || resultado.fecha;

    if (fecha) {
      const date = new Date(fecha);

      if (!Number.isNaN(date.getTime())) {
        setText(
          "matchTime",
          date.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        );
      }
    }

    setText(
      "matchStatus",
      datos.estado === "NS" || datos.estado === "TBD"
        ? "PRÓXIMO"
        : datos.estado || "PRÓXIMO"
    );

    const home =
      prediccion.local ??
      prediccion.home ??
      prediccion.homeWin ??
      prediccion.localProb ??
      0;

    const draw =
      prediccion.empate ??
      prediccion.draw ??
      prediccion.drawProb ??
      0;

    const away =
      prediccion.visitante ??
      prediccion.away ??
      prediccion.awayWin ??
      prediccion.awayProb ??
      0;

    setText("probHome", formatPercent(home));
    setText("probDraw", formatPercent(draw));
    setText("probAway", formatPercent(away));

    const confianza =
      resultado.confianza ??
      resultado.confidence ??
      prediccion.confianza ??
      prediccion.confidence ??
      null;

    setText(
      "confidenceValue",
      confianza === null ? "--%" : formatPercent(confianza)
    );

    setText(
      "analysisText",
      analisis || "Análisis generado a partir de los datos disponibles."
    );

    const tablaLocal = datos.tablaLocal || {};
    const tablaVisitante = datos.tablaVisitante || {};

    setText(
      "homePosition",
      tablaLocal.posicion != null ? tablaLocal.posicion : "-"
    );

    setText(
      "awayPosition",
      tablaVisitante.posicion != null ? tablaVisitante.posicion : "-"
    );

    setText(
      "homePoints",
      tablaLocal.puntos != null ? tablaLocal.puntos : "-"
    );

    setText(
      "awayPoints",
      tablaVisitante.puntos != null ? tablaVisitante.puntos : "-"
    );

    renderStats(datos.estadisticas || []);

    renderH2H(datos.h2h || []);

    renderForm(
      "homeForm",
      datos.ultimosLocal || [],
      local.nombre || "Local"
    );

    renderForm(
      "awayForm",
      datos.ultimosVisitante || [],
      visitante.nombre || "Visitante"
    );
  }

  // =========================================================
  // CANCHA 5D
  // =========================================================
  window.open5D = function () {
    show("pitch5d");
    const id = selectedFixtureId;
    if (!id) return;
    if (typeof window.loadLiveMatch === "function") window.loadLiveMatch(id);
  };

  // =========================================================
  // ESTADÍSTICAS
  // =========================================================

  function renderStats(stats) {
    const container = document.getElementById("matchStats");

    if (!container) return;

    if (!stats.length) {
      container.innerHTML =
        '<div class="empty-card">No hay estadísticas disponibles todavía.</div>';
      return;
    }

    const rows = [];
    const allTypes = {};

    stats.forEach(function (team) {
      (team.estadisticas || []).forEach(function (stat) {
        if (!allTypes[stat.tipo]) {
          allTypes[stat.tipo] = {
            home: "-",
            away: "-"
          };
        }
      });
    });

    stats.forEach(function (team, index) {
      (team.estadisticas || []).forEach(function (stat) {
        if (!allTypes[stat.tipo]) return;

        if (index === 0) {
          allTypes[stat.tipo].home = stat.valor ?? "-";
        } else {
          allTypes[stat.tipo].away = stat.valor ?? "-";
        }
      });
    });

    Object.keys(allTypes).forEach(function (tipo) {
      const item = allTypes[tipo];

      rows.push(`
        <div class="live-stat-row">
          <div class="live-stat-value live-stat-home">${item.home}</div>
          <div class="live-stat-name">${escapeHtml(tipo)}</div>
          <div class="live-stat-value live-stat-away">${item.away}</div>
        </div>
      `);
    });

    container.innerHTML = rows.join("");
  }

  // =========================================================
  // H2H
  // =========================================================

  function renderH2H(h2h) {
    const container = document.getElementById("h2hList");

    if (!container) return;

    if (!h2h.length) {
      container.innerHTML =
        '<div class="empty-card">No hay enfrentamientos disponibles.</div>';
      return;
    }

    container.innerHTML = h2h
      .slice(0, 5)
      .map(function (match) {
        return `
          <div class="h2h-row">
            <div class="h2h-date">${formatDate(match.fecha)}</div>

            <div class="h2h-teams">
              ${escapeHtml(match.local)}
              <br>
              <span>vs</span>
              <br>
              ${escapeHtml(match.visitante)}
            </div>

            <div class="h2h-score">
              ${match.golesLocal ?? 0} - ${match.golesVisitante ?? 0}
            </div>
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // ÚLTIMOS 5
  // =========================================================

  function renderForm(containerId, partidos, equipo) {
    const container = document.getElementById(containerId);

    if (!container) return;

    if (!partidos.length) {
      container.innerHTML =
        '<div class="empty-card">Sin datos</div>';
      return;
    }

    container.innerHTML = partidos
      .slice(0, 5)
      .map(function (match) {
        const esLocal =
          normalizar(match.local) === normalizar(equipo);

        const gf = esLocal
          ? Number(match.golesLocal || 0)
          : Number(match.golesVisitante || 0);

        const gc = esLocal
          ? Number(match.golesVisitante || 0)
          : Number(match.golesLocal || 0);

        let resultado = "E";
        let clase = "form-draw";

        if (gf > gc) {
          resultado = "G";
          clase = "form-win";
        }

        if (gf < gc) {
          resultado = "P";
          clase = "form-loss";
        }

        return `
          <div class="form-match">
            <span>${formatDate(match.fecha)}</span>
            <strong>${gf}-${gc}</strong>
            <span class="form-result ${clase}">
              ${resultado}
            </span>
          </div>
        `;
      })
      .join("");
  }

  // =========================================================
  // FECHA SELECCIONADA
  // =========================================================

  /*
   * NUEVO SISTEMA:
   *
   *       ‹   5 DE OCTUBRE   ›
   *
   * Rango permitido:
   * 30/09/2026 hasta 11/10/2026
   *
   * La lógica real de cambio de fecha está en fixtures.js.
   */

  function updateSelectedDateUI() {
    const selected =
      typeof window.getSelectedMatchIADate === "function"
        ? window.getSelectedMatchIADate()
        : null;

    if (!selected) return;

    const date = new Date(selected + "T00:00:00");

    if (Number.isNaN(date.getTime())) return;

    const title = date
      .toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long"
      })
      .toUpperCase();

    setText("selectedDate", title);

    const previous = document.getElementById("previousDate");
    const next = document.getElementById("nextDate");

    const minDate = new Date("2026-09-30T00:00:00");
    const maxDate = new Date("2026-10-11T00:00:00");

    if (previous) {
      previous.disabled = date <= minDate;
      previous.setAttribute(
        "aria-label",
        "Día anterior"
      );
    }

    if (next) {
      next.disabled = date >= maxDate;
      next.setAttribute(
        "aria-label",
        "Día siguiente"
      );
    }
  }

  // =========================================================
  // CAMBIAR FECHA
  // =========================================================

  window.changeDate = function (days) {
    if (typeof window.changeMatchIADate === "function") {
      window.changeMatchIADate(Number(days) || 0);
      updateSelectedDateUI();
    }
  };

  window.setDateMatchIA = function (dateString) {
    if (!dateString) return;

    if (typeof window.setMatchIADate === "function") {
      window.setMatchIADate(dateString);
      updateSelectedDateUI();
    }
  };

  // Compatibilidad por si queda algún elemento antiguo.
  // Ya no usa botones HOY/MAÑANA.
  window.selectDate = function (which) {
    let offset = 0;

    if (which === "tomorrow") {
      offset = 1;
    }

    if (which === "yesterday") {
      offset = -1;
    }

    if (typeof window.getSelectedMatchIADate !== "function") {
      return;
    }

    const actual = window.getSelectedMatchIADate();

    if (!actual) return;

    const date = new Date(actual + "T00:00:00");

    if (Number.isNaN(date.getTime())) return;

    date.setDate(date.getDate() + offset);

    const nuevaFecha =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    if (typeof window.setMatchIADate === "function") {
      window.setMatchIADate(nuevaFecha);
    }

    updateSelectedDateUI();
  };

  // =========================================================
  // ACTUALIZAR FECHA
  // =========================================================

  function updateDates() {
    updateSelectedDateUI();
  }

  // =========================================================
  // BOTONES DE FECHA
  // =========================================================

  function setupDateControls() {
    const previous = document.getElementById("previousDate");
    const next = document.getElementById("nextDate");

    if (previous) {
      previous.onclick = function () {
        window.changeDate(-1);
      };
    }

    if (next) {
      next.onclick = function () {
        window.changeDate(1);
      };
    }

    updateSelectedDateUI();
  }

  // =========================================================
  // INICIO
  // =========================================================

  document.addEventListener("DOMContentLoaded", function () {
    hideSplash();

    /*
     * Esperamos un instante para asegurarnos de que
     * fixtures.js haya inicializado la fecha.
     */
    setTimeout(function () {
      setupDateControls();
      updateDates();

      if (typeof window.loadFixtures === "function") {
        window.loadFixtures();
      }
    }, 50);
  });

})();
