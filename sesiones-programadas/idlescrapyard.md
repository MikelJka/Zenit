# Sesión programada: desarrollo de IdleScrapyard (cada 2 horas)

> **Antigua (2026-10-22):** Scrap Empire se mudó a Zenit; el texto vigente está en `scrap-empire.md`. Mikel debe apagar esta rutina si sigue activa.

Texto de la rutina tal como está configurada (copiado el 2026-10-21):

---

Sesión automática de desarrollo de Chatarrero (Idle Scrapyard), el primer juego de Zenit Studio. Repositorio: MikelJka/IdleScrapyard. Web: https://mikeljka.github.io/IdleScrapyard/. Responde en español. Mikel no está mirando: no esperes respuestas.

REGLA PRINCIPAL: Mikel aprueba todo lo nuevo. Solo se implementan arreglos de bugs y los puntos de «Pendiente» de docs/FEEDBACK.md. El diseño concreto se decide con Mikel por partes en «## Propuestas para Mikel» de docs/FEEDBACK.md; docs/DISENO.md es la estructura genérica y lo aprobado se resume en su sección «Decidido». No inventes contenido, números ni reglas: si falta decidir algo, escribe la propuesta con 2-4 opciones en «Propuestas para Mikel», súbela a main y avísale con una notificación. Coste cero: solo herramientas y recursos gratuitos con licencia comercial (preferible CC0), anotados en docs/CREDITOS.md. Nada de pixel art.

0. Arranque: si el repositorio está vacío o no tiene package.json, restaura el esqueleto del documento zenit/chatarrero-esqueleto-inicial.txt del Proyecto de Claude «Vg» (herramienta Projects, project_read). Cada archivo empieza en una línea «===== ARCHIVO: <ruta> =====» y llega hasta la siguiente (la primera línea es una explicación). Súbelo a main con el mensaje «Nace Chatarrero: esqueleto del proyecto y estructura de juego idle (Zenit Studio)» y comprueba que «Probar y publicar» termina bien. Si no puedes leer el Proyecto, avisa a Mikel y termina.
1. Lee y sigue CLAUDE.md. Lee docs/FEEDBACK.md, docs/PROGRESO.md y docs/ROADMAP.md. Procesa las incidencias abiertas con la etiqueta feedback: cada una va a «Pendiente» con su #N, se comenta y se cierra. Una respuesta de Mikel a una propuesta cuenta como aprobada: pasa lo decidido a «Decidido» de DISENO.md y a «Pendiente», y quita la propuesta.
2. Haz UNA tarea aprobada (bugs primero, luego «Pendiente» en orden); si es grande, solo la primera parte. Tests en src/sim/. Si npm no descarga paquetes, prueba con bun test y tsc, sube una rama sesion/AAAA-MM-DD-tema, espera al workflow «Probar rama» y llévala a main con fast-forward.
3. Actualiza ROADMAP, FEEDBACK y PROGRESO; commit en español.
4. Tras el push a main, comprueba que «Probar y publicar» termina bien; si falla, arréglalo; si no puedes tras dos intentos, revierte y anota el bloqueo en PROGRESO.md.
5. Una tarea por sesión, unos 45 minutos como máximo.

Si no hay nada aprobado y las propuestas siguen sin respuesta, termina sin commits ni notificación. Cuando Mikel responda a una parte del diseño, añade la siguiente como propuesta nueva. Notifica solo si hay algo que ver (lo publicado y qué probar, una propuesta nueva o un fallo). Resumen final de 6 líneas como máximo.

se debe de ejecutar cada 2 horas
