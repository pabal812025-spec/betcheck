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

  function hideSplash() {
    const splash = document.getElementById("splash");

    if (!splash) return;

    setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.transition = "opacity .25s ease";

      setTimeout(function () {
        splash.style.display = "none";
      }, 280);
    }, 1000);
  }

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
          <div class="live-stat-name">${tipo}</div>
          <div class="live-stat-value live-stat-away">${item.away}</div>
        </div>
      `);
    });

    container.innerHTML = rows.join("");
  }

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
            <span class="form-result ${clase}">${resultado}</span>
          </div>
        `;
      })
      .join("");
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value == null ? "" : value;
    }
  }

  function setImage(id, src) {
    const element = document.getElementById(id);

    if (!element) return;

    if (src) {
      element.src = src;
      element.style.display = "block";
    } else {
      element.removeAttribute("src");
      element.style.display = "none";
    }
  }

  function formatPercent(value) {
    let number = Number(value);

    if (!Number.isFinite(number)) {
      return "--%";
    }

    if (number <= 1) {
      number *= 100;
    }

    number = Math.round(number);

    return number + "%";
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit"
    });
  }

  function normalizar(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.selectDate = function (which) {
    const today = document.getElementById("dateToday");
    const tomorrow = document.getElementById("dateTomorrow");

    if (today) today.classList.remove("active");
    if (tomorrow) tomorrow.classList.remove("active");

    if (which === "tomorrow") {
      if (tomorrow) tomorrow.classList.add("active");

      if (typeof window.loadFixtures === "function") {
        window.loadFixtures(false, "tomorrow");
      }
    } else {
      if (today) today.classList.add("active");

      if (typeof window.loadFixtures === "function") {
        window.loadFixtures(false, "today");
      }
    }
  };

  function updateDates() {
    const now = new Date();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setText(
      "todayDate",
      now.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit"
      })
    );

    setText(
      "tomorrowDate",
      tomorrow.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit"
      })
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateDates();
    hideSplash();

    if (typeof window.loadFixtures === "function") {
      window.loadFixtures();
    }
  });

})();
