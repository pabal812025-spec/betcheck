# Estado del proyecto MatchIA IA 5D

Última actualización: 10 de octubre de 2026

## Objetivo actual
Preparar una aplicación Android instalable en el teléfono del usuario, con el ícono del logo original de MatchIA IA 5D. Al tocar el ícono, debe mostrarse la pantalla de apertura/carga y luego la página de inicio con los partidos.

## Repositorio y publicación de prueba
- Repositorio GitHub: `pabal812025-spec/betcheck`
- Rama de trabajo: `main`
- Versión web original: https://betcheck-gilt.vercel.app/
- Versión web de prueba instalable: https://betcheck-gilt.vercel.app/instalable/index.html

## Lo que ya existía
- La aplicación web de MatchIA con su página inicial y partidos.
- El archivo raíz `index.html` es la versión original y debe conservarse sin cambios.
- Código compartido en las carpetas `css/` y `js/`.

## Cambios previos en la versión de prueba
Los siguientes cambios ya se habían hecho antes de crear este documento:
- `instalable/index.html`: ajustes de interacción de filtros de ligas, pantalla de carga y manejo de clics/navegación.
- `instalable/sw.js`: actualización de la estrategia de caché de la versión de prueba.
- `instalable/manifest.json`: manifiesto PWA con el nombre MatchIA IA 5D, inicio en `/instalable/` e ícono `/instalable/icon.svg`.
- `instalable/icon.svg`: actualmente contiene un ícono provisional de estilo tecnológico (fondo azul oscuro, líneas turquesa, pelota y texto MATCHIA). No se ha confirmado que sea el archivo del logo original elegido por el usuario.

Commits conocidos de cambios en la versión de prueba:
- `5810ca26249860f9f04a1393d5cb925685f70a68`
- `71b1eda840d091b516d0211ad1b20a2fa3936a43`
- `aee910131fa782ba9bad174b45fcba19ab80ad8f`

El usuario informó que ahora la página inicial muestra los partidos y que los controles ya funcionan. No volver a cambiar código sin hablarlo y tener autorización explícita.

## Lo que falta
1. Localizar el archivo de imagen del logo original de MatchIA IA 5D y usarlo como ícono de Android, sin sustituirlo por un diseño inventado.
2. Acordar y comprobar la secuencia de apertura: ícono del teléfono → pantalla «Cargando» (texto deseado: «Tu fútbol en tiempo real») → página de inicio.
3. Preparar y probar un paquete Android APK que el usuario pueda instalar en su propio teléfono.
4. Verificar el comportamiento del APK en el dispositivo antes de considerar una publicación en Play Store.

## Reglas importantes para continuar
- No modificar el `index.html` de la raíz: es la versión original.
- Trabajar separadamente en `instalable/` para las pruebas, pero tener cuidado con los recursos compartidos de `css/` y `js/`, porque pueden afectar a la versión original.
- No afirmar que el APK está listo: a la fecha de este documento, todavía no se ha generado ni verificado ningún APK.
- No afirmar que el logo original está localizado: el ícono SVG existente es provisional y no se ha confirmado como el logo elegido.
- El usuario quiere probar primero en su teléfono y mantener el proceso gratuito por ahora.
- Explicar los pasos de forma simple, uno por uno, en español rioplatense.

## Frase para retomar en otro chat
«Continuemos MatchIA IA 5D. Leé ESTADO_MATCHIA.md en el repositorio pabal812025-spec/betcheck antes de hacer cambios. No modifiques el código hasta explicarme qué vas a hacer y recibir mi autorización.»
