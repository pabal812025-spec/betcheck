# MatchIA IA 5D — instalación Android

Esta carpeta contiene un proyecto Android separado para generar un APK de prueba sin modificar la web original ni la carpeta `instalable/`.

## Cómo se genera el APK

El flujo de GitHub Actions compila automáticamente el proyecto cuando cambian archivos de `instalacion/`. También se puede ejecutar manualmente desde la pestaña **Actions** del repositorio, seleccionando **Construir APK MatchIA** y pulsando **Run workflow**.

Cuando termina correctamente, abrir la ejecución y descargar el artefacto **MatchIA-APK-debug**.

## Qué hace esta primera versión

- Instala MatchIA como una aplicación Android.
- Abre la versión web alojada en Vercel: https://betcheck-gilt.vercel.app/instalable/index.html
- Usa una pantalla inicial sencilla mientras se abre.
- Necesita conexión a internet y que la web siga publicada.

**Importante:** este APK es una envoltura Android de la web, no incluye los archivos de la web dentro del APK. La disponibilidad de partidos y análisis depende de lo que actualmente funcione en la web; esta tarea no restaura ni cambia ninguna API.

## Instalar en el teléfono

1. Descargá `app-debug.apk` desde el artefacto de GitHub Actions.
2. Abrilo desde Descargas en Android.
3. Si Android lo solicita, autorizá temporalmente la instalación desde esa fuente.
4. Confirmá **Instalar** y abrí MatchIA.

Es un APK de prueba firmado con la clave de depuración automática de Android; no es todavía una versión para Play Store.
