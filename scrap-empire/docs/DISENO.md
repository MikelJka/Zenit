# Estructura de un juego idle

Esta es la plantilla genérica de un juego incremental (idle) para móvil: las piezas que tiene casi cualquier juego del género y dónde encaja cada cosa. **No es el diseño de Chatarrero**: lo concreto (tema, recursos, números, anuncios) se decide entre Mikel y Claude en «Propuestas para Mikel» de `FEEDBACK.md`, y lo aprobado se apunta en la sección «Decidido» al final de este archivo.

## 1. El bucle principal

1. **Acción manual**: el jugador toca para ganar una pequeña cantidad. Es lo único que hay al empezar y deja de importar pronto.
2. **Generadores**: cosas que se compran y producen solas cada segundo. Es el corazón del juego.
3. **Mejoras**: compras puntuales que multiplican la producción de un generador, de todos o de los toques.
4. **Hitos**: al tener N unidades de un generador (10, 25, 50, 100…), su producción se multiplica. Dan objetivos a corto plazo.
5. **Reinicio con premio** (prestigio): cuando el avance se frena, el jugador lo reinicia todo a cambio de una moneda permanente que acelera la siguiente partida.

Un buen ritmo: algo nuevo que comprar cada pocos segundos al principio, cada pocos minutos a la media hora y un reinicio rentable a las pocas horas.

## 2. Monedas

| Tipo | Ejemplo | Se pierde al reiniciar |
| --- | --- | --- |
| Principal | la que dan los toques y los primeros generadores | Sí |
| Secundarias (opcional) | se fabrican con la principal; abren generadores nuevos | Sí |
| De prestigio | se gana al reiniciar; bonificación permanente | No |
| Premium (opcional) | gemas, solo con anuncios o compras | No |

Cuantas menos monedas, más fácil de entender. Lo habitual en un primer juego: una principal, como mucho una secundaria y la de prestigio.

## 3. Números

- **Precio de cada generador**: `precio_base × factor ^ unidades_compradas`, con un factor entre 1,07 y 1,15.
- **Producción**: `producción_base × unidades × multiplicadores` (mejoras, hitos, prestigio).
- **Números grandes**: se escriben abreviados (1,2 K · 3,4 M · 5,6 B…) y la simulación debe aguantar números enormes.
- **Ganancias con el juego cerrado**: producción por segundo × tiempo fuera, con un tope (normalmente 2–8 h, ampliable con mejoras).
- **Equilibrio**: se prueba con simulaciones en los tests (cuánto se tarda en llegar a cada generador jugando de forma razonable).

## 4. Retención (que vuelvan)

- **Ganancias con el juego cerrado** y su pantalla de bienvenida.
- **Recompensa diaria** y rachas de días seguidos.
- **Objetivos o logros** con premio.
- **Sucesos temporales**: algo aparece un rato y da un empujón si se toca.
- **Notificaciones** (con permiso): «tu almacén está lleno».

## 5. Dónde van los anuncios

| Sitio | Tipo | Cómo se recibe |
| --- | --- | --- |
| Pantalla de bienvenida | Con recompensa: doblar (o triplicar) lo ganado fuera | El mejor: lo pide el jugador y lo ve mucha gente |
| Empujón temporal | Con recompensa: ×2 a la producción durante unos minutos | Muy bueno; con un tiempo de espera entre uno y otro |
| Suceso que aparece | Con recompensa: premio del suceso | Bueno si no es constante |
| Premio diario o cofre | Con recompensa: doble premio | Bueno |
| Entre pantallas | Pantalla completa, salta solo | Da dinero, pero molesta; con límite de frecuencia o mejor no ponerlo |
| Banner fijo | Siempre visible | Poco dinero y estorba en vertical; no recomendado |

La compra **«quitar anuncios»** quita los que saltan solos y suele dar las recompensas sin ver el anuncio (o dejar los de recompensa como opcionales).

## 6. Compras dentro del juego (opcionales)

- Quitar anuncios (pago único).
- Paquetes de inicio (moneda + mejora) a buen precio, una sola vez.
- Multiplicadores permanentes (×2 a todo).
- Moneda premium por paquetes.

En un primer juego, lo sensato es empezar solo con «quitar anuncios» y añadir lo demás si hay jugadores.

## 7. Pantallas

1. **Principal** (vertical): arriba la escena que muestra el progreso; abajo la lista de generadores con el botón de comprar (×1, ×10, máximo).
2. **Mejoras**.
3. **Prestigio**: cuánto se ganaría al reiniciar ahora.
4. **Logros y premio diario**.
5. **Ajustes**: sonido, notación de números, idioma, guardado, compra y restaurar compra.

