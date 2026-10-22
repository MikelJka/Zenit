# Zenit Studio

Repositorio de **Zenit Studio** (Mikel): **hogar de Óxido y de Scrap Empire** (se mudaron aquí el 2026-10-22, con sus sesiones automáticas y su publicación) y **de los juegos nuevos**, empezando por Space Harvest.

Web de Zenit (GitHub Pages): https://mikeljka.github.io/Zenit/ (el repositorio es `MikelJka/Zenit`, con mayúscula) — cada juego publicado va en su subcarpeta (lista en `web/juegos.txt`, portada en `web/index.html`, construcción en `.github/scripts/construir-web.sh`). **Un solo flujo de publicación para todos los juegos: «Zenit: publicar web»** (`.github/workflows/zenit-publicar.yml`; sustituye a «Óxido: probar y publicar» desde el 2026-10-22): prueba cada juego de `web/juegos.txt` y publica el sitio entero. Los demás workflows de cada juego (probar rama, Android…) van en `.github/workflows/` con el prefijo del juego y filtro de rutas por su carpeta.

Foto tomada el 2026-10-21.

## Proyectos

| Carpeta | Proyecto | Repositorio de origen | Estado |
|---|---|---|---|
| `scrap-empire/` | Scrap Empire: Idle Factory (antes Chatarrero), idle de desguace para Android | **Vive aquí, en Zenit** desde el 2026-10-22 (código, documentación, sesión automática y publicación; web: https://mikeljka.github.io/Zenit/scrap-empire/). Viene de `MikelJka/IdleScrapyard`, que queda sin tocar. Ver `scrap-empire/MIGRACION.md` | En desarrollo; publicado en GitHub Pages de Zenit |
| `oxido/` | Óxido, gestión de colonia postapocalíptica (estilo RimWorld) | **Vive aquí, en Zenit** desde el 2026-10-22 (código y documentación completos; web: https://mikeljka.github.io/Zenit/oxido/). Viene de `MikelJka/OxidoGame`, que queda sin tocar. Ver `oxido/MIGRACION.md` | En desarrollo; publicado en GitHub Pages de Zenit |
| `space-harvest/` | Space Harvest, idle de estación espacial: agricultura, minería de planetas y energía solar | **Vive aquí, en Zenit** (monorepo de juegos; queda una copia con el prototipo web en `space-harvest/` de IdleScrapyard) | Documento de diseño completo en borrador (`space-harvest/docs/DISENO.md`); pruebas de gráficos hechas |

Cada carpeta lleva su `CLAUDE.md` (instrucciones de trabajo) y su `docs/` (diseño, feedback, progreso, roadmap). `scrap-empire/` y `oxido/` además llevan todo el código.

## Sesiones programadas

Ver `sesiones-programadas/README.md`: qué hay, cada cuánto y sus textos.

## Reglas comunes de Zenit

- Idioma: código en inglés; comentarios, textos del juego, commits y documentación en español.
- Coste cero: solo herramientas gratuitas y recursos CC0 o con licencia comercial, anotados con autor, enlace y licencia.
- Mikel aprueba todo lo nuevo; las sesiones automáticas solo implementan lo aprobado y los arreglos de bugs.
- La simulación va separada del dibujado y es determinista (con semilla), para poder llevarla a otro motor.

## Pendiente de Mikel (resumen, 2026-10-21)

- **Scrap Empire:** revisar la mudanza (`scrap-empire/MIGRACION.md`): activar Pages con GitHub Actions en Zenit (con Zenit público, como se decidió para Óxido), crear la etiqueta `scrap-empire`, pasar a mano las incidencias `feedback` abiertas de IdleScrapyard (la sesión no tuvo acceso), cambiar las ramas de capturas en STONKS, apagar la rutina antigua y decidir si archiva IdleScrapyard; comprobar el juego en el móvil; crear la cuenta de desarrollador de Play y confirmar el identificador `studio.zenit.scrapempire`; crear el proyecto de Firebase del ranking al publicar.
- **Óxido:** revisar la mudanza (`oxido/MIGRACION.md`): poner Zenit público y activar Pages con GitHub Actions (con el plan gratuito, Pages solo funciona en repositorios públicos; decisión del 2026-10-22: público mientras dure el desarrollo y privado otra vez al terminar el juego), crear las etiquetas `feedback` y `oxido`, y apagar la sesión antigua de OxidoGame.
- **Space Harvest:** subir los paquetes CC0 en `.glb`, decidir el repositorio propio, tripulación con o sin personalidad y los fps del prototipo en el móvil.
