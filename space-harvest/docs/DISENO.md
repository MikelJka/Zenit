# Space Harvest: idle de estación espacial (borrador de diseño)

Estado: borrador (2026-10-21). **Decidido por Mikel el 2026-10-21:** el nombre es **Space Harvest**; el motor gráfico es la **Opción B (PixiJS)**; los módulos se centran en **agricultura, minería de planetas y recogida de energía solar** (investigación primero). El resto son propuestas: los números no están aprobados y las decisiones abiertas están al final, en «Preguntas para Mikel». Parte de lo aprendido en Scrap Empire: Idle Factory (este repositorio) y reutiliza su forma de trabajar: simulación pura en `src/sim/`, contenido en JSON, dibujado aparte, textos es/en, coste cero.

## 1. Idea en una frase

Una estación espacial que empieza como un módulo de rescate en órbita y crece, módulo a módulo, hasta ser una colonia con laboratorios, granjas, minas de asteroides y astilleros. Se juega a ratos, a una mano, en vertical, y sigue produciendo con el juego cerrado.

**Qué lo diferencia del desguace:** el desguace es una línea de montaje (chatarra → producto → camión). Aquí el jugador **construye una estación** y cada módulo nuevo es un sistema con sus propias reglas que se engancha a los anteriores. El crecimiento no es solo «subir números»: es abrir módulos, conectarlos y gestionar lo que consumen y producen entre sí.

## 2. Pilares

1. **Un módulo, una sensación.** Cada módulo nuevo se juega distinto (investigar, cultivar, minar, comerciar…), pero todos usan las mismas piezas de interfaz.
2. **Bonito antes que complejo.** El objetivo es que una captura de pantalla parezca de un juego de estudio grande (ver sección 7).
3. **A una mano, en sesiones de 2-5 minutos.** Todo con el pulgar; botones de 44 px como mínimo.
4. **Nada de pagar para ganar.** Anuncios opcionales con recompensa y un pase de compra única, como en Scrap Empire.
5. **Coste cero.** Solo herramientas gratuitas y recursos CC0 o con licencia comercial (anotados en `docs/CREDITOS.md`).

## 3. Bucle principal

1. La estación genera **energía** y **materiales** (recursos básicos).
2. El jugador gasta recursos en **mejorar y abrir módulos**.
3. Los módulos producen recursos nuevos o bonificaciones para los demás (p. ej. la investigación desbloquea módulos y mejora los existentes; la agricultura da comida que mantiene a la tripulación; la tripulación trabaja en los módulos).
4. Los **pedidos** y **contratos** (de la Tierra, de colonias vecinas) piden recursos y pagan **créditos** (la moneda blanda).
5. Con los créditos se compran módulos más grandes. Cada cierto tiempo hay un **hito** (nuevo anillo de la estación) que reinicia el ritmo con un salto visual grande.

Moneda y recursos (propuesta, a decidir): **créditos** (¢, moneda blanda), **energía** (⚡, se produce y se consume), **materiales** (hierro, hielo, silicio), **datos** (de la investigación), **comida** (de la agricultura), **combustible**.

## 4. Módulos y orden de construcción

Pedido de Mikel: ir construyendo módulos nuevos, **primero investigación, luego agricultura**. El orden propuesto sigue esa petición y deja para el final lo que depende de todo lo demás. Cada módulo es una unidad de trabajo de unas pocas sesiones y se puede probar solo.

| # | Módulo | Qué aporta | Depende de |
|---|---|---|---|
| 0 | **Núcleo** | Estación con módulo de mando, reloj, guardado, ganancias con el juego cerrado, menú de inicio | — |
| 1 | **Investigación** | Laboratorio: produce **datos**; árbol tecnológico que desbloquea módulos y mejoras; investigaciones largas que se terminan con el juego cerrado | Núcleo |
| 2 | **Agricultura** (eje del juego) | Invernaderos hidropónicos con bandejas: plantas que crecen en tiempo real, luz de cultivo, cosechas que se venden o alimentan a la tripulación; cultivos nuevos por investigación | Investigación |
| 3 | **Energía solar** (eje del juego) | Campos de paneles frente a la estrella: más paneles, orientación, baterías; la energía alimenta invernaderos y minas, y hay que repartirla | Núcleo, Investigación |
| 4 | **Minería de planetas** (eje del juego) | Torres de perforación y drones sobre la superficie de planetas distintos: minerales, hielo y gases; cada planeta se abre con investigación | Energía solar, Investigación |
| 5 | Tripulación (opcional) | Personajes que suben de nivel trabajando en un módulo | Agricultura |
| 6 | Logística y comercio (opcional) | Naves que llevan cosechas y minerales a destinos con rutas, almacén y capitán (ideas de F3/F4/F5 del desguace) | Agricultura, Minería |
| 7 | Exploración y colonias (opcional) | Sondas, sucesos y estaciones satélite para el prestigio | Todo lo anterior |

