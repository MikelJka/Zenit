# Sesión programada: Scrap Empire (Zenit): sesión de desarrollo (cada 2 horas, en horas impares)

Texto de la rutina tal como está configurada (copiado el 2026-10-22, en la sesión del traspaso). Sustituye a `idlescrapyard.md`.

---

Sesión automática de desarrollo de Scrap Empire: Idle Factory (antes Chatarrero / Idle Scrapyard), juego de Zenit Studio que vive en la carpeta `scrap-empire/` del repositorio GitHub MikelJka/Zenit. Responde en español. Mikel no está mirando: no esperes respuestas a preguntas.

REGLA PRINCIPAL: Mikel aprueba todo lo nuevo. Solo se implementan arreglos de bugs y los puntos de «Pendiente» de `scrap-empire/docs/FEEDBACK.md`. El diseño concreto se decide con Mikel por partes en «## Propuestas para Mikel» de ese FEEDBACK.md; `docs/DISENO.md` es la estructura genérica y lo aprobado se resume en su sección «Decidido». No inventes contenido, números ni reglas: si falta decidir algo, escribe la propuesta con 2-4 opciones, súbela a `main` y avísale con una notificación. Coste cero: solo herramientas y recursos gratuitos con licencia comercial (preferible CC0), anotados en `scrap-empire/docs/CREDITOS.md`. Nada de pixel art.

En el mismo repositorio trabaja otra sesión automática (Óxido, carpeta `oxido/`, en horas pares). No toques las carpetas de otros juegos. Antes de cada push haz `git pull --rebase` de `main`.

0. Arranque: añade MikelJka/Zenit a la sesión con permiso de escritura (add_repo, access push) y clónalo. Lee `README.md` de la raíz (reglas comunes de Zenit). Si en cabeza de `scrap-empire/docs/PROGRESO.md` hay un aviso «BLOQUEO … hasta las HH:MM» vigente, termina sin tocar nada.

0b. Traspaso (solo si `scrap-empire/MIGRACION.md` no dice que el traspaso está HECHO): Mikel decidió el 2026-10-22 mudar Scrap Empire del todo a Zenit. Sigue la guía de `scrap-empire/MIGRACION.md`:
   - Añade MikelJka/IdleScrapyard con permiso de escritura y clónalo. Trae a `scrap-empire/` todo lo que haya cambiado allí desde el commit `563c6ac` (código y docs; mandan los de IdleScrapyard).
   - Pasa los flujos de `scrap-empire/.github/workflows/` a `.github/workflows/` de la raíz con nombres que empiecen por «Scrap Empire:», `working-directory: scrap-empire` y filtros `paths: scrap-empire/**` (prueba de ramas, Android/APK, capturas). Las ramas de capturas pasan a llamarse `capturas-scrap-empire` y `capturas-pruebas-scrap-empire`.
   - Publicación: GitHub Pages solo admite un sitio por repositorio, así que debe haber UN flujo común «Zenit: publicar web» que compile cada juego con `package.json` (`scrap-empire/`, `oxido/`…) y publique cada uno en su subcarpeta. Si la sesión de Óxido ya lo creó, amplíalo en vez de duplicarlo. Ajusta `base` de Vite a `/<nombre exacto del repositorio>/scrap-empire/` (comprueba mayúsculas con la API de GitHub) y las rutas del material de prensa.
   - El botón 🐞 debe crear incidencias en MikelJka/Zenit con las etiquetas `feedback` y `scrap-empire`. Pasa las incidencias `feedback` abiertas de IdleScrapyard a «Pendiente» con su número antiguo, comenta en cada una que sigue en Zenit y ciérralas.
   - Cambia en `scrap-empire/CLAUDE.md` y docs las referencias a IdleScrapyard y su URL. No archives ni borres IdleScrapyard (lo decide Mikel).
   - Comprueba tests y build (npm o, si no descarga paquetes, bun test y tsc vía rama `sesion/AAAA-MM-DD-traspaso-scrap-empire` y su flujo) y sube a `main` con el mensaje «Scrap Empire se muda a Zenit: flujos, web e incidencias». Marca el traspaso como HECHO en MIGRACION.md, con la lista de lo que debe hacer Mikel: activar Settings → Pages → Source: GitHub Actions en Zenit si el despliegue falla por eso, cambiar en STONKS las ramas de capturas al repositorio y nombres nuevos, y decidir si archiva IdleScrapyard. Actualiza `README.md` y `sesiones-programadas/README.md` (la sesión de Scrap Empire ya trabaja en Zenit, cada 2 horas en horas impares; guarda este texto en `sesiones-programadas/scrap-empire.md`). Esta sesión solo hace el traspaso: notifica a Mikel con la nueva URL y lo que tiene que hacer, y termina.

1. Lee y sigue `scrap-empire/CLAUDE.md`. Lee `scrap-empire/docs/FEEDBACK.md`, `PROGRESO.md` y `ROADMAP.md`. Procesa las incidencias abiertas de MikelJka/Zenit con las etiquetas `feedback` y `scrap-empire`: cada una va a «Pendiente» con su `#N`, se comenta y se cierra. Una respuesta de Mikel a una propuesta cuenta como aprobada: pasa lo decidido a «Decidido» de DISENO.md y a «Pendiente», y quita la propuesta. Cuando Mikel responda a una parte del diseño, añade la siguiente como propuesta nueva.
2. Haz UNA tarea aprobada (bugs primero, luego «Pendiente» en su orden); si es grande, solo la primera parte. Tests en `scrap-empire/src/sim/`. Si npm no descarga paquetes, prueba con bun test y tsc, sube una rama `sesion/AAAA-MM-DD-tema`, espera al flujo de prueba y llévala a `main` con fast-forward.
3. Actualiza ROADMAP, FEEDBACK y PROGRESO; commit en español que diga qué cambia para el jugador.
4. Tras el push a `main`, comprueba que la publicación termina bien; si falla, arréglalo; si no puedes tras dos intentos, revierte tu commit y anota el bloqueo en PROGRESO.md.
5. Una tarea por sesión, unos 45 minutos como máximo.

Si no hay nada aprobado y las propuestas siguen sin respuesta, termina sin commits ni notificación.

FIN DEL DESARROLLO: si todas las tareas de `scrap-empire/docs/ROADMAP.md` están marcadas `[x]`, «Pendiente» está vacío y no hay propuestas abiertas ni incidencias de feedback, el desarrollo está terminado: anótalo en PROGRESO.md, súbelo, desactiva esta tarea programada (búscala con list_triggers por su nombre «Scrap Empire (Zenit): sesión de desarrollo» y ponla con update_trigger enabled=false) y notifica a Mikel.

Notifica solo si hay algo que ver (lo publicado y qué probar, una propuesta nueva, el traspaso, el fin del desarrollo o un fallo). Resumen final de 6 líneas como máximo.
