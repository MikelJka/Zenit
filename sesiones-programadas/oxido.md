# Sesión programada: «Óxido (Zenit): sesión de desarrollo»

Frecuencia: cada 2 horas (desde el 2026-10-22). Repositorio: `mikeljka/zenit`, carpeta `oxido/`. Copia del texto configurado en la cuenta de Mikel (el paso 0b, la mudanza, ya se hizo el 2026-10-22 y no se repite porque `oxido/package.json` existe):

```text
Sesión automática de desarrollo del juego Óxido (Zenit Studio), que vive en la carpeta `oxido/` del repositorio GitHub mikeljka/zenit. Responde en español. Mikel no está mirando: no esperes respuestas a preguntas.

REGLA PRINCIPAL (orden de Mikel del 2026-10-17): Mikel aprueba todo lo nuevo. Solo se implementan arreglos de bugs y los puntos de «Pendiente» de `oxido/docs/FEEDBACK.md`. No metas funciones, contenidos, números ni reglas por tu cuenta, aunque estén en el roadmap. Si lo siguiente no está aprobado o deja algo sin decidir, escribe la propuesta con 2-4 opciones concretas en «## Propuestas para Mikel» de `oxido/docs/FEEDBACK.md`, súbela a `main` y avísale con una notificación. Coste cero: solo herramientas y recursos gratuitos con licencia comercial.

0. Arranque: añade mikeljka/zenit a la sesión con permiso de escritura (add_repo, access push) y clónalo. Lee `README.md` de la raíz (reglas comunes de Zenit). Si en cabeza de `oxido/docs/PROGRESO.md` hay un aviso «BLOQUEO … hasta las HH:MM» vigente, termina sin tocar nada.

0b. Mudanza (solo si `oxido/package.json` NO existe): […] (hecha el 2026-10-22; ver `oxido/MIGRACION.md`).

1. Lee y sigue `oxido/CLAUDE.md`. Lee `oxido/docs/FEEDBACK.md`, `PROGRESO.md`, `ROADMAP.md` y `CATALOGO.md`. Procesa las incidencias abiertas de mikeljka/zenit con las etiquetas `feedback` y `oxido` (usa `gh api` o las herramientas MCP de GitHub): cada una va a «Pendiente» con su `#N`, se comenta y se cierra. Una respuesta de Mikel a una propuesta cuenta como aprobada: pasa lo decidido a «Pendiente» y quita la propuesta.
2. Haz UNA tarea aprobada (bugs primero, luego «Pendiente» en su orden); si es grande, solo la primera parte. Tests en `oxido/src/sim/`. Si npm no descarga paquetes, prueba con bun test y tsc, sube una rama `sesion/AAAA-MM-DD-tema`, espera al workflow de prueba y llévala a `main` con fast-forward. No toques las carpetas de los otros juegos.
3. Actualiza ROADMAP, FEEDBACK y PROGRESO; commit en español que diga qué cambia para el jugador.
4. Tras el push a `main`, comprueba que el workflow de publicación de Óxido termina bien; si falla, arréglalo; si no puedes tras dos intentos, revierte tu commit y anota el bloqueo en PROGRESO.md.
5. Una tarea por sesión, unos 45 minutos como máximo. No pases de fase sin cumplir el criterio de «terminado» de la fase actual.

Si no hay nada aprobado y las propuestas siguen sin respuesta, termina sin commits ni notificación.

FIN DEL DESARROLLO: si todas las tareas de `oxido/docs/ROADMAP.md` están marcadas `[x]`, «Pendiente» está vacío, no hay propuestas abiertas ni incidencias de feedback, el desarrollo está terminado: anótalo en PROGRESO.md, súbelo, desactiva esta tarea programada (busca con list_triggers la llamada «Óxido (Zenit): sesión de desarrollo» y ponla con update_trigger enabled=false) y notifica a Mikel de que Óxido está terminado.

Notifica solo si hay algo que ver (lo publicado y qué probar, una propuesta nueva, la mudanza, el fin del desarrollo o un fallo). Resumen final de 6 líneas como máximo.
```
