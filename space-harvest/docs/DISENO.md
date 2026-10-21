# Space Harvest — documento de diseño

**Estudio:** Zenit Studio · **Plataforma:** Android (y versión web de prueba) · **Estado:** borrador completo para revisar con Mikel (2026-10-21).

> **Cómo leer este documento.** Todo lo marcado **[Decidido]** lo ha decidido Mikel. Todo lo marcado **[Propuesta]** lo propongo yo y necesita su visto bueno; los números son **provisionales** y se validan con una simulación de jugador antes de implementar (como se hizo en Scrap Empire). Las decisiones abiertas están en la sección 15, con mi recomendación. El borrador anterior, con las pruebas de gráficos, está en `BORRADOR_INICIAL.md`.

## Índice

1. Visión
2. Público, plataforma y sesiones
3. Pilares
4. Fantasía, tono y personajes
5. Recursos y economía
6. Bucle principal y progresión
7. Módulos (núcleo, investigación, agricultura, energía solar, minería de planetas; opcionales)
8. Sistemas transversales (pedidos, objetivos, racha, logros, sucesos, prestigio)
9. Monetización
10. Interfaz y experiencia de jugador
11. Arte, animación y sonido
12. Arquitectura técnica
13. Plan de hitos
14. Riesgos
15. Decisiones abiertas

---

## 1. Visión

**Space Harvest** es un juego incremental (idle) en el que el jugador construye y hace crecer una **estación espacial** que **cosecha, extrae y capta energía solar**. Empieza con un módulo de mando y un panel solar sobre un planeta cualquiera, y llega a ser una colonia con invernaderos, flotas de drones mineros y campos solares enormes, mientras una red de **investigación** desbloquea todo lo demás.

**La promesa al jugador:** *«Mira cómo crece tu estación mientras tú haces otra cosa»*: cada vez que vuelve hay algo nuevo (una cosecha lista, una investigación terminada, un cargamento de mineral) y una decisión corta y satisfactoria que tomar.

**Qué lo diferencia de Scrap Empire (el desguace):** el desguace es una línea de montaje con una sola cadena (chatarra → producto → camión). Aquí hay **tres sistemas que se juegan distinto y se alimentan entre sí** (agricultura, energía, minería) y una cuarta pieza, la investigación, que los abre. El crecimiento no es solo «subir números»: es abrir módulos, conectarlos y repartir lo que producen.

## 2. Público, plataforma y sesiones

- **Público:** jugadores de idle y de gestión ligera, de 14 años en adelante, que juegan a ratos en el móvil (transporte, pausas) y quieren **ver** su progreso, no leer tablas.
- **Plataforma:** móvil vertical (360-430 px de ancho), una mano, botones de al menos 44 px. Versión web para probar en GitHub Pages; empaquetado Android con Capacitor (ya probado en Scrap Empire).
- **Sesiones:** de 2 a 5 minutos, de 3 a 6 veces al día; **el juego sigue produciendo con la app cerrada** (tope de 1 h, 8 h con el Pase, igual que en Scrap Empire).
- **Idiomas:** español e inglés desde el primer día (archivo de traducciones).
- **Sin conexión:** todo funciona sin conexión; no hay servidor propio.

## 3. Pilares

1. **Un módulo, una sensación.** Cultivar, minar y captar energía se sienten distintos, pero comparten las mismas piezas de interfaz.
2. **Bonito antes que complejo.** Una captura de pantalla debe parecer de un juego de estudio grande (sección 11).
3. **El progreso se ve.** Cada mejora cambia lo que se dibuja: más paneles, plantas que crecen, drones en el cielo.
4. **Decisiones cortas.** Nada que obligue a más de 10 segundos de lectura.
5. **Nada de pagar para ganar.** Anuncios opcionales con recompensa y un pase de compra única.
6. **Coste cero.** Solo herramientas gratuitas y recursos CC0 o con licencia comercial, anotados con autor, enlace y licencia en `docs/CREDITOS.md`.
7. **Mikel aprueba todo lo nuevo** (regla de Zenit): las sesiones automáticas solo implementan lo aprobado.

