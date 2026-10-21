# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [x] **Tope de piezas en las huellas de salida** (2026-10-21, Mikel): cada producto del muelle admite como máximo `dock.productCap` piezas (**500 provisional: Mikel no dio el número «x»**, se cambia en `src/data/economy.json`; siempre cabe el doble de una tanda); al llegar, las carretillas de esa línea esperan con su tanda, el palé se llena y la línea para hasta que un camión se lleve producto. Efecto en los pedidos especiales: la cantidad pedida también se limita a la parte de lo que se llevan los camiones. **Hecho.**
- [x] **Equilibrio B4b y B6b** (2026-10-21, Mikel): abrir las zonas 8, 9 y 10 cuesta un 30 % menos (1 008 000 000 $, 3 360 000 000 $ y 16 800 000 000 $) y el nivel de máquina crece ×1,8 por nivel en vez de ×2,2. **Hecho.** Simulación: el casual abre todo en ~21 días (antes ~22) y el atento en ~5 (zona 10 a ~4,9 días); el bot apenas lo nota porque gasta en otras mejoras, así que se verá jugando.
- [x] **Objetivos diarios (B5-d, D2 P2 A)** (2026-10-21, Mikel): 3 al día (fácil, medio y difícil: N ×1, ×2, ×4) de tipos distintos entre cobrar camiones, entregar un producto, comprar mejoras, cumplir un pedido (solo el fácil), tocar la pila y mantener una línea trabajando; cada uno da 10 min de producción y los tres dan un camión dorado gratis (sin anuncio, 30 s a la vista); con anuncio se cambia un objetivo sin cumplir, una vez por objetivo. Botón «Hoy n/3» en la columna de la derecha. **Hecho.**
- [x] **Tren y barco: F3 rutas y contratos, F4 almacén intermedio y F5 capitán y anuncio** (2026-10-21, Mikel: «F3 bien, F4 bien, F5 bien»): aprobados los tres tal como están descritos en la Parte 21. **Números decididos el 2026-10-21 (Parte 26: R1, A1, C1)**; se hace F3, luego F5 y luego F4. **F3 hecho en la simulación y en la pantalla** (2026-10-21: destino local gratis y tres destinos que se compran a 10/100/1000 cargamentos; viaje ×1/×2/×4 y paga ×1,5/×3/×6 sobre la del transporte (cambiado el 2026-10-21 por Mikel: «paga ×3»); selector «Destino» en el panel del Taller de vagones y del Astillero); **decidido por Mikel el 2026-10-21: sin lo de «la mitad de la otra línea»** (los destinos lejanos no piden nada más) y paga ×1,5/×3/×6. **F5 hecho** (2026-10-21: capitán/jefe de estación por transporte, nivel por 1 h de trabajo, máx. 25, +10 % paga y −3 % viaje por nivel, se paga en dólares; anuncios «Viaje ya» y «Cargamento ×2» con 2 h de espera, sin espera con Pase). **F4 hecho** (2026-10-21: almacén por transporte, 500 de capacidad +250 por nivel hasta el 10, nivel a ×1,8; las carretillas esperan si está lleno; bonificación +5 % por cada 25 % lleno al salir, máx. +20 %; precio base: la mitad del precio del transporte, **confirmado por Mikel el 2026-10-21**).