## 8. Lo técnico

- Estilo visual decidido con Mikel; sin pixel art y con coste cero (recursos gratuitos con licencia comercial, anotados en `docs/CREDITOS.md`).

- Simulación pura en `src/sim/`, con el tiempo como parámetro: así se prueban las ganancias de horas en un test.
- Guardado automático cada pocos segundos y al cerrar; partida en JSON con versión.
- Anuncios y compras detrás de una capa propia, con versiones «de mentira» para la web y para los tests.

## Decidido

Lo que Mikel aprueba en `FEEDBACK.md` se resume aquí.

- **Estilo visual** (2026-10-19, cambiado el mismo día): 2D isométrico con bloques de aspecto low-poly, muy bonito y atractivo, dibujado con SVG por código, como el idle de serrería que enseñó Mikel: puestos marcados con líneas amarillas, máquinas que cambian con el nivel, trabajadores, palés, carretillas, camiones de chatarra detrás y de expedición delante. Mapa a pantalla completa con botones flotantes. Nada de pixel art; coste cero.
- **Lo que nos diferencia** (2026-10-19): **ayudantes con nombre y rasgos que suben de nivel**. Cómo se consiguen, qué rasgos hay y cómo suben se decide en una parte posterior del diseño.
- **Ambientación** (2026-10-19): postapocalíptico con tono ligero y de humor.
- **Moneda y recurso** (2026-10-19): una sola moneda, el **dólar**, con la que se compran todas las mejoras. La **chatarra** es el único recurso de entrada. Todo lo fabricado se convierte en dólares al expedirlo.
- **Zonas** (2026-10-19): se desbloquean con dólares y cada una transforma la chatarra en un producto de más valor (p. ej. aplastado de chatarra → bloques de chatarra, 1 $; fundido de chatarra → lingotes de chatarra, 4 $…).
- **Ayudantes** (2026-10-19): uno nuevo por cada zona desbloqueada. Según su nivel dan mejoras, por ejemplo que lo producido valga más dinero.
- **Prestigio** (2026-10-19): no en la primera versión; en una actualización posterior. **Cambiado el 2026-10-23:** Mikel lo aprueba (S4); cómo funciona (Parte 28: PA1 PB1 PC3 PD2): desde la zona 8; Tornillos de oro = √(dinero ganado en la partida / 1 000 000 000); se conservan Pase, racha, logros, ranking y destinos del tren y el barco; +5 % a todo lo producido por Tornillo, para siempre.
- **Chatarra** (2026-10-19): al principio se recoge tocando la pila; luego se compran camiones que la traen solos.
- **Zonas en paralelo** (2026-10-19): cada zona transforma la chatarra directamente en su producto; las nuevas dan un producto que vale más.
- **Expedición** (2026-10-19): se compran carretillas que llevan lo fabricado a un muelle de carga; los camiones llegan solos a cargar cuando el muelle tiene suficiente stock, y al expedirlo se convierte en dólares.
- **Mejoras de cada zona** (2026-10-19, con dólares): velocidad, capacidad, número de máquinas y nivel de las máquinas.
- **Nivel de los ayudantes** (2026-10-19): la experiencia por trabajar desbloquea el siguiente nivel y se paga en dólares para subirlo.
- **Qué mejoran los ayudantes** (2026-10-19): el valor de lo producido y la velocidad de su zona.
- **Zonas de la primera versión** (2026-10-19; ampliadas a 8 el mismo día): industriales. Aplastado → bloques de chatarra (1 $), fundido → lingotes (4 $), chapa (15 $) y tubos (60 $). Los precios son un punto de partida y se ajustan con pruebas. Ampliadas con vigas (250 $), piezas de motor (1 K $), motores (4 K $) y coches reconstruidos (15 K $).
- **Ayudantes fijos** (2026-10-19): un personaje con nombre y personalidad por zona.
- **Camiones** (2026-10-19): todos iguales; se mejora la carga que esperan en el muelle antes de salir.
- **Ritmo R2** (2026-10-19): la zona 2 se abre hacia los 10 min y la zona 4 hacia las 6 h jugando atento. Lo comprueba un test con un jugador simulado (`src/sim/bot.ts`).
- **Precios** (2026-10-19): cada mejora sube ×1,10 al comprarla.
- **Ganancias con el juego cerrado** (2026-10-19): tope de 1 h sin pase (antes 2 h; Mikel, 2026-10-19), ampliable viendo un anuncio (cómo, en la Parte 10 de FEEDBACK.md); el Pase lo sube a 8 h.
- **Ayudantes** (2026-10-19): Tuerca (aplastado), Chispa (fundido), Yunque (chapa) y Codo (tubos).
- **Ayudantes de las zonas nuevas** (2026-10-19): Grúa (vigas), Pistón (piezas de motor), Bujía (motores) y Turbo (coches reconstruidos). Cada uno tiene una frase de personalidad en `src/data/zones.json`.
- **Duración** (2026-10-19): con 8 zonas y los ayudantes, abrirlo todo lleva unos 4-5 días (unas 104 h volviendo cada hora; 108 h cada 2 h).
- **Pase de chatarrero** (2026-10-19): compra única que quita los anuncios y sube el tope de lo ganado fuera a 8 h.
- **Premio diario** (2026-10-19): racha de 7 días con premio creciente.
- **Empujón con anuncio** (2026-10-19): ×2 a la producción durante 30 min, con espera entre uno y otro.
- **Suceso: camión dorado** (2026-10-19): aparece de vez en cuando; si se toca y se ve un anuncio, paga ×10 lo que hay en el muelle.
- **Experiencia de los ayudantes** (2026-10-19): cada hora de trabajo de su zona desbloquea un nivel nuevo, que se paga en dólares.
- **Mejora por nivel** (2026-10-19): +10 % al valor de lo producido y +5 % a la velocidad de su zona; nivel máximo 25.
- **Racha de 7 días** (2026-10-19): el día 1 da 10 min de producción y sube hasta 2 h el día 7 (10, 20, 30, 45, 60, 90 y 120 min). Si se falta un día, vuelve al día 1.
- **Camión dorado** (2026-10-19): aparece cada ~15 min y espera 20 s a que lo toques.
- **Precio del Pase de chatarrero** (2026-10-19): 2,99 €, pago único.
- **Partida en varios dispositivos** (2026-10-19): por ahora solo el código de partida que se copia y se pega (S1). El guardado pasa por `SaveStore` (`src/ui/storage.ts`) para poder cambiarlo por una nube más adelante sin tocar el resto.
- **Fondo y decorado** (2026-10-19): ciudad con autopista elevada, farolas, árboles y cartel (D1); puerto con vía, tren, grúa y barco (D3); suelo con texturas y ciclo día/noche con la hora real (D4); interior de la nave relleno y zonas cerradas con andamios (D5). Sin patio de coches apilados (D2 no).
- **Anuncios al volver** (2026-10-19): botón «×2» que duplica lo ganado fuera (A3) y botón «Recuperar» que da lo perdido por pasar del tope libre de 1 h, hasta las 8 h del Pase (A4). Con el Pase no hace falta anuncio.