## 4. Fantasía, tono y personajes

- **[Propuesta] Tono:** ciencia ficción cercana y amable (estación orbital, hidroponía, asteroides, planetas reconocibles), con humor ligero. Sin violencia, sin enemigos: el único «riesgo» son sucesos del espacio (tormentas solares, meteoritos) que se resuelven con un toque.
- **Mundo:** el jugador es el **jefe de estación** de un consorcio privado (**Zenit Orbital**, guiño al estudio). La Tierra envía **pedidos** y **contratos**; las colonias vecinas comercian.
- **[Propuesta] Tripulación con personalidad** (decisión abierta D3): cada módulo tiene un responsable con nombre, cara y frase, como los ayudantes de Scrap Empire: *Dra. Vega* (investigación), *Hortensia* (agricultura), *Sol* (energía), *Capitán Roca* (minería). Suben de nivel por horas de trabajo y dan bonificaciones.
- **Narrativa:** mínima y ambiental (mensajes de la Tierra, hitos con pequeñas escenas). Sin diálogos largos.

## 5. Recursos y economía

### 5.1 Recursos [Propuesta]

| Id | Recurso | Qué es | De dónde viene | Para qué sirve |
|---|---|---|---|---|
| `credits` | **Créditos (¢)** | Moneda blanda | Vender cosechas y minerales, pedidos, contratos, tocar «transmitir» | Comprar y mejorar todo |
| `energy` | **Energía (⚡)** | **Flujo** (⚡/s), con baterías | Paneles solares y reactores | La consumen los módulos; si falta, producen más despacio |
| `data` | **Datos (🔬)** | Moneda de investigación | Laboratorio | Solo para el árbol tecnológico |
| `crops` | **Cosechas (🌱)** | Una unidad por cultivo | Invernaderos | Vender, alimentar a la tripulación, contratos |
| `water` | **Agua (💧)** | Recurso intermedio | Refinería de hielo | La gastan los invernaderos |
| `ore` | **Minerales (⛏)**: hierro, silicio | Materia prima | Minería | Vender, mejoras de módulos grandes |
| `ice` | **Hielo (❄)** | Materia prima | Minería | Se refina en agua y combustible |
| `fuel` | **Combustible (⛽)** | Recurso intermedio | Refinería de hielo | Lo gastan los drones mineros |
| `he3` | **Helio-3** | Recurso raro | Minería de gigantes gaseosos | Reactores: mucha energía (final de partida) |

Nada de esto es «obligatorio» al principio: el jugador solo ve en pantalla los recursos que ya ha desbloqueado.

### 5.2 Reglas de economía [Propuesta]

- **Coste de compra:** `coste(n) = base × crecimiento^n`, con `crecimiento` entre 1,10 y 1,15 según el tipo (más caro de escalar lo que más produce).
- **Hitos de producción:** cada vez que se alcanzan 10, 25, 50, 100… unidades de una estructura, su producción se multiplica ×2 (y se ve: la estructura cambia de aspecto).
- **Energía:** cada módulo declara un consumo en ⚡/s. Si el total consumido supera lo producido y lo almacenado en baterías, **todos los módulos trabajan a la fracción disponible** (nunca se paran del todo ni se pierde nada). Mostrar siempre la barra de energía.
- **Valor de venta:** cada cosecha y cada mineral tiene un precio base en ¢ y una **demanda** que oscila lentamente (±20 %) para dar vida al mercado sin castigar.
- **Todo lo que se pueda probar va en `src/sim/`**, determinista con semilla (`Rng`), con el tiempo como parámetro.

### 5.3 Objetivos de ritmo (para validar con simulación) [Propuesta]