- [ ] **Estilo visual: 2D muy bonito y atractivo** (2026-10-19, Mikel cambia el 3D por 2D: «no aporta nada ver esto desde diferentes ángulos»): escena del desguace en SVG dibujada por código, estilo dibujo animado. **Hecha la vista isométrica** (2026-10-19, como la captura de serrería que enseñó Mikel): mapa a pantalla completa (arrastrar y pellizcar), puestos con líneas amarillas, máquinas por nivel (1-2 por puesto), ayudantes de bloques, palés, carretillas, camiones de chatarra detrás y de expedición delante, dinero que salta al cobrar; botones flotantes y tienda en panel inferior. **Hechos los sonidos** (2026-10-19, sintetizados por código, con botón de silencio) **y las animaciones** (2026-10-19): productos distintos por línea, carretillas que giran, máquinas que trabajan, volquete, coches de fondo, ciudad industrial, nave en rayos X, nubes, pájaros y paseantes. Falta: pulir.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil. **Android, primera parte (N2, Mikel lo pide el 2026-10-21):** Capacitor configurado y workflow «Android (APK de prueba)» (`docs/ANDROID.md`); falta la clave de firma de Mikel para el AAB.

- [ ] **Fase 1 — bucle básico** (2026-10-19, diseño de las Partes 1-3 aprobado por Mikel): simulación de la chatarra (toque y camiones), la zona de aplastado con su máquina, carretillas, muelle y camiones de expedición, mejoras y dólares; después la pantalla principal y el guardado. **Hecha la simulación, la pantalla principal (sin 3D), el guardado automático y las ganancias con el juego cerrado** (2026-10-19); hecha la escena 2D. Los ayudantes (experiencia y niveles) van después.

- [x] **Ampliación a 8 zonas con sus personajes** (2026-10-19, L2): vigas (Grúa), piezas de motor (Pistón), motores (Bujía) y coches reconstruidos (Turbo); cada ayudante con una frase de personalidad en `src/data/zones.json`. **Hecho.**

- [x] **Pase de chatarrero (P1)** (2026-10-19): compra única que quita los anuncios y sube el tope de lo ganado fuera de 2 h a 8 h. Precio: 2,99 €. **Hecho** (en la web, compra de prueba).

- [x] **Racha de 7 días (D2)** (2026-10-19): premio diario que crece durante 7 días seguidos. Premios: el día 1 da 10 min de producción y sube hasta 2 h el día 7. Si se falta un día, vuelve al día 1. **Hecho.**

- [x] **Empujón con anuncio (E1)** (2026-10-19): ×2 a la producción durante 30 min viendo un anuncio, con espera entre uno y otro.

- [x] **Camión dorado con anuncio (S1)** (2026-10-19): aparece de vez en cuando; si se toca y se ve un anuncio, paga ×10 lo que hay en el muelle. Aparece cada ~15 min y espera 20 s a que lo toques. **Hecho** (anuncio de prueba en la web).

- [x] **Ayudantes con experiencia y niveles** (2026-10-19): un nivel nuevo disponible cada hora de trabajo de su zona, que se paga en dólares; cada nivel da +10 % de valor y +5 % de velocidad; nivel máximo 25. **Hecho** en la simulación y en la pantalla.

- [x] **Partida en varios dispositivos, primera parte** (2026-10-19, lo pide Mikel): código de partida que se copia y se pega en otro dispositivo, sin servidor. **Hecho.** Sincronización automática descartada por ahora (Mikel eligió S1, 2026-10-19), con el guardado detrás de `SaveStore` para poder cambiarlo luego.

- [x] **Tope de lo ganado fuera: 1 h sin pase** (2026-10-19, lo pide Mikel): antes 2 h; el pase sigue en 8 h. **Hecho.** La ampliación con anuncio, hecha (Parte 10: A3 + A4).
- [x] **Arreglos de la escena** (2026-10-19, Mikel): animaciones de las líneas suaves (arrancan y paran sin saltos), carretillas que salen a trabajar en cuanto hay producto, AGV con rutas pintadas en vez de gente paseando, coches de fondo que ya no se atraviesan. **Hecho.**

