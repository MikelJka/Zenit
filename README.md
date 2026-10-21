# Zenit Studio

Repositorio de organización de **Zenit Studio** (Mikel): copia de la documentación de todos los proyectos y de las sesiones programadas, en un solo sitio. **Es una copia de referencia**: cada juego sigue viviendo y publicándose en su propio repositorio, y las sesiones automáticas siguen trabajando allí. Este repositorio no tiene sesiones programadas ni flujos de publicación, así que no interfiere con nada.

Foto tomada el 2026-10-21.

## Proyectos

| Carpeta | Proyecto | Repositorio de origen | Estado |
|---|---|---|---|
| `idlescrapyard/` | Scrap Empire: Idle Factory (antes Chatarrero), idle de desguace para Android | `MikelJka/IdleScrapyard` (web: https://mikeljka.github.io/IdleScrapyard/) | En desarrollo; publicado en GitHub Pages |
| `oxido/` | Óxido, gestión de colonia postapocalíptica (estilo RimWorld) | `MikelJka/OxidoGame` (web: https://mikeljka.github.io/OxidoGame/) | En desarrollo; fase 5 cerrada, empieza la fase 6 (facciones) |
| `space-harvest/` | Space Harvest, idle de estación espacial: agricultura, minería de planetas y energía solar | Aún sin repositorio propio (vive en `space-harvest/` de IdleScrapyard) | Diseño y pruebas de gráficos (PixiJS y Blender) |

Cada carpeta lleva su `CLAUDE.md` (instrucciones de trabajo) y su `docs/` (diseño, feedback, progreso, roadmap).

## Sesiones programadas

Ver `sesiones-programadas/README.md`: qué hay, cada cuánto y el texto de la sesión de IdleScrapyard.

## Reglas comunes de Zenit

- Idioma: código en inglés; comentarios, textos del juego, commits y documentación en español.
- Coste cero: solo herramientas gratuitas y recursos CC0 o con licencia comercial, anotados con autor, enlace y licencia.
- Mikel aprueba todo lo nuevo; las sesiones automáticas solo implementan lo aprobado y los arreglos de bugs.
- La simulación va separada del dibujado y es determinista (con semilla), para poder llevarla a otro motor.

## Pendiente de Mikel (resumen, 2026-10-21)

- **IdleScrapyard:** comprobar el juego en el móvil; crear la cuenta de desarrollador de Play y confirmar el identificador `studio.zenit.scrapempire`; crear el proyecto de Firebase del ranking al publicar.
- **Óxido:** nada abierto (decisiones del muelle, balsas y fase 5 ya anotadas).
- **Space Harvest:** subir los paquetes CC0 en `.glb`, decidir el repositorio propio, tripulación con o sin personalidad y los fps del prototipo en el móvil.