| Hito de la partida | Casual (4 sesiones de 5 min al día) | Atento (4 min cada 40 min) |
|---|---|---|
| Primer módulo ampliado (más paneles) | 2 min | 2 min |
| Laboratorio abierto | 15 min | 10 min |
| Primera cosecha vendida | 30 min | 20 min |
| Invernadero con 3 cultivos | 2 h | 1 h |
| Energía: baterías y reactor | 5 h | 2,5 h |
| Primer dron minero a la Luna | 1 día | 8 h |
| Todos los módulos centrales con nivel básico | 4 días | 1,5 días |
| Primer prestigio (Nueva Estación) | 10 días | 4 días |

Se escribirá un script de equilibrio (`scripts/balance.ts`, reutilizando el de Scrap Empire) con dos jugadores simulados para ajustar costes hasta cumplir estas metas.

## 6. Bucle principal y progresión

**Bucle de 30 segundos:** tocar «transmitir» o recoger una cosecha lista → ver subir los créditos → comprar una mejora → ver el cambio en la estación.

**Bucle de 5 minutos:** abrir un módulo → elegir qué mejorar → lanzar una investigación larga o un viaje de dron → cerrar.

**Bucle de un día:** volver tras horas fuera → cobrar lo producido (con la opción de duplicarlo con anuncio) → cobrar objetivos diarios y racha → decidir en qué invertir.

**Fases de la partida** (cada una con su salto visual):

1. **Módulo de rescate** (0-30 min): un panel solar, el módulo de mando y el toque.
2. **Estación pequeña** (30 min-2 h): laboratorio y primer invernadero.
3. **Estación habitada** (2 h-1 día): energía con baterías, más cultivos, refinería de agua.
4. **Estación minera** (1-4 días): drones a la Luna, Marte y el cinturón.
5. **Colonia orbital** (4-10 días): campos solares gigantes, gigantes gaseosos, reactores de helio-3.
6. **Nueva Estación** (prestigio): se reinicia con bonificaciones permanentes (sección 8.6).

## 7. Módulos

Todos los módulos siguen la misma **regla de módulos**: un módulo solo puede añadir sus propios recursos y reglas, y leer y escribir los recursos comunes; no toca el código de otro. Cada uno vive en `src/sim/modules/<id>/` con su estado, reglas, contenido en `src/data/<id>.json` y tests.

### 7.0 Núcleo [Propuesta]

- Módulo de mando de la estación (siempre presente), reloj, guardado con versión, ganancias con el juego cerrado, ajustes, menú de inicio y bucle del toque.
- **Toque «Transmitir»:** el jugador toca la antena y envía datos a la Tierra: da créditos (1 ¢ al principio, sube con investigación). Pierde importancia con el tiempo, igual que la pila de chatarra.
- **Registro de módulos:** lista ordenada de los módulos activos; la simulación los recorre en orden fijo (determinista).

### 7.1 Módulo — Investigación [Decidido: primero] 

**Qué es:** un laboratorio que produce **datos** y un **árbol tecnológico** que desbloquea los demás módulos, nuevas mejoras y bonificaciones. Es lo primero que se construye, por decisión de Mikel.

- **Laboratorio:** puestos de investigación; cada puesto produce 0,5 🔬/s y consume 1 ⚡/s. Coste del puesto: 120 ¢, crecimiento ×1,15. Máximo de 12 puestos visibles (se agrupan en consolas).
- **Investigación:** cada nodo tiene `id`, nombre, coste en datos, **duración** (de segundos a horas), requisitos y efecto. **Una investigación a la vez** (una segunda cola con mejora o anuncio). Las largas terminan con la app cerrada: es el motivo para volver.
- **Pantalla:** el árbol se dibuja como una **constelación** (nodos que se iluminan al investigarse), no como una lista.
- **Ramas y nodos iniciales (32)** [Propuesta]: `src/data/research.json`.