- [x] **Fondo y decorado (Parte 9: D1, D3, D4, D5)** (2026-10-19, lo elige Mikel tras ver un vídeo de la web): ciudad con autopista elevada, farolas, árboles, cartel y aceras (D1); puerto con vía y tren de mercancías, grúa pórtico, barco y agua (D3); suelo con texturas, charcos y ciclo día/noche con la hora real (D4); nave rellena con estanterías, oficina, depósitos, bidones, taquillas y palés, y andamios con lona y «Próximamente» en las zonas cerradas (D5). **Hecho.**
- [x] **Anuncios al volver (Parte 10: A3 + A4)** (2026-10-19): al volver tras estar fuera, un botón duplica lo ganado y, si se pasó del tope, otro recupera lo perdido (hasta el tope del Pase, 8 h). Con el Pase se dan sin anuncio. **Hecho.**
- [x] **Pedidos de Mikel tras probar en el Pixel 10** (2026-10-19): **hecho** (a revisar en el móvil): (1) chatarra total y cuello de botella visibles (barra de arriba con pila, entrada, demanda, palés y muelle, más el estado de cada línea: trabajando / sin chatarra / palé lleno); (2) piezas por segundo y unidades en el palé de cada línea; (3) una huella de salida por producto en el muelle con sus unidades; (4) focos de noche que iluminan la nave y lo de dentro; (5) hasta 9 máquinas visibles por puesto (cuadrícula) y «+N» si hay más; (6) arreglo de las carretillas que solo giraban: ahora hacen el viaje al muelle y cada línea abierta tiene la suya a la vista; (7) tocar un puesto abre sus mejoras (también el muelle y la carretera de camiones) y desaparece el botón compartido; los ajustes y el código de partida pasan al ⚙; (8) animación al llegar a un nivel múltiplo de 5 de cualquier mejora, y la máquina se transforma cada 5 niveles de máquina (depósitos, segunda chimenea, dorado, neón, corona y aura); (9) menos parpadeo (ver PROGRESO).
- [ ] **Ranking mundial de dinero generado** (2026-10-19, Mikel elige Firebase): **hecho el código** (`src/ui/ranking.ts`, botón 🏆, apodo, top 50, envío cada minuto, reglas en `docs/RANKING.md`). Falta que Mikel cree el proyecto de Firebase y pegue su configuración en `src/data/firebase.json`.
- [ ] **Calidad profesional** (2026-10-19, Mikel: «que sea un videojuego profesional y no parezca tan indie», «mejora la calidad general del juego», «amplía el roadmap para seguir esta noche sin mí»): aprobada la Fase 2b del ROADMAP.md entera, tarea por tarea y sin preguntar; los cambios de reglas o de números siguen pasando por propuesta.
- [x] **Propuestas de la noche, decididas «como mejor veas»** (2026-10-19): G4 + G1 (contador `?fps=1` hecho), L1 (en el roadmap), M3 (premio cada 5 niveles de máquina: 10 min de producción de la línea; **hecho**) y O4 (objetivo a la vista + logros; **hecho**).

