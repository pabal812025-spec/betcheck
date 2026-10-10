// MatchIA - preferencias de configuración (no altera las probabilidades).
(function () {
  "use strict";
  const keys = {
    neuralMode: "matchia_neural_mode",
    aiNotifications: "matchia_ai_notifications",
    hapticFeedback: "matchia_haptic_feedback",
    neuralSound: "matchia_neural_sound",
    autoRefresh: "matchia_auto_refresh",
    showProbabilities: "matchia_show_probabilities"
  };
  function readBool(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === "true";
    } catch (_) { return fallback; }
  }
  function initSettings() {
    Object.keys(keys).forEach(function (id) {
      const input = document.getElementById(id);
      if (!input) return;
      input.checked = readBool(keys[id], input.checked);
      input.addEventListener("change", function () {
        try { localStorage.setItem(keys[id], String(input.checked)); } catch (_) {}
        if (id === "showProbabilities") {
          document.querySelectorAll(".probability-card").forEach(function (card) {
            card.hidden = !input.checked;
          });
        }
        const status = document.getElementById("settingsSaveStatus");
        if (status) status.textContent = "Preferencia guardada en este dispositivo.";
      });
    });
    const language = document.getElementById("matchiaLanguage");
    if (language) {
      try { language.value = localStorage.getItem("matchia_language") || "es"; } catch (_) {}
      language.addEventListener("change", function () {
        try { localStorage.setItem("matchia_language", language.value); } catch (_) {}
        if (window.MatchIAI18N) window.MatchIAI18N.setLanguage(language.value);
        const status = document.getElementById("settingsSaveStatus");
        if (status) status.textContent = language.value === "pt"
          ? "Idioma salvo neste dispositivo."
          : language.value === "en"
            ? "Language saved on this device."
            : "Idioma guardado en este dispositivo.";
      });
    }
    const probs = document.getElementById("showProbabilities");
    if (probs) document.querySelectorAll(".probability-card").forEach(function (card) {
      card.hidden = !probs.checked;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSettings);
  else initSettings();
})();