# Progreso de Space Harvest

Diario del juego espacial, la entrada más reciente arriba. Antes vivía en el diario de Scrap Empire (IdleScrapyard); se separó el 2026-10-21.

## 2026-10-23 — Hito 0, segunda parte: página con PixiJS, textos es/en y ajustes

- Recuperado el núcleo de simulación de la rama `claude/space-harvest-hito0` (nunca se había fusionado) y añadido PixiJS 8, `index.html` y `src/main.ts`.
- Menú de inicio: estación con luces parpadeantes y estrellas en 3 capas con paralaje, botón JUGAR de 60 px, resumen de créditos/módulos y panel de ajustes (idioma, sonido, calidad, reducir movimiento) guardado en el navegador. Textos en `src/ui/i18n.ts` (es/en, test de que ambos tienen las mismas claves). Captura en `docs/captura-menu.png`.
- 10 tests, `npm run build` correcto, sin errores de consola en Chromium a 390×780.
- Qué probar: `npm install && npm run dev` en `space-harvest/` y abrirlo en el móvil.
- Sigue: logo animado, mapa con cámara arrastrable, publicación de prueba (GitHub Pages) y scripts de rendimiento y equilibrio.

## 2026-10-22 — Hito 0, primera parte: núcleo de la simulación

- `package.json`, TypeScript estricto, Vite y Vitest; `src/sim/core/` con `Rng`, contrato de módulo, registro, `Game` (pasos fijos, guardado con versión por módulo, carga con valor por defecto para módulos que faltan) y tope de ganancias offline. 5 tests.
- Qué probar: `npm install && npm test` en `space-harvest/`.
- Sigue: PixiJS, menú de inicio, mapa con paralaje y publicación de prueba.

## 2026-10-21 — Documento de diseño completo (borrador)

- Nuevo `docs/DISENO.md`: visión, público, pilares, tono y personajes, recursos y economía (con objetivos de ritmo), bucle y fases, los cinco módulos (núcleo, investigación con árbol de 32 nodos, agricultura con 8 cultivos, energía solar y minería de planetas con 6 destinos), sistemas transversales (pedidos, objetivos, racha, logros, sucesos, prestigio), monetización, interfaz, arte, arquitectura, plan de hitos, riesgos y 11 decisiones abiertas. El borrador anterior queda en `docs/BORRADOR_INICIAL.md`.
- Todos los números son propuestas que se validarán con una simulación de jugador antes de implementar.
- Sigue: revisar el documento con Mikel y cerrar las decisiones D1-D11; después, Hito 0.

## 2026-10-21 — Render completo de Space Harvest

- `prototipos/blender/estacion_completa.py` genera (Blender, 1080×1440, ~2 min en CPU) la estación con invernadero, núcleo, campo solar, nave de suministro y nave minera con láser sobre un planeta rocoso: `estacion-completa-render-3d.png`. Materiales con placas y células solares procedurales, brillo y viñeta.
- Mikel pide mezclar paquetes CC0: desde el servidor no se pueden descargar (kenney.nl, opengameart.org y quaternius.com bloqueados por la política de red). Hace falta que Mikel suba los `.glb` a `prototipos/blender/cc0/` (el script ya los carga con `cargar_cc0()`) y se apuntan en `docs/CREDITOS.md`.
- Límite: el planeta se ve plano y los módulos sencillos; con modelos CC0 y más detalle subirá.

## 2026-10-21 — Render 3D de prueba para Space Harvest

- Mikel: las capturas del prototipo no parecen de juego moderno. Respuesta: son arte provisional; prueba con Blender (`bpy`) en `prototipos/blender/modulo_granja.py` → `granja-render-3d.png` (metal y cristal, luz, brillo, profundidad de campo). Plan de calidad en la sección 11 de `space-harvest/docs/DISENO.md`.
- Sigue: decidir con Mikel si el arte se hace por script o con paquetes CC0; render del resto de módulos.

## 2026-10-21 — Space Harvest: nombre, escenas de prueba y capturas

- Mikel decide: nombre **Space Harvest**, motor PixiJS (Opción B), módulos centrados en agricultura, minería de planetas y energía solar. Documento actualizado (`space-harvest/docs/DISENO.md`, secciones 4 y 10).
- Prototipo con cuatro escenas (estación, invernadero, energía solar, minería) y capturas en `prototipos/espacio-pixi/capturas/`.
- Quitado «la mitad de la otra línea» de los destinos del tren y el barco (decidido por Mikel).
- Qué probar: `/prototipos/espacio/?escena=granja` (y `solar`, `mineria`) en el móvil y mirar los fps.

## 2026-10-21 — Borrador del nuevo juego espacial

- `space-harvest/docs/DISENO.md`: diseño de un idle de estación espacial hecho por módulos (investigación → agricultura → energía → minería → tripulación → fabricación → logística → exploración → colonias), arquitectura para añadir módulos sin romper partidas y plan de gráficos (SVG mejorado, PixiJS con sprites prerrenderizados desde Blender, o 3D low-poly) con prueba de concepto antes de decidir. Sin aprobar: preguntas para Mikel en la sección 9.