Los módulos 5-7 son opcionales y solo se hacen si Mikel los aprueba; el juego se centra en los tres ejes: **cosechar, minar y captar energía**, de ahí el nombre.

**Regla de módulos:** un módulo nuevo solo puede (a) añadir recursos y reglas propias, (b) leer y escribir los recursos comunes. No toca el código de otros módulos. Si lo necesita, lo hace a través de un «gancho» publicado (p. ej. «bonificación de investigación»).

### 4.1 Módulo 1 — Investigación (detalle propuesto)

- **Laboratorio** con N puestos de investigación. Cada puesto consume energía y produce datos por segundo.
- **Árbol tecnológico en JSON** (`src/data/research.json`): cada nodo tiene `id`, nombre, coste en datos, tiempo, requisitos y efecto (desbloquear módulo, multiplicador, nueva mejora). Unas 30 investigaciones en 4 ramas (Estación, Biología, Energía, Espacio).
- **Investigaciones largas** (de minutos a horas) que acaban con el juego cerrado: es el motivo para volver.
- **Cola de una investigación** al principio; una segunda con mejora o anuncio.
- Primera sesión de trabajo: simulación del laboratorio y del árbol con tests, y pantalla con el árbol dibujado como constelación (nodos que se iluminan), no como lista.

### 4.2 Módulo 2 — Agricultura (detalle propuesto)

- **Invernaderos** con bandejas de cultivo; cada cultivo tiene ciclo, rendimiento y consumo de energía y agua.
- La **comida** alimenta a la tripulación; si falta, baja la productividad (nunca se pierde la partida).
- Cultivos nuevos se desbloquean investigando (patata, algas, trigo enano, frutales…).
- Visual: bandejas con plantas que crecen en tiempo real y luz violeta de cultivo (un gran efecto visual barato).

## 5. Arquitectura (para poder añadir módulos sin romper nada)

```
src/
  sim/
    core/          reloj, recursos comunes, Rng con semilla, guardado con versión
    modules/
      research/    estado, reglas, tests
      farming/
      ...
    registry.ts    lista de módulos activos y sus ganchos
  data/            JSON por módulo (research.json, crops.json, ...)
  render/          dibujado (ver sección 7); solo lee el estado
  ui/              paneles, menú de inicio, textos es/en
```

- **Cada módulo** exporta `init(state)`, `step(state, dt)`, `serialize/load` y la lista de compras. El registro los llama en orden fijo, así la simulación es determinista.
- **Guardado:** JSON con versión por módulo. Un módulo que no está en la partida carga con valores por defecto, así añadir un módulo nunca rompe partidas antiguas (lección de Scrap Empire).
- **Tiempo:** entra siempre como parámetro (ganancias con el juego cerrado y tests).
- **Contenido en JSON**, nada de números sueltos en el dibujado.
- **Textos** en un archivo de traducciones desde el primer día (es/en).

## 6. Interfaz y progresión

- **Menú de inicio** igual de cuidado que el de Scrap Empire: logo animado, estación de fondo con las luces encendidas, botón grande de jugar.
- **Mapa de la estación**: se arrastra y se pellizca; los módulos nuevos se **acoplan** con una animación (el módulo llega, se acopla, se encienden las luces). Eso hace de recompensa cada vez.
- Panel inferior con las **mejoras en primer plano** y los datos extra plegados (lo aprendido con el panel de línea del desguace).
- **Objetivos diarios, racha de 7 días, logros** y pedidos especiales: se reutiliza el diseño de Scrap Empire.
- **Anuncios:** empujón ×2, «terminar investigación ya», cápsula de suministros gratis; el pase quita anuncios y sube el tope de ganancias fuera.

## 7. Cómo conseguir mejores gráficos (sin pagar nada)

Scrap Empire dibuja el mapa con SVG isométrico hecho por código. Es bonito y ligero, pero el SVG tiene techo: cada cambio repinta mucho y no admite luces, brillos ni partículas con calidad. Para un juego espacial, donde la luz, el brillo y la profundidad son lo que más se nota, propongo tres caminos, de menos a más ambicioso:

