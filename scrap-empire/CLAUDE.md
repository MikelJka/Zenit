# Scrap Empire: Idle Factory (antes Chatarrero) — instrucciones para Claude

Juego incremental (idle) para Android (nombre global decidido por Mikel el 2026-10-20: «Scrap Empire: Idle Factory»; las claves de guardado conservan «chatarrero») que vive en la carpeta `scrap-empire/` del repositorio `MikelJka/Zenit` (antes `MikelJka/IdleScrapyard`; ver `MIGRACION.md`) de **Zenit Studio** (el estudio de Mikel). Se juega a ratos con una mano, en vertical. `docs/DISENO.md` es la estructura genérica de un juego idle; el diseño concreto se decide con Mikel en «Propuestas para Mikel» de `docs/FEEDBACK.md` y lo aprobado se resume en la sección «Decidido» de DISENO.md.

Idioma: el código (nombres de variables, funciones, tipos) en inglés; comentarios, textos del juego, commits y documentación en español. Los textos del juego pasarán por un archivo de traducciones para poder sacarlo también en inglés.

## Tecnología

- TypeScript estricto + Vite. Tests con Vitest. Dibujado en **2D isométrico (SVG) hecho por código**: bloques que parecen 3D low-poly, como los idle de fábrica (p. ej. el de serrería que enseñó Mikel); tiene que ser muy bonito y atractivo (decidido por Mikel el 2026-10-19; sustituye al 3D con Three.js). Mapa a pantalla completa que se arrastra y se pellizca, con botones flotantes. Si se usan recursos gráficos de terceros, CC0 (p. ej. Kenney). **Nada de pixel art**.
- **Política de coste cero** (orden de Mikel del 2026-10-19): no se compra nada. Solo herramientas gratuitas y recursos con licencia que permita uso comercial sin pagar (preferible CC0). Cada recurso de terceros se apunta en `docs/CREDITOS.md` con su autor, su enlace y su licencia.
- Versión web de prueba en GitHub Pages al subir a `main` cambios en `scrap-empire/**`, con el flujo común de Zenit «Zenit: publicar web» (`.github/workflows/zenit-publicar.yml` en la raíz; publica todos los juegos). URL: https://mikeljka.github.io/Zenit/scrap-empire/ (base de Vite `/Zenit/scrap-empire/`). Los flujos propios están en la raíz: «Scrap Empire: probar rama» y «Scrap Empire: Android (APK de prueba)». No toques las carpetas de otros juegos (`oxido/`, `space-harvest/`).
- Android: más adelante, la web empaquetada con Capacitor (una tarea del roadmap). Sin backend propio.
- La prueba de humo (`scripts/smoke.mjs`) guarda capturas: las de `main` en la rama `capturas-scrap-empire` de Zenit (las enseña el módulo «Zenit Studio» de STONKS) y las de las ramas en `capturas-pruebas-scrap-empire`. Si cambias la interfaz, actualízala para que siga capturando lo importante.

## Arquitectura

- `src/sim/` — reglas del juego: sin DOM, deterministas con semilla (`Rng`). Todo lo que se pueda probar va aquí y lleva tests.
- `src/ui/` — dibujado e interfaz. Lee el estado y llama a métodos de la simulación; no decide reglas.
- `src/data/` — contenido en JSON (generadores, mejoras, zonas, sucesos) con `id`, números y nombre. Nada de números de juego sueltos en la interfaz.
- Nunca uses `Math.random()` en `src/sim/`: usa `Rng`. El tiempo entra como parámetro (para calcular lo ganado con el juego cerrado y poder probarlo).
- Partida guardada: JSON con versión. No rompas partidas antiguas: valor por defecto para lo nuevo, o sube la versión y añade la migración.

## Móvil primero

Pantalla vertical de 360–430 px de ancho. Botones de al menos 44 px. Todo se hace con el pulgar; en PC funciona igual con el ratón.

## Cómo trabaja cada sesión automática

1. Lee `docs/FEEDBACK.md`, `docs/PROGRESO.md` y `docs/ROADMAP.md`. Procesa las incidencias abiertas de `MikelJka/Zenit` con las etiquetas `feedback` y `scrap-empire` (herramientas MCP de GitHub): cada una va a «Pendiente» de FEEDBACK.md con su `#N`, se comenta y se cierra.
2. Elige UNA tarea: primero los bugs, después «Pendiente» de FEEDBACK.md en su orden. **Mikel aprueba todo lo nuevo**: solo se implementa lo que está en «Pendiente» y los arreglos de bugs. Si lo siguiente no está aprobado, o falta decidir cómo funciona algo (qué contiene, números, reglas), escribe la propuesta con 2-4 opciones en «## Propuestas para Mikel» de FEEDBACK.md, súbela y avísale con una notificación. Si una tarea aprobada es grande, haz solo la primera parte.
3. Impleméntala con tests cuando toque `src/sim/`.
4. `npm test` y `npm run build`. No subas nada que falle. Si npm no puede descargar paquetes, prueba con `bun test` y tipos con `tsc`, sube una rama `sesion/AAAA-MM-DD-tema`, espera a que pase el workflow «Scrap Empire: probar rama» y llévala a `main` con fast-forward.
5. Marca la tarea en ROADMAP.md (y en FEEDBACK.md) y añade una entrada al principio de PROGRESO.md: fecha, qué se hizo, qué probar, qué sigue.
6. Commit y push a `main` con un mensaje en español que diga qué cambia para el jugador. Antes del push, `git pull --rebase` de `main` (la sesión de Óxido trabaja en el mismo repositorio). Comprueba que «Zenit: publicar web» termina bien.

Formato de los documentos (lo leen el panel de STONKS y las sesiones): fases con `## `, tareas con `- [ ]`/`- [x]`, entradas del diario con `## fecha — título` y viñetas.

Límites: una tarea por sesión, unos 45 minutos. Si algo se atasca tras dos intentos, anótalo en PROGRESO.md como bloqueo y para.