| Rama | Nodos (de más barato a más caro) |
|---|---|
| **Estación** | Antena mejorada · Paneles de montaje · Baterías de litio · Consolas de laboratorio · Refrigeración · Módulo de atraque · Segundo anillo · Reactor compacto |
| **Biología** | Hidroponía básica · Algas · Lechuga · Trigo enano · Tomate · Riego eficiente · Fresa · Cacao espacial |
| **Energía** | Orientación solar · Paneles de doble cara · Concentradores · Baterías de flujo · Almacén térmico · Paneles de perovskita · Reactor de helio-3 · Red de microondas |
| **Espacio** | Drones de carga · Cohetes de ida y vuelta · Radar · Refinería de hielo · Perforación profunda · Cinturón de asteroides · Recolectores de gas · Mapa de las lunas |

- **Coste de un nodo:** `datos = 20 × 2,3^(nivel del nodo)` (nivel 0 a 7 dentro de cada rama), duración = `30 s × 3,2^nivel` (de 30 s a ~19 h con el nivel 7). Los nodos de nivel alto piden antes el nodo previo de la misma rama y uno de otra rama (para obligar a mezclar).
- **Primera sesión de implementación:** simulación del laboratorio y del árbol con tests, y pantalla del árbol.

### 7.2 Módulo — Agricultura [Decidido: eje del juego]

**Qué es:** invernaderos hidropónicos con bandejas de cultivo. Plantas que crecen en tiempo real (se ven crecer), luz de cultivo violeta y cosechas que el jugador recoge (o que se recogen solas con una mejora).

- **Invernadero:** edificio con hasta 4 filas de 6 bandejas (24 bandejas). Cada bandeja cultiva un cultivo a la vez.
- **Ciclo de una bandeja:** `sembrar → crecer (tiempo) → lista`. Una bandeja lista **espera** a que el jugador toque (cosecha manual con pequeño bonus de ×1,5) o a que la **recolectora** (mejora, se investiga) la recoja sola. Al recoger se vuelve a sembrar sola.
- **Consumo por bandeja:** 0,4 ⚡/s y 0,05 💧/s mientras crece.
- **Cultivos** [Propuesta, desbloqueados por investigación]:

| Cultivo | Se desbloquea con | Ciclo | Rendimiento | Valor por unidad |
|---|---|---|---|---|
| Patata | (inicial) | 10 s | 1 | 1,5 ¢ |
| Algas | Algas | 25 s | 2 | 2,2 ¢ |
| Lechuga | Lechuga | 40 s | 3 | 2,5 ¢ |
| Trigo enano | Trigo enano | 90 s | 5 | 3 ¢ |
| Tomate | Tomate | 3 min | 8 | 4,5 ¢ |
| Fresa | Fresa | 8 min | 14 | 7 ¢ |
| Cacao espacial | Cacao espacial | 30 min | 40 | 12 ¢ |
| Flor luminosa | (hito de prestigio) | 2 h | 120 | 25 ¢ |

- **Costes:** bandeja 10 ¢ (primera), `×1,13` por bandeja; invernaderos adicionales 5 000 ¢ ×3 cada uno.
- **Comida y tripulación:** la tripulación consume comida (parte de la cosecha); si falta, **baja la productividad un 20 %, nunca se pierde la partida**.
- **Visual:** bandejas con plantas que crecen en tiempo real, luz violeta de cultivo (sprites con brillo), semillas que flotan, y un estado visible de «lista para cosechar» con un brillo dorado.
- **Mejoras:** más bandejas, riego eficiente (−25 % agua), luz mejorada (−15 % de ciclo), recolectora, cultivos de dos pisos, bioma de otro planeta (sección 8.6).

### 7.3 Módulo — Energía solar [Decidido: eje del juego]

**Qué es:** campos de paneles solares frente a la estrella. Es la **energía** que alimenta a todos los módulos.