- [x] **Pantalla más limpia: KPI en el panel de la línea** (2026-10-20, Mikel): quitados de la pantalla los textos de estado y «0/200» de cada línea y la barra con pila, entrada y demanda; ahora salen al tocar la línea (chatarra que entra, pila, lo que podría aplastar, palés, muelle y atascos). La pila muestra «+N/s» cuando está vacía. **Hecho.**
- [x] **Logística por tandas y mejoras dentro de cada línea (T3)** (2026-10-20, Mikel elige T3 con tanda de 10 + 5 por nivel y precios iguales): cada línea tiene sus carretillas y su nivel de tanda; cada viaje dura 10 s y el palé de salida del muelle solo suma cuando llega la tanda entera. Las mejoras «Carretilla extra» y «Tanda de carretillas» están en el menú de cada línea; el camión de salida sigue siendo común (menú del muelle). El palé siempre admite una tanda entera. Partidas antiguas: las carretillas comunes se reparten entre las líneas abiertas. **Hecho.**
- [x] **Revisar números de chatarra** (2026-10-20, Mikel: entran 31/s y la pantalla decía que las líneas consumían 517/s): 517/s es lo que las máquinas podrían aplastar, no lo que consumen; ya se rotula así. **Hecho** el rótulo; el equilibrio sigue en la Parte 18.
- [x] **Rendimiento (N4)** (2026-10-20): medido con `scripts/perf.mjs` (CPU ×4, partida de 2 días): el coste es dibujar el SVG (el 90 %; el código del juego, un 7 %), sobre todo las 5 400 piezas de máquinas y trabajadores. Ahora: las líneas fuera de la pantalla no se animan, la escena se redibuja a 30/s en táctiles (y a 20/s si va justo), y hay «Calidad baja» (sin nubes, pájaros, autopista, tren ni animaciones CSS y bordes sin suavizar) que se activa sola tras 3 s a menos de ~22 fps y se puede fijar en ajustes. Resultado en la prueba lenta: de ~11 a ~25 fps. **Hecho**; si siguen los parpadeos en el móvil, el siguiente paso es dibujar las máquinas en `<canvas>` (aviso de Mikel).
- [x] **Textos en inglés (N3)** (2026-10-20): selector Español/English en ajustes (por defecto el idioma del navegador); todos los textos, nombres de zonas, ayudantes y logros traducidos; una prueba exige que no falte ninguna traducción. **Hecho.**

- [x] **Equilibrio B1b y B2a** (2026-10-20, Mikel): abrir las zonas 3 y 4 cuesta un 50 % más (90 000 $ y 4 500 000 $; la zona 4 llega a ~4,3 h jugando sin parar) y el nivel de máquina crece ×2,2 por nivel en vez de ×4 (el nivel 30 pasa a ser alcanzable). **Hecho.**
- [x] **Pedidos especiales (B3-a)** (2026-10-20, Mikel: «ok, con cuidado de que no se buguee»): cada 15 min (desde que acaba el anterior) aparece un pedido de una línea abierta y con chatarra, con 2 min de plazo; se muestra en la barra de arriba con cuenta atrás y avance. **Cambio respecto a la propuesta:** la cantidad no son «3 min de producción» (no cabría en 2 min) sino lo que la línea puede producir y llevar en 62 s, siempre en tandas enteras de sus carretillas (lo entregado cuenta cuando la tanda llega al muelle). Cumplirlo paga una bonificación igual al valor de lo pedido (el doble en total); si no se cumple, no pasa nada. Si no hay línea posible, mira otra vez al minuto. Pruebas: aparece, se cumple una sola vez, caduca sin castigo, se guarda y un pedido roto se descarta. **Hecho.**
- [x] **Zonas 9 y 10 con tren y barco (B3-c, Z1 + 2b)** (2026-10-20, Mikel): **Taller de vagones** (producto: vagones, ayudante Vagón; abrir 4 800 000 000 $; 60 000 $ por pieza, ciclo 256 s) sale solo en el **tren**, y **Astillero de contenedores** (contenedores, ayudante Ancla; 24 000 000 000 $; 240 000 $ por pieza, ciclo 512 s) solo en el **barco**; las otras 8 siguen en el camión. El tren y el barco se llenan despacio y salen cuando están llenos: tren 100 vagones (+50 por mejora), cada ≥60 s, paga ×1,5; barco 300 contenedores (+150 por mejora), cada ≥300 s, paga ×3 (**cifras mías, a ajustar con el equilibrio**). Mejoras «Más vagones en el tren» y «Barco más grande» en el menú de cada línea. Se ven en el anexo del puerto (a la derecha de la nave); el tren pasa por el fondo al salir cargado. **Hecho la primera parte**; **Hecho también el barco al zarpar** (2026-10-20); **Hecho también la estación propia** de las carretillas del anexo (2026-10-20); falta equilibrar tren y barco.
- [x] **Nombre global (G2)** (2026-10-20, Mikel): «Scrap Empire: Idle Factory» en título, pantalla de carga, manifest, cartel del mapa y documentación; el repositorio y las claves de guardado conservan «chatarrero» para no romper partidas. **Hecho.**
- [x] **Material de anuncio (M1-M4)** (2026-10-20, Mikel): `scripts/marketing/index.mjs` genera en `public/press/` (se publica en `/press/`): 12 capturas 1080×1920 con rótulo (6 en español, 6 en inglés), gráfico de función 1024×500, iconos (normal, adaptable, monocromo, SVG y rótulo), dos vídeos verticales de ~27 s sin sonido y la página de prensa; textos de la ficha en `docs/FICHA_TIENDA.md`. **Hecho.**
- [x] **Carretillas de las líneas muy mejoradas** (2026-10-20, Mikel: «solo aparecen llegando al puesto de carga en bucle»; las de una línea nueva iban bien): causa en el dibujo: cada carretilla visible seguía al viaje más viejo de su línea, y con muchas carretillas ese viaje siempre estaba a punto de acabar. Ahora cada carretilla sigue a su viaje hasta el final, y libre espera junto al palé y coge solo viajes recién salidos. **Hecho.**

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

