# Space Harvest — instrucciones para Claude

Juego incremental (idle) de estación espacial para Android y web, de **Zenit Studio** (Mikel): **cosechar, minar planetas y captar energía solar**, por módulos (investigación primero). Se juega a ratos con una mano, en vertical. Vive en la carpeta `space-harvest/` del repositorio privado `Zenit` (monorepo de los juegos de Zenit). `docs/DISENO.md` es el documento de diseño completo; lo aprobado por Mikel está marcado como **[Decidido]** o en «Decidido» de `docs/FEEDBACK.md`.

Idioma: el código (nombres de variables, funciones, tipos) en inglés; comentarios, textos del juego, commits y documentación en español. Los textos del juego pasan por un archivo de traducciones (es/en) desde el primer día.

## Tecnología

- TypeScript estricto + Vite. Tests con Vitest. Dibujado con **PixiJS (WebGL)** [Decidido]: bloom, luces, partículas y paralaje. **Nada de pixel art.**
- Arte: sprites renderizados antes con **Blender** (scripts propios en `prototipos/blender/` y paquetes CC0: Kenney Space Kit y Quaternius), empaquetados por módulo y estado. Cada recurso de terceros se anota en `docs/CREDITOS.md` con autor, enlace y licencia.
- **Política de coste cero**: no se compra nada; solo herramientas gratuitas y recursos con licencia comercial sin pago (preferible CC0).
- Android más adelante con Capacitor (como Scrap Empire). Sin backend propio.

## Arquitectura

```
src/sim/core/          reloj, recursos comunes, Rng con semilla, guardado con versión, offline
src/sim/modules/<id>/  estado, reglas y tests de cada módulo (research, farming, solar, mining…)
src/sim/registry.ts    módulos activos y orden de ejecución
src/data/              JSON por módulo (research.json, crops.json, planets.json, economy.json…)
src/render/            PixiJS: escenas, sprites, luces, partículas (solo lee el estado)
src/ui/                paneles, menú de inicio, textos es/en
tests/                 Vitest de src/sim/
```

- La simulación es **pura y determinista**: sin DOM, sin PixiJS, sin `Math.random()` (usa `Rng`); el tiempo entra como parámetro (ganancias con el juego cerrado y tests).
- **Regla de módulos:** un módulo solo añade sus recursos y reglas y lee/escribe los recursos comunes; no toca el código de otro. Cada módulo exporta `init`, `step`, `serialize/load` y su lista de compras.
- El contenido va en JSON con `id`, números y nombre. Nada de números de juego sueltos en el dibujado ni en la interfaz. El dibujado se basa en ids.
- Partida guardada: JSON con versión por módulo. No rompas partidas antiguas: valor por defecto para lo nuevo, o sube la versión y añade la migración.

## Móvil primero

Pantalla vertical de 360–430 px, botones de al menos 44 px, todo con el pulgar; en PC funciona igual con el ratón. Accesibilidad: texto grande, alto contraste, símbolos además de colores, reducir movimiento.

## Cómo trabaja cada sesión automática

1. Lee `docs/FEEDBACK.md`, `docs/PROGRESO.md` y `docs/ROADMAP.md`. Si hay un aviso de **BLOQUEO** al principio de `docs/PROGRESO.md` (Mikel trabajando a mano hasta una hora), termina sin tocar nada.
2. Elige UNA tarea: primero los bugs, después «Pendiente» de `docs/FEEDBACK.md` en su orden. **Mikel aprueba todo lo nuevo**: solo se implementa lo que está en «Pendiente» y los arreglos de bugs. Si falta decidir algo (qué contiene, números, reglas), escribe la propuesta con 2-4 opciones en «Preguntas abiertas para Mikel» de `docs/FEEDBACK.md` y avísale con una notificación. Si una tarea aprobada es grande, haz solo la primera parte.
3. Impleméntala con tests cuando toque `src/sim/`; los números nuevos se validan con el script de equilibrio.
4. `npm test` y `npm run build`. No subas nada que falle.
5. Marca la tarea en `docs/ROADMAP.md` y `docs/FEEDBACK.md` y añade una entrada al principio de `docs/PROGRESO.md` (fecha, qué se hizo, qué probar, qué sigue).
6. Commit y push con un mensaje en español que diga qué cambia para el jugador; comprueba que la publicación de prueba termina bien.

Formato de los documentos: fases con `## `, tareas con `- [ ]`/`- [x]`, entradas del diario con `## fecha — título` y viñetas. Límites: una tarea por sesión, unos 45 minutos; si algo se atasca tras dos intentos, anótalo en PROGRESO como bloqueo y para.
