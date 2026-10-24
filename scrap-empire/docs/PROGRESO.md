# Progreso

Diario de sesiones, la más reciente arriba.

## 2026-10-24 — Siguiente paso recomendado (pedido por Mikel)

- Mikel confirma que la web se ve bien en el móvil (Fase 0 terminada) y pide un siguiente paso recomendado, un tutorial guiado y preparar el lanzamiento (logo, capturas, vídeo, descripciones, AAB, Play Billing, Play Console, Reddit). Todo anotado en «Pendiente» y en «Decidido» de DISENO.md.
- Hecho el siguiente paso: una tarjeta amarilla en el recuadro de arriba dice qué hacer. Primero lo que atasca la fábrica (muelle lleno → «Más carga en el muelle»; palé lleno → carretillas de esa línea; falta chatarra → camión de chatarra) y, si no hay atasco, la compra que más $/s da por cada $ (o ahorrar para la siguiente zona).
- «Ir» lleva al puesto y abre su panel con la mejora resaltada; la ✕ oculta ese paso hasta que haya otro; en ⚙ Ajustes, «Siguiente paso recomendado» lo quita del todo. No sale mientras dura el tutorial.
- Reglas en `src/sim/advice.ts` con 5 pruebas nuevas (107 en total, con `bun test`).
- Qué probar: empezar una partida nueva, acabar el tutorial y seguir la tarjeta un rato; ocultarla con la ✕ y apagarla en Ajustes.
- Sigue: el tutorial guiado con mano y bocadillo.

## 2026-10-24 — Destellos del agua a canvas y nubes más ligeras (#16, séptima parte)