### Parte 26 — F3, F4 y F5: números (2026-10-21) — decidido: R1, A1, C1 (hecho, ver Pendiente)

Aprobados los tres. Propuesta de números para no inventar al implementar:
- **F3 destinos (tren y barco, 3 cada uno):** cerca (espera ×1, paga ×1,5), medio (×2, paga ×2,5), lejos (×4, paga ×4,5). «Espera» es el tiempo del viaje respecto al actual; se desbloquean pagando 10 / 100 / 1000 veces el valor de un cargamento. Cada destino pide un producto de la línea del transporte (vagones o contenedores; los destinos lejanos piden además la mitad de la otra línea).
  - **R1 —** como se propone. **R2 —** solo 2 destinos por transporte (cerca y lejos). **R3 —** otros números tuyos.
- **F4 almacén:** capacidad 500 unidades por producto (+250 por nivel, hasta nivel 10, cada nivel cuesta ×1,8); bonificación +5 % por cada 25 % del almacén que se llena al salir el transporte (máx. +20 %).
  - **A1 —** como se propone. **A2 —** sin bonificación, solo amortigua los picos.
- **F5 capitán:** un capitán por transporte, sube de nivel por horas de trabajo (como los ayudantes: máximo 25, +10 % de paga y −3 % de viaje por nivel); anuncio opcional: «viaje ya» o «×2 cargamento», con espera de 2 h entre usos (Pase: sin espera).
  - **C1 —** como se propone. **C2 —** solo anuncio, sin capitán.

Responde con letras (p. ej. «R1 A1 C1»).

### Parte 11 — Qué hacemos ahora (2026-10-19)

Todo lo aprobado está hecho salvo «pulir» y comprobar la web en el móvil. Para la siguiente sesión, ¿qué prefieres?

- **N1 — Equilibrio:** ajusto precios y tiempos con una simulación de partida (cuánto tarda cada zona en estar al máximo) y te propongo una tabla de números para aprobar.
- **N2 — Android:** empaquetar con Capacitor y generar el archivo para Google Play en GitHub Actions (sin anuncios reales aún).
- **N3 — Textos en inglés:** pasar todos los textos a un archivo de traducciones (es/en) con selector de idioma.
- **N4 — Rendimiento:** medir y aligerar la escena para móviles flojos (el parpadeo del vídeo), sin cambiar el juego.
- **N5 — Otra cosa:** dime tu idea.

Responde con las letras (p. ej. «N1N4»).

### Parte 22 — Pedidos especiales y las dos zonas de tren y barco (2026-10-20) — decidido: Z1, 2b, precios y pedidos OK (hecho, ver Pendiente)

