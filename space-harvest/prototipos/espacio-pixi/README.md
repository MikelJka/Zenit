# Space Harvest: prueba de gráficos (PixiJS)

Prototipo de la Opción B de `space-harvest/docs/DISENO.md`: WebGL con PixiJS (MIT), todo dibujado por código. Estación con módulos y luces, brillo (bloom barato), estrellas con paralaje, nebulosas, planeta con atmósfera y nave con estela de partículas. Se arrastra con el dedo o el ratón. Escenas con `?escena=estacion|granja|solar|mineria`; capturas en `capturas/` (se regeneran con `node capturas.mjs capturas`).

- Versión publicada (tras subir a `main`): https://mikeljka.github.io/IdleScrapyard/prototipos/espacio/ — arriba a la izquierda sale el contador de fotogramas: **esa cifra, en el móvil, es la medida que importa**.
- Parámetros: `?bloom=0`, `?particles=0`, `?stars=0` para ver cuánto cuesta cada efecto.
- Local: `npm install && npm run dev`. Medir en el servidor: `npm run build && CHROMIUM_PATH=… node medir.mjs 4` (ojo: allí no hay tarjeta gráfica y WebGL va por software, ~12-16 fps con cualquier configuración; no vale como medida de un móvil).
