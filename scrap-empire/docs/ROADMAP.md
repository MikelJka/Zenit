# Roadmap de Chatarrero

Cada sesión toma la primera tarea sin marcar de la fase actual que esté aprobada en «Pendiente» de `FEEDBACK.md`. Una fase solo termina cuando se cumple su criterio de «terminado». Las fases 1 en adelante se concretarán con el diseño que se decida en FEEDBACK.md.

## Fase 0 — Base del proyecto

Terminado: la URL pública muestra la pantalla del juego en el móvil y en PC, las capturas llegan a la rama `capturas` (desde el 2026-10-22, `capturas-scrap-empire` de Zenit) y el diseño está decidido.

- [x] Proyecto Vite + TypeScript estricto + Vitest
- [x] Publicación automática en GitHub Pages y capturas de la prueba de humo
- [x] Estructura genérica de juego idle (`docs/DISENO.md`)
- [x] Estilo visual decidido con Mikel (2D de dibujo animado, SVG por código)
- [x] Diseño concreto decidido con Mikel en FEEDBACK.md (Partes 1-7)
- [ ] Comprobar en la URL pública que se ve bien en el móvil (lo confirma Mikel)

## Fase 1 — Bucle básico

Terminado: puedo tocar para ganar, comprar los primeros generadores y ver crecer la moneda; la partida se guarda.

- [x] Simulación: chatarra, zonas, carretillas, muelle, camiones, mejoras y dólares
- [x] Pantalla principal en vertical (primera versión en DOM, sin 3D todavía)
- [x] Guardado automático
- [x] Ganancias con el juego cerrado
- [x] Escena 2D del desguace en la pantalla principal

## Fase 2 — Contenido de la primera versión

Terminado: la primera versión se juega de principio a fin y engancha a Mikel.

- [x] Ocho zonas con sus productos y mejoras
- [x] Ayudantes con experiencia y niveles
- [x] Retención: racha de 7 días, empujón ×2 y camión dorado
- [x] Pase de chatarrero (en la web, de prueba)
- [x] Sonidos (sintetizados, con botón de silencio)
- [x] Más animaciones (vuelco de chatarra, máquinas trabajando, coches, ciudad de fondo, nave en rayos X)
- [x] Panel de mejoras por línea (se toca el puesto), estado y cuello de botella a la vista, huellas de salida por producto, focos de noche y máquinas que se transforman cada 5 niveles
- [ ] Ranking mundial (a decidir: Parte 12 de FEEDBACK.md)
- [ ] Equilibrio: ajustar precios jugando de verdad (precios de los ayudantes y espera del empujón provisionales)
- [ ] Prestigio (aprobado por Mikel el 2026-10-23, S4; decidido en la Parte 28: desde la zona 8, √(dinero/1e9) Tornillos de oro, +5 % cada uno)

## Fase 2b — Calidad profesional

Terminado: el juego se ve, suena y se siente como un título de estudio grande, no de aficionado (orden de Mikel, 2026-10-19: «que sea un videojuego profesional y no parezca tan indie»). Cada sesión toma la primera tarea sin marcar.

