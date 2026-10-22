# Mudanza de Óxido a Zenit (2026-10-22)

Por decisión de Mikel del 2026-10-22, Óxido deja de desarrollarse en `MikelJka/OxidoGame` y pasa a vivir en la carpeta `oxido/` de `mikeljka/zenit`.

## Qué se copió

- **Todo** el contenido de `MikelJka/OxidoGame` en el commit `e2665a40396673e814f6195470cbbd63baeec9e4` (2026-10-22 09:04 UTC, «Prueba de humo: quitar los avisos antes de abrir la guía de primeros pasos»): código (`src/`), tests (`tests/`), scripts (`scripts/`), datos (`src/data/`), sonido (`src/audio/`), `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` y documentación (`docs/`, `CLAUDE.md`, `README.md`).
- Los documentos de OxidoGame sustituyen a la copia de Zenit del 2026-10-21 (eran más recientes). Se añade `docs/EQUILIBRIO.md`, que no estaba en la copia.
- No se copió el historial de git: queda en OxidoGame.
- `MikelJka/OxidoGame` **no se ha tocado** (ni modificado ni archivado).

## Qué se cambió para que funcione desde la subcarpeta

- **Workflows** (en `.github/workflows/` de la raíz de Zenit, solo se lanzan con cambios en `oxido/**` y trabajan en `oxido/`):
  - `oxido-probar-rama.yml` — «Óxido: probar rama»: tests, build, prueba de humo y capturas. Las capturas van a la rama `capturas-oxido` (antes `capturas`), para no chocar con otros juegos.
  - `oxido-publicar.yml` — «Óxido: probar y publicar»: tests de Óxido y despliegue en GitHub Pages.
  - `oxido-telegram.yml` — «Óxido: resumen a Telegram»: igual que antes, con la ruta `oxido/docs/PROGRESO.md` y la nueva URL. Sin el secreto `TELEGRAM_BOT_TOKEN` en Zenit no hace nada.
- **Publicación**: nueva URL **https://mikeljka.github.io/Zenit/oxido/** (`base: './'` en `vite.config.ts`, rutas relativas; la ruta de GitHub Pages distingue mayúsculas y el repositorio se llama `Zenit`).
- **Sitio de Zenit preparado para varios juegos**: `.github/scripts/construir-web.sh` construye en `_site/` la portada (`web/index.html`, en https://mikeljka.github.io/Zenit/) y cada juego listado en `web/juegos.txt` en su subcarpeta. Para publicar otro juego: añadirlo a `web/juegos.txt`, poner `base: './' (rutas relativas)` en su Vite, enlazarlo en `web/index.html` y crear su workflow copiando `oxido-publicar.yml`. Todos comparten el grupo de concurrencia `pages` sin cancelarse entre sí.
- **Botón 🐞**: crea las incidencias en `mikeljka/zenit` con las etiquetas `feedback`, `oxido` y el tipo (`bug`, `peticion` o `cambio`) (`src/ui/feedback.ts` y su test).
- **Panel de progreso**: la próxima sesión automática se calcula cada 2 horas (`SESSION_HOURS` en `src/ui/devPanel.ts`).
- **`CLAUDE.md` y `README.md`**: referencias y URL cambiadas a Zenit; la cola del 🐞 se lee de `mikeljka/zenit` filtrando por `feedback,oxido`.

## Qué debe hacer Mikel

1. Poner `mikeljka/zenit` **público** (Settings → General → Danger zone → Change visibility): con el plan gratuito, GitHub Pages solo funciona en repositorios públicos. Decisión de Mikel del 2026-10-22: público mientras dure el desarrollo; al terminar y publicar el juego, se vuelve a poner privado. Después, activar **Settings → Pages → Source: GitHub Actions** en `mikeljka/zenit` y relanzar «Óxido: probar y publicar» (pestaña Actions → Run workflow).
2. Crear en `mikeljka/zenit` las etiquetas `oxido`, `feedback`, `bug`, `peticion` y `cambio` si no existen (GitHub ignora en silencio las etiquetas que no existen al abrir una incidencia desde el 🐞, y la sesión filtra por `feedback` + `oxido`).
3. Partidas guardadas: siguen en el mismo dominio (`mikeljka.github.io`), así que el navegador las conserva al abrir la nueva URL. La partida en la nube (Gist) no cambia.
4. Cuando lo vea bien, apagar la sesión programada antigua de OxidoGame si sigue activa, y opcionalmente archivar `MikelJka/OxidoGame` o poner en su README un enlace a la nueva URL (la sesión no lo hace).
5. Telegram (opcional): copiar los secretos `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` de OxidoGame a Zenit si quiere seguir recibiendo el resumen.
