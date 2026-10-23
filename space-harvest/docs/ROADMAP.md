# Roadmap de Space Harvest

Cada hito acaba **jugable y publicado** en una versión web de prueba, con la simulación de equilibrio y la prueba de rendimiento hechas. Orden y contenido según `docs/DISENO.md` (sección 13).

## Hito 0 — Cimientos

Terminado: se abre en el móvil a 60 fps, con menú de inicio y mapa de la estación con paralaje.

- [x] Esqueleto Vite + TypeScript + Vitest + PixiJS en `space-harvest/`, con `Rng`, reloj, guardado con versión y registro de módulos
- [ ] Publicación de prueba (GitHub Pages) y prueba de humo con capturas
- [ ] Textos es/en y ajustes (sonido, idioma, calidad, reducir movimiento)
- [ ] Menú de inicio con logo animado y estación al fondo
- [ ] Mapa de la estación con paralaje, luces y cámara que se arrastra y se pellizca
- [ ] Script de rendimiento (CPU ×4) y de equilibrio (dos jugadores simulados)

## Hito 1 — Núcleo + Investigación

Terminado: un jugador puede tocar, comprar paneles, abrir el laboratorio y completar 3 investigaciones, también con la app cerrada.

- [ ] Núcleo: toque «Transmitir», panel solar, créditos, ganancias con el juego cerrado
- [ ] Laboratorio (puestos de investigación, datos, consumo de energía)
- [ ] Árbol tecnológico de 32 nodos en `src/data/research.json`, con investigaciones largas
- [ ] Pantalla del árbol como constelación
- [ ] Tutorial de los primeros 2 minutos
- [ ] Equilibrio del Hito 1 con la simulación

## Hito 2 — Agricultura

Terminado: cosecha y venta funcionando, con plantas que crecen a la vista.

- [ ] Invernadero con bandejas y 4 primeros cultivos (patata, algas, lechuga, trigo enano)
- [ ] Cosecha manual y automática (recolectora), comida y tripulación
- [ ] Arte de la primera versión del invernadero (render de Blender)

## Hito 3 — Energía solar

Terminado: la energía limita y se reparte; la tormenta solar es jugable.

- [ ] Brazos de paneles, orientación, baterías y noche orbital
- [ ] Sucesos: tormenta solar y eclipse

## Hito 4 — Minería de planetas

Terminado: viajes con la app cerrada, láser y estelas.

- [ ] Drones, combustible, refinería de hielo, Luna y Marte
- [ ] Planetas siguientes por investigación

## Hito 5 — Sistemas

- [ ] Pedidos, objetivos diarios, racha, logros
- [ ] Anuncios y Pase

## Hito 6 — Pulido y publicación

- [ ] Arte final (Blender y paquetes CC0), sonido, Android (Capacitor), ficha de la tienda, prueba cerrada de Play