### Partes 11-16 (2026-10-19)

- Ranking mundial con Firebase (plan gratuito): apodo de 3-16 caracteres, total de dinero generado, top 50; el total solo sube.
- Parpadeo: medir con `?fps=1` y afinar el SVG; pasar a canvas solo si hace falta.
- Logística visible: las carretillas sueltan en la huella de su producto y el camión se llena de las huellas.
- Hito cada 5 niveles de máquina: premio único de 10 minutos de producción de la línea; la máquina cambia de grado (máximo 6).
- Objetivo a la vista y logros permanentes (sin misiones diarias).
- Calidad profesional como línea de trabajo (Fase 2b del roadmap).

- **Nombre global** (2026-10-20, Mikel): «Scrap Empire: Idle Factory» (opción G2).
- **Equilibrio (2026-10-21):** zonas 8-10 un 30 % más baratas de abrir; nivel de máquina ×1,8. Objetivos diarios y F3/F4/F5 (rutas, almacén, capitán del tren y el barco) aprobados; los números se deciden en las Partes 25 y 26 de `FEEDBACK.md`.
- **Almacén y menú (2026-10-21):** el almacén del tren y el barco cuesta la mitad que el transporte (×1,8 por nivel); el menú de inicio sale siempre al abrir el juego.
- **Qué hacemos ahora (Parte 27, 2026-10-23, Mikel elige S1, S2, S3 y S4):** S1 mapa en canvas con PixiJS por partes, mismo aspecto; S2 botón 🐞 que abre incidencias `feedback` + `scrap-empire` en Zenit; S3 preparar Google Play (privacidad, consentimiento UE con Google UMP, AdMob de prueba); S4 prestigio (ver arriba).
