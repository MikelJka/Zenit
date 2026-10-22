#!/usr/bin/env bash
# Construye el sitio de GitHub Pages de Zenit en _site/:
#   _site/index.html  ← web/index.html (portada con los juegos)
#   _site/<carpeta>/  ← build de cada juego listado en web/juegos.txt
# Cada juego debe compilar con «npm run build» a <carpeta>/dist y tener en Vite
# base: '/Zenit/<carpeta>/' (el repositorio es MikelJka/Zenit, con mayúscula).
# Lo usa el flujo común «Zenit: publicar web» (.github/workflows/zenit-publicar.yml).
set -euo pipefail
cd "$(dirname "$0")/../.."
rm -rf _site
mkdir -p _site
cp -r web/. _site/
rm -f _site/juegos.txt
export VITE_BUILD_TIME="${VITE_BUILD_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
while read -r juego _; do
  case "$juego" in ''|'#'*) continue ;; esac
  echo "::group::Construir $juego"
  ( cd "$juego" && { [ -d node_modules ] || npm install; } && npm run build )
  cp -r "$juego/dist" "_site/$juego"
  echo "::endgroup::"
done < web/juegos.txt
touch _site/.nojekyll
ls _site
