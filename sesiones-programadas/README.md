# Sesiones programadas

Estas sesiones **se configuran en la cuenta de Mikel** (rutinas de Claude Code), no en este repositorio. Aquí solo queda su descripción para tenerla a mano. Desde el 2026-10-22 las sesiones de Óxido y de Scrap Empire trabajan en Zenit (Óxido en horas pares, Scrap Empire en horas impares).

| Sesión | Repositorio | Frecuencia | Texto |
|---|---|---|---|
| Scrap Empire (Zenit): sesión de desarrollo | `MikelJka/Zenit`, carpeta `scrap-empire/` (antes `MikelJka/IdleScrapyard`; ver `scrap-empire/MIGRACION.md`) | Cada 2 horas, en horas impares | `scrap-empire.md` (el texto antiguo, `idlescrapyard.md`, ya no vale) |
| Desarrollo de Space Harvest | `MikelJka/Zenit`, carpeta `space-harvest/` | **Aún no creada**: se crea cuando el Hito 0 esté en «Pendiente» | `space-harvest.md` (borrador preparado) |
| Óxido (Zenit): sesión de desarrollo | `mikeljka/zenit`, carpeta `oxido/` (antes `MikelJka/OxidoGame`; ver `oxido/MIGRACION.md`) | Cada 2 horas | `oxido.md` |

## Cómo funcionan (resumen común)

1. Leen `CLAUDE.md` (en Zenit, el de la carpeta del juego), `docs/FEEDBACK.md`, `docs/PROGRESO.md` y `docs/ROADMAP.md` de su repositorio.
2. Procesan las incidencias con la etiqueta `feedback` (en Zenit, además la del juego, p. ej. `oxido`).
3. Hacen **una** tarea aprobada (bugs primero, luego «Pendiente»), con tests.
4. Actualizan ROADMAP, FEEDBACK y PROGRESO, hacen commit y push a `main`, y comprueban que la publicación termina bien (en Zenit, el flujo común «Zenit: publicar web»).
5. Si no hay nada aprobado, terminan sin commits ni notificación; si hay algo que ver (lo publicado, una propuesta nueva o un fallo), avisan con una notificación.

## Bloqueo manual

Cuando Mikel trabaja a mano en una sesión de chat, se deja un aviso en cabeza de `docs/PROGRESO.md` del repositorio afectado («BLOQUEO … hasta las HH:MM») y las sesiones automáticas terminan sin tocar nada hasta esa hora. Para pausar una rutina de verdad hay que hacerlo en su configuración.