- Sin incidencias nuevas ni propuestas abiertas. S3 sigue esperando los identificadores de AdMob de Mikel, así que sigue «Que vaya mejor (#16)».
- Los 14 destellos del agua del puerto se dibujan ahora en la capa de canvas, con el mismo parpadeo (de 1 a 0,2 en 1,6 s, cada uno desfasado), por debajo del barco. En «Calidad baja» se quedan quietos, como antes.
- Las nubes iban moviéndose una fracción de punto 30 veces por segundo; ahora se mueven a saltos de medio punto 5 veces por segundo, todas a la vez (van tan despacio que no se nota). Con esto el SVG de atrás (cielo, ciudad, suelo y nave) ya no tiene ninguna animación CSS y se repinta muchas menos veces.
- Con `?svg=1`, o si WebGL no arranca, los destellos siguen en SVG.
- Qué probar: que el agua del puerto siga brillando, que las nubes se muevan suaves y que el mapa vaya igual o algo más suelto en el móvil.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob; si no, ver cómo va #16 en su Android (en SVG aún se mueven los camiones de chatarra y coches de detrás de la nave y el camión dorado).

## 2026-10-24 — Contacto y edad en la política de privacidad (Parte 29)

- Mikel responde a la Parte 29: contacto mikeljka@gmail.com (lo cambiará por un correo de Zenit Studio cuando lo cree) y juego para mayores de 13 años. Pasado a «Decidido» de DISENO.md y quitada la propuesta.
- La política de privacidad (español e inglés) ya lleva el contacto y un apartado nuevo «Edad»: para mayores de 13, no dirigido a niños, y se borran los datos de un menor si nos avisan. Fecha: 24 de octubre de 2026. Anotado también en `docs/FICHA_TIENDA.md`.
- Qué probar: abrir ⚙ → Política de privacidad y ver el correo y el apartado 8.
- Sigue: S3 termina cuando Mikel pase los identificadores reales de AdMob; mientras, #16.

## 2026-10-24 — El tren y el barco pasan a canvas (#16, sexta parte)

- Sin incidencias nuevas. S3 sigue esperando a Mikel (identificadores de AdMob y Parte 29), así que sigue «Que vaya mejor (#16)».
- El tren de mercancías de la vía de delante y el barco del puerto se dibujan ahora en la capa de canvas: cada uno se hornea una vez en una textura y solo se desplaza. El SVG ya no mueve esos dos grupos (cientos de caras) 30 veces por segundo.
- La grúa pórtico que cruza la vía, la luz de las farolas y la noche siguen en el SVG de delante, así que tapan y oscurecen al tren y al barco como antes. En «Calidad baja» sigue sin tren; el barco se ve. Con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Comprobado: pruebas con `bun test` (102) y tipos con `tsc` (sin npm en la sesión); el flujo «Scrap Empire: probar rama» compila y saca capturas.
- Qué probar: que el tren pase por la vía (por debajo de la grúa roja) y que el barco zarpe y vuelva igual que antes, de día y de noche, y que el mapa vaya igual o algo más suelto.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob y responda la Parte 29; si no, ver cómo va #16 en su Android (en SVG aún se mueven las nubes, los camiones y coches de detrás de la nave, el camión dorado y los destellos del agua).

## 2026-10-24 — Autopista y pájaros pasan a canvas (#16, quinta parte)

- Sin incidencias nuevas. S3 sigue esperando a Mikel (identificadores de AdMob y Parte 29), así que sigue «Que vaya mejor (#16)».
- Los 8 coches de la autopista elevada del fondo se dibujan ahora en la capa de canvas (cada aspecto se hornea una vez en una textura) y los 5 pájaros, con su aleteo, también. El SVG ya no mueve esos 13 grupos 30 veces por segundo ni anima el aleteo con CSS.
- Las nubes se quedan en el SVG: pasan por detrás de la ciudad y la capa de canvas va por delante de ella, así que en canvas taparían los edificios.
- De noche los pájaros desaparecen como antes; en «Calidad baja», sin autopista ni pájaros, como antes. Con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Qué probar: que los coches de la autopista del fondo y los pájaros se vean y se muevan igual que antes, y que el mapa vaya igual o algo más suelto.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob y responda la Parte 29; si no, #16: el tren y el barco a canvas.

## 2026-10-24 — La pila pasa a canvas (#16, cuarta parte)

- Sin incidencias nuevas. S3 sigue esperando a Mikel (identificadores de AdMob y Parte 29), así que sigue «Que vaya mejor (#16)».
- La pila de chatarra se dibuja ahora en la capa de canvas: se hornea una vez en una textura, crece con la chatarra como antes y da el mismo saltito al tocarla. En el SVG solo queda una zona transparente que recibe el toque, y su tamaño se actualiza solo cuando cambia (antes se reescribía 30 veces por segundo).
- La pila del SVG se esconde cuando la del canvas ya está lista, para que no parpadee al arrancar. Con `?svg=1`, o si WebGL no arranca, sigue en SVG.
- Qué probar: que la pila se vea igual (encima de los AGV y las carretillas), que tocarla siga dando chatarra con su saltito y sus trocitos, y que crezca al acumular chatarra.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob y responda la Parte 29; si no, #16: el decorado animado (nubes, pájaros, autopista, tren y barco) a canvas.

## 2026-10-24 — Los AGV pasan a canvas (#16, tercera parte)

- Sin incidencias nuevas. S3 sigue esperando a Mikel (identificadores de AdMob y Parte 29), así que sigue «Que vaya mejor (#16)».
- Los tres vehículos guiados (AGV) que recorren las rutas azules se dibujan ahora en la capa de canvas, como las carretillas: el mismo aspecto por bloques, con o sin contenedor de chatarra, girando en pasos de 10°. El SVG ya no cambia su posición ni redibuja su forma 30 veces por segundo, y el orden por profundidad del mapa tiene tres objetos menos que recolocar.
- Si WebGL no arranca, o con `?svg=1`, los AGV siguen en SVG como antes.
- Qué probar: en el móvil, que los AGV se vean igual que antes (van de la pila a las cintas, por el pasillo central y por el del muelle, cargados a la ida y vacíos a la vuelta) y que el mapa vaya igual o algo más suelto.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob y responda la Parte 29; si no, #16: la pila y el decorado animado (nubes, pájaros, autopista, tren y barco) a canvas.

## 2026-10-24 — Pantalla del prestigio (S4, segunda parte)

- Sin incidencias nuevas. S3 sigue esperando a Mikel (AdMob y Parte 29); se termina S4 con la segunda parte: el botón y la pantalla de reinicio.
- En ⚙ Ajustes hay un bloque «Prestigio»: antes de abrir la zona 8 explica que se desbloquea con ella y que cada Tornillo de oro da +5 %; con la zona 8 abierta dice cuántos tornillos tienes y cuántos te daría reiniciar ahora (o que hace falta ganar 1 000 000 000 $ en la partida para el primero).
- «Reiniciar con prestigio» pide confirmación: se conservan los tornillos, el Pase, la racha, los logros, el total ganado (ranking), los destinos del tren y el barco y los objetivos del día; vuelve a cero el dinero, la chatarra, las zonas, las máquinas, las mejoras y los ayudantes. Al confirmar, la partida se guarda y se recarga, y sale el aviso «+N Tornillos de oro».
- Los tornillos y los reinicios salen también en Estadísticas. Textos en español e inglés.
- Qué probar: con una partida que tenga la zona 8 (coches) abierta y más de 1 000 M$ ganados en la partida, abrir ⚙, reiniciar y ver que el dinero de los camiones sube un 5 % por tornillo.
- Sigue: S3 cuando Mikel pase los identificadores de AdMob y responda la Parte 29; si no, «Que vaya mejor (#16)»: AGV, pila y decorado animado a canvas.

## 2026-10-24 — Prestigio en la simulación (S4, primera parte)

- Sin incidencias nuevas. S3 espera a Mikel (AdMob y Parte 29), así que sigue S4: el prestigio (Parte 28: PA1 PB1 PC3 PD2).
- Primera parte, solo las reglas (todavía no se ve en el juego): con la zona 8 (coches) abierta se puede reiniciar a cambio de Tornillos de oro = √(dinero ganado en la partida / 1 000 000 000), redondeado hacia abajo; cada tornillo da +5 % al valor de todo lo que se cobra, para siempre.
- Se conservan el Pase, la racha, los logros, el total ganado (ranking) y los destinos comprados del tren y el barco; también el tiempo de juego, los objetivos del día y los contadores de camiones y pedidos. Todo lo demás vuelve a cero.
- La partida guarda aparte el dinero ganado desde el último reinicio; en las partidas de antes cuenta todo lo ganado. Números en `src/data/economy.json` (`prestige`); 7 pruebas nuevas en `tests/prestige.test.ts`.
- Qué probar: nada visible todavía (sigue igual que ayer).
- Sigue: S4 segunda parte, el botón y la pantalla de reinicio (cuántos tornillos darías, qué se conserva y confirmación).

## 2026-10-23 — Anuncios de AdMob y consentimiento UE en la app de Android (S3, segunda parte)

- Sin incidencias nuevas. Sigue S3 (preparar Google Play): consentimiento UE con Google UMP y AdMob en modo de prueba.
- En la app de Android, ver un anuncio (empujón ×2, camión dorado, duplicar lo ganado fuera, cambiar objetivo…) ya enseña un anuncio bonificado de AdMob de prueba; solo da el premio si se ve hasta el final. Si no hay anuncio, avisa «No hay anuncio disponible ahora» y no da nada.
- Al abrir la app se pregunta el consentimiento de anuncios de la UE (formulario de Google UMP; en modo de prueba hace como si estuvieras en la UE). En ⚙ sale «Consentimiento de anuncios» para cambiarlo.
- En la web no cambia nada: siguen los anuncios de mentira de 2 s. Con el Pase, los premios siguen sin anuncio.
- Plugin `@capacitor-community/admob` (MIT, en CREDITOS.md); identificadores de prueba de Google en `src/data/ads.json`; el flujo de Android añade el `APPLICATION_ID` al manifiesto.
- Qué probar: descargar el APK de prueba (Actions → «Scrap Empire: Android» → artefacto `scrap-empire-debug-apk`), abrirlo, aceptar o rechazar el consentimiento y ver un anuncio de prueba de Google desde el empujón.
- Falta de Mikel: crear la app en AdMob con su bloque bonificado y el mensaje RGPD (pasos en `docs/ANDROID.md`), y responder la Parte 29. Sigue: S4 (prestigio).

## 2026-10-23 — Política de privacidad en la web (S3, primera parte)

- Sin incidencias nuevas. Siguiente en «Pendiente»: S3, preparar Google Play. Primera parte: la política de privacidad.
- Nueva página `privacidad.html` (español e inglés), publicada en https://mikeljka.github.io/Zenit/scrap-empire/privacidad.html y enlazada desde Ajustes («Política de privacidad»). Cuenta lo que hace hoy el juego: partida y ajustes solo en el dispositivo; ranking opcional en Firebase (apodo, total e identificador anónimo); anuncios voluntarios con AdMob y consentimiento en la UE (en Android); compras por Google Play; el botón 🐞 solo envía si publicas tú en GitHub.
- Falta el contacto de privacidad y las edades del juego: nueva **Parte 29** en FEEDBACK.md (PP y PE).
- Qué probar: ⚙ → «Política de privacidad» abre la página en el idioma del juego.
- Sigue: consentimiento UE con Google UMP y AdMob en modo de prueba (S3); #16 tercera parte si en el móvil sigue yendo justo.

## 2026-10-23 — Arrastrar el mapa ya no lo repinta entero (#16, segunda parte)

- Mikel, probando la primera parte: sin tocar va a unos 30 fps, pero al arrastrar con zoom baja a ~10.
- Causa: cada movimiento del dedo cambiaba el viewBox de los dos SVG del mapa, y el navegador volvía a pintar miles de piezas (ciudad, nave, decorado, rótulos) a la resolución del móvil.
- Ahora los SVG se pintan con un margen del 35 % alrededor de la pantalla y, mientras se arrastra o se pellizca, solo se desplazan y escalan con CSS (lo mueve la tarjeta gráfica sin repintar), a la par que la capa de canvas. Se vuelven a pintar nítidos al soltar, si el arrastre se sale del margen o si el zoom cambia más de un 25 %.
- Mientras se pellizca, lo del SVG puede verse un poco borroso hasta soltar; al hacer un arrastre muy largo hay un tirón cuando se repinta.
- Qué probar: en el móvil, con `?fps=1`, arrastrar y pellizcar con el zoom hecho y ver si el contador ya no baja tanto; comprobar que los toques en puestos, pila y camión dorado siguen funcionando tras moverse.
- Sigue: si aún va justo, los AGV, la pila y el decorado animado a canvas.

## 2026-10-23 — El juego trabaja menos en el móvil (#16, primera parte)

- Petición de Mikel desde el botón 🐞 (#16, Android 10, 4 zonas): «Optimiza el juego para que vaya mejor».
- En pantallas táctiles todo el bucle va a 30 fotogramas por segundo: antes la escena ya iba a 30, pero la simulación, el contador de dinero y la barra de arriba se rehacían a 60. Ahora el móvil hace la mitad de trabajo entre medias; los toques se atienden igual.
- El contador de dinero, los ingresos por segundo y el rótulo de la pila solo se tocan cuando cambia el texto (el de la pila se rehacía entero en cada fotograma).
- El parpadeo de las chispas cambiaba una clase en todo el mapa 7 veces por segundo (el navegador recalculaba el estilo de miles de piezas); ahora solo se hace si quedan chispas en el SVG, y con la capa de canvas no queda ninguna.
- En «Calidad baja» (sola si va a menos de ~22 fps, o fijada en ajustes) la capa de canvas se pinta a resolución 1 en vez de 2: menos de la mitad de píxeles.
- Qué probar: en el móvil, con `?fps=1`, mover el mapa y comparar con antes; probar también «Calidad baja» en ajustes (se verá algo menos nítido lo del canvas).
- Sigue: segunda parte de #16 (los AGV, la pila y el decorado animado a canvas).

## 2026-10-23 — Botón 🐞 para mandar fallos y peticiones (S2)

- Nuevo botón redondo con un bicho abajo a la izquierda (se esconde con una hoja abierta). Abre «Enviar fallo o petición»: se elige «Fallo» o «Petición», se escribe qué pasa y «Enviar en GitHub» abre el formulario de nueva incidencia de `MikelJka/Zenit` ya rellenado, con las etiquetas `feedback` y `scrap-empire`.
- La incidencia lleva los datos de la partida: tiempo jugado, dinero y total ganado, zonas abiertas, Pase, idioma, versión de guardado, URL, pantalla, navegador y los últimos errores de la sesión (excepciones y promesas rechazadas, solo en memoria). Si el enlace sale muy largo se recortan los errores y, si hace falta, el texto.
- Textos en español e inglés; pruebas del formato del enlace en `tests/feedback.test.ts` (lógica en `src/sim/feedback.ts`).
- S1 (mapa en canvas) se da por terminada: lo que queda en SVG (3 AGV, la pila y el decorado) apenas pesa.
- Qué probar: tocar el bicho en el móvil, mandar un fallo de prueba y comprobar que en GitHub salen las dos etiquetas y los datos (hay que estar con la sesión de GitHub iniciada y pulsar «Create»).
- Sigue: S3 (preparar Google Play: política de privacidad, consentimiento UE y AdMob en modo de prueba).

## 2026-10-23 — El camión de expedición y los coches de delante se dibujan en canvas (S1, quinta parte)

- El camión de expedición del muelle pasa a la capa de canvas (PixiJS): chasis y caja horneados desde el mismo SVG en dos piezas (lo de detrás de la carga y lo de delante) y, en medio, los productos de la caja con la textura del producto que ya usan las carretillas; se llena, sale y vuelve como antes.
- Los coches de la carretera de delante también van en canvas (cada aspecto se hornea una vez).
- Los camiones de chatarra y los coches de la carretera de atrás se quedan en SVG: pasan por detrás de la pared de la nave y en canvas quedarían encima de ella. El camión dorado sigue en SVG (se toca).
- Mismo aspecto (el SVG del camión sale idéntico tras partirlo en dos); con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Qué probar: ver cómo se llena el camión del muelle con varias líneas abiertas y cómo sale, y mover el mapa en el móvil con `?fps=1`, comparando con `?svg=1`.
- Sigue: S1 se puede dar por terminada (lo que queda en SVG apenas se mueve: AGV, pila y decorado) o pasar a S2 (botón 🐞) si Mikel lo ve suficiente.

## 2026-10-23 — Las carretillas y los palés de las líneas se dibujan en canvas (S1, cuarta parte)

- Las carretillas de las líneas pasan a la capa de canvas (PixiJS): la carretilla se dibuja con los mismos bloques girados que en el SVG (en pasos de 10°, como antes) y lo que lleva con la textura horneada del producto de su línea; las de delante tapan a las de detrás.
- El palé de cada línea también va en canvas (encima del ayudante y debajo de las carretillas, para que la carretilla que espera siga delante de su palé).
- Mismo aspecto que en SVG (comprobado: el SVG de la carretilla sale idéntico tras compartir su geometría con el canvas); con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Pequeña diferencia: carretillas y palés quedan siempre por debajo de los camiones, la pila y las huellas del muelle (en su recorrido no se cruzan).
- Qué probar: ver cómo cargan, giran en el muelle y vuelven con varias líneas abiertas, y mover el mapa en el móvil con `?fps=1`, comparando con `?svg=1`.
- Sigue: S1, quinta parte (camiones y vehículos en canvas) o pasar a S2 si Mikel lo ve suficiente.

## 2026-10-23 — Los ayudantes de los puestos se dibujan en canvas (S1, tercera parte)

- El ayudante de cada puesto (Grúa, Pistón, Bujía…) pasa a la capa de canvas (PixiJS), encima de las máquinas: piernas y sombra en una textura y torso con la cabeza en otra, horneadas desde el mismo SVG; el torso sube y baja al trabajar, como antes.
- Mismo aspecto que en SVG; con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Pequeña diferencia: el ayudante queda siempre por debajo de carretillas, palés y vehículos (antes se ordenaba por profundidad; en su sitio no se cruza con nada).
- Qué probar: abrir una zona nueva (tiene que salir su ayudante al momento) y mover el mapa en el móvil con `?fps=1`, comparando con `?svg=1`.
- Sigue: S1, cuarta parte (carretillas en canvas).

## 2026-10-23 — El suelo de los puestos y las cintas se dibujan en canvas (S1, segunda parte)

- En la capa de canvas (PixiJS), debajo de todas las máquinas: el suelo de cada puesto con su borde amarillo de rayas, el de los puestos cerrados (rayas oscuras) y las cintas que bajan a cada máquina, con la chatarra que avanza animada por código (quieta con «Calidad baja», como antes).
- Mismo aspecto que en SVG; con `?svg=1`, o si WebGL no arranca, todo sigue en SVG.
- Se queda en SVG: las huellas del muelle, las cintas principales de la nave y el resto del decorado (son imágenes fijas o casi).
- Qué probar: abrir una zona y comprar máquinas (las cintas nuevas tienen que salir al momento) y mover el mapa en el móvil con `?fps=1`, comparando con `?svg=1`.
- Sigue: S1, tercera parte (trabajadores y carretillas en canvas).

## 2026-10-23 — Las máquinas se dibujan en canvas (S1, primera parte)

- Nuevo `src/ui/machineLayer.ts` con PixiJS 8 (MIT, en `CREDITOS.md`): el mapa son ahora dos SVG con una capa de canvas en medio. Detrás, cielo, suelo y nave; en el canvas, las máquinas de las líneas; delante, pila, trabajadores, palés, carretillas, vehículos, noche y rótulos (recibe los toques).
- Cada máquina se hornea una vez desde su mismo SVG en una textura de 512×512 (por producto, tramo y grado) y lo que se mueve (prensa, engranaje, chispas, humo y luz que parpadea) se anima por código; también el rebote de subir de nivel y la entrada al abrir zona. Con «Calidad baja» no hay humo ni chispas, como antes.
- Si WebGL no arranca, o con `?svg=1` en la URL (para comparar), todo sigue en SVG como antes.
- Pequeña diferencia: las máquinas quedan siempre por debajo de trabajadores y carretillas; los brillos de los grados 4-6 no titilan.
- `package-lock.json` sin actualizar (la sesión no tiene acceso a npm); los flujos usan `npm install`, que añade `pixi.js`.
- Qué probar: mover el mapa en el móvil con muchas máquinas y mirar el contador `?fps=1` (comparar con `?svg=1`).
- Sigue: S1, segunda parte (suelo de los puestos y cintas en canvas).

## 2026-10-23 — Mikel elige la Parte 27

- Mikel aprueba las cuatro opciones en este orden: S1 mapa en canvas con PixiJS, S2 botón 🐞, S3 preparar Google Play, S4 prestigio. Pasadas a «Pendiente» de FEEDBACK.md, a «Decidido» de DISENO.md y al ROADMAP.
- **Parte 28** (prestigio) propuesta y decidida en la misma sesión: PA1 PB1 PC3 PD2 (desde la zona 8, Tornillos de oro = √(dinero ganado / 1 000 000 000), se conservan Pase, racha, logros, ranking y destinos del tren y el barco, +5 % por Tornillo). No quedan propuestas abiertas.
- No cambia nada del juego.
- Sigue: S1, primera parte (suelo y máquinas en canvas).

## 2026-10-22 — Propuesta: qué hacemos ahora (Parte 27)

- Primera sesión en Zenit: la web nueva se publica bien («Zenit: publicar web» en verde, con prueba de humo y capturas de Scrap Empire). Ninguna incidencia `feedback` + `scrap-empire` abierta.
- Todo lo aprobado está hecho; lo que queda (web en el móvil, clave de firma, Firebase) depende de Mikel. Nueva **Parte 27** en `FEEDBACK.md`: S1 rendimiento con canvas (PixiJS), S2 botón 🐞 en el juego, S3 preparar Google Play (privacidad, consentimiento, AdMob de prueba), S4 prestigio. Quitadas las propuestas ya decididas (Partes 11, 18-22 y 26), que están en «Pendiente» y en DISENO.
- No cambia nada del juego.
- Sigue: lo que Mikel elija en la Parte 27.

## 2026-10-22 — Scrap Empire se muda a Zenit

- El juego vive ahora en la carpeta `scrap-empire/` de `MikelJka/Zenit`. Nueva URL: https://mikeljka.github.io/Zenit/scrap-empire/ (las partidas guardadas se conservan: mismo dominio). Detalle y lista de tareas de Mikel en `MIGRACION.md`.
- Publicación con el flujo común «Zenit: publicar web» (todos los juegos en un solo sitio); flujos propios «Scrap Empire: probar rama» y «Scrap Empire: Android (APK de prueba)»; capturas en las ramas `capturas-scrap-empire` y `capturas-pruebas-scrap-empire`.
- No cambia nada del juego. Pendiente de Mikel: activar Pages en Zenit, crear la etiqueta `scrap-empire`, pasar las incidencias de IdleScrapyard (sin acceso desde la sesión), cambiar STONKS y apagar la rutina antigua.
- Qué probar: abrir la URL nueva en el móvil cuando Pages esté activado.

## 2026-10-21 — Tope en las huellas de salida

- Cada producto del muelle admite como máximo 500 piezas (`dock.productCap`, valor provisional; el «x» no lo dio Mikel). Con la huella llena las carretillas de esa línea esperan con su tanda, el palé se llena y la línea para; al salir un camión vuelve a producir. En el panel de la línea se ve «piezas/tope».
- Los pedidos especiales limitan su cantidad a la parte de lo que se llevan los camiones (con el muelle saturado no se podrían cumplir si no). La simulación de equilibrio no cambia (el muelle ya era el cuello de botella).
- Qué probar: dejar una línea muy mejorada y ver cómo para al llegar al tope.

## 2026-10-21 — Suelo con más detalle y pruebas de rendimiento

- Suelo del desguace con más calidad, horneado en la imagen estática (no cuesta nada al jugar): brillo diagonal, borde más oscuro, manchas de aceite, marcas de ruedas, motas de polvo y franja de peligro junto al muelle (`floorWearSvg` en `src/ui/yard.ts`).
- Pruebas de rendimiento con `scripts/perf.mjs` (ahora acepta `OUTDIR` para comparar dos compilaciones; CPU ×4, 3 pasadas alternas; el ruido es de ±4 fps): **sin mejora medible** al convertir las máquinas en imágenes fijas con partes vivas encima (24-39 fps frente a 31-40; se descartó y no está en el código), al quitar la viñeta del mapa, ni con `shape-rendering: optimizeSpeed` (peor: 30-33 frente a 35-41). La interfaz nueva y el suelo con detalle no empeoran los fps (36,7 frente a 34,5).
- Conclusión: el dibujado con SVG está cerca de su techo (~35 fps con la CPU frenada ×4); para ganar de verdad hay que pasar el mapa a canvas/WebGL (como la prueba de PixiJS de Space Harvest), una tarea grande que necesita aprobación de Mikel.

## 2026-10-21 — Pulido visual v2

- Interfaz con más relieve y profundidad (solo CSS, sin coste en el mapa): barra de dinero con degradado y brillo, moneda con volumen, producción por segundo en píldora, botones laterales con reflejo y brillo al estar listos, hoja de paneles con asa y degradado, botones de compra con más relieve, icono con volumen y precio con brillo, barras de progreso con degradado, aviso amarillo con brillo, foco visible al navegar con teclado y barra de desplazamiento fina. Respeta «reducir movimiento» y el alto contraste.
- Qué probar: abrir una línea y el panel de objetivos en el móvil.

## 2026-10-21 — Space Harvest se separa de este proyecto

- Todo lo de Space Harvest (diseño, decisiones, diario, prototipos de PixiJS y Blender) se ha movido a la carpeta `space-harvest/`, lista para llevársela a su propio repositorio. Este diario y `FEEDBACK.md` ya solo hablan de Scrap Empire. La web sigue publicando el prototipo en `/prototipos/espacio/` desde su nueva ubicación.

## 2026-10-21 — Sonidos del tren y el barco

- Bocina de dos tonos al salir el tren y sirena grave al salir el barco, sintetizadas por código (`src/ui/sound.ts`), con el interruptor de efectos de siempre.
- Qué probar: abrir las zonas 9 y 10 y esperar a que salga un viaje.

## 2026-10-21 — Retoques visuales y material de anuncio nuevo

- Viñeta suave en los bordes del mapa, botón de objetivos con su color (verde azulado) y monedas al cobrar un objetivo; cabecera de los paneles con franja de color.
- Material de anuncio regenerado (`scripts/marketing/index.mjs`): 8 capturas por idioma (nuevas: menú de inicio y objetivos diarios; la última habla de 10 zonas con tren y barco), gráfico de función y vídeos nuevos, y la ficha dice 10 líneas.
- Qué probar: `/press/` en la web publicada.

## 2026-10-21 — Menú de inicio

- Pantalla de inicio al abrir el juego (`src/ui/title.ts`): logo que flota, «SCRAP EMPIRE · IDLE FACTORY», resumen de la partida (dólares y zonas), botón grande «JUGAR/CONTINUAR» que brilla, idioma, sonido, brasas que suben y franja de peligro. Se salta con `?notitle` (la prueba de humo, `perf.mjs` y el material de anuncio ya lo usan); la prueba de humo comprueba que sale y que se cierra, y guarda `*-menu.png`.
- Pedido de Mikel: visuales, animaciones y material de anuncio más bonitos.
- Sigue: regenerar el material de anuncio con el menú y más pulido visual.

## 2026-10-21 — Almacén del tren y el barco (F4)

- Almacén por transporte (`warehouse` en `economy.json`): capacidad 500 (+250 por nivel, hasta 10, ×1,8 de precio por nivel; siempre cabe el doble de un cargamento); si se llena, las carretillas esperan con su tanda; al salir un viaje paga +5 % por cada 25 % lleno (máx. +20 %). Se compra en el panel de la línea y su estado sale en «Más datos». Precio inicial: la mitad del precio del transporte (lo puse yo, a revisar).
- Qué probar: zona 9 o 10: comprar el almacén y ver la bonificación al salir.
- Sigue: visuales (menú de inicio, animaciones, material de anuncio) si sobra tiempo.

## 2026-10-21 — Capitán y anuncio del tren y el barco (F5)

- Cada transporte tiene capitán (jefe de estación en el tren): gana un nivel por cada hora de trabajo y se paga como los ayudantes (`captain` en `economy.json`): +10 % de paga y −3 % de viaje por nivel, máximo 25. Dos anuncios opcionales en el panel de la línea: «Viaje ya» (sale en cuanto esté lleno) y «Cargamento ×2» (el próximo viaje paga el doble), con 2 h de espera entre usos (el Pase no espera).
- Qué probar: panel del Taller de vagones o del Astillero: línea del capitán y botones de anuncio.
- Sigue: F4 (almacén intermedio).

## 2026-10-21 — Destinos del tren y el barco (F3)

- Tren y barco tienen destinos (`routes` en `economy.json`): «Puerto local» (el de siempre, gratis) y tres que se compran en el panel de la línea (10, 100 y 1000 veces el valor de un cargamento): viaje ×1/×2/×4 y paga ×1,5/×3/×6 (ajustado el 2026-10-21) encima de la del transporte. Selector «Destino» con los ya comprados. Partidas antiguas: destino local.
- Descartado por Mikel (2026-10-21): «los destinos lejanos piden además la mitad de la otra línea». Paga ajustada a ×1,5/×3/×6 para que rindan igual por minuto.
- Qué probar: abrir la zona 9, comprar un destino y ver el cambio de espera y paga.
- Sigue: F5 (capitán y anuncio) y F4 (almacén).

## 2026-10-21 — Objetivos diarios

- Nuevos objetivos del día (`src/sim/daily.ts`, `dailyCore.ts`, números en `economy.json` → `dailyGoals`): 3 al día sorteados con el número del día (sin azar), fáciles/medios/difíciles, 10 min de producción cada uno y camión dorado gratis al cobrar los tres; con anuncio se cambia uno (una vez). Panel «Objetivos del día» con barras de progreso, botón «Hoy n/3» en los extras; guardado con valor por defecto para partidas antiguas. 10 tests nuevos (78 en total).
- El camión dorado gratis se cobra sin anuncio (`freeGolden`).
- Qué probar: tocar «Hoy 0/3», jugar un rato y cobrar; cobrar los tres y tocar el camión dorado.
- Sigue: F3 (rutas y contratos), F5 (capitán y anuncio) y F4 (almacén), con los números de la Parte 26.

## 2026-10-21 — Equilibrio B4b y B6b

- Abrir las zonas 8, 9 y 10 cuesta un 30 % menos y el nivel de máquina crece ×1,8 (`src/data/zones.json`, `economy.json`). Los 68 tests pasan.
- Mikel aprobó los objetivos diarios y F3, F4 y F5; los números están como propuesta en las Partes 25 y 26 de `FEEDBACK.md`.
- Qué probar: ritmo de las zonas 8-10 y de las máquinas jugando.
- Sigue: lo que Mikel elija en las Partes 25 y 26.

## 2026-10-21 — Panel de línea, temblor, Android y equilibrio

- **Panel de línea** (pedido de Mikel): arriba solo el ayudante, su estado y lo que produce; las mejoras van justo debajo y el resto de datos (máquinas, carretillas, palés, flujo de chatarra) quedan plegados en «Más datos» al final (se recuerda si estaba abierto).
- **Temblor con «palés llenos»**: la línea del aviso aparecía y desaparecía y cambiaba el alto del panel; ahora tiene un hueco fijo (`.jam-slot`) y la altura no cambia (medida: 437 px constantes).
- **Android (N2, primera parte)**: Capacitor 7 (`capacitor.config.json`, `CAPACITOR=1` pone rutas relativas), workflow manual «Android (APK de prueba)» y `docs/ANDROID.md`. No he podido compilar el APK aquí (sin SDK de Android): se comprueba lanzando el workflow.
- **Equilibrio (N1)**: simulación con las 10 zonas; tabla y opciones B4-B6 en la Parte 23. **F3, F4 y F5** quedan como propuesta en la Parte 24.
- Qué probar: abrir una línea en el móvil; lanzar el workflow «Android» y bajar el APK.
- Sigue: lo que Mikel elija en las Partes 23 y 24; clave de firma para el AAB.

## 2026-10-21 — Rendimiento: chispas sincronizadas

- Medido con `scripts/perf.mjs` (ahora 10 s tras 6 s de calentamiento y con la media; `EXTRA_CSS` prueba retoques de CSS): lo que más costaba eran las ~50 chispas de las máquinas, cada una con su animación CSS desfasada. Ahora parpadean todas a la vez con una clase que cambia `yard.ts` (se ve igual, nada eliminado): CPU ×4, de ~29 a ~37 fps de media. Sin ninguna animación CSS saldría ~39, así que el resto ya no está en las animaciones.
- Descartado tras medir: humo, lámparas, cintas y destellos del agua no pesan; `will-change` y `contain` no ayudan.
- Qué probar: en el móvil, la fluidez con varias zonas abiertas.
- Sigue: si aún va justo, el siguiente coste es el movimiento de vehículos y personas (transformaciones en cada fotograma).

## 2026-10-20 — Estaciones propias en el anexo

- Las carretillas de las zonas 9 y 10 ya no comparten pasillo ni andén: la del Taller de vagones descarga en el andén del tren y la del Astillero en el muelle del barco, cada una por su pasillo amarillo (`ANNEX_LANE_X` en `src/ui/yard.ts`). Solo cambia el dibujo.
- Qué probar: abrir las zonas 9 y 10 y ver cada carretilla llegar a su estación.
- Sigue: equilibrar tren y barco, tests de interfaz sencillos.

## 2026-10-20 — El barco zarpa

- El barco del puerto ya no es decorado fijo: cuando sale el cargamento de la zona 10 se va hacia la derecha, queda fuera unos segundos y vuelve por la izquierda (`shipSvg` en `src/ui/scenery.ts`, animación en `src/ui/yard.ts`).
- Qué probar: abrir la zona 10 y esperar a que el barco se llene y salga.
- Sigue: estación propia para las carretillas del anexo y equilibrar tren y barco.

## 2026-10-20 — Iconos en los estados

- El estado de una línea en su panel lleva un símbolo (▶ trabajando, ✖ sin chatarra, ■ palé lleno) además del color, para no depender solo del color (`src/style.css`).
- Qué probar: tocar una línea y ver el símbolo delante del estado.
- Sigue: animar el barco, tests de interfaz sencillos.

## 2026-10-20 — La prueba de humo comprueba más cosas

- `scripts/smoke.mjs` ahora abre el panel de una línea y comprueba que tiene contenido, abre el ranking (apagado, sin Firebase) y comprueba que muestra el aviso, y carga `?hora=22` comprobando que la capa nocturna se aplica. Nuevas capturas: `*-ranking.png` y `movil-noche.png`.
- Qué probar: nada en el juego; mira las capturas nuevas en la rama `capturas`.
- Sigue: tests de interfaz sencillos, iconos en los estados, animar el barco.

## 2026-10-20 — Iluminación y sombras suaves

- Sombra suave (degradado radial) bajo las máquinas de cada puesto y luz de sol en degradado sobre la nave, de día y de noche. Cambio solo de dibujo (`src/ui/yard.ts`).
- Qué probar: abrir un puesto y ver el suelo oscurecido bajo las máquinas; la nave más clara arriba a la izquierda y más oscura abajo a la derecha.
- Sigue: pruebas de la prueba de humo (panel por línea, ranking apagado, noche), iconos en los estados.

## 2026-10-20 — Accesibilidad: texto grande y alto contraste

- Dos interruptores nuevos en ajustes (es/en): «Texto grande» (paneles y mensajes al 120 %) y «Alto contraste» (por defecto sigue al sistema; texto blanco, bordes blancos). Se guardan en el aparato (`src/ui/prefs.ts`).
- Qué probar: ⚙ → Texto grande / Alto contraste; se aplican al instante.
- Sigue: iconos en los estados para no depender del color, iluminación y sombras.

## 2026-10-20 — Ajustes completos

- Ajustes con interruptores propios de efectos de sonido, vibración y reducir movimiento (este último por defecto sigue al sistema; al cambiarlo se recarga la página). Se guardan en el aparato, no en la partida (`src/ui/prefs.ts`). Textos es/en.
- Qué probar: ⚙ → apagar «Efectos» (la música sigue), «Vibración» y «Reducir movimiento» (sin animaciones de máquinas, rebotes ni temblor).
- Sigue: accesibilidad (texto grande, alto contraste), iluminación y sombras, animar el barco.

## 2026-10-20 — Música ambiental

- Música suave sintetizada (acordes de ondas sinusoidales en bucle, sin archivos de terceros). Arranca con el primer toque; el botón de silencio la calla y en ajustes hay un interruptor «Música» propio (es/en).
- Qué probar: tocar la pantalla y oír el fondo; ajustes → Música → No.
- Falta: sonidos por tipo de línea, volumen graduable y resto de ajustes completos.

## 2026-10-20 — Pedidos especiales, tren y barco

- Mikel eligió Z1, 2b, precios y pedidos OK. Zonas 9 (vagones, por tren) y 10 (contenedores, por barco): el tren y el barco se llenan y salen llenos, pagan ×1,5 y ×3; mejora de carga en el menú de cada línea. Anexo nuevo en el mapa a la derecha de la nave; el tren del fondo pasa al salir cargado.
- Pedidos especiales cada 15 min con 2 min de plazo; cantidad ajustada a lo que la línea puede producir y llevar a tiempo (62 s) en tandas enteras, para que nunca sea imposible. Bonificación = valor de lo pedido. Barra de arriba con cuenta atrás, avisos y logro «Primer pedido»; logro «Imperio completo» (10 zonas).
- 11 pruebas nuevas (`tests/transport.test.ts`); partidas antiguas sin tren/barco/pedido se cargan con valores por defecto.
- Qué probar: abrir las zonas 9 y 10 (en el anexo, a la derecha, arrastrando el mapa), esperar un pedido (~15 min) y entregarlo. Las cifras de carga y retorno del tren y el barco son provisionales.
- Falta: animar el barco al zarpar, estación propia de descarga en el anexo, equilibrio de las dos zonas con la simulación de jugador.

## 2026-10-20 — Equilibrio B1b y B2a

- Mikel eligió B1b y B2a: abrir las zonas 3 y 4 cuesta un 50 % más y el nivel de máquina crece ×2,2 por nivel (antes ×4). Zona 4 a ~4,3 h jugando sin parar.
- B3 (pedidos especiales, zonas de tren y barco) queda en la Parte 22 de FEEDBACK.md a la espera de números y de aclarar qué producto va en cada transporte.

## 2026-10-20 — Scrap Empire y material de anuncio

- Mikel eligió G2 y M1-M4. El juego pasa a llamarse «Scrap Empire: Idle Factory» (título, carga, manifest, cartel del mapa). Las etiquetas «Muelle y carretillas» y «Camiones de chatarra» del mapa estaban sin traducir: arreglado.
- `scripts/marketing/index.mjs` (necesita el build hecho, Chromium y ffmpeg) genera `public/press/`: capturas con rótulos (es/en), gráfico de función, iconos, vídeos (fotogramas del navegador unidos con ffmpeg) y página de prensa. Textos de la ficha en `docs/FICHA_TIENDA.md`.
- Qué probar: abrir `/press/` en la web publicada y ver el vídeo en el móvil.
- Sigue abierto: B1-B3 de la Parte 18 (equilibrio y estímulos).

## 2026-10-20 — Carretillas que hacían bucle en el palé

- Bug de Mikel: las carretillas de las líneas muy mejoradas solo aparecían girando junto al palé, en bucle; las de una línea nueva iban bien. Causa (solo en el dibujo): cada carretilla visible seguía al viaje más viejo de su línea; con muchas carretillas ese viaje siempre estaba a punto de acabar. Ahora cada carretilla sigue a su viaje hasta que termina, y libre espera en el palé y solo coge viajes recién salidos.
- Propuesta nueva: Parte 21 (trenes y barcos para alargar el juego), pendiente de que Mikel elija.
- Qué probar: una línea con muchas carretillas y mucho nivel de tanda; deben hacer el viaje entero al muelle.

## 2026-10-20 — Logística visible (L1)

- Fase 2b: la caja del camión de expedición se llena con lo que hay en cada huella del muelle (en proporción) en vez de repartir los productos a partes iguales; al salir conserva su carga. Las huellas y las carretillas con carga ya estaban hechas.
- Qué probar: ver cómo el camión lleva más de los productos que más se acumulan en el muelle.
- Siguiente: música ambiental o accesibilidad (Fase 2b). Siguen sin respuesta las Partes 11, 18, 19 y 20.

## 2026-10-20 — Estadísticas del jugador

- Fase 2b: en ajustes, sobre los logros, salen tiempo de partida, dinero ganado, camiones enviados (incluye dorados) y mejor racha. Partidas antiguas empiezan en 0 en lo nuevo. Con test; textos en es/en.
- Qué probar: abrir ajustes tras jugar un rato.
- Siguiente: logística visible (L1). Siguen sin respuesta las Partes 11, 18, 19 y 20.

## 2026-10-20 — T3, simulación de jugador, inglés y rendimiento

- Mikel eligió T3. Cada línea tiene sus carretillas (extra y «tanda» de +5 piezas por viaje) y el palé de salida solo suma cuando llega la tanda entera (viaje de 10 s). Mejoras en el menú de cada línea. Partidas antiguas migradas.
- Simulación de jugador (`scripts/balance.ts`): resultados y opciones en la Parte 18 de FEEDBACK.md (todo abierto en ~9 días casual / ~2,4 días atento; nivel 30 de máquina imposible; R2 cambia a ~3,6 h la zona 4).
- Inglés: selector en ajustes, todos los textos y nombres. Prueba que exige las traducciones.
- Rendimiento (`scripts/perf.mjs`): el coste es pintar el SVG; líneas fuera de pantalla sin animar, 30 fps en táctiles, «Calidad baja» automática o fija en ajustes. ~11 → ~25 fps en la prueba lenta.
- Propuestas nuevas: Parte 18 (números y estímulos), 19 (nombre global) y 20 (material de anuncio).
- Qué probar: comprar carretillas en una línea y ver las tandas llegar al muelle; cambiar a English en ajustes; ver si baja el parpadeo.

## 2026-10-20 — Apertura de zona animada

- Fase 2b: al abrir una zona el andamio sube y se desvanece mientras la máquina entra desde arriba con un pequeño rebote (se respeta «reducir movimiento»).
- Qué probar: abrir una zona nueva desde su puesto.
- Siguiente: logística visible (L1) o lo que Mikel decida de la Parte 17 (tandas) y la Parte 11.

## 2026-10-20 — KPI al seleccionar la línea

- Mikel: pantalla sucia, «0/200» sin sentido, pila siempre a 0 y 517/s frente a 31/s. Quitados de la pantalla los textos por línea y la barra de KPI; solo queda el objetivo. Al tocar una línea salen chatarra que entra, pila, capacidad de aplastado, palés, muelle y atascos. La pila vacía muestra «+N/s». La pila a 0 es real: las líneas gastan todo lo que entra (517/s era capacidad, no consumo).
- Propuesta nueva: Parte 17 (tandas de carretillas y mejoras por línea).
- Qué probar: tocar una línea; ver que el mapa queda limpio.

## 2026-10-20 — Temblor al abrir una zona

- Fase 2b, «Juice» (cerrado): al comprar la apertura de una zona el mapa tiembla suavemente (se respeta «reducir movimiento»).
- Qué probar: abrir una zona nueva desde su puesto.
- Siguiente: apertura de zona animada (se levanta el andamio y entra la máquina).

## 2026-10-20 — Monedas que vuelan y destello al comprar

- Fase 2b, «Juice» (primera parte): al cobrar un camión salen monedas que vuelan al contador de dólares y la cifra rebota; al comprar, el botón da un destello y la cifra rebota. Se respeta «reducir movimiento».
- Qué probar: cobrar un camión y comprar una mejora.
- Siguiente: temblor suave al abrir una zona (junto con la apertura animada).

## 2026-10-20 — Los dólares cuentan hacia arriba

- Fase 2b, «Interfaz coherente» (cerrada): la cifra de dólares de la barra de arriba sube y baja con suavidad en vez de saltar (se respeta «reducir movimiento»).
- Qué probar: cobrar un camión y comprar algo; la cifra debe deslizarse.
- Siguiente: «juice» (monedas que vuelan al contador, números flotantes, destello al comprar).

## 2026-10-20 — Paneles con transición y botones con relieve

- Fase 2b, «Interfaz coherente»: el panel inferior sube con una transición suave, el ranking y el aviso de bienvenida aparecen con un pequeño rebote, y todos los botones (código de partida, bienvenida, ranking) tienen relieve y se hunden al pulsar. Se respeta «reducir movimiento» del sistema.
- Qué probar: abrir un puesto, el ranking y volver tras un rato fuera.
- Siguiente: cifras que cuentan hacia arriba, y después el «juice».

## 2026-10-20 — Sin emojis en textos y avisos

- Fase 2b, «Interfaz coherente»: el tutorial, el objetivo, el aviso de atasco, los avisos de logro y los botones de anuncio al volver llevan iconos SVG propios (dedo, moneda, carrito, check, diana, advertencia, medalla, anuncio) delante del texto (`inlineIcon`); los rótulos del mapa y la lista de logros pierden los emojis.
- Qué probar: el mensaje amarillo del tutorial, la línea de objetivo, un logro y la ventana al volver.
- Siguiente: botones con relieve, paneles con transición y cifras que cuentan hacia arriba.

## 2026-10-20 — Iconos SVG propios en la interfaz (primera parte)

- Fase 2b, «Interfaz coherente»: los emojis de la barra de arriba (ranking, ajustes, sonido) y de los botones de extras (empujón, regalo diario, pase) pasan a iconos SVG propios con contorno y sombra (`uiIcon` en `src/ui/icons.ts`).
- Qué probar: la barra de arriba y los tres botones de abajo a la izquierda se ven nítidos y del mismo estilo; el de sonido cambia al silenciar.
- Siguiente: quitar los emojis que quedan en textos y avisos (tutorial, objetivo, logros, rótulos del mapa), botones con relieve y cifras que cuentan hacia arriba.

## 2026-10-19 — Ranking con Firebase, hitos, logros y calidad profesional

- Mikel: mejor el parpadeo; Firebase para el ranking; propuestas de la noche «como mejor veas»; amplía el roadmap y mejora la calidad general: «que sea un videojuego profesional y no parezca tan indie».
- Ranking (`src/ui/ranking.ts`, `docs/RANKING.md`): botón 🏆 con apodo y top 50; Firebase se carga solo al abrir el ranking. Está apagado hasta que Mikel cree el proyecto y pegue la configuración en `src/data/firebase.json` (pasos en `docs/RANKING.md`).
- Simulación: premio al llegar a un múltiplo de 5 de nivel de máquina (`milestoneReward`, una sola vez por hito), logros (`src/data/achievements.json`, `checkAchievements`) y objetivo (`currentGoal`). Partidas antiguas válidas. Tests nuevos (50).
- Pantalla: línea de objetivo, aviso de logro, lista de logros en ⚙, contador de fotogramas con `?fps=1`, pantalla de carga con logo, icono y manifest, vibración en toques y compras.
- Roadmap: nueva Fase 2b «Calidad profesional» con 14 tareas (tutorial, interfaz coherente, juice, apertura de zona animada, logística visible, música, ajustes, rendimiento, luz y sombras, estadísticas, accesibilidad, inglés, equilibrio, pruebas).
- Qué probar: ⚙ (logros), subir una máquina a nivel 5 (premio), `?fps=1` en el Pixel y decirme los fps.
- Tutorial de los primeros minutos (mensaje amarillo que guía: tocar 5 veces, juntar $10, abrir Aplastado, comprar, cerrar); se salta si ya hay partida.
- Siguiente: interfaz coherente (iconos SVG propios, relieve, transiciones) y «juice».

## 2026-10-19 — Pedidos tras probar en el Pixel 10: líneas, muelle, noche y niveles

- Mikel contesta que sigue parpadeando (menos). El Android empaquetado con Capacitor usa el mismo motor (WebView de Chromium), así que **no lo quita por sí solo**: lo que pesa es dibujar miles de nodos SVG con animaciones; si persiste, habrá que dibujar lo animado en canvas. Sigue anotado como posible tarea (opción N4 de la Parte 11).
- Simulación (`game.ts`): `dockByZone` (unidades de cada producto en el muelle; el camión se lleva su parte; partidas antiguas válidas), `zoneStatus` (trabajando / sin chatarra / palé lleno), `bottleneck` y `scrapDemand`. Tests nuevos.
- Pantalla: barra con pila, chatarra que entra, la que piden las máquinas, palés y muelle, y el cuello de botella; cada línea muestra piezas/s y estado, y su palé las unidades; una huella de salida por producto en el muelle con sus unidades.
- Carretillas: arreglado el bug que las dejaba girando sobre sí mismas (el viaje terminaba nada más empezar); ahora hacen el viaje completo y cada línea abierta tiene la suya a la vista.
- Máquinas: se ven una a una hasta 9 (cuadrícula) y «+N» si hay más; cada 5 niveles de máquina se transforman (depósitos, segunda chimenea, dorado, neón, corona, aura).
- Subida de nivel múltiplo de 5 en cualquier mejora: anillo, estrellas, texto y sonido; la máquina rebota.
- Noche: la nave se queda menos oscura y 9 focos del techo iluminan el suelo y lo de dentro (`?hora=23` para probar).
- Mejoras por línea: tocar un puesto (o el muelle, o la carretera de camiones) abre su panel con ayudante, estado y compras; se resalta el puesto y la cámara lo sube sobre el panel; marca verde en lo que se puede comprar. Desaparece el botón compartido; los ajustes (código de partida) pasan al ⚙.
- Propuesta nueva Parte 12 (ranking mundial: Firebase, Supabase, Play Games o sin servidor).
- Qué probar: todo lo anterior en el Pixel; sobre todo tocar puestos, ver crecer el número de máquinas y subir una máquina a nivel 5.
- Siguiente: lo que decida Mikel (Partes 11 y 12).

## 2026-10-19 — Menos parpadeo en el móvil (Pixel 10)

- Mikel avisa: en su Google Pixel 10 la escena se ve «glitch» y las animaciones parpadean. No se puede reproducir sin el móvil (Chromium sin pantalla no usa la GPU), así que se atacan las causas probables.
- Los vehículos (carretillas, AGV, camión de chatarra) destruían y recreaban sus nodos SVG cada vez que cambiaban de ángulo (~430 nodos nuevos por segundo, midiendo en Chromium). Ahora cada variante se dibuja una sola vez y solo se enseña u oculta (`showVariant` en `yard.ts`); bajan los nodos creados a casi la mitad y los cambios del DOM de 700 a 560 cada 3 s.
- La reordenación de profundidad solo mueve los nodos que no están en su sitio, y las imágenes estáticas piden decodificación síncrona.
- Qué probar en el Pixel: si el parpadeo se ha ido. Si no, decir qué parpadea exactamente (máquinas, carretillas, fondo, al mover la cámara o al hacer zoom).
- Siguiente: si sigue, es la GPU con las imágenes estáticas enormes (se partirían en trozos) o el número de nodos animados.

## 2026-10-19 — Decorado nuevo, día y noche y anuncios al volver

- Mikel envía un vídeo de la web y elige D1, D3, D4 y D5 (fondo) y A3 y A4 (anuncios al volver). En el vídeo se ve un parpadeo en el que desaparecen máquinas y ayudantes durante un fotograma y mucho espacio vacío; para aligerar, lo estático (ciudad, terreno, suelo, nave y puerto) pasa a imágenes que se dibujan una vez y las animaciones ocultas se apagan (de ~3000 a ~2000 nodos).
- `src/ui/scenery.ts`: ciudad con 4 capas, autopista elevada con coches, farolas con luz de noche, árboles secos, cartel, aceras, charcos y manchas de suelo, vía con tren de mercancías que pasa cada 75 s, grúa pórtico, barco con contenedores, agua con destellos; interior de la nave con estanterías, oficina de cristal, depósitos, bidones, taquillas y palés; andamio y lona en las zonas cerradas. Cielo de día, atardecer y noche según la hora local (`?hora=22` en la URL para probar); de noche se encienden las ventanas y las farolas.
- `src/sim/offline.ts`: `unpack` devuelve también `lostSeconds` y `lostDollars` (lo perdido por pasar del tope libre, hasta las 8 h); `doubleOfflineEarnings` y `recoverLostTime`. Tests en `tests/offline.test.ts`.
- Pantalla: el aviso de bienvenida tiene los botones «×2» y «Recuperar N h» (con el Pase se dan sin anuncio) y una ✕ para cerrarlo.
- Qué probar: arrastrar hacia arriba (ciudad y autopista) y hacia abajo (tren, grúa y barco); la hora del día; volver tras más de 1 h y usar los dos botones; si el parpadeo del vídeo sigue.
- Siguiente: lo que diga Mikel; pulir el rendimiento si el parpadeo persiste en el móvil.

## 2026-10-19 — Arreglos de la escena, AGV y tope de 1 h

- Animaciones de las líneas: prensa, engranaje, humo, chispas, cintas y ayudante se mueven con un nivel de trabajo suavizado en código (arrancan rápido, paran despacio, sin reinicios ni saltos cuando la chatarra llega a golpes).
- Carretillas: salen a trabajar en cuanto su zona tiene producto o está produciendo (antes esperaban hasta 8 s parqueadas y parecía que no estaban), empiezan girando junto al palé y no salen dos de la misma zona a la vez.
- La gente que paseaba se cambia por 3 AGV (vehículos guiados) con rutas pintadas en el suelo: de la pila al inicio de las cintas, reparto por el pasillo central y pasillo del muelle; van cargados con un contenedor de chatarra, giran, descargan y vuelven vacíos.
- Coches de fondo: misma velocidad por carril y huecos iguales, y carriles separados, así no se atraviesan.
- Tope de lo ganado fuera: 1 h sin pase (antes 2 h); el pase sigue en 8 h. Tests actualizados.
- Propuestas nuevas en FEEDBACK.md: Parte 9 (cinco opciones de fondo y decorado) y Parte 10 (cómo ampliar el tope con un anuncio).
- Siguiente: lo que elija Mikel en las Partes 9 y 10.

## 2026-10-19 — Animaciones, productos propios y ciudad de fondo

- Mikel pide todas las animaciones, un producto distinto por línea, carretillas que giran, arreglar las cargas y el camión, ciudad de fondo, nave en rayos X y más vida.
- `src/ui/props.ts`: un producto con forma propia por zona (bloque de chatarra, lingotes, chapas, tubos, vigas en I, engranaje con pistón, motor, cochecito) en palés, carretillas, muelle y camión.
- `src/ui/vehicles.ts`: carretilla que gira de verdad (ángulo libre) al cambiar de sentido en el muelle y junto al palé; solo lleva productos si su zona tiene producto (1-3 según lo que hay) y va vacía al volver; camión de chatarra que maniobra hasta la pila, levanta la caja, desliza la carga y levanta polvo; coches de fondo en las dos carreteras.
- Arreglo: el camión de expedición se llena producto a producto en el muelle y solo sale cuando está lleno (antes aparecía lleno de golpe); lo que sobra espera en el muelle.
- `src/ui/scenery.ts`: cielo, ciudad industrial en el horizonte (torres con ventanas, naves, silos, depósitos, chimeneas con humo, grúas), silueta de la nave en rayos X (paredes tenues y estructura de líneas), nubes y pájaros.
- Máquinas: prensa que sube y baja, engranaje que gira, chispas y humo de la chimenea mientras trabajan; cintas con chatarra que avanza; tres trabajadores pasean por los pasillos; la pila salta y suelta esquirlas al tocarla.
- Qué probar: arrastrar hacia arriba para ver la ciudad; mirar una carretilla girar en el muelle; tocar la pila muy rápido y ver llenarse el camión poco a poco; que la nave en rayos X no moleste.
- Siguiente: pulir (rendimiento en móviles flojos, ajustar tamaños) y lo que diga Mikel.

## 2026-10-19 — Guardado reemplazable

- Mikel elige S1 (solo código manual) con la condición de poder cambiarlo fácilmente. `src/ui/storage.ts` define `SaveStore` (`read`/`write`) y `app.ts` solo usa `store`: una nube futura es otra implementación y un cambio de una línea.
- Siguiente: animación de vuelco de chatarra y pulir.

## 2026-10-19 — Partida en otro dispositivo

- Mikel pregunta si la partida es multidispositivo: hasta ahora no (solo `localStorage`). Primera parte sin servidor: `src/sim/transfer.ts` convierte el guardado en un código `CHAT1:…` y lo valida al leerlo; tests en `tests/transfer.test.ts`.
- En el panel «Mejoras» hay «Copiar código» y «Pegar código» (pide confirmación, sustituye la partida y recarga; no se autoguarda encima).
- Qué probar: copiar el código en el móvil, pegarlo en el PC y ver que llega la partida.
- Siguiente: Mikel elige cómo sincronizar solo (Parte 8 en FEEDBACK.md: S1-S4).

## 2026-10-19 — Sonidos

- `src/ui/sound.ts`: efectos sintetizados con Web Audio (sin archivos ni licencias): toque en la pila, compra, cobro de un camión y recompensas (premio diario, ×2, camión dorado). Botón 🔊/🔇 en la barra de arriba; se recuerda el silencio.
- Qué probar: tocar la pila, comprar, esperar a un camión y silenciar con el botón (en el móvil el sonido empieza tras el primer toque).
- Siguiente: animación de vuelco de chatarra y pulir; después Android.

## 2026-10-19 — Vista isométrica a pantalla completa

- Mikel enseña una captura de un idle de serrería isométrico como referencia.
- `src/ui/iso.ts`: proyección isométrica y bloques de tres caras. `src/ui/yard.ts`: el desguace entero en isométrico: carretera de atrás con hasta 3 camiones de chatarra, pila que se toca, cintas que reparten la chatarra, 8 puestos en dos filas (suelo del color de la zona con línea amarilla discontinua; 1-2 máquinas según las compradas, oxidadas en nivel 0, pintadas en 1, con panel y luz en 2, doradas en 3+; el ayudante hecho de bloques con su casco, gorra, barba…; palé con cajas), carretillas por los pasillos hasta el muelle, muelle con cajas, camión de expedición en la carretera de delante, camión dorado y dinero verde que salta al cobrar. Se ordena lo que está delante y detrás en cada fotograma.
- Pantalla completa: arrastrar mueve la cámara, pellizcar o la rueda acercan; dinero arriba, botones flotantes (×2, premio diario, pase) a la derecha y «Mejoras» abajo con un contador de lo que se puede comprar, que abre un panel.
- Qué probar: la web en el móvil: moverse por el mapa, acercar, tocar la pila y abrir las mejoras.
- Siguiente: lo que diga Mikel del aspecto; sonidos; después Android.

## 2026-10-19 — La chatarrería en vista cenital inclinada

- Mikel pide una escena más bonita: plano cenital inclinado con las líneas de cada máquina, máquinas que cambian por nivel, camiones de chatarra por detrás, carretillas dentro y camiones de expedición delante.
- `src/ui/scene.ts` rehecha: carretera trasera con hasta 3 camiones de chatarra que vuelcan en la pila; tolva y cinta central que reparte la chatarra; 8 líneas en dos columnas, cada una con su suelo de color, su cinta con chatarra avanzando, su máquina (oxidada en nivel 0, pintada con franjas en nivel 1, con luces y ventana en nivel 2, con remates dorados y estrella en nivel 3 o más; «×N» con varias máquinas), su ayudante (se mueve al trabajar) y el palé con el producto; carretillas por los pasillos laterales entre los palés y el muelle; muelle de carga con cajas y camión de expedición que se va por la carretera delantera; camión dorado delante.
- Qué probar: la web en el móvil; subir el nivel de máquina del aplastado y ver cómo cambia.
- Siguiente: sonidos, monedas al cobrar y pulir; después Android.

## 2026-10-19 — Escena 2D del desguace

- Mikel cambia el 3D por 2D muy bonito y atractivo (sin pixel art).
- `src/ui/scene.ts`: escena SVG dibujada por código: cielo de atardecer con ruinas, pila de chatarra que se toca (crece con la chatarra y muestra «+1»), camión de chatarra que llega y vuelca, carretillas por el camino, muelle con cajas que se llenan, camión de expedición que se va y vuelve, las 8 zonas (cerradas con candado y precio; abiertas con su color, chimenea con humo, engranaje que gira, producto, barra del almacén y la cara de su ayudante con su nivel) y el camión dorado, que se toca en la propia escena.
- `src/ui/look.ts`: colores de cada zona y rasgos de cada ayudante (casco, gafas de soldar, barba, gorra, pañuelo, pelo de punta, casco con rayo, casco de carreras), por id.
- Tienda con tarjetas e iconos dibujados; ya no se redibuja en cada fotograma (los toques no se pierden).
- Qué probar: la web en el móvil: tocar la pila, ver moverse camiones y carretillas, abrir la segunda zona.
- Siguiente: sonidos y más animaciones; después Android (Capacitor, AdMob y Google Play).

## 2026-10-19 — Racha, empujón, camión dorado y pase

- Mikel decide: si se falta un día, la racha vuelve al día 1.
- `src/sim/game.ts`: racha de 7 días (10, 20, 30, 45, 60, 90 y 120 min de producción; sin producción no se cobra ni se gasta el día), empujón ×2 a lo que pagan los camiones durante 30 min, camión dorado cada 15 min que espera 20 s y paga ×10 lo del muelle, y Pase de chatarrero (tope fuera de 8 h). Números en `src/data/economy.json`. Tests en `tests/extras.test.ts`.
- `src/ui/ads.ts`: anuncios y compra de prueba en la web (aviso de 2 s y confirmación); con el pase, las recompensas se dan sin anuncio.
- Provisional: la espera de 30 min entre empujones y los días 2-6 de la racha (entre 10 min y 2 h).
- Qué probar: cobrar el premio diario, activar el ×2, tocar el camión dorado cuando salga y activar el pase de prueba.
- Siguiente: el dibujado 3D con Three.js y modelos CC0; después Android (Capacitor, AdMob y Google Play).

## 2026-10-19 — Los ayudantes suben de nivel

- Mikel decide la Parte 6: un nivel de ayudante cada hora de trabajo, +10 % de valor y +5 % de velocidad por nivel, máximo 25, racha de 10 min a 2 h de producción, camión dorado cada ~15 min y pase a 2,99 €.
- `src/sim/game.ts`: cada zona guarda el nivel y la experiencia de su ayudante; la experiencia sube solo mientras la zona trabaja; el nivel se compra cuando está desbloqueado. Números en `src/data/economy.json` (`helpers`); el precio de cada nivel (100 $ × escala de la zona × 1,5 por nivel) es provisional. Partidas antiguas: los ayudantes empiezan en nivel 0. Tests en `tests/game.test.ts`.
- La pantalla muestra cada ayudante con su nivel y el botón «Subir de nivel a …» cuando está listo.
- Ritmo con el jugador simulado: zona 8 a las ~104 h volviendo cada hora (antes 131 h); las 4 primeras zonas siguen en R2.
- Qué probar: jugar una hora con la zona trabajando y subir de nivel a Tuerca.
- Siguiente: la Parte 7 (qué pasa si se falta un día de la racha); después el pase, la racha, el empujón y el camión dorado, y el dibujado 3D.

## 2026-10-19 — Ocho zonas con sus personajes

- Mikel decide la Parte 5: Pase de chatarrero (compra única), racha de 7 días, empujón ×2 con anuncio, camión dorado con anuncio y más zonas antes de publicar.
- `src/data/zones.json`: 4 zonas nuevas (vigas, piezas de motor, motores y coches reconstruidos) con sus ayudantes Grúa, Pistón, Bujía y Turbo; los 8 ayudantes llevan una frase de personalidad.
- Ritmo con el jugador simulado: zona 5 a las ~18 h, zona 6 a las ~35 h, zona 7 a las ~75 h y zona 8 a las ~131 h volviendo cada hora (137 h jugando atento; 122 h cada 2 h). El ritmo de las 4 primeras no cambia.
- Aviso: a partir de la zona 5 el freno es la chatarra (los camiones de chatarra suben de precio ×1,10 y traen siempre lo mismo); los niveles de los ayudantes ayudarán.
- Qué probar: en la web, las zonas nuevas aparecen en la lista de compras al llegar a ellas.
- Siguiente: la Parte 6 del diseño (ayudantes, racha, camión dorado y precio del pase); y el dibujado 3D.

## 2026-10-19 — Pantalla principal, guardado y ganancias con el juego cerrado

- `src/ui/app.ts`: pantalla vertical provisional (sin 3D): dólares, pila de chatarra para tocar, zonas abiertas, muelle y lista de compras con botones de 44 px. Textos en `src/ui/texts.ts`.
- `src/sim/offline.ts`: guardado con marca de tiempo (localStorage cada 10 s y al salir) y simulación del tiempo cerrado con el tope de 2 h. Tests en `tests/offline.test.ts`.
- La prueba de humo ahora toca la pila y captura «jugando» (no pude ejecutarla aquí: se cuelga en el entorno; la comprobará el workflow).
- Qué probar: abrir la web en el móvil, tocar, comprar, cerrar y volver (mensaje de lo ganado).
- Siguiente: dibujado 3D con Three.js y modelos CC0; la Parte 5 sigue esperando respuesta.

## 2026-10-19 — Simulación del bucle básico y ritmo R2

- Mikel decide la Parte 4: ritmo R2, precios ×1,10, tope de 2 h fuera (ampliable con un «free pass») y ayudantes Tuerca, Chispa, Yunque y Codo.
- `src/sim/game.ts`: chatarra (toques y camiones), 4 zonas en paralelo, carretillas, muelle con camiones de expedición que salen al juntar la carga, mejoras (velocidad, capacidad, máquinas, nivel de máquina, carretillas, carga del muelle, camiones de chatarra), dólares y guardado en JSON con versión. Contenido y números en `src/data/zones.json` y `src/data/economy.json`.
- `src/sim/bot.ts`: jugador simulado que compra lo que se paga antes de poder abrir la siguiente zona. Con él se han ajustado los precios: zona 2 a los 10 min, zona 3 a los 49 min y zona 4 a las 6,1 h jugando atento; volviendo cada hora, 7,2 h; cada 2 h, 10,2 h; cada 4 h, 20 h (el tope de 2 h fuera frena).
- Supuestos provisionales (se ajustan probando): todas las zonas gastan 1 de chatarra por unidad; el nivel de máquina dobla su producción; la chatarra y las carretillas van primero a la zona que más paga.
- Qué probar: nada visible todavía; la web sigue con la pantalla de «en diseño».
- Siguiente: la pantalla principal en vertical; y la Parte 5 del diseño (free pass, premio diario, anuncios, sucesos y duración).

## 2026-10-19 — Decidida la Parte 3 del diseño

- Mikel decide: 4 zonas industriales (bloques, lingotes, chapa y tubos), ayudantes fijos con nombre y personalidad y camiones todos iguales. Resumido en «Decidido» de DISENO.md; la fase 1 pasa a «Pendiente».
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 4 (ritmo, subida de precios, tope de lo ganado fuera y nombres); con ella empieza la fase 1.

## 2026-10-19 — Decidida la Parte 2 del diseño

- Mikel decide: la chatarra se recoge tocando y luego la traen camiones; zonas en paralelo; carretillas que llevan lo fabricado al muelle y camiones que cargan solos con suficiente stock; mejoras de velocidad, capacidad, máquinas y nivel de máquina; ayudantes que suben con experiencia y dólares y mejoran valor y velocidad. Resumido en «Decidido» de DISENO.md.
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 3 del diseño (zonas, productos, ayudantes y camiones) en FEEDBACK.md; con ella se puede empezar la fase 1.

## 2026-10-19 — Decidida la Parte 1 del diseño

- Esqueleto subido a `main` y publicado («Probar y publicar» correcto).
- Mikel decide: tono ligero y de humor; el dólar como única moneda y la chatarra como único recurso; zonas que se desbloquean con dólares, cada una con su ayudante que da mejoras según su nivel; sin prestigio en la primera versión. Resumido en «Decidido» de DISENO.md.
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 2 del diseño (de dónde sale la chatarra, cadena de zonas, expedición, mejoras y ayudantes) en FEEDBACK.md.

## 2026-10-19 — Nace Chatarrero, el primer juego de Zenit Studio

- Mikel crea Zenit Studio (repositorio `IdleScrapyard`) y elige empezar por un juego incremental (idle) para Android.
- Esqueleto del proyecto: Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas (rama `capturas`) para el módulo de STONKS.
- `docs/DISENO.md`: estructura genérica de un juego idle (bucle, monedas, números, retención, dónde van los anuncios). El diseño concreto se decide con Mikel en FEEDBACK.md, por partes; ya decidido: 3D con Three.js y modelos CC0 de Kenney y Quaternius, y ayudantes con nombre y rasgos que suben de nivel como lo que nos diferencia. Falta: tema, monedas y prestigio.
- Qué probar: abrir https://mikeljka.github.io/IdleScrapyard/ en el móvil; de momento es solo la pantalla de «en diseño».
- Siguiente: seguir concretando el diseño con Mikel; con lo básico decidido, la fase 1 (bucle, generadores y guardado).