Se cruza con la Parte 21 (F1-F5, transporte ferroviario y marítimo): las dos cosas hablan del tren y del barco del fondo, así que conviene decidirlas juntas. Entendido: B1b, B2a, B3-a y B3-c. Para no inventar números, necesito cuatro cosas:

**1. Las zonas nuevas.** Dices «coches que se cargan en el tren» y «otro material que se carga en el barco». Hoy la zona 8 ya es «Coches reconstruidos» y sale en el camión. ¿Cuál de estas lecturas es la tuya?
- **Z1 —** Zona 9 = **Vagones** (o coches clásicos) que salen solo en el **tren** del fondo, y zona 10 = **Contenedores** (o motores navales) que salen solo en el **barco**. La zona 8 sigue en el camión.
- **Z2 —** La zona 8 (coches reconstruidos) pasa a cargarse en el tren, y se añaden dos zonas nuevas: una para el barco y otra más (a elegir) para el camión.
- **Z3 —** Otra cosa: dime qué producto lleva cada una.

**2. Cómo se manda el tren y el barco.** El tren y el barco ya pasan de decoración. Opciones: (a) llegan cada pocos minutos, se llenan con lo de su línea y se van (como el camión de expedición, con su propio muelle y palé de salida); (b) se llenan despacio y salen cuando están llenos, y se pagan más por viaje que el camión.

**3. Precio y valor (mi propuesta, ajustable).** Zona 9: abrir 4 800 000 000 $ y 4× el valor por pieza de la zona 8; zona 10: abrir 24 000 000 000 $ y 4× la zona 9; cada una con ayudante nuevo con su frase (te propongo nombres: «Vagón» y «Ancla»).

**4. Pedidos especiales (B3-a).** Mi propuesta: cada ~15 min aparece un pedido de un producto de una línea abierta, con 2 min para entregarlo; la cantidad pedida equivale a 3 min de lo que produce esa línea (así sirve en toda la partida, no solo con los 50 bloques del principio); si se cumple, se cobra el doble de su valor y si no, no pasa nada. Se ve como un cartel en el mapa con cuenta atrás. ¿Te vale? Si prefieres otra cantidad (p. ej. 5 min) o que se pueda ver un anuncio para alargar el plazo, dímelo.

Responde: Z1/Z2/Z3, 2a/2b, «precios ok» o tus números, y «pedidos ok» o lo que cambies.

### Parte 18 — Resultado de la simulación de jugador y qué ajustar (2026-10-20)

Simulación (`npx vite-node scripts/balance.ts`): dos jugadores que compran como el bot de pruebas. **Casual** = 4 sesiones de 5 min al día; **atento** = una sesión de 4 min cada 40 min, 16 h al día. El juego cerrado produce hasta 1 h.

- Todas las zonas abiertas: **casual ~9 días, atento ~2,4 días** (zona 2 a las ~4 h / ~1 h; zona 4 a ~2 días / ~15 h).
- Después no queda nada nuevo: el dinero crece hasta 1e12-1e13 $ en 60 días y las compras se quedan en subir números (camiones de chatarra ~240, muelle nv ~130).
- Lo más largo sin comprar nada: ~2 días (casual) y ~3 días (atento) justo antes de abrir una zona cara: ahí falta un estímulo.
- **Máquinas:** cuestan ×4 por nivel y solo doblan una línea, así que el bot nunca las compra. Con 1,5e13 $ ganados la línea 1 llegaría a nivel ~17; el logro «Máquina de leyenda» (nivel 30) cuesta ~3e20 $: **imposible**. Hay que bajar el ×4 o el logro.
- **Ritmo R2:** con las carretillas por línea la zona 4 llega a ~3,6 h jugando atento sin parar (antes ~6 h). Ajustado el test a «más de 3 h».

