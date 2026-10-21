# Scrap Empire dentro de Zenit: estado de la mudanza

**Copia completa del código y la documentación de Scrap Empire: Idle Factory** (foto de `main` de `MikelJka/IdleScrapyard` del 2026-10-21, commit `563c6ac`), sin la carpeta `space-harvest/` (que vive en la raíz de Zenit).

## Qué sigue funcionando en el repositorio original (`MikelJka/IdleScrapyard`)

Mientras no se haga el traspaso, **todo lo operativo sigue allí** y esta carpeta es solo una copia de referencia:

- La web publicada en GitHub Pages (`https://mikeljka.github.io/IdleScrapyard/`) y su flujo «Probar y publicar».
- La **sesión programada** de desarrollo (cada 2 horas), que trabaja sobre ese repositorio, sus incidencias con la etiqueta `feedback` y las ramas `sesion/*`.
- Las capturas de las ramas `capturas` y `capturas-pruebas` que lee STONKS, y el APK de prueba de Android.

Los flujos de `scrap-empire/.github/workflows/` **no se ejecutan aquí** (GitHub solo lee los de la raíz del repositorio); están como referencia.

## Qué habría que hacer para traspasar de verdad (decisión de Mikel)

1. **Flujos de publicación:** pasar los de `scrap-empire/.github/workflows/` a la raíz de Zenit con `working-directory: scrap-empire` y filtros de rutas (`paths: scrap-empire/**`) para que cada juego tenga el suyo; GitHub Pages solo admite un sitio por repositorio, así que habría que publicar **todos los juegos bajo un mismo sitio** (`/scrap-empire/`, `/space-harvest/`, …) o usar otro alojamiento.
2. **URL pública:** cambiaría de `https://mikeljka.github.io/IdleScrapyard/` a `https://mikeljka.github.io/Zenit/scrap-empire/` (y la base de Vite, `vite.config.ts`, y las rutas del material de prensa).
3. **Sesión programada:** reconfigurarla para el repositorio y la carpeta nuevos (la hace Mikel en su configuración); mientras tanto habría que **pausar la del repositorio antiguo** para no trabajar dos veces.
4. **Incidencias `feedback`, ramas `capturas*` y STONKS:** mover o redirigir (el panel de STONKS lee esas ramas del repositorio antiguo).
5. **Historial de commits:** esta copia no lo lleva; el original lo conserva (se puede archivar el repositorio antiguo como solo lectura una vez traspasado).
6. **Android:** el identificador y los flujos de Capacitor no cambian, pero el workflow debe ejecutarse desde la carpeta nueva.

**Recomendación:** dejar el original operativo hasta tener el primer juego nuevo publicado en Zenit y entonces traspasar con un solo cambio coordinado (flujos, sesión programada y URL a la vez).
