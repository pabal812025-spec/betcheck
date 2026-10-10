// MatchIA - edición básica del perfil local.
window.editMatchIAProfile = function () {
  const current = document.getElementById("profileDisplayName");
  const name = window.prompt("¿Cómo querés que aparezca tu nombre?", current ? current.textContent : "Usuario MatchIA");
  if (name === null) return;
  const clean = name.trim().slice(0, 32);
  if (!clean) return;
  if (current) current.textContent = clean;
  try { localStorage.setItem("matchia_profile_name", clean); } catch (_) {}
};
(function () {
  function initProfile() {
    try {
      const name = localStorage.getItem("matchia_profile_name");
      const target = document.getElementById("profileDisplayName");
      if (name && target) target.textContent = name;
    } catch (_) {}
    function updateCount() {
      let count = 0;
      try {
        const list = JSON.parse(localStorage.getItem("matchia_favorite_teams") || "[]");
        count = Array.isArray(list) ? Math.min(list.length, 5) : 0;
      } catch (_) {}
      const metric = document.getElementById("profileFavoriteMetric");
      if (metric) metric.textContent = count + "/5";
    }
    updateCount();
    window.addEventListener("storage", updateCount);
    document.querySelectorAll('.nav-item[data-screen="profile"]').forEach(function (button) {
      button.addEventListener("click", updateCount);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProfile);
  else initProfile();
})();