Opciones (responde con las letras):
- **B1 — Ritmo:** (a) dejarlo como está; (b) subir el precio de abrir las zonas 3 y 4 ×1,5 para volver a ~6 h.
- **B2 — Máquinas:** (a) crecimiento ×4 → ×2,2 (el nivel 30 cuesta ~5e12 $, alcanzable en 1-2 meses); (b) dejar ×4 y bajar el logro a nivel 15; (c) otra idea.
- **B3 — Más estímulos (entretenimiento):** (a) **Pedidos especiales** cada ~15 min (entrega 50 bloques en 2 min → premio doble); (b) **cofre de hito por hora jugada** con premio sorpresa; (c) **zonas 9-12** más allá de los coches (reconstruidos → motos, barcos, aviones, trenes), cada una con ayudante; (d) **objetivos diarios** (3 al día) con premio; (e) **camión VIP** que aparece sin anuncio y paga mucho si se toca a tiempo. Mi recomendación: a + b + c.

### Parte 19 — Nombre global (2026-10-20) — decidido: G2, «Scrap Empire: Idle Factory» (hecho)

«Chatarrero» solo se entiende en español. Google Play permite un título distinto por idioma, así que se puede mantener «Chatarrero» en español y poner uno global en inglés, o cambiar todo. Opciones (hay que comprobar que no estén ocupadas en Play y como marca antes de decidir):

- **G1 — Idle Scrapyard** (ya es el nombre del repositorio; claro para buscar en la tienda).
- **G2 — Scrap Empire: Idle Factory** (promete progresión y fábrica).
- **G3 — Scrapyard Tycoon Idle** (descriptivo, muy buscable, pero genérico).
- **G4 — Crusher Inc.** (corto, de marca; menos descriptivo).
- **G5 — Dejarlo en «Chatarrero»** como marca del juego en todos los idiomas.

Elige letra; el logo universal (sin texto, solo el icono) sirve con cualquiera.

### Parte 20 — Material para anunciar el juego (2026-10-20, N5) — decidido: M1, M2, M3 y M4 (hecho, ver Pendiente)

Todo a coste cero y generado por código desde el propio juego (Playwright + SVG), en español e inglés:

- **M1 — Capturas con rótulos para Play Store:** 6-8 capturas de 1080×1920 con frase corta encima («Aplasta, funde, ¡y cobra!»), sacadas de partidas de ejemplo (inicio, línea llena, noche, muelle con camión dorado). Más el gráfico de función 1024×500.
- **M2 — Logo universal:** icono sin texto (ya hay `public/icon.svg`) en 512×512 y variantes (fondo liso, adaptativo de Android, monocromo) y un rótulo con el nombre elegido en G.
- **M3 — Vídeo de 20-30 s:** grabación del juego con una partida guionizada (Playwright graba vídeo), con rótulos y sonidos del propio juego; sale en MP4/WebM vertical. Play pide enlace de YouTube, así que lo subirías tú. Es factible, pero queda menos pulido que a mano.
- **M4 — Página web de prensa** en GitHub Pages con las capturas, el vídeo y el texto de la ficha.

Elige (p. ej. «M1M2M4» o «todo»).

### Parte 21 — Transporte ferroviario y marítimo para alargar el juego (2026-10-20, idea de Mikel)

Hoy todo sale por un único muelle de camiones y, cuando se abren las 8 zonas, solo queda subir números (Parte 18). Ya hay tren, vía, grúa pórtico y barco dibujados de adorno en el puerto de fondo: se pueden convertir en sistemas con los que jugar. Ideas (se pueden combinar):