- **Panel:** produce 1 ⚡/s al orientarse bien; coste 15 ¢, crecimiento ×1,12; los paneles se agrupan en **brazos** de hasta 6 y se ven en el mapa.
- **Orientación:** el sol se mueve despacio por el cielo (ciclo de 10 min); el jugador puede **orientar** los brazos con un toque para ganar +25 % durante 60 s. Con la mejora «seguimiento solar» se hace solo.
- **Baterías:** almacenan el excedente (capacidad por batería: 120 ⚡·s); permiten aguantar la noche orbital (el planeta tapa el sol el 35 % del ciclo de 10 min: la energía baja y las baterías se vacían; si no hay baterías, producción reducida).
- **Reactor de helio-3:** final de partida; produce 80 ⚡/s fijos consumiendo He-3.
- **Sucesos:** **tormenta solar** (+100 % de energía durante 2 min pero hay que **proteger** los paneles con un toque o pierden el 20 % de producción 5 min); **eclipse** (la noche más larga).
- **Visual:** paneles con reflejos que barren, rayos de energía a la estación, destello del sol, luces que se encienden de noche.

### 7.4 Módulo — Minería de planetas [Decidido: eje del juego]

**Qué es:** drones y cohetes que viajan a planetas y lunas, perforan y traen **minerales, hielo y gas**.

- **Flota de drones:** cada dron hace viajes: `ir (T) → perforar (P) → volver (T) → descargar`. Cada viaje lo gasta en combustible.
- **Planetas** [Propuesta, se abren con investigación]:

| Destino | Se abre con | Viaje (ida) | Qué trae | Notas |
|---|---|---|---|---|
| **Luna** | Drones de carga | 60 s | Hierro, silicio, algo de hielo | El primero; casi sin riesgo |
| **Marte** | Cohetes de ida y vuelta | 3 min | Hierro, silicio, hielo | Más carga |
| **Cinturón de asteroides** | Cinturón de asteroides | 5 min | Minerales raros (se venden caro) | Riesgo de impacto: el dron puede volver con daño |
| **Europa** | Mapa de las lunas | 10 min | Mucho hielo | Alimenta agua y combustible |
| **Titán** | Recolectores de gas | 15 min | Metano → combustible | |
| **Júpiter** | Recolectores de gas + Reactor de He-3 | 30 min | Helio-3 | Final de partida |

- **Carga y precios** [Propuesta]: dron nuevo 300 ¢ (×1,14); carga inicial 20 unidades por viaje; mejora de carga +10 por nivel; velocidad −5 % de viaje por nivel.
- **Combustible:** cada viaje cuesta `ida (s) × 0,02` ⛽; el combustible sale de la refinería (hielo → agua + combustible). Si falta, los drones esperan.
- **Visual:** drones que salen de la estación con estela de motor, láser de perforación con partículas en la superficie del planeta, contenedores que llegan y se acoplan.
- **Mejoras:** más drones, carga, velocidad, perforadora profunda (+40 % de producción por viaje), piloto automático (relanza solo).

### 7.5 Módulos opcionales (solo si Mikel los aprueba)

| Módulo | Qué aporta |
|---|---|
| **Tripulación** | Personajes con nivel por horas de trabajo (7.2); bonificaciones por módulo. |
| **Logística y comercio** | Naves que llevan cosechas y minerales a destinos con rutas, almacén y capitán, reutilizando las ideas de F3/F4/F5 de Scrap Empire. |
| **Exploración y colonias** | Sondas, sucesos y estaciones satélite para el prestigio. |

## 8. Sistemas transversales

### 8.1 Pedidos y contratos [Propuesta]
Cada 15 min aparece un **pedido** de la Tierra: «entrega N unidades de X en T minutos» con bonificación igual al valor ×1,5. La cantidad se calcula sobre lo que el módulo puede producir en el plazo, **siempre alcanzable** (lección de Scrap Empire). Los **contratos** (más tarde) son pedidos largos con recompensa especial.

