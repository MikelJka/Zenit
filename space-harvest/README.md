# Space Harvest

Juego idle de estación espacial de Zenit Studio: **agricultura, minería de planetas y recogida de energía solar**, hecho por módulos (investigación primero). Proyecto **separado** de Scrap Empire: Idle Factory (el resto de este repositorio). Esta carpeta es el paquete completo para llevárselo a su propio repositorio cuando Mikel lo cree; no depende de nada fuera de ella.

## Contenido

- `docs/DISENO.md` — diseño: idea, pilares, bucle, módulos y orden, arquitectura, plan de gráficos y preguntas.
- `docs/FEEDBACK.md` — decisiones de Mikel y preguntas abiertas.
- `docs/PROGRESO.md` — diario de trabajo.
- `prototipos/espacio-pixi/` — prueba de gráficos con PixiJS (4 escenas y capturas). Publicada en `/prototipos/espacio/` de la web de Scrap Empire mientras no haya repositorio propio.
- `prototipos/blender/` — scripts de Blender (`bpy`) y renders 3D de prueba: `modulo_granja.py`, `estacion_completa.py`. Los modelos CC0 (`.glb`) irían en `prototipos/blender/cc0/` y se anotan en un `CREDITOS.md` propio con autor, enlace y licencia.

## Reglas (heredadas de Scrap Empire)

Idioma: código en inglés; comentarios, textos del juego, commits y documentación en español. Simulación pura y determinista separada del dibujado. Coste cero: solo herramientas gratuitas y recursos CC0 o de licencia comercial. Mikel aprueba todo lo nuevo.

## Cómo moverlo a un repositorio nuevo

Copiar el contenido de `space-harvest/` a la raíz del repositorio nuevo, ajustar la ruta del paso «Prototipo de gráficos» de `.github/workflows/deploy.yml` de Scrap Empire (o quitarlo) y borrar esta carpeta de Scrap Empire.
