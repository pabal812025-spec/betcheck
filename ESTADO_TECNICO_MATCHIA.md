# Estado técnico del proyecto MatchIA IA 5D

Última actualización: 10 de octubre de 2026

## Objetivo
Preparar una aplicación Android instalable en el teléfono, con el logo original de MatchIA IA 5D como ícono. Al tocarlo: ícono del teléfono → pantalla de carga «Tu fútbol en tiempo real» → inicio con los partidos.

El usuario quiere mantener el trabajo gratuito por ahora y probarlo primero en su propio teléfono. Antes de modificar código, explicar el cambio y pedir autorización. El usuario informó que la página inicial ya muestra los partidos y los controles vuelven a funcionar.

## Repositorio, HTML y despliegue
- Repositorio GitHub: `pabal812025-spec/betcheck`
- Rama: `main`
- Web original: https://betcheck-gilt.vercel.app/
- Copia de prueba: https://betcheck-gilt.vercel.app/instalable/index.html
- `index.html` en la raíz es la versión original y debe mantenerse intacta.
- `instalable/index.html` es la copia de prueba de instalación/PWA.
- `instalable/manifest.json`: nombre «MatchIA IA 5D», nombre corto «MatchIA», idioma es-AR, orientación vertical, inicio `/instalable/`, modo `standalone`, color azul oscuro e ícono `/instalable/icon.svg`.
- `instalable/sw.js`: service worker y caché de la versión de prueba.
- `instalable/icon.svg`: ícono provisional con fondo azul oscuro, líneas turquesa, pelota y texto MATCHIA. No se ha confirmado que sea el archivo original elegido por el usuario.
- El HTML de prueba actualmente oculta la capa splash mediante CSS en línea para que no bloquee los toques. La pantalla de carga deseada necesita revisarse con cuidado antes de reactivarla.

## CSS y JavaScript
- `css/style.css`: estilos compartidos; un cambio puede afectar a la página original y a la copia instalable.
- `js/app.js`: motor de análisis prepartido. El código indica que combina tabla, forma reciente, rendimiento local/visitante, goles, últimos cinco partidos, H2H y localía.
- `js/fixtures. js`: carga y renderiza partidos desde el endpoint de fixtures; maneja fecha, favoritos (máximo cinco), agrupación por liga y tarjetas.
- `js/Live. js`: lógica de partido/seguimiento en vivo (el nombre del archivo contiene un espacio antes de «js»).
- `js/ui.js`: navegación entre pantallas y controles de interfaz.
- Otros archivos de `js/`: `analisis.js`, `estadisticas.js`, `calibraciones. js`, `settings.js`, `profile.js`, `i18n.js`. Algunos nombres tienen espacios exactamente como aparecen en GitHub; no renombrar sin revisar todas las referencias.

## API deportiva
Proveedor identificado en el código: **API-Football / API-Sports**, base `https://v3.football.api-sports.io`.
La clave se lee en el servidor desde la variable de entorno `API_FOOTBALL_KEY`. Nunca colocar la clave privada dentro del HTML o JavaScript del navegador.

Endpoints propios:
- `/api/fixtures.js`: consulta partidos de una fecha mediante API-Football `/fixtures?date=...`; devuelve equipos, escudos, liga, hora, estado y marcador.
- `/api/match.js`: recibe el ID del partido; consulta datos del partido, estadísticas, tabla de posiciones y los últimos cinco enfrentamientos directos (H2H), cuando estén disponibles.
- `/api/stats.js`: recibe el ID del partido y consulta estadísticas del encuentro.

La variable `API_FOOTBALL_KEY` debe estar configurada como variable de entorno en el despliegue de Vercel. Hay que comprobar que la variable exista y que el plan/cuota del proveedor siga activo; no se debe asumir que funciona sin probarlo. No copiar secretos en documentos.

## Firestore / base de datos
En los archivos revisados hasta esta fecha no se ha confirmado una integración con **Firebase Firestore** ni una configuración de Firestore. No afirmar que existe ni crear una base de datos sin autorización. Si «Feedstore» se refería a otra herramienta, confirmar el nombre exacto antes de cambiar nada.

Los favoritos se guardan localmente en el navegador/dispositivo mediante `localStorage`, clave `matchia_favorite_teams`; eso no es Firestore y no sincroniza automáticamente entre dispositivos.

## Cambios previos en la copia de prueba
- `instalable/index.html`: ajustes de filtros de ligas, capa de carga y respuesta a los toques/navegación.
- `instalable/sw.js`: ajuste de caché.
- `instalable/manifest.json` y `instalable/icon.svg`: configuración PWA e ícono provisional.

Commits conocidos:
- `5810ca26249860f9f04a1393d5cb925685f70a68`
- `71b1eda840d091b516d0211ad1b20a2fa3936a43`
- `aee910131fa782ba9bad174b45fcba19ab80ad8f`

El usuario confirmó que ahora la página inicial muestra partidos y los controles funcionan.

## APK Android
- Todavía no se ha generado ni verificado ningún APK.
- Una PWA no es lo mismo que un APK Android.
- Pendiente: elegir/preparar un empaquetado Android gratuito, conservar las llamadas a la API en el servidor, usar el logo original como ícono, configurar la apertura y probar la instalación en el teléfono.
- No decir que el APK está listo hasta que exista un archivo real y esté verificado.
- No publicar en Play Store todavía; primero probar en el teléfono.

## Próximos pasos en orden
1. Localizar el archivo original del logo.
2. Comprobar la variable `API_FOOTBALL_KEY` en Vercel y probar que la API devuelve partidos sin exponer la clave.
3. Elegir el empaquetado Android gratuito más apropiado para crear el APK.
4. Configurar el ícono con el logo original y definir la secuencia de carga sin bloquear los controles.
5. Generar el APK, instalarlo y probarlo en el teléfono.
6. Después evaluar la publicación en Play Store.

## Reglas para continuar
- No cambiar el `index.html` de la raíz.
- Trabajar en `instalable/` para pruebas; tener cuidado con `css/` y `js/` compartidos.
- No hacer cambios de código o despliegue sin explicar el plan y recibir autorización explícita.
- No guardar claves de API, tokens, contraseñas ni secretos en este documento.
- Dar instrucciones simples, de a un paso, en español rioplatense.

## Frase para retomar en otro chat
«Continuemos MatchIA IA 5D. Leé ESTADO_TECNICO_MATCHIA.md en el repositorio pabal812025-spec/betcheck. Ahí está el estado técnico de HTML, CSS, JavaScript, API-Football, Firestore y APK. No modifiques el código hasta explicarme qué vas a hacer y recibir mi autorización.»
