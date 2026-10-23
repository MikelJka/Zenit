# Progreso de Space Harvest

Diario del juego espacial, la entrada más reciente arriba. Antes vivía en el diario de Scrap Empire (IdleScrapyard); se separó el 2026-10-21.

## 2026-10-23 — Hito 0, parte 3: publicación de prueba

- Space Harvest entra en el flujo común «Zenit: publicar web» (`web/juegos.txt`, rutas del flujo y base de Vite `/Zenit/space-harvest/`). El sitio se construye en local sin errores. Al fusionar en `main` se publicará en `https://mikeljka.github.io/Zenit/space-harvest/` (ahora solo el punto azul de prueba).
- No lo he enlazado en la portada `web/index.html` para no enseñar un juego vacío; se añade el enlace cuando haya menú.
- Qué probar: tras fusionar en `main`, abrir esa dirección en el móvil.
- Sigue: prueba de humo con capturas, scripts de rendimiento y equilibrio.

## 2026-10-23 — Hito 0, parte 2: textos es/en y ajustes

- `src/data/texts.json` con los textos en español e inglés y `src/ui/i18n.ts` (función `t`, idioma del navegador, prueba de que no falta ningún texto). `src/ui/settings.ts`: ajustes (sonido, idioma, calidad, reducir movimiento) guardados en el navegador; lo inválido toma el valor por defecto y «reducir movimiento» parte de la preferencia del sistema.
- `npm test` (10 pruebas) y `npm run build` pasan. Aún no se ven en pantalla: la pantalla de ajustes llegará con el menú de inicio.
- Sigue: publicación de prueba (GitHub Pages).

## 2026-10-23 — Hito 0, parte 1: esqueleto del proyecto

- Nuevo esqueleto Vite + TypeScript estricto + Vitest + PixiJS en `space-harvest/`: `src/sim/core/` (`Rng` con semilla, `Clock` de pasos fijos, contrato `SimModule`), `src/sim/registry.ts` (registro de módulos, guardado con versión por módulo, ganancias con el juego cerrado) y una pantalla de prueba en `src/main.ts`.
- `npm test` (5 pruebas) y `npm run build` pasan. Todavía no cambia nada para el jugador.
- Qué probar: `npm run dev` y ver el punto azul sobre fondo oscuro.
- Sigue: publicación de prueba (GitHub Pages) con prueba de humo, después textos es/en y ajustes.

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