### 8.2 Objetivos diarios [Propuesta, reutiliza el sistema de Scrap Empire]
3 objetivos al día (fácil, medio y difícil: ×1, ×2, ×4), de tipos distintos (cosechar N, minar N, completar una investigación, comprar N mejoras, mantener la energía por encima del 80 %, entregar un pedido). Premio: 10 min de producción cada uno y una **cápsula de suministros** gratis al cumplir los tres. Cambiar un objetivo con anuncio, una vez al día cada uno.

### 8.3 Racha de 7 días [Propuesta]
Premio diario que crece (10 min de producción el día 1, 2 h el día 7); si se falta un día, vuelve al 1.

### 8.4 Logros [Propuesta]
Lista corta (30) con aviso y premio pequeño: primera cosecha, primera investigación, 100 bandejas, llegar a Marte, 1 M de ¢, etc.

### 8.5 Sucesos [Propuesta]
Pequeñas interrupciones **siempre con solución de un toque y sin castigo duro**: tormenta solar, lluvia de meteoritos (se tocan los daños para repararlos y dan chatarra espacial como bonus), cometa de hielo (bonus de hielo), nave mercante (compra a precio alto durante 60 s).

### 8.6 Prestigio: «Nueva Estación» [Propuesta]
Tras alcanzar un hito (p. ej. 100 M de ¢ acumulados), el jugador puede **fundar una Nueva Estación**: se reinicia la partida y gana **Legado** (puntos proporcionales a `log10(¢ totales)`), que dan bonificaciones permanentes (+X % a la producción, nuevas cápsulas iniciales, nuevos cultivos y planetas). Se desbloquea un **bioma nuevo** en cada fundación (otro planeta de fondo, otra paleta). Alternativa descartable: no hacer prestigio y alargar con más planetas.

## 9. Monetización [Propuesta, igual que Scrap Empire]

- **Anuncios con recompensa, siempre opcionales:** empujón ×2 (30 min), «terminar investigación ya», cápsula de suministros dorada, duplicar lo ganado al volver, recuperar lo perdido por pasar del tope.
- **Pase de compra única** (precio como Scrap Empire, 2,99 €): quita anuncios (las recompensas se dan sin verlos) y sube el tope de ganancias fuera de 1 h a 8 h.
- **Nada** de cofres, bucles de pago, temporizadores agresivos ni anuncios forzados.
- **Plataformas:** AdMob y Google Play Billing en Android (plugins aparte, como Scrap Empire); la versión web usa anuncios de prueba.

## 10. Interfaz y experiencia de jugador

- **Pantalla principal = el mapa de la estación**, a pantalla completa, que se arrastra y se pellizca; los módulos se ven acoplados a una estructura central. Botones flotantes: ajustes, ranking (más tarde), sonido.
- **Barra superior:** ¢, energía (barra con ⚡ producido/consumido) y el recurso que toque según el módulo seleccionado.
- **Panel inferior** (como el de Scrap Empire): estado en una línea, **mejoras en primer plano** y datos extra plegados en «Más datos».
- **Navegación por módulos:** tocar un módulo abre su panel; una pestaña **Investigación** abre el árbol (constelación); **Pedidos** y **Objetivos** en botones laterales.
- **Menú de inicio** siempre visible: logo animado, estación al fondo con luces, botón grande «JUGAR / CONTINUAR» y resumen (¢, módulos).
- **Primeros 2 minutos (tutorial)** [Propuesta]: 1) tocar la antena; 2) comprar el segundo panel; 3) abrir el laboratorio; 4) lanzar la primera investigación; 5) ver el módulo nuevo acoplarse. Flechas y mensajes, sin pantallas de texto.
- **Accesibilidad:** texto grande, alto contraste, símbolos además de colores, reducir movimiento (como en Scrap Empire).
- **Juice:** monedas que vuelan al contador, destello al comprar, acoplamiento animado de cada módulo nuevo, números flotantes, vibración corta.