### Opción A — SVG isométrico mejorado (el mismo camino, más pulido)
- Mismo motor que ahora, con degradados, sombras suaves, luces de ventanas y estrellas animadas.
- **Ventaja:** cero riesgo, ya sabemos hacerlo. **Límite:** rendimiento flojo con muchas piezas (lo medimos en Scrap Empire: el dibujado era el 90 % del coste) y sin efectos de luz reales.

### Opción B — Canvas WebGL con PixiJS (recomendada para empezar)
- **PixiJS** (licencia MIT) dibuja en la tarjeta gráfica: miles de sprites a 60 fps en móviles flojos, **filtros de brillo (glow/bloom), luces, partículas y sombras** casi gratis.
- Arte: **sprites renderizados en 3D de antemano** (ver «Pipeline de arte»): se ven como modelos 3D con iluminación de calidad, pero en el juego son imágenes baratas de mover.
- Fondo con **paralaje** (varias capas de estrellas, nebulosas y planeta que se mueven a distinta velocidad), brillo en las ventanas y motores con partículas.
- **Ventaja:** salto de calidad claro con un coste de rendimiento bajo. **Riesgo:** hay que aprender el motor y montar el pipeline de arte.

### Opción C — Escena 3D low-poly con Three.js o Babylon.js
- Estación en 3D real (cámara con inclinación fija, no rotable: Mikel ya decidió que «ver desde diferentes ángulos no aporta» en Scrap Empire), con luz y sombras reales.
- **Ventaja:** el mejor aspecto posible. **Riesgo:** pesa más en móviles flojos, más trabajo de modelado y de optimización. Scrap Empire pasó de 3D a 2D por esto.

**Decidido (2026-10-21): Opción B.** Recomendación original: empezar con la **Opción B**, con una **prueba de concepto de una semana** (un módulo de estación con luces, glow y estrellas con paralaje, medido en un móvil flojo con el mismo script de rendimiento de Scrap Empire) antes de decidir. Si la prueba convence, se construye el juego sobre PixiJS; si no, se vuelve a SVG.

### Pipeline de arte a coste cero
1. **Modelos 3D:** paquetes CC0 como los de Kenney (Space Kit) y Quaternius; los que falten, se modelan con **Blender** (gratuito) o se generan por código.
2. **Render a sprites:** un script de Blender sin pantalla genera cada módulo en varias iluminaciones y estados (apagado, encendido, dañado) a 2×, con sombra de contacto y mapa de emisión para las luces.
3. **Empaquetado:** hojas de sprites comprimidas (WebP/PNG) por módulo, cargadas solo cuando el módulo se abre, para que la descarga inicial sea pequeña.
4. **Efectos:** brillo y luces con filtros del propio PixiJS, partículas con un emisor sencillo; nada de vídeo.
5. **Estilo:** no pixel art. Estilo «dibujo animado con luces»: colores saturados, siluetas claras, contornos finos y una luz de color por módulo (azul laboratorio, verde invernadero, naranja reactor).

### Presupuesto de rendimiento (propuesta)
- Descarga inicial menor de 5 MB y módulos descargados al abrirlos.
- 60 fps en un móvil de gama media; 30 fps estables con el procesador frenado ×4 (la prueba de `scripts/perf.mjs`).
- «Calidad baja» desde el primer día (sin partículas ni filtros) y detección automática, como en Scrap Empire.

### Material de anuncio
El mismo generador del desguace (`scripts/marketing/`): capturas con rótulo, gráfico de función y vídeo, generados desde el propio juego. En el juego espacial las capturas ganan mucho con las luces y las nebulosas.

## 8. Plan de trabajo propuesto

1. **Hito 0 — Prueba de gráficos** (la comparación de la sección 7, una semana): decide el motor.
2. **Hito 1 — Núcleo + Investigación**: estación mínima, laboratorio, árbol tecnológico, menú de inicio, guardado, ganancias fuera.
3. **Hito 2 — Agricultura**: invernaderos, comida, primeros cultivos desbloqueados por investigación.
4. **Hito 3 — Energía y Minería.**
5. **Hito 4 — Tripulación, Fabricación, Logística.**
6. **Hito 5 — Exploración, Colonias, anuncios, Android (Capacitor, ya probado en Scrap Empire).**