- [x] Pantalla de carga con logo, icono, manifest e iconos de la web
- [x] Vibración en toques y compras
- [x] Contador de fotogramas (`?fps=1`) para medir el parpadeo
- [x] Objetivo a la vista, logros con aviso y lista en ajustes
- [x] Hito cada 5 niveles de máquina con premio
- [x] Ranking mundial: código listo (Firebase); falta que Mikel cree el proyecto (`docs/RANKING.md`)
- [x] Tutorial de los primeros 2 minutos: flechas y mensajes que guían (tocar la pila, comprar, abrir un puesto, abrir la segunda zona)
- [x] Interfaz coherente (**hecho: iconos SVG propios en la barra de arriba y los botones de extras**; **hecho también: tutorial, objetivo, atascos, logros y anuncios al volver sin emojis**; **hecho también: botones con relieve y paneles con transición**; **hecho también: los dólares cuentan hacia arriba**): iconos SVG propios en lugar de emojis, tipografía y botones con relieve en todo, paneles con transición, cifras que cuentan hacia arriba
- [x] «Juice» (**hecho: monedas que vuelan al contador al cobrar, destello al comprar, rebote de la cifra y temblor al abrir una zona**): monedas que vuelan al contador al cobrar, números flotantes por camión, destello al comprar, temblor suave al abrir una zona
- [x] Apertura de zona animada (se levanta el andamio y entra la máquina)
- [x] Logística visible (L1) (**hecho**: huellas por producto con carretillas que cargan, y la caja del camión se llena con lo que hay en cada huella): las carretillas sueltan su producto en su huella y el camión se llena de las huellas
- [x] Música ambiental sintetizada (**hecho: acordes suaves en bucle con interruptor propio en ajustes**; faltan sonidos por tipo de línea)
- [x] Ajustes completos: música, efectos, vibración, idioma, calidad gráfica (baja/alta), reducir movimiento (**hecho**)
- [x] Rendimiento (**hecho**: líneas fuera de pantalla sin animar, 30 fps en táctiles, calidad baja automática o fija; falta canvas si hace falta): ocultar lo que queda fuera de cámara, animar solo las líneas visibles, modo «calidad baja»; pasar lo animado a canvas si el contador lo pide (Parte 13)
- [x] Iluminación y sombras suaves en toda la escena, no solo de noche (**hecho: sombra suave bajo cada puesto y luz de sol en la nave**; degradados, ambient occlusion falso bajo las máquinas)
- [x] Estadísticas del jugador (tiempo de partida, dinero ganado, camiones, mejor racha) en ajustes
- [x] Accesibilidad (**hecho: «Texto grande» y «Alto contraste» en ajustes, reducir movimiento**; **hecho también: símbolos ▶ ✖ ■ en los estados**): texto más grande, alto contraste, no depender solo del color (iconos en los estados), reducir movimiento
- [x] Textos en inglés con selector de idioma
- [x] Equilibrio con el bot: simulación de jugador hecha (`scripts/balance.ts`), propuesta en la Parte 18; falta que Mikel elija
- [x] Pedidos especiales y zonas 9-10 con tren y barco (barco animado; estación propia en el anexo hecha; falta equilibrar)
- [x] Mapa en canvas con PixiJS (S1, 2026-10-23), por partes: suelo y máquinas primero (**hechas la primera parte, 2026-10-23: las máquinas en canvas, y la segunda, 2026-10-23: el suelo de los puestos y sus cintas, la tercera, 2026-10-23: los ayudantes de los puestos, y la cuarta, 2026-10-23: las carretillas y los palés de las líneas, y la quinta, 2026-10-23: el camión de expedición y los coches de la carretera de delante**; siguen, si hace falta, los AGV y la pila (los camiones de chatarra y los coches del fondo pasan por detrás de la nave y se quedan en SVG))
- [ ] Que vaya mejor en móviles flojos (#16, 2026-10-23, Mikel desde el botón 🐞): **hecha la primera parte, 2026-10-23: bucle entero a 30/s en táctiles, textos solo si cambian, sin recálculo de estilos por las chispas y canvas a resolución 1 en «Calidad baja»**; **hecha la segunda parte, 2026-10-23: arrastrar y pellizcar sin repintar los SVG (se mueven con CSS y se repintan al soltar)**; siguen los AGV, la pila y el decorado animado a canvas
- [x] Botón 🐞 dentro del juego para abrir incidencias (S2, 2026-10-23; hecho el 2026-10-23)
- [x] Pruebas: la prueba de humo comprueba el panel por línea, el ranking apagado y la noche (**hecho**; los tests de interfaz sencillos quedan para más adelante)

## Fase 3 — Android y monetización

Terminado: el juego está en la prueba cerrada de Google Play con anuncios de prueba funcionando.

- [ ] Empaquetar con Capacitor y generar el archivo para Google Play en GitHub Actions (**hecho: Capacitor y workflow que genera un APK de prueba**, `docs/ANDROID.md`; falta la clave de firma y el AAB)
- [x] Anuncios y compras decididos (empujón, camión dorado, pase a 2,99 €)
- [ ] Anuncios reales con AdMob y compra del pase con Google Play Billing
- [ ] Consentimiento de anuncios (UE) y política de privacidad (S3, 2026-10-23: con Google UMP y AdMob en modo de prueba) (**hecha la política de privacidad en la web, 2026-10-23, enlazada desde Ajustes; falta el contacto, Parte 29**) (**hecho el consentimiento UE con Google UMP y AdMob con los identificadores de prueba de Google en la app de Android, 2026-10-23**; faltan los identificadores reales de Mikel)
- [x] Textos en inglés
- [ ] Ficha de la tienda (**hecho: textos, icono, capturas, gráfico y vídeo en `docs/FICHA_TIENDA.md` y `/press/`**; falta política de privacidad y clasificación)

## Fase 4 — Publicación

Terminado: Chatarrero está publicado en Google Play.

- [ ] Prueba cerrada de 14 días con 12 personas (o cuenta de empresa)
- [ ] Arreglar lo que salga en la prueba
- [ ] Publicar
