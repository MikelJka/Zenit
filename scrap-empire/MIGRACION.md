# Scrap Empire dentro de Zenit: estado de la mudanza

**Traspaso HECHO el 2026-10-22** (decisión de Mikel del 2026-10-22). Scrap Empire: Idle Factory vive, se desarrolla y se publica en la carpeta `scrap-empire/` de `MikelJka/Zenit`. `MikelJka/IdleScrapyard` **no se ha tocado** (ni archivado ni borrado: lo decide Mikel).

- **Web nueva:** https://mikeljka.github.io/Zenit/scrap-empire/ (portada de Zenit: https://mikeljka.github.io/Zenit/). El repositorio se llama `Zenit` con mayúscula (comprobado con la API de GitHub), por eso la base de Vite es `/Zenit/scrap-empire/`.
- **Antigua:** https://mikeljka.github.io/IdleScrapyard/ (sigue con la última versión publicada allí hasta que Mikel decida).

## Qué se hizo

- **Código y documentación:** la copia del 2026-10-21 ya era la última: `main` de IdleScrapyard sigue en el commit `563c6ac`, así que no había nada más que traer. El historial de commits sigue en IdleScrapyard.
- **Flujos** (en `.github/workflows/` de la raíz de Zenit; se borró `scrap-empire/.github/`, que GitHub no ejecutaba):
  - `scrap-empire-probar-rama.yml` — «Scrap Empire: probar rama»: tests, build, prueba de humo y capturas de las ramas en `capturas-pruebas-scrap-empire` (antes `capturas-pruebas`). Solo se lanza con cambios en `scrap-empire/**`.
  - `scrap-empire-android.yml` — «Scrap Empire: Android (APK de prueba)»: igual que antes, desde `scrap-empire/`.
  - `zenit-publicar.yml` — **«Zenit: publicar web»**, flujo común de publicación de todos los juegos (es el antiguo «Óxido: probar y publicar» de la sesión de Óxido, ampliado y renombrado): prueba cada juego de `web/juegos.txt`, construye el sitio con `.github/scripts/construir-web.sh` y lo publica. Además saca las capturas de Scrap Empire de `main` a la rama `capturas-scrap-empire` (antes `capturas`); si esa prueba de humo falla, la web se publica igual para no frenar a Óxido.
- **Web:** `scrap-empire` añadido a `web/juegos.txt` y enlazado en la portada `web/index.html`. Base de Vite y URL de `scripts/smoke.mjs`, `scripts/perf.mjs` y `scripts/marketing/index.mjs` cambiadas a `/Zenit/scrap-empire/`. El material de prensa (`/press/`) usa rutas relativas y se publica en https://mikeljka.github.io/Zenit/scrap-empire/press/.
- **Prototipo de gráficos de Space Harvest** (`/prototipos/espacio/` en la web antigua): ya no lo publica Scrap Empire; queda para la carpeta `space-harvest/` si Mikel lo quiere en la web de Zenit.
- **Partidas guardadas:** siguen en el mismo dominio (`mikeljka.github.io`), así que el navegador las conserva en la URL nueva.
- **Botón 🐞:** Scrap Empire no tiene botón de feedback dentro del juego (las incidencias se abrían a mano en GitHub). A partir de ahora se abren en `MikelJka/Zenit` con las etiquetas `feedback` y `scrap-empire`. Si Mikel quiere un 🐞 como el de Óxido, que lo pida en «Pendiente».
- **Sesión programada:** el texto nuevo está en `sesiones-programadas/scrap-empire.md` (cada 2 horas, en horas impares; Óxido va en horas pares).
- `CLAUDE.md`, `README.md` y docs: referencias a IdleScrapyard y su URL cambiadas a Zenit.

## Qué debe hacer Mikel

1. **Activar GitHub Pages** en Zenit: Settings → Pages → Source: **GitHub Actions** (el primer despliegue de Óxido falló con «Ensure GitHub Pages has been enabled»). Después relanzar «Zenit: publicar web» (Actions → Run workflow).
2. **Etiquetas** en `MikelJka/Zenit`: crear `scrap-empire` (y `feedback` si no existe).
3. **Incidencias `feedback` abiertas de IdleScrapyard:** esta sesión no tuvo acceso a ese repositorio (no se pudo añadir), así que no se pasaron a «Pendiente» ni se cerraron. Si hay alguna, cópiala a Zenit con las etiquetas `feedback` y `scrap-empire` (la sesión la recogerá) o añade IdleScrapyard a la sesión para que lo haga ella.
4. **STONKS:** cambiar el módulo «Zenit Studio» para que lea las capturas de `MikelJka/Zenit`, ramas `capturas-scrap-empire` (main) y `capturas-pruebas-scrap-empire` (ramas).
5. **Rutinas:** apagar la sesión programada antigua de IdleScrapyard si sigue activa (si no, trabajaría dos veces) y comprobar que la nueva usa el texto de `sesiones-programadas/scrap-empire.md`.
6. **Decidir si archiva IdleScrapyard** (o le pone en el README un enlace a la nueva URL).
7. **Óxido** (aviso, no es de esta carpeta): Óxido usa la base `/zenit/oxido/` en minúsculas; si su página sale en blanco en https://mikeljka.github.io/Zenit/oxido/, hay que ponerla en `/Zenit/oxido/`.