Cada hito acaba jugable y publicado en una versión web de prueba, igual que ahora.

## 9. Preguntas para Mikel

1. **Nombre y tono:** ¿ciencia ficción realista (estación orbital, hidroponía, asteroides) o más fantasía espacial (alienígenas, naves raras)? Nombres para elegir: *Orbit Works*, *Stellar Forge*, *Station Zero*, *Void Harvest* (a comprobar que no estén ocupados en Play).
2. **Motor gráfico:** ¿hacemos la prueba de gráficos (Opción B) antes de decidir, o prefieres seguir con SVG (Opción A) o ir directo a 3D (Opción C)?
3. **Orden de módulos:** ¿bien el orden de la tabla (investigación → agricultura → energía → minería…) o quieres otro?
4. **Repositorio:** este documento vive de momento en la carpeta `space-harvest/` del repositorio de Scrap Empire (separada del resto). Cuando lo apruebes, ¿creamos un repositorio nuevo para el juego (necesitará acceso para las sesiones automáticas)?
5. **Tripulación:** ¿personajes con personalidad como los ayudantes (más trabajo de arte, más cariño) o trabajadores anónimos?

## 10. Prueba de gráficos hecha (2026-10-21)

Prototipo en `prototipos/espacio-pixi/` (PixiJS 8, MIT; todo dibujado por código, sin archivos de terceros), publicado en `/prototipos/espacio/` con el contador de fps. Cuatro escenas con `?escena=`: `estacion`, `granja` (invernadero con bandejas, plantas que crecen y luz de cultivo), `solar` (paneles frente a la estrella con destello y rayos de energía) y `mineria` (torre de perforación con láser, drones y escombros sobre un planeta). Capturas en `prototipos/espacio-pixi/capturas/`.

- **Lo que ya se ve:** brillo (bloom barato), luces que parpadean, paralaje de estrellas, nebulosas y partículas.
- **Lo que falta para llegar a «calidad de estudio»:** arte renderizado en 3D con Blender (sprites con iluminación real y sombras), animaciones de personajes y módulos y pulido de composición. El prototipo usa formas con degradados.
- **Rendimiento:** en el servidor no hay tarjeta gráfica y no se puede medir; la cifra que vale es la del móvil de Mikel con el contador de fps de la página.

## 11. Cómo llegar a un aspecto moderno (2026-10-21, a petición de Mikel: «no se ve como un juego moderno»)

Las capturas de la sección 10 son arte provisional (formas planas con degradados). **El aspecto final no será ese.** Prueba hecha el mismo día: `prototipos/blender/modulo_granja.py` genera con **Blender** (módulo `bpy`, gratuito, se ejecuta sin pantalla en el servidor) un render 3D del invernadero con metal y cristal físicos, bordes biselados, plantas con translucidez, luz de cultivo, planeta con atmósfera, profundidad de campo y brillo; resultado en `prototipos/blender/granja-render-3d.png`. Tiempo de render: ~40 s a 720×960 en CPU, así que el pipeline es viable en el servidor o en GitHub Actions.

Qué hace que un juego se vea moderno y cómo se consigue sin pagar:
1. **Modelos 3D con materiales reales** (metal, cristal, plantas) renderizados antes en Blender y metidos en el juego como imágenes: es lo que se ve en la prueba.
2. **Más detalle de modelado** (paneles, tuberías, remaches, texturas CC0 de ambientCG/Poly Haven) y varias vistas y estados de cada módulo (apagado, encendido, dañado, en obras).
3. **Iluminación en el juego:** sprites con mapas de normales y luces dinámicas en PixiJS (la luz de cultivo ilumina las plantas de verdad).
4. **Posproceso:** brillo, viñeta, corrección de color y desenfoque de profundidad.
5. **Animación:** plantas que crecen, paneles que giran y drones, como secuencias de imágenes o animación por huesos con herramienta gratuita.
6. **Interfaz con diseño propio** (paneles de cristal, transiciones, iconos coherentes) y sonido.

Límite honesto: modelar y pulir cada módulo lleva tiempo (el invernadero de la prueba son ~150 líneas de script y se ve «de prototipo»). Para un resultado de estudio grande harían falta modelos más detallados y retoque a mano; los paquetes CC0 de Kenney y Quaternius pueden acelerar naves y props. Decisión pendiente: ¿seguimos con arte hecho por script (rápido, coherente) o buscamos más paquetes CC0 para mezclar?
