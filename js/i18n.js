// MatchIA - traducción de textos visibles de la interfaz.
(function () {
  "use strict";
  const dictionaries = {
    pt: {
      "Tu fútbol en tiempo real":"Seu futebol em tempo real",
      "IA 5D · ANÁLISIS INTELIGENTE":"IA 5D · ANÁLISE INTELIGENTE",
      "IA 5D · ANÁLISIS AVANZADO":"IA 5D · ANÁLISE AVANÇADA",
      "PARTIDOS DEL":"JOGOS DO DIA",
      "Buscar equipos, ligas, partidos":"Buscar times, ligas e partidas",
      "FAVORITOS":"FAVORITOS",
      "EN VIVO":"AO VIVO",
      "Actualizar":"Atualizar",
      "No hay partidos en vivo":"Não há partidas ao vivo",
      "Los partidos aparecerán automáticamente":"As partidas aparecerão automaticamente",
      "PARTIDOS MÁS IMPORTANTES":"PARTIDAS MAIS IMPORTANTES",
      "PARTIDOS DEL DÍA":"PARTIDAS DO DIA",
      "Cargando partidos...":"Carregando partidas...",
      "FINALIZADOS":"ENCERRADOS",
      "Ver todos":"Ver todos",
      "← Volver":"← Voltar",
      "Pronóstico":"Prognóstico",
      "Estadísticas":"Estatísticas",
      "Forma":"Forma",
      "Empate":"Empate",
      "Confianza del análisis":"Confiança da análise",
      "🧠 ¿Por qué estas probabilidades?":"🧠 Por que essas probabilidades?",
      "📊 Datos utilizados":"📊 Dados utilizados",
      "Posición local":"Posição do mandante",
      "Posición visitante":"Posição do visitante",
      "Puntos local":"Pontos do mandante",
      "Puntos visitante":"Pontos do visitante",
      "⚔️ Enfrentamientos directos":"⚔️ Confrontos diretos",
      "📈 Últimos 5 partidos":"📈 Últimas 5 partidas",
      "⚙ AJUSTES DEL SISTEMA":"⚙ CONFIGURAÇÕES DO SISTEMA",
      "Personalizá tu experiencia MatchIA IA 5D.":"Personalize sua experiência MatchIA IA 5D.",
      "Modo Neural":"Modo Neural",
      "Activar análisis neuronal en tiempo real":"Ativar análise neural em tempo real",
      "Notificaciones IA":"Notificações de IA",
      "Alertas predictivas y recomendaciones":"Alertas preditivos e recomendações",
      "Vibración háptica":"Vibração háptica",
      "Respuesta táctil en interacciones":"Resposta tátil nas interações",
      "Sonido neural":"Som neural",
      "Efectos de sonido futuristas":"Efeitos sonoros futuristas",
      "Idioma":"Idioma",
      "Elegí el idioma de la aplicación":"Escolha o idioma do aplicativo",
      "Actualización automática":"Atualização automática",
      "Actualizar partidos y estadísticas":"Atualizar partidas e estatísticas",
      "Mostrar porcentajes":"Mostrar porcentagens",
      "Probabilidades de MatchIA":"Probabilidades do MatchIA",
      "Tus preferencias se guardan en este dispositivo.":"Suas preferências são salvas neste dispositivo.",
      "Preferencia guardada en este dispositivo.":"Preferência salva neste dispositivo.",
      "Inicio":"Início",
      "Buscar":"Buscar",
      "Favoritos":"Favoritos",
      "Perfil":"Perfil",
      "equipos guardados":"times salvos",
      "Todavía no tenés favoritos":"Você ainda não tem favoritos",
      "Usá el corazón en una tarjeta para guardar hasta cinco equipos.":"Toque no coração de um cartão para salvar até cinco times."
    },
    en: {
      "Tu fútbol en tiempo real":"Your football in real time",
      "IA 5D · ANÁLISIS INTELIGENTE":"AI 5D · INTELLIGENT ANALYSIS",
      "IA 5D · ANÁLISIS AVANZADO":"AI 5D · ADVANCED ANALYSIS",
      "PARTIDOS DEL":"MATCHES ON",
      "Buscar equipos, ligas, partidos":"Search teams, leagues, matches",
      "FAVORITOS":"FAVORITES",
      "EN VIVO":"LIVE",
      "Actualizar":"Refresh",
      "No hay partidos en vivo":"No live matches",
      "Los partidos aparecerán automáticamente":"Matches will appear automatically",
      "PARTIDOS MÁS IMPORTANTES":"TOP MATCHES",
      "PARTIDOS DEL DÍA":"TODAY'S MATCHES",
      "Cargando partidos...":"Loading matches...",
      "FINALIZADOS":"FINISHED",
      "Ver todos":"View all",
      "← Volver":"← Back",
      "Pronóstico":"Prediction",
      "Estadísticas":"Statistics",
      "Forma":"Form",
      "Empate":"Draw",
      "Confianza del análisis":"Analysis confidence",
      "🧠 ¿Por qué estas probabilidades?":"🧠 Why these probabilities?",
      "📊 Datos utilizados":"📊 Data used",
      "Posición local":"Home position",
      "Posición visitante":"Away position",
      "Puntos local":"Home points",
      "Puntos visitante":"Away points",
      "⚔️ Enfrentamientos directos":"⚔️ Head-to-head",
      "📈 Últimos 5 partidos":"📈 Last 5 matches",
      "⚙ AJUSTES DEL SISTEMA":"⚙ SYSTEM SETTINGS",
      "Personalizá tu experiencia MatchIA IA 5D.":"Customize your MatchIA IA 5D experience.",
      "Modo Neural":"Neural Mode",
      "Activar análisis neuronal en tiempo real":"Enable real-time neural analysis",
      "Notificaciones IA":"AI Notifications",
      "Alertas predictivas y recomendaciones":"Predictive alerts and recommendations",
      "Vibración háptica":"Haptic feedback",
      "Respuesta táctil en interacciones":"Touch response during interactions",
      "Sonido neural":"Neural Sound",
      "Efectos de sonido futuristas":"Futuristic sound effects",
      "Idioma":"Language",
      "Elegí el idioma de la aplicación":"Choose the app language",
      "Actualización automática":"Auto refresh",
      "Actualizar partidos y estadísticas":"Refresh matches and statistics",
      "Mostrar porcentajes":"Show probabilities",
      "Probabilidades de MatchIA":"MatchIA probabilities",
      "Tus preferencias se guardan en este dispositivo.":"Your preferences are saved on this device.",
      "Preferencia guardada en este dispositivo.":"Preference saved on this device.",
      "Inicio":"Home",
      "Buscar":"Search",
      "Favoritos":"Favorites",
      "Perfil":"Profile",
      "equipos guardados":"teams saved",
      "Todavía no tenés favoritos":"You don't have favorites yet",
      "Usá el corazón en una tarjeta para guardar hasta cinco equipos.":"Tap the heart on a card to save up to five teams."
    }
  };
  const original = new WeakMap();
  let observer;
  function translateTextNodes(root, language) {
    const dict = dictionaries[language];
    if (!dict || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      const current = node.nodeValue;
      const trimmed = current.trim();
      if (!trimmed) return;
      if (!original.has(node)) original.set(node, trimmed);
      const base = original.get(node);
      if (dict[base]) node.nodeValue = current.replace(trimmed, dict[base]);
      else if (dictionaries.es && dictionaries.es[base]) node.nodeValue = current.replace(trimmed, dictionaries.es[base]);
    });
  }
  function apply(language) {
    const lang = dictionaries[language] ? language : "es";
    document.documentElement.lang = lang;
    if (observer) observer.disconnect();
    // Restore known text nodes before applying another language.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (original.has(node)) {
        const value = node.nodeValue;
        const trimmed = value.trim();
        const base = original.get(node);
        if (trimmed && trimmed !== base) node.nodeValue = value.replace(trimmed, base);
      }
    }
    translateTextNodes(document.body, lang);
    observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNodes(node.parentNode, lang);
          else if (node.nodeType === Node.ELEMENT_NODE) translateTextNodes(node, lang);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.MatchIAI18N = { setLanguage: apply };
  function init() {
    let language = "es";
    try { language = localStorage.getItem("matchia_language") || "es"; } catch (_) {}
    apply(language);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();