- **F1 — Estación de tren (carga pesada):** un segundo muelle que se abre tras la zona 5. Las vigas, piezas de motor, motores y coches reconstruidos pueden ir por tren en vez de por camión: un tren sale cuando tiene sus vagones llenos (un vagón por producto) y paga más por unidad (p. ej. ×1,5) pero tarda más en completarse. Mejoras: vagones (más carga), locomotora (más rápido) y vías (un segundo tren a la vez). Lo que más cambia el juego: da un destino nuevo donde gastar dinero y producto.
- **F2 — Puerto y barco (pedidos grandes, viajes largos):** un barco llega cada cierto tiempo y pide un cargamento enorme (contenedores). Al cargarlo zarpa y vuelve tras un viaje de horas (por eso encaja con el juego cerrado: sale, se juega otra cosa y vuelve con una paga muy grande). Mejoras: grúa pórtico (carga más rápida), tamaño del barco (carguero → portacontenedores → buque gigante), y nº de barcos.
- **F3 — Rutas y contratos (para elegir):** cada barco o tren puede ir a un destino distinto (ciudad vecina, país, otro continente): cuanto más lejos, más tarda y más paga, y cada destino pide un producto concreto. Da decisiones (¿ruta corta cada poco o larga sin mirar?) y metas a largo plazo (desbloquear cada destino).
- **F4 — Almacén intermedio:** un almacén entre las líneas y los transportes que acumula producto; los trenes y barcos lo vacían en lotes. Los lotes grandes pagan bonificación, lo que premia ampliar el almacén y tener varios transportes.
- **F5 — Con ayudante y anuncios:** un jefe de estación/capitán (como los ayudantes de zona, con nivel por horas de trabajo) y un anuncio opcional para acortar un viaje o duplicar un cargamento, igual que el camión dorado.

Mi recomendación, por fases para no tocar todo a la vez: **F1 primero** (reutiliza el sistema de camión, es pequeño y ya alarga el juego unos días), después **F2 + F3** (barcos con destinos, lo que más alarga porque los viajes son largos) y **F5**. Antes de implementar nada necesito que elijas y, si quieres, números: cuándo se abre cada transporte (tras qué zona y a qué precio) y cuánto más paga que el camión. Si no tienes preferencia, propongo: estación tras la zona 5 (coste ~100× el de la zona 5), barco tras la zona 8, y que cada transporte pague ×1,5 / ×3 respecto a un camión por la misma carga.

Responde con las letras (p. ej. «F1F2F3F5»).

### Parte 17 — Logística por tandas y mejoras por línea (decidida: T3, hecha)

Hoy las carretillas y el muelle son globales: cada carretilla lleva 1 unidad/s y el palé baja de forma continua, por eso sale siempre a 0. Para que llegue en tandas:

- **T1 — Carretillas por línea:** cada línea tiene sus carretillas y su palé; la carretilla recoge una tanda (10 al principio, +5 por nivel de carretilla) y solo al llegar al muelle suma al palé de salida. Mejoras de carretilla (nivel, número) y del camión de salida dentro del menú de cada línea.
- **T2 — Tandas globales:** se mantiene la flota común pero cada viaje es una tanda (10, 15, 20… por nivel de carretillas, común); las mejoras siguen en el muelle.
- **T3 — Como T1, pero el camión de salida sigue siendo común** (un muelle, mejoras de carretilla por línea).



## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 2 del diseño — cómo funciona la cadena** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 3 del diseño — zonas y ayudantes** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 4 del diseño — ritmo y nombres** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 5 del diseño — retención, anuncios y compras** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 6 del diseño — ayudantes, racha y pase** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 7 del diseño — racha** (2026-10-19): si se falta un día, vuelve al día 1.
- [x] **Parte 8 del diseño — sincronización entre dispositivos** (2026-10-19): S1, solo código manual; fácil de sustituir. Resumido en «Decidido» de DISENO.md.
- [x] **Parte 9 del diseño — fondo y decorado** (2026-10-19): D1, D3, D4 y D5; resumido en «Decidido» de DISENO.md.
- [x] **Parte 10 del diseño — anuncios al volver** (2026-10-19): A3 y A4; resumido en «Decidido» de DISENO.md.
- [x] **Parte 12 del diseño — ranking mundial** (2026-10-19): R1, Firebase gratuito.
- [x] **Partes 13-16** (2026-10-19): «como mejor veas», ver Pendiente.