## 11. Arte, animación y sonido

- **Estilo [Propuesta]:** no pixel art. «Dibujo animado con luces»: colores saturados, siluetas claras, una luz de color por módulo (azul laboratorio, verde/violeta invernadero, naranja reactor, ámbar sol).
- **Motor [Decidido]:** **PixiJS (WebGL)**, con bloom, luces, partículas y paralaje.
- **Producción del arte [Decidido: mezcla]:** modelos 3D renderizados antes con **Blender** (scripts propios y paquetes CC0 como el Space Kit de Kenney y los de Quaternius) y empaquetados como hojas de sprites por módulo y estado (apagado, encendido, dañado, en obras). Texturas CC0 de ambientCG o Poly Haven. Los scripts de prueba (`prototipos/blender/`) ya generan el invernadero y la estación completa con metal, cristal, luz y profundidad de campo.
- **Estados por módulo:** cada módulo tiene sprites por nivel visual (cada hito de producción cambia el aspecto).
- **Animación:** plantas que crecen (secuencia de sprites), paneles con reflejos que barren, drones y cohetes con estela, láseres con partículas, luces que parpadean.
- **Rendimiento:** descarga inicial menor de 5 MB; módulos cargados al abrirse; 60 fps en un móvil de gama media y al menos 30 con la CPU frenada ×4; «Calidad baja» automática (sin partículas ni filtros), como en Scrap Empire.
- **Sonido:** sintetizado por código (Web Audio) para efectos, con música ambiental de acordes suaves en bucle y un interruptor de cada uno; sin archivos de terceros salvo que sean CC0 y se anoten.

## 12. Arquitectura técnica

- **Tecnología:** TypeScript estricto + Vite + Vitest; PixiJS para el dibujado; Capacitor para Android.
- **Carpetas:**

```
src/
  sim/
    core/            reloj, recursos comunes, Rng con semilla, guardado con versión, offline
    modules/<id>/    estado, reglas y tests de cada módulo (research, farming, solar, mining…)
    registry.ts      módulos activos y orden de ejecución
  data/              JSON por módulo (research.json, crops.json, planets.json, economy.json…)
  render/            PixiJS: escenas, sprites, luces, partículas (solo lee el estado)
  ui/                paneles, menú de inicio, textos es/en
tests/               Vitest de src/sim/
scripts/             balance.ts, perf.mjs, smoke.mjs, marketing/, blender/
```

- **Reglas heredadas de Scrap Empire:** simulación pura y determinista (sin DOM, sin PixiJS, sin `Math.random()`: usar `Rng`), el tiempo entra como parámetro, contenido en JSON con `id`/números/nombre, el dibujado se basa en ids y nada de números de juego en la interfaz.
- **Módulos:** cada uno exporta `init(state)`, `step(state, dt)`, `serialize/load` y su lista de compras. El registro los llama en orden fijo.
- **Guardado:** JSON con versión por módulo; un módulo ausente carga con valores por defecto, así añadir un módulo **nunca rompe** partidas antiguas.
- **Ganancias con el juego cerrado:** `advance(state, seconds)` en pasos de 1 s (con un paso mayor y fórmulas cerradas para horas si hace falta rendimiento).
- **Pruebas:** tests de simulación (Vitest), prueba de humo con Playwright (capturas), script de rendimiento (CPU ×4) y script de equilibrio con dos jugadores simulados.
- **Publicación:** GitHub Pages en cada subida a `main`; rama de pruebas por sesión; Android con Capacitor (APK de prueba en Actions; firma y AAB cuando Mikel tenga la cuenta de Play).

## 13. Plan de hitos

Cada hito acaba **jugable y publicado** en una versión web de prueba.

