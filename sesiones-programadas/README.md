# Sesiones programadas

Estas sesiones **se configuran en la cuenta de Mikel** (rutinas de Claude Code), no en este repositorio. Aquí solo queda su descripción para tenerla a mano. Zenit no tiene ninguna sesión propia.

| Sesión | Repositorio | Frecuencia | Texto |
|---|---|---|---|
| Desarrollo de Scrap Empire (IdleScrapyard) | `MikelJka/IdleScrapyard` (el original sigue operativo; ver `scrap-empire/MIGRACION.md`) | Cada 2 horas | `idlescrapyard.md` |
| Desarrollo de Space Harvest | `MikelJka/Zenit`, carpeta `space-harvest/` | **Aún no creada**: se crea cuando el Hito 0 esté en «Pendiente» | `space-harvest.md` (borrador preparado) |
| Desarrollo de Óxido | `MikelJka/OxidoGame` | (la configura Mikel) | **Falta**: el texto no estaba disponible al hacer esta copia; Mikel puede pegarlo aquí como `oxido.md` |

## Cómo funcionan (resumen común)

1. Leen `CLAUDE.md`, `docs/FEEDBACK.md`, `docs/PROGRESO.md` y `docs/ROADMAP.md` de su repositorio.
2. Procesan las incidencias con la etiqueta `feedback`.
3. Hacen **una** tarea aprobada (bugs primero, luego «Pendiente»), con tests.
4. Actualizan ROADMAP, FEEDBACK y PROGRESO, hacen commit y push a `main`, y comprueban que «Probar y publicar» termina bien.
5. Si no hay nada aprobado, terminan sin commits ni notificación; si hay algo que ver (lo publicado, una propuesta nueva o un fallo), avisan con una notificación.

## Bloqueo manual

Cuando Mikel trabaja a mano en una sesión de chat, se deja un aviso en cabeza de `docs/PROGRESO.md` del repositorio afectado («BLOQUEO … hasta las HH:MM») y las sesiones automáticas terminan sin tocar nada hasta esa hora. Para pausar una rutina de verdad hay que hacerlo en su configuración.