| Hito | Contenido | Criterio de «terminado» |
|---|---|---|
| **0 — Cimientos** | Repositorio (carpeta en Zenit), `CLAUDE.md`, esqueleto Vite+TS+Pixi, CI, menú de inicio, estación vacía con luces | Se abre en el móvil, 60 fps, menú y mapa con paralaje |
| **1 — Núcleo + Investigación** | Núcleo (toque, panel solar, guardado, offline), laboratorio y árbol de 32 nodos | Un jugador puede tocar, comprar paneles, abrir el laboratorio y completar 3 investigaciones, con la app cerrada incluida |
| **2 — Agricultura** | Invernadero, 4 primeros cultivos, cosecha manual y automática, comida | Cosecha y venta funcionando, plantas que crecen visibles |
| **3 — Energía solar** | Brazos de paneles, orientación, baterías, noche orbital, sucesos | La energía limita y se reparte; tormenta solar jugable |
| **4 — Minería de planetas** | Drones, combustible, Luna y Marte | Viajes con la app cerrada, láser y estelas |
| **5 — Sistemas** | Pedidos, objetivos diarios, racha, logros, anuncios, Pase | Todo guardado y probado |
| **6 — Pulido y publicación** | Arte final con Blender/CC0, sonido, tutorial, Android, ficha de la tienda | Prueba cerrada de Play |

**Cada hito** empieza con una **simulación de equilibrio** y termina con las entradas de PROGRESO y la prueba de rendimiento.

## 14. Riesgos

| Riesgo | Mitigación |
|---|---|
| El arte a coste cero no llega a «calidad de estudio» | Prueba de Blender hecha; mezcla de paquetes CC0; empezar por un módulo y revisar con Mikel antes de seguir |
| Rendimiento en móviles flojos | PixiJS + sprites prerrenderizados, calidad baja automática, presupuesto de 5 MB y medición en cada hito |
| Demasiado alcance | Solo tres ejes centrales; todo lo demás es opcional y requiere aprobación |
| Economía rota con tantos sistemas | Simulación de jugador desde el primer hito; todo en JSON con números ajustables |
| Mezclar proyectos y sesiones automáticas | Monorepo Zenit con carpetas por juego; cada juego con su `CLAUDE.md`, y el bloqueo manual en PROGRESO para trabajar sin pisarse |

## 15. Decisiones (todas las recomendaciones aceptadas por Mikel el 2026-10-21)

**[Decidido]** Mikel acepta las recomendaciones de D1-D11. Se conserva el texto original.

1. **D1 — Tono:** ciencia ficción amable y realista (recomendado) o fantasía espacial.
2. **D2 — Prestigio «Nueva Estación»:** sí, con Legado y biomas (recomendado) o no.
3. **D3 — Tripulación con personalidad** (recomendado, es el cariño del juego) o trabajadores anónimos.
4. **D4 — Moneda del toque:** el toque «Transmitir» da créditos (recomendado) o da energía.
5. **D5 — Energía como flujo limitante** (recomendado, da decisiones) o como moneda que se gasta.
6. **D6 — Nombres de la tripulación y del consorcio** (propuestos arriba; ¿te gustan?).
7. **D7 — Planetas reales** (Luna, Marte, Europa, Titán, Júpiter; recomendado, reconocible) o planetas inventados.
8. **D8 — Precio del Pase** igual que Scrap Empire (2,99 €) y mismo tope fuera (1 h / 8 h): ¿confirmas?
9. **D9 — Primer hito de trabajo:** 0 + 1 (cimientos, núcleo e investigación), como en el orden que pediste.
10. **D10 — Paquetes CC0:** que Mikel descargue Kenney Space Kit y Quaternius en `.glb` (las webs están bloqueadas desde el servidor) y los suba a `space-harvest/prototipos/blender/cc0/`.
11. **D11 — Sesión programada:** crearla cuando el Hito 0 esté aprobado y haya tareas en «Pendiente» (ver `docs/FEEDBACK.md`).
